/**
 * Gutendex API Service
 * Official documentation: https://gutendex.com/
 */

import { formatAuthorName, formatAuthorYears, formatNumber, formatLanguages, cleanSubject } from '../utils/formatters.js';
import { CURATED_CATALOG } from '../data/curated-catalog.js';

const BASE_URL = 'https://gutendex.com/books';

// In-memory cache for active session
const urlCache = new Map();
const bookCacheById = new Map();

// Pre-seed in-memory book cache with curated catalog for instant 0ms lookups
if (Array.isArray(CURATED_CATALOG)) {
  for (const item of CURATED_CATALOG) {
    if (item && item.id) {
      bookCacheById.set(String(item.id), item);
    }
  }
}

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const SESSION_CACHE_PREFIX = 'openshelf_api_';
const SESSION_BOOK_PREFIX = 'openshelf_bk_';

function getSessionItem(key) {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch (e) {
    return null;
  }
}

function setSessionItem(key, data) {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {
    // Quota exceeded or private browsing
  }
}

let currentAbortController = null;

/**
 * Normalizes a raw book item from the Gutendex API into a clean internal model
 * @param {Object} raw 
 * @returns {Object}
 */
export function normalizeBook(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const rawFormats = raw.formats || {};

  // Find preferred formats
  let htmlUrl = null;
  let epubUrl = null;
  let kindleUrl = null;
  let txtUrl = null;
  let zipUrl = null;
  let rdfUrl = null;
  let coverUrl = null;

  for (const [mime, url] of Object.entries(rawFormats)) {
    const m = mime.toLowerCase();
    if (m.includes('text/html')) {
      if (!htmlUrl || m === 'text/html') htmlUrl = url;
    } else if (m.includes('application/epub+zip')) {
      epubUrl = url;
    } else if (m.includes('x-mobipocket-ebook')) {
      kindleUrl = url;
    } else if (m.startsWith('text/plain')) {
      if (!txtUrl || m === 'text/plain; charset=utf-8') txtUrl = url;
    } else if (m.includes('octet-stream') || url.endsWith('.zip')) {
      zipUrl = url;
    } else if (m.includes('rdf+xml')) {
      rdfUrl = url;
    } else if (m.includes('image/jpeg')) {
      coverUrl = url;
    }
  }

  // Format authors
  const authors = (raw.authors || []).map(a => ({
    name: formatAuthorName(a.name),
    rawName: a.name,
    birthYear: a.birth_year,
    deathYear: a.death_year,
    years: formatAuthorYears(a)
  }));

  const authorNames = authors.length > 0 
    ? authors.map(a => a.name).join(', ') 
    : 'Unknown Author';

  // Format subjects & bookshelves
  const subjects = (raw.subjects || []).map(cleanSubject).filter(Boolean);
  const bookshelves = (raw.bookshelves || []).map(cleanSubject).filter(Boolean);

  // Download count
  const downloadCount = typeof raw.download_count === 'number' ? raw.download_count : 0;

  // For Project Gutenberg books, ensure direct HTTPS cache URLs to prevent 302 redirects to insecure http://
  if (raw.id) {
    const directHtml = `https://www.gutenberg.org/cache/epub/${raw.id}/pg${raw.id}-images.html`;
    const directTxt = `https://www.gutenberg.org/cache/epub/${raw.id}/pg${raw.id}.txt.utf-8`;
    if (!htmlUrl || htmlUrl.includes('/ebooks/')) {
      htmlUrl = directHtml;
    }
    if (!txtUrl || txtUrl.includes('/ebooks/')) {
      txtUrl = directTxt;
    }
  }

  // Force HTTPS on all format URLs
  const ensureHttps = (u) => (u && typeof u === 'string') ? u.replace(/^http:\/\//i, 'https://') : u;
  htmlUrl = ensureHttps(htmlUrl);
  epubUrl = ensureHttps(epubUrl);
  kindleUrl = ensureHttps(kindleUrl);
  txtUrl = ensureHttps(txtUrl);
  coverUrl = ensureHttps(coverUrl);

  const normalized = {
    id: raw.id,
    title: raw.title || 'Untitled Book',
    authors,
    authorNames,
    primaryAuthor: authors[0] || { name: 'Unknown Author', years: '' },
    subjects,
    bookshelves,
    languages: raw.languages || ['en'],
    languageFormatted: formatLanguages(raw.languages),
    copyright: raw.copyright,
    mediaType: raw.media_type || 'Text',
    downloadCount,
    downloadCountFormatted: formatNumber(downloadCount),
    downloadCountCompact: formatNumber(downloadCount, true),
    coverUrl,
    hasCover: Boolean(coverUrl),
    formats: {
      html: htmlUrl,
      epub: epubUrl,
      kindle: kindleUrl,
      txt: txtUrl,
      zip: zipUrl,
      rdf: rdfUrl,
      cover: coverUrl,
      all: rawFormats
    },
    canReadOnline: Boolean(htmlUrl || txtUrl),
    readUrl: htmlUrl || txtUrl,
    gutenbergUrl: `https://www.gutenberg.org/ebooks/${raw.id}`
  };

  // Register in instant lookup caches
  if (normalized.id) {
    const idKey = String(normalized.id);
    bookCacheById.set(idKey, normalized);
    setSessionItem(`${SESSION_BOOK_PREFIX}${idKey}`, normalized);
  }

  return normalized;
}

/**
 * Fetch with internal caching and optional request cancellation
 * @param {string} url 
 * @param {boolean} cancellable 
 * @returns {Promise<any>}
 */
async function cachedFetch(url, cancellable = false) {
  // 1. In-memory check
  const memCached = urlCache.get(url);
  if (memCached && Date.now() - memCached.timestamp < CACHE_TTL) {
    return memCached.data;
  }

  // 2. SessionStorage check
  const sessionCached = getSessionItem(`${SESSION_CACHE_PREFIX}${url}`);
  if (sessionCached) {
    urlCache.set(url, { timestamp: Date.now(), data: sessionCached });
    return sessionCached;
  }

  // 3. Network fetch with cancellation & timeout guard
  let signal = undefined;
  let timeoutId = null;

  const controller = new AbortController();
  if (cancellable) {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = controller;
  }

  let isTimedOut = false;
  timeoutId = setTimeout(() => {
    isTimedOut = true;
    controller.abort('timeout');
  }, 3800);
  signal = controller.signal;

  try {
    const response = await fetch(url, {
      signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    urlCache.set(url, { timestamp: Date.now(), data });
    setSessionItem(`${SESSION_CACHE_PREFIX}${url}`, data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      if (isTimedOut) {
        const timeoutErr = new Error('Gutendex request timed out (3.8s limit reached)');
        timeoutErr.isTimeout = true;
        throw timeoutErr;
      }
      error.isUserCancelled = true;
      throw error;
    }
    console.error('Gutendex fetch error:', error);
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Instant in-memory search across the curated catalog of top Gutenberg classics (0ms latency)
 * @param {Object} options
 * @param {string} [options.search]
 * @param {string} [options.topic]
 * @param {string} [options.languages]
 * @param {string} [options.sort]
 * @param {number} [options.page]
 * @param {number} [options.pageSize]
 * @returns {{ count: number, next: string|null, previous: string|null, page: number, totalPages: number, books: Object[], isInstant: boolean }}
 */
export function searchCuratedCatalog({
  search = '',
  topic = '',
  languages = '',
  sort = 'popular',
  page = 1,
  pageSize = 32
} = {}) {
  let filtered = [...CURATED_CATALOG];

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    const qTokens = q.split(/\s+/).filter(Boolean);

    filtered = filtered.filter(b => {
      const title = (b.title || '').toLowerCase();
      const author = (b.authorNames || '').toLowerCase();
      const subjects = (b.subjects || []).join(' ').toLowerCase();
      const bookshelves = (b.bookshelves || []).join(' ').toLowerCase();
      const fullText = `${title} ${author} ${subjects} ${bookshelves}`;

      return qTokens.every(tok => fullText.includes(tok));
    });

    // Score: exact title matches or startsWith first, then author matches, then download count
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aAuth = a.authorNames.toLowerCase();
      const bAuth = b.authorNames.toLowerCase();

      const aExact = aTitle === q || aAuth === q;
      const bExact = bTitle === q || bAuth === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = aTitle.startsWith(q);
      const bStarts = bTitle.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return (b.downloadCount || 0) - (a.downloadCount || 0);
    });
  }

  if (topic && topic.trim()) {
    const t = topic.trim().toLowerCase();
    filtered = filtered.filter(b => {
      const subjects = (b.subjects || []).map(s => s.toLowerCase());
      const shelves = (b.bookshelves || []).map(s => s.toLowerCase());
      return subjects.some(s => s.includes(t)) || shelves.some(s => s.includes(t)) || (b.title || '').toLowerCase().includes(t);
    });
  }

  if (languages && languages.trim()) {
    const lang = languages.trim().toLowerCase();
    filtered = filtered.filter(b => (b.languages || []).some(l => l.toLowerCase() === lang));
  }

  if (sort === 'descending') {
    filtered.sort((a, b) => b.id - a.id);
  } else if (sort === 'ascending') {
    filtered.sort((a, b) => a.id - b.id);
  } else if (sort === 'popular') {
    if (!search) {
      filtered.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    }
  }

  const count = filtered.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.max(1, Number(page) || 1);
  const start = (currentPage - 1) * pageSize;
  const books = filtered.slice(start, start + pageSize);

  return {
    count,
    next: currentPage < totalPages ? `page=${currentPage + 1}` : null,
    previous: currentPage > 1 ? `page=${currentPage - 1}` : null,
    page: currentPage,
    totalPages,
    books,
    isInstant: true
  };
}

/**
 * Fast fallback to Open Library to discover Gutenberg works by title/author
 * @param {string} query
 * @returns {Promise<Object[]>}
 */
export async function fetchOpenLibraryGutenbergBooks(query) {
  if (!query || !query.trim()) return [];
  try {
    const params = new URLSearchParams({
      q: query.trim(),
      limit: '15',
      fields: 'key,title,author_name,first_publish_year,id_project_gutenberg,cover_i,subject,language'
    });
    const url = `https://openlibrary.org/search.json?${params.toString()}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined,
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.docs || [];
    const books = [];

    for (const doc of docs) {
      if (!doc.id_project_gutenberg || !doc.id_project_gutenberg.length) continue;
      const gutenbergId = Number(doc.id_project_gutenberg[0]);
      if (!gutenbergId || isNaN(gutenbergId)) continue;

      if (bookCacheById.has(String(gutenbergId))) {
        books.push(bookCacheById.get(String(gutenbergId)));
        continue;
      }

      const authors = (doc.author_name || []).map(name => ({
        name: formatAuthorName(name),
        rawName: name,
        birthYear: null,
        deathYear: null,
        years: doc.first_publish_year ? `First pub. ${doc.first_publish_year}` : ''
      }));

      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`;

      const normalized = {
        id: gutenbergId,
        title: doc.title || 'Untitled Book',
        authors,
        authorNames: authors.map(a => a.name).join(', ') || 'Unknown Author',
        primaryAuthor: authors[0] || { name: 'Unknown Author', years: '' },
        subjects: (doc.subject || []).slice(0, 8).map(cleanSubject).filter(Boolean),
        bookshelves: [],
        languages: doc.language || ['en'],
        languageFormatted: formatLanguages(doc.language || ['en']),
        copyright: false,
        mediaType: 'Text',
        downloadCount: 1500,
        downloadCountFormatted: '1,500+',
        downloadCountCompact: '1.5k',
        coverUrl,
        hasCover: Boolean(coverUrl),
        formats: {
          html: `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}-images.html`,
          epub: `https://www.gutenberg.org/ebooks/${gutenbergId}.epub3.images`,
          kindle: `https://www.gutenberg.org/ebooks/${gutenbergId}.kf8.images`,
          txt: `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt.utf-8`,
          cover: coverUrl,
          all: {}
        },
        canReadOnline: true,
        readUrl: `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}-images.html`,
        gutenbergUrl: `https://www.gutenberg.org/ebooks/${gutenbergId}`
      };

      bookCacheById.set(String(gutenbergId), normalized);
      setSessionItem(`${SESSION_BOOK_PREFIX}${gutenbergId}`, normalized);
      books.push(normalized);
    }

    return books;
  } catch (e) {
    return [];
  }
}

/**
 * Query books with flexible filters and pagination
 * Ultra-fast hybrid search: checks memory/curated catalog first, races Gutendex with timeout,
 * and falls back seamlessly to Open Library or Curated Catalog on network stalls.
 * @param {Object} options
 * @param {string} [options.search]
 * @param {string} [options.topic]
 * @param {string} [options.languages]
 * @param {string} [options.sort] - 'popular' | 'ascending' | 'descending'
 * @param {number|string} [options.page]
 * @param {string} [options.ids]
 * @param {boolean} [options.cancellable]
 * @returns {Promise<{ count: number, next: string|null, previous: string|null, page: number, totalPages: number, books: Object[] }>}
 */
export async function getBooks({
  search = '',
  topic = '',
  languages = '',
  sort = 'popular',
  page = 1,
  ids = '',
  cancellable = false
} = {}) {
  // 1. Fast ID list resolution (0ms if in cache)
  if (ids && ids.trim()) {
    const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
    const cachedAll = idList.map(id => bookCacheById.get(id)).filter(Boolean);
    if (cachedAll.length === idList.length && cachedAll.length > 0) {
      return {
        count: cachedAll.length,
        next: null,
        previous: null,
        page: 1,
        totalPages: 1,
        books: cachedAll,
        isInstant: true
      };
    }
  }

  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.set('search', search.trim());
  }
  if (topic && topic.trim()) {
    params.set('topic', topic.trim());
  }
  if (languages && languages.trim()) {
    params.set('languages', languages.trim());
  }
  if (sort && sort !== 'popular') {
    params.set('sort', sort);
  }
  if (page && Number(page) > 1) {
    params.set('page', String(page));
  }
  if (ids && ids.trim()) {
    params.set('ids', ids.trim());
  }

  const queryString = params.toString();
  const url = `${BASE_URL}${queryString ? '?' + queryString : ''}`;

  try {
    const data = await cachedFetch(url, cancellable);
    const rawResults = data.results || [];
    const books = rawResults.map(normalizeBook).filter(Boolean);
    const count = typeof data.count === 'number' ? data.count : books.length;
    const pageSize = 32;
    const totalPages = Math.max(1, Math.ceil(count / pageSize));

    // If remote Gutendex returned 0 results for a search/topic, check curated catalog
    if (books.length === 0 && (search || topic)) {
      const curated = searchCuratedCatalog({ search, topic, languages, sort, page });
      if (curated.books.length > 0) {
        return curated;
      }
    }

    return {
      count,
      next: data.next,
      previous: data.previous,
      page: Number(page) || 1,
      totalPages,
      books
    };
  } catch (err) {
    if (err.isUserCancelled) {
      throw err;
    }

    console.warn('Network book fetch error or timeout, falling back:', err.message);

    // Fallback 1: Curated Catalog
    const curated = searchCuratedCatalog({ search, topic, languages, sort, page });
    if (curated.books.length > 0) {
      return curated;
    }

    // Fallback 2: Open Library for Gutenberg search
    if (search && search.trim()) {
      try {
        const olBooks = await fetchOpenLibraryGutenbergBooks(search);
        if (olBooks.length > 0) {
          return {
            count: olBooks.length,
            next: null,
            previous: null,
            page: 1,
            totalPages: 1,
            books: olBooks,
            isFallback: true
          };
        }
      } catch (olErr) {
        console.warn('Open Library fallback failed:', olErr);
      }
    }

    // Return empty results rather than hard crash
    return {
      count: 0,
      next: null,
      previous: null,
      page: Number(page) || 1,
      totalPages: 1,
      books: []
    };
  }
}

/**
 * Fetch a single book by ID (instant 0ms from cache, synthetic fallback if network fails)
 * @param {number|string} id 
 * @returns {Promise<Object>}
 */
export async function getBookById(id) {
  if (!id) throw new Error('Book ID is required');
  const idStr = String(id);

  // 1. Instant check from in-memory normalized cache (0ms)
  if (bookCacheById.has(idStr)) {
    return bookCacheById.get(idStr);
  }

  // 2. Instant check from session storage (0ms)
  const sessionBook = getSessionItem(`${SESSION_BOOK_PREFIX}${idStr}`);
  if (sessionBook) {
    bookCacheById.set(idStr, sessionBook);
    return sessionBook;
  }

  // 3. Try direct single book endpoint
  const url = `${BASE_URL}/${id}`;
  try {
    const raw = await cachedFetch(url);
    return normalizeBook(raw);
  } catch (err) {
    // Try ids query fallback
    try {
      const fallbackUrl = `${BASE_URL}?ids=${id}`;
      const data = await cachedFetch(fallbackUrl);
      if (data.results && data.results.length > 0) {
        return normalizeBook(data.results[0]);
      }
    } catch (fErr) {
      // Continue to synthetic fallback
    }

    // Direct Gutenberg standard fallback
    const synthetic = {
      id: Number(id),
      title: `Project Gutenberg EBook #${id}`,
      authors: [{ name: 'Project Gutenberg Author', rawName: 'Project Gutenberg', years: '' }],
      authorNames: 'Project Gutenberg Author',
      primaryAuthor: { name: 'Project Gutenberg Author', years: '' },
      subjects: ['Public Domain Literature'],
      bookshelves: ['Project Gutenberg Classics'],
      languages: ['en'],
      languageFormatted: 'English',
      copyright: false,
      mediaType: 'Text',
      downloadCount: 1000,
      downloadCountFormatted: '1,000+',
      downloadCountCompact: '1k+',
      coverUrl: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
      hasCover: true,
      formats: {
        html: `https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`,
        epub: `https://www.gutenberg.org/ebooks/${id}.epub3.images`,
        kindle: `https://www.gutenberg.org/ebooks/${id}.kf8.images`,
        txt: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt.utf-8`,
        cover: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
        all: {}
      },
      canReadOnline: true,
      readUrl: `https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`,
      gutenbergUrl: `https://www.gutenberg.org/ebooks/${id}`
    };

    bookCacheById.set(idStr, synthetic);
    return synthetic;
  }
}

/**
 * Fetch multiple books by ID list
 * @param {Array<number|string>} idList 
 * @returns {Promise<Object[]>}
 */
export async function getBooksByIds(idList) {
  if (!idList || !idList.length) return [];
  const idsStr = idList.slice(0, 32).join(',');
  const res = await getBooks({ ids: idsStr });
  return res.books;
}

/**
 * Curated list of classic masterpieces from Gutenberg for Featured section
 */
const FEATURED_IDS = [
  84,    // Frankenstein by Mary Shelley
  1342,  // Pride and Prejudice by Jane Austen
  2701,  // Moby Dick by Herman Melville
  11,    // Alice's Adventures in Wonderland by Lewis Carroll
  1661,  // The Adventures of Sherlock Holmes by Arthur Conan Doyle
  98,    // A Tale of Two Cities by Charles Dickens
  345,   // Dracula by Bram Stoker
  74     // The Adventures of Tom Sawyer by Mark Twain
];

/**
 * Get curated featured books (instant 0ms)
 * @returns {Promise<Object[]>}
 */
export async function getFeaturedBooks() {
  const cached = FEATURED_IDS.map(id => bookCacheById.get(String(id))).filter(Boolean);
  if (cached.length === FEATURED_IDS.length) {
    return cached;
  }
  try {
    return await getBooksByIds(FEATURED_IDS);
  } catch (err) {
    console.warn('Featured books fallback to curated:', err);
    return cached.length > 0 ? cached : searchCuratedCatalog({ sort: 'popular' }).books.slice(0, 8);
  }
}

/**
 * Fetch newest additions in the catalog
 * @returns {Promise<Object[]>}
 */
export async function getRecentAdditions() {
  try {
    const res = await getBooks({ sort: 'descending', page: 1 });
    if (res.books && res.books.length > 0) return res.books.slice(0, 8);
  } catch (err) {
    console.warn('Recent books error:', err);
  }
  return searchCuratedCatalog({ sort: 'descending' }).books.slice(0, 8);
}

