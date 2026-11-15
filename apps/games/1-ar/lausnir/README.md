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

**The answer it grades against is the exact value of the numbers the question prints (2026-09-23).**
The generators used to store a rounded answer — two significant figures for a mass, up to 5 % off —
so about one `massFromMolarity` problem in eight marked the exact answer wrong. Every answer the game
shows (last hint, worked solution, "Rétt svar") is printed by `formatAnswer` at three significant
figures, which is always inside the tolerance. `__tests__/stig3-grading.test.tsx` recomputes each
answer from the question text and fails against the old generators. The moles a hint or worked
solution prints on the way are three significant figures too: at three decimals, a student who
carried `0,014 mol` forward from the page landed 3,6 % off the answer the next line stated.

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
- **Scenario 6's cold soda (fixed 2026-10-23, decision 59 (a)):** its explanation called cold soda
  `fríðara`, which means prettier. It now reads `Þess vegna helst kalt gos lengur kolsýrt!`;
  `icelandic-text.test.tsx` holds it.

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
src/utils/problem-generator.ts               Stig 3 generators
src/utils/validation.ts                      input parsing and the 2 % check
src/types.ts
src/__tests__/                               electrolytes, weighable-substances, problem-generator,
                                             solubility-data, cooling-scenarios,
                                             level2-no-answer-leak, level2-results,
                                             stig3-grading, app-progress,
                                             icelandic-text, decimal-comma, reveal-top, utils
HARVEST.md                                   the 2026-08-27 saturation harvest
LEVEL1_README.md                             April prototype notes; stale, see below
```

Run the tests from the repo root (`pnpm exec vitest run apps/games/1-ar/lausnir`): the Level 2 render
test needs the root config's DOM environment.

## Fixed 2026-11-15 — the year-1 audit (Phase 0 item 2)

- **Stig 1 defines concentration as the book does** (ch. 3, `m68703`): `Mólstyrkur = mól / L`,
  where it said concentration was particles over volume. A drawn particle is a scale, not a
  definition, and the play screen now says so beside the beaker (`hver eind = 0,01 mól`). The
  particles are **eindir**, not `sameindir`, in Stig 1 and Stig 2, since NaCl has no molecules.
  Sameind and eind decline alike, so nothing around them moved. `concentration-definition.test.tsx`
  holds it.
- **`þynning`, not `útþynning`**, here, on the hub card and in the page description, as
  `ordabok.md` and the book (18 to 0) write it; a `governed-terms.test.ts` row bans the út- form.
- **Stig 2's scenario about dissolving more glucose was titled `Bæta við leysiefni`**, a word the
  book uses for solvent as often as for anything; it is now `Bæta við uppleystu efni`, the book's
  word for solute.
- **Stig 2's options carry `aria-pressed`**, so a screen reader hears which one is chosen before
  Athuga.
- **`data/facts.ts` is gone**: exported, rendered nowhere, and the last place the game said
  `Avogadros tala`.

## Open

- **The O₂ and CO₂ curves end at 0 at 100 °C** (`TemperatureSolubility.tsx`), where the basis the
  chart states, 1 atm of the gas over the solution, gives a value above zero. Neither point, nor the
  others, has a recorded source. Needs a sourced 100 °C value or the gas curves ending at 80 °C,
  which the six-point arrays do not allow yet.
- **Molar masses are typed twice** in `data/chemicals.ts` (`molarMass` and `molarMassDisplay`), most
  rounded to whole numbers, so NaCl is 58,5 here and 58,44 in Mólhugtakið. Every rounded value is
  inside Stig 3's 2 % tolerance. Weighing them with `packages/shared/utils/formula.ts` needs it to
  read parentheses first (`Ca(OH)₂`).
- **i18n.** Stig 1–3 use `t()` with `en` and `pl` blocks while Stig 0 is hardcoded Icelandic. That
  split sits inside the platform-wide undecided `useGameI18n` question (see `CLAUDE.md`) rather than
  answering it.

**Closed.** The three levels' different points scales went with mobile-pass decision 1 (b),
PR #85: every level reports `N af M rétt`, or completion where it cannot end wrong. Stig 1's silent
wrong "Athuga lausn" went with decision 60: it now says which way the concentration is off. And on 2026-10-23 (the
vertical-scroll design's §7.7, settled on Claude's recommendation) Stig 1 stopped moving on by
itself 2,5 s after a right answer, a timer in a learning phase that took the concept panel away
half-read: the panel stays until `Næsta verkefni` (`Ljúka stigi` on the last task), which ignores a
press within 400 ms of appearing. `phone-scroll.test.tsx` holds it.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **`LEVEL1_README.md` describes a prototype, not the shipped game.** It refers to an
  `App-Level1-Demo.tsx` that does not exist and to `App.tsx` as "the old calculation game".
- **Dead code:** most of the `GameState` interface in `types.ts` belongs to the pre-restructure
  game. Nothing renders it.
