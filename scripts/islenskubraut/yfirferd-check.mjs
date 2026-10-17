#!/usr/bin/env node
/**
 * Read the review files teachers send back from `/islenskubraut/yfirferd`. See `yfirferd.mjs`.
 *
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …]                 # print what they say
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …] --apply         # and write the verdicts
 *   pnpm islenskubraut:yfirferd <files> --urskurdur "Nafn" [--apply]      # Nafn's verdicts rule
 *
 * `--apply` writes to content/islenskubraut/hljod/hljod.yaml and its record, stada.json, and
 * nothing else. Every recording the files mention gets the value all their verdicts give it
 * together: `true` heard as right by someone and wrong by nobody, `rangt` the other way round,
 * `false` heard both ways, taken back, or heard on audio since replaced. The result does not
 * depend on the order the files came in. A ruler (`--urskurdur`, a reviewer's name, as often as
 * needed) settles a recording whatever the others say, and the report lists each verdict it
 * overrules. Notes are for a person to act on. Run `pnpm islenskubraut:build` after it, and deploy.
 *
 * Pass every file received, old ones too: they are what the values come from, and a reviewer's
 * later verdict on a recording replaces their earlier one.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { parseDocument } from 'yaml';

import { clipName, clipVersion, readHljod, readState, syncState, textsToVoice } from './hljod.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { approvals, readReview, report, reviewerKey } from './yfirferd.mjs';

const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
const STATE_FILE = resolve(CONTENT_DIR, 'hljod/stada.json');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const rulers = [];
const files = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--urskurdur') rulers.push(args[(i += 1)] ?? '');
  else if (!args[i].startsWith('--')) files.push(args[i]);
}
if (files.length === 0 || rulers.some((r) => r.trim() === '')) {
  console.error(
    'Usage: pnpm islenskubraut:yfirferd <file.json> [more.json …] [--urskurdur "Nafn"] [--apply]'
  );
  process.exit(1);
}

const reviews = files.map((f) => readReview(JSON.parse(readFileSync(f, 'utf8')), basename(f)));
const named = new Set(reviews.map((r) => reviewerKey(r.reviewer)));
for (const r of rulers) {
  if (!named.has(reviewerKey(r))) {
    console.error(`--urskurdur "${r}": no file from a reviewer of that name`);
    process.exit(1);
  }
}
const doc = parseDocument(readFileSync(MANIFEST, 'utf8'));
const texts = textsToVoice(loadCategories());
const version = (text) => {
  const file = resolve(CLIP_DIR, clipName(text));
  return existsSync(file) ? clipVersion(readFileSync(file)) : null;
};
// A clip made again since the record is a draft again, as --record would write it.
const synced = syncState(
  readHljod(doc.toJS()),
  readState(existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : {}),
  version
);
for (const text of synced.reset) doc.setIn(['clips', text], false);
const manifest = readHljod(doc.toJS());
const result = approvals(reviews, manifest, { texts, version, rulers });
process.stdout.write(report(reviews, result));
if (synced.reset.length > 0) {
  console.log(`\nMade again since recorded, so false: ${synced.reset.join(', ')}`);
}

const changes = result.outcomes.filter((o) => o.from !== o.to);
if (apply) {
  const state = { ...synced.state };
  for (const o of changes) {
    doc.setIn(['clips', o.text], o.to);
    const v = version(o.text);
    if (v !== null) state[o.text] = { v, value: o.to };
  }
  writeFileSync(MANIFEST, doc.toString());
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  console.log(
    `\nhljod.yaml: ${changes.length} change(s) written. Run: pnpm islenskubraut:build, then deploy`
  );
} else if (changes.length > 0 || synced.reset.length > 0) {
  console.log(`\n--apply would write ${changes.length + synced.reset.length} change(s).`);
}
