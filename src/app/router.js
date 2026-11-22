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
import { checkGutenbergMaintenance } from '../services/book-service.js';

let isMaintenanceActive = false;
let isInitialCheckDone = false;

export function getMaintenanceStatus() {
  return isMaintenanceActive;
}

export function setMaintenanceStatus(status) {
  isMaintenanceActive = Boolean(status);
}

/**
 * Render Full-Page Gutenberg Maintenance Mode View
 * Completely locks the application while Project Gutenberg is undergoing maintenance (HTTP 503)
 * Fits perfectly in 1 screen height on laptops with zero vertical scroll
 * @param {HTMLElement} root 
 */
export function renderMaintenancePage(root) {
  if (!root) return;

  // Hide nav and footer during maintenance mode
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');
  if (headerContainer) headerContainer.style.display = 'none';
  if (footerContainer) footerContainer.style.display = 'none';

  // Set clean centered container while allowing natural scrolling
  root.className = 'w-full max-w-xl mx-auto px-4 min-h-[90vh] flex flex-col items-center justify-center py-8 focus:outline-none';

  const lastCheckedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  root.innerHTML = `
    <div class="w-full flex flex-col items-center justify-center text-center my-auto">
      <!-- Minimalist Brand Header -->
      <div class="inline-flex items-center gap-2 mb-3">
        <img 
          src="/images/openshelf-logo.png" 
          alt="OpenShelf Logo" 
          class="w-6 h-6 object-contain rounded-[20%]" 
        />
        <span class="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight leading-none">
          OpenShelf
        </span>
      </div>

      <!-- Animated Server Warning Icon with pulse ring -->
      <div class="relative w-14 h-14 mx-auto mb-3 flex items-center justify-center">
        <div class="absolute inset-0 rounded-2xl bg-amber-500/20 dark:bg-amber-400/10 animate-ping opacity-60"></div>
        <div class="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 dark:from-amber-950/80 dark:to-orange-950/60 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md">
          ${renderIcon('server', 'w-6 h-6')}
        </div>
      </div>

      <!-- Maintenance Badge -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 mb-2.5 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span>Project Gutenberg Down for Maintenance (HTTP 503)</span>
      </div>

      <h1 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
        Akses Perpustakaan Ditangguhkan
      </h1>

      <p class="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 max-w-md mx-auto">
        Server pusat <strong class="font-semibold text-stone-900 dark:text-stone-100">Project Gutenberg (gutenberg.org)</strong> sedang dalam proses pemeliharaan darurat. Akses e-book, cover, dan pembacaan teks online ditangguhkan sementara.
      </p>

      <div class="w-full bg-amber-50 dark:bg-stone-900/90 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 mb-5 text-left max-w-md mx-auto shadow-sm space-y-2">
        <div class="flex items-start gap-2.5">
          <div class="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
            ${renderIcon('alert-triangle', 'w-4 h-4')}
          </div>
          <p class="text-[11px] sm:text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            Seluruh rute navigasi OpenShelf dikunci sementara demi mencegah galat tautan dan menjaga integritas data hingga pemeliharaan server Gutenberg selesai.
          </p>
        </div>

        <div class="pt-2 border-t border-amber-200/60 dark:border-stone-800 grid grid-cols-2 gap-1 text-[11px] text-stone-500 dark:text-stone-400">
          <div>Status Gutenberg: <strong class="text-amber-600 dark:text-amber-400 font-mono">503 Maintenance</strong></div>
          <div>Mode Proteksi: <strong class="text-emerald-600 dark:text-emerald-400 font-mono">Routing Locked</strong></div>
          <div class="col-span-2">Pemeriksaan Terakhir: <span id="maintenance-checked-time" class="font-mono text-stone-700 dark:text-stone-300">${lastCheckedTime}</span></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
        <button 
          id="btn-recheck-maintenance" 
          type="button" 
          class="whitespace-nowrap px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer flex-shrink-0">
          ${renderIcon('refresh-cw', 'w-3.5 h-3.5')}
          <span>Periksa Status Server</span>
        </button>

        <a 
          href="https://www.gutenberg.org/" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="whitespace-nowrap px-4 py-2.5 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 flex-shrink-0">
          <span>Situs Resmi Gutenberg</span>
          ${renderIcon('external-link', 'w-3.5 h-3.5')}
        </a>
      </div>

      <!-- Live Feedback Message Area -->
      <div id="maintenance-feedback" class="mt-2.5 min-h-[1.25rem]"></div>
    </div>
  `;

  initIcons(root);

  // Bind Re-check Action
  const btnRecheck = root.querySelector('#btn-recheck-maintenance');
  const feedback = root.querySelector('#maintenance-feedback');
  const timeDisplay = root.querySelector('#maintenance-checked-time');

  let autoCheckTimer = null;

  const performStatusCheck = async (isManual = false) => {
    if (isManual && btnRecheck) {
      btnRecheck.disabled = true;
      btnRecheck.classList.add('opacity-75', 'cursor-wait');
      btnRecheck.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span class="whitespace-nowrap">Memeriksa Server…</span>
      `;
    }

    try {
      const isDown = await checkGutenbergMaintenance();
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (timeDisplay) timeDisplay.textContent = nowTime;

      if (isDown) {
        isMaintenanceActive = true;
        if (feedback && isManual) {
          feedback.innerHTML = `
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
              ${renderIcon('alert-triangle', 'w-3 h-3')}
              <span>Server Gutenberg masih dalam pemeliharaan (${nowTime}). Akses tetap terkunci.</span>
            </div>
          `;
          initIcons(feedback);
        }
      } else {
        if (autoCheckTimer) clearInterval(autoCheckTimer);
        isMaintenanceActive = false;
        
        // Restore nav and footer
        const header = document.getElementById('header-container');
        const footer = document.getElementById('footer-container');
        if (header) header.style.display = '';
        if (footer) footer.style.display = '';
        root.className = 'flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 focus:outline-none';

        if (feedback) {
          feedback.innerHTML = `
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
              ${renderIcon('check', 'w-3 h-3')}
              <span>Server Gutenberg telah pulih! Membuka perpustakaan…</span>
            </div>
          `;
          initIcons(feedback);
        }
        setTimeout(() => {
          handleRouting();
        }, 900);
        return;
      }
    } catch (err) {
      if (feedback && isManual) {
        feedback.innerHTML = `<span class="text-[11px] text-stone-500">Gagal menghubungi server. Status tetap dalam pemeliharaan.</span>`;
      }
    } finally {
      if (isManual && btnRecheck) {
        btnRecheck.disabled = false;
        btnRecheck.classList.remove('opacity-75', 'cursor-wait');
        btnRecheck.innerHTML = `
          ${renderIcon('refresh-cw', 'w-3.5 h-3.5')}
          <span class="whitespace-nowrap">Periksa Status Server</span>
        `;
        initIcons(btnRecheck);
      }
    }
  };

  if (btnRecheck) {
    btnRecheck.addEventListener('click', () => performStatusCheck(true));
  }

  // Periodic background check every 30s to automatically unlock when Gutenberg finishes maintenance
  autoCheckTimer = setInterval(() => {
    if (isMaintenanceActive) {
      performStatusCheck(false);
    } else {
      clearInterval(autoCheckTimer);
    }
  }, 30000);
}

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
  const footerContainer = document.getElementById('footer-container');
  if (!main) return;

  // Strict maintenance lockdown
  if (isMaintenanceActive) {
    // If link is manipulated during maintenance, redirect immediately to default home '#/'
    if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
      history.replaceState(null, '', '#/');
    }
    if (headerContainer) headerContainer.style.display = 'none';
    if (footerContainer) footerContainer.style.display = 'none';
    renderMaintenancePage(main);
    return;
  }

  // When NOT in maintenance, ensure nav, footer, and main className are restored
  if (headerContainer) {
    headerContainer.style.display = '';
  }
  if (footerContainer) {
    footerContainer.style.display = '';
  }
  main.className = 'flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 focus:outline-none';

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
export async function initRouter() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  scrollToTop(false);

  window.addEventListener('hashchange', handleRouting);
  
  // Listen for storage changes to update header badges reactively
  window.addEventListener('openshelf:state-changed', () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer && !isMaintenanceActive) {
      renderHeader(headerContainer, window.location.hash);
    }
  });

  const main = document.getElementById('app-main');
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');

  // Pre-flight check: right from the beginning, check if Gutenberg is in maintenance
  if (!isInitialCheckDone) {
    isInitialCheckDone = true;
    
    try {
      const isDown = await checkGutenbergMaintenance();
      if (isDown) {
        isMaintenanceActive = true;
        // If user entered with any other link during maintenance, reset to default home '#/'
        if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
          history.replaceState(null, '', '#/');
        }
        if (headerContainer) headerContainer.style.display = 'none';
        if (footerContainer) footerContainer.style.display = 'none';
        renderMaintenancePage(main);
        return;
      }
    } catch (e) {
      isMaintenanceActive = true;
      if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
        history.replaceState(null, '', '#/');
      }
      if (headerContainer) headerContainer.style.display = 'none';
      if (footerContainer) footerContainer.style.display = 'none';
      renderMaintenancePage(main);
      return;
    }
  }

  // Initial route
  handleRouting();
}
