/**
 * Created by debovequentin on 15/02/2017.
 */
"use strict";
const cardDescription_1 = require("../cardDescription");
class Card {
    constructor(value, bonus, points, image, suit, weak, power) {
        this.value = value;
        this.bonus = bonus;
        this.points = points;
        this.image = image;
        this.suit = suit;
        this.weak = weak;
        this.power = power;
        this.cardDescription = cardDescription_1.cardDescription(this);
    }
    getCardDescription() {
        return this.cardDescription;
    }
    setUniqueCode(code) {
        this.code = code;
    }
    getHashCode() {
        return this.code;
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map