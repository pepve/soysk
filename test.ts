import { assert } from 'chai';
import 'mocha';
import { lexer } from './lexer';
import { Parser } from './Parser';

describe('Lexer', () => {
    it('should tokenize nothing', () => {
        const tokens = lexer('');
        assert.deepEqual(tokens, []);
    });

    it('should tokenize simple assignment', () => {
        const tokens = lexer('answer := 42;');
        assert.deepEqual(tokens, [
            { type: 'identifier', value: 'answer' },
            { type: 'assignment' },
            { type: 'literal-number', value: 42 },
            { type: 'semicolon' },
        ]);
    });

    it('should tokenize something', () => {
        const tokens = lexer(`
            total := 0;

            i := 0;
            loop {
                if (i == 10) {
                    break;
                }
                total := sum(total, 1);
            }

            print(total);
            `);
        assert.deepEqual(tokens, [
            { type: 'identifier', value: 'total' },
            { type: 'assignment' },
            { type: 'literal-number', value: 0 },
            { type: 'semicolon' },
            { type: 'identifier', value: 'i' },
            { type: 'assignment' },
            { type: 'literal-number', value: 0 },
            { type: 'semicolon' },
            { type: 'keyword', name: 'loop' },
            { type: 'left-brace' },
            { type: 'keyword', name: 'if' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'i' },
            { type: 'equals' },
            { type: 'literal-number', value: 10 },
            { type: 'right-paren' },
            { type: 'left-brace' },
            { type: 'keyword', name: 'break' },
            { type: 'semicolon' },
            { type: 'right-brace' },
            { type: 'identifier', value: 'total' },
            { type: 'assignment' },
            { type: 'identifier', value: 'sum' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'total' },
            { type: 'comma' },
            { type: 'literal-number', value: 1 },
            { type: 'right-paren' },
            { type: 'semicolon' },
            { type: 'right-brace' },
            { type: 'identifier', value: 'print' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'total' },
            { type: 'right-paren' },
            { type: 'semicolon' },
        ]);
    });
});

describe('Parser', () => {
    it('should parse nothing', () => {
        const ast = (new Parser(lexer(''))).parse();
        assert.deepEqual(ast, { type: 'program', statements: [] });
    });

    it('should parse simple expressions', () => {
        const ast = (new Parser(lexer('42; foo; foo == 42;'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                { type: 'literal-number', value: 42 },
                { type: 'identifier', value: 'foo' },
                {
                    type: 'equals',
                    left: { type: 'identifier', value: 'foo' },
                    right: { type: 'literal-number', value: 42 },
                },
            ],
        });
    });

    it('should parse simple assignment', () => {
        const ast = (new Parser(lexer('answer := 42;'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                {
                    type: 'assignment',
                    left: { type: 'identifier', value: 'answer' },
                    right: { type: 'literal-number', value: 42 },
                },
            ],
        });
    });

    it('should parse function calls', () => {
        const ast = (new Parser(lexer('answer(); answer(42); answer(45, 46);'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                {
                    type: 'function-call',
                    identifier: 'answer',
                    args: [],
                },
                {
                    type: 'function-call',
                    identifier: 'answer',
                    args: [
                        { type: 'literal-number', value: 42 },
                    ],
                },
                {
                    type: 'function-call',
                    identifier: 'answer',
                    args: [
                        { type: 'literal-number', value: 45 },
                        { type: 'literal-number', value: 46 },
                    ],
                },
            ],
        });
    });

    it('should parse simple loop', () => {
        const ast = (new Parser(lexer('loop { break; }'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                {
                    type: 'loop',
                    block: [
                        { type: 'break' },
                    ],
                },
            ],
        });
    });

    it('should parse simple if', () => {
        const ast = (new Parser(lexer('if (45) { 46; }'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                {
                    type: 'if',
                    condition: { type: 'literal-number', value: 45 },
                    block: [
                        { type: 'literal-number', value: 46 },
                    ],
                },
            ],
        });
    });
});
