var deckID;
var playerHand = "playerHand";
var botHand = "botHand";
var graveyard = "graveyard";
var graveyardContent = "";
var remainingCards;
var playerEffect = 0;
var botEffect = 0;
var playerFutureEffect = 0;
var botFutureEffect = 0;
var playerScore = 0;
var botScore = 0;
var cardPlayedPlayer;
var cardPlayedBot;
var newProperties = {
    KING: {
        value: 5,
        bonus: -3,
        points: 1
    },
    QUEEN: {
        value: 5,
        bonus: -3,
        points: 1
    },
    JACK: {
        value: 4,
        bonus: -2,
        points: 1
    },
    10: {
        value: 4,
        bonus: -2,
        points: 1
    },
    9: {
        value: 3,
        bonus: 0,
        points: 0
    },
    8: {
        value: 3,
        bonus: 0,
        points: 0
    },
    7: {
        value: 3,
        bonus: 0,
        points: 0
    },
    6: {
        value: 2,
        bonus: 0,
        points: 0
    },
    5: {
        value: 2,
        bonus: 0,
        points: 0
    },
    4: {
        value: 2,
        bonus: 0,
        points: 0
    },
    3: {
        value: 1,
        bonus: +2,
        points: 4
    },
    2: {
        value: 0,
        bonus: +3,
        points: 4
    },
    SPADES: {
        suit: "ARC",
        weak: "BOUCLIER",
        power: "HACHE"
    },
    CLUBS: {
        suit: "HACHE",
        weak: "ARC",
        power: "BOUCLIER"
    },
    HEARTS: {
        suit: "BOUCLIER",
        weak: "HACHE",
        power: "ARC"
    }
};

var CardDescriptionTemplate = $('#card-description').html();
Mustache.parse(CardDescriptionTemplate);

var BattleResultTemplate = $("#battle-result").html();
Mustache.parse(BattleResultTemplate);

var winOrLooseTemplate = $("#win-or-loose").html();
Mustache.parse(winOrLooseTemplate);

function maleOrFemale(propriete, article) {
    if (propriete === "HACHE" && article === "il") {
        return " la ";
    }
    if (propriete === "HACHE" && article === "un") {
        return " une ";
    }
    if (propriete === "HACHE" && article === "Il") {
        return "Elle ";
    }
    if (propriete === "HACHE" && article === "Un") {
        return "Une ";
    }
    if (propriete === "ARC" && article === "il") {
        return " l'";
    }
    if (propriete === "ARC" && article === "Il") {
        return "L'";
    }
    if ((propriete === "BOUCLIER" || propriete === "ARC") && article === "un") {
        return " un ";
    }
    if ((propriete === "BOUCLIER" || propriete === "ARC") && article === "Un") {
        return "Un ";
    }
    if (propriete === "BOUCLIER" && article === "il") {
        return " le ";
    }
    if (propriete === "BOUCLIER" && article === "Il") {
        return "Il ";
    }
};

function newCard(response, player) {
    var cardsReceived = response.cards;
    if (player === ".handplayer") {
        for (var i = 0; i < cardsReceived.length; i++) {
            var currentValue = cardsReceived[i].value;
            var currentSuit = cardsReceived[i].suit;
            var currentImage = cardsReceived[i].image;
            var currentCode = cardsReceived[i].code;
            var newCard = $.extend({
                image: currentImage
            }, newProperties[currentValue], newProperties[currentSuit]);
            var imageTag = $("<img>").attr("src", currentImage);
            if (i < (cardsReceived.length / 2)) {
                imageTag.data("code", currentCode).appendTo(".handplayer");
                cardDescription(newCard, ".handplayer");
                $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + playerHand + "/add/?cards=" + cardsReceived[i].code);
            } else {
                $("<img>").attr("src", "images/verso_carte.png").data("code", currentCode).appendTo(".handbot");
                $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + botHand + "/add/?cards=" + cardsReceived[i].code);
            }
            $(".pioche figure:first-child").find("figcaption").replaceWith("<figcaption>Cartes restantes " + response.remaining + ".</figcaption>");
            remainingCards = response.remaining;
        }
    } else {
        var selfValue = cardsReceived[0].value;
        var selfSuit = cardsReceived[0].suit;
        var selfImage = cardsReceived[0].image;
        var selfCard = $.extend({
            image: selfImage
        }, newProperties[selfValue], newProperties[selfSuit]);
        return selfCard;
    }
}

function cardDescription(card, player) {
    var le = "il";
    var un = "un";
    var params = {
        $un: maleOrFemale(card.suit, un),
        suit: card.suit,
        bonus: card.bonus,
        $lePower: maleOrFemale(card.power, le),
        power: card.power,
        $leWeak: maleOrFemale(card.weak, le),
        weak: card.weak,
        isWeak: card.value === 0 || card.value === 1,
        isAverage: card.value === 2 || card.value === 3,
        isStrong: card.value === 4 || card.value === 5
    };
    var descriptionCompiled = Mustache.render(CardDescriptionTemplate, params);
    $(descriptionCompiled).appendTo(player);
    $(player + " article:last-child").append($("<p>Fermer la fenêtre</p>"));
    $(player + " article:last-child").append($("<p>Jouer la carte</p>"));
}

function preview() {
    $(".handplayer").on("click", "img", function() {
        var $findImg = $(".handplayer").find("img");
        var $findArticle = $(".handplayer").find("article");
        var $this = $(".handplayer").find(this);
        if ($this.hasClass("preview")) {
            $findImg.removeClass("preview");
            $findArticle.removeClass("preview");
        } else {
            $findImg.removeClass("preview");
            $this.toggleClass("preview");
            $findArticle.removeClass("preview");
            $(this).next().toggleClass("preview");
        }
    });
    $(".handplayer").on("click", ".preview p:nth-child(2)", function() {
        $(".handplayer").find("img").removeClass("preview");
        $(".handplayer").find("article").removeClass("preview");
    });
}

function discard() {
    var $piocheFigureChild2 = $(".pioche figure:nth-child(2)");
    var $piocheFigureLastChild = ".pioche figure:last-child";
    $piocheFigureChild2.on("click", function() {
        $piocheFigureChild2.find("p").detach();
        if ($($piocheFigureLastChild).hasClass("discard")) {
            $(".discard").detach();
            $piocheFigureChild2.append("<p>Cliquez ici pour voir la défausse</p>");
            $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + graveyard + "/add/?cards=" + graveyardContent);
        } else {
            $piocheFigureChild2.append("<p>Cliquez ici pour fermer la défausse</p>");
            $("<figure></figure>").addClass("discard").appendTo(".pioche");
            $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + graveyard + "/draw/?cards=" + graveyardContent)
                .then(function(response) {
                    var cardsReceived = response.cards;
                    for (var i = 0; i < cardsReceived.length; i++) {
                        var currentImage = cardsReceived[i].image;
                        var imageTag = $("<img>").attr("src", currentImage);
                        imageTag.appendTo(".pioche figure:last-child");
                    }
                });
        }
    });
}

function draw(number, player) {
    playerEffect = playerFutureEffect;
    botEffect = botFutureEffect;
    var $score = ".score h2";
    if (($(player).children().length + number) < 6 && number < 4 && number > 0 && $("main").children().length === 0) {
        $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=" + 2 * number)
            .then(function(response) {
                newCard(response, ".handplayer");
            })
            .then(function() {
                play();
            });
    }
    $($score + ":nth-child(3)").find("p").replaceWith("<p>" + playerEffect + "</p>");
    $($score + ":last-child").find("p").replaceWith("<p>" + botEffect + "</p>");
}

function play() {
    var playerHandSize;
    var botHandSize;
    $(".handplayer").find("article p:last-child").on("click", function() {
        var dataCardPlayer = $(".handplayer").find("img.preview").data("code");
        var dataCardBot = $(".handbot").find("img:first-child");
        if ($(this).parent().hasClass("preview") && $("main").children().length < 1) {
            $("article.preview").detach();
            $("img.preview").toggleClass("preview").appendTo("main");
            $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + playerHand + "/draw/?cards=" + dataCardPlayer)
                .then(function(response) {
                    playerHandSize = response.piles.playerHand.remaining;
                    cardPlayedPlayer = newCard(response);
                    if (remainingCards >= 30) {
                        graveyardContent += dataCardPlayer;
                    } else {
                        graveyardContent += "," + dataCardPlayer;
                    }
                    $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + graveyard + "/add/?cards=" + dataCardPlayer);
                    return $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + botHand + "/draw/?cards=" + dataCardBot.data("code"));
                })
                .then(function(response) {
                    var cardPlayedBotResponse = response.cards[0];
                    var imageTag = $("<img>").attr("src", cardPlayedBotResponse.image);
                    botHandSize = response.piles.botHand.remaining;
                    cardPlayedBot = newCard(response);
                    graveyardContent += "," + dataCardBot.data("code");
                    imageTag.prependTo("main");
                    $.get("http://deckofcardsapi.com/api/deck/" + deckID + "/pile/" + graveyard + "/add/?cards=" + dataCardBot.data("code"));
                })
                .then(function() {
                    outcome();
                    dataCardBot.detach();
                    $(".score h1:first-child").find("p").replaceWith("<p>" + playerScore + "</p>");
                    $(".score h1:nth-child(2)").find("p").replaceWith("<p>" + botScore + "</p>");
                    if (playerHandSize === 0 && botHandSize === 0) {
                        $("<p>Connaître le gagnant</p>").appendTo("main");
                        endOfGame();
                    } else {
                        $("<p>Tour suivant</p>").appendTo("main");
                        nextTurn();
                    }
                });
        }
    });
}

function nextTurn() {
    var $mainChildren = $("main").children();
    $("main p:last-child").on("click", function() {
        $mainChildren.detach();
        draw(1, ".handplayer");
    });
}

function endOfGame() {
    $(".handplayer").off("click", "img");
    $(".handplayer").off("click", ".preview p:nth-child(2)");
    $(".pioche figure:nth-child(2)").off("click");
    $("main p:last-child").on("click", function() {
        $("main").children().detach();
        var params = {
            win: playerScore > botScore,
            parity: playerScore === botScore,
            loose: playerScore < botScore
        };
        var wantToReplay = Mustache.render(winOrLooseTemplate, params);
        $(wantToReplay).appendTo("main");
        $("<p>Voulez-vous rejouer ?</p>").toggleClass("result").appendTo("main");
        $("<p>Oui !</p>").appendTo("main");
        $("<p>Non !</p>").appendTo("main");
        $("main p:nth-child(3)").on("click", function() {
            $("main").children().detach();
            letsplay();
        });
        $("main p:last-child").on("click", function() {
            $("main").children().detach();
            $("<h1>Merci d'avoir joué !! N'hésitez pas à me faire part de vos remarques constructives !</h1>").appendTo("main");
            $("<a>Cliquez içi pour revenir au menu principal</a>").attr("href", "jeux1.html").appendTo("main");
        });
    });
}

function outcome() {
    var powerPlayer = cardPlayedPlayer.power;
    var pointsPlayer = cardPlayedPlayer.points;
    var weakBot = cardPlayedBot.weak;
    var pointsBot = cardPlayedBot.points;
    var suitPlayer = cardPlayedPlayer.suit;
    var suitBot = cardPlayedBot.suit;
    var totalPuissancePlayer = cardPlayedPlayer.value + playerEffect;
    var totalPuissanceBot = cardPlayedBot.value + botEffect;
    var le = "il";
    var un = "un";
    var params = {
        totalPuissancePlayer,
        totalPuissanceBot,
        suitPlayer,
        suitBot,
        $unPlayer: maleOrFemale(suitPlayer, "un"),
        $unBot: maleOrFemale(suitBot, un),
        leBot: maleOrFemale(suitBot, le),
        effective: suitPlayer === weakBot || powerPlayer === suitBot,
        noeffective: suitPlayer === cardPlayedBot.power || cardPlayedPlayer.weak === suitBot,
        equal: suitPlayer === cardPlayedBot.suit,
        valuesuperior: totalPuissancePlayer > totalPuissanceBot,
        valueequal: totalPuissancePlayer === totalPuissanceBot,
        valueinferior: totalPuissancePlayer < totalPuissanceBot
    };
    if (params.equal) {
        if (params.valuesuperior) {
            playerScore += (pointsPlayer + pointsBot);
            effect(true);
        } else if (params.valueinferior) {
            botScore += (pointsPlayer + pointsBot);
            effect(false);
        } else if (params.valueequal) {
            playerFutureEffect = 0;
            botFutureEffect = 0;
        }
    } else if (params.effective) {
        playerScore += (pointsPlayer + pointsBot);
        effect(true);
    } else if (params.noeffective) {
        botScore += (pointsPlayer + pointsBot);
        effect(false);
    }
    var winOrLoose = Mustache.render(BattleResultTemplate, params);
    $(winOrLoose).appendTo("main");
}

function effect(victoire) {
    var effects;
    if (victoire) {
        effects = effectCalc(cardPlayedPlayer.bonus, cardPlayedBot.bonus);
        playerFutureEffect = effects.winner;
        botFutureEffect = effects.looser;
    } else {
        effects = effectCalc(cardPlayedBot.bonus, cardPlayedPlayer.bonus);
        botFutureEffect = effects.winner;
        playerFutureEffect = effects.looser;
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

function startOfGame() {
    reset(0);
    var $piocheFigure = ".pioche figure";
    $($piocheFigure + ":first-child").find("figcaption").detach();
    $($piocheFigure + ":first-child").append("<figcaption>Cartes restantes " + remainingCards + ".</figcaption>");
    $("main").children().detach();
    $($piocheFigure).find("p").detach();
    $($piocheFigure + ":last-child").append("<p>Cliquez ici pour voir la défausse</p>");
    $(".score h1").children().detach();
    $(".score h2").children().detach();
    $(".handplayer").children().detach();
    $(".handbot").children().detach();
    $(".score h1:first-child").append("<p>" + playerScore + "</p>");
    $(".score h1:nth-child(2)").append("<p>" + botScore + "</p>");
    $(".score h2:nth-child(3)").append("<p>" + playerEffect + "</p>");
    $(".score h2:last-child").append("<p>" + botEffect + "</p>");
    draw(3, ".handplayer");
}

function reset(number) {
    botEffect = number;
    playerEffect = number;
    playerScore = number;
    botScore = number;
    playerEffect = number;
    botEffect = number;
    playerFutureEffect = number;
    botFutureEffect = number;
    graveyardContent = "";
}

function initialize() {
    var cardsFilter = "2S,2H,2C,3S,3H,3C,4S,4H,4C,5S,5H,5C,6S,6H,6C,7S,7H,7C,8S,8H,8C,9S,9H,9C,0S,0H,0C,JS,JH,JC,QS,QH,QC,KS,KH,KC";
    $("<img>").attr("src", "images/waiting.gif").toggleClass("preview").appendTo("main");
    $.get("http://deckofcardsapi.com/api/deck/new/shuffle/?cards=" + cardsFilter)
        .then(function(response) {
            preview();
            remainingCards = response.remaining;
            $("main").children().detach();
            deckID = response.deck_id;
            startOfGame();
        });
}

function letsplay() {
    $(document).ready(function() {
        initialize();
        discard();
    });
}

letsplay();
