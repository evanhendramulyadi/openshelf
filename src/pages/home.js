import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';
import { renderSearchBar, attachSearchListeners } from '../components/search-bar.js';
import { renderBookCard, attachBookCardListeners } from '../components/book-card.js';
import { renderBookSkeletons, renderErrorState } from '../components/loading-state.js';
import { getFeaturedBooks, getBooks, getRecentAdditions, searchCuratedCatalog, CATEGORIES } from '../services/book-service.js';

/**
 * Render Home Page
 * @param {HTMLElement} root 
 */
export async function renderHome(root) {
  if (!root) return;

  root.innerHTML = `
    <div class="space-y-16 sm:space-y-20 pb-12">
      <!-- Hero Section -->
      <section class="relative pt-6 sm:pt-10 pb-8 text-center max-w-4xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 mb-6 shadow-sm">
          ${renderIcon('sparkles', 'w-3.5 h-3.5')}
          <span class="tracking-wide">Discover More. Read More.</span>
          <span class="opacity-40">•</span>
          <span>70,000+ Free E-Books</span>
        </div>

        <!-- Headline -->
        <h1 class="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight mb-5">
          Discover More. Read More. <br class="hidden sm:inline" />
          <span class="italic font-normal text-amber-800 dark:text-amber-500">Timeless literature</span>, freely and legally open to all.
        </h1>

        <p class="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
          OpenShelf connects you directly to the digitized treasures of Project Gutenberg. 
          Discover, read directly in your browser, or download to your favorite e-reader with no paywalls and no account required.
        </p>

        <!-- Search Bar Hero Widget -->
        <div class="max-w-2xl mx-auto">
          ${renderSearchBar({ size: 'lg', showPills: true })}
        </div>
      </section>

      <!-- Highlights / Value Pillars -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            ${renderIcon('book-open', 'w-5 h-5')}
          </div>
          <div>
            <h3 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
              Read Directly Online
            </h3>
            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Open book editions directly inside our distraction-free, customizable web reader with adjustable typography and reading themes.
            </p>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            ${renderIcon('download', 'w-5 h-5')}
          </div>
          <div>
            <h3 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
              Instant E-Reader Downloads
            </h3>
            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Export verified formats including EPUB (Apple Books, Kobo), Kindle MOBI/KF8, and clean plain text without DRM or sign-up.
            </p>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            ${renderIcon('check', 'w-5 h-5')}
          </div>
          <div>
            <h3 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
              100% Legal Public Domain
            </h3>
            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Works where copyright has expired. Preserved and digitized by dedicated volunteers of Project Gutenberg since 1971.
            </p>
          </div>
        </div>
      </section>

      <!-- Featured Curated Classics Section -->
      <section class="space-y-6">
        <div class="flex items-end justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <span class="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
              Curated Selection
            </span>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              Featured Literary Masterpieces
            </h2>
          </div>
          <a 
            href="#/explore" 
            class="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1 transition-colors">
            <span>View All</span>
            ${renderIcon('arrow-right', 'w-4 h-4')}
          </a>
        </div>

        <div id="home-featured-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          ${renderBookSkeletons(4)}
        </div>
      </section>

      <!-- Browse by Categories / Subjects Section -->
      <section class="space-y-6">
        <div class="flex items-end justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <span class="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
              Subject Directory
            </span>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              Explore by Subject
            </h2>
          </div>
          <a 
            href="#/categories" 
            class="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1 transition-colors">
            <span>All Categories</span>
            ${renderIcon('arrow-right', 'w-4 h-4')}
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${CATEGORIES.slice(0, 6).map(cat => `
            <a 
              href="#/explore?topic=${encodeURIComponent(cat.query)}" 
              class="group p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-600/10 group-hover:text-amber-700 dark:group-hover:text-amber-400 flex items-center justify-center flex-shrink-0 transition-colors">
                ${renderIcon(cat.icon, 'w-5 h-5')}
              </div>
              <div class="flex-grow min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                    ${escapeHTML(cat.name)}
                  </h3>
                  ${renderIcon('arrow-right', 'w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all')}
                </div>
                <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  ${escapeHTML(cat.description)}
                </p>
              </div>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- Popular Catalog Books (by actual downloads) -->
      <section class="space-y-6">
        <div class="flex items-end justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <span class="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
              Reader Favorites
            </span>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              Most Popular in Catalog
            </h2>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Ordered by verified downloads from Project Gutenberg readers worldwide.
            </p>
          </div>
          <a 
            href="#/explore?sort=popular" 
            class="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1 transition-colors">
            <span>Explore More</span>
            ${renderIcon('arrow-right', 'w-4 h-4')}
          </a>
        </div>

        <div id="home-popular-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          ${renderBookSkeletons(4)}
        </div>
      </section>

      <!-- Recently Added or Catalog Discoveries -->
      <section class="space-y-6">
        <div class="flex items-end justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <span class="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
              Catalog Additions
            </span>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              Recently Cataloged Titles
            </h2>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Recent uploads and refreshed editions cataloged with Project Gutenberg IDs.
            </p>
          </div>
          <a 
            href="#/explore?sort=descending" 
            class="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1 transition-colors">
            <span>Browse Newest</span>
            ${renderIcon('arrow-right', 'w-4 h-4')}
          </a>
        </div>

        <div id="home-recent-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          ${renderBookSkeletons(4)}
        </div>
      </section>

      <!-- Transparency & Legal Note Banner -->
      <section class="p-6 sm:p-8 rounded-3xl bg-stone-100/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-lg">
              ${renderIcon('info', 'w-5 h-5 text-amber-700 dark:text-amber-400')}
              <span>Why OpenShelf is Free and Transparent</span>
            </div>
            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Every title on OpenShelf is legally accessible without paywalls, subscriptions, or DRM restrictions. 
              The books are in the public domain in the United States, allowing readers worldwide to study, enjoy, and preserve humanity's literary heritage.
            </p>
          </div>
          <a 
            href="#/about" 
            class="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs sm:text-sm font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors flex-shrink-0 shadow-sm">
            Learn About Copyright
          </a>
        </div>
      </section>
    </div>
  `;

  initIcons(root);

  // Setup search form listener
  const searchForm = root.querySelector('#global-search-form');
  attachSearchListeners(searchForm, (query) => {
    if (query) {
      window.location.hash = `#/explore?search=${encodeURIComponent(query)}`;
    }
  }, false);

  // Fetch and populate all three sections concurrently for maximum loading speed
  const loadFeatured = async () => {
    try {
      const featuredBooks = await getFeaturedBooks();
      const featuredGrid = root.querySelector('#home-featured-grid');
      if (featuredGrid) {
        const top4 = featuredBooks.slice(0, 4);
        featuredGrid.innerHTML = top4.map(renderBookCard).join('');
        attachBookCardListeners(featuredGrid, top4);
      }
    } catch (err) {
      console.error('Failed to load featured books:', err);
      const featuredGrid = root.querySelector('#home-featured-grid');
      if (featuredGrid) {
        featuredGrid.innerHTML = renderErrorState({
          title: 'Could Not Load Featured Titles',
          message: 'Could not connect to the Gutendex catalog. Please check your connection.',
          retryActionId: 'btn-retry-featured'
        });
        initIcons(featuredGrid);
        const retryBtn = featuredGrid.querySelector('#btn-retry-featured');
        if (retryBtn) retryBtn.addEventListener('click', () => renderHome(root));
      }
    }
  };

  const loadPopular = async () => {
    try {
      const popularData = await getBooks({ page: 1 });
      const popularGrid = root.querySelector('#home-popular-grid');
      if (popularGrid && popularData.books && popularData.books.length > 0) {
        const populars = popularData.books.slice(0, 4);
        popularGrid.innerHTML = populars.map(renderBookCard).join('');
        attachBookCardListeners(popularGrid, populars);
      }
    } catch (err) {
      console.warn('Failed to load popular books:', err);
      const popularGrid = root.querySelector('#home-popular-grid');
      if (popularGrid) {
        const fallback = searchCuratedCatalog({ sort: 'popular' }).books.slice(0, 4);
        popularGrid.innerHTML = fallback.map(renderBookCard).join('');
        attachBookCardListeners(popularGrid, fallback);
      }
    }
  };

  const loadRecent = async () => {
    try {
      const recentBooks = await getRecentAdditions();
      const recentGrid = root.querySelector('#home-recent-grid');
      if (recentGrid && recentBooks.length > 0) {
        const recent4 = recentBooks.slice(0, 4);
        recentGrid.innerHTML = recent4.map(renderBookCard).join('');
        attachBookCardListeners(recentGrid, recent4);
      }
    } catch (err) {
      console.warn('Failed to load recent books:', err);
    }
  };

  // Run in parallel so sections populate immediately without blocking each other
  Promise.allSettled([loadFeatured(), loadPopular(), loadRecent()]);
}

