# Orphaned Games — Assessment of `namsbokasafn-leikir`

**Date:** 2026-08-15
**Question:** the old repo `~/dev/repos/namsbokasafn-leikir` holds 32 game projects; kvenno-app kept 20. What is in the 12 that were left behind, and would any of them fit here?
**Companion:** `apps/games/1-ar/CURRICULUM_REVIEW.md` (the gaps these games are measured against)
**Method:** one agent per orphaned game, reading all source and data files, with file:line evidence required on every claim.

---

## Why they were left behind

Not a chrome decision. The migrated games are the **chrome-heaviest** in the old repo, and the stripping happened afterwards, here.

| Old-repo game                                                                                                                     | timer | streak | confetti | sound | penalty |             |
| --------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ | -------- | ----- | ------- | ----------- |
| takmarkandi                                                                                                                       | 5     | 4      | 2        | 2     | 0       | migrated    |
| lausnir                                                                                                                           | 5     | 4      | 0        | 0     | 2       | migrated    |
| molmassi                                                                                                                          | 3     | 1      | 2        | 0     | 1       | migrated    |
| dimensional-analysis                                                                                                              | 3     | 0      | 2        | 0     | 1       | migrated    |
| hlutfallsgreining, uppbygging-atomanna, calorimetry, electrochemistry, organic-reactions, ka-kb-jafnvaegi, solubility-equilibrium | 0     | 0      | 0        | 0     | 0       | **orphans** |

(counts = files matching each pattern under `src/`)

What predicts migration is **when the game was written**, and the split is exact:

- **All 17 games consolidated on 2026-02-19 (`914e6f5`) were first committed in 2025** — 2025-11-28 through 2025-12-29. Every one.
- **All 12 orphans were first committed 2026-02-01 → 2026-02-04**, a four-day burst. Not one of them made the cut.
- Orphans: 1788–2895 LOC, **exactly 5 source files each** (App + Level1/2/3 + i18n) — one template.
- Consolidated games: 2281–7196 LOC across 2–15 files.
- Old repo's last commit 2026-02-05; consolidation 2026-02-19, two weeks later.

There are **no exceptions in either direction**. The boundary is the turn of the year: everything built in 2025 came over, nothing built in February 2026 did.

None of the orphans ever entered kvenno-app: `git log --all` returns zero commits touching any of their paths. They were dropped at consolidation, not deleted later, and nothing in either repo records the decision.

### Then three games were written fresh, here

Consolidation brought **17** games, not 20. The other three were **created in kvenno-app on 2026-04-14**, in the very same two commits that stripped the chrome:

| Commit    | What it did                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `8ce63d5` | "strip gamification chrome from y1 games, **add jafna-jofnur and lotukerfid games**" — chrome removed from _all 5_ Y1 games, and two new games added           |
| `bbbdd12` | "strip gamification chrome from y2/y3 games, **add rafeindabygging game**" — chrome removed from all 12 Y2/Y3 games, plus a new Ch-6 electronic-structure game |

Two of those three duplicate topics that already existed in the old repo, and both were **written fresh rather than ported** — different data models entirely:

- `jafna-jofnur` (new) vs `stilltu-efnajofnur` (old). The new `data/reactions.ts` stores per-molecule element-composition maps so atoms can be counted programmatically — which is what makes the live `AtomCounter` possible. The old `data/equations.ts` opens with an `ELEMENT_COLORS` table and a `ReactionType` union. The rewrite is the better design.
- `lotukerfid` (new, 1836 LOC) vs `lotukerfid` (old, 1693 LOC). Independent implementations; the new one adds a reusable `PeriodicTable.tsx`.

**One regression came out of that rewrite.** The old `lotukerfid` shipped `src/data/trends.ts` — 200 lines of periodic-trend content (atomic radius, ionization energy, electronegativity) with the rule for each trend across periods and down groups, in Icelandic and English, plus per-question explanations. The rewrite dropped it and nothing replaced it: grepping all 20 games for `atómgeisli|jónunarorka|rafdrægni|electronegativ|ionization` returns only an unused i18n label in IMF and an unrelated "autoionization" string in equilibrium-shifter. Periodic trends are taught nowhere in the platform.

**Consequence:** all 12 are frozen at the **pre-restructure state**. Every defect the April 2026 restructure removed from the shipped games is still present in these — and in the same places, because both sets came from one template.

---

## The template pathology

Every one of the seven Year-1 orphans shares the same defect set, and it is the same set the curriculum review found in the shipped games:

1. **The answer is on screen before the student answers** — in _all seven_. `flokkun-efna`: only pure substances carry a `formula` field, and it renders above the buttons, so the formula alone resolves half the four-way choice. `jonir-i-lausn`: all 15 Level-1 descriptions name the category in words ("Sterk sýra sem leysist algjörlega"). `sydur-og-basar`: Icelandic acid/base names are suffix-transparent and the name prints above the two buttons. Combined with the four leaks already found in the shipped games, **11 of 12 Y1 games leak the answer** — this is inherited from the template, not per-game sloppiness.
2. **Score, streak counters and streak bonuses** through every level.
3. **Hints that cost points**, several advertising the penalty in the button label (`'Sýna vísbendingu (-50 stig)'`).
4. **Completion- or score-gated levels** with padlocks — ironically the one thing the shipped games _should_ have kept.
5. **Three levels that are the same task with progressively less support** — the opposite of a scaffolding fade.
6. **No shared site chrome** — no Header, Breadcrumbs, Footer, FeedbackPanel or HintSystem; each ships its own gradient shell.
7. **Achievements chrome** wired in throughout. The exports do still exist in `packages/shared/`, so this is dead weight rather than a broken import.
8. **Bilingual/trilingual UI** with a rendered LanguageSwitcher, against the Icelandic-only rule.

Two orphans additionally ship **diacritic-stripped ASCII Icelandic** (þ→th, æ→ae, ð→d) as their actual rendered UI: `uppbygging-atomanna` in all three level components, `sydur-og-basar` across ~45 strings.

---

## Year 1 — the seven orphans

Ordered by value to the curriculum.

### 1. `jonir-i-lausn` — the highest-value orphan → **migrate** (M)

Teaches electrolyte classification (strong/weak/non), solubility rules, and precipitation — Brown 4.1–4.2. Hits **two of the four gaps that no game in any year fills**: `C4-electrolyte` and `C4-precip`, both _deep_.

- Level 1's teach phase is the best in the batch: three clickable conductivity-tester SVGs expanding to definitions plus worked dissociation equations.
- 49 data records across three files.
- **Does not** teach net ionic equations, despite `package.json:4` claiming "nettó jónajöfnur" — net ionic equations are _printed_ after the student has answered, and "áhorfandajón" (spectator ion) appears nowhere. So the largest single gap stays open unless that level is written.
- Blockers: the Level-1 description leak (must be rewritten, not tweaked), a Level-2 hint that _is_ the answer sold for 50 points, and Level 3 testing precipitation with no teach phase.

### 2. `hlutfallsgreining` — **migrate** (M)

Percent composition → empirical formula → molecular formula. Fills `C3-fw` and `C3-empirical`, the latter confirmed absent from all three years. 30 fixed items.

- Response format is free construction throughout — no multiple choice anywhere.
- **Three wrong answer keys in Level 2** (`l2-1`, `l2-5`, `l2-10`) plus a duplicate item pair (`l2-2`/`l2-8`). Non-negotiable fix, independent of migration.
- Entirely test-first: all three levels open on problem 1 with an empty box; the only exposition is a four-bullet objectives list on the menu.
- L1 has no skip, so a student stuck on Al₂(SO₄)₃ can never unlock L2.

### 3. `uppbygging-atomanna` — **rebuild from content** (M)

Subatomic particles, **isotopes**, and average atomic mass as a weighted average — Brown 2.3–2.4. Fills `C2-isotopes`, and its Level 3 teaches exactly the mass-number-vs-weighted-average distinction that **blocker B1 in Lotukerfið currently gets wrong**. Fixing B1 and filling this gap are the same piece of work.

- Free numeric construction throughout, never multiple choice; teach-before-test at every level.
- Ions deliberately excluded (neutral atoms hardcoded), so it does not also fill `C2-ions`.
- Blockers: ASCII-stripped Icelandic in all three levels; L1 and L2 are mechanically the same exercise; the Bohr model is a static SVG in a level titled "Byggðu atómið" where the student never places a particle.

### 4. `markverdir-tolustafir` — **rebuild from content** (M)

Significant-figure counting rules and the +/− vs ×/÷ rules, plus a third level on scientific notation — which no game in the monorepo covers at all. Fills `C1-uncert`, currently _graded but never taught_ in Einingagreining.

- All 44 items verified sound.
- Teaches sig figs as **digit-counting, not as a property of a measurement**: every item is a bare number with no units, no instrument, no measurement context. Precision vs accuracy is never taught.
- Grading is `parseFloat` equality, which is semantically wrong for a sig-figs game — `1.50` and `1.5` compare equal. Needs rewriting regardless.
- Blockers: score-gated levels (≥500 points), a 30-second countdown in Level 3, trilingual i18n.

### 5. `sydur-og-basar` — **rebuild from content** (M)

Arrhenius acid/base classification, neutralization with balanced equations, and neutralization solution stoichiometry. Fills `C4-acidbase` (neutralization as a reaction class) and the **stoichiometric half of `C4-soln-stoich`** — both named gaps.

- All 10 neutralization equations balance; all 8 stoichiometry answers recomputed correct, including the 1:2 and 2:1 ratio cases. ~33 verified items.
- Structurally already teach-before-test.
- No pH, no indicators, no titration, no dissociation, and **not one `(aq)` symbol**.
- Blockers: Level 1 invalid as assessment (answer printed above the question, all 15 items); Level 3's grader accepts ±0.5 absolute regardless of unit, making both 0.10 M problems unfailable; ~45 ASCII-Icelandic strings.

### 6. `flokkun-efna` — **rebuild from content** (M)

Classification of matter: element / compound / homogeneous / heterogeneous, 24 items evenly split 6/6/6/6. Fills `C1-matter`, currently used as an unexplained prerequisite. All 24 classifications are defensible, and the O₂ hint handles the diatomic-element trap well.

- **The central definition is wrong.** Homogeneous vs heterogeneous is defined by _visibility_ (`classifications.ts:50,58`) rather than by composition varying point to point. Under that rule any uniform-looking colloid — milk, mayonnaise, fog — classifies as homogeneous. Must be rewritten before use.
- Rust given as Fe₂O₃ (real rust is hydrated, Fe₂O₃·nH₂O, and in practice a mixture) — and it is a visible counterexample to the game's own rule sitting in the pure-substance bin.
- "Málmblöndun" is the process, not the material: should be **málmblendi**. Three student-facing occurrences.
- States of matter never appear; `C1-props` (physical vs chemical change, separation techniques) is absent.
- Structure is one MCQ task repeated three times with less support each time, and both answer leaks are properties of that shape — they cannot be patched out.

### 7. `gerdir-efnahvarfa` — **rebuild from content** (L to migrate, M to rebuild)

Five reaction patterns — synthesis, decomposition, single replacement, double replacement, combustion — over 20 pre-balanced equations. Fills `C3-rxntypes`, and sits exactly on the Y1 chain between Jafna Jöfnur and Takmarkandi.

- All 20 equations verified balanced, including 2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O.
- **The Icelandic reaction-type names contradict the school's textbooks** and are referenced by every level, the summary and all 20 hints — a terminology pass is required before reuse.
- All three levels are the same 5-way MCQ; Level 1's genuinely good explore phase is optional and unassessed, and the quiz button is visible from first render.
- Level 3 is a mandatory 12-second-per-question countdown behind a completion gate.

---

## Recommended sequence (Year 1)

The two `migrate` verdicts are the cheapest curriculum wins in the repo — the content exists, is largely correct, and fills gaps nothing else fills:

1. **`jonir-i-lausn`** → opens chapter 4 beyond molarity. Fix the leak, add the net-ionic level, and the largest hole closes.
2. **`hlutfallsgreining`** → fix the three wrong keys first, then migrate.
3. **`uppbygging-atomanna`** → do this together with Lotukerfið blocker B1; one body of work, two problems solved.
4. **`markverdir-tolustafir`** → pair with Einingagreining, which already grades sig figs it never teaches. Rewrite the grader.
5. **`sydur-og-basar`**, **`flokkun-efna`** → content is sound but each needs one conceptual fix first (the ±0.5 grader; the visibility definition).
6. **`gerdir-efnahvarfa`** → needs the terminology decision from you before any code work.

All seven need the same standard treatment regardless: strip score/streak/timer/penalty chrome, adopt shared Header/Breadcrumbs/Footer/FeedbackPanel, remove the answer leaks, add "Af hverju?" context and chain position, and fix the Icelandic. That is the same pass the shipped games received in April 2026 — the orphans simply never got it.

---

_Year 2 and Year 3 orphans (`calorimetry`, `electrochemistry`, `organic-reactions`, `ka-kb-jafnvaegi`, `solubility-equilibrium`) — assessment pending, to be appended._
