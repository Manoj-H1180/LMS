import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getAllCourses, 
  upsertCourse, 
  deleteOwnedCourse,
  deleteImportedData,
  getUserBySession,
  ensureTables
} from '../../../lib/db';

async function requireSession() {
  const token = (await cookies()).get('lms_session')?.value;
  return token ? getUserBySession(token) : null;
}

export async function GET() {
  try {
    await ensureTables();
    const owner = await requireSession();
    const courses = await getAllCourses(owner?.username);
    return NextResponse.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('Error fetching courses from Neon Postgres:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureTables();
    const owner = await requireSession();
    if (!owner) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const body = await request.json();

    if (body.action === 'clear_imported') {
      const result = await deleteImportedData(owner.username);
      const remaining = await getAllCourses(owner.username);
      return NextResponse.json({ 
        success: true, 
        message: `Successfully removed ${result.deletedCourses} imported course(s) and ${result.deletedProgress} progress record(s).`,
        deletedCourses: result.deletedCourses,
        deletedProgress: result.deletedProgress,
        remainingCount: remaining.length 
      });
    }

    if (body.action === 'clear') {
      return NextResponse.json({ success: false, error: 'Bulk course deletion is unavailable' }, { status: 400 });
    }

    const course = body.course || body;
    if (course.id) {
      const saved = await upsertCourse(course, owner.username);
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
    await ensureTables();
    const owner = await requireSession();
    if (!owner) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (scope === 'imported' || action === 'clear_imported') {
      const result = await deleteImportedData(owner.username);
      const remaining = await getAllCourses(owner.username);
      return NextResponse.json({ 
        success: true, 
        message: `Successfully removed ${result.deletedCourses} imported course(s) and ${result.deletedProgress} progress record(s).`,
        deletedCourses: result.deletedCourses,
        deletedProgress: result.deletedProgress,
        remainingCount: remaining.length 
      });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Course ID is required' }, { status: 400 });
    }

    const deleted = await deleteOwnedCourse(id, owner.username);
    if (!deleted) return NextResponse.json({ success: false, error: 'Course not found or not owned by this account' }, { status: 404 });
    const remaining = await getAllCourses(owner.username);

    return NextResponse.json({ success: true, message: `Course ${id} deleted`, remainingCount: remaining.length });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
