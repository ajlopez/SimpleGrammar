
const util = require('util');

function StringSource(text) {
    const l = text ? text.length : 0;
    const elements = [];

    let position = 0;

    this.canParse = function () { return false; }

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
            
        if (elems === true)
            return;

        for (let k = elems.length; k;)
            elements.unshift(elems[--k]);
    };
}

function Rule(leftrule) {
    if (leftrule && leftrule.leftmost)
        this.leftmost = leftrule.leftmost;
    else if (leftrule)
        this.leftmost = leftrule;
    else
        this.leftmost = this;
}

Rule.prototype.process = function (param) {
    let source;
    
    if (typeof param === 'string')
        source = new StringSource(param);
    else
        source = param;
        
    const result = this.processSource(source);
        
    if (result != null) {
        if (this.logmsg)
            console.log(this.logmsg);
        if (this.logfn)
            this.logfn(result, this);
    }
    else {
        if (this.failmsg)
            console.log(this.failmsg);
        if (this.failfn)
            this.failfn(param, this);
    }
    
    return result;
};

Rule.prototype.getDescription = function () {
    if (this.leftmost === this)
        return '';
        
    return this.leftmost.getDescription();    
}

Rule.prototype.log = function (msg) {
    if (typeof msg === 'string')
        this.logmsg = msg;
    else if (typeof msg === 'function')
        this.logfn = msg;
        
    return this;
}

Rule.prototype.fail = function (msg) {
    if (typeof msg === 'string')
        this.failmsg = msg;
    else if (typeof msg === 'function')
        this.failfn = msg;
        
    return this;
}

Rule.prototype.and = function (param) {
    return new AndRule(this, get(param));
};

Rule.prototype.not = function () {
    return new NotRule(this);
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

Rule.prototype.zeroOrOne = function () {
    return new ZeroOrOneRule(this);
};

Rule.prototype.generate = function (name, fn) {
    return new TransformRule(this, name, fn);
};

Rule.prototype.skip = function () {
    return new TransformRule(this, '#Skip');
};

Rule.prototype.upTo = function (ch, escape, fn) {
    return new UpToRule(this, ch, escape, fn);
};

function UpToRule(rule, ch, escape, fn) {
    Rule.call(this);

    if (rule.leftmost)
        this.leftmost = rule.leftmost;
    else
        this.leftmost = rule;

    this.processSource = function (source) {
        let result = rule.process(source);

        if (!result)
            return null;

        while (value = source.next()) {
            if (value === escape && fn) {
                value = fn(source.next());
                result += value;
                continue;
            }

            result += value;

            if (value === ch)
                return result;
        }

        throw "unexpected end of input";
    };
};

util.inherits(UpToRule, Rule);

function PeekRule(rule) {
    Rule.call(this, rule);

    this.processSource = function (source) {
        const result = rule.process(source);

        if (result == null)
            return null;
            
        source.push(result);
        
        return true;
    };
};

util.inherits(PeekRule, Rule);

function NotRule(rule) {
    Rule.call(this, rule);

    this.processSource = function (source) {
        const result = rule.process(source);

        if (result == null)
            return true;
            
        source.push(result);
        
        return null;
    };
};

util.inherits(NotRule, Rule);

function AndRule(leftrule, rightrule) {
    Rule.call(this, leftrule);

    this.processSource = function (source) {
        const result = leftrule.process(source);

        if (result == null)
            return null;

        const newresult = rightrule.process(source);
        
        if (newresult == null) {
            source.push(result);
            return null;
        }

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
    Rule.call(this, leftrule);

    this.processSource = function (source) {
        const result = leftrule.process(source);

        if (result)
            return result;

        return rightrule.process(source);
    };
};

util.inherits(OrRule, Rule);

function OneOrMoreRule(rule) {
    Rule.call(this, rule);

    this.processSource = function (source) {
        let result = rule.process(source);

        if (!result)
            return null;

        let newresult;

        while (newresult = rule.process(source)) {
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
    Rule.call(this, rule);

    this.processSource = function (source) {
        let result = '';

        let newresult;

        while (newresult = rule.process(source)) {
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

function ZeroOrOneRule(rule) {
    Rule.call(this, rule);

    this.processSource = function (source) {
        let result = '';

        let newresult;

        if (newresult = rule.process(source))
            result = newresult;

        return result;
    };
};

util.inherits(ZeroOrOneRule, Rule);

function CharacterRule(character) {
    Rule.call(this);

    this.processSource = function (source) {
        const next = source.next();

        if (next === character)
            return character;

        source.push(next);

        return null;
    };
    
    this.getDescription = function () {
        return character;
    };
}

util.inherits(CharacterRule, Rule);

function RangeRule(from, to) {
    Rule.call(this);

    this.processSource = function (source) {
        const next = source.next();

        if (!next)
            return null;

        if (next >= from && next <= to && next.length === from.length && next.length === to.length)
            return next;

        source.push(next);

        return null;
    };
    
    this.getDescription = function () {
        return from + '-' + to;
    }
}

util.inherits(RangeRule, Rule);

function TransformRule(rule, name, fn) {
    Rule.call(this, rule);

    this.name = name;

    this.processSource = function (source) {
        let result = rule.process(source);

        if (result == null)
            return null;

        if (result.value !== undefined)
            result = { type: name, value: result.value };
        else if (Array.isArray(result)) {
            const values = [];
            
            for (let n = 0; n < result.length; n++) {
                const item = result[n];
                
                if (item && item.value !== undefined)
                    values.push(item.value);
                else
                    values.push(item);
            }
            
            result = { type: name, value: values };
        }
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

    const l = name.length;

    this.processSource = function (source) {
        if (source.canParse(name))
            return source.parse(name);
            
        if (source.skip)
            source.skip();
            
        for (let k = 0; k < l; k++) {
            const next = source.next();
            
            if (k === 0 && next === name)
                return name;
            
            if (name[k] !== next) {
                source.push(next);
                
                if (k)
                    source.push(name.substring(0, k));

                return null;
            }
        }

        return name;
    };
    
    this.getDescription = function () {
        return name;
    }

    this.name = name;
}

util.inherits(ElementRule, Rule);

function DelimitedByCharacterRule(ch) {
    Rule.call(this);

    this.processSource = function (source) {
        const next = source.next();

        if (next !== ch) {
            source.push(next);
            
            return null;
        }
        
        let result = '';

        for (let next = source.next(); next && next.length && next.length === 1; next = source.next())
            if (next === ch)
                break;
            else
                result += next;

        return result;
    };
    
    this.getDescription = function () {
        return ch + '~' + ch;
    }
}

util.inherits(DelimitedByCharacterRule, Rule);

function Parser(source, rules) {
    const options = { };
    
    if (typeof source === 'string')
        source = new StringSource(source);

    const elements = [];

    this.canParse = function (name) {
        for (let n in rules)
            if (rules[n].name === name)
                return true;

        return false;
    };
    
    this.options = function (opts) {
        if (opts)
            options = opts;
        else
            options = { };
    }

    this.parse = function (name) {
        const next = this.next();

        if (next && next.type === name)
            return next;

        if (next)
            this.push(next);

        let skipped = 1;

        while (skipped) {
            skipped = 0;

            for (let n in rules) {
                const rule = rules[n];

                if (rule.name !== '#Skip')
                    continue;
                    
                const result = rule.process(this);

                if (result)
                    skipped++;
            }
        }
        
        let result;

        for (let n in rules) {
            const rule = rules[n];

            if (rule.name !== name)
                continue;

            if (rule.leftmost && rule.leftmost.name === name)
                continue;

            if (options.log)
                console.log('Entering rule', n, rule.getDescription() + '...');
                
            result = rule.process(this);
            
            if (options.log)
                if (result)
                    console.log('Rule', n, rule.getDescription() + '...', 'done');
                else
                    console.log('Rule', n, rule.getDescription() + '...', 'failed');

            if (result)
                break;
        }

        if (!result)
            return null;

        this.push(result, true);

        let processed = true;

        while (processed) {
            processed = false;

            for (let n in rules) {
                const rule = rules[n];

                if (rule.name !== name)
                    continue;

                if (!rule.leftmost || rule.leftmost.name !== name)
                    continue;

                if (options.log)
                    console.log('Expanding rule', n, rule.getDescription() + '...');
                    
                const newresult = rule.process(this);
                
                if (options.log)
                    if (newresult)
                        console.log('Rule', n, rule.getDescription() + '...', 'expanded');
                    else
                        console.log('Rule', n, rule.getDescription() + '...', 'not expanded');

                if (newresult) {
                    this.push(newresult);
                    processed = true;
                    
                    break;
                }
            }
        }

        return this.next();
    };
    
    this.skip = function () {
        let skipped = 1;

        while (skipped) {
            skipped = 0;

            for (let n in rules) {
                const rule = rules[n];

                if (rule.name !== '#Skip')
                    continue;

                const result = rule.process(this);

                if (result)
                    skipped++;
            }
        }
    };

    this.next = function () {
        if (elements.length)
            return elements.pop();

        return source.next();
    };

    this.push = function (elem, asis) {
        if (elem === true)
            return;
            
        if (typeof elem === 'string')
            for (let k = elem.length; k--;)
                elements.push(elem[k]);
        else if (Array.isArray(elem)) {
            for (let k = elem.length; k--;)
                elements.push(elem[k]);
        }
        else if (!asis && elem && elem.value && typeof elem.value === 'string' && elem.value.length === 1)
            this.push(elem.value);
        else
            elements.push(elem);
    };
}

function createRule(param) {
    if (param instanceof Rule)
        return param;

    if (typeof param === 'string' && param.length === 1)
        return new CharacterRule(param);

    if (typeof param === 'string' && param.length === 3 && param[1] == '~' && param[0] === param[2])
        return new DelimitedByCharacterRule(param[0]);

    if (typeof param === 'string' && param.length === 3 && param[1] === '-')
        return new RangeRule(param[0], param[2]);

    if (typeof param === 'string')
        return new ElementRule(param);

    if (Array.isArray(param)) {
        let result = null;

        for (k = 0; k < param.length; k++) {
            const rule = get(param[k]);

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
    let result = null;

    for (let k = 0; k < arguments.length; k++) {
        const arg = arguments[k];
        const rule = createRule(arg);

        if (result)
            result = new AndRule(result, rule);
        else
            result = rule;
    }

    return result;
}

function peek(element) {
    const rule = createRule(element);
    
    return new PeekRule(rule);
}

function createParser(source, rules) {
    return new Parser(source, rules);
}

module.exports = {
    get: get,
    peek: peek,
    createParser: createParser
};

