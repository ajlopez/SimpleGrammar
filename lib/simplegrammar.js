
var util = require('util');

function Parser() {
}

Parser.prototype.and = function (param) {
    return new AndParser(this, parse(param));
};

Parser.prototype.or = function (param) {
    return new OrParser(this, parse(param));
};

function AndParser(lparser, rparser) {
    Parser.call(this);
    
    this.parse = function (text) {
        var result = lparser.parse(text);
        
        if (!result || typeof result !== 'object')
            return null;
        
        var value = result.value;
        
        var newresult = rparser.parse(result.rest);
        
        if (typeof newresult === 'string')
            return value + newresult;
            
        return null;
    };
};

util.inherits(AndParser, Parser);

function OrParser(lparser, rparser) {
    Parser.call(this);
    
    this.parse = function (text) {
        var result = lparser.parse(text);
        
        if (result)
            return result;
            
        return rparser.parse(text);
    };
};

util.inherits(AndParser, Parser);

function CharacterParser(character) {
    Parser.call(this);
    
    this.parse = function (text) {
        if (text === character)
            return character;
        
        if (text[0] === character)
            return { value: text[0], rest: text.substring(1) };
            
        return null;
    };
}

util.inherits(CharacterParser, Parser);

function RangeParser(from, to) {
    Parser.call(this);
    
    this.parse = function (text) {
        if (text >= from && text <= to && text.length === from.length && text.length === to.length)
            return text;
        
        if (text[0] >= from && text[0] <= to)
            return { value: text[0], rest: text.substring(1) };
            
        return null;
    };
}

util.inherits(RangeParser, Parser);

function createParser(param) {
    if (param instanceof Parser)
        return param;
        
    if (typeof param === 'string' && param.length === 1)
        return new CharacterParser(param);
        
    if (typeof param === 'string' && param.length === 3 && param[1] === '-')
        return new RangeParser(param[0], param[2]);
        
    throw "invalid parameter in parse";
}

function parse() {
    var result = null;
    
    for (var k = 0; k < arguments.length; k++) {
        var arg = arguments[k];
        var parser = createParser(arg);
        
        if (result)
            result = new AndParser(result, parser);
        else
            result = parser;
    }
    
    return result;
}

module.exports = {
    parse: parse
};

