import { readFileSync } from 'fs';
import { inspect } from 'util';
import { lexer } from './lexer';
import { Parser } from './Parser';

async function run() {
    try {
        switch (process.argv[2]) {
            case 'lexer': await runLexer(); break;
            case 'parser': await runParser(); break;
            case 'interpret': throw new Error('Interpret not implemented yet');
            case 'repl': throw new Error('Repl not implemented yet');
            case 'compile': throw new Error('Compile not implemented yet');
            default: throw new Error(`Unknown subcommand: ${process.argv[2]}`);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function runLexer() {
    if (!process.argv[3]) {
        console.error('Expected a filename as an argument');
        process.exit(1);
    }
    const text = readFileSync(process.argv[3], 'utf8');
    const tokens = lexer(text);
    console.log(tokens);
}

async function runParser() {
    if (!process.argv[3]) {
        console.error('Expected a filename as an argument');
        process.exit(1);
    }
    const text = readFileSync(process.argv[3], 'utf8');
    const tokens = lexer(text);
    const ast = (new Parser(tokens)).parse();
    console.log(inspect(ast, { depth: Infinity }));
}

run();
