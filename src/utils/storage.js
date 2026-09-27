// Mock data removed; start with an empty catalog.
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
  name: 'Learner',
  avatar: '🎓',
  title: 'Novice Scholar',
  xp: 0,
  coins: 0,
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

export function saveUser(user) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    // Asynchronously sync with Next.js backend API
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save user state', e);
  }
}

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

export function saveCourses(courses) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    // Asynchronously sync with Next.js backend API
    fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses })
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save courses', e);
  }
}

// Clean production leaderboard starts empty and is populated by active learners
export const INITIAL_LEADERBOARD = [];
