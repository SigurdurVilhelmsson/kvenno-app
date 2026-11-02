# Einingagreining

Chain position 1 of 10 in Year 1, ahead of Lotukerfið (the `Námsleiðin` string in `src/App.tsx`
underlines this node). The game teaches dimensional analysis: that a conversion factor is a fraction
equal to 1, that the unit to be removed goes in the denominator and cancels, how to chain factors,
and — in its Stig 0 — significant figures, which Stig 3 checks.

It is **not** `1-ar/einingakedjan` (Einingakeðjan, the last node of the same chain). The names differ
by four letters; the 2026-09-19 session record once confused them.

## Structure

Four levels, none gated (Siggi's ruling, 2026-08-29; `__tests__/no-level-gating.test.ts` scans the
source for any level being opened or locked). There is no timed mode.

| Stig | Menu name         | What it asks                                                                                                                                                                                                        |
| ---- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Markverðir stafir | The four counting rules worked, then 6 counting items (buttons 1–5), 5 roundings typed as digits and an optional power of ten, and 5 arithmetic items (buttons 0–4) on the × and + rules                            |
| 1    | Hugtök            | 6 hands-on challenges, no arithmetic: equivalence (1000 mL = 1 L), building a factor, cancelling mL → L, factor orientation km → m, chains mg → kg and klst → s. Each waits until it is solved                      |
| 2    | Beiting           | All 15 problems of `data/problems.ts` in order (5 one-step, then 5 medium and 5 advanced of one or two steps): build the chain from shuffled factors and distractors, by drag or a button list, then type the value |
| 3    | Útreikningar      | 12 items drawn from a pool of 41 (`utils/level3Run.ts`), each with a required written explanation: 15 synthesis, 10 real-world, 6 derivation, 5 efficiency, 3 error analysis, 2 reverse                             |

**Grading.** Typed values are `type="text"` with `inputMode="decimal"` (`DECIMAL_INPUT_PROPS`) and
read with `parseStudentNumber`, re-exported from `src/utils/grading.ts`. Stig 2 and Stig 3 grade on a
**1 % relative tolerance** (`RELATIVE_TOLERANCE` and `isAnswerCorrect` in `grading.ts`); Stig 3's
real-world items, all ten of which set `requireInteger`, take the exact whole number. Stig 2 grades
the chain as a multiset of factors, so the right factors in any order are right. Stig 0's roundings
are graded exactly, never within a tolerance, and on value **and** figure count (`checkWritten` in
`Level0SigFigs.tsx`). Stig 3's one scientific-notation item (L3-6, the speed of light) takes Stig 0's
two-field row (`WrittenNumberRow`, read strictly by `readWritten`), not one text field.

**Ends and the menu.** Stig 0 and Stig 1 cannot end wrong and report completion (`Stigi 0 lokið`;
`Þú kláraðir allar {n} áskoranirnar`). Stig 2 and Stig 3 end with
`Stigi lokið: N af M rétt.` and a sentence on mastery. Stig 2 is mastered at 80 % right (12 of 15);
Stig 3 at an average composite of 0,75, where the composite is answer 40 %, method 30 %,
explanation 20 % (by length, `scoreExplanation`) and efficiency 10 % (`utils/scoring.ts`). The
significant-figure panel on Stig 3's synthesis items is feedback only; it is not in the composite.
The menu shows `Lokið` under a mastered level and nothing else. Progress is `{ completed: number[] }`
under the localStorage key `dimensional-analysis-progress` (`useGameProgress` in `App.tsx`).

## Stig 0 — Markverðir stafir

Added 2026-09-19 on Siggi's ruling that significant figures live **inside Einingagreining**, not in a
game of their own. The gap was specific: Stig 3 already showed a red panel for a wrong figure count
and `challenges.ts` asked for "3 markverðum stöfum", while nothing taught the rule. Levels 1 and 2
do not mention significant figures at all. Its Icelandic is hardcoded, outside `i18n.ts`.

- **`utils/sigfigs.ts` works on the written string, never on a `number`.** `1200`, `1200,0` and
  `1,200 × 10³` are one quantity written to two, five and four figures; a float cannot tell them
  apart. `countSigFigs` throws on input that is not a number rather than returning 0.
- **Rule 4 follows the book since 2026-10-23 (decision 32 (b)).** A whole number's trailing zeros
  are ambiguous, settled by standard form and otherwise not counted, so a trailing comma changes
  nothing (`1200,` is two, `60,` one). The game used to count them after a comma. Count item c5 is
  now `4,500 × 10³`, the standard-form partner of c4's `4500`.
- **`roundToSigFigs` checks its own output and falls back to standard form.** 60,221 to two figures
  cannot be written plainly — `60` claims one — so r5's answer is `6,0 × 10¹`. A property test
  round-trips 455 cases (`sigfigs.test.ts`).
- **The answer is digits plus an optional power of ten** (`ScientificEntry`, the platform's
  two-field shape), with a `±` button on touch screens because an iPhone decimal keypad has no
  minus. The shipped grader read the printed `6,0 × 10¹` back through `parseStudentNumber`, got 6,
  and marked `6,0` right for sixty. `stig0-r5-play.test.tsx` plays the step to r5 to hold it.
- **Exact factors carry unlimited figures** and are passed to `sigFigsAfterMultiply` as `null`, so
  `2,50 g × (1000 mg / 1 g)` keeps three (item a3) — the reason this belongs in this game.
- **Every answer is derived from the engine, never typed** (`data/sigfig-items.ts`), and
  `sigfig-items.test.ts` re-derives each one, checks the button ranges, and rejects 0, double, half
  and nonsense on every rounding item.
- **Terms.** `staðalform` for scientific notation (decision 33, 2026-10-02); the game's two earlier
  coinages carry a `governed-terms.test.ts` row.

## What matters before touching it

**Stig 2 and Stig 3 grade what the student actually writes.**

- **B13 and half of B9 (fixed 2026-08-26).** An absolute 0,01 tolerance let `0` pass on L2-7's
  0,005 kg, and `parseFloat` read `0,5` as 0. Both lived in one expression; `grading.ts` replaced it.
  `grading.test.ts` guards both.
- **B11 (fixed, confirmed by Siggi 2026-10-23, decision 126).** Position-by-position comparison
  marked a reordered right chain wrong (`usesRightFactors` in `Level2.tsx`). `level2-feedback.test.tsx`.
- **Stig 3 counted the decimal comma as a digit** in its own second counter, so `0,125` was four
  figures. It now counts with `utils/sigfigs.ts`; `utils/scoring.ts` only re-exports it under the old
  name. `level3-grading.test.tsx` holds that, the two-field scientific item, what the submit button
  requires per type, and the shuffled choices.
- **The full stop as a thousands separator (decision 5 (b)+(d), 2026-10-02).** A lone `1.300` reads as
  1,3; Stig 2 and Stig 0, whose answers pass 1000, say so via `dotReadAsDecimalNote` (wording settled
  2026-10-23). `thousands-dot.test.tsx`.

**The Stig 3 data is checked against its own graders** (`challenge-data.test.ts`).

- **The speed of light (Phase 1, 2026-08-18).** L3-6 was keyed 1,08 × 10¹², a thousand times too
  high, and the wrong value leaked through the placeholder. `data-integrity.test.ts`. The old claim
  that L3-12 was unsatisfiable was retired in August by executing the grader; do not reinstate it.
- **L3-10 (2026-08-27).** It offered an inverted factor as a slow-but-valid path, and later marked
  two paths efficient. Efficient now means the minimum step count, as L3-3 already did.
- **B17 (2026-08-27).** Efficiency buttons printed `⚡ Skilvirkt` and the step count; the feedback
  settles it now. The reverse and efficiency choices are shuffled per item.
- **Precision the givens carry (decision 34, 2026-10-23).** L3-12 now gives `0,500 mól`; L3-COOK-2
  asks for no figure count. Each declared count must be writable and accepted.
- **Real-world items (2026-08-27)** were graded with `parseInt`, so `requireInteger` decided nothing, and their
  authored `explanation` was never rendered. `level3-realworld.test.tsx`.

**The February harvest, 2026-08-27.** 25 scenarios from `namsbokasafn-leikir` `dc5e614`, five each
in `eldhús`, `apótek`, `verkfræði`, `íþróttir` and `ferðalög`, took the pool from 16 to 41. Three
had significant-figure counts their own key could not have, one key was unreachable, and the
Icelandic needed rewriting. `HARVEST.md` is the record. A run seeds one item of each of the six
types and spreads settings (`level3-run.test.ts`); header, bar and mastery all count the run
(`level3-run-length.test.tsx`).

**No hint costs anything, and nothing says it does.** Level 3 advertised two different phantom
penalties, on the hint panel and on its button; neither was applied (fixed 2026-08-26).
`hint-cost.test.ts` scans the game's source for penalty wording. Stig 3's running average in its
header, `Meðal: N%`, went with decision 1 (b)
(`no-running-score.test.tsx`), and method credit now comes only from a right answer or the chosen
path, never from explanation length (decision 30 (b), `level3-method-credit.test.tsx`).

**Stig 1 was rebuilt around its challenge components.** C5 and C6 share one component, which kept
C5's finished state; C1 and C2 looped on their success effect; timers marked the next challenge
solved (`level1-run.test.tsx`). The auto-hint counts wrong tries only (decision 24 (a),
`level1-auto-hint.test.tsx`); a block over itself reads `= 1` in red (decision 25 (a),
`level1-fraction-verdict.test.tsx`); chain factors are shuffled (`level1-option-order.test.tsx`).

**Stig 2's chain is one chain.** Drag mode and the button list keep one record, a factor sent back
to the pool leaves the graded path, and the next problem starts clean in one render
(`level2-mode-switch`, `level2-return-to-pool`, `level2-next-problem`). The visualiser splits
compound units such as `km/klst` and cancels pair by pair (`unit-cancellation.test.tsx`).

**Every number on screen has a decimal comma.** Stig 1, the unit blocks, Stig 2's feedback and
Stig 3's cards print through `formatDecimal`, and Stig 3's prompts are written with commas. Factor
strings stay in the data as `1 míla / 1.609 km` (the data tests multiply them out) and are printed
through `withDecimalComma` in `Level3.tsx`.
`level1-decimal-comma`, `unit-block`, `level2-feedback` and `level3-decimal-comma` hold it.

**Terms.** `umreikningsstuðull` and `styttast út` since decision 12 (2026-10-03), the strike-out
button removed by decision 29 (a), and the English `Factor-label aðferð` chip dropped (decision 26).
`challenges.ts` holds the one allowed U+200D, inside the cook emoji that opens L3-COOK-1's prompt
(`no-invisible-characters.test.ts`).

**`e2e/mobile-game-screens.ts` clicks this game by its visible labels**, so renaming a button or
heading means updating its paths in the same change.

## Layout

```
src/App.tsx                          menu, level routing, progress, Námsleiðin; the only t() calls
src/i18n.ts                          is/en/pl strings; only the menu reads them
src/components/Level0SigFigs.tsx     Stig 0; also exports checkWritten and WrittenNumberRow
src/components/Level1Conceptual.tsx  Stig 1, running the four challenge components
src/components/challenges/           Equivalence, FactorBuilding, Cancellation, Orientation;
                                     challengeData.ts holds the 6 challenges
src/components/Level2.tsx            Stig 2: chain builder, grading, summary
src/components/Level3.tsx            Stig 3: run, per-type grading, feedback, summary
src/components/UnitBlock.tsx         UnitBlock, ConversionFactorBlock, EquivalenceDisplay
src/components/UnitCancellationVisualizer.tsx  Stig 2's cancelling picture
src/components/BalanceScale.tsx, UnitTile.tsx  imported nowhere
src/data/sigfig-items.ts             Stig 0 rules and items, answers derived
src/data/problems.ts                 the 15 Stig 2 problems
src/data/challenges.ts               the 41-item Stig 3 pool
src/data/conversionFactors.ts        imported only by unitConversion.ts and the barrel
src/data/index.ts, utils/index.ts    barrels nothing imports
src/utils/sigfigs.ts                 counting, rounding, readWritten, toggleSign
src/utils/grading.ts                 1 % tolerance, applyFactorPath, the thousands-dot note
src/utils/level3Run.ts               drawing a run of 12
src/utils/scoring.ts                 composite score, scoreExplanation
src/utils/unitConversion.ts          imported only by utils.test.ts
src/__tests__/                       36 test files; Stig 0: sigfigs, sigfig-items, stig0-r5-play;
                                     Stig 1: level1-*; Stig 2: level2-*, unit-cancellation;
                                     Stig 3: level3-*, challenge-data, data-integrity;
                                     shared: grading, thousands-dot, hint-cost,
                                     no-level-gating, no-running-score, unit-block,
                                     answer-keyboard, phone-scroll, a11y, utils;
                                     next-guard-clock.ts is a helper, not a test
HARVEST.md                           the 2026-08-27 harvest; current, one line superseded
EVALUATION.md                        a pre-restructure design note; stale
```

Run the tests from the repo root (`pnpm exec vitest run apps/games/1-ar/dimensional-analysis`): the
render tests need the root config's DOM environment.

## Open

- **i18n.** One of the nine games that still render a `LanguageSwitcher`. Its ten `t()` calls are all
  in the menu; every level is hardcoded Icelandic. That sits inside the platform-wide undecided
  `useGameI18n` question (`CLAUDE.md`'s "Remaining deferred"; `docs/i18n-coverage.md`).
- **Stig 3's intro says shorter routes are more precise** (found 2026-11-02, not yet fixed):
  `Level3.tsx:434` reads `styttri leiðir gefa nákvæmari niðurstöður`, while the level's own feedback
  (`:934-935`) says every path gives the same answer, and Stig 0 teaches that exact factors limit
  nothing.
- **Stig 3's intro says explanation length does not matter** (`Level3.tsx:452-453`,
  `lengd skiptir ekki máli`), while `scoreExplanation` gives the explanation's 20 % by length.
  Decision 30 took option (b) and left the length scoring; the sentence was not reworded.
- **The menu shows `Lokið`, not `N af M rétt`.** The saved progress holds only which levels were
  mastered, so the menu has no count to show, although the platform rule is that each level's menu
  entry shows it.

**Closed.** Decisions 22 (Stig 2's prediction wording), 23 (Stig 1 reports completion), 27
(`Skipta í hnappalista` / `Skipta í keðjusmíð`), 28 (a wrong Stig 2 answer shows the right value)
and 31 (Stig 3's summary, then Stig 2's) are applied. REVIEW-QUEUE C2 item 2 kept drag as the Stig 2
default. HARVEST.md's line that significant figures are taught nowhere was overtaken by Stig 0.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **Dead code.** `components/BalanceScale.tsx` and `components/UnitTile.tsx` have no importers.
  `utils/unitConversion.ts` (from the removed prediction step) and `data/conversionFactors.ts` are
  reachable only through `utils/index.ts` and `data/index.ts`, which nothing imports.
- **Two menu keys are missing from `i18n.ts`.** `App.tsx` asks for `mainMenu.selectLevel` and
  `accessibility.skipToContent`; the file has `menu.selectLevel` and no skip key, so English and
  Polish show the Icelandic fallbacks. Most of `i18n.ts` (`stats`, `level1`–`level3`, `feedback`)
  is read by nothing.
- **Stale comments.** `utils/grading.ts` and `thousands-dot.test.tsx` still call
  `dotReadAsDecimalNote` a draft awaiting Siggi's wording, settled 2026-10-23;
  `no-running-score.test.tsx` says Stig 3's count waits on items 30 and 31, both applied;
  `utils/sigfigs.ts` cites `Level3.tsx:167-169` for the significant-figure check, now near `:303`;
  a comment in `challenges.ts` points to "the harvest note in the game's README", which is
  `HARVEST.md`.
- **Stale test scaffolding.** `a11y.test.tsx` mocks `useProgress`, `useAchievements` and two
  achievement components the game never imports; `utils.test.ts` names tests for keyword scoring
  that `scoreExplanation` does not do.
- **`EVALUATION.md` describes the game before the restructure**: a prediction step in Level 2, a
  15 % hint penalty, gating at five of six, and two terms since swept by decision 12.
