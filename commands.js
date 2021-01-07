// JavaScript source code
const Constants = require('./constants.js');

module.exports =
{
    points: function (msg, tokens, data) { points(msg, tokens, data) },
    bet: function (msg, tokens) {}
}

function points(msg, tokens, data) {
    var guildID = msg.guild.id
    var memberID = msg.member.id
    var dataKey = `${guildID} - ${memberID}`
    var points = data.get(dataKey, "points");
    var author = msg.author.toString()
    msg.channel.send(`${author} has: ${points} points!`)
}