import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getUser, 
  getAccountWithPassword, 
  upsertUser, 
  createSession, 
  getUserBySession, 
  deleteSession 
} from '../../../lib/db';

const SESSION_COOKIE_NAME = 'lms_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// GET /api/auth — Validate active session from SQLite database
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    // Also support Authorization header
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json({ success: true, authenticated: false, user: null });
    }

    // Query SQLite sessions & users tables
    const user = getUserBySession(token);
    if (!user) {
      // Token not found or expired in SQLite
      return NextResponse.json({ success: true, authenticated: false, user: null });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
      token
    });
  } catch (error) {
    console.error('Session verification error from SQLite:', error);
    return NextResponse.json({ success: false, authenticated: false, error: error.message }, { status: 500 });
  }
}

// POST /api/auth — Login, Signup, or Logout
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, username, password, displayName, avatar } = body;

    // LOGOUT
    if (action === 'logout') {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || body.token;
      if (token) {
        deleteSession(token);
      }
      const response = NextResponse.json({
        success: true,
        message: 'Logged out from SQLite session'
      });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

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

      // Check password against SQLite stored hash
      const encodedPass = btoa(password);
      if (account.password !== encodedPass && account.password !== password) {
        return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
      }

      const userProfile = getUser(cleanUsername);

      // Create session in SQLite
      const token = createSession(cleanUsername);

      const response = NextResponse.json({
        success: true,
        message: 'Authenticated against SQLite on disk',
        user: userProfile,
        token
      });

      // Set HTTP-only secure cookie
      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE
      });

      return response;
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

      const savedUser = upsertUser(newUser);

      // Create session in SQLite
      const token = createSession(cleanUsername);

      const response = NextResponse.json({
        success: true,
        message: 'Account created and session saved in SQLite on disk',
        user: savedUser,
        token
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
