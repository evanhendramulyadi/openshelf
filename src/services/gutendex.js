/**
 * Gutendex API Service
 * Official documentation: https://gutendex.com/
 */

import { formatAuthorName, formatAuthorYears, formatNumber, formatLanguages, cleanSubject } from '../utils/formatters.js';

const BASE_URL = 'https://gutendex.com/books';

// Memory cache for active session
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

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

  return {
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
}

/**
 * Fetch with internal caching and optional request cancellation
 * @param {string} url 
 * @param {boolean} cancellable 
 * @returns {Promise<any>}
 */
async function cachedFetch(url, cancellable = false) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let signal = undefined;
  if (cancellable) {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();
    signal = currentAbortController.signal;
  }

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
    cache.set(url, { timestamp: Date.now(), data });
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Gutendex fetch error:', error);
    throw error;
  }
}

/**
 * Query books with flexible filters and pagination
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

  const data = await cachedFetch(url, cancellable);

  const rawResults = data.results || [];
  const books = rawResults.map(normalizeBook).filter(Boolean);
  const count = typeof data.count === 'number' ? data.count : books.length;
  const pageSize = 32; // Gutendex standard page size
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return {
    count,
    next: data.next,
    previous: data.previous,
    page: Number(page) || 1,
    totalPages,
    books
  };
}

/**
 * Fetch a single book by ID
 * @param {number|string} id 
 * @returns {Promise<Object>}
 */
export async function getBookById(id) {
  if (!id) throw new Error('Book ID is required');

  // Try direct single book endpoint
  const url = `${BASE_URL}/${id}`;
  try {
    const raw = await cachedFetch(url);
    return normalizeBook(raw);
  } catch (err) {
    // Fallback to ids query
    const fallbackUrl = `${BASE_URL}?ids=${id}`;
    const data = await cachedFetch(fallbackUrl);
    if (data.results && data.results.length > 0) {
      return normalizeBook(data.results[0]);
    }
    throw new Error(`Book #${id} not found in catalog.`);
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
 * Get curated featured books
 * @returns {Promise<Object[]>}
 */
export async function getFeaturedBooks() {
  try {
    return await getBooksByIds(FEATURED_IDS);
  } catch (err) {
    console.warn('Featured books fallback to popular:', err);
    const pop = await getBooks({ page: 1 });
    return pop.books.slice(0, 8);
  }
}

/**
 * Fetch newest additions in the catalog
 * @returns {Promise<Object[]>}
 */
export async function getRecentAdditions() {
  try {
    const res = await getBooks({ sort: 'descending', page: 1 });
    return res.books.slice(0, 8);
  } catch (err) {
    console.warn('Recent books error:', err);
    return [];
  }
}

