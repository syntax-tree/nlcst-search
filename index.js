/**
 * @typedef {import('unist').Parent} UnistParent
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').Word} Word
 * @typedef {import('nlcst').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, UnistParent>} Parent
 * @typedef {import('nlcst-normalize').NormalizeOptions} NormalizeOptions
 *
 * @typedef {boolean} AllowApostrophes
 * @typedef {NormalizeOptions & {allowLiterals?: boolean}} SearchOptions
 *
 * @typedef {Array.<string>} PhrasesList
 * @typedef {Object.<string, unknown>} PhrasesMap
 *
 * @typedef {(nodes: Content[], index: number, parent: Parent, pattern: string) => void} Handler
 */

import {visit} from 'unist-util-visit'
import {normalize} from 'nlcst-normalize'
import {isLiteral} from 'nlcst-is-literal'

const own = {}.hasOwnProperty

/**
 * @param {Node} tree
 * @param {PhrasesList|PhrasesMap} phrases
 * @param {Handler} handler
 * @param {AllowApostrophes|SearchOptions} [options=false]
 */
export function search(tree, phrases, handler, options) {
  /** @type {Object.<string, Array.<string>>} */
  const byWord = {'*': []}
  let index = -1
  /** @type {string} */
  let key
  /** @type {SearchOptions} */
  let config

  if (typeof options === 'boolean') {
    config = options ? {allowApostrophes: true} : {}
  } else {
    config = options || {}
  }

  if (!tree || !tree.type) {
    throw new Error('Expected node')
  }

  if (typeof phrases !== 'object') {
    throw new TypeError('Expected object for phrases')
  }

  if (Array.isArray(phrases)) {
    while (++index < phrases.length) {
      handlePhrase(phrases[index])
    }
  } else {
    for (key in phrases) {
      if (own.call(phrases, key)) {
        handlePhrase(key)
      }
    }
  }

  // Search the tree.
  visit(tree, 'WordNode', (node, position, parent_) => {
    const parent = /** @type {Parent} */ (parent_)

    if (
      !parent ||
      position === null ||
      (!config.allowLiterals && isLiteral(parent, position))
    ) {
      return
    }

    const word = normalize(node, config)
    const phrases = byWord['*'].concat(
      own.call(byWord, word) ? byWord[word] : []
    )
    let index = -1

    while (++index < phrases.length) {
      const result = test(phrases[index], position, parent)

      if (result) {
        handler(result, position, parent, phrases[index])
      }
    }
  })

  /**
   * Test a phrase.
   *
   * @param {string} phrase
   * @param {number} position
   * @param {Parent} parent
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
   * Handle a phrase.
   *
   * @param {string} phrase
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
