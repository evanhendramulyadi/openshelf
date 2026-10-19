/**
 * High-level Book Domain Service
 * Combines Gutendex data with local reading list state & category definitions
 */

import * as gutendex from './gutendex.js';
import * as storage from '../utils/storage.js';

export const CATEGORIES = [
  {
    id: 'fiction',
    name: 'Fiction & Literature',
    query: 'fiction',
    description: 'Timeless storytelling, profound literary classics, and character-driven prose.',
    icon: 'book-open',
    accentColor: 'from-amber-600/20 to-orange-600/10'
  },
  {
    id: 'mystery',
    name: 'Mystery & Detective',
    query: 'mystery',
    description: 'Intriguing enigmas, classic whodunits, and deductive masterworks from Conan Doyle, Poe, and more.',
    icon: 'search',
    accentColor: 'from-slate-600/20 to-zinc-700/10'
  },
  {
    id: 'scifi',
    name: 'Science Fiction & Fantasy',
    query: 'science fiction',
    description: 'Visionary speculation, early cosmic voyages, time travel, and technological wonders.',
    icon: 'sparkles',
    accentColor: 'from-emerald-600/20 to-teal-700/10'
  },
  {
    id: 'philosophy',
    name: 'Philosophy & Ethics',
    query: 'philosophy',
    description: 'Inquiries into consciousness, morality, truth, and statecraft across ancient and modern eras.',
    icon: 'compass',
    accentColor: 'from-indigo-600/20 to-blue-700/10'
  },
  {
    id: 'history',
    name: 'History & Biography',
    query: 'history',
    description: 'Chronicles of civilizations, pivotal revolutions, and intimate memoirs of notable lives.',
    icon: 'clock',
    accentColor: 'from-stone-600/20 to-neutral-700/10'
  },
  {
    id: 'poetry',
    name: 'Poetry & Verse',
    query: 'poetry',
    description: 'Lyrical depth, sonnets, romantic odes, and epic verse by Shelley, Whitman, Keats, and Dickinson.',
    icon: 'file-text',
    accentColor: 'from-rose-600/20 to-pink-700/10'
  },
  {
    id: 'adventure',
    name: 'Adventure & Exploration',
    query: 'adventure',
    description: 'High-seas expeditions, uncharted wilderness, daring escapes, and survival against the elements.',
    icon: 'flame',
    accentColor: 'from-amber-700/20 to-yellow-600/10'
  },
  {
    id: 'drama',
    name: 'Drama & Theatre',
    query: 'drama',
    description: 'Masterpieces for the stage, Greek tragedies, Shakespearean folios, and sharp social satires.',
    icon: 'layers',
    accentColor: 'from-purple-600/20 to-violet-700/10'
  },
  {
    id: 'children',
    name: "Children's Classics",
    query: 'children',
    description: 'Beloved fairy tales, fables, and whimsical childhood adventures from Carroll, Barrie, and Andersen.',
    icon: 'heart',
    accentColor: 'from-sky-600/20 to-cyan-700/10'
  },
  {
    id: 'gothic',
    name: 'Gothic & Horror',
    query: 'gothic',
    description: 'Haunted manors, psychological dread, uncanny encounters, and nocturnal dark romanticism.',
    icon: 'eye',
    accentColor: 'from-zinc-800/30 to-stone-900/20'
  },
  {
    id: 'science',
    name: 'Science & Nature',
    query: 'science',
    description: 'Foundational scientific treatises, evolutionary theory, astronomy, and naturalist journals.',
    icon: 'globe',
    accentColor: 'from-teal-600/20 to-emerald-700/10'
  },
  {
    id: 'short-stories',
    name: 'Short Stories',
    query: 'short stories',
    description: 'Compact brilliance, narrative vignettes, and tight anthologies designed for brief reading sessions.',
    icon: 'book-marked',
    accentColor: 'from-orange-600/20 to-amber-700/10'
  }
];

export const POPULAR_SEARCH_TERMS = [
  'Sherlock Holmes',
  'Jane Austen',
  'Frankenstein',
  'Philosophy',
  'Dracula',
  'Mark Twain',
  'Charles Dickens',
  'Poetry',
  'H. G. Wells',
  'Greek Philosophy'
];

/**
 * Enriches a normalized book with local user state (favorites, reading status, progress)
 * @param {Object} book 
 * @returns {Object}
 */
export function enrichBook(book) {
  if (!book) return null;
  const isFav = storage.isFavorite(book.id);
  const libItem = storage.getLibraryItem(book.id);

  return {
    ...book,
    isFavorite: isFav,
    libraryStatus: libItem ? libItem.status : null,
    readingProgress: libItem ? libItem.progressPercent : 0,
    isInLibrary: Boolean(libItem)
  };
}

/**
 * Enriches a list of books
 * @param {Object[]} books 
 * @returns {Object[]}
 */
export function enrichBooks(books) {
  if (!Array.isArray(books)) return [];
  return books.map(enrichBook);
}

import * as openLibrary from './open-library.js';

// Re-export core Gutendex & Open Library functions
export const {
  getBooks,
  getBookById,
  getBooksByIds,
  getFeaturedBooks,
  getRecentAdditions,
  normalizeBook
} = gutendex;

export const {
  getSupplementaryMetadata
} = openLibrary;

