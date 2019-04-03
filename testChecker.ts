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

    describe('return', () => {
        it('should work in a function', () => {
            const ast = (new Parser(lexer('function simple() { return 1; }'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });

        it('should not work outside a function', () => {
            const ast = (new Parser(lexer('function simple() {} return 1;'))).parse();
            assert.throws(() => checker(ast), /^Unexpected return/);
        });
    });

    describe('basic symbol table', () => {
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

    describe('function scope', () => {
        it('should not be accessible from the global scope', () => {
            const ast = (new Parser(lexer('function simple() { one := 1; } two := one + 1;'))).parse();
            assert.throws(() => checker(ast), /^Undefined identifier/);
        });

        it('should not be accessible from another function scope', () => {
            const ast = (new Parser(lexer('function a() { one := 1; } function b() { two := one + 1; }'))).parse();
            assert.throws(() => checker(ast), /^Undefined identifier/);
        });
    });

    describe('global scope', () => {
        it('should be accessible from the function scope', () => {
            const ast = (new Parser(lexer('one := 1; function simple() { two := one + 1; }'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });
    });

    describe('block scope', () => {
        it('should not exist', () => {
            const ast = (new Parser(lexer('if (1) { one := 1; } two := one + 1;'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });

        it('should really not exist', () => {
            const ast = (new Parser(lexer('if (1) { one := 1; } function foo() { two := one + 1; }'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });
    });

    describe('basic typing', () => {
        it('should error when a variable is called as a function', () => {
            const ast = (new Parser(lexer('one := 1; one();'))).parse();
            assert.throws(() => checker(ast), /^Not a function/);
        });

        it('should error when a function is used as a global variable', () => {
            const ast = (new Parser(lexer('function simple() {} two := simple + 1;'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error when a function is used in a global assignment', () => {
            const ast = (new Parser(lexer('function simple() {} simple := 42;'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error when a function is used as a local variable', () => {
            const ast = (new Parser(lexer('function simple() { two := simple + 1; }'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error when a function is used in a local assignment', () => {
            const ast = (new Parser(lexer('function simple() { simple := 42; }'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error when a function is used as a local variable in another function', () => {
            const ast = (new Parser(lexer('function foo() {} function simple() { two := foo + 1; }'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error when a function is used in a local assignment in another function', () => {
            const ast = (new Parser(lexer('function foo() {} function simple() { foo := 42; }'))).parse();
            assert.throws(() => checker(ast), /^Not a variable/);
        });

        it('should error on function definition after assignment', () => {
            const ast = (new Parser(lexer('foo := 1; function foo() {}'))).parse();
            assert.throws(() => checker(ast), /^Function already defined as variable/);
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

    describe('builtins', () => {
        it('should be resolved', () => {
            const ast = (new Parser(lexer('print(1);'))).parse();
            assert.doesNotThrow(() => checker(ast));
        });

        it('should check too few arguments', () => {
            const ast = (new Parser(lexer('print();'))).parse();
            assert.throws(() => checker(ast), /^Wrong number of arguments/);
        });

        it('should check too many arguments', () => {
            const ast = (new Parser(lexer('print(1, 2);'))).parse();
            assert.throws(() => checker(ast), /^Wrong number of arguments/);
        });
    });
});
