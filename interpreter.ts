import {
    Expression,
    FunctionDefinition,
    never,
    Program,
    Statement,
} from './common';

interface State {
    output: string[];
    functions: { [key: string]: FunctionDefinition };
    globals: { [key: string]: number };
    locals?: { [key: string]: number };
}

export function interpreter(ast: Program): string {
    const state: State = {
        output: [],
        functions: {},
        globals: {},
    };
    interpretStatements(state, ast.statements);
    return state.output.join('\n') + '\n';
}

function interpretStatements(state: State, statements: Statement[]) {
    for (const statement of statements) {
        switch (statement.type) {
            case 'assignment':
                if (statement.location === 'global') {
                    state.globals[statement.identifier] = evaluateExpression(state, statement.expression);
                } else {
                    state.locals![statement.identifier] = evaluateExpression(state, statement.expression);
                }
                break;
            case 'if':
                if (evaluateExpression(state, statement.condition) !== 0) {
                    interpretStatements(state, statement.block);
                }
                break;
            case 'loop':
                try {
                    while (true) {
                        interpretStatements(state, statement.block);
                    }
                } catch (e) {
                    if (e instanceof Break) {
                        // Break okay
                    } else {
                        throw e;
                    }
                }
                break;
            case 'break':
                throw new Break();
            case 'return':
                throw new Return(evaluateExpression(state, statement.expression));
            case 'function-definition':
                state.functions[statement.identifier] = statement;
                break;
            default:
                evaluateExpression(state, statement);
        }
    }
}

function evaluateExpression(state: State, expression: Expression): number {
    switch (expression.type) {
        case 'equals':
            return evaluateExpression(state, expression.left) === evaluateExpression(state, expression.right) ? 1 : 0;
        case 'add':
            return evaluateExpression(state, expression.left) + evaluateExpression(state, expression.right);
        case 'subtract':
            return evaluateExpression(state, expression.left) - evaluateExpression(state, expression.right);
        case 'function-call':
            if (expression.location === 'builtin') {
                state.output.push(evaluateExpression(state, expression.actuals[0]).toString());
                return 0;
            } else {
                const definition = state.functions[expression.identifier];
                const newState: State = { ...state, locals: {} };
                for (let i = 0; i < definition.formals.length; i++) {
                    const formal = definition.formals[i];
                    const actual = expression.actuals[i];
                    newState.locals![formal] = evaluateExpression(state, actual);
                }
                try {
                    interpretStatements(newState, definition.body);
                } catch (e) {
                    if (e instanceof Return) {
                        return e.value;
                    } else {
                        throw e;
                    }
                }
                return 0;
            }
        case 'identifier':
            if (expression.location === 'global') {
                return state.globals[expression.value];
            } else {
                return state.locals![expression.value];
            }
        case 'literal-number':
            return expression.value;
        default:
            return never(expression);
    }
}

class Break extends Error {
    constructor() {
        super('Break');
    }
}

class Return extends Error {
    constructor(public value: number) {
        super(`Return ${value}`);
    }
}
