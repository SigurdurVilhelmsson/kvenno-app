# Reynsluformúlur

**Status: complete and registered.** Four phases, 53 tests of its own, in `build-games.mjs`, on the hub, and
in the Y1 `Námsleiðin` chain between Mólmassi and Stilla efnajöfnur.

Phase 5 of the games roadmap, first of the four confirmed curriculum gaps to be built after
Sýrufastinn closed Ka/Kb. Empirical formula was **absent from all three years** — confirmed
independently by the February review and again by `apps/games/1-ar/CURRICULUM_REVIEW.md:125`.

## What it teaches

Percent composition in, formula out — the four columns every textbook prints:

| Súla     | What happens                                     |
| -------- | ------------------------------------------------ |
| Prósenta | take a 100 g sample, so each percentage is grams |
| Mól      | divide by the element's molar mass               |
| Hlutfall | divide every mole count by the smallest          |
| Vísitala | multiply up until every number is whole          |

Then the second half: empirical formula plus a measured molar mass gives the molecular formula.

**The last column is the whole difficulty**, and the February review named the exact failure —
_"Students frequently round 1.5 to 2"_ (`docs/FEBRUARY-DECISIONS-RECOVERED.md:372`). 1,5 is not a
rounding error, it is a halving: the answer is to double everything. Four of the eight compounds
need a multiplier, and Skilja teaches the method on Járn(III)oxíð precisely because its ratios come
out 1 : 1,5. Teaching it on a compound where every ratio is already whole would hide the only hard
part.

## Where the content came from, and what was wrong with it

Harvested from `hlutfallsgreining` in the frozen `namsbokasafn-leikir`. The roadmap's instruction
was literally **"fix three data defects before porting anything"**, and
`ORPHANED_GAMES_ASSESSMENT.md:338` named them. All three were re-verified by arithmetic before
anything was ported — two of Phase 3's four harvest rows had turned out to have false premises — and
this time the assessment was right on all three:

| Item    | What was wrong                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `l2-1`  | Labelled hydrogen peroxide, carried **water's** percentages (11,19 / 88,81 → H₂O). Its key `HO` was right; the percentages were not. |
| `l2-5`  | N 35,00 / H 5,04 / O 59,96 reduce to **N₂H₄O₃**; the stored key said `NH₂O₃` — the 1,5-rounded-to-2 mistake frozen into the answer.  |
| `l2-10` | Mg 28,83 / P 22,04 / O 49,13 reduce to 1,667 : 1 : 4,316. The stored `Mg₃(PO₄)₂` was unreachable.                                    |

`l2-2` and `l2-8` were byte-identical, labelled easy and hard. One of them is here.

**One correction to the assessment.** It says `l2-10`'s percentages "reduce to no whole-number
formula at all". They do reduce: ×3 gives 5 : 3 : 12,95, within 0,4 % of Mg₅P₃O₁₃. The arithmetic
works and the chemistry does not, which an engine that only knows arithmetic cannot tell apart — so
`MAX_SUBSCRIPT` is what rejects it, not the tolerance. The assessment's conclusion was right either
way.

## Why the data cannot carry that class of defect again

**Compounds are written as formulas, never as percentages.** A formula is a fact about a compound; a
percentage is an arithmetic result. `percentComposition` derives the percentages and
`deriveEmpirical` derives the key back from them, both at module load. So:

- a percentage cannot be mistyped, because nobody types one — that is `l2-1` and `l2-10` made
  impossible rather than fixed;
- a key cannot disagree with its own question, because there is no stored key — that is `l2-5`.

`problems.test.ts` re-derives all of it independently, and asserts the general property behind
`l2-5`: **no answer may be the 1,5-rounded-up formula.** It reproduces the wrong answer explicitly
and checks we do not ship it.

## The answer leak, and why this is a rebuild rather than a port

`ORPHANED_GAMES_ASSESSMENT.md:334` is blunt about the old game: **"Level 3's scaffold _is_ the
answer leak, so removing it deletes the level's only support."** It rendered
`({empiricalFormula}) × {multiplier} = {molecularFormula}` below a still-live input; 18 of its 30
items exposed the answer before commit, and submit-garbage-then-copy was the highest-scoring
strategy.

The fix the assessment proposed (`:544`) is what Æfa is: the step table **inverted into a live table
the student fills column by column**. Nothing is shown before it is earned, a column unlocks only
when the previous one is right, and the feedback names the column that went wrong rather than only
the formula.

## Guards on the data

- **`deriveEmpirical` throws** rather than returning a formula it cannot justify: fewer than two
  elements, percentages that do not sum to 100, no whole-number reduction up to ×6, or subscripts
  past 12.
- **The atomic masses are held to `molmassi`'s.** A second copy exists because each game is its own
  Vite build; `problems.test.ts` compares every shared symbol and fails on disagreement. Two copies
  of the same numbers is how B4 happened.
- **The Y1 chain test lives in `1-ar/einingakedjan/src/__tests__/chain-string.test.ts`**, not here,
  and was extended to nine games by this change. Worth knowing: CLAUDE.md said that test "does not
  exist yet" while it did, so a duplicate was written here before the full suite pointed at the
  original. Deleted. Its whitespace handling models how JSX renders the markup rather than merely
  collapsing it, which is load-bearing — a rewrap can delete a space the chain needs.

## Layout

```
src/engine/empirical.ts       the four columns; no React, no Icelandic
src/data/elements.ts          atomic masses, held to molmassi's by test
src/data/problems.ts          compounds as formulas; percentages and keys derived
src/components/               KannaScreen, SkiljaScreen, AefaScreen, BeitaScreen
src/utils/reveal.ts           keeps what a tap changed on screen on a phone
src/__tests__/                53 tests across empirical, problems and phone-reveal
```

## Open

- **Percent composition itself is still unplaced.** The assessment recommended
  `hlutfallsgreining` become "a fourth `molmassi` level **plus** a new Reynsluformúlur node"
  (`:581`). This is the node; the `molmassi` level is not built. The Kanna phase here shows percent
  composition but does not drill it.
- **Combustion analysis** — the other route into an empirical formula, and the one a lab actually
  uses — is not covered.

## On a phone

Built for 360 × 740 first; from `sm` up every screen keeps its desktop layout.

- **Skilja's table scrolls sideways from the fourth column at 360 px** (the third at 320 px). Five
  numeric columns do not fit a phone, and no narrower wording exists. The element column is pinned
  while it scrolls, and "Næsta súla" scrolls the table to the column it just added, so the new
  column is on screen with the element it belongs to.
- **Kanna's mass bar sits under the percentage below `sm`.** Beside it, the atom-count column — the
  one the screen is about — was pushed out of a clipping box and never seen on a phone.
- **`src/utils/reveal.ts` scrolls only when a change lands off screen**: the table after a compound
  is chosen, the verdict after "Athuga" / "Svara", the new compound after "Næsta súla" /
  "Næsta efni" / "Næsta dæmi", and the top of the page on every phase change. It is a copy of
  `1-ar/utfellingarhvorf`'s, because each game is its own Vite build.
