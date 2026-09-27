'use client';

import React from 'react';
import { Award, X, Download, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function CertificateModal({ course, userName, onClose }) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certId = 'NX-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel modal-content"
        style={{
          width: '95%',
          maxWidth: '850px',
          background: 'var(--bg-secondary)',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-xl)',
          padding: '0',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Container with decorative border */}
        <div style={{
          margin: '20px',
          padding: '40px 50px',
          background: 'linear-gradient(145deg, #0e1322 0%, #151d34 100%)',
          border: '4px double rgba(245, 158, 11, 0.5)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.7)'
        }}>
          {/* Top Seal */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
            marginBottom: '16px'
          }}>
            <Award size={36} color="#fff" />
          </div>

          <div style={{
            fontSize: '0.9rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#fbbf24',
            fontWeight: '800',
            marginBottom: '6px'
          }}>
            NEXUSLEARN ACADEMY
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontFamily: 'var(--font-display)',
            fontWeight: '900',
            letterSpacing: '-0.01em',
            color: '#fff',
            marginBottom: '10px'
          }}>
            CERTIFICATE OF COMPLETION
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '24px' }}>
            This officially certifies that
          </p>

          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#60a5fa',
            borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
            display: 'inline-block',
            padding: '4px 30px 10px',
            marginBottom: '24px'
          }}>
            {userName || 'Distinguished Scholar'}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            has successfully fulfilled all module curricula, interactive code assessments, and practical capstone quizzes for
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            color: '#fbbf24',
            marginBottom: '32px'
          }}>
            {course.title}
          </h2>

          {/* Certificate Footer / Signature Row */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '20px',
            marginTop: '20px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Issue Date</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{dateStr}</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <ShieldCheck size={14} /> Verified Credential
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontSize: '1.4rem',
                color: '#c7d2fe',
                letterSpacing: '1px'
              }}>
                Nexus Academic Council
              </div>
              <div style={{ width: '160px', height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Authorized Signature</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Verification ID</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#fbbf24', fontWeight: '700' }}>
                {certId}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <button onClick={handlePrint} className="glow-btn">
            <Printer size={16} />
            Print / Save as PDF
          </button>
          <button onClick={onClose} className="ghost-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
