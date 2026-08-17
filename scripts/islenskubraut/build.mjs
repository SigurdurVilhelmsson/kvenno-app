#!/usr/bin/env node
/** YAML -> both TypeScript consumers. `--check` exits 1 if anything is stale. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCategories } from './load.mjs';
import { prettify, renderServerModule, renderSpaCategory } from './render.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SPA_DIR = resolve(ROOT, 'apps/islenskubraut/src/data/categories');
const SERVER_FILE = resolve(ROOT, 'server/src/lib/islenskubraut-data.ts');

const check = process.argv.includes('--check');
const categories = loadCategories();

const outputs = [
  ...categories.map((c) => [resolve(SPA_DIR, `${c.id}.ts`), renderSpaCategory(c)]),
  [SERVER_FILE, renderServerModule(categories)],
];

let stale = 0;
for (const [file, source] of outputs) {
  const next = await prettify(source, file);
  let current = null;
  try {
    current = readFileSync(file, 'utf8');
  } catch {
    /* not generated yet */
  }
  if (current === next) continue;
  stale += 1;
  if (check) {
    console.error(`STALE: ${file.replace(`${ROOT}/`, '')}`);
  } else {
    writeFileSync(file, next, 'utf8');
    console.log(`wrote ${file.replace(`${ROOT}/`, '')}`);
  }
}

if (check && stale > 0) {
  console.error(`\n${stale} generated file(s) do not match content/islenskubraut/.`);
  console.error('Run: pnpm islenskubraut:build');
  process.exit(1);
}
if (stale === 0) console.log('islenskubraut: generated files are up to date.');
