import { NextResponse } from 'next/server';
import { getAllLeaderboardUsers } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUser = searchParams.get('username') || '';

    const users = await getAllLeaderboardUsers();

    // Map and mark the current active user
    const leaderboard = users.map(u => ({
      ...u,
      isCurrentUser: currentUser ? u.username.toLowerCase() === currentUser.toLowerCase() : false
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
