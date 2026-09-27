import { NextResponse } from 'next/server';
import { ensureTables } from '../../../lib/db';

/**
 * GET /api/setup
 * Initializes the Neon Postgres schema (creates tables if they don't exist).
 * Call this once after connecting your database:
 *   curl https://your-app.vercel.app/api/setup
 */
export async function GET() {
  try {
    await ensureTables();
    return NextResponse.json({
      success: true,
      message: 'Database tables created (or already exist). Your Neon Postgres DB is ready!'
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Make sure DATABASE_URL is set in your environment variables.'
    }, { status: 500 });
  }
}
