<p align="center">
  <img src="public/images/logo-openshelf.png" alt="OpenShelf Logo" width="100" style="border-radius: 20%;">
</p>

<h1 align="center">OpenShelf</h1>

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
- **Private & Client-Side**: Operates entirely in the browser using the `localStorage` API—no registration, no subscriptions, and zero tracking.

## 🛠️ Tech Stack

- **JavaScript (ES6+ Modules)**: Pure modular vanilla JavaScript for hash routing, API integration, and reactive state management.
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
