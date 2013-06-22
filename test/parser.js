
var simpleparser = require('..'),
    assert = require('assert');
    
// get function

var get = simpleparser.get;

// createParser function

assert.ok(simpleparser.createParser);
assert.equal(typeof simpleparser.createParser, "function");

// rules to use

var rules = [
    get([' ','\t','\r','\n']).oneOrMore().skip(),
    get('#').upTo('\n').skip(),
    get('"').upTo('"').generate('String', function (value) { return createConstant(value.substring(1, value.length - 1)); }),
    get("'").upTo("'").generate('String', function (value) { return createConstant(value.substring(1, value.length - 1)); }),
    get('0-9').oneOrMore().generate('Integer', function (value) { return createConstant(parseInt(value)); }),
    get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore()).generate('Name', function (name) { return createName(name); }),
    get(['+','-','*','/']).generate('Operator'),
    get(['(',')','[',']','.']).generate('Punctuation'),
    get('Integer').generate('Term'),
    get('Name').generate('Term'),
    get('Term', 'Operator', 'Term').generate('Expression', function (values) { return createBinaryExpression(values[0].value, values[1].value, values[2].value); }),
    get('Term').generate('Expression')
];

// factory functions

function createConstant(value) {
    return new ConstantExpression(value);
};

function createName(name) {
    return new NameExpression(name);
};

function createBinaryExpression(left, oper, right) {
    return new BinaryExpression(left, oper, right);
};

// Expressions

function ConstantExpression(value) {
    this.value = value;
}

function NameExpression(name) {
    this.name = name;
}

function BinaryExpression(left, oper, right) {
    this.left = left;
    this.oper = oper;
    this.right = right;
}

// Parse simple string

var parser = simpleparser.createParser('"foo"', rules);
var result = parser.parse('String');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 'foo');

assert.equal(parser.parse('String'), null);

// Parse simple string in single quotes

var parser = simpleparser.createParser("'foo'", rules);
var result = parser.parse('String');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 'foo');

assert.equal(parser.parse('String'), null);

// Parse integer

var parser = simpleparser.createParser('123', rules);
var result = parser.parse('Integer');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 123);

assert.equal(parser.parse('Integer'), null);

// Parse integer with spaces

var parser = simpleparser.createParser('  123   ', rules);
var result = parser.parse('Integer');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 123);

assert.equal(parser.parse('Integer'), null);

// Parse integer with spaces, tabs, carriage returns, and new lines

var parser = simpleparser.createParser('  \t\r123\n\r\t   ', rules);
var result = parser.parse('Integer');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 123);

assert.equal(parser.parse('Integer'), null);

// Parse integer line comments

var parser = simpleparser.createParser('  # a comment\r\n123  # another comment\r\n', rules);
var result = parser.parse('Integer');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 123);

assert.equal(parser.parse('Integer'), null);

// Parse integer as term

var parser = simpleparser.createParser('123', rules);
var result = parser.parse('Term');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 123);

// Parse integer as expression

var parser = simpleparser.createParser('123', rules);
var result = parser.parse('Expression');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 123);

// Parse integer + name as expression

var parser = simpleparser.createParser('123+name', rules);
var result = parser.parse('Expression');
assert.ok(result);
assert.ok(result.value instanceof BinaryExpression);
assert.ok(result.value.left instanceof ConstantExpression);
assert.ok(result.value.right instanceof NameExpression);
assert.equal(result.value.oper, '+');

assert.equal(parser.parse('Expression'), null);

