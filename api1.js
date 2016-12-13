var request = require("request");
var express = require("express");
var bodyParser = require("body-parser");
var querystring = require("querystring");
var shuffle = require("./shuffleArray.js");
var maleOrFemale = require("./maleOrFemale.js");
var fullDeck = require("./fullDeck.json");
var app = express();
var games = [];
var totalGamesLaunched = 0;


app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function reset() {
  games = [];
}

function cardDescription(gameNumber) {
  var le = "il";
  var un = "un";
  var bonus = gameNumber.bonus;
  var power = maleOrFemale(gameNumber.power, le) + gameNumber.power;
  var weak = maleOrFemale(gameNumber.weak, le) + gameNumber.weak;
  var card_description = "<article><p>Cette arme est" + maleOrFemale(gameNumber.suit, un) + gameNumber.suit + " qui ";
  var power_weakness = "Cette arme est forte contre" + power + " mais perd contre" + weak + ".</p><p>Fermer la fenêtre</p><p>Jouer la carte</p></article>";
  var result_bonus;
  if(bonus < 0) {
    result_bonus = "donne un malus de " + bonus + " au prochain tour.<br>";
  } else if(bonus === 0) {
    result_bonus = "ne donne ni bonus ni malus au prochain tour.<br>";
  } else {
    result_bonus = "donne un bonus de " + bonus + " au prochain tour.<br>";
  }
  var finalResult = card_description + result_bonus + power_weakness;
  return finalResult;
}

function effect(victoire, gameNumber) {
    var effects;
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
    var effects = {};
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
    var powerPlayer = gameNumber.cardsPlayed.player.power;
    var pointsPlayer = gameNumber.cardsPlayed.player.points;
    var weakPlayer = gameNumber.cardsPlayed.player.weak;
    var weakBot = gameNumber.cardsPlayed.bot.weak;
    var pointsBot = gameNumber.cardsPlayed.bot.points;
    var powerBot = gameNumber.cardsPlayed.bot.power;
    var suitPlayer = gameNumber.cardsPlayed.player.suit;
    var suitBot = gameNumber.cardsPlayed.bot.suit;
    var totalPuissancePlayer = gameNumber.cardsPlayed.player.value + gameNumber.scoreEffect.player.effect;
    var totalPuissanceBot = gameNumber.cardsPlayed.bot.value + gameNumber.scoreEffect.bot.effect;
    var le = "il";
    var un = "un";
    var playerCard = maleOrFemale(suitPlayer, un) + suitPlayer;
    var botCard = maleOrFemale(suitBot, un) + suitBot;
    var result = "<p> Vous avez joué" + playerCard + ".<br>Votre adversaire a joué" + botCard + ".</p>";
    var winOrLoose;
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
    var finalResult = result + winOrLoose;
    return finalResult;
}

app.get("/newGame", function(request, response) {
  totalGamesLaunched += 1;
  var currentGame = +totalGamesLaunched - 1;
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
  for (var i = 0; i < fullDeck.length; i ++) {
    games[currentGame].deck.push(fullDeck[i]);
  }
  games[currentGame].remaining = games[currentGame].deck.length;
  console.log("Nouvelle partie numéro " + totalGamesLaunched + " initiée.");
  response.send(games[currentGame]);
});

app.get("/:serial/playerdraw", function(request, response) {
  var currentGame = games[+request.params.serial - 1];
  var querystring_quantity = request.query.quantity;
  if(request.params.serial === 0 || request.params.serial > games.length) {
    console.log("Partie numéro " + currentGame.game_id + " non trouvée, pioche impossible !");
    response.end();
  } else {
    currentGame.scoreEffect.player.effect = currentGame.futureEffect.player;
    currentGame.futureEffect.player;
    var cardToSend = {
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
        for (var i = 0; i < querystring_quantity; i ++) {
          var currentCard = currentGame.deck.shift();
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
  var currentGame = games[+request.params.serial - 1];
  var querystring_quantity = request.query.quantity;
  if(request.params.serial === 0 || request.params.serial > games.length) {
    console.log("Partie numéro " + currentGame.game_id + " non trouvée, pioche impossible !");
    response.end();
  } else {
    currentGame.scoreEffect.bot.effect = currentGame.futureEffect.bot;
    currentGame.futureEffect.bot;
    var cardToSend = {
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
        for (var i = 0; i < querystring_quantity; i ++) {
          var currentCard = currentGame.deck.shift();
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
  var currentGame = games[+request.params.serial - 1];
  var querystring_card = request.query.card;
  if(request.params.serial === 0 || request.params.serial > games.length) {
    console.log("Partie numéro " + currentGame.game_id + " non trouvée, pioche impossible !");
    response.end();
  } else {
    if(currentGame.playerHand.remaining === 0) {
      console.log("Impossible d'afficher les informations, la main est vide pour la partie numéro " + currentGame.game_id + ".");
      response.end();
    } else {
      console.log(currentGame.playerHand.cards);
      var x = 0;
      for (var i = 0; i < currentGame.playerHand.cards.length; i++) {
        var codeImg = /..(?=.jpg)/gi;
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
  var currentGame = games[+request.params.serial - 1];
  var querystring_card = request.query.card;
  if(currentGame.botHand.quantity === 0) {
    console.log("Impossible de jouer, le bot n'a plus de cartes pour la partie numéro " + currentGame.game_id + ".");
    response.end();
  } else {
    let cardFind = 0;
    for (var i = 0; i < currentGame.playerHand.cards.length; i++) {
      var codeImg = /..(?=.jpg)/gi;
      if(currentGame.playerHand.cards[i].image.match(codeImg)[0] === querystring_card && cardFind === 0) {
        cardFind += 1;
        currentGame.cardsPlayed.player = currentGame.playerHand.cards[i];
        currentGame.playerHand.cards.splice(i, 1);
        var numberRandom = Math.round(Math.random() * (currentGame.botHand.cards.length - 1));
        currentGame.cardsPlayed.bot = currentGame.botHand.cards[numberRandom];
        currentGame.botHand.cards.splice(numberRandom, 1);
        console.log("Le bot a jouer pour la partie numéro " + currentGame.game_id + ".");
        response.send(currentGame.cardsPlayed);
      }
    }
  }
});


app.get("/:serial/outcome", function(request, response) {
  var currentGame = games[+request.params.serial - 1];
  var battleResult = {
    result: outcome(currentGame),
    score: {
      player: currentGame.scoreEffect.player.score,
      bot: currentGame.scoreEffect.bot.score
    },
    pursue: 1
  };
  console.log("Résultats de la bataille envoyés pour la partie numéro " + currentGame.game_id + ".");
  if(currentGame.deck.length === 0 && currentGame.playerHand.cards.length === 0 && currentGame.botHand.cards.length === 0) {
    battleResult.nextTurn = "<p>Connaître le gagnant</p>";
    battleResult.pursue = 0;
    console.log("Fin de la partie numéro " + currentGame.game_id + ".");
  } else {
    battleResult.nextTurn = "<p>Tour suivant</p>";
    battleResult.pursue = 1;
  }
  response.send(battleResult);
});

app.get("/:serial/winner", function(request, response) {
  var currentGame = games[+request.params.serial - 1];
  var winOrLoose = "<h1>Vous avez ";
  var wannareplay = "<p>Voulez-vous rejouer ? </p><p>Oui !</p> <p>Non </p>";
  if(currentGame.scoreEffect.player.score > currentGame.scoreEffect.bot.score) {
    winOrLoose += "gagné !!! </h1>";
  } else if (currentGame.scoreEffect.player.score === currentGame.scoreEffect.bot.score) {
    winOrLoose += "fait égalité !! </h1>";
  } else {
    winOrLoose += "perdu ! </h1>";
  }
  var finalMessage = winOrLoose + wannareplay;
  response.send(finalMessage);
});

app.get("/:serial/graveyard", function(request, response) {
  var currentGame = games[+request.params.serial - 1];
  console.log("Cimetière consulté pour la partie numéro " + currentGame.game_id + ".");
  response.send(currentGame.graveyard);
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Serveur lancé !");
});
