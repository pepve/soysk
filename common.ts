
export interface Token {
    type: string;
    name?: string;
    value?: string | number;
}

export function never(arg: never): never {
    throw new Error('Internal error, this should never happen');
}

export interface Program {
    type: 'program';
    statements: Statement[];
}

export type Statement = Assignment | If | Loop | Break | Return | FunctionDefinition | Expression;

export interface Assignment {
    type: 'assignment';
    identifier: string;
    expression: Expression;
    location?: 'global' | 'local';
}

export interface If {
    type: 'if';
    condition: Expression;
    block: Statement[];
}

export interface Loop {
    type: 'loop';
    block: Statement[];
}

export interface Break {
    type: 'break';
}

export interface Return {
    type: 'return';
    expression: Expression;
}

export interface FunctionDefinition {
    type: 'function-definition';
    identifier: string;
    formals: string[];
    body: Statement[];
}

export type Expression = Operation | FunctionCall | Identifier | LiteralNumber;

export interface Operation {
    type: 'equals' | 'add' | 'subtract';
    left: Expression;
    right: Expression;
}

export interface FunctionCall {
    type: 'function-call';
    identifier: string;
    actuals: Expression[];
    location?: 'builtin' | 'user-defined';
}

export interface Identifier {
    type: 'identifier';
    value: string;
    location?: 'global' | 'local';
}

export interface LiteralNumber {
    type: 'literal-number';
    value: number;
}
