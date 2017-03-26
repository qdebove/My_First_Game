/**
 * Created by debovequentin on 13/02/2017.
 */

import {Card} from "./Card";

export class Player {

    constructor(
        private name: String = "Player1",
        private score: number = 0,
        private effect: number = 0,
        private futureEffect: number = 0,
        private hand: Set<Card> = new Set<Card>(),
        private cardPlayed = null
    ) {}

    public getName(): String {
        return this.name;
    }

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

    public setCardPlayed(hashCode: String): boolean {
        if(this.cardPlayed !== null) {
            return false;
        }
        for(let card of this.hand) {
            if(card.getHashCode() == hashCode) {
                this.cardPlayed = card;
                return this.hand.delete(card);
            }
        }
        return false;
    }

    public findCard(hashCode: String): Card {
        for(let card of this.hand) {
            if(card.getHashCode() == hashCode) {
                return card;
            }
        }
        return null;
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