
var simpleparser = require('..'),
    assert = require('assert');
    
// parse function

assert.ok(simpleparser);
assert.ok(simpleparser.parse);
assert.equal(typeof simpleparser.parse, "function");
