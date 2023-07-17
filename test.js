/**
 * @typedef {import('nlcst').Sentence} Sentence
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {search} from './index.js'

test('search', async function (t) {
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

  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('./index.js')).sort(), ['search'])
  })

  await t.test('should throw when not given a tree', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a missing tree.
      search()
    }, /Error: Expected node/)
  })

  await t.test('should throw when not given phrases', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a missing phrases.
      search(tree)
    }, /Error: Expected object for phrases/)
  })

  await t.test('should search', async function () {
    search(tree, ['Don’t'], function (nodes, index, parent, phrase) {
      assert.deepEqual(nodes, [tree.children[0]], 'should pass nodes')
      assert.equal(index, 0, 'should pass the correct index')
      assert.equal(parent, tree, 'should pass the parent')
      assert.equal(phrase, 'Don’t', 'should pass the phrase')
    })
  })

  await t.test('should search (normalized)', async function () {
    search(tree, ['Dont'], function (nodes, index, parent, phrase) {
      const match = [tree.children[0]]
      assert.deepEqual(nodes, match, 'should pass nodes (normalized)')
      assert.equal(index, 0, 'should pass the correct index (normalized)')
      assert.equal(parent, tree, 'should pass the parent (normalized)')
      assert.equal(phrase, 'Dont', 'should pass the phrase')
    })
  })

  await t.test('should search (normalized, 2)', async function () {
    search(tree, ['blocklevel'], function (nodes, index, parent, phrase) {
      const match = [tree.children[4]]
      assert.deepEqual(nodes, match, 'should pass nodes (normalized 2)')
      assert.equal(index, 4, 'should pass the correct index (normalized 2)')
      assert.equal(parent, tree, 'should pass the parent (normalized 2)')
      assert.equal(phrase, 'blocklevel', 'should pass the phrase')
    })
  })

  await t.test('should search (list)', async function () {
    const results = [
      [[tree.children[0]], 0, tree, 'dont'],
      [[tree.children[2]], 2, tree, 'do']
    ]
    let position = -1

    search(tree, ['dont', 'do'], function (nodes, index, parent, phrase) {
      const match = results[++position]
      assert.deepEqual(nodes, match[0], 'should pass nodes (phrases)')
      assert.equal(index, match[1], 'should pass the correct index (phrases)')
      assert.equal(parent, match[2], 'should pass the parent (phrases)')
      assert.equal(phrase, match[3], 'should pass the phrase (phrases)')
    })
  })

  await t.test('should search (phrase)', async function () {
    search(tree, ['dont do'], function (nodes, index, parent, phrase) {
      const match = tree.children.slice(0, 3)
      assert.deepEqual(nodes, match, 'should pass nodes (phrase)')
      assert.equal(index, 0, 'should pass the correct index (phrase)')
      assert.equal(parent, tree, 'should pass the parent (phrase)')
      assert.equal(phrase, 'dont do', 'should pass the phrase (phrase)')
    })
  })

  await t.test(
    'should not include non-word and non-white-space nodes',
    async function () {
      assert.doesNotThrow(function () {
        search(tree, ['or that'], throws)
      })
    }
  )

  await t.test('should search (phrases)', async function () {
    const phrases = ['that or this', 'that']

    const results = [
      [tree.children.slice(17, 22), 17, tree, phrases[0]],
      [[tree.children[17]], 17, tree, phrases[1]]
    ]
    let position = -1

    search(tree, phrases, function (nodes, index, parent, phrase) {
      const match = results[++position]
      assert.deepEqual(nodes, match[0], 'should pass nodes (phrases)')
      assert.equal(index, match[1], 'should pass the correct index (phrases)')
      assert.equal(parent, match[2], 'should pass the parent (phrases)')
      assert.equal(phrase, match[3], 'should pass the phrase (phrases)')
    })
  })

  await t.test(
    'should find non-apostrophe words when `allowApostrophes` is absent',
    async function () {
      assert.throws(function () {
        search(tree, ['hell'], throws)
      })
    }
  )

  await t.test(
    'should find smart apostrophe words when `allowApostrophes` is absent',
    async function () {
      assert.throws(function () {
        search(tree, ['he’ll'], throws)
      })
    }
  )

  await t.test(
    'should find dumb apostrophe words when `allowApostrophes` is absent',
    async function () {
      assert.throws(function () {
        search(tree, ["he'll"], throws)
      })
    }
  )

  await t.test(
    'should find non-apostrophe words when `allowApostrophes` is true',
    async function () {
      assert.throws(function () {
        search(tree, ['hell'], throws, true)
      })
    }
  )

  await t.test(
    'should not find smart apostrophe words when `allowApostrophes` is true',
    async function () {
      assert.doesNotThrow(function () {
        search(tree, ['he’ll'], throws, true)
      })
    }
  )

  await t.test(
    'should not find dumb apostrophe words when `allowApostrophes` is true',
    async function () {
      assert.doesNotThrow(function () {
        search(tree, ["he'll"], throws, true)
      })
    }
  )

  await t.test(
    'should find non-apostrophe words when `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['hell'], throws, false)
      })
    }
  )

  await t.test(
    'should find smart apostrophe words when `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['he’ll'], throws, false)
      })
    }
  )

  await t.test(
    'should find dumb apostrophe words when `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ["he'll"], throws, false)
      })
    }
  )

  // The tree contains “selfservice” but not “self-service”
  await t.test(
    'should find non-dash words when `allowDashes` is absent and `allowApostrophes` is absent',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws)
      })
    }
  )

  await t.test(
    'should find dash words when `allowDashes` is absent and `allowApostrophes` is absent',
    async function () {
      assert.throws(function () {
        search(tree, ['self-service'], throws)
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is absent and `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, false)
      })
    }
  )

  await t.test(
    'should find dash words when `allowDashes` is absent and `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['self-service'], throws, false)
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is absent and `allowApostrophes` is true',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, true)
      })
    }
  )

  await t.test(
    'should find dash words when `allowDashes` is absent and `allowApostrophes` is true',
    async function () {
      assert.throws(function () {
        search(tree, ['self-service'], throws, true)
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is true',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, {allowDashes: true})
      })
    }
  )

  await t.test(
    'should not find dash words when `allowDashes` is true',
    async function () {
      assert.doesNotThrow(function () {
        search(tree, ['self-service'], throws, {allowDashes: true})
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, {allowDashes: false})
      })
    }
  )

  await t.test(
    'should find dash words when `allowDashes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['self-service'], throws, {allowDashes: false})
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is true and `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, {
          allowApostrophes: false,
          allowDashes: true
        })
      })
    }
  )

  await t.test(
    'should not find dash words when `allowDashes` is true and `allowApostrophes` is false',
    async function () {
      assert.doesNotThrow(function () {
        search(tree, ['self-service'], throws, {
          allowApostrophes: false,
          allowDashes: true
        })
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is false and `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, {
          allowApostrophes: false,
          allowDashes: false
        })
      })
    }
  )

  await t.test(
    'should find dash words when `allowDashes` is false and `allowApostrophes` is false',
    async function () {
      assert.throws(function () {
        search(tree, ['self-service'], throws, {
          allowApostrophes: false,
          allowDashes: false
        })
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is true and `allowApostrophes` is true',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, {
          allowApostrophes: true,
          allowDashes: true
        })
      })
    }
  )

  await t.test(
    'should not find dash words when `allowDashes` is true and `allowApostrophes` is true',
    async function () {
      assert.doesNotThrow(function () {
        search(tree, ['self-service'], throws, {
          allowApostrophes: true,
          allowDashes: true
        })
      })
    }
  )

  await t.test(
    'should find non-dash words when `allowDashes` is false and `allowApostrophes` is true',
    async function () {
      assert.throws(function () {
        search(tree, ['selfservice'], throws, {
          allowApostrophes: true,
          allowDashes: false
        })
      })
    }
  )

  await t.test(
    'should find dash words when `allowDashes` is false and `allowApostrophes` is true',
    async function () {
      assert.throws(function () {
        search(tree, ['self-service'], throws, {
          allowApostrophes: true,
          allowDashes: false
        })
      })
    }
  )

  await t.test('should support wild cards (#1)', async function () {
    assert.throws(function () {
      search(tree, ['this * selfservice'], throws)
    })
  })

  await t.test('should support wild cards (#2)', async function () {
    assert.doesNotThrow(function () {
      search(tree, ['that * selfservice'], throws)
    })
  })

  await t.test('should support wild cards (#3)', async function () {
    assert.throws(function () {
      search(tree, ['* selfservice'], throws)
    })
  })

  await t.test('should support wild cards (#4)', async function () {
    assert.doesNotThrow(function () {
      search(tree, ['* zelfzervice'], throws)
    })
  })

  await t.test('should not find literals by default', async function () {
    assert.doesNotThrow(function () {
      search(tree, ['mellow'], throws)
    })
  })

  await t.test(
    'should find literals when given `allowLiterals`',
    async function () {
      search(
        tree,
        ['mellow'],
        function () {
          assert.ok(true)
        },
        {allowLiterals: true}
      )
    }
  )
})

function throws() {
  throw new Error('Should not be called')
}
