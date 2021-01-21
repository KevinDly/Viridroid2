// JavaScript source code
const Util = require("./util.js");
const Constants = require("./constants.js")
const config = require("config")

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

//Returns value of the hand
//TODO: Make the function more efficient
function handAsValue(hand) {
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

module.exports = { blackjack }