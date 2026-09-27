'use client';

import React from 'react';
import { Sparkles, Trophy, Award, X, Check } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function CelebrationModal({ 
  title = "Level Up!", 
  subtitle = "Congratulations! You've advanced to a new tier.", 
  xpGained = 0, 
  onClose 
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel modal-content"
        style={{
          maxWidth: '460px',
          width: '90%',
          textAlign: 'center',
          padding: '40px 30px',
          background: 'linear-gradient(145deg, #101528 0%, #1a223f 100%)',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.35)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="ghost-btn" 
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%' }}
        >
          <X size={18} />
        </button>

        {/* Animated Trophy Icon */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Trophy size={42} />
        </div>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>
          {title}
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
          {subtitle}
        </p>

        {xpGained > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-full)',
            color: '#fbbf24',
            fontWeight: '900',
            fontSize: '1.2rem',
            marginBottom: '28px'
          }}>
            <Sparkles size={20} />
            +{xpGained} BONUS XP
          </div>
        )}

        <div>
          <button 
            onClick={onClose} 
            className="glow-btn" 
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
          >
            Claim Rewards & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
