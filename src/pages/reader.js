import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';
import { getBookById } from '../services/book-service.js';
import * as storage from '../utils/storage.js';
import { renderLoadingSpinner, renderErrorState } from '../components/loading-state.js';
import { showToast } from '../components/toast.js';

/**
 * Render Reader View
 * @param {HTMLElement} root 
 * @param {string|number} bookId 
 */
export async function renderReader(root, bookId) {
  if (!root) return;

  root.innerHTML = `
    <div class="py-16">
      ${renderLoadingSpinner('Preparing reading environment…')}
    </div>
  `;
  initIcons(root);

  try {
    const book = await getBookById(bookId);
    if (!book) throw new Error('Book not found');

    if (!book.canReadOnline) {
      root.innerHTML = `
        <div class="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm">
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            ${renderIcon('book-open', 'w-6 h-6')}
          </div>
          <h2 class="font-serif text-xl font-bold mb-2">No Online HTML Format</h2>
          <p class="text-sm text-stone-600 dark:text-stone-400 mb-6">
            Project Gutenberg does not provide an HTML web edition for "${escapeHTML(book.title)}". 
            You can still download this book as EPUB, Kindle, or Plain Text.
          </p>
          <a href="#/book/${book.id}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-sm font-semibold">
            ${renderIcon('arrow-left', 'w-4 h-4')}
            <span>Back to Book Details & Downloads</span>
          </a>
        </div>
      `;
      initIcons(root);
      return;
    }

    // Get current reader preferences & saved progress
    const prefs = storage.getReaderPrefs();
    const libItem = storage.getLibraryItem(book.id);
    const initialProgress = libItem ? (libItem.progressPercent || 0) : 0;

    // Reading URL: prefer HTML format, otherwise Plain Text
    const readUrl = book.formats.html || book.formats.txt;

    root.innerHTML = `
      <div id="reader-wrapper" class="flex flex-col h-[calc(100vh-5rem)] -my-6 -mx-4 sm:-mx-6 lg:-mx-8 transition-colors duration-200 ${
        prefs.theme === 'sepia' 
          ? 'reader-theme-sepia' 
          : prefs.theme === 'dark' 
          ? 'reader-theme-dark' 
          : prefs.theme === 'oled' 
          ? 'reader-theme-oled' 
          : 'reader-theme-day'
      }">
        <!-- Reader Navigation & Control Bar -->
        <header class="flex-shrink-0 px-4 py-3 border-b border-stone-200/60 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md flex items-center justify-between gap-4 z-20 select-none">
          <!-- Left: Return to details -->
          <div class="flex items-center gap-3 min-w-0">
            <a 
              href="#/book/${book.id}" 
              title="Return to Book Details"
              class="flex-shrink-0 p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs font-medium">
              ${renderIcon('arrow-left', 'w-4 h-4')}
              <span class="hidden sm:inline">Details</span>
            </a>

            <div class="min-w-0">
              <h2 class="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                ${escapeHTML(book.title)}
              </h2>
              <p class="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                ${escapeHTML(book.authorNames)}
              </p>
            </div>
          </div>

          <!-- Center/Right: Reader Controls -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <!-- Theme Selector -->
            <div class="flex items-center p-1 rounded-xl bg-stone-200/60 dark:bg-stone-800 border border-stone-300/50 dark:border-stone-700/50 text-xs">
              <button 
                type="button" 
                data-theme="day" 
                class="reader-theme-btn px-2.5 py-1 rounded-lg font-medium transition-colors ${prefs.theme === 'day' ? 'bg-white dark:bg-stone-700 shadow-xs' : 'opacity-70 hover:opacity-100'}"
                title="Light Theme">
                Day
              </button>
              <button 
                type="button" 
                data-theme="sepia" 
                class="reader-theme-btn px-2.5 py-1 rounded-lg font-medium transition-colors ${prefs.theme === 'sepia' ? 'bg-[#f6edd9] text-[#3b2f20] font-bold shadow-xs' : 'opacity-70 hover:opacity-100'}"
                title="Sepia Warm Theme">
                Sepia
              </button>
              <button 
                type="button" 
                data-theme="dark" 
                class="reader-theme-btn px-2.5 py-1 rounded-lg font-medium transition-colors ${prefs.theme === 'dark' ? 'bg-stone-900 text-stone-100 shadow-xs' : 'opacity-70 hover:opacity-100'}"
                title="Night Theme">
                Night
              </button>
            </div>

            <!-- Reading Progress Dropdown / Logger -->
            <div class="relative flex items-center gap-1.5 text-xs">
              <label for="reader-progress-input" class="hidden md:inline text-stone-500 dark:text-stone-400">
                Progress:
              </label>
              <select 
                id="reader-progress-input" 
                class="py-1 px-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold focus:outline-none">
                <option value="0" ${initialProgress === 0 ? 'selected' : ''}>0% (Started)</option>
                <option value="25" ${initialProgress === 25 ? 'selected' : ''}>25%</option>
                <option value="50" ${initialProgress === 50 ? 'selected' : ''}>50% (Halfway)</option>
                <option value="75" ${initialProgress === 75 ? 'selected' : ''}>75%</option>
                <option value="100" ${initialProgress === 100 ? 'selected' : ''}>100% (Finished)</option>
              </select>
            </div>

            <!-- External Open in New Window Button -->
            <a 
              href="${readUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Open full page in external tab"
              class="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors">
              ${renderIcon('external-link', 'w-4 h-4')}
            </a>

            <!-- Fullscreen Toggle -->
            <button 
              id="btn-reader-fullscreen" 
              type="button" 
              title="Toggle Fullscreen"
              class="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors">
              ${renderIcon('maximize-2', 'w-4 h-4')}
            </button>
          </div>
        </header>

        <!-- Reading Frame Viewport -->
        <div class="relative flex-grow w-full overflow-hidden flex flex-col items-center justify-center">
          <!-- Frame Loading Spinner -->
          <div id="reader-frame-loading" class="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/80 dark:bg-stone-950/80 z-10 transition-opacity duration-300">
            <div class="w-8 h-8 border-3 border-stone-300 border-t-amber-600 rounded-full animate-spin mb-3"></div>
            <p class="text-xs text-stone-500 font-medium">Connecting to Project Gutenberg book stream…</p>
          </div>

          <!-- Embedded Reader Iframe -->
          <iframe 
            id="reader-iframe"
            src="${readUrl}" 
            title="Reading ${escapeHTML(book.title)}"
            class="w-full h-full border-0 bg-white"
            loading="eager"
            referrerpolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        </div>
      </div>
    `;

    initIcons(root);

    const wrapper = root.querySelector('#reader-wrapper');
    const iframe = root.querySelector('#reader-iframe');
    const loadingOverlay = root.querySelector('#reader-frame-loading');

    // Handle Iframe Load
    if (iframe && loadingOverlay) {
      iframe.addEventListener('load', () => {
        loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => loadingOverlay.remove(), 400);
      });
      // Fallback timeout in case iframe onload doesn't fire
      setTimeout(() => {
        if (loadingOverlay) {
          loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
      }, 3500);
    }

    // Theme Switcher Buttons
    root.querySelectorAll('.reader-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme');
        storage.setReaderPrefs({ theme: selectedTheme });
        
        wrapper.className = `flex flex-col h-[calc(100vh-5rem)] -my-6 -mx-4 sm:-mx-6 lg:-mx-8 transition-colors duration-200 ${
          selectedTheme === 'sepia' 
            ? 'reader-theme-sepia' 
            : selectedTheme === 'dark' 
            ? 'reader-theme-dark' 
            : selectedTheme === 'oled' 
            ? 'reader-theme-oled' 
            : 'reader-theme-day'
        }`;

        // Re-render reader controls active state
        root.querySelectorAll('.reader-theme-btn').forEach(b => {
          const t = b.getAttribute('data-theme');
          if (t === selectedTheme) {
            b.classList.remove('opacity-70');
            b.classList.add('shadow-xs', 'font-bold');
          } else {
            b.classList.add('opacity-70');
            b.classList.remove('shadow-xs', 'font-bold');
          }
        });
      });
    });

    // Progress Logger
    const progressSelect = root.querySelector('#reader-progress-input');
    if (progressSelect) {
      progressSelect.addEventListener('change', (e) => {
        const percent = Number(e.target.value);
        storage.updateReadingProgress(book.id, percent);
        if (percent === 100) {
          showToast(`Congratulations! Marked "${book.title}" as Finished.`, 'success');
        } else {
          showToast(`Saved reading progress: ${percent}%`, 'info');
        }
      });
    }

    // Fullscreen Toggle
    const fsBtn = root.querySelector('#btn-reader-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          wrapper.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
          });
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

  } catch (err) {
    console.error('Reader error:', err);
    root.innerHTML = renderErrorState({
      title: 'Unable to Load Book Reader',
      message: err.message || 'Could not load reader view for this book.',
      retryActionId: 'btn-retry-reader'
    });
    initIcons(root);
    const retry = root.querySelector('#btn-retry-reader');
    if (retry) {
      retry.addEventListener('click', () => renderReader(root, bookId));
    }
  }
}

