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
 * `--apply` writes `hljod.yaml`, its record `stada.json` and `mat.json`, then runs
 * `pnpm islenskubraut:build`, which turns them into the app's data. Commit everything git then
 * shows changed; after that the review files can be deleted, once their notes have been read.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseDocument } from 'yaml';

import {
  clipName,
  clipVersion,
  readHljod,
  readState,
  syncState,
  textsToVoice,
  valueOf,
} from './hljod.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { prettify } from './render.mjs';
import {
  approvals,
  mergeReviews,
  readLedger,
  readReview,
  report,
  unionLedgers,
} from './yfirferd.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
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

// After a git merge that left conflicts in these files: both sides of the record, joined, and
// our side of hljod.yaml and stada.json, whose values the record then decides again.
const CONFLICT = /^(<{7}|={7}|>{7})( |$)/m;
const resolved = [];
function side(file, n) {
  try {
    return execFileSync('git', ['show', `:${n}:${relative(ROOT, file)}`], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    console.error(
      `${relative(ROOT, file)} has conflict markers outside a merge. Resolve it first.`
    );
    process.exit(1);
  }
}
function read(file, ours = false) {
  if (!existsSync(file)) return undefined;
  const raw = readFileSync(file, 'utf8');
  if (!CONFLICT.test(raw)) return raw;
  resolved.push(relative(ROOT, file));
  return ours ? side(file, 2) : [side(file, 2), side(file, 3)];
}
const ledgerRaw = read(LEDGER_FILE);
const ledger = Array.isArray(ledgerRaw)
  ? unionLedgers(...ledgerRaw.map((r) => readLedger(JSON.parse(r))))
  : readLedger(ledgerRaw === undefined ? undefined : JSON.parse(ledgerRaw));
const merged = mergeReviews(ledger, reviews, rulers);
if (merged.errors.length > 0) {
  for (const e of merged.errors) console.error(e);
  process.exit(1);
}
const doc = parseDocument(read(MANIFEST, true));
const texts = textsToVoice(loadCategories());
const version = (text) => {
  const file = resolve(CLIP_DIR, clipName(text));
  return existsSync(file) ? clipVersion(readFileSync(file)) : null;
};
// A clip made again since the record is a draft again, as --record would write it.
const found = readHljod(doc.toJS());
const stateRaw = read(STATE_FILE, true);
const synced = syncState(
  found,
  readState(stateRaw === undefined ? {} : JSON.parse(stateRaw)),
  version
);
if (resolved.length > 0) {
  console.log(
    `Merge conflicts in ${resolved.join(', ')}: the record joins both sides, and the values are worked out again from it. Run pnpm islenskubraut:hljod --record afterwards if the other side listed new recordings.\n`
  );
  if (!apply) console.log('Nothing is written without --apply.\n');
}
for (const text of synced.reset) doc.setIn(['clips', text], false);
const manifest = readHljod(doc.toJS());
const result = approvals(merged.ledger, manifest, { texts, version, names: merged.names });
// What a person reads is measured from hljod.yaml as it was found, not from the resets above.
const asFound = {
  ...result,
  outcomes: result.outcomes.map((o) => ({ ...o, from: valueOf(found, o.text) })),
};
process.stdout.write(report(merged.people, asFound, merged.ledger.rulers));
const decided = new Set(result.outcomes.map((o) => o.text));
const reset = synced.reset.filter((t) => !decided.has(t));
if (reset.length > 0) {
  console.log(
    `\nBack to false, as their audio changed or nothing recorded which audio was approved: ${reset.join(', ')}`
  );
}
// A value written in hljod.yaml by hand and not yet recorded: --apply records it, as --record would.
const stamped = synced.stamped.filter((t) => !decided.has(t));
if (stamped.length > 0) {
  console.log(`\nHand edits of hljod.yaml that stada.json will record: ${stamped.join(', ')}`);
}

// The writes go from the values after the resets; the count, from the values as found.
const changes = result.outcomes.filter((o) => o.from !== o.to);
const total =
  asFound.outcomes.filter((o) => o.from !== o.to).length + reset.length + stamped.length;
if (apply) {
  const state = { ...synced.state };
  for (const o of changes) {
    doc.setIn(['clips', o.text], o.to);
    const v = version(o.text);
    if (v !== null) state[o.text] = { v, value: o.to };
  }
  writeFileSync(MANIFEST, doc.toString());
  writeFileSync(STATE_FILE, await prettify(JSON.stringify(state), STATE_FILE));
  writeFileSync(LEDGER_FILE, await prettify(JSON.stringify(merged.ledger), LEDGER_FILE));
  console.log(
    total > 0
      ? `\n${total} change(s) written to hljod.yaml and stada.json, and the verdicts to mat.json. Building the app's data:\n`
      : `\nNo value changed; the verdicts are in mat.json. Building the app's data:\n`
  );
  // The app's data comes from these files, and CI refuses a commit where it is stale.
  const built = spawnSync(process.execPath, [resolve(HERE, 'build.mjs')], { stdio: 'inherit' });
  if (built.status !== 0) process.exit(built.status ?? 1);
  console.log('\nCommit everything git shows changed, then deploy.');
} else if (total > 0) {
  console.log(`\n--apply would write ${total} change(s).`);
}
