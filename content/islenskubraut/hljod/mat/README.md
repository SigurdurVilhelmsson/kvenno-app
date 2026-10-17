# Matið — the record of every verdict

Every verdict teachers have given on a recording, as `pnpm islenskubraut:yfirferd --apply` added
them: one file per run that added anything, named by when it was written and a hash of what it
holds. **Never edit or delete a file here.** A file is never changed once written, so two branches
only ever add files with different names, and git never has two versions of one to merge: a merge,
rebase or cherry-pick cannot lose a teacher's verdict, whatever side of another file is taken.

The record is all the files together: per recording, reviewer and audio, the latest verdict
counts, and a ruling (`--urskurdur`, `--afturkalla`) counts from the latest file that gives one.
`scripts/islenskubraut/mat.mjs` reads them and `foldRecord` in `yfirferd.mjs` joins them.
Workflow: `../README.md`.
