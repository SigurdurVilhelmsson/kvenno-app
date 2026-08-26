# Documentation index

Start here. Documents are grouped by what you would be trying to do.

## If you are about to change a game

Read these three first. They were produced in August 2026 by independent review passes, each claim cited to `file:line` and re-checked by an adversarial verifier. They supersede the older per-game reviews.

| Document                                                                                | What it holds                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/games/1-ar/CURRICULUM_REVIEW.md`](../apps/games/1-ar/CURRICULUM_REVIEW.md)       | Year-1 games against Brown ch. 1–4: coverage map, **17 verified correctness defects**, pedagogy ratings, tiered work order. Carries an updates header with three findings that postdate it.                                                                                                                                                              |
| [`apps/games/ORPHANED_GAMES_ASSESSMENT.md`](../apps/games/ORPHANED_GAMES_ASSESSMENT.md) | Why only 17 of 33 old-repo games migrated, and a four-axis assessment of 15 of the 16 left behind — structure/pedagogy, UX/chrome, curriculum coverage, fit if adapted. The 16th, the old repo's own `lotukerfid`, is covered separately because kvenno-app's `lotukerfid` is an independent rewrite rather than a port. Ends with a 16-item work order. |
| [`FEBRUARY-DECISIONS-RECOVERED.md`](FEBRUARY-DECISIONS-RECOVERED.md)                    | The design record lost with the 2026-01-26 → 02-05 window: the **Icelandic terminology ruling**, the per-year curriculum gap analyses, the pedagogical criteria, and the priority plan.                                                                                                                                                                  |

**Fixed by Phase 1 (2026-08-18, branch `fix/phase-1-correctness`)** — each carries a test that fails if the defect returns:

- `apps/games/3-ar/ph-titration/src/utils/ph-calculations.ts:57,95,133,198` divided a molarity already in mol/L by 1000, so 0.100 M acetic acid rendered pH 4.37 against the game's own `data/titrations.ts:76` value of 2.87. Weak acids started ~1.5 units high, weak bases ~1.5 low. Every titration's curve start is now checked against its declared `initialPH`; ids 6, 11 and 12 (HF, H₂SO₃, oxalic) still disagree by 0.06–0.14 and are pinned with `it.fails` pending a teacher decision on the declared values.
- `apps/games/1-ar/lotukerfid/src/components/Level3.tsx:31-33` taught `round(atomicMass) − Z` as _the method_ for counting neutrons. Elements now carry an explicit `massNumber` (NIST/CIAAW, independently reproduced three times before being written); the breakdown card, which recomputed the rounding inline, uses it too. **Live answer keys changed for Ni, Cu, Zn, Ga, Ge, Se and Br.** See the open question below — the neutron questions are now correct but not derivable.
- `apps/games/1-ar/dimensional-analysis/src/data/challenges.ts:271` — speed of light was off by 1000× (`1.08e12` keyed, `1.08e9` correct), and the same wrong value was leaking through the answer input's placeholder. The former "`:354` is unsatisfiable" claim was tested by executing the real `Level3` and retired Aug 2026 — see the correction at `apps/games/ORPHANED_GAMES_ASSESSMENT.md:354`, where it originated. One teaching question survives there, not a defect.
- `apps/games/2-ar/rafeindabygging` Level 3 had the correct option at `options[0]` on all eight puzzles, so the level was passable by always clicking first. The data now spreads the answer 2/2/2/2 across the four slots and `Level3.tsx` shuffles per question at render; grading already compared strings rather than indices, so no answer key moved.

**The lotukerfið neutron questions now name the nuclide** — "Hversu margar nifteindir hefur Kopar-63 (Cu-63)?" — decided 2026-08-18. Removing the rounding rule had removed the student's only route to the mass number: the key was correct but underivable in ~36% of playthroughs, and a student who rounded 63.546 went from being marked correct against a wrong key to being marked wrong with nothing to work from. Naming the isotope gives the mass number in the question and changes what is tested from applying a rule to reading a nuclide symbol. It also settles two draw-pool elements where the old form had no well-defined answer: Br-79 is 50.69% against Br-81's 49.31%, and Ge-74 is 36.5% against Ge-72's 27.45%. Both notations are attested in the school's textbook corpus.

**Fixed by Phase 1b (2026-08-18, branch `fix/phase-1b-correctness`, stacked on Phase 1)** — the three Tier-0 items with live victims that Phase 1 left standing:

- **B3** — `1-ar/lausnir` plotted gas solubility in g/L under a `g/100g H₂O` axis while every solid was in g/100 g, so both gas curves read 10× too high (CO₂ 3.35 where 0.335 is right). Correcting the data alone would have hidden them instead: `toFixed(1)` renders the true O₂ figure as "0.0", and the y-axis was floored at 10 g/100 g, which flattens a curve peaking at 0.335 onto the axis. Both fixed. The values assume 1 atm of the pure gas, which is now recorded — gas solubility is meaningless without a pressure.
- **B8** — `1-ar/takmarkandi` drew both molecule counts independently of the reaction's coefficients while printing the method as `min(A ÷ c1, B ÷ c2)`, then silently flooring it. Measured over 400k generated problems: the printed method disagreed with the key on **43.9% of Level 2 and 69.8% of Level 3**, matching the review's ~44%/~70%. The same event left the _limiting_ reactant with molecules to spare. Counts are now whole multiples of their own coefficients.
- **B6** — `1-ar/lausnir` generated solutions more concentrated than the substance dissolves. Measured over 300k problems per difficulty: **24.7% of easy, 8.3% of medium, 38.9% of hard**, worst case Ca(OH)₂ at 25.4 M against a real 0.022 M — 1156×. **The recorded diagnosis was too narrow:** it named one generator and put the rate at 14–20%; it is all five, and on hard every one contributes. Each chemical now declares `maxMolarity` (21 values, independently reproduced three times, agreeing within 8%).

**Fixed 2026-08-26 — the dimensional-analysis phantom hint penalty**, guarded by `apps/games/1-ar/dimensional-analysis/src/__tests__/hint-cost.test.ts`:

- `Level3.tsx` advertised a grade penalty for opening a hint in **two** places, and the recorded diagnosis caught only one. The open hint panel said "⚠️ 10% dregið frá heildareinkunn" (`:594`, the documented one), and the button that opens the panel said "💡 Sýna vísbendingu (kostar 15% af einkunn)" (`:614`, not previously recorded). The two never agreed with each other, and neither was applied: `efficiencyScore` is derived from the number of conversion steps the student picked (`:124-125,144`), never from hints, and `hintPenalty` was `0` at `:192` and read nowhere. The earlier note that `:594` "is the only surviving occurrence of that string in any game" was true of that exact string and still missed the second penalty — a grep for the _wording_ found what a grep for the _string_ did not.
- Both are now gone, along with the dead `hintPenalty` field on `ScoreResult`. The level's intro promise at `:303-305` — "Þú getur alltaf beðið um vísbendingu án þess að það hafi áhrif á einkunn" — is what the code always did, and now the only thing the UI says. The guard scans the game's own source for penalty _wording_ rather than rendering one screen, since these strings can reappear on any screen; it was verified to fail against the pre-fix file, naming both lines.
  **Also fixed 2026-08-26 — the other two advertised hint costs.** Both were recorded here as "advertises a cost on the affordance", which was right about only one of them; the wording used `stig`, not `einkunn`, which is why the first grep for this defect missed both:

- `3-ar/gas-law-challenge/src/i18n.ts:34` claimed "Vísbendingar kosta stig (-10)" in all three locales. Phantom, and doubly dead: `points` at `App.tsx:149-152` comes from answer accuracy (100, or 150 within 1%) plus a 50-point challenge-mode time bonus, and `getHint()` only feeds the `hintsUsed` stat — while the string itself was never rendered, like the rest of that `challenge` block, since gas-law is one of the switcher-only games serving hardcoded Icelandic. Removed so wiring the block up later cannot ship the claim. Its siblings stay: the 90-second limit and the time bonus are real.
- `2-ar/hess-law/src/i18n.ts:76` was **not** phantom, and the entry above was wrong to group it with the others. `Level3.tsx` awarded 20 for an unaided correct answer and 10 once the hint was open, so "(-10 stig)" was _truthful_ and deleting the label alone would have converted an honest penalty into a silent one. The penalty contradicts the restructure's "hint usage is never penalized" — and this game's own Levels 1 and 2, which award a flat 100 either way — so on Siggi's call the scoring is now a flat 20 and the label is plain. Guarded by `src/__tests__/hint-cost.test.tsx`, which drives the component rather than scanning source: it reads the on-screen score after answering challenge 1 with and without a hint, and failed against the old code with `expected '10 progress.points' to be '20 progress.points'`.

**Also fixed 2026-08-26 — `3-ar/ph-titration`, the last game charging for hints.** The entry that stood here called all three levels a real multiplier and cited `Level1.tsx:47,87`, `Level2.tsx:454-455`, `Level3.tsx:309-310`. That was right about one level of the three:

- **Level 1 — real.** `Math.round(100 * hintMultiplier)`, the multiplier coming from the shared `HintSystem`'s tiers (1.0 / 0.8 / 0.6 / 0.4 / 0.4), so revealing all four tiers cut a correct answer from 100 to 40. Now a flat 100.
- **Levels 2 and 3 — phantom.** Both already awarded a flat amount (`const points = 100` at `Level2.tsx:158`, `const points = 20` at `Level3.tsx:60`) while the result banner said "(50 stig)" and "(10 stig)" whenever the hint had been opened. The banner understated what the student actually got; the labels are now unconditional.

Level 1's fix needed one shared change, because the penalty was partly the shared component's: `HintSystem` renders a running "Stig: x / y" cost indicator (`HintSystem.tsx:135`). Dropping `onPointsChange` alone would have left that indicator quoting a price nothing charged — the exact defect being removed. `HintSystem` therefore takes a new **`showPointCost`** prop, defaulting to `true` so nothing else changes; ph-titration L1 is its only caller. **The other three consumers — `2-ar/lewis-structures` L1 and `3-ar/buffer-recipe-creator` L1/L2/L3 — genuinely apply the multiplier and were deliberately left alone**; changing the shared default would have silently rescored four games.

Guarded by `src/__tests__/hint-cost.test.tsx`, which drives the component: it reveals every tier, answers challenge 1 correctly, and asserts the full 100. Against the old code it fails with `expected 'Stig: 40' to be 'Stig: 100'`.

**`3-ar/equilibrium-shifter` — found while doing the above, fixed 2026-08-26.** It declared the multiplier write-only (`const [, setHintMultiplier] = useState(1.0)`, `App.tsx:58`) and `calculatePoints` (`:320-328`) never read it, so learning mode showed `HintSystem`'s cost indicator while awarding full points — `basePoints + streakBonus + timeBonus`, untouched by hints. It now passes `showPointCost={false}`, and the dead state is gone.

**The rule is now enforced rather than re-checked.** Four games got this wrong in four different ways, and two of them were mis-recorded here before anyone read the code, so `packages/shared/components/HintSystem/__tests__/consumers-honest.test.ts` scans every `<HintSystem` call site under `apps/games/` and requires each to **either apply the multiplier or pass `showPointCost={false}`**. A call site that captures the multiplier write-only — `const [, setX] = useState(1.0)`, which is how both phantom cases happened to be written — cannot be applying it, and fails. Against the pre-fix equilibrium-shifter it reports `setHintMultiplier is write-only, so the displayed cost is never charged`. It also asserts it found call sites at all, so it cannot quietly cover nothing.

Note what that guard does and does not do: it enforces **honesty** — no game may quote a price it does not charge — not the restructure's "hints are free" policy. A game that displays and genuinely applies a penalty passes it. The policy is held per game by the four `hint-cost` tests. `packages/shared/components/HintSystem/__tests__/HintSystem.test.tsx` covers the prop itself, including that the default stays `true` so `2-ar/lewis-structures` and `3-ar/buffer-recipe-creator` keep telling their students what a hint costs.

**Known live defects, worth reading before anything else** — students meet these today:

- **Nafnakerfið Level 3 cannot grade two thirds of its own pool.** The level asks the student to
  assemble a compound name from clickable parts, and **33 of the 51 compounds it draws from cannot
  be built from the parts it offers**, so those can never be marked correct. `generateParts`
  (`1-ar/nafnakerfid/src/components/Level3.tsx:63-88`) offers Greek prefixes 1–4 plus any prefix
  whose literal string appears in the name, the element roots from `naming.ts`, and two fixed
  distractors. It has no token for a Roman numeral (`Járn(III)oxíð`), no polyatomic-ion name
  (`súlfat`, `nítrat`, `karbónat`, `fosfat`, `hýdroxíð` — and `súlfat`/`nítrat` appear only as
  _distractors_), no root for Mn, Cr, Pb, Hg or Sn, and no elided prefix form (`dekoxíð` needs
  `deka` + `oxíð`, which concatenate to `dekaoxíð`). Found 2026-08-26 while fixing B5, by running
  the real `generateParts` against the real pool. Not fixed: how fine the parts should be is a
  design decision, not a correction. Correcting the names did not change the count either way.

- Option arrays where the correct answer sits at a constant index, in two games that map `challenge.options` straight into buttons with no shuffle: `2-ar/kinetics/src/data/level3-questions.ts` puts the correct option first on **all 6** items (rendered at `components/Level3.tsx:227`), and `2-ar/organic-nomenclature` Level 3 puts it first on **6 of 10** (rendered at `components/Level3.tsx:364`). Both grade by value — option `id` and `correctAnswer` string respectively — so reordering is safe. Four other files that a data-only scan flags as constant are **not** defects, because their components shuffle before rendering: `1-ar/nafnakerfid` L1 (`:360`), `1-ar/lotukerfid` L2 (`:156`), `2-ar/hess-law` L1 (`:219`), `2-ar/kinetics` L1 (`:52`). Measured 2026-08-18 by scanning every `options:` array in all three years and then checking each hit's render path — a scan of the data alone overstates this defect by four files. This is the position of the correct option _within_ a question, which is not the deliberate exam-stability choice about problem _order_ in Kinetics and Redox.

**The current work order is [`plans/2026-08-16-games-roadmap.md`](plans/2026-08-16-games-roadmap.md)**, with the first phase specified in [`plans/2026-08-16-phase-1-correctness.md`](plans/2026-08-16-phase-1-correctness.md). Both are live August-2026 documents, not history.

**Read the roadmap's `STATUS` block first.** Its phase bodies are the 2026-08-16 text and are kept
intact so the reasoning stays legible, which means parts of them describe defects that have since
been fixed. The status block at the top carries what has actually happened — as of 2026-08-26,
Phases 1, 1b and 2 are done, and **the Tier-0 correctness list is empty**: B4 and B13 closed on
2026-08-26 (PR #30), B5 and B12 on 2026-08-26. Each of the nine now carries a test that fails if it
returns.

## Icelandic terminology

`packages/shared/i18n/ordabok.md` **governs**. It was moved into the shared library deliberately, which is the statement that it applies to every game. Authority order when a term is disputed:

1. `packages/shared/i18n/ordabok.md`
2. `~/dev/repos/namsbokasafn-efni` — the school's own textbook corpus
3. A teaching decision from Siggi, only where both are silent or disagree

The complete ruling — ~30 term corrections, each with its glossary citation and its status in this repo — is the terminology section of [`FEBRUARY-DECISIONS-RECOVERED.md`](FEBRUARY-DECISIONS-RECOVERED.md). Nothing currently enforces the glossary; see that document's closing section for why a one-time patch will not hold.

## Platform and operations

| Document                                                                | What it holds                                             |
| ----------------------------------------------------------------------- | --------------------------------------------------------- |
| [`KVENNO-STRUCTURE.md`](KVENNO-STRUCTURE.md)                            | The master design document for the platform               |
| [`DEPLOYMENT.md`](DEPLOYMENT.md)                                        | Build and deploy                                          |
| [`azure-ad-setup.md`](azure-ad-setup.md)                                | Auth configuration                                        |
| [`bundle-sizes.md`](bundle-sizes.md)                                    | Measured bundle sizes, incl. the Three.js code-split      |
| [`i18n-coverage.md`](i18n-coverage.md)                                  | Translation coverage                                      |
| [`content/islenskubraut/README.md`](../content/islenskubraut/README.md) | Editing Íslenskubraut content, directly or by spreadsheet |

## Íslenskubraut content authoring — the design record

These two live under `docs/superpowers/` rather than `docs/plans/`, which is why they are easy to
miss. They are **current, not history**: the design document carries its own status header, and the
part it lists as unfinished is still unfinished.

| Document                                                                                                                                           | What it holds                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`superpowers/specs/2026-08-17-islenskubraut-content-authoring-design.md`](superpowers/specs/2026-08-17-islenskubraut-content-authoring-design.md) | The design and its status. Tasks 1–6 shipped 2026-08-18: YAML is the source of truth, both TypeScript consumers are generated, and the xlsx export/import round-trip exists |
| [`superpowers/plans/2026-08-17-islenskubraut-content-authoring.md`](superpowers/plans/2026-08-17-islenskubraut-content-authoring.md)               | The task-by-task implementation plan behind it                                                                                                                              |

**Still blocking the first real review cycle:** every reviewer-facing Icelandic string in the
exported workbook is placeholder wording drafted by Claude and never reviewed, marked
`PLACEHOLDER ICELANDIC` in `scripts/islenskubraut/export-xlsx.mjs`. Do not send an export to a
colleague until Siggi has rewritten it — the instructions tell a reviewer how to add, delete and
reorder rows, so misleading wording produces a workbook the importer then refuses.

## Superseded — do not read as current

- **`docs/game-reviews/01–17-*.md`** — written before the April 2026 restructure. They describe deleted features (memory-match levels, NameBuilder, achievements, mastery gates, timer modes) and score accuracy 5/5 on data files that contain verified errors. Kept for history only.
- **`apps/games/{1,2,3}-ar/REVIEW_TRACKER.md`** — accurate within their own P1–P7 rubric, which does not cover curriculum, chemical correctness, or whether the answer is visible before the student answers. "Zero FAIL ratings" is true only inside that rubric.
- **`apps/games/{1,2,3}-ar/SUGGESTED_IMPROVEMENTS_*.md`** — pre-restructure per-game idea lists. `SUGGESTED_IMPROVEMENTS_1-AR.md` covers 5 of the 7 Y1 games (no `lotukerfid`, no `jafna-jofnur`); `SUGGESTED_IMPROVEMENTS_2-AR.md` covers 7 of the 8 Y2 games (no `rafeindabygging`). `SUGGESTED_IMPROVEMENTS_3-AR.md` is complete for its year but equally pre-restructure. All three analyse features the April 2026 restructure removed.
- **`docs/game-issues-plan.md`**, **`docs/plans/2026-02-*.md`**, **`docs/plans/DESIGN_SYSTEM.md`**, **`docs/plans/MODERNIZATION_PLAN.md`** — historical plans, retained for provenance. The two `docs/plans/2026-08-16-*.md` documents are _not_ superseded; they are the current roadmap and its first phase, linked above.
