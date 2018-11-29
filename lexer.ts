
export interface Token {
    type: string;
    name?: string;
    value?: string | number;
}

export function lexer(text: string): Token[] {
    const tokens = [];
    let i = 0;

    while (i < text.length) {
        if (/[ \t\n]/.test(text[i])) {
            i++;
        } else if (/[a-z]/.test(text[i])) {
            const start = i;
            while (/[a-z]/.test(text[i])) {
                i++;
            }
            const str = text.substring(start, i);
            if (['loop', 'if', 'break'].includes(str)) {
                tokens.push({ type: 'keyword', name: str });
            } else {
                tokens.push({ type: 'identifier', value: str });
            }
        } else if (/[0-9]/.test(text[i])) {
            const start = i;
            while (/[0-9]/.test(text[i])) {
                i++;
            }
            tokens.push({ type: 'literal-number', value: Number(text.substring(start, i)) });
        } else if (text[i] === '(') {
            tokens.push({ type: 'left-paren' });
            i++;
        } else if (text[i] === ')') {
            tokens.push({ type: 'right-paren' });
            i++;
        } else if (text[i] === '{') {
            tokens.push({ type: 'left-brace' });
            i++;
        } else if (text[i] === '}') {
            tokens.push({ type: 'right-brace' });
            i++;
        } else if (text[i] === ',') {
            tokens.push({ type: 'comma' });
            i++;
        } else if (text[i] === ';') {
            tokens.push({ type: 'semicolon' });
            i++;
        } else if (text[i] === ':' && text[i + 1] === '=') {
            tokens.push({ type: 'assignment' });
            i += 2;
        } else if (text[i] === '=' && text[i + 1] === '=') {
            tokens.push({ type: 'equals' });
            i += 2;
        } else {
            throw new Error(`Unexpected: ${text[i]}`);
        }
    }

    return tokens;
}
