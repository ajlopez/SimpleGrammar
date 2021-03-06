
const simplegrammar = require('..');

// get function

const get = simplegrammar.get;

exports['createParser function'] = function (test) {
    test.ok(simplegrammar.createParser);
    test.equal(typeof simplegrammar.createParser, "function");
}

// rules to use

const rules = [
    get([' ','\t','\r','\n']).oneOrMore().skip(),
    get('#').upTo('\n').skip(),
    get('"').upTo('"', '\\', escape).generate('String', function (value) { return createConstant(value.substring(1, value.length - 1)); }),
    get("'").upTo("'", '\\', escape).generate('String', function (value) { return createConstant(value.substring(1, value.length - 1)); }),
    get('0-9').oneOrMore().generate('Integer', function (value) { return createConstant(parseInt(value)); }),
    get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore()).generate('Name', function (name) { return createName(name); }),
    get(['+','-']).generate('Operator0'),
    get(['*','/']).generate('Operator1'),
    get(['(',')','[',']','.']).generate('Punctuation'),
    get('==').generate('Equal'),
    get('=').generate('Assign'),
    get('Equal').generate('Operator'),
    get('Assign').generate('Operator'),
    get('Integer').generate('SimpleTerm'),
    get('Name').generate('SimpleTerm'),
    get('Name', 'Assign', 'Expression0').generate('Assignment'),
    get('Expression0', 'Equal', 'Expression0').generate('Expression'),
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
    const parser = simplegrammar.createParser('"foo"', rules);
    const result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string in single quotes'] = function (test) {
    const parser = simplegrammar.createParser("'foo'", rules);
    const result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string in single quotes with escape single quote'] = function (test) {
    const parser = simplegrammar.createParser("'foo\\\'bar'", rules);
    const result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo\'bar');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string in double quotes with escape single quote'] = function (test) {
    const parser = simplegrammar.createParser('"foo\\"bar"', rules);
    const result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo"bar');

    test.equal(parser.parse('String'), null);
}

exports['Parse simple string with special characters'] = function (test) {
    const parser = simplegrammar.createParser("'foo\\t\\n\\rbar'", rules);
    const result = parser.parse('String');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 'foo\t\n\rbar');

    test.equal(parser.parse('String'), null);
}

exports['Parse integer'] = function (test) {
    const parser = simplegrammar.createParser('123', rules);
    const result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer with spaces'] = function (test) {
    const parser = simplegrammar.createParser('  123   ', rules);
    const result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer with spaces, tabs, carriage returns, and new lines'] = function (test) {
    const parser = simplegrammar.createParser('  \t\r123\n\r\t   ', rules);
    const result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer line comments'] = function (test) {
    const parser = simplegrammar.createParser('  # a comment\r\n123  # another comment\r\n', rules);
    const result = parser.parse('Integer');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);

    test.equal(parser.parse('Integer'), null);
}

exports['Parse integer as term'] = function (test) {
    const parser = simplegrammar.createParser('123', rules);
    const result = parser.parse('Term');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);
}

exports['Parse integer as expression'] = function (test) {
    const parser = simplegrammar.createParser('123', rules);
    const result = parser.parse('Expression');
    test.ok(result);
    test.ok(result.value instanceof ConstantExpression);
    test.equal(result.value.value, 123);
}

exports['Parse equals as Equal'] = function (test) {
    const parser = simplegrammar.createParser('==', rules);
    const result = parser.parse('Equal');
    test.ok(result);
    test.ok(typeof result.value == 'string');
    test.equal(result.value, '==');
}

exports['Parse assign as Assign'] = function (test) {
    const parser = simplegrammar.createParser('=', rules);
    const result = parser.parse('Assign');
    test.ok(result);
    test.ok(typeof result.value == 'string');
    test.equal(result.value, '=');
}

exports['Parse assignment'] = function (test) {
    const parser = simplegrammar.createParser('a=1', rules);
    const result = parser.parse('Assignment');
    test.ok(result);
    test.equal(parser.parse('Expression'), null);
    test.equal(parser.next(), null);
}

exports['Parse equals'] = function (test) {
    const parser = simplegrammar.createParser('a==1', rules);
    const result = parser.parse('Expression');
    test.ok(result);
    test.equal(parser.parse('Expression'), null);
    test.equal(parser.next(), null);
}

exports['Parse equals as operator'] = function (test) {
    const parser = simplegrammar.createParser('==', rules);
    const result = parser.parse('Operator');
    test.ok(result);
    test.ok(typeof result.value == 'string');
    test.equal(result.value, '==');
}

exports['Parse assign as operator'] = function (test) {
    const parser = simplegrammar.createParser('=', rules);
    const result = parser.parse('Operator');
    test.ok(result);
    test.ok(typeof result.value == 'string');
    test.equal(result.value, '=');
}

exports['Parse integer + name as expression'] = function (test) {
    const parser = simplegrammar.createParser('123+name', rules);
    const result = parser.parse('Expression');
    test.ok(result);
    test.ok(result.value instanceof BinaryExpression);
    test.ok(result.value.left instanceof ConstantExpression);
    test.ok(result.value.right instanceof NameExpression);
    test.equal(result.value.oper, '+');

    test.equal(parser.parse('Expression'), null);
}

exports['Parse integer + name as expression with spaces, tabs, new lines'] = function (test) {
    const parser = simplegrammar.createParser('  123  \n  +  \rname', rules);
    const result = parser.parse('Expression');
    test.ok(result);
    test.ok(result.value instanceof BinaryExpression);
    test.ok(result.value.left instanceof ConstantExpression);
    test.ok(result.value.right instanceof NameExpression);
    test.equal(result.value.oper, '+');

    test.equal(parser.parse('Expression'), null);
}

exports['Parse name.name as simple term'] = function (test) {
    const parser = simplegrammar.createParser('foo.bar', rules);
    const result = parser.parse('SimpleTerm');
    test.ok(result);
    test.ok(result.value instanceof DotExpression);
    test.ok(result.value.expression instanceof NameExpression);
    test.equal(result.value.name, 'bar');

    test.equal(parser.parse('SimpleTerm'), null);
}

exports['Parse name.name.name as simple term'] = function (test) {
    const parser = simplegrammar.createParser('my.foo.bar', rules);
    const result = parser.parse('SimpleTerm');
    test.ok(result);
    test.ok(result.value instanceof DotExpression);
    test.ok(result.value.expression instanceof DotExpression);
    test.equal(result.value.name, 'bar');

    test.equal(parser.parse('SimpleTerm'), null);
}

exports['Push and retrieve items'] = function (test) {
    const parser = simplegrammar.createParser('', []);
    
    parser.push(['if', { name: 'Expression', value: 1 }, 'else', { name: 'Expression', value: 2 }]);
    
    var result = parser.next();
    test.ok(result);
    test.equal(result, 'if');
    
    var result = parser.next();
    test.ok(result);
    test.equal(result.name, 'Expression');
    test.equal(result.value, 1);
    
    var result = parser.next();
    test.ok(result);
    test.equal(result, 'else');
    
    var result = parser.next();
    test.ok(result);
    test.equal(result.name, 'Expression');
    test.equal(result.value, 2);
}

