'use client';

import React from 'react';
import { Database, ArrowRight, Sparkles } from 'lucide-react';

const TYPE_COLORS = {
  Number: '#fb923c',
  String: '#34d399',
  Boolean: '#c084fc',
  Array: '#38bdf8',
  Object: '#ec4899',
  Null: '#94a3b8',
  Undefined: '#64748b',
  Function: '#818cf8'
};

export default function VariablesVisualizer({ variables = {}, activeStep }) {
  const varEntries = Object.entries(variables).filter(([name]) => name !== 'Math');

  return (
    <div style={{
      background: 'rgba(15, 20, 34, 0.75)',
      borderRadius: '14px',
      border: '1px solid var(--border-subtle)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
      minHeight: '160px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            ACTIVE VARIABLES & MEMORY
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {varEntries.length} in scope
        </span>
      </div>

      {varEntries.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.82rem',
          fontStyle: 'italic',
          padding: '24px'
        }}>
          No variables declared in this scope yet
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px',
          overflowY: 'auto',
          maxHeight: '260px',
          padding: '2px'
        }}>
          {varEntries.map(([name, data]) => {
            const isChanged = data.changed;
            const typeColor = TYPE_COLORS[data.type] || '#818cf8';

            return (
              <div
                key={name}
                style={{
                  background: isChanged ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                  border: isChanged ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.25s ease',
                  boxShadow: isChanged ? '0 0 16px rgba(99, 102, 241, 0.3)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isChanged && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.62rem',
                    color: '#a5b4fc',
                    fontWeight: '700'
                  }}>
                    <Sparkles size={10} color="#818cf8" />
                    UPDATED
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    color: '#fff'
                  }}>
                    {name}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${typeColor}22`,
                    color: typeColor,
                    border: `1px solid ${typeColor}44`
                  }}>
                    {data.type}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  {isChanged && data.previousValue !== null && data.previousValue !== undefined && (
                    <>
                      <span style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)',
                        textDecoration: 'line-through'
                      }}>
                        {String(data.previousValue)}
                      </span>
                      <ArrowRight size={12} color="var(--accent-primary)" />
                    </>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    color: typeColor,
                    wordBreak: 'break-all'
                  }}>
                    {data.formatted || String(data.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
