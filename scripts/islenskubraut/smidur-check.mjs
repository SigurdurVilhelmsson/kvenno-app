#!/usr/bin/env node
/**
 * Print every sentence the sentence builder can make, for a teacher to read through before it
 * ships (REVIEW-QUEUE D3, C9). Reads the saved BÍN files and never goes online.
 *
 *   pnpm islenskubraut:smidur                 # all categories
 *   pnpm islenskubraut:smidur matur > out.md  # one category, saved to read later
 *
 * Exits 1 when a sentence cannot be built, and 2 when an inflection table has not been fetched
 * yet (run `pnpm islenskubraut:bin --fetch`).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { CONTENT_DIR, loadCategories } from './load.mjs';
import { allSentences, paradigmsNeeded } from './smidur.mjs';

const read = (file, key) => {
  const path = resolve(CONTENT_DIR, 'bin', file);
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8'))[key] ?? {}) : {};
};
const lookups = read('ordmyndir.json', 'ordmyndir');
const paradigms = read('beygingar.json', 'beygingar');

const only = process.argv[2];
const categories = loadCategories().filter((c) => !only || c.id === only);
if (categories.length === 0) {
  console.error(`No category "${only}".`);
  process.exit(1);
}

const missing = paradigmsNeeded(categories, lookups).guids.filter((g) => !paradigms[g]);
if (missing.length > 0) {
  console.error(
    `${missing.length} inflection table(s) not fetched yet. Run \`pnpm islenskubraut:bin --fetch\`.`
  );
  process.exit(2);
}

let problems = 0;
for (const category of categories) {
  const sentences = allSentences(category, lookups, paradigms);
  if (sentences.length === 0) continue;
  console.log(`\n## ${category.name}`);
  let last = '';
  for (const s of sentences) {
    const head = `${s.level} — ${s.subject ?? ''}`;
    if (head !== last) {
      console.log(`\n### ${head}\n`);
      last = head;
    }
    if (s.problem) {
      problems += 1;
      console.log(`- ⚠ ${s.frame ?? ''} ${s.option ? `[${s.option}]` : ''}: ${s.problem}`);
    } else {
      console.log(`- ${s.sentence}`);
    }
  }
}
// BÍN's required attribution, in its own wording (content/islenskubraut/bin/README.md).
console.log(
  '\nGögnin eru úr Beygingarlýsingu íslensks nútímamáls (BÍN) og eru í eigu Stofnunar Árna ' +
    'Magnússonar í íslenskum fræðum. CC BY-SA 4.0.'
);
process.exit(problems > 0 ? 1 : 0);
