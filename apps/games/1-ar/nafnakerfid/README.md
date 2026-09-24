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

| Level | Title              | What it asks                                                                                                                   |
| ----- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Grunnreglur        | Four naming rules taught with worked examples, then an 8-item metal/non-metal warm-up, then a 10-question multiple-choice quiz |
| 2     | Æfing með leiðsögn | 12 hardcoded formulas: classify the compound type, then type the name, with worked support withdrawn per type                  |
| 3     | Byggja nöfn        | Ten compounds drawn from `data/compounds.ts`; build each name by clicking parts in order                                       |

Level 1's options are constant in the data but shuffled at render (`Level1.tsx:376`), so it is **not**
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
                                level2-no-answer-leak, level3-answerable, level-max-score,
                                level2-blank-answer, level2-prefix-elision, level3-rule-text,
                                level3-near-miss, icelandic-text, mobile-interaction
```

## Fixed 2026-09-23

- **The menu's score denominators.** The stored score is points — 10 per Level 1 question over 10
  questions, 5 + 10 per Level 2 item over 12 items — but the menu divided it by the question count,
  so a perfect run read `100/10` and `180/12`. Each level now exports its maximum
  (`LEVEL1_MAX_SCORE` = 100, `LEVEL2_MAX_SCORE` = 180) and the menu divides by that.
  `level-max-score.test.tsx` plays a perfect run of each level and holds the export to it.
- **Level 1's dead hint multiplier** is gone. It was initialised and reset to 1.0 but never lowered,
  and the quiz shows no hints, so it charged nothing; `onComplete` now reports 0 hints used.
- **`mónó-`.** Levels 1 and 2 taught the Greek prefix without its accents while Level 3's tray, built
  from `PREFIXES` in `data/naming.ts`, offers `mónó` — as does the textbook's prefix table
  (`ch02/m68698`). `icelandic-text.test.ts` holds Level 2's prefix table to `PREFIXES`.
- **Icelandic that was wrong**, each held by `icelandic-text.test.ts`: the neuter `forskeyti` declined
  as masculine (`grísk forskeyti`), `forskeyti` mistyped as "the president", `hliðarmálmur` for
  transition metal (`ordabok.md`), `halógenar`, split compounds (`klóratóm`, `súlfatjón`,
  `nítratjón`, `hýdroxíðjón`, `Heildarstig`), agreement in five Level 3 info lines, the English
  `rust`, two info lines that were not Icelandic words at all (SO₂, XeF₄), `tvíefnasamband` for the
  book's term, and Level 3's "letters that differ" sentence.
- **Level 3's rule after a variable-charge answer** said only `málmleysingi-íð`, so after
  Kopar(II)súlfat and the three nitrates it described an anion the name does not have. It now carries
  the same polyatomic-ion sentence the plain ionic rule always had (`level3-rule-text.test.ts`).
- **Level 3's "Þú varst nálægt" highlighting** compared the names position by position, so one
  missing or extra character painted every letter after it red — `)nítrat` for a student who built
  `Járn(II)nítrat` — under a note saying red marks what differs. It now aligns the two through the
  edit-distance table, marking only the wrong character or a `·` where one is missing
  (`level3-near-miss.test.tsx`, including every single edit of every name in the pool).
- **Level 2's Enter key** submitted a whitespace-only answer the disabled button would not, and
  marked it wrong (`level2-blank-answer.test.tsx`).
- **Level 2 marked `Díniturtetraoxíð` wrong.** Step 2 builds N₂O₄ as `dí + nitur + tetra + oxíð`,
  and the textbook's naming section (`ch02/m68698`) says students may keep the prefix's last vowel
  before a vowel or drop it, but the grader took only `Díniturtetroxíð`. A student who followed the
  steps exactly was marked wrong under a summary that printed the very parts they had joined.
  `normalizeAnswer` now folds the two forms together (`level2-prefix-elision.test.tsx`).

## Open

- **Level 2 grades with accents stripped.** `normalizeAnswer` folds `ó` to `o`, `ð` to `d` and so on
  before comparing, so a name typed without Icelandic characters is marked correct. That may be a
  deliberate keyboard concession; it is not recorded anywhere as one. (Its prefix-vowel fold is a
  separate matter and is not open: the textbook accepts both forms.)
- **Level 3 accepts only the elided prefix.** `data/naming.ts` makes `tetroxíð`, `pentoxíð`,
  `heptoxíð` and `dekoxíð` single parts, and its comment calls choosing them over `tetra` + `oxíð`
  the point. But the tray can offer `tetra` and `oxíð` as distractors (rarely: under 1 % of trays
  for the four elided compounds), and the textbook (`ch02/m68698`) accepts both forms, so a student
  who builds `Díniturtetraoxíð` is told they were close and shown the `a` in red. Level 2 now accepts
  both; whether Level 3 should is Siggi's call.
- **The warm-up's `Mundu:` card** says metals are groups 1, 2 and 3–12 and non-metals 15–18. Hydrogen
  is in group 1, groups 13–14 are missing (Al, Sn and Pb, all used in Levels 2–3, among them), and
  15–16 hold metals too. Every warm-up element fits the card, so nothing is graded wrong; how much to
  simplify is a teaching call.
- **The menu's `Af hverju nafnakerfið?` card** says `Sama nafn, sama efni — óháð tungumáli`, but the
  names are not language-independent — the game teaches `Natríumklóríð`, not `sodium chloride`. The
  system is shared; the names are not. A rewording is Siggi's call.
- **Level 3's info line gives answers away.** `compound.info` prints under the formula before the
  student builds anything, and on the variable-charge items it states the charge the Roman numeral
  encodes (`Járn +3, þrjú nítrat` over Fe(NO₃)₃; likewise Fe₂O₃, Cu₂O, Pb(NO₃)₂, SnO₂, Co(NO₃)₂) and on
  several ionic items it names the ion (`Ammóníum (NH₄⁺) + Klóríð` is the whole answer for NH₄Cl).
  Hiding it would also remove the only route to Fe₃O₄'s `(II,III)` and to ions Levels 1–2 never
  teach (ammóníum, fosfat, vetniskarbónat, díkrómat). Siggi's call.
- **`fjölatóma jón` against `ordabok.md`.** The game says `fjölatóma jón` throughout, as does the
  textbook's prose (23 to 2), but `ordabok.md` has `polyatomic ion;fjölfrumeinda jón`; two Level 3
  info lines say a third word, `Sameindajón`. Siggi's call.
- **The i18n question is undecided platform-wide.** Level 3's teaching text and several Level 2
  strings are hardcoded Icelandic beside a full `i18n.ts`; see CLAUDE.md's deferred-work list.
