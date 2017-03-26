/**
 * Created by debovequentin on 15/02/2017.
 */

import {cardDescription} from "../cardDescription";

export class Card {
    private code: String;
    private cardDescription: Object;

    constructor(
        public value: number,
        public bonus: number,
        public points: number,
        public image: String,
        public suit: String,
        public weak: String,
        public power: String
    ) {
        this.cardDescription = cardDescription(this);
    }

    public getCardDescription(): Object {
        return this.cardDescription;
    }

    public setUniqueCode(code: String) {
        this.code = code;
    }

    public getHashCode(): String {
        return this.code;
    }

}
