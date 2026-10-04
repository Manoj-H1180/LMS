'use client';

import React, { useState } from 'react';
import { Clock, HardDrive, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export default function ComplexityCard({ complexity }) {
  const [expanded, setExpanded] = useState(false);

  if (!complexity) return null;

  const { timeComplexity = 'O(1)', timeDetail = '', spaceComplexity = 'O(1)', spaceDetail = '' } = complexity;

  return (
    <div style={{
      background: 'rgba(15, 20, 34, 0.75)',
      borderRadius: '12px',
      border: '1px solid var(--border-subtle)',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setExpanded(prev => !prev)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Time Complexity Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '600' }}>Time:</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: '800',
              fontSize: '0.86rem',
              color: '#fbbf24',
              background: 'rgba(245, 158, 11, 0.15)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              {timeComplexity}
            </span>
          </div>

          {/* Space Complexity Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HardDrive size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '600' }}>Space:</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: '800',
              fontSize: '0.86rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.15)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              {spaceComplexity}
            </span>
          </div>
        </div>

        <button style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.74rem'
        }}>
          <span>{expanded ? 'Hide Details' : 'Why?'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div style={{
          marginTop: '6px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.78rem',
          lineHeight: 1.45,
          color: 'var(--text-muted)'
        }}>
          <div>
            <strong style={{ color: '#fbbf24' }}>Time Complexity ({timeComplexity}):</strong> {timeDetail}
          </div>
          <div>
            <strong style={{ color: '#38bdf8' }}>Space Complexity ({spaceComplexity}):</strong> {spaceDetail}
          </div>
        </div>
      )}
    </div>
  );
}
