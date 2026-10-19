/**
 * DOM manipulation and sanitization utilities
 */

/**
 * Escapes unsafe characters from strings to prevent XSS
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Query selector shorthand
 * @param {string} selector 
 * @param {HTMLElement|Document} scope 
 * @returns {HTMLElement|null}
 */
export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * Query selector all shorthand
 * @param {string} selector 
 * @param {HTMLElement|Document} scope 
 * @returns {HTMLElement[]}
 */
export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Debounce helper for rate-limiting events like search keystrokes
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Scroll reliably to the very top of the document with smooth animation by default
 * @param {boolean} [smooth=true]
 */
export function scrollToTop(smooth = true) {
  try {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  } catch (e) {
    window.scrollTo(0, 0);
  }
  if (!smooth) {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

