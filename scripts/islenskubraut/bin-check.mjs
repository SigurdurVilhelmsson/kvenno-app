#!/usr/bin/env node
/**
 * Check every word in the Íslenskubraut content against BÍN. See `bin.mjs` for why.
 *
 *   pnpm islenskubraut:bin            # offline: check against bin/ordmyndir.json
 *   pnpm islenskubraut:bin --fetch    # look up forms not yet saved, then check
 *   pnpm islenskubraut:bin --refresh  # look up every form again, then check
 *
 * Exits 1 when a word is neither known to BÍN nor listed in bin/ekki-i-bin.yaml, or the sentence
 * builder has a word it cannot place, and 2 when a word has never been looked up or an
 * inflection table the builder needs has not been fetched (run with --fetch).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse } from 'yaml';

import {
  addWords,
  cacheDocument,
  classify,
  collectWords,
  fetchForm,
  fetchParadigm,
  formatNotFound,
  formsToFetch,
  paradigmDocument,
  validateAccepted,
} from './bin.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { prettify } from './render.mjs';
import { paradigmsNeeded } from './smidur.mjs';
import { readEgget } from './egget.mjs';
import { readTexti } from './texti.mjs';

const BIN_DIR = resolve(CONTENT_DIR, 'bin');
const CACHE_FILE = resolve(BIN_DIR, 'ordmyndir.json');
// The sentence builder's inflection tables (smidur.mjs), fetched by GUID for the words it inflects.
const PARADIGM_FILE = resolve(BIN_DIR, 'beygingar.json');
const ACCEPTED_FILE = resolve(BIN_DIR, 'ekki-i-bin.yaml');
const DELAY_MS = Number(process.env.BIN_DELAY_MS ?? 150);

const refresh = process.argv.includes('--refresh');
const fetching = refresh || process.argv.includes('--fetch');

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY is set. A cloud session reaches
// the internet only through that proxy, so re-run with it on rather than fail there.
if (fetching && process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const child = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(child.status ?? 1);
}

function readCache() {
  if (!existsSync(CACHE_FILE)) return {};
  return JSON.parse(readFileSync(CACHE_FILE, 'utf8')).ordmyndir ?? {};
}

// Written as the repo's Prettier would write it, so `format:check` and lint-staged leave the
// file alone. Only whitespace changes; every form is still stored exactly as BÍN sent it.
async function writeCache(cache) {
  mkdirSync(BIN_DIR, { recursive: true });
  writeFileSync(
    CACHE_FILE,
    await prettify(JSON.stringify(cacheDocument(cache), null, 2), CACHE_FILE)
  );
}

function readParadigms() {
  if (!existsSync(PARADIGM_FILE)) return {};
  return JSON.parse(readFileSync(PARADIGM_FILE, 'utf8')).beygingar ?? {};
}

async function writeParadigms(paradigms) {
  writeFileSync(
    PARADIGM_FILE,
    await prettify(JSON.stringify(paradigmDocument(paradigms), null, 2), PARADIGM_FILE)
  );
}

const categories = loadCategories();
const words = collectWords(categories);
// The talk-to-write sheets' model texts (texti.mjs): their gaps are found through these lookups.
const EGGET_DIR = resolve(CONTENT_DIR, 'egget');
for (const file of existsSync(EGGET_DIR) ? readdirSync(EGGET_DIR) : []) {
  if (!file.endsWith('.yaml')) continue;
  const id = file.replace(/\.yaml$/, '');
  const egget = readEgget(parse(readFileSync(resolve(EGGET_DIR, file), 'utf8')), id);
  for (const [level, list] of Object.entries(egget.levels)) {
    for (const s of list) addWords(words, id, `ég get ${level}`, s);
  }
}
const TEXTI_DIR = resolve(CONTENT_DIR, 'texti');
for (const file of existsSync(TEXTI_DIR) ? readdirSync(TEXTI_DIR) : []) {
  if (!file.endsWith('.yaml')) continue;
  const id = file.replace(/\.yaml$/, '');
  const texti = readTexti(parse(readFileSync(resolve(TEXTI_DIR, file), 'utf8')), id);
  for (const [level, t] of Object.entries(texti.levels)) {
    for (const stage of t.stages) addWords(words, id, `texti ${level}`, stage.text);
  }
}
const accepted = validateAccepted(
  existsSync(ACCEPTED_FILE) ? parse(readFileSync(ACCEPTED_FILE, 'utf8')) : {}
);
let cache = refresh ? {} : readCache();

if (fetching) {
  let fetched = 0;
  try {
    for (
      let batch = formsToFetch(words, cache);
      batch.length > 0;
      batch = formsToFetch(words, cache)
    ) {
      for (const form of batch) {
        cache[form] = await fetchForm(form);
        fetched += 1;
        if (fetched % 50 === 0) console.log(`  ${fetched} looked up…`);
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }
  } catch (err) {
    const cause = err.cause?.message ?? err.cause?.code;
    console.error(`\nlookup failed: ${err.message}${cause ? ` (${cause})` : ''}`);
    if (err.message === 'fetch failed') {
      console.error(
        'Could not reach bin.arnastofnun.is. In a cloud session, add it under Allowed domains in the\n' +
          "environment's Network access settings and start a new session."
      );
    }
    console.error(`kept the ${fetched} form(s) looked up before the failure`);
    process.exitCode = 1;
  } finally {
    if (fetched > 0 || refresh) await writeCache(cache);
  }
  if (process.exitCode) process.exit(process.exitCode);
  console.log(
    `looked up ${fetched} form(s); saved ${CACHE_FILE.replace(`${CONTENT_DIR}/`, 'content/islenskubraut/')}`
  );

  // Then the inflection tables the sentence builder needs, which depend on the lookups above.
  const paradigms = refresh ? {} : readParadigms();
  const missing = paradigmsNeeded(categories, cache).guids.filter((g) => !paradigms[g]);
  let tables = 0;
  try {
    for (const guid of missing) {
      paradigms[guid] = await fetchParadigm(guid);
      tables += 1;
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  } catch (err) {
    console.error(`\ninflection table lookup failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (tables > 0 || refresh) await writeParadigms(paradigms);
  }
  if (process.exitCode) process.exit(process.exitCode);
  console.log(`fetched ${tables} inflection table(s) for the sentence builder`);
}

const { found, notFound, uncached } = classify(words, cache, accepted);
console.log(
  `${words.size} words: ${found.length} known to BÍN or accepted, ${notFound.length} not in BÍN`
);

const unused = Object.keys(accepted).filter(
  (w) => ![...words.keys()].some((x) => x.toLocaleLowerCase('is') === w)
);
if (unused.length > 0) {
  console.log(`\nekki-i-bin.yaml lists word(s) no longer in the content: ${unused.join(', ')}`);
}

if (notFound.length > 0) {
  console.log(
    '\nNot in BÍN. Fix the spelling, or add the word to content/islenskubraut/bin/ekki-i-bin.yaml\n' +
      'with a reason if it is right and BÍN-kjarninn simply does not carry it:\n'
  );
  console.log(formatNotFound(words, notFound));
}

// The sentence builder's needs: a word it cannot place, or a table not yet fetched.
const builder = paradigmsNeeded(categories, cache);
const tablesMissing = builder.guids.filter((g) => !readParadigms()[g]);
if (builder.problems.length > 0) {
  console.log(`\nSentence builder: ${builder.problems.length} word(s) need a person:`);
  for (const p of builder.problems) console.log(`  ${p}`);
}
if (tablesMissing.length > 0) {
  console.log(
    `\nSentence builder: ${tablesMissing.length} of ${builder.guids.length} inflection table(s) not fetched yet.` +
      '\nRun `pnpm islenskubraut:bin --fetch`.'
  );
}

if (uncached.length > 0) {
  console.log(
    `\n${uncached.length} word(s) never looked up: ${uncached.slice(0, 10).join(', ')}${uncached.length > 10 ? ', …' : ''}` +
      '\nRun `pnpm islenskubraut:bin --fetch`.'
  );
}
if (uncached.length > 0 || tablesMissing.length > 0) process.exit(2);
process.exit(notFound.length > 0 || builder.problems.length > 0 ? 1 : 0);
