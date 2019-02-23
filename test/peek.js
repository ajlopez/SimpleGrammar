
const simplegrammar = require('..');

const get = simplegrammar.get;
const peek = simplegrammar.peek;

exports['peek function'] = function (test) {
    test.ok(simplegrammar);
    test.ok(simplegrammar.peek);
    test.equal(typeof simplegrammar.peek, "function");
}

exports['peek a character'] = function (test) {
    const parser = simplegrammar.createParser('a');
    const rule = peek('a');
    const rule2 = get('a');
    
    const result = rule.process(parser);
    
    test.ok(result);
    test.strictEqual(result, true);
    
    const result2 = rule2.process(parser);

    test.ok(result2);
    test.strictEqual(result2, 'a');
}

exports['peek a word'] = function (test) {
    const parser = simplegrammar.createParser('then');
    const rule = peek('then');
    const rule2 = get('then');
    
    const result = rule.process(parser);
    
    test.ok(result);
    test.strictEqual(result, true);
    
    const result2 = rule2.process(parser);

    test.ok(result2);
    test.strictEqual(result2, 'then');
}

exports['peek in a get'] = function (test) {
    const parser = simplegrammar.createParser('ab');
    const rule = get('a', peek('b'));
    
    const result = rule.process(parser);
    
    test.ok(result);
    test.ok(Array.isArray(result));
    test.equal(result.length, 2);
    test.strictEqual(result[0], 'a');
    test.strictEqual(result[1], true);
    
    test.equal(parser.next(), 'b');
}
