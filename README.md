# OpenShelf — Discover More. Read More.

> **Discover More. Read More.**

OpenShelf is an editorial, modern digital book discovery platform and web reader. It provides a clean, distraction-free interface to discover, read online, and download over 70,000 public-domain books legally accessible from Project Gutenberg and Open Library.

Built with Vanilla JavaScript (ES modules), Vite, Tailwind CSS, and Lucide icons, OpenShelf operates entirely client-side with zero mandatory user registration, zero tracking, and no paywalls.

---

## Features

### 1. Catalog Discovery & Book Search
- **Live Search**: Instant keyword search querying titles and author names directly against the Gutendex API with keystroke debouncing.
- **Subject Filtering**: Browse books across classical genres (Fiction, Mystery, Sci-Fi, Philosophy, History, Poetry, Adventure, Drama, Children's, Gothic, Science, Short Stories).
- **Language Filtering**: Explore works in English, French, German, Spanish, Italian, Latin, Ancient Greek, and more.
- **Sorting Modes**: Sort by verified download popularity, newest catalog uploads, or chronological Gutenberg IDs.
- **Real Pagination**: Seamless page navigation preserving query parameters and active filters in the URL hash.

### 2. Editorial Book Presentation
- **Metadata Cards**: View cover artwork with 3D spine and depth effect, author lifetime dates, subject classifications, and verified Gutenberg download counts.
- **Supplementary Metadata**: Integrates Open Library API to retrieve first publication years and catalog references.
- **Dynamic Fallback Covers**: When a historical scanned cover is unavailable, OpenShelf generates an elegant, debossed typographic cover with custom color palettes matching the book's title.
- **Deep Linking**: Shareable, bookmarkable URLs for individual books (`#/book/:id`) and subject views (`#/explore?topic=fiction`).

### 3. In-Browser Reader
- **Distraction-Free HTML Reader**: Read supported Gutenberg editions directly in the browser with an embedded, accessible viewport.
- **Ambient Reading Themes**: Toggle between Day (Clean Off-White), Sepia (Warm Paper), Night (Deep Charcoal), and OLED Black.
- **Progress Tracking**: Record and update reading progress percentage (0%, 25%, 50%, 75%, 100% / Finished) with instant persistence.
- **Fullscreen Mode & External Links**: Expand reader to true fullscreen or open the original source in an external tab.

### 4. Direct Downloads
- **Format Verification**: Inspects actual MIME types returned by Project Gutenberg.
- **Multiple Formats**: Direct links for EPUB (Apple Books, Kobo, Android), Kindle (MOBI/KF8), Plain Text (UTF-8), and zipped HTML archives.
- **Original Source Preservation**: All download actions direct to official Project Gutenberg servers.

### 5. Personal Library (LocalStorage)
- **Reading List**: Organize books into *Want to Read*, *Currently Reading*, and *Finished* categories.
- **Favorites**: Quick one-click favoriting with reactive badge counters in the navigation header.
- **Data Export & Import**: Backup and restore your complete library state as a portable JSON file.
- **Zero-Registration Privacy**: All library items, progress, and preferences remain in your browser's private local storage.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Vite** | Build tool, local development server, and asset bundling |
| **Vanilla JavaScript (ES Modules)** | Clean, modular application logic without heavy framework overhead |
| **Tailwind CSS (v4)** | Official Vite integration, responsive layout, dark mode, custom typography |
| **Lucide Icons** | Accessible, lightweight SVG iconography |
| **Gutendex API** | Real-time REST API for Project Gutenberg book catalog and metadata |
| **Open Library API** | Supplementary publication metadata and catalog references |
| **HTML5 Web Storage** | LocalStorage API for offline personal library persistence |

---

## Project Structure

```
openshelf/
├── dist/                      # Production build output
├── public/
│   ├── favicon-32.png         # 32x32 rounded 20% favicon
│   ├── favicon-192.png        # 192x192 rounded 20% favicon
│   └── images/
│       └── logo-openshelf.png # High-res rounded 20% brand logo
├── src/
│   ├── app/
│   │   └── router.js          # Hash-based client-side router & params parser
│   ├── components/
│   │   ├── book-card.js       # Book presentation card & interactive triggers
│   │   ├── book-grid.js       # Responsive book grid layouts
│   │   ├── fallback-cover.js  # Typographic fallback book covers
│   │   ├── footer.js          # Global site footer with legal attribution
│   │   ├── header.js          # Responsive navigation bar & theme toggle
│   │   ├── loading-state.js   # Skeleton loaders, empty states, error retry UI
│   │   ├── search-bar.js      # Debounced search bar with quick query pills
│   │   └── toast.js           # Accessible notification toasts
│   ├── pages/
│   │   ├── about.js           # Mission, tech stack, copyright FAQ
│   │   ├── book-details.js    # Comprehensive metadata, download & read actions
│   │   ├── categories.js      # Subject directory with live preview
│   │   ├── explore.js         # Search engine, subject & language filters, pagination
│   │   ├── home.js            # Hero, featured classics, popular downloads
│   │   ├── my-library.js      # Personal reading list, favorites, JSON backup
│   │   └── reader.js          # Web reader with themes and progress logger
│   ├── services/
│   │   ├── book-service.js    # Domain service, categories, user state enrichment
│   │   ├── gutendex.js        # Gutendex API client, caching, and normalizer
│   │   └── open-library.js    # Open Library API client for supplementary metadata
│   ├── utils/
│   │   ├── dom.js             # Sanitization, escapeHTML, debounce, DOM helpers
│   │   ├── formatters.js      # Author name parsing, language codes, number formatting
│   │   ├── icons.js           # Lucide icon registry and hydration
│   │   └── storage.js         # Safe LocalStorage wrapper with event dispatching
│   ├── main.js                # App entry point
│   └── style.css              # Tailwind base, dark mode, and editorial styles
├── index.html                 # HTML shell with Google Fonts & layout containers
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration with @tailwindcss/vite
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or later recommended; tested with v22.18.0)
- npm (version 9.0.0 or later)

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/openshelf.git
   cd openshelf
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser to `http://localhost:3000` (or the URL indicated in the terminal).

### Production Build

Compile and optimize the application for production:

```bash
npm run build
```

The production assets will be output to the `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

---

## Deployment Guidance

Because OpenShelf is a 100% static client-side web application using hash routing (`#/`, `#/explore`, `#/book/:id`, etc.), it can be deployed to any static host without special server configuration or URL rewriting:

- **GitHub Pages**: Deploy the `dist/` directory or run a GitHub Action using `npm run build`.
- **Vercel / Netlify / Cloudflare Pages**: Connect your Git repository, set the build command to `npm run build`, and set the publish directory to `dist`.
- **Static Web Server (Nginx / Apache / Caddy / S3)**: Copy the contents of `dist/` directly to your public web root.

---

## Data Storage & Client-Side Limitations

- **No Remote Database**: User data (Favorites, Reading List, Finished Books, Reading Progress, and Theme settings) is stored strictly in the browser's `localStorage`.
- **Per-Device Scope**: Stored books do not automatically sync across different browsers or devices. Use the **Backup Data** feature on the *My Library* page to export a JSON file and import it into another device.
- **Private Browsing Mode**: In Incognito or Private Browsing modes, `localStorage` is cleared upon closing the browser session.

---

## Book Access, Legal & Copyright Notes

- **Primary Source**: Book catalog metadata and digital files originate from [Project Gutenberg](https://www.gutenberg.org/) via the [Gutendex API](https://gutendex.com/), with supplementary metadata from [Open Library](https://openlibrary.org/).
- **Public Domain in the United States**: The vast majority of books in Project Gutenberg are in the public domain in the United States because their copyright has expired (generally works published before 1929).
- **International Users**: Copyright laws vary by jurisdiction (e.g., author's life plus 50 or 70 years). If you reside outside the United States, please verify that reading or downloading a specific title complies with your local copyright laws before accessing it.
- **Attribution**: Project Gutenberg™ is a registered trademark of the Project Gutenberg Literary Archive Foundation. OpenShelf is an independent, non-commercial interface designed for free educational and public access.

---

## Copyright & Ownership Notice

**© 2026–Present Evan Hendra Mulyadi. All Rights Reserved.**

This copyright notice protects the original work of the OpenShelf website, including its source code, original visual design, user interface layout, branding, and creative assets authored by Evan Hendra Mulyadi.

E-book texts, illustrations, scans, and historical metadata belong to their respective original authors, translators, and publishers, and are accessed in accordance with their public-domain status or Project Gutenberg licenses.

E-book texts, illustrations, scans, and historical metadata belong to their respective original authors, translators, and publishers, and are accessed in accordance with their public-domain status or Project Gutenberg licenses.

