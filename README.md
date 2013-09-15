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
var parser = sg.createParser([rulefor, ruledigit, ... ]);
```

A parser has an array of rule to execute.

TBD: explain other rules (generate, oneOrMore, zeroOrMore, ...) and more examples

## Development

```
git clone git://github.com/ajlopez/SimpleGrammar.git
cd SimpleGrammar
npm install
npm test
```

## Samples

TBD

## Versions

- 0.0.1: Published

## License

MIT

## Contribution

Feel free to [file issues](https://github.com/ajlopez/SimpleGrammar) and submit
[pull requests](https://github.com/ajlopez/SimpleGrammar/pulls) — contributions are
welcome<

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

