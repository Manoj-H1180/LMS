import { NextResponse } from 'next/server';

let serverUser = {
  name: 'Alex Mercer',
  avatar: '👨‍💻',
  title: 'Novice Scholar',
  xp: 320,
  coins: 480,
  streak: 3,
  streakFrozen: false,
  doubleXPUntil: null,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: ['les_1_1'],
  quizScores: {
    'les_1_3': 100
  },
  unlockedAchievements: ['first_step', 'streak_3'],
  inventory: ['theme_cyberpunk'],
  activeTheme: 'cyberpunk',
  lessonNotes: {
    'les_1_1': 'Islands architecture hydrates selectively based on idle time or viewport visibility.'
  },
  soundEnabled: true
};

export async function GET() {
  return NextResponse.json({
    success: true,
    user: serverUser,
  });
}

export async function POST(request) {
  try {
    const updatedData = await request.json();
    if (!updatedData || typeof updatedData !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid user payload' }, { status: 400 });
    }

    serverUser = {
      ...serverUser,
      ...updatedData,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      message: 'User progress saved on Next.js server',
      user: serverUser,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
