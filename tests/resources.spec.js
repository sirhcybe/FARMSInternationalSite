const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/resources.html');
});

// ---------------------------------------------------------------------------
// Page fundamentals
// ---------------------------------------------------------------------------
test.describe('Page fundamentals', () => {
  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/FARMS International/);
  });

  test('navbar is present', async ({ page }) => {
    await expect(page.locator('#secondaryNav')).toBeVisible();
  });

  test('logo links to homepage', async ({ page }) => {
    await expect(page.locator('#secondaryNav .navbar-brand')).toHaveAttribute('href', /^\/?$/);
  });

  test('page heading is present', async ({ page }) => {
    const heading = page.locator('.resource-tron, .jumbotron');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('FARMS International');
  });

  test('footer is present with copyright', async ({ page }) => {
    await expect(page.locator('.footer')).toBeVisible();
    await expect(page.locator('.footer-left')).toContainText('FARMS International');
  });
});

// ---------------------------------------------------------------------------
// Country sections
// ---------------------------------------------------------------------------
test.describe('Country resource sections', () => {
  const countries = [
    '#cuba',
    '#bangladesh',
    '#haiti',
    '#moldova',
    '#nagaland',
    '#philippines',
    '#thailand',
    '#additional',
  ];

  for (const id of countries) {
    test(`${id} section is present`, async ({ page }) => {
      await expect(page.locator(id)).toBeAttached();
    });

    test(`${id} has at least one resource link`, async ({ page }) => {
      const links = page.locator(`${id} a`);
      await expect(links.first()).toBeAttached();
    });
  }
});

// ---------------------------------------------------------------------------
// Newsletter PDF links
// ---------------------------------------------------------------------------
test.describe('Newsletter links', () => {
  test('newsletter links point to PDF files', async ({ page }) => {
    const newsletterLinks = page.locator('.resource-newsletters a[href$=".pdf"]');
    const count = await newsletterLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('newsletter links open in a new tab', async ({ page }) => {
    const newsletterLinks = page.locator('.resource-newsletters a');
    const count = await newsletterLinks.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(newsletterLinks.nth(i)).toHaveAttribute('target', '_blank');
    }
  });
});

// ---------------------------------------------------------------------------
// Video links (Thailand section)
// ---------------------------------------------------------------------------
test.describe('Video links', () => {
  test('Thailand section has fancybox video links', async ({ page }) => {
    const videoLinks = page.locator('#thailand [data-fancybox]');
    await expect(videoLinks.first()).toBeAttached();
  });
});
