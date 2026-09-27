'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, UserPlus, Sparkles, BookOpen } from 'lucide-react';

const AVATARS = ['🎓', '👨‍💻', '👩‍💻', '🧑‍🎨', '🧑‍🔬', '🧙', '🦊', '🐉', '🚀', '⚡', '🌟', '🔥'];

const AUTH_KEY = 'nexus_lms_auth_v1';
const ACCOUNTS_KEY = 'nexus_lms_accounts_v1';

export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

function getAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccount(username, data) {
  const accounts = getAccounts();
  accounts[username.toLowerCase()] = data;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function saveSession(userData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ ...userData, loggedInAt: Date.now() }));
}

export default function AuthScreen({ onAuthenticated }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Please fill in all fields.'); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const accounts = getAccounts();
    const account = accounts[username.toLowerCase()];
    if (!account) { setError('No account found with that username.'); setIsLoading(false); return; }
    if (account.password !== btoa(password)) { setError('Incorrect password.'); setIsLoading(false); return; }
    saveSession(account.userData);
    onAuthenticated(account.userData);
    setIsLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !displayName.trim() || !password) { setError('Please fill in all fields.'); return; }
    if (username.trim().length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    const accounts = getAccounts();
    if (accounts[username.toLowerCase()]) { setError('Username already taken. Try another.'); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const userData = {
      username: username.toLowerCase(),
      name: displayName.trim(),
      avatar: selectedAvatar,
      title: 'Novice Scholar',
      xp: 0,
      coins: 100,
      streak: 0,
      streakFrozen: false,
      doubleXPUntil: null,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedLessons: [],
      quizScores: {},
      unlockedAchievements: [],
      inventory: ['theme_cyberpunk'],
      activeTheme: 'cyberpunk',
      lessonNotes: {},
      soundEnabled: true,
    };
    saveAccount(username, { password: btoa(password), userData });
    saveSession(userData);
    onAuthenticated(userData);
    setIsLoading(false);
  };

  const ORB_CONFIGS = [
    { color: 'rgba(99,102,241,0.15)', size: 280, top: 10, left: 5, dur: 8 },
    { color: 'rgba(168,85,247,0.12)', size: 200, top: 60, left: 75, dur: 10 },
    { color: 'rgba(6,182,212,0.1)', size: 320, top: 30, left: 40, dur: 7 },
    { color: 'rgba(245,158,11,0.08)', size: 180, top: 70, left: 15, dur: 12 },
    { color: 'rgba(236,72,153,0.1)', size: 240, top: 5, left: 60, dur: 9 },
    { color: 'rgba(16,185,129,0.1)', size: 200, top: 80, left: 50, dur: 11 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 45%),
        radial-gradient(circle at 80% 80%, rgba(168,85,247,0.1) 0%, transparent 45%)
      `,
      padding: '20px',
      fontFamily: 'var(--font-main)',
      position: 'relative',
    }}>
      {/* Floating orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {ORB_CONFIGS.map((orb, i) => (
          <div key={i} style={{
            position: 'absolute',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            top: `${orb.top}%`,
            left: `${orb.left}%`,
            transform: 'translate(-50%, -50%)',
            animation: `orbFloat ${orb.dur}s ease-in-out infinite`,
            animationDelay: `${i * 1.3}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-55%) scale(1.06)} }
        @keyframes authIn { from{opacity:0;transform:translateY(28px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .auth-input {
          width:100%; padding:12px 16px;
          background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:10px; color:#f8fafc;
          font-size:0.95rem; font-family:var(--font-main);
          transition:all 0.2s; outline:none;
        }
        .auth-input:focus {
          border-color:var(--accent-primary);
          background:rgba(255,255,255,0.09);
          box-shadow:0 0 0 3px rgba(99,102,241,0.18);
        }
        .auth-input::placeholder { color:#64748b; }
        .av-opt {
          width:44px; height:44px; border-radius:10px;
          border:2px solid transparent;
          background:rgba(255,255,255,0.06);
          cursor:pointer; font-size:1.35rem;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.18s;
        }
        .av-opt:hover { border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.12); transform:scale(1.08); }
        .av-opt.sel { border-color:var(--accent-primary); background:rgba(99,102,241,0.2); transform:scale(1.12); box-shadow:0 0 14px rgba(99,102,241,0.4); }
        .tab-btn {
          flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
          padding:9px; border:none; border-radius:8px;
          font-family:var(--font-display); font-weight:600; font-size:0.9rem;
          cursor:pointer; transition:all 0.22s;
        }
        .tab-btn.active { background:var(--accent-gradient); color:#fff; box-shadow:0 2px 12px rgba(99,102,241,0.35); }
        .tab-btn.inactive { background:transparent; color:var(--text-muted); }
        .err-box { padding:10px 14px; background:rgba(244,63,94,0.12); border:1px solid rgba(244,63,94,0.3); border-radius:8px; color:#fca5a5; font-size:0.85rem; }
        .lbl { display:block; font-size:0.78rem; font-weight:700; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.06em; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '460px', animation: 'authIn 0.45s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'var(--accent-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
            }}>
              <BookOpen size={26} color="#fff" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>NexusLearn</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '3px' }}>Next-Gen Learning Platform</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            {[['🏆', 'XP & Levels'], ['⚡', 'Gamified'], ['📁', 'Local Courses'], ['🎖️', 'Achievements']].map(([icon, label]) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px',
                fontSize: '0.73rem', color: 'var(--text-muted)',
              }}>{icon} {label}</span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: '28px 32px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
            <button className={`tab-btn ${tab === 'login' ? 'active' : 'inactive'}`} onClick={() => { setTab('login'); setError(''); }}>
              <LogIn size={16} /> Sign In
            </button>
            <button className={`tab-btn ${tab === 'signup' ? 'active' : 'inactive'}`} onClick={() => { setTab('signup'); setError(''); }}>
              <UserPlus size={16} /> Create Account
            </button>
          </div>

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="lbl">Username</label>
                <input id="auth-username" className="auth-input" type="text" placeholder="your_username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus />
              </div>
              <div>
                <label className="lbl">Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="auth-password" className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" style={{ paddingRight: '44px' }} />
                  <button type="button" id="auth-toggle-pw" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && <div className="err-box">⚠ {error}</div>}
              <button id="auth-login-btn" type="submit" className="glow-btn" disabled={isLoading} style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '4px' }}>
                {isLoading ? <><Sparkles size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : <><LogIn size={18} /> Sign In</>}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                No account?{' '}
                <button type="button" onClick={() => { setTab('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                  Create one free →
                </button>
              </p>
            </form>
          )}

          {/* SIGNUP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="lbl">Choose Avatar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {AVATARS.map(av => (
                    <button key={av} type="button" className={`av-opt${selectedAvatar === av ? ' sel' : ''}`} onClick={() => setSelectedAvatar(av)}>{av}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="lbl">Display Name</label>
                  <input id="signup-name" className="auth-input" type="text" placeholder="Alex Mercer" value={displayName} onChange={e => setDisplayName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="lbl">Username</label>
                  <input id="signup-username" className="auth-input" type="text" placeholder="alex_dev" value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, '_'))} autoComplete="username" />
                </div>
              </div>
              <div>
                <label className="lbl">Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="signup-password" className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="lbl">Confirm Password</label>
                <input id="signup-confirm" className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
              {error && <div className="err-box">⚠ {error}</div>}
              <button id="auth-signup-btn" type="submit" className="glow-btn" disabled={isLoading} style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '4px', background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', boxShadow: '0 4px 18px rgba(16,185,129,0.4)' }}>
                {isLoading ? <><Sparkles size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</> : <><UserPlus size={18} /> Create Account &amp; Start Learning</>}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => { setTab('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                  Sign in →
                </button>
              </p>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.73rem', color: 'var(--text-dim)' }}>
          🔒 All data stored locally on your device — no external servers.
        </p>
      </div>
    </div>
  );
}
