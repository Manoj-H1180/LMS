// ─── NexusLearn Mobile — API / Storage Helpers ─────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, DEFAULT_USER } from './constants';

const USER_KEY    = 'nexus_lms_user_v3';
const COURSES_KEY = 'nexus_lms_courses_v3';

// ── Session ──────────────────────────────────────────────────────────────────
export async function checkServerSession() {
  try {
    const res  = await fetch(`${API_BASE_URL}/api/auth`);
    const data = await res.json();
    if (data.success && data.authenticated && data.user) return data.user;
  } catch (e) {
    console.warn('Session check failed:', e);
  }
  return null;
}

export async function login(username, password) {
  const res  = await fetch(`${API_BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Login failed.');
  return data.user;
}

export async function signup(username, password, displayName, avatar) {
  const res  = await fetch(`${API_BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'signup', username, password, displayName, avatar }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Signup failed.');
  return data.user;
}

export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
  } catch (e) {
    console.warn('Logout failed:', e);
  }
}

// ── User ─────────────────────────────────────────────────────────────────────
export async function loadUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return DEFAULT_USER;
    return { ...DEFAULT_USER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER;
  }
}

export async function saveUser(user) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
  try {
    await fetch(`${API_BASE_URL}/api/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (e) {
    console.warn('Could not sync user to server:', e);
  }
}

export async function fetchUserFromServer(username) {
  try {
    const url  = username ? `${API_BASE_URL}/api/user?username=${encodeURIComponent(username)}` : `${API_BASE_URL}/api/user`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.success && data.user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
  } catch (e) {
    console.warn('Could not fetch user from server:', e);
  }
  return loadUser();
}

export async function clearLocalCache() {
  try {
    await AsyncStorage.multiRemove([USER_KEY, COURSES_KEY]);
  } catch {}
}

// ── Courses ───────────────────────────────────────────────────────────────────
function normalizeCourse(course) {
  if (!course || typeof course !== 'object') return null;
  const modules = (Array.isArray(course.modules) ? course.modules : [])
    .filter(m => m && typeof m === 'object')
    .map(m => ({
      ...m,
      lessons: (Array.isArray(m.lessons) ? m.lessons : [])
        .filter(l => l && typeof l === 'object')
        .map(l => ({ ...l, duration: typeof l.duration === 'string' && l.duration.trim() ? l.duration : '10 min' })),
    }));
  return { ...course, modules };
}

export async function fetchCoursesFromServer() {
  try {
    const res  = await fetch(`${API_BASE_URL}/api/courses`);
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.courses)) {
      const courses = data.courses.map(normalizeCourse).filter(Boolean);
      await AsyncStorage.setItem(COURSES_KEY, JSON.stringify(courses));
      return courses;
    }
  } catch (e) {
    console.warn('Could not fetch courses from server:', e);
  }
  return loadCoursesFromCache();
}

export async function loadCoursesFromCache() {
  try {
    const raw = await AsyncStorage.getItem(COURSES_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return [];
    return stored.map(normalizeCourse).filter(Boolean);
  } catch {
    return [];
  }
}

export async function saveSingleCourseToServer(course) {
  try {
    const res  = await fetch(`${API_BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Course save failed.');
    return data;
  } catch (err) {
    console.warn('Failed to save course:', err);
  }
}

export async function deleteCourseFromServer(courseId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/courses?id=${encodeURIComponent(courseId)}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete course:', err);
    return false;
  }
}

// ── Progress ──────────────────────────────────────────────────────────────────
export async function saveCourseProgress(progressData) {
  try {
    await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressData),
    });
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export async function fetchLeaderboard() {
  try {
    const res  = await fetch(`${API_BASE_URL}/api/leaderboard`);
    const data = await res.json();
    if (data.success && Array.isArray(data.leaderboard)) return data.leaderboard;
  } catch (e) {
    console.warn('Failed to fetch leaderboard:', e);
  }
  return [];
}
