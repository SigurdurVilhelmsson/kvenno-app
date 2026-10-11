#!/usr/bin/env node
/**
 * Pictograms for the A1 chips. See `myndir.mjs` for why, and content/islenskubraut/myndir/README.md
 * for the workflow.
 *
 *   pnpm islenskubraut:myndir            # offline: check myndir.yaml against the cards
 *   pnpm islenskubraut:myndir --fetch    # search ARASAAC for chips with no picture, download
 *                                        # every chosen picture not saved yet, then check
 *
 * Both write `islenskubraut-myndir-yfirlit.html` (gitignored), the sheet a person approves from.
 * Exits 1 when the map and the cards disagree or an approved picture is missing its file, and 2
 * when a chip has no picture yet (run with --fetch).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseDocument } from 'yaml';

import { CONTENT_DIR, loadCategories } from './load.mjs';
import {
  allEntries,
  checkCoverage,
  fetchPicture,
  readMyndir,
  reviewSheet,
  searchPictograms,
} from './myndir.mjs';
import { prettify } from './render.mjs';

const ROOT = resolve(CONTENT_DIR, '../..');
const MAP_FILE = resolve(CONTENT_DIR, 'myndir/myndir.yaml');
const CANDIDATES_FILE = resolve(CONTENT_DIR, 'myndir/frambod.json');
const PICTURE_DIR = resolve(ROOT, 'apps/islenskubraut/public/myndir');
const SHEET_FILE = resolve(ROOT, 'islenskubraut-myndir-yfirlit.html');
const DELAY_MS = Number(process.env.MYNDIR_DELAY_MS ?? 150);

const fetching = process.argv.includes('--fetch');

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY is set; see bin-check.mjs.
if (fetching && process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const child = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(child.status ?? 1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const picturePath = (id) => resolve(PICTURE_DIR, `${id}.png`);

// The YAML is edited by hand, so it is rewritten as a document: comments and layout survive.
const doc = parseDocument(readFileSync(MAP_FILE, 'utf8'));
let myndir = readMyndir(doc.toJS());
const candidates = existsSync(CANDIDATES_FILE)
  ? JSON.parse(readFileSync(CANDIDATES_FILE, 'utf8'))
  : {};

if (fetching) {
  let searched = 0;
  let chosen = 0;
  for (const entry of allEntries(myndir)) {
    if (entry.id !== null) continue;
    if (!candidates[entry.search]) {
      candidates[entry.search] = await searchPictograms(entry.search);
      searched += 1;
      await sleep(DELAY_MS);
    }
    const best = candidates[entry.search][0];
    if (best) {
      doc.setIn([...entry.path, 'id'], best);
      chosen += 1;
    }
  }
  writeFileSync(MAP_FILE, doc.toString({ lineWidth: 0 }), 'utf8');
  writeFileSync(
    CANDIDATES_FILE,
    await prettify(JSON.stringify(candidates, null, 2), CANDIDATES_FILE),
    'utf8'
  );
  myndir = readMyndir(doc.toJS());

  mkdirSync(PICTURE_DIR, { recursive: true });
  let downloaded = 0;
  for (const id of new Set(allEntries(myndir).map((e) => e.id))) {
    if (id === null || existsSync(picturePath(id))) continue;
    writeFileSync(picturePath(id), await fetchPicture(id));
    downloaded += 1;
    await sleep(DELAY_MS);
  }
  console.log(
    `Searched ARASAAC for ${searched} word(s), chose ${chosen} picture(s), ` +
      `downloaded ${downloaded}.\n`
  );
}

const entries = allEntries(myndir);
writeFileSync(
  SHEET_FILE,
  reviewSheet(entries, candidates, (id) => `apps/islenskubraut/public/myndir/${id}.png`),
  'utf8'
);

const { missing, stale } = checkCoverage(myndir, loadCategories());
const unchosen = entries.filter((e) => e.id === null);
const noFile = entries.filter((e) => e.approved && !existsSync(picturePath(e.id)));
const approved = entries.filter((e) => e.approved).length;

let exit = 0;
const report = (title, items) => {
  if (items.length === 0) return;
  console.log(`${title}:\n${items.map((i) => `  ${i}`).join('\n')}\n`);
};
report('Chips with no entry in myndir.yaml', missing);
report('Entries for no chip on any A1 card', stale);
report(
  'Approved pictures with no file (run --fetch)',
  noFile.map((e) => `${e.word}: ${e.id}`)
);
report(
  'No picture chosen yet (run --fetch, or change the search word)',
  unchosen.map((e) => `${e.word} (leit: ${e.search})`)
);
if (missing.length || stale.length || noFile.length) exit = 1;
else if (unchosen.length) exit = 2;

console.log(`${approved} of ${entries.length} picture(s) approved.`);
console.log(`Review sheet: ${SHEET_FILE.replace(`${ROOT}/`, '')}`);
process.exit(exit);
