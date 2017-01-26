let request = require("request");
let express = require("express");
let bodyParser = require("body-parser");
let querystring = require("querystring");
let shuffle = require("./shuffleArray.js");
let maleOrFemale = require("./maleOrFemale.js");
let fullDeck = require("./fullDeck.json");
let app = express();
let games = [];
let totalGamesLaunched = 0;


app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function reset() {
  games = [];
}

function cardDescription(gameNumber) {
  let le = "il";
  let un = "un";
  let bonus = gameNumber.bonus;
  let power = maleOrFemale(gameNumber.power, le) + gameNumber.power;
  let weak = maleOrFemale(gameNumber.weak, le) + gameNumber.weak;
  let card_description = "Cette arme est" + maleOrFemale(gameNumber.suit, un) + gameNumber.suit + " qui ";
  let power_weakness = "Cette arme est forte contre" + power + " mais perd contre" + weak + ".";
  let result_bonus;
  if(bonus < 0) {
    result_bonus = "donne un malus de " + bonus + " au prochain tour.";
  } else if(bonus === 0) {
    result_bonus = "ne donne ni bonus ni malus au prochain tour.";
  } else {
    result_bonus = "donne un bonus de " + bonus + " au prochain tour.";
  }
  let finalResult = {
    description: card_description + result_bonus,
    power_weakness: power_weakness,
    action1: "Fermer la fenêtre",
    action2: "Jouer la carte"
  }
  return finalResult;
}

function effect(victoire, gameNumber) {
    let effects;
    if (victoire) {
        effects = effectCalc(gameNumber.cardsPlayed.player.bonus, gameNumber.cardsPlayed.bot.bonus);
        gameNumber.futureEffect.player = effects.winner;
        gameNumber.futureEffect.bot = effects.looser;
    } else {
        effects = effectCalc(gameNumber.cardsPlayed.bot.bonus, gameNumber.cardsPlayed.player.bonus);
        gameNumber.futureEffect.bot = effects.winner;
        gameNumber.futureEffect.player = effects.looser;
    }
}

function effectCalc(bonusWinner, bonusLooser) {
    let effects = {};
    if (bonusWinner < 0 && bonusLooser >= 0) {
        effects.winner = bonusWinner;
        effects.looser = bonusLooser;
    } else if (bonusWinner < 0 && bonusLooser < 0) {
        effects.winner = bonusWinner;
        effects.looser = 0;
    } else if (bonusWinner >= 0 && bonusLooser >= 0) {
        effects.winner = 0;
        effects.looser = bonusLooser;
    } else {
        effects.winner = 0;
        effects.looser = 0;
    }
    return effects;
}

function outcome(gameNumber) {
    let powerPlayer = gameNumber.cardsPlayed.player.power;
    let pointsPlayer = gameNumber.cardsPlayed.player.points;
    let weakPlayer = gameNumber.cardsPlayed.player.weak;
    let weakBot = gameNumber.cardsPlayed.bot.weak;
    let pointsBot = gameNumber.cardsPlayed.bot.points;
    let powerBot = gameNumber.cardsPlayed.bot.power;
    let suitPlayer = gameNumber.cardsPlayed.player.suit;
    let suitBot = gameNumber.cardsPlayed.bot.suit;
    let totalPuissancePlayer = gameNumber.cardsPlayed.player.value + gameNumber.scoreEffect.player.effect;
    let totalPuissanceBot = gameNumber.cardsPlayed.bot.value + gameNumber.scoreEffect.bot.effect;
    let le = "il";
    let un = "un";
    let playerCard = maleOrFemale(suitPlayer, un) + suitPlayer;
    let botCard = maleOrFemale(suitBot, un) + suitBot;
    let result = "<p> Vous avez joué" + playerCard + ".<br>Votre adversaire a joué" + botCard + ".</p>";
    let winOrLoose;
    if (suitPlayer === suitBot) {
        if (totalPuissancePlayer > totalPuissanceBot) {
            gameNumber.scoreEffect.player.score += (pointsPlayer + pointsBot);
            effect(true, gameNumber);
            winOrLoose = "<p>Vous avez gagné, votre " + suitPlayer + " de puissance totale (" + totalPuissancePlayer + ") a plus de puissance que votre adversaire (" + totalPuissanceBot + ").</p>";
        } else if (totalPuissancePlayer < totalPuissanceBot) {
            gameNumber.scoreEffect.bot.score += (pointsPlayer + pointsBot);
            effect(false, gameNumber);
            winOrLoose = "<p>Vous avez perdu, votre " + suitPlayer + " de puissance totale (" + totalPuissancePlayer + ") a moins de puissance que votre adversaire (" + totalPuissanceBot + ").</p>";
        } else if (totalPuissancePlayer === totalPuissanceBot) {
            gameNumber.futureEffect.player = 0;
            gameNumber.futureEffect.bot = 0;
            winOrLoose = "<p>Vous avez fait égalité, votre " + suitPlayer + " de puissance totale (" + totalPuissancePlayer + ") a la même puissance que votre adversaire (" + totalPuissanceBot + ").</p>";
        }
    } else if (powerPlayer === suitBot || suitPlayer === weakBot) {
        gameNumber.scoreEffect.player.score += (pointsPlayer + pointsBot);
        effect(true, gameNumber);
        winOrLoose = "<p>Vous avez gagné, votre " + suitPlayer + " est très efficace contre" + maleOrFemale(suitBot, le) + suitBot + " de votre adversaire.</p>";
    } else if (weakPlayer === suitBot || powerBot === suitPlayer) {
        gameNumber.scoreEffect.bot.score += (pointsPlayer + pointsBot);
        effect(false, gameNumber);
        winOrLoose = "<p>Vous avez perdu, votre " + suitPlayer + " est faible contre" + maleOrFemale(suitBot, le) + suitBot + " de votre adversaire.</p>";
    }
    let finalResult = result + winOrLoose;
    return finalResult;
}

app.get("/newGame", function(request, response) {
  totalGamesLaunched += 1;
  let currentGame = +totalGamesLaunched - 1;
  games[currentGame] = {
    playerHand: {
        quantity: 0,
        cards: []
    },
    botHand: {
        quantity: 0,
        cards: []
    },
    cardsPlayed: {
        player: [],
        bot: []
    },
    futureEffect: {
        player: 0,
        bot: 0
    },
    scoreEffect: {
        player: {
          score: 0,
          effect: 0
        },
        bot: {
          score: 0,
          effect: 0
        },
        remaining: 0
    },
    graveyard: {
        cards: []
    },
    game_id: (totalGamesLaunched),
    deck: [],
    remaining: 0
  };

  shuffle(fullDeck);
  for (let i = 0; i < fullDeck.length; i ++) {
    games[currentGame].deck.push(fullDeck[i]);
  }
  games[currentGame].remaining = games[currentGame].deck.length;
  console.log("Nouvelle partie numéro " + totalGamesLaunched + " initiée.");
  response.send(games[currentGame]);
});

app.get("/:serial/playerdraw", function(request, response) {
  let currentGame = games[+request.params.serial - 1];
  let querystring_quantity = request.query.quantity;
  if(request.params.serial === 0 || request.params.serial > games.length) {
    console.log("Partie numéro " + currentGame.game_id + " non trouvée, pioche impossible !");
    response.end();
  } else {
    currentGame.scoreEffect.player.effect = currentGame.futureEffect.player;
    currentGame.futureEffect.player;
    let cardToSend = {
      cards: [],
      remaining: 0,
      effect: currentGame.scoreEffect.player.effect
    };
    if(currentGame.cardsPlayed.player.length !== 0) {
      currentGame.graveyard.cards.push(currentGame.cardsPlayed.player);
      currentGame.cardsPlayed.player = [];
    }
    shuffle(currentGame.deck);
    if((+currentGame.playerHand.cards.length + +querystring_quantity) <= 3) {
      if(currentGame.deck.length !== 0) {
        for (let i = 0; i < querystring_quantity; i ++) {
          let currentCard = currentGame.deck.shift();
          cardToSend.cards.push(currentCard);
          currentGame.playerHand.cards.push(currentCard);
        };
        currentGame.remaining = currentGame.deck.length;
        console.log("" + querystring_quantity + " cartes piochées pour la partie numéro " + currentGame.game_id + ", " + currentGame.remaining + " cartes restantes.");
      } else {
        console.log("Plus de cartes à piocher ! pour la partie numéro " + currentGame.game_id + ".");
      }
      cardToSend.remaining = currentGame.remaining;
      currentGame.playerHand.quantity = currentGame.playerHand.cards.length;
      response.send(cardToSend);
    } else {
      console.log("Impossible de piocher pour la partie numéro " + currentGame.game_id + ".");
      response.end();
    }
  }
});

app.get("/:serial/botdraw", function(request, response) {
  let currentGame = games[+request.params.serial - 1];
  let querystring_quantity = request.query.quantity;
  if(request.params.serial === 0 || request.params.serial > games.length) {
    console.log("Partie numéro " + currentGame.game_id + " non trouvée, pioche impossible !");
    response.end();
  } else {
    currentGame.scoreEffect.bot.effect = currentGame.futureEffect.bot;
    currentGame.futureEffect.bot;
    let cardToSend = {
      cards: [],
      remaining: 0,
      effect: currentGame.scoreEffect.bot.effect
    };
    if(currentGame.cardsPlayed.bot.length !== 0) {
      currentGame.graveyard.cards.push(currentGame.cardsPlayed.bot);
      currentGame.cardsPlayed.bot = [];
    }
    shuffle(currentGame.deck);
    if((+currentGame.botHand.cards.length + +querystring_quantity) <= 3) {
      if(currentGame.deck.length !== 0) {
        for (let i = 0; i < querystring_quantity; i ++) {
          let currentCard = currentGame.deck.shift();
          cardToSend.cards.push(currentCard);
          currentGame.botHand.cards.push(currentCard);
        };
        currentGame.remaining = currentGame.deck.length;
        console.log("" + querystring_quantity + " cartes piochées pour la partie numéro "+ currentGame.game_id +", " + currentGame.remaining + " cartes restantes.");
      } else {
        console.log("Plus de cartes à piocher ! pour la partie numéro " + currentGame.game_id + ".");
      }
      cardToSend.remaining = currentGame.remaining;
      currentGame.botHand.quantity = currentGame.botHand.cards.length;
      response.send(cardToSend);
    } else {
      console.log("Impossible de piocher pour la partie numéro " + currentGame.game_id + ".");
      response.end();
    }
  }
});

app.get("/:serial/cardinformation", function(request, response) {
  let currentGame = games[+request.params.serial - 1];
  let querystring_card = request.query.card;
  if(request.params.serial === 0 || request.params.serial > games.length) {
    console.log("Partie numéro " + currentGame.game_id + " non trouvée, pioche impossible !");
    response.end();
  } else {
    if(currentGame.playerHand.remaining === 0) {
      console.log("Impossible d'afficher les informations, la main est vide pour la partie numéro " + currentGame.game_id + ".");
      response.end();
    } else {
      let x = 0;
      for (let i = 0; i < currentGame.playerHand.cards.length; i++) {
        let codeImg = /..(?=.jpg)/gi;
        if(currentGame.playerHand.cards[i].image.match(codeImg)[0] === querystring_card) {
          console.log("Informations de la carte envoyées pour la partie numéro " + currentGame.game_id + ".");
          x += 1;
          response.send(cardDescription(currentGame.playerHand.cards[i]));
        }
      }
      if(x == 0) {
        console.log("Aucune carte correspondante trouvée pour la partie numéro " + currentGame.game_id + " !");
        response.end();
      } 
    }
  }
});

app.get("/:serial/play", function(request, response) {
  'use strict';
  let currentGame = games[+request.params.serial - 1];
  let querystring_card = request.query.card;
  if(currentGame.botHand.quantity === 0) {
    console.log("Impossible de jouer, le bot n'a plus de cartes pour la partie numéro " + currentGame.game_id + ".");
    response.end();
  } else {
    let cardFind = 0;
    for (let i = 0; i < currentGame.playerHand.cards.length; i++) {
      let codeImg = /..(?=.jpg)/gi;
      if(currentGame.playerHand.cards[i].image.match(codeImg)[0] === querystring_card && cardFind === 0) {
        cardFind += 1;
        currentGame.cardsPlayed.player = currentGame.playerHand.cards[i];
        currentGame.playerHand.cards.splice(i, 1);
        let numberRandom = Math.round(Math.random() * (currentGame.botHand.cards.length - 1));
        currentGame.cardsPlayed.bot = currentGame.botHand.cards[numberRandom];
        currentGame.botHand.cards.splice(numberRandom, 1);
        console.log("Le bot a jouer pour la partie numéro " + currentGame.game_id + ".");
        response.send(currentGame.cardsPlayed);
      }
    }
  }
});


app.get("/:serial/outcome", function(request, response) {
  let currentGame = games[+request.params.serial - 1];
  let battleResult = {
    result: outcome(currentGame),
    score: {
      player: currentGame.scoreEffect.player.score,
      bot: currentGame.scoreEffect.bot.score
    },
    pursue: 1
  };
  console.log("Résultats de la bataille envoyés pour la partie numéro " + currentGame.game_id + ".");
  if(currentGame.deck.length === 0 && currentGame.playerHand.cards.length === 0 && currentGame.botHand.cards.length === 0) {
    battleResult.nextTurn = "Connaître le gagnant";
    battleResult.pursue = 0;
    console.log("Fin de la partie numéro " + currentGame.game_id + ".");
  } else {
    battleResult.nextTurn = "Tour suivant";
    battleResult.pursue = 1;
  }
  response.send(battleResult);
});

app.get("/:serial/winner", function(request, response) {
  let currentGame = games[+request.params.serial - 1];
  let winOrLoose = "Vous avez ";
  let wannaReplay = "Voulez-vous rejouer ?";
  if(currentGame.scoreEffect.player.score > currentGame.scoreEffect.bot.score) {
    winOrLoose += "gagné !!!";
  } else if (currentGame.scoreEffect.player.score === currentGame.scoreEffect.bot.score) {
    winOrLoose += "fait égalité !!";
  } else {
    winOrLoose += "perdu !";
  }
  let finalMessage = {
    winOrLoose, 
    wannaReplay
  };
  response.send(finalMessage);
});

app.get("/:serial/graveyard", function(request, response) {
  let currentGame = games[+request.params.serial - 1];
  console.log("Cimetière consulté pour la partie numéro " + currentGame.game_id + ".");
  response.send(currentGame.graveyard);
});

let port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Serveur lancé !");
});
