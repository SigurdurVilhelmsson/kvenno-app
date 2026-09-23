# Mólhugtakið

Chain position 4 of 10 in Year 1, between Nafnakerfið and Reynsluformúlur (the `Námsleiðin` string
in `src/App.tsx` labels this node `Mólmassi`). The game teaches the mole: summing a molar mass from a
formula, then converting between grams, moles, particles and — for a gas — litres.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing about this game.

The name is **Mólhugtakið** on the hub card, the browser tab and the in-game header — Siggi's
ruling of 2026-09-19, held by `packages/shared/i18n/__tests__/game-titles-agree.test.ts`. The slug
stays `molmassi`.

## Structure

Levels are not gated; any can be opened from the menu.

| Stig | Menu title       | What it asks                                                                                                                                | Per run |
| ---- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1    | Mólmassi         | Three teaching screens, then: type the molar mass of a compound (4 easy, 4 medium, 2 hard)                                                  | 10      |
| 2    | Mól-umbreytingar | An intro, then seven conversion types cycled: g→mól, mól→g, mól→sameindir, sameindir→mól, mól→atóm of one element, mól→L and L→mól of a gas | 10      |
| 3    | Samþætt æfing    | Two-step problems from a fixed pool of 15: mass→particles, particles→mass, mass→moles of one element                                        | 8       |

Stig 1 grades at an absolute tolerance by difficulty (0,5 / 1,0 / 2,0 g/mól) and, on a wrong answer,
`diagnoseMistake` in `Level1.tsx` tries one extra or one missing atom of each element and names the
likely miscount. Stig 2 and 3 grade at 5 % relative. Stig 2 marks itself complete only at 60 of 100.
A periodic table with atomic masses is available in Stig 1 and 3; it is the student's route to the
answer, so do not mask it.

## Before touching it

**Molar masses are derived, never authored.** `src/data/compounds.ts` sums every `molarMass` from
the element list and the masses in `src/data/elements.ts`. Until 2026-08-26 they were typed in by
hand from more precise masses than the table the student sees, and 12 of the 29 compounds printed a
breakdown whose lines did not sum to the total beneath them (B4). Guarded by
`breakdown-sums.test.ts`. This game keeps its own richer `elements.ts`; it is held equal to the
platform's `packages/shared/data/elements.ts` by a test in
`1-ar/reynsluformulur/src/__tests__/problems.test.ts`, which reads this file as text — keep the
`symbol: … atomicMass: …` shape its regex parses.

**Compound names (B5).** `Natríumhýdroxíð`, `Þvottasódi` for Na₂CO₃·10H₂O, and every hydrate named
with its water count. `compound-names.test.ts` also reads `1-ar/lausnir`'s source, so `þvottasódi`
names the decahydrate here and nowhere names the anhydrous salt.

**Molar volume (mól↔L), added 2026-08-27.** First-year material, Siggi's correction. The constant is
`STANDARD_MOLAR_VOLUME = 22.4` at `STP_LABEL` (0 °C and 1 atm) — the textbook keeps the pre-1982
definition, and at 1 bar the figure would be 22,7, so the conditions are printed with every
question. Every compound declares a `state` at STP, describing the substance **as this game names
it**, and the molar-volume slots draw only `'gas'`. Water is `vökvi`; HCl is `vökvi` because it is
named `Saltsýra` (see Open). Guarded by `gas-volume.test.ts`.

**The subscript question.** `moles_to_element_atoms` draws only compounds with a subscript above
one; on a flat formula it would multiply by 1 and teach that the subscript is decoration. Guarded by
`element-atoms.test.ts`, which also asserts a Stig 2 run asks all seven types.

**Both levels read their own notation.** Stig 2 and 3 print `× 10²³`, and until 2026-08-27 neither
parser could read a superscript back — Stig 2 graded `3,5 × 10²³` as 3,5, and Stig 3's
scientific-notation branch was unreachable. Both now use `src/utils/parseAnswer.ts`, which accepts a
decimal comma, superscripts and a trailing unit, and returns `null` rather than a mantissa when part
of the number is not understood. Guarded by `parse-answer.test.ts`. All three answer fields are
`type="text"`. Stig 1 sets `inputMode="decimal"`; Stig 3 does not; Stig 2 chooses per question
(`answerInputMode` in `Level2.tsx`): the decimal keypad, except for the Avogadro-scale molecule and
atom counts, which get the full keyboard and Stig 3's line on how to write `1,2e24`. Guarded by
`phone-input.test.ts`.

The full history of the Phase 3 harvest is in `HARVEST.md`; the rulings are in the repo's
`CLAUDE.md` and `docs/README.md`.

## Layout

```
index.html                         <title>Mólhugtakið - Kvennaskólinn</title>
src/App.tsx                        menu, progress (key `molhugtakidProgress`), chain string
src/i18n.ts                        menu strings via t(), is/en/pl
src/components/Level1.tsx          teach + molar-mass practice
src/components/Level2.tsx          intro + seven conversion types
src/components/Level3.tsx          fixed two-step problem pool
src/components/CalculationBreakdown.tsx  per-element breakdown shown after Stig 1
src/components/PeriodicTable.tsx   the lookup table
src/data/compounds.ts              29 compounds; molar mass derived, state at STP
src/data/elements.ts               atomic masses, with period, group and category
src/data/index.ts                  empty
src/utils/calculations.ts          breakdown generator, including hydrates
src/utils/parseAnswer.ts           parseScientificAnswer
src/__tests__/                     breakdown-sums, compound-names, element-atoms,
                                   gas-volume, parse-answer, phone-input, utils
HARVEST.md                         the 2026-08-27 harvest and the parser defect
LEVEL1_README.md, VISUAL_COMPARISON.md   prototype notes; describe a Level 1 that did not ship
```

## Open

- **`Saltsýra` for HCl.** The name is HCl(aq), a solution, while the game quotes 36,46 g/mól, the
  molar mass of the compound `vetnisklóríð`. HCl is excluded from molar-volume questions rather than
  renamed; the naming is Siggi's call.
- **Unit spelling.** Stig 1 and 3 write the unit `g/mol` where the Stig 2 intro writes `g/mól`.
- **Percent composition** is recorded in the roadmap as "a fourth `molmassi` level", which the
  2026-08-29 no-Level-4 ruling does not allow. Where it goes is not decided.
- **i18n.** Menu text uses `t()`; the level components are hardcoded Icelandic. Part of the
  platform-wide undecided `useGameI18n` question.

**Fixed 2026-09-23 — phones.** Stig 2's decimal keypad could not write the Avogadro-scale answers
two of its seven question types ask for (see above). The periodic table keeps 56px cells below `md`
and scrolls sideways inside its own box, with the whole modal scrolling and the header and element
detail pinned; at 360px the 18-column grid had been 16px-wide cells with 8px masses. Stig 1's
formula headline starts smaller for long formulas (`formulaSizeClass`), since at `text-5xl` every
hydrate split mid-formula.

**Fixed 2026-09-22 — decimal comma.** Every number the game prints goes through `formatDecimal` or
`formatScientific` from `@shared/utils`: Stig 2's worked solutions (molar mass to two decimals, so
HCl no longer shows as `36.458000000000006 g`; `fmt` now writes `1,204 × 10²⁴`), Stig 3's steps
and `fmtSci` (`× 10²²` in superscripts, which `parseScientificAnswer` reads back), the Stig 1
feedback, breakdown and periodic table, and the placeholders and hints. Guarded by
`src/__tests__/decimal-comma.test.ts`.
