/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist-util-visit').Visitor<Node>} Visitor
 * @typedef {import('nlcst-normalize').NormalizeOptions} NormalizeOptions
 *
 * @typedef {boolean} AllowApostrophes
 *
 * @typedef {NormalizeOptions & {allowLiterals?: boolean}} SearchOptions
 *
 * @typedef {Array.<string>} PhrasesList
 * @typedef {Object.<string, unknown>} PhrasesMap
 *
 * @typedef {(nodes: Array.<Node>, index: number, parent: Parent, pattern: string) => void} Handler
 */

import {visit} from 'unist-util-visit'
import {normalize} from 'nlcst-normalize'
import {isLiteral} from 'nlcst-is-literal'

var own = {}.hasOwnProperty

/**
 * @param {Node} tree
 * @param {PhrasesList|PhrasesMap} phrases
 * @param {Handler} [handler]
 * @param {AllowApostrophes|SearchOptions} [options=false]
 */
export function search(tree, phrases, handler, options) {
  /** @type {Object.<string, Array.<string>>} */
  var byWord = {'*': []}
  var index = -1
  /** @type {string} */
  var key
  /** @type {SearchOptions} */
  var config

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

  if ('length' in phrases) {
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
  visit(tree, 'WordNode', visitor)

  /**
   * Test a phrase.
   *
   * @param {string} phrase
   * @param {number} position
   * @param {Parent} parent
   */
  function test(phrase, position, parent) {
    var siblings = parent.children
    var start = position
    var expressions = phrase.split(' ').slice(1)
    var index = -1

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
   * Visitor for `WordNode`s.
   *
   * @type {Visitor}
   */
  function visitor(node, position, parent) {
    /** @type {string} */
    var word
    /** @type {Array.<string>} */
    var phrases
    /** @type {number} */
    var index
    /** @type {Array.<Node>} */
    var result

    if (!config.allowLiterals && isLiteral(parent, position)) {
      return
    }

    word = normalize(node, config)
    phrases = byWord['*'].concat(own.call(byWord, word) ? byWord[word] : [])
    index = -1

    while (++index < phrases.length) {
      result = test(phrases[index], position, parent)

      if (result) {
        handler(result, position, parent, phrases[index])
      }
    }
  }

  /**
   * Handle a phrase.
   *
   * @param {string} phrase
   */
  function handlePhrase(phrase) {
    var firstWord = normalize(phrase.split(' ', 1)[0], config)

    if (own.call(byWord, firstWord)) {
      byWord[firstWord].push(phrase)
    } else {
      byWord[firstWord] = [phrase]
    }
  }
}
