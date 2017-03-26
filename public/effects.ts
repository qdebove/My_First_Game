/**
 * Created by debovequentin on 13/02/2017.
 */

import {Game} from "./classes/Game";

export const effect = function effect(victoire: Boolean, game: Game): void {
    let effects;
    let player1 = game.getPlayer();
    let player2 = game.getBot();
    if (victoire) {
        effects = effectCalc(player1.getCardPlayed().bonus, player2.getCardPlayed().bonus);
        player1.setFutureEffect(effects.winner);
        player2.setFutureEffect(effects.looser);
    } else {
        effects = effectCalc(player2.getCardPlayed().bonus, player1.getCardPlayed().bonus);
        player1.setFutureEffect(effects.looser);
        player2.setFutureEffect(effects.winner);
    }
};

export const effectCalc = function effectCalc(bonusWinner: number, bonusLooser: number): Object {
    let effects = {
        winner: 0,
        looser: 0
    };
    if (bonusWinner < 0 && bonusLooser >= 0) {
        effects.winner = bonusWinner;
        effects.looser = bonusLooser;
    } else if (bonusWinner < 0 && bonusLooser < 0) {
        effects.winner = bonusWinner;
        effects.looser = 0;
    } else if (bonusWinner >= 0 && bonusLooser >= 0) {
        effects.winner = 0;
        effects.looser = bonusLooser;
    } else {
        effects.winner = 0;
        effects.looser = 0;
    }
    return effects;
};

