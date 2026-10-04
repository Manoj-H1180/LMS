'use client';

import React from 'react';
import { RotateCw, CornerDownRight, Check, Zap } from 'lucide-react';

export default function LoopVisualizer({ variables = {}, activeStep }) {
  const details = activeStep?.activeDetails || {};
  const isLoop = activeStep?.type?.startsWith('loop') || details.iteration !== undefined;
  const loopI = variables?.i?.value;
  const loopJ = variables?.j?.value;
  const iteration = details.iteration ?? (loopI !== undefined ? loopI + 1 : 1);
  const isNested = loopI !== undefined && loopJ !== undefined;

  return (
    <div style={{
      background: 'rgba(15, 20, 34, 0.75)',
      borderRadius: '14px',
      border: '1px solid var(--border-subtle)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
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
          <RotateCw size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            LOOP EXECUTION PROGRESS
          </span>
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(245, 158, 11, 0.2)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.35)'
        }}>
          Iteration #{iteration}
        </span>
      </div>

      {/* Loop Cycle Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Outer Loop */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              boxShadow: '0 0 8px var(--accent-primary)'
            }} />
            <span style={{ fontWeight: '700', fontSize: '0.84rem', color: '#c4b5fd' }}>
              OUTER LOOP
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>
            {loopI !== undefined ? `i = ${loopI}` : 'Active'}
          </span>
        </div>

        {/* Inner Loop (if nested) */}
        {isNested && (
          <div style={{
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            marginLeft: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: '-16px',
              top: '-10px',
              color: 'var(--text-dim)'
            }}>
              <CornerDownRight size={16} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ec4899',
                boxShadow: '0 0 8px #ec4899'
              }} />
              <span style={{ fontWeight: '700', fontSize: '0.84rem', color: '#f472b6' }}>
                INNER LOOP
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>
              {loopJ !== undefined ? `j = ${loopJ}` : 'Iterating'}
            </span>
          </div>
        )}
      </div>

      {/* Educational Callout */}
      <div style={{
        marginTop: 'auto',
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        lineHeight: 1.4
      }}>
        {isNested ? (
          <span>
            💡 <strong>Key Rule:</strong> The inner loop (<code style={{ color: '#f472b6' }}>j</code>) completes all of its cycles before the outer loop (<code style={{ color: '#c4b5fd' }}>i</code>) moves to the next number.
          </span>
        ) : (
          <span>
            💡 <strong>Loop Flow:</strong> (1) Init → (2) Check Condition → (3) Run Body → (4) Increment Counter → Repeat.
          </span>
        )}
      </div>
    </div>
  );
}
