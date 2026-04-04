# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FARMS International nonprofit website — a static HTML/PHP site hosted on DreamHost shared hosting. Bootstrap 4 + jQuery frontend, PHP backend for form handling (PHPMailer + reCAPTCHA). Deployed via GitHub Actions SFTP.

## Commands

```bash
npm install              # Install dependencies
npm run build            # Bundle & minify JS/CSS into src/dist/ (esbuild)
npm run dev              # Dev server at http://localhost:8080
npm test                 # Run Playwright tests (Chromium + Firefox, headless)
npm run test:ui          # Playwright interactive UI mode
npx playwright test tests/home.spec.js              # Run a single test file
npx playwright test tests/home.spec.js --grep "title"  # Run tests matching a pattern
```

## Architecture

### Build Pipeline (build.mjs)
esbuild bundles all vendor JS (jQuery, Bootstrap, plugins) and custom JS into a single `src/dist/farms.[hash].min.js`. Same for CSS into `src/dist/farms.[hash].min.css`. Content-hash filenames for cache busting. After bundling, the build script regex-replaces script/link references in all HTML files to point to the new hashed filenames.

### Source Layout
- `src/` — web root, everything here gets deployed
  - `index.html`, `resources.html`, `gala.html`, `404.html` — site pages
  - `js/` — custom scripts: `agency.js` (scroll/nav), `analytics.js` (GA4 event tracking), `farms.js` (forms/validation), `world-map.js` (interactive SVG map), `plugins.js` (polyfills)
  - `css/farms.css` — custom styles
  - `vendor/` — third-party libs (Bootstrap 4, jQuery, Fancybox, Font Awesome)
  - `contactsubmit.php`, `premiumsubmit.php` — form handlers (SMTP via PHPMailer)
  - `config.example.php` — template for server credentials (copy to `config.php`)
  - `newsletters/` — PDF archive
  - `img/world-map.svg` — interactive SVG map (177 countries)
- `tests/` — Playwright E2E tests (home, resources, gala, 404)

### Key Patterns
- **Analytics tracking** uses `data-track` HTML attributes (values: `donation`, `pdf`, `outbound`, `newsletter-signup`) — parsed by `analytics.js`. No inline onclick handlers.
- **World map regions** are defined in `world-map.js` via ISO 3166-1 alpha-2 country codes. Edit the `regions` array to change highlighted countries.
- **Forms** use reCAPTCHA v2 invisible + AJAX submission to PHP handlers.

### Deployment
- Push to `master` → deploys to production via GitHub Actions SFTP
- Push to `staging` → deploys to staging environment
- CI runs: install → build → test → deploy (tests gate deployment)
- Excluded from deploy: `.git`, `config.php`, `error_log.txt`, `brand-guide.html`
- Server credentials stored as GitHub repository secrets

### Testing
Tests run against `http://localhost:8080` — Playwright auto-starts `http-server`. Tests cover page content, navigation, interactive map, forms, footer, and analytics script loading. Tests run on both Chromium and Firefox. In CI, failed tests retry once.
