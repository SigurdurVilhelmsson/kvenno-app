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
 * A review sent as text (`Afrita sem texta`) carries the same data between two marker lines, so
 * an email saved as a .txt file is read as the file would be.
 *
 * `--apply` writes whichever of `hljod.yaml`, its record `stada.json` and `mat.json` change, then
 * runs `pnpm islenskubraut:build`, which turns them into the app's data. Commit everything git
 * then shows changed; after that the review files can be deleted, once their notes have been read.
 * Without `--apply` it says what it would write, `mat.json` included, so a file whose verdicts are
 * not yet in the record is not deleted by mistake. After a git merge, run it with no files: it
 * resolves a conflict in any of the three, and works every value out again.
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
  mergeThreeWay,
  readLedger,
  readReview,
  report,
  reviewData,
  unionLedgers,
} from './yfirferd.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
const STATE_FILE = resolve(CONTENT_DIR, 'hljod/stada.json');
const LEDGER_FILE = resolve(CONTENT_DIR, 'hljod/mat.json');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');

const USAGE =
  'Usage: pnpm islenskubraut:yfirferd [file.json or .txt …] [--urskurdur "Nafn"] [--apply]';
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

const reviews = files.map((f) =>
  readReview(reviewData(readFileSync(f, 'utf8'), basename(f)), basename(f))
);

// After a git merge that left conflict markers in these files, each is merged again from git's
// three versions of it: the record joins both sides (`unionLedgers`), and hljod.yaml and
// stada.json are merged recording by recording (`mergeThreeWay`). A recording both sides changed
// differently goes back to false, unless the verdicts decide it.
const CONFLICT = /^(<{7}|={7}|>{7})( |$)/m;
const conflicted = [];
function stage(file, n) {
  try {
    return execFileSync('git', ['show', `:${n}:${relative(ROOT, file)}`], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    if (n === 1) return undefined; // added on both sides: no base
    console.error(
      `${relative(ROOT, file)} has conflict markers outside a merge. Resolve it first.`
    );
    process.exit(1);
  }
}
/** The file as found, and git's three versions of it if it has conflict markers. */
function read(file) {
  const raw = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  if (raw === undefined || !CONFLICT.test(raw)) return { raw };
  conflicted.push(relative(ROOT, file));
  return { raw, base: stage(file, 1), ours: stage(file, 2), theirs: stage(file, 3) };
}
const json = (text, empty) => (text === undefined ? empty : JSON.parse(text));

const ledgerIn = read(LEDGER_FILE);
const ledger =
  ledgerIn.ours !== undefined
    ? unionLedgers(
        readLedger(json(ledgerIn.ours)),
        readLedger(json(ledgerIn.theirs)),
        readLedger(json(ledgerIn.base))
      )
    : readLedger(json(ledgerIn.raw));
const merged = mergeReviews(ledger, reviews, rulers);
if (merged.errors.length > 0) {
  for (const e of merged.errors) console.error(e);
  process.exit(1);
}

const manifestIn = read(MANIFEST);
const stateIn = read(STATE_FILE);
const clashes = new Set();
const doc = parseDocument(manifestIn.ours ?? manifestIn.raw);
if (manifestIn.ours !== undefined) {
  const values = (text) => {
    if (text === undefined) return new Map();
    const m = readHljod(parseDocument(text).toJS());
    return new Map([...m.clips.keys()].map((t) => [t, valueOf(m, t)]));
  };
  const { merged: clips, clashes: both } = mergeThreeWay(
    values(manifestIn.base),
    values(manifestIn.ours),
    values(manifestIn.theirs)
  );
  // A clash stays listed, as false (below); only a recording one side removed goes.
  for (const t of both) {
    clashes.add(t);
    clips.set(t, false);
  }
  for (const t of readHljod(doc.toJS()).clips.keys()) if (!clips.has(t)) doc.deleteIn(['clips', t]);
  for (const [t, value] of clips) doc.setIn(['clips', t], value);
}
let state;
if (stateIn.ours !== undefined) {
  const entries = (text) => new Map(Object.entries(readState(json(text, {}))));
  const { merged: kept, clashes: both } = mergeThreeWay(
    entries(stateIn.base),
    entries(stateIn.ours),
    entries(stateIn.theirs),
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  for (const t of both) clashes.add(t);
  state = Object.fromEntries(kept);
} else state = readState(json(stateIn.raw, {}));
// A clash leaves nobody's word on that recording: false, and no record of it, as for a new one.
for (const t of clashes) {
  if (doc.hasIn(['clips', t])) doc.setIn(['clips', t], false);
  delete state[t];
}
if (conflicted.length > 0) {
  console.log(
    `Merge conflicts in ${conflicted.join(', ')}, merged again recording by recording.${apply ? '' : ' Nothing is written without --apply.'}\n`
  );
}

const texts = textsToVoice(loadCategories());
const version = (text) => {
  const file = resolve(CLIP_DIR, clipName(text));
  return existsSync(file) ? clipVersion(readFileSync(file)) : null;
};
// A clip made again since the record is a draft again, as --record would write it.
const found = readHljod(doc.toJS());
const synced = syncState(found, state, version);
for (const text of synced.reset) doc.setIn(['clips', text], false);
const manifest = readHljod(doc.toJS());
const result = approvals(merged.ledger, manifest, { texts, version, names: merged.names });
const decided = new Set(result.outcomes.map((o) => o.text));
// What a person reads is measured from hljod.yaml as found (merged, if it had to be), not from
// the resets above; the writes go from the values after them.
process.stdout.write(
  report(
    merged.people,
    { ...result, outcomes: result.outcomes.map((o) => ({ ...o, from: valueOf(found, o.text) })) },
    merged.ledger.rulers,
    {
      reset: synced.reset
        .filter((t) => !decided.has(t))
        .map((t) => ({ text: t, from: valueOf(found, t) })),
      stamped: synced.stamped.filter((t) => !decided.has(t) && !clashes.has(t)),
      clashes: [...clashes].sort(),
    }
  )
);

const nextState = { ...synced.state };
for (const o of result.outcomes.filter((o) => o.from !== o.to)) {
  doc.setIn(['clips', o.text], o.to);
  const v = version(o.text);
  if (v !== null) nextState[o.text] = { v, value: o.to };
}
// One clip per line, however the list started.
const list = doc.get('clips', true);
if (list) list.flow = false;
// Written as --record writes stada.json, and through Prettier, so neither tool rewrites the other.
const outputs = [
  ['hljod.yaml', MANIFEST, manifestIn.raw, doc.toString()],
  [
    'stada.json',
    STATE_FILE,
    stateIn.raw,
    await prettify(JSON.stringify(nextState, null, 2), STATE_FILE),
  ],
  [
    'mat.json',
    LEDGER_FILE,
    ledgerIn.raw,
    await prettify(JSON.stringify(merged.ledger, null, 2), LEDGER_FILE),
  ],
].filter(([, , before, after]) => before !== after);
const named = outputs.map(([name]) => name).join(', ');
const unrecorded = outputs.some(([name]) => name === 'mat.json');
if (!apply) {
  console.log(
    outputs.length === 0
      ? `\nNothing for --apply to write${files.length > 0 ? ': every verdict in these files is in mat.json already' : ''}.`
      : `\n--apply would write ${named}.${unrecorded ? " The files' verdicts are not in mat.json until it does: keep the files till then." : ''}`
  );
} else {
  for (const [, file, , after] of outputs) writeFileSync(file, after);
  console.log(
    `\n${outputs.length === 0 ? 'Nothing to write.' : `Wrote ${named}.`} Building the app's data:\n`
  );
  // The app's data comes from these files, and CI refuses a commit where it is stale.
  const built = spawnSync(process.execPath, [resolve(HERE, 'build.mjs')], { stdio: 'inherit' });
  if (built.status !== 0) process.exit(built.status ?? 1);
  console.log('\nCommit everything git shows changed, then deploy.');
}
