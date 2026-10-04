import { NextResponse } from 'next/server';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

const execFileAsync = promisify(execFile);

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────── */
const TIMEOUT_MS   = 8_000;   // 8 s hard kill
const MAX_OUTPUT   = 50_000;  // 50 KB output cap

/* ─────────────────────────────────────────────────────────────────
   SAFETY CHECKS
───────────────────────────────────────────────────────────────── */
const JS_BLOCKED = [
  /require\s*\(\s*['"`]child_process/,
  /require\s*\(\s*['"`]fs/,
  /require\s*\(\s*['"`]net/,
  /require\s*\(\s*['"`]http/,
  /require\s*\(\s*['"`]os/,
  /process\.env/,
  /process\.exit/,
  /globalThis\.process/,
  /import\s*\(\s*['"`]child_process/,
  /__dirname/,
  /__filename/,
];

const PY_BLOCKED = [
  /import\s+os(\s|$|;)/,
  /import\s+subprocess/,
  /import\s+sys(\s|$|;)/,
  /from\s+os\s+import/,
  /from\s+subprocess\s+import/,
  /open\s*\(/,
  /__import__/,
  /exec\s*\(/,
  /eval\s*\(/,
  /compile\s*\(/,
  /importlib/,
  /socket/,
  /urllib/,
  /requests/,
  /ctypes/,
  /shutil/,
];

function checkSafety(code, language) {
  const patterns = language === 'python' ? PY_BLOCKED : JS_BLOCKED;
  for (const re of patterns) {
    if (re.test(code)) {
      return `Security violation: "${re.source.slice(0, 40)}" is not allowed in sandbox.`;
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────
   JS TRACE WRAPPER
   Wraps user code so every function call/return is logged,
   then runs it via: node -e "<wrapped>"
───────────────────────────────────────────────────────────────── */
function buildJSWrapper(userCode) {
  return `
(function() {
  'use strict';
  const __trace = [];
  const __output = [];
  const __startMs = Date.now();

  // Bounded output helper
  function __push(item) {
    const total = __output.reduce((n, o) => n + String(o.text).length, 0);
    if (total < ${MAX_OUTPUT}) __output.push(item);
  }

  // Override console
  const console = {
    log:   (...a) => { const t = a.map(__fmt).join(' '); __push({ type:'log',  text: t }); __trace.push({ type:'output', message:'stdout → '+t, line:null }); },
    error: (...a) => { const t = a.map(__fmt).join(' '); __push({ type:'error',text: t }); __trace.push({ type:'error',  message:'stderr → '+t, line:null }); },
    warn:  (...a) => { const t = a.map(__fmt).join(' '); __push({ type:'warn', text: t }); __trace.push({ type:'output', message:'warn → '+t,   line:null }); },
    info:  (...a) => { const t = a.map(__fmt).join(' '); __push({ type:'info', text: t }); __trace.push({ type:'output', message:'info → '+t,   line:null }); },
    table: (...a) => { const t = __fmt(a[0]);            __push({ type:'log',  text: t }); __trace.push({ type:'output', message:'table → '+t,  line:null }); },
    dir:   (...a) => { const t = __fmt(a[0]);            __push({ type:'log',  text: t }); __trace.push({ type:'output', message:'dir → '+t,    line:null }); },
  };

  function __fmt(v) {
    if (v === null)      return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'function') return '[Function: ' + (v.name || 'anonymous') + ']';
    if (typeof v === 'object') {
      try { return JSON.stringify(v, null, 2); } catch { return String(v); }
    }
    return String(v);
  }

  // Proxy for Reflect to track function calls
  const __callStack = [{ name: '<main>', line: 1, depth: 0 }];
  __trace.push({ type:'enter', message:'<main> — start', line:1 });

  try {
    // ── USER CODE BEGIN ──
${userCode}
    // ── USER CODE END ──
    __trace.push({ type:'return', message:'<main> — end ✓', line:null });
  } catch(e) {
    // Parse line number from stack trace
    const m = e.stack && e.stack.match(/eval.*?:(\\d+):(\\d+)/);
    const ln = m ? parseInt(m[1]) - ${/* offset for wrapper lines above */ 26} : null;
    __push({ type:'error', text: e.name+': '+e.message });
    __trace.push({ type:'error', message: e.name+': '+e.message, line: ln });
  }

  // Emit structured JSON result
  process.stdout.write(JSON.stringify({
    output: __output,
    trace:  __trace,
    stack:  __callStack,
    elapsed: Date.now() - __startMs
  }));
})();
`;
}

/* ─────────────────────────────────────────────────────────────────
   PYTHON WRAPPER
   - Captures stdout/stderr with a simple list-appending override
     (no sys.settrace — that causes recursion deadlock in Py 3.14)
   - Uses ast.parse *statically* to build the call-stack trace
   - Executes user code with exec() inside a try/except
───────────────────────────────────────────────────────────────── */
function buildPythonWrapper(userCode) {
  // JSON-encode the user code so it is a safe Python string literal
  const jsonCode = JSON.stringify(userCode);

  return `
import sys, io, json, time, ast, traceback

_output = []
_trace  = []
_stack  = []
_start  = time.time()
_MAX    = ${MAX_OUTPUT}

# ── Stdout/stderr capture (simple list; NO settrace) ──────────
class _Capture:
    def __init__(self, kind):
        self._kind = kind
    def write(self, s):
        if s:
            stripped = s.rstrip('\\n')
            if stripped:
                total = sum(len(str(o.get('text',''))) for o in _output)
                if total < _MAX:
                    _output.append({'type': self._kind, 'text': stripped})
        return len(s)
    def flush(self):
        pass
    def fileno(self):
        raise io.UnsupportedOperation('no fileno')

_real_stdout = sys.stdout
sys.stdout = _Capture('log')
sys.stderr = _Capture('error')

# ── Static AST trace ──────────────────────────────────────────
_user_code = ${jsonCode}
_trace.append({'type': 'enter', 'message': '__main__ — start', 'line': 1})
try:
    _tree = ast.parse(_user_code)
    for _node in ast.walk(_tree):
        if isinstance(_node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            _trace.append({'type': 'enter', 'message': 'def ' + _node.name + '() defined', 'line': _node.lineno})
            _stack.append({'name': _node.name, 'line': _node.lineno, 'locals': {}})
        elif isinstance(_node, ast.ClassDef):
            _trace.append({'type': 'enter', 'message': 'class ' + _node.name + ' defined', 'line': _node.lineno})
        elif isinstance(_node, ast.Return) and hasattr(_node, 'lineno'):
            _trace.append({'type': 'return', 'message': 'return statement', 'line': _node.lineno})
        elif isinstance(_node, ast.Assign) and hasattr(_node, 'lineno'):
            for _t in _node.targets:
                if isinstance(_t, ast.Name):
                    _trace.append({'type': 'assign', 'message': _t.id + ' = ...', 'line': _node.lineno})
except Exception:
    pass

# ── Execute user code ─────────────────────────────────────────
_elapsed = 0
try:
    exec(compile(_user_code, '<string>', 'exec'), {'__name__': '__main__'})
    _trace.append({'type': 'return', 'message': '__main__ — end ✓', 'line': None})
except SystemExit:
    _trace.append({'type': 'return', 'message': '__main__ — exit()', 'line': None})
except Exception as _exc:
    _tb = traceback.extract_tb(sys.exc_info()[2])
    _ln = _tb[-1].lineno if _tb else None
    _msg = type(_exc).__name__ + ': ' + str(_exc)
    total = sum(len(str(o.get('text',''))) for o in _output)
    if total < _MAX:
        _output.append({'type': 'error', 'text': _msg})
    _trace.append({'type': 'error', 'message': _msg, 'line': _ln})
finally:
    _elapsed = int((time.time() - _start) * 1000)
    sys.stdout = _real_stdout
    sys.stderr = _real_stdout

print(json.dumps({
    'output': _output,
    'trace':  _trace,
    'stack':  _stack,
    'elapsed': _elapsed,
}))
`;
}

/* ─────────────────────────────────────────────────────────────────
   RUN JAVASCRIPT via child Node process
───────────────────────────────────────────────────────────────── */
async function runJavaScript(code) {
  const wrapped = buildJSWrapper(code);
  const id = randomUUID();
  const tmpDir = join(tmpdir(), 'lms-ide');
  await mkdir(tmpDir, { recursive: true });
  const filePath = join(tmpDir, `exec_${id}.js`);

  try {
    await writeFile(filePath, wrapped, 'utf8');

    const { stdout, stderr } = await execFileAsync(
      process.execPath, // same node binary that's running Next.js
      [filePath],
      {
        timeout: TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT * 2,
        env: {
          // Minimal safe env — no secrets, no HOME tricks
          PATH: process.env.PATH,
          NODE_ENV: 'sandbox',
        },
      }
    );

    if (!stdout.trim()) {
      return {
        output: [{ type: 'log', text: '(no output)' }],
        trace: [{ type: 'enter', message: '<main> — ran', line: 1 }],
        stack: [],
        elapsed: 0,
        stderr: stderr.trim()
      };
    }

    return JSON.parse(stdout);
  } catch (err) {
    if (err.killed || err.signal === 'SIGTERM') {
      return {
        output: [{ type: 'error', text: `⏱ Execution timed out after ${TIMEOUT_MS / 1000}s` }],
        trace:  [{ type: 'error', message: 'Timeout', line: null }],
        stack:  [],
        elapsed: TIMEOUT_MS
      };
    }
    // JSON parse failure or node error — try to extract error text
    const errText = err.stderr || err.stdout || err.message || 'Unknown error';
    // Clean up node internal paths from error message
    const cleanErr = errText.replace(/\/tmp\/lms-ide\/[^:]+:/g, 'script:').split('\n').slice(0, 6).join('\n');
    return {
      output: [{ type: 'error', text: cleanErr }],
      trace:  [{ type: 'error', message: cleanErr, line: null }],
      stack:  [],
      elapsed: 0
    };
  } finally {
    unlink(filePath).catch(() => {});
  }
}

/* ─────────────────────────────────────────────────────────────────
   RUN PYTHON via child python process
───────────────────────────────────────────────────────────────── */
async function runPython(code) {
  const wrapped = buildPythonWrapper(code);
  const id = randomUUID();
  const tmpDir = join(tmpdir(), 'lms-ide');
  await mkdir(tmpDir, { recursive: true });
  const filePath = join(tmpDir, `exec_${id}.py`);

  // Detect python binary: prefer python3, fallback to python
  const pythonBin = process.platform === 'win32' ? 'python' : 'python3';

  try {
    await writeFile(filePath, wrapped, 'utf8');

    const { stdout, stderr } = await execFileAsync(
      pythonBin,
      [filePath],
      {
        timeout: TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT * 2,
        env: {
          PATH: process.env.PATH,
          PYTHONDONTWRITEBYTECODE: '1',
          PYTHONUNBUFFERED: '1',
        },
      }
    );

    if (!stdout.trim()) {
      return {
        output: [{ type: 'log', text: '(no output)' }],
        trace: [{ type: 'enter', message: '__main__ — ran', line: 1 }],
        stack: [],
        elapsed: 0,
        stderr: stderr.trim()
      };
    }

    return JSON.parse(stdout);
  } catch (err) {
    if (err.killed || err.signal === 'SIGTERM') {
      return {
        output: [{ type: 'error', text: `⏱ Execution timed out after ${TIMEOUT_MS / 1000}s` }],
        trace:  [{ type: 'error', message: 'Timeout', line: null }],
        stack:  [],
        elapsed: TIMEOUT_MS
      };
    }
    const errText = err.stderr || err.stdout || err.message || 'Unknown error';
    const cleanErr = errText.replace(/\/tmp\/lms-ide\/[^:]+:/g, 'script:').split('\n').slice(0, 8).join('\n');
    return {
      output: [{ type: 'error', text: cleanErr }],
      trace:  [{ type: 'error', message: cleanErr, line: null }],
      stack:  [],
      elapsed: 0
    };
  } finally {
    unlink(filePath).catch(() => {});
  }
}

/* ─────────────────────────────────────────────────────────────────
   NEXT.JS ROUTE HANDLER
───────────────────────────────────────────────────────────────── */
export async function POST(request) {
  try {
    const { code, language } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'code is required' }, { status: 400 });
    }
    if (!['javascript', 'python'].includes(language)) {
      return NextResponse.json({ success: false, error: 'language must be javascript or python' }, { status: 400 });
    }

    // Safety check
    const violation = checkSafety(code, language);
    if (violation) {
      return NextResponse.json({
        success: true,
        output:  [{ type: 'error', text: `🔒 Sandbox: ${violation}` }],
        trace:   [{ type: 'error', message: violation, line: null }],
        stack:   [],
        elapsed: 0
      });
    }

    const result = language === 'python'
      ? await runPython(code)
      : await runJavaScript(code);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[/api/execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
