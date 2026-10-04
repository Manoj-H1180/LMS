import { TokenType } from './lexer.js';

/**
 * Educational AST Parser for JavaScript.
 * Builds an explicit, structured AST annotated with exact line and column numbers.
 */
export function parse(tokens) {
  let current = 0;

  function peek(offset = 0) {
    return tokens[current + offset] || { type: TokenType.EOF, value: '', line: -1, col: -1 };
  }

  function isAtEnd() {
    return peek().type === TokenType.EOF;
  }

  function advance() {
    if (!isAtEnd()) current++;
    return tokens[current - 1];
  }

  function check(type, value = null) {
    if (isAtEnd()) return false;
    const t = peek();
    if (t.type !== type) return false;
    if (value !== null && t.value !== value) return false;
    return true;
  }

  function match(type, value = null) {
    if (check(type, value)) {
      return advance();
    }
    return null;
  }

  function consume(type, value = null, errorMsg = '') {
    if (check(type, value)) {
      return advance();
    }
    const t = peek();
    throw new Error(
      errorMsg || `Expected '${value || type}' but found '${t.value || t.type}' at line ${t.line}, col ${t.col}`
    );
  }

  function parseProgram() {
    const body = [];
    while (!isAtEnd()) {
      // Ignore stray semicolons
      if (match(TokenType.PUNCTUATION, ';')) continue;
      body.push(parseStatement());
    }
    return { type: 'Program', body, line: 1 };
  }

  function parseStatement() {
    const t = peek();

    // Variable declaration
    if (t.type === TokenType.KEYWORD && ['let', 'const', 'var'].includes(t.value)) {
      return parseVariableDeclaration();
    }

    // If statement
    if (t.type === TokenType.KEYWORD && t.value === 'if') {
      return parseIfStatement();
    }

    // For statement
    if (t.type === TokenType.KEYWORD && t.value === 'for') {
      return parseForStatement();
    }

    // While statement
    if (t.type === TokenType.KEYWORD && t.value === 'while') {
      return parseWhileStatement();
    }

    // Do-While statement
    if (t.type === TokenType.KEYWORD && t.value === 'do') {
      return parseDoWhileStatement();
    }

    // Break
    if (t.type === TokenType.KEYWORD && t.value === 'break') {
      const kw = advance();
      match(TokenType.PUNCTUATION, ';');
      return { type: 'BreakStatement', line: kw.line };
    }

    // Continue
    if (t.type === TokenType.KEYWORD && t.value === 'continue') {
      const kw = advance();
      match(TokenType.PUNCTUATION, ';');
      return { type: 'ContinueStatement', line: kw.line };
    }

    // Function declaration
    if (t.type === TokenType.KEYWORD && t.value === 'function') {
      return parseFunctionDeclaration();
    }

    // Return statement
    if (t.type === TokenType.KEYWORD && t.value === 'return') {
      const kw = advance();
      let argument = null;
      if (!check(TokenType.PUNCTUATION, ';') && !check(TokenType.PUNCTUATION, '}')) {
        argument = parseExpression();
      }
      match(TokenType.PUNCTUATION, ';');
      return { type: 'ReturnStatement', argument, line: kw.line };
    }

    // Block statement
    if (t.type === TokenType.PUNCTUATION && t.value === '{') {
      return parseBlockStatement();
    }

    // Expression statement
    const expr = parseExpression();
    match(TokenType.PUNCTUATION, ';');
    return { type: 'ExpressionStatement', expression: expr, line: expr.line };
  }

  function parseBlockStatement() {
    const open = consume(TokenType.PUNCTUATION, '{');
    const body = [];
    while (!check(TokenType.PUNCTUATION, '}') && !isAtEnd()) {
      if (match(TokenType.PUNCTUATION, ';')) continue;
      body.push(parseStatement());
    }
    consume(TokenType.PUNCTUATION, '}', 'Expected "}" to close block');
    return { type: 'BlockStatement', body, line: open.line };
  }

  function parseVariableDeclaration() {
    const kindTok = advance(); // let, const, or var
    const declarations = [];

    do {
      const idTok = consume(TokenType.IDENTIFIER, null, 'Expected variable name');
      let init = null;
      if (match(TokenType.OPERATOR, '=')) {
        init = parseExpression();
      }
      declarations.push({
        id: { type: 'Identifier', name: idTok.value, line: idTok.line },
        init
      });
    } while (match(TokenType.PUNCTUATION, ','));

    match(TokenType.PUNCTUATION, ';');
    return {
      type: 'VariableDeclaration',
      kind: kindTok.value,
      declarations,
      line: kindTok.line
    };
  }

  function parseIfStatement() {
    const ifTok = advance();
    consume(TokenType.PUNCTUATION, '(', 'Expected "(" after "if"');
    const test = parseExpression();
    consume(TokenType.PUNCTUATION, ')', 'Expected ")" after condition');

    let consequent;
    if (check(TokenType.PUNCTUATION, '{')) {
      consequent = parseBlockStatement();
    } else {
      consequent = parseStatement();
    }

    let alternate = null;
    if (match(TokenType.KEYWORD, 'else')) {
      if (check(TokenType.KEYWORD, 'if')) {
        alternate = parseIfStatement();
      } else if (check(TokenType.PUNCTUATION, '{')) {
        alternate = parseBlockStatement();
      } else {
        alternate = parseStatement();
      }
    }

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
      line: ifTok.line
    };
  }

  function parseForStatement() {
    const forTok = advance();
    consume(TokenType.PUNCTUATION, '(', 'Expected "(" after "for"');

    let init = null;
    if (!check(TokenType.PUNCTUATION, ';')) {
      if (check(TokenType.KEYWORD, 'let') || check(TokenType.KEYWORD, 'var') || check(TokenType.KEYWORD, 'const')) {
        init = parseVariableDeclaration(); // will consume trailing ';'
      } else {
        init = parseExpression();
        consume(TokenType.PUNCTUATION, ';', 'Expected ";" after for init');
      }
    } else {
      advance(); // skip ;
    }

    let test = null;
    if (!check(TokenType.PUNCTUATION, ';')) {
      test = parseExpression();
    }
    consume(TokenType.PUNCTUATION, ';', 'Expected ";" after for condition');

    let update = null;
    if (!check(TokenType.PUNCTUATION, ')')) {
      update = parseExpression();
    }
    consume(TokenType.PUNCTUATION, ')', 'Expected ")" after for update');

    let body;
    if (check(TokenType.PUNCTUATION, '{')) {
      body = parseBlockStatement();
    } else {
      body = parseStatement();
    }

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body,
      line: forTok.line
    };
  }

  function parseWhileStatement() {
    const whileTok = advance();
    consume(TokenType.PUNCTUATION, '(', 'Expected "(" after "while"');
    const test = parseExpression();
    consume(TokenType.PUNCTUATION, ')', 'Expected ")" after while condition');

    let body;
    if (check(TokenType.PUNCTUATION, '{')) {
      body = parseBlockStatement();
    } else {
      body = parseStatement();
    }

    return {
      type: 'WhileStatement',
      test,
      body,
      line: whileTok.line
    };
  }

  function parseDoWhileStatement() {
    const doTok = advance();
    let body;
    if (check(TokenType.PUNCTUATION, '{')) {
      body = parseBlockStatement();
    } else {
      body = parseStatement();
    }

    consume(TokenType.KEYWORD, 'while', 'Expected "while" after do body');
    consume(TokenType.PUNCTUATION, '(', 'Expected "(" after while');
    const test = parseExpression();
    consume(TokenType.PUNCTUATION, ')', 'Expected ")" after while condition');
    match(TokenType.PUNCTUATION, ';');

    return {
      type: 'DoWhileStatement',
      body,
      test,
      line: doTok.line
    };
  }

  function parseFunctionDeclaration() {
    const fnTok = advance();
    const idTok = consume(TokenType.IDENTIFIER, null, 'Expected function name');
    consume(TokenType.PUNCTUATION, '(', 'Expected "(" after function name');

    const params = [];
    if (!check(TokenType.PUNCTUATION, ')')) {
      do {
        const paramTok = consume(TokenType.IDENTIFIER, null, 'Expected parameter name');
        params.push({ type: 'Identifier', name: paramTok.value, line: paramTok.line });
      } while (match(TokenType.PUNCTUATION, ','));
    }
    consume(TokenType.PUNCTUATION, ')', 'Expected ")" after parameter list');

    const body = parseBlockStatement();

    return {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: idTok.value, line: idTok.line },
      params,
      body,
      line: fnTok.line
    };
  }

  // Expression Parsing with standard precedence
  function parseExpression() {
    return parseAssignment();
  }

  function parseAssignment() {
    const expr = parseLogicalOr();

    if (
      check(TokenType.OPERATOR, '=') ||
      check(TokenType.OPERATOR, '+=') ||
      check(TokenType.OPERATOR, '-=') ||
      check(TokenType.OPERATOR, '*=') ||
      check(TokenType.OPERATOR, '/=') ||
      check(TokenType.OPERATOR, '%=')
    ) {
      const op = advance();
      const right = parseAssignment();
      return {
        type: 'AssignmentExpression',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }

    return expr;
  }

  function parseLogicalOr() {
    let expr = parseLogicalAnd();
    while (check(TokenType.OPERATOR, '||')) {
      const op = advance();
      const right = parseLogicalAnd();
      expr = { type: 'LogicalExpression', operator: op.value, left: expr, right, line: op.line };
    }
    return expr;
  }

  function parseLogicalAnd() {
    let expr = parseEquality();
    while (check(TokenType.OPERATOR, '&&')) {
      const op = advance();
      const right = parseEquality();
      expr = { type: 'LogicalExpression', operator: op.value, left: expr, right, line: op.line };
    }
    return expr;
  }

  function parseEquality() {
    let expr = parseRelational();
    while (
      check(TokenType.OPERATOR, '===') ||
      check(TokenType.OPERATOR, '!==') ||
      check(TokenType.OPERATOR, '==') ||
      check(TokenType.OPERATOR, '!=')
    ) {
      const op = advance();
      const right = parseRelational();
      expr = { type: 'BinaryExpression', operator: op.value, left: expr, right, line: op.line };
    }
    return expr;
  }

  function parseRelational() {
    let expr = parseAdditive();
    while (
      check(TokenType.OPERATOR, '<') ||
      check(TokenType.OPERATOR, '<=') ||
      check(TokenType.OPERATOR, '>') ||
      check(TokenType.OPERATOR, '>=')
    ) {
      const op = advance();
      const right = parseAdditive();
      expr = { type: 'BinaryExpression', operator: op.value, left: expr, right, line: op.line };
    }
    return expr;
  }

  function parseAdditive() {
    let expr = parseMultiplicative();
    while (check(TokenType.OPERATOR, '+') || check(TokenType.OPERATOR, '-')) {
      const op = advance();
      const right = parseMultiplicative();
      expr = { type: 'BinaryExpression', operator: op.value, left: expr, right, line: op.line };
    }
    return expr;
  }

  function parseMultiplicative() {
    let expr = parseUnary();
    while (check(TokenType.OPERATOR, '*') || check(TokenType.OPERATOR, '/') || check(TokenType.OPERATOR, '%')) {
      const op = advance();
      const right = parseUnary();
      expr = { type: 'BinaryExpression', operator: op.value, left: expr, right, line: op.line };
    }
    return expr;
  }

  function parseUnary() {
    if (check(TokenType.OPERATOR, '!') || check(TokenType.OPERATOR, '-') || check(TokenType.OPERATOR, '+') || check(TokenType.KEYWORD, 'typeof')) {
      const op = advance();
      const arg = parseUnary();
      return { type: 'UnaryExpression', operator: op.value, argument: arg, line: op.line };
    }

    if (check(TokenType.OPERATOR, '++') || check(TokenType.OPERATOR, '--')) {
      const op = advance();
      const arg = parseUnary();
      return { type: 'UpdateExpression', operator: op.value, argument: arg, prefix: true, line: op.line };
    }

    return parsePostfix();
  }

  function parsePostfix() {
    let expr = parseCallOrMember();

    if (check(TokenType.OPERATOR, '++') || check(TokenType.OPERATOR, '--')) {
      const op = advance();
      return { type: 'UpdateExpression', operator: op.value, argument: expr, prefix: false, line: op.line };
    }

    return expr;
  }

  function parseCallOrMember() {
    let expr = parsePrimary();

    while (true) {
      if (match(TokenType.PUNCTUATION, '(')) {
        const args = [];
        if (!check(TokenType.PUNCTUATION, ')')) {
          do {
            args.push(parseExpression());
          } while (match(TokenType.PUNCTUATION, ','));
        }
        const closeParen = consume(TokenType.PUNCTUATION, ')', 'Expected ")" after argument list');
        expr = {
          type: 'CallExpression',
          callee: expr,
          arguments: args,
          line: expr.line || closeParen.line
        };
      } else if (match(TokenType.PUNCTUATION, '.')) {
        const propTok = consume(TokenType.IDENTIFIER, null, 'Expected property identifier after "."');
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: { type: 'Identifier', name: propTok.value, line: propTok.line },
          computed: false,
          line: expr.line
        };
      } else if (match(TokenType.PUNCTUATION, '[')) {
        const propExpr = parseExpression();
        consume(TokenType.PUNCTUATION, ']', 'Expected "]" after index access');
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: propExpr,
          computed: true,
          line: expr.line
        };
      } else {
        break;
      }
    }

    return expr;
  }

  function parsePrimary() {
    const t = peek();

    // Grouping: ( expr )
    if (match(TokenType.PUNCTUATION, '(')) {
      const expr = parseExpression();
      consume(TokenType.PUNCTUATION, ')', 'Expected ")" after grouping');
      return expr;
    }

    // Literals
    if (t.type === TokenType.NUMBER || t.type === TokenType.STRING || t.type === TokenType.BOOLEAN) {
      advance();
      return { type: 'Literal', value: t.value, raw: t.raw, line: t.line };
    }

    if (t.type === TokenType.NULL) {
      advance();
      return { type: 'Literal', value: null, raw: 'null', line: t.line };
    }

    if (t.type === TokenType.UNDEFINED) {
      advance();
      return { type: 'Literal', value: undefined, raw: 'undefined', line: t.line };
    }

    // Array literal: [ ... ]
    if (match(TokenType.PUNCTUATION, '[')) {
      const elements = [];
      if (!check(TokenType.PUNCTUATION, ']')) {
        do {
          elements.push(parseExpression());
        } while (match(TokenType.PUNCTUATION, ','));
      }
      consume(TokenType.PUNCTUATION, ']', 'Expected "]" to close array literal');
      return { type: 'ArrayExpression', elements, line: t.line };
    }

    // Object literal: { key: value, ... }
    if (match(TokenType.PUNCTUATION, '{')) {
      const properties = [];
      if (!check(TokenType.PUNCTUATION, '}')) {
        do {
          let key;
          if (check(TokenType.IDENTIFIER)) {
            const keyTok = advance();
            key = { type: 'Identifier', name: keyTok.value, line: keyTok.line };
          } else if (check(TokenType.STRING)) {
            const keyTok = advance();
            key = { type: 'Literal', value: keyTok.value, line: keyTok.line };
          } else {
            throw new Error(`Expected object key at line ${peek().line}`);
          }
          consume(TokenType.PUNCTUATION, ':', 'Expected ":" after object key');
          const value = parseExpression();
          properties.push({ key, value });
        } while (match(TokenType.PUNCTUATION, ','));
      }
      consume(TokenType.PUNCTUATION, '}', 'Expected "}" to close object literal');
      return { type: 'ObjectExpression', properties, line: t.line };
    }

    // Identifier
    if (t.type === TokenType.IDENTIFIER) {
      advance();
      return { type: 'Identifier', name: t.value, line: t.line };
    }

    throw new Error(`Unexpected token '${t.value || t.type}' at line ${t.line}, col ${t.col}`);
  }

  return parseProgram();
}
