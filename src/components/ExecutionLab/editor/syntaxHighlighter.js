/**
 * Syntax Highlighter for the Execution Lab Code Editor.
 * Produces HTML spans with inline colors for each token type.
 * Handles edge cases gracefully — never throws on malformed input.
 */

// Color palette — matches the NexusLearn cyber-dark aesthetic
const THEME = {
  keyword:     '#c084fc',  // purple-400 — let, const, if, for, function, return
  control:     '#f472b6',  // pink-400 — if, else, for, while, do, break, continue
  declaration: '#818cf8',  // indigo-400 — let, const, var, function
  identifier:  '#e2e8f0',  // slate-200 — variables
  function:    '#67e8f9',  // cyan-300 — function names
  number:      '#fbbf24',  // amber-400
  string:      '#86efac',  // green-300
  boolean:     '#fb923c',  // orange-400
  null:        '#94a3b8',  // slate-400
  operator:    '#f472b6',  // pink-400
  punctuation: '#64748b',  // slate-500
  comment:     '#475569',  // slate-600
  property:    '#7dd3fc',  // sky-300
  method:      '#67e8f9',  // cyan-300
  builtin:     '#c4b5fd',  // violet-300 — console, Math, Array, etc.
  default:     '#e2e8f0',
};

const DECLARATION_KEYWORDS = new Set(['let', 'const', 'var', 'function']);
const CONTROL_KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do',
  'break', 'continue', 'return', 'typeof', 'switch', 'case', 'default', 'new', 'class'
]);
const BUILTINS = new Set([
  'console', 'Math', 'Array', 'Object', 'String', 'Number',
  'JSON', 'parseInt', 'parseFloat', 'isNaN', 'Infinity', 'NaN',
  'setTimeout', 'setInterval', 'Promise', 'Date', 'Map', 'Set',
  'Error', 'RegExp', 'Symbol', 'Boolean'
]);

/**
 * Escapes HTML special characters
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Tokenizes source code into highlight tokens.
 * This is a forgiving tokenizer that never throws — it falls back to
 * plain text rendering for any unexpected characters.
 */
function highlightTokenize(source) {
  const tokens = [];
  let i = 0;

  function peek(offset = 0) {
    return i + offset < source.length ? source[i + offset] : '';
  }

  function advance() {
    return source[i++];
  }

  function readWhile(pred) {
    let result = '';
    while (i < source.length && pred(source[i])) {
      result += advance();
    }
    return result;
  }

  while (i < source.length) {
    const ch = peek();

    // Newlines — preserve literally
    if (ch === '\n') {
      tokens.push({ type: 'newline', value: advance() });
      continue;
    }

    // Whitespace (non-newline)
    if (/[ \t\r]/.test(ch)) {
      tokens.push({ type: 'whitespace', value: readWhile(c => /[ \t\r]/.test(c)) });
      continue;
    }

    // Single-line comments
    if (ch === '/' && peek(1) === '/') {
      let comment = '';
      while (i < source.length && peek() !== '\n') {
        comment += advance();
      }
      tokens.push({ type: 'comment', value: comment });
      continue;
    }

    // Multi-line comments
    if (ch === '/' && peek(1) === '*') {
      let comment = advance() + advance(); // /*
      while (i < source.length && !(peek() === '*' && peek(1) === '/')) {
        comment += advance();
      }
      if (i < source.length) {
        comment += advance() + advance(); // */
      }
      tokens.push({ type: 'comment', value: comment });
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = advance();
      let str = quote;
      while (i < source.length) {
        const c = advance();
        str += c;
        if (c === '\\' && i < source.length) {
          str += advance();
          continue;
        }
        if (c === quote) break;
      }
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Numbers
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(peek(1)))) {
      let num = readWhile(c => /[\d.eExXa-fA-F_]/.test(c));
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      const ident = readWhile(c => /[a-zA-Z0-9_$]/.test(c));

      if (DECLARATION_KEYWORDS.has(ident)) {
        tokens.push({ type: 'declaration', value: ident });
      } else if (CONTROL_KEYWORDS.has(ident)) {
        tokens.push({ type: 'control', value: ident });
      } else if (ident === 'true' || ident === 'false') {
        tokens.push({ type: 'boolean', value: ident });
      } else if (ident === 'null' || ident === 'undefined') {
        tokens.push({ type: 'null', value: ident });
      } else if (BUILTINS.has(ident)) {
        tokens.push({ type: 'builtin', value: ident });
      } else {
        // Look-ahead: is this followed by '(' ? Then it's a function call
        let j = i;
        while (j < source.length && source[j] === ' ') j++;
        if (source[j] === '(') {
          tokens.push({ type: 'function', value: ident });
        } else if (tokens.length > 0 && tokens[tokens.length - 1].value === '.') {
          // After a dot — it's a property/method
          let k = j;
          while (k < source.length && source[k] === ' ') k++;
          if (source[k] === '(') {
            tokens.push({ type: 'method', value: ident });
          } else {
            tokens.push({ type: 'property', value: ident });
          }
        } else {
          tokens.push({ type: 'identifier', value: ident });
        }
      }
      continue;
    }

    // Multi-char operators
    const twoChar = ch + peek(1);
    const threeChar = ch + peek(1) + peek(2);
    if (['===', '!=='].includes(threeChar)) {
      advance(); advance(); advance();
      tokens.push({ type: 'operator', value: threeChar });
      continue;
    }
    if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '=>', '**'].includes(twoChar)) {
      advance(); advance();
      tokens.push({ type: 'operator', value: twoChar });
      continue;
    }

    // Single-char operators
    if (['+', '-', '*', '/', '%', '<', '>', '!', '=', '?', '&', '|', '^', '~'].includes(ch)) {
      advance();
      tokens.push({ type: 'operator', value: ch });
      continue;
    }

    // Punctuation
    if (['(', ')', '{', '}', '[', ']', ';', ',', ':', '.'].includes(ch)) {
      advance();
      tokens.push({ type: 'punctuation', value: ch });
      continue;
    }

    // Fallback — unknown character
    tokens.push({ type: 'default', value: advance() });
  }

  return tokens;
}

/**
 * Highlights JavaScript source code and returns styled HTML string.
 * The output preserves exact whitespace and line breaks for overlay alignment.
 */
export function highlightCode(source) {
  if (!source) return '';

  const tokens = highlightTokenize(source);
  let html = '';

  for (const token of tokens) {
    if (token.type === 'newline') {
      html += '\n';
    } else if (token.type === 'whitespace') {
      html += token.value;
    } else {
      const color = THEME[token.type] || THEME.default;
      const escaped = escapeHtml(token.value);
      if (token.type === 'comment') {
        html += `<span style="color:${color};font-style:italic">${escaped}</span>`;
      } else if (token.type === 'declaration' || token.type === 'control') {
        html += `<span style="color:${color};font-weight:600">${escaped}</span>`;
      } else {
        html += `<span style="color:${color}">${escaped}</span>`;
      }
    }
  }

  return html;
}
