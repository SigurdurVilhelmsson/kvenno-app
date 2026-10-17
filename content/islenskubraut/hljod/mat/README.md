# Matið — the record of every verdict

Every verdict teachers have given on a recording, as `pnpm islenskubraut:yfirferd --apply` added
them: one file per run that added anything, named by when it was written and a hash of what it
holds. **Never edit or delete a file here.** A file is never changed once written, so two branches
only ever add files with different names, and git never has two versions of one to merge: a merge,
rebase or cherry-pick never conflicts here, so no side of the record can be taken.

A `git revert` of a commit that added a file, a `merge -s ours` or a `git restore` can still take
one out. Every tool, the build included, then refuses to run until it is back, naming the file and
the commit that added it: `git checkout <commit> -- <file>` puts it back. A verdict applied by
mistake is not taken out that way: have it withdrawn on the page, or give a ruling.

The record is all the files together: per recording, reviewer and audio, the latest verdict
counts, and of a reviewer's rulings (`--urskurdur`, `--afturkalla`) the latest counts, each
stamped after the one before it in the record.
`scripts/islenskubraut/mat.mjs` reads them and `foldRecord` in `yfirferd.mjs` joins them.
Workflow: `../README.md`.
