# nlcst-search

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[nlcst][] utility to search for phrases in a tree.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`search(tree, phrases, handler[, allowApostrophes|options])`](#searchtree-phrases-handler-allowapostrophesoptions)
    *   [`Handler`](#handler)
    *   [`Options`](#options)
    *   [`PhrasesList`](#phraseslist)
    *   [`PhrasesMap`](#phrasesmap)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This utility can search for phrases (words and phrases) in trees.

## When should I use this?

This package is a tiny utility that helps when you’re searching for words
and phrases.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+ and 16.0+), install with [npm][]:

```sh
npm install nlcst-search
```

In Deno with [`esm.sh`][esmsh]:

```js
import {search} from 'https://esm.sh/nlcst-search@3'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {search} from 'https://esm.sh/nlcst-search@3?bundle'
</script>
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

This package exports the identifier [`search`][search].
There is no default export.

### `search(tree, phrases, handler[, allowApostrophes|options])`

Search for phrases in a tree.

##### Parameters

*   `tree` ([`Node`][node])
    — tree to search
*   `phrases` ([`PhrasesList`][phraseslist] or [`PhrasesMap`][phrasesmap])
    — phrases to search for
*   `handler` ([`Handler`][handler])
    — handle a match
*   `allowApostrophes` (`boolean`)
    — shortcut for `options` of `{allowApostrophes: boolean}`
*   `options` ([`Options`][options])
    — configuration

###### Returns

Nothing (`void`).

### `Handler`

Handle a match (TypeScript type).

###### Parameters

*   `nodes` ([`Array<Node>`][node])
    — match
*   `index` (`number`)
    — index of first node of `nodes` in `parent`
*   `parent` ([`Node`][node])
    — parent of `nodes`
*   `phrase` (`string`)
    — the phrase that matched

###### Returns

Nothing (`void`).

### `Options`

Configuration (TypeScript type).

##### Fields

###### `allowApostrophes`

Passed to [`nlcst-normalize`][nlcst-normalize] (`boolean`, default: `false`).

###### `allowDashes`

Passed to [`nlcst-normalize`][nlcst-normalize] (`boolean`, default: `false`).

###### `allowLiterals`

Include [literal][] phrases (`boolean`, default: `false`).

### `PhrasesList`

List of phrases (TypeScript type).

Each phrase is a space-separated list of words, where each word will be
[normalized][nlcst-normalize] to remove casing, apostrophes, and dashes.
Spaces in a pattern mean one or more whitespace nodes in the tree.
Instead of a word with letters, it’s also possible to use a wildcard symbol
(`*`, an asterisk) which will match any word in a pattern (`alpha * charlie`).

###### Type

```ts
type PhrasesList = Array<string>
```

### `PhrasesMap`

Map of phrases (TypeScript type).

###### Type

```ts
type PhrasesMap = Record<string, unknown>
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional types [`Handler`][handler], [`Options`][options],
[`PhrasesList`][phraseslist], and [`PhrasesMap`][phrasesmap].

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`nlcst-normalize`](https://github.com/syntax-tree/nlcst-normalize)
    — normalize a word for easier comparison
*   [`nlcst-is-literal`](https://github.com/syntax-tree/nlcst-is-literal)
    — check whether a node is meant literally

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
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

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[nlcst]: https://github.com/syntax-tree/nlcst

[node]: https://github.com/syntax-tree/unist#node

[literal]: https://github.com/syntax-tree/nlcst-is-literal

[nlcst-normalize]: https://github.com/syntax-tree/nlcst-normalize

[search]: #searchtree-phrases-handler-allowapostrophesoptions

[handler]: #handler

[options]: #options

[phraseslist]: #phraseslist

[phrasesmap]: #phrasesmap
