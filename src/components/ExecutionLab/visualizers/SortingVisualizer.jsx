'use client';

import React from 'react';
import { BarChart2, ArrowUpDown, CheckCircle } from 'lucide-react';

export default function SortingVisualizer({ variables = {}, activeStep }) {
  const arr = variables?.arr?.value || variables?.numbers?.value;

  if (!Array.isArray(arr) || arr.length === 0) {
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
        <span>Sorting visualizer activates when an array "arr" is sorted</span>
      </div>
    );
  }

  const loopI = variables?.i?.value ?? 0;
  const loopJ = variables?.j?.value ?? 0;
  const maxVal = Math.max(...arr, 10);

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
          <BarChart2 size={16} color="#34d399" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            SORTING BAR VISUALIZER
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '700' }}>
            Comparing [{loopJ}] & [{loopJ + 1}]
          </span>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div style={{
        flex: 1,
        minHeight: '160px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px 10px 10px',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        {arr.map((val, idx) => {
          const heightPercent = Math.max(15, Math.min(100, Math.round((val / maxVal) * 100)));
          const isComparing = idx === loopJ || idx === loopJ + 1;
          const isSortedTail = idx >= arr.length - loopI && loopI > 0;

          let barColor = 'rgba(99, 102, 241, 0.6)';
          let borderColor = 'rgba(99, 102, 241, 0.8)';
          let glow = 'none';

          if (isComparing) {
            barColor = 'rgba(245, 158, 11, 0.75)';
            borderColor = '#f59e0b';
            glow = '0 0 16px rgba(245, 158, 11, 0.5)';
          } else if (isSortedTail) {
            barColor = 'rgba(52, 211, 153, 0.75)';
            borderColor = '#34d399';
          }

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                height: '100%',
                justifyContent: 'flex-end'
              }}
            >
              <span style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                color: isComparing ? '#fbbf24' : '#fff'
              }}>
                {val}
              </span>

              <div
                style={{
                  width: '36px',
                  height: `${heightPercent}%`,
                  background: barColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '6px 6px 0 0',
                  boxShadow: glow,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />

              <span style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-dim)',
                marginTop: '4px'
              }}>
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
          <span>Active Comparison</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#34d399' }} />
          <span>Sorted Position</span>
        </div>
      </div>
    </div>
  );
}
