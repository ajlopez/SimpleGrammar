
var simplegrammar = require('..');

var get = simplegrammar.get;

exports['get function'] = function (test) {
    test.ok(simplegrammar);
    test.ok(simplegrammar.get);
    test.equal(typeof simplegrammar.get, "function");
}

exports['parse a character'] = function (test) {
    var rule = get('a');

    test.ok(rule.process('a'));
    test.equal(rule.process('a'), 'a');
    test.equal(rule.process('b'), null);
}

exports['parse two characters'] = function (test) {
    var rule = get('a').and('b');

    var result = rule.process('ab');
    test.ok(result);
    test.equal(result, 'ab');

    test.equal(rule.process('a'), null);
    test.equal(rule.process('aa'), null);
    test.equal(rule.process('ba'), null);
    test.equal(rule.process('bb'), null);
}

exports['parse two characters as arguments'] = function (test) {
    var rule = get('a', 'b');

    var result = rule.process('ab');
    test.ok(result);
    test.equal(result, 'ab');

    test.equal(rule.process('a'), null);
    test.equal(rule.process('aa'), null);
    test.equal(rule.process('ba'), null);
    test.equal(rule.process('bb'), null);
}

exports['parse two characters as alternatives'] = function (test) {
    var rule = get('a').or('b');

    var result = rule.process('a');
    test.ok(result);
    test.equal(result, 'a');

    var result = rule.process('b');
    test.ok(result);
    test.equal(result, 'b');

    test.equal(rule.process('c'), null);
    test.equal(rule.process('d'), null);
}

exports['parse two characters as alternatives using array argument'] = function (test) {
    var rule = get(['a', 'b']);

    var result = rule.process('a');
    test.ok(result);
    test.equal(result, 'a');

    var result = rule.process('b');
    test.ok(result);
    test.equal(result, 'b');

    test.equal(rule.process('c'), null);
    test.equal(rule.process('d'), null);
}

exports['parse character range'] = function (test) {
    var rule = get('a-z');

    test.ok(rule.process('a'));
    test.equal(rule.process('a'), 'a');
    test.ok(rule.process('b'));
    test.equal(rule.process('b'), 'b');
    test.ok(rule.process('z'));
    test.equal(rule.process('z'), 'z');

    test.equal(rule.process('A'), null);
    test.equal(rule.process('Z'), null);
}

exports['parse letter'] = function (test) {
    var rule = get(['a-z', 'A-Z']);

    test.ok(rule.process('a'));
    test.equal(rule.process('a'), 'a');
    test.ok(rule.process('b'));
    test.equal(rule.process('b'), 'b');
    test.ok(rule.process('z'));
    test.equal(rule.process('z'), 'z');
    test.ok(rule.process('A'));
    test.equal(rule.process('A'), 'A');
    test.ok(rule.process('B'));
    test.equal(rule.process('B'), 'B');
    test.ok(rule.process('Z'));
    test.equal(rule.process('Z'), 'Z');

    test.equal(rule.process('0'), null);
    test.equal(rule.process('9'), null);
}

exports['parse word'] = function (test) {
    var rule = get(['a-z', 'A-Z']).oneOrMore();

    test.ok(rule.process('abc'));
    test.equal(rule.process('abc'), 'abc');
    test.ok(rule.process('Abc'));
    test.equal(rule.process('Abc'), 'Abc');

    test.equal(rule.process('0'), null);
    test.equal(rule.process('9'), null);
}

exports['parse word with underscore and digits'] = function (test) {
    var rule = get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore());

    test.ok(rule.process('abc'));
    test.equal(rule.process('abc'), 'abc');
    test.ok(rule.process('Abc'));
    test.equal(rule.process('Abc'), 'Abc');

    test.equal(rule.process('_123'), '_123');
    test.equal(rule.process('a123'), 'a123');
    test.equal(rule.process('a_name'), 'a_name');

    test.equal(rule.process('0'), null);
    test.equal(rule.process('9'), null);
    test.equal(rule.process('123'), null);
}

exports['parse word as object'] = function (test) {
    var rule = get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore()).generate('Word');

    var result = rule.process('abc');
    test.ok(result);
    test.equal(typeof result, 'object');
    test.equal(result.type, 'Word');
    test.equal(result.value, 'abc');
}

exports['parse string word'] = function (test) {
    var rule = get("for");

    var result = rule.process('for');
    test.ok(result);
    test.equal(result, 'for');
}

exports['parse sign word'] = function (test) {
    var rule = get("==");

    var result = rule.process('==');
    test.ok(result);
    test.equal(result, '==');
}

exports['reject parse sign word'] = function (test) {
    var rule = get("==");
    var parser = simplegrammar.createParser('for');

    var result = rule.process(parser);
    test.equal(result, null);
    test.equal(parser.next(), 'f');
}

exports['parse partial word'] = function (test) {
    var rule = get("for");
    var parser = simplegrammar.createParser("fot");

    var result = rule.process(parser);
    test.equal(result, null);
    test.equal(parser.next(), "f");
}
