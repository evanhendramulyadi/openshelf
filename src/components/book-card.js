import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';
import { renderFallbackCover, setupImageFallback } from './fallback-cover.js';
import * as storage from '../utils/storage.js';
import { showToast } from './toast.js';

/**
 * Render single book card HTML string
 * @param {Object} book - Normalized book object
 * @returns {string} HTML string
 */
export function renderBookCard(book) {
  if (!book) return '';

  const isFav = storage.isFavorite(book.id);
  const libItem = storage.getLibraryItem(book.id);
  const isInLibrary = Boolean(libItem);

  const subjectPill = book.subjects && book.subjects[0] ? book.subjects[0] : (book.bookshelves && book.bookshelves[0] ? book.bookshelves[0] : '');

  return `
    <article 
      class="group relative flex flex-col bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200"
      data-book-id="${book.id}">
      
      <!-- Cover Container with 3D spine style -->
      <a 
        href="#/book/${book.id}" 
        class="relative block w-full aspect-[2/3] bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer"
        aria-label="View details for ${escapeHTML(book.title)}">
        
        ${book.coverUrl ? `
          <img 
            src="${book.coverUrl}" 
            alt="Cover of ${escapeHTML(book.title)}"
            loading="lazy" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 book-spine"
            data-book-cover="${book.id}"
          />
        ` : renderFallbackCover(book)}

        <!-- Top Badges Overlay -->
        <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          ${book.canReadOnline ? `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-900/80 dark:bg-stone-100/90 text-stone-100 dark:text-stone-900 backdrop-blur-sm shadow-sm">
              ${renderIcon('book-open', 'w-3 h-3')}
              <span>Read</span>
            </span>
          ` : `<span></span>`}

          <div class="flex items-center gap-1.5 pointer-events-auto">
            <!-- Favorite button -->
            <button 
              type="button"
              class="btn-toggle-favorite w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isFav 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'bg-stone-900/60 hover:bg-stone-900/80 text-stone-100'
              }"
              data-id="${book.id}"
              aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ${renderIcon('heart', 'w-4 h-4', isFav ? 'fill-current' : '')}
            </button>
            
            <!-- Quick Library button -->
            <button 
              type="button"
              class="btn-toggle-library w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isInLibrary 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'bg-stone-900/60 hover:bg-stone-900/80 text-stone-100'
              }"
              data-id="${book.id}"
              aria-label="${isInLibrary ? 'In personal library' : 'Save to library'}">
              ${renderIcon(isInLibrary ? 'book-check' : 'bookmark', 'w-4 h-4')}
            </button>
          </div>
        </div>

        ${libItem && libItem.progressPercent > 0 ? `
          <!-- Progress bar overlay at bottom of cover -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-stone-700/40">
            <div class="h-full bg-amber-500" style="width: ${libItem.progressPercent}%"></div>
          </div>
        ` : ''}
      </a>

      <!-- Book Info Content -->
      <div class="p-4 flex flex-col flex-grow">
        ${subjectPill ? `
          <span class="text-[11px] font-medium tracking-wide text-amber-700 dark:text-amber-400 truncate mb-1">
            ${escapeHTML(subjectPill)}
          </span>
        ` : ''}

        <h3 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 mb-1 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
          <a href="#/book/${book.id}">
            ${escapeHTML(book.title)}
          </a>
        </h3>

        <p class="text-xs text-stone-600 dark:text-stone-400 truncate mb-3">
          ${escapeHTML(book.authorNames)}
        </p>

        <!-- Bottom Metadata Row -->
        <div class="mt-auto pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span class="inline-flex items-center gap-1" title="${book.downloadCountFormatted} Gutenberg downloads">
            ${renderIcon('download', 'w-3 h-3')}
            ${escapeHTML(book.downloadCountCompact)}
          </span>

          <a 
            href="#/book/${book.id}" 
            class="font-medium text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
            <span>Details</span>
            ${renderIcon('arrow-right', 'w-3 h-3')}
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Attaches interactive listeners to book cards within a container
 * @param {HTMLElement} container 
 * @param {Object[]} books - array of books rendered
 */
export function attachBookCardListeners(container, books = []) {
  if (!container) return;

  // Setup fallback for broken images
  const bookMap = new Map((books || []).map(b => [Number(b.id), b]));
  const coverImgs = container.querySelectorAll('img[data-book-cover]');
  coverImgs.forEach(img => {
    const bookId = Number(img.getAttribute('data-book-cover'));
    const book = bookMap.get(bookId);
    if (book) {
      setupImageFallback(img, book);
    }
  });

  // Handle Favorites toggle
  container.querySelectorAll('.btn-toggle-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(btn.getAttribute('data-id'));
      const book = bookMap.get(id);
      if (!book) return;

      const isNowFav = storage.toggleFavorite(book);
      showToast(
        isNowFav ? `Added "${book.title}" to Favorites` : `Removed "${book.title}" from Favorites`,
        isNowFav ? 'success' : 'info'
      );

      // Update button styling immediately
      if (isNowFav) {
        btn.classList.remove('bg-stone-900/60', 'hover:bg-stone-900/80', 'text-stone-100');
        btn.classList.add('bg-rose-600', 'text-white', 'shadow-sm');
        btn.innerHTML = renderIcon('heart', 'w-4 h-4', 'fill-current');
      } else {
        btn.classList.add('bg-stone-900/60', 'hover:bg-stone-900/80', 'text-stone-100');
        btn.classList.remove('bg-rose-600', 'text-white', 'shadow-sm');
        btn.innerHTML = renderIcon('heart', 'w-4 h-4');
      }
      initIcons(btn);
    });
  });

  // Handle Quick Library toggle
  container.querySelectorAll('.btn-toggle-library').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(btn.getAttribute('data-id'));
      const book = bookMap.get(id);
      if (!book) return;

      const current = storage.getLibraryItem(id);
      if (current) {
        storage.removeLibraryItem(id);
        showToast(`Removed "${book.title}" from Reading List`, 'info');
        btn.classList.add('bg-stone-900/60', 'hover:bg-stone-900/80', 'text-stone-100');
        btn.classList.remove('bg-amber-600', 'text-white', 'shadow-sm');
        btn.innerHTML = renderIcon('bookmark', 'w-4 h-4');
      } else {
        storage.setLibraryItem(book, 'want_to_read', 0);
        showToast(`Saved "${book.title}" to Reading List`, 'success');
        btn.classList.remove('bg-stone-900/60', 'hover:bg-stone-900/80', 'text-stone-100');
        btn.classList.add('bg-amber-600', 'text-white', 'shadow-sm');
        btn.innerHTML = renderIcon('book-check', 'w-4 h-4');
      }
      initIcons(btn);
    });
  });

  initIcons(container);
}

