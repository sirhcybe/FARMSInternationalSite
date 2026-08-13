# Forms and backend

Complete behavioral contract for the three forms on the site and the PHP handlers behind them.

| Form | Selector | Handler | Bot protection | Result surface |
|---|---|---|---|---|
| Contact | `#email-form` | `contactsubmit.php` (AJAX) | reCAPTCHA v2 invisible | in-page messages |
| Mailing-list (snail mail) | `#mailing-form` | `contactsubmit.php` (AJAX) | reCAPTCHA v2 invisible | in-page messages |
| Email newsletter | `#mc-embedded-subscribe-form` | Mailchimp (new tab) | Mailchimp honeypot field | Mailchimp's own page |

---

## 1. Client-side validation (`src/js/farms.js`)

### 1.1 The `validateRequired(selector)` helper

```js
validateRequired(selector)  // selector is appended to input[required] and textarea[required]
```

It queries `input[required]<selector>, textarea[required]<selector>`, and for each element:

- empty value → `$(element).siblings('.required-error').show()` and the function's result becomes `false`;
- non-empty value → `$(element).siblings('.required-error').hide()`.

It returns `true` only when every matched control has a value. Notes that matter for testing:

- Validation is **presence-only**. No format, length, or character checks anywhere on the client — an
  email field accepts `not-an-email`, and a single space counts as a value.
- Error paragraphs are located by **sibling** relationship, so each error must sit inside the same
  `.form-group` as its input. All shipped markup follows this.
- `.required-error` is `display:none` in CSS by default; validation is what reveals it.

### 1.2 Live re-validation

`farms.js` binds `change keyup paste` on each field; each handler re-runs `validateRequired` scoped to
just that field:

| Field | Scope selector used |
|---|---|
| `#note` | `.email[name="note"]` |
| `#email` | `.email[name="email"]` |
| `#name` | `.mailing[name="name"]` |
| `#mailingaddress` | `.mailing[name="mailingaddress"]` |
| `#city` | `.mailing[name="city"]` |
| `#state` | `.mailing[name="state"]` |
| `#zip` | `.mailing[name="zip"]` |
| `#country` | `.mailing[name="country"]` |

So a visible error clears as soon as the user types a character into that field **[verified]**, and
typing in one field never clears another field's error.

Note the handlers fire on `paste` before the pasted value is committed to `input.value`, so a paste into
an empty field re-shows the error for that keystroke; the following `change`/`keyup` corrects it.

### 1.3 Submit interception

| Button | Handler | Group selector validated | reCAPTCHA widget executed |
|---|---|---|---|
| `#message-submit` | `validateEmail(event)` | `.email` (both `#email` and `#note`) | `FARMS.emailRecaptcha` |
| `#mail-submit` | `validateMailingSubscription(event)` | `.mailing` (all six address fields) | `FARMS.recaptchaMailing` |

Both handlers call `event.preventDefault()` **first**, so the native form POST never happens while
JavaScript is enabled — regardless of validity. If validation fails, the function simply returns after
showing the error paragraphs; nothing else happens. If validation passes, `grecaptcha.execute(<widget>)`
is called.

Because the group selector is `.email` (a class shared by `#email` and `#note`) rather than a form
scope, clicking `SUBMIT` validates exactly those two controls, and clicking `Subscribe` validates exactly
the six `.mailing` controls.

### 1.4 reCAPTCHA wiring

The reCAPTCHA API is loaded on the homepage only:

```html
<script src="https://www.google.com/recaptcha/api.js?onload=captchaCallback&render=explicit" async defer></script>
```

`captchaCallback()` (global, defined in `farms.js`) renders two invisible widgets:

| Container | Stored handle | Site key | Callback | Options |
|---|---|---|---|---|
| `emailRecaptcha` | `FARMS.emailRecaptcha` | `6Lc8_TYUAAAAANc47TO81_x4gGwS8IPHQZRRAMg2` | `onSubmitEmail` | `badge: inline`, `size: invisible` |
| `recaptchaMailing` | `FARMS.recaptchaMailing` | same | `onSubmitMailing` | `badge: inline`, `size: invisible` |

`onSubmitEmail()` → `onSubmit('#email-form')`; `onSubmitMailing()` → `onSubmit('#mailing-form')`.

**Failure mode**: if `api.js` cannot load (offline, blocked, or ad-blocked), `grecaptcha` is undefined
and clicking a submit button throws `ReferenceError: grecaptcha is not defined`; no request is sent and
no message is shown to the user **[verified]**. This is the expected behavior in any test environment
without outbound network access, and is why the automated tests only exercise the *invalid* submit path.

### 1.5 AJAX submission (`onSubmit(selector)`)

On the reCAPTCHA callback:

1. `$(selector + ' .contact-form-button-group').hide()` — hides the submit button **and everything else
   inside that group**.
2. `$(selector + ' .contact-form-sending').show()` — see [known issues](known-issues.md#ki-05): this
   paragraph is *inside* the group just hidden, so "Submitting..." is never actually visible.
3. `$.ajax({ url: 'contactsubmit.php', type: 'POST', data: $(selector).serialize(), dataType: 'json' })`.
   The URL is hard-coded and relative — it is **not** taken from the form's `action`. Serialized data
   includes every named control in the form plus the `g-recaptcha-response` token that reCAPTCHA injects,
   plus `submit` (the button's `name`) is not included because jQuery's `serialize()` omits buttons.

**Success handler** (any HTTP 2xx with parseable JSON):
- shows `.contact-form-success`, then fades it out after 5000 ms;
- re-shows `.contact-form-button-group`, hides `.contact-form-sending`;
- calls `form.reset()`, clearing all fields;
- attempts `window.FARMS.fireEvent('form_submit', { form_name: … })` where `form_name` is
  `Contact Form` for `#email-form` and `Mailing List Subscription` for anything else. This call is
  currently a no-op — see [known issues](known-issues.md#ki-01).

**Error handler** (non-2xx status, or a body that is not valid JSON):
- shows `.contact-form-failure`, fading out after 5000 ms;
- re-shows the button group, hides the sending message;
- **does not** reset the form, so the user's input is preserved for a retry.

Neither path re-arms reCAPTCHA explicitly; invisible reCAPTCHA resets its token on its own schedule, so
rapid repeat submissions may require a fresh challenge.

### 1.6 Mailchimp email signup

`#mc-embedded-subscribe` has its own click handler:

```js
if ($('.mc-email').val() == undefined || $('.mc-email').val() == "") {
  $('.mc-email-error').toggle();
  return false;   // blocks submission
}
return true;      // allows the native POST to Mailchimp in a new tab
```

- Empty email → the error paragraph's visibility is **toggled** (not shown), and submission is blocked.
  Clicking twice with an empty field therefore hides the message again **[verified]**.
- No handler clears the message when the user starts typing (unlike the other forms).
- Non-empty value → native submit to the Mailchimp `action` URL with `target="_blank"`; the FARMS page
  stays as-is. The form carries `novalidate`, so the browser does not enforce `type="email"` formatting;
  Mailchimp performs the real validation and renders its own confirmation or error page.
- The honeypot input `b_327bff531daf5aae34d2fe667_8269e92cdf` must remain empty and off-screen.

---

## 2. `contactsubmit.php` — request contract

Handles both `#email-form` and `#mailing-form`.

### 2.1 Preconditions

- The whole script body is wrapped in `if ($_SERVER['REQUEST_METHOD'] === 'POST')`. A GET request returns
  **HTTP 200 with a completely empty body** — no error, no redirect.
- `include('config.php')` must resolve. `config.php` is not in the repository; it is created per
  environment from `config.example.php` and supplies:

  | Key | Meaning |
  |---|---|
  | `$config['smtpemail']` | SMTP username |
  | `$config['smtppassword']` | SMTP password |
  | `$config['smtpserver']` | SMTP hostname |
  | `$config['mailto']` | recipient of every submission |
  | `$config['recaptchaprivatekey']` | reCAPTCHA v2 secret |

### 2.2 Accepted parameters

| Parameter | Sent by contact form | Sent by mailing form | Read with null-coalescing |
|---|---|---|---|
| `email` | yes | no | **no** — direct `$_POST['email']` |
| `note` | yes | no | **no** — direct `$_POST['note']` |
| `name` | no | yes | yes |
| `mailingaddress` | no | yes | yes |
| `city` | no | yes | yes |
| `state` | no | yes | yes |
| `zip` | no | yes | yes |
| `country` | no | yes | yes |
| `g-recaptcha-response` | yes | yes | no |

Because `email` and `note` are read without `??`, a mailing-list submission emits PHP
"Undefined array key" warnings (and a contact submission does the same for the address keys only if they
were also absent, which they are not). Execution continues with null values. Depending on
`display_errors`, those warnings can be prepended to the response body and break JSON parsing on the
client — see [known issues](known-issues.md#ki-06).

### 2.3 reCAPTCHA verification

The handler POSTs to `https://www.google.com/recaptcha/api/siteverify` via
`file_get_contents` + `stream_context_create`, sending `secret`, `response`
(`$_POST['g-recaptcha-response']`), and `remoteip` (`$_SERVER['REMOTE_ADDR']`).

| Outcome | Behavior |
|---|---|
| `success: true` | continue to mail send |
| `success` falsy (bad/expired/missing token) | append `Captcha failed. Response: <raw JSON>` to `error_log.txt`; set `$responseJson = { "error": "Captcha Failed" }`; set the HTML message to "Submission failed, please try emailing us at info@farmsinternational.com." — **and leave the HTTP status at 200** |

The 200-on-captcha-failure behavior means the browser's success handler runs and the user sees the
success message even though nothing was emailed. See [known issues](known-issues.md#ki-07).

If the outbound `file_get_contents` call itself fails (no network, blocked), `$verify` is `false`,
`json_decode` yields `null`, and `!$resp->success` is evaluated on null — the captcha-failure branch is
taken and a PHP warning is emitted.

### 2.4 Email composition

- Subject: `New Contact Form Submission` when `trim($note) != ""`, otherwise
  `New Mail Newsletter Subscription`.
- Body is plain text, built by appending only the non-empty values, in this fixed order:

  ```
  From: <name>
  Email: <email>
  Mailing Address: <mailingaddress>
  City: <city>
  State: <state>
  Zip: <zip>
  Country: <country>
  Note:
  <note>
  ```

  The `From:` line is always emitted, even when `name` is empty (contact-form submissions therefore start
  with a bare `From: `).
- No HTML escaping or input sanitization is applied to any field before it reaches the message body.

### 2.5 SMTP send

PHPMailer 5.2.28 (`class.phpmailer.php`, loaded through `PHPMailerAutoload.php`) with:

| Setting | Value |
|---|---|
| Transport | `isSMTP()` |
| Host | `$config['smtpserver']` |
| Port | `587` |
| `SMTPAuth` | `true` |
| `SMTPAutoTLS` | `false` |
| `SMTPDebug` | `0` (`Debugoutput = 'html'`) |
| Timezone | `date_default_timezone_set('Etc/UTC')` before send |
| From | `info@farmsinternational.com` ("FARMS Contact Form") |
| Reply-To | `$email` with display name `$name` — silently skipped by PHPMailer if the address is empty or invalid |
| To | `$config['mailto']` |

| Send result | HTTP status | JSON body | HTML message |
|---|---|---|---|
| success | 200 | `{ "success": true }` | `Submission successful!` |
| failure | **500** | `{ "error": "<PHPMailer ErrorInfo>" }` | `Submission failed, please try emailing us at info@farmsinternational.com.` |

On failure the handler also appends `Mail send failed: <ErrorInfo>` to `error_log.txt`.
`ErrorInfo` is interpolated into the JSON string without escaping, so an error message containing a quote
or backslash produces malformed JSON; the browser then falls into the AJAX error handler, which happens
to be the correct user-facing outcome anyway.

### 2.6 Response negotiation

```php
if (strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) { … JSON … } else { … HTML … }
```

- **JSON path** — `Content-Type: application/json` and the JSON string above. jQuery's
  `dataType: 'json'` sends an `Accept` header containing `application/json`, so all in-page submissions
  take this path.
- **HTML path** — `Content-Type: text/html; charset=UTF-8` and a minimal document containing the message
  in bold, the text "Redirecting to FARMS homepage in 10 seconds.", a
  `<meta http-equiv="refresh" content="10;url=http://www.farmsinternational.com" />`, and a manual link
  to the same URL. Note the redirect target is plain `http://` and includes the `www.` host.

### 2.7 Logging

`log_error_message()` appends `[Y-m-d H:i:s] <message>` lines to `error_log.txt` next to the script.
The file is gitignored and excluded from deployment, so it accumulates only on the server. Only two
events are logged: captcha failure (with the full verify response) and mail-send failure.

---

## 3. `premiumsubmit.php` — legacy, unreferenced

No page in the repository posts to this endpoint. It is still deployed. Documented so testers do not
mistake it for a live feature:

- POST-only, same as above; includes `config.php`.
- Guard is `if ($email || filter_var($email, FILTER_VALIDATE_EMAIL))` — an OR, so any non-empty string
  passes regardless of format.
- Hard-codes `Host = "SMTP.FARMSINTERNATIONAL.COM"` rather than reading `$config['smtpserver']`.
- Emails the submitter a message whose body is `file_get_contents('premiumemail.html')` — **that file
  does not exist in the repository**, so the body is empty/false and a PHP warning is emitted.
- `echo $mail->Body;` prints the body before the JSON/HTML response, corrupting either format.
- If `subscribe-email` is posted, it reuses the same `$mail` object (accumulating recipients) to send a
  second notification to `info@farmsinternational.com`.
- The else-branch references `$errEmail`, which is never defined, producing another warning and the
  literal JSON `{ "emailValidationFailed": }`.
- The non-JSON response redirects to `http://www.farmsinternational.com/givegood.html`, a page that no
  longer exists in this repository.

---

## 4. Data handling and privacy notes

- Contact and mailing submissions are emailed to `$config['mailto']` and are not persisted anywhere on
  the server (aside from failure lines in `error_log.txt`, which contain no user input).
- Email newsletter signups go directly to Mailchimp list `8269e92cdf` (account `327bff531daf5aae34d2fe667`)
  and never touch the FARMS server.
- Donations are handled entirely by Aplos and Engiven; no payment data touches this site.
- reCAPTCHA, GA4, and Clarity set third-party cookies; the site displays no cookie consent banner.

---

## 5. Non-AJAX fallback

With JavaScript disabled, the two PHP-backed forms submit natively:

| Form | Method | Action | Result |
|---|---|---|---|
| `#email-form` | POST | `contactsubmit.php` | full-page HTML response (§2.6) |
| `#mailing-form` | POST | `contactsubmit.php` | same |
| `#mc-embedded-subscribe-form` | POST | Mailchimp URL | Mailchimp page in a new tab |

Native `required` attributes then take effect, so the browser blocks empty fields with its own bubbles
instead of the `.required-error` paragraphs. No `g-recaptcha-response` is sent, so `contactsubmit.php`
takes the captcha-failure branch and returns the HTML "Submission failed…" page with a 10-second
redirect. In other words, **the PHP-backed forms cannot succeed without JavaScript.**
