'use client';

import React from 'react';
import { Layers, ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

export default function StackQueueVisualizer({ variables = {}, activeStep }) {
  // Look for stack or queue array
  const stack = variables?.stack?.value || variables?.s?.value;
  const queue = variables?.queue?.value || variables?.q?.value;

  const isStack = Array.isArray(stack);
  const isQueue = Array.isArray(queue);

  if (!isStack && !isQueue) {
    // Fallback: look for any array that could be viewed as stack/queue
    const firstArr = Object.entries(variables).find(([, v]) => Array.isArray(v.value));
    if (!firstArr) {
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
          <span>Stack / Queue visualization activates when stack or queue arrays are manipulated</span>
        </div>
      );
    }
  }

  const items = isStack ? stack : (isQueue ? queue : []);
  const title = isStack ? 'STACK (LIFO: Last In, First Out)' : 'QUEUE (FIFO: First In, First Out)';

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
          <Layers size={16} color="#ec4899" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            {title}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '700' }}>
          {items.length} item{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {isStack ? (
        /* Vertical Stack Container (Plates stacked vertically) */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '12px',
          border: '2px dashed rgba(236, 72, 153, 0.25)',
          gap: '8px'
        }}>
          {items.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic', margin: 'auto' }}>
              Stack is currently empty (push items to fill)
            </div>
          ) : (
            [...items].reverse().map((item, idx) => {
              const isTop = idx === 0;
              return (
                <div
                  key={idx}
                  style={{
                    width: '180px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: isTop ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: isTop ? '1px solid #ec4899' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    color: '#fff',
                    boxShadow: isTop ? '0 0 16px rgba(236, 72, 153, 0.35)' : 'none'
                  }}
                >
                  <span>{String(item)}</span>
                  {isTop && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#ec4899',
                      color: '#fff'
                    }}>
                      TOP
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Horizontal Queue Container (Pipe with FRONT and REAR) */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '12px',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '12px',
          border: '2px dashed rgba(56, 189, 248, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            fontWeight: '700'
          }}>
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← FRONT (Exit / Dequeue)
            </span>
            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              REAR (Enter / Enqueue) ←
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px 0'
          }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  background: idx === 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                  border: idx === 0 ? '1px solid #34d399' : '1px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: '800',
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                {String(item)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
