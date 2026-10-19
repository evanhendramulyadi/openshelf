import { renderIcon, initIcons } from '../utils/icons.js';
import { escapeHTML } from '../utils/dom.js';

let toastCounter = 0;

/**
 * Display a floating toast notification
 * @param {string} message 
 * @param {'success'|'info'|'error'|'warning'} type 
 * @param {number} duration 
 */
export function showToast(message, type = 'info', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const id = `toast-${++toastCounter}`;
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-3 opacity-0 select-none ${
    type === 'success' 
      ? 'bg-emerald-900/90 dark:bg-emerald-950/95 text-emerald-50 border-emerald-700/60'
      : type === 'error'
      ? 'bg-rose-900/90 dark:bg-rose-950/95 text-rose-50 border-rose-700/60'
      : type === 'warning'
      ? 'bg-amber-900/90 dark:bg-amber-950/95 text-amber-50 border-amber-700/60'
      : 'bg-stone-900/90 dark:bg-stone-900/95 text-stone-100 border-stone-700/60'
  }`;

  const iconName = type === 'success' ? 'check' : type === 'error' ? 'x' : type === 'warning' ? 'info' : 'info';

  toast.innerHTML = `
    <span class="flex-shrink-0 text-current">${renderIcon(iconName, 'w-4 h-4')}</span>
    <span class="flex-grow font-medium leading-tight">${escapeHTML(message)}</span>
    <button type="button" aria-label="Close notification" class="flex-shrink-0 text-current/70 hover:text-current ml-2 transition-opacity">
      ${renderIcon('x', 'w-3.5 h-3.5')}
    </button>
  `;

  const closeBtn = toast.querySelector('button');
  const removeToast = () => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 250);
  };

  closeBtn.addEventListener('click', removeToast);

  container.appendChild(toast);
  initIcons(toast);

  // Trigger entrance transition
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-3');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

