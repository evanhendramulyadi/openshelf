import { renderHome } from '../pages/home.js';
import { renderExplore } from '../pages/explore.js';
import { renderCategories } from '../pages/categories.js';
import { renderBookDetails } from '../pages/book-details.js';
import { renderReader } from '../pages/reader.js';
import { renderMyLibrary } from '../pages/my-library.js';
import { renderAbout } from '../pages/about.js';
import { renderHeader } from '../components/header.js';
import { scrollToTop } from '../utils/dom.js';

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
}

const ROUTE_ALIASES = {
  // Home
  home: '/',
  index: '/',
  main: '/',
  beranda: '/',
  depan: '/',
  awal: '/',

  // Explore
  explore: '/explore',
  explor: '/explore',
  explorer: '/explore',
  explores: '/explore',
  search: '/explore',
  catalog: '/explore',
  catalogue: '/explore',
  browse: '/explore',
  books: '/explore',
  cari: '/explore',
  katalog: '/explore',
  temukan: '/explore',

  // Categories
  categories: '/categories',
  category: '/categories',
  kategori: '/categories',
  genres: '/categories',
  genre: '/categories',
  topics: '/categories',
  topic: '/categories',
  subjects: '/categories',
  subject: '/categories',
  topik: '/categories',

  // Library
  library: '/library',
  librari: '/library',
  libary: '/library',
  lib: '/library',
  mylibrary: '/library',
  'my-library': '/library',
  bookmarks: '/library',
  bookmark: '/library',
  saved: '/library',
  favorites: '/library',
  favorite: '/library',
  favorit: '/library',
  koleksi: '/library',
  perpustakaan: '/library',

  // About
  about: '/about',
  'about-us': '/about',
  tentang: '/about',
  info: '/about',
  faq: '/about',
  help: '/about',
  bantuan: '/about'
};

const BOOK_ALIASES = ['book', 'books', 'detail', 'details', 'b', 'buku'];
const READ_ALIASES = ['read', 'reader', 'reading', 'read-book', 'baca', 'r'];

const TARGET_ROUTES = [
  { name: 'explore', path: '/explore' },
  { name: 'categories', path: '/categories' },
  { name: 'library', path: '/library' },
  { name: 'about', path: '/about' },
  { name: 'home', path: '/' }
];

/**
 * Resolve single segment to closest known route
 * @param {string} segment 
 * @returns {string}
 */
function resolveSingleSegment(segment) {
  if (!segment) return '/';
  const seg = segment.toLowerCase().trim();

  // 1. Direct alias dictionary lookup
  if (ROUTE_ALIASES[seg]) {
    return ROUTE_ALIASES[seg];
  }

  // 2. Prefix / containment match
  for (const route of TARGET_ROUTES) {
    if (route.name.startsWith(seg) || (seg.length >= 3 && route.name.includes(seg)) || (seg.length >= 3 && seg.startsWith(route.name))) {
      return route.path;
    }
  }

  // 3. Levenshtein distance match
  let bestRoute = '/';
  let minDistance = Infinity;

  for (const route of TARGET_ROUTES) {
    const dist = levenshteinDistance(seg, route.name);
    if (dist < minDistance) {
      minDistance = dist;
      bestRoute = route.path;
    }
  }

  // Within reasonable edit distance (<= 3 edits or <= half length of word)
  const maxAllowedDistance = Math.max(2, Math.floor(seg.length / 2));
  if (minDistance <= maxAllowedDistance) {
    return bestRoute;
  }

  // 4. Default fallback: Home
  return '/';
}

/**
 * Sanitize and extract a clean book ID or text query from route parameter
 * @param {string|null} rawId 
 * @returns {{ validId: string|null, queryText: string|null }}
 */
export function sanitizeBookId(rawId) {
  if (!rawId) return { validId: null, queryText: null };
  const str = String(rawId).trim().toLowerCase();

  // Filter out literal null / undefined / object artifacts
  if (['undefined', 'null', 'nan', '[object object]'].includes(str)) {
    return { validId: null, queryText: null };
  }

  // Filter out negative numbers and zero (Gutenberg IDs are positive integers)
  if (str.startsWith('-') || str === '0') {
    return { validId: null, queryText: null };
  }

  // Exact positive integer ID
  if (/^\d+$/.test(str) && Number(str) > 0) {
    return { validId: str, queryText: null };
  }

  // Embedded number e.g. "id-1342" or "1342-pride"
  const digitsMatch = str.match(/\d+/);
  if (digitsMatch && Number(digitsMatch[0]) > 0) {
    return { validId: digitsMatch[0], queryText: null };
  }

  // Words or queries e.g. "sherlock" or "alice"
  const cleanWord = str.replace(/[^\w\s-]/g, '').trim();
  if (cleanWord.length >= 2) {
    return { validId: null, queryText: cleanWord };
  }

  return { validId: null, queryText: null };
}

/**
 * Determine closest valid route for an unrecognized URL hash
 * @param {string} hash - e.g. '#/explor?search=pride'
 * @returns {string} - e.g. '#/explore?search=pride'
 */
export function findClosestRoute(hash = window.location.hash) {
  let cleanHash = (hash || '').replace(/^#+/, '').trim();
  if (!cleanHash || cleanHash === '/') {
    return '#/';
  }

  const [rawPath, rawQuery] = cleanHash.split('?');
  const pathParts = (rawPath || '').split('/').filter(Boolean);

  let targetPath = '/';

  if (pathParts.length >= 2) {
    const seg0 = pathParts[0].toLowerCase();
    const seg1 = pathParts[1];

    if (BOOK_ALIASES.includes(seg0) || levenshteinDistance(seg0, 'book') <= 2) {
      const { validId, queryText } = sanitizeBookId(seg1);
      if (validId) {
        targetPath = `/book/${validId}`;
      } else if (queryText) {
        return `#/explore?search=${encodeURIComponent(queryText)}`;
      } else {
        targetPath = '/explore';
      }
    } else if (READ_ALIASES.includes(seg0) || levenshteinDistance(seg0, 'read') <= 2) {
      const { validId, queryText } = sanitizeBookId(seg1);
      if (validId) {
        targetPath = `/read/${validId}`;
      } else if (queryText) {
        return `#/explore?search=${encodeURIComponent(queryText)}`;
      } else {
        targetPath = '/explore';
      }
    } else {
      targetPath = resolveSingleSegment(seg0);
    }
  } else if (pathParts.length === 1) {
    const seg0 = pathParts[0].toLowerCase();
    // If user navigates to /book or /read without ID, redirect to catalog (/explore)
    if (BOOK_ALIASES.includes(seg0) || READ_ALIASES.includes(seg0)) {
      targetPath = '/explore';
    } else {
      targetPath = resolveSingleSegment(seg0);
    }
  }

  const queryPart = rawQuery ? `?${rawQuery}` : '';
  if (targetPath === '/') {
    return queryPart ? `#/?${rawQuery}` : '#/';
  }

  return `#${targetPath}${queryPart}`;
}

/**
 * Parse URL hash into route path and query parameters
 * @param {string} hash - e.g. '#/explore?search=frank&page=2'
 * @returns {{ path: string, params: Object, id: string|null }}
 */
export function parseHash(hash = window.location.hash) {
  let cleanHash = (hash || '').replace(/^#+/, '').trim();
  if (!cleanHash || cleanHash === '/') {
    return { path: '/', params: {}, id: null };
  }

  const [rawPath, rawQuery] = cleanHash.split('?');
  const params = {};

  if (rawQuery) {
    const searchParams = new URLSearchParams(rawQuery);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }

  // Handle parameterized routes like /book/84 or /read/84
  const pathParts = (rawPath || '').split('/').filter(Boolean);
  if (pathParts.length >= 2 && (pathParts[0] === 'book' || pathParts[0] === 'read')) {
    return {
      path: `/${pathParts[0]}/:id`,
      id: pathParts[1],
      params
    };
  }

  if (pathParts.length === 1) {
    return {
      path: `/${pathParts[0]}`,
      id: null,
      params
    };
  }

  return {
    path: rawPath ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`) : '/',
    id: null,
    params
  };
}

/**
 * Handle route changes and render appropriate view
 */
export async function handleRouting() {
  const main = document.getElementById('app-main');
  const headerContainer = document.getElementById('header-container');
  if (!main) return;

  const currentHash = window.location.hash || '#/';
  const { path, id, params } = parseHash(currentHash);

  // Update Header active link & counters
  if (headerContainer) {
    renderHeader(headerContainer, currentHash);
  }

  // Scroll to top on navigation instantly
  scrollToTop(false);

  // Focus management for accessibility
  main.focus();

  switch (path) {
    case '/':
      await renderHome(main);
      break;

    case '/explore':
      await renderExplore(main, params);
      break;

    case '/categories':
      await renderCategories(main, params);
      break;

    case '/book/:id': {
      const { validId, queryText } = sanitizeBookId(id);
      if (validId) {
        if (validId !== id) {
          window.location.replace(`#/book/${validId}`);
          return;
        }
        await renderBookDetails(main, validId);
      } else if (queryText) {
        window.location.replace(`#/explore?search=${encodeURIComponent(queryText)}`);
      } else {
        window.location.replace('#/explore');
      }
      break;
    }

    case '/read/:id': {
      const { validId, queryText } = sanitizeBookId(id);
      if (validId) {
        if (validId !== id) {
          window.location.replace(`#/read/${validId}`);
          return;
        }
        await renderReader(main, validId);
      } else if (queryText) {
        window.location.replace(`#/explore?search=${encodeURIComponent(queryText)}`);
      } else {
        window.location.replace('#/explore');
      }
      break;
    }

    case '/library':
      renderMyLibrary(main, params);
      break;

    case '/about':
      renderAbout(main);
      break;

    default: {
      const closestHash = findClosestRoute(currentHash);
      if (closestHash && closestHash !== currentHash) {
        window.location.replace(closestHash);
      } else {
        window.location.replace('#/');
      }
      break;
    }
  }

  // Ensure instant scroll to top on page navigation
  requestAnimationFrame(() => {
    scrollToTop(false);
  });
}

/**
 * Initialize Client-Side Hash Router
 */
export function initRouter() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  scrollToTop(false);

  window.addEventListener('hashchange', handleRouting);
  
  // Listen for storage changes to update header badges reactively
  window.addEventListener('openshelf:state-changed', () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      renderHeader(headerContainer, window.location.hash);
    }
  });

  // Initial route
  handleRouting();
}
