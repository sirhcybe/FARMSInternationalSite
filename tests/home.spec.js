const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Not 'load': the Raisely donation embed pulls in Stripe frames, and waiting
  // on them made unrelated tests time out under parallel load. Every assertion
  // below auto-waits, so DOM readiness is enough. The console-error test does
  // its own full-load navigation.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

// ---------------------------------------------------------------------------
// Page fundamentals
// ---------------------------------------------------------------------------
test.describe('Page fundamentals', () => {
  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/FARMS International/);
  });

  test('has favicon', async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]').first();
    await expect(favicon).toHaveAttribute('href', /favicon/);
  });

  // Third-party embeds (reCAPTCHA, YouTube, the Raisely donation widget and the
  // Stripe frames it loads) log errors we neither own nor can fix. Matching on
  // message text alone proved brittle -- Raisely's wording varies and does not
  // always name itself -- so ignore anything reported from outside our own
  // origin first, and keep the text list for messages Firefox reports without
  // a usable source URL.
  const IGNORED_ERROR_TEXT = [
    'recaptcha', 'google', 'raisely', 'cdn.', 'analytics', 'cors',
    'net::', 'ns_binding', 'youtube', 'samesite', 'cookie', 'juggler',
    'compute-pressure', 'permissions policy', 'requeststorageaccess',
    'payment method',
  ];

  test('loads without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const location = msg.location();
      errors.push({ text: msg.text(), url: (location && location.url) || '' });
    });
    await page.goto('/');

    const ownOrigin = new URL(page.url()).origin;
    const siteErrors = errors.filter(({ text, url }) => {
      // Raised inside a third-party script or iframe, so not ours to fix.
      if (url && !url.startsWith(ownOrigin)) return false;
      const lower = text.toLowerCase();
      return !IGNORED_ERROR_TEXT.some(pattern => lower.includes(pattern));
    });
    expect(siteErrors, `Unexpected console errors:
${JSON.stringify(siteErrors, null, 2)}`)
      .toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
test.describe('Navigation', () => {
  test('navbar is present', async ({ page }) => {
    await expect(page.locator('#mainNav')).toBeVisible();
  });

  test('logo links to page top', async ({ page }) => {
    const logo = page.locator('#mainNav .navbar-brand');
    await expect(logo).toHaveAttribute('href', '#page-top');
  });

  test('has all required nav links', async ({ page }) => {
    const nav = page.locator('#mainNav');
    await expect(nav.locator('a[href="#what-we-do"]')).toBeVisible();
    await expect(nav.locator('a[href="#projects"]')).toBeVisible();
    await expect(nav.locator('a[href="#coffee"]')).toBeVisible();
    await expect(nav.locator('a[href="#contact"]')).toBeVisible();
  });

  test('has donate dropdown', async ({ page }) => {
    await expect(page.locator('#mainNav .dropdown-toggle')).toBeVisible();
    await expect(page.locator('#mainNav .dropdown-menu')).toBeAttached();
  });

  test('mobile hamburger toggles nav menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const toggler = page.locator('.navbar-toggler');
    await expect(toggler).toBeVisible();
    const menu = page.locator('.navbar-collapse');
    await toggler.click();
    // Bootstrap 3 uses 'in' class, Bootstrap 4+ uses 'show'
    await expect(menu).toHaveClass(/\b(in|show)\b/);
  });
});

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
test.describe('Page sections', () => {
  test('hero/masthead section is present', async ({ page }) => {
    await expect(page.locator('.masthead')).toBeVisible();
  });

  test('"What We Do" section is present', async ({ page }) => {
    await expect(page.locator('#what-we-do')).toBeAttached();
  });

  test('newsletters section is present', async ({ page }) => {
    await expect(page.locator('#special-newsletters')).toBeAttached();
  });

  test('giving/donation section is present', async ({ page }) => {
    await expect(page.locator('#giving')).toBeAttached();
  });

  test('projects section is present', async ({ page }) => {
    await expect(page.locator('#projects')).toBeAttached();
  });

  test('coffee section is present', async ({ page }) => {
    await expect(page.locator('#coffee')).toBeAttached();
  });

  test('contact section is present', async ({ page }) => {
    await expect(page.locator('#contact')).toBeAttached();
  });

  test('FARMS age counter renders a number', async ({ page }) => {
    const age = page.locator('#farmsAge');
    await expect(age).toBeAttached();
    const text = await age.textContent();
    expect(parseInt(text, 10)).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Where We Work map
// ---------------------------------------------------------------------------
test.describe('Where We Work', () => {
  test('interactive map is rendered', async ({ page }) => {
    const container = page.locator('#farms-map-container');
    await container.scrollIntoViewIfNeeded();
    const svg = container.locator('svg#farms-world-map');
    await expect(svg).toBeVisible({ timeout: 10000 });
    // Verify highlighted countries exist
    await expect(container.locator('path.highlighted').first()).toBeAttached();
    // Verify region labels exist
    await expect(container.locator('text.region-label').first()).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Email contact form
// ---------------------------------------------------------------------------
test.describe('Email contact form', () => {
  test('form is present', async ({ page }) => {
    await expect(page.locator('#email-form')).toBeAttached();
  });

  test('has email field', async ({ page }) => {
    await expect(page.locator('#email-form #email')).toBeAttached();
  });

  test('has message/note field', async ({ page }) => {
    await expect(page.locator('#email-form #note')).toBeAttached();
  });

  test('has submit button', async ({ page }) => {
    await expect(page.locator('#message-submit')).toBeAttached();
  });

  test('shows validation errors when submitted empty', async ({ page }) => {
    await page.locator('#message-submit').click();
    // At least one required-error should become visible
    const errors = page.locator('#email-form .required-error');
    await expect(errors.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Mailing subscription form
// ---------------------------------------------------------------------------
test.describe('Mailing subscription form', () => {
  test('form is present', async ({ page }) => {
    await expect(page.locator('#mailing-form')).toBeAttached();
  });

  const fields = ['#name', '#mailingaddress', '#city', '#state', '#zip', '#country'];
  for (const field of fields) {
    test(`has field ${field}`, async ({ page }) => {
      await expect(page.locator(`#mailing-form ${field}`)).toBeAttached();
    });
  }

  test('has submit button', async ({ page }) => {
    await expect(page.locator('#mail-submit')).toBeAttached();
  });

  test('shows validation errors when submitted empty', async ({ page }) => {
    // Switch to the snail mail tab first (mailing form is in a hidden tab)
    await page.locator('#pills-snailmail-tab').click();
    await page.locator('#mail-submit').click();
    const errors = page.locator('#mailing-form .required-error');
    await expect(errors.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Mailchimp email newsletter
// ---------------------------------------------------------------------------
test.describe('Email newsletter subscription', () => {
  test('Mailchimp email field is present', async ({ page }) => {
    await expect(page.locator('#mce-EMAIL')).toBeAttached();
  });

  test('Mailchimp submit button is present', async ({ page }) => {
    await expect(page.locator('#mc-embedded-subscribe')).toBeAttached();
  });

  test('shows error when submitted with empty email', async ({ page }) => {
    await page.locator('#mc-embedded-subscribe').click();
    await expect(page.locator('.mc-email-error')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
test.describe('Footer', () => {
  test('footer is present', async ({ page }) => {
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('copyright year is current or recent', async ({ page }) => {
    const text = await page.locator('.footer-left').textContent();
    const currentYear = new Date().getFullYear();
    // Accept current year or one year behind (annual update cadence)
    expect(text).toMatch(new RegExp(`${currentYear - 1}|${currentYear}`));
  });

  test('social links are present', async ({ page }) => {
    const socials = page.locator('.social-buttons a');
    await expect(socials).toHaveCount(3); // Twitter, Facebook, Instagram
  });

  test('ECFA seal is present', async ({ page }) => {
    await expect(page.locator('.ecfaseal-footer')).toBeAttached();
  });

  test('GuideStar seal is present', async ({ page }) => {
    await expect(page.locator('.guidestarseal-footer')).toBeAttached();
  });
});
