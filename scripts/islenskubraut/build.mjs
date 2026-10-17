#!/usr/bin/env node
/** YAML -> both TypeScript consumers, and their shared types. `--check` exits 1 if anything is stale. */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

import { readEgget } from './egget.mjs';
import { allGames, readGiskaleikur } from './giskaleikur.mjs';
import { readGlossur } from './glossur.mjs';
import {
  clipName,
  clipVersion,
  clipsForApp,
  clipsForReview,
  readHeard,
  readHljod,
  readState,
  stateProblems,
  textsToVoice,
} from './hljod.mjs';
import { loadCategories } from './load.mjs';
import { allEntries, approvedPictures, checkCoverage, readMyndir } from './myndir.mjs';
import {
  prettify,
  renderEggetApp,
  renderEggetServer,
  renderGiskaleikurApp,
  renderGlossur,
  renderHljod,
  renderHlustun,
  renderTextiApp,
  renderTextiServer,
  renderGiskaleikurServer,
  renderMyndir,
  renderServerModule,
  renderSmidur,
  renderSpaCategory,
  renderSpaIndex,
  renderTenglar,
  renderTypes,
} from './render.mjs';
import { pageData } from './smidur.mjs';
import { readTenglar } from './tenglar.mjs';
import { allTexts, readTexti } from './texti.mjs';
import { approvals, readLedger } from './yfirferd.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SPA_DIR = resolve(ROOT, 'apps/islenskubraut/src/data/categories');
const SPA_INDEX = resolve(ROOT, 'apps/islenskubraut/src/data/index.ts');
const SERVER_FILE = resolve(ROOT, 'server/src/lib/islenskubraut-data.ts');
const SPA_TYPES = resolve(ROOT, 'apps/islenskubraut/src/data/types.ts');
const SERVER_TYPES = resolve(ROOT, 'server/src/types/islenskubraut.ts');
const SPA_SMIDUR = resolve(ROOT, 'apps/islenskubraut/src/data/smidur.ts');
const BIN_DIR = resolve(ROOT, 'content/islenskubraut/bin');
const SPA_MYNDIR = resolve(ROOT, 'apps/islenskubraut/src/data/myndir.ts');
const MYNDIR_FILE = resolve(ROOT, 'content/islenskubraut/myndir/myndir.yaml');
const PICTURE_DIR = resolve(ROOT, 'apps/islenskubraut/public/myndir');
const TENGLAR_FILE = resolve(ROOT, 'content/islenskubraut/tenglar/tenglar.yaml');
const SPA_TENGLAR = resolve(ROOT, 'apps/islenskubraut/src/data/tenglar.ts');
const GISKA_DIR = resolve(ROOT, 'content/islenskubraut/giskaleikur');
const SERVER_GISKA = resolve(ROOT, 'server/src/lib/islenskubraut-giskaleikur.ts');
const SPA_GISKA = resolve(ROOT, 'apps/islenskubraut/src/data/giskaleikur.ts');
const TEXTI_DIR = resolve(ROOT, 'content/islenskubraut/texti');
const SERVER_TEXTI = resolve(ROOT, 'server/src/lib/islenskubraut-texti.ts');
const SPA_TEXTI = resolve(ROOT, 'apps/islenskubraut/src/data/texti.ts');
const EGGET_DIR = resolve(ROOT, 'content/islenskubraut/egget');
const SERVER_EGGET = resolve(ROOT, 'server/src/lib/islenskubraut-egget.ts');
const SPA_EGGET = resolve(ROOT, 'apps/islenskubraut/src/data/egget.ts');
const GLOSSUR_DIR = resolve(ROOT, 'content/islenskubraut/glossur');
const SPA_GLOSSUR = resolve(ROOT, 'apps/islenskubraut/src/data/glossur.ts');
const HLJOD_FILE = resolve(ROOT, 'content/islenskubraut/hljod/hljod.yaml');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');
const SPA_HLJOD = resolve(ROOT, 'apps/islenskubraut/src/data/hljod.ts');
const HEARD_FILE = resolve(ROOT, 'content/islenskubraut/hljod/hlustun.json');
const SPA_HLUSTUN = resolve(ROOT, 'apps/islenskubraut/src/data/hlustun.ts');
const STATE_FILE = resolve(ROOT, 'content/islenskubraut/hljod/stada.json');
const LEDGER_FILE = resolve(ROOT, 'content/islenskubraut/hljod/mat.json');

const check = process.argv.includes('--check');
const categories = loadCategories();

// The sentence builder's sentences, built from the saved BÍN files. A sentence BÍN cannot
// complete throws here, naming it, so the build fails instead of shipping a gap.
const binFile = (name, key) => JSON.parse(readFileSync(resolve(BIN_DIR, name), 'utf8'))[key];
const lookups = binFile('ordmyndir.json', 'ordmyndir');
const paradigms = binFile('beygingar.json', 'beygingar');
const smidur = categories
  .filter((c) => c.builder)
  .map((c) => {
    try {
      return [c.id, pageData(c, lookups, paradigms)];
    } catch (err) {
      throw new Error(`sentence builder, ${c.id}: ${err.message}`);
    }
  });

// The A1 pictograms. A chip with no entry, an entry for no chip, or an approved picture whose
// file is missing breaks the build; a chip whose picture is not yet chosen or approved just
// shows none (`pnpm islenskubraut:myndir` reports those).
const myndir = readMyndir(parse(readFileSync(MYNDIR_FILE, 'utf8')));
const coverage = checkCoverage(myndir, categories);
const noFile = allEntries(myndir).filter(
  (e) => e.approved && !existsSync(resolve(PICTURE_DIR, `${e.id}.png`))
);
if (coverage.missing.length || coverage.stale.length || noFile.length) {
  throw new Error(
    'content/islenskubraut/myndir/myndir.yaml does not match the cards. ' +
      `No entry: ${coverage.missing.join('; ') || '-'}. ` +
      `No chip: ${coverage.stale.join('; ') || '-'}. ` +
      `Approved with no file: ${noFile.map((e) => `${e.word} ${e.id}`).join('; ') || '-'}. ` +
      'Run: pnpm islenskubraut:myndir'
  );
}

// The links out from each card page. A bad address, an unknown category or flattened text
// breaks the build; whether each address still answers is `pnpm islenskubraut:tenglar --online`.
const tenglar = readTenglar(
  parse(readFileSync(TENGLAR_FILE, 'utf8')),
  categories.map((c) => c.id)
);

// "Hvað er þetta?": a file per category, optional. A thing described with a word the card does not
// offer, or a level where two things read the same, breaks the build.
const games = allGames(
  Object.fromEntries(
    readdirSync(GISKA_DIR)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => {
        const id = f.replace(/\.yaml$/, '');
        const category = categories.find((c) => c.id === id);
        if (!category) throw new Error(`giskaleikur/${f}: no category ${id}`);
        return [id, readGiskaleikur(parse(readFileSync(resolve(GISKA_DIR, f), 'utf8')), category)];
      })
  ),
  categories
);

// "Frá tali til texta": a model text per category and level, optional. Its gaps come from the
// saved BÍN lookups, so a word never looked up, or a text with too few card words, breaks the build.
const texts = allTexts(
  Object.fromEntries(
    readdirSync(TEXTI_DIR)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => {
        const id = f.replace(/\.yaml$/, '');
        if (!categories.some((c) => c.id === id)) throw new Error(`texti/${f}: no category ${id}`);
        return [id, readTexti(parse(readFileSync(resolve(TEXTI_DIR, f), 'utf8')), id)];
      })
  ),
  categories,
  lookups
);

// "Ég get…": three or four statements per category and level, optional per category, in the
// taught order of the categories rather than the folder's.
const eggetFiles = readdirSync(EGGET_DIR).filter((f) => f.endsWith('.yaml'));
const egget = Object.fromEntries(
  categories
    .map((c) => `${c.id}.yaml`)
    .filter((f) => eggetFiles.includes(f))
    .concat(eggetFiles.filter((f) => !categories.some((c) => `${c.id}.yaml` === f)))
    .map((f) => {
      const id = f.replace(/\.yaml$/, '');
      if (!categories.some((c) => c.id === id)) throw new Error(`egget/${f}: no category ${id}`);
      return [id, readEgget(parse(readFileSync(resolve(EGGET_DIR, f), 'utf8')), id)];
    })
);

// "Á þínu máli": a file per language. Drafts are included for `?drog`; an approved language that
// misses an A1 chip breaks the build.
const glossur = readdirSync(GLOSSUR_DIR)
  .filter((f) => f.endsWith('.yaml'))
  .sort()
  .map((f) =>
    readGlossur(
      parse(readFileSync(resolve(GLOSSUR_DIR, f), 'utf8')),
      f.replace(/\.yaml$/, ''),
      categories
    )
  );

// The recordings: every clip on the cards with a file, approved or not, so `?drog` can play the
// drafts. An approved clip with no file breaks the build; a text with no clip has no button.
// A git merge can leave conflict markers in the recordings' files, which no parser reads.
const conflicted = [HLJOD_FILE, STATE_FILE, LEDGER_FILE].filter(
  (f) => existsSync(f) && /^(<{7}|={7}|>{7})( |$)/m.test(readFileSync(f, 'utf8'))
);
if (conflicted.length > 0) {
  console.error(
    `git left a merge conflict in ${conflicted.map((f) => f.replace(`${ROOT}/`, '')).join(', ')}.`
  );
  console.error('Run: pnpm islenskubraut:yfirferd --apply   (no files needed); it resolves them.');
  process.exit(1);
}
const hljod = readHljod(parse(readFileSync(HLJOD_FILE, 'utf8')));
const voiced = textsToVoice(categories);
const hasClip = (f) => existsSync(resolve(CLIP_DIR, f));
const clips = clipsForApp(voiced, hljod, hasClip);
const heard = existsSync(HEARD_FILE) ? readHeard(JSON.parse(readFileSync(HEARD_FILE, 'utf8'))) : {};
// Each clip's audio version, so a verdict given to a recording is not taken for a remade one.
const version = (f) => clipVersion(readFileSync(resolve(CLIP_DIR, f)));
// An approval is for the audio approved: a recording replaced since, or a value changed by hand
// and not recorded, stops the build until `pnpm islenskubraut:hljod --record` has seen it.
const state = existsSync(STATE_FILE) ? readState(JSON.parse(readFileSync(STATE_FILE, 'utf8'))) : {};
const problems = stateProblems(hljod, state, (t) =>
  hasClip(clipName(t)) ? version(clipName(t)) : null
);
if (problems.length > 0) {
  console.error(`content/islenskubraut/hljod/stada.json is out of date:`);
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
  if (problems.length > 20) console.error(`  … and ${problems.length - 20} more`);
  console.error('Run: pnpm islenskubraut:hljod --record');
  process.exit(1);
}
// And a value is what the teachers' verdicts give it, wherever mat.json holds one on the audio as
// it is now: a git merge of two runs, or a hand edit, can leave hljod.yaml saying otherwise.
let ledger;
try {
  ledger = readLedger(
    existsSync(LEDGER_FILE) ? JSON.parse(readFileSync(LEDGER_FILE, 'utf8')) : undefined
  );
} catch (e) {
  console.error(`content/islenskubraut/hljod/mat.json cannot be read: ${e.message}`);
  console.error(
    'After a git merge with a conflict in it, run: pnpm islenskubraut:yfirferd --apply'
  );
  process.exit(1);
}
const drift = approvals(ledger, hljod, {
  texts: voiced,
  version: (t) => (hasClip(clipName(t)) ? version(clipName(t)) : null),
}).outcomes.filter((o) => o.from !== o.to);
if (drift.length > 0) {
  console.error('content/islenskubraut/hljod/hljod.yaml disagrees with the verdicts in mat.json:');
  for (const o of drift.slice(0, 20))
    console.error(`  "${o.text}": ${o.from}, the verdicts give ${o.to}`);
  if (drift.length > 20) console.error(`  … and ${drift.length - 20} more`);
  console.error(
    'Run: pnpm islenskubraut:yfirferd --apply   (no files needed). To overrule the verdicts, give a ruling.'
  );
  process.exit(1);
}
const review = clipsForReview(voiced, hljod, hasClip, heard, version);

const outputs = [
  ...categories.map((c) => [resolve(SPA_DIR, `${c.id}.ts`), renderSpaCategory(c)]),
  [SPA_INDEX, renderSpaIndex(categories)],
  [SERVER_FILE, renderServerModule(categories)],
  [SPA_TYPES, renderTypes()],
  [SERVER_TYPES, renderTypes()],
  [SPA_SMIDUR, renderSmidur(smidur)],
  [SPA_MYNDIR, renderMyndir(approvedPictures(myndir, categories))],
  [SPA_TENGLAR, renderTenglar(tenglar)],
  [SERVER_GISKA, renderGiskaleikurServer(games)],
  [SPA_GISKA, renderGiskaleikurApp(games)],
  [SERVER_TEXTI, renderTextiServer(texts)],
  [SPA_TEXTI, renderTextiApp(texts)],
  [SPA_HLJOD, renderHljod(clips, hljod.voice)],
  [SPA_HLUSTUN, renderHlustun(review)],
  [SERVER_EGGET, renderEggetServer(egget)],
  [SPA_GLOSSUR, renderGlossur(glossur)],
  [SPA_EGGET, renderEggetApp(egget)],
];

let stale = 0;
for (const [file, source] of outputs) {
  const next = await prettify(source, file);
  let current = null;
  try {
    current = readFileSync(file, 'utf8');
  } catch {
    /* not generated yet */
  }
  if (current === next) continue;
  stale += 1;
  if (check) {
    console.error(`STALE: ${file.replace(`${ROOT}/`, '')}`);
  } else {
    writeFileSync(file, next, 'utf8');
    console.log(`wrote ${file.replace(`${ROOT}/`, '')}`);
  }
}

if (check && stale > 0) {
  console.error(`\n${stale} generated file(s) do not match content/islenskubraut/.`);
  console.error('Run: pnpm islenskubraut:build');
  process.exit(1);
}
if (stale === 0) console.log('islenskubraut: generated files are up to date.');
