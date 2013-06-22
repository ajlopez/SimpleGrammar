
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

Rule.prototype.oneOrMore = function () {
    return new OneOrMoreRule(this);
};

Rule.prototype.zeroOrMore = function () {
    return new ZeroOrMoreRule(this);
};

Rule.prototype.generate = function (name, fn) {
    return new TransformRule(this, name, fn);
};

Rule.prototype.skip = function () {
    return new TransformRule(this, '#Skip');
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
            
        if (Array.isArray(result)) {
            result.push(newresult);
            return result;
        }
            
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

function OneOrMoreRule(rule) {
    Rule.call(this);
    
    this.processSource = function (source) {
        var result = rule.processSource(source);
        
        if (!result)
            return null;

        var newresult;
        
        while (newresult = rule.processSource(source)) {
            if (typeof result === 'string' && typeof newresult == 'string')
                result += newresult;
            else if (Array.isArray(result))
                result.push(newresult);
            else
                result = [result, newresult];
        }
        
        return result;
    };
};

util.inherits(OneOrMoreRule, Rule);

function ZeroOrMoreRule(rule) {
    Rule.call(this);
    
    this.processSource = function (source) {
        var result = '';

        var newresult;
        
        while (newresult = rule.processSource(source)) {
            if (result === '')
                result = newresult;
            else if (typeof result === 'string' && typeof newresult == 'string')
                result += newresult;
            else if (Array.isArray(result))
                result.push(newresult);
            else
                result = [result, newresult];
        }
        
        return result;
    };
};

util.inherits(ZeroOrMoreRule, Rule);

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
        
        if (!next)
            return null;
        
        if (next >= from && next <= to && next.length === from.length && next.length === to.length)
            return next;
            
        source.push(next);
            
        return null;
    };
}

util.inherits(RangeRule, Rule);

function TransformRule(rule, name, fn) {
    Rule.call(this);
    
    this.name = name;
    
    this.processSource = function (source) {
        var result = rule.processSource(source);
        
        if (!result)
            return null;
        
        if (result.value)
            result = { type: name, value: result.value };
        else
            result = { type: name, value: result };
            
        if (fn)
            result.value = fn(result.value);
            
        return result;
    };
}

util.inherits(TransformRule, Rule);

function ElementRule(name) {
    Rule.call(this);
    
    this.processSource = function (source) {
        return source.parse(name);
    };
    
    this.name = name;
}

util.inherits(ElementRule, Rule);

function Parser(source, rules) {
    if (typeof source === 'string')
        source = new StringSource(source);
        
    var elements = [];
        
    this.parse = function (name) {
        var next = this.next();
        
        if (next && next.type === name)
            return next;
            
        if (next)
            this.push(next);
            
        var skipped = 1;
        
        while (skipped) {
            skipped = 0;
            
            for (var n in rules) {
                var rule = rules[n];
                
                if (rule.name !== '#Skip')
                    continue;
                    
                var result = rule.process(this);
                
                if (result)
                    skipped++;
            }
        }
            
        for (var n in rules) {
            var rule = rules[n];
            
            if (rule.name !== name)
                continue;
                
            var result = rule.process(this);
            
            if (result)
                return result;
        }
        
        return null;
    };
    
    this.next = function () {
        if (elements.length)
            return elements.pop();
            
        return source.next();
    };
    
    this.push = function (elem) {
        if (typeof elem === 'string')
            source.push(elem);
        else
            elements.push(elem);
    };
}

function createRule(param) {
    if (param instanceof Rule)
        return param;
        
    if (typeof param === 'string' && param.length === 1)
        return new CharacterRule(param);
        
    if (typeof param === 'string' && param.length === 3 && param[1] === '-')
        return new RangeRule(param[0], param[2]);
        
    if (typeof param === 'string')
        return new ElementRule(param);
        
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

function createParser(source, rules) {
    return new Parser(source, rules);
}

module.exports = {
    get: get,
    createParser: createParser
};

