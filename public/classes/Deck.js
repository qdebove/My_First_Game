"use strict";
const Card_1 = require("./Card");
const shuffleArray_1 = require("../../shuffleArray");
class Deck {
    constructor(number, cardList) {
        this.cards = new Set();
        for (let i = 0; i < number; i++) {
            let card = new Card_1.Card(cardList[i].value, cardList[i].bonus, cardList[i].points, cardList[i].image, cardList[i].suit, cardList[i].weak, cardList[i].power);
            card.setUniqueCode(this.generateUniqueCode());
            this.cards.add(card);
        }
        this.cards = shuffleArray_1.shuffle(this.cards);
    }
    drawCard(number) {
        let result = [];
        let i = number;
        this.cards = shuffleArray_1.shuffle(this.cards);
        for (let card of this.cards) {
            if (i > 0) {
                result.push(card);
                this.cards.delete(card);
                i--;
            }
        }
        return result;
    }
    getRemaining() {
        return this.cards.size;
    }
    generateUniqueCode() {
        let code = ["2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S",
            "T", "U", "V", "W", "X", "Y", "Z"];
        let RndCode = "";
        for (let i = 0; i < 10; i++) {
            let z = Math.floor(Math.random() * 32);
            RndCode = RndCode + code[z];
        }
        return RndCode;
    }
}
exports.Deck = Deck;
//# sourceMappingURL=Deck.js.map