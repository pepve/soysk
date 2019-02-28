import { assert } from 'chai';
import 'mocha';
import { lexer } from './lexer';

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
