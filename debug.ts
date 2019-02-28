import { checker } from './checker';
import { lexer } from './lexer';
import { Parser } from './Parser';

// Change text, add breakpoints, hit debug button

const text = `
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
`;

const tokens = lexer(text);
const ast = (new Parser(tokens)).parse();
checker(ast);
