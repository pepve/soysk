import { Expression, never, Program, Statement } from './common';

export function checker(ast: Program) {
    if (ast.type !== 'program') {
        throw new Error(`Internal error, expected program but got ${ast.type}`);
    }
    checkStatements(ast.statements);
}

function checkStatements(statements: Statement[]) {
    for (const statement of statements) {
        switch (statement.type) {
            case 'assignment':
                checkExpression(statement.expression);
                break;
            case 'if':
                checkExpression(statement.condition);
                checkStatements(statement.block);
                break;
            case 'loop':
                checkStatements(statement.block);
                break;
            case 'break':
                break;
            case 'return':
                checkExpression(statement.expression);
                break;
            case 'function-definition':
                checkStatements(statement.body);
                break;
            default:
                checkExpression(statement);
        }
    }
}

function checkExpression(expression: Expression) {
    switch (expression.type) {
        case 'equals':
            checkExpression(expression.left);
            checkExpression(expression.right);
            break;
        case 'add':
            checkExpression(expression.left);
            checkExpression(expression.right);
            break;
        case 'subtract':
            checkExpression(expression.left);
            checkExpression(expression.right);
            break;
        case 'function-call':
            for (const actual of expression.actuals) {
                checkExpression(actual);
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
