# Jafnvægisfastinn

**Status: complete and registered.** Four phases, 60 tests of its own, in `build-games.mjs`, on the
hub, and second in the Y3 `Námsleiðin` chain — after Gaslögmál and **before** Hliðrun jafnvægis.

The 26th game. It closes the gap `3-ar/leysnijafnvaegi` left behind as the largest one in Year 3:
`equilibrium-shifter` taught equilibrium with **no number anywhere**, so general Kc/Kp and ICE
tables were unbuilt.

## Where it sits, and why that is not a judgement call

The school's own chapter 13 runs in four sections:

| §                                  | Module        | Covered by                   |
| ---------------------------------- | ------------- | ---------------------------- |
| Efnajafnvægi                       | `ch13/m68797` | partly `equilibrium-shifter` |
| **Jafnvægisfastar**                | `ch13/m68798` | **this game**                |
| Tilfærsla jafnvægis (Le Châtelier) | `ch13/m68799` | `equilibrium-shifter`        |
| **Jafnvægisútreikningar**          | `ch13/m68801` | **this game**                |

So the book puts **K before Le Chatelier**, which settles the chain position without a teaching
ruling — the same way the ch. 4 / ch. 11 split settled Útfellingarhvörf against Lausnir's Stig 0.
It also fixes something already shipping: `equilibrium-shifter`'s Q vs K panel argues in terms of a
constant the platform had never defined.

**One deliberate deviation, and it is Siggi's to reverse.** The book puts the ICE calculations
_after_ Le Chatelier, and this game carries them _before_, because splitting one chapter across
three chain nodes with the qualitative one wedged in the middle would fragment it worse than the
ordering costs. ICE needs K and nothing else, so nothing is taught out of dependency order.

## Where the constants came from — a different rule from Ka and Ksp

Siggi's 2026-09-19 ruling is that a constant with no Appendix D row does not ship, and it is what
`syrufastinn` and `leysnijafnvaegi` are held to. **There is no Appendix D table for Kc, in either
book**, and there is a reason: Ka and Ksp are quoted at one standard temperature, while a general
equilibrium constant only means anything beside the temperature it was measured at. Both books
therefore state Kc values inside worked examples.

So the rule here is the spirit rather than the letter: **every constant carries a citation to a
named place in the school's own ch. 13, and `sources.test.ts` fails on one that does not.** If Siggi
would rather supply a Kc table, `src/data/reactions.ts` is the file it replaces.

**Two constants carry no temperature, and that is not an omission to fill in.** The book introduces
the PCl₅ decomposition as holding "under certain conditions" and gives the HCN example as a bare Kc.
Writing a plausible 25 °C into either would put an unsourced number on screen invisibly. Instead
`canConvertToKp` returns false for them, so they never reach the Kc-to-Kp exercise at all — the
consequence is enforced rather than documented.

## ICE in partial pressures

**The four pressure problems run through the same screen as the six concentration ones, and that is
the teaching claim.** Nothing about the method changes when the units do — the engine never knew
what an amount was a measure of — so putting ICE in atm behind its own screen would present it as a
second technique to learn. Beita reads its unit and its constant's symbol off the problem and
labels the columns `(M)` or `(atm)` accordingly.

Three things _are_ genuinely different, and each of the four problems exists for one of them:

1. **The constant is a Kp the book states as a Kp.** Nothing is converted. `sources.test.ts`
   requires `basis: 'Kp'` on all four, and separately requires that a Kp-basis constant never reach
   the Kc→Kp exercise — converting a Kp would be arithmetic performed on an answer.
2. **A heterogeneous system loses its solid from K entirely.** NH₄Cl(s) ⇌ NH₃(g) + HCl(g) leaves two
   gases in a 1 : 1 ratio, so each settles at √Kp. **The solid gets no ICE row**, which is the
   textbook convention and is not cosmetic here: the extent is fixed by K, which ignores the solid,
   so a row for it prints an arbitrary number — and went negative when the flask was charged with
   less solid than the extent consumed.
3. **Total pressure is an observable.** Where Δn ≠ 0, `P_total(x) = P_total(0) + Δn·x` exactly, so a
   manometer reads the extent without a single partial pressure being measured;
   `extentFromTotalPressure` inverts it. Where Δn = 0 it reads **nothing at all**, however far the
   reaction has run — Cl₂ + Br₂ ⇌ 2BrCl is in the set for that alone, and the engine **refuses**
   rather than returning a number, because an extent taken from a measurement carrying none is
   invented. The screen says so in as many words: the instrument is not broken.

**Read the book's BrCl exercise carefully before reusing it.** Its 0,115 and 0,450 atm are the
pressures _in the mixture_ — equilibrium values, not initial ones — so it is a missing-pressure
question and not an ICE at all. Solving it as an ICE from those two gives a different number
entirely. The shipped problem starts from different pressures for that reason, and the test checks
the book's own question against the K expression directly.

**And the book's H₂S answer is the approximation, not the root.** The exercise says in as many words
to assume the change is negligible, so its 0,0072 atm is the shortcut's number; the exact root is
0,007118, 1,2 % lower. Both round to 0,007 and the 5 % rule passes either way. The test compares
like with like rather than holding the exact root to a figure that was never the exact root — the
same care `3-ar/syrufastinn` needed over `√(Ka·C)` against the quadratic.

## Tengd jafnvægi — coupled equilibria

The book's three operations (`ch13/m68798`): reverse an equation and K becomes 1/K; multiply it
through by n and K becomes Kⁿ; add two equations and the K values multiply.

**None of the three is a new rule, and the Skilja step says so in as many words.** K is a ratio of
product terms over reactant terms, so swapping the sides inverts the ratio, multiplying the
coefficients raises every term to that power, and adding two equations multiplies the two ratios and
cancels whatever stands on both sides. One fact, three consequences — which is worth more to a
student than three formulas to memorise.

**No new constant was needed.** The three single-operation problems transform a constant the game
already sources, and a transformed K is derived rather than quoted. The two combination problems are
the book's own worked example and its check-your-learning; the worked example's givens were already
in `reactions.ts`, cited to this very passage, and only the cobalt pair is new.

**The route is found, not asserted.** A problem declares the equations the student is handed and the
equation asked about — the question, never the answer — and `findCoupledRoute` searches for the
operations that get from one to the other at module load. A problem whose target is unreachable
throws on import rather than shipping. `1-ar/nafnakerfid` shipped 33 compounds its own answer tray
could not spell, roughly six unanswerable questions per run, and the cure is the same: have the code
prove the route exists rather than have an author assert it.

**Stage one of the exercise is graded by doing it.** The operations a student picks are applied
through the same engine the data uses and the result compared with the target equation, rather than
checked against a stored list of correct choices. The composed equation is on screen the whole time,
so the student is building something and watching it change rather than guessing at a multiple
choice.

**`coupled-task.test.tsx` plays every problem through the real buttons**, and it is not ceremony:
the search allows factors up to six while the screen offers 1, 2 and 3, so a problem needing a
factor of four would be solvable in the data and unanswerable on the screen. The test reads the
offered factors off the card rather than assuming them, and was verified to fail — naming the
problem and the missing factor — when the buttons were cut to 1 and 2.

**Two refusals worth keeping.** A scale factor must be positive: zero deletes the equation and a
negative one is rule 1 in disguise, which would give one operation two spellings. And two constants
measured at different temperatures do not combine at all — K is a function of temperature, so their
product describes no single system, and `addReactions` returns no constant rather than a plausible
one. The cobalt problem is the case that makes this concrete: its target is the water-gas shift
written backwards, which this game also ships at 800 °C. 1/0,64 = 1,56 against 0,14 for the same
equation. Nothing is wrong — that is what "K depends on temperature" means, and the problem says so.

**Adding the cobalt pair changed an exercise nobody was looking at.** `KP_PROBLEMS` is a blanket
filter over every reaction that _can_ be converted, so both cobalt equilibria joined the Kc→Kp task
by default — and both have Δn = 0, taking it from three Δn = 0 cases in eight to five in ten. They
now carry `excludeFromKpExercise`, the same shape as `nafnakerfid`'s `excludeFromNameBuilder`, and
`sources.test.ts` now guards the Δn spread so the next reaction added does not do it silently.

## Why bisection, not algebra

`solveExtent` finds the root of Q(x) = K by bisection on the **extent of reaction**, rather than
special-casing the algebra. Q rises monotonically with extent — running forward drains the
denominator and builds the numerator — and it sweeps 0 to infinity across the feasible range, so
there is exactly one root and bisection always finds it.

The payoff is that stoichiometry stops mattering. N₂ + 3H₂ ⇌ 2NH₃ from 1,0 and 3,0 M is a **quartic**
by hand; here it is the same call as a 1:1 case, and a test checks the mass balance across the
table. Every textbook restricts its ICE problems to algebra a student can do; this one does not have
to, so the Beita phase can pose the reaction the chapter is actually about.

Heterogeneous reactions are **refused**, not approximated: a solid does not appear in K, so an ICE
row for one would change and never affect the answer — which is the misconception the topic exists
to remove.

## Agreement with the rest of the platform, asserted

- **HCN.** The book's algebra-simplifying example is HCN at Kc = 4,9 × 10⁻¹⁰, which is the same
  number as its sýrufasti, and `3-ar/syrufastinn` ships that from Brown Table D.1. The Skilja phase
  claims they are the same quantity rather than two that happen to agree, so a test holds the two
  files to it.
- **PbCl₂.** The book's first heterogeneous example is `PbCl₂(s) ⇌ Pb²⁺ + 2Cl⁻` with
  Kc = [Pb²⁺][Cl⁻]² — which _is_ a leysnimargfeldi. `3-ar/leysnijafnvaegi` ships that salt. Skilja
  derives the Ksp expression from the general rule and says so.
- **The five per cent rule.** Same threshold as `syrufastinn` and `leysnijafnvaegi`, which is also
  the book's. Three nodes in one chain with three thresholds would teach that the number is
  arbitrary.

## What building it turned up

- **`equilibrium-shifter`'s Q vs K panel was wrong about pressure**, and had been since it shipped.
  It said "Q eykst" for _any_ pressure increase. Compressing a mixture multiplies every
  concentration by the same factor f, so Q moves by f^Δn — for the Haber process (Δn = −2)
  compression makes Q **fall**, which is exactly why the equilibrium shifts right. Of the 21
  equilibria offering a pressure stress, **10 have Δn < 0 and 4 have Δn = 0, so the sentence was
  wrong on 14 of them** — and it contradicted the bars drawn directly above it, which take their
  widths from the shift direction and were right. Fixed, with
  `equilibrium-shifter/src/__tests__/qk-pressure.test.tsx` driving the real component; it fails
  4 of 5 against the old code.
- **The book has a rounding slip.** Its third water-gas experiment prints Q = 0,48 where the inputs
  give 0,4851, which is 0,49 to two figures. The conclusion (Q < K) is unaffected, but the game
  shows its own computed value, so a test records why the screen and the page differ in the last
  digit.
- **`hvarfkvóti` against `hvarfstuðull`**, and **`afurð` against `myndefni`** — see below.

## Terminology

Both corrections were already governed; nothing was newly ruled. They are in
`governed-terms.test.ts` now, which is what was missing.

| Concept           | Use            | Was                 | Evidence                                       |
| ----------------- | -------------- | ------------------- | ---------------------------------------------- |
| reaction quotient | `hvarfstuðull` | `hvarfkvóti`        | `ordabok.md` already said so; corpus 48 to 5   |
| product           | `myndefni`     | `afurð` at 68 sites | `ordabok.md` already said so; corpus 324 to 92 |

**`hvarfstuðull`:** the book uses it throughout its teaching sections and slips into `hvarfkvóti`
only in its Le Chatelier section — it disagrees with itself the way it does over `nettójónajafna`.
This does not conflict with the `sýrufasti` row's argument that a `-stuðull` names a coefficient
rather than a constant: Q is precisely the quantity that is _not_ constant, so the split is what
makes the pair legible.

**`myndefni` is the bigger change and it moves gender** — `afurð` is feminine, `myndefni` neuter —
so it was not a string swap. Three agreements moved with it: `hversu mikil afurð` → `hversu mikið
myndefni`, `Kerfið eyðir henni` → `Kerfið eyðir því`, `Afurð fjarlægð` → `Myndefni fjarlægt`. The
ban starts at a word boundary on purpose, so `lokaafurð` and `aukaafurð` still pass — the book uses
both, and reserves bare `afurð` for by-products and for produce in the everyday sense.

New in `ordabok.md`: `ICE table;ICE-tafla` (the book's own form, used verbatim),
`homogeneous equilibrium;einsleitt jafnvægi`, `heterogeneous equilibrium;misleitt jafnvægi`.

**Five more with the coupled-equilibria work, all taken from the textbook and none ruled on:**
`coupled equilibria;tengd jafnvægi`, `forward reaction;framhvarf`, `reverse reaction;bakhvarf`,
`reciprocal;umhverfa`, `overall equation;heildarjafna`.

| Concept            | Use                      | Evidence                                                                                           |
| ------------------ | ------------------------ | -------------------------------------------------------------------------------------------------- |
| coupled equilibria | `tengd jafnvægi`         | ch15's **glossary headword, with a definition**; the italicised defining use in both ch13 and ch15 |
| forward / reverse  | `framhvarf` / `bakhvarf` | the book's own glossary definitions in ch13/m68797, teaching prose across six chapters, 20 to 15   |
| reciprocal         | `umhverfa`               | the book's word in the sentence that states rule 1                                                 |

**`andhverfa` was the live defect here, and it is now banned for the reaction sense only.**
`equilibrium-shifter` said `bakhvarf` in `App.tsx` and `QKComparison.tsx` and `Andhverfa af …` in
`NumbersPanel.tsx`, so one game named the same thing two ways; two more occurrences sat in its
equilibria data, one of them carrying **English** (`Andhverfa Water Gas Shift hvarfsins`) in an
Icelandic string. All four are fixed. The ban is the whole word with a single carve-out for a
following form of `hlutfall`, because `andhverfu hlutfalli` in `3-ar/gas-law-challenge` is a
different and correct sense — Boyle's law really is an inverse proportion. `handhverfa`
(enantiomer, ch19) is excluded by the leading word boundary.

**One legitimate string was reworded rather than exempted.** `gas-law-challenge` also said
`P og V eru því andhverf` predicatively, with no noun to key a carve-out on, two lines below its own
`í andhverfu hlutfalli`. Normalising it to that phrasing keeps one carve-out instead of a growing
exemption list — and an exemption wider than intended stops enforcing a ruling silently, which is
the lesson the `saltpetur(?!ssyrlingur)` row was written after.

**Not settled, and deliberately left:** `umhverfa` has exactly **one** corpus hit, in rule 1's own
sentence. That is the book's word in the place that matters, and `andhverfa` is taken by the
reaction sense, so there is no competitor — but one hit is thin evidence and Siggi may want to look.

## Layout

```
packages/shared/engine/equilibrium.ts   the maths; no React, no Icelandic
                                        (shared with `3-ar/equilibrium-shifter`)
src/data/reactions.ts       24 reactions, every constant cited to a module
src/data/problems.ts        7 expression · 6 direction · 8 Kc→Kp · 6 ICE (M) · 4 ICE (atm)
src/data/coupled.ts         5 coupled: 3 single-rule, then the book's 2 combinations
src/components/             KannaScreen, SkiljaScreen, AefaScreen, BeitaScreen,
                            ScientificInput (the `× 10` answer row, with a ± sign button on touch)
src/utils/reveal.ts         keeps the next step's start and a checked answer's feedback on screen
src/__tests__/              128 tests
```

## Phones

**The `±` button is what makes the answers typeable on an iPhone.** Every scientific-notation
answer — Kp, the coupled constant, every Beita extent — is a number field and a power-of-ten field,
both on the decimal keypad, and on iOS that keypad has no minus key. Nine of the ten Beita extents
and five of the eight Kp answers have a negative power, so without the button a student on an
iPhone could not type the power the field asks for — the only way round was to write the whole
plain decimal into the number field with a power of 0, which nothing on screen suggests.
It shows only on touch screens (`pointer-coarse`); a desktop keyboard has a minus key and the
desktop row is unchanged. `phone-play.test.tsx` plays an answer through it.

The rest is layout, each piece restoring the desktop look at `sm`: phase cards and boxes lose
padding below `sm`; Kanna keeps its start and equilibrium panels side by side so a preset's result
lands in view; Skilja names only the current step in its progress chips (below `md`, so a phone
held sideways gets one row of chips rather than three); the ICE table's cells do not wrap (so
`0,5 − 2x` never splits) and drop to 13 px below 360 px; and `revealTop` / `revealBottom` scroll
the next problem's start and a checked answer's feedback into view when they are off screen, doing
nothing when they are not.

## Open

- **The ICE ordering above** — the book puts the calculations after Le Chatelier and this game puts
  them before. Reversible by splitting the game in two, if Siggi would rather follow the book.
- **No temperature dependence of K itself.** The game states each constant's temperature and never
  varies it. Van 't Hoff now exists, in `3-ar/equilibrium-shifter` and in the shared engine, so this
  is no longer a gap on the platform — but this game does not use it.
- **The water-gas reaction is named two ways on the platform** and the corpus cannot settle it:
  `vatnsgashvarf` and `vatnsgas hvarf` both return **zero** hits in the book, so the compound
  spelling is not the book's to decide. This game says `Vatnsgashvarfið`; `3-ar/equilibrium-shifter`
  said `Vatnsgas hvarfið` and was harmonised to match, because a genitive compound
  (`bakhvarf vatnsgashvarfsins`) cannot be split and one of the two had to give. That is a spelling
  harmonisation, not a ruling — Siggi's to confirm or reverse.
