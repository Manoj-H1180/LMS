'use client';

import React from 'react';
import { GitPullRequest } from 'lucide-react';

export default function TreeVisualizer({ variables = {}, activeStep }) {
  const root = variables?.root?.value;

  // Default binary tree layout if root exists
  const rVal = root?.val ?? 10;
  const lVal = root?.left?.val ?? 5;
  const rrVal = root?.right?.val ?? 15;

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
          <GitPullRequest size={16} color="#c084fc" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            BINARY TREE HIERARCHY
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: '700' }}>
          Parent-Child Pointers
        </span>
      </div>

      <div style={{
        flex: 1,
        minHeight: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '12px'
      }}>
        <svg width="240" height="150" viewBox="0 0 240 150">
          {/* Edge lines */}
          <line x1="120" y1="35" x2="60" y2="105" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
          <line x1="120" y1="35" x2="180" y2="105" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />

          {/* Root node */}
          <circle cx="120" cy="35" r="22" fill="#6366f1" stroke="#818cf8" strokeWidth="2" />
          <text x="120" y="41" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="monospace">
            {rVal}
          </text>

          {/* Left child */}
          <circle cx="60" cy="105" r="20" fill="rgba(192, 132, 252, 0.4)" stroke="#c084fc" strokeWidth="2" />
          <text x="60" y="110" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="monospace">
            {lVal}
          </text>

          {/* Right child */}
          <circle cx="180" cy="105" r="20" fill="rgba(52, 211, 153, 0.4)" stroke="#34d399" strokeWidth="2" />
          <text x="180" y="110" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="monospace">
            {rrVal}
          </text>
        </svg>
      </div>
    </div>
  );
}
