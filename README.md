<p align="center">
  <img src="public/images/openshelf-logo.png" alt="OpenShelf Logo" width="100" style="border-radius: 20%;">
</p>

<h1 align="left">OpenShelf</h1>

<p align="center">
  <strong>Digital Library</strong><br>
  <em>Discover, read online, and collect timeless public-domain literature.</em>
</p>

<p align="center">
  OpenShelf is an elegant, editorial digital book discovery platform and web reader designed to help users search, explore, read online, and download over 70,000 legally accessible public-domain e-books directly in their browser without paywalls or accounts.
</p>

## 🌐 Live Demo

Experience the live application here:  
👉 **[OpenShelf](https://openshelf-library.vercel.app/)**

## ✨ Key Features

- **Catalog Search & Discovery**: High-speed, instant search across 70,000+ classic e-books by title, author, or keyword using the Gutendex API with debounced queries and fast caching.
- **Subject & Language Filtering**: Explore classical collections and genres (Fiction, Mystery, Sci-Fi, Philosophy, History, Poetry, etc.) across multiple languages.
- **In-Browser Reading Experience**: Read complete HTML books directly in an edge-to-edge, distraction-free reader seamlessly synchronized with the global Light/Dark theme, reading progress tracking, and fullscreen mode.
- **Direct Format Downloads**: One-click downloads for verified EPUB (Apple Books, Kobo), Kindle (MOBI/KF8), and plain text formats sourced directly from Project Gutenberg.
- **Personal Library & Tracking**: Maintain local Want to Read, Currently Reading, and Finished lists with percentage progress tracking and JSON backup/restore.
- **Dynamic Fallback Covers**: Automatically generates tasteful typographic book covers with debossed borders when historical scans lack original cover images.
- **Upstream Maintenance Protection & Auto-Recovery**: Real-time detection of Project Gutenberg server outages or periodic maintenance (HTTP 503), automatically locking the interface into a maintenance view and restoring browsing the instant upstream servers recover.
- **Private & Client-Side**: Operates entirely in the browser using the `localStorage` API—no registration, no subscriptions, and zero tracking.

### 🛡️ Upstream Maintenance & Zero-Footprint Architecture

OpenShelf implements an intelligent failsafe mechanism synchronized directly with Project Gutenberg's live server health:

- **Automatic Maintenance Synchronization**: When Project Gutenberg undergoes periodic server maintenance (HTTP 503 Service Unavailable), OpenShelf immediately and automatically enters **Maintenance Mode** to protect user experience and prevent broken reader/download states.
- **Complete DOM & Memory Purge (Clean Behind the Scenes)**: During maintenance mode, the normal website layout (`#header-container`, `#footer-container`, search bar, book grids, and catalog views) is **completely removed from the DOM** and **never loaded into browser memory**. Thanks to dynamic module imports (`import()`), normal page chunks are never fetched across the network during an outage.
- **Strict Mode Separation**: The normal website structure **only exists and is only requested when Gutenberg is fully active**. Direct URL hash manipulation (e.g., `#explore`, `#book/84`) during maintenance is automatically intercepted and reset.
- **Self-Healing & Auto-Recovery**: Includes a real-time server check button as well as automated background health polling every 30 seconds. As soon as Project Gutenberg finishes maintenance, OpenShelf automatically mounts the normal web layout and dynamically imports the views without needing a manual browser refresh.

## 🛠️ Tech Stack

- **JavaScript (ES6+ Modules)**: Pure modular vanilla JavaScript with hash routing, dynamic imports for on-demand code-splitting, API resilience, and reactive state management.
- **Vite**: Ultra-fast frontend development server and production bundler.
- **Tailwind CSS (v4)**: Modern responsive design system with custom typography, dark mode, and warm editorial palette.
- **Lucide Icons**: Clean, accessible SVG iconography.
- **Gutendex & Project Gutenberg**: Real-time REST API for ebook catalog metadata and digital editions.
- **Open Library API**: Supplementary metadata lookup for publication dates and catalog records.
- **Hosting**: [Vercel](https://vercel.com)

## 💻 Local Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/evanhendramulyadi/openshelf.git
   cd openshelf
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Then open `http://localhost:3000` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📄 Copyright & Ownership

© 2026–Present Evan Hendra Mulyadi. All Rights Reserved.

This project is an original work created by **Evan Hendra Mulyadi**.

This repository is publicly accessible solely for viewing, studying, and reviewing the source code. Public access does **not** grant permission to copy the entire project, rebrand or rename it, remove attribution, or claim it as your own creation. Re-use or distribution without explicit permission from the author is strictly prohibited.

*Note: E-book texts, illustrations, scans, and historical metadata belong to their respective original authors, translators, and publishers, and are accessed in accordance with their public-domain status or Project Gutenberg licenses.*
