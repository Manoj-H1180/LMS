import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getCourseProgress, 
  getAllUserCourseProgress, 
  saveCourseProgress, 
  getUserBySession 
} from '../../../lib/db';

async function resolveUsername(request, fallbackUsername) {
  const cookieStore = await cookies();
  const token = cookieStore.get('lms_session')?.value;
  if (token) {
    const user = await getUserBySession(token);
    if (user?.username) return user.username;
  }
  return fallbackUsername || 'default_learner';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const paramUsername = searchParams.get('username');

    const username = await resolveUsername(request, paramUsername);

    if (courseId) {
      const progress = await getCourseProgress(username, courseId);
      return NextResponse.json({
        success: true,
        progress: progress || {
          courseId,
          username,
          lastLessonId: null,
          playbackTime: 0,
          completedLessons: [],
          quizScores: {},
          notes: {},
          progressPercent: 0,
          completed: false
        }
      });
    }

    const allProgress = await getAllUserCourseProgress(username);
    return NextResponse.json({ success: true, allProgress });
  } catch (error) {
    console.error('Error fetching progress from Neon Postgres:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { courseId, lastLessonId, playbackTime, completedLessons, quizScores, notes, progressPercent, completed } = body;

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required' }, { status: 400 });
    }

    const username = await resolveUsername(request, body.username);

    const savedProgress = await saveCourseProgress({
      username,
      courseId,
      lastLessonId,
      playbackTime,
      completedLessons,
      quizScores,
      notes,
      progressPercent,
      completed
    });

    return NextResponse.json({ success: true, message: 'Progress saved to Neon Postgres', progress: savedProgress });
  } catch (error) {
    console.error('Error saving progress to Neon Postgres:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
