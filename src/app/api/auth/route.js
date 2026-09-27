import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getUser, 
  getAccountWithPassword, 
  upsertUser, 
  createSession, 
  getUserBySession, 
  deleteSession,
  hashPassword,
  verifyPassword,
  updatePassword,
  ensureTables
} from '../../../lib/db';

const SESSION_COOKIE_NAME = 'lms_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// GET /api/auth — Validate active session from Neon Postgres
export async function GET(request) {
  try {
    await ensureTables();
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json({ success: true, authenticated: false, user: null });
    }

    const user = await getUserBySession(token);
    if (!user) {
      return NextResponse.json({ success: true, authenticated: false, user: null });
    }

    return NextResponse.json({ success: true, authenticated: true, user, token });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ success: false, authenticated: false, error: error.message }, { status: 500 });
  }
}

// POST /api/auth — Login, Signup, or Logout
export async function POST(request) {
  try {
    await ensureTables();
    const body = await request.json();
    const { action, username, password, displayName, avatar } = body;

    // LOGOUT
    if (action === 'logout') {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || body.token;
      if (token) {
        await deleteSession(token);
      }
      const response = NextResponse.json({ success: true, message: 'Logged out' });
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

      const account = await getAccountWithPassword(cleanUsername);
      if (!account) {
        return NextResponse.json({ success: false, error: 'No account found with that username.' }, { status: 404 });
      }

      if (!(await verifyPassword(password, account.password))) {
        return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
      }

      if (!account.password.startsWith('scrypt:')) {
        await updatePassword(cleanUsername, await hashPassword(password));
      }

      const userProfile = await getUser(cleanUsername);
      const token = await createSession(cleanUsername);

      const response = NextResponse.json({ success: true, message: 'Login successful', user: userProfile, token });
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

      const existing = await getAccountWithPassword(cleanUsername);
      if (existing) {
        return NextResponse.json({ success: false, error: 'Username already taken. Try another.' }, { status: 409 });
      }

      const newUser = {
        username: cleanUsername,
        password: await hashPassword(password),
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

      const savedUser = await upsertUser(newUser);
      const token = await createSession(cleanUsername);

      const response = NextResponse.json({ success: true, message: 'Account created', user: savedUser, token });
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
