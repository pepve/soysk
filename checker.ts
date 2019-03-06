import {
    Expression,
    never,
    Program,
    Statement,
} from './common';

interface State {
    inLoop: boolean;
    functions: { [key: string]: { arity: number, builtin: boolean } };
    globals: string[];
    locals?: string[];
}

export function checker(ast: Program) {
    const state: State = {
        inLoop: false,
        functions: {
            print: { arity: 1, builtin: true },
        },
        globals: [],
    };
    checkStatements(state, ast.statements);
}

function checkStatements(state: State, statements: Statement[]) {
    for (const statement of statements) {
        switch (statement.type) {
            case 'assignment':
                if (state.locals && state.locals.includes(statement.identifier)) {
                    statement.location = 'local';
                } else if (state.globals.includes(statement.identifier)) {
                    statement.location = 'global';
                } else if (state.functions[statement.identifier] !== undefined) {
                    throw new Error(`Not a variable: ${statement.identifier}`);
                } else if (state.locals) {
                    statement.location = 'local';
                    state.locals.push(statement.identifier);
                } else {
                    statement.location = 'global';
                    state.globals.push(statement.identifier);
                }
                checkExpression(state, statement.expression);
                break;
            case 'if':
                checkExpression(state, statement.condition);
                checkStatements(state, statement.block);
                break;
            case 'loop':
                checkStatements({ ...state, inLoop: true }, statement.block);
                break;
            case 'break':
                if (!state.inLoop) {
                    throw new Error('Unexpected break');
                }
                break;
            case 'return':
                if (!state.locals) {
                    throw new Error('Unexpected return');
                }
                checkExpression(state, statement.expression);
                break;
            case 'function-definition':
                if (state.locals && state.locals.includes(statement.identifier)) {
                    throw new Error(`Function already defined as variable: ${statement.identifier}`);
                } else if (state.globals.includes(statement.identifier)) {
                    throw new Error(`Function already defined as variable: ${statement.identifier}`);
                } else if (state.functions[statement.identifier] !== undefined) {
                    throw new Error(`Function already defined: ${statement.identifier}`);
                }
                state.functions[statement.identifier] = { arity: statement.formals.length, builtin: false };
                const newState = { ...state, locals: [...statement.formals] };
                checkStatements(newState, statement.body);
                break;
            default:
                checkExpression(state, statement);
        }
    }
}

function checkExpression(state: State, expression: Expression) {
    switch (expression.type) {
        case 'equals':
            checkExpression(state, expression.left);
            checkExpression(state, expression.right);
            break;
        case 'add':
            checkExpression(state, expression.left);
            checkExpression(state, expression.right);
            break;
        case 'subtract':
            checkExpression(state, expression.left);
            checkExpression(state, expression.right);
            break;
        case 'function-call':
            if (state.locals && state.locals.includes(expression.identifier)) {
                throw new Error(`Not a function: ${expression.identifier}`);
            } else if (state.globals.includes(expression.identifier)) {
                throw new Error(`Not a function: ${expression.identifier}`);
            } else if (state.functions[expression.identifier] === undefined) {
                throw new Error(`Undefined function: ${expression.identifier}`);
            } else if (state.functions[expression.identifier].arity !== expression.actuals.length) {
                throw new Error(`Wrong number of arguments: for ${expression.identifier}, ` +
                    `expected ${state.functions[expression.identifier]} but got ${expression.actuals.length}`);
            }
            expression.location = state.functions[expression.identifier].builtin ? 'builtin' : 'user-defined';
            for (const actual of expression.actuals) {
                checkExpression(state, actual);
            }
            break;
        case 'identifier':
            if (state.locals && state.locals.includes(expression.value)) {
                expression.location = 'local';
            } else if (state.globals.includes(expression.value)) {
                expression.location = 'global';
            } else if (state.functions[expression.value] !== undefined) {
                throw new Error(`Not a variable: ${expression.value}`);
            } else {
                throw new Error(`Undefined identifier: ${expression.value}`);
            }
            break;
        case 'literal-number':
            break;
        default:
            never(expression);
    }
}
