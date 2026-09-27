import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'lms.sqlite');

function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);

  // Enable WAL mode for high performance concurrent reads and atomic writes
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Create tables
  ensureTables(db);

  return db;
}

function ensureTables(db) {
  db.exec(`
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
      created_at INTEGER,
      updated_at INTEGER
    );

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
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS course_progress (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      course_id TEXT NOT NULL,
      last_lesson_id TEXT,
      playback_time REAL DEFAULT 0,
      completed_lessons TEXT DEFAULT '[]',
      quiz_scores TEXT DEFAULT '{}',
      notes TEXT DEFAULT '{}',
      progress_percent INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      updated_at INTEGER
    );
  `);
}

// Preserve database connection across Next.js dev reloads
let dbInstance = globalThis.__lms_db;
if (!dbInstance) {
  dbInstance = initDb();
  globalThis.__lms_db = dbInstance;
} else {
  ensureTables(dbInstance);
}

export const db = dbInstance;

// Helper serialization
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
    streakFrozen: Boolean(row.streak_frozen),
    doubleXPUntil: row.double_xp_until || null,
    lastActiveDate: row.last_active_date || new Date().toISOString().split('T')[0],
    completedLessons: JSON.parse(row.completed_lessons || '[]'),
    quizScores: JSON.parse(row.quiz_scores || '{}'),
    unlockedAchievements: JSON.parse(row.unlocked_achievements || '[]'),
    inventory: JSON.parse(row.inventory || '["theme_cyberpunk"]'),
    activeTheme: row.active_theme || 'cyberpunk',
    lessonNotes: JSON.parse(row.lesson_notes || '{}'),
    soundEnabled: Boolean(row.sound_enabled !== 0),
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

// ================= Courses API =================
export function getAllCourses() {
  const stmt = db.prepare('SELECT * FROM courses ORDER BY created_at DESC');
  const rows = stmt.all();
  return rows.map(formatCourseRecord);
}

export function getCourseById(id) {
  const stmt = db.prepare('SELECT * FROM courses WHERE id = ?');
  const row = stmt.get(id);
  return formatCourseRecord(row);
}

export function upsertCourse(course) {
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO courses (id, title, category, description, icon, banner, author, total_duration, xp_reward, modules, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      category = excluded.category,
      description = excluded.description,
      icon = excluded.icon,
      banner = excluded.banner,
      author = excluded.author,
      total_duration = excluded.total_duration,
      xp_reward = excluded.xp_reward,
      modules = excluded.modules,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    course.id,
    course.title || 'Untitled Course',
    course.category || 'General',
    course.description || '',
    course.icon || '📚',
    course.banner || '',
    course.author || 'Instructor',
    course.totalDuration || '1h 00m',
    Number(course.xpReward || 100),
    JSON.stringify(course.modules || []),
    course.createdAt || now,
    now
  );

  return getCourseById(course.id);
}

export function syncCourses(coursesList) {
  if (!Array.isArray(coursesList)) return [];

  // Replace all courses in transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    db.exec('DELETE FROM courses;');
    for (const c of coursesList) {
      if (c && c.id) {
        upsertCourse(c);
      }
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
  return getAllCourses();
}

export function deleteCourse(id) {
  const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
  stmt.run(id);
  return true;
}

export function clearAllCourses() {
  db.exec('DELETE FROM courses;');
  return true;
}

// ================= Users & Auth API =================
export function getUser(username) {
  if (!username) return null;
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE');
  const row = stmt.get(username);
  return formatUserRecord(row);
}

export function getAccountWithPassword(username) {
  if (!username) return null;
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE');
  return stmt.get(username);
}

export function upsertUser(user) {
  const now = Date.now();
  const username = (user.username || 'default_user').toLowerCase();
  
  const stmt = db.prepare(`
    INSERT INTO users (
      username, password, name, avatar, title, xp, coins, streak,
      streak_frozen, double_xp_until, last_active_date,
      completed_lessons, quiz_scores, unlocked_achievements,
      inventory, active_theme, lesson_notes, sound_enabled,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
      password = COALESCE(excluded.password, users.password),
      name = COALESCE(excluded.name, users.name),
      avatar = COALESCE(excluded.avatar, users.avatar),
      title = COALESCE(excluded.title, users.title),
      xp = excluded.xp,
      coins = excluded.coins,
      streak = excluded.streak,
      streak_frozen = excluded.streak_frozen,
      double_xp_until = excluded.double_xp_until,
      last_active_date = excluded.last_active_date,
      completed_lessons = excluded.completed_lessons,
      quiz_scores = excluded.quiz_scores,
      unlocked_achievements = excluded.unlocked_achievements,
      inventory = excluded.inventory,
      active_theme = excluded.active_theme,
      lesson_notes = excluded.lesson_notes,
      sound_enabled = excluded.sound_enabled,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    username,
    user.password || null,
    user.name || 'Learner',
    user.avatar || '🎓',
    user.title || 'Novice Scholar',
    Number(user.xp || 0),
    Number(user.coins || 0),
    Number(user.streak || 0),
    user.streakFrozen ? 1 : 0,
    user.doubleXPUntil || null,
    user.lastActiveDate || new Date().toISOString().split('T')[0],
    JSON.stringify(user.completedLessons || []),
    JSON.stringify(user.quizScores || {}),
    JSON.stringify(user.unlockedAchievements || []),
    JSON.stringify(user.inventory || ['theme_cyberpunk']),
    user.activeTheme || 'cyberpunk',
    JSON.stringify(user.lessonNotes || {}),
    user.soundEnabled !== false ? 1 : 0,
    now,
    now
  );

  return getUser(username);
}

export function getAllLeaderboardUsers() {
  const stmt = db.prepare('SELECT username, name, avatar, title, xp, streak FROM users ORDER BY xp DESC LIMIT 50');
  const rows = stmt.all();
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

// ================= Key-Value App State =================
export function getAppState(key) {
  const stmt = db.prepare('SELECT value FROM app_state WHERE key = ?');
  const row = stmt.get(key);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

export function setAppState(key, value) {
  const now = Date.now();
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  const stmt = db.prepare(`
    INSERT INTO app_state (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  stmt.run(key, str, now);
  return value;
}

// ================= Sessions API =================
export function createSession(username) {
  const token = crypto.randomUUID();
  const now = Date.now();
  const stmt = db.prepare('INSERT INTO sessions (token, username, created_at) VALUES (?, ?, ?)');
  stmt.run(token, username.toLowerCase(), now);
  return token;
}

export function getUserBySession(token) {
  if (!token) return null;
  const stmt = db.prepare(`
    SELECT u.* FROM users u
    JOIN sessions s ON u.username = s.username COLLATE NOCASE
    WHERE s.token = ?
  `);
  const row = stmt.get(token);
  return formatUserRecord(row);
}

export function deleteSession(token) {
  if (!token) return false;
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
  return true;
}

export function clearUserSessions(username) {
  if (!username) return false;
  const stmt = db.prepare('DELETE FROM sessions WHERE username = ? COLLATE NOCASE');
  stmt.run(username.toLowerCase());
  return true;
}

// ================= Course Progress API =================
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
    completed: Boolean(row.completed),
    updatedAt: row.updated_at
  };
}

export function getCourseProgress(username, courseId) {
  if (!username || !courseId) return null;
  const id = `${username.toLowerCase()}_${courseId}`;
  const stmt = db.prepare('SELECT * FROM course_progress WHERE id = ?');
  const row = stmt.get(id);
  return formatProgressRecord(row);
}

export function getAllUserCourseProgress(username) {
  if (!username) return [];
  const stmt = db.prepare('SELECT * FROM course_progress WHERE username = ? COLLATE NOCASE ORDER BY updated_at DESC');
  const rows = stmt.all(username.toLowerCase());
  return rows.map(formatProgressRecord);
}

export function saveCourseProgress({
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
  const cleanUsername = username.toLowerCase();
  const id = `${cleanUsername}_${courseId}`;
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO course_progress (
      id, username, course_id, last_lesson_id, playback_time,
      completed_lessons, quiz_scores, notes, progress_percent, completed, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      last_lesson_id = COALESCE(excluded.last_lesson_id, course_progress.last_lesson_id),
      playback_time = excluded.playback_time,
      completed_lessons = excluded.completed_lessons,
      quiz_scores = excluded.quiz_scores,
      notes = excluded.notes,
      progress_percent = excluded.progress_percent,
      completed = excluded.completed,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    id,
    cleanUsername,
    courseId,
    lastLessonId || null,
    Number(playbackTime || 0),
    JSON.stringify(completedLessons || []),
    JSON.stringify(quizScores || {}),
    JSON.stringify(notes || {}),
    Number(progressPercent || 0),
    completed ? 1 : 0,
    now
  );

  // Sync completed lessons and notes to user profile in SQLite
  try {
    const user = getUser(cleanUsername);
    if (user) {
      const mergedCompleted = Array.from(new Set([...(user.completedLessons || []), ...completedLessons]));
      const mergedScores = { ...(user.quizScores || {}), ...quizScores };
      const mergedNotes = { ...(user.lessonNotes || {}), ...notes };
      upsertUser({
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
