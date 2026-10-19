import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML, debounce } from '../utils/dom.js';
import { POPULAR_SEARCH_TERMS } from '../services/book-service.js';

/**
 * Render Search Bar HTML
 * @param {Object} options
 * @param {string} [options.value]
 * @param {string} [options.placeholder]
 * @param {boolean} [options.showPills]
 * @param {string} [options.size] - 'lg' (for Home hero) or 'md' (for Explore)
 * @returns {string} HTML string
 */
export function renderSearchBar({
  value = '',
  placeholder = 'Search by title, author, or subject (e.g. Frankenstein, Austen, Philosophy)…',
  showPills = false,
  size = 'md'
} = {}) {
  const isLarge = size === 'lg';

  return `
    <div class="w-full">
      <form id="global-search-form" class="relative flex items-center" role="search" onsubmit="return false;">
        <!-- Search Icon -->
        <div class="absolute left-4 text-stone-400 dark:text-stone-500 pointer-events-none flex items-center">
          ${renderIcon('search', isLarge ? 'w-5 h-5' : 'w-4 h-4')}
        </div>

        <!-- Input -->
        <input 
          type="search" 
          id="search-input" 
          name="q"
          value="${escapeHTML(value)}" 
          placeholder="${placeholder}"
          autocomplete="off"
          spellcheck="false"
          class="w-full ${isLarge ? 'py-4 pl-12 pr-28 text-base sm:text-lg' : 'py-2.5 pl-11 pr-24 text-sm'} bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-2xl shadow-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600 transition-all"
        />

        <!-- Right actions: Clear button and Submit button -->
        <div class="absolute right-2 flex items-center gap-1">
          <button 
            type="button" 
            id="search-clear-btn" 
            aria-label="Clear search input"
            class="${value ? 'flex' : 'hidden'} items-center justify-center w-7 h-7 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full transition-colors">
            ${renderIcon('x', 'w-4 h-4')}
          </button>
          
          <button 
            type="submit" 
            id="search-submit-btn" 
            aria-label="Submit search"
            class="${isLarge ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'} bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-medium rounded-xl transition-all shadow-sm flex items-center gap-1.5">
            <span>Search</span>
          </button>
        </div>
      </form>

      ${showPills ? `
        <div class="mt-3 flex items-center flex-wrap gap-1.5 text-xs">
          <span class="text-stone-500 dark:text-stone-400 font-medium mr-1 flex items-center gap-1">
            ${renderIcon('sparkles', 'w-3 h-3 text-amber-600 dark:text-amber-400')}
            Popular searches:
          </span>
          ${POPULAR_SEARCH_TERMS.slice(0, 6).map(term => `
            <button 
              type="button" 
              class="quick-search-pill px-2.5 py-1 rounded-full bg-stone-200/70 hover:bg-stone-300/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
              data-query="${escapeHTML(term)}">
              ${escapeHTML(term)}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Attach search events
 * @param {HTMLElement} formElement 
 * @param {Function} onSearch - callback with query string
 * @param {boolean} liveDebounce - whether to fire debounced on input
 */
export function attachSearchListeners(formElement, onSearch, liveDebounce = true) {
  if (!formElement) return;

  const input = formElement.querySelector('#search-input');
  const clearBtn = formElement.querySelector('#search-clear-btn');
  const submitBtn = formElement.querySelector('#search-submit-btn');

  const updateClearVisibility = () => {
    if (clearBtn) {
      if (input && input.value.trim().length > 0) {
        clearBtn.classList.remove('hidden');
        clearBtn.classList.add('flex');
      } else {
        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('flex');
      }
    }
  };

  const triggerSearch = (query, isLive = false) => {
    updateClearVisibility();
    if (typeof onSearch === 'function') {
      onSearch(query.trim(), isLive);
    }
  };

  const debouncedSearch = debounce((q) => {
    triggerSearch(q, true);
  }, 200);

  if (input) {
    input.addEventListener('input', (e) => {
      updateClearVisibility();
      if (liveDebounce) {
        debouncedSearch(e.target.value);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSearch(input.value, false);
      } else if (e.key === 'Escape') {
        input.value = '';
        triggerSearch('', false);
      }
    });
  }

  if (formElement) {
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input) triggerSearch(input.value);
    });
  }

  if (submitBtn && input) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerSearch(input.value);
    });
  }

  if (clearBtn && input) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      input.value = '';
      input.focus();
      triggerSearch('');
    });
  }

  // Handle Quick search pills
  const container = formElement.parentElement;
  if (container) {
    container.querySelectorAll('.quick-search-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.getAttribute('data-query');
        if (input && query) {
          input.value = query;
          triggerSearch(query);
        }
      });
    });
  }

  initIcons(formElement);
}

