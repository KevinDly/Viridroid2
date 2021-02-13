const Constants = require('./constants.js');

//Converts minutes to miliseconds.
function minutesToMili(minutes) {
    return (minutes * Constants.MINUTES_AS_MS);
}

//Generates a random number within range of min and max
//https://stackoverflow.com/questions/33609404/node-js-how-to-generate-random-numbers-in-specific-range-using-crypto-randomby
function randomInRange(min, max) {
    return Math.random() * (max - min) + min
}

function getDataKey(msg) {

}
module.exports = { minutesToMili, randomInRange };