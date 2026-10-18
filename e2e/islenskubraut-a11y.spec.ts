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
// Every card page, the draft Skólinn included (REVIEW-QUEUE C19). It has no sentence builder.
const CARDS = [...CATEGORIES, 'skolinn'];
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

/**
 * How far the page runs past the screen's right edge, measured once the web fonts have loaded.
 * Measured before then, the result depends on how fast they arrive: CI's DejaVu Sans fallback is
 * wider than DM Sans, and the level buttons ran 2 px past the screen in it until 2026-10-17.
 */
async function sidewaysAt(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

/**
 * The page as a phone shows it while the web fonts are still loading, or when they never arrive:
 * in a wide fallback. DejaVu Sans is named because it is the widest of the common ones and is on
 * every Ubuntu machine, CI's included; a machine without it falls back to its own sans-serif.
 */
async function withoutWebFonts(page: Page) {
  await page.route(/\.woff2?$/, (route) => route.abort());
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = "* { font-family: 'DejaVu Sans', sans-serif !important; }";
      document.head.append(style);
    });
  });
}

test('the home page has no WCAG AA violations', async ({ page }) => {
  await page.goto('/islenskubraut/');
  await expect(page.locator('h1')).toBeVisible();
  await expectNoViolations(page, 'heim');
});

for (const id of CARDS) {
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
    // The words for the blank, when the frame has one; the drill below has buttons of its own.
    const words = page.locator('[aria-labelledby="smidur-ord"]').getByRole('button');
    if ((await words.count()) > 0) await words.first().click();
    await expect(page.getByTestId('smidur-setning')).toBeVisible();
    // The drill too, after a wrong pick, so its feedback is checked as well.
    const drill = page.getByRole('group', { name: 'Myndir orðsins' }).getByRole('button');
    if ((await drill.count()) > 0) await drill.first().click();
    await expectNoViolations(page, `smiður ${id}`);
  });
}

// The links out, drafts included, which is the only way they show until approved (C11).
test('the card page with its draft links has no WCAG AA violations', async ({ page }) => {
  await page.goto('/islenskubraut/spjald/dyr?drog');
  await expect(page.getByRole('region', { name: 'Fleiri úrræði' })).toBeVisible();
  await expectNoViolations(page, 'tenglar dyr');
});

// The recordings, drafts included, which is the only way they play until approved (C15): every
// tab of a card, at a phone's width, with a play button on its words and the clip served.
test('the card page with its draft recordings has no WCAG AA violations', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/islenskubraut/spjald/klaednadur?drog');
  for (const tab of ['Orðaforði', 'Setningarammar', 'Spurningaspjald']) {
    await page.getByRole('tab', { name: tab }).click();
    await expect(page.getByRole('button', { name: /^Hlusta: / }).first()).toBeVisible();
    await expectNoViolations(page, `hljóð klaednadur ${tab}`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, tab).toBeLessThanOrEqual(0);
  }
  // Asked for by the version of its audio, so a browser plays a recording made again, not a copy.
  // The player's own request (`media`), not the page's check of what the address holds.
  const played = page.waitForRequest(
    (r) =>
      r.resourceType() === 'media' &&
      /\/islenskubraut\/hljod\/[0-9a-f]{16}\.mp3\?v=[0-9a-f]{12}$/.test(r.url())
  );
  await page
    .getByRole('button', { name: /^Hlusta: / })
    .first()
    .click();
  const response = await (await played).response();
  expect(response?.status()).toBe(200);
});

// The students' own language beside the chips, a draft until a speaker approves it (C18).
test('the card page with a draft language has no WCAG AA violations', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/islenskubraut/spjald/klaednadur?drog');
  await page.getByRole('combobox', { name: 'Á þínu máli' }).selectOption('pl');
  await page.getByRole('tab', { name: 'Spurningaspjald' }).click();
  await expect(page.getByRole('link', { name: 'Orðabók: bolur' })).toBeVisible();
  await expectNoViolations(page, 'pólska klaednadur');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

// Until 2026-10-18 only the A1 chips had a Polish gloss, so at A2 and B1 most chips showed the
// dictionary link alone, which reads as a missing word. Every chip on every card now has one, at
// each level, and the longer glosses still fit a 360 px screen in the web font and in a fallback.
for (const fonts of ['web', 'fallback'] as const) {
  for (const level of ['A2', 'B1']) {
    for (const id of CARDS) {
      test(`every chip on ${id} has its Polish gloss at ${level} and fits 360 px (${fonts} font)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 360, height: 640 });
        if (fonts === 'fallback') await withoutWebFonts(page);
        await page.addInitScript(() => {
          try {
            window.localStorage.setItem('islenskubraut-mal', 'pl');
          } catch {
            // The test then fails on the missing glosses, which says why.
          }
        });
        await page.goto(`/islenskubraut/spjald/${id}?drog`);
        await page.getByRole('tab', { name: 'Spurningaspjald' }).click();
        await page.getByRole('button', { name: new RegExp(`^${level}`) }).click();
        await page.evaluate(() => document.fonts.ready);
        const glosses = page.locator('span[lang="pl"]');
        await expect(glosses.first()).toBeVisible();
        const bare = await glosses.evaluateAll((spans) =>
          spans
            .filter((span) => (span.textContent ?? '').replace('↗', '').trim() === '')
            .map((span) => span.parentElement?.textContent?.replace('↗', '').trim())
        );
        expect(bare, 'chips with only the dictionary link').toEqual([]);
        // A box hides what runs past its edge, so a gloss too wide for it is cut off, not
        // scrolled: the page test above cannot see that.
        const clipped = await glosses.evaluateAll((spans) =>
          spans
            .filter((span) => {
              const box = (
                span.closest('.overflow-hidden') ?? document.body
              ).getBoundingClientRect();
              const own = span.getBoundingClientRect();
              return own.left < box.left - 0.5 || own.right > box.right + 0.5;
            })
            .map((span) => span.textContent?.replace('↗', '').trim())
        );
        expect(clipped, 'glosses cut off at the edge of their box').toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        if (fonts === 'web') await expectNoViolations(page, `pólska ${id} ${level}`);
      });
    }
  }
}

// A draft category is left off the home page, and shown there under ?drog (C19).
test('the home page leaves out a draft category except under ?drog', async ({ page }) => {
  await page.goto('/islenskubraut/');
  await expect(page.getByRole('link', { name: /Dýr/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Skólinn/ })).toHaveCount(0);
  await page.goto('/islenskubraut/?drog');
  await expect(page.getByRole('link', { name: /Skólinn/ })).toBeVisible();
  await expectNoViolations(page, 'heimasíða með drögum');
});

// The teachers' list of every builder, drafts included. Linked from nowhere on the site.
test('the list of sentence builders has no WCAG AA violations', async ({ page }) => {
  await page.goto('/islenskubraut/smidur');
  await expect(page.getByRole('heading', { level: 1, name: 'Setningasmiðir' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(CATEGORIES.length);
  await expectNoViolations(page, 'smiðalisti');
});

// The tabs (Orðaforði, Setningarammar, Spurningaspjald) ran 32 px past a 360 px screen until
// 2026-10-16, on every card, so every card and its draft links are checked, in the web font and
// in a wide fallback.
for (const fonts of ['web', 'fallback'] as const) {
  test(`the card pages do not scroll sideways at 360 px (${fonts} font)`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    if (fonts === 'fallback') await withoutWebFonts(page);
    for (const id of CARDS) {
      expect(await sidewaysAt(page, `/islenskubraut/spjald/${id}?drog`), id).toBeLessThanOrEqual(0);
    }
  });

  test(`the sentence builder does not scroll sideways at 360 px (${fonts} font)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    if (fonts === 'fallback') await withoutWebFonts(page);
    for (const id of CATEGORIES) {
      expect(await sidewaysAt(page, `/islenskubraut/smidur/${id}`), id).toBeLessThanOrEqual(0);
    }
  });
}

// The teachers' review pages, linked from nowhere on the site. Checked with a note written and a
// recording marked wrong, so the note box and the "Hvað er rangt?" field are checked too, and
// at a phone's width, since a teacher may review on one.
test('the review page has no WCAG AA violations and keeps a note over a reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/islenskubraut/yfirferd');
  await expect(page.getByRole('heading', { level: 1, name: 'Yfirferð' })).toBeVisible();
  const dyr = page.getByRole('region', { name: /Dýr/ });
  await dyr.locator('summary').first().click();
  await page.getByLabel('Athugasemd um Spjaldið, Dýr').fill('A1: prófun.');
  await expectNoViolations(page, 'yfirferð');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await page.reload();
  await expect(page.getByLabel('Athugasemd um Spjaldið, Dýr')).toHaveValue('A1: prófun.');
  // A name first: it says who sent the file, a ruling is given by it, and it names the file,
  // between the time and the start of the browser's id.
  await page.getByLabel('Nafnið þitt').fill('Þóra Ösp');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sækja skrá' }).click();
  expect((await download).suggestedFilename()).toMatch(
    /^yfirferd-islenskubraut-\d{4}-\d{2}-\d{2}-\d{6}-thora-osp-[a-z0-9]{6}\.json$/
  );
});

test('the listening page has no WCAG AA violations', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/islenskubraut/yfirferd/hljod?flokkur=dyr');
  await expect(page.getByRole('heading', { level: 1, name: 'Hlustun' })).toBeVisible();
  const first = page.getByRole('list', { name: 'Upptökur' }).getByRole('listitem').first();
  await first.getByRole('button', { name: 'Rangt' }).click();
  await expect(first.getByLabel(/^Hvað er rangt\?/)).toBeVisible();
  await expectNoViolations(page, 'hlustun');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
  // Asked for by the version the page was built with, so no copy of older audio is played.
  // The player's own request (`media`), not the page's check of what the address holds.
  const played = page.waitForRequest(
    (r) =>
      r.resourceType() === 'media' &&
      /\/islenskubraut\/hljod\/[0-9a-f]{16}\.mp3\?v=[0-9a-f]{12}$/.test(r.url())
  );
  await first.getByRole('button', { name: /^Hlusta: / }).click();
  expect((await (await played).response())?.status()).toBe(200);
});
