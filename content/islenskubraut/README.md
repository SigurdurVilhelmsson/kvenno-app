# Íslenskubraut content

These six YAML files are the **source of truth** for everything a student reads in
Íslenskubraut — the category grid, the teaching cards, and the generated PDF.

## Editing directly

Edit the YAML, then run:

    pnpm islenskubraut:build

That regenerates `apps/islenskubraut/src/data/categories/*.ts` and
`server/src/lib/islenskubraut-data.ts`. **Never edit those files** — they are output, and CI
fails if they do not match the YAML.

Adding a whole new category needs two more edits: `CATEGORY_ORDER` in
`scripts/islenskubraut/load.mjs` (the taught order, deliberately not alphabetical) and
`apps/islenskubraut/src/data/index.ts`. Omitting either is caught by the test suite, but as a
deep-equality failure that does not say "you forgot to register the new category".

## Editing by spreadsheet

For a reviewer who does not use git:

    pnpm islenskubraut:export                    # islenskubraut-yfirlestur-<date>.xlsx
    pnpm islenskubraut:import <file> --dry-run   # preview the diff, write nothing
    pnpm islenskubraut:import <file>             # apply
    pnpm islenskubraut:build

> **Not ready to send to anyone yet.** Every Icelandic string the reviewer reads in that
> workbook — the instructions, the column headers, the column notes and the Leiðbeiningar tab —
> is placeholder wording that has not been reviewed. It is marked `PLACEHOLDER ICELANDIC` in
> `scripts/islenskubraut/export-xlsx.mjs`. Nobody has opened an exported workbook in Excel yet
> either, so the row-editing steps below are described from the code, not from having done them.

The workbook opens on a Leiðbeiningar tab and has one sheet per category. In a sheet: change
only the shaded columns. Copy a row to add an option, delete a row to remove one, drag a row to
reorder. Import replaces each group wholesale in sheet order, which is what makes all three of
those free.

The `lykill` column is unlocked but should not be edited. It is unlocked only so that a
reviewer who adds a row by inserting a blank one can copy the key down into it — a row with
text and no key is refused, and without that column being editable there would be no way to fix
it in the sheet.

### What import repairs, and what it refuses

Repairs and names: soft hyphens and zero-width characters are stripped, and each one is
reported with its codepoint and the string it came from. That is the character class behind the
corruption described below, so it is never silent.

Repairs without saying so: Unicode normalised to NFC, non-breaking spaces turned into ordinary
ones, whitespace runs collapsed, ends trimmed. These change how a string is stored but not what
it says, and reporting them would bury the stripped characters above in noise.

Refuses the whole run, writing nothing:

- a workbook exported before a later repo edit (re-export rather than passing `--force`, unless
  you know the repo-side change is the one to discard)
- a cell Excel converted to a date, formula, error or boolean — `.text` renders those as
  something plausible that is not what anyone typed
- a row carrying text with no `lykill`
- a `lykill` that does not name a real place in the content, or a group emptied entirely

Notes left in the `athugasemd` column are written to `_athugasemdir-YYYY-MM.md`, for the pull
request rather than into the content. A second import in the same month overwrites that file.

## Why this exists

Until August 2026 the content lived in TypeScript object literals, duplicated by hand between
the SPA and the server. The server copy drifted and shipped corrupted Icelandic onto the PDFs
students were handed — `Orðaforði` rendered as `Orda<soft hyphen>fordi`, `Þessi` as `Þssi`, and
`rannsóka` and `Undirbuníngur`, neither of which is a word. It went unnoticed for months
because nobody could read the content in that form.
