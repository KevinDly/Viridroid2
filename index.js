const Discord = require('discord.js')
const Constants = require('./constants.js')
const Parse = require('./parser.js')
const Commands = require('./commands.js')
const Enmap = require('enmap')
const Util = require('./util.js')
const config = require('config')
const fs = require('fs')

let tokendata = fs.readFileSync('./config/token.json')
let token = JSON.parse(tokendata).token

const client = new Discord.Client()

//https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584
//TODO: Create scheduler to schedule periodic point updates.
//TODO: Get collection of all guilds

//Create function to get the userEnmapInfo
client.isLoaded = false

//Add lambada function
async function iterate(data, callback) {
	client.guilds.cache.forEach(function (guild, key) {
		//Iterate through all members in the guild the client is currently looking at.
		guild.members.cache.forEach(function (member) {
			//Check if member is a bot
			callback(guild, member, data)
		})
	})
}

async function getUserInfo() {
	var promise = new Promise(async function (resolve, reject) {
		try {
			var result;

			//Check if data is trying to be loaded again
			//On first load ever load from persistant storage, on subsequent calls load from client.userData
			if (!client.isLoaded) {
				result = new Enmap({ name: 'userdata' })

				//Grabbing data
				await result.defer

				//Iterate through all guilds the client is currently in
				await iterate(result, function (guild, member, data) {
					var guildID = guild.id
					var memberID = member.id
					if (!member.user.bot) {
						var memberID = member.id
						data.ensure(`${guildID} - ${memberID}`, {
							member: memberID,
							guild: guildID,
							points: 0
						})
					}
				})

				client.userData = result;
				client.isLoaded = true
			}
			else {
				result = client.userData
			}
			resolve(result)
		}
		catch (err) {
			reject(err)
        }

	});

	return promise
}

function awardPoints(guild, member, data) {
	var guildID = guild.id
	var memberID = member.id
	var dataKey = `${guildID} - ${memberID}`
	if (!member.user.bot) {
		var memberID = member.id
		data.ensure(dataKey, {
			member: memberID,
			guild: guildID,
			points: 0
		})
		console.log("Awarding points")
		data.math(dataKey, "+", config.get('Points.pointsAwarded'), "points")
	}
}

client.login(token)

client.on('ready', async () => {
	//Iterate through all servers and users and check client.points.
	await getUserInfo()

	getUserInfo().then(function (result) {
		setInterval(function () {
			iterate(result, awardPoints)
		}, Util.minutesToMili(config.get('Points.timePerAward')))
	})
	
	console.log("Ready")
});

client.on('message', async (msg) => {
	/*1. Parse msg to check for correctness
	2. Run command on table of functions*/
	//Check if user is a bot
	if (msg.member.user.bot)
		return

	//Parse commands
	var tokens = msg.content.split(" ")

	//Grab the command
	var command = tokens[0]

	//Remove the command from the list of tokens
	tokens.shift()

	//Check if command is valid
	if (Parse.checkPrefix(command) == true) {
		command = command.replace(config.get('prefix'), "")
		tokens = Parse.parse(tokens)
		//Check against command list.
		//Check table of functions

		try {
			//Commands[command](msg, tokens, data)
			getUserInfo().then((result) => {
				console.log("Initiating command: " + command)
				if(tokens.length >= 1)
					console.log("With Parameter(s): " + tokens)
				Commands[command](msg, tokens, result)
            }).catch((error) => console.log(error))
			console.log(Constants.COMMAND_SUCCESS_MESSAGE)
		}
		catch (err) {
			//incorrect command message
			console.log(err)
			console.log(Constants.COMMAND_FAILURE_MESSAGE)

		}
	}
});

process.on('exit', () => {
	client.destroy()
});

module.exports = { config }