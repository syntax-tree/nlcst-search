/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nlcst:search
 * @fileoverview Search for patterns in an NLCST tree.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var visit = require('unist-util-visit');
var normalize = require('nlcst-normalize');
var isLiteral = require('nlcst-is-literal');

/*
 * Methods.
 */

var has = Object.prototype.hasOwnProperty;

/*
 * Constants (characters).
 */

var C_SPACE = ' ';

/*
 * Constants (types).
 */

var T_WORD = 'WordNode';
var T_WHITE_SPACE = 'WhiteSpaceNode';

/**
 * Search.
 *
 * @param {Node} tree - NLCST node.
 * @param {Object|Array.<string>} phrases - Phrases to
 *   search for.  When `object`, searches for its keys.
 * @param {Function} handler - Handler.
 * @param {Object?} [options] - Configuration.
 */
function search(tree, phrases, handler, options) {
    var settings = options || {};
    var apos = settings.allowApostrophes || options;
    var dashes = settings.allowDashes || false;
    var literals = settings.allowLiterals;
    var byWord = {};
    var config;
    var length;
    var index;
    var key;
    var firstWord;

    config = {
        'allowApostrophes': apos,
        'allowDashes': dashes
    };

    /**
     * Handle a phrase.
     *
     * @param {string} phrase - Phrase to search for.
     */
    function handlePhrase(phrase) {
        firstWord = normalize(phrase.split(C_SPACE, 1)[0], config);

        if (has.call(byWord, firstWord)) {
            byWord[firstWord].push(phrase);
        } else {
            byWord[firstWord] = [phrase];
        }
    }

    if (!tree || !tree.type) {
        throw new Error('Expected node');
    }

    if (typeof phrases !== 'object') {
        throw new Error('Expected object for phrases');
    }

    length = phrases.length;
    index = -1;

    if ('length' in phrases) {
        while (++index < length) {
            handlePhrase(phrases[index]);
        }
    } else {
        for (key in phrases) {
            handlePhrase(key);
        }
    }

    /**
     * Test a phrase.
     *
     * @param {string} phrase - Phrase to search for.
     * @param {number} position - Position at which the
     *   first word of `phrase` exists.
     * @param {Node} parent - Parent of `node`.
     */
    function test(phrase, position, parent) {
        var siblings = parent.children;
        var node = siblings[position];
        var count = siblings.length;
        var queue = [node];
        var expression = phrase.split(C_SPACE).slice(1);
        var length = expression.length;
        var index = -1;

        /*
         * Move one position forward.
         */

        position++;

        /*
         * Iterate over `expression`.
         */

        while (++index < length) {
            /*
             * Allow joining white-space.
             */

            while (position < count) {
                node = siblings[position];

                if (node.type !== T_WHITE_SPACE) {
                    break;
                }

                queue.push(node);
                position++;
            }

            node = siblings[position];

            /*
             * Exit if there are no nodes left, if the
             * current node is not a word, or if the
             * current word does not match the search for
             * value.
             */

            if (
                !node ||
                node.type !== T_WORD ||
                normalize(expression[index], config)
                !==
                normalize(node, config)
            ) {
                return null;
            }

            queue.push(node);
            position++;
        }

        return queue;
    }

    /**
     * Visitor for `WordNode`s.
     *
     * @param {Node} node - Word.
     * @param {number} position - Position of `node` in
     *   `parent`.
     * @param {Node} parent - Parent of `node`.
     */
    function visitor(node, position, parent) {
        var word;
        var phrases;
        var length;
        var index;
        var result;

        if (!literals && isLiteral(parent, position)) {
            return;
        }

        word = normalize(node, config);
        phrases = has.call(byWord, word) ? byWord[word] : [];
        length = phrases.length;
        index = -1;

        while (++index < length) {
            result = test(phrases[index], position, parent);

            if (result) {
                handler(result, position, parent, phrases[index]);
            }
        }
    }

    /*
     * Search the tree.
     */

    visit(tree, T_WORD, visitor);
}

/*
 * Expose.
 */

module.exports = search;
