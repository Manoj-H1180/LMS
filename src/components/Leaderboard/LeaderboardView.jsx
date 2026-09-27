'use client';

import React, { useEffect, useState } from 'react';
import { 
  Crown, 
  Flame, 
  Medal
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function LeaderboardView({ user }) {
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'alltime'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/leaderboard?timeframe=${timeframe}`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not load leaderboard.');
        if (!cancelled) setLeaderboard(data.leaderboard || []);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [timeframe]);

  const updatedLeaderboard = leaderboard.map(item => item.isCurrentUser ? {
    ...item,
    name: `${user.name} (You)`,
    xp: timeframe === 'alltime' ? user.xp : item.xp,
    streak: user.streak,
    badges: user.unlockedAchievements?.length || 0
  } : item).sort((a, b) => b.xp - a.xp).map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  const topThree = [
    updatedLeaderboard.find(i => i.rank === 2),
    updatedLeaderboard.find(i => i.rank === 1),
    updatedLeaderboard.find(i => i.rank === 3),
  ].filter(Boolean);

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
          {timeframe === 'weekly' ? 'WEEKLY SPRINT' : 'GLOBAL HALL OF FAME'}
        </div>

        <h1 style={{ fontSize: '2.4rem', color: '#fff' }}>
          Leaderboard & Ranks
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', margin: '8px auto 20px' }}>
          {timeframe === 'weekly' ? 'See who has completed the most lessons in the last seven days.' : 'Compete with learners across the globe and climb the all-time XP rankings.'}
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

      {error && <div className="glass-panel" role="alert" style={{ padding: '16px', color: '#fca5a5' }}>{error}</div>}
      {loading && <div role="status" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading leaderboard…</div>}
      {!loading && !error && updatedLeaderboard.length === 0 && <div className="glass-panel" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>No learners have joined the leaderboard yet.</div>}

      {/* Podium for Top 3 */}
      {!loading && !error && updatedLeaderboard.length > 0 && <div className="leaderboard-podium-container">
        {/* 2nd Place */}
        {topThree[0] && (
          <div className="podium-column podium-silver">
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
              {topThree[0].avatar}
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff', textAlign: 'center' }}>
              {topThree[0].name}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '800' }}>
              {topThree[0].xp} XP
            </div>
            <div className="podium-pillar podium-pillar-silver">
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#94a3b8' }}>2</span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '700' }}>SILVER</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[1] && (
          <div className="podium-column podium-gold" style={{ position: 'relative' }}>
            <div className="animate-flame" style={{ position: 'absolute', top: '-28px' }}>
              <Crown size={32} color="#f59e0b" fill="#f59e0b" />
            </div>
            <div style={{ fontSize: '3.2rem', marginBottom: '8px' }}>
              {topThree[1].avatar}
            </div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff', textAlign: 'center' }}>
              {topThree[1].name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '800' }}>
              {topThree[1].xp} XP
            </div>
            <div className="podium-pillar podium-pillar-gold">
              <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#f59e0b' }}>1</span>
              <span style={{ fontSize: '0.8rem', color: '#fde68a', textTransform: 'uppercase', fontWeight: '800' }}>CHAMPION</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="podium-column podium-bronze">
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
              {topThree[2].avatar}
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff', textAlign: 'center' }}>
              {topThree[2].name}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '800' }}>
              {topThree[2].xp} XP
            </div>
            <div className="podium-pillar podium-pillar-bronze">
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#cd7f32' }}>3</span>
              <span style={{ fontSize: '0.75rem', color: '#fdba74', textTransform: 'uppercase', fontWeight: '700' }}>BRONZE</span>
            </div>
          </div>
        )}
      </div>}

      {/* Leaderboard Table */}
      {!loading && !error && updatedLeaderboard.length > 0 && <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
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
      </div>}
    </div>
  );
}
