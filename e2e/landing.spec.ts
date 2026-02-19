import { test, expect } from '@playwright/test';

test.describe('Landing page — Track selector', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Námsvef Kvennó');
  });

  test('displays Efnafraedi track card', async ({ page }) => {
    await page.goto('/');
    const efnafraediCard = page.locator('text=Efnafræði');
    await expect(efnafraediCard.first()).toBeVisible();
  });

  test('displays Islenskubraut track card', async ({ page }) => {
    await page.goto('/');
    const islenskubrautCard = page.locator('text=Íslenskubraut');
    await expect(islenskubrautCard.first()).toBeVisible();
  });

  test('clicking Efnafraedi navigates to chemistry hub', async ({ page }) => {
    await page.goto('/');
    // Efnafraedi is an internal SPA Link (not isExternal), rendered as a React Router <Link>
    const efnafraediLink = page.locator('a', { hasText: 'Efnafræði' }).first();
    await efnafraediLink.click();
    await page.waitForURL('**/efnafraedi');
    await expect(page.locator('h1')).toContainText('Efnafræði');
  });
});

test.describe('Chemistry hub — Year tiles', () => {
  test('shows year tiles (1. ar, 2. ar, 3. ar)', async ({ page }) => {
    await page.goto('/efnafraedi');
    await expect(page.locator('h1')).toContainText('Efnafræði');

    // Verify year navigation tiles
    await expect(page.locator('text=1. ár').first()).toBeVisible();
    await expect(page.locator('text=2. ár').first()).toBeVisible();
    await expect(page.locator('text=3. ár').first()).toBeVisible();
  });

  test('shows Valgreinar and F-bekkir tiles', async ({ page }) => {
    await page.goto('/efnafraedi');
    await expect(page.locator('text=Valgreinar').first()).toBeVisible();
    await expect(page.locator('text=F-bekkir').first()).toBeVisible();
  });

  test('clicking 1. ar navigates to year hub', async ({ page }) => {
    await page.goto('/efnafraedi');
    const yearLink = page.locator('a', { hasText: '1. ár' }).first();
    await yearLink.click();
    await page.waitForURL('**/efnafraedi/1-ar');
    await expect(page.locator('h1')).toContainText('1. árs efnafræði');
  });
});

test.describe('Year hub — Tool cards', () => {
  test('1. ar hub shows tool cards', async ({ page }) => {
    await page.goto('/efnafraedi/1-ar');
    await expect(page.locator('h1')).toContainText('1. árs efnafræði');

    // Should display tool cards
    await expect(page.locator('text=AI Efnafræðikennari').first()).toBeVisible();
    await expect(page.locator('text=Leikir og æfingar').first()).toBeVisible();
  });

  test('2. ar hub shows Tilraunaskyrslur card', async ({ page }) => {
    await page.goto('/efnafraedi/2-ar');
    await expect(page.locator('h1')).toContainText('2. árs efnafræði');
    await expect(page.locator('text=Tilraunaskýrslur').first()).toBeVisible();
  });

  test('breadcrumbs are visible on year hub', async ({ page }) => {
    await page.goto('/efnafraedi/1-ar');
    // Breadcrumbs show Heim > Efnafraedi > 1. ar
    await expect(page.locator('text=Heim').first()).toBeVisible();
    await expect(page.locator('nav >> text=Efnafræði').or(page.locator('[aria-label*="braut"] >> text=Efnafræði')).or(page.locator('text=Efnafræði').first())).toBeVisible();
  });

  test('back button navigates to chemistry hub', async ({ page }) => {
    await page.goto('/efnafraedi/1-ar');
    const backButton = page.locator('a', { hasText: 'Til baka' });
    await backButton.click();
    await page.waitForURL('**/efnafraedi');
    await expect(page.locator('h1')).toContainText('Efnafræði');
  });
});
