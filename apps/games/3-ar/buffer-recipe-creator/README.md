# Stuðpúðasmíði

Chain position 7 in Year 3, between pH Títrun and Leysnijafnvægi (the chain chip labels this node
`Stuðpúðar`). The game teaches buffers through the Henderson–Hasselbalch equation,
pH = pKa + log([A⁻]/[HA]): first as a ratio you can see, then as masses to weigh out, then as
volumes to draw from stock solutions. The menu cites Brown et al., chapter 17.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing whatever about this game. Nothing was lost by replacing it.

## The shape

| Stig | Menu label                           | What the student does                                          | Items |
| ---- | ------------------------------------ | -------------------------------------------------------------- | ----- |
| 1    | Hugmyndafræði                        | Add and remove acid/base molecules until the ratio hits a band | 6     |
| 2    | Útreikningar                         | Direction (more acid or more base?) → ratio → two masses       | 5     |
| 3    | Birgðalausnir og rúmmálsútreikningar | Ratio → moles → volumes of each stock solution                 | 5     |

Stig 1 has no numbers to type: it grades whether [base]/[acid] falls inside the challenge's
`targetRatioMin`–`targetRatioMax` band, and the six bands all contain `10^(pH − pKa)` for their own
pKa. Stig 2 and 3 are the calculation. Levels are not gated (the 2026-08-29 ruling); progress is kept
under the `buffer-recipe-creator-progress` key.

## Nothing in Stig 2 is stored

`engine/buffer.ts` derives the ratio, the moles and the masses from each problem's pKa, target pH,
volume, total concentration and molar masses; `Level2.tsx:65` calls `solveBuffer` and grades against
it at the puzzle's `massTolerance` (±5 %).

Until 2026-09-19 those five numbers were typed into `data/problems.ts`, and 13 of the 29 real problems
then in the pool disagreed with themselves — a correct student was marked wrong on three of the
Stig 2 puzzles, and the explanation printed the false arithmetic back. The comment at the top of
`engine/buffer.ts` tells the story; the fields are gone from `types.ts` with a note saying why.
`1-ar/takmarkandi`'s README cites this defect as its reason for storing nothing.

**The `phAdjustment` branch is load-bearing.** Problem #25 weighs out _all_ the weak acid and adds
NaOH to make the conjugate base, so its acid mass is the total, not the acid fraction.
`buffer-engine.test.ts` pins both branches against hand-worked values. Note that no Stig 2 or Stig 3
puzzle currently points at #25; the branch is guarded for the day one does.

## Every pKa comes from Brown Appendix D

Siggi's 2026-09-19 ruling: Appendix D is authoritative, and a constant with no Appendix D row does
not ship. `appendix-d-conformance.test.ts` checks every numeric `pKa` field in the game against
`packages/shared/data/appendix-d.ts`, compared at the precision it is written to, with no exemption
list. Problem #30 (a hypothetical `Veikt sýra`, pKa 5.2) is the one value it skips.

- **Corrected that day:** bicarbonate 10.33 → 10.25, benzoic 4.19 → 4.20, citric 4.76 → 4.77,
  ammonium 9.25 → 9.26, formic 3.75 → 3.74. The test pins each and rejects the old value for the
  same acid.
- **TRIS was dropped**, which is why the problem ids skip 13 and 27 and why Stig 2 and Stig 3 each
  serve five puzzles, not six (their ids skip 4 and 3 respectively).

## Hints cost points here

All three levels pass `onPointsChange` to the shared `HintSystem` and multiply the award by it
(`Level1.tsx:127`, `Level2.tsx:165`, `Level3.tsx:168`), so the tier cost the component displays is
genuinely charged. `docs/README.md` records this as deliberately left alone when ph-titration's
penalty was removed, and `consumers-honest.test.ts` only requires that a displayed cost be real. It
does sit against the platform's "hint usage is never penalised" rule — see Open.

## Terminology and name

The word is `stuðpúði` (masculine; compounds on `stuðpúða-`). The naturalised loanword this game
used to carry is banned by `governed-terms.test.ts`, and it survived in the browser-tab `<title>`
until 2026-09-19 because that scan did not read `.html`. Hub card, `<title>` and `gameTitle` now all
say `Stuðpúðasmíði`, held by `game-titles-agree.test.ts`.

The language switcher was stripped on 2026-09-19 (`switcher-earns-its-place.test.ts`); the game
renders hardcoded Icelandic. The `En`/`Pl` fields in the data files are no longer read by any
component.

## Layout

```
src/App.tsx                               menu, progress, chain chip
src/engine/buffer.ts                      solveBuffer, bufferRange
src/types.ts                              BufferProblem (no stored answers)
src/data/problems.ts                      28 problems: the pool Stig 2 and 3 draw from
src/data/level1-challenges.ts             6 ratio-band challenges
src/data/level2-puzzles.ts                5 puzzles; hint and explanation numbers derived from solveBuffer
src/data/level3-puzzles.ts                5 puzzles, with stock concentrations and stored volumes
src/components/                           Level1, Level2, Level3, FlaskComparison,
                                          BufferCapacityVisualization
src/__tests__/                            buffer-engine, data-integrity, appendix-d-conformance
LEVEL1_README.md, PROTOTYPE_SUMMARY.md,   historical notes from the Level 1 prototype;
TEST_LEVEL1.md, VISUAL_COMPARISON.md      they describe files and plans that no longer match
```

## Stig 2's hints are derived, like its grading

**Fixed 2026-09-22.** The four hint tiers and the explanation were hand-typed and were not
re-derived when grading moved to `engine/buffer.ts` or when Appendix D moved ammonium to 9,26. On
three of the five puzzles a student who copied the revealed worked solution was marked wrong by
the level that had just revealed it — the formate puzzle (#19) gave ratio 1,78 and acid mass
2,58 g against a grader wanting 1,82 and 1,63 g, with the acid and base moles swapped. Now only
the prose is authored (`topicIs`, `noteIs`); every number comes from the `solveBuffer` the grader
calls. `level2-hints.test.ts` reads the masses, ratios and pKa back out of the text and puts them
through the level's own comparison. A puzzle pointing at a `phAdjustment` or `rangeQuestion`
problem throws on import, since the derived sentences describe mixing two salts.

The dead English and Polish copies of Stig 2's hints went with it — nothing in this game renders
them, and they carried the same wrong numbers. The stale **9,25** in Stig 1 challenge 6 and Stig 3
puzzle 5 hint text is corrected to 9,26 too, and `appendix-d-conformance.test.ts` now reads hint
and explanation text for superseded values, not only the numeric fields.

## Decimal comma, everywhere a student reads a number

**Fixed 2026-09-22.** Task text, hints, worked solutions and every number a component formatted
with `toFixed` printed a full stop, beside answer fields that teach the comma. Components now
format through `formatDecimal` from `@shared/utils` (the printing half of `parseStudentNumber`),
and the Icelandic and Polish data strings use the comma; English fields keep their full stop.
`decimal-comma.test.ts` fails on a decimal point in any Icelandic data string and on any
`toFixed` in a component other than the SVG path geometry in `BufferCapacityVisualization`,
where a comma would break the path.

## Open

- **Stig 3 is only half derived.** Its ratio and mole steps are computed at runtime
  (`Level3.tsx:86-89`), but the volume step grades against stored `correctAcidVolume` /
  `correctBaseVolume` (`Level3.tsx:160-166`) and prints them in the explanation. They currently
  agree with derivation within tolerance — the ammonium puzzle is off by about 3 % (7.1 mL stored,
  7.31 mL derived) — but nothing tests them.
- **Hint cost** — whether this game should follow the platform's free-hints policy is Siggi's call.
