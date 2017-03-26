/**
 * Created by debovequentin on 13/02/2017.
 */
"use strict";
exports.cardDescription = function cardDescription(card) {
    'use strict';
    let bonus = card.bonus;
    let result_bonus;
    if (bonus < 0) {
        result_bonus = "donne un malus de " + bonus + " au prochain tour.";
    }
    else if (bonus === 0) {
        result_bonus = "ne donne ni bonus ni malus au prochain tour.";
    }
    else {
        result_bonus = "donne un bonus de " + bonus + " au prochain tour.";
    }
    return {
        description: `Cette arme est ${exports.maleOrFemale(card.suit, "un")} ${card.suit} qui ${result_bonus}`,
        power_weakness: `Cette arme est forte contre ${exports.maleOrFemale(card.power, "il") + card.power} 
        mais perd contre ${exports.maleOrFemale(card.weak, "il") + card.weak}`,
        action1: "Fermer la fenêtre",
        action2: "Jouer la carte"
    };
};
exports.maleOrFemale = function maleOrFemale(propriete, article) {
    'use strict';
    if (propriete === "HACHE" && article === "il") {
        return "la ";
    }
    if (propriete === "HACHE" && article === "un") {
        return "une ";
    }
    if (propriete === "HACHE" && article === "Il") {
        return "Elle ";
    }
    if (propriete === "HACHE" && article === "Un") {
        return "Une ";
    }
    if (propriete === "ARC" && article === "il") {
        return "l'";
    }
    if (propriete === "ARC" && article === "Il") {
        return "L'";
    }
    if ((propriete === "BOUCLIER" || propriete === "ARC") && article === "un") {
        return "un ";
    }
    if ((propriete === "BOUCLIER" || propriete === "ARC") && article === "Un") {
        return "Un ";
    }
    if (propriete === "BOUCLIER" && article === "il") {
        return "le ";
    }
    if (propriete === "BOUCLIER" && article === "Il") {
        return "Il ";
    }
};
//# sourceMappingURL=cardDescription.js.map