'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  GraduationCap, 
  PlusCircle, 
  FolderInput, 
  Trophy, 
  Medal, 
  ShoppingBag,
  Sparkles,
  Book,
  X,
  Cpu
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  coursesCount, 
  enrolledCount,
  notesCount,
  mobileOpen = false,
  onCloseMobile
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'execution_lab', label: 'Execution Lab', icon: Cpu, badge: 'NEW' },
    { id: 'courses', label: 'Explore Courses', icon: Compass, badge: coursesCount },
    { id: 'my_learning', label: 'My Learning', icon: GraduationCap, badge: enrolledCount > 0 ? enrolledCount : null },
    { id: 'notes', label: 'Study Notes', icon: Book, badge: notesCount || null },
    { id: 'import', label: 'Local Course Import', icon: FolderInput, highlight: true },
    { id: 'studio', label: 'Course Studio', icon: PlusCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Quests & Badges', icon: Medal },
    { id: 'shop', label: 'Rewards Shop', icon: ShoppingBag }
  ];

  const handleNavClick = (id) => {
    soundFX.playClick();
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside id="primary-sidebar" className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Brand Header */}
        <div style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--accent-glow)',
              flexShrink: 0
            }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div className="brand-text">
              <div style={{ fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#fff' }}>
                Nexus<span style={{ color: 'var(--accent-primary)' }}>Learn</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Gamified LMS v2.6
              </div>
            </div>
          </div>

          {/* Close button visible on mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="sidebar-mobile-close-btn"
              title="Close Menu"
              aria-label="Close Menu"
            >
              <X size={20} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          <div style={{ padding: '4px 12px 8px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            NAVIGATION
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive 
                    ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.06) 100%)' 
                    : item.highlight 
                    ? 'rgba(16, 185, 129, 0.06)' 
                    : 'transparent',
                  border: isActive 
                    ? '1px solid var(--border-glow)' 
                    : item.highlight 
                    ? '1px dashed rgba(16, 185, 129, 0.3)' 
                    : '1px solid transparent',
                  color: isActive ? '#fff' : item.highlight ? '#6ee7b7' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = item.highlight ? 'rgba(16, 185, 129, 0.06)' : 'transparent';
                    e.currentTarget.style.color = item.highlight ? '#6ee7b7' : 'var(--text-muted)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon 
                    size={19} 
                    color={isActive ? 'var(--accent-primary)' : item.highlight ? '#10b981' : 'currentColor'} 
                  />
                  <span className="nav-text">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge !== null && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}>
                    {item.badge}
                  </span>
                )}

                {item.highlight && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}>
                    AUTO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Gamification Level Callout in Sidebar Bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }} className="user-info">
          <div style={{
            padding: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                CURRENT MISSION
              </span>
              <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: '700' }}>
                +150 XP
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', lineHeight: 1.3 }}>
              Complete 1 Lesson today to maintain your streak!
            </div>
            <div className="xp-track" style={{ height: '5px', marginTop: '4px' }}>
              <div className="xp-fill" style={{ width: '65%' }} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
