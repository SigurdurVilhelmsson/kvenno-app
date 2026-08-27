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
conversion type is `'mass' | 'moles' | 'molecules' | 'atoms'` — there is no volume in it. Molar
volume appears exactly once on the whole platform, in a Year-3 gas-law explanation string
(`3-ar/gas-law-challenge/src/types.ts:91`, "22,4 L við STP"). It is a genuine gap, it belongs with
the gas laws rather than here, and nothing in the frozen repo fills it. Recorded, not invented.

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
