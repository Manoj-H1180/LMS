'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, ArrowRight, Play, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function PracticeChallenge({
  challenge,
  onRunChallenge,
  onCompleteChallenge,
  user
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!challenge) return null;

  const handlePredict = (opt) => {
    soundFX.playClick();
    setSelectedOption(opt);
    setSubmitted(false);
  };

  const handleSubmitPrediction = () => {
    if (!selectedOption) return;

    const correct = selectedOption.trim() === challenge.answer.trim();
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      soundFX.playQuizCorrect();
      if (onCompleteChallenge) {
        onCompleteChallenge(challenge.xp || 35);
      }
    } else {
      soundFX.playQuizWrong();
    }

    // Trigger visual execution to show user WHY
    if (onRunChallenge) {
      onRunChallenge(challenge.starterCode);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(26, 32, 54, 0.85) 0%, rgba(15, 20, 34, 0.95) 100%)',
      borderRadius: '14px',
      border: '1px solid rgba(245, 158, 11, 0.35)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
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
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
          }}>
            <Target size={16} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '0.86rem', fontWeight: '800', color: '#fff', letterSpacing: '0.03em' }}>
              PREDICT → EXECUTE → UNDERSTAND
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Make your prediction first, then watch the visualizer prove it!
            </div>
          </div>
        </div>

        <span style={{
          fontSize: '0.74rem',
          fontWeight: '800',
          padding: '3px 10px',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          +{challenge.xp || 35} XP
        </span>
      </div>

      {/* Challenge Question */}
      <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#e2e8f0', lineHeight: 1.4 }}>
        {challenge.question}
      </div>

      {/* Options grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {challenge.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          let border = '1px solid var(--border-subtle)';
          let bg = 'rgba(255, 255, 255, 0.03)';
          let color = '#fff';

          if (submitted) {
            if (opt === challenge.answer) {
              border = '1px solid #10b981';
              bg = 'rgba(16, 185, 129, 0.18)';
              color = '#34d399';
            } else if (isSelected && !isCorrect) {
              border = '1px solid #ef4444';
              bg = 'rgba(239, 68, 68, 0.18)';
              color = '#f87171';
            }
          } else if (isSelected) {
            border = '1px solid var(--accent-primary)';
            bg = 'rgba(99, 102, 241, 0.2)';
            color = '#c4b5fd';
          }

          return (
            <button
              key={idx}
              onClick={() => handlePredict(opt)}
              disabled={submitted}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border,
                background: bg,
                color,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: submitted ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>{opt}</span>
              {submitted && opt === challenge.answer && <CheckCircle2 size={14} color="#34d399" />}
              {submitted && isSelected && !isCorrect && <XCircle size={14} color="#f87171" />}
            </button>
          );
        })}
      </div>

      {/* Submit Button & Feedback */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {!submitted ? (
          <button
            onClick={handleSubmitPrediction}
            disabled={!selectedOption}
            className="glow-btn"
            style={{
              padding: '8px 18px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: selectedOption ? 1 : 0.5
            }}
          >
            <Play size={14} />
            <span>Run My Prediction</span>
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.84rem',
            color: isCorrect ? '#34d399' : '#fbbf24',
            fontWeight: '600'
          }}>
            {isCorrect ? (
              <>
                <Sparkles size={16} color="#34d399" />
                <span>Spot on! Your prediction matched the execution trace (+{challenge.xp || 35} XP earned).</span>
              </>
            ) : (
              <span>Not quite! Watch the execution steps above to see why the answer is <strong>{challenge.answer}</strong>.</span>
            )}
          </div>
        )}
      </div>

      {submitted && challenge.explanation && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.45
        }}>
          <strong>Explanation:</strong> {challenge.explanation}
        </div>
      )}
    </div>
  );
}
