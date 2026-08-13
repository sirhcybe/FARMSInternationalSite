# Build, test, and deploy

## 1. Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| Node.js | ≥ 24 (enforced by `package.json` `engines`) | build, dev server, tests |
| npm | bundled with Node | dependency install |
| Playwright browsers | installed via `npx playwright install` | tests |
| PHP | server-side only (DreamHost) | contact form handlers — not required locally |

Dev dependencies: `@playwright/test ^1.52.0`, `esbuild ^0.25.0`, `http-server ^14.1.1`.
`composer.json` declares `phpmailer/phpmailer ^7.0`, but the deployed code actually uses the
**vendored PHPMailer 5.2.28** files checked into `src/` (`class.phpmailer.php`, `class.smtp.php`,
`class.pop3.php`, `PHPMailerAutoload.php`). Composer is not run by CI.

## 2. Commands

```bash
npm install                                    # install dev dependencies
npm run build                                  # bundle + minify into src/dist/, rewrite HTML refs
npm run dev                                    # http-server on src/ at :8080, cache disabled, opens browser
npm test                                       # Playwright: Chromium + Firefox, headless
npm run test:ui                                # Playwright UI mode
npx playwright test tests/home.spec.js         # one spec file
npx playwright test --grep "title"             # tests matching a pattern
npx playwright test --project=chromium         # one browser project
```

## 3. Build pipeline (`build.mjs`)

1. **Clean** — `src/dist/` is removed and recreated, so stale hashed bundles never accumulate.
2. **JS bundle** — files are read and joined with `;\n` in this fixed order:
   `vendor/jquery/jquery.min.js` → `vendor/bootstrap/js/bootstrap.bundle.min.js` →
   `vendor/jquery-fancybox/jquery.fancybox.min.js` → `vendor/jquery-easing/jquery.easing.min.js` →
   `vendor/jqBootstrapValidation.js` → every `src/js/*.js` sorted alphabetically. The result is minified
   with `esbuild.transform({ minify: true, loader: 'js' })`.
   *Any new file added to `src/js/` is picked up automatically, and its alphabetical position determines
   its execution order.*
3. **CSS bundle** — `vendor/bootstrap/css/bootstrap.min.css` →
   `vendor/jquery-fancybox/jquery_fancybox_min.css` → every `src/css/*.css` sorted alphabetically, joined
   with `\n` and minified with the `css` loader.
4. **Fingerprint** — the first 8 hex characters of the SHA-256 of the *minified* output become the
   filename: `farms.<hash>.min.js` / `farms.<hash>.min.css`.
5. **HTML rewrite** — for `src/index.html`, `src/404.html`, `src/gala.html`, `src/resources.html`, and
   `src/brand-guide.html`, the regexes `/farms\.[a-f0-9]+\.min\.js|farms\.\d+\.\d+\.min\.js/g` and the CSS
   equivalent are replaced with the new filenames. Missing files are skipped silently.

Current output sizes: ~232 KB JS, ~180 KB CSS (minified, unzipped).

**Testing implications**

- `src/dist/` is gitignored, so a fresh clone has no bundle: **`npm run build` must run before the dev
  server or the tests**, otherwise every page loads with no CSS and no JS.
- The build **rewrites tracked HTML files**. If the committed hash is stale, running the build produces a
  one-line diff in each of the five HTML files. That is expected; commit it or revert it deliberately.
- No sourcemaps are produced, and vendor files are never re-minified from source.

## 4. Local dev server

`npm run dev` runs `npx http-server src -p 8080 -c-1 -o` — document root `src/`, caching disabled,
browser opened automatically. It is a **static** server: `.php` files are served as raw text, so contact
form submissions cannot be exercised locally. To test the PHP handlers you need a PHP-capable host and a
valid `src/config.php`.

## 5. Test suite

Configuration (`playwright.config.js`):

| Setting | Value |
|---|---|
| `testDir` | `./tests` |
| `baseURL` | `http://localhost:8080` |
| `fullyParallel` | `true` |
| `forbidOnly` | `true` in CI |
| `retries` | `1` in CI, `0` locally |
| `reporter` | `github` in CI, `list` locally |
| `trace` | `on-first-retry` |
| Projects | `chromium` (Desktop Chrome), `firefox` (Desktop Firefox) |
| `webServer` | `npx http-server src -p 8080 -c-1 --silent`, port 8080, `reuseExistingServer` unless CI |

**79 tests per project → 158 total.** All 79 Chromium tests pass against the current build
**[verified]** (run locally with the sandbox's Chromium binary; the external CDN/font requests fail in an
offline environment without affecting results).

| Spec | Tests | Coverage |
|---|---|---|
| `tests/home.spec.js` | 39 | title, favicon, console errors, navbar + logo + nav links + donate dropdown + mobile hamburger, presence of all seven sections, `#farmsAge`, interactive map render, contact form fields and empty-submit validation, mailing form fields and empty-submit validation, Mailchimp field/button/empty-submit, footer copyright/socials/seals |
| `tests/resources.spec.js` | 24 | title, navbar, logo href, jumbotron, footer, all 8 country anchors present with ≥1 link each, PDF newsletter links, `target="_blank"` on the first three newsletter links, Thailand fancybox links |
| `tests/gala.spec.js` | 10 | title, header + logo, logo href, `Building Legacy` heading, invitation heading, tagline, RSVP button href/target, body text, banner section, footer |
| `tests/404.spec.js` | 6 | title, navbar, 404 heading, "Page Not Found" copy, homepage button href, footer |

The "loads without console errors" test filters out third-party noise: any message containing
`recaptcha`, `google`, `aplos`, `cdn.`, `analytics`, `CORS`, `net::`, `NS_BINDING`, `youtube`,
`SameSite`, `Cookie`, `juggler`, `compute-pressure`, or `Permissions policy`. Only first-party errors
fail the test.

**Environment note** — Playwright's Chromium routes through any configured HTTP proxy. In a sandboxed
environment where `localhost:8080` is proxied, every navigation fails with
`net::ERR_HTTP_RESPONSE_CODE_FAILURE`; ensure loopback traffic bypasses the proxy before concluding the
suite is broken.

## 6. Continuous integration and deployment

`.github/workflows/deploy.yml`, triggered on push to `master` or `staging`, and by manual
`workflow_dispatch`:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` with Node 24
3. `npm install`
4. `npm run build`
5. `npx playwright install --with-deps chromium firefox`
6. `npm test` — **a failing test stops the deploy**
7. Resolve target path: `secrets.DEPLOY_PATH_STAGING` when the branch is `staging`, otherwise
   `secrets.DEPLOY_PATH`
8. `apt-get install lftp`, then mirror over SFTP:

```
mirror --reverse --delete --verbose \
  --exclude='^\.git' --exclude='\.DS_Store' \
  --exclude='^config\.php$' --exclude='^error_log\.txt$' \
  --exclude='^brand-guide\.html$' \
  ./src/ $TARGET_PATH
```

`--delete` means the remote is made to match `src/` exactly; anything on the server that is not in
`src/` and not excluded is removed. Excluded paths are relative to `src/`, which is why the server's
`config.php` and accumulated `error_log.txt` survive deploys.

Required repository secrets:

| Secret | Purpose |
|---|---|
| `DEPLOY_HOST` | SFTP hostname |
| `DEPLOY_USER` | SFTP username |
| `DEPLOY_PASSWORD` | SFTP password |
| `DEPLOY_PATH` | remote web root for production (`master`) |
| `DEPLOY_PATH_STAGING` | remote web root for staging (`staging`) |

`robots.txt` disallows `/staging`, so the staging environment is excluded from crawling.

## 7. First-time server setup

1. Copy `src/config.example.php` to `src/config.php` **on the server** (it is gitignored and never
   deployed) and fill in `smtpemail`, `smtppassword`, `smtpserver`, `mailto`, and
   `recaptchaprivatekey`.
2. Confirm the reCAPTCHA site key in `src/js/farms.js`
   (`6Lc8_TYUAAAAANc47TO81_x4gGwS8IPHQZRRAMg2`) is paired with the secret key in `config.php` and that
   the domain is registered in the reCAPTCHA admin console.
3. Ensure outbound HTTPS from PHP is permitted (`file_get_contents` to Google's siteverify endpoint) and
   that SMTP port 587 is reachable.
4. Ensure the web root is writable so `error_log.txt` can be created.
5. Configure the host's error document to serve `/404.html` for unknown paths.

## 8. Release checklist

- [ ] `npm run build` run and the resulting HTML hash changes committed
- [ ] `npm test` green locally (both projects)
- [ ] New PDFs added to `src/newsletters/` **and** to `sitemap.xml`
- [ ] Footer copyright years updated on all four pages at the turn of the year (currently 2025 / 2024)
- [ ] `brand-guide.html` still unlinked from every live page
- [ ] No new page links to `premiumsubmit.php`
