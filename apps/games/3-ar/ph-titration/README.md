# pH Títrun

Chain position 6 in Year 3, between Varmafræði and Stuðpúðar
(`Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis → Sýrufastinn → Varmafræði → pH Títrun →
Stuðpúðar → Leysnijafnvægi`, `src/App.tsx:400-401`). The game teaches acid–base titration: what a
títrunarferill looks like for strong–strong, weak acid–strong base and weak base–strong acid, where
the jafngildispunktur falls and why, how to choose a litvísir, and the arithmetic behind it —
`M₁V₁ = M₂V₂`, Henderson-Hasselbalch and the first equivalence points of fjölvirkar sýrur. The menu
cites Brown et al., ch. 17.

## Structure

**Agnasýn** (2026-11-14), the first card on the menu, is the Explore phase: one titration shown
three ways at once, then three levels. Three levels, none gated, each opened from a card on the menu. Finishing Stig 3 goes to an end
screen; finishing Stig 1 or 2 returns to the menu.

| Stig | Menu name              | What it asks                                                                                                                                          |
| ---- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `Stig 1: Skilningur`   | A teaching card ("Títrun — um hvað snýst þetta?"), then 6 multiple-choice questions: 2 match a curve, 2 read an indicator colour, 2 on curve features |
| 2    | `Stig 2: Framkvæmd`    | 6 titrations at the bench: pour from the búretta, mark the equivalence volume on the curve, then pick one of 5 litvísar                               |
| 3    | `Stig 3: Útreikningar` | 8 calculations: 2 concentration, 1 volume, 2 polyprotic, 2 Henderson-Hasselbalch, 1 pH at hálfjafngildispunktur                                       |

- **Stig 1** (`data/level1-challenges.ts`) shuffles each question's options and re-letters them a,
  b, c… by position. Hints are the shared four-tier `HintSystem`. Each question is answered once.
- **Stig 2** (`data/level2-puzzles.ts`) pours by +0,05 / +1 / +5 mL or by holding a button, up to
  60 mL, and draws the curve only as far as the student has poured. Marking uses a range slider in
  0,1 mL steps, with ±0,1 mL nudge buttons on touch; the panel states the tolerance up front
  (`Leyfilegt svigrúm: ±1,0 mL`). A puzzle is right when the marked volume is within 1,0 mL of the
  equivalence volume **and** the litvísir is acceptable. The result prints the equivalence volume and
  the acceptable litvísar, so a `Reyna aftur` after it does not count (`answerShown`).
- **Stig 3** (`data/level3-challenges.ts`) grades at a 2 % **relative** tolerance on every problem,
  pH answers included (`Level3.tsx`, `handleSubmit`). The field is `type="text"` +
  `inputMode="decimal"` read through `parseStudentNumber`, so the decimal comma works. The result
  shows the correct answer, the explanation, and a `Sýna útreikningsgang` button for the worked
  steps. A reference panel (`Uppflettitöflur`: a pKₐ table and the key equations) sits under the
  card, closed on a phone (`PhoneDisclosure`).

No level shows a running score. Each reports `N af M rétt` to the menu, which shows it on the
level's card; a level finished under the old points format shows `Lokið` (`resultLabel`,
`App.tsx:121-126`). Progress is in localStorage under `ph-titration-progress`, keeping the best count
per level. There is no timed or competitive mode.

## Agnasýn

25,0 mL of 0,100 M ediksýra titrated with 0,100 M NaOH: titration 5 in `data/titrations.ts` and the
textbook's ch. 14 worked example (equivalence at pH 8,72). Seven scenes, then a slider:
ediksýra í vatni, NaOH leysist upp (Na⁺ named a spectator and drawn faded from then on), OH⁻
hvarfast við ediksýru (full ionic and net ionic equations), hálfjafngildispunktur, stuðpúðinn
tæmist, jafngildispunktur (basajónun asetats, Kb, why pH > 7), eftir jafngildispunkt, and
Kannaðu sjálf/ur. Each scene drips in its NaOH from the last one's volume, so the particles, the
pH readout and the curve move together. Nothing is graded or stored.

- **Every number comes from the game's own curve.** `utils/agnasyn.ts` takes the pH from
  `calculateWeakStrongPH` and the species from that pH, so this screen cannot disagree with Stig 2.
  The scene texts compute what they print (`data/agnasyn-steps.tsx`).
- **The particles are amounts on a fixed scale**, 8 per mmól: 20 for the acid, and one Na⁺ and one
  OH⁻ per 1,25 mL of NaOH. Two species are far under one particle at the two volumes whose scenes
  are about them, the ionised acid at the start (0,27) and acetate's OH⁻ at the equivalence point
  (0,002). Exactly there one pair is drawn with a dashed ring and a note says it is exaggerated;
  every other count is the amount rounded. `agnasyn.test.ts` holds that the rounded amounts equal
  the counts drawn.
- **The equilibria are drawn as dynamic**: at those two volumes the pair recombines and another
  molecule ionises every few seconds (`flicker` in `utils/particles.ts`).
- **Henderson-Hasselbalch is printed with the particle counts** (`log(5/15)`, `log(10/10)`), and
  agrees with the curve to two decimals except at half-equivalence, where the ICE root is 0,0005
  above pKₐ and the meter shows 4,75. The scene says so (C23 in `docs/REVIEW-QUEUE.md`).
- `utils/particles.ts` is pure apart from a random source passed in; `agnasyn.test.ts` drips a
  whole titration through it and drags a slider at random, checking the counts after each move.
  `agnasyn-screen.test.tsx` walks every scene with reduced motion. With reduced motion the view
  does not drift and every change is made at once.
- **H⁺, not H₃O⁺** (Siggi, 2026-11-14): his students know the shorter form, so the ionisation is
  written CH₃COOH ⇌ CH₃COO⁻ + H⁺. Only this screen; the levels are unchanged.
- The moving SVGs carry `data-live` for `desktop-compare`.

## What matters before touching it

**The pH maths had a unit error, and the curve start is now checked against the data.**

- **The `/1000` defect (fixed 2026-08-18, Phase 1):** `utils/ph-calculations.ts` divided a molarity
  already in mol/L by 1000, so 0,100 M ediksýra started at pH 4,37 instead of the game's own 2,87,
  and every weak-acid curve started about 1,5 units off. `ph-calculations.test.ts` asserts that every
  titration starts at its declared `initialPH` — except HF, id 6, which still disagrees and is
  pinned with `it.fails` (see Open).
- **The buffer region no longer uses Henderson-Hasselbalch from the first drop (2026-09-23).** It
  diverges there: one 0,05 mL drop took HF from pH 2,00 to 0,21. It now solves the buffer's ICE table
  (`conjugatePairIon`). `ph-calculations.test.ts` steps every titration in 0,05 mL drops over 60 mL
  and fails if the pH ever moves against the titrant.
- **The initial pH is deliberately the √(Ka·C) approximation.** The stored `initialPH: 2.87`
  (ediksýra) and `11.13` (ammóníak) in `data/titrations.ts` are both √(Ka·C) values, and
  `3-ar/syrufastinn` grades on the approximation by the 5 % rule so that the two adjacent nodes agree
  about the same beaker. Its `grade.test.ts` and `ka.test.ts` hold the same two numbers (as
  constants; they do not import this game). Do not "correct" the initial pH to the exact root.

**Every constant is Appendix D's, and the bank holds only what a level serves (2026-10-23).**

- Mobile-pass decision 115 (a) deleted seven titrations nothing rendered — among them benzoic and
  phosphoric acids at constants that were not Appendix D's, sulfurous acid, which has no Appendix D
  row, and the polyprotic pH branches, which fell to −∞ or NaN. Six remain, ids 1, 2, 5, 6, 7 and 9,
  one per Stig 2 puzzle. `titration-data.test.ts` holds that the bank equals the puzzles' titrations,
  that none is polyprotic, that every Ka and Kb is an Appendix D row
  (`packages/shared/data/appendix-d.ts`), that each curve is a finite number everywhere on the
  búretta, and that each `bestIndicator` obeys Level 1's rule.
- **Stig 3's pKₐ table (`Level3.tsx:457`) is the student's route to the answer.** Six of its nine
  values once came from another book; all nine now round Appendix D's constants (HF 3,17; HCOOH
  3,74; CH₃COOH 4,74; H₂CO₃ 6,37 and 10,25; H₃PO₄ 2,12, 7,21 and 12,38; NH₄⁺ 9,26). **No test reads
  this table** — check a change against `appendix-d.ts` by hand.
- Stig 3's polyprotic problems (H₂SO₃ and H₃PO₄) are stoichiometry only and need no constant.

**Stig 2 grades by the rule Stig 1 teaches.**

- **Each puzzle states the flask it serves (2026-09-23).** Four of the six task sentences named a
  different titration from the one drawn and graded (puzzle 2 asked for ediksýra and served a
  strong-acid curve). `level2-puzzles.test.ts` parses each sentence and compares it with the
  titration.
- **The acceptable litvísar are derived, not listed (decision 113 (a), 2026-10-23).**
  `acceptableIndicatorsFor` takes every litvísir whose range contains the equivalence pH **as
  printed**, to one decimal, and throws on import if none does. The hand lists had broken that rule
  and disagreed with each other. HF's curve reaches 7,97, printed 8,0, so it accepts þýmólblátt
  only — Siggi confirmed that, 2026-10-23. `level2-puzzles.test.ts` pins the accepted set per
  puzzle, and that each explanation names exactly the accepted ones.
- **The litvísir cards no longer say which titration each suits (decision 114 (c)).** That answered
  half the task in the list a student chooses from. The description now shows after the result,
  beside the verdict, and was reworded where it contradicted the grader. `indicator-choice.test.tsx`
  holds both.
- **The equivalence star is derived** (`TitrationCurve.tsx`): it sits at `calculatePH` of the
  equivalence volume, not at the stored `equivalencePH`, which for HF was 0,11 above the curve.
- **Touch:** the hold-to-pour button uses pointer events and stops on `pointercancel` (it once poured
  on to 60 mL when the browser cancelled a hold), and the marking step has the ±0,1 mL nudges.
  `touch-controls.test.tsx`.
- **`TitrationCurve` shrinks to its container** through a `ResizeObserver` (Aug 2026 deferred-work
  pass), capped at 600 px wide with a 240 px minimum height. jsdom has no `ResizeObserver`, which is
  why the render tests stub one.

**No hint costs anything.**

- **Fixed 2026-08-26:** Stig 1 scaled its award by the shared `HintSystem`'s tier multiplier
  (1,0 / 0,8 / 0,6 / 0,4), so all four tiers cut 100 points to 40. Stig 2 and 3 awarded a flat 100
  and 20 while their banners said "(50 stig)" and "(10 stig)" after a hint — phantom penalties.
  `HintSystem` gained `showPointCost`, which this game passes as `false`. Since decision 1 (b)
  (2026-10-03) there are no points at all. `hint-cost.test.tsx` plays Stig 1 with and without every
  tier open and expects the same full count both ways; `result-count.test.tsx` covers all three levels, the
  Stig 2 retry rule, and the menu and end screen.
- **Stig 1's misconception note names the question's own mistake (decision 112, 2026-10-23).** Every
  wrong answer used to say pH does not always go to 7. Now questions 1, 2, 5 and 6 each carry their
  own note and 3 and 4 none (`MISCONCEPTION_BY_CHALLENGE`, `Level1.tsx:38`).
  `misconception.test.tsx`.

**Everything a student reads is Icelandic, with a decimal comma.**

- **Decimal comma (2026-09-23):** the game printed `0.100 M`, `+0.05 mL`, `Rétt svar: 0.13` and every
  readout with a full stop. Numbers now go through `formatDecimal`. `decimal-comma.test.ts` scans the
  Icelandic data fields and the canvas labels and bans `toFixed` and raw stored numbers in
  components; `play-through.test.tsx` plays every question of every level and fails on a decimal
  point on screen or a counter past the total.
- **The English fields are not rendered.** The data carries English beside Icelandic:
  `question`/`label`/`explanation` (Stig 1), `task`/`hint`/`explanation` (Stig 2), and
  `title`/`description`/`hint`/`explanation`/`solutionSteps` (Stig 3). Only the `…Is` fields reach
  the screen (`questionIs`, `labelIs`, `explanationIs`, `taskIs`, `hintIs`, `titleIs`,
  `descriptionIs`, `solutionStepsIs`); Stig 1's tiered `hints` and the litvísir `description` are
  Icelandic only. The English keeps its full stop.
- **Acid and reagent names:** HF is `flússýra` — Siggi's ruling, 2026-09-19, which went against
  platform frequency; this game had said both spellings at once — and HNO₃ `saltpéturssýra`, both
  `governed-terms.test.ts` rows. `Saltsýra` (not with a doubled s) and `Ammóníak` (with its acute)
  are held locally by `chemical-names.test.ts`, since `ordabok.md` names no reagents.
- **`icelandic-text.test.ts` lists 33 wrong forms this game shipped**, each with its
  source: `samoka` does not decline, `títrunarferill`, `fjölvirk sýra`, `búretta`, the textbook's
  spellings of the litvísar, `keiluflaska`, `fenólftalín`, `hálfjafngildispunktur` and `litvísir`
  (decision 116 and Siggi's `litvísir` ruling, both 2026-10-23), among others. It scans comments
  too, so explain a banned form without writing it.
- **The language switcher was stripped on 2026-09-19.** The game's one `t()` call was a template
  literal falling back to the same Icelandic for five Stig 3 badge labels (`challengeTypeLabels`,
  `Level3.tsx`), and the `i18n.ts` went with it. `switcher-earns-its-place.test.ts` lists this game
  and fails if the switcher returns.

**Focus and phones.** After a check, focus goes to the feedback group, never to `Næsta`, and `Næsta`
drops a press within 400 ms (`useArmedAfter`); opening a Stig 2 or 3 hint focuses the hint.
`screen-anchoring.test.tsx` and `hint-focus.test.tsx`. The mobile paths in
`e2e/mobile-game-screens.ts` click visible labels in this game, so renaming a button means updating
them in the same change.

**There is no Level 4.** The old repository had one here (18 problems: Ka, polyprotic and curve
interpretation, per `docs/FEBRUARY-DECISIONS-RECOVERED.md`), never ported. By the 2026-08-29 ruling,
such material would become Apply content inside the existing levels.

## Layout

```
src/App.tsx                       menu, level routing, end screen, progress (ph-titration-progress)
src/components/Agnasyn.tsx        Agnasýn: scenes, playback, slider, readouts
src/components/ParticleBeaker.tsx Agnasýn's flask: particles, frame loop
src/components/ProgressCurve.tsx  Agnasýn's curve, drawn as far as the NaOH added
src/components/NaOHDissolve.tsx   Agnasýn's NaOH(s) → Na⁺ + OH⁻ loop
src/data/agnasyn-steps.tsx        Agnasýn's seven scenes
src/utils/agnasyn.ts              Agnasýn's chemistry and particle counts
src/utils/particles.ts            Agnasýn's particle system
src/types.ts                      Titration, Indicator and the difficulty/indicator unions
src/components/Level1.tsx         Stig 1: intro card, 6 questions, TitrationCurvePreview
src/components/Level2.tsx         Stig 2: pour, mark, choose, result
src/components/Level3.tsx         Stig 3: 8 problems, the Uppflettitöflur panel
src/components/Burette.tsx        Stig 2 búretta (role=meter)
src/components/Flask.tsx          Stig 2 flask, coloured by litvísir or pH
src/components/IndicatorSelector.tsx  Stig 2 list of 5 litvísar, no descriptions
src/components/TitrationCurve.tsx Stig 2 curve on InteractiveGraph, ResizeObserver
src/components/PHMeter.tsx        imported by nothing (see Leftovers)
src/data/titrations.ts            the 6 titrations Stig 1 and 2 draw
src/data/indicators.ts            5 litvísar, isIndicatorAppropriate, getIndicatorColor
src/data/level1-challenges.ts     Stig 1 questions
src/data/level2-puzzles.ts        Stig 2 puzzles, printedEquivalencePH, acceptableIndicatorsFor
src/data/level3-challenges.ts     Stig 3 problems
src/data/index.ts                 barrel; imported by nothing
src/utils/ph-calculations.ts      the three titration types' pH, curve generator, pH colour
src/__tests__/                    data: ph-calculations, titration-data, level2-puzzles,
                                    chemical-names, icelandic-text, decimal-comma
                                  rendered: play-through, result-count, hint-cost, misconception,
                                    indicator-choice, hint-focus, screen-anchoring, touch-controls
```

No side files. Run the tests from the repo root, since the render tests need the root config's DOM
environment: `pnpm exec vitest run apps/games/3-ar/ph-titration`.

## Open

- **HF's stored `initialPH` disagrees with its own curve.** `data/titrations.ts` says 2,08; √(Ka·C)
  at 0,150 M and Ka 6,8 × 10⁻⁴ gives 2,00. `ph-calculations.test.ts` pins it with `it.fails`
  "pending a teacher decision on the declared value". It is not in `docs/REVIEW-QUEUE.md`, and no
  screen shows `initialPH` — only the test reads it — so no student meets the gap.

**Closed.** Running scores went with decision 1 (b), PR #85. The hint penalties went on
2026-08-26. The Y3 review cycle's items for this game — no teaching before Stig 1's questions, and an
undisclosed Stig 2 tolerance — are fixed by the intro card and the `Leyfilegt svigrúm` line. The
switcher question was settled for this game by stripping it (2026-09-19). The closing screen opened after Stig 3 whatever else was played (found and fixed 2026-11-02): it now opens only when the level just finished completes the set, as in Millisameindakraftar, held by `completion-screen.test.tsx`.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **`components/PHMeter.tsx` and `data/index.ts` have no importers.**
- **Unused data and helpers:** `getTitrationsByDifficulty` and `getRandomTitration` in
  `data/titrations.ts` are never called. Each titration's `equivalencePH`, `halfEquivalencePH` and
  `difficulty` are read by no component (the curve derives its own values), and `initialPH` only by
  the test above.
- **Stig 3 problems 4 and 5 carry `titrationId: 11` and `13` and an `equivalencePointIndex`**
  (`data/level3-challenges.ts:170-171`, `:206-207`) — the deleted polyprotic titrations. Nothing
  reads either field.
- **`Level1.tsx`'s `TitrationCurvePreview`** has a `strong-weak` branch (which would draw the
  weak-acid curve) and a hand-built default curve; no question uses either. Each level also keeps a
  `setHintsUsed` counter whose value is never read.
- **A stale comment in `ph-calculations.test.ts`** says "These three do NOT agree" above the
  `it.fails` block, which now pins one titration.
