/**
 * Open Library API Service (Optional Supplementary Metadata)
 * Official documentation: https://openlibrary.org/developers/api
 */

const BASE_URL = 'https://openlibrary.org';
const cache = new Map();

/**
 * Fetch supplementary book details by title and author
 * @param {string} title 
 * @param {string} [author] 
 * @returns {Promise<{ publishYear: number|null, openLibraryKey: string|null, description: string|null }|null>}
 */
export async function getSupplementaryMetadata(title, author = '') {
  if (!title) return null;

  const cleanTitle = title.split(';')[0].split(':')[0].trim();
  const cacheKey = `${cleanTitle}__${author}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const params = new URLSearchParams({
      title: cleanTitle,
      limit: '1'
    });
    if (author && author !== 'Unknown Author') {
      params.set('author', author.split(',')[0].trim());
    }

    const url = `${BASE_URL}/search.json?${params.toString()}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.docs || data.docs.length === 0) {
      cache.set(cacheKey, null);
      return null;
    }

    const doc = data.docs[0];
    const metadata = {
      publishYear: doc.first_publish_year || null,
      openLibraryKey: doc.key || null,
      openLibraryUrl: doc.key ? `https://openlibrary.org${doc.key}` : null,
      coverId: doc.cover_i || null,
      editionCount: doc.edition_count || null
    };

    cache.set(cacheKey, metadata);
    return metadata;
  } catch (err) {
    console.warn('Open Library metadata lookup failed (non-critical):', err);
    return null;
  }
}

