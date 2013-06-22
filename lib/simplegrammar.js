
var util = require('util');

function Rule() {
}

Rule.prototype.and = function (param) {
    return new AndRule(this, get(param));
};

Rule.prototype.or = function (param) {
    return new OrRule(this, get(param));
};

function AndRule(leftrule, rightrule) {
    Rule.call(this);
    
    this.process = function (text) {
        var result = leftrule.process(text);
        
        if (!result || typeof result !== 'object')
            return null;
        
        var value = result.value;
        
        var newresult = rightrule.process(result.rest);
        
        if (typeof newresult === 'string')
            return value + newresult;
            
        return null;
    };
};

util.inherits(AndRule, Rule);

function OrRule(leftrule, rightrule) {
    Rule.call(this);
    
    this.process = function (text) {
        var result = leftrule.process(text);
        
        if (result)
            return result;
            
        return rightrule.process(text);
    };
};

util.inherits(AndRule, Rule);

function CharacterRule(character) {
    Rule.call(this);
    
    this.process = function (text) {
        if (text === character)
            return character;
        
        if (text[0] === character)
            return { value: text[0], rest: text.substring(1) };
            
        return null;
    };
}

util.inherits(CharacterRule, Rule);

function RangeRule(from, to) {
    Rule.call(this);
    
    this.process = function (text) {
        if (text >= from && text <= to && text.length === from.length && text.length === to.length)
            return text;
        
        if (text[0] >= from && text[0] <= to)
            return { value: text[0], rest: text.substring(1) };
            
        return null;
    };
}

util.inherits(RangeRule, Rule);

function createRule(param) {
    if (param instanceof Rule)
        return param;
        
    if (typeof param === 'string' && param.length === 1)
        return new CharacterRule(param);
        
    if (typeof param === 'string' && param.length === 3 && param[1] === '-')
        return new RangeRule(param[0], param[2]);
        
    if (Array.isArray(param)) {
        var result = null;
        
        for (k = 0; k < param.length; k++) {
            var rule = get(param[k]);
            
            if (result)
                result = new OrRule(result, rule);
            else
                result = rule;
        }
        
        return result;
    }
        
    throw "invalid parameter in rule";
}

function get() {
    var result = null;
    
    for (var k = 0; k < arguments.length; k++) {
        var arg = arguments[k];
        var rule = createRule(arg);
        
        if (result)
            result = new AndRule(result, rule);
        else
            result = rule;
    }
    
    return result;
}

module.exports = {
    get: get
};

