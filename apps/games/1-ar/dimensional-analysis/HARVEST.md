# Einingagreining — the February harvest, and what was wrong with it

**Landed:** 2026-08-27 · **Roadmap:** `docs/plans/2026-08-16-games-roadmap.md`, Phase 3, row 1
**Source:** `namsbokasafn-leikir` at `dc5e614`, `games/1-ar/dimensional-analysis/src/data/challenges.ts`

The Year-1 curriculum review's sharpest complaint was that five of the seven games dress every
problem in the same lab-bench setting. February had already written the answer — twenty-five
scenarios across a kitchen, a pharmacy, a building site, a gym and an airport — into the old repo,
where it stayed. This is that harvest.

The roadmap's standing instruction for anything coming out of the frozen repo is **take the data,
not the code**, because the old games carry `setScore`, hint multipliers and dead i18n wiring. That
instruction turned out not to go far enough: the data was never verified either. Everything below
was found by checking the twenty-five items against this game's own graders before they landed.

## What was wrong with the harvested data

**Three significant-figure declarations the correct answer cannot have.** `L3-ENG-1` declared 4 on
an answer of 1200, `L3-TRAVEL-1` declared 3 on 510, and `L3-PHARM-3` declared 2 on 10 — and this
game's own `countSignificantFigures` counts those as 2, 2 and 1 under the trailing-zero convention.
A student typing the exact key would have been told their precision was wrong. Five more declared a
count the answer's digits carry but the _problem's_ precision does not justify (25 kg × 15 mg/kg is
two significant figures, not three), so the given values were tightened where that was the honest
fix and the declaration was dropped where it was not. Significant figures are feedback-only here and
are taught nowhere on the platform — see the roadmap's Phase 5 — so a declaration that cannot be
defended is worse than none.

**One key that could never be reached.** `L3-TRAVEL-2`'s answer is 24.5 L, and the `real_world`
grader read the typed answer with `parseInt`, so the item was ungradeable. It is now a `synthesis`
item, whose card can show the 7 L/100 km the question turns on; the grader is fixed as well, below.

**Icelandic that is not Icelandic.** `40 langur` for lengths of a swimming pool (a `langa` is a
fish); `mælikúla` for a measuring jug; `Hversu mörg mL`, where `millilítri` is masculine and takes
`marga`; `Sundlaugar lengd er 25 m`; `Breyttu tímann` for `tímanum`; `3 matskeið` for
`3 matskeiðum`, with the English `tbsp`/`tsp` where Icelandic recipes say `msk`/`tsk`. All rewritten.

**Two items whose framing did not survive contact with the screen.** `L3-COOK-3` asked the student
to triple a recipe, and the setup card would have printed the already-tripled amount. `L3-SPORT-4`
gave the length of a mile in a question about converting 4:30 into seconds, and offered a single
solution path in a challenge type whose whole question is _which_ path.

## What the harvest changed in the game

**Level 3 draws a run instead of playing the pool.** Sixteen items became forty-one, and a
forty-one-problem level is an afternoon, not a level. `src/utils/level3Run.ts` draws twelve, seeding
one of each of the six challenge types first so no skill can fall out of a run, then filling with a
preference for a setting the run has not used yet.

**Three defects in the shipped game, found while making room for the harvest:**

- The `real_world` grader used `parseInt`, which truncates a decimal and cannot read an Icelandic
  decimal comma — so `requireInteger` decided nothing, and a non-integer key was unreachable. It now
  reads the answer with `parseStudentNumber` like the rest of the game, and the flag decides whether
  a whole number is required or the 1% relative tolerance applies.
- Every `real_world` item has carried an authored `explanation` since the level shipped and **nothing
  rendered it**. It is the one challenge type with no `correctMethod` and no `requiredSteps`, so a
  student who got one wrong saw a score and no way to reach the answer.
- `L3-10` offered `1000 g / 1 kg` as a solution path. That is not a slower route to kilograms, it is
  an inverted factor landing on 5 × 10⁸ — and the level scored picking it as a valid-but-inefficient
  method, which is the opposite of what the level teaches. Replaced with a correct three-step route,
  matching the shape `L3-3` already used.

**And two labels that were wrong before the harvest arrived.** The setup card called every synthesis
item's starting value `Rúmmál` and every factor `Eðlismassi`. On `L3-12` that labelled 0.5 mol of
NaCl a volume and its molar mass a density; on `L3-8` it labelled a density a volume. Both now
declare what they are, defaulting to the old wording. `requiredSteps` had the same shape of problem:
three English strings were swapped for Icelandic by the component and anything else rendered as
written, so `multiply by molar mass` shipped on screen. The steps are Icelandic in the data now.

## What guards it

| File                                      | Holds                                                                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/__tests__/challenge-data.test.ts`    | Declared precision is writable and accepted; every factor chain reproduces its own key; keys are whole where required; no English steps |
| `src/__tests__/level3-run.test.ts`        | A run is complete, unique, covers all six types, spreads across settings, and can reach every item in the pool                          |
| `src/__tests__/level3-realworld.test.tsx` | Drives the real component: the worked solution renders, and a decimal comma grades                                                      |

Each was verified to fail against the pre-fix code — the precision guard reports
`L3-ENG-1: wrote 1200: expected 2 to be 4`, and the path guard found `L3-10` on its first run.
