# Íslenskubraut content authoring — design

**Date:** 2026-08-17
**Status:** partly implemented — Tasks 1-4 shipped 2026-08-18 (YAML is the source of truth and
both consumers are generated from it). Tasks 5 and 6 shipped 2026-08-18, so both
`pnpm islenskubraut:export` and `pnpm islenskubraut:import` exist. Only
`content/islenskubraut/README.md` (Task 7) is still unwritten. See the plan for task-by-task status,
including where the shipped code deliberately departs from it.
**Author:** Claude, with Sigurður Vilhelmsson

## Why

Íslenskubraut teaches Icelandic to students who do not speak it. The accuracy of every
student-visible string therefore matters more than in the chemistry games, where a clumsy
sentence is a blemish rather than the lesson itself. **1,737 student-visible Icelandic strings**
ship today across six categories, roughly 1,100 of them answer options. None has been reviewed
by a second Icelandic speaker.

That review has not happened because the content is not reviewable. It lives in nested TypeScript
object literals — `manneskja.ts` is 289 lines of quoting and bracket noise, with one question's
three level-tiers spread across twenty lines. That is a format for a compiler, not for a language
teacher judging whether a phrase is idiomatic.

The cost of the current form is already measurable. In August 2026 a review found:

- The server copy of the data had lost its Icelandic characters wholesale, rendered `Þessi` as
  `Þssi`, and taught `rannsóka` and `Undirbuníngur` — neither of which is a word. It is the copy
  that prints on the PDF a student is handed.
- The client copy shipped `stuttt` at 14 sites.
- `Til hvers er hún/hann þekktur?` asked _to what end is she/he known_, using a construction that
  belongs to objects, with a masculine adjective against a `hún/hann` subject.
- Two questions in the person category (`Hvaða lögun hefur það?`, `Hver notar þetta?`) are object
  questions pasted in, using neuter pronouns for a person.

The corruption has been fixed and guarded. This design addresses the reason it went unnoticed for
months: nobody could read the content.

## Goals

1. A qualified human can review every student-visible string without reading code.
2. Reviewers who do not use git — Icelandic and language colleagues — can participate.
3. Corrections return to the repository with full git history.
4. The client and server copies cannot diverge again.
5. Siggi can still edit content directly, in a text editor, without a spreadsheet round-trip.

## Non-goals

- A web-based CMS or admin UI.
- Multi-language content. Íslenskubraut is Icelandic; the level axis is A1/A2/B1, not locale.
- Changing what the SPA or the PDF renders. This is an authoring change, not a product change.
- Reviewing the chemistry games' content. Different corpus, different authority.

## Decisions taken

| Question             | Decision                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| Source of truth      | The repository. The spreadsheet is a review artifact that imports back. |
| Canonical format     | YAML, one file per category                                             |
| Reviewer format      | Excel `.xlsx`, one sheet per category                                   |
| Reviewer permissions | Correct text, add items, remove items, reorder                          |
| Generated consumers  | Both the SPA modules and the server module                              |

Excel was chosen over Google Sheets because Kvennaskólinn is a Microsoft 365 school (see
`docs/azure-ad-setup.md`), so it requires no new accounts and the content never leaves the school's
estate. It was chosen over CSV because `.xlsx` is XML and UTF-8 natively — there is no encoding to
mangle on save — and because it supports cell comments, shading and sheet protection.

## Architecture

```
content/islenskubraut/          canonical, hand-editable, git-diffable
  dyr.yaml  matur.yaml  farartaeki.yaml
  manneskja.yaml  stadir.yaml  klaednadur.yaml
  README.md                     how to edit, written for a human

apps/islenskubraut/src/data/
  categories/*.ts               GENERATED — never hand-edited
  index.ts, types.ts            hand-written, unchanged

server/src/lib/
  islenskubraut-data.ts         GENERATED — never hand-edited
```

```
                    ┌─→ apps/…/categories/*.ts  →  SPA
content/*.yaml ─────┤
      ▲             └─→ server/…/islenskubraut-data.ts  →  PDF
      │
      └── import ←── review.xlsx ←── export ──┘
```

Generated `.ts` files are committed rather than built on the fly, so CI, the server build and
`pnpm dev` need no build-step changes. The cost is committed artifacts that must never be
hand-edited; `--check` in CI enforces that.

Generating both consumers from one source retires the drift class structurally. The existing
`server-copy-in-sync` test becomes a backstop rather than the only defence.

### Commands

| Command                            | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| `pnpm islenskubraut:build`         | YAML → both TS modules. `--check` exits 1 if stale. |
| `pnpm islenskubraut:export`        | → `.xlsx` for review                                |
| `pnpm islenskubraut:import <file>` | `.xlsx` → YAML. `--dry-run` to preview.             |

### Dependencies

`yaml@2` (already present transitively; to be declared) and `exceljs` (reads and writes, supports
comments, shading and protection). Both `devDependencies` — neither reaches the browser or the
server bundle.

### YAML shape

```yaml
# ... generated instruction header ...
id: manneskja
name: Manneskja
icon: 🧑
description: Orðaforði um fólk — útlit, starf og athafnir
color: '#7B2CBF'

subCategories:
  - id: s1
    name: Aldur
    options: [barn, unglingur, fullorðinn, aldraður/öldruð]

sentenceFrames:
  - id: f1
    level: A1
    frames:
      - Þetta er ___.

guidingQuestions:
  - id: q4
    question: Fyrir hvað er manneskjan þekkt?
    icon: 🎯
    answers:
      A1: [til að vinna, til að læra, til að leika sér]
      A2: [...]
      B1: [...]
```

**The YAML shape is not the TypeScript shape, deliberately.** `answers` is a level-keyed map here
because that is how a human reads it; the `Category` interface in
`apps/islenskubraut/src/data/types.ts` requires `answers: { level, options }[]`. The generator
translates between them. **The TypeScript contract is unchanged** — no component, and no server
code, is touched by this work.

The `id` fields on sub-categories, sentence frames and questions are new. They exist so the
spreadsheet can address a node stably across reorderings, and are assigned once during migration.
They are never shown to a student.

YAML takes comments and needs no escaping. Escaping is the mechanism that produced `Orda<AD>fordi`
and `Þssi`, so removing it from the authoring path is a correctness measure, not a convenience.

### The `lykill` scheme

| Node                 | Key                     | Editable cell                           |
| -------------------- | ----------------------- | --------------------------------------- |
| Category description | `manneskja.description` | the description                         |
| Sub-category name    | `manneskja.s1.name`     | the name                                |
| Sub-category options | `manneskja.s1.options`  | one row per option, replaced as a group |
| Sentence frames      | `manneskja.f1`          | one row per frame, replaced as a group  |
| Question text        | `manneskja.q4`          | the question                            |
| Answer options       | `manneskja.q4.A1`       | one row per option, replaced as a group |

Every key is `<category>.<node-id>` optionally suffixed by a level or field name. Any row whose key
groups a list is replaced wholesale in sheet order; any row whose key addresses a single string is a
keyed update.

## The spreadsheet

### Sheet layout

Rows 1–3 carry instructions, row 4 is the header, and **freeze panes sit below row 4** so both stay
pinned while the reviewer scrolls. The parser locates the header row by finding `lykill` rather than
assuming an offset, so the instruction block can grow without breaking import.

| lykill 🔒         | gerð 🔒  | stig 🔒 | samhengi 🔒                       | **íslenska** ✏️                 | **athugasemd** ✏️  |
| ----------------- | -------- | ------- | --------------------------------- | ------------------------------- | ------------------ |
| `manneskja.q4`    | Spurning | —       | —                                 | Fyrir hvað er manneskjan þekkt? |                    |
| `manneskja.q4.A1` | Svar     | A1      | _Fyrir hvað er manneskjan þekkt?_ | til að vinna                    |                    |
| `manneskja.q4.A1` | Svar     | A1      | _Fyrir hvað er manneskjan þekkt?_ | til að læra                     | vantar "að kenna"? |

Locked columns are protected without a password — a guardrail against accidents, not security.
Editable columns are shaded, so "change only the yellow columns" needs no reading.

**The group key repeats on every row.** Excel users sort columns; a layout relying on blank
continuation cells breaks the moment someone does. Repeating the key makes sorting harmless.
`samhengi` repeats the parent question so a reviewer judging an option can see what it answers —
precisely the context that reading the TypeScript does not give.

A separate **Leiðbeiningar** tab carries the longer explanation, and each column header carries a
cell comment explaining that column.

### Import semantics

- **Question, sentence-frame and sub-category rows** — keyed update of one string by `lykill`.
- **Answer rows** — grouped by `lykill` (which encodes question and level) and **replaced wholesale
  in sheet order**.

Wholesale replacement is what makes add, remove and reorder free. To add a word the reviewer copies
the row above and types over `íslenska`; the copy carries the correct key, and copying a row is the
natural Excel gesture. To remove one, delete the row. To reorder, drag it. No action column, no
per-string ids, nothing for a reviewer to get wrong.

A blanked `íslenska` is treated as a deletion but always surfaced in the dry-run, since it is more
often a slip than an intent.

### Paste hygiene

Reviewers paste from Word, email and existing worksheets, which drags in soft hyphens, non-breaking
spaces and smart quotes — the exact character class behind the August corruption. Import therefore
normalises and validates before writing:

- **NFC-normalise.** `á` may arrive as one codepoint or as `a` plus a combining acute. The two
  render identically and compare unequal. Round-tripping through Excel and macOS makes this
  routine, not hypothetical.
- **Strip** soft hyphens, zero-width characters and non-breaking spaces; collapse and trim
  whitespace.
- **Reject** strings that have lost their Icelandic characters, reusing the check already guarding
  the shipped data.
- **Reject** an empty group — a question with no options at some level.

### Staleness

Export writes a metadata sheet carrying schema version, git SHA, timestamp and a content hash per
category. On import, any category whose YAML changed since export is **refused by default**, naming
which ones, so a workbook that sat in an inbox for three weeks cannot silently revert later edits.
`--force` overrides per category.

### Safety

`--dry-run` prints a per-category diff — added, removed, changed, with before → after. Import prints
that summary even without the flag. Because import writes YAML, `git diff` is the second net and the
pull request is the third.

### Reviewer notes

The `athugasemd` column is the reviewer's voice and must not be swallowed. Import writes notes to
`content/islenskubraut/_athugasemdir-YYYY-MM.md`, keyed by `lykill` and quoting the string they
refer to, so every suggestion appears in the pull request rather than being buried in a spreadsheet
in someone's Downloads folder.

## Instructions in both places

The spreadsheet carries them in frozen rows 1–3 plus a Leiðbeiningar tab and per-column cell
comments. Each YAML file carries a `#` header block, re-emitted by the generator on every run,
stating what the file is, that it is hand-edited, and which command to run afterwards.

**Known limit:** the standard header block is always re-emitted, but ad-hoc comments a teacher adds
beside an option list will not survive an Excel import, because import replaces those lists
wholesale. Comments on structural nodes are safe. This is stated rather than worked around, because
preservation across wholesale replacement cannot be made reliable.

## Validation and testing

| Guard                                  | Catches                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| Round-trip test                        | YAML → TS compared against today's committed TS; proves the migration lossless |
| `islenskubraut:build --check` in CI    | A hand-edited generated file                                                   |
| `server-copy-in-sync` test, retargeted | Divergence between the two generated consumers                                 |
| Schema validation on import            | Missing level tier, unknown `lykill`, empty group                              |
| Unicode checks                         | Non-NFC forms, invisible characters, ASCII-flattened Icelandic                 |

## Rollout

1. **Migrate.** Convert the existing TypeScript to YAML mechanically, so none of the 1,737 strings
   is retyped. Prove it by generating TS back from the YAML and asserting byte-identity with what is
   committed today. Nothing is deleted until that passes.
2. **Retarget.** Point both generators at the YAML; delete the Vite-based generator, which no longer
   needs to load a TypeScript module.
3. **Export** the first workbook. This is the artifact for the human review that motivated the work.
4. **Review**, then import with `--dry-run`, inspect the diff, and commit as its own pull request so
   content changes are reviewable separately from the machinery.

## Open items for Siggi

1. **All Icelandic reviewer-facing text is placeholder.** The instruction blocks, column headers and
   the Leiðbeiningar tab were drafted by Claude and must be written or corrected by Siggi. Teacher-
   facing Icelandic in a language-teaching tool is the wrong place for inferred wording — see the
   `þekktur` error of 2026-08-17, where in-repo precedent was mistaken for evidence.
2. **`manneskja.ts` content questions**, outstanding from the corruption fix and not addressed here:
   - `:109` `Hvernig lítur hún/hann út?` and `:251` `Hvenær er hún/hann virk/virkur?` — keep the
     `hún/hann` framing, or move to _manneskjan_ and drop the masculine forms?
   - `:143` `Hvaða lögun hefur það?` and `:200` `Hver notar þetta?` — stray object questions in the
     person category. Delete or replace?
   - Whether the other five categories carry the reverse mistake.
3. **Pair ordering** in gendered adjective pairs is inconsistent: feminine-first in `há/hár`,
   `lág/lágur`, `gömul/gamall`; masculine-first in `aldraður/öldruð` and `gamall/gömul`. The same
   lemma appears both ways. Worth normalising during the review pass.
