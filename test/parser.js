
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
    get('"').upTo('"', '\\', escape).generate('String', function (value) { return createConstant(value.substring(1, value.length - 1)); }),
    get("'").upTo("'", '\\', escape).generate('String', function (value) { return createConstant(value.substring(1, value.length - 1)); }),
    get('0-9').oneOrMore().generate('Integer', function (value) { return createConstant(parseInt(value)); }),
    get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore()).generate('Name', function (name) { return createName(name); }),
    get(['+','-']).generate('Operator0'),
    get(['*','/']).generate('Operator1'),
    get(['(',')','[',']','.']).generate('Punctuation'),
    get('Integer').generate('SimpleTerm'),
    get('Name').generate('SimpleTerm'),
    get('SimpleTerm', '.', 'Name').generate('SimpleTerm', function (values) { return new DotExpression(values[0].value, values[2].value.name); }),
    get('SimpleTerm', '[', 'Expression', ']').generate('SimpleTerm'),
    get('SimpleTerm').generate('Term'),
    get('Term').generate('Expression0'),
    get('Expression0', 'Operator0', 'Term').generate('Expression0', function (values) { return createBinaryExpression(values[0].value, values[1].value, values[2].value); }),
    get('Expression0').generate('Expression1'),
    get('Expression1', 'Operator1', 'Expression0').generate('Expression1', function (values) { return createBinaryExpression(values[0].value, values[1].value, values[2].value); }),
    get('Expression1').generate('Expression')
];

// escape character function

function escape(ch) {
    if (ch === 't')
        return '\t';
    if (ch === 'r')
        return '\r';
    if (ch === 'n')
        return '\n';

    return ch;
}

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

function DotExpression(expr, name) {
    this.expression = expr;
    this.name = name;
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

// Parse simple string in single quotes with escape single quote

var parser = simpleparser.createParser("'foo\\\'bar'", rules);
var result = parser.parse('String');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 'foo\'bar');

assert.equal(parser.parse('String'), null);

// Parse simple string in double quotes with escape single quote

var parser = simpleparser.createParser('"foo\\"bar"', rules);
var result = parser.parse('String');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 'foo"bar');

assert.equal(parser.parse('String'), null);

// Parse simple string with special characters

var parser = simpleparser.createParser("'foo\\t\\n\\rbar'", rules);
var result = parser.parse('String');
assert.ok(result);
assert.ok(result.value instanceof ConstantExpression);
assert.equal(result.value.value, 'foo\t\n\rbar');

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

// Parse integer + name as expression with spaces, tabs, new lines

var parser = simpleparser.createParser('  123  \n  +  \rname', rules);
var result = parser.parse('Expression');
assert.ok(result);
assert.ok(result.value instanceof BinaryExpression);
assert.ok(result.value.left instanceof ConstantExpression);
assert.ok(result.value.right instanceof NameExpression);
assert.equal(result.value.oper, '+');

assert.equal(parser.parse('Expression'), null);

// Parse name.name as simple term

var parser = simpleparser.createParser('foo.bar', rules);
var result = parser.parse('SimpleTerm');
assert.ok(result);
assert.ok(result.value instanceof DotExpression);
assert.ok(result.value.expression instanceof NameExpression);
assert.equal(result.value.name, 'bar');

assert.equal(parser.parse('SimpleTerm'), null);

// Parse name.name.name as simple term

var parser = simpleparser.createParser('my.foo.bar', rules);
var result = parser.parse('SimpleTerm');
assert.ok(result);
assert.ok(result.value instanceof DotExpression);
assert.ok(result.value.expression instanceof DotExpression);
assert.equal(result.value.name, 'bar');

assert.equal(parser.parse('SimpleTerm'), null);
