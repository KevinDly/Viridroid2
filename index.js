const Discord = require('discord.js')
const Constants = require('./constants.js')
const Parse = require('./parser.js')
const Commands = require('./commands.js')
const Enmap = require('enmap')
const fs = require('fs')

const client = new Discord.Client()

/*BIG TODO: Write a promise that promises that the variable that holds the 
 * data for the user (in client.points) is secured.
 * After the promise is fufilled, run all the event handlers for client as normal.
 * https://stackoverflow.com/questions/48923024/node-js-wait-for-all-files-read-in-the-loop
 * Read more about promsify
 */
//TODO: Create scheduler to schedule periodic point updates.
//TODO: Get collection of all guilds

/*USE ENMAP OR SQLITE FOR DATABASE STORAGE*/

/*
 * Iterate through all guilds and all clients
 * Initalize an enmap into client.points
 * Store all into client.points
 * '${userid}-${serverid}':{
 *	serverid:
 *	userid:
 *	points:
 * }
 * Check for a client join every time and ensure points.
 *	client.on("playerjoin" or something)
 *	
 *
 */


//Create function to get the userEnmapInfo
client.isLoaded = false

async function iterate(result) {
	const data = result
	client.guilds.cache.forEach(function (guild, key) {
		//Iterate through all members in the guild the client is currently looking at.
		var guildID = guild.id;
		guild.members.cache.forEach(function (member) {
			//Check if member is a bot
			if (!member.user.bot) {
				var memberID = member.id
				data.ensure(`${guildID} - ${memberID}`, {
					member: memberID,
					guild: guildID,
					points: 0
				})
			}
		})
	})
}

async function getUserInfo() {
	var promise = new Promise(async function (resolve, reject) {
		try {
			var result;
			if (!client.isLoaded) {
				result = new Enmap({ name: 'userdata' })
				//Grabbing data
				await result.defer


				//Iterate through all guilds the client is currently in
				await iterate(result)

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

client.login(Constants.LOGIN_TOKEN)

client.on('ready', async () => {
	//Iterate through all servers and users and check client.points.
	await getUserInfo()
	console.log("Ready")


});

client.on('message', async (msg) => {
	/*1. Parse msg to check for correctness
	2. Run command on table of functions*/
	//Parse commands
	var tokens = Parse.parse(msg.content)
	var command = tokens[0]
	if (Parse.checkPrefix(tokens[0]) == true) {
		command = command.replace(Constants.COMMAND_PREFIX, "")
		//Check against command list.
		console.log("User attempted to use command: " + command)

		//Check table of functions
		try {
			Commands[command](msg, tokens)
			console.log(Constants.COMMAND_SUCCESS_MESSAGE)
		}
		catch (err) {
			//incorrect command message
			console.log(Constants.COMMAND_FAILURE_MESSAGE)
		}
	}
});

//Runs all the eventhandlers.


process.on('exit', () => {
	client.destroy()
});