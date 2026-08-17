# Documentation index

Start here. Documents are grouped by what you would be trying to do.

## If you are about to change a game

Read these three first. They were produced in August 2026 by independent review passes, each claim cited to `file:line` and re-checked by an adversarial verifier. They supersede the older per-game reviews.

| Document                                                                                | What it holds                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/games/1-ar/CURRICULUM_REVIEW.md`](../apps/games/1-ar/CURRICULUM_REVIEW.md)       | Year-1 games against Brown ch. 1–4: coverage map, **17 verified correctness defects**, pedagogy ratings, tiered work order. Carries an updates header with three findings that postdate it.                                                                                                                                                              |
| [`apps/games/ORPHANED_GAMES_ASSESSMENT.md`](../apps/games/ORPHANED_GAMES_ASSESSMENT.md) | Why only 17 of 33 old-repo games migrated, and a four-axis assessment of 15 of the 16 left behind — structure/pedagogy, UX/chrome, curriculum coverage, fit if adapted. The 16th, the old repo's own `lotukerfid`, is covered separately because kvenno-app's `lotukerfid` is an independent rewrite rather than a port. Ends with a 16-item work order. |
| [`FEBRUARY-DECISIONS-RECOVERED.md`](FEBRUARY-DECISIONS-RECOVERED.md)                    | The design record lost with the 2026-01-26 → 02-05 window: the **Icelandic terminology ruling**, the per-year curriculum gap analyses, the pedagogical criteria, and the priority plan.                                                                                                                                                                  |

**Known live defects, worth reading before anything else** — students meet these today:

- `apps/games/3-ar/ph-titration/src/utils/ph-calculations.ts:57,95,133,198` divides a molarity already in mol/L by 1000. 0.100 M acetic acid renders pH 4.37 where the game's own `data/titrations.ts:76` asserts 2.87.
- `apps/games/1-ar/lotukerfid/src/components/Level3.tsx:31-33` teaches `round(atomicMass) − Z` as _the method_ for counting neutrons. Of the 36 elements it draws from, 7 mismatch, so ~36% of playthroughs mis-grade a correct answer on one of the two graded neutron questions, and ~86% print at least one wrong neutron count somewhere in the run (the particle card renders one after every question). Percentages are hypergeometric over the draw pool, cross-checked by Monte Carlo against the real shuffle.
- `apps/games/1-ar/dimensional-analysis/src/data/challenges.ts:271` — speed of light off by 1000× (`1.08e12` keyed, `1.08e9` correct). The former "`:354` is unsatisfiable" claim was tested by executing the real `Level3` and retired Aug 2026 — see the correction at `apps/games/ORPHANED_GAMES_ASSESSMENT.md:354`, where it originated. One teaching question survives there, not a defect.
- Option arrays are unshuffled in several games; `2-ar/rafeindabygging` Level 3 has the answer at index 0 on all 8 items.
- `apps/games/1-ar/dimensional-analysis/src/components/Level3.tsx:594` advertises "⚠️ 10% dregið frá heildareinkunn" whenever a hint opens, while `hintPenalty` is `0` at `:192` — the penalty is announced but never applied. It is the only surviving occurrence of that string in any game, and it discourages exactly the hint use the April 2026 restructure set out to make free. Measured 2026-08-17.

**The current work order is [`plans/2026-08-16-games-roadmap.md`](plans/2026-08-16-games-roadmap.md)**, with the first phase specified in [`plans/2026-08-16-phase-1-correctness.md`](plans/2026-08-16-phase-1-correctness.md). Both are live August-2026 documents, not history.

## Icelandic terminology

`packages/shared/i18n/ordabok.md` **governs**. It was moved into the shared library deliberately, which is the statement that it applies to every game. Authority order when a term is disputed:

1. `packages/shared/i18n/ordabok.md`
2. `~/dev/repos/namsbokasafn-efni` — the school's own textbook corpus
3. A teaching decision from Siggi, only where both are silent or disagree

The complete ruling — ~30 term corrections, each with its glossary citation and its status in this repo — is the terminology section of [`FEBRUARY-DECISIONS-RECOVERED.md`](FEBRUARY-DECISIONS-RECOVERED.md). Nothing currently enforces the glossary; see that document's closing section for why a one-time patch will not hold.

## Platform and operations

| Document                                     | What it holds                                        |
| -------------------------------------------- | ---------------------------------------------------- |
| [`KVENNO-STRUCTURE.md`](KVENNO-STRUCTURE.md) | The master design document for the platform          |
| [`DEPLOYMENT.md`](DEPLOYMENT.md)             | Build and deploy                                     |
| [`azure-ad-setup.md`](azure-ad-setup.md)     | Auth configuration                                   |
| [`bundle-sizes.md`](bundle-sizes.md)         | Measured bundle sizes, incl. the Three.js code-split |
| [`i18n-coverage.md`](i18n-coverage.md)       | Translation coverage                                 |

## Superseded — do not read as current

- **`docs/game-reviews/01–17-*.md`** — written before the April 2026 restructure. They describe deleted features (memory-match levels, NameBuilder, achievements, mastery gates, timer modes) and score accuracy 5/5 on data files that contain verified errors. Kept for history only.
- **`apps/games/{1,2,3}-ar/REVIEW_TRACKER.md`** — accurate within their own P1–P7 rubric, which does not cover curriculum, chemical correctness, or whether the answer is visible before the student answers. "Zero FAIL ratings" is true only inside that rubric.
- **`apps/games/{1,2,3}-ar/SUGGESTED_IMPROVEMENTS_*.md`** — pre-restructure per-game idea lists. `SUGGESTED_IMPROVEMENTS_1-AR.md` covers 5 of the 7 Y1 games (no `lotukerfid`, no `jafna-jofnur`); `SUGGESTED_IMPROVEMENTS_2-AR.md` covers 7 of the 8 Y2 games (no `rafeindabygging`). `SUGGESTED_IMPROVEMENTS_3-AR.md` is complete for its year but equally pre-restructure. All three analyse features the April 2026 restructure removed.
- **`docs/game-issues-plan.md`**, **`docs/plans/2026-02-*.md`**, **`docs/plans/DESIGN_SYSTEM.md`**, **`docs/plans/MODERNIZATION_PLAN.md`** — historical plans, retained for provenance. The two `docs/plans/2026-08-16-*.md` documents are _not_ superseded; they are the current roadmap and its first phase, linked above.
