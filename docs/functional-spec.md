# Functional specification

Describes every page and interactive behavior of the FARMS International site as currently built.
Forms and their server handlers are specified separately in [forms-and-backend.md](forms-and-backend.md);
analytics events in [analytics.md](analytics.md); exact link/content lists in
[content-inventory.md](content-inventory.md).

---

## 1. Site-wide behavior

### 1.1 Pages and routes

| Route | File | Title | Deployed |
|---|---|---|---|
| `/` | `src/index.html` | `FARMS International` | Yes |
| `/resources.html` | `src/resources.html` | `FARMS International \| Resources` | Yes |
| `/gala.html` | `src/gala.html` | `FARMS International \| Gala` | Yes |
| `/404.html` | `src/404.html` | `Page not found - FARMS International` | Yes |
| `/coffee/` | `src/coffee/index.php` | — | Yes (redirect only) |
| `/contactsubmit.php` | form handler | — | Yes |
| `/premiumsubmit.php` | legacy form handler | — | Yes (unreferenced) |
| `/brand-guide.html` | `src/brand-guide.html` | `FARMS International` | **No** — excluded from deploy |

`/coffee/` issues a PHP `Location:` redirect to `https://www.coffeehelpingfarms.com` (302). No HTML body
is emitted.

`404.html` is a normal document served at its own URL. Whether the web server returns it for unknown
paths is a server (`.htaccess`/DreamHost) setting; the repository contains no `.htaccess`, so an
unknown-path test must be run against the deployed environment, not the local dev server.

### 1.2 Shared `<head>` contract

All four HTML pages include:

- `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">`,
  `<meta http-equiv="x-ua-compatible" content="ie=edge">`.
- Identical `description` and `keywords` meta content (the generic FARMS description) on **all four
  pages**, including 404 and Gala.
- Favicons: `/favicon-96x96.png` (96×96 PNG), `/favicon.svg`, `/favicon.ico`, `/apple-touch-icon.png`
  (180×180), `<meta name="apple-mobile-web-app-title" content="FARMS">`, `<link rel="manifest" href="/site.webmanifest">`.
- Fonts: `vendor/fonts/montserrat.css` and `vendor/fonts/droid.css`. Both are local CSS files whose
  `@font-face` rules point at `https://fonts.gstatic.com` — **font files come from Google's CDN at runtime**.
- Font Awesome: `vendor/fontawesome-free/css/all.min.css` on homepage, resources, and gala. **Not
  present on `404.html`** (see [known issues](known-issues.md#ki-04)).
- Bundled stylesheet: `dist/farms.<hash>.min.css`.
- GA4 gtag snippet configured with `G-HE9ZHJ520Q`, loaded from `googletagmanager.com` in `<head>` before
  the bundle so `gtag()` exists when the bundle executes.

The homepage additionally carries an inline `<style>` block for the `#banner` promo bar (see §2.2) and,
at the end of `<body>`, the Microsoft Clarity loader (`4097w0tyc2`) and the reCAPTCHA API script.

### 1.3 Shared script bundle

Every page loads exactly one script bundle, `dist/farms.<hash>.min.js`, immediately before `</body>`.
It contains, in this order: jQuery 3.4.1 → Bootstrap 4.3.1 bundle → Fancybox 3.0.11 → jQuery Easing →
jqBootstrapValidation 1.3.6 → then `src/js/*.js` in alphabetical order: `agency.js`, `analytics.js`,
`farms.js`, `plugins.js`, `world-map.js`.

Consequences a tester should know:

- All custom scripts run on every page. Handlers bound to elements that do not exist on a page simply
  bind to nothing; no errors are thrown.
- The bundle filename is content-hashed, so it changes whenever any source file changes. Tests must not
  hard-code the hash.
- Because the files are concatenated into one script, top-level `var` declarations are shared globals.
  This causes the `window.FARMS` collision documented in [known issues](known-issues.md#ki-01).

### 1.4 Navigation bar

Two navbar variants exist:

| | Homepage | Resources | 404 | Gala |
|---|---|---|---|---|
| Element | `nav#mainNav` | `nav#secondaryNav` | `nav#secondaryNav` | none (custom `.gala-header`) |
| Classes | `navbar navbar-expand-lg navbar-dark fixed-top` | same + `fixed-top` | `navbar navbar-expand-lg navbar-dark` (**not** fixed) | — |
| Brand target | `#page-top` | `/` | `/` | `/` |
| Brand image | `img/logo/FARMS-logo-onwhite.png` | `img/logo/FARMS-logo-onblack.png` | `img/logo/FARMS-logo-onblack.png` | `img/logo/FARMS-logo-onblack.png` |
| Menu items | 4 links + DONATE dropdown | 4 links + DONATE dropdown | none | none |
| Background | transparent at top, `--black` when shrunk | always `--black` | always `--black` | — |

Menu items on homepage (`href` values): `#what-we-do`, `#projects`, `#coffee`, `#contact`.
On resources the same items point at the homepage: `/#what-we-do`, `/#projects`, `/#coffee`, `/#contact`.
A "Gala" item and a "Resources" item exist in the markup but are HTML-commented out on both pages.

**Scroll shrink** (`agency.js`): on every `window.onscroll`, if `#mainNav` exists and its
document offset top is greater than `100`px, the class `navbar-shrink` is added; otherwise removed.
The check also runs once at script execution, so a page loaded already scrolled renders shrunk.
**[verified]** at scrollY 0 the class list is `navbar navbar-expand-lg navbar-dark fixed-top`; after
`window.scrollTo(0, 500)` it becomes `… fixed-top navbar-shrink`.

Visual effects of `navbar-shrink` (≥992px): padding collapses from 25px to 0 top and bottom, background
becomes `--black`, nav link color becomes white and weight 500, and `#logo` swaps to
`img/logo/FARMS-logo-onblack.png` via CSS `content:url(...)`.

At ≤768px the logo is always the on-black variant and its height is 80px (140px otherwise), nav links
are always white, the DONATE button spans full width, and the last `<li>` gets a top border.

**Hamburger menu**: `button.navbar-toggler` with `data-toggle="collapse"`, `data-target="#navbarResponsive"`,
`aria-label="Toggle navigation"`, containing `<i class="fas fa-bars">`. Visible below the Bootstrap `lg`
breakpoint (992px). Clicking toggles the `show` class on `.navbar-collapse`.

**DONATE dropdown**: `a.dropdown-toggle.nav-link.-center.btn.btn-primary.-nav-bold` with
`data-toggle="dropdown"`, `role="button"`, `aria-haspopup="true"`, `aria-expanded="false"`. Its
`.dropdown-menu` contains two items:

1. `ONLINE DONATION` — `a.aplos-donation-button` with `data-widget-id="24E7EE7BBE9CF54658F113B3D811E098"`
   and **no `href`**. The Aplos script (`https://cdn.aplos.com/widgets/donations/1.0.2/donations.min.js`)
   binds to the class and opens the donation widget overlay. Requires network access to Aplos.
2. `CRYPTO DONATION` — `href="https://platform.engiven.com/give/776/widget/554"`, `target="_blank"`.

The dropdown menu is in the DOM at all times and becomes visible on toggle click **[verified]**.

**Smooth scrolling** (`agency.js`): any `a.js-scroll-trigger` whose `href` contains `#` (but is not
exactly `#`) is intercepted when the link's pathname and hostname match the current page. The page
animates `scrollTop` to `target.offset().top - 54` over `1000ms` with the `easeInOutExpo` easing, and the
click returns `false` (no hash written to the URL). If the target element does not exist, the browser's
default behavior runs.

**Menu auto-close**: clicking any `.js-scroll-trigger` calls `.navbar-collapse.collapse('hide')`.

**Scrollspy**: `$('body').scrollspy({ target: '#mainNav', offset: 56 })` adds `active` to the nav item
matching the section in view. On pages without `#mainNav`, scrollspy has no target to update.

### 1.5 Footer

Present on all four HTML pages, `footer.footer`, three columns:

| Column | Content |
|---|---|
| `.footer-left` | `© <year> FARMS International. All Rights Reserved.` and the postal address `PO Box 270 / Knife River MN 55609 / (218) 416-1961` |
| middle | `ul.list-inline.social-buttons` with exactly 3 links: Twitter/X `https://twitter.com/FARMSDoingGood`, Facebook `https://www.facebook.com/farmsinternational`, Instagram `https://www.instagram.com/farmsinternational` — all `target="_blank"`, each containing a 30px PNG icon |
| `.footer-right` | 501(c)(3) statement, ECFA seal linking to `https://www.ecfa.org/MemberProfile.aspx?ID=7200`, GuideStar seal linking to `https://www.guidestar.org/profile/22-1776920` |

Copyright year is **hard-coded per page**: `2025` on index, resources, and gala; `2024` on 404. It is not
computed at runtime. The GuideStar seal image is hot-linked from
`https://widgets.guidestar.org/gximage2?o=7054259&l=v4` and will not render offline.

### 1.6 Design tokens

Defined as CSS custom properties on `:root` in `src/css/farms.css`:

| Token | Value | Typical use |
|---|---|---|
| `--green` | `#708e83` | Giving section overlay, submit button text |
| `--light-green` | `#b4d7ca` | Dropdown menu background, nav button hover |
| `--olive` | `#727a26` | Link color, hamburger background, active/hover nav |
| `--light-olive` | `#aeb653` | Masthead fallback background, mobile nav divider |
| `--tan` | `#f1f1f1` | Light section backgrounds |
| `--white` | `white` | Body background, nav text when shrunk |
| `--black` | `#262626` | Body text, shrunk navbar, secondary navbar |
| `--gray` | `#58595b` | `.text-muted` |

Fonts: `--farms-font-montserrat` (`'Montserrat', sans-serif`) for everything, `--farms-font-droid`
(`'Droid Serif', sans-serif`) for the masthead lead-in italic line. All headings `h1`–`h6` are
uppercase, bold, `letter-spacing: 1.1px`, `line-height: 1.7`. `h2` is 45px, reduced to 35px at ≤768px.

Buttons: `.btn` is 18px bold, `border-radius: 2px`, `padding: 20px 40px`, no border. Variants:
`.btn-primary`, `.btn-primary-rev`, `.btn-secondary`, `.btn-secondary-rev`.

### 1.7 Progressive-enhancement and offline behavior

- With JavaScript disabled: the navbar renders but does not shrink, collapse, or smooth-scroll; the
  interactive map is replaced by its `<noscript>` static image (`img/where-we-work-map.png`); forms
  submit as normal HTML POSTs (see [forms-and-backend.md](forms-and-backend.md#5-non-ajax-fallback));
  Fancybox video links open Vimeo directly in a new tab.
- With third-party hosts unreachable (offline/blocked): Google Fonts fall back to system sans-serif;
  GA4, Clarity, Aplos, GuideStar, YouTube, and Vimeo assets fail to load; **reCAPTCHA does not
  initialize, and clicking either PHP-backed form's submit button raises
  `ReferenceError: grecaptcha is not defined` and submits nothing** **[verified]**.

---

## 2. Homepage (`/`)

Section order in the DOM: navigation → masthead → `#what-we-do` → `#special-newsletters` → `#giving` →
`#projects` → `#coffee` → `.coffee-bar` → `.documentry` → `#contact` → `#subscribe` → footer → hidden
project modals.

`<body id="page-top">`.

### 2.1 Masthead (`header.masthead`)

- Full-bleed background image `img/header-bg.webp`, `background-size: cover`, centered, non-fixed
  attachment, with `--light-olive` as the fallback color.
- `.intro-heading` — text `FARMS International`, uppercase, 75px at ≥768px, 50px between 768–1024px,
  30px at ≤600px.
- `.intro-lead-in` — text `Doing Good That Is Good In Places Of Great Need`, italic Droid Serif, 40px at
  ≥768px, 22px below.
- CTA `a.btn.btn-primary.js-scroll-trigger` labeled `Tell Me More`, `href="#what-we-do"`; clicking
  smooth-scrolls to the What We Do section.
- Order in the DOM is heading first, then lead-in (an older reversed pair is commented out).

### 2.2 Promo banner (`#banner`) — currently disabled

A yellow (`#ffd700`) full-width dismissible banner is present in `index.html` but wrapped in an HTML
comment, so it does not render. When enabled it shows a message plus an `<a class="giving-link">` and a
`×` button whose inline `onclick` sets `this.parentElement.style.display='none'`. Its CSS lives in the
inline `<style>` block in `<head>` and is always shipped. Tests should assert `#banner` is **absent**
from the rendered DOM in the current build.

### 2.3 What We Do (`#what-we-do`)

Two-part section.

**Upper row**
- Left column (`col-lg-6`): `h2` "What We Do"; `h3.bible-verse.text-muted` containing the italic
  Galatians 6:10 quotation; `p.bible-reference.text-muted` reading `- Galatians 6:10`.
- Right column (`col-lg-6.text-center`): the flyer image `img/flyer-what-we-do.png`
  (`max-height:480px`, lazy-loaded) wrapped in a link to `newsletters/The Farms Process 2026.pdf`,
  `target="_blank"`, `data-track="pdf"`, `data-track-label="FARMS Approach Flyer"`.

**Icon row** (`.container-fluid.what-we-do-icon-row > .row.three-col-row`) — three `col-md-4` cards, each
with a circular icon (`i.logo-circle > img`, 30px), an `h4`, and a `p.text-muted`:

| Icon image | Heading | Notes |
|---|---|---|
| `img/icons/doinggood.png` | Doing Good | quotes "...whenever you wish you may do them good…" |
| `img/icons/biblicalapproach.png` | Biblical Approach | interest-free loans, dignity, no dependency |
| `img/icons/itworks.png` | It Works | contains `<span id="farmsAge">56</span>` |

**Dynamic year counter**: `farms.js` executes `$('#farmsAge').text(new Date().getFullYear() - 1961)` on
load, replacing the hard-coded `56`. In 2026 the rendered value is `65` **[verified]**. A test should
assert the rendered value equals `currentYear − 1961`, not the literal in the HTML source.

### 2.4 Special newsletters (`#special-newsletters`, `.bg-light`)

Intro `h3.special-newsletters-h4`: "These editions of our newsletter offer in-depth information on FARMS
approach and methods."

Six `.newsletter-item` cards in two rows of three. Each card is one `a.newsletter-link` with
`target="_blank"` wrapping a `.card > img.card-img-top` and a `p.card-text` caption. `.card:hover`
applies the hover treatment defined in CSS.

| # | Caption | Target | Image | `data-track` | `data-track-label` |
|---|---|---|---|---|---|
| 1 | FARMS Approach | `newsletters/The Farms Process 2026.pdf` | `img/newsletter-farms-process-2026.png` | `pdf` | FARMS Approach |
| 2 | Recent Newsletters | `https://us3.campaign-archive.com/home/?u=327bff531daf5aae34d2fe667&id=8269e92cdf` | `img/MostRecent.webp` | `outbound` | Recent Newsletters Archive |
| 3 | FAQs | `newsletters/FARMS FAQs.pdf` | `img/FAQs.webp` | `pdf` | FARMS FAQs |
| 4 | Giving Impact | `newsletters/FARMS Giving Impact 2026.pdf` | `img/newsletter-giving-impact-2026.png` | `pdf` | FARMS Giving Impact |
| 5 | Other Ways to Give | `newsletters/FARMS Other Ways to Give 2026.pdf` | `img/newsletter-other-ways-2026.png` | `pdf` | FARMS Other Ways to Give |
| 6 | Recurring Giving | `newsletters/FARMS Recurring Giving 2026.pdf` | `img/newsletter-recurring-giving-2026.png` | `pdf` | FARMS Recurring Giving |

All six PDFs and images exist in the repository; hrefs contain literal spaces (unencoded) and resolve
correctly.

### 2.5 Giving (`#giving`, `section.giving`)

- Background: `linear-gradient(rgba(112,142,131,0.8), rgba(112,142,131,0.8))` over
  `img/givingbg_wide.webp`.
- `h2` "FARMS is funded by donors like you" plus a paragraph stating 501(c)(3) status, Minnesota
  headquarters, ECFA membership, charitable-solicitation compliance, and tax-deductibility with receipt.
- `.row.two-col-row` with two buttons:
  - `button.aplos-donation-button.btn.btn-primary` labeled `ONLINE DONATION`,
    `data-widget-id="24E7EE7BBE9CF54658F113B3D811E098"`, `data-track="donation"`,
    `data-track-label="Online Donation"`. Opens the Aplos widget; it is a `<button>` with no `href`, so
    no navigation occurs if the Aplos script is unavailable.
  - `a.btn.btn-primary` labeled `CRYPTO DONATION`, `href="https://platform.engiven.com/give/776/widget/554"`,
    `target="_blank"`, `data-track="donation"`, `data-track-label="Crypto Donation"`, inside
    `.col-md-6.-crypto-btn`.
- `.row.giving-ecfaseal` with `img.ecfaseal` (`img/ecfaseal.png`, link to the ECFA member profile,
  `title="Click to view FARMS ECFA accreditation"`) and `img.guidestarseal` (hot-linked GuideStar image
  linking to the GuideStar profile).

The Aplos `<script src="https://cdn.aplos.com/widgets/donations/1.0.2/donations.min.js">` tag appears
**twice** on the homepage — once inside the nav dropdown item and once in this section.

### 2.6 Where We Work (`#projects`, `.bg-light`)

Contains `h2` "Where We Work" and an empty `div#farms-map-container` with a `<noscript>` fallback image
(`img/where-we-work-map.png`, alt text naming the Caribbean, Eastern Europe, Africa, and SE Asia
regions).

**Map rendering** (`world-map.js`), on `DOMContentLoaded` (or immediately if the document is already
parsed):

1. If `#farms-map-container` is absent, the script returns without any network call. (This is the case on
   resources, gala, and 404 **[verified]**.)
2. Otherwise an `XMLHttpRequest` GETs the **relative** URL `img/world-map.svg`. Non-200 responses abort
   silently, leaving the container empty. Because the URL is relative, the map only resolves on pages at
   the site root.
3. The SVG markup is injected via `innerHTML`; the `<svg>` gets `role="img"` and
   `aria-label="World map showing FARMS International project regions"`.
4. A generated `<style>` element is inserted as the SVG's first child. It sets the map background to
   `#262626`, land fill `#3a3a3a` with `#262626` 0.5px strokes and a 0.2s fill transition,
   `width:100%`, `height:auto`, and `border-radius:8px`.
5. Every `<path>` whose `id` matches a configured ISO 3166-1 alpha-2 code gets class `highlighted`,
   `data-country="<code>"`, and `data-region="<region name>"`. Highlighted fill is `#c8d83f`, hover fill
   `#e0ee60`, `cursor: pointer`.
6. One `text.region-label` per region is appended at the configured coordinates, multi-line names split
   into `<tspan>` children offset by `dy=14`. Labels are Montserrat 11px, white, weight 600, with a 3px
   `rgba(0,0,0,0.6)` stroke behind the fill (`paint-order:stroke`) and `pointer-events:none`.
7. A tooltip group (`g.map-tooltip` containing a `rect` and `text`) is appended last, initially
   `opacity: 0`.

**Map dimensions and counts [verified]**: `svg#farms-world-map` has `viewBox="0 0 960 500"`; the source
file contains **177** `<path>` elements; **26** receive the `highlighted` class; **5** region labels are
drawn.

**Regions** (order as configured, label position in SVG user units):

| Region label | Codes | labelX | labelY |
|---|---|---|---|
| `Caribbean &`⏎`Central America` | CU, HN | 200 | 235 |
| `Eastern`⏎`Europe` | MD | 545 | 140 |
| `Africa` | SL, CD, UG, KE, RW, BI, TZ, ZM, MW | 510 | 270 |
| `South`⏎`Asia` | PK, IN, NP, BT, BD, LK | 650 | 200 |
| `SE Asia` | MM, TH, LA, KH, VN, MY, ID, PH | 790 | 215 |

**Tooltip behavior**: on `mousemove` over the SVG, the script finds the closest `.highlighted` ancestor
of the event target.
- No highlighted country under the cursor → tooltip opacity set to `0`.
- Over a highlighted country → tooltip text is set to the country's display name (from the built-in
  name map; falls back to the raw code if unmapped), the cursor position is converted to SVG user space
  via `createSVGPoint()`/`getScreenCTM().inverse()`, the box width is computed as
  `name.length * 6.5 + 16`, the box is clamped horizontally to stay within `0…960` (with 5-unit
  padding), positioned 18 units above the cursor, and opacity set to `1`.
- `mouseleave` on the SVG hides the tooltip.
- If `getScreenCTM()` returns null the handler returns early and the tooltip is left as-is.

Tooltip names: CU Cuba, HN Honduras, MD Moldova, SL Sierra Leone, CD DR Congo, UG Uganda, KE Kenya,
RW Rwanda, BI Burundi, TZ Tanzania, ZM Zambia, MW Malawi, PK Pakistan, IN India, NP Nepal, BT Bhutan,
BD Bangladesh, LK Sri Lanka, MM Myanmar, TH Thailand, LA Laos, KH Cambodia, VN Vietnam, MY Malaysia,
ID Indonesia, PH Philippines.

There is no click handler, no keyboard interaction, and no touch equivalent for the tooltip.

### 2.7 Get Involved — removed

An entire `#getinvolved` section (Stay Informed / Spread the Word cards with social icons) exists in the
markup but is HTML-commented out. It must not appear in the rendered page.

### 2.8 Coffee (`#coffee`, `section.coffee`)

- Background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4))` over `img/coffee.webp`.
- `h2` "Did someone say coffee?".
- `.col-lg-4.coffee-text`: paragraph describing the Twin Valley Coffee partnership and that 100% of
  profit supports Christian farmers and entrepreneurs; CTA `a.btn.btn-primary.js-scroll-trigger.btn-coffee`
  labeled `Get Brewing`, `href="https://coffeehelpingfarms.com/"`, `data-track="outbound"`,
  `data-track-label="FARMS Coffee"`. Note this link has **no `target="_blank"`** — it navigates in the
  same tab. It also carries `js-scroll-trigger`, which only causes the mobile menu-collapse side effect.
- `.col-lg-8.doc-div > .doc-iframe-container[data-track-label="FARMS Coffee Video"]` containing the
  YouTube embed `https://www.youtube.com/embed/b1RceO4udjs` with
  `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` and
  `allowfullscreen`. `analytics.js` rewrites the `src` to append `enablejsapi=1` and assigns the iframe
  an `id` of `yt-player-0` if it has none.

### 2.9 Coffee bar strip (`section.coffee-bar`)

Full-width strip: `col-lg-7` paragraph "Serve FARMS coffee at your churches coffee bar!" and `col-lg-5`
CTA `a.btn.btn-secondary.js-scroll-trigger.btn-coffee-bar` labeled `Request Info` whose `href` is a
`mailto:` with a pre-filled subject (`FARMS Coffee Bar Info Request`) and body ("I am interested in
learning more about serving FARMS coffee at my church."). No analytics attribute.

### 2.10 Documentary (`section.documentry`)

`h2` "Cafe Diego: The Cost of a Dream", paragraph "Learn about the impact of direct trade partnerships",
and `.doc-iframe-container[data-track-label="Cafe Diego Documentary"]` containing the Vimeo embed
`https://player.vimeo.com/video/177505072` (`title="vimeo-player"`, `allowfullscreen`).

`.doc-iframe-container` provides the responsive 16:9 wrapper; the iframe is absolutely positioned to
fill it.

### 2.11 Contact Us (`#contact`)

`h2.section-heading` "Contact Us", then a two-column layout:

**Left (`col-md-6`)** — `form#email-form` (`method="POST"`, `action="contactsubmit.php"`,
`role="form"`, `class="form-horizontal"`):

| Element | Attributes | Adjacent error message |
|---|---|---|
| `input#email[name=email].form-control.email` | `placeholder="Your Email *"`, `required`, `autocomplete="email"` | `p.text-danger.required-error` — "We need your email so we can get back to you." |
| `textarea#note[name=note].form-control.email` | `placeholder="Your Comment Here *"`, `required` | `p.text-danger.required-error` — "You forgot your comment." |
| `span` | — | "* Required information" |
| `p.contact-form-sending` | hidden by CSS | "Submitting..." |
| `p.contact-form-success` | hidden by CSS | "Thank you for your interest in FARMS International!" |
| `p.contact-form-failure` | hidden by CSS | "Sorry there was an error. Please try again later or email us directly at info@farmsinternational.com" (with mailto link) |
| `button#message-submit[name=submit][type=submit].btn.btn-secondary.btn-block` | — | label `SUBMIT` |
| `div#emailRecaptcha.form-group.col-md-12.g-recaptcha` | `data-badge="inline"`, `data-size="invisible"` | reCAPTCHA render target |

The `input#email` has no `type="email"`, so no native browser email-format validation runs on it.

**Right (`col-md-5.snail-mail`)** — "Send us snail mail at:" with the `address` block
(FARMS International, Inc. / P.O. Box 270 / Knife River, MN 55609), then "Or give us a call:" and
`a.phone-link[href="tel:218-416-1961"]` displaying `(218) 416-1961`. A spacer `col-md-1` sits between
the columns.

Validation and submission behavior are specified in [forms-and-backend.md](forms-and-backend.md).

### 2.12 Subscribe (`#subscribe`, `section.cta`)

`h2` "Subscribe to receive our newsletter" and a Bootstrap pill tabset (`ul.nav.nav-pills#pills-tab`):

| Tab | Tab link id | Pane id | Default |
|---|---|---|---|
| Email | `#pills-email-tab` | `#pills-email` | active / visible |
| Snail Mail | `#pills-snailmail-tab` | `#pills-snailmail` | hidden |

Switching tabs is standard Bootstrap `data-toggle="pill"` behavior; the snail-mail pane is not visible
until its tab is clicked **[verified]**. Automated interaction with the mailing form must activate the
tab first — Playwright cannot click controls in the hidden pane.

**Email pane** — Mailchimp embedded form `form#mc-embedded-subscribe-form.validate`,
`method="post"`, `novalidate`, `target="_blank"`, action
`https://farmsinternational.us3.list-manage.com/subscribe/post?u=327bff531daf5aae34d2fe667&id=8269e92cdf`:

- `input#mce-EMAIL[name=EMAIL][type=email].form-control.mc-email.input-xl`, `placeholder="Email Address"`,
  `required`, `data-validation-required-message="Please enter your email address."`.
- `p.mc-email-error.text-danger.required-error` — "Your email is required." (hidden by default).
- Honeypot: an off-screen (`position:absolute; left:-5000px`, `aria-hidden="true"`) text input named
  `b_327bff531daf5aae34d2fe667_8269e92cdf` with `tabindex="-1"`. It must stay empty; bots that fill it
  are rejected by Mailchimp.
- `input#mc-embedded-subscribe[type=submit][name=subscribe].btn.btn-secondary` with value `SUBSCRIBE`,
  `data-track="newsletter-signup"`, `data-track-label="Email Newsletter Subscribe"`.

Because the form has `novalidate` and `target="_blank"`, a valid submission posts to Mailchimp in a new
tab; the FARMS page itself does not change. Empty-email handling is a custom toggle described in
[known issues](known-issues.md#ki-02).

**Snail Mail pane** — `form#mailing-form` (`method="POST"`, `action="contactsubmit.php"`) with six
required text inputs, each followed by its own `p.text-danger.required-error`:

| Field | id / name | Placeholder | autocomplete | Error text |
|---|---|---|---|---|
| Name | `name` | `Your Name *` | `name` | Your name is required. |
| Address | `mailingaddress` | `Your Mailing Address *` | `street-address` | Your address is required. |
| City | `city` | `Your City *` | `address-level2` | Your city is required. |
| State | `state` | `Your State *` | `address-level1` | Your state is required. |
| Postal code | `zip` | `Your Postal Code *` | `postal-code` | Your postal code is required. |
| Country | `country` | `Your Country *` | `country` | Your country is required. |

All six carry `class="form-control mailing"`. The pane also has the same
sending/success/failure paragraphs, submit button `button#mail-submit` labeled `Subscribe`, and
reCAPTCHA container `div#recaptchaMailing.g-recaptcha[data-size=invisible]` (no `data-badge` attribute,
unlike the contact form).

### 2.13 Hidden project modals

Six Bootstrap modals remain in the DOM after the footer: `#projectmodal2` Bangladesh, `#projectmodal3`
Haiti, `#projectmodal4` Moldova, `#projectmodal5` Nagaland/India, `#projectmodal6` The Philippines,
`#projectmodal7` Thailand. Each is `div.project-modal.modal.fade[tabindex=-1][role=dialog][aria-hidden=true]`
with a country image, multi-paragraph program history, a link to the matching `resources.html#<country>`
anchor, sometimes a link to `blog.farmsinternational.com`, a `.close-modal` widget, and a
`button.btn.btn-primary[data-dismiss=modal]` labeled `Close`.

They were intended to be commented out, but the comment is malformed, so **all six are live DOM
elements** — hidden only because Bootstrap's `.modal` class sets `display:none`. Nothing on the page
opens them: there is no `data-target`/`data-toggle="modal"` trigger anywhere. See
[known issues](known-issues.md#ki-03) — including the stray `-->` text that renders at the bottom of the
page. **[verified]**: 6 `.project-modal` elements present, none visible.

---

## 3. Resources page (`/resources.html`)

- Navbar `#secondaryNav` (always dark, fixed-top) as described in §1.4.
- Jumbotron `.jumbotron.jumbotron-fluid.resource-tron` with `h1.display-4.resource-display`
  ("Additional publications about **FARMS International**", the org name in a `<span>`) and a `p.lead`
  ("Below you will find additional newsletters, videos, and Mission Network News spots for our various
  project.").
- `h2` "Resources" followed by three `.row.resource-row` rows of `.col-sm-4` columns.

Each column is `div.resource-column` with a stable `id` used as the deep-link anchor, a circular
thumbnail (`img.mx-auto.rounded-circle`, 200×200 source, lazy-loaded), an `h4` country heading, and one
or more grouped link lists:

| Anchor | Heading | Thumbnail | Newsletters | Videos | MNN spots |
|---|---|---|---|---|---|
| `#cuba` | Cuba | `img/projects/cuba_sm.webp` | 5 | — | 5 |
| `#bangladesh` | Bangladesh | `img/projects/bangladesh_sm.webp` | 10 | — | 1 |
| `#haiti` | Haiti | `img/projects/haiti_sm.webp` | 4 | — | 2 |
| `#moldova` | Moldova | `img/projects/moldova_sm.webp` | 10 | — | 3 |
| `#nagaland` | Nagaland/India | `img/projects/nagaland_sm.webp` | 3 | — | — |
| `#philippines` | The Philippines | `img/projects/philippenes_sm.webp` | 10 | — | 1 |
| `#thailand` | Thailand | `img/projects/thailand_sm.webp` | 10 | 2 | 8 |
| `#additional` | *(blank — `&nbsp;`)* | `img/additionalResources.webp` | 1 | — | — |

Group sub-headings are `h6` elements reading `Newsletters`, `Videos`, and `Mission Network News Spots`.
Link rows are separated by `<br />`, and every link ends with an
`<i class="fas fa-external-link-alt">` icon.

Behavior:

- **Newsletter links** — relative `newsletters/*.pdf` hrefs, `target="_blank"`, `data-track="pdf"`, no
  `data-track-label` (the label falls back to the link text, e.g. `November 2018`). Filenames with
  spaces are used unencoded in the markup.
- **MNN links** — absolute `https://www.mnnonline.org/news/...` hrefs, `target="_blank"`,
  `data-track="outbound"`, no label override.
- **Video links** (Thailand only) — `a[data-fancybox]` pointing at `https://vimeo.com/43922630`
  ("FARMS International Coffee Project Promotes Evangelism") and `https://vimeo.com/45142868`
  ("Lahu Choir"). They also carry `target="_blank"`. With JavaScript on, Fancybox intercepts the click
  and opens the Vimeo video in a lightbox overlay; the overlay closes on `Esc`, on backdrop click, or via
  the Fancybox close button. Neither video link carries a `data-track` attribute, so no analytics event
  fires for them.
- Deep links from the homepage modals (`./resources.html#bangladesh` etc.) and any external inbound
  anchors scroll to the matching `resource-column`. Because `#secondaryNav` is `fixed-top`, the anchor
  target can sit partially under the navbar.

The page has **no** map container, no forms, and no Clarity snippet. Footer is the shared footer with
`© 2025`.

---

## 4. Gala page (`/gala.html`)

Standalone landing page with no site navbar.

- `section.gala-header` — `.container-fluid` with the FARMS logo (`img.logo-gala`,
  `img/logo/FARMS-logo-onblack.png`, height 140px) wrapped in a link to `/`.
- `section.gala-section`:
  - `h2.gala-h2` — "You're Invited to the FARMS International Gala!"
  - `h1.gala-h1` — "Building Legacy"
  - `h2.gala-h2` (inline `font-size:30px`) — "Rooted in Faith, Growing in Hope, Empowering Generations."
  - `p.gala-text` (first) — the invitation body, opening "Dear Friends," and naming
    **Saturday, March 22nd, 2025**, **Durham Hill Farm** in eastern Pennsylvania, adults only, business
    casual, catering by Jr's Brisket, free to attend.
  - CTA `a.btn.btn-secondary-rev.js-scroll-trigger.btn-gala` labeled `RESERVE YOUR SPOT TODAY`,
    `target="_blank"`, pointing at the Google Form
    `https://docs.google.com/forms/d/e/1FAIpQLSePYJkxbHTz8onzqP0GwBUTaHTx2sc1Wfjo4ELK7cTjqH-26w/viewform?embedded=true`.
  - `p.gala-text` (second) — closing paragraph signed "The FARMS International Team".
- `section.gala-banner` — decorative full-width band backed by `img/gala-banner.webp`; contains an empty
  `div` and no text.
- Shared footer (`© 2025`).

The page describes a **past** event (March 2025) and is not linked from any live navigation — the Gala
nav items on the homepage and resources page are commented out. It remains reachable by direct URL and is
listed in neither `sitemap.xml` nor `robots.txt` disallow rules.

---

## 5. 404 page (`/404.html`)

- Navbar `#secondaryNav` **without** `fixed-top`, containing only the brand logo linking to `/` — no menu
  items, no hamburger, no donate dropdown **[verified]**.
- `section.page-not-found-section` split into `.col-md-6.left-section` with `h1 > em` "404" and
  `.col-md-6.right-section` with `h2` "Page Not Found", `h6` "Sorry, but the page you were trying to view
  does not exist.", and `a.btn.btn-primary.js-scroll-trigger[href="/"]` labeled `Homepage` followed by
  `<i class="fas fa-long-arrow-alt-right">`.
- Shared footer with `© 2024` (one year behind the other pages).
- Font Awesome CSS is not linked on this page, so the arrow icon in the button does not render
  **[verified]** — see [known issues](known-issues.md#ki-04).
- At ≤768px the two halves stack and center.

---

## 6. Brand guide (`/brand-guide.html`) — not deployed

Internal reference page demonstrating headings, buttons, two/three/four-column rows, grid, and a sample
project modal. It has no analytics snippet and is excluded from the SFTP deploy
(`--exclude='^brand-guide\.html$'`), but it **is** in the build script's HTML rewrite list, so its bundle
references stay current. It must never be linked from a live page.

---

## 7. Static and server files

| File | Purpose / content |
|---|---|
| `robots.txt` | `User-agent: *`, `Disallow: /staging`, and `Sitemap: https://farmsinternational.com/sitemap.xml` |
| `sitemap.xml` | 75 `<loc>` entries: `/` (priority 1.0, monthly), `/resources.html` (0.8, monthly), and 73 newsletter PDFs (0.5, monthly). Gala and 404 are intentionally absent. Maintained by hand |
| `site.webmanifest` | name `FARMS International`, short name `FARMS`, two maskable icons (192/512), theme and background `#ffffff`, `display: standalone` |
| `browserconfig.xml` | Windows tile images `tile.png` (70/150/310 square) and `tile-wide.png` (310×150) |
| `crossdomain.xml` | Most-restrictive Flash policy: `permitted-cross-domain-policies="none"` |
| `newsletters/` | 74 PDF files plus `Newsletter-Country Mapping.xlsx` |
| `img/projects/archive/`, `img/archived/` | Superseded PNG/JPG assets retained but unreferenced |
| `readme.txt` | Legacy theme credit (Start Bootstrap Agency v5.2.2), stale Gulp notes, and a backlog list |

`config.php`, `error_log.txt`, and `src/dist/` are gitignored; the first two are also excluded from
deployment so the server copies are never overwritten.
