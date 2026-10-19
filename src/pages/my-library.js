import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';
import { renderFallbackCover, setupImageFallback } from '../components/fallback-cover.js';
import { renderEmptyState } from '../components/loading-state.js';
import * as storage from '../utils/storage.js';
import { showToast } from '../components/toast.js';

/**
 * Render My Library Page
 * @param {HTMLElement} root 
 * @param {Object} queryParams 
 */
export function renderMyLibrary(root, queryParams = {}) {
  if (!root) return;

  const currentTab = queryParams.tab || 'reading_list'; // 'reading_list' | 'favorites' | 'finished'
  const subFilter = queryParams.sub || 'all'; // 'all' | 'want_to_read' | 'reading'

  const libraryMap = storage.getLibrary();
  const favoritesList = storage.getFavorites();

  const libraryItems = Object.values(libraryMap);
  const readingListItems = libraryItems.filter(item => item.status === 'want_to_read' || item.status === 'reading');
  const finishedItems = libraryItems.filter(item => item.status === 'finished');

  // Filter reading list items if subFilter applied
  const filteredReadingList = subFilter === 'all' 
    ? readingListItems 
    : readingListItems.filter(item => item.status === subFilter);

  // Stats
  const totalFavorites = favoritesList.length;
  const totalReading = libraryItems.filter(i => i.status === 'reading').length;
  const totalWantToRead = libraryItems.filter(i => i.status === 'want_to_read').length;
  const totalFinished = finishedItems.length;

  root.innerHTML = `
    <div class="space-y-8 pb-16">
      <!-- Header & Stats -->
      <div class="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
            My Library
          </h1>
          <p class="text-sm text-stone-600 dark:text-stone-400 max-w-xl">
            Your personal digital bookshelf. Saved books and reading progress are stored locally on this device.
          </p>
        </div>

        <!-- Export / Import Actions -->
        <div class="flex items-center gap-2">
          <button 
            id="btn-export-library" 
            type="button" 
            class="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 shadow-xs">
            ${renderIcon('download', 'w-3.5 h-3.5')}
            <span>Backup Data</span>
          </button>

          <label 
            for="input-import-library" 
            class="cursor-pointer px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 shadow-xs">
            ${renderIcon('rotate-ccw', 'w-3.5 h-3.5')}
            <span>Restore Backup</span>
            <input type="file" id="input-import-library" accept=".json" class="hidden" />
          </label>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Want to Read</span>
          <div class="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">${totalWantToRead}</div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 tracking-wider">Currently Reading</span>
          <div class="text-2xl font-serif font-bold text-amber-700 dark:text-amber-400 mt-1">${totalReading}</div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">Finished</span>
          <div class="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1">${totalFinished}</div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400 tracking-wider">Favorites</span>
          <div class="text-2xl font-serif font-bold text-rose-700 dark:text-rose-400 mt-1">${totalFavorites}</div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex items-center justify-between border-b border-stone-200 dark:border-stone-800">
        <nav class="flex items-center gap-1 sm:gap-4 -mb-px" aria-label="Library Tabs">
          <a 
            href="#/library?tab=reading_list" 
            class="py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              currentTab === 'reading_list' 
                ? 'border-amber-700 text-amber-800 dark:text-amber-400 dark:border-amber-400' 
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }">
            ${renderIcon('book-open', 'w-4 h-4')}
            <span>Reading List (${readingListItems.length})</span>
          </a>

          <a 
            href="#/library?tab=favorites" 
            class="py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              currentTab === 'favorites' 
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 dark:border-rose-400' 
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }">
            ${renderIcon('heart', 'w-4 h-4')}
            <span>Favorites (${favoritesList.length})</span>
          </a>

          <a 
            href="#/library?tab=finished" 
            class="py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              currentTab === 'finished' 
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400' 
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }">
            ${renderIcon('check', 'w-4 h-4')}
            <span>Finished (${finishedItems.length})</span>
          </a>
        </nav>

        ${currentTab === 'reading_list' && readingListItems.length > 0 ? `
          <!-- Sub filter buttons -->
          <div class="hidden sm:flex items-center gap-1 text-xs">
            <a 
              href="#/library?tab=reading_list&sub=all" 
              class="px-2.5 py-1 rounded-lg ${subFilter === 'all' ? 'bg-stone-200 dark:bg-stone-800 font-semibold' : 'text-stone-500 hover:text-stone-800'}">
              All
            </a>
            <a 
              href="#/library?tab=reading_list&sub=reading" 
              class="px-2.5 py-1 rounded-lg ${subFilter === 'reading' ? 'bg-stone-200 dark:bg-stone-800 font-semibold text-amber-700 dark:text-amber-400' : 'text-stone-500 hover:text-stone-800'}">
              Reading
            </a>
            <a 
              href="#/library?tab=reading_list&sub=want_to_read" 
              class="px-2.5 py-1 rounded-lg ${subFilter === 'want_to_read' ? 'bg-stone-200 dark:bg-stone-800 font-semibold' : 'text-stone-500 hover:text-stone-800'}">
              Want to Read
            </a>
          </div>
        ` : ''}
      </div>

      <!-- Tab Content Area -->
      <div id="library-tab-content">
        ${renderTabContent(currentTab, {
          readingList: filteredReadingList,
          favorites: favoritesList,
          finished: finishedItems
        })}
      </div>

      <!-- Privacy & Storage Disclaimer Box -->
      <div class="p-5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 leading-relaxed flex items-start gap-3">
        <span class="text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5">
          ${renderIcon('info', 'w-4 h-4')}
        </span>
        <p>
          OpenShelf does not track your identity or require account creation. All reading lists, favorites, and completion percentages are preserved in your browser's private LocalStorage. Use the "Backup Data" button above to transfer or save your library across devices.
        </p>
      </div>
    </div>
  `;

  initIcons(root);
  bindLibraryEvents(root);
}

/**
 * Render inner content of currently active tab
 */
function renderTabContent(tab, data) {
  if (tab === 'reading_list') {
    if (!data.readingList || data.readingList.length === 0) {
      return renderEmptyState({
        title: 'Your Reading List is Empty',
        message: 'You have not added any books to your reading list yet. Browse the catalog to start reading.',
        icon: 'book-open',
        actionText: 'Browse Books',
        actionHash: '#/explore'
      });
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${data.readingList.map(item => renderLibraryCard(item)).join('')}
      </div>
    `;
  }

  if (tab === 'favorites') {
    if (!data.favorites || data.favorites.length === 0) {
      return renderEmptyState({
        title: 'No Favorites Yet',
        message: 'Click the heart icon on any book card to save your favorite literary works here.',
        icon: 'heart',
        actionText: 'Discover Books',
        actionHash: '#/explore'
      });
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${data.favorites.map(item => renderFavoriteCard(item)).join('')}
      </div>
    `;
  }

  if (tab === 'finished') {
    if (!data.finished || data.finished.length === 0) {
      return renderEmptyState({
        title: 'No Finished Books Yet',
        message: 'When you finish reading a book, update its progress to 100% or mark it Finished to track your completed books here.',
        icon: 'check',
        actionText: 'Find Your Next Read',
        actionHash: '#/explore'
      });
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${data.finished.map(item => renderLibraryCard(item, true)).join('')}
      </div>
    `;
  }

  return '';
}

/**
 * Render single library item card with status changer and progress
 */
function renderLibraryCard(item, isFinished = false) {
  const progress = item.progressPercent || 0;

  return `
    <div class="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex gap-4 transition-all" data-library-id="${item.id}">
      <!-- Small Cover -->
      <a href="#/book/${item.id}" class="w-20 sm:w-24 aspect-[2/3] rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0 book-spine">
        ${item.coverUrl ? `
          <img src="${item.coverUrl}" alt="${escapeHTML(item.title)}" class="w-full h-full object-cover" />
        ` : renderFallbackCover(item, 'text-[8px]')}
      </a>

      <!-- Content -->
      <div class="flex flex-col flex-grow min-w-0">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h3 class="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
            <a href="#/book/${item.id}" class="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
              ${escapeHTML(item.title)}
            </a>
          </h3>

          <button 
            type="button" 
            class="btn-remove-library text-stone-400 hover:text-rose-600 transition-colors p-1"
            data-id="${item.id}"
            title="Remove from Library">
            ${renderIcon('trash-2', 'w-3.5 h-3.5')}
          </button>
        </div>

        <p class="text-xs text-stone-500 dark:text-stone-400 truncate mb-3">
          ${escapeHTML(item.authorNames)}
        </p>

        <!-- Reading Progress Bar -->
        <div class="mt-auto space-y-1.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-medium text-stone-600 dark:text-stone-300">
              ${isFinished ? 'Completed' : (item.status === 'reading' ? 'Reading' : 'Want to Read')}
            </span>
            <span class="font-semibold text-amber-700 dark:text-amber-400">${progress}%</span>
          </div>
          
          <div class="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div class="h-full bg-amber-600 transition-all" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <!-- Move status select -->
          <select 
            class="select-change-status text-[11px] py-1 px-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none"
            data-id="${item.id}">
            <option value="want_to_read" ${item.status === 'want_to_read' ? 'selected' : ''}>Want to Read</option>
            <option value="reading" ${item.status === 'reading' ? 'selected' : ''}>Currently Reading</option>
            <option value="finished" ${item.status === 'finished' ? 'selected' : ''}>Finished</option>
          </select>

          <!-- Read / Continue action -->
          <a 
            href="#/read/${item.id}" 
            class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 text-xs font-semibold transition-colors">
            ${renderIcon('book-open', 'w-3 h-3')}
            <span>${progress > 0 ? 'Continue' : 'Read'}</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render single favorite card
 */
function renderFavoriteCard(item) {
  return `
    <div class="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex gap-4 transition-all" data-fav-id="${item.id}">
      <a href="#/book/${item.id}" class="w-20 sm:w-24 aspect-[2/3] rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0 book-spine">
        ${item.coverUrl ? `
          <img src="${item.coverUrl}" alt="${escapeHTML(item.title)}" class="w-full h-full object-cover" />
        ` : renderFallbackCover(item, 'text-[8px]')}
      </a>

      <div class="flex flex-col flex-grow min-w-0">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h3 class="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
            <a href="#/book/${item.id}" class="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
              ${escapeHTML(item.title)}
            </a>
          </h3>

          <button 
            type="button" 
            class="btn-remove-favorite text-rose-500 hover:text-stone-400 transition-colors p-1"
            data-id="${item.id}"
            title="Remove from Favorites">
            ${renderIcon('heart', 'w-3.5 h-3.5 fill-current')}
          </button>
        </div>

        <p class="text-xs text-stone-500 dark:text-stone-400 truncate mb-3">
          ${escapeHTML(item.authorNames)}
        </p>

        <div class="mt-auto pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <a 
            href="#/book/${item.id}" 
            class="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">
            View Details
          </a>

          <a 
            href="#/read/${item.id}" 
            class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 text-xs font-semibold transition-colors">
            ${renderIcon('book-open', 'w-3 h-3')}
            <span>Read Online</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Bind interactive events on My Library page
 */
function bindLibraryEvents(root) {
  // Setup Fallback Covers
  root.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      this.parentElement.innerHTML = renderFallbackCover({ title: this.alt });
    }, { once: true });
  });

  // Remove from Library button
  root.querySelectorAll('.btn-remove-library').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      storage.removeLibraryItem(id);
      showToast('Book removed from personal library.', 'info');
      renderMyLibrary(root, { tab: 'reading_list' });
    });
  });

  // Remove from Favorites button
  root.querySelectorAll('.btn-remove-favorite').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      storage.toggleFavorite({ id });
      showToast('Removed from favorites.', 'info');
      renderMyLibrary(root, { tab: 'favorites' });
    });
  });

  // Change Status Select
  root.querySelectorAll('.select-change-status').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = select.getAttribute('data-id');
      const newStatus = e.target.value;
      const item = storage.getLibraryItem(id);
      if (item) {
        storage.setLibraryItem(item, newStatus, newStatus === 'finished' ? 100 : item.progressPercent);
        showToast(`Updated status to "${newStatus.replace(/_/g, ' ')}"`, 'success');
        renderMyLibrary(root, { tab: newStatus === 'finished' ? 'finished' : 'reading_list' });
      }
    });
  });

  // Export Library JSON
  const exportBtn = root.querySelector('#btn-export-library');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const json = storage.exportLibraryData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `openshelf-library-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Library exported successfully!', 'success');
    });
  }

  // Import Library JSON
  const importInput = root.querySelector('#input-import-library');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = storage.importLibraryData(event.target.result);
        if (result.success) {
          showToast(`Library restored successfully (${result.count} books).`, 'success');
          renderMyLibrary(root);
        } else {
          showToast(`Import failed: ${result.error}`, 'error');
        }
      };
      reader.readAsText(file);
    });
  }
}

