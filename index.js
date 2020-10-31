'use strict'

var visit = require('unist-util-visit')
var normalize = require('nlcst-normalize')
var isLiteral = require('nlcst-is-literal')

var own = {}.hasOwnProperty

module.exports = search

function search(tree, phrases, handler, options) {
  var settings = options || {}
  var config = {
    allowApostrophes: settings.allowApostrophes || options,
    allowDashes: settings.allowDashes
  }
  var byWord = {'*': []}
  var index = -1
  var key

  if (!tree || !tree.type) {
    throw new Error('Expected node')
  }

  if (typeof phrases !== 'object') {
    throw new Error('Expected object for phrases')
  }

  if ('length' in phrases) {
    while (++index < phrases.length) {
      handlePhrase(phrases[index])
    }
  } else {
    for (key in phrases) {
      handlePhrase(key)
    }
  }

  // Search the tree.
  visit(tree, 'WordNode', visitor)

  // Test a phrase.
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

  // Visitor for `WordNode`s.
  function visitor(node, position, parent) {
    var word
    var phrases
    var index
    var result

    if (!settings.allowLiterals && isLiteral(parent, position)) {
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

  // Handle a phrase.
  function handlePhrase(phrase) {
    var firstWord = normalize(phrase.split(' ', 1)[0], config)

    if (own.call(byWord, firstWord)) {
      byWord[firstWord].push(phrase)
    } else {
      byWord[firstWord] = [phrase]
    }
  }
}
