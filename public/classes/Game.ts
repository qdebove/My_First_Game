/**
 * Created by debovequentin on 13/02/2017.
 */

import {Card} from "./Card";
import {Player} from "./Player";
import {Deck} from "./Deck";
import {Graveyard} from "./Graveyard";
import {Bot} from "./Bot";
import {maleOrFemale} from "../cardDescription";



export class Game {
    private game_id: number;
    private deck: Deck;
    private graveyard: Graveyard;
    private player: Player;
    private bot: Bot;

    constructor(gameNumber: number, quantityOfCard: number,
                fullDeck: Array<{value: number, bonus: number,
                                points: number, image: String,
                                suit: String, weak: String,
                                power: String}>)
    {
        this.player = new Player();
        this.bot = new Bot();
        this.game_id = gameNumber;
        this.deck = new Deck(quantityOfCard, fullDeck);
        this.graveyard = new Graveyard();

    }

    public getPlayer(): Player {
        return this.player;
    }

    public getBot(): Bot {
        return this.bot;
    }

    public getDeck(): Deck {
        return this.deck;
    }

    public getGraveyard(): Graveyard {
        return this.graveyard;
    }

    public isFinish(): boolean {
        return (this.deck.getRemaining() == 0 && this.player.getHandLength() == 0 && this.bot.getHandLength() == 0);
    }

    private setGameEffects(victory: boolean): void {
        let effects;
        let game = this.getGamesInformation();
        if (victory) {
            effects = this.effectCalc(this.player.getCardPlayed().bonus, this.bot.getCardPlayed().bonus);
            this.player.setFutureEffect(effects.winner);
            this.bot.setFutureEffect(effects.looser);
        } else {
            effects = this.effectCalc(this.bot.getCardPlayed().bonus, this.player.getCardPlayed().bonus);
            this.player.setFutureEffect(effects.looser);
            this.bot.setFutureEffect(effects.winner);
        }
    }

    public setGameOutcome(): String {
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
        let playerCard = maleOrFemale(suitPlayer, un) + suitPlayer;
        let botCard = maleOrFemale(suitBot, un) + suitBot;
        let result = `<p> Vous avez joué ${playerCard}.<br>Votre adversaire a joué ${botCard}.</p>`;
        let winOrLoose;
        if (suitPlayer === suitBot) {
            if (totalPuissancePlayer > totalPuissanceBot) {
                this.player.addPointToScore(pointsPlayer + pointsBot);
                this.setGameEffects(true);
                winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a plus de puissance que votre adversaire (${totalPuissanceBot}).</p>`;

            } else if (totalPuissancePlayer < totalPuissanceBot) {
                this.bot.addPointToScore(pointsPlayer + pointsBot);
                this.setGameEffects(false);
                winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a moins de puissance que votre adversaire (${totalPuissanceBot}).</p>`;

            } else if (totalPuissancePlayer === totalPuissanceBot) {
                this.player.setFutureEffect(0);
                this.bot.setFutureEffect(0);
                winOrLoose = `<p>Vous avez fait égalité, votre ${suitPlayer} de puissance totale 
            (${totalPuissancePlayer}) a la même puissance que votre adversaire (${totalPuissanceBot}).</p>`;
            }

        } else if (powerPlayer === suitBot || suitPlayer === weakBot) {
            this.player.addPointToScore(pointsPlayer + pointsBot);
            this.setGameEffects(true);
            winOrLoose = `<p>Vous avez gagné, votre ${suitPlayer} est fort contre ${maleOrFemale(suitBot, le)} ${suitBot}
        de votre adversaire.</p>`;

        } else if (weakPlayer === suitBot || powerBot === suitPlayer) {
            this.bot.addPointToScore(pointsPlayer + pointsBot);
            this.setGameEffects(false);
            winOrLoose = `<p>Vous avez perdu, votre ${suitPlayer} est faible contre ${maleOrFemale(suitBot, le)} ${suitBot} 
        de votre adversaire.</p>`;

        }
        return (result + winOrLoose);
    }

    public getGamesInformation(): Object {
        return {
            game_id: this.game_id,
            graveyard: this.graveyard.getCards(),
            player1: this.player,
            player2: this.bot
        }
    }

    public nextTurn(): void {
        if(!this.isFinish()) {
            this.player.setEffect();
            this.bot.setEffect();
            this.player.setFutureEffect(0);
            this.bot.setFutureEffect(0);
            if(this.player.getCardPlayed() != null) {
                this.graveyard.addCards(this.player.getCardPlayed());
                this.graveyard.addCards(this.bot.getCardPlayed());
            }
            this.player.resetCardPlayed();
            this.bot.resetCardPlayed();
        }
    }

    public getBattleResult(): Object {
        let result = {
            result: this.setGameOutcome(),
            score: {
                player: this.player.getScore(),
                bot: this.bot.getScore()
            },
            pursue: 1,
            nextTurn: ""
        };

        if(this.isFinish()) {
            result.nextTurn = "Connaître le gagnant";
            result.pursue = 0;
        } else {
            result.nextTurn = "Tour suivant";
        }
        return result;
    }

    public getWinnerOfTheGame(): Object {
        if(!this.isFinish()) {
            return null
        }
        let winOrLoose = "Vous avez : ";
        if (this.player.getScore() > this.bot.getScore()) {
            winOrLoose += "gagné !!!";
        } else if (this.player.getScore() === this.bot.getScore()) {
            winOrLoose += "fait égalité !!";
        } else {
            winOrLoose += "perdu !";
        }
        return {
            winOrLoose: `${winOrLoose}}`,
            wannaReplay: `Voulez-vous rejouer ?`
        };
    }

    private effectCalc(bonusWinner: number, bonusLooser: number): Object {
        let effects = {
            winner: 0,
            looser: 0
        };
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
}
