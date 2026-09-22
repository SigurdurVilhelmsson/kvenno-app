# Lausnir

Chain position 9 in Year 1, between Takmarkandi and Einingakeðjan. The game teaches molarity,
dilution and mixing of solutions, how solubility depends on temperature, and — in its Stig 0 — what a
solute becomes when it dissolves and whether the solution conducts.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing whatever about this game. Nothing was lost by replacing it.

## Structure

Four levels, none gated. Stig 1–3 are the original concept → prediction → calculation progression;
Stig 0 was added on 2026-09-20.

| Stig | Menu name     | What it asks                                                                              |
| ---- | ------------- | ----------------------------------------------------------------------------------------- |
| 0    | Rafkleyfi     | Teach phase, then classify 15 solutes as sterkur rafkleyfi, veikur or órafkleyft efni     |
| 1    | Hugtök        | 6 challenges: predict the direction, then hit a target concentration with sliders         |
| 2    | Rökstuðningur | 12 "what happens if…?" multiple-choice scenarios, 5 on concentration and 7 on temperature |
| 3    | Útreikningar  | 8 generated calculations — 4 easy (molarity, dilution), 4 medium (mass, mixing)           |

Stig 3 grades at a 2 % relative tolerance (`utils/validation.ts`), and its input is `type="text"`
read through `parseStudentNumber`, so the Icelandic decimal comma works.

**Every number a student reads is written with the decimal comma (2026-09-22).** Until then the
field read a comma while the game printed a full stop everywhere else — Stig 3's generated
questions (`Þú leysir 0.00079 mól …`), hints, worked solutions and "Rétt svar" line, the Stig 1 and
Stig 2 beaker labels, and the authored Stig 1/2 text. All of it now goes through `formatDecimal`
from `@shared/utils`, formatted where the string is built (`utils/problem-generator.ts` for Stig 3).
`__tests__/decimal-comma.test.ts` generates 1 200 problems and renders their worked solutions, scans
the authored text, and bans `.toFixed(` in components; it fails 8 of 8 against the old code. The
worked solutions also stopped printing float noise in M₁ × V₁ products.

## Stig 0 — Rafkleyfi

The electrolyte half of February's "both" answer; the precipitation half is `1-ar/utfellingarhvorf`.
The textbook decides which game gets which: precipitation is ch. 4, electrolytes ch. 11. It is Stig 0
rather than Stig 4 because there is no Level 4 (Siggi's ruling, 2026-08-29), and it copies
`1-ar/dimensional-analysis`'s Stig 0 — including **hardcoded Icelandic inside a game that otherwise
uses `t()`**, since `en`/`pl` blocks would mean coining Polish chemistry terms against no glossary.

- **The class is derived, not declared.** Each solute in `data/electrolytes.ts` states what kind of
  substance it is (ionic compound, strong or weak acid or base, molecular compound), and `classOf`
  derives the electrolyte class from that. A solute cannot be labelled strong while its explanation
  calls it a weak acid.
- **Nothing shown before the answer gives it away.** The old game's descriptions named the category,
  and its unlit bulb rendered before the answer — which is itself the picture for `órafkleyft efni`.
  Each solute now carries an `observable` (shown first) and a `why` (shown after), and the bulb draws
  no verdict until an answer is in. `electrolytes.test.ts` greps every observable for classifying
  stems.
- **Terminology:** `rafkleyfi` is masculine (`sterkur rafkleyfi`, `veikir rafkleyfar`), and
  non-electrolyte is an adjective plus a noun, `órafkleyft efni`. The test holds both. See the
  electrolyte row in `CLAUDE.md`'s terminology table before touching any of these strings.

## What matters before touching it

**Stig 3 generates only physically possible, physically doable problems.**

- **B6 (fixed 2026-08-18):** the generators once produced solutions far more concentrated than the
  substance dissolves — up to 25 M Ca(OH)₂ against a real 0.022 M. Every chemical in
  `data/chemicals.ts` now declares a `maxMolarity`, and the generators clamp to it.
  `problem-generator.test.ts` guards it.
- **Weighing premise (fixed 2026-08-26):** each chemical declares a `form`. The two problem types that
  say "Þú leysir …" (`molarity`, `molarityFromMass`) draw only solids, and only those
  `canBeWeighedOut` confirms give at least 0.1 g across the generator's range — derived, so lowering a
  ceiling drops a substance out by itself. The six liquids and one gas stay in dilution, mixing and
  `massFromMolarity`. The pool is 20 chemicals; **K₂Cr₂O₇ was removed** on Siggi's call (a
  category-1 carcinogen, and this was the one place a student is told to weigh it out).
  `weighable-substances.test.ts` guards both, including that it does not return.
- **Na₂CO₃ is `natríumkarbónat` here**, not `þvottasódi` — that word belongs to the decahydrate in
  `1-ar/molmassi`, whose `compound-names.test.ts` reads this game's source to keep the collision
  closed.

**Stig 2's temperature scenarios read the curve the screen draws.**

- **B3 (fixed 2026-08-18):** the gas curves were in g/L under a `g/100 g H₂O` axis, ten times too
  high. The data in `components/TemperatureSolubility.tsx` is now one unit throughout, gas values at
  1 atm of the pure gas; `formatSolubility` keeps a small gas value from rendering as `0.0`.
  `solubility-data.test.ts` guards it.
- **The cooling direction (2026-08-27 harvest):** every temperature scenario used to heat. Two were
  added — _Kristöllun við kælingu_ (KNO₃, 100 °C → 20 °C, 168 g crystallises) and _Öfug leysni_
  (CaSO₄, retrograde). `cooling-scenarios.test.ts` recomputes their quoted figures from
  `SOLUBILITY_DATA` rather than trusting the prose. See `HARVEST.md` for why the roadmap's premise for
  this row was false.
- **`getCompound` throws on an unknown formula** (`components/Level2.tsx:62`). It used to fall back to
  KNO₃, silently drawing the wrong curve under a question.
- **B16 (fixed 2026-08-27):** the concentration scenarios drew the "after" beaker in full at 30 %
  opacity before the student answered. It is now an outline with a question mark until an answer is
  in; `level2-no-answer-leak.test.tsx` renders the level and checks every concentration scenario.
- **`leysni` is the word for solubility** (Siggi's ruling, 2026-08-27, 19 occurrences swept here).
  Enforced repo-wide by `governed-terms.test.ts`, with a positive assertion in
  `cooling-scenarios.test.ts`.

**Flattened Icelandic was found here on 2026-09-22** — the subtitle and a menu label had lost their
accents. Fixed, and `packages/shared/i18n/__tests__/no-flattened-icelandic.test.ts` now covers game
source.

## Layout

```
src/App.tsx                                  menu, level routing, progress (localStorage key lausnirProgress)
src/i18n.ts                                  is/en/pl strings for Stig 1–3 and the menu
src/components/Level0Electrolytes.tsx        Stig 0, hardcoded Icelandic
src/components/Level1.tsx                    Stig 1, 6 challenges defined inline
src/components/Level2.tsx                    Stig 2, SCENARIOS defined inline
src/components/Level3.tsx                    Stig 3, 8 problems pre-generated per run
src/components/Beaker.tsx                    Stig 1 beaker
src/components/StoichiometryVisualization.tsx  Stig 2 concentration before/after
src/components/TemperatureSolubility.tsx     SOLUBILITY_DATA, curves, Stig 2 temperature visuals
src/components/FormulaCard.tsx, StepBySolution.tsx  Stig 3 reference and worked solution
src/data/chemicals.ts                        20 chemicals: molar mass, form, maxMolarity
src/data/electrolytes.ts                     Stig 0 solutes and classOf
src/data/facts.ts                            CHEMISTRY_FACTS — exported, rendered nowhere
src/utils/problem-generator.ts               Stig 3 generators
src/utils/validation.ts                      input parsing and the 2 % check
src/utils/scoring.ts                         imported only by utils.test.ts; no level uses it
src/types.ts
src/__tests__/                               electrolytes, weighable-substances, problem-generator,
                                             solubility-data, cooling-scenarios,
                                             level2-no-answer-leak, utils
HARVEST.md                                   the 2026-08-27 saturation harvest
LEVEL1_README.md                             April prototype notes; stale, see below
```

Run the tests from the repo root (`pnpm exec vitest run apps/games/1-ar/lausnir`): the Level 2 render
test needs the root config's DOM environment.

## Open

- **i18n.** Stig 1–3 use `t()` with `en` and `pl` blocks while Stig 0 is hardcoded Icelandic. That
  split sits inside the platform-wide undecided `useGameI18n` question (see `CLAUDE.md`) rather than
  answering it.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **`LEVEL1_README.md` describes a prototype, not the shipped game.** It refers to an
  `App-Level1-Demo.tsx` that does not exist and to `App.tsx` as "the old calculation game".
- **Dead code:** `utils/scoring.ts` (including a `getHintPenalty` no level calls), `data/facts.ts`,
  and most of the `GameState` interface in `types.ts` belong to the pre-restructure game. Nothing
  renders them.
