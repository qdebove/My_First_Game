"use strict";
class Graveyard {
    constructor() {
        this.cards = new Array();
    }
    addCards(card) {
        this.cards.push(card);
    }
    getCards() {
        return this.cards;
    }
    getLength() {
        return this.cards.length;
    }
}
exports.Graveyard = Graveyard;
//# sourceMappingURL=Graveyard.js.map