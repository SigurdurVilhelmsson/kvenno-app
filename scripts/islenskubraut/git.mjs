/**
 * What git knows about a merge of the recordings' files, for `yfirferd-check.mjs` and `build.mjs`.
 * Every function answers `undefined` (or false, or an empty list) where git cannot say, outside a
 * repository or in a shallow clone, so a caller can do without it.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';

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

/** Whether a path in git's own directory exists (`rebase-merge` while a rebase is going). */
const gitPathExists = (root, name) => {
  const path = git(root, ['rev-parse', '--git-path', name])?.trim();
  return path ? existsSync(resolve(root, path)) : false;
};

/**
 * The two sides of the operation in hand, and the commits it started from: a merge in progress
 * (`HEAD` and `MERGE_HEAD`, from their merge bases), a cherry-pick, or a rebase while it is still
 * going (`HEAD` and the commit being replayed, from that commit's parent: git can leave
 * `REBASE_HEAD` behind after a rebase ends, so only its folder counts), a revert (`HEAD` and the
 * reverted commit's parent, from the commit itself), or else the merge commit `HEAD` is, by its
 * first two parents. `inProgress` says whether one is open, `replaying` that it is a rebase or
 * cherry-pick (which `--skip` can drop the commit of), `replayedMerge` that the commit being
 * replayed is itself a merge, whose base git took from the parent named on its command line.
 * Undefined outside all of them, or where git cannot read a commit (a shallow clone).
 */
export function mergeSides(root) {
  const head = commitOf(root, 'HEAD');
  if (!head) return undefined;
  const merging = commitOf(root, 'MERGE_HEAD');
  if (merging) {
    return {
      ours: head,
      theirs: merging,
      bases: mergeBases(root, head, merging),
      inProgress: true,
      replaying: false,
      replayedMerge: false,
    };
  }
  const rebasing = gitPathExists(root, 'rebase-merge') || gitPathExists(root, 'rebase-apply');
  for (const [name, open] of [
    ['CHERRY_PICK_HEAD', true],
    ['REBASE_HEAD', rebasing],
  ]) {
    const replayed = open ? commitOf(root, name) : undefined;
    if (!replayed) continue;
    const parent = commitOf(root, `${name}^1`);
    return {
      ours: head,
      theirs: replayed,
      bases: parent ? [parent] : [],
      inProgress: true,
      replaying: true,
      replayedMerge: Boolean(commitOf(root, `${name}^2`)),
    };
  }
  const reverted = commitOf(root, 'REVERT_HEAD');
  if (reverted) {
    const parent = commitOf(root, 'REVERT_HEAD^1');
    return parent
      ? {
          ours: head,
          theirs: parent,
          bases: [reverted],
          inProgress: true,
          replaying: false,
          replayedMerge: Boolean(commitOf(root, 'REVERT_HEAD^2')),
        }
      : undefined;
  }
  const [ours, theirs] = [commitOf(root, 'HEAD^1'), commitOf(root, 'HEAD^2')];
  return ours && theirs
    ? {
        ours,
        theirs,
        bases: mergeBases(root, ours, theirs),
        inProgress: false,
        replaying: false,
        replayedMerge: false,
      }
    : undefined;
}

/** Whether this is a shallow clone, whose history stops short. */
export const isShallow = (root) =>
  git(root, ['rev-parse', '--is-shallow-repository'])?.trim() === 'true';

/** The files under `dir` that one commit adds. */
export const addedBy = (root, commit, dir) =>
  (
    git(root, [
      'show',
      '-m',
      '--diff-filter=A',
      '--name-only',
      '--format=',
      commit,
      '--',
      relative(root, dir),
    ]) ?? ''
  )
    .split('\n')
    .filter(Boolean);

/**
 * Whether a recordings file with conflict markers (`marked`, the pattern) can be merged again from
 * git: git's index holds it unmerged, or a merge, cherry-pick, rebase or revert is open, or `HEAD`
 * is the merge commit that committed the markers (its parents' versions have none). Not where the
 * commit being replayed is itself a merge, whose base git took from its command line (there
 * `git checkout -m` brings the conflict back into the index first), nor where a side already holds
 * markers, committed by an earlier step of a rebase.
 */
export function canMergeAgain(root, file, sides, marked) {
  const holds = (rev) => marked.test(fileAt(root, rev, file) ?? '');
  // Not from a side that holds markers already, committed by an earlier step of a rebase.
  if (unmerged(root, file)) return !holds(':2') && !holds(':3');
  if (!sides || sides.replayedMerge) return false;
  if (holds(sides.ours) || holds(sides.theirs)) return false;
  return sides.inProgress || holds('HEAD');
}

/**
 * Every file under `dir` that a commit in `HEAD`'s history added, with that commit (the latest,
 * where several did). `--full-history` reaches a branch a merge discarded (`-s ours`) as well, and
 * `-m` a file a merge commit itself added. In a shallow clone it sees only the history there is,
 * whose oldest commit adds every file it holds: a file it names that is missing was really taken
 * out, but one taken out before that commit cannot be seen (`isShallow`).
 */
export function addedInHistory(root, dir) {
  const out = git(root, [
    'log',
    '--full-history',
    '-m',
    '--diff-filter=A',
    '--name-only',
    '--format=%x00%H',
    '--',
    relative(root, dir),
  ]);
  const added = new Map();
  let commit;
  for (const line of (out ?? '').split('\n')) {
    if (line.startsWith('\0')) commit = line.slice(1);
    else if (line.trim() !== '' && !added.has(line)) added.set(line, commit);
  }
  return added;
}
