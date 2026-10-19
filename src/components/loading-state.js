import { renderIcon } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';

/**
 * Render grid of book skeleton placeholders
 * @param {number} count 
 * @returns {string} HTML string
 */
export function renderBookSkeletons(count = 8) {
  return Array.from({ length: count }).map(() => `
    <div class="flex flex-col bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-sm transition-all">
      <!-- Cover Skeleton -->
      <div class="relative w-full aspect-[2/3] bg-stone-200 dark:bg-stone-800 skeleton-shimmer"></div>
      
      <!-- Content Skeleton -->
      <div class="p-4 flex flex-col flex-grow gap-2.5">
        <div class="h-3 w-16 bg-stone-200 dark:bg-stone-800 rounded skeleton-shimmer"></div>
        <div class="h-4.5 w-full bg-stone-200 dark:bg-stone-800 rounded skeleton-shimmer"></div>
        <div class="h-4 w-3/4 bg-stone-200 dark:bg-stone-800 rounded skeleton-shimmer"></div>
        
        <div class="mt-auto pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div class="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded skeleton-shimmer"></div>
          <div class="h-7 w-7 rounded-full bg-stone-200 dark:bg-stone-800 skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Render standalone spinner
 * @param {string} message 
 * @returns {string} HTML string
 */
export function renderLoadingSpinner(message = 'Exploring the catalog…') {
  return `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-10 h-10 border-3 border-stone-300 dark:border-stone-700 border-t-amber-700 dark:border-t-amber-500 rounded-full animate-spin mb-4"></div>
      <p class="text-sm font-medium text-stone-600 dark:text-stone-400 animate-pulse">${escapeHTML(message)}</p>
    </div>
  `;
}

/**
 * Render error display with retry button
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.retryActionId] - ID to attach event listener to
 * @returns {string} HTML string
 */
export function renderErrorState({
  title = 'Catalog Connection Issue',
  message = 'Unable to reach the Gutendex service. Please check your internet connection and try again.',
  retryActionId = 'btn-retry-action'
} = {}) {
  return `
    <div class="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm">
      <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
        ${renderIcon('rotate-ccw', 'w-6 h-6')}
      </div>
      <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
        ${escapeHTML(title)}
      </h3>
      <p class="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
        ${escapeHTML(message)}
      </p>
      <button 
        id="${retryActionId}"
        type="button" 
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
        ${renderIcon('refresh-cw', 'w-4 h-4')}
        <span>Retry Query</span>
      </button>
    </div>
  `;
}

/**
 * Render empty state card
 * @param {Object} options
 * @returns {string} HTML string
 */
export function renderEmptyState({
  title = 'No Books Found',
  message = 'We could not find any titles matching your query in the Project Gutenberg catalog.',
  icon = 'search',
  actionText = 'Clear Filters',
  actionHash = '#/explore'
} = {}) {
  return `
    <div class="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm">
      <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
        ${renderIcon(icon, 'w-6 h-6')}
      </div>
      <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
        ${escapeHTML(title)}
      </h3>
      <p class="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
        ${escapeHTML(message)}
      </p>
      ${actionText ? `
        <a 
          href="${actionHash}" 
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 rounded-lg text-sm font-medium transition-colors shadow-sm">
          ${renderIcon('arrow-right', 'w-4 h-4')}
          <span>${escapeHTML(actionText)}</span>
        </a>
      ` : ''}
    </div>
  `;
}

