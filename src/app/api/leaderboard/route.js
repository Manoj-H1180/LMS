import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllLeaderboardUsers, getUserBySession, getWeeklyLessonActivity } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = (await cookies()).get('lms_session')?.value;
    const sessionUser = token ? await getUserBySession(token) : null;
    if (!sessionUser) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const timeframe = searchParams.get('timeframe') === 'weekly' ? 'weekly' : 'alltime';

    const users = await getAllLeaderboardUsers();
    if (timeframe === 'weekly') {
      const activity = await getWeeklyLessonActivity();
      for (const user of users) user.xp = (activity.get(user.username.toLowerCase()) || 0) * 50;
    }

    // Map and mark the current active user
    const leaderboard = users.map(u => ({
      ...u,
      isCurrentUser: u.username.toLowerCase() === sessionUser.username.toLowerCase()
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard from SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
