'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  GraduationCap, 
  BookOpen,
  Trophy, 
  Menu 
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export default function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  enrolledCount, 
  onOpenMobileMenu 
}) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: Compass },
    { id: 'my_learning', label: 'My Learning', icon: GraduationCap, badge: enrolledCount > 0 ? enrolledCount : null },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  ];

  const handleNavClick = (tabId) => {
    soundFX.playClick();
    setActiveTab(tabId);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              handleNavClick(tab.id);
            }}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {tab.badge !== undefined && tab.badge !== null && (
                <span className="mobile-nav-badge">{tab.badge}</span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* Menu / More Button */}
      <button
        onClick={() => {
          soundFX.playClick();
          onOpenMobileMenu?.();
        }}
        className="mobile-bottom-nav-item"
        aria-label="Open More Menu"
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
}
