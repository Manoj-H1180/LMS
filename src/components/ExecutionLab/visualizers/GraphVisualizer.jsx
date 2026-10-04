'use client';

import React from 'react';
import { Share2 } from 'lucide-react';

export default function GraphVisualizer({ variables = {}, activeStep }) {
  const startNode = variables?.startNode?.value || 'A';
  const neighbors = variables?.neighbors?.value || ['B', 'C'];

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
          <Share2 size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            GRAPH NETWORK TOPOLOGY
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700' }}>
          Adjacency List
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
          {/* Edges */}
          <line x1="60" y1="40" x2="180" y2="40" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="60" y1="40" x2="60" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="180" y1="40" x2="180" y2="120" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
          <line x1="60" y1="120" x2="180" y2="120" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />

          {/* Node A (Active Start Node) */}
          <circle cx="60" cy="40" r="20" fill="#6366f1" stroke="#818cf8" strokeWidth="2" />
          <text x="60" y="45" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">A</text>

          {/* Node B */}
          <circle cx="180" cy="40" r="18" fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8" strokeWidth="2" />
          <text x="180" y="45" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">B</text>

          {/* Node C */}
          <circle cx="60" cy="120" r="18" fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8" strokeWidth="2" />
          <text x="60" y="125" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">C</text>

          {/* Node D */}
          <circle cx="180" cy="120" r="18" fill="rgba(255, 255, 255, 0.1)" stroke="var(--border-subtle)" strokeWidth="2" />
          <text x="180" y="125" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">D</text>
        </svg>
      </div>

      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        Node <strong style={{ color: '#818cf8' }}>{startNode}</strong> connected to neighbors: <strong style={{ color: '#38bdf8' }}>{Array.isArray(neighbors) ? neighbors.join(', ') : String(neighbors)}</strong>
      </div>
    </div>
  );
}
