# nlcst-search

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**nlcst**][nlcst] utility to search for patterns in a tree.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install nlcst-search
```

## Use

```js
import {search} from 'nlcst-search'
import {toString} from 'nlcst-to-string'

const tree = {
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
      children: [{type: 'TextNode', value: 'do'}]
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
}

search(tree, ['dont'], function(nodes) {
  console.log(toString(nodes))
})
// `Don’t`

search(tree, ['do blocklevel'], function(nodes) {
  console.log(toString(nodes))
})
// `do Block-level`
```

## API

This package exports the following identifiers: `search`.
There is no default export.

### `search(tree, patterns, handler[, allowApostrophes|options])`

Search for patterns a [tree][].

##### Throws

`Error` — When not given `node` or `patterns`.

##### Parameters

###### `node`

[Tree][] to search in ([`Node`][node]).

###### `patterns`

Patterns to search for (`Array.<string>` or `Object`).
If an `Object`, uses its keys as patterns.
Each pattern is a space-delimited list of words, where each word is
[normalize][]d to remove casing, apostrophes, and dashes.
Spaces in a pattern mean zero or more white space nodes in the tree.
Instead of a word, it’s also possible to use a wildcard symbol (`*`, an
asterisk), that matches any word in a pattern (`alpha * charlie`).

###### `handler`

Handler invoked when a match is found ([`Function`][fn-handler]).

###### `allowApostrophes`

Treated as `options.allowApostrophes`.

###### `options.allowApostrophes`

Passed to [`nlcst-normalize`][normalize] (`boolean`, default: `false`).

###### `options.allowDashes`

Passed to [`nlcst-normalize`][normalize] (`boolean`, default: `false`).

###### `options.allowLiterals`

Include [literal][] phrases (`boolean`, default: `false`).

## `function handler(nodes, index, parent, pattern)`

Handler invoked when a match is found.

##### Parameters

###### `nodes`

List of [sibling][]s that match `pattern` ([`Array.<Node>`][node]).

###### `index`

[Index][] where the match starts in `parent` (`number`).

###### `parent`

[Parent][] node of `nodes` ([`Node`][node]).

###### `pattern`

The matched pattern (`string`).

## Related

*   [`nlcst-normalize`](https://github.com/syntax-tree/nlcst-normalize)
    — Normalize a word for easier comparison
*   [`nlcst-is-literal`](https://github.com/syntax-tree/nlcst-is-literal)
    — Check whether a node is meant literally

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/nlcst-search/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/nlcst-search/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/nlcst-search.svg

[coverage]: https://codecov.io/github/syntax-tree/nlcst-search

[downloads-badge]: https://img.shields.io/npm/dm/nlcst-search.svg

[downloads]: https://www.npmjs.com/package/nlcst-search

[size-badge]: https://img.shields.io/bundlephobia/minzip/nlcst-search.svg

[size]: https://bundlephobia.com/result?p=nlcst-search

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[nlcst]: https://github.com/syntax-tree/nlcst

[node]: https://github.com/syntax-tree/unist#node

[literal]: https://github.com/syntax-tree/nlcst-is-literal

[normalize]: https://github.com/syntax-tree/nlcst-normalize

[fn-handler]: #function-handlernodes-index-parent-pattern

[tree]: https://github.com/syntax-tree/unist#tree

[sibling]: https://github.com/syntax-tree/unist#sibling

[index]: https://github.com/syntax-tree/unist#index

[parent]: https://github.com/syntax-tree/unist#parent-1
