# Hanos — Illustrated Space Presentation

A monochrome, illustrated space landing page and presentation for Hanos (Planet X & SPHEREx / NASA Space Apps Challenge 2026).

## Open Locally

You can open `dist/index.html` directly in any web browser without any build step, or run the local development server:

```sh
node serve.js
```

Or using npm:

```sh
npm start
```

Or using Python:

```sh
python -m http.server 8080 --directory dist
```

Then visit `http://localhost:8080`.

## Features

- **Continuous Flow & Parallax**: Smooth scrolling storytelling with interactive scenes and responsive layout.
- **Interactive Story & Challenge**: SPHEREx mission overview, Planet X challenge details, and team showcase.
- **Pure Web Technologies**: Built with modern semantic HTML5, CSS, and vanilla JavaScript.
- **Fast & Self-Contained**: Self-hosted typography, lightweight SVG assets, optimized WebP imagery, and smooth Lenis integration.

## Project Structure

```text
├── dist/
│   ├── assets/          # Fonts, SVGs, team portraits, logos, licenses
│   ├── index.html       # Main landing page
│   ├── challenge.html   # Mission & challenge details
│   ├── journey.css      # Storytelling and parallax styling
│   ├── styles.css       # Core design system and theme
│   └── *.js             # Motion, scroll, and interactive controls
├── package.json         # Project metadata and run scripts
├── serve.js             # Zero-dependency local Node.js static server
├── SOURCES.md           # Mission and challenge citations
└── README.md
```
