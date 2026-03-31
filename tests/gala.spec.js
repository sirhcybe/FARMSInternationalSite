const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/gala.html');
});

test('has correct title', async ({ page }) => {
  await expect(page).toHaveTitle(/FARMS International.*Gala/i);
});

test('header section with logo is present', async ({ page }) => {
  await expect(page.locator('.gala-header')).toBeVisible();
  await expect(page.locator('.gala-header img')).toBeVisible();
});

test('logo links back to homepage', async ({ page }) => {
  await expect(page.locator('.gala-header a')).toHaveAttribute('href', '/');
});

test('main heading is present', async ({ page }) => {
  await expect(page.locator('.gala-h1')).toBeVisible();
  await expect(page.locator('.gala-h1')).toContainText('Building Legacy');
});

test('invitation heading is present', async ({ page }) => {
  await expect(page.locator('.gala-h2').first()).toContainText("FARMS International Gala");
});

test('tagline is present', async ({ page }) => {
  const tagline = page.locator('.gala-h2').filter({ hasText: 'Rooted in Faith' });
  await expect(tagline).toBeAttached();
});

test('RSVP button is present and links to registration form', async ({ page }) => {
  const btn = page.locator('.btn-gala');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute('href', /docs\.google\.com/);
  await expect(btn).toHaveAttribute('target', '_blank');
});

test('invitation body text is present', async ({ page }) => {
  await expect(page.locator('.gala-text').first()).toContainText('Dear Friends');
});

test('decorative banner section is present', async ({ page }) => {
  await expect(page.locator('.gala-banner')).toBeAttached();
});

test('footer is present with copyright', async ({ page }) => {
  await expect(page.locator('.footer')).toBeVisible();
  await expect(page.locator('.footer-left')).toContainText('FARMS International');
});
