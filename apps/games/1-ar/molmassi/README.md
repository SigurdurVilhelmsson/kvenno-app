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
likely miscount. Stig 2 and 3 grade at 5 % relative. Stig 2 marks itself complete only at 60 of 100;
Stig 3 marks itself complete on reaching its summary, whatever the score (see Open).
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
atom counts, which get the full keyboard and Stig 3's line on how to write `2,5e20`. Guarded by
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
src/data/compounds.ts              29 compounds; molar mass derived, state at STP, dative and
                                   genitive name, ionic or molecular
src/data/atomWords.ts              the stem each element takes in `-atóm` (`súrefnisatóm`)
src/data/elements.ts               atomic masses, with period, group and category
src/data/index.ts                  empty
src/utils/calculations.ts          breakdown generator, including hydrates
src/utils/parseAnswer.ts           parseScientificAnswer
src/__tests__/                     breakdown-sums, compound-names, element-atoms,
                                   gas-volume, parse-answer, phone-input, utils, and from
                                   2026-09-23 ionic-particles, level1-teach-and-input,
                                   level2-feedback, level3-summary, name-cases,
                                   notation-examples, periodic-table, wording
HARVEST.md                         the 2026-08-27 harvest and the parser defect
LEVEL1_README.md, VISUAL_COMPARISON.md   prototype notes; describe a Level 1 that did not ship
```

## Open

- **`Saltsýra` for HCl.** The name is HCl(aq), a solution, while the game quotes 36,46 g/mól, the
  molar mass of the compound `vetnisklóríð`. HCl is excluded from molar-volume questions rather than
  renamed; the naming is Siggi's call.
- **Stig 3's completion threshold.** It records the level as complete on reaching the summary,
  whatever the score — 0 of 8 included — while Stig 2 requires 60 of 100 and Stig 1 a press of
  `Ljúka stigi`. Whether Stig 3 should have a threshold is a scoring decision; nothing was changed.
- **`magnefnafræði`** in the menu's "Af hverju mólmassi?" card is in neither `ordabok.md` nor the
  textbook. If it means stoichiometry the ruled word is `hlutfallaefnafræði`; if it means
  quantitative chemistry, `magnbundin efnafræði`. Siggi's call.
- **Periodic-table legend, two names.** `Eðallofttegundir`: `ordabok.md` says `eðalgas`, the textbook
  prefers `eðallofttegund-` (54 to 25 in `02-mt-output`), so by the resolution order it is Siggi's call. `P-málmar`:
  `ordabok.md` is silent and the textbook has one `eftirhliðarmálmar`.
- **Stig 3's mass-to-molecules answers are nearly all the same number.** Five of its six problems
  (36 g H₂O, 88 g CO₂, 117 g NaCl, 34 g NH₃, 64 g O₂) are two moles each, so all five come to
  1,20 × 10²⁴; only CH₄ differs. A student who notices can answer without calculating. Varying the
  masses (e.g. 1,5, 2,5 and 3 mól) would fix it, but choosing problem values is content, so nothing
  was changed. The notation example that pointed straight at that number is fixed (below).
- **Percent composition** is recorded in the roadmap as "a fourth `molmassi` level", which the
  2026-08-29 no-Level-4 ruling does not allow. Where it goes is not decided.
- **i18n.** Menu text uses `t()`; the level components are hardcoded Icelandic. Part of the
  platform-wide undecided `useGameI18n` question.

**Fixed 2026-09-23 — non-layout defects found in the phone pass.** Each has a test that failed
against the previous commit.

- **Stig 3's summary was unreachable.** The last `Sjá niðurstöðu` called `onComplete`, whose App
  handler also switched to the menu. Level 3's `onComplete` now only records the level
  (`level3-summary.test.tsx`).
- **Names in sentences take their case from the data** — `nameDative` after `af`, `nameGenitive`
  after `Mólmassi` — and atoms are compound words from `atomWords.ts`. The templates had read
  `af Köfnunarefni`, `af vatn`, `Mólmassi Vatn er`, `Súrefni-atóm` and `súrefni-atómi`. Stig 3's
  hydrogen problem said `mól af vetni`, which reads as moles of H₂; it now says `vetnisatómum` like
  the others (`name-cases.test.tsx`).
- **A salt is counted in formula units.** Stig 2 asked for the `sameindir` in a mole of NaCl. Every
  compound now declares `ionic`, held to its formula by `ionic-particles.test.ts`, and Stig 3's
  `particleWord` is derived from it rather than written per problem.
- **Stig 2's atoms-of-an-element summary did not cancel**: `(atóm af frumefninu / 1 mól) × (atóm /
1 mól)` leaves atoms squared. It is now `(mól af frumefninu / 1 mól)`, as the worked line was.
- **Stig 2 printed each worked solution twice** — expanded under "Af hverju?" and in the
  `Útreikningur` box. The panel now starts closed (CLAUDE.md's rule for text visible elsewhere),
  and the box keeps the steps' line break. An unreadable answer now says `Ógilt gildi` instead of
  doing nothing (`level2-feedback.test.tsx`).
- **The unit is `g/mól` throughout**, as the textbook writes it (79 to 0). Also: the legend's
  `Hliðarmálmar` and `Málmleysingjar` (`ordabok.md`), `atómmassaeiningum` for a non-word, and seven
  grammar slips (`wording.test.ts`); and the detail panel's `×` is named `Loka nánari upplýsingum`
  (`periodic-table.test.tsx`).
- **The notation examples were answers.** Stig 3's field said `t.d. 1,2e24 eða 22,0`, and its help
  line and error repeated `1,2e24` — the answer, within the 5 % tolerance, to five of its six
  mass-to-molecules problems, while `22,0` g is CO₂'s particles-to-mass answer. Stig 2's help line
  and error said `1,2e24` too, the key whenever a run drew 2 mól. Both levels now say `2,5e20` and
  `12,5`, below every count either level asks for (`notation-examples.test.tsx`).
- **Stig 1's water example did not add up**: `2,016 + 16,00 = 18,015` is the total with O at
  15,999, not the 16,00 on the same screen. It now reads `18,02`, as the Stig 2 intro and the field's
  placeholder do. And Stig 1, like Stig 2, ignored an answer it could not read (`≈ 18`); it now says
  `Ógilt gildi` (`level1-teach-and-input.test.tsx`).

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
