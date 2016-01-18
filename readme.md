# nlcst-search [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Search for patterns in an [NLCST][nlcst] tree.

## Installation

[npm][npm-install]:

```bash
npm install nlcst-search
```

**nlcst-search** is also available for [duo][duo-install], and as an
AMD, CommonJS, and globals module, [uncompressed and compressed][releases].

## Usage

```js
var search = require('nlcst-search');
var toString = require('nlcst-to-string');

var tree = {
    'type': 'SentenceNode',
    'children': [
        {
            'type': 'WordNode',
            'children': [
                {'type': 'TextNode', 'value': 'Don'},
                {'type': 'PunctuationNode', 'value': '’'},
                {'type': 'TextNode', 'value': 't'}
            ]
        },
        {'type': 'WhiteSpaceNode', 'value': ' '},
        {
            'type': 'WordNode',
            'children': [
                {'type': 'TextNode', 'value': 'do'}
            ]
        },
        {'type': 'WhiteSpaceNode', 'value': ' '},
        {
            'type': 'WordNode',
            'children': [
                {'type': 'TextNode', 'value': 'Block'},
                {'type': 'PunctuationNode', 'value': '-'},
                {'type': 'TextNode', 'value': 'level'}
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

### `search(node, patterns, handler[, allowApostrophes])`

Search for patterns in an NLCST tree.

Note that the algorithm ignores [literal][literal] words.

**Parameters**

*   `node` ([`Node`][nlcst-node]) — Tree to search in;

*   `patterns` (`Array.<string>` or `Object`)
    — Patterns to search for. If an `Object`, uses its keys.
    Each pattern is a space-delimited list of words, where each
    word is normalized to remove casing, apostrophes, and dashes.
    Spaces in a pattern mean zero or more white space nodes in
    the tree.

*   `handler` ([`Function`][fn-handler])
    — Patterns to search for. If an `Object`, uses its keys.
    Each pattern is a space-delimited list of words, where each
    word is normalized to remove casing, apostrophes, and dashes;

*   `allowApostrophes` (`boolean`, default: `false`)
    — Do not strip apostrophes (but normalize them).

**Throws**: `Error` — When not given `node` or `patterns`.

## `function handler(nodes, index, parent, pattern)`

Handler invoked when a match is found.

**Parameters**

*   `nodes` ([`Array.<Node>`][nlcst-node])
    — List of siblings which match `pattern`;

*   `index` (`number`) — Position at which the match starts in `parent`;

*   `parent` ([`Node`][nlcst-node]) — Parent node of `nodes`;

*   `pattern` (`string`) — The matched pattern.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/nlcst-search.svg

[travis]: https://travis-ci.org/wooorm/nlcst-search

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/nlcst-search.svg

[codecov]: https://codecov.io/github/wooorm/nlcst-search

[npm-install]: https://docs.npmjs.com/cli/install

[duo-install]: http://duojs.org/#getting-started

[releases]: https://github.com/wooorm/nlcst-search/releases

[license]: LICENSE

[author]: http://wooorm.com

[nlcst]: https://github.com/wooorm/nlcst

[nlcst-node]: https://github.com/wooorm/nlcst#node

[literal]: https://github.com/wooorm/nlcst-is-literal

[fn-handler]: #function-handlernodes-index-parent-pattern
