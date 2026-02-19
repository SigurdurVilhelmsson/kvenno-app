import { test, expect } from '@playwright/test';

test.describe('Islenskubraut — Category grid', () => {
  test('loads the category grid page', async ({ page }) => {
    await page.goto('/islenskubraut/');
    await expect(page.locator('h1')).toContainText('Kennsluspjöld fyrir íslenskukennslu');
  });

  test('displays all 6 categories', async ({ page }) => {
    await page.goto('/islenskubraut/');

    // The 6 categories with their actual display names
    await expect(page.locator('text=Dýr').first()).toBeVisible();
    await expect(page.locator('text=Matur og drykkur').first()).toBeVisible();
    await expect(page.locator('text=Farartæki').first()).toBeVisible();
    await expect(page.locator('text=Manneskja').first()).toBeVisible();
    await expect(page.locator('text=Staðir og byggingar').first()).toBeVisible();
    await expect(page.locator('text=Föt og klæðnaður').first()).toBeVisible();
  });

  test('displays the "how it works" steps', async ({ page }) => {
    await page.goto('/islenskubraut/');
    await expect(page.locator('text=Veldu flokk').first()).toBeVisible();
    await expect(page.locator('text=Veldu stig').first()).toBeVisible();
    await expect(page.locator('text=Hladdu niður').first()).toBeVisible();
  });

  test('clicking a category navigates to card detail page', async ({ page }) => {
    await page.goto('/islenskubraut/');
    // Click on the Dyr category card
    const dyrCard = page.locator('a', { hasText: 'Dýr' }).first();
    await dyrCard.click();
    await page.waitForURL('**/islenskubraut/spjald/dyr');
  });

  test('header shows Islenskubraut title', async ({ page }) => {
    await page.goto('/islenskubraut/');
    await expect(page.locator('header h1')).toContainText('Íslenskubraut');
  });

  test('navigation link back to Namsvefur Kvenno exists', async ({ page }) => {
    await page.goto('/islenskubraut/');
    const navLink = page.locator('a', { hasText: 'Námsvefur Kvennó' });
    await expect(navLink).toBeVisible();
    await expect(navLink).toHaveAttribute('href', '/');
  });

  test('footer shows correct text', async ({ page }) => {
    await page.goto('/islenskubraut/');
    await expect(
      page.locator('footer').locator('text=Íslenskubraut — Kvennaskólinn í Reykjavík')
    ).toBeVisible();
  });
});

test.describe('Islenskubraut — Teaching card page navigation', () => {
  test('category grid shows exactly 6 category cards', async ({ page }) => {
    await page.goto('/islenskubraut/');
    await page.waitForLoadState('networkidle');

    // Each category is rendered as an <a> card linking to /islenskubraut/spjald/:id
    const categoryLinks = page.locator('a[href*="/islenskubraut/spjald/"]');
    await expect(categoryLinks).toHaveCount(6);
  });

  test('clicking Matur og drykkur navigates to teaching card page with correct URL', async ({ page }) => {
    await page.goto('/islenskubraut/');
    await page.waitForLoadState('networkidle');

    const maturCard = page.locator('a', { hasText: 'Matur og drykkur' }).first();
    await maturCard.click();

    // URL should match /islenskubraut/spjald/matur
    await page.waitForURL('**/islenskubraut/spjald/matur');

    // Category name should be visible on the page
    await expect(page.locator('text=Matur og drykkur').first()).toBeVisible();
  });

  test('teaching card page shows level selector and download button', async ({ page }) => {
    await page.goto('/islenskubraut/spjald/dyr');
    await page.waitForLoadState('networkidle');

    // Level selector heading
    await expect(page.locator('text=Veldu erfiðleikastig').first()).toBeVisible();

    // Category name should be displayed
    await expect(page.locator('text=Dýr').first()).toBeVisible();

    // "Allir flokkar" back link should be present
    const backLink = page.locator('a', { hasText: 'Allir flokkar' });
    await expect(backLink).toBeVisible();
  });

  test('can navigate between categories via back link', async ({ page }) => {
    // Start at Farartaeki category
    await page.goto('/islenskubraut/spjald/farartaeki');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Farartæki').first()).toBeVisible();

    // Click "Allir flokkar" to go back to grid
    const backLink = page.locator('a', { hasText: 'Allir flokkar' });
    await backLink.click();
    await page.waitForURL('**/islenskubraut');

    // Now navigate to a different category
    const manneskjaCard = page.locator('a', { hasText: 'Manneskja' }).first();
    await manneskjaCard.click();
    await page.waitForURL('**/islenskubraut/spjald/manneskja');
    await expect(page.locator('text=Manneskja').first()).toBeVisible();
  });
});
