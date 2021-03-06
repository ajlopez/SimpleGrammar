
const simplegrammar = require('..');

const get = simplegrammar.get;

exports['parse a character'] = function (test) {
    const rule = get('a').not();
    
    test.equal(rule.getDescription(), 'a');

    test.strictEqual(rule.process('b'), true);
    test.strictEqual(rule.process('a'), null);
}

exports['parse two characters'] = function (test) {
    const rule = get('a').and('b').not();
    
    test.equal(rule.getDescription(), 'a');

    test.strictEqual(rule.process('ab'), null);
    test.strictEqual(rule.process('a'), true);
    test.strictEqual(rule.process('b'), true);
    test.strictEqual(rule.process('ba'), true);
}

