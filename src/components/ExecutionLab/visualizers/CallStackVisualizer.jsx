'use client';

import React from 'react';
import { Layers, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

export default function CallStackVisualizer({ callStack = [], activeStep }) {
  const isRecursion = activeStep?.type?.includes('recursion') || callStack.length > 2;

  return (
    <div style={{
      background: 'rgba(15, 20, 34, 0.75)',
      borderRadius: '14px',
      border: '1px solid var(--border-subtle)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            EXECUTION CALL STACK
          </span>
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#a5b4fc',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          Depth: {callStack.length} frame{callStack.length === 1 ? '' : 's'}
        </span>
      </div>

      {isRecursion && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#c4b5fd'
        }}>
          <Sparkles size={14} color="#818cf8" />
          <span>
            <strong>Recursive Invocation:</strong> Frames stack up until base case triggers return unwinding.
          </span>
        </div>
      )}

      {/* Frames container (visual stack from top to bottom) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column-reverse', // Top of stack at the top
        gap: '8px',
        overflowY: 'auto',
        justifyContent: 'flex-start'
      }}>
        {callStack.map((frame, idx) => {
          const isTop = idx === callStack.length - 1;
          const isBase = idx === 0;

          return (
            <div
              key={idx}
              style={{
                borderRadius: '10px',
                padding: '12px 14px',
                background: isTop
                  ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isTop
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isTop ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isTop ? '#818cf8' : 'var(--text-dim)',
                  boxShadow: isTop ? '0 0 8px #818cf8' : 'none'
                }} />
                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '700',
                    fontSize: '0.86rem',
                    color: isTop ? '#fff' : 'var(--text-muted)'
                  }}>
                    {frame.name}
                    {frame.args && Object.keys(frame.args).length > 0 && (
                      <span style={{ color: '#a5b4fc', marginLeft: '6px' }}>
                        ({Object.entries(frame.args).map(([k, v]) => `${k}=${v}`).join(', ')})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {isTop ? '⚡ Currently Executing Frame' : isBase ? 'Global Base Scope' : `Frame depth [${idx}]`}
                  </div>
                </div>
              </div>

              {isTop && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.3)',
                  color: '#c4b5fd'
                }}>
                  ACTIVE TOP
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
