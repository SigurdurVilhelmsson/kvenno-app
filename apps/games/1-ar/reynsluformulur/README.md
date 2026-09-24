# Reynsluformúlur

**Status: complete and registered.** Four phases, 86 tests of its own, in `build-games.mjs`, on the hub, and
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
- **The atomic masses come from `@shared/data/elements`**, which `src/data/elements.ts` re-exports
  under its old name. It used to be a second copy; `problems.test.ts` still compares `molmassi`'s
  array against it and fails on disagreement. Two copies of the same numbers is how B4 happened.
- **The Y1 chain test lives in `1-ar/einingakedjan/src/__tests__/chain-string.test.ts`**, not here,
  and was extended to nine games by this change. Worth knowing: CLAUDE.md said that test "does not
  exist yet" while it did, so a duplicate was written here before the full suite pointed at the
  original. Deleted. Its whitespace handling models how JSX renders the markup rather than merely
  collapsing it, which is load-bearing — a rewrap can delete a space the chain needs.

## Layout

```
src/engine/empirical.ts       the four columns; no React, no Icelandic
src/data/elements.ts          atomic masses, re-exported from @shared/data/elements
src/data/problems.ts          compounds as formulas; percentages and keys derived
src/components/               KannaScreen, SkiljaScreen, AefaScreen, BeitaScreen
src/utils/desktopReveal.ts    a desktop window's reveals, kept as they were before the phone pass
src/__tests__/                86 tests across empirical, problems, feedback-text, phase-flow and phone-reveal
```

## Open

- **Percent composition itself is still unplaced.** The assessment recommended
  `hlutfallsgreining` become "a fourth `molmassi` level **plus** a new Reynsluformúlur node"
  (`:581`). This is the node; the `molmassi` level is not built. The Kanna phase here shows percent
  composition but does not drill it.
- **Combustion analysis** — the other route into an empirical formula, and the one a lab actually
  uses — is not covered.
- **Æfa shows `rétt: …` beside each wrong cell and leaves the inputs live**, so a student can submit
  zeros and copy the values back. No score rides on it, but a column then unlocks without being
  worked. Hiding the value until a second wrong try is one option; it is a teaching call.
- **The subscript column is called `Vísitala`; the textbook says `lágstafur`** (`ch03/m68702`, the
  empirical-formula module, and 200+ hits across the book). `ordabok.md` has no entry. Not changed.
  A rename also changes the `Vísitala fyrir …` aria-labels, which `e2e/mobile-game-screens.ts` fills.
- **The menu's "Lykilskref" uses `n` twice** — `n = m / M` for moles and, two lines down, for the
  molecular multiplier.

Fixed 2026-09-23, each held by `feedback-text.test.tsx`: Beita's "Þitt n gaf …" line called the
right formula wrong for a fractional n (1,5 on HO rounded back to H₂O₂ at the measured mass) and now
appears only for a whole n; Kanna named one element as having "the most atoms" in H₂O₂ and NaCl,
where the counts tie; and Æfa's verdict built its column compounds by pasting `súlan` onto the
label, which got the genitive of `vísitala` and `hlutfall` wrong. The same line in Beita also no
longer names a formula for an n too large to write (`1e21` printed H₁₂₁O₁₂₁). And "Áfram í Skilja"
and "Áfram í Æfa" now open the phase they name instead of the menu, as `1-ar/utfellingarhvorf`'s do;
held by `phase-flow.test.tsx`.

## On a phone

Built for 360 × 740 first; from `sm` up every screen keeps its desktop layout. The vertical-scroll
pass (`docs/plans/2026-09-23-vertical-scroll-design.md` §4) then fitted each play loop to one screen
at 360 × 640 and 390 × 664, with every change behind `phone:` or `phone-land:`:

- **The menu shows all four phases on the first screen.** The cards are compacted, `Lokið` is a
  corner badge, and the overview paragraph follows the phases on a phone — it says where they go
  rather than teaching, and holds nothing focusable. On a phone on its side the phases are 2 × 2.
  Back from a phase, the next one not yet done is focused, and on a phone brought into view.
- **Kanna: choosing a compound shows the list, the table and its sentence together**, so the next
  compound is a tap away with no scroll. On the SE only the table and the sentence fit, and the
  list's first rows are one scroll up. On a phone on its side the table and the sentence sit side
  by side under the list. Focus moves to the sentence, so a screen reader hears the finding.
- **Kanna's mass bar sits under the percentage below `sm`**, and in that half-width column on its
  side. Beside it, the atom-count column — the one the screen is about — was pushed out of a
  clipping box and never seen on a phone.
- **Skilja's table scrolls sideways from the fourth column at 360 px** (the third at 320 px). Five
  numeric columns do not fit a phone, and no narrower wording exists. The element column is pinned
  while it scrolls, and "Næsta súla" scrolls the table to the column it just added, so the new
  column is on screen with the element it belongs to. On a phone the page shows the new column,
  its caption and any note down to the button; focus moves to the caption. Skilja keeps one column
  on its side: after compaction each step fits there as it is, and in a half-width column the table
  would scroll sideways as it does in portrait.
- **Æfa keeps its layout** — one column per step is the model the design holds the other games
  to. On a phone on its side the compound sits beside the table being filled.
- **After a check, focus goes to the feedback, never to the button that follows it**: Æfa's verdict
  box (or, when a right column opens no box, the fields with their ticks), Beita's feedback. That
  button is a new element, not "Athuga" relabelled, and "Næsta súla", "Næsta efni", "Næsta dæmi",
  "Áfram í Æfa" and "Reyna aftur" ignore a press within 400 ms of appearing, so a double tap cannot
  skip what the check just said. "Reyna aftur" puts focus back in the first field that was wrong.
- **Enter answers**: in Beita's field, and in Æfa's last field (the fields before it move on to the
  next). The phone keyboard's key reads "next" or "done" to match.
- **Scrolling goes through `@shared/utils`.** The game's own `src/utils/reveal.ts` is gone. A
  desktop window keeps exactly what it did — the same trigger and the same landing, at any width —
  through `src/utils/desktopReveal.ts`, which only decides and leaves the scrolling to the shared
  helpers. `phone-reveal.test.tsx` holds both.
