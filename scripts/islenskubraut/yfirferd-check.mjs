#!/usr/bin/env node
/**
 * Read the review files teachers send back from `/islenskubraut/yfirferd`. See `yfirferd.mjs`.
 *
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …]          # print every note and verdict
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …] --apply  # also approve the recordings
 *                                                                  # marked right and never wrong
 *
 * `--apply` writes `true` beside those recordings in content/islenskubraut/hljod/hljod.yaml and
 * nothing else; notes are for a person to act on. Run `pnpm islenskubraut:build` after it.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { parseDocument } from 'yaml';

import { readHljod } from './hljod.mjs';
import { CONTENT_DIR } from './load.mjs';
import { approvals, readReview, report } from './yfirferd.mjs';

const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const files = args.filter((a) => !a.startsWith('--'));
if (files.length === 0) {
  console.error('Usage: pnpm islenskubraut:yfirferd <file.json> [more.json …] [--apply]');
  process.exit(1);
}

const reviews = files.map((f) => readReview(JSON.parse(readFileSync(f, 'utf8')), basename(f)));
const doc = parseDocument(readFileSync(MANIFEST, 'utf8'));
const result = approvals(reviews, readHljod(doc.toJS()));
process.stdout.write(report(reviews, result));

if (apply) {
  for (const text of result.approve) doc.setIn(['clips', text], true);
  if (result.approve.length > 0) writeFileSync(MANIFEST, doc.toString());
  console.log(
    `\napproved ${result.approve.length} recording(s) in hljod.yaml. Run: pnpm islenskubraut:build`
  );
} else if (result.approve.length > 0) {
  console.log(`\n--apply would approve ${result.approve.length} recording(s).`);
}
