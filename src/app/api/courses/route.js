import { NextResponse } from 'next/server';
// Mock data removed; start with an empty catalog.
const INITIAL_COURSES = [];

// In-memory server state cache
let serverCourses = [...INITIAL_COURSES];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      count: serverCourses.length,
      courses: serverCourses,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // If an entire course list is synced
    if (body.courses && Array.isArray(body.courses)) {
      serverCourses = body.courses;
      return NextResponse.json({
        success: true,
        message: 'Courses synced successfully',
        count: serverCourses.length,
      });
    }

    // If a single new course is created / imported
    if (body.course && body.course.id) {
      // Check if course already exists
      const existingIndex = serverCourses.findIndex(c => c.id === body.course.id);
      if (existingIndex >= 0) {
        serverCourses[existingIndex] = body.course;
      } else {
        serverCourses.unshift(body.course);
      }

      return NextResponse.json({
        success: true,
        message: 'Course saved to Next.js server',
        course: body.course,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid payload' },
      { status: 400 }
    );
  } catch (error) {
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

    serverCourses = serverCourses.filter(c => c.id !== id);

    return NextResponse.json({
      success: true,
      message: `Course ${id} deleted`,
      remainingCount: serverCourses.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
