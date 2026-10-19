import { escapeHTML } from '../utils/dom.js';

const PALETTES = [
  { bg: 'bg-[#4a2e2b]', text: 'text-[#f5e6d3]', border: 'border-[#7a4e48]' }, // Warm Burgundy
  { bg: 'bg-[#1e3231]', text: 'text-[#e2f1ec]', border: 'border-[#325250]' }, // Dark Teal
  { bg: 'bg-[#2b3342]', text: 'text-[#e5ebf5]', border: 'border-[#435068]' }, // Midnight Navy
  { bg: 'bg-[#3b342a]', text: 'text-[#f5eee2]', border: 'border-[#5e5343]' }, // Warm Espresso
  { bg: 'bg-[#372b3c]', text: 'text-[#f0e2f5]', border: 'border-[#584560]' }, // Deep Plum
  { bg: 'bg-[#2d382e]', text: 'text-[#e2ede3]', border: 'border-[#465747]' }, // Forest Pine
];

function getPalette(seed = 0) {
  const index = Math.abs(Number(seed) || 0) % PALETTES.length;
  return PALETTES[index];
}

/**
 * Generate fallback book cover HTML string
 * @param {Object} book 
 * @param {string} customClass 
 * @returns {string} HTML string
 */
export function renderFallbackCover(book, customClass = '') {
  const palette = getPalette(book.id || book.title?.length || 0);
  const title = book.title || 'Untitled Book';
  const author = book.authorNames || 'Unknown Author';

  return `
    <div class="relative w-full h-full aspect-[2/3] ${palette.bg} ${palette.text} p-4 flex flex-col justify-between select-none book-spine overflow-hidden ${customClass}">
      <!-- Debossed border frame -->
      <div class="absolute inset-2 border ${palette.border} pointer-events-none opacity-60"></div>
      
      <!-- Top header / classic library badge -->
      <div class="relative z-10 text-[9px] uppercase tracking-widest opacity-75 font-sans">
        Project Gutenberg
      </div>

      <!-- Center Title & Author -->
      <div class="relative z-10 my-auto text-center px-1">
        <h3 class="font-serif text-sm sm:text-base font-bold leading-tight line-clamp-3 mb-2">
          ${escapeHTML(title)}
        </h3>
        <p class="text-xs font-sans opacity-85 line-clamp-2">
          ${escapeHTML(author)}
        </p>
      </div>

      <!-- Bottom footer emblem -->
      <div class="relative z-10 text-center opacity-65">
        <div class="w-6 h-px mx-auto bg-current mb-1 opacity-50"></div>
        <span class="text-[8px] uppercase tracking-wider font-sans">OpenShelf Edition</span>
      </div>
    </div>
  `;
}

/**
 * Attaches graceful fallback handler to an <img> element
 * @param {HTMLImageElement} img 
 * @param {Object} book 
 */
export function setupImageFallback(img, book) {
  if (!img) return;
  img.addEventListener('error', function onError() {
    this.removeEventListener('error', onError);
    const parent = this.parentElement;
    if (parent) {
      const fallback = document.createElement('div');
      fallback.innerHTML = renderFallbackCover(book);
      const child = fallback.firstElementChild;
      if (child) {
        parent.replaceChild(child, this);
      }
    }
  }, { once: true });
}

