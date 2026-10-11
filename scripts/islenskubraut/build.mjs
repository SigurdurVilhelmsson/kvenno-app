#!/usr/bin/env node
/** YAML -> both TypeScript consumers, and their shared types. `--check` exits 1 if anything is stale. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCategories } from './load.mjs';
import {
  prettify,
  renderServerModule,
  renderSmidur,
  renderSpaCategory,
  renderSpaIndex,
  renderTypes,
} from './render.mjs';
import { pageData } from './smidur.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SPA_DIR = resolve(ROOT, 'apps/islenskubraut/src/data/categories');
const SPA_INDEX = resolve(ROOT, 'apps/islenskubraut/src/data/index.ts');
const SERVER_FILE = resolve(ROOT, 'server/src/lib/islenskubraut-data.ts');
const SPA_TYPES = resolve(ROOT, 'apps/islenskubraut/src/data/types.ts');
const SERVER_TYPES = resolve(ROOT, 'server/src/types/islenskubraut.ts');
const SPA_SMIDUR = resolve(ROOT, 'apps/islenskubraut/src/data/smidur.ts');
const BIN_DIR = resolve(ROOT, 'content/islenskubraut/bin');

const check = process.argv.includes('--check');
const categories = loadCategories();

// The sentence builder's sentences, built from the saved BÍN files. A sentence BÍN cannot
// complete throws here, naming it, so the build fails instead of shipping a gap.
const binFile = (name, key) =>
  JSON.parse(readFileSync(resolve(BIN_DIR, name), 'utf8'))[key];
const lookups = binFile('ordmyndir.json', 'ordmyndir');
const paradigms = binFile('beygingar.json', 'beygingar');
const smidur = categories
  .filter((c) => c.builder)
  .map((c) => {
    try {
      return [c.id, pageData(c, lookups, paradigms)];
    } catch (err) {
      throw new Error(`sentence builder, ${c.id}: ${err.message}`);
    }
  });

const outputs = [
  ...categories.map((c) => [resolve(SPA_DIR, `${c.id}.ts`), renderSpaCategory(c)]),
  [SPA_INDEX, renderSpaIndex(categories)],
  [SERVER_FILE, renderServerModule(categories)],
  [SPA_TYPES, renderTypes()],
  [SERVER_TYPES, renderTypes()],
  [SPA_SMIDUR, renderSmidur(smidur)],
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
