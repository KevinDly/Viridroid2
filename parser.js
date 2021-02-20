// JavaScript source code
const config = require('config');

//Parses line into correct tokens.
//Puts quotations together.

//TODO: Replace the quotations with empty char when putting quote in array.
//TODO: Check for \" when looking at the end.

function getOptions(command, tokens) {
	let variableData = fs.readFileSync('./config/commandlist.json')
	let parsedData = JSON.parse(variableData)

	var commandObj = parsedData["Commands"]

	//Check if the command is not in the list OR if the command has no options.
	if (!commandObj.hasOwnProperty(command) || !commandObj[command].hasOwnProperty("options"))
		return [];
	else 
		commandObj = parsedData["Commands"][command][options]

	var optionsList = {}

	//Loops through tokens to see if options and their required modifiers are correct.
	for (var index in tokens) {
		var token = tokens[index]
		if (token.startsWith('-')) {

			//Check if the option even exists, if not throw away entire command.
			if (!commandObj.hasOwnProperty(token))
				throw `No such option: ${token}`

			var numTokens = commandObj[token]

			var i = 0;

			//Check if too few options are given, exceeds amount of tokens there are.
			if (index + 1 + numTokens > tokens.length)
				throw `Too many options for: ${token}, requires ${numTokens}`

			var optionModifiers = []
			for (i = index + 1; i < index + numTokens; i++) {
				optionModifiers.push(tokens[i])
			}

			//Set list of tokens appropriately.
			optionsList[token] = optionModifiers
        }
	}

	return optionsList;
}

function parse(command) {
	var tokenArray = []
	var word = ""
	for (var index in command) {
		var token = command[index]

		console.log("Token: " + token)
		//Check if the token is a phrase.
		if (token === "\"\"") {
			console.log("invalid")
			continue;
		}

		if (token.startsWith('"') && !(word != "") && (!token.endsWith('"') || token.length == 1)) {
			//If the token is the start of a phrase.
			word = word.concat(token)
		}
		else if (token.endsWith('"') && !token.endsWith("\\\"") && (word != "")) {
			//If the token is the end of a previously started phrase.
			var endToken = token.substring(0, token.length - 1)
			word = word.concat(" " + endToken)
			word = word.substring(1, word.length)
			word.replace("\\\"", "\"")
			tokenArray.push(word)
			word = ""
		}
		else if (word != "")
			//If the token is in a phrase.
			word = word.concat(" " + token)
		else {
			//If the token is not in a phrase, start of a phrase, or the end of a phrase.
			if (token.startsWith('"') && token.endsWith('"')) {
				token = token.substring(1, token.length - 1)
			}

			//Check if the word is empty, shouldn't add.
			if (token != "")
				tokenArray.push(token)
		}
	}

	//Check if there is still a word in the array that hasnt finished
	//Generally means the user forgot to put a quotation.
	if (word != "")
		tokenArray.push(word)

	console.log(tokenArray)
	return tokenArray
}

//Checks if the command has the correct prefix.
function checkPrefix(command) {
	if (command.startsWith(config.get('prefix')))
		return true;
	else
		return false;
}

module.exports = { parse, checkPrefix };