import { assert } from 'chai';
import 'mocha';
import { checker } from './checker';
import { lexer } from './lexer';
import { Parser } from './Parser';

describe('Checker', () => {
    describe('break', () => {
        it('should work in a loop', () => {
            const ast = (new Parser(lexer('loop { break; }'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });

        it('should not work outside a loop', () => {
            const ast = (new Parser(lexer('loop {} break;'))).parse();
            assert.throws(() => checker(ast), /^Unexpected break/);
        });
    });

    describe.skip('return', () => {
        it('should work in a function', () => {
            const ast = (new Parser(lexer('function simple() { return 1; }'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });

        it('should not work outside a function', () => {
            const ast = (new Parser(lexer('function simple() {} return 1;'))).parse();
            assert.throws(() => checker(ast), /^Unexpected return/);
        });
    });

    describe.skip('basic symbol table', () => {
        it('should error on duplicate function definition', () => {
            const ast = (new Parser(lexer('function foo() {} function foo() {}'))).parse();
            assert.throws(() => checker(ast), /^Function already defined/);
        });

        it('should error on an undefined variable', () => {
            const ast = (new Parser(lexer('foo := fubar;'))).parse();
            assert.throws(() => checker(ast), /^Undefined identifier/);
        });

        it('should error on an undefined function', () => {
            const ast = (new Parser(lexer('fubar();'))).parse();
            assert.throws(() => checker(ast), /^Undefined function/);
        });

        it('should resolve a variable', () => {
            const ast = (new Parser(lexer('one := 1; two := one + 1;'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });

        it('should resolve a function', () => {
            const ast = (new Parser(lexer('function simple() {} simple();'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });

        it('should resolve a formal argument', () => {
            const ast = (new Parser(lexer('function simple(one) { two := one + 1; }'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });
    });

    describe.skip('function scope', () => {
        it('should not be accessible from the global scope', () => {
            const ast = (new Parser(lexer('function simple() { one := 1; } two := one + 1;'))).parse();
            assert.throws(() => checker(ast), /^Undefined identifier/);
        });

        it('should not be accessible from another function scope', () => {
            const ast = (new Parser(lexer('function a() { one := 1; } function b() { two := one + 1; }'))).parse();
            assert.throws(() => checker(ast), /^Undefined identifier/);
        });
    });

    describe.skip('global scope', () => {
        it('should be accessible from the function scope', () => {
            const ast = (new Parser(lexer('one := 1; function simple() { two := one + 1; }'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });
    });

    describe.skip('basic typing', () => {
        it('should error when a variable is called as a function', () => {
            const ast = (new Parser(lexer('one := 1; one();'))).parse();
            assert.throws(() => checker(ast), /^Not a function/);
        });

        it('should error when a function is used as a variable', () => {
            const ast = (new Parser(lexer('function simple() {} two := simple + 1;'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error when a function is used in an assignment', () => {
            const ast = (new Parser(lexer('function simple() {} simple := 42;'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error when a function is called with too few arguments', () => {
            const ast = (new Parser(lexer('function simple(one) {} simple();'))).parse();
            assert.throws(() => checker(ast), /^Wrong number of arguments/);
        });

        it('should error when a function is called with too many arguments', () => {
            const ast = (new Parser(lexer('function simple(one) {} simple(1, 2);'))).parse();
            assert.throws(() => checker(ast), /^Wrong number of arguments/);
        });

        it('should be okay with the correct number of arguments', () => {
            const ast = (new Parser(lexer('function simple(one, two, three) {} simple(1, 2, 3);'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });
    });
});
