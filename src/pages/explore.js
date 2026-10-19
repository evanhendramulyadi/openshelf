import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML, scrollToTop } from '../utils/dom.js';
import { renderSearchBar, attachSearchListeners } from '../components/search-bar.js';
import { renderBookCard, attachBookCardListeners } from '../components/book-card.js';
import { renderBookSkeletons, renderErrorState, renderEmptyState } from '../components/loading-state.js';
import { getBooks, CATEGORIES } from '../services/book-service.js';

/**
 * Render Explore Page
 * @param {HTMLElement} root 
 * @param {Object} queryParams - parsed URL query params
 */
export async function renderExplore(root, queryParams = {}) {
  if (!root) return;

  const currentSearch = queryParams.search || '';
  const currentTopic = queryParams.topic || '';
  const currentLang = queryParams.languages || '';
  const currentSort = queryParams.sort || 'popular';
  const currentPage = Number(queryParams.page) || 1;

  // Language options
  const LANGUAGES = [
    { code: '', label: 'All Languages' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'es', label: 'Spanish' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'nl', label: 'Dutch' },
    { code: 'ru', label: 'Russian' },
    { code: 'zh', label: 'Chinese' },
    { code: 'la', label: 'Latin' },
    { code: 'el', label: 'Greek' }
  ];

  // Sort options supported by Gutendex
  const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular (Downloads)' },
    { value: 'descending', label: 'Newest Catalog Additions' },
    { value: 'ascending', label: 'Oldest Catalog IDs' }
  ];

  root.innerHTML = `
    <div class="space-y-8 pb-16">
      <!-- Page Header -->
      <div class="border-b border-stone-200 dark:border-stone-800 pb-6">
        <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
          Explore Books
        </h1>
        <p class="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl">
          Browse through the complete Project Gutenberg digital collection. Search by title, author, or filter across subjects.
        </p>
      </div>

      <!-- Search & Filters Container -->
      <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
        <!-- Main Search Bar -->
        ${renderSearchBar({
          value: currentSearch,
          placeholder: 'Search by title, author name, or keyword…',
          size: 'md'
        })}

        <!-- Filter Controls Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <!-- Subject / Category Select -->
          <div class="flex flex-col gap-1">
            <label for="filter-topic" class="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Subject
            </label>
            <select 
              id="filter-topic" 
              class="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/40 focus:outline-none">
              <option value="">All Subjects</option>
              ${CATEGORIES.map(cat => `
                <option value="${escapeHTML(cat.query)}" ${currentTopic.toLowerCase() === cat.query.toLowerCase() ? 'selected' : ''}>
                  ${escapeHTML(cat.name)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Language Select -->
          <div class="flex flex-col gap-1">
            <label for="filter-language" class="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Language
            </label>
            <select 
              id="filter-language" 
              class="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/40 focus:outline-none">
              ${LANGUAGES.map(lang => `
                <option value="${lang.code}" ${currentLang === lang.code ? 'selected' : ''}>
                  ${escapeHTML(lang.label)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Sort Select -->
          <div class="flex flex-col gap-1">
            <label for="filter-sort" class="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Sort By
            </label>
            <select 
              id="filter-sort" 
              class="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/40 focus:outline-none">
              ${SORT_OPTIONS.map(opt => `
                <option value="${opt.value}" ${currentSort === opt.value ? 'selected' : ''}>
                  ${escapeHTML(opt.label)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Reset / Filter Actions -->
          <div class="flex flex-col justify-end">
            <button 
              id="btn-reset-filters" 
              type="button" 
              class="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
              ${renderIcon('rotate-ccw', 'w-3.5 h-3.5')}
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Results Header & Counter -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" id="explore-results-header">
        <div class="text-sm text-stone-600 dark:text-stone-400">
          <span id="results-count-text">Searching Gutenberg catalog…</span>
        </div>
      </div>

      <!-- Books Grid Container -->
      <div id="explore-books-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        ${renderBookSkeletons(12)}
      </div>

      <!-- Pagination Container -->
      <div id="explore-pagination-container" class="pt-8 border-t border-stone-200 dark:border-stone-800 flex items-center justify-center"></div>
    </div>
  `;

  initIcons(root);

  // Helper to update route parameters and reload
  const navigateWithFilters = (updates = {}) => {
    const nextParams = new URLSearchParams();
    
    const search = updates.search !== undefined ? updates.search : currentSearch;
    const topic = updates.topic !== undefined ? updates.topic : currentTopic;
    const languages = updates.languages !== undefined ? updates.languages : currentLang;
    const sort = updates.sort !== undefined ? updates.sort : currentSort;
    const page = updates.page !== undefined ? updates.page : 1; // reset page on filter change

    if (search && search.trim()) nextParams.set('search', search.trim());
    if (topic && topic.trim()) nextParams.set('topic', topic.trim());
    if (languages && languages.trim()) nextParams.set('languages', languages.trim());
    if (sort && sort !== 'popular') nextParams.set('sort', sort);
    if (page && Number(page) > 1) nextParams.set('page', String(page));

    const qs = nextParams.toString();
    window.location.hash = `#/explore${qs ? '?' + qs : ''}`;
  };

  // Bind Search listeners
  const searchForm = root.querySelector('#global-search-form');
  attachSearchListeners(searchForm, (query) => {
    navigateWithFilters({ search: query, page: 1 });
  }, false);

  // Bind Topic selector
  const topicSelect = root.querySelector('#filter-topic');
  if (topicSelect) {
    topicSelect.addEventListener('change', (e) => {
      navigateWithFilters({ topic: e.target.value, page: 1 });
    });
  }

  // Bind Language selector
  const langSelect = root.querySelector('#filter-language');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      navigateWithFilters({ languages: e.target.value, page: 1 });
    });
  }

  // Bind Sort selector
  const sortSelect = root.querySelector('#filter-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      navigateWithFilters({ sort: e.target.value, page: 1 });
    });
  }

  // Bind Reset Filters button
  const resetBtn = root.querySelector('#btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.location.hash = '#/explore';
    });
  }

  // Fetch API Results
  try {
    const data = await getBooks({
      search: currentSearch,
      topic: currentTopic,
      languages: currentLang,
      sort: currentSort,
      page: currentPage,
      cancellable: true
    });

    const grid = root.querySelector('#explore-books-grid');
    const headerCount = root.querySelector('#results-count-text');
    const paginationContainer = root.querySelector('#explore-pagination-container');

    if (!grid) return;

    // Update Result Count text
    if (headerCount) {
      const startNum = ((data.page - 1) * 32) + 1;
      const endNum = Math.min(data.page * 32, data.count);
      
      let filterDesc = [];
      if (currentSearch) filterDesc.push(`matching “${escapeHTML(currentSearch)}”`);
      if (currentTopic) filterDesc.push(`in topic “${escapeHTML(currentTopic)}”`);
      if (currentLang) filterDesc.push(`in language “${escapeHTML(currentLang)}”`);

      if (data.count === 0) {
        headerCount.innerHTML = `No books found ${filterDesc.join(' ')}`;
      } else {
        headerCount.innerHTML = `Showing <strong class="text-stone-900 dark:text-stone-100">${startNum}–${endNum}</strong> of <strong class="text-stone-900 dark:text-stone-100">${new Intl.NumberFormat('en-US').format(data.count)}</strong> books ${filterDesc.join(' ')}`;
      }
    }

    if (data.books.length === 0) {
      grid.className = 'w-full';
      grid.innerHTML = renderEmptyState({
        title: 'No Books Found',
        message: 'No books matched your criteria in the Gutenberg catalog. Try broadening your search or resetting filters.',
        actionText: 'Reset All Filters',
        actionHash: '#/explore'
      });
      if (paginationContainer) paginationContainer.innerHTML = '';
      initIcons(grid);
      return;
    }

    // Render Books
    grid.innerHTML = data.books.map(renderBookCard).join('');
    attachBookCardListeners(grid, data.books);

    // Render Pagination
    if (paginationContainer && (data.next || data.previous || data.totalPages > 1)) {
      paginationContainer.innerHTML = `
        <nav class="flex items-center gap-2 select-none" aria-label="Pagination">
          <!-- Previous Button -->
          <button 
            id="btn-page-prev" 
            type="button" 
            ${!data.previous ? 'disabled' : ''}
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-stone-100 dark:hover:not-disabled:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm">
            ${renderIcon('chevron-left', 'w-4 h-4')}
            <span>Previous</span>
          </button>

          <!-- Page Indicator -->
          <div class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
            Page ${data.page} of ${data.totalPages}
          </div>

          <!-- Next Button -->
          <button 
            id="btn-page-next" 
            type="button" 
            ${!data.next ? 'disabled' : ''}
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-stone-100 dark:hover:not-disabled:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm">
            <span>Next</span>
            ${renderIcon('chevron-right', 'w-4 h-4')}
          </button>
        </nav>
      `;

      initIcons(paginationContainer);

      const prevBtn = paginationContainer.querySelector('#btn-page-prev');
      const nextBtn = paginationContainer.querySelector('#btn-page-next');

      if (prevBtn && data.previous) {
        prevBtn.addEventListener('click', () => {
          scrollToTop();
          navigateWithFilters({ page: data.page - 1 });
        });
      }

      if (nextBtn && data.next) {
        nextBtn.addEventListener('click', () => {
          scrollToTop();
          navigateWithFilters({ page: data.page + 1 });
        });
      }
    }

  } catch (err) {
    if (err.name === 'AbortError') return; // Cancelled by newer request
    console.error('Explore books query error:', err);
    const grid = root.querySelector('#explore-books-grid');
    if (grid) {
      grid.className = 'w-full';
      grid.innerHTML = renderErrorState({
        title: 'Unable to Retrieve Books',
        message: 'Could not connect to the Gutendex service. Please check your internet connection and try again.',
        retryActionId: 'btn-retry-explore'
      });
      initIcons(grid);
      const retryBtn = grid.querySelector('#btn-retry-explore');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => renderExplore(root, queryParams));
      }
    }
  }
}

