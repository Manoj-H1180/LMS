import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, upsertUser, getUserBySession } from '../../../lib/db';

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

async function getAuthenticatedUsername(request, fallbackUsername) {
  const cookieStore = await cookies();
  const token = cookieStore.get('lms_session')?.value;
  if (token) {
    const sessionUser = getUserBySession(token);
    if (sessionUser?.username) return sessionUser.username;
  }
  return fallbackUsername || 'default_learner';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paramUsername = searchParams.get('username');

    const username = await getAuthenticatedUsername(request, paramUsername);

    let user = getUser(username);
    if (!user) {
      user = upsertUser({ ...DEFAULT_USER, username });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error getting user from SQLite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve user from SQLite' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const updatedData = await request.json();
    if (!updatedData || typeof updatedData !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid user payload' }, { status: 400 });
    }

    const username = (await getAuthenticatedUsername(request, updatedData.username)).toLowerCase();
    const existing = getUser(username) || { ...DEFAULT_USER, username };

    const merged = {
      ...existing,
      ...updatedData,
      username,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    const savedUser = upsertUser(merged);

    return NextResponse.json({
      success: true,
      message: 'User progress persisted to SQLite database on disk',
      user: savedUser,
    });
  } catch (error) {
    console.error('Error saving user to SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
