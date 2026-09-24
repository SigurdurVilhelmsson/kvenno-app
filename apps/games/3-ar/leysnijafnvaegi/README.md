# Leysnijafnvægi

**Status: complete and registered.** Four phases, 69 tests of its own, in `build-games.mjs`, on the
hub, and at the end of the Y3 `Námsleiðin` chain after Stuðpúðar.

The 25th game, and the **last of Phase 5's four confirmed curriculum gaps**. Ka/Kb closed with
Sýrufastinn, empirical formula with Reynsluformúlur, electrolytes and precipitation with
Útfellingarhvörf and Lausnir's Stig 0. This is the quantitative half of that last one.

## The arc it closes

`1-ar/utfellingarhvorf` answers "will it precipitate?" **by rule** — look the ions up in the
solubility table, say yes or no. This answers the same question **by number**, and they share their
anchor compounds on purpose. A Year-1 student learns AgCl is insoluble. A Year-3 student learns that
"insoluble" means 1,3 × 10⁻⁵ M, which is not zero, and that whether a precipitate actually appears
depends on how concentrated the solutions were.

`ORPHANED_GAMES_ASSESSMENT.md:468` measured the absence: `Ksp`, `samjón`, `leysnimargfeldi` and
`mólleysni` returned **exactly two lines repo-wide, both in `ordabok.md`**. The words were in the
dictionary and in no product. The common-ion effect was touched but never named —
`equilibrium-shifter` runs `AgCl(s) ⇌ Ag⁺ + Cl⁻` with added Ag⁺ as a Le Chatelier stress, so
predicting the left shift _is_ the effect, and `samjón` returns zero in that game.

## Where the constants came from, and the problem underneath

**Until 2026-09-20 no Ksp value on this platform had a source at all.** `appendix-d.ts` carried
Tables D.1 and D.2 only, and Siggi's 2026-09-19 ruling is that a constant with no Appendix D row
does not ship — so this game could not be written. Siggi supplied Table D.3 and it is now
transcribed there.

**The two books disagree here far more than they do on acids, and it is worth knowing.** The school's
Icelandic textbook has its own `Leysnimargfeldi` appendix
(`efnafraedi-2e/02-mt-output/appendices/m68868`). Across the 33 compounds both tables list:

|                   |                                                          |
| ----------------- | -------------------------------------------------------- |
| agree within 30 % | 12                                                       |
| differ by ≥ 3×    | **13**                                                   |
| worst cases       | Ca₃(PO₄)₂ 1538× · PbCrO₄ 1400× · CoCO₃ 714× · BaSO₄ 209× |

Brown wins, by the ruling. But unlike the acid case this has a consequence for students: a BaSO₄
molar solubility computed from one book is **14× the other**, so someone checking the appendix in
the book they can actually read will find the game contradicting it. The pool therefore draws
preferentially from `AGREES_WITH_ICELANDIC_APPENDIX`, and **every salt outside that set carries a
written note saying what the other book says and why it was kept anyway.**

Two rows are deliberately absent. **PbI₂ is not in D.3** — Brown lists six lead salts and no iodide
— so under the ruling that dropped TRIS from Sýrufastinn it cannot carry a Ksp here. That is a pity,
since it is the bright yellow precipitate Útfellingarhvörf opens with; that game is qualitative and
needs no constant, so the arc still joins. **Hg₂I₂'s exponent is illegible in the source page**
(it reads `10⁻¹·¹`), and guessing it was not an option.

## The starred sulfides are a trap, not a data entry

Table D.3's own footnote: the starred rows are for

```
MS(s) + H₂O(l) ⇌ M²⁺(aq) + HS⁻(aq) + OH⁻(aq)
```

so their constant is a **three-species product** `[M²⁺][HS⁻][OH⁻]`, not `[M²⁺][S²⁻]`. Handing CuS to
`molarSolubility` returns √(6 × 10⁻³⁷) — a number with no physical meaning that looks entirely
plausible on screen, and is wrong by twenty orders of magnitude. This is the single easiest way to
ship a wrong answer in the topic.

They carry `hydrolytic: true` in D.3, the pool throws if one is ever added, and **two** tests hold
it: one that no shipped salt is flagged, and one that the flags are still on the ten rows that need
them — because without the second, dropping the flags would make the first pass vacuously.

## Why nothing is stored

A salt is a formula and a name. Its Ksp is read from `appendix-d.ts`; the molar solubility, the Ksp
expression, the dissolution equation, the common-ion result, Q and every precipitation threshold are
computed. The old `solubility-equilibrium` stored 21 answer keys beside the data they came from —
the assessment recomputed them and they were sound, but the PbI₂ pair had **already drifted**
(9,8 × 10⁻⁹ in the table against 8,8 × 10⁻⁹ derived at `problems.ts:285`). One drift is the whole
argument.

## Three defects in the old game that shaped this one

- **A grader that could not read its own output.** `Level2.tsx:48` did `.replace(/10/g, 'e')`, so
  the format the game advertised at `:279` parsed to its mantissa, the plain-decimal form parsed to
  0, and an Icelandic comma parsed to 1. Here the answer is entered as **mantissa and exponent in
  two fields**, which is typeable on any keyboard — and which also lets the feedback say which half
  is wrong, where a merged box could only say "wrong". An earlier version of this line said "right
  digits, wrong power of ten" is what forgetting the 4 in 4s³ looks like. It is not: dropping the 4
  changes the digits (by ∛4 for a 1:2 or 2:1 salt), and so does a square root taken for a cube root.
- **The dilution pre-computed away.** `Level3.tsx:92-98,244-249` did the mixing arithmetic on all six
  items and left a binary button, removing the only step students get wrong. Here the diluted
  concentrations appear only after the prediction is committed, and one problem mixes 25 mL with
  75 mL so that halving is not the answer.
- **Fractional precipitation posed only where the shortcut worked.** `Level3.tsx:372` printed both
  Ksp values on cards where the two compounds shared a stoichiometry, so "lowest Ksp first" was the
  whole answer. The shipped Mohr problem is the opposite case: AgCl has a Ksp **150× larger** than
  Ag₂CrO₄ and precipitates first anyway, which is exactly why the red indicator works.

## Two findings from building it

- **`precipitationOrder` had `x` and `y` swapped.** For 1:1 salts the two are equal and it looked
  correct; for Ag₂CrO₄ it returned 1,2 × 10⁻⁸ instead of 1,1 × 10⁻⁵ and duly reported the chromate
  precipitating first — inverting the one result the task exists to teach. The function now requires
  an explicit `sharedIon` rather than inferring anything.
- **The common-ion approximation is not always safe here.** The textbook move is to drop the salt's
  own contribution next to the added ion. For PbCl₂ that is wrong by **53 %**, because its molar
  solubility is 1,6 × 10⁻² M and the salt supplies more of the common ion than a 0,010 M solution
  does. A first draft of the test asserted the approximation held across the whole pool; it does
  not. `commonIonApproximationIsSafe` now applies the **same 5 % threshold Sýrufastinn uses**, so a
  student meets one convention rather than two, and the shipped problems are held to it.

## Terminology

All four terms were ruled in February and had **zero occurrences** until now — decided, never
adopted. The corpus confirms every one: `mólarleysni` 33 hits against 0 for `mólleysni`,
`samjónahrif` 6, and the appendix title is `Leysnimargfeldi`.

| Concept                  | Term              |
| ------------------------ | ----------------- |
| solubility product       | `leysnimargfeldi` |
| molar solubility         | `mólarleysni`     |
| common ion effect        | `samjónahrif`     |
| fractional precipitation | `hlutfelling`     |

**The symbol stays `Ksp`.** The Icelandic appendix titles itself `Leysnimargfeldi` and writes the
symbol `K_lm` once, but the book's running text uses `K_sp` **81 times**. So the Icelandic word
names the concept and the international symbol names the constant — exactly the arrangement
`sýrufasti` and Ka already have.

## Layout

```
src/engine/ksp.ts              the maths; no React, no Icelandic
src/data/salts.ts              14 salts, every constant read from Appendix D.3
src/data/problems.ts           10 solubility · 6 common-ion · 6 mixing · 2 fractional
src/components/                KannaScreen, SkiljaScreen, AefaScreen, BeitaScreen,
                               ScientificInput (the answer row, with the `±` key),
                               Sci (a number held on one line) and BackButton
src/utils/desktopReveal.ts     keeps a desktop window scrolling exactly as the old helper did
src/__tests__/                 78 tests — ksp.test.ts, phone-play.test.tsx, phone-scroll.test.tsx,
                               decimal-comma.test.tsx, stated-claims.test.ts and screens.test.tsx
```

## On a phone

Æfa's answers are typed as a number and a power of ten, and every one has a **negative** power.
Both fields raise the decimal keypad, and on an iPhone that keypad has no minus key — so until
2026-09-23 a student on an iPhone could not enter a single Æfa answer. `ScientificInput` adds a
`±` key beside the power on touch screens only, the same control and label as
`3-ar/jafnvaegisfasti`'s; `phone-play.test.tsx` plays an answer through it. The rest of the phone
pass was layout: scientific numbers are held on one line (`Sci`), so `1,8 × 10⁻¹⁰` never breaks
at its `×`, and panels that set two numbers side by side stack below `sm`.

**Each play loop fits a phone screen (vertical-scroll pass, 2026-09).** Scrolling and focus go
through the shared helpers in `@shared/utils` (`useScreenTop`, `revealSpan`,
`useRevealAfterCommit`, `useArmedAfter`); the game's own `src/utils/reveal.ts` is gone.

- Every screen opens at its heading, and back on the menu the next phase not yet done is on screen
  and focused. On a phone the menu shows all four phases first, with the overview paragraph after
  them; in landscape they are 2 × 2.
- Kanna: the salts are a grid of four on a phone (three below 360 px, seven on its side). Picking
  one brings its card on screen with the list and moves focus to the card. Letting go of the
  slider — its `change`, never while the finger is still dragging — brings in the bars through
  "Áfram í Skilja". On its side, the salt card and the slider sit side by side.
- Skilja: each "Næsta skref" focuses the new rung and, on a phone, brings it in down to the button.
- Æfa and Beita: after the commit, focus goes to the feedback (a group named by the verdict), and
  on a phone as much as fits of problem → answer → feedback → "Næsta dæmi" is brought in. Every
  next button ignores a press within 400 ms of appearing, so a double tap cannot skip the feedback.
  Enter in the number moves to the power of ten; Enter there checks. On its side, the problem sits
  beside the answer.
- A desktop window scrolls exactly as before (`desktopReveal.ts`); the one change there is focus
  moving to headings, the feedback, the salt card and the new question.

## Open

- **Æfa does not diagnose the two mistakes this topic is known for.** Forgetting the 4 in 4s³
  grades as `tolustafir` or `baedi` over the pool, and a square root taken for a cube root as
  `baedi`; both messages then say only that the numbers do not match. Until 2026-09-23 the
  `veldisvisir` message named both causes — an outcome neither can produce, so the advice was false
  every time it showed — and that clause was removed. Whether to add a real diagnosis (compare the
  entry with ∛Ksp and √Ksp and say which mistake it is) is Siggi's call.
- **The divergence notes in `salts.ts` are never shown.** BaSO₄'s says a student checking the
  Icelandic appendix gets another answer and that it is worth telling them; nothing renders it.
  Siggi's call whether students see a line about it.
- **Selective precipitation is only posed as ordering, not as a separation yield.** "How much of the
  first ion is left when the second starts to come down" is the question a real separation asks, and
  it is not here.
- **No temperature dependence.** Every constant is at 25 °C, and the game says so but never uses it.
