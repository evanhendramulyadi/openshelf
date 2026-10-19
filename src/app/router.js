import { renderHome } from '../pages/home.js';
import { renderExplore } from '../pages/explore.js';
import { renderCategories } from '../pages/categories.js';
import { renderBookDetails } from '../pages/book-details.js';
import { renderReader } from '../pages/reader.js';
import { renderMyLibrary } from '../pages/my-library.js';
import { renderAbout } from '../pages/about.js';
import { renderEmptyState } from '../components/loading-state.js';
import { renderHeader } from '../components/header.js';
import { scrollToTop } from '../utils/dom.js';

/**
 * Parse URL hash into route path and query parameters
 * @param {string} hash - e.g. '#/explore?search=frank&page=2'
 * @returns {{ path: string, params: Object, id: string|null }}
 */
export function parseHash(hash = window.location.hash) {
  let cleanHash = hash.replace(/^#/, '').trim();
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
  const pathParts = rawPath.split('/').filter(Boolean);
  if (pathParts.length === 2 && (pathParts[0] === 'book' || pathParts[0] === 'read')) {
    return {
      path: `/${pathParts[0]}/:id`,
      id: pathParts[1],
      params
    };
  }

  return {
    path: rawPath.startsWith('/') ? rawPath : `/${rawPath}`,
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

  // Scroll to top on navigation
  scrollToTop();

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
        window.location.hash = '#/explore';
      }
      break;

    case '/read/:id':
      if (id) {
        await renderReader(main, id);
      } else {
        window.location.hash = '#/explore';
      }
      break;

    case '/library':
      renderMyLibrary(main, params);
      break;

    case '/about':
      renderAbout(main);
      break;

    default:
      main.innerHTML = `
        <div class="py-16">
          ${renderEmptyState({
            title: '404 — Page Not Found',
            message: 'The page you requested does not exist in the OpenShelf library directory.',
            icon: 'help-circle',
            actionText: 'Return to Library Home',
            actionHash: '#/'
          })}
        </div>
      `;
      break;
  }
}

/**
 * Initialize Client-Side Hash Router
 */
export function initRouter() {
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

