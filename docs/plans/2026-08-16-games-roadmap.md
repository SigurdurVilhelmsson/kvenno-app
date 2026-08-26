# Chemistry games roadmap — from here to "sound, accurate, complete"

**Date:** 2026-08-16 · **Status block updated:** 2026-08-26
**Goal, verbatim:** "a pedagogically sound games library, accurate and error free, covering the curriculum of my students"
**Base:** kvenno-app. The old repo `namsbokasafn-leikir` is a quarry, frozen at `379266e`. No new work happens there.
**Evidence:** `docs/README.md` indexes the three review documents every claim below is drawn from.

---

## STATUS — read this first

The phase bodies below are the plan as written on 2026-08-16 and are left intact, so the reasoning
behind each ordering stays legible. This block is what has actually happened since. Where the two
disagree, this block is current.

| Phase                                    | Status                     | Landed                                                                                                                       |
| ---------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1 — Stop teaching wrong chemistry        | **Done** 2026-08-18        | PR #23, `fix/phase-1-correctness`. All four tasks; see the sub-plan's own STATUS header                                      |
| 1b — the three Tier-0 items with victims | **Done** 2026-08-18        | PR #24, `fix/phase-1b-correctness`. B3, B6, B8                                                                               |
| 2 — Make terminology govern              | **Done** 2026-08-26        | All six ruled terms applied, plus a test that fails if any returns — `packages/shared/i18n/__tests__/governed-terms.test.ts` |
| 3 — Harvest the cheap content            | Not started                | —                                                                                                                            |
| 4 — Close the pedagogy gaps              | Not started                | —                                                                                                                            |
| 5 — Fill the curriculum holes            | Not started, but see below | —                                                                                                                            |

**Tier-0 correctness: two of the nine remain open — B5 and B12.** Phase 1 closed B1 and B2;
Phase 1b closed B3, B6 and B8; B4 and B13 were closed on 2026-08-26 (PR #30). The Phase 1
deferred list further down still enumerates seven because it is the 08-16 text; the five that have
since been fixed are struck through there. The two that remain are specified with `file:line` in
[`2026-08-16-phase-1-correctness.md`](2026-08-16-phase-1-correctness.md) at the table near its end,
and neither yet has a phase.

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
4. **Unshuffled option arrays** — `2-ar/rafeindabygging` Level 3 has the answer at index 0 on all eight items; five more shipped games have no shuffle.
5. **A `data-integrity.test.ts` per fixed game**, following `3-ar/buffer-recipe-creator/src/__tests__/data-integrity.test.ts`.

Each fix is small. The tests are the phase's real deliverable.

**What this phase does not close.** The Year-1 review's Tier-0 correctness list has nine items. This phase closes two of them — B1 (item 2 above) and B2 (item 3). The other two tasks are real but come from elsewhere: item 1 from the review's Updates section, item 4 from `docs/README.md`. So four defects close, seven Tier-0 items stay open, and none of the seven currently has a phase _(as written 2026-08-16 — three of the seven have since been fixed; see the note directly below)_:

> **Superseded in part, 2026-08-26.** Phase 1b closed B3, B6 and B8 on 2026-08-18 (PR #24), and
> B4 and B13 were closed on 2026-08-26 (PR #30). The five are struck through below and their
> descriptions are the pre-fix state, kept so the measurements stay readable.
> **Two remain open: B5 and B12.**

- ~~**B3**~~ — **fixed 2026-08-18.** Lausnir's gas solubility data was 10× too high, g/L values printed under a `g/100g H2O` axis label (`lausnir/src/components/TemperatureSolubility.tsx:59,67`, label at `:220`). Correcting the data alone would have hidden the curves instead — see `docs/README.md`.
- ~~**B4**~~ — **fixed 2026-08-26.** 12 of Mólmassi's 29 compounds printed a per-element breakdown whose lines did not sum to the total printed under them, in the one game whose entire skill is summing element masses. `molarMass` was hand-written from more precise atomic masses than the table the game shows a student; it is now summed from `elements.ts`, so the two cannot disagree.
- **B5** — wrong compound names taught as fact in `nafnakerfid` and `molmassi`.
- ~~**B6**~~ — **fixed 2026-08-18.** Lausnir Level 3 generated physically impossible solutions (no solubility ceiling; up to 54 M HCl). The recorded diagnosis named one generator at 14–20%; measurement over 300k problems found all five, worst case Ca(OH)₂ at 1156×.
- ~~**B8**~~ — **fixed 2026-08-18.** Takmarkandi's generator drew reactant counts with no relation to the coefficients, so a student following the game's own printed hint `min(A/c1, B/c2)` was graded wrong on roughly 44% of Level 2 and 70% of Level 3 problems (`takmarkandi/src/utils/calculations.ts:48-66`, floor at `:14`). Measured over 400k problems at 43.9% / 69.8%.
- **B12** — Jafna jöfnur accepts non-reduced coefficient sets; the lowest-whole-number requirement is never checked or mentioned.
- ~~**B13**~~ — **fixed 2026-08-26.** Einingagreining graded on an absolute 0.01 tolerance, so on an answer of 0.005 kg typing `0` scored correct. Now a 1% relative tolerance, matching what this game's own Level 3 already used for its synthesis problems. The same expression could not read an Icelandic decimal comma (half of B9), so it is fixed in these two components too — the repo-wide B9 pass is still open.

Listing them here is not scheduling them. Whether either of the two still open moves into a phase is your call.

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

**Blocked on you:** whether levels are gated. February built gating, April removed it, the August review wants it back, and the strings for **15** games already exist in three languages with no consumers — 14 under `menu.levels.*.locked`, plus `1-ar/nafnakerfid` under `completeLevel1First`/`completeLevel2First`. Grep both key names. (Measured 2026-08-17.)

---

## Phase 5 — Fill the curriculum holes

Four gaps, each confirmed independently in February and again in August.

| Gap                                        | Year | Why it is the size it is                                                                                                                                                                                  |
| ------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ka/Kb**                                  | 3    | February ruled it a _prerequisite_ of pH Títrun — "pH Titration assumes students know Ka/Kb calculations, but these aren't taught". You ship pH Títrun and no Ka/Kb node, so the hole is live. Start here |
| **Ksp / solubility equilibria**            | 3    | `Ksp` has zero real occurrences platform-wide. Content exists and verifies; the graders need rewriting                                                                                                    |
| **Electrolytes, precipitation, net ionic** | 1    | Four absent topics; the only net-ionic content in either repo. February answered the "new game or new level?" question with _both_ — a new game plus a Lausnir enhancement                                |
| **Empirical formula**                      | 1    | Confirmed absent from all three years. Fix three data defects before porting anything                                                                                                                     |

Also unplaced: percent yield, and significant figures, which `dimensional-analysis` **scores today without ever teaching**. One qualification, from the Level-3 measurement behind Phase 1 item 3: in Level 3 the significant-figures check is feedback-only — computed at `Level3.tsx:159-162`, rendered as a panel at `:745-770`, and never passed to `calculateCompositeScore`. Whether Levels 1–2 actually grade on it was not measured; confirm before treating "grades" as established. The teaching gap is real either way. **The mass→mole→mass bridge, listed here as unplaced until 2026-08-26, is now built** — `1-ar/einingakedjan`, see the status block at the top. Percent yield is still unplaced.

---

## Decisions only you can make

These block Phase 5 and parts of Phase 4. Four of them will produce contradictions _inside a single curriculum chain_ if made per-game instead of once.

1. **Does a Level 4 exist?** Most salvageable content is Level-4 material. The old design capped at three; April replaced that with Explore → Understand → Practice → Apply, which has no level count. Decide once.
2. **Are levels gated?**
3. **The five reaction-type names.** Three are settled across two independent old games; decomposition is contested three ways and the singular/plural form is open. Nothing in Jafna Jöfnur should be written until these five words exist.
4. **Stoichiometry** — you currently ship `stökjómetríu`, `Stökefnafræði` and `stækifræði`.
5. **The galvanic cell noun** — no glossary entry; the shipped text is ungrammatical whichever noun wins (`klefi` is masculine, so `Galvanískur klefi`).
6. **Where significant figures live** — its own game, or a "Stig 0" inside Einingagreining.
7. **The i18n question** — strip `LanguageSwitcher` or finish the wiring. 20 of the 21 games render a switcher — `1-ar/einingakedjan` (Aug 2026) deliberately ships neither the hook nor the switcher, so it does not add a case to this question. Of those 20, eight route essentially nothing through it — seven have **zero** `t()` calls (`2-ar/kinetics`, `2-ar/lewis-structures`, `2-ar/intermolecular-forces`, `2-ar/organic-nomenclature`, `3-ar/buffer-recipe-creator`, `3-ar/gas-law-challenge`, `3-ar/thermodynamics-predictor`) and `3-ar/ph-titration` has exactly one. Several more route only a handful (`2-ar/rafeindabygging` 1, `2-ar/vsepr-geometry` 2, `1-ar/takmarkandi` 2). Per-game counts: `docs/i18n-coverage.md`. (Measured 2026-08-17; an earlier draft said "a dozen", which is closer to the number of games that _do_ call `t()`.)

---

## How to not lose work again

February's work was lost because it lived in cloud sessions that never landed anywhere you looked. kvenno-app already has the pattern that prevents it — PRs #11, #12, #13. Keep it: cloud and web sessions open PRs, you merge them, you pull before starting locally. A branch that is never merged is indistinguishable from work that never happened.
