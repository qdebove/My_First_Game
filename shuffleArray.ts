import {Card} from "./public/classes/Card";
export const shuffle = function shuffle(array: Set<Card>): Set<Card> {
    'use strict';

    let temporaryArray = new Array<Card>();

    for(let card of array) {
        temporaryArray.push(card);
    }

    let finalArray = new Set<Card>();

    let i = temporaryArray.length;
    let mixed = new Set<Card>();
    while (i !== 0) {
        let x = Math.round(Math.random() * (i - 1));
        finalArray.add(temporaryArray[x]);
        temporaryArray.splice(x, 1);
        i--;
    }
    return finalArray;
};


