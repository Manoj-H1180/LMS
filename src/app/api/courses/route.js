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
    const courses = getAllCourses();
    return NextResponse.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error('Error fetching courses from SQLite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses from SQLite database' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // If clearing all courses
    if (body.action === 'clear') {
      clearAllCourses();
      return NextResponse.json({
        success: true,
        message: 'All courses cleared from SQLite database',
        count: 0
      });
    }

    // If an entire course list is synced
    if (body.courses && Array.isArray(body.courses)) {
      const savedCourses = syncCourses(body.courses);
      return NextResponse.json({
        success: true,
        message: 'Courses saved to SQLite database',
        count: savedCourses.length,
        courses: savedCourses,
      });
    }

    // If a single new course is created / imported
    if (body.course && body.course.id) {
      const saved = upsertCourse(body.course);
      return NextResponse.json({
        success: true,
        message: 'Course saved to SQLite database on disk',
        course: saved,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid payload' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error saving courses to SQLite:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Course ID is required' }, { status: 400 });
    }

    deleteCourse(id);
    const remaining = getAllCourses();

    return NextResponse.json({
      success: true,
      message: `Course ${id} deleted from SQLite database`,
      remainingCount: remaining.length,
    });
  } catch (error) {
    console.error('Error deleting course from SQLite:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
