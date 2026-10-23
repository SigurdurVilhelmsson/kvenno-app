# Takmarkandi hvarfefni og heimtur

Chain position 8 in Year 1, between Útfellingarhvörf and Lausnir. The game covers the whole of the
school textbook's `ch04/m68714`, _Heimtur efnahvarfa_ — which is one module covering two ideas.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing whatever about this game. Nothing was lost by replacing it.

## The shape, and why it changes at Stig 3

**Stig 1 and 2 count molecules. Stig 3 weighs them.** That is the book's own progression: it
introduces the limiting reactant with a picture of grilled cheese sandwiches — 28 slices of bread
and 11 of cheese make 11 sandwiches — and then does the entire calculation in grams, because no
chemist counts molecules.

So the concept is taught as a picture and applied as a calculation. Siggi's 2026-08-29 ruling says
there is no Level 4 and that material of this kind becomes **Apply-phase** content; Stig 3 is this
game's Apply phase, and that is where percent yield went (his call, 2026-09-22).

| Stig | Question                               | Units     |
| ---- | -------------------------------------- | --------- |
| 1    | Which reactant runs out first?         | molecules |
| 2    | How much product, how much left over?  | molecules |
| 3    | Limiting → theoretical yield → % yield | **grams** |

## Heimtur — what Stig 3 asks

Three steps per problem, the book's own order:

1. **Which is takmarkandi?** Compare moles ÷ coefficient, not grams. The first problem exists to
   break that misconception on purpose: 4 g of H₂ against 48 g of O₂, and the 4 g runs out first.
2. **Fræðilegar heimtur**, in grams, from the limiting reactant alone.
3. **Prósentuheimtur** = raunheimtur ÷ fræðilegar heimtur × 100.

**The molar masses are printed on screen, deliberately.** Masking them would leave the level
answerable only by someone who had memorised a periodic table, which is not what it assesses.
`1-ar/lotukerfid` shipped the mirror of this mistake — removing an answer leak there removed the
student's only route to the answer, and the route had to be put back on purpose — so
`level3-playable.test.tsx` reads the molar masses off the screen rather than importing them.

## Nothing is stored

A problem gives two reactant masses and a collected mass. The moles, the limiting reactant, the
excess left over, the theoretical yield and the percentage are all derived by
`utils/yield.ts` from the balanced equation and the molar masses.

The reason is `3-ar/buffer-recipe-creator`: it stored masses beside the moles they came from, 13 of
29 problems disagreed with themselves, and on three of the six it served a correct student was
marked wrong while the explanation printed the false arithmetic back.

**A problem whose actual yield exceeds its own theoretical yield throws on import**, and that guard
caught a real mistake while this was being written — the thermite problem was first written at
103 %. A yield above 100 % in a real lab means a wet or impure product, which the book raises as a
thing to notice; a generated one means the data is wrong, and a student cannot tell them apart.

## Molar masses are shared now

`packages/shared/data/elements.ts` holds the atomic masses for the whole platform, and
`packages/shared/utils/formula.ts` parses a formula and weighs it.

Two files used to hold these numbers: `1-ar/molmassi`'s `ELEMENTS` array and `1-ar/reynsluformulur`'s
transcribed copy, held equal by a test. That copy's own comment explained why — "reaching across
into a sibling's data directory is not something this repo does" — which was right about
game-to-game imports and does not reach `packages/shared`, which every game already imports and
which already holds `appendix-d.ts` and `thermo.ts`. A **third** game needing the same numbers is
what made a shared home the obvious answer; a third copy with a third agreement test would not have
been.

`reynsluformulur` re-exports under its old name, so its imports and tests are unchanged. molmassi
keeps its richer array — name, period, group, category beside the mass — and the existing agreement
test still pins it. (That comment cited an `elements-agree.test.ts` which has never existed; the
test is in `reynsluformulur/src/__tests__/problems.test.ts`. Corrected.)

**The parser refuses rather than guesses.** An unknown symbol, a stray character, a zero subscript
and **parentheses** all throw. No formula in the games that weigh things uses parentheses, and a
silent wrong answer on `Ca(OH)₂` would be far worse than a refusal that names itself.

## The Icelandic was ASCII-flattened, and now there is a guard

This game shipped 30 stripped-accent words across its three level components — inconsistently,
inside single sentences:

> `'Deildu fjolda sameinda hvarfefnis med stuðli þess. Lægri talan segir hversu oft hvorfin geta gerst.'`

`stuðli` and `þess` are right; `fjolda` and `med` are not; and `hvorfin` is a misspelling on top of
the flattening (`hvörfin`). This is the defect that cost the Íslenskubraut server copy months of
`Orða{soft hyphen}forði`. `scripts/islenskubraut/load.mjs` has validated the YAML since August and
`no-invisible-characters.test.ts` covers game source for zero-width characters — **neither covered
stripped accents in game source.**

`packages/shared/i18n/__tests__/no-flattened-icelandic.test.ts` now does. Two things about it:

- **It works from a list of known words, not a rule.** There is no way to tell `med` from `með` by
  shape, and a heuristic that guessed would either miss most of them or fire on every English word
  in the file. A list that catches the defect that happened beats a rule that catches nothing.
- **An ASCII identifier is not flattened prose.** Every id in this repo transliterates its Icelandic
  without accents on purpose — `maurasyra`, `flussyra`, `jafnvaegisfasti`'s `'afram'` / `'afturabak'`
  — and renaming them would break stored progress and data lookups. The scan skips a quoted literal
  that is only the word.

**Two other games had it**, which a first pass had missed: `2-ar/redox-reactions` (five `t()`
fallbacks, including both `'Halda afram'` and `'Halda áfram'` in one game) and `1-ar/lausnir` (its
subtitle and a menu label). All fixed.

**"All 30" was not all of them.** The 2026-09 mobile pass found eleven more in this game —
`Sjónræn`, `Stuðull`, `klárast`, `Það`/`það`, `máli` (twice, once as the non-word `maxi`),
`hvarfið átt sér stað`, `mikið`, `færri` — plus the misspelt plural `sameindur` (it is `sameindir`),
`heimtir` for `heimtur`, the split compound `Heildar stig`, and a header title with an English-style
capital, `Takmarkandi Hvarfefni`, against the hub card's `Takmarkandi hvarfefni`. The platform guard
had not caught them because none was on its list; `src/__tests__/icelandic-text.test.tsx` holds
this game to each.

## Terminology

`ordabok.md` already governed the whole family and nothing had ever used it:
`yield;heimtur`, `actual yield;raunheimtur`, `theoretical yield;fræðilegar heimtur`,
`percent yield;prósentuheimtur`.

**The book disagrees with itself here and the glossary settles it.** Inside `ch04/m68714`, the
module title, the learning objectives and the end-of-chapter glossary all use the `heimtur` family
(`Heimtur efnahvarfa`, `fræðileg heimta`, `raunheimtur`, `heimtur í prósentum`), while the running
prose of the percent-yield section says `nýtni` — `fræðileg nýtni`, `prósentunýtni`, 17 times in the
chapter. Resolution order decides it: `ordabok.md` is rule 1 and is not silent, and the book's own
glossary agrees with it.

**No `governed-terms.test.ts` row**, because no wrong form ships — `nýtni` has zero occurrences
platform-wide — the same treatment `brunaefnahvarf` and `niðurbrot` got.

**One variant is unconfirmed and is Siggi's call, not blocking:** `ordabok.md` writes
`prósentuheimtur` while the book's glossary headword is the two-word `heimtur í prósentum`. Same
question, same shape, as `nettójónajafna` against `nettó jónajafna`. The glossary's own form was
taken.

## Layout

```
packages/shared/data/elements.ts    atomic masses, the platform's single source
packages/shared/utils/formula.ts    parse a formula, weigh it
src/utils/calculations.ts           the molecule-count maths for Stig 1-2
src/utils/yield.ts                  the mass maths for Stig 3
src/data/reactions.ts               20 reactions
src/data/yieldProblems.ts           5 mass problems; only the givens are written down
src/components/                     Level1, Level2, Level3, Molecule
src/__tests__/                      data-integrity, yield, level3-playable, phone-scroll,
                                    icelandic-text, play-integrity
```

## Open

**Fixed 2026-09-23**, each guarded by `play-integrity.test.tsx`: Stig 1's answer alternated left,
right, left, … on every run (`CURRICULUM_REVIEW.md:198`), so it could be scored in full without
reading — which side is limiting is now half each way in a shuffled order. "Reyna aftur" on the Stig 1
and 2 results replayed the identical set whose answers had just been shown; it now draws a new one,
the `lotukerfid`/`molmassi`/`lausnir` idiom. Stig 3's "Athuga" graded an empty step as wrong and
printed the answer; it now waits for a choice or a number, and Enter submits a typed answer. Finishing
Stig 3 at 0 points no longer leaves the "Stig lokið" counter at 2/3.

**Also fixed the same day, guarded by `yield.test.ts`:** the `vatn` review text printed 2 mol of
hydrogen against 1,5 mol of oxygen and then said the mole count decides which runs out — where the
reactant with more moles is the limiting one. It now says the mole count divided by the coefficient
decides, with the two quotients. Only that clause changed.

**Fixed 2026-10-23, Siggi's rulings on the 2026-09-23 decisions:**

- **Decision 55 (a): Stig 1 now poses the item its own misconception text is about.** Three items a
  run put the limiting reactant on the side with more molecules — 6 H₂ against 4 O₂, 3 times
  against 4 — drawn from the 2:1 reactions, whose larger coefficient is always on the left, so the
  half-each-way split still holds (February's fix, `FEBRUARY-DECISIONS-RECOVERED.md:358`).
  `play-integrity.test.tsx` holds 2–3 such items in every run.
- **Decision 56 (a): `natriumklorid` was re-weighed, 46 g of Na against 60 g of Cl₂, so the
  heavier mass is the limiting one.** "Pick the smaller number" now passes step 1 on two problems
  of five (`vatn`, `magnesiumoxid`), not three. Its context, which said the chlorine was in excess
  `þótt klórgasið sé miklu þyngra`, now gives the moles and the quotients that make the chlorine
  limiting. `vatn` keeps its masses: it is the problem where comparing moles alone picks wrong, and
  `yield.test.ts` guards that lesson. A wrong step-1 pick is now answered by which reactant was
  picked (`wrongPickMisconception` in `Level3.tsx`): the lighter mass is told a lighter reactant
  can be in excess, a heavier one with fewer moles to divide by the coefficient, and a heavier one
  with more moles keeps the old sentence. `yield.test.ts` and `level3-playable.test.tsx` hold it.

**Siggi's calls, found in the same pass and deliberately not changed:**

- **Stig 3's per-step "Reyna aftur" follows a feedback panel that prints the answer**, and a retried
  step scores the full 10. Answering every step wrong, reading `Rétt svar`, and retrying scores
  150 of 150 — measured by playing the real component. Options: a retried step earns nothing (or
  less); hide the number while a retry is on offer (the review screen shows it anyway); or drop the
  retry. Recommendation: score the first attempt only, keep the retry for practice.
- **B7 is still open here:** Stig 1 and 2 count Mg, Na, K, Ca, Zn and Cu as `sameindir`
  (molecules), and the `Molecule` component labels each ball `… sameind`. Which word replaces it for
  atoms and formula units (`eindir`?) is a terminology ruling, not a spelling fix.

- **Percent composition and combustion analysis are the neighbours**, both unbuilt. The book puts
  percent composition in ch. 3 with Mólmassi and Reynsluformúlur, and combustion analysis in
  ch04/m68716 (_Megindleg efnagreining_) — so neither belongs here, and both have a chapter that
  places them without a ruling.
- **Stig 1 and 2 still use `t()` with a full `i18n.ts`**, while Stig 3 as rewritten is hardcoded
  Icelandic. That is the same split `1-ar/lausnir` carries after its Stig 0, and it sits inside the
  undecided i18n question rather than answering it.
