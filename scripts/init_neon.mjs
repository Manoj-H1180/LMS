import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Please set the DATABASE_URL environment variable.");
  process.exit(1);
}

async function main() {
  console.log("Connecting to Neon Postgres...");
  const sql = neon(url);
  const info = await sql`SELECT NOW() as current_time, version() as pg_version;`;
  console.log("Connected successfully!");
  console.log("Postgres version:", info[0].pg_version);
  console.log("Current server time:", info[0].current_time);

  console.log("Creating database tables...");
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT,
      name TEXT,
      avatar TEXT,
      title TEXT,
      xp INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      streak_frozen INTEGER DEFAULT 0,
      double_xp_until TEXT,
      last_active_date TEXT,
      completed_lessons TEXT DEFAULT '[]',
      quiz_scores TEXT DEFAULT '{}',
      unlocked_achievements TEXT DEFAULT '[]',
      inventory TEXT DEFAULT '["theme_cyberpunk"]',
      active_theme TEXT DEFAULT 'cyberpunk',
      lesson_notes TEXT DEFAULT '{}',
      sound_enabled INTEGER DEFAULT 1,
      created_at BIGINT,
      updated_at BIGINT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      description TEXT,
      icon TEXT,
      banner TEXT,
      author TEXT,
      total_duration TEXT,
      xp_reward INTEGER DEFAULT 100,
      modules TEXT,
      created_at BIGINT,
      updated_at BIGINT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at BIGINT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT,
      created_at BIGINT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS course_progress (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      course_id TEXT NOT NULL,
      last_lesson_id TEXT,
      playback_time DOUBLE PRECISION DEFAULT 0,
      completed_lessons TEXT DEFAULT '[]',
      quiz_scores TEXT DEFAULT '{}',
      notes TEXT DEFAULT '{}',
      progress_percent INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      updated_at BIGINT
    )
  `;

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `;

  console.log("Public tables in Neon database:", tables.map(t => t.table_name).join(", "));
  console.log("Database initialized and ready!");
}

main().catch(err => {
  console.error("Initialization error:", err);
  process.exit(1);
});
