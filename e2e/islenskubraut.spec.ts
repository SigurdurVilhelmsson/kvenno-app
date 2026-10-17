import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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

  test('header shows site title and links islenskubraut track', async ({ page }) => {
    await page.goto('/islenskubraut/');
    // The shared Header (default variant) renders the site title as a
    // home-link <a>, not an h1, and signals the current section via the
    // activeTrack prop. Assert the title link plus the visible Íslenskubraut
    // track tab in the header.
    await expect(page.locator('header')).toContainText('Námsvefur Kvennó');
    await expect(
      page.locator('header').getByRole('link', { name: 'Íslenskubraut' }).first()
    ).toBeVisible();
  });

  test('navigation link back to Namsvefur Kvenno exists', async ({ page }) => {
    await page.goto('/islenskubraut/');
    const navLink = page.locator('a', { hasText: 'Námsvefur Kvennó' });
    await expect(navLink).toBeVisible();
    await expect(navLink).toHaveAttribute('href', '/');
  });

  test('footer shows correct text', async ({ page }) => {
    await page.goto('/islenskubraut/');
    // Shared Footer renders "© <year> Kvennaskólinn í Reykjavík — <department>".
    await expect(page.locator('footer')).toContainText('Kvennaskólinn í Reykjavík');
    await expect(page.locator('footer')).toContainText('Íslenskubraut');
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

  test('clicking Matur og drykkur navigates to teaching card page with correct URL', async ({
    page,
  }) => {
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

test.describe('Islenskubraut — fonts', () => {
  test('loads its two fonts from the site itself, not from Google', async ({ page }) => {
    // The site CSP (server/nginx-site.conf) allows fonts and stylesheets from 'self' only, so
    // anything fetched from elsewhere would be refused in production.
    const offSite: string[] = [];
    await page.route(
      (url) => url.hostname !== 'localhost',
      (route) => {
        offSite.push(route.request().url());
        return route.abort();
      }
    );
    await page.goto('/islenskubraut/spjald/dyr');
    await page.evaluate(() => document.fonts.ready);

    expect(offSite).toEqual([]);
    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)
    );
    expect(loaded).toEqual(expect.arrayContaining(['DM Sans', 'Plus Jakarta Sans']));
  });
});

test.describe('Islenskubraut — card download', () => {
  test('downloads the card for the chosen level as a three-page PDF, with no backend', async ({
    page,
  }) => {
    // The cards are rendered at build time; nothing may reach for the old /api route.
    const apiCalls: string[] = [];
    page.on('request', (r) => {
      if (new URL(r.url()).pathname.startsWith('/api/')) apiCalls.push(r.url());
    });
    await page.goto('/islenskubraut/spjald/klaednadur?stig=B1');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Hlaða niður PDF' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('spjald-klaednadur-B1.pdf');

    const path = await download.path();
    const pdf = readFileSync(path!);
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g)).toHaveLength(3);
    expect(apiCalls).toEqual([]);
  });

  test('every card and sheet the app can link to exists', async ({ request }) => {
    const ids = ['dyr', 'matur', 'farartaeki', 'manneskja', 'stadir', 'klaednadur', 'skolinn'];
    const kinds = ['spjald', 'ordalisti', 'giskaleikur', 'texti', 'egget'];
    for (const id of ids) {
      for (const level of ['A1', 'A2', 'B1']) {
        for (const kind of kinds) {
          const res = await request.get(`/islenskubraut/spjold/${kind}-${id}-${level}.pdf`);
          expect(res.status(), `${kind} ${id} ${level}`).toBe(200);
          expect(res.headers()['content-type']).toBe('application/pdf');
        }
      }
    }
    // A card that does not exist is a 404, not the app's index.html under a .pdf name.
    expect((await request.get('/islenskubraut/spjold/spjald-dyr-C2.pdf')).status()).toBe(404);
  });

  // The recordings sit beside the app as files, as nginx serves them (server/nginx-site.conf):
  // a missing one is a 404, not the app's index.html handed to an audio player.
  test('a recording is served as audio, and a missing one is a 404', async ({ request }) => {
    const dir = fileURLToPath(new URL('../dist/islenskubraut/hljod', import.meta.url));
    const file = readdirSync(dir).find((f) => f.endsWith('.mp3'));
    expect(file).toBeTruthy();
    const res = await request.get(`/islenskubraut/hljod/${file}`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('audio/mpeg');
    expect((await request.get('/islenskubraut/hljod/0000000000000000.mp3')).status()).toBe(404);
  });
});

test.describe('Islenskubraut — the teachers’ review pages', () => {
  // The review page is several screens long; a page opened from low down on it opens at its top.
  test('a page opened from far down the review page opens at its top', async ({ page }) => {
    await page.goto('/islenskubraut/yfirferd');
    const last = page.getByRole('link', { name: /^Hlusta\s*, Skólinn/ });
    await last.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    await last.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Hlustun' })).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  // The listening page is tens of thousands of pixels long and loads on its own, after the
  // browser's own attempt to restore the scroll; a reload must still keep the teacher's place.
  test('a reload keeps the place on the long listening page', async ({ page }) => {
    await page.goto('/islenskubraut/yfirferd/hljod');
    await expect(page.getByRole('list', { name: 'Upptökur' })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 6000));
    await page.waitForFunction(() =>
      Object.keys(window.sessionStorage).some(
        (k) =>
          k.startsWith('islenskubraut-skrun:') && Number(window.sessionStorage.getItem(k)) > 5000
      )
    );
    await page.reload();
    await expect(page.getByRole('list', { name: 'Upptökur' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(5900);
  });

  // A link to a card on the review page (`#matur`) makes a history entry the router gives no key;
  // the page gives it one, so a reload there still finds the teacher's place.
  test('a reload after a link to a card keeps the place', async ({ page }) => {
    await page.goto('/islenskubraut/yfirferd');
    await page
      .getByRole('navigation', { name: 'Spjöldin' })
      .getByRole('link', { name: /Matur/ })
      .click();
    await expect(page).toHaveURL(/#matur$/);
    await page.evaluate(() => window.scrollBy(0, 700));
    const y = await page.evaluate(() => Math.round(window.scrollY));
    await page.waitForFunction(
      (y) =>
        Object.keys(window.sessionStorage).some(
          (k) =>
            k.startsWith('islenskubraut-skrun:') &&
            k !== 'islenskubraut-skrun:default' &&
            Math.abs(Number(window.sessionStorage.getItem(k)) - y) <= 2
        ),
      y
    );
    await page.reload();
    await expect(page.getByRole('heading', { level: 2, name: /Matur/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(y - 5);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeLessThan(y + 5);
  });

  // The page being left must not write the next page's scroll to the top as its own place: back
  // after a reload on the next page returns to where the teacher was.
  test('back to the listening page after a reload elsewhere keeps its place', async ({ page }) => {
    await page.goto('/islenskubraut/yfirferd/hljod');
    await expect(page.getByRole('list', { name: 'Upptökur' })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 20000));
    await page.waitForFunction(() =>
      Object.keys(window.sessionStorage).some(
        (k) =>
          k.startsWith('islenskubraut-skrun:') && Number(window.sessionStorage.getItem(k)) > 19000
      )
    );
    // A click as a mouse gives it, without scrolling the link into view first.
    await page.getByRole('link', { name: 'Yfirferð' }).dispatchEvent('click');
    await expect(page.getByRole('heading', { level: 1, name: /Yfirferð/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: /Yfirferð/ })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('list', { name: 'Upptökur' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(19900);
  });

  // A tab left open across a deploy asks for a chunk the deploy removed. It reloads once and
  // gets the new one, rather than going blank.
  test('a page whose chunk has gone since the tab opened reloads instead of going blank', async ({
    page,
  }) => {
    await page.goto('/islenskubraut/yfirferd');
    let refused = 0;
    await page.route(/\/islenskubraut\/assets\/YfirferdHljod-[^/]+\.js$/, (route) => {
      if (refused++ === 0) return route.fulfill({ status: 404, body: '' });
      return route.continue();
    });
    await page.getByRole('link', { name: 'hlustunarsíðunni' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Hlustun' })).toBeVisible();
    expect(refused).toBeGreaterThanOrEqual(2);
  });
});
