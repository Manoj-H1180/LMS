'use client';

import React from 'react';
import { 
  ShoppingBag, 
  Coins, 
  Sparkles, 
  Shield, 
  Zap, 
  Crown, 
  Brain, 
  Check, 
  Palette 
} from 'lucide-react';
// SHOP_ITEMS will be fetched from API (removed static import)
import { soundFX } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confettiHelper';

const ICON_MAP = {
  Sparkles,
  Shield,
  Zap,
  Crown,
  Brain,
  Palette
};

export default function RewardsShopView({ user, onUpdateUser }) {
  const handlePurchaseOrEquip = (item) => {
    soundFX.playClick();

    const isOwned = user.inventory?.includes(item.id);

    if (isOwned) {
      // If it's a theme, equip it
      if (item.type === 'theme') {
        onUpdateUser({
          ...user,
          activeTheme: item.themeId
        });
        document.documentElement.setAttribute('data-theme', item.themeId);
        soundFX.playCorrect();
      } else if (item.type === 'title') {
        onUpdateUser({
          ...user,
          title: item.titleValue
        });
        soundFX.playCorrect();
      }
      return;
    }

    // Attempt purchase
    if (user.coins < item.cost) {
      soundFX.playIncorrect();
      alert(`Not enough Points! You need ${item.cost - user.coins} more points. Complete lessons & quizzes to earn more.`);
      return;
    }

    // Process purchase
    soundFX.playLevelUp();
    triggerConfetti.burst();

    const updatedInventory = [...(user.inventory || []), item.id];
    let updatedTheme = user.activeTheme;
    let updatedTitle = user.title;
    let updatedStreakFreeze = user.streakFrozen;

    if (item.type === 'theme') {
      updatedTheme = item.themeId;
      document.documentElement.setAttribute('data-theme', item.themeId);
    } else if (item.type === 'title') {
      updatedTitle = item.titleValue;
    } else if (item.id === 'item_streak_freeze') {
      updatedStreakFreeze = true;
    }

    onUpdateUser({
      ...user,
      coins: user.coins - item.cost,
      inventory: updatedInventory,
      activeTheme: updatedTheme,
      title: updatedTitle,
      streakFrozen: updatedStreakFreeze
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Shop Header Banner */}
      <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-pill" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                <ShoppingBag size={14} color="#f59e0b" />
                ACADEMY REWARD BAZAAR
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', color: '#fff' }}>
              Rewards & Customization Store
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Redeem your learning points for futuristic theme engines, prestigious scholar titles, and streak protectors.
            </p>
          </div>

          {/* User Points Balance Card */}
          <div style={{
            padding: '16px 28px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <Coins size={32} color="#f59e0b" fill="#f59e0b" />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fde68a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AVAILABLE BALANCE
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fbbf24', lineHeight: 1 }}>
                {user.coins} <span style={{ fontSize: '1rem' }}>PTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {SHOP_ITEMS.map(item => {
          const isOwned = user.inventory?.includes(item.id);
          const isEquipped = (item.type === 'theme' && user.activeTheme === item.themeId) ||
                             (item.type === 'title' && user.title === item.titleValue);
          const canAfford = user.coins >= item.cost;
          const Icon = ICON_MAP[item.icon] || Sparkles;

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                border: isEquipped ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                boxShadow: isEquipped ? 'var(--shadow-glow)' : undefined
              }}
            >
              {/* Item Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: item.previewGradient || 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>
                      {item.name}
                    </h3>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>
                      {item.type}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '800',
                  color: '#fbbf24',
                  fontSize: '0.9rem'
                }}>
                  <Coins size={14} fill="#f59e0b" />
                  {item.cost}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {item.description}
              </p>

              {/* Preview Bar for Themes */}
              {item.previewGradient && (
                <div style={{
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  background: item.previewGradient
                }} />
              )}

              {/* Action Button */}
              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <button
                  onClick={() => handlePurchaseOrEquip(item)}
                  className={isEquipped ? 'ghost-btn' : isOwned ? 'glow-btn' : canAfford ? 'glow-btn' : 'ghost-btn'}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.88rem',
                    background: isEquipped ? 'rgba(16, 185, 129, 0.15)' : undefined,
                    borderColor: isEquipped ? 'rgba(16, 185, 129, 0.4)' : undefined,
                    color: isEquipped ? '#34d399' : undefined,
                    opacity: !isOwned && !canAfford ? 0.5 : 1
                  }}
                >
                  {isEquipped ? (
                    <>
                      <Check size={16} /> Currently Active
                    </>
                  ) : isOwned ? (
                    <>
                      <Sparkles size={16} /> Equip / Activate
                    </>
                  ) : canAfford ? (
                    <>
                      <Coins size={15} /> Unlock for {item.cost} PTS
                    </>
                  ) : (
                    <>
                      Need {item.cost - user.coins} more PTS
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
