
var util = require('util');

function StringSource(text) {
    var l = text ? text.length : 0;
    var position = 0;
    var elements = [];
    
    this.next = function () {
        if (elements.length)
            return elements.shift();
        
        if (position < l)
            return text[position++];
        
        return null;
    };
    
    this.push = function (elems) {
        if (!elems)
            return;
            
        for (var k = elems.length; k;)
            elements.unshift(elems[--k]);
    };
}

function Rule() {
}

Rule.prototype.process = function (param) {
    if (typeof param === 'string')
        return this.processSource(new StringSource(param));
        
    return this.processSource(param);
};

Rule.prototype.and = function (param) {
    return new AndRule(this, get(param));
};

Rule.prototype.or = function (param) {
    return new OrRule(this, get(param));
};

function AndRule(leftrule, rightrule) {
    Rule.call(this);
    
    this.processSource = function (source) {
        var result = leftrule.processSource(source);
        
        if (!result)
            return null;
        
        var newresult = rightrule.processSource(source);
        
        if (typeof result === 'string' && typeof newresult === 'string')
            return result + newresult;
            
        if (result && newresult)
            return [result, newresult];
        
        source.push(result);
            
        return null;
    };
};

util.inherits(AndRule, Rule);

function OrRule(leftrule, rightrule) {
    Rule.call(this);
    
    this.processSource = function (source) {
        var result = leftrule.processSource(source);
        
        if (result)
            return result;
                
        return rightrule.processSource(source);
    };
};

util.inherits(OrRule, Rule);

function CharacterRule(character) {
    Rule.call(this);
    
    this.processSource = function (source) {
        var next = source.next();
        
        if (next === character)
            return character;

        source.push(next);
            
        return null;
    };
}

util.inherits(CharacterRule, Rule);

function RangeRule(from, to) {
    Rule.call(this);
    
    this.processSource = function (source) {
        var next = source.next();
        
        if (next >= from && next <= to && next.length === from.length && next.length === to.length)
            return next;
            
        source.push(next);
            
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

