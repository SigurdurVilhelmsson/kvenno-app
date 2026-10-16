import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

/**
 * axe on the real Íslenskubraut pages, with the real header, footer, fonts and category colours.
 * The jsdom test beside the app (`a11y.test.tsx`) cannot do this: jsdom computes no colours, so
 * it has no contrast check, and it mocks the shared header and footer.
 *
 * Every category and every tab is checked, since each category brings its own colour and each
 * tab draws its own card.
 */

const CATEGORIES = ['dyr', 'matur', 'farartaeki', 'manneskja', 'stadir', 'klaednadur'];
const TABS = ['Spurningaspjald', 'Orðaforði', 'Setningarammar'];

async function expectNoViolations(page: Page, where: string) {
  // A pressed chip fades its colour in (`transition-colors`). Measured mid-fade, white text sits
  // on a half-coloured background and axe reports a contrast failure no reader ever sees, so
  // wait for every running transition to end first.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running')
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const summary = violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`
  );
  expect(summary, where).toEqual([]);
}

test('the home page has no WCAG AA violations', async ({ page }) => {
  await page.goto('/islenskubraut/');
  await expect(page.locator('h1')).toBeVisible();
  await expectNoViolations(page, 'heim');
});

for (const id of CATEGORIES) {
  test(`every tab of ${id} has no WCAG AA violations`, async ({ page }) => {
    await page.goto(`/islenskubraut/spjald/${id}`);
    for (const tab of TABS) {
      await page.getByRole('tab', { name: tab }).click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
      await expectNoViolations(page, `${id}, ${tab}`);
    }
  });
}

// The sentence builder, with a sentence built, in every category's colour.
for (const id of CATEGORIES) {
  test(`the sentence builder for ${id} has no WCAG AA violations`, async ({ page }) => {
    await page.goto(`/islenskubraut/smidur/${id}`);
    const frames = page.getByRole('group', { name: 'Veldu setningaramma' }).getByRole('button');
    await frames.last().click();
    const words = page.getByRole('group').last().getByRole('button');
    await words.first().click();
    await expect(page.getByTestId('smidur-setning')).toBeVisible();
    await expectNoViolations(page, `smiður ${id}`);
  });
}

// The links out, drafts included, which is the only way they show until approved (C11).
test('the card page with its draft links has no WCAG AA violations', async ({ page }) => {
  await page.goto('/islenskubraut/spjald/dyr?drog');
  await expect(page.getByRole('region', { name: 'Fleiri úrræði' })).toBeVisible();
  await expectNoViolations(page, 'tenglar dyr');
});

// The teachers' list of every builder, drafts included. Linked from nowhere on the site.
test('the list of sentence builders has no WCAG AA violations', async ({ page }) => {
  await page.goto('/islenskubraut/smidur');
  await expect(page.getByRole('heading', { level: 1, name: 'Setningasmiðir' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(CATEGORIES.length);
  await expectNoViolations(page, 'smiðalisti');
});

// The tabs (Orðaforði, Setningarammar, Spurningaspjald) ran 32 px past a 360 px screen until
// 2026-10-16, on every card, so every card and its draft links are checked.
test('the card pages do not scroll sideways at 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  for (const id of CATEGORIES) {
    await page.goto(`/islenskubraut/spjald/${id}?drog`);
    await expect(page.locator('h1')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, id).toBeLessThanOrEqual(0);
  }
});

test('the sentence builder does not scroll sideways at 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  for (const id of CATEGORIES) {
    await page.goto(`/islenskubraut/smidur/${id}`);
    await expect(page.locator('h1')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, id).toBeLessThanOrEqual(0);
  }
});
