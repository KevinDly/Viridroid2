// JavaScript source code
const Constants = require('./constants.js')
const Games = require('./games.js')
const config = require('config')
const Discord = require('discord.js')

module.exports =
{
    points: function (msg, tokens, data) { points(msg, tokens, data) },
    bet: function (msg, tokens) { },
    blackjack: function (msg, tokens, data) { blackjack(msg, tokens, data) },
    award: function (msg, tokens, data) { award(msg, tokens, data) },
    help: function (msg, tokens, data) { help(msg, tokens, data) },
    version: function (msg, tokens, data) { version(msg, tokens, data) },
    poll: function (msg, tokens, data) { poll(msg, tokens, data) },
    profile: function (msg, tokens, data) { }
}

/*s!points
 * Messages the amount of points the user that executed the command has in the chat.
*/
function points(msg, tokens, data) {
    var guildID = msg.guild.id
    var memberID = msg.member.id
    var dataKey = `${guildID} - ${memberID}`
    var points = data.get(dataKey, "points");
    var author = msg.author.toString()
    msg.channel.send(`${author} has: ${points} points!`)
}

/*s!blackjack [Required: Points]
 * Initiates the game blackjack for the user that executed the command.
 * [Points] are given or taken depending on whether or not the user wins or lose.
*/
function blackjack(msg, tokens, data) {
    const command = Constants.BLACKJACK_FORMAT
    var guildID = msg.guild.id
    var memberID = msg.member.id
    var dataKey = `${guildID} - ${memberID}`
    var points = data.get(dataKey, "points");

    //Check if the format is correct
    if (tokens.length != 1 || !(/^\d+$/.test(tokens[0]))) {
        msg.channel.send(`Invalid command format, format for this command is: ${command}`)
    }
    else {
        const buyIn = Number(tokens[0])

        if (points < buyIn)
            msg.channel.send("Invalid amount of points!")
        else
            Games.newBlackjack(msg, buyIn, data)
    }
}

/*s!award [Required: Points] [Required: User]
 * Gives [points] amount to [user] specified.
*/
function award(msg, tokens, data) {
    //Check if permissions on user executing command are valid
    if (!(msg.member.id == Constants.DEV_ID)) {
        msg.channel.send('Insufficient permissions.')
        return
    }

    //Check if initial variables are valid
    if (tokens.length != 2 || !(/^\d+$/.test(tokens[0]))) {
        //TODO: Change string to be somewhere else.
        msg.channel.send(`Invalid command format, format for this command is: s!award [Amount] [User]`)
    }
    else {
        const pointsToGive = Number(tokens[0])
        const memberID = tokens[1].replace(/\D/g, '')
        //Check if user is valid
        if (msg.guild.member(memberID)) {

            //Award points
            const guildID = msg.guild.id
            const dataKey = `${guildID} - ${memberID}`
            data.math(dataKey, "+", pointsToGive, "points")
            msg.channel.send(`Gave ${ tokens[1] } ${ pointsToGive } point(s)! Congratulations!`)
        }
        else
            msg.channel.send(`User ${ tokens[1] } does not exist!`)
    }
}

/*s!help [Optional: Command Name] [Optional: "detailed"]
 * Sends a help message that either gives a list of commands or
 * describes a command in detail.
 */
function help(msg, tokens, data) {
    //Checks if the command is the default implementation or not
    var embed = new Discord.MessageEmbed().setColor('#f42069')

    if (tokens.length == 0) {
        var commandList = config.get('Commands')
        embed = embed.setDescription("To see more detailed command descriptions type: \n \"s!help [Command Name] detailed\"")
        for (var command in commandList) {
            embed = embed.addField(commandList[command]["format"], commandList[command]["description"])
        }

        msg.channel.send(embed)
    }
    else if (tokens.length > 1 && tokens[1].toUpperCase() == "DETAILED" && config.has("Commands." + tokens[0].toLowerCase())) {
        //Checks if the command arguments are correct.
        var commandKey = "Commands." + tokens[0].toLowerCase()
        var format = config.get(commandKey + ".format")
        var description = config.has(commandKey + ".detailed") ? config.get(commandKey + ".detailed") : null
        embed = embed.setTitle(format)

        //Checks if the command has a detailed description or not.
        if (description != null) {
            //Adds the detailed description of the command
            var message = ""
            for (var descriptionLine in description) {
                message = message.concat(description[descriptionLine])
            }
            embed = embed.setDescription(message)
        }
        else {
            //Adds a non-detailed description of the command.
            embed = embed.setDescription(config.get(commandKey + ".description"))
        }

        msg.channel.send(embed)
    }
    else {
         msg.channel.send("Incorrect format format is \n" + config.get('Commands.help.format'))
    }
}

function poll(msg, tokens, data) {
    var embed = new Discord.MessageEmbed()

    const maxChoices = 4
    if(tokens.length < 3) {
        msg.channel.send("More than 1 answer required.")
        return
    }
    if (tokens.length > (maxChoices + 1)) {
        msg.channel.send(`Reached max choice limit, max choices: ${maxChoices}`)
        return
    }
    //Should store pairs with the name and the amount voted.

    embed.setDescription("Number of Votes: 0")

    var pollUpdate = {}

    var index = 0

    for (var token in tokens) {
        var word = tokens[token]
        if (token == 0)
            embed.setTitle(word)
        else {
            //Add the option to the embed
            var optionLetter = String.fromCharCode(127462 + index)
            var emojiName = `${optionLetter}:`
            index = index + 1

            //Add fields that will be displayed.
            embed.addFields(
                { name: '\u200B', value: word, inline: true},
                { emote: emojiName, name: '0%', value: '\u200B', inline: true },
                { name: '\u200B', value: '\u200B'}
            )

            //Initialize amount of votes each option has.
            pollUpdate[emojiName] = 0
        }
    }
    
    //React to message with appropriate keys.
    msg.channel.send(embed).then((sentMessage) => {
      
        Object.keys(pollUpdate).forEach(async (key) => {
            console.log(`The key is ${ key }`)
            //var reactedEmoji = sentMessage.guild.emojis.cache.find(emoji => emoji.name === key)
            await sentMessage.react(key)
        })

        var alreadyReacted = []

        let filter = (reaction, user) => {
            return Object.keys(pollUpdate).includes(reaction.emoji.name) && !alreadyReacted.includes(user.id)
        }

        //Await reactions and update embed.
        const collector = sentMessage.createReactionCollector(filter, { time: 60000, dispose: true })

        //Activate modification of embed if reaction is correct.
        collector.on('collect', (reaction, user) => {
            const emojiName = reaction.emoji.name
            const userID = user.id
            var newEmbed = new Discord.MessageEmbed(embed)
            console.log(`Emoji name on collect is: ${ emojiName }`)
            pollUpdate[emojiName]++

            alreadyReacted.push(userID)

            newEmbed.setDescription(`Number of Votes: ${pollUpdate.length}`)
            var field = newEmbed.fields.find(f => f.emote === emojiName)
            field.name = `${ (pollUpdate[emojiName]/pollUpdate.length)*100 }%`
        })

        collector.on('dispose', (reaction, user) => {
            //Put code for removed reaction here.
        })

        collector.on('end', (collected, reason) => {
            //Put code for finishing poll here.
        })
    });
}

function profile(msg, tokens, data) {
    var datakey = getDataKey(msg)
    var embed = new MessageEmbed()
}

function getDataKey(msg) {
    return `${ msg.guild.id } - ${ msg.member.id }`
}
