import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';
import { renderFallbackCover, setupImageFallback } from '../components/fallback-cover.js';
import { renderBookCard, attachBookCardListeners } from '../components/book-card.js';
import { renderLoadingSpinner, renderErrorState } from '../components/loading-state.js';
import { getBookById, getBooks, getSupplementaryMetadata } from '../services/book-service.js';
import * as storage from '../utils/storage.js';
import { showToast } from '../components/toast.js';

/**
 * Render Book Details View
 * @param {HTMLElement} root 
 * @param {string|number} bookId 
 */
export async function renderBookDetails(root, bookId) {
  if (!root) return;

  root.innerHTML = `
    <div class="py-12">
      ${renderLoadingSpinner(`Loading book #${escapeHTML(bookId)} from Gutenberg catalog…`)}
    </div>
  `;
  initIcons(root);

  try {
    const book = await getBookById(bookId);
    if (!book) throw new Error('Book not found.');

    const isFav = storage.isFavorite(book.id);
    const libItem = storage.getLibraryItem(book.id);
    const libStatus = libItem ? libItem.status : '';

    // Download format options
    const downloadLinks = [];
    if (book.formats.epub) {
      downloadLinks.push({ label: 'EPUB E-Book', desc: 'Apple Books, Kobo, Android', url: book.formats.epub, icon: 'book-open' });
    }
    if (book.formats.kindle) {
      downloadLinks.push({ label: 'Kindle Format', desc: 'MOBI / KF8 e-readers', url: book.formats.kindle, icon: 'download' });
    }
    if (book.formats.txt) {
      downloadLinks.push({ label: 'Plain Text (UTF-8)', desc: 'Universal text reader', url: book.formats.txt, icon: 'file-text' });
    }
    if (book.formats.zip) {
      downloadLinks.push({ label: 'HTML Archive (.zip)', desc: 'Complete zipped files', url: book.formats.zip, icon: 'download' });
    }
    if (book.formats.rdf) {
      downloadLinks.push({ label: 'RDF Metadata', desc: 'Bibliographic XML record', url: book.formats.rdf, icon: 'info' });
    }

    root.innerHTML = `
      <div class="space-y-12 pb-16">
        <!-- Top Navigation Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 select-none" aria-label="Breadcrumb">
          <a href="#/explore" class="hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition-colors">
            ${renderIcon('arrow-left', 'w-3.5 h-3.5')}
            <span>Back to Explore</span>
          </a>
          <span>/</span>
          <span class="text-stone-800 dark:text-stone-200 truncate max-w-xs sm:max-w-md">
            ${escapeHTML(book.title)}
          </span>
        </nav>

        <!-- Main Book Header Card -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
          <!-- Book Cover Column -->
          <div class="md:col-span-5 lg:col-span-4 flex flex-col items-center">
            <div class="w-full max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden book-cover-shadow bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80">
              ${book.coverUrl ? `
                <img 
                  id="book-detail-cover"
                  src="${book.coverUrl}" 
                  alt="Cover of ${escapeHTML(book.title)}"
                  class="w-full h-auto aspect-[2/3] object-cover book-spine"
                />
              ` : renderFallbackCover(book)}
            </div>

            <!-- Reading Status & Favorite Actions Under Cover -->
            <div class="w-full max-w-[280px] sm:max-w-[320px] mt-6 flex flex-col gap-2.5">
              ${book.canReadOnline ? `
                <a 
                  href="#/read/${book.id}" 
                  class="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                  ${renderIcon('book-open', 'w-4 h-4')}
                  <span>Read Online in Browser</span>
                </a>
              ` : `
                <div class="p-3 text-center text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 rounded-xl">
                  Browser HTML reading is not available for this record. Use the download formats below.
                </div>
              `}

              <div class="grid grid-cols-2 gap-2">
                <!-- Toggle Favorite Button -->
                <button 
                  id="btn-detail-favorite" 
                  type="button" 
                  class="py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isFav 
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400' 
                      : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }">
                  ${renderIcon('heart', 'w-3.5 h-3.5', isFav ? 'fill-current' : '')}
                  <span id="fav-btn-label">${isFav ? 'Favorited' : 'Favorite'}</span>
                </button>

                <!-- Share Button -->
                <button 
                  id="btn-detail-share" 
                  type="button" 
                  class="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                  ${renderIcon('share-2', 'w-3.5 h-3.5')}
                  <span>Share Book</span>
                </button>
              </div>

              <!-- Personal Reading Status Selector -->
              <div class="mt-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <label for="detail-library-status" class="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  Reading Status in My Library
                </label>
                <select 
                  id="detail-library-status" 
                  class="w-full text-xs py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="" ${!libStatus ? 'selected' : ''}>Not in Library</option>
                  <option value="want_to_read" ${libStatus === 'want_to_read' ? 'selected' : ''}>Want to Read</option>
                  <option value="reading" ${libStatus === 'reading' ? 'selected' : ''}>Currently Reading</option>
                  <option value="finished" ${libStatus === 'finished' ? 'selected' : ''}>Finished</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Metadata & Details Column -->
          <div class="md:col-span-7 lg:col-span-8 flex flex-col space-y-6">
            <!-- Title & Authors -->
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 mb-3">
                ${renderIcon('check', 'w-3 h-3')}
                <span>Public Domain (USA)</span>
              </div>

              <h1 class="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 leading-tight mb-2">
                ${escapeHTML(book.title)}
              </h1>

              <div class="text-base sm:text-lg text-stone-700 dark:text-stone-300 font-serif">
                ${book.authors.length > 0 ? book.authors.map(a => `
                  <div>
                    <span class="font-bold text-stone-900 dark:text-stone-100">${escapeHTML(a.name)}</span>
                    ${a.years ? `<span class="text-xs font-sans text-stone-500 dark:text-stone-400 ml-1.5">(${escapeHTML(a.years)})</span>` : ''}
                  </div>
                `).join('') : '<span class="italic text-stone-500">Author unknown</span>'}
              </div>
            </div>

            <!-- Metadata Highlights Table -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-xs">
              <div>
                <span class="block text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px] font-semibold">Gutenberg ID</span>
                <span class="font-mono font-medium text-stone-900 dark:text-stone-100">#${book.id}</span>
              </div>
              <div>
                <span class="block text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px] font-semibold">Language</span>
                <span class="font-medium text-stone-900 dark:text-stone-100">${escapeHTML(book.languageFormatted)}</span>
              </div>
              <div>
                <span class="block text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px] font-semibold">Total Downloads</span>
                <span class="font-medium text-stone-900 dark:text-stone-100">${escapeHTML(book.downloadCountFormatted)}</span>
              </div>
              <div id="col-first-published">
                <span class="block text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px] font-semibold">First Published</span>
                <span id="val-first-published" class="font-medium text-stone-900 dark:text-stone-100 italic text-stone-400">Loading…</span>
              </div>
            </div>

            <!-- Subjects & Tags -->
            ${book.subjects && book.subjects.length > 0 ? `
              <div class="space-y-2">
                <h3 class="text-xs uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  ${renderIcon('tag', 'w-3.5 h-3.5')}
                  <span>Subjects & Classification</span>
                </h3>
                <div class="flex flex-wrap gap-1.5">
                  ${book.subjects.map(subj => `
                    <a 
                      href="#/explore?topic=${encodeURIComponent(subj)}" 
                      class="px-2.5 py-1 rounded-lg text-xs bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 border border-stone-200 dark:border-stone-700 transition-colors">
                      ${escapeHTML(subj)}
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Bookshelves Tags -->
            ${book.bookshelves && book.bookshelves.length > 0 ? `
              <div class="space-y-2">
                <h3 class="text-xs uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  ${renderIcon('layers', 'w-3.5 h-3.5')}
                  <span>Project Gutenberg Bookshelves</span>
                </h3>
                <div class="flex flex-wrap gap-1.5">
                  ${book.bookshelves.map(shelf => `
                    <a 
                      href="#/explore?topic=${encodeURIComponent(shelf)}" 
                      class="px-2.5 py-1 rounded-lg text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors">
                      ${escapeHTML(shelf)}
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Download Formats Section -->
            <div class="space-y-3 pt-2">
              <h3 class="text-xs uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                ${renderIcon('download', 'w-3.5 h-3.5')}
                <span>Authorized Download Formats</span>
              </h3>

              ${downloadLinks.length > 0 ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  ${downloadLinks.map(dl => `
                    <a 
                      href="${dl.url}" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-600/50 dark:hover:border-amber-500/50 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-amber-500/5 dark:hover:bg-amber-400/5 transition-all flex items-center justify-between group">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                          ${renderIcon(dl.icon, 'w-4 h-4')}
                        </div>
                        <div>
                          <div class="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                            ${escapeHTML(dl.label)}
                          </div>
                          <div class="text-[11px] text-stone-500 dark:text-stone-400">
                            ${escapeHTML(dl.desc)}
                          </div>
                        </div>
                      </div>
                      ${renderIcon('external-link', 'w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-colors')}
                    </a>
                  `).join('')}
                </div>
              ` : `
                <p class="text-xs text-stone-500 italic">No direct downloadable files detected for this catalog ID.</p>
              `}
            </div>

            <!-- Source & Legal Note -->
            <div class="pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 leading-relaxed space-y-1.5">
              <p>
                <strong>Source:</strong> Digitized and proofread by 
                <a href="${book.gutenbergUrl}" target="_blank" rel="noopener noreferrer" class="underline hover:text-stone-900 dark:hover:text-stone-100">
                  Project Gutenberg (EBook #${book.id})
                </a> with supplementary catalog metadata via Open Library.
              </p>
              <p>
                This work is in the public domain in the United States. OpenShelf is an independent discovery platform and does not claim ownership or copyright of any digital book edition.
              </p>
            </div>
          </div>
        </div>

        <!-- Similar / Related Books Section -->
        <section class="space-y-6 pt-4">
          <div class="border-b border-stone-200 dark:border-stone-800 pb-4">
            <h2 class="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Related Literary Works
            </h2>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Other books sharing related themes and subjects from Project Gutenberg.
            </p>
          </div>

          <div id="detail-related-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div class="col-span-full py-8 text-center text-xs text-stone-400 animate-pulse">
              Finding related literature…
            </div>
          </div>
        </section>
      </div>
    `;

    initIcons(root);

    // Setup cover fallback
    const coverImg = root.querySelector('#book-detail-cover');
    if (coverImg) {
      setupImageFallback(coverImg, book);
    }

    // Favorite Button Handler
    const favBtn = root.querySelector('#btn-detail-favorite');
    const favLabel = root.querySelector('#fav-btn-label');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        const nowFav = storage.toggleFavorite(book);
        showToast(
          nowFav ? `Added "${book.title}" to Favorites` : `Removed "${book.title}" from Favorites`,
          nowFav ? 'success' : 'info'
        );

        if (nowFav) {
          favBtn.classList.remove('border-stone-300', 'dark:border-stone-700', 'text-stone-700', 'dark:text-stone-300');
          favBtn.classList.add('bg-rose-50', 'dark:bg-rose-950/60', 'border-rose-300', 'dark:border-rose-800', 'text-rose-700', 'dark:text-rose-400');
          favBtn.innerHTML = `${renderIcon('heart', 'w-3.5 h-3.5', 'fill-current')}<span>Favorited</span>`;
        } else {
          favBtn.classList.add('border-stone-300', 'dark:border-stone-700', 'text-stone-700', 'dark:text-stone-300');
          favBtn.classList.remove('bg-rose-50', 'dark:bg-rose-950/60', 'border-rose-300', 'dark:border-rose-800', 'text-rose-700', 'dark:text-rose-400');
          favBtn.innerHTML = `${renderIcon('heart', 'w-3.5 h-3.5')}<span>Favorite</span>`;
        }
        initIcons(favBtn);
      });
    }

    // Share Button Handler
    const shareBtn = root.querySelector('#btn-detail-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const shareData = {
          title: book.title,
          text: `Check out "${book.title}" by ${book.authorNames} on OpenShelf`,
          url: window.location.href
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (e) {}
        } else if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'success');
          } catch (e) {
            showToast('Could not copy link.', 'error');
          }
        }
      });
    }

    // Library Status Select Handler
    const libSelect = root.querySelector('#detail-library-status');
    if (libSelect) {
      libSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) {
          storage.removeLibraryItem(book.id);
          showToast(`Removed "${book.title}" from library`, 'info');
        } else {
          storage.setLibraryItem(book, val);
          const labels = { want_to_read: 'Want to Read', reading: 'Currently Reading', finished: 'Finished' };
          showToast(`Marked as "${labels[val]}" in your Library`, 'success');
        }
      });
    }

    // Fetch related books by subject
    const relatedTopic = book.subjects && book.subjects[0] ? book.subjects[0] : (book.bookshelves && book.bookshelves[0] ? book.bookshelves[0] : 'fiction');
    try {
      const relData = await getBooks({ topic: relatedTopic, page: 1 });
      const relatedGrid = root.querySelector('#detail-related-grid');
      if (relatedGrid) {
        // Exclude current book
        const filtered = relData.books.filter(b => Number(b.id) !== Number(book.id)).slice(0, 4);
        if (filtered.length > 0) {
          relatedGrid.innerHTML = filtered.map(renderBookCard).join('');
          attachBookCardListeners(relatedGrid, filtered);
        } else {
          relatedGrid.innerHTML = `
            <div class="col-span-full py-6 text-center text-xs text-stone-500">
              No additional related titles found.
            </div>
          `;
        }
      }
    } catch (e) {
      console.warn('Could not load related books:', e);
    }

    // Fetch supplementary metadata from Open Library in background
    getSupplementaryMetadata(book.title, book.authorNames).then(extra => {
      const yearVal = root.querySelector('#val-first-published');
      if (yearVal) {
        if (extra && extra.publishYear) {
          yearVal.textContent = String(extra.publishYear);
          yearVal.classList.remove('italic', 'text-stone-400');
        } else {
          yearVal.textContent = 'Public Domain';
          yearVal.classList.remove('italic', 'text-stone-400');
        }
      }
    }).catch(() => {
      const yearVal = root.querySelector('#val-first-published');
      if (yearVal) {
        yearVal.textContent = 'Public Domain';
        yearVal.classList.remove('italic', 'text-stone-400');
      }
    });

  } catch (err) {
    console.error('Book details error:', err);
    root.innerHTML = renderErrorState({
      title: 'Book Unavailable',
      message: err.message || 'We could not retrieve details for this book from Project Gutenberg.',
      retryActionId: 'btn-retry-details'
    });
    initIcons(root);
    const retry = root.querySelector('#btn-retry-details');
    if (retry) {
      retry.addEventListener('click', () => renderBookDetails(root, bookId));
    }
  }
}

