# nlcst-search [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Search for patterns in an [NLCST][nlcst] tree.

## Installation

[npm][]:

```bash
npm install nlcst-search
```

## Usage

```js
var search = require('nlcst-search');
var toString = require('nlcst-to-string');

var tree = {
  type: 'SentenceNode',
  children: [
    {
      type: 'WordNode',
      children: [
        {type: 'TextNode', value: 'Don'},
        {type: 'PunctuationNode', value: '’'},
        {type: 'TextNode', value: 't'}
      ]
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [
        {type: 'TextNode', value: 'do'}
      ]
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [
        {type: 'TextNode', value: 'Block'},
        {type: 'PunctuationNode', value: '-'},
        {type: 'TextNode', value: 'level'}
      ]
    }
  ]
};


search(tree, ['dont'], function (nodes) {
  console.log(toString(nodes));
});
// Don’t

search(tree, ['do blocklevel'], function (nodes) {
  console.log(toString(nodes));
});
// do Block-level
```

## API

### `search(node, patterns, handler[, allowApostrophes|options])`

Search for patterns in an NLCST tree.

###### Parameters

*   `node` ([`Node`][nlcst-node]) — Tree to search in;
*   `patterns` (`Array.<string>` or `Object`)
    — Patterns to search for.  If an `Object`, uses its keys.
    Each pattern is a space-delimited list of words, where each
    word is [normalize][]d to remove casing, apostrophes, and dashes.
    Spaces in a pattern mean zero or more white space nodes in
    the tree.
*   `handler` ([`Function`][fn-handler])
    — Handler invoked when a match is found.
*   `allowApostrophes` (`boolean`, default: `false`)
    — Configuration for [**nlcst-normalize**][normalize]);
*   `options` (`Object`)
    — Configuration:
    *   `allowApostrophes`  (`boolean`, default: `false`)
        — Configuration for [**nlcst-normalize**][normalize]);
    *   `allowDashes`  (`boolean`, default: `false`)
        — Configuration for [**nlcst-normalize**][normalize]);
    *   `allowLiterals`  (`boolean`, default: `false`)
        — Include [literal][] phrases.

###### Throws

`Error` — When not given `node` or `patterns`.

## `function handler(nodes, index, parent, pattern)`

Handler invoked when a match is found.

###### Parameters

*   `nodes` ([`Array.<Node>`][nlcst-node])
    — List of siblings which match `pattern`;
*   `index` (`number`)
    — Position at which the match starts in `parent`;
*   `parent` ([`Node`][nlcst-node])
    — Parent node of `nodes`;
*   `pattern` (`string`)
    — The matched pattern.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/nlcst-search.svg

[travis]: https://travis-ci.org/wooorm/nlcst-search

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/nlcst-search.svg

[codecov]: https://codecov.io/github/wooorm/nlcst-search

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[nlcst]: https://github.com/wooorm/nlcst

[nlcst-node]: https://github.com/wooorm/nlcst#node

[literal]: https://github.com/wooorm/nlcst-is-literal

[normalize]: https://github.com/wooorm/nlcst-normalize

[fn-handler]: #function-handlernodes-index-parent-pattern
