'use client';

import React from 'react';
import { Layers, ArrowDown, ArrowUpDown } from 'lucide-react';

export default function ArrayVisualizer({ variables = {}, activeStep }) {
  // Find all arrays currently in scope
  const arrays = Object.entries(variables).filter(([, v]) => Array.isArray(v.value));

  const activeIndex = activeStep?.activeDetails?.index;
  const isSwap = activeStep?.type === 'array-swap';
  const isMutate = activeStep?.type === 'array-mutate';

  // Check if search pointers exist in variables (e.g. low, mid, high, target, i, j)
  const low = variables?.low?.value;
  const mid = variables?.mid?.value;
  const high = variables?.high?.value;
  const loopI = variables?.i?.value;
  const loopJ = variables?.j?.value;

  if (arrays.length === 0) {
    return (
      <div style={{
        background: 'rgba(15, 20, 34, 0.75)',
        borderRadius: '14px',
        border: '1px solid var(--border-subtle)',
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.84rem'
      }}>
        <Layers size={22} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <span>No arrays declared in the current step</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(15, 20, 34, 0.75)',
      borderRadius: '14px',
      border: '1px solid var(--border-subtle)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
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
          <Layers size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            ARRAY MEMORY SLOTS
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600' }}>
          0-Indexed Sequential Memory
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        {arrays.map(([name, arrData]) => {
          const items = arrData.value;

          return (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8', fontSize: '0.9rem' }}>
                  {name} <span style={{ color: 'var(--text-dim)', fontWeight: '400', fontSize: '0.75rem' }}>[length: {items.length}]</span>
                </span>
                {isMutate && (
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowUpDown size={12} /> Array Updated
                  </span>
                )}
              </div>

              {/* Grid of memory slots */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                overflowX: 'auto',
                padding: '12px 4px'
              }}>
                {items.map((val, idx) => {
                  const isCurrentAccess = Number(activeIndex) === idx;
                  const isMid = Number(mid) === idx;
                  const isLow = Number(low) === idx;
                  const isHigh = Number(high) === idx;
                  const isLoopI = Number(loopI) === idx;
                  const isLoopJ = Number(loopJ) === idx;

                  let borderColor = 'rgba(255, 255, 255, 0.12)';
                  let bg = 'rgba(255, 255, 255, 0.03)';
                  let glow = 'none';

                  if (isCurrentAccess) {
                    borderColor = '#38bdf8';
                    bg = 'rgba(56, 189, 248, 0.2)';
                    glow = '0 0 16px rgba(56, 189, 248, 0.4)';
                  } else if (isMid) {
                    borderColor = '#f59e0b';
                    bg = 'rgba(245, 158, 11, 0.2)';
                    glow = '0 0 16px rgba(245, 158, 11, 0.4)';
                  } else if (isLoopI || isLoopJ) {
                    borderColor = 'var(--accent-primary)';
                    bg = 'rgba(99, 102, 241, 0.15)';
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      {/* Pointer labels above slot */}
                      <div style={{
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.68rem',
                        fontWeight: '800'
                      }}>
                        {isMid && <span style={{ color: '#f59e0b' }}>MID</span>}
                        {isLow && <span style={{ color: '#34d399' }}>LOW</span>}
                        {isHigh && <span style={{ color: '#f43f5e' }}>HIGH</span>}
                        {isLoopI && !isMid && !isLow && <span style={{ color: '#a5b4fc' }}>i</span>}
                        {isLoopJ && !isMid && !isHigh && <span style={{ color: '#ec4899' }}>j</span>}
                      </div>

                      {/* The Memory Cell */}
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '10px',
                          border: `2px solid ${borderColor}`,
                          background: bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.05rem',
                          fontWeight: '800',
                          color: '#fff',
                          boxShadow: glow,
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </div>

                      {/* Index below cell */}
                      <div style={{
                        fontSize: '0.72rem',
                        color: isCurrentAccess || isMid ? '#fff' : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700'
                      }}>
                        [{idx}]
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
