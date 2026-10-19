/**
 * Text formatting, name parsing, and localization utilities
 */

// Language code to human-readable names
const LANGUAGE_MAP = {
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  ru: 'Russian',
  zh: 'Chinese',
  la: 'Latin',
  el: 'Greek',
  ja: 'Japanese',
  eo: 'Esperanto',
  da: 'Danish',
  sv: 'Swedish',
  no: 'Norwegian',
  fi: 'Finnish',
  pl: 'Polish',
  ar: 'Arabic',
  he: 'Hebrew',
  sa: 'Sanskrit',
  hu: 'Hungarian',
  cs: 'Czech',
  ro: 'Romanian'
};

/**
 * Format author name from "Lastname, Firstname" to "Firstname Lastname"
 * @param {string} rawName 
 * @returns {string}
 */
export function formatAuthorName(rawName) {
  if (!rawName) return 'Unknown Author';
  
  // Clean up any extraneous date strings at the end (e.g. "Twain, Mark, 1835-1910")
  const parts = rawName.split(',').map(s => s.trim());
  
  if (parts.length === 1) {
    return parts[0];
  }
  
  if (parts.length >= 2) {
    const lastName = parts[0];
    const firstName = parts[1];
    // If firstName is just a date range (rare bug), keep original
    if (/^\d{3,4}/.test(firstName)) {
      return lastName;
    }
    return `${firstName} ${lastName}`;
  }
  
  return rawName;
}

/**
 * Format author birth and death years
 * @param {Object} author 
 * @returns {string} e.g. "1797–1851" or "b. 1820"
 */
export function formatAuthorYears(author) {
  if (!author) return '';
  const birth = author.birth_year;
  const death = author.death_year;
  
  if (birth && death) {
    return `${birth}–${death}`;
  } else if (birth) {
    return `b. ${birth}`;
  } else if (death) {
    return `d. ${death}`;
  }
  return '';
}

/**
 * Format download count into a readable string (e.g. 144,008 or 144k)
 * @param {number} count 
 * @param {boolean} compact 
 * @returns {string}
 */
export function formatNumber(count, compact = false) {
  if (!count && count !== 0) return '0';
  if (compact) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return String(count);
  }
  return new Intl.NumberFormat('en-US').format(count);
}

/**
 * Translate 2-letter ISO language code to full language name
 * @param {string} code 
 * @returns {string}
 */
export function getLanguageName(code) {
  if (!code) return 'Unknown';
  return LANGUAGE_MAP[code.toLowerCase()] || code.toUpperCase();
}

/**
 * Format an array of language codes
 * @param {string[]} codes 
 * @returns {string}
 */
export function formatLanguages(codes) {
  if (!codes || !codes.length) return 'English';
  return codes.map(getLanguageName).join(', ');
}

/**
 * Clean up Gutendex subjects and bookshelves
 * Strips "Category: " or cleans sub-classification separators
 * @param {string} subject 
 * @returns {string}
 */
export function cleanSubject(subject) {
  if (!subject) return '';
  return subject
    .replace(/^Category:\s*/i, '')
    .replace(/\s*--\s*Fiction$/i, '')
    .trim();
}

/**
 * Truncate long text with ellipsis
 * @param {string} text 
 * @param {number} maxLen 
 * @returns {string}
 */
export function truncate(text, maxLen = 140) {
  if (!text || text.length <= maxLen) return text || '';
  return text.substring(0, maxLen).trim() + '…';
}

