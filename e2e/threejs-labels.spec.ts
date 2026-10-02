import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect } from '@playwright/test';

/**
 * The 3D view must finish loading under the policy the server actually sends,
 * with nothing fetched from outside the site (docs/REVIEW-QUEUE.md C5).
 *
 * The atom labels are drei `<Text>` (troika-three-text), and both ways it broke
 * were invisible to the other 3D tests, which only check that a <canvas>
 * appears — it does, with "Sæki þrívíddarsýn…" drawn inside it for good:
 *
 * - With no font given, troika fetched per-character font data from
 *   cdn.jsdelivr.net, which the games' `connect-src 'self'` refuses.
 * - It built glyphs in a Web Worker started with `importScripts(blob:…)`,
 *   which the games' `script-src` refuses.
 *
 * The preview server sends no CSP, so this test lifts the game-HTML policy out
 * of server/nginx-site.conf and serves it with the page; a change to that
 * policy is tested here as it ships.
 */

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function gamePolicy(): string {
  const conf = readFileSync(join(repoRoot, 'server', 'nginx-site.conf'), 'utf8');
  const start = conf.indexOf('location ~ ^/efnafraedi/[^/]+/games/.+\\.html$');
  expect(start, 'game-HTML location block in nginx-site.conf').toBeGreaterThan(-1);
  const policy = /Content-Security-Policy "([^"]+)"/.exec(conf.slice(start));
  expect(policy, 'Content-Security-Policy in the game-HTML block').not.toBeNull();
  return policy![1];
}

test('vsepr-geometry — the 3D view loads under the site CSP with no CDN @chromium-only', async ({
  page,
}) => {
  const policy = gamePolicy();
  await page.route('**/games/*.html', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': policy },
    });
  });
  const offSite: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost')) offSite.push(r.url());
  });
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  const refused: string[] = [];
  page.on('console', (m) => {
    if (/Content Security Policy|importScripts|failed to rehydrate/i.test(m.text())) {
      refused.push(m.text());
    }
  });

  await page.goto('/efnafraedi/2-ar/games/vsepr-geometry.html');
  await page
    .getByText(/Stig 1/i)
    .first()
    .click();
  await page
    .getByRole('button', { name: /Línuleg/i })
    .first()
    .click();
  await page.getByRole('button', { name: /^3D$/ }).first().click();

  // The canvas appears at once and its loading text a moment later, so neither
  // shows the view is ready; aria-busy clears only once the scene has drawn,
  // labels included.
  const viewer = page.locator('.molecule-viewer-3d').first();
  await expect(viewer).toHaveAttribute('aria-busy', 'true');
  await expect(viewer).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
  await expect(page.getByText('Sæki þrívíddarsýn…')).toHaveCount(0);
  expect(offSite).toEqual([]);
  expect(refused).toEqual([]);
});

/**
 * Each 3D game ships the label font itself, beside its deferred chunks, and
 * only the deferred viewer chunk refers to it — so the font costs nothing
 * until a 3D view opens, like the rest of Three.js.
 */
for (const game of ['vsepr-geometry', 'lewis-structures', 'intermolecular-forces']) {
  test(`${game} — ships its own label font in the deferred payload`, () => {
    const dir = join(repoRoot, 'dist', 'efnafraedi', '2-ar', 'games');
    const chunks = join(dir, 'assets', game);
    expect(existsSync(chunks), `${chunks} (run pnpm build first)`).toBe(true);
    const font = readdirSync(chunks).find((f) => /^roboto-latin-700-normal-.+\.woff$/.test(f));
    expect(font, `label font under assets/${game}/`).toBeDefined();

    const referring = readdirSync(chunks).filter(
      (f) => f.endsWith('.js') && readFileSync(join(chunks, f), 'utf8').includes(font!)
    );
    expect(referring.length).toBe(1);
    expect(referring[0]).toMatch(/^MoleculeViewer3D-/);
    // The entry is hashed beside the chunks (REVIEW-QUEUE D2), named for the game.
    const entry = readdirSync(chunks).find((f) => f.startsWith(`${game}-`) && f.endsWith('.js'));
    expect(entry, `entry bundle under assets/${game}/`).toBeDefined();
    expect(readFileSync(join(chunks, entry!), 'utf8')).not.toContain(font!);
  });
}
