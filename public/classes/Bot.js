"use strict";
/**
 * Created by debovequentin on 23/02/2017.
 */
class Bot {
    constructor(score = 0, effect = 0, futureEffect = 0, hand = new Set(), cardPlayed = null) {
        this.score = score;
        this.effect = effect;
        this.futureEffect = futureEffect;
        this.hand = hand;
        this.cardPlayed = cardPlayed;
    }
    getScore() {
        return this.score;
    }
    addPointToScore(number) {
        this.score += number;
    }
    getEffect() {
        return this.effect;
    }
    setEffect() {
        this.effect = this.futureEffect;
    }
    setFutureEffect(number) {
        this.futureEffect = number;
    }
    getHand() {
        return this.hand;
    }
    getHandLength() {
        return this.hand.size;
    }
    getCardPlayed() {
        return this.cardPlayed;
    }
    setCardPlayed() {
        let random = Math.round(Math.random() * (this.hand.size - 1));
        let i = 0;
        if (this.cardPlayed !== null) {
            return false;
        }
        for (let card of this.hand) {
            if (i == random) {
                this.cardPlayed = card;
                return this.hand.delete(card);
            }
            i++;
        }
        return false;
    }
    addCardsToHand(cards) {
        for (let card of cards) {
            this.hand.add(card);
        }
    }
    canDraw() {
        return this.hand.size < 3;
    }
    canPlay() {
        return this.cardPlayed == null;
    }
    resetCardPlayed() {
        this.cardPlayed = null;
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map