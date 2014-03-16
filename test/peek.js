
var simplegrammar = require('..');

var get = simplegrammar.get;
var peek = simplegrammar.peek;

exports['peek function'] = function (test) {
    test.ok(simplegrammar);
    test.ok(simplegrammar.peek);
    test.equal(typeof simplegrammar.peek, "function");
}

exports['peek a character'] = function (test) {
    var parser = simplegrammar.createParser('a');
    var rule = peek('a');
    var rule2 = get('a');
    
    var result = rule.process(parser);
    
    test.ok(result);
    test.strictEqual(result, true);
    
    var result2 = rule2.process(parser);

    test.ok(result2);
    test.strictEqual(result2, 'a');
}

exports['peek a word'] = function (test) {
    var parser = simplegrammar.createParser('then');
    var rule = peek('then');
    var rule2 = get('then');
    
    var result = rule.process(parser);
    
    test.ok(result);
    test.strictEqual(result, true);
    
    var result2 = rule2.process(parser);

    test.ok(result2);
    test.strictEqual(result2, 'then');
}

exports['peek in a get'] = function (test) {
    var parser = simplegrammar.createParser('ab');
    var rule = get('a', peek('b'));
    
    var result = rule.process(parser);
    
    test.ok(result);
    test.ok(Array.isArray(result));
    test.equal(result.length, 2);
    test.strictEqual(result[0], 'a');
    test.strictEqual(result[1], true);
    
    test.equal(parser.next(), 'b');
}
