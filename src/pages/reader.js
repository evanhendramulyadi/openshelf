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

    // Get saved reading progress
    const libItem = storage.getLibraryItem(book.id);
    let currentProgress = libItem ? (libItem.progressPercent || 0) : 0;

    // Reading URL: always resolve to direct HTTPS cache URL to avoid Gutenberg's insecure 302 redirect to http://
    let readUrl = book.formats?.html;
    if (book.id) {
      readUrl = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}-images.html`;
    } else if (readUrl) {
      const match = readUrl.match(/gutenberg\.org\/ebooks\/(\d+)\.html\.images/);
      if (match) {
        readUrl = `https://www.gutenberg.org/cache/epub/${match[1]}/pg${match[1]}-images.html`;
      } else {
        readUrl = readUrl.replace(/^http:\/\//i, 'https://');
      }
    } else {
      readUrl = book.formats?.txt || book.readUrl;
    }

    root.innerHTML = `
      <div id="reader-wrapper" class="flex flex-col h-[calc(100vh-4.5rem)] -my-6 -mx-4 sm:-mx-6 lg:-mx-8 transition-colors duration-200">
        <!-- Top Thin Accent Progress Bar -->
        <div class="w-full h-1 bg-stone-300/40 dark:bg-stone-700/40 overflow-hidden relative z-30">
          <div id="reader-top-progress-bar" class="h-full bg-amber-600 transition-all duration-300" style="width: ${currentProgress}%"></div>
        </div>

        <!-- Reader Navigation & Control Bar -->
        <header class="reader-toolbar flex-shrink-0 px-3 sm:px-6 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm flex items-center justify-between gap-3 z-20 select-none transition-colors">
          <!-- Left: Return to details & Book Title -->
          <div class="flex items-center gap-2 sm:gap-4 min-w-0">
            <a 
              href="#/book/${book.id}" 
              title="Return to Book Details"
              class="reader-nav-back flex-shrink-0 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-xs">
              ${renderIcon('arrow-left', 'w-3.5 h-3.5')}
              <span class="hidden sm:inline">Details</span>
            </a>

            <div class="min-w-0">
              <h2 class="font-serif font-bold text-xs sm:text-sm truncate leading-snug">
                ${escapeHTML(book.title)}
              </h2>
              <p class="text-[11px] font-medium text-stone-600 dark:text-stone-300 truncate leading-none mt-0.5">
                ${escapeHTML(book.authorNames)}
              </p>
            </div>
          </div>

          <!-- Right: Progress Control & Actions -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <!-- Reading Progress Widget with Dropdown Modal -->
            <div class="relative">
              <button 
                id="btn-toggle-progress-panel" 
                type="button" 
                class="reader-progress-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all shadow-xs"
                title="Set reading progress">
                ${renderIcon('bookmark', 'w-3.5 h-3.5 text-amber-600')}
                <span id="reader-progress-label">${currentProgress}% Read</span>
                ${renderIcon('chevron-down', 'w-3 h-3 opacity-80')}
              </button>

              <!-- Progress Popover Panel -->
              <div 
                id="reader-progress-panel" 
                class="hidden absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div class="flex items-center justify-between mb-3 border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span class="font-serif font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-100">
                    Reading Progress
                  </span>
                  <span id="popover-progress-val" class="font-bold text-sm text-amber-700 dark:text-amber-400">
                    ${currentProgress}%
                  </span>
                </div>

                <!-- Range Slider -->
                <div class="space-y-2 mb-4">
                  <input 
                    type="range" 
                    id="reader-range-slider" 
                    min="0" 
                    max="100" 
                    step="5" 
                    value="${currentProgress}" 
                    class="w-full accent-amber-600 cursor-pointer"
                  />
                  <div class="flex justify-between text-[10px] text-stone-600 dark:text-stone-200 font-semibold">
                    <span>0% (Start)</span>
                    <span>50% (Halfway)</span>
                    <span>100% (Finished)</span>
                  </div>
                </div>

                <!-- Quick Presets -->
                <div class="grid grid-cols-4 gap-1.5 mb-3">
                  <button type="button" data-set-percent="0" class="btn-quick-percent px-2 py-1 text-[11px] rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold transition-colors">0%</button>
                  <button type="button" data-set-percent="25" class="btn-quick-percent px-2 py-1 text-[11px] rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold transition-colors">25%</button>
                  <button type="button" data-set-percent="50" class="btn-quick-percent px-2 py-1 text-[11px] rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold transition-colors">50%</button>
                  <button type="button" data-set-percent="75" class="btn-quick-percent px-2 py-1 text-[11px] rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold transition-colors">75%</button>
                </div>

                <button 
                  type="button" 
                  data-set-percent="100" 
                  class="btn-quick-percent w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs mb-3">
                  ${renderIcon('check', 'w-3.5 h-3.5')}
                  <span>Mark as Finished (100%)</span>
                </button>

                <p class="text-[10px] text-stone-600 dark:text-stone-300 text-center font-medium">
                  Progress is saved automatically to your Personal Library.
                </p>
              </div>
            </div>

            <!-- External Open in New Window Button -->
            <a 
              href="${readUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Open raw book in new tab"
              class="reader-icon-btn p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-xs">
              ${renderIcon('external-link', 'w-4 h-4')}
            </a>

            <!-- Fullscreen Toggle -->
            <button 
              id="btn-reader-fullscreen" 
              type="button" 
              title="Toggle Fullscreen"
              class="reader-icon-btn p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-xs">
              ${renderIcon('maximize-2', 'w-4 h-4')}
            </button>
          </div>
        </header>

        <!-- Reading Frame Viewport -->
        <div id="reader-viewport" class="relative flex-grow w-full overflow-hidden flex flex-col items-center justify-center transition-colors">
          <!-- Frame Loading Spinner -->
          <div id="reader-frame-loading" class="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/90 dark:bg-stone-950/90 z-10 transition-opacity duration-300">
            <div class="w-8 h-8 border-3 border-stone-300 border-t-amber-600 rounded-full animate-spin mb-3"></div>
            <p class="text-xs text-stone-600 dark:text-stone-300 font-medium">Connecting to Project Gutenberg reader stream…</p>
          </div>

          <!-- Embedded Reader Iframe -->
          <iframe 
            id="reader-iframe"
            src="${readUrl}" 
            title="Reading ${escapeHTML(book.title)}"
            class="w-full h-full border-0 transition-all duration-300"
            loading="eager"
            referrerpolicy="no-referrer"
          ></iframe>

          <!-- Fallback Alert Banner (displayed if browser or extension blocks embedded frames) -->
          <div id="reader-frame-fallback" class="hidden absolute bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 max-w-md w-full p-3 rounded-2xl bg-stone-900/90 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs">
            <span class="truncate">Need full window or external reader?</span>
            <a 
              href="${readUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors flex-shrink-0 flex items-center gap-1 shadow-sm">
              <span>Open in New Tab</span>
              ${renderIcon('external-link', 'w-3.5 h-3.5')}
            </a>
          </div>
        </div>
      </div>
    `;

    initIcons(root);

    const wrapper = root.querySelector('#reader-wrapper');
    const iframe = root.querySelector('#reader-iframe');
    const loadingOverlay = root.querySelector('#reader-frame-loading');
    const topProgressBar = root.querySelector('#reader-top-progress-bar');
    const progressLabel = root.querySelector('#reader-progress-label');
    const progressPanel = root.querySelector('#reader-progress-panel');
    const progressBtn = root.querySelector('#btn-toggle-progress-panel');
    const rangeSlider = root.querySelector('#reader-range-slider');
    const popoverVal = root.querySelector('#popover-progress-val');

    // Attempt to inject high-contrast typography directly into iframe if accessible
    const injectIframeStyles = () => {
      try {
        const isDark = document.documentElement.classList.contains('dark');
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          let styleTag = doc.getElementById('openshelf-injected-theme');
          if (!styleTag) {
            styleTag = doc.createElement('style');
            styleTag.id = 'openshelf-injected-theme';
            (doc.head || doc.body).appendChild(styleTag);
          }
          if (isDark) {
            styleTag.textContent = `
              body, p, div, span, h1, h2, h3, h4, h5, h6, pre, table, td, th {
                color: #ffffff !important;
              }
              body { background-color: #121214 !important; }
            `;
          } else {
            styleTag.textContent = `
              body, p, div, span, h1, h2, h3, h4, h5, h6, pre, table, td, th {
                color: #000000 !important;
              }
              body { background-color: #ffffff !important; }
            `;
          }
        }
      } catch (e) {
        // Cross-origin iframe is styled via CSS filter on the iframe element
      }
    };

    // Auto sync when global website theme toggles
    const onGlobalThemeChange = () => {
      injectIframeStyles();
    };
    window.addEventListener('openshelf:theme-changed', onGlobalThemeChange);

    // Handle Iframe Load
    const fallbackBanner = root.querySelector('#reader-frame-fallback');
    if (iframe && loadingOverlay) {
      iframe.addEventListener('load', () => {
        loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
          if (loadingOverlay.parentNode) loadingOverlay.remove();
        }, 300);
        injectIframeStyles();
      });

      iframe.addEventListener('error', () => {
        if (loadingOverlay) loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
        if (fallbackBanner) fallbackBanner.classList.remove('hidden');
      });

      setTimeout(() => {
        if (loadingOverlay && loadingOverlay.parentNode) {
          loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
        injectIframeStyles();
      }, 2500);
    }

    // Toggle Progress Popover
    if (progressBtn && progressPanel) {
      progressBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        progressPanel.classList.toggle('hidden');
      });

      // Close popover when clicked outside
      document.addEventListener('click', (e) => {
        if (!progressPanel.contains(e.target) && !progressBtn.contains(e.target)) {
          progressPanel.classList.add('hidden');
        }
      });
    }

    // Save and update progress
    const saveProgress = (val) => {
      currentProgress = Math.min(100, Math.max(0, Math.round(Number(val) || 0)));
      
      // Auto-save to library storage
      storage.updateReadingProgress(book, currentProgress);

      // Update UI elements
      if (topProgressBar) topProgressBar.style.width = `${currentProgress}%`;
      if (progressLabel) progressLabel.textContent = `${currentProgress}% Read`;
      if (popoverVal) popoverVal.textContent = `${currentProgress}%`;
      if (rangeSlider) rangeSlider.value = currentProgress;

      if (currentProgress === 100) {
        showToast(`Congratulations! Marked "${book.title}" as Finished in your Library.`, 'success');
      } else {
        showToast(`Updated reading progress to ${currentProgress}%.`, 'info');
      }
    };

    // Range slider input listener (live update)
    if (rangeSlider) {
      rangeSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (popoverVal) popoverVal.textContent = `${val}%`;
        if (topProgressBar) topProgressBar.style.width = `${val}%`;
        if (progressLabel) progressLabel.textContent = `${val}% Read`;
      });

      rangeSlider.addEventListener('change', (e) => {
        saveProgress(e.target.value);
      });
    }

    // Quick percentage preset buttons
    root.querySelectorAll('.btn-quick-percent').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPercent = Number(btn.getAttribute('data-set-percent'));
        saveProgress(targetPercent);
        if (progressPanel) progressPanel.classList.add('hidden');
      });
    });

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
