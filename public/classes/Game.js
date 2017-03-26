/**
 * Created by debovequentin on 13/02/2017.
 */
"use strict";
const Player_1 = require("./Player");
const Deck_1 = require("./Deck");
const Graveyard_1 = require("./Graveyard");
const Bot_1 = require("./Bot");
const cardDescription_1 = require("../cardDescription");
class Game {
    constructor(gameNumber, quantityOfCard, fullDeck) {
        this.player = new Player_1.Player();
        this.bot = new Bot_1.Bot();
        this.game_id = gameNumber;
        this.deck = new Deck_1.Deck(quantityOfCard, fullDeck);
        this.graveyard = new Graveyard_1.Graveyard();
    }
    getPlayer() {
        return this.player;
    }
    getBot() {
        return this.bot;
    }
    getDeck() {
        return this.deck;
    }
    getGraveyard() {
        return this.graveyard;
    }
    isFinish() {
        return (this.deck.getRemaining() == 0 && this.player.getHandLength() == 0 && this.bot.getHandLength() == 0);
    }
    setGameEffects(victory) {
        let effects;
        let game = this.getGamesInformation();
        if (victory) {
            effects = this.effectCalc(this.player.getCardPlayed().bonus, this.bot.getCardPlayed().bonus);
            this.player.setFutureEffect(effects.winner);
            this.bot.setFutureEffect(effects.looser);
        }
        else {
            effects = this.effectCalc(this.bot.getCardPlayed().bonus, this.player.getCardPlayed().bonus);
            this.player.setFutureEffect(effects.looser);
            this.bot.setFutureEffect(effects.winner);
        }
    }
    setGameOutcome() {
        let playerCardPlayed = this.player.getCardPlayed();
        let botCardPlayed = this.bot.getCardPlayed();
        let powerPlayer = playerCardPlayed.power;
        let powerBot = botCardPlayed.power;
        let pointsPlayer = playerCardPlayed.points;
        let pointsBot = botCardPlayed.points;
        let weakPlayer = playerCardPlayed.weak;
        let weakBot = botCardPlayed.weak;
        let suitPlayer = playerCardPlayed.suit;
        let suitBot = botCardPlayed.suit;
        let totalPuissancePlayer = playerCardPlayed.value + this.player.getEffect();
        let totalPuissanceBot = botCardPlayed.value + this.bot.getEffect();
        let le = "il";
        let un = "un";
        let playerCard = cardDescription_1.maleOrFemale(suitPlayer, un) + suitPlayer;
        let botCard = cardDescription_1.maleOrFemale(suitBot, un) + suitBot;
        let result = `<p> Vous avez joué ${playerCard}.<br>Votre adversaire a joué ${botCard}.</p>`;
        let winOrLoose;
        if (suitPlayer === suitBot) {
            if (totalPuissancePlayer > totalPuissanceBot) {
                this.player.addPointToScore(pointsPlayer + pointsBot);
                this.setGameEffects(true);
                winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a plus de puissance que votre adversaire (${totalPuissanceBot}).</p>`;
            }
            else if (totalPuissancePlayer < totalPuissanceBot) {
                this.bot.addPointToScore(pointsPlayer + pointsBot);
                this.setGameEffects(false);
                winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a moins de puissance que votre adversaire (${totalPuissanceBot}).</p>`;
            }
            else if (totalPuissancePlayer === totalPuissanceBot) {
                this.player.setFutureEffect(0);
                this.bot.setFutureEffect(0);
                winOrLoose = `<p>Vous avez fait égalité, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a la même puissance que votre adversaire (${totalPuissanceBot}).</p>`;
            }
        }
        else if (powerPlayer === suitBot || suitPlayer === weakBot) {
            this.player.addPointToScore(pointsPlayer + pointsBot);
            this.setGameEffects(true);
            winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} est fort contre ${cardDescription_1.maleOrFemale(suitBot, le)} ${suitBot}
        de votre adversaire.</p>`;
        }
        else if (weakPlayer === suitBot || powerBot === suitPlayer) {
            this.bot.addPointToScore(pointsPlayer + pointsBot);
            this.setGameEffects(false);
            winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} est faible contre ${cardDescription_1.maleOrFemale(suitBot, le)} ${suitBot} 
        de votre adversaire.</p>`;
        }
        return (result + winOrLoose);
    }
    getGamesInformation() {
        return {
            game_id: this.game_id,
            graveyard: this.graveyard.getCards(),
            player1: this.player,
            player2: this.bot
        };
    }
    nextTurn() {
        if (!this.isFinish()) {
            this.player.setEffect();
            this.bot.setEffect();
            this.player.setFutureEffect(0);
            this.bot.setFutureEffect(0);
            if (this.player.getCardPlayed() != null) {
                this.graveyard.addCards(this.player.getCardPlayed());
                this.graveyard.addCards(this.bot.getCardPlayed());
            }
            this.player.resetCardPlayed();
            this.bot.resetCardPlayed();
        }
    }
    getBattleResult() {
        let result = {
            result: this.setGameOutcome(),
            score: {
                player: this.player.getScore(),
                bot: this.bot.getScore()
            },
            pursue: 1,
            nextTurn: ""
        };
        if (this.isFinish()) {
            result.nextTurn = "Connaître le gagnant";
            result.pursue = 0;
        }
        else {
            result.nextTurn = "Tour suivant";
        }
        return result;
    }
    getWinnerOfTheGame() {
        if (!this.isFinish()) {
            return null;
        }
        let winOrLoose = "Vous avez : ";
        if (this.player.getScore() > this.bot.getScore()) {
            winOrLoose += "gagné !!!";
        }
        else if (this.player.getScore() === this.bot.getScore()) {
            winOrLoose += "fait égalité !!";
        }
        else {
            winOrLoose += "perdu !";
        }
        return {
            winOrLoose: `${winOrLoose}}`,
            wannaReplay: `Voulez-vous rejouer ?`
        };
    }
    effectCalc(bonusWinner, bonusLooser) {
        let effects = {
            winner: 0,
            looser: 0
        };
        if (bonusWinner < 0 && bonusLooser >= 0) {
            effects.winner = bonusWinner;
            effects.looser = bonusLooser;
        }
        else if (bonusWinner < 0 && bonusLooser < 0) {
            effects.winner = bonusWinner;
            effects.looser = 0;
        }
        else if (bonusWinner >= 0 && bonusLooser >= 0) {
            effects.winner = 0;
            effects.looser = bonusLooser;
        }
        else {
            effects.winner = 0;
            effects.looser = 0;
        }
        return effects;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map