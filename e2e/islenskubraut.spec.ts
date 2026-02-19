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
