# Millisameindakraftar

Chain position 4 of 8 in Year 2, between VSEPR and Lögmál Hess. The game teaches the three
intermolecular forces the textbook names — London-kraftar, tvískauts-tvískauts kraftar and
vetnistengi — how to tell which act in a molecule, and how their strength orders boiling point,
vapour pressure, viscosity and surface tension (Brown et al., ch. 11, as the menu says).

It is one of the three Three.js games, with `2-ar/lewis-structures` and `2-ar/vsepr-geometry`:
Stig 1 can show each molecule in 3D. See [Three.js](#threejs) below before touching the build.

## Structure

Three levels, none gated. The menu opens with a teaching card and a reference table of the three
forces; the closing screen ("Þú hefur lokið öllum stigum!") opens only once all three levels are
done.

| Stig | Menu name                        | What it asks                                                                                                                                     |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `Stig 1: Greina IMF tegundir`    | A teaching page (the three forces, then the interactive `ForceStrengthAnimation`), then 10 molecules: tick every force present, exact set        |
| 2    | `Stig 2: Raða eftir eiginleikum` | 10 rankings, low to high: 7 by boiling point, one each by vapour pressure, viscosity and surface tension; 2 to 4 compounds each, exact order     |
| 3    | `Stig 3: Flókin greining`        | 10 four-option scenarios (3 comparisons, 3 real-world, 2 anomalies, 2 multi-factor), each with a `Dýpri skilningur` note to open after answering |

The closing screen titles the levels differently (`Stig 1: Tegundir`, `Stig 2: Röðun`,
`Stig 3: Greining`).

Below the Stig 2 rankings sits a "Leysni: „Líkt leysist í líku"" tool: six solutes against water
and hexane, a yes/no prediction, and a verdict 1,5 s later. It keeps its own `n/m rétt` and is
labelled as not counting towards the level.

- **No numeric input anywhere.** Stig 1 toggles force buttons, Stig 2 builds the order by tapping
  compounds out of a pool (`Tiltæk efni:`), Stig 3 picks one option; each is checked with Athuga.
- **The menu shows `N af M rétt`** per level, the best run kept (`applyLevelResult` in
  `src/App.tsx`); a level saved in points before mobile-pass decision 1 (b) shows `Lokið`. There is
  no retry, so a right answer is a right first answer. Progress lives under the localStorage key
  `imf-progress`.
- **Level 3 is one of the platform's gold-standard levels** (real-world scenarios, CLAUDE.md):
  geckos on glass, ice floating, soap bubbles, ethanol against dimethyl ether, HF against H₂O.

## What matters before touching it

**Nothing shown before the answer decides it.**

- **Stig 1's badges and drawing (decision 72, 2026-10-01).** Polarity plus an H bonded to F, O or N
  fully decides which forces act, and the card used to print both beside the question: a
  `Skautuð`/`Óskautuð` badge, an `H-F/O/N tengi` badge, δ labels and the dipole arrow only on polar
  molecules, and a hint that mentioned H–F/O/N only where it applied. All of them now wait for the
  check, and the hint is one text for every molecule. The shape, in 2D and 3D, and the molar mass
  stay as the route to the answer. `answer-cues.test.tsx` holds it.
- **Stig 2's pool order.** On problems 4, 5, 8, 9 and 10 the data order is the answer, so tapping
  the pool top to bottom was right on half the level. The pool and the table under the slots are
  now shuffled per problem (`shuffleArray`, memoised on the problem), and grading compares the
  compounds' ids, not positions. `pool-order.test.tsx` fails against no shuffle and against a
  shuffle that graded positions.
- **Stig 3's options are shuffled** and relettered a–d by position; grading reads the shuffled
  array, so the letter clicked still finds its option (`checkAnswer` in `Level3.tsx`).

**The drawing has to teach the right chemistry.** The dipole arrow pointed at the δ+ end on every
polar molecule, and the layout put the first-listed atom in the middle (CO₂ as C=O=O, HCl with the
hydrogen in the middle). The arrow is now derived from the δ+ and δ− atoms as drawn
(`src/utils/imfConverter.ts`), and the layout follows the data's positions.
`molecule-drawing.test.tsx` reads the rendered drawing, not the data; `imfConverter.test.ts` holds
the converter.

**Feedback names the mistake made.** Stig 1's misconception note fell through to a molar-mass note
for choosing hydrogen bonds on chloroform and for leaving out London forces on a polar molecule;
it now picks the H-bond or the polar note (`misconception.test.tsx`). A Stig 2 explanation that
says a compound has the lowest or highest molar mass is checked against the masses the problem
shows (`explanations-match-data.test.ts`; problem 2 once contradicted its own table).

**No score, and hints cost nothing.** A right answer was worth 15 points unaided and 8 after the
hint in Stig 1 and 2, 12 against 6 in Stig 3. The charge went on 2026-10-01 (PR #79) and the points
with decision 1 (b) on 2026-10-03 (PR #85). `hint-cost.test.tsx` answers right after the hint; `right-count.test.tsx`
plays each level with and without hints and requires the same count, and no `N stig` on screen.

**The closing screen waits for all three levels.** Finishing Stig 3 first used to open
"Þú hefur lokið öllum stigum!" over two levels never started; `completion-screen.test.tsx`.

**Text: Icelandic, governed terms, a decimal comma.** `icelandic-text.test.tsx` scans the source and
renders each level. What it holds:

- **Molar masses and energy ranges print with a comma** (HCl's `36,5`, London's `0,05 - 40 kJ/mól`),
  through `formatDecimal`; the rendered text of Stig 1, Stig 2 and the force panel may not contain
  a digit, a full stop and a digit.
- **No English**: the forces carried English subtitles, and an undefined English acronym for the
  dispersion force appeared once.
- **HCl and HF are `Vetnisklóríð` and `Vetnisflúoríð`** (decision 14, 2026-10-02): the game had
  named them by their solutions' names beside the pure compounds' boiling points. This is a
  per-game ban in the test, not a platform row, since the solution names are right elsewhere.
- **Vapour pressure is `gufunarþrýstingur`** (decision 18, four sites, one in capitals), and
  `tvískaut` for dipole, `tengi` for a chemical bond, `skautunarhæfni`, `eðlismassi`, `jónaefni`,
  and the masculine `leysir` for a solvent, among its 32 banned patterns.
- **Platform rows that swept this game** (`governed-terms.test.ts`): `London-kraftar` and
  `London-dreifikraftar` hyphenated (decision 74, about 15 sites; the bare chip label `London`
  stays), `ferflötungur` (decision 124), `stök pör` for lone pairs, and `leysni`, which replaced a
  `Leysanleiki` label in the solubility tool.

**Stig 3 content rulings (decision 73, 2026-10-23).** Challenge 6 is `Ediksýra eða asetaldehýð`
(it had named vinegar, used an English `vs.` and a word in neither the book nor the glossary);
challenge 7 dropped an unidentified adjective for ice's structure (`challenge-names.test.ts`); and
challenge 3's "water is heavier" distractor now talks about the mass of a molecule, since a litre of
water is denser than the acetone and petrol the scenario names
(`water-lighter-per-molecule.test.ts`).

**Phone layout.** The force drawing lays itself out at the container's width below 380 units rather
than scaling its labels down (`force-strength-layout.test.tsx`); Stig 2's boiling-point bars print
each temperature outside the clipping bar, which had cut CH₄'s minus sign off
(`boiling-point-labels.test.tsx`); screen swaps, Næsta and the solubility verdict go through the
shared reveal helpers (`phone-scroll.test.tsx`, `solubility-result-scroll.test.tsx`).

**`ForceStrengthAnimation`'s SVG carries `data-live`**, since it moves on every frame;
`scripts/desktop-compare.mjs` masks it. Keep the mark if the drawing is replaced.

**The language switcher was stripped on 2026-09-19**: the game had no `t()` call, and its `i18n.ts`
was deleted. `packages/shared/i18n/__tests__/switcher-earns-its-place.test.ts` lists this game and
fails if either returns.

## Three.js

`vite.config.ts` passes `singleFile: false`, so the build emits `intermolecular-forces.html` plus
`assets/intermolecular-forces/` (a hashed entry, a hashed stylesheet, the deferred 3D chunks and the
bundled label font). **Deploy them together**; the HTML alone cannot boot. Only Stig 1 uses 3D: its
`2D`/`3D` toggle renders `MoleculeViewer3DLazy`, imported from
`@shared/components/MoleculeViewer3D`, never the components barrel. Three.js loads only when a
student opens the 3D view.

What guards that, all shared with Lewis and VSEPR and written up in CLAUDE.md (the Three.js
code-split, drei barrel and 3D labels sections):

- `scripts/check-lazy-3d.mjs` runs inside `pnpm build` and fails if any chunk a first page load
  fetches holds Three.js.
- `e2e/threejs-lazy-loading.spec.ts` checks the boundary in a browser; `e2e/threejs-labels.spec.ts`
  serves the production CSP, refuses off-site requests and waits for the viewer's `aria-busy` to
  clear, so the atom labels must render. **Wait on `aria-busy`, not on the canvas**, in any new 3D
  test.
- A browser that refuses WebGL gets a panel message inside the viewer instead of losing the whole
  game (`molecule-viewer-3d-error.test.tsx` in the shared package).

The viewer's hint reads `Dragðu til að snúa; klíptu eða skrunaðu til að stækka` (decision 8, one
wording for both devices, in all three 3D games).

## Layout

```
src/App.tsx                              menu, closing screen, progress (localStorage key imf-progress)
src/main.tsx, src/styles.css
src/components/Level1.tsx                Stig 1: IMF_TYPES, the 10 molecules, 2D/3D view
src/components/Level2.tsx                Stig 2: the 10 ranking problems, SolubilityPrediction below
src/components/Level3.tsx                Stig 3: the 10 challenges
src/components/ForceStrengthAnimation.tsx  Stig 1's animated force comparison (data-live)
src/components/SolubilityPrediction.tsx  the "Líkt leysist í líku" tool under Stig 2
src/utils/imfConverter.ts                Stig 1 molecule data → AnimatedMolecule, dipole derived
src/__tests__/                           answer-cues, pool-order, molecule-drawing, imfConverter,
                                         misconception, explanations-match-data, challenge-names,
                                         water-lighter-per-molecule, hint-cost, right-count,
                                         completion-screen, icelandic-text, force-strength-layout,
                                         boiling-point-labels, phone-scroll,
                                         solubility-result-scroll; next-guard-clock.ts is a helper
```

There are no side files. Run the tests from the repo root
(`pnpm exec vitest run apps/games/2-ar/intermolecular-forces`): the render tests need the root
config's DOM environment.

## Nærmynd (2026-11-15)

The amber card above the levels opens a particle view of liquids in closed flasks at 20 °C,
built on the template in `docs/particle-view-template.md`. Nothing in it is graded or stored.

- **The misconception it targets:** that boiling breaks the molecule, water into H₂ and O₂. The
  molecules are drawn whole in the liquid, in the vapour and in the bubbles of boiling water.
- **Every pressure is the book's,** in `data/vapour-pressure.ts` with a test: the four alcohols
  from the table in ch10/m68768 (20 °C by its header, though its summary line says 25 °C), and
  water from appendix m68863 (2,33 kPa at 20 °C, 101,3 kPa at 100 °C). The book prints no
  number for diethyl ether or methane, so the plan's water-against-methane pair became water
  against the alcohols; methane is a gas at 20 °C and has no vapour pressure to compare.
- The vapour holds one molecule per kPa, rounded (`engine/naermynd.ts`), and the screen says the
  real vapour is far thinner than the liquid. The liquid is drawn the same for every substance.
- The book spells the term without `-nar-`; the platform's word is `gufunarþrýstingur`
  (decision 18), and the comment in the data file avoids quoting the book's spelling, which the
  term guards would refuse.

## Fasabreytingar og fasarit (2026-11-15)

A menu card after Stig 3 opens a screen of its own, not a level and never marked done: Skilja (the
six phase changes, the heating curve, the phase diagram), an ungraded Kanna and Æfa, ten items with
one attempt each, ending `N af M rétt`. Year-2 plan, Phase 4: the book's ch. 10.3 (m68768,
Fasabreytingar) and 10.4 (m68769, Fasarit), which no game covered.

- **Kanna is a heating curve** of 100 g of ice from −20 °C to 120 °C, with a slider for the heat
  added. The marker stops on each plateau while the readout moves grams from ice to water or from
  water to steam, which is the point: the heat goes into the forces between molecules, not into
  the temperature. `engine/fasar.ts` (`heatSteps`, `stateAfter`) works it out.
- **Every number key is derived**, from the constants the book's own worked example uses for water
  (2,09, 4,184 and 1,84 J/(g·°C); 6,01 and 40,67 kJ/mól). The five numeric items are the book's
  135 g heating curve (416 kJ), its 94,0 g cooling (68,7 kJ), its 422 g exercise (1125 kJ),
  TiCl₄'s melting (13,0 kJ) and ethanol's ΔH(gufunar) by Clausius-Clapeyron (41,4 kJ/mól).
  `fasar.test.ts` holds each to the book within 1 % and refuses 0, the negative, double and half.
- **Slips are named**: a plateau left out (melting or boiling), only the m·c·ΔT parts, the cooling
  answer given negative, mass for moles, J for kJ and log for ln.
- **The phase diagram is drawn not to scale**, as the book draws it. The five choice items ask why
  the temperature stands still, which change is exothermic, water below its triple point, dry ice
  at 1 atm and ice under pressure.
- **Terms.** `bræðsluvermi` is the book's word (6 hits), where `ordabok.md` says
  `bráðnunarvermi` (no hits); the screen uses the book's, by the 2026-11-15 rule, and `ordabok.md`
  now does too. The rest agree: `gufunarvermi`, `þurrgufun`, `fasarit`, `þrípunktur`,
  `markpunktur`, `storknun`, `hélun`. Vapour pressure stays `gufunarþrýstingur`, Siggi's ruling
  against the book.

## Open

- **The 3D view's no-WebGL panel wording** is drafted by Claude and waits on Siggi
  (`docs/REVIEW-QUEUE.md` D2, the flaky Firefox item). It is shared with Lewis and VSEPR.
- **The old repo's `Level4.tsx` for this game was never carried over** (`ORPHANED_GAMES_ASSESSMENT.md`
  :33). Under the 2026-08-29 ruling there is no Level 4, so any of it would come in as Apply-phase
  content, rebuilt rather than restored.
- **The IMF → Lífræn nafnagift link** (functional groups and properties) was planned in February
  and never built (`docs/FEBRUARY-DECISIONS-RECOVERED.md`, "Cross-game integration").

**Fixed 2026-11-15** (year-2 audit, Phase 0): Stig 3 told students the gecko and the soap
bubble were "ekki rafstöðufyrirbæri", against the book (kafli 10), where every intermolecular force
is electrostatic. Those distractors are now `Segulkraftar` and `Sápan límir vatnssameindirnar saman`.
The water–H₂S item taught that S-H forms weak hydrogen bonds; its answer is now that H₂S forms none,
since H must be bonded to F, O or N. Stig 1's London card says London forces grow with molecular
size and can outweigh the others, and the menu's strength grid says its order is the usual one, not
a rule. The strength badges are unchanged. Guarded by `book-electrostatic.test.ts`. The new
wording was drafted by Claude.

**Fixed 2026-11-02**, found writing this file: three Stig 3 titles and four hints kept the English
`vs`. The titles follow decision 73's `Ediksýra eða asetaldehýð` (`Etanól eða dímetýleter`,
`n-Oktan eða 2,2,3,3-tetrametýlbútan`, `HF eða H₂O`), the hints say `og` or `á móti`, and
`icelandic-text.test.tsx` bans `vs`.

**Closed.** The 2026-04 review cycle's "ForceStrengthAnimation is never rendered" flag was wrong
(iteration 2 says so in `apps/games/2-ar/REVIEW_TRACKER.md`): Stig 1's teaching page renders it.
The Three.js bundle the tracker deferred (about 3 MB up front) was split in August 2026.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **`src/styles.css` defines classes nothing uses.** Below its three imports, every class it
  declares (`.imf-london`, `.molecule-card`, `.ranking-slot`, `.property-bar`, `.strength-weak`,
  the `animate-*` helpers and the rest) has no user under `src/` (grep, 2026-11-02). Only the
  imports are live.
- **The solubility tool's label says `telst ekki í stigagjöf`** ("does not count towards the
  scoring", `SolubilityPrediction.tsx:183`), written when the levels had points. It is still true
  that it does not count, but there is no `stigagjöf` left to count towards.
- **`package.json`'s description is English** ("Intermolecular Force Detective …"). No student
  sees it.
