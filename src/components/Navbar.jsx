'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Coins, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Palette, 
  Search, 
  Bell, 
  ChevronDown,
  Trophy,
  Zap,
  LogOut
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { calculateLevel } from '../utils/storage';

export default function Navbar({ 
  user, 
  setUser, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery,
  onOpenShop,
  onLogout
}) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const levelInfo = calculateLevel(user.xp);

  const toggleSound = () => {
    const newState = soundFX.toggleSound();
    setUser(prev => ({ ...prev, soundEnabled: newState }));
    if (newState) soundFX.playClick();
  };

  const handleThemeChange = (themeName) => {
    setUser(prev => ({ ...prev, activeTheme: themeName }));
    document.documentElement.setAttribute('data-theme', themeName);
    setThemeMenuOpen(false);
    soundFX.playClick();
  };

  return (
    <header className="top-navbar">
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1', maxWidth: '420px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search 
            size={18} 
            color="var(--text-dim)" 
            style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} 
          />
          <input
            type="text"
            placeholder="Search courses, modules, topics (e.g. Python, AI, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-primary)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            }}
          />
        </div>
      </div>

      {/* Gamification Stats & User Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Streak Counter */}
        <div 
          title={`${user.streak} Day Learning Streak! Practice daily to protect your flame.`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('achievements')}
        >
          <span className="animate-flame">
            <Flame size={18} color="#ef4444" fill="#ef4444" />
          </span>
          <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fca5a5' }}>
            {user.streak}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            DAYS
          </span>
        </div>

        {/* Gamification Coins / Shop Points */}
        <div
          title="Earn points by completing quizzes & lessons. Click to open Rewards Shop!"
          onClick={onOpenShop}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '7px 14px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)'}
        >
          <Coins size={17} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fde68a' }}>
            {user.coins}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: '700' }}>
            PTS
          </span>
        </div>

        {/* XP Level Pill */}
        <div 
          onClick={() => setActiveTab('leaderboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer'
          }}
          title={`Level ${levelInfo.level}: ${levelInfo.title} (${user.xp} XP total, ${levelInfo.neededXP} XP to Level ${levelInfo.level + 1})`}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: '800'
          }}>
            {levelInfo.level}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c7d2fe' }}>
                {levelInfo.title}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {user.xp} XP
              </span>
            </div>
            <div style={{ width: '85px', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${levelInfo.progress}%`, 
                  height: '100%', 
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 0 6px rgba(99, 102, 241, 0.8)' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="ghost-btn"
          style={{ padding: '8px', borderRadius: '50%', minWidth: '36px', height: '36px' }}
          title={user.soundEnabled ? 'Mute Game Audio Effects' : 'Enable Game Audio Effects'}
        >
          {user.soundEnabled ? <Volume2 size={18} color="var(--accent-primary)" /> : <VolumeX size={18} color="var(--text-dim)" />}
        </button>

        {/* Theme Picker Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="ghost-btn"
            style={{ padding: '8px', borderRadius: '50%', minWidth: '36px', height: '36px' }}
            title="Switch Visual Theme"
          >
            <Palette size={18} color="var(--accent-secondary)" />
          </button>

          {themeMenuOpen && (
            <div 
              className="glass-panel"
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '180px',
                padding: '8px',
                zIndex: 100,
                border: '1px solid var(--border-glow)'
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                THEME PALETTES
              </div>
              {[
                { id: 'default', label: 'Default Nebula', color: '#6366f1' },
                { id: 'cyberpunk', label: 'Cyberpunk Neon', color: '#06b6d4' },
                { id: 'emerald', label: 'Emerald Matrix', color: '#10b981' },
                { id: 'sunset', label: 'Solar Flare', color: '#f59e0b' },
                { id: 'royal', label: 'Royal Velvet', color: '#8b5cf6' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    background: user.activeTheme === theme.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.color }} />
                  {theme.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar + Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 8px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            fontSize: '1.25rem',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%'
          }}>
            {user.avatar || '👨‍💻'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            {user.name}
          </span>
          {onLogout && (
            <button
              id="navbar-logout-btn"
              onClick={onLogout}
              title="Sign out"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px 6px',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'none'; }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
