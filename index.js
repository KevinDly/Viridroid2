const Discord = require('discord.js');
const Constants = require('constants.js');
const Parse = require('parser.js');
const client = new Discord.Client();

client.login(Constants.LOGIN_TOKEN);

//TODO: Create scheduler to schedule periodic point updates.

client.on('message', msg => {
	/*1. Parse msg to check for correctness
	2. Run command on table of functions*/
	var tokens = Parse.parse(msg);
	var isCommand = Parse.checkPrefix(tokens[0]);
});