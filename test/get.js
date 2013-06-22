
var simpleparser = require('..'),
    assert = require('assert');
    
// get function

assert.ok(simpleparser);
assert.ok(simpleparser.get);
assert.equal(typeof simpleparser.get, "function");

var get = simpleparser.get;

// parse a character

var rule = get('a');

assert.ok(rule.process('a'));
assert.equal(rule.process('a'), 'a');
assert.equal(rule.process('b'), null);

// parse two characters

var rule = get('a').and('b');

var result = rule.process('ab');
assert.ok(result);
assert.equal(result, 'ab');

assert.equal(rule.process('a'), null);
assert.equal(rule.process('aa'), null);
assert.equal(rule.process('ba'), null);
assert.equal(rule.process('bb'), null);

// parse two characters as arguments

var rule = get('a', 'b');

var result = rule.process('ab');
assert.ok(result);
assert.equal(result, 'ab');

assert.equal(rule.process('a'), null);
assert.equal(rule.process('aa'), null);
assert.equal(rule.process('ba'), null);
assert.equal(rule.process('bb'), null);

// parse two characters as alternatives

var rule = get('a').or('b');

var result = rule.process('a');
assert.ok(result);
assert.equal(result, 'a');

var result = rule.process('b');
assert.ok(result);
assert.equal(result, 'b');

assert.equal(rule.process('c'), null);
assert.equal(rule.process('d'), null);

// parse two characters as alternatives using array argument

var rule = get(['a', 'b']);

var result = rule.process('a');
assert.ok(result);
assert.equal(result, 'a');

var result = rule.process('b');
assert.ok(result);
assert.equal(result, 'b');

assert.equal(rule.process('c'), null);
assert.equal(rule.process('d'), null);

// parse character range

var rule = get('a-z');

assert.ok(rule.process('a'));
assert.equal(rule.process('a'), 'a');
assert.ok(rule.process('b'));
assert.equal(rule.process('b'), 'b');
assert.ok(rule.process('z'));
assert.equal(rule.process('z'), 'z');

assert.equal(rule.process('A'), null);
assert.equal(rule.process('Z'), null);

// parse letter

var rule = get(['a-z', 'A-Z']);

assert.ok(rule.process('a'));
assert.equal(rule.process('a'), 'a');
assert.ok(rule.process('b'));
assert.equal(rule.process('b'), 'b');
assert.ok(rule.process('z'));
assert.equal(rule.process('z'), 'z');
assert.ok(rule.process('A'));
assert.equal(rule.process('A'), 'A');
assert.ok(rule.process('B'));
assert.equal(rule.process('B'), 'B');
assert.ok(rule.process('Z'));
assert.equal(rule.process('Z'), 'Z');

assert.equal(rule.process('0'), null);
assert.equal(rule.process('9'), null);

// parse word

var rule = get(['a-z', 'A-Z']).oneOrMore();

assert.ok(rule.process('abc'));
assert.equal(rule.process('abc'), 'abc');
assert.ok(rule.process('Abc'));
assert.equal(rule.process('Abc'), 'Abc');

assert.equal(rule.process('0'), null);
assert.equal(rule.process('9'), null);

// parse word with underscore and digits

var rule = get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore());

assert.ok(rule.process('abc'));
assert.equal(rule.process('abc'), 'abc');
assert.ok(rule.process('Abc'));
assert.equal(rule.process('Abc'), 'Abc');

assert.equal(rule.process('_123'), '_123');
assert.equal(rule.process('a123'), 'a123');
assert.equal(rule.process('a_name'), 'a_name');

assert.equal(rule.process('0'), null);
assert.equal(rule.process('9'), null);
assert.equal(rule.process('123'), null);

