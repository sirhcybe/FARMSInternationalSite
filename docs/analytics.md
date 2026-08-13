# Analytics

Two analytics systems are installed:

| System | ID | Pages | Placement |
|---|---|---|---|
| Google Analytics 4 (gtag.js) | `G-HE9ZHJ520Q` | index, resources, gala, 404 | `<head>`, before the bundle |
| Microsoft Clarity | `4097w0tyc2` | **index only** | inline loader at end of `<body>` |

`brand-guide.html` deliberately carries neither.

The gtag snippet initializes `window.dataLayer`, defines `gtag()`, then calls `gtag('js', new Date())`
and `gtag('config', 'G-HE9ZHJ520Q')`. Putting it in `<head>` guarantees `gtag` exists by the time the
bundled `analytics.js` runs, so no event is dropped for being early.

Beyond the custom events below, GA4 **Enhanced Measurement** (configured in the GA4 property, not in
this code) contributes `page_view`, `scroll`, `click` for outbound links, `file_download`, and
`video_*` engagement automatically. The custom events here are intentional duplicates with curated
labels; automatic outbound detection was removed from `analytics.js` to avoid double-firing.

---

## 1. Implementation (`src/js/analytics.js`)

The file is an IIFE that:

1. Defines `fireEvent(eventName, params)` — calls `gtag('event', name, params)` only when
   `typeof gtag === 'function'`, so it is a silent no-op if GA is blocked.
2. Exports it as `window.FARMS.fireEvent` (see [known issues](known-issues.md#ki-01) — this export is
   later clobbered by `farms.js`, which disables the `form_submit` event).
3. On `DOMContentLoaded`, installs one delegated `click` listener on `document`, plus Vimeo and YouTube
   player instrumentation.

### 1.1 Delegated click tracking

```js
var el = e.target.closest('[data-track]');
if (!el) return;
```

Label resolution order: `data-track-label` → the element's trimmed `textContent` → its `href` → `''`.
`href` is read via `getAttribute('href')`, so it is the **raw attribute value** (relative paths stay
relative, spaces stay unencoded), while `link_domain` uses the `el.hostname` property (empty string for
elements with no href, such as the Aplos `<button>`).

Because the listener is delegated from `document` and uses `closest()`, a click on an icon or image
inside a tracked link still resolves to the tracked ancestor.

### 1.2 Event catalogue

| `data-track` value | GA4 event | Parameters |
|---|---|---|
| `donation` | `donation_click` | `link_text` = label, `link_url` = raw href (`''` for the Aplos button) |
| `pdf` | `file_download` | `file_name` = last path segment of href, `file_extension` = text after the last `.` in that segment (`''` if none), `link_url` = raw href, `link_text` = label |
| `outbound` | `outbound_click` | `link_url` = raw href, `link_domain` = `el.hostname`, `link_text` = label, `outbound` = `true` |
| `newsletter-signup` | `sign_up` | `method` = `'Mailchimp'` (no label parameter) |
| *(any other value)* | none | the switch has no default branch |

Filename derivation examples:

| href | `file_name` | `file_extension` |
|---|---|---|
| `newsletters/FARMS FAQs.pdf` | `FARMS FAQs.pdf` | `pdf` |
| `newsletters/The Farms Process 2026.pdf` | `The Farms Process 2026.pdf` | `pdf` |
| `newsletters/June 2019 E-Newsletter.pdf` | `June 2019 E-Newsletter.pdf` | `pdf` |

### 1.3 Where each attribute appears

**Homepage**

| Element | `data-track` | `data-track-label` |
|---|---|---|
| Nav dropdown → ONLINE DONATION (`a.aplos-donation-button`) | `donation` | `Online Donation (Nav)` |
| Nav dropdown → CRYPTO DONATION | `donation` | `Crypto Donation (Nav)` |
| Giving section → ONLINE DONATION (`button.aplos-donation-button`) | `donation` | `Online Donation` |
| Giving section → CRYPTO DONATION | `donation` | `Crypto Donation` |
| What We Do flyer image link | `pdf` | `FARMS Approach Flyer` |
| Newsletter card 1 | `pdf` | `FARMS Approach` |
| Newsletter card 2 (campaign archive) | `outbound` | `Recent Newsletters Archive` |
| Newsletter card 3 | `pdf` | `FARMS FAQs` |
| Newsletter card 4 | `pdf` | `FARMS Giving Impact` |
| Newsletter card 5 | `pdf` | `FARMS Other Ways to Give` |
| Newsletter card 6 | `pdf` | `FARMS Recurring Giving` |
| Coffee → Get Brewing | `outbound` | `FARMS Coffee` |
| Mailchimp SUBSCRIBE input | `newsletter-signup` | `Email Newsletter Subscribe` |

**Resources page** — every newsletter link carries `data-track="pdf"` and every Mission Network News
link carries `data-track="outbound"`, both **without** a label override, so `link_text` is the visible
link text (e.g. `November 2018`, `Cuba: the door opens wider (Feb 2015)`). The two Thailand Fancybox
video links carry no tracking attribute at all.

**Gala and 404 pages** — no `data-track` attributes; page views only.

Untracked by design (no attribute): footer/social links, ECFA and GuideStar seals, the `mailto:` and
`tel:` links, blog links inside the hidden modals, and internal anchor navigation.

### 1.4 Notes on double counting

The Mailchimp `sign_up` event fires on **click**, before validation — so an empty-email click that the
handler blocks still records a `sign_up`. Similarly, `donation_click` fires on click, not on completed
donation; conversion must be measured in Aplos/Engiven.

---

## 2. Video tracking

Click handlers cannot see inside cross-origin iframes, so both providers are instrumented through their
JavaScript APIs. Both run inside the same `DOMContentLoaded` handler.

### 2.1 Vimeo

- Selector: `iframe[src*="player.vimeo.com"]`. If none match, nothing is loaded.
- If at least one matches, `https://player.vimeo.com/api/player.js` is appended to `<head>`; the rest
  runs in its `onload`.
- For each iframe a `Vimeo.Player` is created. The label is taken from the nearest ancestor with
  `data-track-label` (`.doc-iframe-container[data-track-label="Cafe Diego Documentary"]` on the
  homepage); if there is none, `player.getVideoTitle()` fills it in asynchronously (errors swallowed).
- On the player's `play` event: `video_play` with `video_provider: 'vimeo'`, `video_title: <label>`,
  `video_url: iframe.src`. It fires on every play, including resume after pause.

### 2.2 YouTube

- Selector: `iframe[src*="youtube.com/embed"]`.
- Before the API loads, each matching iframe is given an `id` (`yt-player-<index>`) if it lacks one, and
  `enablejsapi=1` is appended to its `src` (with `?` or `&` as appropriate). **Rewriting `src` reloads
  the iframe.**
- `window.onYouTubeIframeAPIReady` is defined, then `https://www.youtube.com/iframe_api` is appended to
  `<head>`.
- When ready, a `YT.Player` is attached to each iframe with an `onStateChange` handler. On
  `YT.PlayerState.PLAYING` it fires `video_play` with `video_provider: 'youtube'`,
  `video_title` (wrapper label, else `event.target.getVideoData().title`, else `''`), and
  `video_url: iframe.src` (which now includes `enablejsapi=1`).
- Defining `window.onYouTubeIframeAPIReady` globally means any other YouTube API consumer added later
  would be overwritten.

Homepage instances: one YouTube iframe (`b1RceO4udjs`, label `FARMS Coffee Video`) and one Vimeo iframe
(`177505072`, label `Cafe Diego Documentary`).

---

## 3. Form submission events

`farms.js` calls, inside the AJAX success handler:

```js
window.FARMS.fireEvent('form_submit', { form_name: 'Contact Form' | 'Mailing List Subscription' });
```

**Current status: never emitted.** `farms.js` declares `var FARMS = {}` at bundle top level, which
replaces the `window.FARMS` object that `analytics.js` populated, so `window.FARMS.fireEvent` is
`undefined` and the guard skips the call **[verified]**. Details and the one-line fix are in
[known issues](known-issues.md#ki-01). Until that is fixed, a test asserting a `form_submit` hit will
fail; a test asserting no `form_submit` hit documents the current build.

---

## 4. Full event reference

| Event | Trigger | Parameters | Fires today |
|---|---|---|---|
| `donation_click` | click on any `[data-track="donation"]` | `link_text`, `link_url` | yes |
| `file_download` | click on any `[data-track="pdf"]` | `file_name`, `file_extension`, `link_url`, `link_text` | yes |
| `outbound_click` | click on any `[data-track="outbound"]` | `link_url`, `link_domain`, `link_text`, `outbound: true` | yes |
| `sign_up` | click on the Mailchimp submit input | `method: 'Mailchimp'` | yes |
| `video_play` | Vimeo `play` / YouTube `PLAYING` | `video_provider`, `video_title`, `video_url` | yes |
| `form_submit` | successful contact / mailing AJAX response | `form_name` | **no** (see above) |

## 5. How to verify events manually

1. Open the page with DevTools → Network, filtered to `google-analytics.com/g/collect`.
2. Perform the interaction; one request per event should appear, with `en=<event name>` in the query
   string and the parameters as `ep.<name>` (strings) or `epn.<name>` (numbers).
3. Alternatively install the GA Debugger extension or use GA4 DebugView with `?debug_mode=1`.
4. In an offline or GA-blocked environment, no requests are made and `fireEvent` silently returns — this
   is expected, not a defect.
