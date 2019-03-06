import {
    Expression,
    never,
    Program,
    Statement,
} from './common';

interface State {
    inLoop: boolean;
}

export function checker(ast: Program) {
    const state: State = {
        inLoop: false,
    };
    checkStatements(state, ast.statements);
}

function checkStatements(state: State, statements: Statement[]) {
    for (const statement of statements) {
        switch (statement.type) {
            case 'assignment':
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
                checkExpression(state, statement.expression);
                break;
            case 'function-definition':
                break;
            default:
                checkExpression(state, statement);
        }
    }
}

function checkExpression(state: State, expression: Expression) {
    switch (expression.type) {
        case 'equals':
            checkExpression(state, expression.right);
            break;
        case 'add':
            checkExpression(state, expression.right);
            break;
        case 'subtract':
            checkExpression(state, expression.right);
            break;
        case 'function-call':
            for (const actual of expression.actuals) {
                checkExpression(state, actual);
            }
            break;
        case 'identifier':
            break;
        case 'literal-number':
            break;
        default:
            never(expression);
    }
}
