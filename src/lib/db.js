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
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, storedValue) {
  if (!storedValue) return false;
  if (!storedValue.startsWith('scrypt:')) {
    return storedValue === password || storedValue === Buffer.from(password, 'binary').toString('base64');
  }
  const [, salt, hashHex] = storedValue.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

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

let schemaSetupPromise;

export async function ensureTables() {
  if (!schemaSetupPromise) {
    schemaSetupPromise = createTablesAndMigrate().catch(error => {
      schemaSetupPromise = null;
      throw error;
    });
  }
  return schemaSetupPromise;
}

async function createTablesAndMigrate() {
  const sql = getDb();

  // Run all DDL in one database transaction. This publishes the schema changes
  // atomically so other serverless instances never observe a partial migration.
  await sql.transaction([
    sql`
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
  `,

    sql`
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
      owner_username TEXT,
      created_at BIGINT,
      updated_at BIGINT
    )
  `,

    sql`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at BIGINT
    )
  `,

    sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT,
      created_at BIGINT
    )
  `,

    sql`
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
  `,

    sql`ALTER TABLE course_progress ADD COLUMN IF NOT EXISTS lesson_completed_at TEXT DEFAULT '{}'`,
    sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS owner_username TEXT`,
    sql`UPDATE courses SET owner_username = NULL WHERE owner_username = ''`,
    sql`CREATE INDEX IF NOT EXISTS courses_owner_username_idx ON courses (owner_username)`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS important_lessons TEXT DEFAULT '[]'`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS course_highlights TEXT DEFAULT '{}'`,
  ]);
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
    importantLessons: JSON.parse(row.important_lessons || '[]'),
    courseHighlights: JSON.parse(row.course_highlights || '{}'),
    soundEnabled: row.sound_enabled !== 0 && row.sound_enabled !== '0',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function formatCourseRecord(row) {
  if (!row) return null;
  const isImported = Boolean(
    row.id?.startsWith('imported_') || 
    row.id?.startsWith('zip_') || 
    row.id?.includes('imported')
  );
  return {
    id: row.id,
    ownerUsername: row.owner_username || null,
    title: row.title,
    category: row.category,
    description: row.description,
    icon: row.icon,
    banner: row.banner,
    author: row.author,
    totalDuration: row.total_duration,
    xpReward: Number(row.xp_reward || 100),
    modules: JSON.parse(row.modules || '[]'),
    isImported,
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
    lessonCompletedAt: JSON.parse(row.lesson_completed_at || '{}'),
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

export async function getAllCourses(username = null) {
  const sql = getDb();
  const cleanUsername = username?.toLowerCase() || null;
  const rows = cleanUsername
    ? await sql`SELECT * FROM courses WHERE owner_username IS NULL OR lower(owner_username) = ${cleanUsername} ORDER BY created_at DESC`
    : await sql`SELECT * FROM courses WHERE owner_username IS NULL ORDER BY created_at DESC`;
  return rows.map(formatCourseRecord);
}

export async function getCourseById(id) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM courses WHERE id = ${id}`;
  return formatCourseRecord(rows[0] || null);
}

export async function deleteOwnedCourse(id, username) {
  const sql = getDb();
  const result = await sql`DELETE FROM courses WHERE id = ${id} AND lower(owner_username) = ${username.toLowerCase()} RETURNING id`;
  return result.length > 0;
}

export async function upsertCourse(course, ownerUsername = null) {
  const sql = getDb();
  const now = Date.now();
  const persistentModules = (Array.isArray(course.modules) ? course.modules : []).map(module => ({
    ...module,
    lessons: (Array.isArray(module.lessons) ? module.lessons : []).map(lesson => ({
      ...lesson,
      // Blob URLs only exist in the importing browser session and cannot be
      // restored on another visit. Keep local media metadata, not dead URLs.
      videoUrl: typeof lesson.videoUrl === 'string' && lesson.videoUrl.startsWith('blob:') ? '' : lesson.videoUrl,
    })),
  }));
  await sql`
    INSERT INTO courses (id, title, category, description, icon, banner, author, total_duration, modules, created_at, updated_at, owner_username, xp_reward)
    VALUES (
      ${course.id},
      ${course.title || 'Untitled Course'},
      ${course.category || 'General'},
      ${course.description || ''},
      ${course.icon || '📚'},
      ${course.banner || ''},
      ${course.author || 'Instructor'},
      ${course.totalDuration || '1h 00m'},
      ${JSON.stringify(persistentModules)},
      ${course.createdAt || now},
      ${now},
      ${ownerUsername?.toLowerCase() || course.ownerUsername?.toLowerCase() || null},
      ${Number(course.xpReward || course.totalXP || 100)}
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
      owner_username = COALESCE(courses.owner_username, EXCLUDED.owner_username),
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

export async function deleteImportedData(username = null) {
  const sql = getDb();
  const cleanUsername = username?.toLowerCase() || null;

  // 1. Delete all courses where ID matches imported pattern (or is marked imported)
  const deletedCourses = cleanUsername
    ? await sql`
        DELETE FROM courses 
        WHERE (id LIKE 'imported_%' OR id LIKE 'zip_%' OR id LIKE '%_imported%')
          AND (owner_username IS NULL OR lower(owner_username) = ${cleanUsername})
        RETURNING id
      `
    : await sql`
        DELETE FROM courses 
        WHERE (id LIKE 'imported_%' OR id LIKE 'zip_%' OR id LIKE '%_imported%')
        RETURNING id
      `;

  // 2. Delete all course_progress records for imported courses
  let deletedProgress = [];
  if (cleanUsername) {
    deletedProgress = await sql`
      DELETE FROM course_progress 
      WHERE (course_id LIKE 'imported_%' OR course_id LIKE 'zip_%' OR course_id LIKE '%_imported%')
        AND lower(username) = ${cleanUsername}
      RETURNING id
    `;
  } else {
    deletedProgress = await sql`
      DELETE FROM course_progress 
      WHERE (course_id LIKE 'imported_%' OR course_id LIKE 'zip_%' OR course_id LIKE '%_imported%')
      RETURNING id
    `;
  }

  return {
    deletedCourses: deletedCourses.length,
    deletedProgress: deletedProgress.length
  };
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

export async function updatePassword(username, passwordHash) {
  const sql = getDb();
  await sql`UPDATE users SET password = ${passwordHash}, updated_at = ${Date.now()} WHERE lower(username) = ${username.toLowerCase()}`;
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
      important_lessons, course_highlights,
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
      ${JSON.stringify(user.importantLessons || [])},
      ${JSON.stringify(user.courseHighlights || {})},
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
      important_lessons = EXCLUDED.important_lessons,
      course_highlights = EXCLUDED.course_highlights,
      sound_enabled = EXCLUDED.sound_enabled,
      updated_at = EXCLUDED.updated_at
  `;

  return getUser(username);
}

export async function getAllLeaderboardUsers() {
  const sql = getDb();
  const rows = await sql`SELECT username, name, avatar, title, xp, streak, unlocked_achievements FROM users ORDER BY xp DESC LIMIT 50`;
  return rows.map((u, i) => ({
    rank: i + 1,
    name: u.name || u.username,
    username: u.username,
    avatar: u.avatar || '🎓',
    title: u.title || 'Novice Scholar',
    xp: Number(u.xp || 0),
    streak: Number(u.streak || 0),
    badges: JSON.parse(u.unlocked_achievements || '[]').length,
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

export async function getWeeklyLessonActivity() {
  const sql = getDb();
  const rows = await sql`
    SELECT username, lesson_completed_at
    FROM course_progress
    WHERE updated_at >= ${Date.now() - 7 * 24 * 60 * 60 * 1000}
  `;
  const activity = new Map();
  for (const row of rows) {
    let timestamps = {};
    try { timestamps = JSON.parse(row.lesson_completed_at || '{}'); } catch {}
    const weeklyLessons = Object.values(timestamps).filter(timestamp => Number(timestamp) >= Date.now() - 7 * 24 * 60 * 60 * 1000).length;
    const username = row.username.toLowerCase();
    activity.set(username, (activity.get(username) || 0) + weeklyLessons);
  }
  return activity;
}

export async function saveCourseProgress({
  username,
  courseId,
  lastLessonId,
  playbackTime = 0,
  completedLessons = [],
  quizScores = {},
  notes = {},
  lessonCompletedAt = {},
  progressPercent = 0,
  completed = false
}) {
  if (!username || !courseId) return null;
  const sql = getDb();
  const cleanUsername = username.toLowerCase();
  const id = `${cleanUsername}_${courseId}`;
  const now = Date.now();

  const previous = await getCourseProgress(cleanUsername, courseId);
  const mergedCompleted = Array.from(new Set([...(previous?.completedLessons || []), ...(completedLessons || [])]));
  const mergedScores = { ...(previous?.quizScores || {}), ...(quizScores || {}) };
  const mergedNotes = { ...(previous?.notes || {}), ...(notes || {}) };
  const mergedTimestamps = { ...(previous?.lessonCompletedAt || {}), ...(lessonCompletedAt || {}) };
  const course = await getCourseById(courseId);
  const allLessons = (course?.modules || []).flatMap(module => module.lessons || []);
  const lessonMap = new Map(allLessons.map(lesson => [lesson.id, lesson]));
  const newlyCompleted = mergedCompleted.filter(lessonId => !(previous?.completedLessons || []).includes(lessonId) && lessonMap.has(lessonId));
  const earnedXP = newlyCompleted.reduce((sum, lessonId) => sum + Number(lessonMap.get(lessonId).xp || (lessonMap.get(lessonId).type === 'quiz' ? 120 : 50)), 0);
  const mergedPercent = allLessons.length ? Math.round(mergedCompleted.filter(lessonId => lessonMap.has(lessonId)).length / allLessons.length * 100) : Number(progressPercent || 0);

  await sql`
    INSERT INTO course_progress (
      id, username, course_id, last_lesson_id, playback_time,
      completed_lessons, quiz_scores, notes, progress_percent, completed, updated_at, lesson_completed_at
    ) VALUES (
      ${id}, ${cleanUsername}, ${courseId}, ${lastLessonId || null},
      ${Number(playbackTime || 0)},
      ${JSON.stringify(mergedCompleted)},
      ${JSON.stringify(mergedScores)},
      ${JSON.stringify(mergedNotes)},
      ${mergedPercent},
      ${mergedPercent === 100 || completed ? 1 : 0},
      ${now},
      ${JSON.stringify(mergedTimestamps)}
    )
    ON CONFLICT (id) DO UPDATE SET
      last_lesson_id = COALESCE(EXCLUDED.last_lesson_id, course_progress.last_lesson_id),
      playback_time = CASE WHEN EXCLUDED.playback_time > 0 THEN EXCLUDED.playback_time ELSE course_progress.playback_time END,
      completed_lessons = (
        SELECT COALESCE(jsonb_agg(DISTINCT val), '[]'::jsonb)::text
        FROM jsonb_array_elements_text(
          COALESCE(NULLIF(course_progress.completed_lessons, ''), '[]')::jsonb || 
          COALESCE(NULLIF(EXCLUDED.completed_lessons, ''), '[]')::jsonb
        ) AS t(val)
      ),
      quiz_scores = (COALESCE(NULLIF(course_progress.quiz_scores, ''), '{}')::jsonb || COALESCE(NULLIF(EXCLUDED.quiz_scores, ''), '{}')::jsonb)::text,
      notes = (COALESCE(NULLIF(course_progress.notes, ''), '{}')::jsonb || COALESCE(NULLIF(EXCLUDED.notes, ''), '{}')::jsonb)::text,
      lesson_completed_at = (COALESCE(NULLIF(course_progress.lesson_completed_at, ''), '{}')::jsonb || COALESCE(NULLIF(EXCLUDED.lesson_completed_at, ''), '{}')::jsonb)::text,
      progress_percent = GREATEST(course_progress.progress_percent, EXCLUDED.progress_percent),
      completed = GREATEST(course_progress.completed, EXCLUDED.completed),
      updated_at = EXCLUDED.updated_at
  `;

  // Sync progress back to user profile
  try {
    const user = await getUser(cleanUsername);
    if (user) {
      const mergedUserCompleted = Array.from(new Set([...(user.completedLessons || []), ...newlyCompleted]));
      const mergedUserScores = { ...(user.quizScores || {}), ...mergedScores };
      const mergedUserNotes = { ...(user.lessonNotes || {}), ...mergedNotes };
      const earnedBadges = [...(user.unlockedAchievements || [])];
      if (mergedPercent === 100 && !earnedBadges.includes('course_graduate')) earnedBadges.push('course_graduate');
      if (newlyCompleted.some(lessonId => lessonMap.get(lessonId)?.type === 'quiz' && Number(mergedScores[lessonId]) === 100) && !earnedBadges.includes('quiz_master')) earnedBadges.push('quiz_master');
      await upsertUser({
        ...user,
        xp: Number(user.xp || 0) + earnedXP,
        coins: Number(user.coins || 0) + Math.round(earnedXP / 2),
        completedLessons: mergedUserCompleted,
        quizScores: mergedUserScores,
        lessonNotes: mergedUserNotes,
        unlockedAchievements: earnedBadges
      });
    }
  } catch (err) {
    console.warn('Failed to sync course progress to user profile:', err);
  }

  return getCourseProgress(cleanUsername, courseId);
}

export async function saveAuthenticatedUserUpdates(username, updates) {
  const existing = await getUser(username);
  if (!existing) return null;
  const sql = getDb();
  const safeUpdates = {
    name: typeof updates.name === 'string' ? updates.name.trim().slice(0, 60) || existing.name : existing.name,
    avatar: typeof updates.avatar === 'string' ? updates.avatar.slice(0, 16) : existing.avatar,
    inventory: Array.isArray(updates.inventory) ? updates.inventory : existing.inventory,
    activeTheme: typeof updates.activeTheme === 'string' ? updates.activeTheme : existing.activeTheme,
    title: typeof updates.title === 'string' ? updates.title.slice(0, 60) : existing.title,
    streakFrozen: Boolean(updates.streakFrozen),
    soundEnabled: updates.soundEnabled !== false,
    importantLessons: Array.isArray(updates.importantLessons) ? updates.importantLessons : existing.importantLessons,
    courseHighlights: updates.courseHighlights && typeof updates.courseHighlights === 'object' ? updates.courseHighlights : existing.courseHighlights,
    lessonNotes: updates.lessonNotes && typeof updates.lessonNotes === 'object' ? updates.lessonNotes : existing.lessonNotes
  };
  await sql`
    UPDATE users SET name = ${safeUpdates.name}, avatar = ${safeUpdates.avatar},
      inventory = ${JSON.stringify(safeUpdates.inventory)}, active_theme = ${safeUpdates.activeTheme},
      title = ${safeUpdates.title}, streak_frozen = ${safeUpdates.streakFrozen ? 1 : 0},
      sound_enabled = ${safeUpdates.soundEnabled ? 1 : 0},
      important_lessons = ${JSON.stringify(safeUpdates.importantLessons || [])},
      course_highlights = ${JSON.stringify(safeUpdates.courseHighlights || {})},
      lesson_notes = ${JSON.stringify(safeUpdates.lessonNotes || {})},
      updated_at = ${Date.now()}
    WHERE lower(username) = ${username.toLowerCase()}
  `;
  return getUser(username);
}
