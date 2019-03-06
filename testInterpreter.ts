import { assert } from 'chai';
import 'mocha';
import { checker } from './checker';
import { interpreter } from './interpreter';
import { lexer } from './lexer';
import { Parser } from './Parser';

function run(text: string) {
    const ast = (new Parser(lexer(text))).parse();
    checker(ast);
    return interpreter(ast);
}

describe('Interpreter', () => {
    it('should print 42', () => {
        const output = run('print(42);');
        assert.equal(output, '42\n');
    });

    it('should do addition', () => {
        const output = run('print(40 + 2);');
        assert.equal(output, '42\n');
    });

    it('should do inequality', () => {
        const output = run('print(40 == 2);');
        assert.equal(output, '0\n');
    });

    it('should do equality', () => {
        const output = run('print(42 == 42);');
        assert.equal(output, '1\n');
    });

    it('should do global assignment', () => {
        const output = run('one := 1; print(one);');
        assert.equal(output, '1\n');
    });

    it('should run an if', () => {
        const output = run('if (0) { print(1); } if (1) { print(2); }');
        assert.equal(output, '2\n');
    });

    it('should break a loop', () => {
        const output = run('loop { print(3); break; }');
        assert.equal(output, '3\n');
    });

    it('should do a count', () => {
        const output = run('i := 4; loop { if (i == 7) { break; } print(i); i := i + 1; }');
        assert.equal(output, '4\n5\n6\n');
    });

    it('should perform a function call', () => {
        const output = run('function simple() { print(1337); } simple();');
        assert.equal(output, '1337\n');
    });

    it('should perform a function call and resolve an argument', () => {
        const output = run('function simple(n) { print(n); } simple(1338);');
        assert.equal(output, '1338\n');
    });

    it('should perform a function call and return a value', () => {
        const output = run('function simple() { return 1339; } print(simple());');
        assert.equal(output, '1339\n');
    });

    it('should perform a function call and return a value from an if', () => {
        const output = run('function simple(n) { if (n == 1340) { return 1341; } return n; } print(simple(1340));');
        assert.equal(output, '1341\n');
    });

    it('should perform a function call and return a value from a loop', () => {
        const output = run('function simple() { loop { return 1342; } } print(simple());');
        assert.equal(output, '1342\n');
    });

    it('should do recursion', () => {
        const output = run('function f(n) { print(n); if (n) { f(n - 1); } } f(3);');
        assert.equal(output, '3\n2\n1\n0\n');
    });

    it('should maintain a proper stack', () => {
        const output = run('function f(n) { l := n; if (n) { f(n - 1); } print(l); } f(3);');
        assert.equal(output, '0\n1\n2\n3\n');
    });
});
