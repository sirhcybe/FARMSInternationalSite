# Test matrix

Traceability between documented behavior and the existing Playwright suite, plus the areas a tester must
cover manually or with new automation. Use it as the index when writing test cases from
[functional-spec.md](functional-spec.md), [forms-and-backend.md](forms-and-backend.md), and
[analytics.md](analytics.md).

Legend: **A** = covered by automated tests today · **P** = partially covered · **—** = not covered.

---

## 1. Site-wide

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 1.1 | Each page returns 200 and the documented `<title>` | [§1.1](functional-spec.md#11-pages-and-routes) | A | title tests in all four specs |
| 1.2 | Favicon and manifest links present | [§1.2](functional-spec.md#12-shared-head-contract) | P | homepage only (`link[rel=icon]`) |
| 1.3 | GA4 gtag snippet present in `<head>` on all four pages | [§1.2](functional-spec.md#12-shared-head-contract) | — | |
| 1.4 | Clarity loads on homepage only | [analytics](analytics.md) | — | |
| 1.5 | Exactly one hashed JS bundle and one hashed CSS bundle per page | [build §3](build-test-deploy.md#3-build-pipeline-buildmjs) | — | |
| 1.6 | No first-party console errors | [§1.7](functional-spec.md#17-progressive-enhancement-and-offline-behavior) | A | homepage only |
| 1.7 | Font Awesome linked on index/resources/gala, absent on 404 | [KI-04](known-issues.md#ki-04) | — | |
| 1.8 | Footer: copyright text, address, 3 social links, ECFA + GuideStar seals | [§1.5](functional-spec.md#15-footer) | P | homepage full; other pages check footer + copyright text only |
| 1.9 | All relative links resolve (no 404s on assets or PDFs) | [inventory §3](content-inventory.md#3-newsletter-pdf-library) | — | link-crawl candidate |

## 2. Navigation

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 2.1 | `#mainNav` visible on homepage with the four documented links | [§1.4](functional-spec.md#14-navigation-bar) | A | `has all required nav links` |
| 2.2 | Brand logo targets `#page-top` (home) / `/` (resources, 404, gala) | [§1.4](functional-spec.md#14-navigation-bar) | A | per-page logo tests |
| 2.3 | DONATE dropdown toggles open and contains both donation items | [§1.4](functional-spec.md#14-navigation-bar) | P | presence only; open state not asserted |
| 2.4 | Hamburger toggles `.navbar-collapse` at ≤991px | [§1.4](functional-spec.md#14-navigation-bar) | A | `mobile hamburger toggles nav menu` at 375×812 |
| 2.5 | `navbar-shrink` added above 100px scroll, removed at top | [§1.4](functional-spec.md#14-navigation-bar) | — | |
| 2.6 | Logo swaps to the on-black variant when shrunk / on mobile | [§1.4](functional-spec.md#14-navigation-bar) | — | visual check |
| 2.7 | Anchor links smooth-scroll to the right section (offset 54px, no hash in URL) | [§1.4](functional-spec.md#14-navigation-bar) | — | |
| 2.8 | Mobile menu closes after a nav link is clicked | [§1.4](functional-spec.md#14-navigation-bar) | — | |
| 2.9 | Scrollspy marks the in-view section active | [§1.4](functional-spec.md#14-navigation-bar) | — | |
| 2.10 | Resources nav links point at `/#…` and navigate cross-page | [§3](functional-spec.md#3-resources-page-resourceshtml) | — | |

## 3. Homepage content

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 3.1 | All seven sections present in order | [§2](functional-spec.md#2-homepage-) | A | seven presence tests |
| 3.2 | Masthead heading, lead-in, and Tell Me More CTA | [§2.1](functional-spec.md#21-masthead-headermasthead) | P | `.masthead` visible only |
| 3.3 | `#farmsAge` renders `currentYear − 1961` | [§2.3](functional-spec.md#23-what-we-do-what-we-do) | P | asserts a positive integer, not the exact value |
| 3.4 | Three What We Do cards with the documented headings and icons | [§2.3](functional-spec.md#23-what-we-do-what-we-do) | — | |
| 3.5 | Six newsletter cards with documented captions, hrefs, and images | [§2.4](functional-spec.md#24-special-newsletters-special-newsletters-bg-light) | — | |
| 3.6 | Giving copy, both donation buttons, ECFA + GuideStar seals | [§2.5](functional-spec.md#25-giving-giving-sectiongiving) | P | section presence only |
| 3.7 | Coffee section copy, Get Brewing link, YouTube embed | [§2.8](functional-spec.md#28-coffee-coffee-sectioncoffee) | P | section presence only |
| 3.8 | Coffee-bar mailto contains the documented subject and body | [§2.9](functional-spec.md#29-coffee-bar-strip-sectioncoffee-bar) | — | |
| 3.9 | Documentary section and Vimeo embed | [§2.10](functional-spec.md#210-documentary-sectiondocumentry) | — | |
| 3.10 | Promo `#banner` is absent | [§2.2](functional-spec.md#22-promo-banner-banner--currently-disabled) | — | regression guard |
| 3.11 | Six hidden `.project-modal` elements exist and none are visible | [KI-03](known-issues.md#ki-03) | — | characterization test |

## 4. Interactive map

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 4.1 | `svg#farms-world-map` is injected and visible | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | A | `interactive map is rendered` |
| 4.2 | Exactly 26 `path.highlighted` for the configured codes | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | P | first highlighted path only |
| 4.3 | Exactly 5 `text.region-label` with the documented names | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | P | first label only |
| 4.4 | Each highlighted path carries the right `data-country` / `data-region` | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | — | |
| 4.5 | Hovering a highlighted country shows the tooltip with its display name | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | — | |
| 4.6 | Tooltip hides on `mouseleave` and over non-highlighted land | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | — | |
| 4.7 | Tooltip stays inside the 0–960 viewBox at both edges | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | — | boundary case |
| 4.8 | `<noscript>` fallback image shown with JS disabled | [§1.7](functional-spec.md#17-progressive-enhancement-and-offline-behavior) | — | |
| 4.9 | No SVG request is made on pages without the container | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | — | |
| 4.10 | Map degrades silently if `world-map.svg` returns non-200 | [§2.6](functional-spec.md#26-where-we-work-projects-bg-light) | — | route-interception test |

## 5. Contact form (`#email-form`)

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 5.1 | Form, both fields, and submit button present | [§2.11](functional-spec.md#211-contact-us-contact) | A | four presence tests |
| 5.2 | Empty submit reveals both required errors with the documented text | [forms §1.1](forms-and-backend.md#11-the-validaterequiredselector-helper) | P | asserts the first error is visible |
| 5.3 | Typing in a field clears only that field's error | [forms §1.2](forms-and-backend.md#12-live-re-validation) | — | |
| 5.4 | Whitespace-only input passes presence validation | [forms §1.1](forms-and-backend.md#11-the-validaterequiredselector-helper) | — | negative case |
| 5.5 | Malformed email is accepted client-side (no `type=email`) | [§2.11](functional-spec.md#211-contact-us-contact) | — | |
| 5.6 | Valid submit calls `grecaptcha.execute` and no native POST occurs | [forms §1.3](forms-and-backend.md#13-submit-interception) | — | needs reCAPTCHA stub |
| 5.7 | Success path: success message shown, fades after 5s, form reset | [forms §1.5](forms-and-backend.md#15-ajax-submission-onsubmitselector) | — | mock `contactsubmit.php` via route interception |
| 5.8 | Error path: failure message shown, input preserved | [forms §1.5](forms-and-backend.md#15-ajax-submission-onsubmitselector) | — | |
| 5.9 | "Submitting..." is not visible during submission | [KI-05](known-issues.md#ki-05) | — | characterization test |
| 5.10 | Snail-mail contact block: address text and `tel:` link | [§2.11](functional-spec.md#211-contact-us-contact) | — | |

## 6. Mailing-list form (`#mailing-form`)

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 6.1 | Form and all six fields present | [§2.12](functional-spec.md#212-subscribe-subscribe-sectioncta) | A | seven presence tests |
| 6.2 | Tab switch reveals the pane before interaction is possible | [§2.12](functional-spec.md#212-subscribe-subscribe-sectioncta) | A | implicit in the validation test |
| 6.3 | Empty submit reveals all six errors | [forms §1.1](forms-and-backend.md#11-the-validaterequiredselector-helper) | P | first error only |
| 6.4 | Partial completion reveals only the empty fields' errors | [forms §1.2](forms-and-backend.md#12-live-re-validation) | — | |
| 6.5 | Success/error AJAX paths behave as for the contact form | [forms §1.5](forms-and-backend.md#15-ajax-submission-onsubmitselector) | — | |
| 6.6 | `form_name` would be `Mailing List Subscription` (currently unsent) | [KI-01](known-issues.md#ki-01) | — | |

## 7. Mailchimp signup

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 7.1 | Email field and submit button present | [§2.12](functional-spec.md#212-subscribe-subscribe-sectioncta) | A | two presence tests |
| 7.2 | Empty submit shows `.mc-email-error` and blocks submission | [forms §1.6](forms-and-backend.md#16-mailchimp-email-signup) | A | `shows error when submitted with empty email` |
| 7.3 | Second empty click hides the error again | [KI-02](known-issues.md#ki-02) | — | characterization test |
| 7.4 | Valid email posts to the Mailchimp action URL in a new tab | [forms §1.6](forms-and-backend.md#16-mailchimp-email-signup) | — | intercept the popup |
| 7.5 | Honeypot input is off-screen, `aria-hidden`, `tabindex=-1`, and empty | [§2.12](functional-spec.md#212-subscribe-subscribe-sectioncta) | — | |
| 7.6 | Tabs: Email pane active by default, Snail Mail hidden | [§2.12](functional-spec.md#212-subscribe-subscribe-sectioncta) | — | |

## 8. Resources page

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 8.1 | All 8 anchors exist with ≥1 link each | [§3](functional-spec.md#3-resources-page-resourceshtml) | A | 16 tests |
| 8.2 | Exact per-country link counts (5/10/4/10/3/10/10/1 newsletters) | [inventory §2](content-inventory.md#2-resources-page-inventory) | — | |
| 8.3 | All newsletter links use `target="_blank"` and `data-track="pdf"` | [§3](functional-spec.md#3-resources-page-resourceshtml) | P | first three links only |
| 8.4 | MNN links are absolute, `target="_blank"`, `data-track="outbound"` | [§3](functional-spec.md#3-resources-page-resourceshtml) | — | |
| 8.5 | Fancybox lightbox opens for the two Thailand videos and closes on `Esc` | [§3](functional-spec.md#3-resources-page-resourceshtml) | P | link presence only |
| 8.6 | Deep links (`resources.html#thailand`) scroll to the right column | [§3](functional-spec.md#3-resources-page-resourceshtml) | — | |
| 8.7 | Every referenced PDF returns 200 | [inventory §3](content-inventory.md#3-newsletter-pdf-library) | — | |

## 9. Gala and 404

| # | Behavior | Spec | Status | Existing test |
|---|---|---|---|---|
| 9.1 | Gala: headings, tagline, body copy, RSVP href/target, banner, footer | [§4](functional-spec.md#4-gala-page-galahtml) | A | 10 tests |
| 9.2 | Gala has no site navbar | [§4](functional-spec.md#4-gala-page-galahtml) | — | |
| 9.3 | 404: heading, message, homepage button, navbar, footer | [§5](functional-spec.md#5-404-page-404html) | A | 6 tests |
| 9.4 | Server returns `404.html` for unknown paths | [§1.1](functional-spec.md#11-pages-and-routes) | — | deployed environments only |
| 9.5 | `/coffee/` redirects to coffeehelpingfarms.com | [§1.1](functional-spec.md#11-pages-and-routes) | — | PHP host required |

## 10. Analytics

| # | Behavior | Spec | Status |
|---|---|---|---|
| 10.1 | `donation_click` on all four donation controls with the right labels | [analytics §1.3](analytics.md#13-where-each-attribute-appears) | — |
| 10.2 | `file_download` parameter derivation for filenames with spaces | [analytics §1.2](analytics.md#12-event-catalogue) | — |
| 10.3 | `outbound_click` includes `link_domain` and `outbound: true` | [analytics §1.2](analytics.md#12-event-catalogue) | — |
| 10.4 | `sign_up` fires on the Mailchimp click even when blocked | [analytics §1.4](analytics.md#14-notes-on-double-counting) | — |
| 10.5 | `video_play` fires for the YouTube and Vimeo embeds | [analytics §2](analytics.md#2-video-tracking) | — |
| 10.6 | `form_submit` is currently **not** emitted | [KI-01](known-issues.md#ki-01) | — |
| 10.7 | Clicking an inner icon inside a tracked link still fires the event | [analytics §1.1](analytics.md#11-delegated-click-tracking) | — |

A practical approach for 10.x: stub `window.gtag` before navigation (`page.addInitScript`) and record the
calls, rather than asserting network traffic to Google.

## 11. Server-side (`contactsubmit.php`) — requires a PHP environment

| # | Behavior | Spec |
|---|---|---|
| 11.1 | GET returns 200 with an empty body | [forms §2.1](forms-and-backend.md#21-preconditions) |
| 11.2 | Valid POST + valid captcha → 200 `{"success":true}` and an email to `mailto` | [forms §2.5](forms-and-backend.md#25-smtp-send) |
| 11.3 | Subject switches on whether `note` is non-empty | [forms §2.4](forms-and-backend.md#24-email-composition) |
| 11.4 | Body includes only non-empty fields, in the documented order | [forms §2.4](forms-and-backend.md#24-email-composition) |
| 11.5 | Invalid captcha → **200** with `{"error":"Captcha Failed"}` and a log line | [KI-07](known-issues.md#ki-07) |
| 11.6 | SMTP failure → 500, error JSON, and a log line | [forms §2.5](forms-and-backend.md#25-smtp-send) |
| 11.7 | `Accept: application/json` → JSON; otherwise the HTML meta-refresh page | [forms §2.6](forms-and-backend.md#26-response-negotiation) |
| 11.8 | Mailing-list POST triggers undefined-key warnings | [KI-06](known-issues.md#ki-06) |
| 11.9 | Reply-To is the submitter's address for contact submissions | [forms §2.5](forms-and-backend.md#25-smtp-send) |

## 12. Cross-cutting

| # | Behavior | Spec |
|---|---|---|
| 12.1 | Responsive layout at 320, 375, 600, 768, 992, 1024, 1440px | [§1.6](functional-spec.md#16-design-tokens) |
| 12.2 | Behavior with JavaScript disabled | [§1.7](functional-spec.md#17-progressive-enhancement-and-offline-behavior) |
| 12.3 | Behavior with third-party hosts blocked (ad blocker / offline) | [§1.7](functional-spec.md#17-progressive-enhancement-and-offline-behavior) |
| 12.4 | Keyboard-only navigation through nav, tabs, forms, and modals | [KI-10](known-issues.md#ki-10) |
| 12.5 | Screen-reader announcement of validation errors | [KI-10](known-issues.md#ki-10) |
| 12.6 | `robots.txt` and `sitemap.xml` served and internally consistent | [§7](functional-spec.md#7-static-and-server-files) |
| 12.7 | `brand-guide.html` returns 404 in production | [§6](functional-spec.md#6-brand-guide-brand-guidehtml--not-deployed) |
| 12.8 | `config.php` and `error_log.txt` are not publicly readable | [build §6](build-test-deploy.md#6-continuous-integration-and-deployment) |
