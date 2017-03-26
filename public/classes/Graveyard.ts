import {Card} from "./Card";

export class Graveyard {
    private cards: Array<Card>;
    
    constructor() {
        this.cards = new Array<Card>();
    }

    public addCards(card: Card): void {
        this.cards.push(card);
    }

    public getCards(): Array<Card> {
        return this.cards;
    }

    public getLength(): Number {
        return this.cards.length;
    }
}