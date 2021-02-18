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

    //Check if amount of choices are valid.
    //Arbitrarily 4 for now.
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
    var createdDescription = "Number of Votes: 0 \n\n"
    //embed.setDescription("Number of Votes: 0 \n")
    embed.setThumbnail(Constants.POLL_EMBED_IMAGE)
    embed.setColor("GREEN")

    var pollUpdate = {}
    var pollChoice = {}

    var idReaction = {}
    var index = 0

    const UTF16_BASE_1 = 55356
    const UTF16_BASE_2 = 56806

    for (var token in tokens) {
        var word = tokens[token]
        if (token == 0)
            embed.setTitle(word)
        else {
            //Add the option to the embed
            var optionLetter = String.fromCharCode(UTF16_BASE_1, UTF16_BASE_2 + index)
            //var emojiName = `${optionLetter}`
            index = index + 1

            //Add fields that will be displayed.
            /*embed.addFields(
                { name: '\u200B', value: `${ optionLetter } ${ word }`, inline: true },
                { name: optionLetter, value: `0% \t\t\t ${createPercentageBar(0)}`, inline: true },
                { name: '\u200B', value: '\u200B'}
            )*/
            createdDescription = createdDescription.concat(`${optionLetter} ${word} \n`)
            createdDescription = createdDescription.concat(`${createPercentageBar(0)} 0%\n\n`)
            //Initialize amount of votes each option has.
            pollUpdate[optionLetter] = 0
            pollChoice[optionLetter] = word
        }
    }

    embed.setDescription(createdDescription)
    
    //React to message with appropriate keys.
    msg.channel.send(embed).then((sentMessage) => {
      
        Object.keys(pollUpdate).forEach(async (key) => {
            //var reactedEmoji = sentMessage.guild.emojis.cache.find(emoji => emoji.name === key)
            await sentMessage.react(key)
        })

        var alreadyReacted = []

        let filter = (reaction, user) => {
            return Object.keys(pollUpdate).includes(reaction.emoji.name) && !user.bot
        }

        //let removeFilter = (reaction, user)
        //Await reactions and update embed.
        const collector = sentMessage.createReactionCollector(filter, { time: 60000, dispose: true })

        //Activate modification of embed if reaction is correct.
        collector.on('collect', (reaction, user) => {

            //If user already reacted.
            if (alreadyReacted.includes(user.id)) {
                return
            }

            const emojiName = reaction.emoji.name
            const userID = user.id
            var newEmbed = new Discord.MessageEmbed(embed)
            var newDescription = ""

            pollUpdate[emojiName]++
            idReaction[userID] = emojiName

            alreadyReacted.push(userID)

            //newEmbed.setDescription(`Number of Votes: ${ alreadyReacted.length }`)
            newDescription = newDescription.concat(`Number of Votes: ${alreadyReacted.length}\n\n`)
            //Update all fields with new data.
            Object.keys(pollUpdate).forEach(key => {
                //var field = newEmbed.fields.find(f => f.name === key)
                var decimalReacted = (pollUpdate[key] / alreadyReacted.length)
                var percentReacted = decimalReacted * 100
                var createdBar = createPercentageBar(decimalReacted)
                
                newDescription = newDescription.concat(`${key} ${ pollChoice[key] } \n`)
                newDescription = newDescription.concat(`${createdBar} ${ percentReacted }%\n\n`)
                //field.value = `${ percentReacted }% \t\t\t ${createdBar}`
            })

            newEmbed.setDescription(newDescription)

            embed = newEmbed
            sentMessage.edit(newEmbed)
        })

        collector.on('remove', (reaction, user) => {
            //Put code for removed reaction here.
            //Its the above code but in reverse
            //If user did not already react or if the reaction removed is not the one originally added.
            const emojiName = reaction.emoji.name
            const userID = user.id

            if (!alreadyReacted.includes(user.id) || !(emojiName === idReaction[userID])) {
                return
            }

            var newEmbed = new Discord.MessageEmbed(embed)
            var newDescription = ""
            //Remove the data for that user's reaction.
            pollUpdate[emojiName]--
            delete idReaction[userID]

            alreadyReacted.splice(alreadyReacted.indexOf(userID), 1)

            //newEmbed.setDescription(`Number of Votes: ${alreadyReacted.length}`)
            newDescription = newDescription.concat(`Number of Votes: ${alreadyReacted.length}\n\n`)

            //Update all fields with new data.
            Object.keys(pollUpdate).forEach(key => {
                //var field = newEmbed.fields.find(f => f.name === key)
                var decimalReacted = alreadyReacted.length == 0 ? 0 : (pollUpdate[key] / alreadyReacted.length)
                var percentReacted = decimalReacted * 100
                var createdBar = createPercentageBar(decimalReacted)
                newDescription = newDescription.concat(`${key} ${pollChoice[key]} \n`)
                newDescription = newDescription.concat(`${createdBar} ${ percentReacted }%\n\n`)
                //field.value = `${ percentReacted }% \t\t\t ${createdBar}`
            })

            newEmbed.setDescription(newDescription)

            embed = newEmbed
            sentMessage.edit(newEmbed)
        })

        collector.on('end', (collected, reason) => {
            //Put code for finishing poll here.
            sentMessage.reactions.removeAll()
            var newEmbed = new Discord.MessageEmbed(embed)
            newEmbed.setColor("RED")

            sentMessage.edit(newEmbed)
        })
    });
}

//Should take a decimal value < 1.
function createPercentageBar(percent) {
    const FULL_BAR = config.get("CommandAssets.barFull")
    const EMPTY_BAR = config.get("CommandAssets.barEmpty")
    const TOTAL_BAR = 10

    var percentTens = percent * 10
    var percentRounded = Math.round(percentTens)
    var baseString = ""

    var fullAmount = 0;

    for (i = 0; i < TOTAL_BAR; i++) {
        if (fullAmount < percentRounded) {
            baseString = baseString.concat(FULL_BAR)
            fullAmount++
        }
        else {
            baseString = baseString.concat(EMPTY_BAR)
        }
    }

    return baseString
}

function profile(msg, tokens, data) {
    var datakey = getDataKey(msg)
    var embed = new MessageEmbed()
}

function getDataKey(msg) {
    return `${ msg.guild.id } - ${ msg.member.id }`
}
