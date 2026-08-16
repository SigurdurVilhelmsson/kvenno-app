# Orphaned Games — Assessment of `namsbokasafn-leikir`

**Date:** 2026-08-15, substantially revised 2026-08-16
**Question:** the old repo `~/dev/repos/namsbokasafn-leikir` holds **33 game directories** (31 live + 2 archived); kvenno-app took **17** and wrote 3 more from scratch. What is in the **16** that were left behind, why were they left, and would any of them fit here?
**Companion:** `apps/games/1-ar/CURRICULUM_REVIEW.md` (the gaps these games are measured against)
**Method:** one agent per game, reading all source and data files, with file:line evidence required on every claim; every headline claim then re-checked by an adversarial verifier instructed to refute it. The causal section additionally used six forensic agents and three competing hypotheses argued independently before being judged.

> **Read the revision note.** The first version of this document (commit `583f073`) got the causal story wrong and shipped a chrome table that contradicted its own prose. Both are corrected below, and the corrections are itemised rather than quietly overwritten — see [Corrections to the first version](#corrections-to-the-first-version-of-this-document).

---

## Why they were left behind

**Nothing was judged and nothing was rejected. There was no selection event.**

The local clone of `namsbokasafn-leikir` had been sitting untouched since **2026-01-25 20:59** (`912d997`). On 2026-02-19 kvenno-app was built by copying what was on disk — and what was on disk was exactly the 17 games that came over. The 14 missing games were written by cloud/agent sessions (PRs #87–#100) in a four-day burst on **1–4 February**, straight to GitHub. They did not reach the machine until the pull on **2026-05-10**, 80 days after the migration.

That is why five independent searches found no commit message, no PR and no document explaining the choice. **No rationale was recorded because no decision was ever made.**

### The evidence

Established by measurement, and re-verified by hand:

- **Byte-level provenance.** For each of the 17 migrated games, `git ls-tree -r 914e6f5 -- apps/games/<g>/src` matches `git ls-tree -r 912d997 -- games/<g>/src` at **219/219 blobs, 100% per game**. Against the old repo's actual HEAD (`379266e`) the same trees hold 253 files with only 162 matches. Spot-re-verified independently: takmarkandi 17/17, hess-law 9/9, equilibrium-shifter 10/10. The migration source is fingerprinted to one specific commit.
- **The reflog freeze.** `.git/logs/HEAD` in the old repo: the last local move is `912d997` at epoch 1769374740 (2026-01-25 20:59:00); the next two entries are `reset: moving to HEAD` (1778414574) and `379266e … pull: Fast-forward` (1778414580), both 2026-05-10. **Zero activity spans 2026-02-19.**
- **The frozen tree is the migrated set.** `git ls-tree -d 912d997:games/{1,2,3}-ar` returns exactly 5 / 7 / 5 directories — precisely the 17 present at `914e6f5`, and precisely the "17 chemistry games (5 year-1, 7 year-2, 5 year-3)" that commit's own body claims.
- **Stripping post-dates migration.** No commit anywhere in the old repo — main, all 33 branches, both stashes — removes gamification chrome; the counts rise monotonically to its last commit. The stripping is two commits _here_: `bbbdd12` (2026-04-14 13:23, Y2/Y3) and `8ce63d5` (2026-04-14 16:16, Y1), two months after `914e6f5`. **The games arrived in kvenno-app with scoring and achievements fully intact.**

### The fact that settles it: the migration also amputated finished work from games that were kept

`git diff --name-status 912d997 379266e` over the 17 **kept** game directories shows **34 added `.ts`/`.tsx` files**, none of which ever entered kvenno-app on any ref (`git log --all --diff-filter=A` returns 0 commits for each of `Level4.tsx`, `Level5.tsx`, `ICETable.tsx`, `FactoryMode.tsx`, `MysteryMolecule.tsx`, `Pipette.tsx`, `EquationBuilder.tsx`, `QKChallenge.tsx`).

Among them: the `Level4.tsx` of lausnir, molmassi, takmarkandi, hess-law, kinetics, lewis-structures, intermolecular-forces, organic-nomenclature and ph-titration (counted as eight in one pass and nine in another; the discrepancy is not resolved); molmassi's `Level5.tsx` + `MysteryMolecule.tsx` + `data/conversionChains.ts`; takmarkandi's `FactoryMode.tsx` + `StoichiometryVisualization.tsx`; equilibrium-shifter's `ICETable.tsx` + `QKChallenge.tsx` + `utils/ice-table.ts`; lausnir's `Pipette.tsx` + `IndicatorSystem.tsx` + `data/saturation.ts`; hess-law's `EquationBuilder.tsx`; dimensional-analysis's `Level4Chemistry.tsx` + `UnitConversionBuilder.tsx`.

Verified absent today: no `Level4` or `Level5` exists under `apps/games/{1-ar/molmassi,1-ar/takmarkandi,3-ar/ph-titration,3-ar/equilibrium-shifter}/src/components/`, and a grep for `ICETable|ICE tafla|jafnvægistafla` across all 20 shipped games returns zero.

**No curator selecting for completeness removes Level 4 from a game they are carrying over. A stale snapshot does it automatically.** This work is recoverable from the old repo at `379266e`.

**Two rows of `CURRICULUM_REVIEW.md` are wrong-as-diagnosed because of it:**

- `CURRICULUM_REVIEW.md:72` — "Percent yield ○ **Advertised but never taught** — `takmarkandi/src/i18n.ts:11` promises 'reikna heimtir'; nothing in the game delivers it." The old `games/1-ar/takmarkandi/src/components/Level4.tsx` imports `PERCENT_YIELD_PROBLEMS`, `calculateTheoreticalYield` and `calculateActualYield` from `data/molarMasses.ts`, which holds 8 problems with `actualYieldPercent` values. **The promise was true when written.** That i18n line is an amputation scar, not false advertising.
- `CURRICULUM_REVIEW.md:68` — "No gram→mole→ratio→mole→gram calculation exists anywhere in Y1." The old `games/1-ar/molmassi/src/data/conversionChains.ts` opens `// Mole Conversion Chain Problems / Mass → Moles → Molecules → Atoms` and drives `Level5.tsx`; `Level4.tsx` + `avogadro.ts` cover Avogadro's number with scientific-notation input parsing.

Keep the distinction sharp: `C3-yield` and the mole-chain row are **taught, then lost**. `C4-electrolyte`, `C3-empirical`, `C4-precip`, net-ionic, isotopes and separation techniques are **genuinely empty** — re-tested on Icelandic stems (`rafkleyf`, `rafleiðar`, `raflausn`, `jónast`, `reynsluformúl`, `botnfall`, `útfelling`, `leysnireglur`, `samsæt`, `massatal`, `eiming`, `litskilj`, `síun`, `aðskilnað`) across all 20 shipped games' `src/` and their built HTML, with zero or false-positive-only hits. `(aq)` returns 12 hits, **all Year 3** — so the Y1 claim holds, and Y3 uses a notation Y1 never introduces.

### What is inference, and what is not determined

**Inference:** that the stale checkout is the _whole_ mechanism. It explains 31 of 33 directories. `games/archive/ph-titration-master` and `ph-titration-practice` were first committed 2025-11-28/29 (`9d59d66`, `d37ec64`), **were** on disk at `912d997`, and still did not migrate. A second filter ran — a path glob over `games/{1,2,3}-ar/*`, or the frozen 17-entry `scripts/build-games.mjs` (last touched 2025-12-31, `3c47726`, listing exactly those 17) — and which one is **not determined**; `914e6f5` is a squashed commit preserving no import script.

**Not determined:** whether the February PRs were known to exist on 2026-02-19. If they were reviewed and passed over, a deliberate-selection reading reopens; the reflog implies they were out of sight. Also not determined: what "completed" meant subjectively. Every contemporaneous document in the old repo marks all 27 games complete and production-ready (`repository-status.md:185`, `:235`; `docs/_generated/games.md:49`), so an unwritten personal standard can be neither confirmed nor refuted — though it remains true that no such standard was _applied_, because the 14 games were not present to filter.

### Chrome did not predict migration

The first version of this document asserted that "the migrated games are the chrome-heaviest in the old repo" and printed a table scoring every orphan at zero on timer, streak, confetti, sound and penalty. **Both halves are wrong**, and they contradicted this document's own prose forty lines further down.

Re-measured across all 33 projects: the direction holds on average (migrated mean 3.35 vs orphan 1.50 on those five patterns) but there is no separation. **Seven of the 17 migrated games score exactly zero**, and the orphan `flokkun-efna` scores 5, outscoring 12 of the 17 migrated games. The omitted non-zero orphans: `flokkun-efna` timer=2/streak=3, `gerdir-efnahvarfa` timer=2/streak=3, `jonir-i-lausn` streak=3, `markverdir-tolustafir` timer=1, `sydur-og-basar` streak=4. Sorted honestly, the boundary vanishes.

The zeros were a measurement artefact. The regex `penalty|deduct` structurally cannot match a labelled Icelandic cost — `uppbygging-atomanna` scored penalty=0 while shipping `Sýna vísbendingu (-50 stig)` at `Level1.tsx:365`, `Level3.tsx:260` and `i18n.ts:100` — nor the reduced-award form (`hlutfallsgreining/src/components/Level3.tsx:84-85`, `showSteps ? 5 : showHint ? 7 : 10`). Twelve files across seven orphans carry a `(-N stig)` label. **The prose was correct; the table was measuring an English-identifier vocabulary that could not see what the prose described.** It has been removed rather than patched.

None of the 16 left-behind games ever entered kvenno-app: `git log --all` returns zero commits touching any of their paths. They were never dropped or rejected — they simply were not in the tree that was copied.

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

**One regression came out of that rewrite** — and it is the cheapest recoverable item in this entire document.

The old `lotukerfid` shipped `src/data/trends.ts`: exactly 200 lines, verified by hand. It defines three trend types with an Icelandic and English name, description and **rule** each — `Atómgeisli` ("minnkar eftir lotu og stækkar niður hópa"), `Jónunarorka` ("eykst eftir lotu og minnkar niður hópa"), `Rafneikvæðni` ("eykst eftir lotu og minnkar niður hópa (eðalgös undanskilin)") — plus **12 paired comparison questions**, four per trend, each with an Icelandic explanation. All three rules are correct as stated, and **all 12 answer keys verify correct**: Na>Cl, Na>Li, S>O, C>F on radius; F>Li, Na>K, Mg>Ca, N>B on ionization energy; Cl>Na, F>Cl, O>C, Br>K on electronegativity.

It also uses `Rafneikvæðni` — the term this codebase already uses elsewhere — not the `rafdrægni` that returns zero hits.

The rewrite dropped it and nothing replaced it. `grep -rn "Atómgeisli|Jónunarorka|Rafneikvæðni|atomic-radius|ionization" apps/games/1-ar/lotukerfid/src/` returns **nothing**.

**Verdict on old `lotukerfid`: harvest-content-only, effort S.** Lift `trends.ts` into `apps/games/1-ar/lotukerfid/src/data/` and give it a level. Nothing else in the old implementation is worth taking — the shipped rewrite is the better architecture, as noted above.

**One correction to a natural misreading:** the old `lotukerfid` does **not** fix the shipped game's neutron blocker (`CURRICULUM_REVIEW.md` B1). It contains no neutron counting at all — `grep -rn "nifteind|neutron|massatala|massNumber|samsæt|isotope"` over its `src/` returns zero hits, and the shipped bug is still live at `apps/games/1-ar/lotukerfid/src/components/Level3.tsx:31-32`, `Math.round(el.atomicMass) - el.atomicNumber`. The isotope content that fixes B1 is in `uppbygging-atomanna`, a different game.

The grep behind that claim was partly wrong and has been re-run. `rafdrægni` returns **0** hits — it is not the term this codebase uses; `rafneikvæðni` returns 2. The original conclusion survived only because `electronegativ` was in the same alternation. And "only an unused i18n label in IMF" is wrong: `apps/games/2-ar/intermolecular-forces/src/components/Level1.tsx:24` puts `'Rafneikvæðni'` in `RELATED_CONCEPTS.dipole`, spread into rendered output at `:911` when `molecule.isPolar` — live UI, not a dead label. **The core claim survives: periodic trends are nowhere _taught_ in the platform.**

**Consequence:** all 16 left-behind projects are frozen at the **pre-restructure state**. Every defect the April 2026 restructure removed from the shipped games is still present in these, for the simple reason that the restructure happened here and they were not here to receive it.

---

## The shared defect set — and why "fix the template" is not available

Every one of the seven Year-1 orphans shares the same defect set, and it is the same set the curriculum review found in the shipped games. The first version of this document attributed that to a shared code template. **That premise is false, and it was checked:** `tools/game-template/src/App.tsx` is 175 lines, imports only `useProgress`, `useAccessibility`, `useGameI18n` and `LanguageSwitcher`, and has no score, no streak, no timer, no hint cost, no level gate, no achievements and **no question of any kind** — its game screen is a placeholder div. Of the eight items below, only #6 (by omission) and #8 are template-inherited.

The defects really are shared across the orphans; the common ancestor is a **generation prompt, not a file**. The practical consequence is that there is no single upstream fix — each game carries its own copy of the pathology and must be treated individually.

1. **The answer is on screen before the student answers** — in _all seven_. `flokkun-efna`: only pure substances carry a `formula` field, and it renders above the buttons, so the formula alone resolves half the four-way choice. `jonir-i-lausn`: all 15 Level-1 descriptions name the category in words ("Sterk sýra sem leysist algjörlega"). `sydur-og-basar`: Icelandic acid/base names are suffix-transparent and the name prints above the two buttons. Combined with the four leaks already found in the shipped games, **11 of 12 Y1 games leak the answer**.
2. **Score, streak counters and streak bonuses** through every level.
3. **Hints that cost points**, several advertising the penalty in the button label (`'Sýna vísbendingu (-50 stig)'`).
4. **Completion- or score-gated levels** with padlocks — ironically the one thing the shipped games _should_ have kept.
5. **Three levels that are the same task with progressively less support** — the opposite of a scaffolding fade.
6. **No shared site chrome** — no Header, Breadcrumbs, Footer, FeedbackPanel or HintSystem; each ships its own gradient shell.
7. **Achievements chrome** wired in throughout. The exports do still exist in `packages/shared/`, so this is dead weight rather than a broken import.
8. **Bilingual/trilingual UI** with a rendered LanguageSwitcher, against the Icelandic-only rule.

**Diacritic-stripped ASCII Icelandic** (þ→th, æ→ae, ð→d) ships as rendered UI in `uppbygging-atomanna` (all three level components) and `sydur-og-basar`. Two corrections to the first version: the counts appear to have been swapped — a consistent token detector gives ~20 for `sydur-og-basar` and ~45 for `uppbygging-atomanna` — and **treat both figures as unverified in either direction**, since any token list undercounts and `sydur-og-basar` mixes correctly-rendering HTML entities with genuinely stripped ASCII, sometimes on one line (`Level3.tsx:286`, `Retta svari&eth;`: the entity renders, `Retta` does not). More importantly, this is **not an orphan trait**: of the seven old-repo projects that ship it, five are migrated or superseded (`lausnir`, `molmassi`, `vsepr-geometry`, `equilibrium-shifter`, old `lotukerfid`) and only two are orphans. `apps/games/2-ar/vsepr-geometry` was still shipping it at the time of measurement.

---

## Corrections to the first version of this document

Every claim below has been fixed in place above. It is itemised here because a document that quietly rewrites itself teaches you nothing about how much to trust its next version.

| What the first version said                               | What is true                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "32 game projects; kvenno-app kept 20"                    | 33 directories (31 live + 2 archived). **17** migrated; the other 3 kvenno games were written fresh on 2026-04-14.                                                                                                                                                                                                    |
| "the 12" orphans                                          | **14** left behind (the 12 named, plus `stilltu-efnajofnur` and old `lotukerfid`); **16** counting the archive pair. The first version discussed two of them without counting them.                                                                                                                                   |
| "The migrated games are the chrome-heaviest"              | Direction holds on average, but 7 of 17 migrated games score zero and the orphan `flokkun-efna` outscores 12 of them. Chrome has no discriminating power.                                                                                                                                                             |
| The chrome table                                          | Cherry-picked: the "orphans" row aggregated 7 of 12 and omitted the five non-zero ones; the migrated rows were the four heaviest of 17. Removed.                                                                                                                                                                      |
| Table says penalty=0, prose quotes `(-50 stig)`           | **The table was the defective half.** Its regex could not match a labelled Icelandic cost. The prose was right.                                                                                                                                                                                                       |
| "exactly 5 source files each"                             | False of the source trees: hlutfallsgreining 10, uppbygging-atomanna 10, calorimetry 8, electrochemistry 8, organic-reactions 8, solubility-equilibrium 12, ka-kb-jafnvaegi 14.                                                                                                                                       |
| "Orphans: 1788–2895 LOC … 2–15 files"                     | Orphans measure 1902–3009 LOC; migrated `src/` file counts are 8–22.                                                                                                                                                                                                                                                  |
| "no exceptions in either direction… the turn of the year" | Refuted twice over. The archive pH pair is from November 2025 and did not migrate. The real cut is **2026-01-25 20:59**, not the year line — they coincide only because no game was created between 2025-12-29 and 2026-02-01, which makes the year-line claim unfalsifiable exactly where it differs from the truth. |
| "What predicts migration is when the game was written"    | Correlation right, mechanism wrong. Date is collinear. The operative variable is **presence in the local working tree on consolidation day**.                                                                                                                                                                         |
| "dropped at consolidation… nothing records the decision"  | Nothing was dropped or rejected. The second clause is right for the wrong reason: no rationale exists because no decision was made.                                                                                                                                                                                   |
| "inherited from the template"                             | The template is 175 lines with no scoring, no gating and no questions. The shared ancestor is a generation prompt, not a file — so there is no upstream fix.                                                                                                                                                          |
| "three wrong answer keys in Level 2"                      | Only `l2-5` is a key edit; `l2-1` needs corrected percentages; `l2-10` must be regenerated.                                                                                                                                                                                                                           |
| "reaction-type names contradict the school's textbooks"   | Not verifiable — no textbook is named. Half the fix is mechanical from the glossary; half needs a decision.                                                                                                                                                                                                           |
| "`sydur-og-basar` across ~45 strings"                     | Figures appear swapped (~20 vs ~45), and both are unverified. Also not an orphan trait — 5 of the 7 projects shipping ASCII Icelandic are migrated or superseded.                                                                                                                                                     |
| the periodic-trends grep                                  | `rafdrægni` returns 0 hits; the codebase uses `rafneikvæðni`. The IMF hit is live UI, not a dead label. The conclusion survives.                                                                                                                                                                                      |
| "The exports do still exist in `packages/shared`"         | **Correct, and re-confirmed.** The achievements surface is fully intact and still exported, with zero production importers under `apps/`.                                                                                                                                                                             |
| — _omission_                                              | The consolidation also lost **34 finished files from games that did migrate**. It is the fact that refutes every judgment-based explanation, and the first version never mentioned it.                                                                                                                                |

---

## Year 1 — the seven orphans

Ordered by value to the curriculum. This section was written on a **curriculum-and-correctness** axis; the four-axis assessment (structure/pedagogy, UX/chrome, coverage, fit) for these same seven is in [The leftover games, assessed](#the-leftover-games-assessed) below.

### 1. `jonir-i-lausn` — the highest-value orphan → **migrate** (M)

Teaches electrolyte classification (strong/weak/non), solubility rules, and precipitation — Brown 4.1–4.2. Hits **two of the four gaps that no game in any year fills**: `C4-electrolyte` and `C4-precip`, both _deep_.

- Level 1's teach phase is the best in the batch: three clickable conductivity-tester SVGs expanding to definitions plus worked dissociation equations.
- 49 data records across three files.
- **Does not** teach net ionic equations, despite `package.json:4` claiming "nettó jónajöfnur" — net ionic equations are _printed_ after the student has answered, and "áhorfandajón" (spectator ion) appears nowhere. So the largest single gap stays open unless that level is written.
- Blockers: the Level-1 description leak (must be rewritten, not tweaked), a Level-2 hint that _is_ the answer sold for 50 points, and Level 3 testing precipitation with no teach phase.

### 2. `hlutfallsgreining` — **migrate** (M)

Percent composition → empirical formula → molecular formula. Fills `C3-fw` and `C3-empirical`, the latter confirmed absent from all three years. 30 fixed items.

- Response format is free construction throughout — no multiple choice anywhere.
- **Three defective Level-2 items**, but only one is a key edit — the first version of this document overstated the fix. `l2-5` (`data/compounds.ts:303`) is a genuine key error: N 35.00 / H 5.04 / O 59.96 gives N₂H₄O₃, the key says `NH₂O₃`. `l2-1` (`:262`) is named "Vetnis peroxíð grunnformúla" and feeds `l3-2` (`:394`), so the **percentages** are the defect, not the key (should be H 5.93 / O 94.07). `l2-10` (`:354`) yields no clean formula at all — Mg 28.83 / P 22.04 / O 49.13 against real Mg₃(PO₄)₂ at 27.74 / 23.57 / 48.69 — **no key edit fixes it; the data must be regenerated.** The `l2-2`/`l2-8` duplicate is confirmed; `l2-3,4,6,7,9` and all of L3 recompute correct.
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
- **The Icelandic reaction-type names need a terminology pass**, and they are referenced by every level, the summary and all 20 hints. The first version claimed they "contradict the school's textbooks" — that is not verifiable from either repo, since no textbook is named. What _is_ checkable: `Sundurliturarhvarf` (`i18n.ts:46`, `:69`, `data/reactions.ts:48`) is not an Icelandic chemistry word, the glossary supplies `decomposition reaction;niðurbrotsefnahvarf` at `packages/shared/i18n/ordabok.md:132`, and **the game already uses that root** in three item names (`reactions.ts:176,191,206`). So about half the terminology blocker is mechanically fixable today. The genuinely blocked half: the glossary has no entry for synthesis, replacement, displacement or metathesis — that needs your decision.
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
