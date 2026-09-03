# Chemistry games roadmap — from here to "sound, accurate, complete"

**Date:** 2026-08-16 · **Status block updated:** 2026-08-27
**Goal, verbatim:** "a pedagogically sound games library, accurate and error free, covering the curriculum of my students"
**Base:** kvenno-app. The old repo `namsbokasafn-leikir` is a quarry, frozen at `379266e`. No new work happens there.
**Evidence:** `docs/README.md` indexes the three review documents every claim below is drawn from.

---

## STATUS — read this first

The phase bodies below are the plan as written on 2026-08-16 and are left intact, so the reasoning
behind each ordering stays legible. This block is what has actually happened since. Where the two
disagree, this block is current.

| Phase                                    | Status                              | Landed                                                                                                                       |
| ---------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1 — Stop teaching wrong chemistry        | **Done** 2026-08-18                 | PR #23, `fix/phase-1-correctness`. All four tasks; see the sub-plan's own STATUS header                                      |
| 1b — the three Tier-0 items with victims | **Done** 2026-08-18                 | PR #24, `fix/phase-1b-correctness`. B3, B6, B8                                                                               |
| 2 — Make terminology govern              | **Done** 2026-08-26                 | All six ruled terms applied, plus a test that fails if any returns — `packages/shared/i18n/__tests__/governed-terms.test.ts` |
| 3 — Harvest the cheap content            | **Done** 2026-08-27                 | PR #34, `claude/phase-3-continuation-1f7fn2`. All four rows; two of the four premises were wrong — see below                 |
| 4 — Close the pedagogy gaps              | **Unblocked parts done** 2026-08-27 | PR #36, `claude/dev-plan-remaining-b4foz1`. Everything except level gating, which is still a decision — see below            |
| 5 — Fill the curriculum holes            | Not started, but see below          | —                                                                                                                            |

### Phase 4, as it actually turned out (2026-08-27)

Four of the five items in the Phase 4 body below are done. The fifth, **level gating, is still
blocked on you** and is untouched — the dead strings for 15 games are still dead, still under two
different key names. Nothing here decided it either way.

| Item                    | Done                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FeedbackPanel.tsx:104` | Opens expanded, with a `defaultExpanded` config flag for a call site that has the same text visible elsewhere. 26 call sites, all three years                      |
| The four answer leaks   | B14, B15, B16, B17 all closed, each with a test that plays the real level and asserts on what reaches the screen                                                   |
| The decimal comma       | All 27 `type="number"` inputs across three years audited, not the two the Year-1 review named. 13 converted; the parser is now `@shared/utils`                     |
| Misconception slots     | The two games the review names as genuinely bare — Lotukerfið and Stilla efnajöfnur — now diagnose the student's actual answer rather than restating the right one |
| **Levels gated?**       | **Untouched. Still yours.**                                                                                                                                        |

**Three live defects were found while doing this, none of them in the reviews' lists.** They matter
because `docs/README.md` was carrying "No known live defects" at the time:

1. **B5's `Fosfór` correction was only half-applied.** It landed in `nafnakerfid/src/data/compounds.ts`
   and `naming.ts`, but Levels 1 and 2 hardcode their own worked examples and both still taught and
   **graded** `Fosforpentaklóríð`. A student writing the corrected name in Level 2 was marked wrong.
   The B5 test only ever read the data file. It now checks every formula the components hardcode
   against the canonical data.
2. **`dimensional-analysis` L3-10 marked two paths efficient** when one is a single-step direct
   conversion and the other a two-step chain, so the level gave full efficiency credit for the chain
   it exists to talk a student out of — against a prompt asking for the _most_ efficient route. Its
   sibling L3-3 already used the other convention.
3. **Lotukerfið's table legend built plurals by appending "ar" to the singular**, so six of its eight
   chips read `Alkalímálmurar` and the like. `málmur` pluralises to `málmar`.

**And one design tension the masking work surfaced.** Hiding the atomic masses on Lotukerfið L2's
reference table makes the order-by-mass items answerable only by the rule the level teaches — that
mass rises with sætistala — and **inside its own draw pool Ar/K and Co/Ni contradict that rule**.
While the masses were printed on the cells those items were answerable by reading; masked, they
would not be. The generator now builds each triple one element at a time and never takes a candidate
that would invert against one already chosen, and the teaching text names the exception and says why
the table is ordered by sætistala rather than mass. This is the general shape of the answer-leak
work: removing the leak often removes the student's only route to the answer, and the route has to
be put back deliberately.

---

### Phase 3, as it actually turned out (2026-08-27)

All four rows landed, each with a `HARVEST.md` beside the game it touched. **Two of the four
premises in the Phase 3 table below were false, and one row's real content was not what the row
described.** They are left as written; this is the correction.

| Row                                                | What the table said                                                    | What was true                                                                                                                                                                                                                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 25 scenarios → `dimensional-analysis`              | Correct                                                                | Landed. The data itself had never been verified: three unwritable significant-figure counts, one ungradeable key, and Icelandic that is not Icelandic                                                                                                                   |
| `avogadro.ts` + `conversionChains.ts` → `molmassi` | "g↔mol, mol↔particles, mol↔L were specified and built and lost"        | g↔mol and mol↔particles already shipped. **mol↔L is in neither harvested file** — a real **Year-1** gap (this row first filed it under the gas laws; Siggi corrected that 2026-08-27), now taught in `molmassi`. `conversionChains.ts` is superseded by `einingakedjan` |
| `trends.ts` → `lotukerfid`                         | Correct                                                                | Landed as a fourth question type in Level 2. All twelve keys check out; the Icelandic did not                                                                                                                                                                           |
| `saturation.ts` → `lausnir`                        | "Real sourced curves in place of the shipped game's hand-typed arrays" | **The shipped arrays are those curves, digit for digit**, plus two gases the old file never had. Nothing to swap. What was missing was the cooling direction, which no scenario ever asked                                                                              |

**The harvest was worth doing anyway, and not for the reason the plan gave.** Checking old data
against the shipped graders is what found the defects; four of them are in code that shipped, not in
anything harvested. They are listed in `docs/README.md`.

**Three terminology questions the harvest raised were put to Siggi and ruled on 2026-08-27:**
`atómradíus` (corpus 23 vs 0), `leysni` (260 vs 0) and `hvolf` (133 vs 7). All three are now rows in
the `CLAUDE.md` table and enforced by `packages/shared/i18n/__tests__/governed-terms.test.ts`. The
first two were applied with the harvest; `hvolf` was swept afterwards across 43 occurrences in five
games, and is the ruling this repo's standing warning was written about — `skel` is feminine and
`hvolf` is neuter, so almost none of the 43 was a string swap.

**Tier-0 correctness: none of the nine remain open.** Phase 1 closed B1 and B2; Phase 1b closed
B3, B6 and B8; B4 and B13 were closed on 2026-08-26 (PR #30); **B5 and B12 were closed on
2026-08-26**, which empties the list. The Phase 1 deferred list further down still enumerates seven
because it is the 08-16 text; all seven are struck through there now.

Each of the nine now carries a test that fails if the defect returns. Two were added with B5 and
B12: `1-ar/jafna-jofnur/src/__tests__/balance-checker.test.ts` (the game's **first** tests — it had
none, which is how B12 survived four review iterations) and the two `compound-names.test.ts` files
under `1-ar/nafnakerfid` and `1-ar/molmassi`.

**A larger defect was measured while fixing B5, and closed the same day.** Nafnakerfið's Level 3
asks the student to assemble a compound name from clickable parts, and **33 of the 51 compounds in
its pool could not be assembled from the parts it offered** — so they could never be graded correct,
about six unanswerable questions in a run of ten. `generateParts` improvised the parts from the
compound's element symbols: Greek prefixes 1–4 plus any prefix whose literal string appeared in the
name, the element roots from `naming.ts`, and two fixed distractors. It had no token for a Roman
numeral (`Járn(III)oxíð`), no polyatomic-ion name (`súlfat` and `nítrat` were present only as
_distractors_), no root for Mn, Cr, Pb, Hg, Sn or Co, and no elided prefix form (`dekoxíð` cannot be
reached from `deka` + `oxíð`, which concatenate to `dekaoxíð`). Measured by running the real
`generateParts` against every compound in the real pool.

The fix inverts the direction. `nafnakerfid/src/data/naming.ts` now declares the naming vocabulary
once — Greek prefixes, element roots and the separate first-element stems, the elided oxide forms,
polyatomic ions, Roman numerals — and `segmentName` decomposes any name back into it, so the parts
come from the name itself and the target is always reachable. Distractors are drawn from the same
vocabulary, same-kind first, scaling with the compound's difficulty; `nafnakerfid/src/utils/
nameParts.ts` holds the tray and pool logic, out of the component. Fe₃O₄ rejoined the pool once
Roman numerals existed as parts, so the pool is 52 of 59 and the seven exclusions are exactly the
trivial names and the bare elements.

The design question this raised — how fine the parts should be — was answered by the decomposition
rather than by taste: a part is a morpheme the naming rules name, so `járn | (III) | oxíð` and not
syllables. Three tests hold it, all verified to fail against the old builder, the last by rendering
the real component and playing five full runs to a perfect score.

**Off-plan work that landed anyway.** `1-ar/einingakedjan` (Einingakeðjan) shipped 2026-08-26 as
Year-1 chain position 8 — PR #27. It builds the **mass→mole→mass bridge** that Phase 5 lists under
"Also unplaced", using molar mass, Avogadro, molarity, density and mole ratios from a balanced
equation. It did not come out of this roadmap; it is recorded here so the plan and the library
agree. It does not close any Tier-0 item, and it deliberately avoids inheriting B9 and B13 rather
than fixing them in the older game — see `apps/games/1-ar/einingakedjan/README.md`.

---

## Why this order

Your goal has three words in it and they are not equally urgent.

**Accurate and error free** comes first because it is the only part with a victim. Seven shipped games teach chemistry that is wrong — not thin, not unpolished, wrong: `lotukerfid`, `dimensional-analysis`, `lausnir`, `molmassi`, `nafnakerfid` and `takmarkandi` (six of the seven Year-1 games — every one except `jafna-jofnur`, whose defect is a grading defect), plus `3-ar/ph-titration`. Treat seven as a floor, not a ceiling: it is what the Year-1 curriculum review found plus the one Year-3 defect it noticed in passing, and no equivalent Y2/Y3 review exists. Every week they stay up is a week of students learning it. Nothing else on this list has that property — which is exactly why it has to be said plainly that Phase 1 below reaches only three of these seven games: `ph-titration`, `lotukerfid` and `dimensional-analysis`. The wrong chemistry in `lausnir`, `molmassi`, `nafnakerfid` and `takmarkandi` is not scheduled as a fix in any phase. Those defects are named in the deferred note under Phase 1 so that leaving them is at least a visible choice.

**Pedagogically sound** comes second because you already wrote the test for it, in `review-prompt.md`, in November: _"A student who doesn't understand the concept should NOT be able to score well through guessing or pattern recognition."_ The repo ships seven Year-1 games and at least five of them fail it: four print the correct answer on screen before the student answers (B14–B17), and Takmarkandi is scoreable 100% without reading the question because the correct side simply alternates left/right (`takmarkandi/src/components/Level1.tsx:38-44`). Five is a floor — the four answer leaks are measured, but the wider guessing test was never scored game by game. (An earlier draft of this line said "eleven of twelve". That figure mixed two populations: its numerator counted seven Year-1 _orphans_ that live only in the frozen old repo alongside the four shipped leaks, and its denominator was the all-year orphan count, twelve. Neither number describes the shipped library. Do not reinstate it.) That is a bigger body of work than the correctness fixes and it does not have a victim this week.

**Covering the curriculum** comes last, not because it matters least, but because it is the only part that needs decisions from you before code can start, and because it is measured in months. Four gaps are real and confirmed by two independent reviews six months apart: electrolytes/precipitation, empirical formula, Ka/Kb, Ksp. This set differs from `apps/games/1-ar/CURRICULUM_REVIEW.md:96`, which is Year-1 scoped: net ionic is folded into the electrolytes row below, percent yield is tracked under "Also unplaced" at the end of Phase 5, and Ka/Kb and Ksp are Year-3 gaps the Year-1 review never looked at. The set below is the platform-wide planning set.

There is also a structural reason for the order. The Year-1 review found that **the three games with zero test files were exactly the three carrying unguarded blockers**. The suite is green and certifies nothing about chemistry. So each phase below adds the test that would have caught its own bug — otherwise Phase 5 just manufactures new Phase 1 work.

---

## The phases

| #   | Phase                                    | Blocked on a decision? | Rough size | What it buys                                                                                                                     |
| --- | ---------------------------------------- | ---------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Stop teaching wrong chemistry            | No                     | 1–2 days   | The four loudest defects close — but only 2 of the review's 9 Tier-0 correctness items; the other 7 are listed as deferred below |
| 2   | Make terminology govern                  | No                     | 1 day      | Six decided terms land; a lint stops the drift recurring                                                                         |
| 3   | Harvest the cheap content                | No                     | 2–3 days   | Real-world context, the mole chain, periodic trends — all data-file copies                                                       |
| 4   | Close the pedagogy gaps in shipped games | Partly                 | 1–2 weeks  | Your own November test starts passing                                                                                            |
| 5   | Fill the curriculum holes                | **Yes**                | Months     | The four confirmed gaps close                                                                                                    |

Phases 1–3 are fully unblocked and total roughly a week. **If you stopped after Phase 3 the library would be terminologically consistent, materially richer, and free of its four loudest defects** — but not yet accurate. _(As written 08-16 this said seven Tier-0 items would still be open — B3, B4, B5, B6, B8, B12, B13 — and that Phase 3's harvest was enrichment rather than the B3 fix. Phase 1b has since closed B3, B6 and B8 directly, so the count is now **four**: B4, B5, B12, B13.)_ None of the four has a phase at all. Closing those is what would make "accurate" true; until they are scheduled, "every remaining item is a deliberate choice rather than a debt" is a goal, not a description.

---

## Phase 1 — Stop teaching wrong chemistry

Detailed executable plan: [`2026-08-16-phase-1-correctness.md`](2026-08-16-phase-1-correctness.md)

1. **`3-ar/ph-titration` initial-pH** — four sites divide a molarity already in mol/L by 1000. 0.100 M acetic acid renders pH 4.37; the game's own data says 2.87. Every weak-acid curve starts ~1.5 units high.
2. **`1-ar/lotukerfid` neutron rule** — `round(atomicMass) − Z` taught as _the method_. Seven of the 36 elements in the draw pool mismatch (Ni, Cu, Zn, Ga, Ge, Se, Br), six of them rounding to nuclides with no natural abundance at all; the seventh, Ge-73, is a real isotope but a minor one — 7.75%, where the rule should have landed on Ge-74 at 36.5%. ~36% of playthroughs mis-grade a correct answer, ~60% show a wrong count on one of the four neutron-derived questions, and ~86% print a wrong neutron count _somewhere_ — the particle-breakdown card (`Level3.tsx:389-412`) is gated on `answered` alone with no question-type check, so it renders after all eight. (Isotope data from NIST, spot-checked against CIAAW; the percentages are hypergeometric over the 12-of-36 draw, cross-checked by Monte Carlo against the real shuffle. They supersede the ~31% recorded elsewhere, which assumed six mismatching elements rather than seven.)
3. **`1-ar/dimensional-analysis`** — speed of light 1000× out (`src/data/challenges.ts:271`, keyed `1.08e12` where `1.08e9` is correct). One key, not two: the companion claim that `:354` holds an unsatisfiable item was retired in August 2026 by executing the real `Level3` grading path, which accepts `29.25`, `29.3`, `29.2`, `29.0` and `29` — and the significant-figures check turns out to be feedback-only, never passed to the composite score. Nothing to fix at `:354`.
4. **Unshuffled option arrays** — `2-ar/rafeindabygging` Level 3 has the answer at index 0 on all eight items; five more shipped games have no shuffle. _(**Closed 2026-08-26.** rafeindabygging was fixed by Phase 1 itself on 08-18. The "five more" was a data-only count and overstated it: measured on 08-18 against each hit's render path, four of them already shuffled before rendering and were never defects — `1-ar/nafnakerfid` L1, `1-ar/lotukerfid` L2, `2-ar/hess-law` L1, `2-ar/kinetics` L1. The two that were real, `2-ar/kinetics` L3 and `2-ar/organic-nomenclature` L3, were fixed on 08-26 with a playthrough test each. Read `docs/README.md` before "fixing" a fifth.)_
5. **A `data-integrity.test.ts` per fixed game**, following `3-ar/buffer-recipe-creator/src/__tests__/data-integrity.test.ts`.

Each fix is small. The tests are the phase's real deliverable.

**What this phase does not close.** The Year-1 review's Tier-0 correctness list has nine items. This phase closes two of them — B1 (item 2 above) and B2 (item 3). The other two tasks are real but come from elsewhere: item 1 from the review's Updates section, item 4 from `docs/README.md`. So four defects close, seven Tier-0 items stay open, and none of the seven currently has a phase _(as written 2026-08-16 — three of the seven have since been fixed; see the note directly below)_:

> **Superseded, 2026-08-26.** Phase 1b closed B3, B6 and B8 on 2026-08-18 (PR #24); B4 and B13
> were closed on 2026-08-26 (PR #30); B5 and B12 were closed on 2026-08-26. All seven are struck
> through below and their descriptions are the pre-fix state, kept so the measurements stay
> readable.
> **All seven are now fixed; B5 and B12 closed 2026-08-26.**

- ~~**B3**~~ — **fixed 2026-08-18.** Lausnir's gas solubility data was 10× too high, g/L values printed under a `g/100g H2O` axis label (`lausnir/src/components/TemperatureSolubility.tsx:59,67`, label at `:220`). Correcting the data alone would have hidden the curves instead — see `docs/README.md`.
- ~~**B4**~~ — **fixed 2026-08-26.** 12 of Mólmassi's 29 compounds printed a per-element breakdown whose lines did not sum to the total printed under them, in the one game whose entire skill is summing element masses. `molarMass` was hand-written from more precise atomic masses than the table the game shows a student; it is now summed from `elements.ts`, so the two cannot disagree.
- ~~**B5**~~ — **fixed 2026-08-26.** Wrong compound names taught as fact in `nafnakerfid` and
  `molmassi`, in the one game whose entire subject is what a compound is called. P₄O₁₀ was
  `Fosfordekoxíð` (now `Tetrafosfórdekoxíð`), Co(NO₃)₂ was `Kóbolt(II)nítrat` (now `Kóbalt`),
  Fe₃O₄ was `Járnoxíð (blandað)` (now `Járn(II,III)oxíð`), and `naming.ts:25` gave sulfur the
  non-word root `brennisteinið` (now `súlfíð`). In Mólmassi, Na₂CO₃·10H₂O was `Vatnaglas hýdrat`
  — vatnsgler is sodium _silicate_ — and NaOH was `Natrímhýdroxíð`. Four more found in the same
  pass and fixed with them: PCl₅ was `Fosforpentaklóríð` against the accented `fosfór` in the
  file's own root table, and the remaining three hydrates carried no water count
  (`Epsom salt hýdrat`, `Járnsúlfat hýdrat`, and `Koparbrennisteinshýdrat`, which is not a name in
  any language). The `(blandað)` parenthetical **also served as a filter flag** at
  `Level3.tsx:102`, so the wrong name was load-bearing; compounds now declare
  `excludeFromNameBuilder` instead. The `þvottasódi` collision `docs/README.md` recorded is
  resolved in the same edit: Lausnir's anhydrous Na₂CO₃ (106 g/mol) is now
  `Na₂CO₃ (natríumkarbónat)`, leaving the word to name the decahydrate only.
- ~~**B6**~~ — **fixed 2026-08-18.** Lausnir Level 3 generated physically impossible solutions (no solubility ceiling; up to 54 M HCl). The recorded diagnosis named one generator at 14–20%; measurement over 300k problems found all five, worst case Ca(OH)₂ at 1156×.
- ~~**B8**~~ — **fixed 2026-08-18.** Takmarkandi's generator drew reactant counts with no relation to the coefficients, so a student following the game's own printed hint `min(A/c1, B/c2)` was graded wrong on roughly 44% of Level 2 and 70% of Level 3 problems (`takmarkandi/src/utils/calculations.ts:48-66`, floor at `:14`). Measured over 400k problems at 43.9% / 69.8%.
- ~~**B12**~~ — **fixed 2026-08-26.** Stilla efnajöfnur accepted any balanced coefficient set, so
  `4H₂ + 2O₂ → 4H₂O` scored correct. `checkBalance` now returns `isReduced` alongside `isBalanced`
  and the level requires both. Because the review's finding was that the convention is never
  checked **or mentioned**, the instructions now state it (_"Notaðu lægstu heilu tölurnar sem ganga
  upp."_) and balanced-but-unreduced gets its own feedback rather than a bare "Rangt" — the student
  has done the chemistry and is being held to a convention. All 20 stored answer keys were verified
  balanced and reduced.
- ~~**B13**~~ — **fixed 2026-08-26.** Einingagreining graded on an absolute 0.01 tolerance, so on an answer of 0.005 kg typing `0` scored correct. Now a 1% relative tolerance, matching what this game's own Level 3 already used for its synthesis problems. The same expression could not read an Icelandic decimal comma (half of B9), so it is fixed in these two components too — the repo-wide B9 pass is still open.

Listing them here is not scheduling them — and as of 2026-08-26 there is nothing left in this list to schedule.

---

## Phase 2 — Make terminology govern

`packages/shared/i18n/ordabok.md` already ships and nothing enforces it. April's freshly-written `lotukerfid` re-committed an error that had been fixed in February — a one-time patch demonstrably will not hold.

**Apply (decided, cited, zero judgment required):** `sætistala` for atomic number · `vermi` for enthalpy · `sjálfgengur` for spontaneous · `anóða`/`katóða` · `stuðpúði` not `púffer` · the Ksp family (`leysnimargfeldi`, `samjónahrif`, `mólarleysni`, `hlutfelling`).

**Then make it stick:** a banned-term → correct-term table in `CLAUDE.md` plus a test that greps rendered strings. Without the test this phase is temporary.

> **Done 2026-08-26.** All six terms applied across 12 files, the table is in `CLAUDE.md`, and
> `packages/shared/i18n/__tests__/governed-terms.test.ts` enforces it — verified to fail when a
> banned term is reintroduced. Three of the six change grammatical gender, so adjectives and
> determiners moved with them; the test matches strings and cannot check that, which the CLAUDE.md
> table records. Two findings while doing it: the hub tile called `3-ar/buffer-recipe-creator`
> "Púfferuppskrift" while the game's own header already read "Stuðpúðasmíði", and two ALL-CAPS
> occurrences of the spontaneity adjective survived a case-sensitive pass and were caught only by
> the new test.

**Fix first, in this order:** the three games that contradict _themselves_ (`lotukerfid`, `buffer-recipe-creator`, `thermodynamics-predictor`). A student who notices a game using two words for one concept learns that the vocabulary is unreliable.

---

## Phase 3 — Harvest the cheap content

No new games. Data files and single components dropping into games that already ship.

| Take                                                                    | From                       | Into                                               | Why                                                                                                                                                                     |
| ----------------------------------------------------------------------- | -------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 25 real-world scenarios (cooking, pharmacy, engineering, sport, travel) | `dc5e614`, your own commit | `1-ar/dimensional-analysis/src/data/challenges.ts` | Answers the review's sharpest complaint: five of seven Y1 games have zero context variation. `challenges.ts` was 739 lines there, is 404 here, with none of these items |
| `avogadro.ts` + `conversionChains.ts`                                   | old `1-ar/molmassi`        | `1-ar/molmassi`                                    | g↔mol, mol↔particles, mol↔L were specified and built and lost                                                                                                           |
| `data/trends.ts` — 3 trends with Icelandic rules, 12 verified items     | old `1-ar/lotukerfid`      | `1-ar/lotukerfid`                                  | Periodic trends are taught nowhere on the platform. All 12 keys verified correct                                                                                        |
| `data/saturation.ts` — solubility vs temperature, 6 points per compound | old `1-ar/lausnir`         | `1-ar/lausnir`                                     | Real sourced curves in place of the shipped game's hand-typed arrays. Enrichment — **not** the B3 fix; see the note below                                               |

**On B3, honestly.** _(Resolved: the correctness half landed in Phase 1b on 2026-08-18. The harvest half below is still open. The note is kept because its reasoning about separating a correctness fix from an enrichment is the reason the split happened.)_ An earlier version of this table claimed the `saturation.ts` harvest _fixes_ B3, which put a false-chemistry defect with a live victim two phases behind the phase whose whole stated purpose is to stop teaching wrong chemistry — and behind Phase 2, which has no victim at all. The two halves come apart cleanly. The correctness half is editing two arrays and one axis label (`lausnir/src/components/TemperatureSolubility.tsx:59,67,220`), needs nothing from the frozen repo, and could land in Phase 1 tomorrow. The harvest is the enrichment half, and it is strictly _slower_ than the correctness half, because everything coming out of the old repo needs the per-string terminology re-check described below. Keeping the harvest here is deliberate; leaving the correctness half unscheduled is not a recommendation — it is flagged in Phase 1's deferred list for you to decide.

**Take the data, not the code.** All of it was written 1–2 February and carries `setScore`, `hintMultiplier` and dead `LanguageSwitcher` wiring. Nine of the old games were never covered by the terminology pass, so their Icelandic strings are agent coinage, not ruling — re-check every string against `ordabok.md` on the way in.

---

## Phase 4 — Close the pedagogy gaps in shipped games

This is where your November test gets applied to the games you actually ship.

- **The answer leaks** — Nafnakerfið L2 prints the finished name directly above the input asking for it (all 12 items); Lotukerfið L2 is answerable from the table beneath it; Lausnir L2 shows the answer on half its items; Einingagreining L3 prints answers on the choice buttons. Plus the Nafnakerfið L3 chip pool, which cannot construct 33 of its 51 compounds.
- **`FeedbackPanel.tsx:104`** — one `useState(false)` hides the authored explanation behind a click at all 26 call sites in all three years. Best pedagogical return per character in the repo. Note two adjacent fixes are already known to be no-ops.
- **The decimal comma** — a repo-wide pass. On `type="number"` the browser eats the comma before your code runs, so a student's `0,5` submits as `5` and grades as a silent 10× error. Non-integer answers need `type="text"` + `inputMode="decimal"`, then normalise before parsing.
- **Misconception slots** — the shared panel has a purpose-built channel that renders _outside_ the collapse, and four of seven Y1 games leave it empty.

**Settled 2026-08-29 — levels are not gated.** Siggi's ruling. The dead strings were stripped the same day: 93 across 16 files, not the 15 games this line recorded — the count missed `common.locked` in `packages/shared/hooks/useGameI18n.ts`. They were also at `levels.*.locked`, not `menu.levels.*.locked`. Phase 4 is now complete. **Left standing, needing its own ruling:** `3-ar/equilibrium-shifter` gates its timed _Keppnishamur_ mode behind 5 problems — a live mode gate, not a level gate.

---

## Phase 5 — Fill the curriculum holes

Four gaps, each confirmed independently in February and again in August.

| Gap                                        | Year | Why it is the size it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~**Ka/Kb**~~ **BUILT 2026-09-03**         | 3    | `3-ar/syrufastinn` — Sýrufastinn, chain position 3, four phases, 61 tests, registered and on the hub. February's ruling was right and the hole was exactly as described: `equilibrium-shifter` had **no K value anywhere**, while `ph-titration` and `buffer-recipe-creator` both computed with Ka and handed the student `pKa` as given. See `apps/games/3-ar/syrufastinn/README.md`. **Scope was the weak-acid case only**, so the general Kc/Kp and ICE gap in `equilibrium-shifter` is still open — the obvious next item |
| **Ksp / solubility equilibria**            | 3    | `Ksp` has zero real occurrences platform-wide. Content exists and verifies; the graders need rewriting                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Electrolytes, precipitation, net ionic** | 1    | Four absent topics; the only net-ionic content in either repo. February answered the "new game or new level?" question with _both_ — a new game plus a Lausnir enhancement                                                                                                                                                                                                                                                                                                                                                    |
| **Empirical formula**                      | 1    | Confirmed absent from all three years. Fix three data defects before porting anything                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Also unplaced: percent yield, and significant figures, which `dimensional-analysis` **scores today without ever teaching**. One qualification, from the Level-3 measurement behind Phase 1 item 3: in Level 3 the significant-figures check is feedback-only — computed at `Level3.tsx:159-162`, rendered as a panel at `:745-770`, and never passed to `calculateCompositeScore`. Whether Levels 1–2 actually grade on it was not measured; confirm before treating "grades" as established. The teaching gap is real either way. **The mass→mole→mass bridge, listed here as unplaced until 2026-08-26, is now built** — `1-ar/einingakedjan`, see the status block at the top. Percent yield is still unplaced.

---

## Decisions only you can make

These block Phase 5 and parts of Phase 4. Four of them will produce contradictions _inside a single curriculum chain_ if made per-game instead of once.

1. ~~**Does a Level 4 exist?**~~ **Answered 2026-08-29: no.** Level-4 material from the old repo becomes Apply-phase content. Nothing in the tree referenced a level 4, so there was nothing to strip.
2. ~~**Are levels gated?**~~ **Answered 2026-08-29: no.** 93 dead gating strings removed; see the Phase 4 note above.
3. ~~**The Ka/Kb terminology — Kb, percent dissociation, the game title, and exact-vs-approximate grading.**~~ **Answered 2026-09-03:** `basafasti`, `klofnunarhlutfall`, `Sýrufastinn`, and grade on the approximation by the 5 % rule. All three words are now in `ordabok.md` and enforced by `governed-terms.test.ts`. The grading ruling is what keeps `ph-titration`'s stored `2.87` and `11.13` consistent with the new node — both are `√(Ka·C)` values, so grading the exact quadratic would have split the chain.
4. ~~**The five reaction-type names.**~~ **Answered 2026-08-27 and 2026-08-29:** `brunaefnahvarf`, `niðurbrot` / `niðurbrotsefnahvarf`, `samruni` / `samrunaefnahvarf`, `einfalt skiptihvarf`, `tvöfalt skiptihvarf`. All five are in `ordabok.md`. Nothing shipped uses four of them, so they carry no banned form and no test row — the entries exist for the content that will need them. **The qualifier on the displacement pair is load-bearing:** bare `skiptihvarf` already means substitution.
5. ~~**Stoichiometry**~~ **Answered 2026-08-27: `hlutfallaefnafræði`.** The three shipped words are gone and the term is enforced by `governed-terms.test.ts`. It does not decline in the singular, so it was a pure string swap in every case.
6. ~~**The galvanic cell noun**~~ **Answered 2026-08-27: `galvaníhlað`**, and its pair `rafefnahlað` on 2026-08-29. The compound absorbs the adjective, so any `galvanísk-` form is now wrong, and bare `klefi` is banned outright. `ordabok.md` deliberately keeps `electrolytic cell;rafker` and `half-cell;hálfker` on the `-ker` pattern — that split is intentional, not drift.
7. **Where significant figures live** — its own game, or a "Stig 0" inside Einingagreining.
8. **Acid names the platform spells three ways** — surfaced 2026-09-03 while picking the Sýrufastinn pool, and the reason three acids are absent from it. **HF:** `Flússýra` (`3-ar/ph-titration/data/titrations.ts:87`) vs `flúorsýru` (same game, `level2-puzzles.ts:82`, `level3-challenges.ts:303`) vs `Flúorsýra` (`2-ar/intermolecular-forces/components/Level1.tsx:426`) — two words inside one game. **HNO₃/HNO₂:** `saltpéturssýra`, `saltpétursýru` (one `s`), `salpeturssýru` (missing `t` and accent, `3-ar/equilibrium-shifter/data/equilibria.ts:415`). **H₃PO₄:** `fosforsýru` at `equilibria.ts:856` is not a new question but a **missed site of the existing B5 `Fosfór` ruling** and can be fixed without one. Also `brennisteinsýru` with one `s` (`2-ar/hess-law/components/Level2.tsx:177`) and `Benzoesýrustuðpúði` with a `z` (`3-ar/buffer-recipe-creator/data/problems.ts:146`).
9. **The i18n question** — strip `LanguageSwitcher` or finish the wiring. 20 of the 22 games render a switcher — `1-ar/einingakedjan` (Aug 2026) and now `3-ar/syrufastinn` (Sep 2026) deliberately ship neither the hook nor the switcher, so they do not add cases to this question. Of those 20, eight route essentially nothing through it — seven have **zero** `t()` calls (`2-ar/kinetics`, `2-ar/lewis-structures`, `2-ar/intermolecular-forces`, `2-ar/organic-nomenclature`, `3-ar/buffer-recipe-creator`, `3-ar/gas-law-challenge`, `3-ar/thermodynamics-predictor`) and `3-ar/ph-titration` has exactly one. Several more route only a handful (`2-ar/rafeindabygging` 1, `2-ar/vsepr-geometry` 2, `1-ar/takmarkandi` 2). Per-game counts: `docs/i18n-coverage.md`. (Measured 2026-08-17; an earlier draft said "a dozen", which is closer to the number of games that _do_ call `t()`.)

---

## How to not lose work again

February's work was lost because it lived in cloud sessions that never landed anywhere you looked. kvenno-app already has the pattern that prevents it — PRs #11, #12, #13. Keep it: cloud and web sessions open PRs, you merge them, you pull before starting locally. A branch that is never merged is indistinguishable from work that never happened.
