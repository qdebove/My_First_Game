/**
 * Created by debovequentin on 13/02/2017.
 */
"use strict";
exports.effect = function effect(victoire, game) {
    let effects;
    let player1 = game.getPlayer();
    let player2 = game.getBot();
    if (victoire) {
        effects = exports.effectCalc(player1.getCardPlayed().bonus, player2.getCardPlayed().bonus);
        player1.setFutureEffect(effects.winner);
        player2.setFutureEffect(effects.looser);
    }
    else {
        effects = exports.effectCalc(player2.getCardPlayed().bonus, player1.getCardPlayed().bonus);
        player1.setFutureEffect(effects.looser);
        player2.setFutureEffect(effects.winner);
    }
};
exports.effectCalc = function effectCalc(bonusWinner, bonusLooser) {
    let effects = {
        winner: 0,
        looser: 0
    };
    if (bonusWinner < 0 && bonusLooser >= 0) {
        effects.winner = bonusWinner;
        effects.looser = bonusLooser;
    }
    else if (bonusWinner < 0 && bonusLooser < 0) {
        effects.winner = bonusWinner;
        effects.looser = 0;
    }
    else if (bonusWinner >= 0 && bonusLooser >= 0) {
        effects.winner = 0;
        effects.looser = bonusLooser;
    }
    else {
        effects.winner = 0;
        effects.looser = 0;
    }
    return effects;
};
//# sourceMappingURL=effects.js.map