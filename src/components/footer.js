import { renderIcon, initIcons } from '../utils/icons.js';
import { scrollToTop } from '../utils/dom.js';

/**
 * Render footer into container
 * @param {HTMLElement} container 
 */
export function renderFooter(container) {
  if (!container) return;

  container.innerHTML = `
    <footer class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <!-- Brand / About Column -->
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <img 
              src="/images/logo-openshelf.png" 
              alt="OpenShelf Logo" 
              class="w-8 h-8 object-contain rounded-[20%]" 
            />
            <div class="flex flex-col">
              <span class="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-none">
                OpenShelf
              </span>
              <span class="text-[10px] tracking-wider font-sans text-stone-500 dark:text-stone-400 mt-0.5">
                Discover More. Read More.
              </span>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md leading-relaxed">
            OpenShelf is a modern digital platform to find, read online, and download free e-books legally accessible from public-domain sources. Catalog metadata and digital editions are powered by the Gutendex API and Project Gutenberg.
          </p>

          <div class="pt-2 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
            <span class="inline-flex items-center gap-1">
              ${renderIcon('check', 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400')}
              No Registration
            </span>
            <span class="inline-flex items-center gap-1">
              ${renderIcon('check', 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400')}
              Legally Accessible
            </span>
            <span class="inline-flex items-center gap-1">
              ${renderIcon('check', 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400')}
              Zero Trackers
            </span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h4 class="text-xs uppercase font-semibold tracking-wider text-stone-900 dark:text-stone-100">
            Catalog Discovery
          </h4>
          <ul class="space-y-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            <li><a href="#/explore" class="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">Search All Titles</a></li>
            <li><a href="#/categories" class="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">Subject Directory</a></li>
            <li><a href="#/explore?sort=descending" class="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">Recent Additions</a></li>
            <li><a href="#/library" class="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">Personal Reading List</a></li>
          </ul>
        </div>

        <!-- Attribution & Sources -->
        <div class="space-y-3">
          <h4 class="text-xs uppercase font-semibold tracking-wider text-stone-900 dark:text-stone-100">
            Data & Sources
          </h4>
          <ul class="space-y-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            <li>
              <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                <span>Project Gutenberg</span>
                ${renderIcon('external-link', 'w-3 h-3 opacity-70')}
              </a>
            </li>
            <li>
              <a href="https://gutendex.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                <span>Gutendex API</span>
                ${renderIcon('external-link', 'w-3 h-3 opacity-70')}
              </a>
            </li>
            <li><a href="#/about" class="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">Public Domain FAQ</a></li>
          </ul>
        </div>
      </div>

      <!-- Legal & Exact Copyright Notice Bottom Bar -->
      <div class="pt-8 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
        <div class="space-y-1 text-center sm:text-left">
          <p class="font-medium text-stone-700 dark:text-stone-300">
            © 2026–Present Evan Hendra Mulyadi. All Rights Reserved.
          </p>
          <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">
            Website design, original code, layout, and branding are protected by copyright. E-book contents, digital texts, and historical metadata belong to their respective public-domain or original author licenses via Project Gutenberg.
          </p>
        </div>

        <button 
          id="btn-footer-back-to-top" 
          type="button" 
          class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors">
          <span>Back to top</span>
          ${renderIcon('arrow-right', 'w-3 h-3 -rotate-90')}
        </button>
      </div>
    </footer>
  `;

  initIcons(container);

  const topBtn = container.querySelector('#btn-footer-back-to-top');
  if (topBtn) {
    topBtn.addEventListener('click', () => scrollToTop(true));
  }
}
