#!/usr/bin/env node
/**
 * Read the review files teachers send back from `/islenskubraut/yfirferd`. See `yfirferd.mjs`.
 *
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …]                 # print what they say
 *   pnpm islenskubraut:yfirferd <file.json> [more.json …] --apply         # and write the verdicts
 *   pnpm islenskubraut:yfirferd <files> --urskurdur "Nafn" [--apply]      # Nafn's verdicts rule
 *   pnpm islenskubraut:yfirferd [<files>] --afturkalla "Nafn" [--apply]   # Nafn stops ruling
 *
 * The files' verdicts are added to the record of every verdict given (the files in
 * content/islenskubraut/hljod/mat/, `mat.mjs`), and the values are worked out from that record:
 * every recording with a verdict on its current audio is `true` if heard as right and never as
 * wrong, `rangt` the other way round, and `false` otherwise, whatever order the files came in and
 * on whatever machine. A ruler (`--urskurdur`, a reviewer's name) decides a recording whatever the
 * others say; the record keeps who rules, so a ruling lasts, and the report lists each verdict it
 * overrules. `--afturkalla` takes a ruling back, by the name on the ruler's files or by the hash
 * the report gives.
 *
 * A review sent as text (`Afrita sem texta`) carries the same data between two marker lines, so
 * an email saved as a .txt file is read as the file would be.
 *
 * `--apply` adds a file to the record for whatever the files add, writes whichever of
 * `hljod.yaml` and its record `stada.json` change, then runs `pnpm islenskubraut:build`, which
 * turns them into the app's data. Commit everything git then shows changed; after that the review
 * files can be deleted, once their notes have been read. Without `--apply` it says what it would
 * write, so a file whose verdicts are not yet in the record is not deleted by mistake.
 *
 * The record's files are only ever added, so git never conflicts on them. After a git merge,
 * rebase or cherry-pick that left a conflict in `hljod.yaml` or `stada.json`, run it with no
 * files: it merges each again from git's versions of it, recording by recording, and works every
 * value out again from the record.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseDocument } from 'yaml';

import { fileAt, mergeSides, unmerged } from './git.mjs';
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
import { loadRecord, recordFile, writeRecordFile } from './mat.mjs';
import { prettify } from './render.mjs';
import {
  agreedBase,
  approvals,
  CONFLICT,
  INNER_CONFLICT,
  mergeReviews,
  mergeThreeWay,
  oursHunks,
  readReview,
  report,
  reviewData,
} from './yfirferd.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
const STATE_FILE = resolve(CONTENT_DIR, 'hljod/stada.json');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');

const USAGE =
  'Usage: pnpm islenskubraut:yfirferd [file.json or .txt …] [--urskurdur "Nafn"] [--afturkalla "Nafn"] [--apply]';
const args = process.argv.slice(2);
let apply = false;
const rulers = [];
const unrule = [];
const files = [];
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (a === '--apply') apply = true;
  else if (a === '--urskurdur') rulers.push(args[(i += 1)] ?? '');
  else if (a.startsWith('--urskurdur=')) rulers.push(a.slice('--urskurdur='.length));
  else if (a === '--afturkalla') unrule.push(args[(i += 1)] ?? '');
  else if (a.startsWith('--afturkalla=')) unrule.push(a.slice('--afturkalla='.length));
  else if (a.startsWith('-')) {
    console.error(`Unknown option ${a}\n${USAGE}`);
    process.exit(1);
  } else files.push(a);
}
if ([...rulers, ...unrule].some((r) => r.trim() === '')) {
  console.error(USAGE);
  process.exit(1);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
/** Something read for what it says; one that cannot be read stops the run, naming it. */
function parsed(name, fn) {
  try {
    return fn();
  } catch (e) {
    return fail(`${name}: ${e.message}`);
  }
}

let reviews;
try {
  reviews = files.flatMap((f) =>
    reviewData(readFileSync(f, 'utf8'), basename(f)).map((d) => readReview(d, basename(f)))
  );
} catch (e) {
  // A file that cannot be read stops the whole run: nothing is applied from half the files.
  fail(e.message);
}

// The record, and what the files add to it. Its files are only ever added, so no merge touches it.
const ledger = parsed('the record', () => loadRecord());
const now = new Date().toISOString();
const merged = mergeReviews(ledger, reviews, rulers, { unrule, now });
if (merged.errors.length > 0) fail(merged.errors.join('\n'));

// hljod.yaml and stada.json after a git merge, rebase or cherry-pick that left a conflict in
// them: each is merged again from git's three versions of it, recording by recording
// (`mergeThreeWay`). A recording both sides changed differently goes back to false, unless the
// verdicts decide it. A file counts as conflicted while git's index holds it unmerged, markers or
// none, so a side taken whole (`git checkout --theirs`) is merged again too until `git add`; and
// one added or committed with its markers still in it is merged again from the operation's sides.
const conflicted = [];
const sides = mergeSides(ROOT);
const CROSSED = Symbol('crossed');
const rel = (file) => relative(ROOT, file);
/** git's version `n` of a file (1 base, 2 ours, 3 theirs): undefined where that side has none. */
function stage(file, n) {
  const text = fileAt(ROOT, `:${n}`, file);
  // A criss-cross merge's base is itself a merge, and can hold conflict markers of its own.
  return n === 1 && text !== undefined && INNER_CONFLICT.test(text) ? CROSSED : text;
}
/** The file as found and, if a conflict in it is still to resolve, the versions it came from. */
function read(file) {
  const raw = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  const marked = raw !== undefined && CONFLICT.test(raw);
  const staged = unmerged(ROOT, file);
  if (!staged && !marked) return { raw };
  if (!staged && !sides) {
    fail(
      `${rel(file)} has conflict markers, and no merge, rebase or cherry-pick is open, nor is HEAD a merge, to merge it again from. Remove them by hand.`
    );
  }
  conflicted.push(rel(file));
  const atBases = () => (sides?.bases ?? []).map((c) => fileAt(ROOT, c, file));
  if (staged) {
    const base = stage(file, 1);
    return {
      raw,
      base,
      ours: stage(file, 2) ?? '',
      theirs: stage(file, 3) ?? '',
      ...(base === CROSSED ? { bases: sides ? atBases() : [] } : {}),
    };
  }
  // Added or committed with its markers: git keeps no stages, so the sides are the commits.
  const bases = atBases();
  return {
    raw,
    base: bases.length === 1 ? bases[0] : CROSSED,
    bases,
    ours: fileAt(ROOT, sides.ours, file) ?? '',
    theirs: fileAt(ROOT, sides.theirs, file) ?? '',
  };
}
const json = (text, empty) => (text === undefined || text === '' ? empty : JSON.parse(text));

const manifestIn = read(MANIFEST);
const stateIn = read(STATE_FILE);
const clashes = new Set();
/** A merge's base for one file as a map, read from the real merge bases where git's is crossed. */
const baseMap = (input, toMap, same, absent) => {
  if (input.base !== CROSSED) return toMap(input.base);
  const maps = input.bases.map(toMap);
  const keys = new Set(
    [toMap(input.ours), toMap(input.theirs), ...maps].flatMap((m) => [...m.keys()])
  );
  return agreedBase(maps, keys, same, absent);
};
const yamlDoc = (text) => {
  const d = parseDocument(oursHunks(text));
  if (d.errors.length > 0) throw d.errors[0];
  return d;
};
// git's own merge of hljod.yaml, each conflicted hunk taken from ours, so what git merged cleanly
// (the voice, comments) is kept; the clips are merged recording by recording below. A working
// file that does not parse (a merge tool's "accept both" leaves a clip twice) gives way to ours.
const doc = parsed('hljod.yaml', () => {
  if (manifestIn.ours === undefined) return yamlDoc(manifestIn.raw ?? '');
  try {
    return yamlDoc(manifestIn.raw ?? manifestIn.ours);
  } catch {
    return yamlDoc(manifestIn.ours);
  }
});
if (manifestIn.ours !== undefined) {
  const values = (text) => {
    if (text === undefined || text === '') return new Map();
    const m = readHljod(parseDocument(oursHunks(text)).toJS());
    return new Map([...m.clips.keys()].map((t) => [t, valueOf(m, t)]));
  };
  const { merged: clips, clashes: both } = parsed('hljod.yaml', () =>
    mergeThreeWay(
      // A clip one base lists and another does not was not approved in the second: false.
      baseMap(manifestIn, values, undefined, false),
      values(manifestIn.ours),
      values(manifestIn.theirs)
    )
  );
  // A clash stays listed, as false (below); only a recording one side removed goes.
  for (const t of both) {
    clashes.add(t);
    clips.set(t, false);
  }
  for (const t of Object.keys(doc.toJS()?.clips ?? {})) {
    if (!clips.has(t)) doc.deleteIn(['clips', t]);
  }
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
// Within a merge, rebase or cherry-pick (or a conflict left from one), changes are measured from
// what students hear now: this side's hljod.yaml (ours, or HEAD), whichever files git merged
// cleanly. Outside one, from hljod.yaml as it stands.
const inMerge = conflicted.length > 0 || Boolean(sides?.inProgress);
const heard = parsed('hljod.yaml', () =>
  readHljod(
    parseDocument(
      oursHunks(
        manifestIn.ours ??
          (inMerge ? fileAt(ROOT, 'HEAD', MANIFEST) : undefined) ??
          manifestIn.raw ??
          ''
      )
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
// What a person reads is measured from `heard`, what students hear now; the writes go from the
// values after the merge and the resets above. Every recording that changes from `heard` with no
// verdict deciding it is listed, with why, whichever of the two lists it.
process.stdout.write(
  report(
    merged.people,
    { ...result, outcomes: result.outcomes.map((o) => ({ ...o, from: valueOf(heard, o.text) })) },
    merged.ledger.rulers,
    {
      reset: [...new Set([...heard.clips.keys(), ...manifest.clips.keys()])]
        .filter((t) => !decided.has(t) && valueOf(manifest, t) !== valueOf(heard, t))
        .map((t) => ({
          text: t,
          from: valueOf(heard, t),
          to: valueOf(manifest, t),
          ...(clashes.has(t) ? { clash: true } : synced.reset.includes(t) ? {} : { merged: true }),
        })),
      stamped: synced.stamped.filter((t) => !decided.has(t) && !clashes.has(t)),
      clashes: [...clashes].sort(),
      shared: merged.shared,
      inMerge,
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
const recordAdded = merged.added.verdicts.length > 0 || merged.added.rulings.length > 0;
const next = recordAdded ? await recordFile(merged.added, now) : undefined;
const outputs = [
  ['hljod.yaml', MANIFEST, manifestIn.raw, doc.toString()],
  [
    'stada.json',
    STATE_FILE,
    stateIn.raw,
    await prettify(JSON.stringify(nextState, null, 2), STATE_FILE),
  ],
  ...(next ? [[rel(next.file), next.file, undefined, next.text]] : []),
].filter(([, , before, after]) => before !== after);
const named = outputs.map(([name]) => name).join(', ');
if (!apply) {
  console.log(
    outputs.length === 0
      ? `\nNothing for --apply to write${files.length > 0 ? ': every verdict in these files is in the record already' : ''}.${inMerge ? " Run it with --apply anyway after a merge: it rebuilds the app's data." : ''}`
      : `\n--apply would write ${outputs.map(([name]) => (next && name === rel(next.file) ? 'a new file of the record, in hljod/mat/' : name)).join(', ')}.${recordAdded ? " The files' verdicts are not in the record until it does: keep the files till then." : ''}`
  );
} else {
  for (const [, file, , after] of outputs) {
    if (next && file === next.file) writeRecordFile(next);
    else writeFileSync(file, after);
  }
  console.log(
    `\n${outputs.length === 0 ? 'Nothing to write.' : `Wrote ${named}.`} Building the app's data:\n`
  );
  // The app's data comes from these files, and CI refuses a commit where it is stale.
  const built = spawnSync(process.execPath, [resolve(HERE, 'build.mjs')], { stdio: 'inherit' });
  if (built.status !== 0) process.exit(built.status ?? 1);
  console.log(
    '\nCommit everything git shows changed, the new file of the record included, then deploy.'
  );
}
