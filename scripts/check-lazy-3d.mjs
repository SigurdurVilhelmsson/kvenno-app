#!/usr/bin/env node
/**
 * The three code-split games must not load Three.js until a 3D view opens.
 *
 * For each, this follows the entry's static imports (and the HTML's modulepreload links)
 * through every chunk they reach, prints what a first page load fetches, and exits 1 if any of
 * those chunks holds Three.js or react-three-fiber. e2e/threejs-lazy-loading.spec.ts checks the
 * same thing in a browser, but only in the 30-minute E2E job; this runs inside `pnpm build`, so CI's
 * Build job and deploy.sh fail on it in about a minute.
 *
 * Why it exists: Rolldown, not this repo, decides which shared modules go in which chunk. On
 * 2026-10-25 a change that only removed drei's <Html> from the deferred viewer moved a module the
 * Lewis entry needs into the Three.js chunk, so Lewis loaded Three.js on every page open.
 *
 * Usage: node scripts/check-lazy-3d.mjs [distDir]
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(process.argv[2] ?? join(rootDir, 'dist'));
const GAMES = ['lewis-structures', 'vsepr-geometry', 'intermolecular-forces'];
const gamesDir = join(distDir, 'efnafraedi', '2-ar', 'games');

/** A chunk holds the 3D payload if it is named for it or carries three's own messages. */
const HEAVY_NAME = /three\.module|drei-|react-three-fiber/;
const HEAVY_TEXT = /THREE\.WebGLRenderer/;

// `import{a as b}from"./x.js"`, `import"./x.js"`, `export{a}from"./x.js"` — never `import("./x.js")`.
const STATIC_IMPORT = /\b(?:import|export)\s*(?:[^'"();]*?\bfrom\s*)?["'](\.\/[^"']+\.js)["']/g;

function staticImports(file) {
  const text = readFileSync(file, 'utf8');
  return [...text.matchAll(STATIC_IMPORT)].map((m) => join(dirname(file), m[1]));
}

let failed = false;
for (const game of GAMES) {
  const htmlPath = join(gamesDir, `${game}.html`);
  if (!existsSync(htmlPath)) {
    console.error(`❌ ${game}: ${htmlPath} not found (build the games first)`);
    failed = true;
    continue;
  }
  const html = readFileSync(htmlPath, 'utf8');
  const roots = [
    ...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+\.js)"/g),
    ...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+\.js)"/g),
  ].map((m) => join(gamesDir, m[1]));

  const seen = new Set();
  const queue = [...roots];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    if (existsSync(file)) queue.push(...staticImports(file));
  }

  const loaded = [...seen].map((f) => f.slice(gamesDir.length + 1));
  const heavy = [...seen].filter(
    (f) => HEAVY_NAME.test(f) || (existsSync(f) && HEAVY_TEXT.test(readFileSync(f, 'utf8')))
  );
  if (heavy.length) {
    failed = true;
    console.error(`❌ ${game} loads Three.js on first page load. It fetches:`);
    for (const f of loaded)
      console.error(`     ${f}${heavy.includes(join(gamesDir, f)) ? '   ← 3D' : ''}`);
  } else {
    console.log(`✓ ${game}: first page load fetches ${loaded.join(', ')}`);
  }
}
process.exit(failed ? 1 : 0);
