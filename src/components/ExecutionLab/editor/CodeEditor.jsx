'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Copy, RotateCcw, Check, Code2, AlertTriangle, Wand2 } from 'lucide-react';
import { highlightCode } from './syntaxHighlighter.js';
import { formatCode } from './codeFormatter.js';

export default function CodeEditor({
  code,
  onChange,
  currentLine,
  errorLine,
  onReset,
  isRunning
}) {
  const [copied, setCopied] = useState(false);
  const [justFormatted, setJustFormatted] = useState(false);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = code.split('\n');

  // Memoize syntax-highlighted HTML
  const highlightedHtml = useMemo(() => highlightCode(code), [code]);

  // Sync scroll between textarea, highlight overlay, and line numbers
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;

    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Sync on code change
  useEffect(() => {
    requestAnimationFrame(handleScroll);
  }, [code, handleScroll]);

  const handleKeyDown = (e) => {
    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: dedent the current line(s)
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = code.indexOf('\n', end);
        const actualEnd = lineEnd === -1 ? code.length : lineEnd;
        const selectedLines = code.substring(lineStart, actualEnd);
        const dedented = selectedLines.split('\n').map(line => {
          if (line.startsWith('  ')) return line.substring(2);
          if (line.startsWith('\t')) return line.substring(1);
          return line;
        }).join('\n');
        const newCode = code.substring(0, lineStart) + dedented + code.substring(actualEnd);
        onChange(newCode);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = lineStart;
            textareaRef.current.selectionEnd = lineStart + dedented.length;
          }
        });
      } else {
        // Tab: insert 2 spaces
        const spaces = '  ';
        const newCode = code.substring(0, start) + spaces + code.substring(end);
        onChange(newCode);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + spaces.length;
            textareaRef.current.selectionEnd = start + spaces.length;
          }
        });
      }
    }

    // Enter key: auto-indent
    if (e.key === 'Enter') {
      e.preventDefault();
      const start = e.target.selectionStart;

      // Find the current line's indentation
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentLineText = code.substring(lineStart, start);
      const indentMatch = currentLineText.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';

      // If the line ends with {, increase indent
      const trimmedBefore = code.substring(lineStart, start).trimEnd();
      if (trimmedBefore.endsWith('{')) {
        indent += '  ';
      }

      const newCode = code.substring(0, start) + '\n' + indent + code.substring(start);
      onChange(newCode);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const newPos = start + 1 + indent.length;
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
        }
      });
    }

    // Auto-close brackets
    if (e.key === '{' || e.key === '(' || e.key === '[') {
      const closers = { '{': '}', '(': ')', '[': ']' };
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      // Only auto-close if there's no selection and the next char is whitespace/newline/end
      const nextChar = code[end] || '';
      if (start === end && (!nextChar || /[\s,;)\]}]/.test(nextChar))) {
        e.preventDefault();
        const newCode = code.substring(0, start) + e.key + closers[e.key] + code.substring(end);
        onChange(newCode);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 1;
            textareaRef.current.selectionEnd = start + 1;
          }
        });
      }
    }

    // Auto-close quotes
    if (e.key === '"' || e.key === "'" || e.key === '`') {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      // If next char is the same quote, just skip over it
      if (code[start] === e.key && start === end) {
        e.preventDefault();
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 1;
            textareaRef.current.selectionEnd = start + 1;
          }
        });
        return;
      }

      const nextChar = code[end] || '';
      const prevChar = code[start - 1] || '';
      if (start === end && (!nextChar || /[\s,;)\]}]/.test(nextChar)) && !/[a-zA-Z0-9_$]/.test(prevChar)) {
        e.preventDefault();
        const newCode = code.substring(0, start) + e.key + e.key + code.substring(end);
        onChange(newCode);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 1;
            textareaRef.current.selectionEnd = start + 1;
          }
        });
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    const formatted = formatCode(code);
    onChange(formatted);
    setJustFormatted(true);
    setTimeout(() => setJustFormatted(false), 1800);
  };

  return (
    <div style={{
      background: 'rgba(10, 14, 26, 0.95)',
      borderRadius: '14px',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      minHeight: '340px'
    }}>
      {/* Editor Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
          </div>
          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)', margin: '0 4px' }} />
          <Code2 size={15} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c4b5fd', fontFamily: 'var(--font-mono)' }}>
            JavaScript Editor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Format Button */}
          <button
            onClick={handleFormat}
            className="ghost-btn"
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
              ...(justFormatted ? {
                color: '#34d399',
                borderColor: 'rgba(52, 211, 153, 0.3)'
              } : {})
            }}
            title="Auto-format code (Ctrl+Shift+F)"
          >
            {justFormatted ? <Check size={12} color="#34d399" /> : <Wand2 size={12} />}
            <span>{justFormatted ? 'Formatted!' : 'Format'}</span>
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="ghost-btn"
              style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Reset code to starter code"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="ghost-btn"
            style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Copy code"
          >
            {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main: Line numbers + Overlay editor */}
      <div style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Line Numbers with active line indicator */}
        <div
          ref={lineNumbersRef}
          style={{
            width: '46px',
            padding: '14px 6px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRight: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.86rem',
            lineHeight: '1.6',
            color: 'var(--text-dim)',
            textAlign: 'right',
            userSelect: 'none',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isActive = currentLine === lineNum;
            const isError = errorLine === lineNum;

            return (
              <div
                key={lineNum}
                style={{
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '4px',
                  color: isError ? '#f43f5e' : isActive ? '#fff' : 'var(--text-dim)',
                  fontWeight: isActive || isError ? '800' : '400',
                  fontSize: '0.8rem'
                }}
              >
                {isActive && <span style={{ color: 'var(--accent-primary)', fontSize: '0.7rem' }}>▶</span>}
                {isError && <AlertTriangle size={11} color="#f43f5e" />}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Code Area — Overlay Technique for Syntax Highlighting */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Active Line Glow Banner in background */}
          {currentLine && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${(currentLine - 1) * 24 + 14}px`,
                height: '24px',
                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.04) 100%)',
                borderLeft: '3px solid var(--accent-primary)',
                pointerEvents: 'none',
                zIndex: 0,
                transition: 'top 0.15s ease'
              }}
            />
          )}

          {/* Syntax Highlight Layer (rendered behind the textarea) */}
          <pre
            ref={highlightRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: 0,
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              lineHeight: '24px',
              whiteSpace: 'pre',
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 1,
              color: 'transparent',
              background: 'transparent',
              border: 'none',
              wordWrap: 'normal'
            }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
          />

          {/* Transparent Textarea (captures input, renders as transparent text) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              lineHeight: '24px',
              color: 'transparent',
              caretColor: '#f8fafc',
              resize: 'none',
              whiteSpace: 'pre',
              overflowX: 'auto',
              overflowY: 'auto',
              WebkitTextFillColor: 'transparent'
            }}
          />
        </div>
      </div>
    </div>
  );
}
