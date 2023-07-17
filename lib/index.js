/**
 * @typedef {import('nlcst').Nodes} Nodes
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst').SentenceContent} SentenceContent
 * @typedef {import('nlcst-normalize').Options} NormalizeOptions
 */

/**
 * @callback Handler
 *   Handle a match.
 * @param {Array<SentenceContent>} nodes
 *   Match.
 * @param {number} index
 *   Index of first node of `nodes` in `parent`.
 * @param {Root | Sentence} parent
 *   Parent of `nodes`.
 * @param {string} phrase
 *   The phrase that matched.
 * @returns {undefined | void}
 *   Nothing.
 *
 * @typedef {NormalizeOptions & OptionsExtraFields} Options
 *   Configuration (optional).
 *
 * @typedef OptionsExtraFields
 *   Extra fields.
 * @property {boolean | null | undefined} [allowLiterals=false]
 *   Include literal phrases (default: `false`).
 */

import {visit} from 'unist-util-visit'
import {normalize} from 'nlcst-normalize'
import {isLiteral} from 'nlcst-is-literal'

const own = {}.hasOwnProperty

/**
 * Search for phrases in a tree.
 *
 * Each phrase is a space-separated list of words, where each word will be
 * normalized to remove casing, apostrophes, and dashes.
 * Spaces in a pattern mean one or more whitespace nodes in the tree.
 * Instead of a word with letters, it’s also possible to use a wildcard
 * symbol (`*`, an asterisk) which will match any word in a pattern
 * (`alpha * charlie`).
 *
 * @param {Nodes} tree
 *   Tree to search.
 * @param {Array<string>} phrases
 *   Phrases to search for.
 * @param {Handler} handler
 *   Handle a match
 * @param {Options} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export function search(tree, phrases, handler, options) {
  const config = options || {}

  if (!tree || !tree.type) {
    throw new Error('Expected node')
  }

  if (typeof phrases !== 'object') {
    throw new TypeError('Expected object for phrases')
  }

  /** @type {Record<string, Array<string>>} */
  const byWord = {'*': []}

  let index = -1

  while (++index < phrases.length) {
    const phrase = phrases[index]
    const firstWord = normalize(phrase.split(' ', 1)[0], config)

    if (own.call(byWord, firstWord)) {
      byWord[firstWord].push(phrase)
    } else {
      byWord[firstWord] = [phrase]
    }
  }

  // Search the tree.
  visit(tree, 'WordNode', (node, position, parent) => {
    if (
      !parent ||
      position === undefined ||
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
   * @param {Root | Sentence} parent
   *   Parent node.
   * @returns {Array<SentenceContent> | undefined}
   *   Match, if found.
   */
  function test(phrase, position, parent) {
    /** @type {Array<SentenceContent>} */
    // @ts-expect-error: content in a root must be of the same content type.
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
}
