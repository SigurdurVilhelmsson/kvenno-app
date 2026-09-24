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

## Nothing in Stig 2 or Stig 3 is stored

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

**Stig 3 followed on 2026-09-23.** It derived its ratio and moles but graded the volumes against
`correctAcidVolume` / `correctBaseVolume` typed into `data/level3-puzzles.ts`, and every hint was typed
by hand. The ammonium puzzle had been worked from pKa 9,25 and only its quoted pKa was moved to 9,26,
so its hints taught `10^(0,25) = 1,78` for a pH − pKa of 0,24, the worked solution printed
`0,0146 mol / 2 M = 7,1 mL` (the division gives 7,3), and 7,6 mL — 4 % from the true volume — was
marked wrong. `solveStockRecipe` in `engine/buffer.ts` now derives the volumes and water, the three
stored fields are gone, and `level3-puzzles.ts` builds its hints and explanations from the same
numbers the way `level2-puzzles.ts` does. The worked solution shows the `mol / M = L` step before
converting to mL. `level3-recipe.test.tsx` plays every puzzle through the real component.

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
(`Level1.tsx:159`, `Level2.tsx:185`, `Level3.tsx:186`), so the tier cost the component displays is
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
src/engine/buffer.ts                      solveBuffer, solveStockRecipe, bufferRange
src/types.ts                              BufferProblem (no stored answers)
src/data/problems.ts                      28 problems: the pool Stig 2 and 3 draw from
src/data/level1-challenges.ts             6 ratio-band challenges
src/data/level2-puzzles.ts                5 puzzles; hint and explanation numbers derived from solveBuffer
src/data/level3-puzzles.ts                5 puzzles; stock concentrations authored, everything else derived
src/components/                           Level1, Level2, Level3, FlaskComparison,
                                          BufferCapacityVisualization
src/__tests__/                            engine, data, text and played-through tests
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

## Fixed 2026-09-23, beside the mobile pass

Each has a test that fails against the version before it.

- **Stig 1 counted a challenge every time it was checked.** Six taps on "Athuga stuðpúða" finished the
  level from challenge 1 with 600 stig. A solved challenge is now counted once
  (`level1-flow.test.tsx`).
- **Stig 1's last challenge was never seen.** Completion swapped to the menu on the last correct check;
  the level now ends on "Ljúka stigi", like Stig 2 and 3.
- **Stig 1's live readouts disagreed with its check.** The pH bar said "Fullkomið!" inside ±0,1 pH
  while the check graded the ratio band (5 : 6 on challenge 1 read "Fullkomið!", then "Næstum rétt");
  with one component removed the pH fell back to pKa; and the "Algeng villa" box compared the ratio
  with 1 rather than the challenge's band, so on challenge 2 it told a student with too little base
  that there was too much.
- **Stig 2 and 3 awarded a puzzle twice on a quick double tap**, because an answered step stays live
  while it fades out. Each check now ignores a tap after its step is over (`level2-flow.test.tsx`).
- **The addition simulator's chemistry.** Water given 0,01 M strong acid read pH 5 (it divided an
  M amount by 1000); the comparison measured the buffer's ΔpH from 7, so an acetate buffer that moved
  0,18 read 2,44 — more than the water — under "Stuðpúðinn verndar pH"; adding base also took the
  amount off the acid total, so neutralisation was counted twice; and the comparison stayed empty until
  something was added (`buffer-capacity-sim.test.tsx`). Its "Stuðpúðinn verndar pH" tip now appears
  only when the water's change really is the larger one, so additions that cancel make no claim.
- **Answer placeholders were answers.** `t.d. 1.58` was Stig 2 puzzle 1's ratio, and Stig 3's
  `t.d. 1.58`, `0.0039`, `0.0061`, `7.76` and `12.24` were its puzzle 1's ratio, moles and volumes —
  with a full stop. They are format-only now (`0,00`), and `rendered-text.test.tsx` checks every
  placeholder against every answer and every printed string for a decimal point.
- **Text:** the raw pKa `4.74`, the `+0.01 M` buttons, the English gloss in "Stuðpúðageta", the
  missing `en` in Stig 2's direction feedback, `Stuðpúðargeta`, `mólarmassa`, `samoki basinn`,
  "í jafnvægi (1:1)" for equal amounts, `meira sýra en basi`, and split compounds
  (`icelandic-text.test.ts`). The problem contexts Stig 2 and 3 print above a task spelt the
  phosphate and acetate buffers with an accent the rest of the game (and the textbook) does not use,
  and two of them were not Icelandic sentences: a non-word for "acidic" and a non-word "side acid"
  region. All eight contexts in `problems.ts` that carried one of these are corrected, including the
  four no puzzle currently shows. The contrast of the flask comparison panel, whose grey text sat at about
  1,6 : 1 on a see-through background, is fixed by making the panel opaque.

## Open

- **Hint cost** — whether this game should follow the platform's free-hints policy is Siggi's call.
- **`Ammóníustuðpúði`** (8 sites, this game only). The corpus has no `ammóníu-` stem at all — every
  one of its 57 hits is `ammóníum…` — and neither compound appears in it. `ammóníumstuðpúði` looks
  right, but it is a coinage question and has not been ruled.
- **The simulator beyond buffer capacity.** Once added acid or base exceeds a component, the pH is
  clamped at pKa ± log(C / 0,001) and stops moving, so a buffer appears to hold forever. Showing the
  excess strong acid or base takes a model choice.
- **Stig 2's flask comparison does not say what was added** (0,01 mól of strong acid to 1 L), so the
  unbuffered flask's pH 2,0 comes from nowhere a student can see.
