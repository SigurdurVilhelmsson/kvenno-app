# Lewis-formúlur

Chain position 2 in Year 2, between Rafeindabygging and VSEPR. The game teaches counting valence
electrons and the octet rule, drawing Lewis structures (with the octet exceptions: BF₃, NO, PCl₅,
SF₆), and formal charge and resonance (`formleg hleðsla`, `vokmyndir`), following Brown ch. 8 as
the menu cites it.

## Structure

Three levels, none gated, picked from the menu. Each ends `N af M rétt`, which the menu and the
completion screen show as the level's best count; progress saved before counts were kept shows
`Lokið`. Progress lives under the localStorage key `lewis-structures-progress`.

| Stig | Menu name                            | What it asks                                                               |
| ---- | ------------------------------------ | -------------------------------------------------------------------------- |
| 1    | Stig 1: Gildisrafeindir              | 8 questions: 7 typed counts (valence electrons, totals, OH⁻) and 1 choice  |
| 2    | Stig 2: Teikna Lewis-formúlur        | Worked PCl₃ walkthrough, then draw 9 molecules on the board (H₂O … SF₆)    |
| 3    | Stig 3: Formleg hleðsla og vokmyndir | Worked CO₂/SO₂ example, then 8 multiple-choice formal-charge and vok items |

- **Stig 1** grades a count as the number itself: the field is `type="number"` and the grader
  requires `Number.isInteger` and equality (`components/Level1.tsx`). Its hints are the shared
  `HintSystem`, four tiers, with `showPointCost={false}`. The one multiple-choice item shuffles its
  options and reassigns the letters a–d by position.
- **Stig 2** is the board in `components/LewisDrawingCanvas.tsx`: tap a bond to cycle it, step the
  lone pairs with +/−. A wrong check is answered by the rule the drawing breaks
  (`utils/lewisDiagnosis.ts`); after two misses (`MISSES_BEFORE_SOLUTION`) "Sýna lausn" offers
  the key, and a molecule solved with it open is not counted. A right drawing shows the structure
  again, with a "Lewis-formúla" / "3D lögun" toggle; that toggle is the only place the game mounts
  the 3D viewer.
- **Stig 3** shuffles each item's options once per item; grading reads each option's own
  `correct` flag. One hint per item, which changes nothing.

The template for the platform's no-running-score rule is this game: `CLAUDE.md` names it
(commit `a01736c`) as what a new game copies — `levelNCorrect` / `levelNTotal` beside the old
`levelNCompleted`, and `resultLabel` in `App.tsx`.

## What matters before touching it

**No score, and hints are free.**

- **Mobile-pass decisions 1 (b) and 2 (b), ruled for this game 2026-09-30.** Stig 1 had paid
  `15 × hintMultiplier` and shown the cost; Stig 3 paid 15 without its hint and 8 with it, silently;
  Stig 2's walkthrough paid a +5 that replays could earn without limit (decision 66). All three now
  count right answers flat. `__tests__/hint-cost.test.tsx` plays Stig 1 and 3 with and without
  every hint and requires the same `8 of 8`; `__tests__/stig2-feedback.test.tsx` holds Stig 2's
  count, including that a molecule solved with "Sýna lausn" open does not count.

**One way to draw a Lewis structure (`docs/REVIEW-QUEUE.md` C6, ruled 2026-09-30).**

- The game drew a molecule five ways — coloured balls on the board, the shared ball-and-stick
  renderer after it, no lone pairs in the walkthrough, a single atom with stacked bonds in Stig 3
  (water read as a double bond), and resonance forms as monospace text. Every screen now takes its
  coordinates from `utils/lewisLayout.ts` and draws with `components/LewisStructure.tsx`: element
  symbols, bond lines, dot pairs, circled formal charges, in the book's flat layout. Geometry is
  VSEPR's job, so the layout claims no shape. `lewis-layout.test.ts` checks it as properties over
  every shape the board can produce; `one-renderer.test.tsx` holds each screen to it.
- **The board's picture was wrong while its grading was right.** HCl's three pairs on Cl drew as
  one, H₂O never showed more than two, NO's odd electron was never drawn
  (`utils/lonePairs.ts`, `lone-pair-drawing.test.tsx`).
- **A formal charge of 0 printed as `+0`** in Stig 3 (fixed PR #70); `chargeText` in
  `lewisLayout.ts` writes charges as the book does.

**Teach before test (C6, done 2026-10-01, PR #72).** Stig 2 opens on the walkthrough
(`LewisGuidedMode`) for PCl₃, and Stig 3 on `FormalChargeExample` — the book's own O=C=O against
O≡C–O, then SO₂ for vok, every number computed from the drawings. Neither level asks about those
molecules. `teach-before-test.test.tsx` holds it; `__tests__/past-example.ts` is how other tests
step past the example. Stig 1 still opens on a question, with the counting rule beside it.

**Answer leaks closed.**

- Stig 2's wrong-drawing feedback used to print the key (`… → ætti að vera …`), which a student
  could copy back. It now names the rule broken (`lewis-diagnosis.test.ts` asserts the key never
  appears); the key is behind "Sýna lausn" after a second miss.
- Stig 1's element table printed C = 4 under the question about carbon and cut off before Cl
  (decision 65). The level now shows the rule (hópar 1–2, hópar 13–18, He). The menu deliberately
  keeps its table.
- Stig 1 printed the per-atom breakdown under "how many in total?"; it now appears with the
  feedback. OH⁻'s breakdown printed `+1` under "Hleðsla"; it now shows the −1 being subtracted
  (`level1-grading.test.tsx`, which also fails if `4.5` is graded as 4).
- Stig 3 held the correct option second on 6 of 8 items and first on the other two;
  `option-order.test.tsx` holds the shuffle and that grading follows the option, not the slot.

**The walkthrough had no way forward after a wrong answer**, passed both H₂O pairs on H as right,
and read a typed 0 as empty. `guided-mode.test.tsx` plays it through its buttons.

**Chrome (C6).** The shared `Header` is on every screen, and on the level and completion screens its
`onBack` returns to the menu rather than linking away. The level is named on the page, not in
`gameTitle`, which `packages/shared/i18n/__tests__/game-titles-agree.test.ts` holds to the hub card
(`Lewis-formúlur`, also the `<title>`). Every action is kvenno-orange (`-600` on hover); green and
red mean only right and wrong; icons are lucide.

**Terminology (decision 20's Lewis part, PR #72, and the 2026-09-23 sweep).** `eintengi` /
`tvítengi` / `þrítengi`, `formleg hleðsla`, `vokmynd` / `vokblendingur`, `áttund`, `ofgild sameind`
for an expanded octet, `Samgild tengi`, `stakt rafeindapar` / `stök pör`, `ferflötungslaga`,
`Nitur`. Expanded octets are explained by the central atom's size, not by d-orbitals
(decision 7). `__tests__/icelandic-text.test.ts` bans each old form and English inside Icelandic
lines; several are platform rows in `packages/shared/i18n/__tests__/governed-terms.test.ts`. Single
pairs are counted in the singular through `pairCount` (`1 par`, `2 pör`).

**Phones.** `phone-play.test.tsx` holds where the page and focus go: focus to the feedback after a
check, never to Næsta, and Næsta guarded by `useArmedAfter`. The board crops to the molecule on a
phone (`COMPACT_BOARD_QUERY`) and widens each bond's hit strip; its action bar is a `PinnedActions`
listed in `PIN_USES` in `e2e/mobile-vertical.spec.ts`. Renaming a label the e2e paths in
`e2e/mobile-game-screens.ts` click means updating them in the same change.

**The 3D view (see `CLAUDE.md`: "Three.js code-split", "drei barrel follow-up", "3D labels
fixed").** This is one of the three games built with `singleFile: false` (`vite.config.ts`): it
emits `lewis-structures.html` plus `assets/lewis-structures/` (a hashed entry, a hashed
stylesheet, the deferred `MoleculeViewer3D-*` chunk and its bundled label font), and the HTML alone
does not boot. `components/Level2.tsx` imports `MoleculeViewer3DLazy` from
`@shared/components/MoleculeViewer3D` — never the eager viewer, whose static import would put
Three.js back in the entry. Lewis is the game that showed the bundler's own chunking can do the
same: on 2026-10-25 an unrelated viewer change moved a module its entry needs into the Three.js
chunk. `scripts/check-lazy-3d.mjs` now fails `pnpm build` on that, and
`e2e/threejs-lazy-loading.spec.ts` asserts Three.js is not fetched on first load;
`e2e/threejs-labels.spec.ts` checks the label font ships in the deferred chunk. A new 3D test waits
on the viewer's `aria-busy`, not on the canvas.

## Layout

```
src/App.tsx                          menu, completion screen, progress, resultLabel, Námsleiðin
src/components/Level1.tsx            Stig 1: 8 challenges inline, HintSystem, FeedbackPanel
src/components/Level2.tsx            Stig 2: 9 molecules inline, PCl₃ walkthrough, 3D toggle
src/components/Level3.tsx            Stig 3: 8 challenges inline, shuffled options
src/components/LewisDrawingCanvas.tsx  the Stig 2 board, its diagnosis and "Sýna lausn"
src/components/LewisGuidedMode.tsx   the step-by-step walkthrough Stig 2 opens on
src/components/FormalChargeExample.tsx  the worked example Stig 3 opens on
src/components/LewisStructure.tsx    the one pen: bonds, symbols, dots, charge badges
src/utils/lewisLayout.ts             the one geometry every structure is drawn from
src/utils/lonePairs.ts               where central lone pairs sit; pairCount
src/utils/lewisDiagnosis.ts          what a wrong drawing breaks, said without the key
src/utils/lewisConverter.ts          Lewis data → shared Molecule, for the 3D viewer
src/__tests__/                       hint-cost, stig2-feedback, one-renderer, lewis-layout,
                                     lone-pair-drawing, lewis-diagnosis, teach-before-test,
                                     level1-grading, option-order, guided-mode, hint-focus,
                                     phone-play, icelandic-text, lewisConverter
src/__tests__/next-guard-clock.ts, past-example.ts   test helpers
```

There are no side files. Run the tests from the repo root
(`pnpm exec vitest run apps/games/2-ar/lewis-structures`): the render tests need the root config's
DOM environment.

## Open

- **Stig 1's last hint tier states the answer and still counts** (found 2026-11-02). Tier 4 is the
  worked solution (`C er í hópi 14: 14 - 10 = 4 gildisrafeindir.`), and `hint-cost.test.tsx`
  requires `8 of 8` with every tier open. `docs/REVIEW-QUEUE.md` C3 ruled on 2026-10-23 that a hint
  which gives the answer counts as a revealed answer, but applied it to VSEPR, gas-law and
  equilibrium-shifter only; this game is unruled.
- **Hand checks** in `docs/REVIEW-QUEUE.md` B: whether a screen reader announces Stig 2's
  wrong-drawing note twice, and Siggi playing the game on a phone.
- **The no-WebGL panel's wording** (`Þrívíddarsýn er ekki tiltæk`), shared by all three 3D games,
  waits on Siggi in `docs/REVIEW-QUEUE.md` D2.

**Closed.** All four C6 rulings (teach before test, one renderer, chrome, terms) were done by
2026-10-01. Decisions 1, 2, 7, 8 (`klíptu eða skrunaðu`), 20, 65 and 66 are applied. The language
switcher and the dead `i18n.ts` went on 2026-09-19 (`switcher-earns-its-place.test.ts`), so this
game is outside the open `useGameI18n` question. C1 item 5 accepted one scroll for SF₆, PCl₅ and
BF₃ on Stig 2 rather than changing the board.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **`createDiatomic`** in `utils/lewisConverter.ts` is exported and used only by
  `lewisConverter.test.ts`; no component calls it.
- **`guided-mode.test.tsx`'s header** calls the walkthrough "Opna leiðsögn", a button that no
  longer exists: since PR #72 the walkthrough is the example Stig 2 opens on.
