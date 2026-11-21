import './style.css';
import { renderFooter } from './components/footer.js';
import { initRouter } from './app/router.js';

// Ensure browser scroll restoration is disabled so refreshing always lands at top instantly without animation
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', () => {
  // Render persistent site footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    renderFooter(footerContainer);
  }

  // Initialize Hash Router
  initRouter();
});

