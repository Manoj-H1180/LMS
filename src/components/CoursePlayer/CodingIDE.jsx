'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Terminal,
  Code2,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Zap,
  Brain,
  Bug,
  RefreshCw,
  X,
  BookOpen,
  ClipboardList,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   CALL STACK VISUALIZER
───────────────────────────────────────────────────────── */
function CallStackVisualizer({ frames, currentLine, executionLog }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionLog]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Call Stack Frames */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '10px',
        border: '1px solid rgba(99,102,241,0.3)',
        overflow: 'hidden',
        flex: '0 0 auto'
      }}>
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(99,102,241,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99,102,241,0.1)'
        }}>
          <Layers size={14} color="#818cf8" />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818cf8', letterSpacing: '0.05em' }}>
            CALL STACK
          </span>
        </div>

        {frames.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
            Run code to see the call stack
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {frames.map((frame, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: idx < frames.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: idx === 0 ? 'rgba(99,102,241,0.15)' : 'transparent',
                  animation: idx === 0 ? 'callStackPush 0.3s ease' : 'none'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: idx === 0 ? '#818cf8' : 'rgba(255,255,255,0.2)',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: idx === 0 ? '700' : '500', color: idx === 0 ? '#c4b5fd' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {frame.name}
                  </div>
                  {frame.line !== undefined && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      line {frame.line} {frame.file ? `• ${frame.file}` : ''}
                    </div>
                  )}
                  {frame.locals && Object.keys(frame.locals).length > 0 && (
                    <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Object.entries(frame.locals).slice(0, 4).map(([k, v]) => (
                        <span key={k} style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          background: 'rgba(99,102,241,0.2)',
                          borderRadius: '4px',
                          color: '#a5b4fc',
                          fontFamily: 'monospace'
                        }}>
                          {k}={String(v).slice(0, 20)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                  [{frames.length - idx}]
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution Log */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '10px',
        border: '1px solid rgba(16,185,129,0.2)',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(16,185,129,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16,185,129,0.08)',
          flexShrink: 0
        }}>
          <Cpu size={14} color="#34d399" />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#34d399', letterSpacing: '0.05em' }}>
            EXECUTION TRACE
          </span>
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {executionLog.length === 0 ? (
            <div style={{ padding: '8px', color: 'var(--text-dim)', textAlign: 'center' }}>
              Execution steps will appear here
            </div>
          ) : (
            executionLog.map((entry, idx) => (
              <div key={idx} style={{
                padding: '3px 8px',
                borderRadius: '4px',
                color: entry.type === 'enter' ? '#818cf8' :
                       entry.type === 'return' ? '#34d399' :
                       entry.type === 'error' ? '#f87171' :
                       entry.type === 'assign' ? '#fbbf24' : '#94a3b8',
                background: entry.type === 'error' ? 'rgba(248,113,113,0.1)' :
                            idx === executionLog.length - 1 ? 'rgba(255,255,255,0.05)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ color: 'var(--text-dim)', minWidth: '28px', textAlign: 'right' }}>
                  {entry.line ? `L${entry.line}` : '→'}
                </span>
                <span style={{ opacity: 0.6 }}>
                  {entry.type === 'enter' ? '▶' :
                   entry.type === 'return' ? '◀' :
                   entry.type === 'error' ? '✗' :
                   entry.type === 'assign' ? '=' : '·'}
                </span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ROBUST TOKEN-BASED SYNTAX HIGHLIGHTER
   Works line-by-line with a proper state machine so strings
   and comments never bleed into each other.
───────────────────────────────────────────────────────── */
const THEMES = {
  keyword:   '#c084fc',   // purple  — language keywords
  keyword2:  '#e879f9',   // bright magenta — special keywords (async/await/class)
  builtin:   '#38bdf8',   // sky blue — built-in functions
  funcName:  '#60a5fa',   // blue — function/method names at call sites
  className: '#fb923c',   // orange — class names
  string:    '#86efac',   // green  — string literals
  number:    '#fb923c',   // orange — numeric literals
  comment:   '#6b7280',   // gray   — comments (italic)
  operator:  '#f472b6',   // pink   — operators (=>, ===, etc.)
  bracket:   '#fbbf24',   // amber  — brackets / braces
  property:  '#a5f3fc',   // cyan   — object properties after dot
  decorator: '#f97316',   // orange — decorators (@)
  selfThis:  '#f87171',   // red    — self / this
  boolean:   '#fb923c',   // orange — true/false/None
  plain:     '#e2e8f0',   // default text
};

const JS_KEYWORDS = new Set([
  'function','return','if','else','for','while','do','switch','case','break',
  'continue','let','const','var','new','delete','typeof','instanceof','void',
  'import','export','default','from','of','in','throw','try','catch','finally',
  'yield','static','get','set','super','with','debugger',
]);
const JS_KEYWORDS2 = new Set(['async','await','class','extends','this']);
const JS_BOOLEAN   = new Set(['true','false','null','undefined','NaN','Infinity']);
const JS_BUILTINS  = new Set([
  'console','Math','Array','Object','String','Number','Boolean','Promise',
  'JSON','Date','RegExp','Error','Map','Set','WeakMap','WeakSet','Symbol',
  'parseInt','parseFloat','isNaN','isFinite','encodeURI','decodeURI',
  'setTimeout','setInterval','clearTimeout','clearInterval','fetch',
  'document','window','navigator','location','history','localStorage',
  'sessionStorage','performance','crypto','Proxy','Reflect','globalThis',
]);

const PY_KEYWORDS = new Set([
  'def','return','if','elif','else','for','while','in','not','and','or',
  'import','from','as','pass','break','continue','lambda','yield',
  'try','except','finally','raise','with','del','global','nonlocal','assert',
  'is','async','await',
]);
const PY_KEYWORDS2 = new Set(['class']);
const PY_BOOLEAN   = new Set(['True','False','None']);
const PY_BUILTINS  = new Set([
  'print','len','range','int','str','float','list','dict','tuple','set',
  'type','isinstance','issubclass','input','open','iter','next','enumerate',
  'zip','map','filter','sorted','reversed','sum','min','max','abs','round',
  'hash','id','dir','vars','getattr','setattr','hasattr','callable',
  'super','object','property','staticmethod','classmethod','repr','format',
]);

function span(color, text, extra = '') {
  return `<span style="color:${color}${extra}">${text}</span>`;
}

// Escape HTML special chars (MUST happen first, before we insert span tags)
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Tokenise a single line. Returns an HTML string with span tags.
 * `inBlockComment` / `inBlockString` let callers carry state across lines.
 */
function highlightLine(raw, lang, state) {
  // state = { inBlockComment, inBlockString, blockStringChar }
  let out = '';
  let i = 0;
  const line = raw; // original chars (not escaped yet)

  // ── Helpers ──────────────────────────────────────────────
  const peek = (offset = 0) => line[i + offset] || '';
  const take = () => line[i++];

  // collect an identifier starting at current i
  function readIdent() {
    let s = '';
    while (i < line.length && /[\w$]/.test(line[i])) s += take();
    return s;
  }
  function readDigits() {
    let s = '';
    while (i < line.length && /[\d_.]/.test(line[i])) s += take();
    return s;
  }
  // read until closing delimiter, handling backslash escapes
  function readString(delim) {
    let s = delim;
    take(); // skip opening delimiter already counted
    while (i < line.length) {
      const c = take();
      s += c;
      if (c === '\\') { if (i < line.length) s += take(); continue; }
      if (s.endsWith(delim)) break;
    }
    return s;
  }

  // ── Python triple-quote block string carry-in ─────────────
  if (lang === 'python' && state.inBlockString) {
    const close = state.blockStringChar.repeat(3);
    let acc = '';
    while (i < line.length) {
      if (line.startsWith(close, i)) {
        acc += close; i += 3;
        state.inBlockString = false;
        state.blockStringChar = '';
        break;
      }
      acc += line[i++];
    }
    out += span(THEMES.string, esc(acc));
    if (state.inBlockString) return out; // still inside, whole line consumed
  }

  // ── Main scan loop ────────────────────────────────────────
  while (i < line.length) {
    const c = peek();

    // ── JS line comment //
    if (lang !== 'python' && c === '/' && peek(1) === '/') {
      out += span(THEMES.comment, esc(line.slice(i)), ';font-style:italic');
      i = line.length;
      continue;
    }

    // ── JS block comment /* … */ (single-line portion)
    if (lang !== 'python' && c === '/' && peek(1) === '*') {
      let acc = '';
      take(); take(); // consume /*
      acc = '/*';
      while (i < line.length) {
        if (peek() === '*' && peek(1) === '/') {
          take(); take();
          acc += '*/';
          break;
        }
        acc += take();
      }
      out += span(THEMES.comment, esc(acc), ';font-style:italic');
      continue;
    }

    // ── Python comment #
    if (lang === 'python' && c === '#') {
      out += span(THEMES.comment, esc(line.slice(i)), ';font-style:italic');
      i = line.length;
      continue;
    }

    // ── Python triple-quote strings """ / '''
    if (lang === 'python' && (c === '"' || c === "'") && peek(1) === c && peek(2) === c) {
      const q = c;
      const close = q.repeat(3);
      let acc = close;
      i += 3;
      state.inBlockString = true;
      state.blockStringChar = q;
      while (i < line.length) {
        if (line.startsWith(close, i)) {
          acc += close; i += 3;
          state.inBlockString = false;
          state.blockStringChar = '';
          break;
        }
        acc += line[i++];
      }
      out += span(THEMES.string, esc(acc));
      continue;
    }

    // ── JS template literal `…`
    if (lang !== 'python' && c === '`') {
      take();
      let acc = '`';
      while (i < line.length) {
        const ch = take();
        acc += ch;
        if (ch === '\\') { if (i < line.length) acc += take(); continue; }
        if (ch === '`') break;
      }
      out += span(THEMES.string, esc(acc));
      continue;
    }

    // ── Regular strings: single ' or double "
    if (c === '"' || c === "'") {
      const raw2 = readString(c);
      out += span(THEMES.string, esc(raw2));
      continue;
    }

    // ── Decorator @name (Python)
    if (lang === 'python' && c === '@') {
      take();
      let name = '@';
      while (i < line.length && /[\w.]/.test(peek())) name += take();
      out += span(THEMES.decorator, esc(name));
      continue;
    }

    // ── Numbers: integers, floats, hex, binary
    if (/\d/.test(c) || (c === '.' && /\d/.test(peek(1)))) {
      let num = '';
      if (c === '0' && (peek(1) === 'x' || peek(1) === 'X')) {
        num += take() + take();
        while (/[0-9a-fA-F_]/.test(peek())) num += take();
      } else if (c === '0' && (peek(1) === 'b' || peek(1) === 'B')) {
        num += take() + take();
        while (/[01_]/.test(peek())) num += take();
      } else {
        num = readDigits();
        if (peek() === 'e' || peek() === 'E') {
          num += take();
          if (peek() === '+' || peek() === '-') num += take();
          num += readDigits();
        }
        if (lang !== 'python' && (peek() === 'n')) num += take(); // BigInt
      }
      out += span(THEMES.number, esc(num));
      continue;
    }

    // ── Identifiers / keywords
    if (/[a-zA-Z_$]/.test(c)) {
      const word = readIdent();
      const isCall = peek() === '(';
      const isDot  = out.endsWith('.') || out.endsWith('</span>.');

      if (lang === 'python') {
        if (word === 'self' || word === 'cls') {
          out += span(THEMES.selfThis, esc(word));
        } else if (PY_BOOLEAN.has(word)) {
          out += span(THEMES.boolean, esc(word));
        } else if (PY_KEYWORDS2.has(word)) {
          out += span(THEMES.keyword2, esc(word) + (i < line.length && /\s/.test(peek()) ? '' : ''));
          // class Name — colour the next identifier orange
          if (word === 'class') {
            // skip whitespace
            let ws = '';
            while (i < line.length && /\s/.test(peek())) ws += take();
            if (/[a-zA-Z_]/.test(peek())) {
              const cn = readIdent();
              out += esc(ws) + span(THEMES.className, esc(cn));
            } else {
              out += esc(ws);
            }
          }
        } else if (PY_KEYWORDS.has(word)) {
          out += span(THEMES.keyword, esc(word));
          // def name — colour the function name blue
          if (word === 'def') {
            let ws = '';
            while (i < line.length && /\s/.test(peek())) ws += take();
            if (/[a-zA-Z_]/.test(peek())) {
              const fn = readIdent();
              out += esc(ws) + span(THEMES.funcName, esc(fn));
            } else {
              out += esc(ws);
            }
          }
        } else if (PY_BUILTINS.has(word) && isCall) {
          out += span(THEMES.builtin, esc(word));
        } else if (isDot) {
          out += span(isCall ? THEMES.funcName : THEMES.property, esc(word));
        } else if (isCall) {
          out += span(THEMES.funcName, esc(word));
        } else {
          out += span(THEMES.plain, esc(word));
        }
      } else {
        // JavaScript
        if (word === 'this') {
          out += span(THEMES.selfThis, esc(word));
        } else if (JS_BOOLEAN.has(word)) {
          out += span(THEMES.boolean, esc(word));
        } else if (JS_KEYWORDS2.has(word)) {
          out += span(THEMES.keyword2, esc(word));
          if (word === 'class') {
            let ws = '';
            while (i < line.length && /\s/.test(peek())) ws += take();
            if (/[a-zA-Z_$]/.test(peek())) {
              const cn = readIdent();
              out += esc(ws) + span(THEMES.className, esc(cn));
            } else {
              out += esc(ws);
            }
          }
        } else if (JS_KEYWORDS.has(word)) {
          out += span(THEMES.keyword, esc(word));
          if (word === 'function') {
            let ws = '';
            while (i < line.length && /\s/.test(peek())) ws += take();
            if (/[a-zA-Z_$]/.test(peek())) {
              const fn = readIdent();
              out += esc(ws) + span(THEMES.funcName, esc(fn));
            } else {
              out += esc(ws);
            }
          }
        } else if (JS_BUILTINS.has(word)) {
          out += span(THEMES.builtin, esc(word));
        } else if (isDot) {
          out += span(isCall ? THEMES.funcName : THEMES.property, esc(word));
        } else if (isCall) {
          out += span(THEMES.funcName, esc(word));
        } else {
          out += span(THEMES.plain, esc(word));
        }
      }
      continue;
    }

    // ── Arrow / operators (JS)
    if (lang !== 'python' && c === '=' && peek(1) === '>') {
      out += span(THEMES.operator, esc(take() + take()));
      continue;
    }
    if (lang !== 'python' && ((c === '=' && peek(1) === '=') || (c === '!' && peek(1) === '=') ||
        (c === '<' && peek(1) === '=') || (c === '>' && peek(1) === '='))) {
      out += span(THEMES.operator, esc(take() + take()));
      if (peek() === '=') out += span(THEMES.operator, esc(take()));
      continue;
    }
    // spread / rest
    if (lang !== 'python' && c === '.' && peek(1) === '.' && peek(2) === '.') {
      out += span(THEMES.operator, esc(take() + take() + take()));
      continue;
    }

    // ── Brackets  { } [ ] ( )
    if ('(){}[]'.includes(c)) {
      const depth = out.match(/<span[^>]*>/g)?.length ?? 0;
      const colors = [THEMES.bracket, '#a78bfa', '#34d399'];
      out += span(colors[depth % 3], esc(take()));
      continue;
    }

    // ── Plain char (operators, punctuation, whitespace, etc.)
    out += esc(take());
  }

  return out;
}

/**
 * Highlight a full multi-line string. Returns HTML.
 * Handles block-comment / triple-string state across lines.
 */
function highlightCode(code, language) {
  if (!code) return '';
  const lines = code.split('\n');
  const lang = language === 'python' ? 'python' : 'js';
  const state = { inBlockString: false, blockStringChar: '' };
  return lines.map(line => highlightLine(line, lang, state)).join('\n');
}

/* ─────────────────────────────────────────────────────────
   BACKEND EXECUTION — calls /api/execute (Node child_process)
   Real JS (Node v24) and Python (3.14) with sys.settrace tracing.
───────────────────────────────────────────────────────── */
async function executeOnBackend(code, language) {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Server error ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Execution failed');

  return {
    outputs:    data.output  || [],
    logs:       data.trace   || [],
    finalStack: data.stack   || [],
    elapsed:    data.elapsed ?? 0,
  };
}


/* ─────────────────────────────────────────────────────────
   HUGGINGFACE PROBLEM GENERATOR
───────────────────────────────────────────────────────── */
async function generateProblemWithHF(lessonTitle, lessonContent, language, problemIndex) {
  // Use HuggingFace Inference API with free tier models
  // We'll use the Qwen2.5-Coder model via HF inference
  const prompt = `You are a coding instructor. Generate a coding problem for a student learning about: "${lessonTitle}".
Context: ${(lessonContent || lessonTitle).slice(0, 500)}
Language: ${language}
Problem number: ${problemIndex + 1}

Generate a structured coding problem with this EXACT JSON format:
{
  "title": "Problem title here",
  "difficulty": "Easy|Medium|Hard",
  "description": "Clear problem description",
  "examples": [{"input": "example input", "output": "expected output"}],
  "hints": ["hint 1", "hint 2"],
  "starterCode": "# starter code here\\ndef solution():\\n    pass",
  "solution": "# full solution\\ndef solution():\\n    return 42"
}

Return ONLY valid JSON, nothing else.`;

  try {
    // Try HuggingFace Inference API with a free model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-1.5B-Instruct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No API key needed for public models with rate limits
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 600,
            temperature: 0.7,
            return_full_text: false,
          }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || '';
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title && parsed.description) {
          return parsed;
        }
      }
    }
  } catch {
    // Fall through to local generation
  }

  // Fallback: generate locally based on lesson title
  return generateLocalProblem(lessonTitle, lessonContent, language, problemIndex);
}

function generateLocalProblem(lessonTitle, lessonContent, language, index) {
  const topicKeywords = (lessonTitle + ' ' + (lessonContent || '')).toLowerCase();

  const problems = {
    python: [
      {
        title: `${lessonTitle} — Practice: List Processing`,
        difficulty: 'Easy',
        description: `Based on what you learned in "${lessonTitle}", write a Python function that processes a list.\n\nGiven a list of numbers, return a new list containing only the even numbers, sorted in ascending order.`,
        examples: [{ input: '[5, 2, 8, 1, 4, 3, 6]', output: '[2, 4, 6, 8]' }],
        hints: ['Use a list comprehension with a condition', 'The sorted() function returns a sorted list', 'Even numbers have remainder 0 when divided by 2'],
        starterCode: `def filter_evens(numbers):\n    """Return sorted list of even numbers.\"\"\"\n    # Your code here\n    pass\n\n# Test\nprint(filter_evens([5, 2, 8, 1, 4, 3, 6]))`,
        solution: `def filter_evens(numbers):\n    """Return sorted list of even numbers.\"\"\"\n    return sorted([n for n in numbers if n % 2 == 0])\n\nprint(filter_evens([5, 2, 8, 1, 4, 3, 6]))`
      },
      {
        title: `${lessonTitle} — Practice: String Manipulation`,
        difficulty: 'Medium',
        description: `Applying concepts from "${lessonTitle}", create a function that analyzes text.\n\nWrite a function that takes a string and returns a dictionary with word frequencies (case-insensitive).`,
        examples: [{ input: '"Hello world hello Python"', output: "{'hello': 2, 'world': 1, 'python': 1}" }],
        hints: ['Split the string into words', 'Convert to lowercase for case-insensitivity', 'Use a dictionary to count occurrences'],
        starterCode: `def word_frequency(text):\n    """Count frequency of each word (case-insensitive).\"\"\"\n    # Your code here\n    pass\n\nprint(word_frequency("Hello world hello Python"))`,
        solution: `def word_frequency(text):\n    """Count frequency of each word (case-insensitive).\"\"\"\n    freq = {}\n    for word in text.lower().split():\n        freq[word] = freq.get(word, 0) + 1\n    return freq\n\nprint(word_frequency("Hello world hello Python"))`
      },
      {
        title: `${lessonTitle} — Practice: Recursive Algorithm`,
        difficulty: 'Hard',
        description: `Challenge yourself with a recursive implementation related to "${lessonTitle}".\n\nWrite a recursive function to compute the nth Fibonacci number and return the sequence up to n.`,
        examples: [{ input: 'n = 7', output: '[0, 1, 1, 2, 3, 5, 8]' }],
        hints: ['Base cases: fib(0)=0, fib(1)=1', 'Recursive case: fib(n) = fib(n-1) + fib(n-2)', 'Build the sequence by calling fib for each index'],
        starterCode: `def fibonacci_sequence(n):\n    """Return list of Fibonacci numbers up to index n.\"\"\"\n    # Your code here\n    pass\n\nprint(fibonacci_sequence(7))`,
        solution: `def fibonacci_sequence(n):\n    """Return list of Fibonacci numbers up to index n.\"\"\"\n    def fib(k):\n        if k <= 0: return 0\n        if k == 1: return 1\n        return fib(k-1) + fib(k-2)\n    return [fib(i) for i in range(n)]\n\nprint(fibonacci_sequence(7))`
      }
    ],
    javascript: [
      {
        title: `${lessonTitle} — Practice: Array Methods`,
        difficulty: 'Easy',
        description: `Applying "${lessonTitle}" concepts, use JavaScript array methods.\n\nWrite a function that takes an array of objects (each with a name and score property) and returns the names of students who scored above 70, sorted alphabetically.`,
        examples: [{ input: '[{name:"Alice",score:85},{name:"Bob",score:60},{name:"Carol",score:92}]', output: '["Alice", "Carol"]' }],
        hints: ['Use .filter() to select high scorers', 'Use .map() to extract names', 'Use .sort() for alphabetical ordering'],
        starterCode: `function topStudents(students) {\n  // Your code here\n}\n\nconst students = [\n  { name: "Alice", score: 85 },\n  { name: "Bob", score: 60 },\n  { name: "Carol", score: 92 }\n];\nconsole.log(topStudents(students));`,
        solution: `function topStudents(students) {\n  return students\n    .filter(s => s.score > 70)\n    .map(s => s.name)\n    .sort();\n}\n\nconst students = [\n  { name: "Alice", score: 85 },\n  { name: "Bob", score: 60 },\n  { name: "Carol", score: 92 }\n];\nconsole.log(topStudents(students));`
      },
      {
        title: `${lessonTitle} — Practice: Closure & Scope`,
        difficulty: 'Medium',
        description: `Based on "${lessonTitle}", implement a counter factory using closures.\n\nCreate a makeCounter function that returns an object with increment, decrement, and getCount methods. Each counter should maintain its own state.`,
        examples: [{ input: 'const c = makeCounter(5)', output: 'c.increment() → 6, c.decrement() → 5, c.getCount() → 5' }],
        hints: ['Use closure to capture the count variable', 'Return an object literal with methods', 'The initial value should be a parameter'],
        starterCode: `function makeCounter(initialValue = 0) {\n  // Your code here\n}\n\nconst counter = makeCounter(5);\ncounter.increment();\ncounter.increment();\nconsole.log(counter.getCount()); // 7\ncounter.decrement();\nconsole.log(counter.getCount()); // 6`,
        solution: `function makeCounter(initialValue = 0) {\n  let count = initialValue;\n  return {\n    increment() { count++; },\n    decrement() { count--; },\n    getCount() { return count; }\n  };\n}\n\nconst counter = makeCounter(5);\ncounter.increment();\ncounter.increment();\nconsole.log(counter.getCount());\ncounter.decrement();\nconsole.log(counter.getCount());`
      },
      {
        title: `${lessonTitle} — Practice: Async Programming`,
        difficulty: 'Hard',
        description: `Challenge from "${lessonTitle}": work with Promises and async patterns.\n\nWrite a function that fetches user data (simulated), processes it, and handles errors gracefully. Simulate API calls with setTimeout.`,
        examples: [{ input: 'fetchUser(1)', output: 'User: Alice (age: 25)' }],
        hints: ['Return a Promise from fetchUser', 'Use async/await to handle the promise', 'Use try/catch for error handling'],
        starterCode: `// Simulate an API call\nfunction mockAPI(id) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (id > 0) resolve({ name: "Alice", age: 25 });\n      else reject(new Error("User not found"));\n    }, 100);\n  });\n}\n\nasync function fetchUser(id) {\n  // Your code here\n}\n\nfetchUser(1).then(result => console.log(result));\nfetchUser(-1).then(result => console.log(result));`,
        solution: `function mockAPI(id) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (id > 0) resolve({ name: "Alice", age: 25 });\n      else reject(new Error("User not found"));\n    }, 100);\n  });\n}\n\nasync function fetchUser(id) {\n  try {\n    const user = await mockAPI(id);\n    return \`User: \${user.name} (age: \${user.age})\`;\n  } catch (err) {\n    return \`Error: \${err.message}\`;\n  }\n}\n\nfetchUser(1).then(r => console.log(r));\nfetchUser(-1).then(r => console.log(r));`
      }
    ]
  };

  const langProblems = problems[language] || problems.javascript;
  return langProblems[index % langProblems.length];
}

/* ─────────────────────────────────────────────────────────
   MAIN CODING IDE COMPONENT
───────────────────────────────────────────────────────── */
export default function CodingIDE({ lesson, course }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState([]);
  const [callStack, setCallStack] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'callstack'
  const [problem, setProblem] = useState(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(null);     // last run time in ms
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIdeOpen, setIsIdeOpen] = useState(true);
  const [runCount, setRunCount] = useState(0);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Default starter code per language
  const defaultCode = {
    javascript: `// 🚀 JavaScript Playground\n// Write your code and click Run!\n\nfunction greet(name) {\n  const message = \`Hello, \${name}!\`;\n  console.log(message);\n  return message;\n}\n\nconst names = ["Alice", "Bob", "Carol"];\nnames.forEach(name => greet(name));\n\nconsole.log("\\n📊 Array demo:");\nconst squares = names.map((_, i) => (i + 1) ** 2);\nconsole.log("Squares:", squares);`,
    python: `# 🐍 Python Playground\n# Write your code and click Run!\n\ndef greet(name):\n    message = f"Hello, {name}!"\n    print(message)\n    return message\n\nnames = ["Alice", "Bob", "Carol"]\nfor name in names:\n    greet(name)\n\nprint("\\n📊 List comprehension demo:")\nsquares = [i**2 for i in range(1, 6)]\nprint("Squares:", squares)`
  };

  // Initialize code when language changes or component mounts
  useEffect(() => {
    if (!code || code === defaultCode[language === 'python' ? 'javascript' : 'python']) {
      setCode(defaultCode[language]);
    }
  }, [language]);

  // Sync scroll between textarea and line numbers
  const highlightRef = useRef(null);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = ta.scrollTop;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
  }, []);

  // Handle tab key in editor
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '  ';
      const newCode = code.slice(0, start) + spaces + code.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + spaces.length;
          textareaRef.current.selectionEnd = start + spaces.length;
        }
      });
    }
    // Ctrl+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const handleRun = async () => {
    if (isRunning || !code.trim()) return;
    setIsRunning(true);
    setOutput([{ type: 'info', text: `⏳ Running on server (Node.js / Python 3)…` }]);
    setCallStack([]);
    setExecutionLog([]);
    setActiveTab('output');
    setElapsedMs(null);
    setRunCount(prev => prev + 1);

    try {
      const result = await executeOnBackend(code, language);
      setOutput(result.outputs.length > 0 ? result.outputs : [{ type: 'info', text: '(no output)' }]);
      setExecutionLog(result.logs);
      setCallStack(
        result.finalStack.length > 0
          ? result.finalStack
          : [{ name: language === 'python' ? '__main__' : '<main>', line: 1 }]
      );
      setElapsedMs(result.elapsed);
      setActiveTab('output');
    } catch (err) {
      setOutput([{ type: 'error', text: `❌ ${err.message}` }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleGenerateProblem = async () => {
    setIsGeneratingProblem(true);
    setShowSolution(false);

    try {
      const lessonTitle = lesson?.title || course?.title || 'Programming';
      const lessonContent = lesson?.contentMarkdown || '';
      const newProblem = await generateProblemWithHF(lessonTitle, lessonContent, language, problemIndex);
      setProblem(newProblem);
      setCode(newProblem.starterCode || defaultCode[language]);
      setOutput([]);
      setCallStack([]);
      setExecutionLog([]);
      setProblemIndex(prev => prev + 1);
    } catch (err) {
      console.error('Problem generation failed:', err);
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const lineCount = (code || '').split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const difficultyColor = {
    Easy: '#34d399',
    Medium: '#fbbf24',
    Hard: '#f87171'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(10, 10, 20, 0.95)',
      borderRadius: '16px',
      border: '1px solid rgba(99,102,241,0.25)',
      overflow: 'hidden',
      boxShadow: '0 0 40px rgba(99,102,241,0.1), 0 20px 60px rgba(0,0,0,0.5)',
    }}>
      {/* ── IDE Header Bar ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Window dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['#f87171', '#fbbf24', '#34d399'].map((color, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, opacity: 0.8 }} />
            ))}
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={16} color="#818cf8" />
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#c4b5fd', letterSpacing: '0.02em' }}>
              Code IDE
            </span>
            {runCount > 0 && (
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                background: 'rgba(52,211,153,0.2)',
                borderRadius: '20px',
                color: '#34d399',
                border: '1px solid rgba(52,211,153,0.3)'
              }}>
                {runCount} run{runCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            {['javascript', 'python'].map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setCode(defaultCode[lang]);
                  setOutput([]);
                  setCallStack([]);
                  setExecutionLog([]);
                }}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  background: language === lang ? 'rgba(99,102,241,0.4)' : 'transparent',
                  color: language === lang ? '#c4b5fd' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {lang === 'javascript' ? '🟨' : '🐍'} {lang === 'javascript' ? 'JS' : 'Python'}
              </button>
            ))}
          </div>

          {/* Generate Problem Button */}
          <button
            onClick={handleGenerateProblem}
            disabled={isGeneratingProblem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: isGeneratingProblem ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: '1px solid rgba(139,92,246,0.5)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: isGeneratingProblem ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isGeneratingProblem ? 0.7 : 1
            }}
          >
            {isGeneratingProblem ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={14} />}
            {isGeneratingProblem ? 'Generating…' : 'AI Problem'}
          </button>

          {/* Run Button */}
          <button
            id="ide-run-btn"
            onClick={handleRun}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              background: isRunning ? 'rgba(52,211,153,0.15)' : 'linear-gradient(135deg, #059669, #10b981)',
              border: '1px solid rgba(52,211,153,0.4)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isRunning ? 'none' : '0 0 15px rgba(16,185,129,0.3)'
            }}
          >
            {isRunning ? (
              <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running…</>
            ) : (
              <><Play size={14} fill="currentColor" /> Run <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>(Ctrl+↵)</span></>
            )}
          </button>
        </div>
      </div>

      {/* ── Problem Panel (when a problem is generated) ── */}
      {problem && (
        <div style={{
          background: 'rgba(99,102,241,0.06)',
          borderBottom: '1px solid rgba(99,102,241,0.2)',
          padding: '16px 20px',
          animation: 'slideDown 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <ClipboardList size={14} color="#818cf8" />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI-Generated Problem
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  background: `rgba(${problem.difficulty === 'Easy' ? '52,211,153' : problem.difficulty === 'Medium' ? '251,191,36' : '248,113,113'},0.15)`,
                  border: `1px solid ${difficultyColor[problem.difficulty] || '#818cf8'}33`,
                  borderRadius: '20px',
                  color: difficultyColor[problem.difficulty] || '#818cf8',
                  fontWeight: '700'
                }}>
                  {problem.difficulty}
                </span>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                {problem.title}
              </h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '10px' }}>
                {problem.description}
              </p>

              {problem.examples?.[0] && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '4px' }}>EXAMPLE</div>
                  <div style={{
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    color: '#e2e8f0'
                  }}>
                    <span style={{ color: '#94a3b8' }}>Input: </span>
                    <span style={{ color: '#86efac' }}>{problem.examples[0].input}</span>
                    <br />
                    <span style={{ color: '#94a3b8' }}>Output: </span>
                    <span style={{ color: '#fbbf24' }}>{problem.examples[0].output}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {problem.hints?.slice(0, 2).map((hint, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.73rem',
                    padding: '3px 10px',
                    background: 'rgba(251,191,36,0.1)',
                    border: '1px solid rgba(251,191,36,0.25)',
                    borderRadius: '6px',
                    color: '#fbbf24'
                  }}>
                    💡 {hint}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
              <button
                onClick={() => {
                  setShowSolution(!showSolution);
                  if (!showSolution) setCode(problem.solution || '');
                }}
                style={{
                  padding: '5px 12px',
                  background: showSolution ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${showSolution ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '6px',
                  color: showSolution ? '#34d399' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <CheckCircle2 size={12} /> {showSolution ? 'Hide' : 'Show'} Solution
              </button>
              <button
                onClick={() => setProblem(null)}
                style={{
                  padding: '5px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  color: 'var(--text-dim)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <X size={12} /> Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main IDE Split Layout ───────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(0, 340px)',
        gap: 0,
        minHeight: '420px',
        maxHeight: '600px'
      }}>
        {/* ── Code Editor ──────────────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(99,102,241,0.15)',
          overflow: 'hidden'
        }}>
          {/* Editor Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
              {language === 'javascript' ? 'main.js' : 'main.py'} — {lineCount} lines
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleCopyCode}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem' }}
              >
                {copied ? <><Check size={12} color="#34d399" /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
              <button
                onClick={() => {
                  setCode(defaultCode[language]);
                  setOutput([]);
                  setCallStack([]);
                  setExecutionLog([]);
                  setProblem(null);
                  setShowSolution(false);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem' }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Line Numbers gutter */}
            <div
              ref={lineNumbersRef}
              style={{
                width: '46px',
                background: 'rgba(0,0,0,0.35)',
                borderRight: '1px solid rgba(255,255,255,0.04)',
                padding: '16px 0',
                overflowY: 'hidden',
                flexShrink: 0,
                userSelect: 'none',
                zIndex: 2,
              }}
            >
              {lineNumbers.map(n => (
                <div key={n} style={{
                  height: '22px',
                  lineHeight: '22px',
                  textAlign: 'right',
                  paddingRight: '10px',
                  fontSize: '0.78rem',
                  color: 'rgba(148,163,184,0.35)',
                  fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
                  letterSpacing: '0.02em',
                }}>
                  {n}
                </div>
              ))}
            </div>

            {/* ── Editor layer: highlighted pre + transparent textarea overlay ── */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

              {/* Highlighted code layer (read-only, aria-hidden) */}
              <pre
                ref={highlightRef}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  margin: 0,
                  padding: '16px 16px 16px 12px',
                  fontSize: '0.85rem',
                  lineHeight: '22px',
                  fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
                  whiteSpace: 'pre',
                  wordBreak: 'normal',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  color: THEMES.plain,
                  background: 'transparent',
                  pointerEvents: 'none',
                  zIndex: 1,
                  tabSize: 2,
                  // scrollbar invisible on the pre so only the textarea scrollbar shows
                  scrollbarWidth: 'none',
                }}
                dangerouslySetInnerHTML={{
                  __html: highlightCode(code, language) + '\n' // trailing \n prevents last-line clipping
                }}
              />

              {/* Transparent textarea — captures all user input */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                style={{
                  position: 'absolute',
                  inset: 0,
                  margin: 0,
                  padding: '16px 16px 16px 12px',
                  fontSize: '0.85rem',
                  lineHeight: '22px',
                  fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
                  whiteSpace: 'pre',
                  wordBreak: 'normal',
                  tabSize: 2,
                  background: 'transparent',
                  color: 'transparent',        // text invisible — pre layer shows it
                  caretColor: '#a78bfa',       // caret stays visible
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  zIndex: 2,
                  WebkitTextFillColor: 'transparent', // Safari caret fix
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Right Panel: Output + Call Stack ─────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(5, 5, 15, 0.8)',
          overflow: 'hidden'
        }}>
          {/* Output Tab Bar */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0
          }}>
            {[
              { id: 'output', icon: Terminal, label: 'Output', count: output.length },
              { id: 'callstack', icon: Layers, label: 'Call Stack', count: callStack.length + executionLog.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: activeTab === tab.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #818cf8' : '2px solid transparent',
                  color: activeTab === tab.id ? '#c4b5fd' : 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  transition: 'all 0.15s'
                }}
              >
                <tab.icon size={13} />
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    background: 'rgba(99,102,241,0.3)',
                    borderRadius: '10px',
                    color: '#a5b4fc'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Output Panel */}
          {activeTab === 'output' && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {pythonStatus && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', background: 'rgba(99,102,241,0.15)',
                  borderRadius: '6px', color: '#a5b4fc', fontSize: '0.78rem'
                }}>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  {pythonStatus}
                </div>
              )}

              {output.length === 0 && !isRunning && !pythonStatus && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--text-dim)',
                  opacity: 0.6,
                  paddingTop: '40px'
                }}>
                  <Terminal size={28} opacity={0.4} />
                  <span style={{ fontSize: '0.8rem' }}>Output will appear here</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>Press Run or Ctrl+Enter</span>
                </div>
              )}

              {isRunning && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', color: '#34d399', fontSize: '0.78rem'
                }}>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  Executing…
                </div>
              )}

              {output.map((item, idx) => (
                <div key={idx} style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  lineHeight: 1.5,
                  background: item.type === 'error' ? 'rgba(248,113,113,0.08)' :
                              item.type === 'warn' ? 'rgba(251,191,36,0.06)' :
                              item.type === 'info' ? 'rgba(99,102,241,0.06)' : 'transparent',
                  color: item.type === 'error' ? '#fca5a5' :
                         item.type === 'warn' ? '#fde68a' :
                         item.type === 'info' ? '#a5b4fc' : '#e2e8f0',
                  borderLeft: `2px solid ${item.type === 'error' ? '#f87171' :
                              item.type === 'warn' ? '#fbbf24' :
                              item.type === 'info' ? '#818cf8' : 'transparent'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {item.type === 'error' && <AlertCircle size={12} color="#f87171" style={{ marginTop: '3px', flexShrink: 0 }} />}
                  {item.type === 'warn' && <AlertCircle size={12} color="#fbbf24" style={{ marginTop: '3px', flexShrink: 0 }} />}
                  <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{item.text}</span>
                </div>
              ))}

              {output.length > 0 && !isRunning && (
                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px dashed rgba(255,255,255,0.06)',
                  fontSize: '0.7rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={11} color="#34d399" />
                  Execution complete — {output.filter(o => o.type !== 'error').length} output{output.filter(o => o.type !== 'error').length !== 1 ? 's' : ''}, {output.filter(o => o.type === 'error').length} error{output.filter(o => o.type === 'error').length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Call Stack Panel */}
          {activeTab === 'callstack' && (
            <div style={{ flex: 1, overflow: 'hidden', padding: '12px', display: 'flex', flexDirection: 'column' }}>
              <CallStackVisualizer
                frames={callStack}
                executionLog={executionLog}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ───────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 16px',
        background: 'rgba(99,102,241,0.08)',
        borderTop: '1px solid rgba(99,102,241,0.15)',
        fontSize: '0.7rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={10} color="#34d399" />
            <span style={{ color: '#34d399', fontWeight: '600' }}>
              {language === 'javascript' ? 'Node.js v24 — Server' : 'Python 3.14 — Server'}
            </span>
          </span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          {elapsedMs !== null && (
            <span style={{
              color: elapsedMs < 500 ? '#34d399' : elapsedMs < 2000 ? '#fbbf24' : '#f87171',
              fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '3px'
            }}>
              ⏱ {elapsedMs}ms
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{lineCount} lines</span>
          <span>{code.length} chars</span>
        </div>
      </div>

      {/* Animations + Fira Code font + pre scrollbar hide */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&display=swap');

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes callStackPush {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        /* Hide scrollbar on the highlight <pre> so only textarea scrollbar shows */
        .ide-highlight-pre::-webkit-scrollbar { display: none; }

        /* Selection colour visible through the transparent textarea */
        .ide-code-textarea::selection { background: rgba(139,92,246,0.35); }
        .ide-code-textarea::-moz-selection { background: rgba(139,92,246,0.35); }
      `}</style>
    </div>
  );
}
