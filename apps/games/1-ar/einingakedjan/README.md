# Einingakeðjan

Year 1, chain position 10 — the capstone after Lausnir.

A student is given a measurement they can picture (a strip of magnesium ribbon, a teaspoon of
salt, an antacid tablet), a target unit, and a pool of ratios. They build a chain of ratios from
the measurement to the target, press **Leysa**, and watch the units cancel one step at a time.

This is not a replacement for `1-ar/dimensional-analysis`. That game teaches the _mechanic_ on
metric prefixes with no chemistry load, at chain position 1. This one _applies_ it to molar mass,
Avogadro's number, molarity, density and mole ratios from a balanced equation — which is why it
sits at the end of the year, after every one of those has been taught.

## What it fills

`apps/games/1-ar/CURRICULUM_REVIEW.md:190` — "the mole is introduced at position 4 and then
abandoned … mass-to-mass stoichiometry, the most exam-relevant Y1 skill, is practised nowhere."
The February recommendation to add g→mol contexts is still logged as the highest-value open
content item (`:202`), and `docs/plans/2026-08-16-games-roadmap.md:117` lists the mass→mole→mass
bridge as built, lost, and unplaced in any phase. Problems B1–B5 are that bridge.

## The one design decision everything else follows from

**Correctness is derived from the units, never compared against a stored answer key.**

A unit carries a _species_: `mol Mg` and `mol O₂` are different units and do not cancel. Reaching
for the molar mass of the wrong substance is the commonest stoichiometry error, and tagging units
is what makes the engine catch it rather than quietly returning a plausible wrong number. Molarity
tags the solution too (`L NaOH(aq)`), so the molarity of the wrong solution fails the same way.

Three things fall out of this for free:

- **Any valid path solves.** Two commutative ratios can be placed in either order. The older game
  compares the chain against a `correctPath` array, so it marks one order wrong and then
  misattributes it to an inverted factor (`CURRICULUM_REVIEW.md:125`, B11).
- **The diagnosis is computed, not authored**, so the wording on screen can never describe a
  different error than the one the chain actually made.
- **Authoring a problem is a start quantity, a target unit and a card pool.** `expectedValue` in
  `data/problems.ts` exists only so the test suite can check the engine against the chemistry; the
  game never reads it.

## Other decisions worth knowing

- **Pool cards are equivalences, not fractions.** `24,31 g Mg = 1 mol Mg` is a fact; which way up
  to write it is the student's decision when they place it. That makes "the ratio is upside down"
  a move inside the game rather than a different card they should have picked.
- **A bad step is not blocked.** The chain runs, the nonsense unit (`g Mg·g Mg / mol Mg`) is
  rendered, and only then does the game ask what needs fixing. Letting a student build the wrong
  artefact and look at it is the strongest teaching moment in Year 1
  (`CURRICULUM_REVIEW.md:159`); an up-front block tells them they are wrong before they have felt
  why.
- **No number is ever typed.** The student builds the path; the engine computes the value. This
  keeps the game on one skill and sidesteps two shipped defects it would otherwise inherit — B9
  (`parseFloat` rejects the Icelandic decimal comma) and B13 (an absolute 0,01 tolerance).
- **Significant figures are not graded.** The older game demands them and teaches them nowhere
  (`CURRICULUM_REVIEW.md:54`).
- **Hints are free and never counted.** Guarded by a test that fails if a cost string appears.
- **No scoring, timers or streaks.**
- **A prediction gates Solve in the practice phase.** One tap: which unit survives? It is what
  stops the phase being beatable by shuffling cards until the game turns green. The correct answer
  is what the student's _own chain_ produces, not the target — predicting your own broken chain is
  worth crediting. The chain is shown, read-only, beside the question; until 2026-09-23 it was
  not, and the question told the student to look at a chain that was off screen.
- **A card prints exactly the value the engine multiplies by** (`formatStated`), not a rounding of
  it. Until 2026-09-23 cards showed `6,02 × 10²³`, `106`, `100,1` and `159,7` while the engine used
  `6,022 × 10²³`, `105,99`, `100,09` and `159,69`, so a hand check of B3 or A4 missed the printed
  answer in the last digit. Computed results still round to four figures (`formatNumber`).
- **The fix-it question is shuffled.** `correctionPrompt` lists the correct fix first in every
  branch; `ChainBuilder` shuffles the options once per prompt, as it does the pool and the
  prediction options.
- **A chain that stops short is told how many cards it still needs, counted in its own pool**
  (`stepsToTarget`). Until 2026-09-23 it was always told "eitt hlutfall í viðbót", which was false
  after the first card of every three- and four-step problem, and after any wrong turn.

## Layout

```
src/
├── engine/units.ts    # UnitToken, Quantity, Equivalence, applyRatio, cancellation, formatting
├── engine/chain.ts    # solveChain, correctionPrompt, predictionOptions
├── data/ratios.ts     # the equivalence pool, grouped by kind
├── data/problems.ts   # 5 practice (2-step) + 5 apply (3-4 step)
└── components/        # MenuScreen lives in App.tsx; ExploreScreen, UnderstandScreen and
                       # ChainBuilder are the screens; UnitText holds a unit and its substance
                       # on one line inside prose; ChainRow is the chain as built, one
                       # sideways-scrolling row on a phone
```

## On a phone

The vertical-scroll pass (`docs/plans/2026-09-23-vertical-scroll-design.md`, §4). Every change is
behind `phone:`, `phone-land:` or `pin:`, or a script check of the same queries, so a desktop window
renders as before.

- **The chain is one row** (`ChainRow`) that scrolls sideways, with faded edges where it has more,
  and scrolls to each new card. Its height no longer grows with the chain.
- **Æfa and Beita, on a portrait phone:** the chain is pinned under the header (`TaskStrip`) and the
  actions — Vísbending, Byrja upp á nýtt, Leysa — follow the pool and pin to the foot of the screen
  (`PinnedActions`). They move in the DOM, not by CSS `order`, so the tab order is what is seen.
  A new card no longer jumps the page up to the chain. On a phone on its side nothing pins; the chain
  and the pool sit side by side.
- **Kanna** has no pinned strip: with the result under it, the strip would pass the 28 % budget and
  never pin. The chain, its result and _Hreinsa keðjuna_ are brought in after each card, and on a
  phone the three suggestions follow the intro.
- **After each tap focus moves** to what changed (the prediction, its feedback, the worked
  solution, the correction, the explanation of a fix, the verdict, the new problem), never to the
  button that follows. That button ignores a press within 400 ms of appearing (`useArmedAfter`), so a
  double tap cannot skip what the first tap brought up. The correction shows the step that broke the
  chain together with the fixes.
- **The board is guarded too, once the student comes back to it** (after _Laga og reyna aftur_,
  _Prófa aðra leið_ or _Næsta dæmi_): the pinned bar sits where those buttons were, and without it
  the second tap of a double tap pressed _Byrja upp á nýtt_ and emptied the chain just fixed.

## Tests

`pnpm vitest run apps/games/1-ar/einingakedjan`. (This line used to give a count, which went stale
twice; the suite is the count.)

The load-bearing ones are in `__tests__/problems.test.ts`:

- every problem is **exhaustively searched** for solutions from its own pool; the shortest must
  match `expectedSteps`, and **every** solution found must produce the same value, which is the
  claim the no-answer-key design rests on;
- **mass is conserved across all four balanced equations** using the molar masses in the pool, so
  a wrong molar mass fails the suite;
- every problem must offer a distractor that cancels nothing at step one;
- `mm-NaCl` is 58,44, agreeing with `1-ar/molmassi` rather than the 58,5 shipped by `lausnir` and
  the older `dimensional-analysis` (`CURRICULUM_REVIEW.md:192`).

## Note on i18n

This game ships hardcoded Icelandic with no `useGameI18n` wiring and no `LanguageSwitcher`,
deliberately. CLAUDE.md's rule is Icelandic-only UI, and the dead-i18n question across the other
20 games is an open decision — this game does not add a 21st case to it. If that decision lands on
"finish wiring", this game gets wired then, along with everything else.

## Open

All three are Siggi's call; none is built.

- **The fix-it question misdiagnoses a chain that took a wrong turn.** In `engine/chain.ts`,
  `correctionPrompt`'s `wrong-unit` branch always marks _Bæta við hlutfalli aftast_ correct and
  tells _Fjarlægja síðasta hlutfallið_ that removing moves the chain further from the target; its
  `inverted` branch always says the ratio itself is the right one. Both are false when the chain
  went down a distractor: on B1, `g Mg → mol Mg → mol O₂` is told to add three more cards, which
  works only by doubling back through `mol Mg`, while removing the last card leaves two to go. An
  overshoot (`g MgO → kg MgO`) is likewise told removal moves it away, when removal solves it. Every
  Beita problem carries such a distractor pair. The count itself is now derived and true; which
  repair to call correct when both lead somewhere — compare the shortest route from the chain's end
  with the route after removing its last card — and the wording for the new cases are teaching
  decisions.
- **B4's scenario puts 25,0 mL of ethanol in one dose of hand sanitiser**, roughly ten times a
  pump's worth. The numbers work; the picture does not.
- **A card cannot state its own precision.** `0,1 mol NaOH = 1 L NaOH(aq)` sits directly above its
  source line `0,100 M NaOH`, and water's density prints `1 g = 1 mL`, because a JS number carries
  no trailing zeros — the reason `startLabel` exists. An optional `label` on `EquivalenceSide`,
  held equal to `value` by a test, would fix it. Cosmetic, since significant figures are not graded.
