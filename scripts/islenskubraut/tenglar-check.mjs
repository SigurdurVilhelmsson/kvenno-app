#!/usr/bin/env node
/**
 * The links out from each card page (Fleiri úrræði). See `tenglar.mjs`.
 *
 *   pnpm islenskubraut:tenglar            # list every link, per level, and which are approved
 *   pnpm islenskubraut:tenglar --online   # also check that every address still answers
 *
 * Exits 1 when an address does not answer.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse } from 'yaml';

import { CONTENT_DIR, LEVELS, loadCategories } from './load.mjs';
import { addresses, checkAddress, readTenglar } from './tenglar.mjs';

const online = process.argv.includes('--online');

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY is set; see bin-check.mjs.
if (online && process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const child = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(child.status ?? 1);
}

const categoryIds = loadCategories().map((c) => c.id);
const tenglar = readTenglar(
  parse(readFileSync(resolve(CONTENT_DIR, 'tenglar/tenglar.yaml'), 'utf8')),
  categoryIds
);

for (const level of LEVELS) {
  console.log(`\n${level}`);
  for (const t of tenglar.filter((t) => t.levels.includes(level))) {
    const where = Object.keys(t.urls).length === categoryIds.length ? 'allir flokkar' : '';
    console.log(
      `  ${t.approved ? 'samþykkt' : 'drög   '}  ${t.audience.padEnd(8)}  ${t.name}` +
        (where ? '' : `  (${Object.keys(t.urls).join(', ')})`)
    );
  }
}
const drafts = tenglar.filter((t) => !t.approved).length;
console.log(`\n${tenglar.length} links, ${drafts} not yet approved.`);

if (online) {
  let failed = 0;
  console.log('');
  for (const { url, ids } of addresses(tenglar)) {
    const { ok, status } = await checkAddress(url);
    if (!ok) failed += 1;
    console.log(`  ${ok ? 'ok ' : 'BAD'}  ${status}  ${url}  (${ids.join(', ')})`);
  }
  if (failed) {
    console.error(`\n${failed} address(es) did not answer. Fix or remove them in tenglar.yaml.`);
    process.exit(1);
  }
}
