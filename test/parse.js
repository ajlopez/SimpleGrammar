
var simpleparser = require('..'),
    assert = require('assert');
    
// parse function

assert.ok(simpleparser);
assert.ok(simpleparser.parse);
assert.equal(typeof simpleparser.parse, "function");

var parse = simpleparser.parse;

// parse a character

var parser = parse('a');

assert.ok(parser.parse('a'));
assert.equal(parser.parse('a'), 'a');
assert.equal(parser.parse('b'), null);

