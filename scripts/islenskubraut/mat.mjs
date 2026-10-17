/**
 * The record of every verdict teachers have given, as files: `content/islenskubraut/hljod/mat/`,
 * one file per `pnpm islenskubraut:yfirferd --apply` that added anything (`readRecordFile` in
 * `yfirferd.mjs`). A file is named by when it was written and a hash of what it holds, and is
 * never changed after, so two branches only ever add files with different names and git has
 * nothing to merge: no side of the record can be taken, or lost, in a merge, rebase or
 * cherry-pick. The record is all the files folded together (`foldRecord`).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { addedInHistory } from './git.mjs';
import { CONTENT_DIR } from './load.mjs';
import { prettify } from './render.mjs';
import { foldRecord, readRecordFile } from './yfirferd.mjs';

export const MAT_DIR = resolve(CONTENT_DIR, 'hljod/mat');
const ROOT = resolve(CONTENT_DIR, '../..');

/**
 * The files of the record a commit in `HEAD`'s history added and the working tree no longer has,
 * each with that commit: taken out by a revert, a `merge -s ours` or a restore, and with them the
 * verdicts they hold. Empty outside a git checkout.
 */
export function missingRecordFiles(dir = MAT_DIR) {
  return [...addedInHistory(ROOT, dir)]
    .filter(([path]) => path.endsWith('.json') && !existsSync(resolve(ROOT, path)))
    .map(([path, commit]) => ({ path, commit }));
}

/** What a person reads when files of the record are missing, and how to put them back. */
export const missingMessage = (missing) =>
  [
    `${missing.length} file(s) of the verdict record are missing, and with them the verdicts they hold (a git revert, a merge -s ours or a restore took them out):`,
    ...missing.map((m) => `  ${m.path}   (added in ${m.commit.slice(0, 10)})`),
    'Put each back as it was, then run the command again:',
    ...missing.map((m) => `  git checkout ${m.commit.slice(0, 10)} -- ${m.path}`),
  ].join('\n');

/** Every file of the record, read and checked. A file that cannot be read stops the caller,
 * naming it. */
export function loadRecordFiles(dir = MAT_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const where = `content/islenskubraut/hljod/mat/${f}`;
      let raw;
      try {
        raw = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
      } catch (e) {
        throw new Error(`${where} cannot be read: ${e.message}`);
      }
      return readRecordFile(raw, where);
    });
}

/** The record: `{ rulers, verdicts }` (`foldRecord`). */
export const loadRecord = (dir = MAT_DIR) => foldRecord(loadRecordFiles(dir));

/** The next file of the record, for what a run added: its name and its text, through Prettier as
 * the commit hook would write it. Named by `now` and a hash of the text, so two machines never
 * write two files of one name. */
export async function recordFile(added, now, dir = MAT_DIR) {
  const text = await prettify(JSON.stringify(added, null, 2), resolve(dir, 'x.json'));
  const hash = createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 8);
  const stamp = now.replace(/[-:]/g, '').replace(/\.\d+/, '').replace('T', '-');
  return { file: resolve(dir, `${stamp}-${hash}.json`), text };
}

export function writeRecordFile({ file, text }, dir = MAT_DIR) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, text);
}
