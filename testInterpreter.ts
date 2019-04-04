import { assert } from 'chai';
import 'mocha';
import { checker } from './checker';
import { Assignment } from './common';
import { evaluateExpression, interpreter } from './interpreter';
import { lexer } from './lexer';
import { Parser } from './Parser';

function expressionTest(expressionText: string, expected: number) {
    it(`${expressionText} = ${expected}`, () => {
        const tokens = lexer(`x := ${expressionText};`);
        const parser = new Parser(tokens);
        const ast = parser.parse();
        checker(ast);
        const expressionAst = (ast.statements[0] as Assignment).expression;
        const result = evaluateExpression(expressionAst);
        assert.equal(result, expected);
    });
}

function interpreterTest(text: string, expected: string) {
    it(`Output of ${JSON.stringify(text)} is ${JSON.stringify(expected)}`, () => {
        const tokens = lexer(text);
        const parser = new Parser(tokens);
        const ast = parser.parse();
        checker(ast);
        const result = interpreter(ast);
        assert.equal(result, expected);
    });
}

describe('Interpreter', () => {
    describe('evaluate literals', () => {
        expressionTest('5', 5);
    });

    describe('evaluate simple expressions', () => {
        expressionTest('6 + 1', 7);
        expressionTest('7 - 1', 6);
        expressionTest('8 == 8', 1);
        expressionTest('9 == 10', 0);
        expressionTest('3 - 4', -1);
    });

    describe('evaluate more expressions', () => {
        expressionTest('(11 - 12) + 13', 12);
        expressionTest('11 - (12 + 13)', -14);
        expressionTest('3 + 1 + 4 + 1 + 5', 14);
        expressionTest('20 + 21 - (22 + 23 - 24)', 20);
        expressionTest('31 == 32 - 1', 1);
        expressionTest('31 == 32 + 1', 0);
        expressionTest('(33 == 33) + 1', 2);
        expressionTest('(33 == 34) - 1', -1);
    });

    describe('empty program', () => {
        interpreterTest('', '');
    });

    describe('print', () => {
        interpreterTest('print(42);', '42\n');
        interpreterTest('print(1 + 1);', '2\n');
        expressionTest('print(1337)', 0);
        interpreterTest('print(1); print(2); print(3);', '1\n2\n3\n');
        interpreterTest('99 + print(4);', '4\n');
        interpreterTest('print(print(1));', '1\n0\n');
    });

    describe('global variables', () => {
        interpreterTest('a := 15; print(a);', '15\n');
        interpreterTest('a := 16 + 1; print(a);', '17\n');
        interpreterTest('a := 17; b := a - 1; print(b);', '16\n');
        interpreterTest('a := 18; a := a + 1; print(a);', '19\n');
        interpreterTest('a := 19; a := a + a; print(a);', '38\n');
    });

    describe('if statements', () => {
        // Work in progress
    });

    describe('loop and break', () => {
        // Work in progress
    });

    describe('super simple functions (without arguments and without return)', () => {
        // Work in progress
    });

    describe('functions with return', () => {
        // Work in progress
    });

    describe('functions with arguments', () => {
        // Work in progress
    });

    describe('more functions', () => {
        // Work in progress
    });

    describe('resursive functions', () => {
        // Work in progress
    });
});
