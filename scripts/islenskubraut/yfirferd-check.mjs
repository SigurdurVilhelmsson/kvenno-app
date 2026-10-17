#!/usr/bin/env node
/**
 * Read the review files teachers send back from `/islenskubraut/yfirferd`. See `yfirferd.mjs`.
 *
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …]          # print every note and verdict
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …] --apply  # and write the verdicts
 *
 * `--apply` writes to content/islenskubraut/hljod/hljod.yaml and nothing else: `true` beside each
 * recording someone heard as right and nobody as wrong, and `rangt` beside each one someone heard
 * as wrong and nobody as right, or that was approved and is now heard as wrong. A `rangt` clip is
 * never approved by a later run; make it again, then write `false`. Notes are for a person to act
 * on. Run `pnpm islenskubraut:build` after it.
 *
 * Pass every file received, old ones too: a reviewer's later file replaces their earlier one.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { parseDocument } from 'yaml';

import { REJECTED, clipName, clipVersion, readHljod, textsToVoice } from './hljod.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { approvals, readReview, report } from './yfirferd.mjs';

const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
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
const result = approvals(reviews, readHljod(doc.toJS()), { texts, version });
process.stdout.write(report(reviews, result));

const writes = [
  ...result.approve.map((e) => [e.text, true]),
  ...result.reject.map((e) => [e.text, REJECTED]),
  ...result.revoke.map((e) => [e.text, REJECTED]),
];
if (apply) {
  for (const [text, value] of writes) doc.setIn(['clips', text], value);
  if (writes.length > 0) writeFileSync(MANIFEST, doc.toString());
  console.log(
    `\nhljod.yaml: ${result.approve.length} approved, ${result.reject.length + result.revoke.length} marked ${REJECTED}. Run: pnpm islenskubraut:build`
  );
} else if (writes.length > 0) {
  console.log(
    `\n--apply would approve ${result.approve.length} and mark ${result.reject.length + result.revoke.length} ${REJECTED}.`
  );
}
