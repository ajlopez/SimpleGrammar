
const simplegrammar = require('..');

const get = simplegrammar.get;

exports['get function'] = function (test) {
    test.ok(simplegrammar);
    test.ok(simplegrammar.get);
    test.equal(typeof simplegrammar.get, "function");
}

exports['parse a character'] = function (test) {
    const rule = get('a');
    
    test.equal(rule.getDescription(), 'a');

    test.ok(rule.process('a'));
    test.equal(rule.process('a'), 'a');
    test.equal(rule.process('b'), null);
}

exports['parse a character with log function'] = function (test) {
    var result;
    const rule = get('a').log(function (data, rule) { result = data; test.ok(data); test.ok(rule); });

    test.ok(rule.process('a'));
    test.equal(rule.process('a'), 'a');
    
    test.ok(result);
    test.equal(result, 'a');
}

exports['parse a character with fail function'] = function (test) {
    var failed = false;
    const rule = get('a').fail(function (source, rule) { test.ok(source); test.equal(source, 'b'); failed = true; });

    test.equal(rule.process('b'), null);
    test.ok(failed);
}

exports['parse two characters'] = function (test) {
    const rule = get('a').and('b');
    
    test.equal(rule.getDescription(), 'a');

    const result = rule.process('ab');
    test.ok(result);
    test.equal(result, 'ab');

    test.equal(rule.process('a'), null);
    test.equal(rule.process('aa'), null);
    test.equal(rule.process('ba'), null);
    test.equal(rule.process('bb'), null);
}

exports['parse two characters as arguments'] = function (test) {
    const rule = get('a', 'b');
    
    test.equal(rule.getDescription(), 'a');

    const result = rule.process('ab');
    test.ok(result);
    test.equal(result, 'ab');

    test.equal(rule.process('a'), null);
    test.equal(rule.process('aa'), null);
    test.equal(rule.process('ba'), null);
    test.equal(rule.process('bb'), null);
}

exports['parse two characters as alternatives'] = function (test) {
    const rule = get('a').or('b');
    
    test.equal(rule.getDescription(), 'a');

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
    const rule = get(['a', 'b']);
    
    test.equal(rule.getDescription(), 'a');

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
    const rule = get('a-z');
    
    test.equal(rule.getDescription(), 'a-z');

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
    const rule = get(['a-z', 'A-Z']);

    test.equal(rule.getDescription(), 'a-z');
    
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
    const rule = get(['a-z', 'A-Z']).oneOrMore();

    test.ok(rule.process('abc'));
    test.equal(rule.process('abc'), 'abc');
    test.ok(rule.process('Abc'));
    test.equal(rule.process('Abc'), 'Abc');

    test.equal(rule.process('0'), null);
    test.equal(rule.process('9'), null);
}

exports['parse word with underscore and digits'] = function (test) {
    const rule = get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore());

    test.equal(rule.getDescription(), 'a-z');
    
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

exports['parse word with underscore and digits and optional ending bang'] = function (test) {
    const rule = get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore(), get('!').zeroOrOne());

    test.ok(rule.process('abc'));
    test.equal(rule.process('abc'), 'abc');
    test.ok(rule.process('Abc'));
    test.equal(rule.process('Abc'), 'Abc');

    test.ok(rule.process('abc!'));
    test.equal(rule.process('abc!'), 'abc!');
    test.ok(rule.process('Abc!'));
    test.equal(rule.process('Abc!'), 'Abc!');

    test.equal(rule.process('_123'), '_123');
    test.equal(rule.process('a123'), 'a123');
    test.equal(rule.process('a_name'), 'a_name');

    test.equal(rule.process('_123!'), '_123!');
    test.equal(rule.process('a123!'), 'a123!');
    test.equal(rule.process('a_name!'), 'a_name!');

    test.equal(rule.process('_123!!'), '_123!');
    test.equal(rule.process('a123!!'), 'a123!');
    test.equal(rule.process('a_name!!'), 'a_name!');

    test.equal(rule.process('0'), null);
    test.equal(rule.process('9'), null);
    test.equal(rule.process('123'), null);

    test.equal(rule.process('!'), null);
};

exports['parse word as object'] = function (test) {
    const rule = get(['a-z', 'A-Z', '_'], get(['a-z', 'A-Z', '_', '0-9']).zeroOrMore()).generate('Word');

    const result = rule.process('abc');
    test.ok(result);
    test.equal(typeof result, 'object');
    test.equal(result.type, 'Word');
    test.equal(result.value, 'abc');
}

exports['parse string word'] = function (test) {
    const rule = get("for");

    const result = rule.process('for');
    test.ok(result);
    test.equal(result, 'for');
}

exports['parse sign word'] = function (test) {
    const rule = get("==");

    const result = rule.process('==');
    test.ok(result);
    test.equal(result, '==');
}

exports['reject parse sign word'] = function (test) {
    const rule = get("==");
    const parser = simplegrammar.createParser('for');

    const result = rule.process(parser);
    test.equal(result, null);
    test.equal(parser.next(), 'f');
}

exports['parse partial word'] = function (test) {
    const rule = get("for");
    const parser = simplegrammar.createParser("fot");

    const result = rule.process(parser);
    test.equal(result, null);
    test.equal(parser.next(), "f");
}

exports['parse nothing'] = function (test) {
    const rule = get("");
    const parser = simplegrammar.createParser("for");

    const result = rule.process(parser);
    test.equal(result, '');
    test.equal(parser.next(), "f");
}

exports['parse nothing as something'] = function (test) {
    const rule = get("").generate('Something');
    const parser = simplegrammar.createParser("for");

    const result = rule.process(parser);
    test.ok(result);
    test.equal(result.type, 'Something');
    test.equal(result.value, '');
    test.equal(parser.next(), "f");
}

exports['parse delimited string'] = function (test) {
    const rule = get('"~"').generate('String');
    
    test.equal(rule.getDescription(), '"~"');
    
    const parser = simplegrammar.createParser('"foo"');

    const result = rule.process(parser);
    test.ok(result);
    test.equal(result.type, 'String');
    test.equal(result.value, 'foo');
    test.equal(parser.next(), null);
}

exports['parse two words skipping spaces'] = function (test) {
    const rule1 = get([' ','\t','\r','\n']).oneOrMore().skip();
    const rule2 = get('if', 'then').generate('Expression');
    const parser = simplegrammar.createParser('if then', [rule1, rule2]);
    
    const result = parser.parse('Expression');
    
    test.ok(result);
    test.equal(result.type, 'Expression');
    test.equal(result.value, 'ifthen');
}