/**
 * @typedef {import('unist').Parent} UnistParent
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').Content} Content
 * @typedef {import('nlcst-normalize').Options} NormalizeOptions
 */

/**
 * @typedef {Root | Content} Node
 * @typedef {Extract<Node, UnistParent>} Parent
 *
 * @typedef {NormalizeOptions & {allowLiterals?: boolean}} Options
 *   Configuration (optional).
 *
 * @typedef {Array<string>} PhrasesList
 *   List of phrases.
 *
 *   Each phrase is a space-separated list of words, where each word will be
 *   normalized to remove casing, apostrophes, and dashes.
 *   Spaces in a pattern mean one or more whitespace nodes in the tree.
 *   Instead of a word with letters, it’s also possible to use a wildcard
 *   symbol (`*`, an asterisk) which will match any word in a pattern
 *   (`alpha * charlie`).
 *
 * @typedef {Record<string, unknown>} PhrasesMap
 *   Map where the keys are phrases.
 *
 * @callback Handler
 *   Handle a match.
 * @param {Array<Content>} nodes
 *   Match.
 * @param {number} index
 *   Index of first node of `nodes` in `parent`.
 * @param {Parent} parent
 *   Parent of `nodes`.
 * @param {string} phrase
 *   The phrase that matched.
 * @returns {void}
 *   Nothing.
 */

import {visit} from 'unist-util-visit'
import {normalize} from 'nlcst-normalize'
import {isLiteral} from 'nlcst-is-literal'

const own = {}.hasOwnProperty

/**
 * Search for phrases in a tree.
 *
 * @param {Node} tree
 *   Tree to search.
 * @param {PhrasesList | PhrasesMap} phrases
 *   Phrases to search for.
 * @param {Handler} handler
 *   Handle a match
 * @param {boolean | Options} [options=false]
 *   Configuration (or `allowApostrophes`).
 * @returns {void}
 *   Nothing.
 */
// To do: next major: remove boolean overload.
// To do: next major: remove `PhrasesMap` support.
export function search(tree, phrases, handler, options) {
  const config =
    typeof options === 'boolean' ? {allowApostrophes: options} : options || {}

  if (!tree || !tree.type) {
    throw new Error('Expected node')
  }

  if (typeof phrases !== 'object') {
    throw new TypeError('Expected object for phrases')
  }

  /** @type {Record<string, Array<string>>} */
  const byWord = {'*': []}

  if (Array.isArray(phrases)) {
    let index = -1
    while (++index < phrases.length) {
      handlePhrase(phrases[index])
    }
  } else {
    /** @type {string} */
    let key

    for (key in phrases) {
      if (own.call(phrases, key)) {
        handlePhrase(key)
      }
    }
  }

  // Search the tree.
  visit(tree, 'WordNode', (node, position, parent) => {
    if (
      !parent ||
      position === null ||
      (!config.allowLiterals && isLiteral(parent, position))
    ) {
      return
    }

    const word = normalize(node, config)
    const phrases = own.call(byWord, word)
      ? [...byWord['*'], ...byWord[word]]
      : byWord['*']
    let index = -1

    while (++index < phrases.length) {
      const result = test(phrases[index], position, parent)

      if (result) {
        handler(result, position, parent, phrases[index])
      }
    }
  })

  /**
   * Test a phrase (the first word already matched).
   *
   * @param {string} phrase
   *   Normalized phrase.
   * @param {number} position
   *   Index in `parent`.
   * @param {Parent} parent
   *   Parent node.
   * @returns {Array<Content> | void}
   *   Match, if found.
   */
  function test(phrase, position, parent) {
    const siblings = parent.children
    const start = position
    const expressions = phrase.split(' ').slice(1)
    let index = -1

    // Move one position forward.
    position++

    // Iterate over `expressions`.
    while (++index < expressions.length) {
      // Allow joining white-space.
      while (position < siblings.length) {
        if (siblings[position].type !== 'WhiteSpaceNode') break
        position++
      }

      // Exit if there are no nodes left, if the current node is not a word, or
      // if the current word does not match the search for value.
      if (
        !siblings[position] ||
        siblings[position].type !== 'WordNode' ||
        (expressions[index] !== '*' &&
          normalize(expressions[index], config) !==
            normalize(siblings[position], config))
      ) {
        return
      }

      position++
    }

    return siblings.slice(start, position)
  }

  /**
   * Index a phrase.
   *
   * @param {string} phrase
   *   Raw phrase.
   * @returns {void}
   *   Nothing.
   */
  function handlePhrase(phrase) {
    const firstWord = normalize(phrase.split(' ', 1)[0], config)

    if (own.call(byWord, firstWord)) {
      byWord[firstWord].push(phrase)
    } else {
      byWord[firstWord] = [phrase]
    }
  }
}
