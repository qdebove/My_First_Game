"use strict";
exports.shuffle = function shuffle(array) {
    'use strict';
    let temporaryArray = new Array();
    for (let card of array) {
        temporaryArray.push(card);
    }
    let finalArray = new Set();
    let i = temporaryArray.length;
    let mixed = new Set();
    while (i !== 0) {
        let x = Math.round(Math.random() * (i - 1));
        finalArray.add(temporaryArray[x]);
        temporaryArray.splice(x, 1);
        i--;
    }
    return finalArray;
};
//# sourceMappingURL=shuffleArray.js.map