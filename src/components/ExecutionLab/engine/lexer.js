/**
 * Safe, zero-dependency Lexer for beginner-to-intermediate JavaScript.
 * Tracks line and column numbers for precise visualizer highlighting and error reporting.
 */

export const TokenType = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',
  UNDEFINED: 'UNDEFINED',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  EOF: 'EOF'
};

const KEYWORDS = new Set([
  'let', 'const', 'var',
  'if', 'else',
  'for', 'while', 'do',
  'break', 'continue',
  'function', 'return',
  'typeof'
]);

export function tokenize(source) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;

  function peek(offset = 0) {
    return i + offset < source.length ? source[i + offset] : '';
  }

  function advance() {
    const ch = source[i++];
    if (ch === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  while (i < source.length) {
    const ch = peek();

    // 1. Whitespace
    if (/\s/.test(ch)) {
      advance();
      continue;
    }

    // 2. Comments
    if (ch === '/' && peek(1) === '/') {
      // Single-line comment
      while (i < source.length && peek() !== '\n') {
        advance();
      }
      continue;
    }
    if (ch === '/' && peek(1) === '*') {
      // Multi-line comment
      advance(); // /
      advance(); // *
      while (i < source.length && !(peek() === '*' && peek(1) === '/')) {
        advance();
      }
      if (i < source.length) { advance(); advance(); }
      continue;
    }

    const startLine = line;
    const startCol = col;

    // 3. Numbers
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(peek(1)))) {
      let numStr = '';
      while (i < source.length && (/[\d.]/.test(peek()))) {
        numStr += advance();
      }
      tokens.push({
        type: TokenType.NUMBER,
        value: parseFloat(numStr),
        raw: numStr,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // 4. Strings ('...' or "..." or `...`)
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = advance();
      let strVal = '';
      let closed = false;
      while (i < source.length) {
        const c = advance();
        if (c === '\\') {
          if (i < source.length) {
            const nextC = advance();
            if (nextC === 'n') strVal += '\n';
            else if (nextC === 't') strVal += '\t';
            else strVal += nextC;
          }
          continue;
        }
        if (c === quote) {
          closed = true;
          break;
        }
        strVal += c;
      }
      if (!closed) {
        throw new Error(`Unterminated string at line ${startLine}, col ${startCol}`);
      }
      tokens.push({
        type: TokenType.STRING,
        value: strVal,
        raw: `${quote}${strVal}${quote}`,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // 5. Multi-character Operators: ===, !==, ==, !=, <=, >=, &&, ||, ++, --, +=, -=, *=, /=, %=, =>
    const twoChar = ch + peek(1);
    const threeChar = ch + peek(1) + peek(2);

    if (threeChar === '===' || threeChar === '!==') {
      advance(); advance(); advance();
      tokens.push({ type: TokenType.OPERATOR, value: threeChar, line: startLine, col: startCol });
      continue;
    }

    if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '=>'].includes(twoChar)) {
      advance(); advance();
      tokens.push({ type: TokenType.OPERATOR, value: twoChar, line: startLine, col: startCol });
      continue;
    }

    // 6. Single character Operators: +, -, *, /, %, <, >, !, =
    if (['+', '-', '*', '/', '%', '<', '>', '!', '='].includes(ch)) {
      advance();
      tokens.push({ type: TokenType.OPERATOR, value: ch, line: startLine, col: startCol });
      continue;
    }

    // 7. Punctuation: (, ), {, }, [, ], ;, ,, :, .
    if (['(', ')', '{', '}', '[', ']', ';', ',', ':', '.'].includes(ch)) {
      advance();
      tokens.push({ type: TokenType.PUNCTUATION, value: ch, line: startLine, col: startCol });
      continue;
    }

    // 8. Identifiers and Keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let ident = '';
      while (i < source.length && /[a-zA-Z0-9_$]/.test(peek())) {
        ident += advance();
      }

      if (ident === 'true' || ident === 'false') {
        tokens.push({ type: TokenType.BOOLEAN, value: ident === 'true', raw: ident, line: startLine, col: startCol });
      } else if (ident === 'null') {
        tokens.push({ type: TokenType.NULL, value: null, raw: 'null', line: startLine, col: startCol });
      } else if (ident === 'undefined') {
        tokens.push({ type: TokenType.UNDEFINED, value: undefined, raw: 'undefined', line: startLine, col: startCol });
      } else if (KEYWORDS.has(ident)) {
        tokens.push({ type: TokenType.KEYWORD, value: ident, line: startLine, col: startCol });
      } else {
        tokens.push({ type: TokenType.IDENTIFIER, value: ident, line: startLine, col: startCol });
      }
      continue;
    }

    // Unknown char
    throw new Error(`Unexpected character '${ch}' at line ${startLine}, col ${startCol}`);
  }

  tokens.push({ type: TokenType.EOF, value: '', line, col });
  return tokens;
}
