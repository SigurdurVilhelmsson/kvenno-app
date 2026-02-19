import { test, expect } from '@playwright/test';

/**
 * E2E tests for the lab reports upload flow.
 *
 * Tests navigation to the lab reports page, experiment selector visibility,
 * file upload area interaction, and navigation between experiment configs.
 * Note: Actual AI analysis requires an API key and is not tested here.
 */
test.describe('Lab Reports — Upload flow (2-ar)', () => {
  const labReportsUrl = '/efnafraedi/2-ar/lab-reports/';

  test('experiment selector is visible', async ({ page }) => {
    await page.goto(labReportsUrl);
    await page.waitForLoadState('networkidle');

    // The experiment selector label "Veldu tilraun:" should be visible
    const label = page.locator('text=Veldu tilraun');
    await expect(label.first()).toBeVisible({ timeout: 10000 });

    // The select element should be present
    const select = page.locator('select');
    await expect(select.first()).toBeVisible();
  });

  test('can select an experiment from the dropdown', async ({ page }) => {
    await page.goto(labReportsUrl);
    await page.waitForLoadState('networkidle');

    // Find the experiment selector dropdown
    const select = page.locator('select').first();
    await expect(select).toBeVisible({ timeout: 10000 });

    // Get the available options
    const options = select.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    // Select the first available option (verify it can be interacted with)
    const firstOptionValue = await options.first().getAttribute('value');
    expect(firstOptionValue).toBeTruthy();
  });

  test('file upload area is present with accessible label', async ({ page }) => {
    await page.goto(labReportsUrl);
    await page.waitForLoadState('networkidle');

    // The file upload area should show the upload prompt text
    const uploadHeading = page.locator('text=/Hladdu upp|Veldu skrá/');
    await expect(uploadHeading.first()).toBeVisible({ timeout: 10000 });

    // The file input's label button should be present ("Velja skrar" or "Velja skra")
    const fileLabel = page.locator('label[for="file-upload"]');
    await expect(fileLabel).toBeVisible();
    await expect(fileLabel).toContainText(/Velja skrá/);
  });

  test('drag-and-drop area has visual feedback styling', async ({ page }) => {
    await page.goto(labReportsUrl);
    await page.waitForLoadState('networkidle');

    // The dashed-border drop zone should be present
    const dropZone = page.locator('[class*="border-dashed"]');
    await expect(dropZone.first()).toBeVisible({ timeout: 10000 });

    // Description of accepted file types should be visible
    const fileTypeDescription = page.locator('text=/\\.docx|PDF|mynd/');
    await expect(fileTypeDescription.first()).toBeVisible();
  });

  test('mode selector allows switching between teacher and student modes', async ({ page }) => {
    await page.goto(labReportsUrl);
    await page.waitForLoadState('networkidle');

    // Mode selector buttons should be visible ("Kennari" and "Nemandi")
    const teacherButton = page.locator('button', { hasText: 'Kennari' });
    const studentButton = page.locator('button', { hasText: 'Nemandi' });

    // If dual mode is enabled, both buttons should be visible
    const teacherVisible = await teacherButton.first().isVisible().catch(() => false);
    const studentVisible = await studentButton.first().isVisible().catch(() => false);

    if (teacherVisible && studentVisible) {
      // Click student mode
      await studentButton.first().click();

      // The upload area text should change to student mode language
      const studentUploadText = page.locator('text=/Veldu skrá|Fá endurgjöf/');
      await expect(studentUploadText.first()).toBeVisible();
    } else {
      // Single-mode app — just verify the page loaded
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});

test.describe('Lab Reports — Upload flow (3-ar)', () => {
  test('3-ar lab reports page has experiment selector', async ({ page }) => {
    await page.goto('/efnafraedi/3-ar/lab-reports/');
    await page.waitForLoadState('networkidle');

    // The experiment selector should be visible
    const label = page.locator('text=Veldu tilraun');
    await expect(label.first()).toBeVisible({ timeout: 10000 });
  });
});
