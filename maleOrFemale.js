module.exports = function maleOrFemale(propriete, article) {
    'use strict';
    if (propriete === "HACHE" && article === "il") {
        return " la ";
    }
    if (propriete === "HACHE" && article === "un") {
        return " une ";
    }
    if (propriete === "HACHE" && article === "Il") {
        return "Elle ";
    }
    if (propriete === "HACHE" && article === "Un") {
        return "Une ";
    }
    if (propriete === "ARC" && article === "il") {
        return " l'";
    }
    if (propriete === "ARC" && article === "Il") {
        return "L'";
    }
    if ((propriete === "BOUCLIER" || propriete === "ARC") && article === "un") {
        return " un ";
    }
    if ((propriete === "BOUCLIER" || propriete === "ARC") && article === "Un") {
        return "Un ";
    }
    if (propriete === "BOUCLIER" && article === "il") {
        return " le ";
    }
    if (propriete === "BOUCLIER" && article === "Il") {
        return "Il ";
    }
};
