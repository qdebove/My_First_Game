
import {Card} from "./Card";
import {shuffle} from "../../shuffleArray";

export class Deck {
    public cards: Set<Card>;

    constructor(number: number, cardList: Array<{value: number, bonus: number,
                                                points: number, image: String,
                                                suit: String, weak: String,
                                                power: String}>) {
        this.cards = new Set<Card>();
        for(let i = 0; i < number; i++) {
            let card = new Card(
                cardList[i].value, cardList[i].bonus, cardList[i].points,
                cardList[i].image, cardList[i].suit, cardList[i].weak,
                cardList[i].power);
            card.setUniqueCode(this.generateUniqueCode());
            this.cards.add(card);
        }
        this.cards = shuffle(this.cards);
    }

    public drawCard(number: number): Array<Card> {
        let result = [];
        let i = number;

        this.cards = shuffle(this.cards);
        for(let card of this.cards) {
            if(i > 0) {
                result.push(card);
                this.cards.delete(card);
                i--;
            }
        }
        return result;
    }

    public getRemaining(): number {
        return this.cards.size;
    }

    private generateUniqueCode(): String {
        let code = ["2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S",
            "T", "U", "V", "W", "X", "Y", "Z"];
        let RndCode = "";
        for (let i = 0; i < 10; i++) {
            let z = Math.floor(Math.random() * 32);
            RndCode = RndCode + code[z];
        }
        return RndCode
    }
}