import { Token } from "./lexer";

export class Parser {
    private i = 0;

    public constructor(private tokens: Token[]) { }

    public parse(): {} {
        return { type: 'program', statements: this.statements(true) };
    }

    private match(type: string, name?: string, nextType?: string) {
        return this.tokens[this.i].type === type &&
            (!name || this.tokens[this.i].name === name) &&
            (!nextType || this.tokens[this.i + 1].type === nextType);
    }

    private expect(type: string, name?: string, nextType?: string) {
        if (this.match(type, name, nextType)) {
            this.i += nextType ? 2 : 1;
        } else {
            throw new Error(`Expected ${type} but got ${this.tokens[this.i].type}`);
        }
    }

    private statements(toplevel: boolean) {
        const statements = [];
        while (this.i < this.tokens.length) {
            if (this.match('identifier', undefined, 'assignment')) {
                const identifier = { type: 'identifier', value: this.tokens[this.i].value };
                this.i += 2;
                const expression = this.expression();
                this.expect('semicolon');
                statements.push({ type: 'assignment', left: identifier, right: expression });
            } else if (this.match('keyword', 'break')) {
                this.i++;
                this.expect('semicolon');
                statements.push({ type: 'break' });
            } else if (!toplevel && this.match('right-brace')) {
                this.i++;
                return statements;
            } else {
                statements.push(this.expression());
                this.expect('semicolon');
            }
        }
        if (!toplevel) {
            throw new Error('Expected a closing brace but ran into end of file');
        }
        return statements;
    }

    private expression() {
        if (this.match('identifier')) {
            const identifier = { type: 'identifier', value: this.tokens[this.i].value };
            this.i++;
            return identifier;
        } else if (this.match('literal-number')) {
            const literal = { type: 'literal-number', value: this.tokens[this.i].value };
            this.i++;
            return literal;
        } else {
            throw new Error(`Unexpected token: ${this.tokens[this.i].type}`);
        }
    }
}
