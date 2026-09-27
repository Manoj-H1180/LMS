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
  Menu,
  LogOut
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { calculateLevel } from '../utils/storage';

export default function Navbar({ 
  user, 
  setUser, 
  activeTab: _activeTab,
  setActiveTab, 
  searchQuery, 
  setSearchQuery,
  onOpenShop,
  onLogout,
  onToggleMobileMenu
}) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
      {/* Left: Mobile Menu Toggle & Brand Icon (Mobile Only) + Desktop Search */}
      <div className="navbar-left-section">
        {onToggleMobileMenu && (
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleMobileMenu();
            }}
            className="navbar-hamburger-btn"
            title="Open Menu"
            aria-label="Open Navigation Menu"
            aria-expanded="false"
            aria-controls="primary-sidebar"
          >
            <Menu size={22} color="#fff" />
          </button>
        )}

        {/* Mobile Brand Logo */}
        <div className="navbar-mobile-brand">
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>
            Nexus<span style={{ color: 'var(--accent-primary)' }}>Learn</span>
          </span>
        </div>

        {/* Desktop Search Bar */}
        <div className="navbar-search-wrapper">
          <div style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={17} 
              color="var(--text-dim)" 
              style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} 
            />
            <input
              type="text"
              placeholder="Search courses, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
          </div>
        </div>
      </div>

      {/* Right: Stats & Controls */}
      <div className="navbar-right-section">
        {/* Mobile Search Toggle Icon */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="navbar-mobile-search-btn ghost-btn"
          title="Search"
          aria-label="Toggle Search"
          aria-expanded={mobileSearchOpen}
        >
          <Search size={18} color="var(--text-main)" />
        </button>

        {/* Streak Counter */}
        <button type="button"
          title={`${user.streak} Day Streak! Practice daily to protect your flame.`}
          className="navbar-stat-pill streak-pill"
          onClick={() => setActiveTab('achievements')}
          aria-label={`Open achievements. ${user.streak} day streak`}
        >
          <span className="animate-flame">
            <Flame size={17} color="#ef4444" fill="#ef4444" />
          </span>
          <span className="stat-value" style={{ color: '#fca5a5' }}>
            {user.streak}
          </span>
          <span className="stat-label">
            DAYS
          </span>
        </button>

        {/* Gamification Coins / Shop Points */}
        <button type="button"
          title="Points — Click to open Rewards Shop"
          onClick={onOpenShop}
          className="navbar-stat-pill coins-pill"
          aria-label={`Open rewards shop. ${user.coins} points`}
        >
          <Coins size={16} color="#f59e0b" fill="#f59e0b" />
          <span className="stat-value" style={{ color: '#fde68a' }}>
            {user.coins}
          </span>
          <span className="stat-label" style={{ color: '#fbbf24' }}>
            PTS
          </span>
        </button>

        {/* XP Level Pill */}
        <button type="button"
          onClick={() => setActiveTab('leaderboard')}
          className="navbar-stat-pill level-pill"
          title={`Level ${levelInfo.level}: ${levelInfo.title} (${user.xp} XP total)`}
          aria-label={`Open leaderboard. Level ${levelInfo.level}, ${user.xp} XP`}
        >
          <div className="level-badge-circle">
            {levelInfo.level}
          </div>
          <div className="level-details">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#c7d2fe' }}>
                {levelInfo.title}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {user.xp} XP
              </span>
            </div>
            <div style={{ width: '75px', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
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
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="ghost-btn navbar-icon-btn"
          title={user.soundEnabled ? 'Mute Game Audio Effects' : 'Enable Game Audio Effects'}
          aria-label="Toggle Sound"
        >
          {user.soundEnabled ? <Volume2 size={17} color="var(--accent-primary)" /> : <VolumeX size={17} color="var(--text-dim)" />}
        </button>

        {/* Theme Picker Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="ghost-btn navbar-icon-btn"
            title="Switch Visual Theme"
            aria-label="Switch Visual Theme"
          >
            <Palette size={17} color="var(--accent-secondary)" />
          </button>

          {themeMenuOpen && (
            <div className="glass-panel theme-dropdown-menu">
              <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)' }}>
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
                  className={`theme-option-btn ${user.activeTheme === theme.id ? 'active' : ''}`}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.color, flexShrink: 0 }} />
                  {theme.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Pill & Logout */}
        <div className="navbar-user-pill">
          <div className="user-avatar-circle">
            {user.avatar || '👨‍💻'}
          </div>
          <span className="user-name-text">
            {user.name}
          </span>
          {onLogout && (
            <button
              id="navbar-logout-btn"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              className="navbar-logout-icon"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Mobile Search Bar Row */}
      {mobileSearchOpen && (
        <div className="navbar-mobile-search-row">
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <Search 
              size={16} 
              color="var(--text-dim)" 
              style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} 
            />
            <input
              type="text"
              placeholder="Search courses, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
