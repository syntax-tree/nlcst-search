/**
 * @typedef {import('nlcst').Sentence} Sentence
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {search} from './index.js'
import * as mod from './index.js'

/** @type {Sentence} */
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
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'or'}]
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {type: 'PunctuationNode', value: '"'},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'do'}]
    },
    {type: 'PunctuationNode', value: '"'},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'or'}]
    },
    {type: 'PunctuationNode', value: ','},
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'mellow'}]
    },
    {type: 'PunctuationNode', value: ','},
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'that'}]
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'or'}]
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'this'}]
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'hell'}]
    },
    {type: 'WhiteSpaceNode', value: ' '},
    {
      type: 'WordNode',
      children: [{type: 'TextNode', value: 'selfservice'}]
    }
  ]
}

test('search', () => {
  assert.deepEqual(
    Object.keys(mod).sort(),
    ['search'],
    'should expose the public api'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      search()
    },
    /Error: Expected node/,
    'should throw when not given a tree'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      search(tree)
    },
    /Error: Expected object for phrases/,
    'should throw when not given phrases'
  )

  search(tree, ['Don’t'], (nodes, index, parent, phrase) => {
    assert.deepEqual(nodes, [tree.children[0]], 'should pass nodes')
    assert.equal(index, 0, 'should pass the correct index')
    assert.equal(parent, tree, 'should pass the parent')
    assert.equal(phrase, 'Don’t', 'should pass the phrase')
  })

  search(tree, ['Dont'], (nodes, index, parent, phrase) => {
    const match = [tree.children[0]]
    assert.deepEqual(nodes, match, 'should pass nodes (normalized)')
    assert.equal(index, 0, 'should pass the correct index (normalized)')
    assert.equal(parent, tree, 'should pass the parent (normalized)')
    assert.equal(phrase, 'Dont', 'should pass the phrase')
  })

  search(tree, {do: true}, (nodes, index, parent, phrase) => {
    const match = [tree.children[2]]
    assert.deepEqual(nodes, match, 'should pass nodes (object)')
    assert.equal(index, 2, 'should pass the correct index (object)')
    assert.equal(parent, tree, 'should pass the parent (object)')
    assert.equal(phrase, 'do', 'should pass the phrase (object)')
  })

  search(tree, ['blocklevel'], (nodes, index, parent, phrase) => {
    const match = [tree.children[4]]
    assert.deepEqual(nodes, match, 'should pass nodes (normalized 2)')
    assert.equal(index, 4, 'should pass the correct index (normalized 2)')
    assert.equal(parent, tree, 'should pass the parent (normalized 2)')
    assert.equal(phrase, 'blocklevel', 'should pass the phrase')
  })

  let position = -1
  let results = [
    [[tree.children[0]], 0, tree, 'dont'],
    [[tree.children[2]], 2, tree, 'do']
  ]

  search(tree, ['dont', 'do'], (nodes, index, parent, phrase) => {
    const match = results[++position]
    assert.deepEqual(nodes, match[0], 'should pass nodes (phrases)')
    assert.equal(index, match[1], 'should pass the correct index (phrases)')
    assert.equal(parent, match[2], 'should pass the parent (phrases)')
    assert.equal(phrase, match[3], 'should pass the phrase (phrases)')
  })

  search(tree, ['dont do'], (nodes, index, parent, phrase) => {
    const match = tree.children.slice(0, 3)
    assert.deepEqual(nodes, match, 'should pass nodes (phrase)')
    assert.equal(index, 0, 'should pass the correct index (phrase)')
    assert.equal(parent, tree, 'should pass the parent (phrase)')
    assert.equal(phrase, 'dont do', 'should pass the phrase (phrase)')
  })

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['or that'])
  }, 'shouldn’t include non-word and non-white-space nodes')

  const phrases = ['that or this', 'that']

  position = -1
  results = [
    [tree.children.slice(17, 22), 17, tree, phrases[0]],
    [[tree.children[17]], 17, tree, phrases[1]]
  ]

  search(tree, phrases, (nodes, index, parent, phrase) => {
    const match = results[++position]
    assert.deepEqual(nodes, match[0], 'should pass nodes (phrases)')
    assert.equal(index, match[1], 'should pass the correct index (phrases)')
    assert.equal(parent, match[2], 'should pass the parent (phrases)')
    assert.equal(phrase, match[3], 'should pass the phrase (phrases)')
  })

  /* Handler function is only invoked if match is found
   * search will throw if a match is found and no handler
   * is provided  the tree contains “hell” but not “he’ll”
   * or “he'll”. */
  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['hell'])
  }, 'should find non-apostrophe words when `allowApostrophes` is absent')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['he’ll'])
  }, 'should find smart apostrophe words when `allowApostrophes` is absent')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ["he'll"])
  }, 'should find dumb apostrophe words when `allowApostrophes` is absent')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['hell'], null, true)
  }, 'should find non-apostrophe words when `allowApostrophes` is true')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['he’ll'], null, true)
  }, 'shouldn’t find smart apostrophe words when `allowApostrophes` is true')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ["he'll"], null, true)
  }, 'shouldn’t find dumb apostrophe words when `allowApostrophes` is true')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['hell'], null, false)
  }, 'should find non-apostrophe words when `allowApostrophes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['he’ll'], null, false)
  }, 'should find smart apostrophe words when `allowApostrophes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ["he'll"], null, false)
  }, 'should find dumb apostrophe words when `allowApostrophes` is false')

  /* The tree contains “selfservice” but not “self-service” */

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'])
  }, 'should find non-dash words when `allowDashes` is absent and `allowApostrophes` is absent')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'])
  }, 'should find dash words when `allowDashes` is absent and `allowApostrophes` is absent')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, false)
  }, 'should find non-dash words when `allowDashes` is absent and `allowApostrophes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, false)
  }, 'should find dash words when `allowDashes` is absent and `allowApostrophes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, true)
  }, 'should find non-dash words when `allowDashes` is absent and `allowApostrophes` is true')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, true)
  }, 'should find dash words when `allowDashes` is absent and `allowApostrophes` is true')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, {allowDashes: true})
  }, 'should find non-dash words when `allowDashes` is true')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, {allowDashes: true})
  }, 'shouldn’t find dash words when `allowDashes` is true')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, {allowDashes: false})
  }, 'should find non-dash words when `allowDashes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, {allowDashes: false})
  }, 'should find dash words when `allowDashes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, {
      allowApostrophes: false,
      allowDashes: true
    })
  }, 'should find non-dash words when `allowDashes` is true and `allowApostrophes` is false')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, {
      allowApostrophes: false,
      allowDashes: true
    })
  }, 'shouldn’t find dash words when `allowDashes` is true and `allowApostrophes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, {
      allowApostrophes: false,
      allowDashes: false
    })
  }, 'should find non-dash words when `allowDashes` is false and `allowApostrophes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, {
      allowApostrophes: false,
      allowDashes: false
    })
  }, 'should find dash words when `allowDashes` is false and `allowApostrophes` is false')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, {
      allowApostrophes: true,
      allowDashes: true
    })
  }, 'should find non-dash words when `allowDashes` is true and `allowApostrophes` is true')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, {
      allowApostrophes: true,
      allowDashes: true
    })
  }, 'shouldn’t find dash words when `allowDashes` is true and `allowApostrophes` is true')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['selfservice'], null, {
      allowApostrophes: true,
      allowDashes: false
    })
  }, 'should find non-dash words when `allowDashes` is false and `allowApostrophes` is true')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['self-service'], null, {
      allowApostrophes: true,
      allowDashes: false
    })
  }, 'should find dash words when `allowDashes` is false and `allowApostrophes` is true')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['this * selfservice'])
  }, 'should support wild cards (#1)')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['that * selfservice'])
  }, 'should support wild cards (#2)')

  assert.throws(() => {
    // @ts-expect-error: hush.
    search(tree, ['* selfservice'])
  }, 'should support wild cards (#3)')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['* zelfzervice'])
  }, 'should support wild cards (#4)')

  assert.doesNotThrow(() => {
    // @ts-expect-error: hush.
    search(tree, ['mellow'])
  }, 'shouldn’t find literals by default')

  search(
    tree,
    ['mellow'],
    () => {
      assert.ok(true, 'should find literals when given `allowLiterals`')
    },
    {allowLiterals: true}
  )
})
