// SQLite persistent storage helpers with localStorage fallback/cache
const INITIAL_COURSES = [];

const STORAGE_KEY_USER = 'nexus_lms_user_v3';
const STORAGE_KEY_COURSES = 'nexus_lms_courses_v3';

export const LEVEL_TIERS = [
  { level: 1, title: 'Novice Scholar', minXP: 0, maxXP: 250 },
  { level: 2, title: 'Adept Explorer', minXP: 250, maxXP: 600 },
  { level: 3, title: 'Knowledge Seeker', minXP: 600, maxXP: 1100 },
  { level: 4, title: 'Grand Polymath', minXP: 1100, maxXP: 1750 },
  { level: 5, title: 'Master Architect', minXP: 1750, maxXP: 2500 },
  { level: 6, title: 'Sage of Systems', minXP: 2500, maxXP: 3500 },
  { level: 7, title: 'Grandmaster Luminary', minXP: 3500, maxXP: 5000 },
];

export function calculateLevel(xp = 0) {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXP) {
      const current = LEVEL_TIERS[i];
      const span = current.maxXP - current.minXP;
      const earnedInTier = xp - current.minXP;
      const progress = Math.min(100, Math.max(0, Math.round((earnedInTier / span) * 100)));
      return {
        ...current,
        progress,
        nextLevelXP: current.maxXP,
        neededXP: Math.max(0, current.maxXP - xp)
      };
    }
  }
  return { ...LEVEL_TIERS[0], progress: 0, nextLevelXP: 250, neededXP: 250 };
}

export const DEFAULT_USER = {
  username: 'default_learner',
  name: 'Learner',
  avatar: '🎓',
  title: 'Novice Scholar',
  xp: 0,
  coins: 100,
  streak: 0,
  streakFrozen: false,
  doubleXPUntil: null,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  quizScores: {},
  unlockedAchievements: [],
  inventory: ['theme_cyberpunk'],
  activeTheme: 'cyberpunk',
  lessonNotes: {},
  soundEnabled: true
};

// Synchronous local cache loader (used for instant render)
export function loadUser() {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return DEFAULT_USER;
    const user = JSON.parse(raw);
    return { ...DEFAULT_USER, ...user };
  } catch {
    return DEFAULT_USER;
  }
}

// Fetch user from SQLite database on disk
export async function fetchUserFromDisk(username) {
  try {
    const url = username ? `/api/user?username=${encodeURIComponent(username)}` : '/api/user';
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
      }
      return data.user;
    }
  } catch (e) {
    console.warn('Could not fetch user from SQLite disk, using local cache:', e);
  }
  return loadUser();
}

// Persist user state to SQLite database on disk & cache
export function saveUser(user) {
  if (typeof window === 'undefined' || !user) return;
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch {}

  // Sync to SQLite on disk
  fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  }).catch((err) => {
    console.warn('Failed to sync user to SQLite:', err);
  });
}

// Synchronous courses loader from cache
export function loadCourses() {
  if (typeof window === 'undefined') return INITIAL_COURSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSES);
    if (!raw) return INITIAL_COURSES;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return INITIAL_COURSES;
    return stored;
  } catch {
    return INITIAL_COURSES;
  }
}

// Fetch all courses from SQLite database on disk
export async function fetchCoursesFromDisk() {
  try {
    const res = await fetch('/api/courses');
    const data = await res.json();
    if (data.success && Array.isArray(data.courses)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(data.courses));
      }
      return data.courses;
    }
  } catch (e) {
    console.warn('Could not fetch courses from SQLite disk, using local cache:', e);
  }
  return loadCourses();
}

// Persist course list to SQLite database on disk
export function saveCourses(courses) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
  } catch {}

  // Sync to SQLite on disk
  fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courses })
  }).catch((err) => {
    console.warn('Failed to sync courses to SQLite:', err);
  });
}

// Save a single course to SQLite database on disk
export async function saveSingleCourseToDisk(course) {
  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course })
    });
    return await res.json();
  } catch (err) {
    console.warn('Failed to save single course to SQLite:', err);
  }
}

// Delete a course from SQLite database on disk
export async function deleteCourseFromDisk(courseId) {
  try {
    await fetch(`/api/courses?id=${encodeURIComponent(courseId)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed to delete course from SQLite:', err);
  }
}

// Clear all courses from SQLite database on disk & cache
export async function clearAllCoursesFromDisk() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_COURSES);
    } catch {}
  }
  try {
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' })
    });
  } catch (err) {
    console.warn('Failed to clear courses from SQLite:', err);
  }
}

// Fetch single course progress from SQLite on disk
export async function fetchCourseProgressFromDisk(courseId, username) {
  try {
    const url = `/api/progress?courseId=${encodeURIComponent(courseId)}${username ? `&username=${encodeURIComponent(username)}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.progress) {
      return data.progress;
    }
  } catch (err) {
    console.warn('Failed to fetch course progress from SQLite:', err);
  }
  return null;
}

// Save single course progress to SQLite on disk
export async function saveCourseProgressToDisk(progressData) {
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressData)
    });
    const data = await res.json();
    return data.success ? data.progress : null;
  } catch (err) {
    console.warn('Failed to save course progress to SQLite:', err);
  }
  return null;
}

export const INITIAL_LEADERBOARD = [];
