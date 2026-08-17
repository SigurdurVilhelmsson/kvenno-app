#!/usr/bin/env node
/**
 * Generates server/src/lib/islenskubraut-data.ts from apps/islenskubraut/src/data/.
 *
 * Why this exists: the Express server renders teaching-card PDFs and needs the same
 * category data the Íslenskubraut SPA renders, but it must not import a Vite/React app.
 * The data was therefore duplicated by hand — and drifted. The server copy had lost every
 * Icelandic character (Orðaforði -> Orda­fordi, with a soft hyphen wedged mid-word),
 * turned "Þessi" into "Þssi", and taught "rannsóka" and "Undirbuníngur", neither of which
 * is a word. Students read that copy: it is what prints on the PDF.
 *
 * The source of truth is the SPA data. This script is the only thing that may write the
 * server copy. `pnpm test` fails if the two drift (see the data-sync test).
 *
 * Usage: pnpm generate:islenskubraut-data [--check]
 *   --check  exit 1 if the generated output differs from what is on disk (for CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';
import { createServer } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = '/apps/islenskubraut/src/data/index.ts';
const TARGET = resolve(ROOT, 'server/src/lib/islenskubraut-data.ts');

const HEADER = `// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     apps/islenskubraut/src/data/
// Regenerate: pnpm generate:islenskubraut-data
//
// The server cannot import the Íslenskubraut SPA, so the category data is copied here.
// This copy previously drifted and shipped corrupted Icelandic onto student teaching
// cards. Edit the source above and re-run the generator; a test fails if these diverge.

import type { Category } from '../types/index.js';
`;

/** Load the SPA's data module through Vite so TS and extensionless imports resolve. */
async function loadCategories() {
  const server = await createServer({
    root: ROOT,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    const mod = await server.ssrLoadModule(SOURCE);
    if (!Array.isArray(mod.categories) || mod.categories.length === 0) {
      throw new Error(`${SOURCE} did not export a non-empty \`categories\` array`);
    }
    return mod.categories;
  } finally {
    await server.close();
  }
}

/**
 * Format with the repo's own prettier config.
 *
 * Not cosmetic: lint-staged runs `prettier --write` on commit, so an unformatted
 * emission would be rewritten the moment it was staged and `--check` would then report
 * STALE forever against data that is actually identical. The generator must produce
 * exactly what prettier would.
 */
async function prettify(source) {
  const options = (await resolveConfig(TARGET)) ?? {};
  return format(source, { ...options, parser: 'typescript' });
}

function render(categories) {
  // JSON.stringify rather than hand-rolled quoting: the corruption this script replaces
  // was an escaping bug, so the generator must not invent an escaping scheme of its own.
  // Emitted as literal UTF-8 — the repo is UTF-8 throughout and escapes are what hid the
  // damage last time. Prettier normalises quotes and spacing on commit.
  const body = JSON.stringify(categories, null, 2);
  return `${HEADER}
export const categories: Category[] = ${body};

export const categoryIds: string[] = categories.map((c) => c.id);

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
`;
}

const categories = await loadCategories();
const output = await prettify(render(categories));
const check = process.argv.includes('--check');

let current = null;
try {
  current = readFileSync(TARGET, 'utf8');
} catch {
  /* file may not exist yet */
}

if (current === output) {
  console.log('islenskubraut-data.ts is up to date.');
  process.exit(0);
}

if (check) {
  console.error(
    'islenskubraut-data.ts is STALE.\n' +
      'The SPA data under apps/islenskubraut/src/data/ has changed but the server copy has not.\n' +
      'Run: pnpm generate:islenskubraut-data'
  );
  process.exit(1);
}

writeFileSync(TARGET, output, 'utf8');
console.log(
  `Wrote server/src/lib/islenskubraut-data.ts — ${categories.length} categories, ${output.length} bytes.`
);
