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
 * not yet in the record is not deleted by mistake. After a git merge, run it with no files, before
 * `git add`: it merges again any of the three that git holds unmerged, joins both sides' records
 * within a merge even where one was taken whole, and works every value out again.
 */
import { spawnSync } from 'node:child_process';
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
import { fileAt, mergeBases, mergeSides, unmerged } from './git.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { prettify } from './render.mjs';
import {
  agreedBase,
  approvals,
  CONFLICT,
  INNER_CONFLICT,
  mergeLedgers,
  mergeReviews,
  mergeThreeWay,
  oursHunks,
  readLedger,
  readReview,
  report,
  reviewData,
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

let reviews;
try {
  reviews = files.flatMap((f) =>
    reviewData(readFileSync(f, 'utf8'), basename(f)).map((d) => readReview(d, basename(f)))
  );
} catch (e) {
  // A file that cannot be read stops the whole run: nothing is applied from half the files.
  console.error(e.message);
  process.exit(1);
}

// After a git merge that left a conflict in these files, each is merged again from git's three
// versions of it: the record joins both sides (`mergeLedgers`), and hljod.yaml and stada.json are
// merged recording by recording (`mergeThreeWay`). A recording both sides changed differently
// goes back to false, unless the verdicts decide it. A file counts as conflicted while git's index
// holds it unmerged, markers or none, so a side taken whole (`git checkout --theirs`) is merged
// again too, until `git add`.
const conflicted = [];
const sides = mergeSides(ROOT);
const CROSSED = Symbol('crossed');
const rel = (file) => relative(ROOT, file);
function fail(message) {
  console.error(message);
  process.exit(1);
}
/** git's version `n` of a file (1 base, 2 ours, 3 theirs): undefined where that side has none. */
function stage(file, n) {
  const text = fileAt(ROOT, `:${n}`, file);
  // A criss-cross merge's base is itself a merge, and can hold conflict markers of its own.
  return n === 1 && text !== undefined && INNER_CONFLICT.test(text) ? CROSSED : text;
}
/** The file as found and, if git holds it unmerged, git's versions of it. */
function read(file) {
  const raw = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  const marked = raw !== undefined && CONFLICT.test(raw);
  if (!unmerged(ROOT, file)) {
    if (marked) fail(`${rel(file)} has conflict markers outside a merge. Resolve it first.`);
    return { raw };
  }
  conflicted.push(rel(file));
  const base = stage(file, 1);
  return {
    raw,
    // The working file, where it can stand for itself: a side taken whole, or a merge already run.
    working: marked ? undefined : raw,
    base,
    ours: stage(file, 2) ?? '',
    theirs: stage(file, 3) ?? '',
    // For a criss-cross base, the file at each real merge base (undefined where it has none).
    ...(base === CROSSED && sides?.inProgress
      ? { bases: mergeBases(ROOT, sides.ours, sides.theirs).map((c) => fileAt(ROOT, c, file)) }
      : {}),
  };
}
/** A file read for what it says; one that cannot be read stops the run, naming it. */
function parsed(name, fn) {
  try {
    return fn();
  } catch (e) {
    return fail(`${name}: ${e.message}`);
  }
}
const json = (text, empty) => (text === undefined || text === '' ? empty : JSON.parse(text));
const ledgerOf = (text) => readLedger(json(text));

// The record. Within a merge (one in progress, or the merge commit HEAD is) both parents' records
// are joined with the working file's even where git merged it cleanly, or a side was taken whole
// and added: a record only grows, so nothing either side holds can be lost.
const ledgerIn = read(LEDGER_FILE);
const ledger = parsed('mat.json', () => {
  const sidesOf = () => {
    if (ledgerIn.ours !== undefined) {
      const ours = ledgerOf(ledgerIn.ours);
      const theirs = ledgerOf(ledgerIn.theirs);
      let base;
      if (ledgerIn.base !== CROSSED) base = ledgerOf(ledgerIn.base);
      else if (ledgerIn.bases) {
        base = {
          rulers: [...new Set(ledgerIn.bases.flatMap((t) => ledgerOf(t).rulers))],
          verdicts: {},
        };
      } else {
        // No merge base to read: keep only the rulers both sides hold, and say which went.
        base = { rulers: [...new Set([...ours.rulers, ...theirs.rulers])], verdicts: {} };
        const dropped = base.rulers.filter(
          (r) => !(ours.rulers.includes(r) && theirs.rulers.includes(r))
        );
        if (dropped.length > 0) {
          console.log(
            `No merge base of mat.json to read; rulers held by one side only are dropped: ${dropped.join(', ')}. Restore one with --urskurdur.\n`
          );
        }
      }
      return { ours, theirs, base };
    }
    if (!sides) return undefined;
    const at = (c) => ledgerOf(fileAt(ROOT, c, LEDGER_FILE));
    const bases = mergeBases(ROOT, sides.ours, sides.theirs);
    return {
      ours: at(sides.ours),
      theirs: at(sides.theirs),
      base: { rulers: [...new Set(bases.flatMap((c) => at(c).rulers))], verdicts: {} },
    };
  };
  const both = sidesOf();
  let working;
  try {
    working =
      ledgerIn.working === undefined && ledgerIn.ours !== undefined
        ? undefined
        : ledgerOf(ledgerIn.working ?? ledgerIn.raw);
  } catch (e) {
    // Within a conflict, a working file that cannot be read is left to git's versions of it.
    if (ledgerIn.ours === undefined) throw e;
  }
  return both ? mergeLedgers({ ...both, working }) : working;
});
const merged = mergeReviews(ledger, reviews, rulers);
if (merged.errors.length > 0) fail(merged.errors.join('\n'));

const manifestIn = read(MANIFEST);
const stateIn = read(STATE_FILE);
const clashes = new Set();
/** A merge's base for one file as a map, read from the real merge bases where git's is crossed. */
const baseMap = (input, toMap, same) => {
  if (input.base !== CROSSED) return toMap(input.base);
  const maps = (input.bases ?? []).map(toMap);
  const keys = new Set(
    [toMap(input.ours), toMap(input.theirs), ...maps].flatMap((m) => [...m.keys()])
  );
  return agreedBase(maps, keys, same);
};
// git's own merge of hljod.yaml, each conflicted hunk taken from ours, so what git merged cleanly
// (the voice, comments) is kept; the clips are merged recording by recording below.
const doc = parsed('hljod.yaml', () => {
  const d = parseDocument(oursHunks(manifestIn.raw ?? manifestIn.ours ?? ''));
  if (d.errors.length > 0) throw d.errors[0];
  return d;
});
if (manifestIn.ours !== undefined) {
  const values = (text) => {
    if (text === undefined || text === '') return new Map();
    const m = readHljod(parseDocument(text).toJS());
    return new Map([...m.clips.keys()].map((t) => [t, valueOf(m, t)]));
  };
  const { merged: clips, clashes: both } = parsed('hljod.yaml', () =>
    mergeThreeWay(baseMap(manifestIn, values), values(manifestIn.ours), values(manifestIn.theirs))
  );
  // A clash stays listed, as false (below); only a recording one side removed goes.
  for (const t of both) {
    clashes.add(t);
    clips.set(t, false);
  }
  for (const t of Object.keys(doc.toJS()?.clips ?? {}))
    if (!clips.has(t)) doc.deleteIn(['clips', t]);
  for (const [t, value] of clips) doc.setIn(['clips', t], value);
}
let state;
if (stateIn.ours !== undefined) {
  const entries = (text) => new Map(Object.entries(readState(json(text, {}))));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const { merged: kept, clashes: both } = parsed('stada.json', () =>
    mergeThreeWay(
      baseMap(stateIn, entries, same),
      entries(stateIn.ours),
      entries(stateIn.theirs),
      same
    )
  );
  for (const t of both) clashes.add(t);
  state = Object.fromEntries(kept);
} else state = parsed('stada.json', () => readState(json(stateIn.raw, {})));
// A clash leaves nobody's word on that recording: false, and no record of it, as for a new one.
for (const t of clashes) {
  if (doc.hasIn(['clips', t])) doc.setIn(['clips', t], false);
  delete state[t];
}
if (conflicted.length > 0) {
  console.log(
    `Merge conflicts in ${conflicted.join(', ')}, merged again recording by recording.${apply ? ' Run git add on them once this is done.' : ' Nothing is written without --apply.'}\n`
  );
}
// What students hear now, on this side of a merge (HEAD), whichever files git merged cleanly:
// what the report measures changes from. Outside a merge, hljod.yaml as it stands.
const now = parsed('hljod.yaml', () =>
  readHljod(
    parseDocument(
      (conflicted.length > 0 || sides?.inProgress ? fileAt(ROOT, 'HEAD', MANIFEST) : undefined) ??
        oursHunks(manifestIn.raw ?? '')
    ).toJS()
  )
);

const texts = textsToVoice(loadCategories());
const version = (text) => {
  const file = resolve(CLIP_DIR, clipName(text));
  return existsSync(file) ? clipVersion(readFileSync(file)) : null;
};
// A clip made again since the record is a draft again, as --record would write it.
const found = parsed('hljod.yaml', () => readHljod(doc.toJS()));
const synced = syncState(found, state, version);
for (const text of synced.reset) doc.setIn(['clips', text], false);
const manifest = readHljod(doc.toJS());
const result = approvals(merged.ledger, manifest, { texts, version, names: merged.names });
const decided = new Set(result.outcomes.map((o) => o.text));
// What a person reads is measured from hljod.yaml as it is on this side (`now`); the writes go
// from the values after the merge and the resets above. Every recording that changes from `now`
// with no verdict deciding it is listed, with why.
process.stdout.write(
  report(
    merged.people,
    { ...result, outcomes: result.outcomes.map((o) => ({ ...o, from: valueOf(now, o.text) })) },
    merged.ledger.rulers,
    {
      reset: [...now.clips.keys()]
        .filter((t) => !decided.has(t) && valueOf(manifest, t) !== valueOf(now, t))
        .map((t) => ({
          text: t,
          from: valueOf(now, t),
          to: valueOf(manifest, t),
          ...(clashes.has(t) ? { clash: true } : synced.reset.includes(t) ? {} : { merged: true }),
        })),
      stamped: synced.stamped.filter((t) => !decided.has(t) && !clashes.has(t)),
      clashes: [...clashes].sort(),
      shared: merged.shared,
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
// Whether the files add anything to the record, as against a merge or a reformat of it.
const unrecorded =
  JSON.stringify(mergeReviews(ledger, []).ledger) !== JSON.stringify(merged.ledger);
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
