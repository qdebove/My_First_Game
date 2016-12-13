module.exports = function shuffle(array) {
    'use strict';
    var i = array.length;
    var mixed = [];
    while (i !== 0) {
        var x = Math.round(Math.random() * (i - 1));
        mixed.push(array[x]);
        array.splice(x, 1);
        i--;
    }
    var j = mixed.length;
    while (j !== 0) {
        var y = Math.round(Math.random() * (j - 1));
        array.push(mixed[y]);
        mixed.splice(y, 1);
        j--;
    }
};
