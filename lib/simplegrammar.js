
var util = require('util');

function Parser() {
}

Parser.prototype.and = function (param) {
    return new AndParser(this, parse(param));
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

function parse(param) {
    if (param instanceof Parser)
        return param;
        
    if (typeof param === 'string' && param.length === 1)
        return new CharacterParser(param);
        
    if (typeof param === 'string' && param.length === 3 && param[1] === '-')
        return new RangeParser(param[0], param[2]);
        
    throw "invalid parameter in parse";
}

module.exports = {
    parse: parse
};

