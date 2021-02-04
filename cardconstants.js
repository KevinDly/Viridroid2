// JavaScript source code
const rank = {
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
    1: "Heart",
    2: "Spade",
    3: "Diamond",
    4: "Club"
}

const cards = [
    {
        name: "Ace of Hearts",
        suit: "Heart",
        rank: "Ace",
        value: 1,
        emote: "<:AceOfHearts:806743045726666782>"
    },
    {
        name: "Two of Hearts",
        suit: "Heart",
        rank: "Two",
        value: 2,
        emote: "<:TwoOfHearts:806747197064347679>"
    },
    {
        name: "Three of Hearts",
        suit: "Heart",
        rank: "Three",
        value: 3,
        emote: "<:ThreeOfHearts:806743047022444574>"
    },
    {
        name: "Four of Hearts",
        suit: "Heart",
        rank: "Four",
        value: 4,
        emote: "<:FourOfHearts:806743045646712844>"
    },
    {
        name: "Five of Hearts",
        suit: "Heart",
        rank: "Five",
        value: 5,
        emote: "<:FiveOfHearts:806743045860360232>"
    },
    {
        name: "Six of Hearts",
        suit: "Heart",
        rank: "Six",
        value: 6,
        emote: "<:SixOfHearts:806743046708265010>"
    },
    {
        name: "Seven of Hearts",
        suit: "Heart",
        rank: "Seven",
        value: 7,
        emote: "<:SevenOfHearts:806743046497501184>"
    },
    {
        name: "Eight of Hearts",
        suit: "Heart",
        rank: "Eight",
        value: 8,
        emote: "<:EightOfHearts:806743045726797854>"
    },
    {
        name: "Nine of Hearts",
        suit: "Heart",
        rank: "Nine",
        value: 9,
        emote: "<:NineOfHearts:806743046367739914>"
    },
    {
        name: "Ten of Hearts",
        suit: "Heart",
        rank: "Ten",
        value: 10,
        emote: "<:TenOfHearts:806743047026638908>"
    },
    {
        name: "Jack of Hearts",
        suit: "Heart",
        rank: "Jack",
        value: 10,
        emote: "<:JackOfHearts:806743045747638274>"
    },
    {
        name: "Queen of Hearts",
        suit: "Heart",
        rank: "Queen",
        value: 10,
        emote: "<:QueenOfHearts:806743046510215168>"
    },
    {
        name: "King of Hearts",
        suit: "Heart",
        rank: "King",
        value: 10,
        emote: "<:KingOfHearts:806743046364332092>"
    },
    {
        name: "Ace of Diamonds",
        suit: "Diamond",
        rank: "Ace",
        value: 1,
        emote: "<:AceOfDiamonds:806743045714346044>"
    },
    {
        name: "Two of Diamonds",
        suit: "Diamond",
        rank: "Two",
        value: 2,
        emote: "<:TwoOfDiamonds:806743046607339531>"
    },
    {
        name: "Three of Diamonds",
        suit: "Diamond",
        rank: "Three",
        value: 3,
        emote: "<:ThreeOfDiamonds:806743046850609173>"
    },
    {
        name: "Four of Diamonds",
        suit: "Diamond",
        rank: "Four",
        value: 4,
        emote: "<:FourOfDiamonds:806743046099304478>"
    },
    {
        name: "Five of Diamonds",
        suit: "Diamond",
        rank: "Five",
        value: 5,
        emote: "<:FiveOfDiamonds:806743045789581375>"
    },
    {
        name: "Six of Diamonds",
        suit: "Diamond",
        rank: "Six",
        value: 6,
        emote: "<:SixOfDiamonds:806743046632767508>"
    },
    {
        name: "Seven of Diamonds",
        suit: "Diamond",
        rank: "Seven",
        value: 7,
        emote: "<:SevenOfDiamonds:806743046632505354>"
    },
    {
        name: "Eight of Diamonds",
        suit: "Diamond",
        rank: "Eight",
        value: 8,
        emote: "<:EightOfDiamonds:806743045776998420>"
    },
    {
        name: "Nine of Diamonds",
        suit: "Diamond",
        rank: "Nine",
        value: 9,
        emote: "<:NineOfDiamonds:806743046259343400>"
    },
    {
        name: "Ten of Diamonds",
        suit: "Diamond",
        rank: "Ten",
        value: 10,
        emote: "<:TenOfDiamonds:806743203516514324>"
    },
    {
        name: "Jack of Diamonds",
        suit: "Diamond",
        rank: "Jack",
        value: 10,
        emote: "<:JackOfDiamonds:806743046082527232>"
    },
    {
        name: "Queen of Diamonds",
        suit: "Diamond",
        rank: "Queen",
        value: 10,
        emote: "<:QueenOfDiamonds:806743046422528090>"
    },
    {
        name: "King of Diamonds",
        suit: "Diamond",
        rank: "King",
        value: 10,
        emote: "<:KingOfDiamonds:806743046246629396>"
    },
    {
        name: "Ace of Spades",
        suit: "Spade",
        rank: "Ace",
        value: 1,
        emote: "<:AceOfSpades:806743045315756043>"
    },
    {
        name: "Two of Spades",
        suit: "Spade",
        rank: "Two",
        value: 2,
        emote: "<:TwoOfSpades:806747182836613130>"
    },
    {
        name: "Three of Spades",
        suit: "Spade",
        rank: "Three",
        value: 3,
        emote: "<:ThreeOfSpades:806743046997278770>"
    },
    {
        name: "Four of Spades",
        suit: "Spade",
        rank: "Four",
        value: 4,
        emote: "<:FourOfSpades:806743046019350558>"
    },
    {
        name: "Five of Spades",
        suit: "Spade",
        rank: "Five",
        value: 5,
        emote: "<:FiveOfSpades:806743046112673872>"
    },
    {
        name: "Six of Spades",
        suit: "Spade",
        rank: "Six",
        value: 6,
        emote: "<:SixOfSpades:806743046661603338>"
    },
    {
        name: "Seven of Spades",
        suit: "Spade",
        rank: "Seven",
        value: 7,
        emote: "<:SevenOfSpades:806743046246105119>"
    },
    {
        name: "Eight of Spades",
        suit: "Spade",
        rank: "Eight",
        value: 8,
        emote: "<:EightOfSpades:806743045823135794>"
    },
    {
        name: "Nine of Spades",
        suit: "Spade",
        rank: "Nine",
        value: 9,
        emote: "<:NineOfSpades:806743046334185472>"
    },
    {
        name: "Ten of Spades",
        suit: "Spade",
        rank: "Ten",
        value: 10,
        emote: "<:TenOfSpades:806743046930300948>"
    },
    {
        name: "Jack of Spades",
        suit: "Spade",
        rank: "Jack",
        value: 10,
        emote: "<:JackOfSpades:806743046107430943>"
    },
    {
        name: "Queen of Spades",
        suit: "Spade",
        rank: "Queen",
        value: 10,
        emote: "<:QueenOfSpades:806743046502875166>"
    },
    {
        name: "King of Spades",
        suit: "Spade",
        rank: "King",
        value: 10,
        emote: "<:KingOfSpades:806743045935595552>"
    },
    {
        name: "Ace of Clubs",
        suit: "Club",
        rank: "Ace",
        value: 1,
        emote: "<:AceOfClubs:806743045722210324>"
    },
    {
        name: "Two of Clubs",
        suit: "Club",
        rank: "Two",
        value: 2,
        emote: "<:TwoOfClubs:806743046594756620>"
    },
    {
        name: "Three of Clubs",
        suit: "Club",
        rank: "Three",
        value: 3,
        emote: "<:ThreeOfClubs:806743046947209216>"
    },
    {
        name: "Four of Clubs",
        suit: "Club",
        rank: "Four",
        value: 4,
        emote: "<:FourOfClubs:806743045903089685>"
    },
    {
        name: "Five of Clubs",
        suit: "Club",
        rank: "Five",
        value: 5,
        emote: "<:FiveOfClubs:806743045797445642>"
    },
    {
        name: "Six of Clubs",
        suit: "Club",
        rank: "Six",
        value: 6,
        emote: "<:SixOfClubs:806743046325796926>"
    },
    {
        name: "Seven of Clubs",
        suit: "Club",
        rank: "Seven",
        value: 7,
        emote: "<:SevenOfClubs:806743046561595392>"
    },
    {
        name: "Eight of Clubs",
        suit: "Club",
        rank: "Eight",
        value: 8,
        emote: "<:EightOfClubs:806743045730336790>"
    },
    {
        name: "Nine of Clubs",
        suit: "Club",
        rank: "Nine",
        value: 9,
        emote: "<:NineOfClubs:806743046326714378>"
    },
    {
        name: "Ten of Clubs",
        suit: "Club",
        rank: "Ten",
        value: 10,
        emote: "<:TenOfClubs:806743047051673640>"
    },
    {
        name: "Jack of Clubs",
        suit: "Club",
        rank: "Jack",
        value: 10,
        emote: "<:JackOfClubs:806743046065750016>"
    },
    {
        name: "Queen of Clubs",
        suit: "Club",
        rank: "Queen",
        value: 10,
        emote: "<:QueenOfClubs:806743046321471498>"
    },
    {
        name: "King of Clubs",
        suit: "Club",
        rank: "King",
        value: 10,
        emote: "<:KingOfClubs:806743045642911755>"
    }
]


module.exports = {cards}