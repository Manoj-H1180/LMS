/**
 * videoFileHandles.js
 *
 * Persists FileSystemFileHandle objects in IndexedDB so that local video files
 * selected by the user are remembered across page reloads / course re-opens.
 *
 * The File System Access API allows storing file handles in IndexedDB.
 * On revisit the app re-requests permission (a small browser-native prompt),
 * then recreates a fresh blob URL — no file picker needed again.
 */

const DB_NAME = 'nexus_lms_video_handles';
const DB_VERSION = 1;
const STORE_NAME = 'handles';

/** Open (or create) the IndexedDB database. Returns a Promise<IDBDatabase>. */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME); // key = lessonId
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save a FileSystemFileHandle for a lesson.
 * @param {string} lessonId
 * @param {FileSystemFileHandle} handle
 */
export async function saveVideoHandle(lessonId, handle) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(handle, lessonId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[videoFileHandles] Could not save handle:', err);
  }
}

/**
 * Load a previously saved FileSystemFileHandle for a lesson.
 * @param {string} lessonId
 * @returns {Promise<FileSystemFileHandle|null>}
 */
export async function loadVideoHandle(lessonId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(lessonId);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[videoFileHandles] Could not load handle:', err);
    return null;
  }
}

/**
 * Delete the saved handle for a lesson (e.g. when a course is removed).
 * @param {string} lessonId
 */
export async function deleteVideoHandle(lessonId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(lessonId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[videoFileHandles] Could not delete handle:', err);
  }
}

/**
 * Delete all saved handles (e.g. when all imported courses are removed).
 */
export async function clearAllVideoHandles() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[videoFileHandles] Could not clear handles:', err);
  }
}

/**
 * Request read permission for a FileSystemFileHandle.
 * Returns true if already granted or user grants it.
 * Returns false if denied or API unavailable.
 * @param {FileSystemFileHandle} handle
 * @returns {Promise<boolean>}
 */
export async function requestHandlePermission(handle) {
  try {
    const state = await handle.queryPermission({ mode: 'read' });
    if (state === 'granted') return true;
    const newState = await handle.requestPermission({ mode: 'read' });
    return newState === 'granted';
  } catch (err) {
    console.warn('[videoFileHandles] Permission request failed:', err);
    return false;
  }
}

/**
 * Attempt to restore a blob URL from a saved FileSystemFileHandle.
 * Loads the handle from IndexedDB, requests permission, and creates a blob URL.
 *
 * @param {string} lessonId
 * @returns {Promise<{blobUrl: string, handle: FileSystemFileHandle}|null>}
 */
export async function restoreVideoFromHandle(lessonId) {
  if (typeof window === 'undefined' || !('FileSystemFileHandle' in window)) {
    return null;
  }
  try {
    const handle = await loadVideoHandle(lessonId);
    if (!handle) return null;

    const granted = await requestHandlePermission(handle);
    if (!granted) return null;

    const file = await handle.getFile();
    const blobUrl = URL.createObjectURL(file);
    return { blobUrl, handle };
  } catch (err) {
    console.warn('[videoFileHandles] Could not restore video from handle:', err);
    return null;
  }
}
