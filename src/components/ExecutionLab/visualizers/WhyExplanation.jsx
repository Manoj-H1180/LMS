'use client';

import React, { useState } from 'react';
import { HelpCircle, ToggleLeft, ToggleRight, Sparkles, Terminal } from 'lucide-react';

export default function WhyExplanation({ activeStep, stepIndex, totalSteps }) {
  const [technicalMode, setTechnicalMode] = useState(false);

  const beginnerWhy = activeStep?.why?.beginner || 'Executing instruction at current line.';
  const technicalWhy = activeStep?.why?.technical || 'Statement evaluation under active lexical environment.';

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(22, 28, 45, 0.9) 0%, rgba(15, 20, 34, 0.95) 100%)',
      borderRadius: '14px',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HelpCircle size={15} color="#fff" />
          </div>
          <span style={{
            fontSize: '0.86rem',
            fontWeight: '800',
            letterSpacing: '0.04em',
            color: '#fff',
            textTransform: 'uppercase'
          }}>
            WHY DID THIS HAPPEN?
          </span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            fontWeight: '700'
          }}>
            Line {activeStep?.line || 1} • Step {stepIndex + 1}/{totalSteps || 1}
          </span>
        </div>

        {/* Toggle Beginner vs Technical Explanation */}
        <button
          onClick={() => setTechnicalMode(prev => !prev)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: technicalMode ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontSize: '0.74rem',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          title="Toggle between beginner plain English and advanced technical explanation"
        >
          {technicalMode ? <ToggleRight size={16} color="var(--accent-primary)" /> : <ToggleLeft size={16} />}
          <span>{technicalMode ? 'Technical Mode' : 'Beginner Friendly'}</span>
        </button>
      </div>

      {/* Explanation text */}
      <div style={{
        fontSize: '0.92rem',
        lineHeight: 1.55,
        color: technicalMode ? '#cbd5e1' : '#f8fafc',
        fontFamily: technicalMode ? 'var(--font-mono)' : 'var(--font-main)',
        padding: '6px 2px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        {technicalMode ? (
          <Terminal size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
        ) : (
          <Sparkles size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: '3px' }} />
        )}
        <div style={{ flex: 1 }}>
          {technicalMode ? technicalWhy : beginnerWhy}
        </div>
      </div>
    </div>
  );
}
