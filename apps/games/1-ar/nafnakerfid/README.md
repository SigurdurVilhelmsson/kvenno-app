# Nafnakerfið

Chain position 3 in Year 1, between Lotukerfið and Mólmassi. The game teaches how an inorganic
compound is named: simple ionic compounds, metals with a variable charge (Roman numerals),
polyatomic ions, and binary molecular compounds with Greek prefixes.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing whatever about this game. Nothing was lost by replacing it.

The name is **Nafnakerfið** on the hub card, the browser tab and the in-game header — Siggi's ruling
of 2026-09-19, held by `packages/shared/i18n/__tests__/game-titles-agree.test.ts`.

## The shape

Three levels, none gated (`App.test.tsx` asserts every level is open from the start).

| Level | Title              | What it asks                                                                                                                    |
| ----- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Grunnreglur        | Four naming rules taught with worked examples, then an 8-item metal/non-metal warm-up, then an 11-question multiple-choice quiz |
| 2     | Æfing með leiðsögn | 12 hardcoded formulas: classify the compound type, then type the name, with worked support withdrawn per type                   |
| 3     | Byggja nöfn        | Ten compounds drawn from `data/compounds.ts`; build each name by clicking parts in order                                        |

Level 1's options are constant in the data but shuffled at render (`Level1.tsx:360`), so it is **not**
one of the unshuffled-array defects — `docs/README.md` lists it among the four look-alikes.

## What matters before touching it

**Level 3's parts come from the name, not the formula.** It used to improvise its parts from element
symbols, and 33 of the 51 compounds in its pool could not be assembled at all — no Roman numeral, no
polyatomic ion, no root for six metals, no elided prefix. `data/naming.ts` now declares the naming
vocabulary once (Greek prefixes, element roots and first-element stems such as `brennisteins-`,
elided oxides like `dekoxíð`, polyatomic ions, Roman numerals) and `segmentName` decomposes a name
back into it with backtracking. `utils/nameParts.ts` builds the tray: the name's own morphemes plus
2, 3 or 4 distractors by difficulty, same kind first. Level 3 grades on exact (case-insensitive)
string equality against `compound.name`, so a name the parts cannot spell is an unanswerable
question. The pool is 52 of the 59 compounds; `name-builder.test.ts` pins both numbers.

**Exclusion is declared, not inferred.** `excludeFromNameBuilder` sits on the seven compounds that
are a single indivisible word — the trivial names (H₂O, NH₃, CH₄) and the four diatomic elements.
It replaced a filter that matched a parenthetical in Fe₃O₄'s old name, which meant correcting that
name would silently have changed the question set. Fe₃O₄ is now `Járn(II,III)oxíð` and in the pool.

**B5, the wrong names, fixed 2026-08-26.** P₄O₁₀ lacked its tetra- prefix, cobalt was misspelled,
Fe₃O₄ carried a descriptive label rather than a nomenclature name, sulfur's root in `naming.ts` was
not an Icelandic word (it is now `súlfíð`), and PCl₅ lacked the accent on `Fosfór`.
`compound-names.test.ts` guards all of them, and checks that molecular names carry the prefixes
their formulas require.

**Levels 1 and 2 hardcode their own examples.** That is how the `Fosfór` correction was first only
half-applied: it reached the data file and not the components. The duplication is deliberate — the
examples carry per-level teaching text — so `compound-names.test.ts` checks agreement instead: any
formula both a component and `compounds.ts` know must be spelled the same in both. **If you fix a
name in the data, grep the components too.**

**Level 2 no longer prints the answer (B14).** Step 2 used to end with the finished name and Step 3
repeated it above the input. `supportLadder` now fades support per compound type: the first item of
a type is worked in full, the second blanks each transformation (`súrefni → ?`), later ones show
only the pattern. `level2-no-answer-leak.test.tsx` holds it.

**`Kalíumdíkrómat` stays.** K₂Cr₂O₇ was removed from `1-ar/lausnir` on 2026-08-26, where a student
is told to weigh it out; here naming it is a paper exercise, so it is kept deliberately.

### When adding a compound

1. Add it to `COMPOUNDS` in `src/data/compounds.ts` with a formula, name, type, category and
   difficulty.
2. Run the tests. If its name needs a morpheme `naming.ts` does not declare, `name-builder.test.ts`
   fails and names it — add the morpheme there, not a special case in the builder. The same file
   fails on a morpheme nothing uses, so do not declare speculative ones.
3. Only set `excludeFromNameBuilder` for a name that genuinely has no parts;
   `compound-names.test.ts` lists exactly which formulas are excluded and will need updating.
4. Update the counts `name-builder.test.ts` asserts (pool size and excluded count).
5. Check the name against `packages/shared/i18n/ordabok.md` and the textbook before inventing one.

## Layout

```
src/App.tsx                     menu, progress, Námsleiðin chain string
src/i18n.ts                     is/en/pl strings for t()
src/data/compounds.ts           59 compounds (21 easy, 18 medium, 20 hard)
src/data/naming.ts              the naming morphemes and segmentName
src/utils/nameParts.ts          Level 3 tray, distractors, pool selection
src/components/Level1.tsx       rules, warm-up, quiz (hardcoded examples)
src/components/Level2.tsx       guided practice, supportLadder (hardcoded examples)
src/components/Level3.tsx       name builder
src/__tests__/                  App, data, compound-names, name-builder, name-parts,
                                level2-no-answer-leak, level3-answerable
```

## Open

- **The menu's score denominators are wrong.** `App.tsx` shows Level 1 as `score/10` and Level 2 as
  `score/12`, but Level 1 awards 10 per question over 11 questions (max 110) and Level 2 awards
  5 + 10 per item over 12 items (max 180). `App.test.tsx` asserts the wrong strings (`9/10`,
  `11/12`), so it would need changing with the fix.
- **Level 2 grades with accents stripped.** `normalizeAnswer` folds `ó` to `o`, `ð` to `d` and so on
  before comparing, so a name typed without Icelandic characters is marked correct. That may be a
  deliberate keyboard concession; it is not recorded anywhere as one.
- **Level 1 carries a dead hint multiplier.** `hintMultiplier` is initialised and reset to 1.0 but
  never lowered, so no hint is charged; it is dead state rather than a penalty.
- **The i18n question is undecided platform-wide.** Level 3's teaching text and several Level 2
  strings are hardcoded Icelandic beside a full `i18n.ts`; see CLAUDE.md's deferred-work list.
