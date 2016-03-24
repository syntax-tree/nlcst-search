/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nlcst-search
 * @fileoverview Test suite for `nlcst-search`.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var test = require('tape');
var search = require('./');

/*
 * Fixture.
 */

var tree = {
    'type': 'SentenceNode',
    'children': [
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'Don'
                },
                {
                    'type': 'PunctuationNode',
                    'value': '’'
                },
                {
                    'type': 'TextNode',
                    'value': 't'
                }
            ]
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'do'
                }
            ]
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'Block'
                },
                {
                    'type': 'PunctuationNode',
                    'value': '-'
                },
                {
                    'type': 'TextNode',
                    'value': 'level'
                }
            ]
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'or'
                }
            ]
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'PunctuationNode',
            'value': '"'
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'do'
                }
            ]
        },
        {
            'type': 'PunctuationNode',
            'value': '"'
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'or'
                }
            ]
        },
        {
            'type': 'PunctuationNode',
            'value': ','
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'mellow'
                }
            ]
        },
        {
            'type': 'PunctuationNode',
            'value': ','
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'that'
                }
            ]
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'or'
                }
            ]
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'this'
                }
            ]
        },
        {
            'type': 'WhiteSpaceNode',
            'value': ' '
        },
        {
            'type': 'WordNode',
            'children': [
                {
                    'type': 'TextNode',
                    'value': 'hell'
                }
            ]
        }
    ]
};

/*
 * Tests.
 */

test('search(tree, patterns, handle)', function (t) {
    t.plan(42);

    t.throws(
        function () {
            search();
        },
        /Error: Expected node/,
        'should throw when not given a tree'
    );

    t.throws(
        function () {
            search(tree);
        },
        /Error: Expected object for phrases/,
        'should throw when not given phrases'
    );

    search(tree, ['Don’t'], function (nodes, index, parent, phrase) {
        t.deepEqual(nodes, [tree.children[0]], 'should pass nodes');
        t.equal(index, 0, 'should pass the correct index');
        t.equal(parent, tree, 'should pass the parent');
        t.equal(phrase, 'Don’t', 'should pass the phrase');
    });

    search(tree, ['Dont'], function (nodes, index, parent, phrase) {
        var match = [tree.children[0]];
        t.deepEqual(nodes, match, 'should pass nodes (normalized)');
        t.equal(index, 0, 'should pass the correct index (normalized)');
        t.equal(parent, tree, 'should pass the parent (normalized)');
        t.equal(phrase, 'Dont', 'should pass the phrase');
    });

    search(tree, {
        'do': true
    }, function (nodes, index, parent, phrase) {
        var match = [tree.children[2]];
        t.deepEqual(nodes, match, 'should pass nodes (object)');
        t.equal(index, 2, 'should pass the correct index (object)');
        t.equal(parent, tree, 'should pass the parent (object)');
        t.equal(phrase, 'do', 'should pass the phrase (object)');
    });

    search(tree, ['blocklevel'], function (nodes, index, parent, phrase) {
        var match = [tree.children[4]];
        t.deepEqual(nodes, match, 'should pass nodes (normalized 2)');
        t.equal(index, 4, 'should pass the correct index (normalized 2)');
        t.equal(parent, tree, 'should pass the parent (normalized 2)');
        t.equal(phrase, 'blocklevel', 'should pass the phrase');
    });

    var position = -1;
    var results = [
        [[tree.children[0]], 0, tree, 'dont'],
        [[tree.children[2]], 2, tree, 'do']
    ];

    search(tree, ['dont', 'do'], function (nodes, index, parent, phrase) {
        var match = results[++position];
        t.deepEqual(nodes, match[0], 'should pass nodes (phrases)');
        t.equal(index, match[1], 'should pass the correct index (phrases)');
        t.equal(parent, match[2], 'should pass the parent (phrases)');
        t.equal(phrase, match[3], 'should pass the phrase (phrases)');
    });

    search(tree, ['dont do'], function (nodes, index, parent, phrase) {
        var match = tree.children.slice(0, 3);
        t.deepEqual(nodes, match, 'should pass nodes (phrase)');
        t.equal(index, 0, 'should pass the correct index (phrase)');
        t.equal(parent, tree, 'should pass the parent (phrase)');
        t.equal(phrase, 'dont do', 'should pass the phrase (phrase)');
    });

    t.doesNotThrow(function () {
        search(tree, ['or that']);
    }, 'should not include non-word and non-white-space nodes');

    var phrases = ['that or this', 'that'];

    position = -1;
    results = [
        [tree.children.slice(17, 22), 17, tree, phrases[0]],
        [[tree.children[17]], 17, tree, phrases[1]]
    ];

    search(tree, phrases, function (nodes, index, parent, phrase) {
        var match = results[++position];
        t.deepEqual(nodes, match[0], 'should pass nodes (phrases)');
        t.equal(index, match[1], 'should pass the correct index (phrases)');
        t.equal(parent, match[2], 'should pass the parent (phrases)');
        t.equal(phrase, match[3], 'should pass the phrase (phrases)');
    });

    t.doesNotThrow(function () {
        search(tree, ['he’ll'], null, true);
    }, 'should not find non-apostrophe words when `allowApostrophes` is true');

    t.doesNotThrow(function () {
        search(tree, ['mellow']);
    }, 'should not find literals by default');

    search(tree, ['mellow'], function () {
        t.pass('should find literals when given `allowLiterals`');
    }, {
        'allowLiterals': true
    });
});
