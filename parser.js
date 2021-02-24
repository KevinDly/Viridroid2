// JavaScript source code
const config = require('config')
const fs = require('fs')

//Parses line into correct tokens.
//Puts quotations together.

//TODO: Replace the quotations with empty char when putting quote in array.
//TODO: Check for \" when looking at the end.

function getOptions(command, tokens, commandsLocation = './config/commandlist.json') {
	let variableData = fs.readFileSync(commandsLocation)
	let parsedData = JSON.parse(variableData)

	var commandObj = parsedData["Commands"]

	//Check if the command is not in the list OR if the command has no options.
	if (!commandObj.hasOwnProperty(command) || !commandObj[command].hasOwnProperty("options"))
		return [];
	else 
		commandObj = parsedData["Commands"][command]["options"]

	var optionsList = {}

	var maxTokens = -1
	var count = -1
	var optionName = ''

	//Loops through tokens to see if options and their required modifiers are correct.
	tokens.forEach(function (token, index) {
		if (token.startsWith('-')) {

			//Don't allow -[a-zA-Z0-9] to be allowed in option modifiers.
			if (optionName != '')
				throw new Error(`Option given: ${token} is not allowed for ${optionName}`)

			//Check if the option even exists, if not throw away entire command.
			if (!commandObj.hasOwnProperty(token))
				throw new Error(`No such option: ${token}`)

			var numTokens = commandObj[token]

			//Check if too few options are given, exceeds amount of tokens there are.
			if (index + 1 + numTokens > tokens.length)
				throw new Error(`Too many options for: ${token}, requires ${numTokens}`)

			var optionModifiers = []

			//Check current option requires 1 or more token.
			if (numTokens != 0) {
				maxTokens = numTokens
				count = 0
				optionName = token
			}

			//Set list of tokens appropriately.
			if (optionsList.hasOwnProperty(token)) {
				throw new Error(`Duplicate option: ${ token } given`)
			}

			optionsList[token] = optionModifiers
		}
		else if (optionName != '') {
			optionsList[optionName].push(token)
			count++

			if(count >= maxTokens) {
				maxTokens = -1
				count = -1
				optionName = ''
            }
        }
	})

	return optionsList
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

module.exports = { parse, checkPrefix, getOptions };