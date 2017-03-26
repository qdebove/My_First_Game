(function() {
        'use strict';
        let request = require("request");
        let express = require("express");
        let bodyParser = require("body-parser");
        let querystring = require("querystring");
        let Game = require("./public/classes/Game");
        let app = express();
        let router = express.Router();
        let fullDeck = require("./fullDeck");
        let allGames = [];

        app.use(express.static("public"));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));


        router.param('serial', function (request, result, next, serial) {
            if (serial > allGames.length - 1) {
                console.log(`Partie numéro ${serial} non trouvée !`);
                result.status(404).send('Game not found');
            } else {
                request.serial = serial;
                if (request.body) {
                    request.currentGame = allGames[serial];
                    request.currentPlayer = allGames[serial].getPlayer();
                }
                next();
            }
        });

        app.post("/game/new", function (request, response) {
            let newGame = new Game.Game(allGames.length, fullDeck.fullDeck.length, fullDeck.fullDeck);
            allGames.push(newGame);
            console.log(`Partie lancée numéro ${allGames.length - 1}.`);
            response.status(200).send(newGame.getGamesInformation());
        });

        router.post("/game/:serial/draw", function ({currentGame, currentPlayer, serial, body}, response) {
            currentGame.nextTurn();
            if (!currentPlayer.canDraw()) {
                console.log(`Le joueur ne peut pas piocher ${body.quantity} cartes dans la partie numéro ${serial}.`);
                response.status(404).send('Vous avez déjà le nombre max de cartes en main.');
            } else {
                let cardDrawedForPlayer = currentGame.getDeck().drawCard(body.quantity);
                let cardDrawedForBot = currentGame.getDeck().drawCard(body.quantity);
                currentPlayer.addCardsToHand(cardDrawedForPlayer);
                currentGame.getBot().addCardsToHand(cardDrawedForBot);
                console.log(`Le joueur viens de piocher ${body.quantity} cartes.`);
                console.log(`Le bot à piocher pour la partie numéro ${serial}.`);
                let currentResponse = {
                    "cards": cardDrawedForPlayer,
                    "player": currentGame.getPlayer().getEffect(),
                    "bot": currentGame.getBot().getEffect(),
                    "remaining": currentGame.getDeck().getRemaining()
                };
                response.status(200).send(currentResponse);
            }
        });

        router.post("/game/:serial/play", function ({currentGame, serial, body}, response) {
            if(!currentGame.getPlayer().setCardPlayed(body.hashCode)) {
                console.log(`Impossible de jouer une carte dans la partie ${serial}.`);
                response.status(405).send("Vous ne pouvez pas jouer.")
            } else {
                currentGame.getBot().setCardPlayed();
                let cardPlayedPlayer = currentGame.getPlayer().getCardPlayed();
                let cardPlayedBot = currentGame.getBot().getCardPlayed();
                console.log(`Carte jouée pour le joueur dans la partie ${serial}`);
                response.send({
                    player: cardPlayedPlayer,
                    bot: cardPlayedBot
                });
            }
        });

        router.post("/game/:serial/outcome", function ({currentGame, serial}, response) {
            if(currentGame.getPlayer().getCardPlayed() == null || currentGame.getBot().getCardPlayed() == null) {
                console.log(`Impossible de connaitre le résultat de la bataille pour la partie numéro ${serial}`);
                response.status(405).send("Impossible de connaitre le résultat de la bataille");
            } else {
                console.log("Résultats de la bataille envoyés pour la partie numéro " + currentGame.game_id + ".");
                if (currentGame.isFinish()) {
                    console.log(`Fin de la partie numéro ${serial}.`);
                }
                let battleResult = currentGame.getBattleResult();
                currentGame.nextTurn();
                response.send(battleResult);
            }
        });

        router.post("/game/:serial/winner", function ({currentGame, serial}, response) {
            let winner = currentGame.getWinnerOfTheGame();
            if(winner == null) {
                console.log(`La partie numéro ${serial} n'est pas finie !`);
                response.status(405).send("La partie n'est pas finie !");
            } else {
                console.log(`Fin de la partie numéro ${serial}`);
                response.send(winner);
            }
        });

        router.post("/game/:serial/graveyard", function ({currentGame, currentPlayer, serial, body}, response) {
            console.log(`Cimetière consulté pour la partie numéro ${serial}.`);
            response.send(currentGame.getGraveyard());
        });

        app.use("/", router);

        let port = process.env.PORT || 3000;

        app.listen(port, function () {
            console.log("Serveur lancé !");
        });
    }

)();