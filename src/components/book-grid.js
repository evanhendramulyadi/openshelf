import { renderBookCard, attachBookCardListeners } from './book-card.js';
import { renderEmptyState } from './loading-state.js';

/**
 * Render responsive book grid
 * @param {Object[]} books 
 * @param {Object} [options]
 * @param {string} [options.emptyTitle]
 * @param {string} [options.emptyMessage]
 * @param {string} [options.gridId]
 * @returns {string} HTML string
 */
export function renderBookGrid(books = [], {
  emptyTitle = 'No Books Available',
  emptyMessage = 'No titles matched your query in the catalog.',
  gridId = 'book-grid-container'
} = {}) {
  if (!books || books.length === 0) {
    return renderEmptyState({
      title: emptyTitle,
      message: emptyMessage,
      actionText: 'Explore Catalog',
      actionHash: '#/explore'
    });
  }

  return `
    <div 
      id="${gridId}" 
      class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      ${books.map(renderBookCard).join('')}
    </div>
  `;
}

/**
 * Bind listeners to an existing book grid container
 * @param {HTMLElement} container 
 * @param {Object[]} books 
 */
export function bindBookGrid(container, books = []) {
  if (!container) return;
  attachBookCardListeners(container, books);
}

