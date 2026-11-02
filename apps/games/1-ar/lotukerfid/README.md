# Lotukerfið

Chain position 2 of 10 in Year 1, between Einingagreining and Nafnakerfið. The game teaches how to
read the periodic table: finding an element by name or by position, telling metals from non-metals,
the main groups and the three periodic trends, and counting the protons, neutrons and electrons of
an atom.

## Structure

Three levels, none gated; any can be opened from the menu. Each opens with a teaching screen and
then plays a fixed number of generated questions.

| Stig | Menu name                                    | What it asks                                                                                                                                                                |
| ---- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `Stig 1: Þekkja frumefni`                    | 10 questions from all 42 elements: 4 find-by-name and 3 find-by-position (tap the cell), 3 name-by-symbol (four options)                                                    |
| 2    | `Stig 2: Flokkar og lotubundnir eiginleikar` | 10 multiple-choice: 4 classify (`málmur` / `málmleysingi` / `hálfmálmur`), 2 order three elements by `meðalatómmassi`, 2 group properties (of 4), 2 periodic trends (of 12) |
| 3    | `Stig 3: Atómbygging`                        | 8 questions from the 36 elements of periods 1–4: 2 each of protons, electrons, neutrons (typed) and identify-by-particles (tap the cell)                                    |

The two trend questions in a Stig 2 run come from different trend types (`atómradíus`,
`jónunarorka`, `rafneikvæðni`), and the two group questions are drawn without repeating.

Every question is answered once; a wrong answer shows the right one with the feedback. Stig 3's
typed counts are `type="number"` read through `parseStudentNumber` and must equal the key exactly —
the field is on the count allow-list in `packages/shared/utils/__tests__/decimal-input.test.ts`.
There is no running score: the header shows the question number, and each level ends
`Þú svaraðir N af M rétt` with `Reyna aftur` (a fresh draw) and `Ljúka stigi`. `Ljúka stigi` marks
the level done at any score, and the menu shows a ✓ beside each level done. Progress is saved under
`lotukerfidProgress`.

The tables are drawn by `components/PeriodicTable.tsx`, one shared 18-column table: Stig 1 and Stig
3's identify-by-particles take the answer as a tap on it, and Stig 2 shows it as a non-interactive
locator under each question. Below `md` it scrolls sideways inside its own box.

## What matters before touching it

**Neutrons are counted from a named nuclide, never from the rounded mass.**

- **Fixed by Phase 1 (2026-08-18):** Stig 3 taught `round(atomicMass) − Z` as the method, which
  is false wherever the rounded average names a nuclide that is not the most abundant one. Every
  element in `data/elements.ts` now carries a `massNumber` (NIST, cross-checked against CIAAW).
  Live keys changed for Ni, Cu, Zn, Ga, Ge, Se and Br. `data-integrity.test.ts` pins all eleven
  elements where rounding is wrong (Ag, Ba, Hg and Pb too, outside the draw pool) and checks the
  other 31 against the rounded mass, so a positional slip in the data shows.
- **The question names the isotope** (`Hversu margar nifteindir hefur kopar-63 (Cu-63)?`), decided
  2026-08-18: with the rounding rule gone, the mass number had no other route onto the screen. The
  hint and the intro both say the mass number is the number in the isotope's name, not the
  `meðalatómmassi` printed on the table.

**Stig 2's table does not answer its own question (B15, 2026-08-27).** Whichever datum the question
asks about is masked until the student commits: category colours for classify and group questions,
masses for order-by-mass. The caption says which is hidden. `level2-no-answer-leak.test.tsx` guards
it.

- **Masking the masses left the order-by-mass items answerable only by the rule the intro teaches**
  (mass rises with `sætistala`), and inside the period 1–4 pool Ar/K and Co/Ni break that rule.
  `makeOrderQuestion` builds each triple so it cannot contain an inverted pair (`hasMassInversion`),
  and the intro names both exceptions. The second test in `level2-no-answer-leak.test.tsx` holds it.
- **The options do not give the answer away either** (2026-09-23): the right group-property option
  was the only one carrying a group number; the wrong orderings never led with the heaviest
  element; and a run could ask the same group question twice. `level2-options.test.ts` guards all
  three.

**Periodic trends came from the 2026-08-27 harvest.** Twelve comparisons, four per trend, are in
`data/trends.ts`; every pair shares a period or a group, since the rules the level teaches do not
settle a diagonal comparison. `trends.test.ts` derives each answer from the two elements' positions
rather than reading the stored key, refuses a diagonal pair, and pins the two corrected terms
(`atómradíus`; `virk kjarnhleðsla` as the cause, not the nuclear force). See `HARVEST.md`.

**A wrong answer gets a reason (2026-08-27).** `utils/misconceptions.ts` fills the `FeedbackPanel`
misconception slot: Stig 3 reads the number typed (mass number given for protons, protons given for
neutrons, and so on), Stig 1 reads where the wrong tap landed (same `lota`, same `flokkur`, the
neighbouring cell), and Stig 2 names the confusion each question type invites. Each returns
`undefined` when it cannot read the answer. `misconceptions.test.ts` guards it.

**Fixed 2026-09-23, each with a test:**

- Stig 3 read its field with `parseInt`, so `6.5` graded as `6` and was marked right; the templates
  also put a nominative name where the sentence needed another case, and wrote `1 róteindir`
  (`level3-answers.test.tsx`, which checks number agreement for every element in the pool).
- Names inside sentences were capitalised (`Hvar er Natríum (Na) …`). `nameInSentence` lowers them
  (`names-in-sentences.test.ts`).
- Every number on screen goes through `formatDecimal`: table cells, Stig 1's element card and Stig
  2's order explanation printed a decimal point (`decimal-comma.test.tsx`).
- Stig 3's intro put the `sætistala` at the bottom of a cell and the mass at the top, the reverse of
  the table it draws (`table-reading.test.tsx`).
- Stig 1's name-by-symbol and Stig 3's identify-by-particles did not mark the student's wrong pick
  (`answer-marking.test.tsx`).

**Terminology.** `icelandic-text.test.ts` scans the game's own source for the words found here on
2026-09-23 (a second word for proton, a coined word for the relative atomic mass, `g/mól` for a
number the textbook gives in amu, phrases that do not agree, and others), each with what to write
instead. The platform rows cover the rest: `sætistala`, `hvolf` (the old word swept here
2026-08-27), `hliðarmálmur`, `málmleysingi`, `eðalgas` (neuter: `Eðalgös` in the legend and the
intro), `nitur`, and `Tregur málmur` / `Tregir málmar` (decision 21, 2026-10-02, when the cell
abbreviation became `Tm`). The legend calls the plain non-metals `Aðrir málmleysingjar`, since Stig
2 counts halogens and noble gases as málmleysingjar too (decision 35); `table-reading.test.tsx`
checks the legend against `getClassification`.

## Layout

```
src/App.tsx                      menu, chain string, progress (key lotukerfidProgress)
src/i18n.ts                      is/en/pl strings for the menu only
src/components/Level1.tsx        Stig 1: intro, generateQuestions, hint and feedback text
src/components/Level2.tsx        Stig 2: intro, the four generators, GROUP_QUESTIONS, masking
src/components/Level3.tsx        Stig 3: intro, particle questions, typed or tapped answers
src/components/PeriodicTable.tsx the shared table, legend, sideways scroll on a phone
src/data/elements.ts             42 elements with massNumber, categories, labels, nameInSentence
src/data/trends.ts               TREND_INFO and the 12 TREND_QUESTIONS
src/utils/misconceptions.ts      the misconception text for all three levels
src/utils/tableLayout.ts         tabletBelowMd, the old below-md scroll kept for tablets
src/__tests__/                   answer-marking, data-integrity, decimal-comma, icelandic-text,
                                 level2-no-answer-leak, level2-options, level3-answers,
                                 misconceptions, names-in-sentences, phone-scroll,
                                 table-reading, trends; next-guard-clock.ts is a helper
HARVEST.md                       the 2026-08-27 periodic-trends harvest; current
```

Run the tests from the repo root: `pnpm exec vitest run apps/games/1-ar/lotukerfid`.

## Open

- **i18n.** The menu goes through `t()` with `en` and `pl` blocks; all three levels are hardcoded
  Icelandic, so a student who picks English or Polish gets the menu only. This is one of the nine
  games that keep the switcher, inside the platform-wide undecided `useGameI18n` question
  (`CLAUDE.md`, "Remaining deferred"; `docs/i18n-coverage.md`). Its Polish got its diacritics back
  on 2026-10-02 (decisions item 4), held by `no-flattened-polish.test.ts`.
- **Two August review findings with no ruling**, both in `apps/games/1-ar/CURRICULUM_REVIEW.md`:
  the 42-element table has no Sn or Xe, while `1-ar/nafnakerfid`, the next node, asks for SnO₂ and
  XeF₄ (`:221`); and the table is an answer widget or a locator, never something to explore (`:208`,
  now partly out of date, since Stig 3's identify-by-particles takes a tap).

**Closed.** The legend's plurals were built by appending to the singular and read as non-words
(fixed 2026-08-27, `docs/README.md`); the empty period-7 row was kept as a placeholder strip on a
phone (`docs/REVIEW-QUEUE.md`, vertical-scroll item 3, settled 2026-10-23); and the table's `role="grid"` with no rows became a
labelled group of buttons (2026-10-02, PR #82, checked in `table-reading.test.tsx`).

## Leftovers

Not recorded anywhere else; found while writing this file.

- **Unused exports in `data/elements.ts`:** `getElementBySymbol`, `getElementsByPeriod`,
  `getElementsByGroup` and `GROUP_NAMES` have no importer.
- **The `lanthanide` and `actinide` categories have no element**, so `Lantaníð`, `Aktiníð` and
  their colours and cell abbreviations are never drawn; the legend leaves them out. Decisions item
  21 records the labels as unused.
- **A stale comment:** `data/elements.ts` heads the list "First 36 elements (up to Kr)", but it
  holds 42, six of them from periods 5 and 6 (Ag, I, Ba, Au, Hg, Pb), which only Stig 1 draws.
- **Stig 3 has two names on screen:** the menu and the question screen say `Atómbygging`, the
  teaching screen's heading `Bygging atómsins — Kennsla`.
