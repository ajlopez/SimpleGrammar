
var util = require('util');

function Parser() {
}

Parser.prototype.and = function (text) {
    return new AndParser(this, parse(text));
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

function parse(param) {
    return new CharacterParser(param);
}

module.exports = {
    parse: parse
};

