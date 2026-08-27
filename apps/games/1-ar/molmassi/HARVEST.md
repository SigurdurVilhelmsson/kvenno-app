# Mólmassi — the Avogadro harvest, and the parser it uncovered

**Landed:** 2026-08-27 · **Roadmap:** `docs/plans/2026-08-16-games-roadmap.md`, Phase 3, row 2
**Source:** `namsbokasafn-leikir` at `379266e`, `games/1-ar/molmassi/src/data/{avogadro,conversionChains}.ts`

The row reads: _"`avogadro.ts` + `conversionChains.ts` … g↔mol, mol↔particles, mol↔L were specified
and built and lost."_ Three claims, and they need separating.

## What of the row was already shipped

**g↔mol and mol↔particles both ship.** Level 2 has asked all four of `mass_to_moles`,
`moles_to_mass`, `moles_to_particles` and `particles_to_moles` since it was written, framed as unit
cancellation, with a tolerance and a decimal-comma-aware parser the old repo did not have.

**mol↔L is in neither.** It is not in `avogadro.ts` and not in `conversionChains.ts`, whose
conversion type is `'mass' | 'moles' | 'molecules' | 'atoms'` — there is no volume in it. So the
roadmap's third claim was right that it is missing, and nothing in the frozen repo fills it.

> **Correction, 2026-08-27 — Siggi.** This entry originally added that molar volume "belongs with
> the gas laws rather than here", filing it as a Year-3 gap. **That is wrong: mol↔L is in the
> first-year curriculum.** It was inferred from where the platform happened to mention it — a
> single Year-3 gas-law string — which is evidence about the platform, not about the course.
> Molar volume is now taught and practised in this game; see the section below.

**`conversionChains.ts` is deliberately not ported.** `1-ar/einingakedjan` (August 2026) is that
file as a game, and better: its ratios are tagged by species, so a chain cannot silently bridge two
substances, and it distinguishes `formúlueiningar` from `sameindir` for an ionic lattice. Porting
the old multi-step chains into Mólmassi would duplicate a shipped game with a weaker engine.

## What was genuinely missing, and landed

**The subscript step.** `atoms_in_compound` — _how many hydrogen atoms are in n moles of H₂O?_ — is
the one conversion of `avogadro.ts`'s five that Level 2 did not ask, and it is the one where the
number in the formula does the work. A student who can go from moles to molecules but reads H₂O as
one hydrogen has not finished learning the mole. It is now a fifth conversion type, drawn only for
compounds that have a subscript above one: on NaCl or KCl the question collapses into the
moles-to-molecules question with a step that multiplies by 1, which would teach that the subscript
is decoration.

**How big the number is.** The level named Avogadro's number and moved straight to arithmetic with
it. Three scale comparisons now sit in the intro. The old file's first one was wrong by a factor of
a thousand — it said counting a mole at a million atoms per second would take **19 million** years;
6.022 × 10²³ ÷ 10⁶ is 6.022 × 10¹⁷ seconds, which is **19 billion** years, longer than the universe
has existed. The ping-pong figure checks out at about 60 km once random packing is allowed for. The
third has been replaced with a glass of water, which is the same idea attached to something a
student can hold.

## Molar volume — the gap this note first mis-filed

Added 2026-08-27, after Siggi corrected the entry above: **mol↔L is first-year material.** Level 2
now asks it in both directions, and the intro teaches it as a fourth key relationship rather than a
fifth kind of arithmetic.

**The constant is 22,4 L/mól at STP, and STP is 273,15 K and 1 atm.** That is not a detail: the
school's textbook states it explicitly, notes that IUPAC moved standard pressure to 1 bar in 1982,
and then says plainly that it keeps the older definition — _"fyrri skilgreiningin er enn í notkun í
mörgum heimildum og verður notuð í þessum texta"_. At 1 bar the figure is 22,7 L/mól. So the
conditions are printed in every question and the test asserts they travel with the number.

**The rule is about gases and nothing else**, which is the whole difficulty. `compounds.ts` had no
state field, so a naive version of this question would cheerfully ask what volume a mole of table
salt occupies — the same class of defect as `lausnir` asking a student to weigh out a gas, measured
and fixed in August 2026. Every compound now declares a `state` at STP, the molar-volume slots draw
only gases, and both the solution steps and the intro say out loud that 22,4 L/mól tells you nothing
about a solid or a liquid.

Two of the twenty-nine needed a decision rather than a lookup:

- **H₂O is not a gas here.** At STP water is not a vapour, and "one mole of water occupies 22,4 L"
  is the most plausible wrong thing a student could take away from this level.
- **HCl is named `Saltsýra` in this game**, which is hydrochloric _acid_ — HCl dissolved in water.
  The pure compound is a gas; a solution is not, and has no molar volume. The state follows the
  label a student actually reads, so HCl is excluded from these questions. **The naming is worth a
  ruling of its own:** the compound HCl is `vetnisklóríð` and `saltsýra` is HCl(aq), and this game
  quotes 36,46 g/mol, which is the molar mass of the compound rather than of the solution. Not
  renamed here — that is a `nafnakerfid`-shaped decision, not a molar-volume one.

Guarded by `src/__tests__/gas-volume.test.ts`, verified to fail when H₂O is marked a gas.

## The defect the harvest uncovered: neither level could read its own notation

This is the part with a live victim.

Level 2 asks `Hversu mörg mól eru 3.5 × 10²³ sameindir?` and Level 3 prints `6,022 × 10²³` inside
every worked solution. Neither parser could read a superscript back.

- **Level 2** matched `10^23` with an ASCII caret and ASCII digits. `²³` are neither, so
  `3,5 × 10²³` fell through to `parseFloat`, which stops at the first character it cannot read and
  returns **3.5**. A student copying the notation they had just been shown submitted an answer
  10²³ times too small and was marked wrong.
- **Level 3** was worse. It called `parseFloat` first and only tried its scientific-notation regex
  if that returned `NaN` — which `parseFloat` never does for a string starting with a digit. The
  regex was unreachable, so `3.34×10^22` graded as **3.34**, on `mass-to-particles` problems whose
  every key is that size.

Both now use `src/utils/parseAnswer.ts`, which takes the superscript handling from the old file's
`parseScientificInput` and is stricter than either parser it replaces: a trailing unit is fine
(`3,5 mól`), but anything left over that contains a digit means part of the number was not
understood, and that returns `null` instead of a mantissa.

This is the same family as B9, the repo-wide decimal-comma pass — a correct answer read as a
different number and silently marked wrong — and it is fixed here for this game only.

## What guards it

| File                                  | Holds                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/__tests__/parse-answer.test.ts`  | A table of what a student might type, including every superscript form; and the refusals, so a half-read number never grades as its mantissa                                    |
| `src/__tests__/element-atoms.test.ts` | The subscript key recomputed from `compounds.ts`; the element named in Icelandic; a flat formula asked the particles question instead; and a run that asks all five conversions |
