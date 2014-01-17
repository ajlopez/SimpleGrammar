
var simplegrammar = require('..');

// get function

var get = simplegrammar.get;

exports['createParser function'] = function (test) {
    test.ok(simplegrammar.createParser);
    test.equal(typeof simplegrammar.createParser, "function");
}

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
    get('SimpleTerm', '.', 'Name').generate('SimpleTerm', function (values) { return new DotExpression(values[0], values[2].name); }),
    get('SimpleTerm', '[', 'Expression', ']').generate('SimpleTerm'),
    get('SimpleTerm').generate('Term'),
    get('Term').generate('Expression0'),
    get('Expression0', 'Operator0', 'Term').generate('Expression0', function (values) { return createBinaryExpression(values[0], values[1], values[2]); }),
    get('Expression0').generate('Expression1'),
    get('Expression1', 'Operator1', 'Expression0').generate('Expression1', function (values) { return createBinaryExpression(values[0], values[1], values[2]); }),
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

exports['Parse simple string'] = function (test) {
    var parser = simplegrammar.createParser('"foo"', rules);
    var result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string in single quotes'] = function (test) {
    var parser = simplegrammar.createParser("'foo'", rules);
    var result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string in single quotes with escape single quote'] = function (test) {
    var parser = simplegrammar.createParser("'foo\\\'bar'", rules);
    var result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo\'bar');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string in double quotes with escape single quote'] = function (test) {
    var parser = simplegrammar.createParser('"foo\\"bar"', rules);
    var result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo"bar');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string with special characters'] = function (test) {
    var parser = simplegrammar.createParser("'foo\\t\\n\\rbar'", rules);
    var result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo\t\n\rbar');

    test.equal(parser.parse('String'), null);
}

exports['Parse integer'] = function (test) {
    var parser = simplegrammar.createParser('123', rules);
    var result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer with spaces'] = function (test) {
    var parser = simplegrammar.createParser('  123   ', rules);
    var result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer with spaces, tabs, carriage returns, and new lines'] = function (test) {
    var parser = simplegrammar.createParser('  \t\r123\n\r\t   ', rules);
    var result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer line comments'] = function (test) {
    var parser = simplegrammar.createParser('  # a comment\r\n123  # another comment\r\n', rules);
    var result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer as term'] = function (test) {
    var parser = simplegrammar.createParser('123', rules);
    var result = parser.parse('Term');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);
}

exports['Parse integer as expression'] = function (test) {
    var parser = simplegrammar.createParser('123', rules);
    var result = parser.parse('Expression');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);
}

exports['Parse integer + name as expression'] = function (test) {
    var parser = simplegrammar.createParser('123+name', rules);
    var result = parser.parse('Expression');
    test.ok(result);
    test.ok(result.value instanceof BinaryExpression);
    test.ok(result.value.left instanceof ConstantExpression);
    test.ok(result.value.right instanceof NameExpression);
    test.equal(result.value.oper, '+');

    test.equal(parser.parse('Expression'), null);
}

exports['Parse integer + name as expression with spaces, tabs, new lines'] = function (test) {
    var parser = simplegrammar.createParser('  123  \n  +  \rname', rules);
    var result = parser.parse('Expression');
    test.ok(result);
    test.ok(result.value instanceof BinaryExpression);
    test.ok(result.value.left instanceof ConstantExpression);
    test.ok(result.value.right instanceof NameExpression);
    test.equal(result.value.oper, '+');

    test.equal(parser.parse('Expression'), null);
}

exports['Parse name.name as simple term'] = function (test) {
    var parser = simplegrammar.createParser('foo.bar', rules);
    var result = parser.parse('SimpleTerm');
    test.ok(result);
    test.ok(result.value instanceof DotExpression);
    test.ok(result.value.expression instanceof NameExpression);
    test.equal(result.value.name, 'bar');

    test.equal(parser.parse('SimpleTerm'), null);
}

exports['Parse name.name.name as simple term'] = function (test) {
    var parser = simplegrammar.createParser('my.foo.bar', rules);
    var result = parser.parse('SimpleTerm');
    test.ok(result);
    test.ok(result.value instanceof DotExpression);
    test.ok(result.value.expression instanceof DotExpression);
    test.equal(result.value.name, 'bar');

    test.equal(parser.parse('SimpleTerm'), null);
}

exports['Push and retrieve items'] = function (test) {
    var parser = simplegrammar.createParser('', []);
    
    parser.push(['if', { name: 'Expression', value: 1 }, 'else', { name: 'Expression', value: 2 }]);
    
    var result = parser.next();
    test.ok(result);
    test.equal(result, 'if');
    
    result = parser.next();
    test.ok(result);
    test.equal(result.name, 'Expression');
    test.equal(result.value, 1);
    
    result = parser.next();
    test.ok(result);
    test.equal(result, 'else');
    
    result = parser.next();
    test.ok(result);
    test.equal(result.name, 'Expression');
    test.equal(result.value, 2);
}