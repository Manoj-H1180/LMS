import { NextResponse } from 'next/server';
import { getUser, getAccountWithPassword, upsertUser } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, username, password, displayName, avatar } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // LOGIN
    if (action === 'login') {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
      }

      const account = getAccountWithPassword(cleanUsername);
      if (!account) {
        return NextResponse.json({ success: false, error: 'No account found with that username.' }, { status: 404 });
      }

      // Check password (matches btoa or plaintext)
      const encodedPass = btoa(password);
      if (account.password !== encodedPass && account.password !== password) {
        return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
      }

      const userProfile = getUser(cleanUsername);
      return NextResponse.json({
        success: true,
        message: 'Logged in successfully',
        user: userProfile
      });
    }

    // SIGNUP
    if (action === 'signup') {
      if (!password || password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      if (cleanUsername.length < 3) {
        return NextResponse.json({ success: false, error: 'Username must be at least 3 characters.' }, { status: 400 });
      }

      const existing = getAccountWithPassword(cleanUsername);
      if (existing) {
        return NextResponse.json({ success: false, error: 'Username already taken. Try another.' }, { status: 409 });
      }

      const newUser = {
        username: cleanUsername,
        password: btoa(password),
        name: displayName?.trim() || cleanUsername,
        avatar: avatar || '🎓',
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
        soundEnabled: true
      };

      const saved = upsertUser(newUser);

      return NextResponse.json({
        success: true,
        message: 'Account created successfully in SQLite',
        user: saved
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
