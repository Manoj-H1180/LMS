'use client';

import React from 'react';
import { GitBranch, CheckCircle2, XCircle, ArrowRight, CornerDownRight } from 'lucide-react';

export default function ConditionVisualizer({ activeStep }) {
  const details = activeStep?.activeDetails || {};
  const isCondition = activeStep?.type === 'condition-check' || details.conditionResult !== undefined;
  const result = details.conditionResult ?? activeStep?.result;
  const hasElse = details.hasElse ?? true;

  if (!isCondition && activeStep?.type !== 'if') {
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
        <GitBranch size={22} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <span>Condition decision tree will appear during "if / else" steps</span>
      </div>
    );
  }

  const isTrue = Boolean(result);

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
          <GitBranch size={16} color="var(--accent-secondary)" />
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            DECISION BRANCHING TREE
          </span>
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: '800',
          padding: '2px 8px',
          borderRadius: '4px',
          background: isTrue ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 63, 94, 0.2)',
          color: isTrue ? '#34d399' : '#f43f5e',
          border: `1px solid ${isTrue ? 'rgba(52, 211, 153, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`
        }}>
          {isTrue ? 'TRUE' : 'FALSE'}
        </span>
      </div>

      {/* Condition expression box */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700' }}>
          CONDITION EVALUATED:
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.98rem',
          color: '#fff',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{activeStep.expression}</span>
          <ArrowRight size={14} color="var(--text-dim)" />
          <span style={{ color: isTrue ? '#34d399' : '#f43f5e' }}>
            {isTrue ? 'true' : 'false'}
          </span>
        </div>
      </div>

      {/* Decision Branch Tree */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* IF Branch */}
        <div style={{
          borderRadius: '10px',
          padding: '12px',
          background: isTrue ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 255, 255, 0.02)',
          border: isTrue ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          opacity: isTrue ? 1 : 0.45,
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isTrue ? (
              <CheckCircle2 size={16} color="#34d399" />
            ) : (
              <XCircle size={16} color="var(--text-dim)" />
            )}
            <span style={{
              fontWeight: '800',
              fontSize: '0.82rem',
              color: isTrue ? '#34d399' : 'var(--text-dim)'
            }}>
              IF Branch (True)
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: isTrue ? '#e2e8f0' : 'var(--text-dim)' }}>
            {isTrue ? '✓ TAKEN — Executing IF block body' : '✕ Bypassed — Condition was false'}
          </span>
        </div>

        {/* ELSE Branch */}
        <div style={{
          borderRadius: '10px',
          padding: '12px',
          background: !isTrue ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 255, 255, 0.02)',
          border: !isTrue ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          opacity: !isTrue ? 1 : 0.45,
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!isTrue ? (
              <CheckCircle2 size={16} color="#f43f5e" />
            ) : (
              <XCircle size={16} color="var(--text-dim)" />
            )}
            <span style={{
              fontWeight: '800',
              fontSize: '0.82rem',
              color: !isTrue ? '#f43f5e' : 'var(--text-dim)'
            }}>
              ELSE Branch (False)
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: !isTrue ? '#e2e8f0' : 'var(--text-dim)' }}>
            {!isTrue ? '✓ TAKEN — Executing ELSE block' : '✕ Bypassed — Condition was true'}
          </span>
        </div>
      </div>
    </div>
  );
}
