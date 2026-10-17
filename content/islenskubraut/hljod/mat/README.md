# Matið — the record of every verdict

Every verdict teachers have given on a recording, as `pnpm islenskubraut:yfirferd --apply` added
them: one file per run that added anything, named by when it was written and a hash of what it
holds. **Never edit or delete a file here.** A file is never changed once written, so two branches
only ever add files with different names, and git never has two versions of one to merge: a merge,
rebase or cherry-pick never conflicts here, so no side of the record can be taken.

A `git revert` of a commit that added a file, a `merge -s ours` or a `git restore` can still take
one out. Every tool, the build included, then refuses to run until it is back, naming the file and
the commit that added it (a merge commit too): `git checkout <commit> -- <file>` puts it back. A
verdict applied by mistake is not taken out that way: have it withdrawn on the page, or give a
ruling.

Two things the tools cannot see. **A commit dropped from history** (`git rebase --skip`, a `drop`
in `git rebase -i`, `git reset`) takes its files with it and leaves nothing to say they were there,
so never skip a commit that adds one; the tools warn when a rebase or cherry-pick stops on one. And
in a shallow clone, a file taken out before its oldest commit; CI checks with the whole history.
Files are only added in a commit of their own: `--apply` refuses to add one while a merge, rebase,
cherry-pick or revert is open.

The record is all the files together: per recording, reviewer and audio, the latest verdict
counts, and of a reviewer's rulings (`--urskurdur`, `--afturkalla`) the latest counts. A ruling is
refused on a machine whose clock is not past the latest one for that reviewer, so each is later
than the one before it on every machine.
`scripts/islenskubraut/mat.mjs` reads them and `foldRecord` in `yfirferd.mjs` joins them.
Workflow: `../README.md`.
