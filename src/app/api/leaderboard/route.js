import { NextResponse } from 'next/server';
import { INITIAL_LEADERBOARD } from '../../../utils/storage';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userXP = parseInt(searchParams.get('xp') || '320', 10);

    // Dynamic leaderboard sort
    const leaderboard = INITIAL_LEADERBOARD.map(item => {
      if (item.isCurrentUser) {
        return { ...item, xp: userXP };
      }
      return item;
    }).sort((a, b) => b.xp - a.xp).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
