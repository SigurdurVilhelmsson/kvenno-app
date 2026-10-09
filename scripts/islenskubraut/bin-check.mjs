#!/usr/bin/env node
/**
 * Check every word in the Íslenskubraut content against BÍN. See `bin.mjs` for why.
 *
 *   pnpm islenskubraut:bin            # offline: check against bin/ordmyndir.json
 *   pnpm islenskubraut:bin --fetch    # look up forms not yet saved, then check
 *   pnpm islenskubraut:bin --refresh  # look up every form again, then check
 *
 * Exits 1 when a word is neither known to BÍN nor listed in bin/ekki-i-bin.yaml, and 2 when
 * a word has never been looked up (run with --fetch).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse } from 'yaml';

import {
  cacheDocument,
  classify,
  collectWords,
  fetchForm,
  formatNotFound,
  formsToFetch,
  validateAccepted,
} from './bin.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';
import { prettify } from './render.mjs';

const BIN_DIR = resolve(CONTENT_DIR, 'bin');
const CACHE_FILE = resolve(BIN_DIR, 'ordmyndir.json');
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

const words = collectWords(loadCategories());
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

if (uncached.length > 0) {
  console.log(
    `\n${uncached.length} word(s) never looked up: ${uncached.slice(0, 10).join(', ')}${uncached.length > 10 ? ', …' : ''}` +
      '\nRun `pnpm islenskubraut:bin --fetch`.'
  );
  process.exit(2);
}
process.exit(notFound.length > 0 ? 1 : 0);
