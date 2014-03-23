# SimpleGrammar

SimpleGrammar define parsers.

## Installation

Via npm on Node:

```
npm install simplegrammar
```

## Usage

Reference in your program:

```js
var sg = require('simplegrammar');
var get = sg.get;
var peek = sg.peek;
```

There are rules, that process string input:

```js
var rulefor = get('for'); // the word 'for'
var ruledigit = get('0-9'); // digits
var ruleaorb = get(['a', 'b']); // an array is an 'or'
var ruletwodigit = get('0-9', '0-9'); // two digits
```

An array means an option: the rule accepts one of the elements.

More than one parameter is a sequence: the rule accepts the sequence.

The rule can process a string:

```js
var result = get('for').process('for'); // result is 'for'
var noresult = get('for').process('if'); // noresult is null
```

But in general, the rules are invoked by a parser.
```js
var parser = sg.createParser(text, [rulefor, ruledigit, ... ]);
```

A parser has an array of rule to execute.

There are `peek` rules to get an element, but without removing it from the parser process:

var rule = peek('for');
var rule2 = get('for');
var parser = sg.createParser('for'); // without rules, invoke the rule directly
rule.process(parser); // success, it detects 'for'
rule2.process(parser); // success again, it detects and remove 'for'

TBD: explain other rules (generate, oneOrMore, zeroOrMore, zeroOrOne, ...) and more examples

## Development

```
git clone git://github.com/ajlopez/SimpleGrammar.git
cd SimpleGrammar
npm install
npm test
```

## Samples

TBD

## Projects

Projects that use SimpleGrammar:

TBD

## Versions

- 0.0.1: Published
- 0.0.2: Published. Refactor TransformRule to process an array
- 0.0.3: Published. Peek element (like get but without removing the element from the parser)
- 0.0.4: Published. Fixing push array bug in parser
- 0.0.5: Published. Delimited by character rule
- 0.0.6: Published. zeroOrOne rule
- 0.0.7: Published. skip in ElementRule, fix parser push
- 0.0.8: Published. Internal push refactor, to parse = and ==
- 0.0.9: Published. Elements with value == null

## License

MIT

## Contribution

Feel free to [file issues](https://github.com/ajlopez/SimpleGrammar) and submit
[pull requests](https://github.com/ajlopez/SimpleGrammar/pulls) — contributions are
welcome<

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

