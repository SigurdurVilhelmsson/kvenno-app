import { test, expect } from '@playwright/test';

/**
 * Regression guard for the Three.js lazy boundary.
 *
 * The three 2-ar games below render molecules through `MoleculeViewer3DLazy`,
 * which dynamic-imports three / @react-three/fiber / @react-three/drei (~2.6 MB)
 * so a student only pays for it when they actually open a 3D view.
 *
 * That boundary is fragile in a specific way: any *static* import of
 * `MoleculeViewer3D` from the `@shared/components/MoleculeViewer3D` barrel puts
 * Three.js back in the entry chunk, and nothing fails — the game still works,
 * it just silently loads 2.6 MB up front again. That regression shipped
 * undetected for months (Rollup's only signal was an INEFFECTIVE_DYNAMIC_IMPORT
 * warning in build output nobody reads).
 *
 * These tests assert the payload is absent on load and present after use, so
 * the regression becomes a red test instead of a silent slowdown.
 *
 * Note: this only holds while these games build with `singleFile: false`
 * (see apps/games/shared-vite-config.ts). vite-plugin-singlefile re-inlines
 * dynamic chunks, which would make the deferred payload eager again.
 */

const THREE_D_GAMES = ['vsepr-geometry', 'lewis-structures', 'intermolecular-forces'] as const;

/** Chunk filenames that carry the heavy 3D payload. */
const HEAVY_CHUNK = /three\.module|drei-|react-three-fiber/;

for (const game of THREE_D_GAMES) {
  test(`${game} — does not load Three.js on initial render`, async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));

    await page.goto(`/efnafraedi/2-ar/games/${game}.html`);
    await page.waitForLoadState('networkidle');

    // The page must actually have rendered — otherwise "no Three.js" is vacuous.
    await expect(page.locator('body')).toContainText(/\S{20,}|\S+\s+\S+/, { timeout: 10000 });

    expect(requested.filter((u) => HEAVY_CHUNK.test(u))).toEqual([]);
  });
}

test('vsepr-geometry — loads Three.js once a 3D view is opened', async ({ page, browserName }) => {
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  // Firefox has failed this test now and then (docs/REVIEW-QUEUE.md D2), and the run's artifact
  // cannot always be opened, so a failure says in the log itself what the page did.
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()}`);
  });
  page.on('requestfailed', (r) =>
    problems.push(`request failed: ${r.url()} (${r.failure()?.errorText})`)
  );

  await page.goto('/efnafraedi/2-ar/games/vsepr-geometry.html');
  await page.waitForLoadState('networkidle');
  expect(requested.filter((u) => HEAVY_CHUNK.test(u))).toEqual([]);

  // Reaching a 3D view takes three steps: enter level 1, pick a geometry
  // (the molecule panel only renders once a shape is selected), then switch
  // that panel from 2D to 3D — which is what mounts MoleculeViewer3DLazy.
  await page
    .getByText(/Stig 1/i)
    .first()
    .click();
  await page
    .getByRole('button', { name: /Línuleg/i })
    .first()
    .click();

  const toggle3D = page.getByRole('button', { name: /^3D$/ }).first();
  await expect(toggle3D).toBeVisible({ timeout: 15000 });
  await toggle3D.click();

  // A <canvas> is the observable proof the viewer mounted, and it can only
  // appear after the deferred chunk has loaded and executed.
  //
  // On some CI runs Firefox has no working GL driver at all ("Exhausted GL driver options"), so no
  // WebGL context can exist and Three.js cannot draw. The viewer then shows its panel message for
  // a browser that cannot draw 3D, which also renders only after the deferred chunk has run. That
  // is accepted in Firefox alone, and only when the browser said it could not create a context;
  // Chromium must draw a canvas.
  const canvas = page.locator('canvas').first();
  const noWebGL = page.getByText('Þessi vafri getur ekki birt þrívíddarsýn á þessari tölvu.');
  try {
    await expect(canvas.or(noWebGL).first()).toBeVisible({ timeout: 20000 });
    if (await noWebGL.isVisible()) {
      expect(browserName, 'a canvas, outside Firefox').toBe('firefox');
      expect(
        problems.some((p) => p.includes('WebGL context could not be created')),
        'the browser saying it could not create a WebGL context'
      ).toBe(true);
    }
  } catch (err) {
    const heavy = requested.filter((u) => HEAVY_CHUNK.test(u));
    const shows = async (text: string) => (await page.getByText(text).count()) > 0;
    throw new Error(
      [
        'No 3D canvas within 20 s, or no sign that WebGL itself was missing.',
        `Still loading: ${await shows('Sæki þrívíddarsýn…')}`,
        `Panel error message: ${await shows('Þrívíddarsýn er ekki tiltæk')}`,
        `3D chunks requested: ${heavy.length ? heavy.join(', ') : 'none'}`,
        `Problems: ${problems.length ? problems.join(' | ') : 'none'}`,
      ].join('\n'),
      { cause: err }
    );
  }
  expect(requested.filter((u) => HEAVY_CHUNK.test(u)).length).toBeGreaterThan(0);
});
