
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

// parse two characters

var parser = parse('a').and('b');

var result = parser.parse('ab');
assert.ok(result);
assert.equal(result, 'ab');

assert.equal(parser.parse('a'), null);
assert.equal(parser.parse('aa'), null);
assert.equal(parser.parse('ba'), null);
assert.equal(parser.parse('bb'), null);

// parse two characters as arguments

var parser = parse('a', 'b');

var result = parser.parse('ab');
assert.ok(result);
assert.equal(result, 'ab');

assert.equal(parser.parse('a'), null);
assert.equal(parser.parse('aa'), null);
assert.equal(parser.parse('ba'), null);
assert.equal(parser.parse('bb'), null);

// parse two characters as alternatives

var parser = parse('a').or('b');

var result = parser.parse('a');
assert.ok(result);
assert.equal(result, 'a');

var result = parser.parse('b');
assert.ok(result);
assert.equal(result, 'b');

assert.equal(parser.parse('c'), null);
assert.equal(parser.parse('d'), null);

// parse two characters as alternatives using array argument

var parser = parse(['a', 'b']);

var result = parser.parse('a');
assert.ok(result);
assert.equal(result, 'a');

var result = parser.parse('b');
assert.ok(result);
assert.equal(result, 'b');

assert.equal(parser.parse('c'), null);
assert.equal(parser.parse('d'), null);

// parse character range

var parser = parse('a-z');

assert.ok(parser.parse('a'));
assert.equal(parser.parse('a'), 'a');
assert.ok(parser.parse('b'));
assert.equal(parser.parse('b'), 'b');
assert.ok(parser.parse('z'));
assert.equal(parser.parse('z'), 'z');

assert.equal(parser.parse('A'), null);
assert.equal(parser.parse('Z'), null);

// parse letter

var parser = parse(['a-z', 'A-Z']);

assert.ok(parser.parse('a'));
assert.equal(parser.parse('a'), 'a');
assert.ok(parser.parse('b'));
assert.equal(parser.parse('b'), 'b');
assert.ok(parser.parse('z'));
assert.equal(parser.parse('z'), 'z');
assert.ok(parser.parse('A'));
assert.equal(parser.parse('A'), 'A');
assert.ok(parser.parse('B'));
assert.equal(parser.parse('B'), 'B');
assert.ok(parser.parse('Z'));
assert.equal(parser.parse('Z'), 'Z');

assert.equal(parser.parse('0'), null);
assert.equal(parser.parse('9'), null);


