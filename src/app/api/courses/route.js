import { NextResponse } from 'next/server';
import { 
  getAllCourses, 
  upsertCourse, 
  syncCourses, 
  deleteCourse, 
  clearAllCourses 
} from '../../../lib/db';

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('Error fetching courses from Neon Postgres:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'clear') {
      await clearAllCourses();
      return NextResponse.json({ success: true, message: 'All courses cleared', count: 0 });
    }

    if (body.courses && Array.isArray(body.courses)) {
      const savedCourses = await syncCourses(body.courses);
      return NextResponse.json({ success: true, message: 'Courses synced to Neon Postgres', count: savedCourses.length, courses: savedCourses });
    }

    if (body.course && body.course.id) {
      const saved = await upsertCourse(body.course);
      return NextResponse.json({ success: true, message: 'Course saved to Neon Postgres', course: saved });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    console.error('Error saving courses to Neon Postgres:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Course ID is required' }, { status: 400 });
    }

    await deleteCourse(id);
    const remaining = await getAllCourses();

    return NextResponse.json({ success: true, message: `Course ${id} deleted`, remainingCount: remaining.length });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
