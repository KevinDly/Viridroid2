const assert = require('chai').assert
const getOptions = require('../parser.js').getOptions

const testDataLocation = './test/testdata/commandlist.test.json'
describe("parser.js", function () {
    describe("getOptions()", function () {
        const oneOption = ['-s']

        const pollCommand = 'poll'
        const blackjackCommand = 'blackjack'


        describe("intended errors", function () {

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
        })

        describe("intended returns", function () {
            describe("basics", function () {
                it('should return empty array if command does not have options', function () {
                    assert.deepEqual(getOptions(blackjackCommand, [], testDataLocation), [])
                })
                it('should return an object if command does have options', function () {
                    assert.isObject(getOptions(pollCommand, oneOption, testDataLocation))
                })
            })

            describe("option with 0 modifiers", function () {
                const oneOptionOtherParameters = ['-s', 'hello', 'how are you']
                const oneOptionAtEnd = ['how are you', 'hello', '-s']

                it('should give empty list when -s is passed', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOption, testDataLocation)['-s'], [])
                })
                it('should give empty list when -s is passed, even if other modifiers exist', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOptionOtherParameters, testDataLocation)['-s'], [])
                })
                it('should give empty list when -s is passed, even if other modifiers exist, regardless of order', function () {
                    assert.deepEqual(getOptions(pollCommand, oneOptionAtEnd, testDataLocation)['-s'], [])
                })
            })

            describe("option with 1 modifier", function () {
                const oneOptionOneModifier = ['-t', "expected"]
                const oneOptionTwoModifier = ['-t', "expected", "unexpected"]

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
            })

            describe("multiple options all correct, each option with 1 or less modifer", function () {
                const twoOptionsAllCorrect = ['-s', '-t', 'expected']

                const twoOptionsCorrectOutput = {
                    '-s': [],
                    '-t': ['expected']
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
                    "-l": ["hello", "goodbye", "whats up", "danke schon", "kikkeriki!!"]
                }

                const correctObjectWithTwo = {
                    '-l': ["hello", "goodbye", "whats up", "danke schon", "kikkeriki!!"],
                    '-kl': ['humuhumu', "big ups!"]
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
                    assert.deepEqual(sevenModifierObject, correctObject)
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
})