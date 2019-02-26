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
            function fib(n) {
                if (n == 0) {
                    return 1;
                }
                if (n == 1) {
                    return 1;
                }
                return fib(n - 1) + fib(n - 2);
            }

            i := 0;
            loop {
                if (i == 10) {
                    break;
                }
                print(i);
                print(fib(i));
                i := i + 1;
            }
            `);
        assert.deepEqual(tokens, [
            { type: 'keyword', name: 'function' },
            { type: 'identifier', value: 'fib' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'n' },
            { type: 'right-paren' },
            { type: 'left-brace' },
            { type: 'keyword', name: 'if' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'n' },
            { type: 'equals' },
            { type: 'literal-number', value: 0 },
            { type: 'right-paren' },
            { type: 'left-brace' },
            { type: 'keyword', name: 'return' },
            { type: 'literal-number', value: 1 },
            { type: 'semicolon' },
            { type: 'right-brace' },
            { type: 'keyword', name: 'if' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'n' },
            { type: 'equals' },
            { type: 'literal-number', value: 1 },
            { type: 'right-paren' },
            { type: 'left-brace' },
            { type: 'keyword', name: 'return' },
            { type: 'literal-number', value: 1 },
            { type: 'semicolon' },
            { type: 'right-brace' },
            { type: 'keyword', name: 'return' },
            { type: 'identifier', value: 'fib' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'n' },
            { type: 'subtract' },
            { type: 'literal-number', value: 1 },
            { type: 'right-paren' },
            { type: 'add' },
            { type: 'identifier', value: 'fib' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'n' },
            { type: 'subtract' },
            { type: 'literal-number', value: 2 },
            { type: 'right-paren' },
            { type: 'semicolon' },
            { type: 'right-brace' },
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
            { type: 'identifier', value: 'print' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'i' },
            { type: 'right-paren' },
            { type: 'semicolon' },
            { type: 'identifier', value: 'print' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'fib' },
            { type: 'left-paren' },
            { type: 'identifier', value: 'i' },
            { type: 'right-paren' },
            { type: 'right-paren' },
            { type: 'semicolon' },
            { type: 'identifier', value: 'i' },
            { type: 'assignment' },
            { type: 'identifier', value: 'i' },
            { type: 'add' },
            { type: 'literal-number', value: 1 },
            { type: 'semicolon' },
            { type: 'right-brace' }]);
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
                    identifier: 'answer',
                    expression: { type: 'literal-number', value: 42 },
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
                    actuals: [],
                },
                {
                    type: 'function-call',
                    identifier: 'answer',
                    actuals: [
                        { type: 'literal-number', value: 42 },
                    ],
                },
                {
                    type: 'function-call',
                    identifier: 'answer',
                    actuals: [
                        { type: 'literal-number', value: 45 },
                        { type: 'literal-number', value: 46 },
                    ],
                },
            ],
        });
    });

    it('should parse simple function definitions', () => {
        const ast = (new Parser(lexer('function simple() {}'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                {
                    type: 'function-definition',
                    identifier: 'simple',
                    formals: [],
                    body: [],
                },
            ],
        });
    });

    it('should parse more complex function definitions', () => {
        const ast = (new Parser(lexer('function complex(a, b) { if (a) { return b; } return a; }'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                {
                    type: 'function-definition',
                    identifier: 'complex',
                    formals: ['a', 'b'],
                    body: [
                        {
                            type: 'if',
                            condition: { type: 'identifier', value: 'a' },
                            block: [
                                {
                                    type: 'return',
                                    expression: { type: 'identifier', value: 'b' },
                                },
                            ],
                        },
                        {
                            type: 'return',
                            expression: { type: 'identifier', value: 'a' },
                        },
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

    it('should parse more binary operators and parentheses', () => {
        const ast = (new Parser(lexer('1 - 2 + 3; (1 - 2) + 3;'))).parse();
        assert.deepEqual(ast, {
            type: 'program',
            statements: [
                {
                    type: 'subtract',
                    left: { type: 'literal-number', value: 1 },
                    right: {
                        type: 'add',
                        left: { type: 'literal-number', value: 2 },
                        right: { type: 'literal-number', value: 3 },
                    },
                },
                {
                    type: 'add',
                    left: {
                        type: 'subtract',
                        left: { type: 'literal-number', value: 1 },
                        right: { type: 'literal-number', value: 2 },
                    },
                    right: { type: 'literal-number', value: 3 },
                },
            ],
        });
    });
});
