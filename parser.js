// JavaScript source code
const config = require('config')
const fs = require('fs')

//Parses line into correct tokens.
//Puts quotations together.

//Strip a set of quotes from front and back of word if they have quotations around itself.
function stripQuotes(list) {
	var wordList = []

	list.forEach(word => {
		if (word.startsWith('"') && word.endsWith('"'))
			wordList.push(word.substring(1, word.length - 1))
		else
			wordList.push(word)
	})

	return wordList;
}

//Grab the options from a list of tokens, tokens, using command from the json file commandsLocation 
//
function getOptions(command, tokens, commandsLocation = './config/commandlist.json') {
	var variableData, parsedData;

	try {
		variableData = fs.readFileSync(commandsLocation)
	}
	catch (err) {
		throw err;
	}

	try {
		parsedData = JSON.parse(variableData);
	}
	catch (err) {
		throw err;
    }

	var commandObj = parsedData["Commands"]
	var tokenList = []
	//Check if the command is not in the list OR if the command has no options.
	if (!commandObj.hasOwnProperty(command) || !commandObj[command].hasOwnProperty("options"))
		return tokenList
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
			var toPush = token
			if (token.startsWith('"') && token.endsWith('"')) {
				toPush = token.substring(1, token.length - 1)
            }
			optionsList[optionName].push(toPush)
			count++

			if(count >= maxTokens) {
				maxTokens = -1
				count = -1
				optionName = ''
            }
		}
		else
			tokenList.push(token)
	})

	optionsList["tokens"] = tokenList
	return optionsList
}

//Should never replace \\\" with \" unless it is within a phrase.
function parse(command) {
	var tokenArray = []
	var word = ""
	for (var index in command) {
		var token = command[index]

		//Check if the token is a phrase.
		if (token === "\"\"") {
			console.log("invalid")
			continue;
		}

		//Check if token is an option
		if (token.startsWith("-") && word == "")
			tokenArray.push(token)
		//Check if the token is a phrase.
		else if (token.startsWith('"') && !(word != "") && (!token.endsWith('"') || token.length == 1)) {
			//If the token is the start of a phrase.
			word = word.concat(token)
		}
		else if (token.endsWith("\\\"")) {
			var newToken = token.replace("\\\"", '"')
			word = word.concat(" " + newToken)
		}
		else if (token.endsWith('"') && (word != "")) {
			//If the token is the end of a previously started phrase.
			word = word.concat(" " + token)
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
				tokenArray.push(token)
			}
			else if (token != "")
				tokenArray.push('"' + token + '"')
			//Check if the word is empty, shouldn't add.
		}
	}

	//Check if there is still a word in the array that hasnt finished
	//Generally means the user forgot to put a quotation.
	if (word != "")
		tokenArray.push(word + '"')

	return tokenArray
}

//Checks if the command has the correct prefix.
function checkPrefix(command) {
	if (command.startsWith(config.get('prefix')))
		return true;
	else
		return false;
}

module.exports = { parse, checkPrefix, getOptions, stripQuotes };