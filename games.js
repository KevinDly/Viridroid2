// JavaScript source code
const Util = require("./util.js");
const Constants = require("./constants.js")
const config = require("config")
const CardConstants = require('./cardconstants.js')
const { MessageEmbed }  = require("discord.js")

const HIT = config.get('Games.Blackjack.hit')
const STAY = config.get('Games.Blackjack.stay')

//TODO: Grab these from code automatically
const HIT_ID = config.get('Games.Blackjack.hit_id')
const STAY_ID = config.get('Games.Blackjack.stay_id')

const number = {
    1: "Ace",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
    7: "Seven",
    8: "Eight",
    9: "Nine",
    10: "Ten",
    11: "Jack",
    12: "King",
    13: "Queen"
}

const suit = {
    1: "Hearts",
    2: "Spades",
    3: "Diamonds",
    4: "Clubs"
}

//TODO: Move constants to constants file
//TODO: Make blackjack, and related functions, more efficient

//Returns the hand as a string.
function handAsString(hand) {
    var handString = hand[0][1]
    
    /*for (let [cardKey, cardValue] of hand) {
        handString = handString + " " + cardValue
    }*/

    var firstCard = true
    hand.forEach(card => {
        if (firstCard) {
            firstCard = false
        }
        else {
            console.log(card)
            handString = handString + ", " + card[1]
            console.log(handString)
        }
    })
    return handString
}

/*Uses JSON Representation of Cards
 * REQUIRED: Json objects needs an emote tag.
*/
function handAsEmotes(hand) {
    var handString = hand[0].emote

    var firstCard = true
    hand.forEach(card => {
        if (firstCard) {
            firstCard = false
        }
        else {
            handString = handString + " " + card.emote
        }
    })

    return handString
}
//Returns value of the hand
//Deprecated: Doesn't use JSON Representation of Cards
function oldHandAsValue(hand) {
    var total = 0
    var totalAces = 0

    hand.forEach(card => {
        var value = card[0]
        if (value == 1) {
            totalAces++
            value = 0
        }
        total = total + value
    })

    //Check if there were any aces
    for (i = 0; i < totalAces; i++) {
        if ((total + 11) <= 21) 
            total = total + 11
        else
            total = total + 1
    }

    return total
}

/*Uses JSON Representation of Cards
 * REQUIRED: Json objects needs a value tag.
*/
function handAsValue(hand) {
    var total = 0
    var totalAces = 0
    hand.forEach(card => {
        var value = card.value
        if (value == 1) {
            totalAces++
            value = 0;
        }
        total = total + value
    })

    console.log("Total Type: " + (typeof total))
    console.log("Total: " + total)
    console.log("Total Aces: " + totalAces)
    for (i = 0; i < totalAces; i++) {
        if ((total + 11) <= 21) {
            console.log("Was < 21 " + total)
            total = total + 11
        }
        else {
            console.log("Was > 21 " + total)
            total = total + 1
        }
    }

    return total
}
//TODO Change Strings to emotes.
function newBlackjack(msg, buyIn, data) {

    //Create deep copy of the deck.
    var cards = JSON.parse(JSON.stringify(CardConstants.cards))

    console.log(cards.length)
    var playerHand = []
    var houseHand = []

    var houseKey = "The House"
    var houseValueKey = "House's Value"
    var authorKey = msg.author.username
    var authorValueKey = msg.author.username + "'s Value"

    var guildID = msg.guild.id;
    var memberID = msg.member.id;
    var dataKey = `${guildID} - ${memberID}`;

    //Distribute cards to player
    for (i = 0; i < 2; i++)
        //Add card to player hand first then house hand
        for (j = 0; j < 2; j++) {
            var cardIndex = Util.randomInRange(0, cards.length)
            //console.log(cards)
            var card = cards.splice(cardIndex, 1)[0]
            //console.log(card)
            if (j == 0)
                playerHand.push(card)
            else
                houseHand.push(card)
        }

    var gameEmbed = new MessageEmbed()
        .setTitle("Blackjack")
        .setDescription(authorKey + "'s turn")
        .addFields(
            { name: houseKey, value: houseHand[0].emote + " and 1 Other Card", inline: true },
            { name: houseValueKey, value: "???", inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: authorKey, value: handAsEmotes(playerHand), inline: true },
            { name: authorValueKey, value: handAsValue(playerHand), inline: true }
        )
        .setThumbnail("https://i.imgur.com/vuljj6c.png")
        .setColor("RANDOM");

    //Starts the game.
    msg.channel.send(gameEmbed).then(message => newBlackjackLoop(dataKey, buyIn, data, houseHand, playerHand, cards, msg, message, gameEmbed, false, false) )

}

//TODO: HIDE HOUSE VALUES UNTIL PLAYER'S TURN IS DONE/REVEAL VALUES IF PLAYER BUSTED
async function newBlackjackLoop(dataKey, buyIn, data, houseHand, playerHand, cards, realMessage, embedMessage, gameEmbed, playerStay, houseStay) {

    //Sleep 1 second
    var houseKey = "The House"
    var houseValueKey = "House's Value"

    var authorKey = realMessage.author.username
    var authorValueKey = realMessage.author.username + "'s Value"

    var playerValue = parseInt(gameEmbed.fields.find(f => f.name === authorValueKey).value)
    var embedHouseValue = gameEmbed.fields.find(f => f.name === houseValueKey).value
    console.log("Embed house value: " + embedHouseValue)
    console.log("Embed type: " + (typeof embedHouseValue))
    var houseValue = (embedHouseValue === "???") ? handAsValue(houseHand) : parseInt(embedHouseValue)

    console.log("house value: " + houseValue)
    console.log("House Value Type: " + (typeof houseValue))
    console.log("player value: " + playerValue)
    console.log("Player Value Type: " + (typeof playerValue))
    //Win or loss check for each turn
    if (playerValue == 21 || houseValue > 21) {
        //If player got 21 immediately or if house busted.
        console.log("Player got 21 immediately or house busted.")
        var newEmbed = new MessageEmbed(gameEmbed)
            .setDescription(`You won! Adding ${buyIn} to your account! ${config.get('Games.Blackjack.emoteWin')}`);
        newEmbed.fields.find(f => f.name === houseKey).value = handAsEmotes(houseHand)
        newEmbed.fields.find(f => f.name === houseValueKey).value = houseValue
        embedMessage.edit(newEmbed)
        data.math(dataKey, "+", buyIn, "points")
        return
    }
    else if (houseValue == 21 || playerValue > 21) {
        //If house got 21 immediately or if player busted.
        console.log("House got 21 immediately or player busted.")
        var newEmbed = new MessageEmbed(gameEmbed)
            .setDescription(`You lost. Subtracting ${buyIn} from your account. ${config.get('Games.Blackjack.emoteLose')}`);
        newEmbed.fields.find(f => f.name === houseKey).value = handAsEmotes(houseHand)
        newEmbed.fields.find(f => f.name === houseValueKey).value = houseValue
        embedMessage.edit(newEmbed)
        data.math(dataKey, "-", buyIn, "points")
        return
    }
    else if (houseStay == true && playerStay == true) {
        //If both stayed and neither busted/got 21
        console.log("Both stayed")
        console.log("Player > house? " + (playerValue > houseValue))
        console.log("Player Value Again: " + playerValue)
        console.log("Player Type Again: " + (typeof playerValue))
        console.log("House Value Again: " + houseValue)
        console.log("house type again: " + (typeof houseValue))
        if (playerValue > houseValue) {
            console.log("Player won")
            var newEmbed = new MessageEmbed(gameEmbed)
                .setDescription(`You won! Adding ${buyIn} to your account! ${config.get('Games.Blackjack.emoteWin')}`);
            embedMessage.edit(newEmbed)
            data.math(dataKey, "+", buyIn, "points")
            return
        }
        else {
            console.log("House won")
            var newEmbed = new MessageEmbed(gameEmbed)
                .setDescription(`You lost. Subtracting ${buyIn} from your account. ${config.get('Games.Blackjack.emoteLose')}`);
            embedMessage.edit(newEmbed)
            data.math(dataKey, "-", buyIn, "points")
            return
        }
    }

    //TODO: Make bot pause
    if (playerStay) {
        if (houseValue < 16 || playerValue > houseValue) {
            //Draw Card
            var cardIndex = Util.randomInRange(0, cards.length);
            var card = cards.splice(cardIndex, 1)[0]

            //Push Card into hand and update values
            houseHand.push(card);
            console.log("House card: " + card)
            var houseHandValue = handAsValue(houseHand);

            //Create new Embed and Edit it
            var newEmbed = new MessageEmbed(gameEmbed)
            newEmbed.fields.find(f => f.name === houseKey).value = handAsEmotes(houseHand)
            newEmbed.fields.find(f => f.name === houseValueKey).value = houseHandValue
            embedMessage.edit(newEmbed).then(() =>
                setTimeout(() => { newBlackjackLoop(dataKey, buyIn, data, houseHand, playerHand, cards, realMessage, embedMessage, newEmbed, playerStay, false) },
                    Constants.TIME_BETWEEN_CARD_DRAW));
        }
        else {
            var newEmbed = new MessageEmbed(gameEmbed)
                            .setDescription("House stayed, checking who won!")
            embedMessage.edit(newEmbed).then(() =>
                setTimeout(() => { newBlackjackLoop(dataKey, buyIn, data, houseHand, playerHand, cards, realMessage, embedMessage, newEmbed, playerStay, true) },
                    Constants.TIME_BETWEEN_CARD_DRAW));
        }
    }
    else {
        //Replace emojis with Hit or Stay
        //This is the player's turn
        await embedMessage.react(HIT)
        await embedMessage.react(STAY)

        let filter = (reaction, user) => {
            return [HIT_ID, STAY_ID].includes(reaction.emoji.id) && (user.id === realMessage.author.id)
        }

        embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                //Put game logic here

                //Delete the reactions
                embedMessage.reactions.removeAll().catch(error => console.error('Could not remove reactions: ', error))

                //Check what reaction the user made.
                const reaction = collected.first()
                //True is stay, false is hit
                //Might want to change this to something easily identifiable

                if (reaction.emoji.name === "STAY") {
                    //Update the message to house's turn
                    //console.log("In stay")
                    var newEmbed = new MessageEmbed(gameEmbed)
                    //console.log("newEmbed before desc: " + newEmbed.toJSON())
                    newEmbed = newEmbed.setDescription("House's Turn")
                    //console.log("newEmbed before find: " + newEmbed.toJSON())
                    newEmbed.fields.find(f => f.name === houseKey).value = handAsEmotes(houseHand)
                    newEmbed.fields.find(f => f.name === houseValueKey).value = houseValue
                    embedMessage.edit(newEmbed).then(() => {
                        newBlackjackLoop(dataKey, buyIn, data, houseHand, playerHand, cards, realMessage, embedMessage, newEmbed, true, false)
                    })
  
                    //Add call to function again
                }
                else {
                    var cardIndex = Util.randomInRange(0, cards.length);
                    var card = cards.splice(cardIndex, 1)[0]
                    playerHand.push(card);
                    var playerHandValue = handAsValue(playerHand);
                    var newEmbed = new MessageEmbed(gameEmbed)
                    newEmbed.fields.find(f => f.name === authorKey).value = handAsEmotes(playerHand)
                    newEmbed.fields.find(f => f.name === authorValueKey).value = playerHandValue

                    embedMessage.edit(newEmbed).then(() => 
                        newBlackjackLoop(dataKey, buyIn, data, houseHand, playerHand, cards, realMessage, embedMessage, newEmbed, false, false))
                }
            })
            .catch(collected => {
                //Put error logic here
            });
    }
}

//TODO: Preprocess card array somewhere else.
function blackjack(msg, buyIn, data) {
    var cards = []
    
    //Add all cards into the array
    /*for (let [numberKey, numberValue] of number) {
        for (let suitValue of suit) {
            var cardName = `${numberValue} of ${suitValue}`
            var card = [numberKey, cardName]

            //Replac Jack, King, and Queen with appropriate value
            if (card[0] == 11 || card[0] == 12 || card == 13)
                card[0] = 10

            //Push card with corresponding value 
            cards.push(card)
        }
    }*/

    Object.keys(number).forEach(function (numberKey) {
        Object.keys(suit).forEach(function (suitKey) {
            var numberValue = number[numberKey]
            var suitValue = suit[suitKey]

            var cardName = `${numberValue} of ${suitValue}`

            var card = [Number(numberKey), cardName]

            /*var card = {
                value: Number(numberKey),
                name: cardName
            }*/

            //Replac Jack, King, and Queen with appropriate value
            if (card[0] == 11 || card[0] == 12 || card[0] == 13)
                card[0] = 10

            //Push card with corresponding value 
            cards.push(card)
        })
    })

    var playerHand = []
    var houseHand = []

    //Distribute cards to player
    for (i = 0; i < 2; i++)
        //Add card to player hand first then house hand
        for (j = 0; j < 2; j++) {
            var cardIndex = Util.randomInRange(0, cards.length)
            //console.log(cards)
            var card = cards.splice(cardIndex, 1)[0]
            console.log(card)
            if (j == 0)
                playerHand.push(card)
            else
                houseHand.push(card)
        }

    msg.channel.send("You have: " + handAsString(playerHand))
    msg.channel.send(`${ msg.author.toString() }'s card's value: ${ handAsValue(playerHand) }`)
    msg.channel.send("Your opponent has: " + houseHand[0][1] + " and " + (houseHand.length - 1) + " cards")

    blackjackLoop(msg, cards, buyIn, data, playerHand, houseHand, false, false, false, false)
}

//Main loop for blackjack 
//TODO: SIMPLIFY LOGIC 
function blackjackLoop(msg, cards, buyIn, data, playerHand, houseHand, playerWin, houseWin, playerStay, houseStay) {

    //https://stackoverflow.com/questions/45856446/discord-js-reply-to-message-then-wait-for-reply
    
    var cards = cards
    var playerWin = playerWin
    var houseWin = houseWin
    var playerStay = playerStay
    var houseStay = houseStay

    //TODO: Change this to some other variable name later
    var message;
    if (playerStay == true) {
        message = "You stayed last round."
    }
    else {
        message = "Hit or stay?"
    }

    var guildID = msg.guild.id;
    var memberID = msg.member.id;
    var dataKey = `${guildID} - ${memberID}`;

    var playerBust = false
    var houseBust = false
    var author = msg.author.toString()

    let filter = m => ((m.author.id === msg.author.id) && (m.content.toUpperCase() == "HIT" || m.content.toUpperCase() == "STAY"))

    //If player won off first hand
    if (handAsValue(playerHand) == 21) {
        msg.channel.send(`${author} won ${buyIn} points! ${ config.get('Games.Blackjack.emoteWin') }`)
        data.math(dataKey, "+", buyIn, "points")
    }
    else if (handAsValue(houseHand) == 21) {
        msg.channel.send(`${author} lost ${buyIn} points! ${config.get('Games.Blackjack.emoteLose') }`)
        data.math(dataKey, "-", buyIn, "points")
    }
    else if (playerStay == false) {
        msg.channel.send(message).then(() => {
            msg.channel.awaitMessages(filter, {
                max: 1,
                time: Util.minutesToMili(1),
                errors: ['time']
            })
                .then((message) => {
                    message = message.first()

                    //HUMAN TURN
                    var playerHandValue;

                    ({ cardIndex, playerHandValue, playerStay, playerWin, playerBust } = playerTurn(playerHand, playerStay, playerWin, message, cards, playerBust, author));

                    //HOUSE TURN
                    //Check if opponent stayed or not and if the player busted the previous turn
                    ({ cardIndex, houseStay, houseWin, houseBust } = houseTurn(houseStay, playerBust, playerWin, houseHand, message, cards, houseWin, houseBust));

                    //Check if either won
                    if (playerStay == true && houseStay == true || houseWin == true || playerWin == true || playerBust == true || houseBust == true) {

                        //Setup variables 
                        var playerHandValue;
                        ({ playerHandValue, houseWin, playerWin } = winnerCheck(message, playerHandValue, playerHand, houseHand, playerBust, houseWin, houseBust, playerWin, author, buyIn, data, dataKey));
                    }
                    else {
                        message.channel.send("END OF TURN")
                        message.channel.send("----------------------------------------------------------------------------------------------")
                        message.channel.send("You have: " + handAsString(playerHand))

                        msg.channel.send(`${ author }'s card's value: ${ handAsValue(playerHand) }`)
                        message.channel.send("Your opponent has: " + houseHand[0][1] + " and " + (houseHand.length - 1) + " cards")
                            .then(() => {
                                blackjackLoop(message, cards, buyIn, data, playerHand, houseHand, playerWin, houseWin, playerStay, houseStay)
                            })
                    }
                })
                .catch(collected => {
                    msg.channel.send("Game timed out!")
                    console.log(collected)
                });

        })
    }
    else {
        //HOUSE TURN
        //Check if opponent stayed or not and if the player busted the previous turn
        ({ houseStay, houseWin, houseBust } = houseTurn(houseStay, playerBust, playerWin, houseHand, msg, cards, houseWin, houseBust));

        //Check if either won
        if (playerStay == true && houseStay == true || houseWin == true || playerWin == true || playerBust == true || houseBust == true) {

            //Setup variables 
            var playerHandValue;
            ({ playerHandValue, houseWin, playerWin } = winnerCheck(msg, playerHandValue, playerHand, houseHand, playerBust, houseWin, houseBust, playerWin, author, buyIn, data, dataKey));
        }
        else {
            //Initiate next turn.
            msg.channel.send("END OF TURN")
            msg.channel.send("----------------------------------------------------------------------------------------------")
            msg.channel.send("You have: " + handAsString(playerHand))
            msg.channel.send(`${ author }'s card's value: ${ handAsValue(playerHand) }`)
            msg.channel.send("Your opponent has: " + houseHand[0][1] + " and " + (houseHand.length - 1) + " cards")
                .then(() => {
                    blackjackLoop(msg, cards, buyIn, data, playerHand, houseHand, playerWin, houseWin, playerStay, houseStay)
                })
        }
    }
}

function winnerCheck(message, playerHandValue, playerHand, houseHand, playerBust, houseWin, houseBust, playerWin, author, buyIn, data, dataKey) {

    var playerHandValue = handAsValue(playerHand);
    var houseHandValue = handAsValue(houseHand);

    
    message.channel.send("You have: " + handAsString(playerHand));
    message.channel.send(`${ author }'s card's value: ${ playerHandValue }`);
    message.channel.send("Your opponent has: " + handAsString(houseHand));
    message.channel.send(`The House's Card Values: ${houseHandValue}`);

    //Check if either busted
    if (playerBust) {
        message.channel.send(`${ author } busted.`);
        houseWin = true;
    }
    else if (houseBust) {
        message.channel.send(`The house busted.`);
        playerWin = true;
    }

    //Check if both stayed again for the card check
    if (!houseWin && !playerWin) {
        var pHandDistanceWin = 21 - playerHandValue;
        var hHandDistanceWin = 21 - houseHandValue;

        if (pHandDistanceWin > hHandDistanceWin || houseHandValue == playerHandValue)
            houseWin = true;

        else
            playerWin = true;
    }

    //Add or subtract appropriate amount of points from player
    if (playerWin == true) {
        message.channel.send(`${author} won ${buyIn} points! ${ config.get('Games.Blackjack.emoteWin') }`)
        data.math(dataKey, "+", buyIn, "points")
    }
    else if (houseWin == true) {
        message.channel.send(`${author} lost ${buyIn} points! ${ config.get('Games.Blackjack.emoteLose') }`)
        data.math(dataKey, "-", buyIn, "points")
    }
    return { playerHandValue, houseWin, playerWin };
}

function houseTurn(houseStay, playerBust, playerWin, houseHand, message, cards, houseWin, houseBust) {
    if (houseStay == false && playerBust == false && playerWin == false) {
        var houseHandTotal = handAsValue(houseHand);

        //House rule, stay ALWAYS if over 16
        if (houseHandTotal >= 16) {
            message.channel.send("The house stays.");
            houseStay = true;
        }
        else {
            //Give house card if it isnt at 16
            message.channel.send("The house hits.");
            var cardIndex = Util.randomInRange(0, cards.length);
            houseHand.push(cards.splice(cardIndex, 1)[0]);

            var houseHandTotal = handAsValue(houseHand);
            //Check if house won
            if (houseHandTotal == 21) {
                houseWin = true;
            }
            else if (houseHandTotal > 21) {
                houseBust = true;
            }
        }
    }
    return { houseStay, houseWin, houseBust };
}

function playerTurn(playerHand, playerStay, playerWin, message, cards, playerBust, author) {
    var playerHandValue = handAsValue(playerHand);

    //If the player stayed, then just return as normal.
    if (playerStay != true) {
        //Check if the player has already won
        if (message.content.toUpperCase() == "HIT") {

            //Grab the card
            var cardIndex = Util.randomInRange(0, cards.length);
            var card = cards.splice(cardIndex, 1)[0]
            message.channel.send(`${ author } got ${ card[1] }`)
            playerHand.push(card);
            playerHandValue = handAsValue(playerHand);

            //Check if player busted or won
            if (playerHandValue > 21)
                playerBust = true;
            else if (playerHandValue == 21)
                playerWin = true;
        }
        else if (message.content.toUpperCase() == "STAY") {
            message.channel.send(`${ author } stays.`);
            playerStay = true;
        }
    }
    return { cardIndex, playerHandValue, playerStay, playerWin, playerBust };
}

module.exports = { blackjack, newBlackjack }