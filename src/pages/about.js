import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';

/**
 * Render About View
 * @param {HTMLElement} root 
 */
export function renderAbout(root) {
  if (!root) return;

  const faqs = [
    {
      q: 'Is OpenShelf really 100% free?',
      a: 'Yes. Every title indexed in OpenShelf is hosted by Project Gutenberg and exists in the public domain in the United States. There are no fees, subscriptions, advertisements, or premium paywalls.'
    },
    {
      q: 'Can I download books to my Kindle, Kobo, or phone?',
      a: 'Absolutely. Project Gutenberg provides multiple reading formats including EPUB (compatible with Apple Books, Kobo, and Android e-readers) and Kindle formats (MOBI/KF8). You can open or download them directly from each book detail page.'
    },
    {
      q: 'Why do some books lack cover art or HTML formats?',
      a: 'Project Gutenberg digitizes historical texts—some published centuries ago. While many classics have modern cover scans and formatted HTML editions, older or rarer editions may only feature original plain text scans. OpenShelf automatically generates tasteful typographic fallback covers when a scanned cover is absent.'
    },
    {
      q: 'Is my reading data private?',
      a: 'Yes. OpenShelf has no backend database, requires no account registration, and uses zero tracking scripts. Your bookmarks, favorites, and reading progress are stored strictly inside your browser’s local storage.'
    },
    {
      q: 'Does public domain status apply in my country?',
      a: 'Project Gutenberg’s digital library is based in the United States, where works published prior to 1929 are free of copyright. Copyright terms vary internationally (such as author’s lifetime plus 50 or 70 years). Readers outside the United States should ensure their download complies with their local copyright laws.'
    }
  ];

  root.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-16 pb-16">
      <!-- Hero -->
      <div class="text-center space-y-4 pt-4">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
          ${renderIcon('book-open', 'w-3.5 h-3.5')}
          <span>OpenShelf — Discover More. Read More.</span>
        </div>
        <h1 class="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
          Democratizing access to the world’s <br class="hidden sm:inline" />
          greatest literary heritage.
        </h1>
        <p class="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
          OpenShelf was created with a clear purpose: to make finding, reading, and downloading public-domain literature effortless, elegant, and accessible to everyone.
        </p>
      </div>

      <!-- Core Principles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div class="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            ${renderIcon('sparkles', 'w-5 h-5')}
          </div>
          <h3 class="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Editorial Experience
          </h3>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Rather than feeling like an antiquated archive or a commercial bookstore, OpenShelf presents classics with modern typography, generous layout, and dark mode support.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            ${renderIcon('check', 'w-5 h-5')}
          </div>
          <h3 class="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Real Data, Zero Fiction
          </h3>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Every title, author biography, and download format is fetched live from genuine Project Gutenberg metadata via Gutendex. No mock data or fake stats.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
            ${renderIcon('library', 'w-5 h-5')}
          </div>
          <h3 class="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Private & Client-Side
          </h3>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Your personal library, favorites, and reading progress reside exclusively on your machine. You can export or import your data as a clean JSON backup anytime.
          </p>
        </div>
      </div>

      <!-- Public Domain Explained -->
      <section class="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          ${renderIcon('info', 'w-4 h-4')}
          <span>Legal Framework</span>
        </div>
        <h2 class="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Understanding the Public Domain
        </h2>
        <p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          The public domain consists of creative works to which no exclusive intellectual property rights apply. These rights may have expired, been forfeited, expressly waived, or may be inapplicable.
        </p>
        <p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          In the United States, works published before 1929 have entered the public domain. This includes foundational texts by Homer, Shakespeare, Jane Austen, Mary Shelley, Charles Dickens, Mark Twain, and hundreds of other historic authors.
        </p>
        <div class="p-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          <strong>International Disclaimer:</strong> Project Gutenberg is based in the United States. Copyright laws vary between nations. If you reside outside the United States, please verify the copyright status of specific works before downloading.
        </div>
      <!-- Creator & Connect Section -->
      <section class="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              ${renderIcon('sparkles', 'w-3.5 h-3.5')}
              <span>Creator & Developer</span>
            </div>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              Evan Hendra Mulyadi
            </h2>
            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
              Creator and developer of OpenShelf. Dedicated to building elegant digital reader experiences and accessible tools for the open-web community.
            </p>
          </div>
          
          <a 
            href="https://about-evan.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md self-start sm:self-center flex-shrink-0">
            ${renderIcon('globe', 'w-4 h-4')}
            <span>Portfolio Website</span>
            ${renderIcon('arrow-up-right', 'w-3.5 h-3.5 opacity-80')}
          </a>
        </div>

        <!-- Social Media Profiles -->
        <div class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Connect & Follow
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <!-- Instagram -->
            <a 
              href="https://www.instagram.com/evanhendraa" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="group flex items-center gap-3.5 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </div>
              <div class="min-w-0 flex-grow">
                <div class="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>Instagram</span>
                  ${renderIcon('arrow-up-right', 'w-3 h-3 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors')}
                </div>
                <div class="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  @evanhendraa
                </div>
              </div>
            </a>

            <!-- YouTube -->
            <a 
              href="https://www.youtube.com/@evanhendraa" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="group flex items-center gap-3.5 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all">
              <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div class="min-w-0 flex-grow">
                <div class="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>YouTube</span>
                  ${renderIcon('arrow-up-right', 'w-3 h-3 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors')}
                </div>
                <div class="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  @evanhendraa
                </div>
              </div>
            </a>

            <!-- TikTok -->
            <a 
              href="https://www.tiktok.com/@evanhendraa" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="group flex items-center gap-3.5 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all">
              <div class="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs border border-stone-700/40">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.48V8.59a8.27 8.27 0 0 0 4.82 1.54V6.69z"/>
                </svg>
              </div>
              <div class="min-w-0 flex-grow">
                <div class="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>TikTok</span>
                  ${renderIcon('arrow-up-right', 'w-3 h-3 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors')}
                </div>
                <div class="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  @evanhendraa
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="space-y-6">
        <div class="border-b border-stone-200 dark:border-stone-800 pb-4">
          <h2 class="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Frequently Asked Questions
          </h2>
        </div>

        <div class="space-y-4">
          ${faqs.map(faq => `
            <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
              <h3 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                ${escapeHTML(faq.q)}
              </h3>
              <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                ${escapeHTML(faq.a)}
              </p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Acknowledgments -->
      <div class="text-center pt-8 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 space-y-2">
        <p>
          Special gratitude to <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" class="underline hover:text-stone-900 dark:hover:text-stone-100">Project Gutenberg</a> and the thousands of volunteer digitizers and proofreaders since 1971.
        </p>
        <p>
          Project Gutenberg™ is a registered trademark of the Project Gutenberg Literary Archive Foundation.
        </p>
      </div>
    </div>
  `;

  initIcons(root);
}

