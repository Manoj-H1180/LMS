'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Sparkles, 
  Medal, 
  TrendingUp, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../../utils/storage';
import { soundFX } from '../../utils/soundEffects';

export default function LeaderboardView({ user }) {
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'alltime'

  // Merge current user's dynamic XP into leaderboard and sort
  const updatedLeaderboard = [...INITIAL_LEADERBOARD].map(item => {
    if (item.isCurrentUser) {
      return {
        ...item,
        xp: user.xp,
        streak: user.streak,
        badges: user.unlockedAchievements?.length || 0,
        name: `${user.name} (You)`
      };
    }
    return item;
  }).sort((a, b) => b.xp - a.xp).map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  const topThree = [
    updatedLeaderboard.find(i => i.rank === 2),
    updatedLeaderboard.find(i => i.rank === 1),
    updatedLeaderboard.find(i => i.rank === 3),
  ].filter(Boolean);

  const remaining = updatedLeaderboard.slice(3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-full)',
          color: '#fbbf24',
          fontSize: '0.82rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          <Crown size={15} />
          GLOBAL HALL OF FAME
        </div>

        <h1 style={{ fontSize: '2.4rem', color: '#fff' }}>
          Leaderboard & Ranks
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', margin: '8px auto 20px' }}>
          Compete with learners across the globe. Earn XP from lectures, coding quizzes, and project uploads to climb to the top.
        </p>

        {/* Timeframe switch */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => { setTimeframe('weekly'); soundFX.playClick(); }}
            className={timeframe === 'weekly' ? 'glow-btn' : 'ghost-btn'}
            style={{ padding: '7px 18px', fontSize: '0.85rem' }}
          >
            Weekly Sprint
          </button>
          <button
            onClick={() => { setTimeframe('alltime'); soundFX.playClick(); }}
            className={timeframe === 'alltime' ? 'glow-btn' : 'ghost-btn'}
            style={{ padding: '7px 18px', fontSize: '0.85rem' }}
          >
            All-Time Champions
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '20px',
        padding: '20px 0'
      }}>
        {/* 2nd Place */}
        {topThree[0] && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '180px'
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '8px'
            }}>
              {topThree[0].avatar}
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff', textAlign: 'center' }}>
              {topThree[0].name}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '800' }}>
              {topThree[0].xp} XP
            </div>
            <div style={{
              marginTop: '12px',
              width: '100%',
              height: '110px',
              background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.25) 0%, rgba(148, 163, 184, 0.05) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.4)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#94a3b8' }}>2</span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '700' }}>SILVER</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[1] && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '210px',
            position: 'relative'
          }}>
            <div className="animate-flame" style={{ position: 'absolute', top: '-28px' }}>
              <Crown size={32} color="#f59e0b" fill="#f59e0b" />
            </div>
            <div style={{
              fontSize: '3.2rem',
              marginBottom: '8px'
            }}>
              {topThree[1].avatar}
            </div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff', textAlign: 'center' }}>
              {topThree[1].name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '800' }}>
              {topThree[1].xp} XP
            </div>
            <div style={{
              marginTop: '12px',
              width: '100%',
              height: '150px',
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0.06) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.6)',
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#f59e0b' }}>1</span>
              <span style={{ fontSize: '0.8rem', color: '#fde68a', textTransform: 'uppercase', fontWeight: '800' }}>CHAMPION</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '180px'
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '8px'
            }}>
              {topThree[2].avatar}
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff', textAlign: 'center' }}>
              {topThree[2].name}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '800' }}>
              {topThree[2].xp} XP
            </div>
            <div style={{
              marginTop: '12px',
              width: '100%',
              height: '90px',
              background: 'linear-gradient(180deg, rgba(205, 127, 50, 0.25) 0%, rgba(205, 127, 50, 0.05) 100%)',
              border: '1px solid rgba(205, 127, 50, 0.4)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#cd7f32' }}>3</span>
              <span style={{ fontSize: '0.75rem', color: '#fdba74', textTransform: 'uppercase', fontWeight: '700' }}>BRONZE</span>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px' }}>Rank</th>
              <th style={{ padding: '12px 16px' }}>Scholar</th>
              <th style={{ padding: '12px 16px' }}>Rank Title</th>
              <th style={{ padding: '12px 16px' }}>Streak</th>
              <th style={{ padding: '12px 16px' }}>Badges</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total XP</th>
            </tr>
          </thead>
          <tbody>
            {updatedLeaderboard.map((item) => {
              const isUser = item.isCurrentUser;

              return (
                <tr
                  key={item.name}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: isUser ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    borderLeft: isUser ? '3px solid var(--accent-primary)' : '3px solid transparent'
                  }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: '800', color: item.rank <= 3 ? '#fbbf24' : 'var(--text-muted)' }}>
                    #{item.rank}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{item.avatar}</span>
                      <span style={{ fontWeight: isUser ? '800' : '600', color: isUser ? '#c7d2fe' : '#fff' }}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {item.title}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fca5a5', fontWeight: '700', fontSize: '0.85rem' }}>
                      <Flame size={14} color="#ef4444" fill="#ef4444" />
                      {item.streak}d
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Medal size={14} color="var(--accent-secondary)" />
                      {item.badges}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                    {item.xp} XP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
