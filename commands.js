// JavaScript source code
const Constants = require('./constants.js');

module.exports =
{
    points: function (msg, tokens) { points(msg, tokens) },
    bet: function (msg, tokens) {}
}

function points(msg, tokens) {
    var guildID = msg.guild.id
    var memberID = msg.member.id
}