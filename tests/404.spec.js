const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/404.html');
});

test('has correct title', async ({ page }) => {
  await expect(page).toHaveTitle(/FARMS International/);
});

test('navbar is present', async ({ page }) => {
  await expect(page.locator('#secondaryNav')).toBeVisible();
});

test('displays 404 heading', async ({ page }) => {
  await expect(page.locator('.page-not-found-section h1')).toContainText('404');
});

test('displays "Page Not Found" message', async ({ page }) => {
  await expect(page.locator('.page-not-found-section')).toContainText('Page Not Found');
});

test('homepage button is present and links to /', async ({ page }) => {
  const btn = page.locator('.page-not-found-section a.btn');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute('href', '/');
});

test('footer is present', async ({ page }) => {
  await expect(page.locator('.footer')).toBeVisible();
});
