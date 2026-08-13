# FARMS International — Documentation

Reference documentation for the [farmsinternational.com](https://farmsinternational.com) website.
It describes the site **as currently built in this repository**, at a level of detail intended to let a
tester write complete test cases without opening the live site.

| Document | Covers |
|---|---|
| [Functional specification](functional-spec.md) | Every page, section, and interactive behavior — element IDs, states, triggers, expected results |
| [Forms and backend](forms-and-backend.md) | Client validation, reCAPTCHA, AJAX contracts, PHP handlers, email output, error paths |
| [Analytics](analytics.md) | GA4 configuration, every event, parameter values, and where each is triggered |
| [Content inventory](content-inventory.md) | Exhaustive link/asset/PDF/country tables for verifying content |
| [Build, test, and deploy](build-test-deploy.md) | Build pipeline, local dev, test suite inventory, CI/CD, server configuration |
| [Known issues and quirks](known-issues.md) | Verified defects and surprising-but-current behaviors a tester will hit |
| [Test matrix](test-matrix.md) | Feature → coverage traceability, plus the gaps automated tests do not cover |

## Conventions used in these docs

- **Selector** notation is CSS (`#email-form`, `.required-error`). Selectors listed here are the actual
  IDs and classes in the shipped HTML and are safe to use as test hooks.
- **Breakpoints** are the ones the stylesheet actually uses: `600px`, `768px`, `992px`, `1024px`
  (plus the Bootstrap 4 `lg` grid boundary at `992px` for the navbar collapse).
- "Homepage" means `src/index.html`, served at `/`.
- Behavior marked **[verified]** was confirmed by running the site locally in Chromium against the
  current `master` content, not inferred from source.

## System summary

Static HTML site with two PHP form handlers, no database, no CMS, and no server-side rendering.

| Aspect | Value |
|---|---|
| Pages | `/` (homepage), `/resources.html`, `/gala.html`, `/404.html`; `brand-guide.html` is dev-only and not deployed |
| Server | DreamHost shared hosting, PHP; static files served directly |
| Front end | Bootstrap 4.3.1, jQuery 3.4.1, jQuery Easing, Fancybox 3.0.11, Font Awesome Free 5.10.2 |
| Custom JS | `agency.js`, `analytics.js`, `farms.js`, `plugins.js`, `world-map.js` — concatenated into one bundle |
| Mail | PHPMailer 5.2.28 over SMTP (port 587, auth on, `SMTPAutoTLS` off) |
| Bot protection | Google reCAPTCHA v2 invisible (site key `6Lc8_TYUAAAAANc47TO81_x4gGwS8IPHQZRRAMg2`) |
| Analytics | Google Analytics 4 `G-HE9ZHJ520Q`, Microsoft Clarity `4097w0tyc2` (homepage only) |
| Third-party widgets | Aplos donations, Engiven crypto donations, Mailchimp signup, YouTube, Vimeo, ECFA, GuideStar |
| Tests | Playwright, 79 tests per browser project (Chromium + Firefox) = 158 total |
