import {Card} from "./Card";
/**
 * Created by debovequentin on 23/02/2017.
 */

export class Bot {


    constructor(
        private score: number = 0,
        private effect: number = 0,
        private futureEffect: number = 0,
        private hand: Set<Card> = new Set<Card>(),
        private cardPlayed = null
    ) {}

    public getScore(): number {
        return this.score;
    }

    public addPointToScore(number: number): void {
        this.score += number;
    }

    public getEffect(): number {
        return this.effect;
    }

    public setEffect(): void {
        this.effect = this.futureEffect;
    }

    public setFutureEffect(number: number): void {
        this.futureEffect = number;
    }

    public getHand(): Set<Card> {
        return this.hand;
    }

    public getHandLength(): number {
        return this.hand.size;
    }

    public getCardPlayed(): Card {
        return this.cardPlayed;
    }

    public setCardPlayed(): boolean {
        let random = Math.round(Math.random() * (this.hand.size - 1));
        let i = 0;
        if(this.cardPlayed !== null) {
            return false;
        }
        for(let card of this.hand) {
            if(i == random) {
                this.cardPlayed = card;
                return this.hand.delete(card);
            }
            i++
        }
        return false;
    }

    public addCardsToHand(cards: Array<Card>): void {
        for(let card of cards) {
            this.hand.add(card);
        }
    }

    public canDraw(): boolean {
        return this.hand.size < 3;
    }

    public canPlay(): boolean {
        return this.cardPlayed == null;
    }

    public resetCardPlayed(): void {
        this.cardPlayed = null;
    }
}
