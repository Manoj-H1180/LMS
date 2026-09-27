import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, upsertUser, getUserBySession, saveAuthenticatedUserUpdates, ensureTables } from '../../../lib/db';

const DEFAULT_USER = {
  username: 'default_learner',
  name: 'Learner',
  avatar: '🎓',
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

async function getSessionUser() {
  const token = (await cookies()).get('lms_session')?.value;
  return token ? getUserBySession(token) : null;
}

export async function GET() {
  try {
    await ensureTables();
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const username = sessionUser.username;

    let user = await getUser(username);
    if (!user) {
      user = await upsertUser({ ...DEFAULT_USER, username });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error getting user from Neon Postgres:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve user' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureTables();
    const updatedData = await request.json();
    if (!updatedData || typeof updatedData !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid user payload' }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const username = sessionUser.username.toLowerCase();
    const savedUser = await saveAuthenticatedUserUpdates(username, updatedData);

    return NextResponse.json({ success: true, message: 'User progress saved to Neon Postgres', user: savedUser });
  } catch (error) {
    console.error('Error saving user to Neon Postgres:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
