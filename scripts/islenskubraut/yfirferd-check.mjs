#!/usr/bin/env node
/**
 * Read the review files teachers send back from `/islenskubraut/yfirferd`. See `yfirferd.mjs`.
 *
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …]          # print every note and verdict
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …] --apply  # and write the verdicts
 *
 * `--apply` writes to content/islenskubraut/hljod/hljod.yaml and its record, stada.json, and
 * nothing else: `true` beside each draft someone heard as right and nobody as wrong, and `rangt`
 * beside each draft someone heard as wrong and nobody as right, or approved clip heard as wrong
 * since it was approved. A decision stands against every verdict given before it, so a conflict a
 * person settled by writing `true` or `rangt` stays settled. Notes are for a person to act on.
 * Run `pnpm islenskubraut:build` after it, and deploy.
 *
 * Pass every file received, old ones too: a reviewer's later verdict on a recording replaces
 * their earlier one.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { parseDocument } from 'yaml';

import {
  REJECTED,
  clipName,
  clipVersion,
  readHljod,
  readState,
  syncState,
  textsToVoice,
} from './hljod.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { approvals, readReview, report } from './yfirferd.mjs';

const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
const STATE_FILE = resolve(CONTENT_DIR, 'hljod/stada.json');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const files = args.filter((a) => !a.startsWith('--'));
if (files.length === 0) {
  console.error('Usage: pnpm islenskubraut:yfirferd <file.json> [more.json …] [--apply]');
  process.exit(1);
}

const reviews = files.map((f) => readReview(JSON.parse(readFileSync(f, 'utf8')), basename(f)));
const doc = parseDocument(readFileSync(MANIFEST, 'utf8'));
const texts = textsToVoice(loadCategories());
const version = (text) => {
  const file = resolve(CLIP_DIR, clipName(text));
  return existsSync(file) ? clipVersion(readFileSync(file)) : null;
};
const now = new Date().toISOString();
// Values changed by hand since the last record count as decided now; a clip made again since is a
// draft again. Both are what --record would write.
let manifest = readHljod(doc.toJS());
const synced = syncState(
  manifest,
  readState(existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : {}),
  version,
  now
);
for (const text of synced.reset) doc.setIn(['clips', text], false);
manifest = readHljod(doc.toJS());
const result = approvals(reviews, manifest, { texts, version, state: synced.state });
process.stdout.write(report(reviews, result));

const writes = [
  ...result.approve.map((e) => [e.text, true]),
  ...result.reject.map((e) => [e.text, REJECTED]),
  ...result.revoke.map((e) => [e.text, REJECTED]),
];
const marked = result.reject.length + result.revoke.length;
if (apply) {
  const state = { ...synced.state };
  for (const [text, value] of writes) {
    doc.setIn(['clips', text], value);
    state[text] = { v: version(text), value, at: now };
  }
  writeFileSync(MANIFEST, doc.toString());
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  console.log(
    `\nhljod.yaml: ${result.approve.length} approved, ${marked} marked ${REJECTED}. Run: pnpm islenskubraut:build, then deploy`
  );
} else if (writes.length > 0) {
  console.log(`\n--apply would approve ${result.approve.length} and mark ${marked} ${REJECTED}.`);
}
