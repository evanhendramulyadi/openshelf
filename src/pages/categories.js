import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';
import { renderBookCard, attachBookCardListeners } from '../components/book-card.js';
import { renderBookSkeletons, renderErrorState } from '../components/loading-state.js';
import { CATEGORIES, getBooks, searchCuratedCatalog } from '../services/book-service.js';

/**
 * Render Categories Discovery Page
 * @param {HTMLElement} root 
 * @param {Object} queryParams 
 */
export async function renderCategories(root, queryParams = {}) {
  if (!root) return;

  const selectedCategoryId = queryParams.cat || CATEGORIES[0].id;
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];

  // 0ms instant local match for current category
  const instantCat = searchCuratedCatalog({ topic: currentCategory.query });
  const hasInstant = instantCat.books.length > 0;
  const instant8 = instantCat.books.slice(0, 8);

  root.innerHTML = `
    <div class="space-y-12 pb-16">
      <!-- Header -->
      <div class="border-b border-stone-200 dark:border-stone-800 pb-6">
        <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
          Subject Directory
        </h1>
        <p class="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          Explore books organized by Project Gutenberg bookshelves and Library of Congress subjects. 
          Select any subject below to preview notable works or browse the full collection.
        </p>
      </div>

      <!-- Categories Grid Selector -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        ${CATEGORIES.map(cat => {
          const isSelected = cat.id === currentCategory.id;
          return `
            <button 
              type="button"
              class="cat-selector-btn group text-left p-4 rounded-2xl border transition-all ${
                isSelected 
                  ? 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-600/40 dark:border-amber-400/40 ring-1 ring-amber-600/30 dark:ring-amber-400/30' 
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-sm hover:shadow'
              }"
              data-cat-id="${cat.id}">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 rounded-xl ${
                  isSelected 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-600/10 group-hover:text-amber-700'
                } flex items-center justify-center flex-shrink-0 transition-colors">
                  ${renderIcon(cat.icon, 'w-4 h-4')}
                </div>
                <h3 class="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 leading-tight">
                  ${escapeHTML(cat.name)}
                </h3>
              </div>
              <p class="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                ${escapeHTML(cat.description)}
              </p>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Selected Category Spotlight Section -->
      <section class="space-y-6 pt-4">
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
              ${renderIcon(currentCategory.icon, 'w-4 h-4')}
              <span>Selected Subject Collection</span>
            </div>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              ${escapeHTML(currentCategory.name)}
            </h2>
            <p class="text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
              ${escapeHTML(currentCategory.description)}
            </p>
          </div>

          <a 
            href="#/explore?topic=${encodeURIComponent(currentCategory.query)}" 
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 text-sm font-semibold transition-all shadow-sm flex-shrink-0">
            <span>Explore All in ${escapeHTML(currentCategory.name)}</span>
            ${renderIcon('arrow-right', 'w-4 h-4')}
          </a>
        </div>

        <!-- Books Grid for Selected Category -->
        <div id="category-books-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          ${hasInstant ? instant8.map(renderBookCard).join('') : renderBookSkeletons(8)}
        </div>
      </section>
    </div>
  `;

  initIcons(root);

  const grid = root.querySelector('#category-books-grid');
  if (hasInstant && grid) {
    attachBookCardListeners(grid, instant8);
  }

  // Setup click listeners for category buttons
  root.querySelectorAll('.cat-selector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-cat-id');
      if (catId) {
        window.location.hash = `#/categories?cat=${catId}`;
      }
    });
  });

  // Fetch real books for the current category in background
  try {
    const data = await getBooks({ topic: currentCategory.query, page: 1 });
    if (grid && data.books && data.books.length > 0) {
      const top8 = data.books.slice(0, 8);
      grid.innerHTML = top8.map(renderBookCard).join('');
      attachBookCardListeners(grid, top8);
    }
  } catch (err) {
    console.warn('Category background load notice:', err);
    if (!hasInstant && grid) {
      grid.innerHTML = renderErrorState({
        title: 'Could Not Load Category Books',
        message: 'Could not connect to the Gutendex service. Please check your connection.',
        retryActionId: 'btn-retry-cat'
      });
      initIcons(grid);
      const retryBtn = grid.querySelector('#btn-retry-cat');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => renderCategories(root, queryParams));
      }
    }
  }
}

