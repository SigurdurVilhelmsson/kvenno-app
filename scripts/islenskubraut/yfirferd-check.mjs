#!/usr/bin/env node
/**
 * Read the review files teachers send back from `/islenskubraut/yfirferd`. See `yfirferd.mjs`.
 *
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …]                 # print what they say
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …] --apply         # and write the verdicts
 *   pnpm islenskubraut:yfirferd <files> --urskurdur "Nafn" [--apply]      # Nafn's verdicts rule
 *
 * The files' verdicts are merged into content/islenskubraut/hljod/mat.json, the committed record
 * of every verdict given, and the values are worked out from that record: every recording with a
 * verdict on its current audio is `true` if heard as right and never as wrong, `rangt` the other
 * way round, and `false` otherwise, whatever order the files came in and on whatever machine. A
 * ruler (`--urskurdur`, a reviewer's name) decides a recording whatever the others say; the record
 * keeps who rules, so a ruling lasts, and the report lists each verdict it overrules.
 *
 * `--apply` writes `hljod.yaml`, its record `stada.json` and `mat.json`, and nothing else. Commit
 * all three; after that the review files can be deleted. Notes are for a person to act on. Run
 * `pnpm islenskubraut:build` after it, and deploy.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { parseDocument } from 'yaml';

import { clipName, clipVersion, readHljod, readState, syncState, textsToVoice } from './hljod.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { approvals, mergeReviews, readLedger, readReview, report } from './yfirferd.mjs';

const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
const STATE_FILE = resolve(CONTENT_DIR, 'hljod/stada.json');
const LEDGER_FILE = resolve(CONTENT_DIR, 'hljod/mat.json');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');

const USAGE = 'Usage: pnpm islenskubraut:yfirferd [file.json …] [--urskurdur "Nafn"] [--apply]';
const args = process.argv.slice(2);
let apply = false;
const rulers = [];
const files = [];
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (a === '--apply') apply = true;
  else if (a === '--urskurdur') rulers.push(args[(i += 1)] ?? '');
  else if (a.startsWith('--urskurdur=')) rulers.push(a.slice('--urskurdur='.length));
  else if (a.startsWith('-')) {
    console.error(`Unknown option ${a}\n${USAGE}`);
    process.exit(1);
  } else files.push(a);
}
if (rulers.some((r) => r.trim() === '')) {
  console.error(USAGE);
  process.exit(1);
}

const reviews = files.map((f) => readReview(JSON.parse(readFileSync(f, 'utf8')), basename(f)));
const merged = mergeReviews(
  readLedger(existsSync(LEDGER_FILE) ? JSON.parse(readFileSync(LEDGER_FILE, 'utf8')) : undefined),
  reviews,
  rulers
);
if (merged.errors.length > 0) {
  for (const e of merged.errors) console.error(e);
  process.exit(1);
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
const result = approvals(merged.ledger, manifest, { texts, version, names: merged.names });
process.stdout.write(report(merged.people, result));
if (synced.reset.length > 0) {
  console.log(
    `\nBack to false, as their audio changed or nothing recorded which audio was approved: ${synced.reset.join(', ')}`
  );
}

const changes = result.outcomes.filter((o) => o.from !== o.to);
const total = changes.length + synced.reset.length;
if (apply) {
  const state = { ...synced.state };
  for (const o of changes) {
    doc.setIn(['clips', o.text], o.to);
    const v = version(o.text);
    if (v !== null) state[o.text] = { v, value: o.to };
  }
  writeFileSync(MANIFEST, doc.toString());
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(LEDGER_FILE, `${JSON.stringify(merged.ledger, null, 2)}\n`);
  console.log(
    total > 0
      ? `\n${total} change(s) written to hljod.yaml and stada.json, and the verdicts to mat.json. Commit all three, then run pnpm islenskubraut:build and deploy.`
      : `\nNo value changed. The verdicts are in mat.json; commit it if git shows it changed.`
  );
} else if (total > 0) {
  console.log(`\n--apply would write ${total} change(s).`);
}
