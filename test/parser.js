
var simpleparser = require('..'),
    assert = require('assert');
    
// get function

var get = simpleparser.get;

// createParser function

assert.ok(simpleparser.createParser);
assert.equal(typeof simpleparser.createParser, "function");

// rules to use

var rules = [
    get('0-9').oneOrMore().generate('Integer'),
    get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore()).generate('Name'),
    get(['+','-','*','/']).generate('Operator'),
    get(['(',')','[',']','.']).generate('Punctuation'),
    get('Integer').generate('Term'),
    get('Name').generate('Term'),
    get('Term', 'Operator', 'Term').generate('Expression'),
    get('Term').generate('Expression')
];

// Parse integer

var parser = simpleparser.createParser('123', rules);
var result = parser.parse('Integer');
assert.ok(result);
assert.equal(result.value, '123');

// Parse integer as term

var parser = simpleparser.createParser('123', rules);
var result = parser.parse('Term');
assert.ok(result);
assert.equal(result.value, '123');

// Parse integer as expression

var parser = simpleparser.createParser('123', rules);
var result = parser.parse('Expression');
assert.ok(result);
assert.equal(result.value, '123');
