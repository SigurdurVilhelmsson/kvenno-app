# VSEPR Rúmfræði

Chain position 3 in Year 2, between Lewis-formúlur and Millisameindakraftar. The game teaches how
the number of `svæði rafeindaþéttleika` around a central atom, bonding domains and lone pairs
together, fixes a molecule's electron geometry, its shape and its bond angles; and then
`svigrúmablöndun` and polarity, following Brown ch. 9 as the menu cites it.

## Structure

Three levels, none gated, picked from the menu. Each ends `N af M rétt`, which the menu and the
completion screen show as the level's best count; progress saved before counts were kept shows
`Lokið`. Progress lives under the localStorage key `vsepr-geometry-progress`. The completion screen
("Þú hefur lokið öllum stigum!") follows whichever level completes the set, in any order.

| Stig | Menu name                          | What it asks                                                                |
| ---- | ---------------------------------- | --------------------------------------------------------------------------- |
| 1    | Stig 1: VSEPR Kenning              | Explore 8 shapes with four widgets, then 8 multiple-choice questions        |
| 2    | Stig 2: Spá fyrir um lögun         | 10 molecules, 4 steps each: count, shape, angle, written explanation        |
| 3    | Stig 3: Svigrúmablöndun og skautun | 12 multiple-choice questions: hybridization, polarity, two centres, dipoles |

- **Stig 1** opens on an explore phase: a shape picker (linear through octahedral, each with an
  example from CO₂ to SF₆), a 2D/3D toggle, and four widgets — `ElectronRepulsionAnimation`,
  `ShapeTransitionAnimation`, `BondAngleMeasurement` and a description — which on a phone become
  tabs (`Fráhrinding`, `Lögunarbreyting`, `Tengihorn`, `Lýsing`). The questions follow, options
  shuffled per question. One hint each.
- **Stig 2** steps are `Telja svæði rafeindaþéttleika`, `Velja lögun`, `Tengihorn`, `Útskýra`. The
  shape step offers only the shapes the molecule's domain count allows (`GEOMETRIES_BY_DOMAINS`,
  the "constrained prediction"). The 2D/3D view of the molecule and the repulsion animation appear
  only once the shape step is answered right; a wrong answer moves on without them. Three steps
  are counted per molecule, so the level reports out of 30; the explanation is checked only for
  length and never counted.
- **Stig 3** is 4 hybridization, 4 polarity, 2 multi-centre (C₂H₄, C₂H₂) and 2 dipole questions,
  options shuffled per question. After a hybridization question the `HybridizationDiagram` shows
  which orbitals mix into the hybrid set (`HYBRIDIZATION_CONFIGS` in `components/Level3.tsx`).

**Grading.** The two count fields are `type="number"`. The angle field is `type="text"`, because
an answer may list several angles: `parseAngles` in `utils/bondAngles.ts` reads the decimal comma
through `parseStudentNumber`, and `gradeBondAngle` accepts each stored angle within
`ANGLE_TOLERANCE` (±2°) — a bent molecule also 103–106° — and refuses any written angle the shape
does not have (`SHAPE_ANGLES`).

## What matters before touching it

**No score; one counted try per item (mobile-pass decision 1 (b), applied 2026-10-03, PR #85).**
Every level showed `{score} stig`, Stig 1 paid 15 × a hint multiplier, and the menu summed the
levels into a total. Now a level counts right answers, a hint changes nothing, and Stig 2 counts
its three graded steps. The one exception is Stig 2's second angle tier, `horn nálægt …`, which
states the answer: a right angle after it is not counted and the verdict says
`Rétt! Síðasta vísbendingin gaf svarið, svo svarið telst ekki með.` (`docs/REVIEW-QUEUE.md` C3,
2026-10-23). `__tests__/level-results.test.tsx` holds all of it; `completion.test.tsx` holds the
completion screen, which used to follow Stig 3 alone and congratulate a student who had played only
that.

**Stig 2's angle step.**

- It read numbers with `/[\d.]+/`, so `107,6` split into 107 and 6 and `90 120` glued into 90120;
  every angle on screen was printed with a full stop, and the field's placeholder showed the answer
  to three of the ten molecules. `bond-angle-grading.test.tsx` and `bond-angles.test.ts` hold the
  reading; `icelandic-text.test.ts` fails on any angle written with a decimal point.
- **Decision 70:** the grader asked only whether the stored angles appeared, so
  `90 104,5 107 109,5 120 180` was right for every molecule. `SHAPE_ANGLES` holds the ideal VSEPR
  set per shape; the see-saw and T-shape keep the ideal bipyramid angles, confirmed by Siggi
  2026-10-23.
- **Decision 71:** the angle hint gave the number at once. The first press names the electron
  geometry and asks what its angles are; `Sýna nánari vísbendingu` then gives the angle.

**Stig 2's count step grades domains (decision 67).** CO₂'s key is 2, so a field labelled for
bonding pairs marked a student who counted four wrong. The fields are `Tengisvæði` and `Stök pör`,
the feedback reads `2 tengisvæði og 2 stök pör`, and the hint says a single, double or triple bond
is one domain. `level2-feedback.test.tsx` holds this and five more fixes, among them a hint that
gave carbon in CO₂ two valence electrons, `1 stök pör`, and XeF₄'s lone pairs said to shrink an
angle that stays 90°.

**Stig 1's questions gave answers away.** The picture's accessible name was the shape's name, the
correct option alone carried an English gloss, a wrong answer showed a "Rétt!" under "Rangt", and
every wrong answer got the same misconception note (`level1-quiz.test.tsx`). The three explore
widgets each copied the picked shape into state once, so they stayed on the first shape
(`widgets-follow-selection.test.tsx`). The bond-angle diagram's scale put the tick for a at a, so
BF₃'s bond pointed at "60°" (`bond-angle-ticks.test.tsx`, `docs/REVIEW-QUEUE.md` D1).

**Stig 3** rendered options in data order, with the answer at b in six of twelve and at d in none;
its polarity card also listed water's answer under the question about water
(`level3-options.test.tsx`). SF₆'s distractor was sp³d² in complex-ion notation, graded wrong while
its explanation called the two the same (decision 68, now `sp³d³`), and the NF₃ against NH₃
explanation contradicted itself (decision 69, rewritten in Brown's δ− convention). Both are held by
`icelandic-text.test.ts`.

**Terminology (decision 20's VSEPR part, 2026-10-01).** `svigrúmablöndun`, `svæði
rafeindaþéttleika` (shortened to `svæði`, never `svið`), the glossary's shape names
(`Þríhyrningslaga flatt`, `Þríhyrningslaga pýramídi`, `Vegasalt`, `Ferningslaga flatt`), the book's
`Þríhyrndur tvípýramídi`, `Ferflötungur` (confirmed by Siggi 2026-10-23), `stakt par` / `stök pör`,
and `tengi` for a bond. Decision 6 (c) removed the English shape subtitles, glosses and the pair
abbreviations; decision 7 replaced the d-orbital account in Stig 2's PCl₅ and SF₆ explanations with
the central atom's size. `__tests__/icelandic-text.test.ts` bans each old form, scanning comments
too; eight of the terms are also platform rows in
`packages/shared/i18n/__tests__/governed-terms.test.ts`. `svæði rafeindaþéttleika` declines only in
`svæði` (`með fjórum svæðum rafeindaþéttleika`).

**The language switcher was stripped on 2026-10-02** (decisions item 4): the game translated only
its title and description. `switcher-earns-its-place.test.ts` lists it, and the game is outside the
open `useGameI18n` question.

**Two animations are marked `data-live`** — `ElectronRepulsionAnimation` and
`ShapeTransitionAnimation` move on every frame, so `scripts/desktop-compare.mjs` masks them and
compares only their boxes. A new animation without the mark shows up as a difference on every PR
that touches the game.

**Phones.** `phone-scroll.test.tsx` holds where the page and focus go. Between a phone and `md` the
game keeps what its old scroll helper did there, through `utils/tabletBand.ts`; from `md` up the
page never moves. Renaming a label the e2e paths in `e2e/mobile-game-screens.ts` click means
updating them in the same change.

**The 3D view (see `CLAUDE.md`: "Three.js code-split", "drei barrel follow-up", "3D labels
fixed").** This is one of the three games built with `singleFile: false` (`vite.config.ts`): it
emits `vsepr-geometry.html` plus `assets/vsepr-geometry/` (a hashed entry, a hashed stylesheet, the
deferred `MoleculeViewer3D-*` chunk and its bundled label font), and the HTML alone does not boot.
Stig 1 and 2 import `MoleculeViewer3DLazy` from `@shared/components/MoleculeViewer3D`, never the
eager viewer, whose static import would put Three.js back in the entry. `scripts/check-lazy-3d.mjs`
fails `pnpm build` if a first page load fetches Three.js. This game carries the browser guards:
`e2e/threejs-lazy-loading.spec.ts` checks Three.js is absent on load and arrives once a 3D view
opens, and `e2e/threejs-labels.spec.ts` loads the view under the CSP lifted from
`server/nginx-site.conf` and waits for the viewer's `aria-busy` to clear. Both reach the view by
clicking `Stig 1`, `Línuleg` and `3D`, so renaming any of those breaks them.

## Layout

```
src/App.tsx                              menu, completion screen, progress, resultLabel, Námsleiðin
src/components/Level1.tsx                Stig 1: GEOMETRIES (8), explore tabs, 8 questions inline
src/components/Level2.tsx                Stig 2: 10 molecules inline, the four steps, hints
src/components/Level3.tsx                Stig 3: 12 questions inline, HybridizationDiagram
src/components/ElectronRepulsionAnimation.tsx  repulsion widget (data-live)
src/components/ShapeTransitionAnimation.tsx    shape-change widget (data-live)
src/components/BondAngleMeasurement.tsx  bond-angle diagram and its scale
src/utils/bondAngles.ts                  parseAngles, SHAPE_ANGLES, gradeBondAngle
src/utils/vseprConverter.ts              shape data → shared Molecule, for 2D and 3D
src/utils/tabletBand.ts                  scroll behaviour between a phone and md
src/__tests__/                           level-results, completion, level1-quiz, level2-feedback,
                                         bond-angle-grading, bond-angles, bond-angle-ticks,
                                         level3-options, widgets-follow-selection,
                                         phone-scroll, icelandic-text, vseprConverter
src/__tests__/level2-play.ts, next-guard-clock.ts   test helpers
```

There are no side files. Run the tests from the repo root
(`pnpm exec vitest run apps/games/2-ar/vsepr-geometry`): the render tests need the root config's
DOM environment.

## Open

Found 2026-11-02, a ruling for Siggi (`docs/REVIEW-QUEUE.md` C21):

- **Stig 3 question 4 (SF₆) still gives d-orbitals as the reason**, in its hint
  (`Þetta krefst d-svigrúma.`) and explanation, and writes `3. röð` where the game elsewhere says
  `3. lotu`.
  Decision 7 reached Stig 2 only; whether it reaches the sp³d / sp³d² hybridization model is
  Siggi's call.

Also open, tracked elsewhere: the hand checks in `docs/REVIEW-QUEUE.md` B, and the no-WebGL panel's
wording (D2), shared by the three 3D games. The level screens build their own `← Til baka` and the
completion screen keeps its 🏆 and no `Header`; C6's chrome ruling covered Lewis only.

**Fixed 2026-11-02**, found writing this file: CO₂ and SO₂ were drawn with single bonds; they
are now O=C=O and, as Lewis-formúlur's first vokmynd, O=S–O (`MULTIPLE_BONDS` in
`utils/vseprConverter.ts`, `vseprConverter.test.ts`). Stig 2's count step read `2.5` as 2 and
its explanation step marked a 10–20 character answer `Rangt` after Athuga allowed it
(`wholeCount`, `explanationLongEnough`, `level2-grading.test.tsx`). The menu and Stig 3 said
`Þríhyrnd` for trigonal planar; they say `Þríhyrningslaga flatt`, and `icelandic-text.test.ts`
bans the bare form.

**Closed.** Decisions 1, 6, 7 (Stig 2), 8 (`klíptu eða skrunaðu`), 20, 67, 68, 69, 70 and 71 are
applied, and the bond-angle scale (D1) is fixed. The three-domain bent card was once reported as a
defect and retracted on 2026-10-02 (`docs/REVIEW-QUEUE.md`).

## Leftovers

Not recorded anywhere else; found while writing this file.

- **Stig 1's hints carry four tiers and show one.** Each question's `hints` has `topic`,
  `strategy`, `method` and `solution`, but the level renders only `hints.topic`.
- **`widgets-follow-selection.test.tsx`** says the shape cards carry an English subtitle; decision
  6 removed it, and the test picks cards by their Icelandic names.
- **Shape data lives in seven places:** `GEOMETRIES` (Level 1), `GEOMETRY_OPTIONS` and the molecules
  (Level 2), `HYBRIDIZATION_CONFIGS` (Level 3), `BOND_ANGLES`, the two animations' configs, and
  `SHAPE_ANGLES`. `apps/games/2-ar/REVIEW_TRACKER.md` deferred consolidating it in April.
