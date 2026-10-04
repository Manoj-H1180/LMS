'use client';

import React from 'react';
import { Network, ArrowRight } from 'lucide-react';

export default function LinkedListVisualizer({ variables = {}, activeStep }) {
  // Try to find a linked list head
  const head = variables?.head?.value || variables?.current?.value;
  const currentVal = variables?.current?.value?.val;

  // Traverse and extract nodes
  const nodes = [];
  let curr = variables?.head?.value || head;
  let count = 0;
  while (curr && typeof curr === 'object' && count < 8) {
    nodes.push(curr.val);
    curr = curr.next;
    count++;
  }

  if (nodes.length === 0) {
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
        <span>Linked list nodes will appear when a list structure is traversed</span>
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
          <Network size={16} color="#34d399" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            LINKED LIST NODES & POINTERS
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '700' }}>
          {nodes.length} Nodes
        </span>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        overflowX: 'auto',
        padding: '20px 10px'
      }}>
        {nodes.map((val, idx) => {
          const isCurrent = currentVal === val;

          return (
            <React.Fragment key={idx}>
              {/* Linked Node */}
              <div style={{
                display: 'flex',
                borderRadius: '10px',
                border: isCurrent ? '2px solid #34d399' : '1px solid var(--border-subtle)',
                background: isCurrent ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                overflow: 'hidden',
                boxShadow: isCurrent ? '0 0 18px rgba(52, 211, 153, 0.4)' : 'none',
                flexShrink: 0
              }}>
                <div style={{
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: '800',
                  color: '#fff',
                  borderRight: '1px solid var(--border-subtle)'
                }}>
                  {String(val)}
                </div>
                <div style={{
                  padding: '12px 10px',
                  fontSize: '0.72rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}>
                  next →
                </div>
              </div>

              {/* Arrow pointer */}
              <ArrowRight size={18} color={isCurrent ? '#34d399' : 'var(--text-dim)'} style={{ flexShrink: 0 }} />
            </React.Fragment>
          );
        })}

        {/* Null terminator */}
        <div style={{
          padding: '8px 12px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          flexShrink: 0
        }}>
          null
        </div>
      </div>
    </div>
  );
}
