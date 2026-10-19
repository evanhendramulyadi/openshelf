/**
 * Resilient LocalStorage Manager with Event Dispatching
 */

const STORAGE_KEYS = {
  THEME: 'openshelf_theme',
  FAVORITES: 'openshelf_favorites_v1',
  LIBRARY: 'openshelf_library_v1',
  READER_PREFS: 'openshelf_reader_prefs_v1',
};

// In-memory fallback if localStorage is unavailable
const memoryFallback = new Map();

/**
 * Safe getItem with fallback
 */
function getItem(key) {
  try {
    if (typeof localStorage === 'undefined') {
      return memoryFallback.get(key) || null;
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return memoryFallback.get(key) || null;
  }
}

/**
 * Safe setItem with fallback and quota handling
 */
function setItem(key, value) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      memoryFallback.set(key, value);
    }
  } catch (error) {
    console.warn(`LocalStorage write error for ${key}:`, error);
    memoryFallback.set(key, value);
  }
  
  // Dispatch custom event for UI reactivity
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('openshelf:state-changed', {
      detail: { key, value }
    }));
  }
}

// ------------------- Theme Management -------------------

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'system';
  } catch (e) {
    return 'system';
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {}
  
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  window.dispatchEvent(new CustomEvent('openshelf:theme-changed', { detail: { theme, isDark } }));
}

// ------------------- Favorites Management -------------------

/**
 * Get all favorited books
 * @returns {Array} array of simplified book objects
 */
export function getFavorites() {
  const data = getItem(STORAGE_KEYS.FAVORITES);
  return Array.isArray(data) ? data : [];
}

/**
 * Check if a book ID is in favorites
 * @param {number|string} bookId 
 * @returns {boolean}
 */
export function isFavorite(bookId) {
  const favs = getFavorites();
  const idNum = Number(bookId);
  return favs.some(b => Number(b.id) === idNum);
}

/**
 * Toggle favorite state for a book
 * @param {Object} book 
 * @returns {boolean} true if now favorited, false if removed
 */
export function toggleFavorite(book) {
  if (!book || !book.id) return false;
  const favs = getFavorites();
  const idNum = Number(book.id);
  const existingIndex = favs.findIndex(b => Number(b.id) === idNum);
  
  let nowFavorite = false;
  if (existingIndex >= 0) {
    favs.splice(existingIndex, 1);
    nowFavorite = false;
  } else {
    favs.unshift({
      id: idNum,
      title: book.title,
      authorNames: book.authorNames || 'Unknown',
      coverUrl: book.coverUrl || null,
      downloadCount: book.downloadCount || 0,
      subjects: Array.isArray(book.subjects) ? book.subjects.slice(0, 3) : [],
      addedAt: Date.now()
    });
    nowFavorite = true;
  }
  
  setItem(STORAGE_KEYS.FAVORITES, favs);
  return nowFavorite;
}

// ------------------- Personal Library Management -------------------

/**
 * Get all library items
 * @returns {Object} map of bookId -> library item
 */
export function getLibrary() {
  const data = getItem(STORAGE_KEYS.LIBRARY);
  return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
}

/**
 * Get single book library status and progress
 * @param {number|string} bookId 
 * @returns {Object|null}
 */
export function getLibraryItem(bookId) {
  const lib = getLibrary();
  return lib[String(bookId)] || null;
}

/**
 * Add or update book in personal library
 * @param {Object} book 
 * @param {'want_to_read'|'reading'|'finished'} status 
 * @param {number} progressPercent 
 */
export function setLibraryItem(book, status = 'want_to_read', progressPercent = 0) {
  if (!book || !book.id) return;
  const lib = getLibrary();
  const idStr = String(book.id);
  const existing = lib[idStr] || {};
  
  lib[idStr] = {
    id: Number(book.id),
    title: book.title,
    authorNames: book.authorNames || 'Unknown',
    coverUrl: book.coverUrl || null,
    status: status || existing.status || 'want_to_read',
    progressPercent: progressPercent !== undefined ? Math.min(100, Math.max(0, progressPercent)) : (existing.progressPercent || 0),
    addedAt: existing.addedAt || Date.now(),
    updatedAt: Date.now(),
    lastReadAt: (status === 'reading' || progressPercent > 0) ? Date.now() : existing.lastReadAt
  };
  
  setItem(STORAGE_KEYS.LIBRARY, lib);
  return lib[idStr];
}

/**
 * Remove book completely from personal library
 * @param {number|string} bookId 
 */
export function removeLibraryItem(bookId) {
  const lib = getLibrary();
  const idStr = String(bookId);
  if (lib[idStr]) {
    delete lib[idStr];
    setItem(STORAGE_KEYS.LIBRARY, lib);
    return true;
  }
  return false;
}

/**
 * Update reading progress (0-100) and save book to library
 * @param {Object|number|string} bookOrId 
 * @param {number} percent 
 * @returns {Object} updated library item
 */
export function updateReadingProgress(bookOrId, percent) {
  const lib = getLibrary();
  let bookId;
  let bookObj = null;

  if (bookOrId && typeof bookOrId === 'object') {
    bookId = Number(bookOrId.id);
    bookObj = bookOrId;
  } else {
    bookId = Number(bookOrId);
  }

  const idStr = String(bookId);
  const existing = lib[idStr] || {};
  const p = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)));
  const status = p === 100 ? 'finished' : (p > 0 ? 'reading' : (existing.status || 'want_to_read'));

  lib[idStr] = {
    id: bookId,
    title: bookObj?.title || existing.title || `Book #${bookId}`,
    authorNames: bookObj?.authorNames || existing.authorNames || 'Unknown',
    coverUrl: bookObj?.coverUrl !== undefined ? bookObj.coverUrl : (existing.coverUrl || null),
    status: status,
    progressPercent: p,
    addedAt: existing.addedAt || Date.now(),
    updatedAt: Date.now(),
    lastReadAt: Date.now()
  };

  setItem(STORAGE_KEYS.LIBRARY, lib);
  return lib[idStr];
}

// ------------------- Reader Preferences -------------------

const DEFAULT_READER_PREFS = {
  theme: 'day', // 'day', 'sepia', 'dark', 'oled'
  fontSize: 'md', // 'sm', 'md', 'lg', 'xl'
};

export function getReaderPrefs() {
  const data = getItem(STORAGE_KEYS.READER_PREFS);
  return { ...DEFAULT_READER_PREFS, ...(data || {}) };
}

export function setReaderPrefs(prefs) {
  const current = getReaderPrefs();
  const updated = { ...current, ...prefs };
  setItem(STORAGE_KEYS.READER_PREFS, updated);
  return updated;
}

// ------------------- Export & Import Backup -------------------

export function exportLibraryData() {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: getFavorites(),
    library: getLibrary(),
    readerPrefs: getReaderPrefs()
  }, null, 2);
}

export function importLibraryData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.favorites && Array.isArray(data.favorites)) {
      setItem(STORAGE_KEYS.FAVORITES, data.favorites);
    }
    if (data.library && typeof data.library === 'object') {
      setItem(STORAGE_KEYS.LIBRARY, data.library);
    }
    if (data.readerPrefs) {
      setItem(STORAGE_KEYS.READER_PREFS, data.readerPrefs);
    }
    return { success: true, count: Object.keys(data.library || {}).length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

