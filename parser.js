// JavaScript source code
const Constants = require('./constants.js');

//Breaks function into a list of tokens.
function parse(line) {
	return line.split();
}

//Checks if the command has the correct prefix.
function checkPrefix(command) {
	if (command.startsWith(Constants.COMMAND_PREFIX))
		return true;
	else
		return false;
}

module.exports = { parse, checkPrefix };