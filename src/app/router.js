import { renderHome } from '../pages/home.js';
import { renderExplore } from '../pages/explore.js';
import { renderCategories } from '../pages/categories.js';
import { renderBookDetails } from '../pages/book-details.js';
import { renderReader } from '../pages/reader.js';
import { renderMyLibrary } from '../pages/my-library.js';
import { renderAbout } from '../pages/about.js';
import { renderHeader } from '../components/header.js';
import { renderIcon, initIcons } from '../utils/icons.js';
import { scrollToTop } from '../utils/dom.js';

/**
 * Render 404 Page Not Found view
 * @param {HTMLElement} root 
 */
export function renderNotFound(root) {
  if (!root) return;
  root.innerHTML = `
    <div class="py-16 md:py-24 max-w-xl mx-auto px-4 text-center">
      <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-inner">
        ${renderIcon('help-circle', 'w-10 h-10')}
      </div>
      <span class="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-2 block">
        Error 404
      </span>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
        Page Not Found
      </h1>
      <p class="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
        The page you requested does not exist in the OpenShelf library directory. Let's take you back to the home page.
      </p>
      <div class="flex items-center justify-center gap-3">
        <a 
          href="#/" 
          class="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-100 dark:text-stone-900 rounded-xl text-sm font-semibold transition-all shadow-sm">
          ${renderIcon('home', 'w-4 h-4')}
          <span>Back to Home</span>
        </a>
      </div>
    </div>
  `;
  initIcons(root);
}

/**
 * Parse URL hash into route path and query parameters
 * @param {string} hash - e.g. '#/explore?search=frank&page=2'
 * @returns {{ path: string, params: Object, id: string|null }}
 */
export function parseHash(hash = window.location.hash) {
  let cleanHash = (hash || '').replace(/^#+/, '').trim();
  if (!cleanHash || cleanHash === '/') {
    return { path: '/', params: {}, id: null };
  }

  const [rawPath, rawQuery] = cleanHash.split('?');
  const params = {};

  if (rawQuery) {
    const searchParams = new URLSearchParams(rawQuery);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }

  // Handle parameterized routes like /book/84 or /read/84
  const pathParts = (rawPath || '').split('/').filter(Boolean);
  if (pathParts.length === 2 && (pathParts[0] === 'book' || pathParts[0] === 'read')) {
    return {
      path: `/${pathParts[0]}/:id`,
      id: pathParts[1],
      params
    };
  }

  if (pathParts.length === 1) {
    return {
      path: `/${pathParts[0]}`,
      id: null,
      params
    };
  }

  return {
    path: rawPath ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`) : '/',
    id: null,
    params
  };
}

/**
 * Handle route changes and render appropriate view
 */
export async function handleRouting() {
  const main = document.getElementById('app-main');
  const headerContainer = document.getElementById('header-container');
  if (!main) return;

  const currentHash = window.location.hash || '#/';
  const { path, id, params } = parseHash(currentHash);

  // Update Header active link & counters
  if (headerContainer) {
    renderHeader(headerContainer, currentHash);
  }

  // Scroll to top on navigation instantly
  scrollToTop(false);

  // Focus management for accessibility
  main.focus();

  switch (path) {
    case '/':
      await renderHome(main);
      break;

    case '/explore':
      await renderExplore(main, params);
      break;

    case '/categories':
      await renderCategories(main, params);
      break;

    case '/book/:id':
      if (id) {
        await renderBookDetails(main, id);
      } else {
        renderNotFound(main);
      }
      break;

    case '/read/:id':
      if (id) {
        await renderReader(main, id);
      } else {
        renderNotFound(main);
      }
      break;

    case '/library':
      renderMyLibrary(main, params);
      break;

    case '/about':
      renderAbout(main);
      break;

    default:
      renderNotFound(main);
      break;
  }

  // Ensure instant scroll to top on page navigation
  requestAnimationFrame(() => {
    scrollToTop(false);
  });
}

/**
 * Initialize Client-Side Hash Router
 */
export function initRouter() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  scrollToTop(false);

  window.addEventListener('hashchange', handleRouting);
  
  // Listen for storage changes to update header badges reactively
  window.addEventListener('openshelf:state-changed', () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      renderHeader(headerContainer, window.location.hash);
    }
  });

  // Initial route
  handleRouting();
}
