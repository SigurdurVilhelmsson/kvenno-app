/**
 * What git knows about a merge of the recordings' files, for `yfirferd-check.mjs` and `build.mjs`.
 * Every function answers `undefined` (or false, or an empty list) where git cannot say, outside a
 * repository or in a shallow clone, so a caller can do without it.
 */
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';

export function git(root, args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 1 << 30,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return undefined;
  }
}

/** The commit a name stands for (`HEAD`, `MERGE_HEAD`, `HEAD^2`), if there is one. */
export const commitOf = (root, rev) =>
  git(root, ['rev-parse', '-q', '--verify', `${rev}^{commit}`])?.trim() || undefined;

/** A file as a commit holds it, or undefined where the commit does not hold it. */
export const fileAt = (root, rev, file) => git(root, ['show', `${rev}:${relative(root, file)}`]);

/** Whether git's index still holds a file unmerged, whatever is in the working file now. */
export const unmerged = (root, file) =>
  (git(root, ['ls-files', '-u', '--', relative(root, file)]) ?? '').trim() !== '';

/** Every merge base of two commits: more than one in a criss-cross history. */
export const mergeBases = (root, a, b) =>
  (git(root, ['merge-base', '--all', a, b]) ?? '').split('\n').filter(Boolean);

/**
 * The two sides of the merge in hand: one in progress (`HEAD` and `MERGE_HEAD`), or else the merge
 * commit `HEAD` is, by its first two parents. Undefined outside a merge, or where git cannot read
 * a parent (a shallow clone).
 */
export function mergeSides(root) {
  const merging = commitOf(root, 'MERGE_HEAD');
  const [ours, theirs] = merging
    ? [commitOf(root, 'HEAD'), merging]
    : [commitOf(root, 'HEAD^1'), commitOf(root, 'HEAD^2')];
  return ours && theirs ? { ours, theirs, inProgress: Boolean(merging) } : undefined;
}
