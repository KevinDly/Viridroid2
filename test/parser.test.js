const assert = require('chai').assert
const getOptions = require('../parser.js').getOptions
const parse = require('../parser.js').parse
const stripQuotes = require('../parser.js').stripQuotes

const testDataLocation = './test/testdata/commandlist.test.json'
describe("parser.js", function () {
    describe("getOptions()", function () {
        const oneOption = ['-s']

        const pollCommand = 'poll'
        const blackjackCommand = 'blackjack'


        describe("errors", function () {

            const oneOptionNoModifier = ['-t']
            const optionDoesntExist = ['-kd']
            const oneRealOptionOneFake = ['-t', "exists", '-kd']
            const twoRealDuplicates = ['-s', '-s']

            it('should throw error when too many modifiers', function () {
                assert.throws(() => getOptions(pollCommand, oneOptionNoModifier, testDataLocation), Error, /Too many options/)
            })
            it('should throw error when option does not exist', function () {
                assert.throws(() => getOptions(pollCommand, optionDoesntExist, testDataLocation), Error, /No such option/)
            })
            it('should throw error when one option doesn\'t exist and one does', function () {
                assert.throws(() => getOptions(pollCommand, oneRealOptionOneFake, testDataLocation), Error, /No such option/)
            })
            it('should throw error when a token that starts with - is given as a modifier', function () {
                assert.throws(() => getOptions(pollCommand, twoRealDuplicates, testDataLocation), Error, /Duplicate option/)
            })
            it('should throw error if an invalid or non-existant file location is given', function () {
                assert.throws(() => getOptions(pollCommand, oneOptionNoModifier, './test/testdata/fake.json'))
            })
            it('should throw an error if a non-json file is given', function () {
                assert.throws(() => getOptions(pollCommand, oneOptionNoModifier, './test/testdata/notajson.txt'))
            })
        })

        describe("intended returns", function () {
            describe("basics", function () {
                it('should return empty array if command does not have options', function () {
                    assert.deepEqual(getOptions(blackjackCommand, [], testDataLocation)["tokens"], [])
                })
                it('should return an object if command does have options', function () {
                    assert.isObject(getOptions(pollCommand, oneOption, testDataLocation))
                })
            })

            describe("option with 0 modifiers", function () {
                const oneOptionOtherParameters = ['-s', 'hello', 'how are you']
                const oneOptionAtEnd = ['how are you', 'hello', '-s']
                const objectEmpty = {
                    "-s": [],
                    "tokens": []
                }
                const objectOrder1 = {
                    "-s": [],
                    "tokens": ['hello', 'how are you']
                }
                const objectOrder2 = {
                    "-s": [],
                    "tokens": ['how are you', 'hello']
                }

                it('should give empty list when -s is passed', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOption, testDataLocation), objectEmpty)
                })
                it('should give empty list when -s is passed, even if other modifiers exist', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOptionOtherParameters, testDataLocation), objectOrder1)
                })
                it('should give empty list when -s is passed, even if other modifiers exist, regardless of order', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOptionAtEnd, testDataLocation), objectOrder2)
                })
            })

            describe("option with 1 modifier", function () {
                const oneOptionOneModifier = ['-t', "expected"]
                const oneOptionTwoModifier = ['-t', "expected", "unexpected"]

                const tokenWithQuotes = ['-t', '"quotes"']
                const withoutQuotes = {
                    '-t': ['quotes'],
                    "tokens": []
                }

                it('should give list of size 1 when -t and "expected" are passed', function () {
                    assert.equal(getOptions(pollCommand, oneOptionOneModifier, testDataLocation)['-t'].length, 1)
                })
                it('should give list with "expected" when -t and "expected" are passed', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOptionOneModifier, testDataLocation)['-t'], ["expected"])
                })
                it('should give list of size 1 when -t and two other strings are passed', function () {
                    assert.equal(getOptions(pollCommand, oneOptionTwoModifier, testDataLocation)['-t'].length, 1)
                })
                it('should give list with "expected" when -t and two other strings are passed', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOptionTwoModifier, testDataLocation)['-t'], ["expected"])
                })
                it('should give list with "expected" when -t and two other strings are passed', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOptionTwoModifier, testDataLocation)['-t'], ["expected"])
                })
                it('should strip quotes from words if they are included in command options', function () {
                    assert.deepEqual(getOptions(pollCommand, tokenWithQuotes, testDataLocation), withoutQuotes)
                })
            })

            describe("multiple options all correct, each option with 1 or less modifer", function () {
                const twoOptionsAllCorrect = ['-s', '-t', 'expected']

                const twoOptionsCorrectOutput = {
                    '-s': [],
                    '-t': ['expected'],
                    'tokens': []
                }

                it('should return correct object with both options correctly input', function () {
                    assert.deepEqual(getOptions(pollCommand, twoOptionsAllCorrect, testDataLocation), twoOptionsCorrectOutput)
                })
            })

            describe("options with greater than 1 modifier", function () {
                const fiveModifiersCommand = "faketestcommand"
                const fiveModifiersGiven = ["-l", "hello", "goodbye", "whats up", "danke schon", "kikkeriki!!"]
                const sevenModifiersGiven = ["-l", "hello", "goodbye", "whats up", "danke schon", "kikkeriki!!", "humuhumu", "big ups!"]
                const twoOptions = ["-l", "hello", "goodbye", "whats up", "danke schon", "kikkeriki!!", '-kl', 'humuhumu', "big ups!"]

                const correctObject = {
                    "-l": ["hello", "goodbye", "whats up", "danke schon", "kikkeriki!!"],
                    "tokens": []
                }

                const correctObjectWithTokens = {
                    "-l": ["hello", "goodbye", "whats up", "danke schon", "kikkeriki!!"],
                    "tokens": ['humuhumu', "big ups!"]
                }

                const correctObjectWithTwo = {
                    '-l': ["hello", "goodbye", "whats up", "danke schon", "kikkeriki!!"],
                    '-kl': ['humuhumu', "big ups!"],
                    "tokens": []
                }

                const fiveModifiersObject = getOptions(fiveModifiersCommand, fiveModifiersGiven, testDataLocation)
                const sevenModifierObject = getOptions(fiveModifiersCommand, sevenModifiersGiven, testDataLocation)
                const twoObjects = getOptions(fiveModifiersCommand, twoOptions, testDataLocation)

                it("should return an object if correct amount of modifiers are given", function () {
                    assert.isObject(fiveModifiersObject)
                })
                it("should have the object property '-l'", function () {
                    assert.isTrue(fiveModifiersObject.hasOwnProperty("-l"))
                })
                it("should return an object with 5 tokens", function () {
                    assert.equal(fiveModifiersObject["-l"].length, 5)
                })
                it("should return an object with a key -l and an array with the 5 correct tokens", function () {
                    assert.deepEqual(fiveModifiersObject, correctObject)
                })

                it("should return an object if more than required modifiers are given", function () {
                    assert.isObject(sevenModifierObject)
                })
                it("should return an object with 5 tokens, even if 7 are given", function () {
                    assert.equal(sevenModifierObject["-l"].length, 5)
                })
                it("should return an object with a key -l and an array with the 5 correct tokens, even if 7 are given", function () {
                    assert.deepEqual(sevenModifierObject, correctObjectWithTokens)
                })

                it("should return an object if correct modifiers for multiple options are given", function () {
                    assert.isObject(twoObjects)
                })
                it("should have an object property '-l'", function () {
                    assert.isTrue(twoObjects.hasOwnProperty('-l'))
                })
                it("should have an object property '-kl'", function () {
                    assert.isTrue(twoObjects.hasOwnProperty('-kl'))
                })
                it("should have object with two keys, each with their own array of tokens", function () {
                    assert.deepEqual(twoObjects, correctObjectWithTwo)
                })
                
            })

        })


    })

    describe("parse()", function () {
        describe("single words", function () {

            const list = ['hello', 'goodbye', 'how']
            const quotedList = ['"hello"', '"goodbye"', '"how"']

            const weirdQuotes = ['quote"']
            const weirdQuotesFull = ['"quote""']

            it("should return an empty list if given an empty list", function () {
                assert.deepEqual(parse([]), [])
            })
            it("should return a list of words, who are all surrounded by quotes", function () {
                assert.deepEqual(parse(list), quotedList)
            })
            it("should return a list of words, surrounded by quotes, even if the original words had quotes", function () {
                assert.deepEqual(parse(quotedList), quotedList)
            })
            it("should give a list with one word that has two quotes at the end and one at the beginning", function () {
                assert.deepEqual(parse(weirdQuotes), weirdQuotesFull)
            })
        })

        describe("options", function () {
            const singularOptionList = ['-s']
            const optionAndToken = ['-s', 'hello']
            const optionAndTokenCorrect = ['-s', '"hello"']
            const optionWithQuotes = ['-s', '"-s"']

            it("should return an array with the option not in quotes", function () {
                assert.deepEqual(parse(singularOptionList), singularOptionList)
            })

            it("should return an array with a token and option, if given a token and option", function () {
                assert.deepEqual(parse(optionAndToken), optionAndTokenCorrect)
            })

            it("should return an array with token and option, even if the token is an option in quotes", function () {
                assert.deepEqual(parse(optionWithQuotes), optionWithQuotes)
            })
        })

        describe("phrases", function () {
            const fullSplitPhrase = ['"this', 'should', 'be', 'phrased"']
            const fullPhrase = ['"this should be phrased"']

            const splitPhraseWithWords = ['"this', 'should', 'have"', 'phrase']
            const fullSplitPhraseWithWords = ['"this should have"', '"phrase"']

            const phraseWithQuotes = ['"this', 'phrase', '"is', 'phrased\\\"', 'correctly"']
            const fullPhraseWithQuotes = ['"this phrase "is phrased" correctly"']

            const twoPhrases = ['"phrase', 'one', 'sucks"', '"phrase', 'two', 'rules"']
            const fullTwoPhrases = ['"phrase one sucks"', '"phrase two rules"']
            it("should return a full phrase", function () {
                assert.deepEqual(parse(fullSplitPhrase), fullPhrase)
            })

            it("should return a full phrase and a word, all surrounded with quotes", function () {
                assert.deepEqual(parse(splitPhraseWithWords), fullSplitPhraseWithWords)
            })

            it("should replace \\\" only if it exists at the end of a word", function () {
                assert.deepEqual(parse(phraseWithQuotes), fullPhraseWithQuotes)
            })

            it("should give two phrases if two are given", function () {
                assert.deepEqual(parse(twoPhrases), fullTwoPhrases)
            })
        })

        describe("mixed phrases, options, and words", function () {
            const optionsPhrasesAndWords = ['-t', 'worded', '"what', 'is', 'up"']
            const fullOPAW = ['-t', '"worded"', '"what is up"']

            const moreOptionsPhrasesWords = ['-t', '-s', '"-s"', 'explain', '"time', 'to', 'throw"', '"pogchamp"']
            const fullMOPW = ['-t', '-s', '"-s"', '"explain"', '"time to throw"', '"pogchamp"']

            const trickiestWordArray = ['-t', '-t\\\"', '-s', '"-o"', '"one', 'option', 'is', '"-o', '-t', 'and', '-l\\\"', 'all', 'cool"', '"right?"', 'right!']
            const fullTrick = ['-t', '-t\\\"', '-s', '"-o"', '"one option is "-o -t and -l" all cool"', '"right?"', '"right!"']
            it("should give an array with the correct options, words, and phrases", function () {
                assert.deepEqual(parse(optionsPhrasesAndWords), fullOPAW)
            })

            it("should give another array with trickier options, words, and phrases", function () {
                assert.deepEqual(parse(moreOptionsPhrasesWords), fullMOPW)
            })

            it('should give an array with the trickiest options, including \\\", phrases, words, options, and options with \\\"', function () {
                assert.deepEqual(parse(trickiestWordArray), fullTrick)
            })
        })

    })

    describe("stripQuotes()", function () {
        const oneWordQuoted = ['"hello"']
        const oneWord = ['hello']
        it("should remove quotes if the quotes are at the beginning and end", function () {
            assert.deepEqual(stripQuotes(oneWordQuoted), oneWord)
        })

        const multipleQuotedWords = ['"hello"', '"goodbye"', '"yes"', '"no"']
        const multipleWords = ['hello', 'goodbye', 'yes', 'no']

        it("should remove quotes from all words in a list that all have quotes", function () {
            assert.deepEqual(stripQuotes(multipleQuotedWords), multipleWords)
        })

        it("should keep words that have no quotes at the end the same", function () {
            assert.deepEqual(stripQuotes(multipleWords), multipleWords)
        })

        const oneQuotePerWord = ['"hello', 'goodbye"']
        it("should not strip quotes if there is only one quote at the beginning or the end of a word", function () {
            assert.deepEqual(stripQuotes(oneQuotePerWord), oneQuotePerWord)
        })

        const doublyQuoted = ['""hello""', '""yo""']
        const singlyQuoted = ['"hello"', '"yo"']
        it("should not strip more than one pair of quotes from the list", function () {
            assert.deepEqual(stripQuotes(doublyQuoted), singlyQuoted)
        })

        const mixedTests = ['hello', '"how"', 'are you', '"are you good?"', 'thats"', '"great', '""-t""']
        const mixedTestsQuotesRemoved = ['hello', 'how', 'are you', 'are you good?', 'thats"', '"great', '"-t"']
        it("should be able to strip quotes from a tricky set of mixed words and phrases", function () {
            assert.deepEqual(stripQuotes(mixedTests), mixedTestsQuotesRemoved)
        })
    })

    describe("parse and getOptions integration test", function () {
        describe("basic inputs", function () {
            const inputArray = ['400']

            var tokens = parse(inputArray)
            var optionObject = getOptions("blackjack", tokens, testDataLocation)

            it("should just return an empty array", function () {
                assert.deepEqual(optionObject, {
                    "tokens": []
                })
            })

            const optionsInputArray = ['-s', '400']
            const outputObject = {
                "-s": [],
                "tokens": ['"400"']
            }

            var tokens2 = parse(optionsInputArray)
            var optionsObject2 = getOptions("poll", tokens2, testDataLocation)

            it("should return an object with a token and an array", function () {
                assert.deepEqual(optionsObject2, outputObject)
            })
        })

        describe("complex command inputs (options and phrases/words)", function () {
            const inputArray = ['-s', '-t', '500', '"Hello,', 'how', 'are,', 'you?"', '"Very,', 'good!"', 'No']
            const pollObject = {
                '-s': [],
                '-t': ['500'],
                'tokens': ['"Hello, how are, you?"', '"Very, good!"', '"No"']
            }

            var tokens = parse(inputArray)
            var optionsObject = getOptions('poll', tokens, testDataLocation)

            it("should return an object with three tags, two of which are options, one of which has an array with 1 thing, a third option with tokens", function () {
                assert.deepEqual(optionsObject, pollObject)
            })
        })
    })
})

