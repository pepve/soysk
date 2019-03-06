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

    describe.skip('builtins', () => {
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

    describe.skip('location location location', () => {
        it('should set the location on simple global variables', () => {
            const ast = (new Parser(lexer('one := 1; two := one + 1;'))).parse();
            checker(ast);
            assert.deepEqual(ast, {
                type: 'program',
                statements: [
                    {
                        type: 'assignment',
                        identifier: 'one',
                        expression: { type: 'literal-number', value: 1 },
                        location: 'global',
                    },
                    {
                        type: 'assignment',
                        identifier: 'two',
                        expression: {
                            type: 'add',
                            left: { type: 'identifier', value: 'one', location: 'global' },
                            right: { type: 'literal-number', value: 1 },
                        },
                        location: 'global',
                    },
                ],
            });
        });

        it('should set the location on user defined functions', () => {
            const ast = (new Parser(lexer('function simple() {} simple();'))).parse();
            checker(ast);
            assert.deepEqual(ast, {
                type: 'program',
                statements: [
                    {
                        type: 'function-definition',
                        identifier: 'simple',
                        formals: [],
                        body: [],
                    },
                    {
                        type: 'function-call',
                        identifier: 'simple',
                        actuals: [],
                        location: 'user-defined',
                    },
                ],
            });
        });

        it('should set the location on builtin functions', () => {
            const ast = (new Parser(lexer('print(42);'))).parse();
            checker(ast);
            assert.deepEqual(ast, {
                type: 'program',
                statements: [
                    {
                        type: 'function-call',
                        identifier: 'print',
                        actuals: [{ type: 'literal-number', value: 42 }],
                        location: 'builtin',
                    },
                ],
            });
        });

        it('should set the location on global in a function', () => {
            const ast = (new Parser(lexer('g := 10; function get() { return g; }'))).parse();
            checker(ast);
            assert.deepEqual(ast, {
                type: 'program',
                statements: [
                    {
                        type: 'assignment',
                        identifier: 'g',
                        expression: { type: 'literal-number', value: 10 },
                        location: 'global',
                    },
                    {
                        type: 'function-definition',
                        identifier: 'get',
                        formals: [],
                        body: [
                            {
                                type: 'return',
                                expression: { type: 'identifier', value: 'g', location: 'global' },
                            },
                        ],
                    },
                ],
            });
        });

        it('should set the location on local in a function', () => {
            const ast = (new Parser(lexer('function get() { l := 10; return l; }'))).parse();
            checker(ast);
            assert.deepEqual(ast, {
                type: 'program',
                statements: [
                    {
                        type: 'function-definition',
                        identifier: 'get',
                        formals: [],
                        body: [
                            {
                                type: 'assignment',
                                identifier: 'l',
                                expression: { type: 'literal-number', value: 10 },
                                location: 'local',
                            },
                            {
                                type: 'return',
                                expression: { type: 'identifier', value: 'l', location: 'local' },
                            },
                        ],
                    },
                ],
            });
        });

        it('should set the location on a fomal parameter in a function', () => {
            const ast = (new Parser(lexer('function get(f) { return f; }'))).parse();
            checker(ast);
            assert.deepEqual(ast, {
                type: 'program',
                statements: [
                    {
                        type: 'function-definition',
                        identifier: 'get',
                        formals: ['f'],
                        body: [
                            {
                                type: 'return',
                                expression: { type: 'identifier', value: 'f', location: 'local' },
                            },
                        ],
                    },
                ],
            });
        });
    });
});
