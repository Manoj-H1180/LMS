'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Flame, 
  Zap, 
  Award, 
  GraduationCap, 
  FolderSync, 
  Palette, 
  FileText, 
  Globe, 
  Trophy, 
  Rocket, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
// ACHIEVEMENTS will be fetched from API (removed static import)
import { soundFX } from '../../utils/soundEffects';
import { ACHIEVEMENTS } from '../../utils/catalog';

const ICON_MAP = {
  Sparkles,
  Brain,
  Flame,
  Zap,
  Award,
  GraduationCap,
  FolderSync,
  Palette,
  FileText,
  Globe,
  Trophy,
  Rocket
};

export default function BadgesView({ user, onUpdateUser }) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const categories = ['All', 'Learning', 'Quizzes', 'Streaks', 'Creation', 'Milestones'];

  const filteredBadges = selectedFilter === 'All' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(b => b.category === selectedFilter);

  const unlockedCount = user.unlockedAchievements?.length || 0;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Hero Achievement Stats Card */}
      <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-pill" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                <Trophy size={13} color="#f59e0b" />
                ACADEMY QUEST BOARD
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', color: '#fff' }}>
              Achievements & Badges
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Complete milestones, maintain streaks, and score on quizzes to unlock prestigious accolades and bonus XP.
            </p>
          </div>

          {/* Progress Circle / Box */}
          <div style={{
            padding: '16px 24px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
            minWidth: '160px'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>
              {unlockedCount} / {totalCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Badges Mastered ({completionPercent}%)
            </div>
            <div className="xp-track" style={{ height: '6px', marginTop: '8px' }}>
              <div className="xp-fill" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedFilter(cat); soundFX.playClick(); }}
            className={selectedFilter === cat ? 'glow-btn' : 'ghost-btn'}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
        gap: '18px'
      }}>
        {filteredBadges.map(badge => {
          const isUnlocked = user.unlockedAchievements?.includes(badge.id);
          const Icon = ICON_MAP[badge.icon] || Trophy;

          let tierColor = '#cd7f32'; // bronze
          if (badge.tier === 'Silver') tierColor = '#94a3b8';
          if (badge.tier === 'Gold') tierColor = '#f59e0b';
          if (badge.tier === 'Diamond' || badge.tier === 'Platinum') tierColor = '#38bdf8';

          return (
            <div
              key={badge.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                position: 'relative',
                opacity: isUnlocked ? 1 : 0.65,
                border: isUnlocked ? `1px solid ${tierColor}44` : '1px solid var(--border-subtle)',
                boxShadow: isUnlocked ? `0 0 20px ${tierColor}22` : undefined,
                transition: 'all var(--transition-normal)'
              }}
            >
              {/* Badge Icon circle */}
              <div 
                className={isUnlocked ? 'animate-float' : ''}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isUnlocked ? `linear-gradient(135deg, ${tierColor}22 0%, ${tierColor}44 100%)` : 'rgba(255, 255, 255, 0.04)',
                  border: `2px solid ${isUnlocked ? tierColor : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isUnlocked ? tierColor : 'var(--text-dim)'
                }}
              >
                {isUnlocked ? <Icon size={26} /> : <Lock size={22} />}
              </div>

              {/* Badge Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1rem', color: isUnlocked ? '#fff' : 'var(--text-muted)' }}>
                    {badge.title}
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: tierColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {badge.tier}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {badge.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#fbbf24'
                  }}>
                    <Sparkles size={13} />
                    +{badge.xpReward} XP
                  </span>

                  {isUnlocked ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#34d399'
                    }}>
                      <CheckCircle2 size={14} /> Unlocked
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
