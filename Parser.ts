import { Token } from "./lexer";

export class Parser {
    private i = 0;

    public constructor(private tokens: Token[]) { }

    public parse(): {} {
        return { type: 'program', statements: [] };
    }
}
