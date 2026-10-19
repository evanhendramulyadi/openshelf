import { renderIcon, initIcons } from '../utils/icons.js';
import * as storage from '../utils/storage.js';

/**
 * Render Header into container
 * @param {HTMLElement} container 
 * @param {string} currentPath 
 */
export function renderHeader(container, currentPath = '#/') {
  if (!container) return;

  const currentTheme = storage.getStoredTheme();
  const isDark = document.documentElement.classList.contains('dark');
  
  // Calculate total saved library items
  const favorites = storage.getFavorites();
  const library = storage.getLibrary();
  const totalSaved = favorites.length + Object.keys(library).length;

  const navLinks = [
    { label: 'Home', hash: '#/' },
    { label: 'Explore', hash: '#/explore' },
    { label: 'Categories', hash: '#/categories' },
    { 
      label: 'My Library', 
      hash: '#/library', 
      badge: totalSaved > 0 ? totalSaved : null 
    },
    { label: 'About', hash: '#/about' }
  ];

  const normalizePath = (hash) => {
    if (!hash || hash === '#' || hash === '#/') return '#/';
    const base = hash.split('?')[0];
    return base;
  };

  const activeBase = normalizePath(currentPath);

  container.innerHTML = `
    <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Brand Logo -->
      <a href="#/" class="flex items-center gap-2.5 group" aria-label="OpenShelf Home">
        <img 
          src="/images/logo-openshelf.png" 
          alt="OpenShelf Logo" 
          class="w-9 h-9 object-contain rounded-[20%] transition-transform group-hover:scale-105" 
        />
        <div class="flex flex-col">
          <span class="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 tracking-tight leading-none">
            OpenShelf
          </span>
          <span class="text-[10px] tracking-wider font-sans text-stone-500 dark:text-stone-400 mt-0.5">
            Discover More. Read More.
          </span>
        </div>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="hidden md:flex items-center gap-1" aria-label="Main Navigation">
        ${navLinks.map(link => {
          const isActive = activeBase === link.hash || (link.hash !== '#/' && activeBase.startsWith(link.hash));
          return `
            <a 
              href="${link.hash}" 
              class="relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-amber-900 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 font-semibold' 
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
              }">
              <span>${link.label}</span>
              ${link.badge ? `
                <span class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                  ${link.badge}
                </span>
              ` : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Right Actions: Theme Toggle & Mobile Menu -->
      <div class="flex items-center gap-2">
        <!-- Theme Toggle Button -->
        <button 
          id="btn-theme-toggle" 
          type="button" 
          aria-label="Toggle dark/light theme"
          title="Toggle reading theme"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-800">
          ${renderIcon(isDark ? 'sun' : 'moon', 'w-4 h-4')}
        </button>

        <!-- Mobile Menu Hamburger Button -->
        <button 
          id="btn-mobile-menu" 
          type="button" 
          aria-label="Open navigation menu"
          aria-expanded="false"
          class="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-800">
          ${renderIcon('menu', 'w-5 h-5')}
        </button>
      </div>
    </header>

    <!-- Mobile Navigation Drawer -->
    <div 
      id="mobile-nav-drawer" 
      class="hidden md:hidden border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-4 pt-2 pb-5 transition-all">
      <nav class="flex flex-col gap-1">
        ${navLinks.map(link => {
          const isActive = activeBase === link.hash || (link.hash !== '#/' && activeBase.startsWith(link.hash));
          return `
            <a 
              href="${link.hash}" 
              class="mobile-nav-link flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-amber-900 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 font-semibold' 
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800'
              }">
              <span>${link.label}</span>
              ${link.badge ? `
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                  ${link.badge}
                </span>
              ` : ''}
            </a>
          `;
        }).join('')}
      </nav>
    </div>
  `;

  initIcons(container);

  // Setup Theme Toggle Event
  const themeBtn = container.querySelector('#btn-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentlyDark = document.documentElement.classList.contains('dark');
      const nextTheme = currentlyDark ? 'light' : 'dark';
      storage.setStoredTheme(nextTheme);
      renderHeader(container, window.location.hash);
    });
  }

  // Setup Mobile Menu Toggle
  const mobileBtn = container.querySelector('#btn-mobile-menu');
  const drawer = container.querySelector('#mobile-nav-drawer');
  if (mobileBtn && drawer) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = !drawer.classList.contains('hidden');
      if (isOpen) {
        drawer.classList.add('hidden');
        mobileBtn.setAttribute('aria-expanded', 'false');
      } else {
        drawer.classList.remove('hidden');
        mobileBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close drawer when mobile link clicked
    drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.add('hidden');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

