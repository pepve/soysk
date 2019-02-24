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

    private statements(toplevel: boolean): {}[] {
        const statements = [];
        while (this.i < this.tokens.length) {
            if (this.match('identifier', undefined, 'assignment')) {
                const identifier = { type: 'identifier', value: this.tokens[this.i].value };
                this.i += 2;
                const expression = this.expression();
                this.expect('semicolon');
                statements.push({ type: 'assignment', left: identifier, right: expression });
            } else if (this.match('keyword', 'if')) {
                this.i++;
                this.expect('left-paren');
                const condition = this.expression();
                this.expect('right-paren');
                this.expect('left-brace');
                const block = this.statements(false);
                statements.push({ type: 'if', condition, block });
            } else if (this.match('keyword', 'loop')) {
                this.i++;
                this.expect('left-brace');
                const block = this.statements(false);
                statements.push({ type: 'loop', block });
            } else if (this.match('keyword', 'break')) {
                this.i++;
                this.expect('semicolon');
                statements.push({ type: 'break' });
            } else if (this.match('keyword', 'return')) {
                this.i++;
                const expression = this.expression();
                this.expect('semicolon');
                statements.push({ type: 'return', expression });
            } else if (toplevel && this.match('keyword', 'function')) {
                statements.push(this.functionDefinition());
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

    private functionDefinition() {
        this.expect('keyword', 'function');
        let identifier;
        if (this.match('identifier')) {
            identifier = this.tokens[this.i].value;
            this.i++;
        } else {
            throw new Error(`Expected function name but got ${this.tokens[this.i].type}`);
        }
        const formals = [];
        this.expect('left-paren');
        if (!this.match('right-paren')) {
            while (true) {
                if (this.match('identifier')) {
                    formals.push(this.tokens[this.i].value);
                    this.i++;
                } else {
                    throw new Error(`Expected formal argument but got ${this.tokens[this.i].type}`);
                }
                if (this.match('right-paren')) {
                    break;
                }
                this.expect('comma');
            }
        }
        this.i++;
        this.expect('left-brace');
        const body = this.statements(false);
        return { type: 'function-definition', identifier, formals, body };
    }

    private expression(): {} {
        const left = this.subExpression();
        if (this.match('equals') || this.match('add') || this.match('subtract')) {
            const type = this.tokens[this.i].type;
            this.i++;
            const right = this.expression();
            return { type, left, right };
        } else {
            return left;
        }
    }

    private subExpression(): {} {
        if (this.match('left-paren')) {
            this.i++;
            const expression = this.expression();
            this.expect('right-paren');
            return expression;
        } else if (this.match('identifier', undefined, 'left-paren')) {
            const identifier = this.tokens[this.i].value;
            this.i++;
            const actuals = [];
            this.expect('left-paren');
            if (!this.match('right-paren')) {
                while (true) {
                    actuals.push(this.expression());
                    if (this.match('right-paren')) {
                        break;
                    }
                    this.expect('comma');
                }
            }
            this.i++;
            return { type: 'function-call', identifier, actuals };
        } else if (this.match('identifier')) {
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
