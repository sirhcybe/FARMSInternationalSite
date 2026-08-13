# Known issues and behavioral quirks

Current, reproducible behaviors that differ from what the code appears to intend. They are documented so
that test expectations match the shipped build rather than the apparent intent. Nothing here has been
changed — this is a description of the site as it stands.

Items marked **[verified]** were reproduced in Chromium against the current build.

---

<a id="ki-01"></a>
## KI-01 — `form_submit` analytics event never fires **[verified]**

**Where** `src/js/analytics.js` (export) and `src/js/farms.js` line 25 (`var FARMS = {};`).

Because the build concatenates all custom scripts into one file, `var FARMS = {}` in `farms.js` is a
global declaration that reassigns `window.FARMS` **after** `analytics.js` has set
`window.FARMS.fireEvent` (alphabetical load order puts `analytics.js` first). At runtime
`typeof window.FARMS.fireEvent === 'undefined'`, so the guard in the AJAX success handler
(`if (window.FARMS && window.FARMS.fireEvent)`) is false and no event is sent.

**Observable** After a successful contact or mailing submission, GA4 receives no `form_submit` hit.
Everything else about the submission works normally.

**Fix direction** Have `farms.js` extend rather than replace the object, e.g.
`window.FARMS = window.FARMS || {};` and drop the local `var FARMS`.

---

<a id="ki-02"></a>
## KI-02 — Mailchimp empty-email error toggles instead of showing **[verified]**

**Where** `src/js/farms.js`, `#mc-embedded-subscribe` click handler.

The handler calls `$('.mc-email-error').toggle()`. Clicking SUBSCRIBE with an empty email shows the
message; clicking again with the field still empty **hides** it while still blocking submission. There is
also no `keyup`/`change` handler on `.mc-email`, so the message stays visible after the user types a
valid address until the form is submitted.

**Fix direction** `.show()` instead of `.toggle()`, plus a live-validation binding like the other fields.

---

<a id="ki-03"></a>
## KI-03 — Six project modals are live DOM, and a stray `-->` renders **[verified]**

**Where** `src/index.html` lines ~759–1123.

The block opens with `<!-- Project modals — preserved for future interactive map feature` and the very
next line is `<!-- Bangladesh Modal -->`. HTML comments do not nest, so the comment terminates at that
first `-->`. Everything after it — all six `.project-modal` elements — is parsed as real markup, and the
closing `-->` on line 1123 is parsed as text content.

**Observable**
- `document.querySelectorAll('.project-modal').length === 6`; none are visible (Bootstrap's `.modal`
  sets `display:none`) and nothing triggers them.
- The literal text `-->` is rendered at the bottom of the homepage, below the footer.
- Roughly 20 KB of hidden markup and six lazy-loaded modal images ship on every homepage load.

**Fix direction** Delete the block, or comment it correctly (no nested `<!--`).

---

<a id="ki-04"></a>
## KI-04 — 404 page is missing Font Awesome **[verified]**

**Where** `src/404.html` `<head>`.

Index, resources, and gala link `vendor/fontawesome-free/css/all.min.css`; 404 does not. The
`<i class="fas fa-long-arrow-alt-right">` inside the "Homepage" button therefore renders as nothing.
The 404 navbar also omits `fixed-top`, unlike the resources page navbar, and its footer copyright still
reads **2024** while the other pages read 2025.

---

<a id="ki-05"></a>
## KI-05 — "Submitting..." message is never visible

**Where** `src/js/farms.js`, `onSubmit()`; markup in `src/index.html`.

`onSubmit()` hides `.contact-form-button-group` and then shows `.contact-form-sending` — but that
paragraph is a **child** of the group just hidden, so it has no visible effect. During submission the user
sees the button disappear and nothing else until the success or failure message appears.

**Fix direction** Move the sending message outside the button group, or hide only the button.

---

<a id="ki-06"></a>
## KI-06 — PHP warnings on mailing-list submissions

**Where** `src/contactsubmit.php` lines 39 and 41.

`$email = $_POST['email'];` and `$note = $_POST['note'];` are read without `??`, while every other field
uses `?? ''`. The mailing-list form posts neither key, so PHP 8 raises two "Undefined array key"
warnings. Processing continues (both values become `null`, the subject correctly becomes
`New Mail Newsletter Subscription`, and `addReplyTo('')` is silently skipped).

**Risk** With `display_errors` on, the warnings are printed **before** the JSON body, which makes the
response unparseable; jQuery then routes a successful send into the AJAX error handler and the user sees
"Sorry there was an error." even though the email was delivered.

---

<a id="ki-07"></a>
## KI-07 — Captcha failure returns HTTP 200 and looks like success

**Where** `src/contactsubmit.php` captcha branch.

When verification fails the handler sets `$responseJson = { "error": "Captcha Failed" }` but never calls
`http_response_code()`. The response is a 200 with parseable JSON, so jQuery's **success** handler runs:
the user sees "Thank you for your interest in FARMS International!", the form resets, and no email is
ever sent. The failure is recorded only in `error_log.txt`. The mail-send failure path, by contrast,
correctly returns 500.

**Fix direction** Set `http_response_code(403)` (or check `result.error` in the success handler).

---

<a id="ki-08"></a>
## KI-08 — `premiumsubmit.php` is broken and unreferenced

Dead endpoint kept in the deploy. It reads a `premiumemail.html` template that does not exist, `echo`s
the mail body before the response (corrupting both the JSON and HTML output), references the undefined
`$errEmail`, hard-codes the SMTP host instead of using `config.php`, uses `||` where `&&` was intended in
its email check, reuses one PHPMailer instance for two different recipients, and redirects to
`givegood.html`, which no longer exists. See
[forms-and-backend.md §3](forms-and-backend.md#3-premiumsubmitphp--legacy-unreferenced).

---

<a id="ki-09"></a>
## KI-09 — Content and configuration drift

| Item | Current state |
|---|---|
| Gala page | Advertises a **March 22, 2025** event; still reachable at `/gala.html`, though its nav links are commented out |
| Footer copyright | Hard-coded `2025` (index, resources, gala) and `2024` (404); requires a manual annual edit |
| `#farmsAge` fallback | The HTML literal is `56`, which corresponds to 2017; only correct once JavaScript runs |
| Haiti | Has a resources column and a hidden modal but is **not** highlighted on the world map |
| Newsletter PDFs | 22 of 73 are orphaned (see [content inventory §3](content-inventory.md#3-newsletter-pdf-library)); `sitemap.xml` is hand-maintained and lists some of them |
| `composer.json` | Declares PHPMailer ^7.0 while the code vendors and requires 5.2.28 |
| `src/readme.txt` | Documents a Gulp workflow that no longer exists (the build is esbuild) |
| Aplos script tag | Included twice on the homepage |
| Resources `#additional` column | Heading is an empty `&nbsp;`; markup has a stray duplicate `</a>` |

---

<a id="ki-10"></a>
## KI-10 — Accessibility gaps worth flagging in test reports

- Decorative and content images in several places have empty or missing `alt` text: resources-page
  country thumbnails (`alt=""`), footer social icons, the newsletter card images have alt text but the
  GuideStar seal image has none.
- The interactive map is mouse-only: tooltips respond to `mousemove` only, highlighted countries are not
  focusable, and there is no keyboard or touch equivalent.
- Form fields are labelled by `placeholder` only — there are no `<label>` elements and no
  `aria-label`/`aria-describedby` linking the error paragraphs to their inputs.
- Error messages appear and disappear without an ARIA live region, so screen readers are not notified.
- The dismissible promo banner (when enabled) uses an unlabelled `×` button.
