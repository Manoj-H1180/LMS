/**
 * db.js — Neon Postgres (serverless) data layer
 *
 * Uses @neondatabase/serverless which works in:
 *   - Vercel serverless functions (no filesystem needed)
 *   - Local Next.js dev (with DATABASE_URL env var)
 *   - Edge runtime (optional)
 *
 * Required environment variable:
 *   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
 *
 * Get a free database at https://neon.tech — create a project, copy the
 * connection string, and add it as a Vercel environment variable.
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Create a free Neon database at https://neon.tech and add the ' +
      'connection string as DATABASE_URL in your .env.local file and ' +
      'as a Vercel environment variable.'
    );
  }
  return neon(url);
}

// ---------------------------------------------------------------------------
// Schema bootstrapping — call once at startup or from an API route
// ---------------------------------------------------------------------------

export async function ensureTables() {
  const sql = getDb();

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
}

// ---------------------------------------------------------------------------
// Helper serializers
// ---------------------------------------------------------------------------

function formatUserRecord(row) {
  if (!row) return null;
  return {
    username: row.username,
    name: row.name,
    avatar: row.avatar,
    title: row.title || 'Novice Scholar',
    xp: Number(row.xp || 0),
    coins: Number(row.coins || 0),
    streak: Number(row.streak || 0),
    streakFrozen: Boolean(Number(row.streak_frozen)),
    doubleXPUntil: row.double_xp_until || null,
    lastActiveDate: row.last_active_date || new Date().toISOString().split('T')[0],
    completedLessons: JSON.parse(row.completed_lessons || '[]'),
    quizScores: JSON.parse(row.quiz_scores || '{}'),
    unlockedAchievements: JSON.parse(row.unlocked_achievements || '[]'),
    inventory: JSON.parse(row.inventory || '["theme_cyberpunk"]'),
    activeTheme: row.active_theme || 'cyberpunk',
    lessonNotes: JSON.parse(row.lesson_notes || '{}'),
    soundEnabled: row.sound_enabled !== 0 && row.sound_enabled !== '0',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function formatCourseRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    icon: row.icon,
    banner: row.banner,
    author: row.author,
    totalDuration: row.total_duration,
    xpReward: Number(row.xp_reward || 100),
    modules: JSON.parse(row.modules || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function formatProgressRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    courseId: row.course_id,
    lastLessonId: row.last_lesson_id || null,
    playbackTime: Number(row.playback_time || 0),
    completedLessons: JSON.parse(row.completed_lessons || '[]'),
    quizScores: JSON.parse(row.quiz_scores || '{}'),
    notes: JSON.parse(row.notes || '{}'),
    progressPercent: Number(row.progress_percent || 0),
    completed: Boolean(Number(row.completed)),
    updatedAt: row.updated_at
  };
}

// ---------------------------------------------------------------------------
// Courses API
// ---------------------------------------------------------------------------

export async function getAllCourses() {
  const sql = getDb();
  const rows = await sql`SELECT * FROM courses ORDER BY created_at DESC`;
  return rows.map(formatCourseRecord);
}

export async function getCourseById(id) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM courses WHERE id = ${id}`;
  return formatCourseRecord(rows[0] || null);
}

export async function upsertCourse(course) {
  const sql = getDb();
  const now = Date.now();
  await sql`
    INSERT INTO courses (id, title, category, description, icon, banner, author, total_duration, xp_reward, modules, created_at, updated_at)
    VALUES (
      ${course.id},
      ${course.title || 'Untitled Course'},
      ${course.category || 'General'},
      ${course.description || ''},
      ${course.icon || '📚'},
      ${course.banner || ''},
      ${course.author || 'Instructor'},
      ${course.totalDuration || '1h 00m'},
      ${Number(course.xpReward || 100)},
      ${JSON.stringify(course.modules || [])},
      ${course.createdAt || now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      banner = EXCLUDED.banner,
      author = EXCLUDED.author,
      total_duration = EXCLUDED.total_duration,
      xp_reward = EXCLUDED.xp_reward,
      modules = EXCLUDED.modules,
      updated_at = EXCLUDED.updated_at
  `;
  return getCourseById(course.id);
}

export async function syncCourses(coursesList) {
  if (!Array.isArray(coursesList)) return [];
  const sql = getDb();
  await sql`DELETE FROM courses`;
  for (const c of coursesList) {
    if (c && c.id) {
      await upsertCourse(c);
    }
  }
  return getAllCourses();
}

export async function deleteCourse(id) {
  const sql = getDb();
  await sql`DELETE FROM courses WHERE id = ${id}`;
  return true;
}

export async function clearAllCourses() {
  const sql = getDb();
  await sql`DELETE FROM courses`;
  return true;
}

// ---------------------------------------------------------------------------
// Users & Auth API
// ---------------------------------------------------------------------------

export async function getUser(username) {
  if (!username) return null;
  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE lower(username) = ${username.toLowerCase()}`;
  return formatUserRecord(rows[0] || null);
}

export async function getAccountWithPassword(username) {
  if (!username) return null;
  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE lower(username) = ${username.toLowerCase()}`;
  return rows[0] || null;
}

export async function upsertUser(user) {
  const sql = getDb();
  const now = Date.now();
  const username = (user.username || 'default_user').toLowerCase();

  await sql`
    INSERT INTO users (
      username, password, name, avatar, title, xp, coins, streak,
      streak_frozen, double_xp_until, last_active_date,
      completed_lessons, quiz_scores, unlocked_achievements,
      inventory, active_theme, lesson_notes, sound_enabled,
      created_at, updated_at
    ) VALUES (
      ${username},
      ${user.password || null},
      ${user.name || 'Learner'},
      ${user.avatar || '🎓'},
      ${user.title || 'Novice Scholar'},
      ${Number(user.xp || 0)},
      ${Number(user.coins || 0)},
      ${Number(user.streak || 0)},
      ${user.streakFrozen ? 1 : 0},
      ${user.doubleXPUntil || null},
      ${user.lastActiveDate || new Date().toISOString().split('T')[0]},
      ${JSON.stringify(user.completedLessons || [])},
      ${JSON.stringify(user.quizScores || {})},
      ${JSON.stringify(user.unlockedAchievements || [])},
      ${JSON.stringify(user.inventory || ['theme_cyberpunk'])},
      ${user.activeTheme || 'cyberpunk'},
      ${JSON.stringify(user.lessonNotes || {})},
      ${user.soundEnabled !== false ? 1 : 0},
      ${now},
      ${now}
    )
    ON CONFLICT (username) DO UPDATE SET
      password = COALESCE(EXCLUDED.password, users.password),
      name = COALESCE(EXCLUDED.name, users.name),
      avatar = COALESCE(EXCLUDED.avatar, users.avatar),
      title = COALESCE(EXCLUDED.title, users.title),
      xp = EXCLUDED.xp,
      coins = EXCLUDED.coins,
      streak = EXCLUDED.streak,
      streak_frozen = EXCLUDED.streak_frozen,
      double_xp_until = EXCLUDED.double_xp_until,
      last_active_date = EXCLUDED.last_active_date,
      completed_lessons = EXCLUDED.completed_lessons,
      quiz_scores = EXCLUDED.quiz_scores,
      unlocked_achievements = EXCLUDED.unlocked_achievements,
      inventory = EXCLUDED.inventory,
      active_theme = EXCLUDED.active_theme,
      lesson_notes = EXCLUDED.lesson_notes,
      sound_enabled = EXCLUDED.sound_enabled,
      updated_at = EXCLUDED.updated_at
  `;

  return getUser(username);
}

export async function getAllLeaderboardUsers() {
  const sql = getDb();
  const rows = await sql`SELECT username, name, avatar, title, xp, streak FROM users ORDER BY xp DESC LIMIT 50`;
  return rows.map((u, i) => ({
    rank: i + 1,
    name: u.name || u.username,
    username: u.username,
    avatar: u.avatar || '🎓',
    title: u.title || 'Novice Scholar',
    xp: Number(u.xp || 0),
    streak: Number(u.streak || 0),
    badge: i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'
  }));
}

// ---------------------------------------------------------------------------
// Key-Value App State
// ---------------------------------------------------------------------------

export async function getAppState(key) {
  const sql = getDb();
  const rows = await sql`SELECT value FROM app_state WHERE key = ${key}`;
  if (!rows[0]) return null;
  try {
    return JSON.parse(rows[0].value);
  } catch {
    return rows[0].value;
  }
}

export async function setAppState(key, value) {
  const sql = getDb();
  const now = Date.now();
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  await sql`
    INSERT INTO app_state (key, value, updated_at)
    VALUES (${key}, ${str}, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
  `;
  return value;
}

// ---------------------------------------------------------------------------
// Sessions API
// ---------------------------------------------------------------------------

export async function createSession(username) {
  const sql = getDb();
  const token = crypto.randomUUID();
  const now = Date.now();
  await sql`INSERT INTO sessions (token, username, created_at) VALUES (${token}, ${username.toLowerCase()}, ${now})`;
  return token;
}

export async function getUserBySession(token) {
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN sessions s ON lower(u.username) = lower(s.username)
    WHERE s.token = ${token}
  `;
  return formatUserRecord(rows[0] || null);
}

export async function deleteSession(token) {
  if (!token) return false;
  const sql = getDb();
  await sql`DELETE FROM sessions WHERE token = ${token}`;
  return true;
}

export async function clearUserSessions(username) {
  if (!username) return false;
  const sql = getDb();
  await sql`DELETE FROM sessions WHERE lower(username) = ${username.toLowerCase()}`;
  return true;
}

// ---------------------------------------------------------------------------
// Course Progress API
// ---------------------------------------------------------------------------

export async function getCourseProgress(username, courseId) {
  if (!username || !courseId) return null;
  const sql = getDb();
  const id = `${username.toLowerCase()}_${courseId}`;
  const rows = await sql`SELECT * FROM course_progress WHERE id = ${id}`;
  return formatProgressRecord(rows[0] || null);
}

export async function getAllUserCourseProgress(username) {
  if (!username) return [];
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM course_progress
    WHERE lower(username) = ${username.toLowerCase()}
    ORDER BY updated_at DESC
  `;
  return rows.map(formatProgressRecord);
}

export async function saveCourseProgress({
  username,
  courseId,
  lastLessonId,
  playbackTime = 0,
  completedLessons = [],
  quizScores = {},
  notes = {},
  progressPercent = 0,
  completed = false
}) {
  if (!username || !courseId) return null;
  const sql = getDb();
  const cleanUsername = username.toLowerCase();
  const id = `${cleanUsername}_${courseId}`;
  const now = Date.now();

  await sql`
    INSERT INTO course_progress (
      id, username, course_id, last_lesson_id, playback_time,
      completed_lessons, quiz_scores, notes, progress_percent, completed, updated_at
    ) VALUES (
      ${id}, ${cleanUsername}, ${courseId}, ${lastLessonId || null},
      ${Number(playbackTime || 0)},
      ${JSON.stringify(completedLessons || [])},
      ${JSON.stringify(quizScores || {})},
      ${JSON.stringify(notes || {})},
      ${Number(progressPercent || 0)},
      ${completed ? 1 : 0},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      last_lesson_id = COALESCE(EXCLUDED.last_lesson_id, course_progress.last_lesson_id),
      playback_time = EXCLUDED.playback_time,
      completed_lessons = EXCLUDED.completed_lessons,
      quiz_scores = EXCLUDED.quiz_scores,
      notes = EXCLUDED.notes,
      progress_percent = EXCLUDED.progress_percent,
      completed = EXCLUDED.completed,
      updated_at = EXCLUDED.updated_at
  `;

  // Sync progress back to user profile
  try {
    const user = await getUser(cleanUsername);
    if (user) {
      const mergedCompleted = Array.from(new Set([...(user.completedLessons || []), ...completedLessons]));
      const mergedScores = { ...(user.quizScores || {}), ...quizScores };
      const mergedNotes = { ...(user.lessonNotes || {}), ...notes };
      await upsertUser({
        ...user,
        completedLessons: mergedCompleted,
        quizScores: mergedScores,
        lessonNotes: mergedNotes
      });
    }
  } catch (err) {
    console.warn('Failed to sync course progress to user profile:', err);
  }

  return getCourseProgress(cleanUsername, courseId);
}
