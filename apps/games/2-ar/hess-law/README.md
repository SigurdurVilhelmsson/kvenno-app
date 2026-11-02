# Lögmál Hess

Chain position 5 in Year 2, between Millisameindakraftar and Hvarfhraði. The game teaches that
`vermi` (ΔH) is an `ástandsfall`: what happens to ΔH when an equation is reversed or multiplied,
how equations combine to reach a target, and how ΔH°rxn follows from formation enthalpies
(`myndunarvermi`). The menu credits Kafli 5 of Brown et al.

## Structure

Three levels, none gated, each picked from the menu.

| Stig | Menu name              | What it asks                                                                               |
| ---- | ---------------------- | ------------------------------------------------------------------------------------------ |
| 1    | `Stig 1: Skilningur`   | Teach screen, then 6 multiple-choice challenges on ΔH signs, reversing and multiplying     |
| 2    | `Stig 2: Þrautir`      | 6 puzzles: choose, reverse (`Snúa við jöfnu`) and scale (×1–3) given equations to a target |
| 3    | `Stig 3: Útreikningar` | Teach screen (`Myndunarvermi — Kennsla`), then 6 ΔH°f calculations, one of them reversed   |

- **Stig 1** (`components/Level1.tsx`, data in `data/challenges.ts`) draws one equation per
  challenge in an energy diagram; on challenges 2–4 the student can reverse and scale it before
  answering. The options are shuffled at render (`shuffleArray`, memoised on the challenge index),
  so the data's fixed order is not a defect. A state-path panel (`StatePathComparison`) sits under
  every challenge as a worked example. Challenge buttons let a student go back; an answer the
  level had already shown does not count when answered again.
- **Stig 2** (`components/Level2.tsx`, data in `data/puzzles.ts`) draws the chosen steps as a
  staircase (`EnergyPathwayDiagram`). It grades on the equation the chosen cards build
  (`reachesTarget` in `utils/equation-math.ts`), not on the summed ΔH. A solve after a wrong check
  counts, since the level never shows the answer; a skipped puzzle counts as not solved. On a
  portrait phone the target strip and the action row are `TaskStrip` / `PinnedActions`.
- **Stig 3** (`components/Level3.tsx`) asks for ΔH°rxn on five challenges and for ΔH°f(SO₂) on the
  fourth. The input is `type="text"` + `inputMode="decimal"` read through `parseStudentNumber`,
  graded at 2 % relative (`ANSWER_TOLERANCE`, `utils/hess-calculations.ts`); the wrong-answer line
  prints the same tolerance in kJ/mól. A `±` key beside the field (touch screens only) flips the
  sign, since an iPhone's decimal keypad has no minus and five of the six answers are negative.

Each level reports `N af M rétt` to the menu and to the closing screen, or `Lokið` for a level
saved in points before counts were kept. Progress is in localStorage under `hess-law-progress`.
There is no timed mode.

## What matters before touching it

**Every enthalpy comes from the book's table (mobile-pass decision 9 (a), 2026-10-03, PR #85).**

- The game reads `packages/shared/data/thermo.ts`, the Icelandic textbook's appendix m68865, through
  `formationEnthalpy` (`utils/hess-calculations.ts`), which throws for a species the book has no
  row for. Until then it kept a table of its own from another book: CaCO₃ was −1206,9 where the
  student's book gives −1220,0, so Stig 3 marked a student who looked it up wrong by 13 kJ. Stig 3's
  CaCO₃ answer is now the book's +191,6, and glucose left the reference table (no row).
- Stig 3 derives every `calculate` answer from the ΔH°f values it prints beside it (`challenges`
  in `Level3.tsx`). Stig 2 prints each equation's ΔH to one decimal and each target is the sum of
  what is printed; Stig 1 rounds its real reactions to whole kJ (methane −891).
  `__tests__/formation.test.ts` holds all three levels to the shared table.
- **The worked explanations are typed, not derived.** Stig 3's `c1explanation` … `c6explanation`
  and `c4desc` in `i18n.ts` carry the numbers as text. They agree with the derived answers today
  (checked 2026-11-02), but no test compares them, so a change to `thermo.ts` must be carried into
  those strings by hand, in all three languages.

**A hint never changes a result.** Stig 3 used to award 20 for an unaided answer and 10 once the
hint was open, and its button said `(-10 stig)` — a real penalty, not a phantom one. It became a
flat 20 on 2026-08-26 (Siggi's call), and points went from every level with mobile-pass decision
1 (b) on 2026-10-03. `__tests__/hint-cost.test.tsx` plays each level twice, once opening every
hint, and requires the same count; it also checks the hint button advertises no price.
`__tests__/level-results.test.tsx` holds the counting rules above and the absence of any running
score.

**Stig 2 grades the equation, not the number.** On puzzle 5, 3 × (S + O₂ → SO₂) with
2 × (S + 3/2O₂ → SO₃) reversed also sums to −99,0 kJ, because 4 × 297 = 3 × 396, yet builds
S + 2SO₃ → 3SO₂; the level used to accept it. `__tests__/puzzles.test.ts` holds every stored
solution to its target, and `__tests__/level2-grading.test.tsx` drives that wrong combination
through the real level.

**Answer leaks closed.**

- Stig 1 challenges 5 and 6 printed the asked-for ΔH on the drawn equation; challenge 5 also showed
  −110 against its own −111. The value now reads `?` until checked, and challenge 5's state-path
  example (which labels the same step) is withheld until then (decision 77).
  `__tests__/level1-shown-deltah.test.tsx`.
- Stig 2 drew the target as a `Markmið` line as soon as a card was chosen, so a student could steer
  onto it. It appears only after `Athuga lausn` (decision 76). `__tests__/level2-target-line.test.tsx`.
- Stig 3's reverse challenge printed ΔH°f(SO₂) in its own table, and both workspace totals left
  ΔH°rxn one subtraction away. The unknown and both totals read `?` until checked; the n × ΔH°f
  terms stay (decision 75). `__tests__/level3-display.test.tsx`.

**Wording.** `__tests__/icelandic-text.test.ts` bans the forms this game shipped until 2026-09-23 —
English and loan words for exo- and endothermic and for enthalpy (the glossary's `útvermið`,
`innvermið`, `vermi`, `myndunarvermi`), a list of grammar slips, and Stig 1's old claim that the
order of reversing and multiplying matters (it does not: both only scale ΔH). It also requires the
decimal comma in every Icelandic string. `__tests__/state-path-text.test.tsx` does the same for the
state-path panel, and `__tests__/level1-related-concepts.test.ts` holds Stig 1's concept chips to
the glossary (decision 78: `Ástandsfall`, two coined chips dropped). Platform-wide rulings that
landed here, enforced by `governed-terms.test.ts`: `myndefni` for a product (18 occurrences in this
game's source now), `brennisteinssýra` with the double s (this game was the one that wrote it with a single s; it now
appears in Stig 2 puzzle 5),
`Snertiferlið` for the contact process with the English gloss dropped (decision 17), `Kolmónoxíð`
for CO (decision 16), and `styttast út` for terms that cancel (decision 12). Stig 2's card no
longer promises an `Útskýrðu rökstuðning` step it does not have (decision 79).

**Phones.** Both energy drawings lay themselves out at their box's width below the desktop size
(`__tests__/diagram-layout.test.tsx`); opening a hint focuses the hint rather than `<body>`
(`__tests__/hint-focus.test.tsx`); the Stig 2 card is a group whose select control is a real
toggle button, not a `role="button"` holding buttons (REVIEW-QUEUE D1, PR #79).

## Layout

```
src/App.tsx                          menu, closing screen, progress (localStorage key hess-law-progress)
src/i18n.ts                          is/en/pl strings; only Stig 3 reads them (see Leftovers)
src/main.tsx, src/styles.css
src/components/Level1.tsx            Stig 1: teach screen, 6 challenges, MISCONCEPTIONS, RELATED_CONCEPTS
src/components/StatePathComparison.tsx  Stig 1 state-function panel (three worked examples)
src/components/Level2.tsx            Stig 2: equation cards, grading by target equation
src/components/EnergyPathwayDiagram.tsx Stig 2 staircase drawing
src/components/Level3.tsx            Stig 3: teach screen, 6 challenges defined inline, ΔH°f table
src/data/challenges.ts               Stig 1 challenges
src/data/puzzles.ts                  Stig 2 puzzles, equations and stored solutions
src/utils/hess-calculations.ts       formationEnthalpy, reference table, 2 % check, sums
src/utils/equation-math.ts           parseSide, netChange, reachesTarget, coefficient scaling
src/utils/formula-display.ts         CO2(g) → CO₂(g)
src/utils/sign.ts                    toggleSign for the ± key
src/__tests__/                       formation, hint-cost, level-results, puzzles, level2-grading,
                                     level2-target-line, level1-shown-deltah, level3-display,
                                     icelandic-text, state-path-text, level1-related-concepts,
                                     diagram-layout, hint-focus, sign-key, hess-calculations,
                                     equation-math; level-play.ts is the shared play helper
```

There are no side files. Run the tests from the repo root
(`pnpm exec vitest run apps/games/2-ar/hess-law`): the render tests need the root config's DOM
environment.

## Open

- **The closing screen claims a run that did not happen (found 2026-11-02, not yet fixed).**
  `handleLevel3Complete` in `App.tsx` always opens `Þú hefur lokið öllum stigum!`, so a student who
  starts on Stig 3 — allowed, since levels are not gated — is congratulated on all three, and
  `resultLabel` prints `Lokið` for a level never played, since it cannot tell "not played" from
  "saved before counts". `2-ar/kinetics` and `1-ar/lausnir` fixed the same thing (kinetics'
  `app-complete.test.tsx`); `level-results.test.tsx` here currently expects the old behaviour.
- **i18n.** This is one of the nine games that keep a `LanguageSwitcher` (in the menu header), and
  whether to finish wiring them is the platform-wide open `useGameI18n` question (`CLAUDE.md`,
  "Remaining deferred"; `docs/i18n-coverage.md`). Here the switcher changes only Stig 3's play
  screen: the menu, Stig 1, Stig 2, Stig 3's teach screen and its wrong-answer line are hardcoded
  Icelandic. So the `en` and `pl` blocks are rendered, through Stig 3's titles, hints and
  explanations. Their numbers use a decimal point (`-890.6`, `+191.6`, `-296.83`): right in
  English, wrong in Polish, which writes a comma (mobile-pass decision 4 noted both). The Polish
  block itself is still waiting for teacher sign-off (`CLAUDE.md`, "Hess Polish i18n block").

- **`millistig` for an intermediate (found 2026-11-02, not yet fixed).** Stig 2 puzzle 4's hint
  says `NO er millistig` (`data/puzzles.ts:177`); `ordabok.md` gives `intermediate;milliefni`, and
  `2-ar/kinetics` bans `millistig` in its own screen-text test.

**Closed.** The hint penalty (2026-08-26), the formation-enthalpy source (decision 9), the running
score (decision 1 (b)), and decisions 75–79, all above.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **Most of `i18n.ts` is dead.** `App.tsx` hardcodes its Icelandic, so `game.*`, `intro.*`,
  `levels.level1.*`, `levels.level2.*`, `levels.level3.description` / `details`, `complete.*`,
  `progress.*`, `formulas.*` and `credits` are read by nothing, in all three languages. Only
  `levels.level3.name` and `level3.*` are used.
- **Stig 1 shows one hint tier of four.** Each challenge carries `TieredHints` (`topic`,
  `strategy`, `method`, `solution`), and the level renders `hints.method` only.
- **`'compare'`** in Stig 3's `Challenge['type']` union is used by no challenge.
- **A stale test comment:** `__tests__/sign-key.test.tsx` says challenge 1's answer is −890,3; the
  derived answer is −890,6 (the 2 % tolerance accepts both, so the test passes).
