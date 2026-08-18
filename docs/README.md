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

**Known live defects, worth reading before anything else** — students meet these today:

- Option arrays where the correct answer sits at a constant index, in two games that map `challenge.options` straight into buttons with no shuffle: `2-ar/kinetics/src/data/level3-questions.ts` puts the correct option first on **all 6** items (rendered at `components/Level3.tsx:227`), and `2-ar/organic-nomenclature` Level 3 puts it first on **6 of 10** (rendered at `components/Level3.tsx:364`). Both grade by value — option `id` and `correctAnswer` string respectively — so reordering is safe. Four other files that a data-only scan flags as constant are **not** defects, because their components shuffle before rendering: `1-ar/nafnakerfid` L1 (`:360`), `1-ar/lotukerfid` L2 (`:156`), `2-ar/hess-law` L1 (`:219`), `2-ar/kinetics` L1 (`:52`). Measured 2026-08-18 by scanning every `options:` array in all three years and then checking each hit's render path — a scan of the data alone overstates this defect by four files. This is the position of the correct option _within_ a question, which is not the deliberate exam-stability choice about problem _order_ in Kinetics and Redox.
- `apps/games/1-ar/dimensional-analysis/src/components/Level3.tsx:594` advertises "⚠️ 10% dregið frá heildareinkunn" whenever a hint opens, while `hintPenalty` is `0` at `:192` — the penalty is announced but never applied. It is the only surviving occurrence of that string in any game, and it discourages exactly the hint use the April 2026 restructure set out to make free. Measured 2026-08-17.

**The current work order is [`plans/2026-08-16-games-roadmap.md`](plans/2026-08-16-games-roadmap.md)**, with the first phase specified in [`plans/2026-08-16-phase-1-correctness.md`](plans/2026-08-16-phase-1-correctness.md). Both are live August-2026 documents, not history.

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

## Superseded — do not read as current

- **`docs/game-reviews/01–17-*.md`** — written before the April 2026 restructure. They describe deleted features (memory-match levels, NameBuilder, achievements, mastery gates, timer modes) and score accuracy 5/5 on data files that contain verified errors. Kept for history only.
- **`apps/games/{1,2,3}-ar/REVIEW_TRACKER.md`** — accurate within their own P1–P7 rubric, which does not cover curriculum, chemical correctness, or whether the answer is visible before the student answers. "Zero FAIL ratings" is true only inside that rubric.
- **`apps/games/{1,2,3}-ar/SUGGESTED_IMPROVEMENTS_*.md`** — pre-restructure per-game idea lists. `SUGGESTED_IMPROVEMENTS_1-AR.md` covers 5 of the 7 Y1 games (no `lotukerfid`, no `jafna-jofnur`); `SUGGESTED_IMPROVEMENTS_2-AR.md` covers 7 of the 8 Y2 games (no `rafeindabygging`). `SUGGESTED_IMPROVEMENTS_3-AR.md` is complete for its year but equally pre-restructure. All three analyse features the April 2026 restructure removed.
- **`docs/game-issues-plan.md`**, **`docs/plans/2026-02-*.md`**, **`docs/plans/DESIGN_SYSTEM.md`**, **`docs/plans/MODERNIZATION_PLAN.md`** — historical plans, retained for provenance. The two `docs/plans/2026-08-16-*.md` documents are _not_ superseded; they are the current roadmap and its first phase, linked above.
