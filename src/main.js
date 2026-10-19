import './style.css';
import { renderFooter } from './components/footer.js';
import { initRouter } from './app/router.js';

document.addEventListener('DOMContentLoaded', () => {
  // Render persistent site footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    renderFooter(footerContainer);
  }

  // Initialize Hash Router
  initRouter();
});

