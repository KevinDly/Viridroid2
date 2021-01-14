// JavaScript source code
const config = require('config');

//Breaks function into a list of tokens.
function parse(line) {
	return line.split();
}

//Checks if the command has the correct prefix.
function checkPrefix(command) {
	if (command.startsWith(config.get('prefix')))
		return true;
	else
		return false;
}

module.exports = { parse, checkPrefix };