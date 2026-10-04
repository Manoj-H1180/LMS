/**
 * Auto-format JavaScript source code.
 * A lightweight, zero-dependency formatter designed for the Execution Lab.
 * 
 * Features:
 * - Consistent indentation (2 spaces)
 * - Proper brace placement (K&R style)
 * - Consistent spacing around operators
 * - Clean semicolons
 * - Normalizes blank lines
 */

const INDENT = '  '; // 2 spaces

/**
 * Simple tokenizer specifically for the formatter.
 * Preserves all tokens including whitespace and comments for reconstruction.
 */
function tokenizeForFormat(source) {
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

    // Single-line comment
    if (ch === '/' && peek(1) === '/') {
      let comment = '';
      while (i < source.length && peek() !== '\n') {
        comment += advance();
      }
      tokens.push({ type: 'comment', value: comment });
      continue;
    }

    // Multi-line comment
    if (ch === '/' && peek(1) === '*') {
      let comment = advance() + advance();
      while (i < source.length && !(peek() === '*' && peek(1) === '/')) {
        comment += advance();
      }
      if (i < source.length) {
        comment += advance() + advance();
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

    // Whitespace
    if (/\s/.test(ch)) {
      readWhile(c => /\s/.test(c));
      tokens.push({ type: 'ws', value: ' ' });
      continue;
    }

    // Numbers
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(peek(1)))) {
      tokens.push({ type: 'number', value: readWhile(c => /[\d.eExXa-fA-F_]/.test(c)) });
      continue;
    }

    // Identifiers
    if (/[a-zA-Z_$]/.test(ch)) {
      tokens.push({ type: 'ident', value: readWhile(c => /[a-zA-Z0-9_$]/.test(c)) });
      continue;
    }

    // Multi-char operators
    const two = ch + peek(1);
    const three = ch + peek(1) + peek(2);
    if (['===', '!=='].includes(three)) {
      advance(); advance(); advance();
      tokens.push({ type: 'op', value: three });
      continue;
    }
    if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '=>', '**'].includes(two)) {
      advance(); advance();
      tokens.push({ type: 'op', value: two });
      continue;
    }

    // Single char
    advance();
    tokens.push({ type: 'punct', value: ch });
    continue;
  }

  return tokens;
}

/**
 * Formats JavaScript code.
 */
export function formatCode(source) {
  if (!source || !source.trim()) return source;

  try {
    // Approach: line-based formatting for reliability
    const lines = source.split('\n');
    const result = [];
    let indentLevel = 0;

    for (let li = 0; li < lines.length; li++) {
      let line = lines[li].trim();

      // Skip empty lines but preserve one blank line max
      if (line === '') {
        if (result.length > 0 && result[result.length - 1] !== '') {
          result.push('');
        }
        continue;
      }

      // Decrease indent for lines starting with }, ], or )
      if (/^[}\])]/.test(line)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      // Handle else, else if, case, default that follow closing brace
      if (/^(else|else\s+if|case\b|default\s*:)/.test(line) && indentLevel > 0 && !line.startsWith('}')) {
        // Keep the same indent level
      }
      // Handle } else, } else if
      if (/^}\s*(else|catch|finally)/.test(line)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Apply operator spacing
      line = applyOperatorSpacing(line);

      // Apply semicolons at end of statements
      line = applyTrailingSemicolon(line);

      // Build indented line
      const indented = INDENT.repeat(indentLevel) + line;
      result.push(indented);

      // Increase indent for lines ending with {
      const stripped = line.replace(/\/\/.*$/, '').trim();
      if (stripped.endsWith('{')) {
        indentLevel++;
      }
    }

    // Clean up: remove trailing blank lines
    while (result.length > 0 && result[result.length - 1].trim() === '') {
      result.pop();
    }

    return result.join('\n') + '\n';
  } catch (e) {
    // On any error, return the original code untouched
    return source;
  }
}

/**
 * Apply consistent spacing around operators.
 */
function applyOperatorSpacing(line) {
  // Don't modify strings or comments
  const parts = splitPreservingStringsAndComments(line);
  
  return parts.map(part => {
    if (part.isProtected) return part.value;

    let s = part.value;

    // Space around assignment and comparison operators
    // Match = but not ==, ===, =>, !=, !==, <=, >=, +=, -=, *=, /=, %=
    s = s.replace(/(?<!=|!|<|>|\+|-|\*|\/|%)=(?!=|>)/g, ' = ');
    
    // Space around ==, ===, !=, !==
    s = s.replace(/===(?! )/g, '=== ');
    s = s.replace(/(?<! )===/g, ' ===');
    s = s.replace(/!==(?! )/g, '!== ');
    s = s.replace(/(?<! )!==/g, ' !==');
    s = s.replace(/==(?!=)(?! )/g, '== ');
    s = s.replace(/(?<! |!)(?<!=)==(?!=)/g, ' ==');
    s = s.replace(/!=(?!=)(?! )/g, '!= ');
    s = s.replace(/(?<! )!=(?!=)/g, ' !=');

    // Space around <=, >=
    s = s.replace(/<=(?! )/g, '<= ');
    s = s.replace(/(?<! )<=/g, ' <=');
    s = s.replace(/>=(?! )/g, '>= ');
    s = s.replace(/(?<! )>=/g, ' >=');

    // Space around &&, ||
    s = s.replace(/&&(?! )/g, '&& ');
    s = s.replace(/(?<! )&&/g, ' &&');
    s = s.replace(/\|\|(?! )/g, '|| ');
    s = s.replace(/(?<! )\|\|/g, ' ||');

    // Space around +=, -=, *=, /=, %=
    s = s.replace(/\+=(?! )/g, '+= ');
    s = s.replace(/(?<! )\+=/g, ' +=');
    s = s.replace(/-=(?! )/g, '-= ');
    s = s.replace(/(?<! )-=/g, ' -=');
    s = s.replace(/\*=(?! )/g, '*= ');
    s = s.replace(/(?<! )\*=/g, ' *=');
    s = s.replace(/\/=(?! )/g, '/= ');
    s = s.replace(/(?<! )\/=/g, ' /=');

    // Space after commas
    s = s.replace(/,(?! )/g, ', ');

    // Space after semicolons in for loops
    s = s.replace(/;(?! |\n|$)/g, '; ');

    // Space before { 
    s = s.replace(/(?<! ){/g, ' {');
    
    // Clean up multiple spaces (except indentation)
    s = s.replace(/  +/g, ' ');

    return s;
  }).join('');
}

/**
 * Add trailing semicolons to statements that need them.
 */
function applyTrailingSemicolon(line) {
  const trimmed = line.trim();

  // Don't add semicolons to:
  if (!trimmed) return line;
  if (trimmed.endsWith(';')) return line;
  if (trimmed.endsWith('{')) return line;
  if (trimmed.endsWith('}')) return line;
  if (trimmed.endsWith(',')) return line;
  if (trimmed.startsWith('//')) return line;
  if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.endsWith('*/')) return line;
  if (trimmed.startsWith('if') || trimmed.startsWith('else') || trimmed.startsWith('for') || trimmed.startsWith('while') || trimmed.startsWith('do')) return line;
  if (trimmed.startsWith('function')) return line;
  if (trimmed.startsWith('case ') || trimmed.startsWith('default:')) return line;
  if (trimmed === '') return line;

  // Add semicolons to lines that look like statements
  if (/^(let|const|var|return)\b/.test(trimmed) ||
      /^[a-zA-Z_$][\w$]*(\.[a-zA-Z_$][\w$]*)*\s*\(/.test(trimmed) || // function calls
      /^[a-zA-Z_$][\w$]*\s*(=|\+=|-=|\*=|\/=|%=)/.test(trimmed) ||    // assignments
      /^[a-zA-Z_$][\w$]*(\+\+|--)$/.test(trimmed) ||                   // increment/decrement
      /^(\+\+|--)[a-zA-Z_$][\w$]*$/.test(trimmed) ||                   // pre-increment
      /^\)$/.test(trimmed)) {
    return line + ';';
  }

  return line;
}

/**
 * Splits a line into protected (strings/comments) and unprotected segments.
 */
function splitPreservingStringsAndComments(line) {
  const parts = [];
  let i = 0;
  let current = '';

  function flush() {
    if (current) {
      parts.push({ value: current, isProtected: false });
      current = '';
    }
  }

  while (i < line.length) {
    const ch = line[i];

    // String
    if (ch === '"' || ch === "'" || ch === '`') {
      flush();
      let str = ch;
      i++;
      while (i < line.length) {
        const c = line[i];
        str += c;
        i++;
        if (c === '\\' && i < line.length) {
          str += line[i];
          i++;
          continue;
        }
        if (c === ch) break;
      }
      parts.push({ value: str, isProtected: true });
      continue;
    }

    // Single-line comment
    if (ch === '/' && i + 1 < line.length && line[i + 1] === '/') {
      flush();
      parts.push({ value: line.substring(i), isProtected: true });
      return parts;
    }

    current += ch;
    i++;
  }

  flush();
  return parts;
}
