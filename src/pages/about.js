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

