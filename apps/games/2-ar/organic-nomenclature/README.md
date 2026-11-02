# Lífræn nafnagift

Chain position 8 of 8 in Year 2, the last node, after Oxun og afoxun. The game teaches IUPAC naming
of hydrocarbons in the textbook's Icelandic stems (efnafræði 2e, ch. 20): the prefix counts the
carbons of the longest chain (`met-` … `dek-`), the ending names the bond (`-an`, `-en`, `-ýn`),
a number places a multiple bond or a methyl group, and then four functional groups (`-ól`, `-al`,
`-ón`, `-sýra`).

## Structure

Three levels, none gated. Stig 2 has two modes chosen on its own screen, and both report into the
one Stig 2 result.

| Stig | Menu name                    | What it asks                                                                                                                                                                                                                      |
| ---- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `Stig 1: Grunnreglur`        | Teaching cards (10 prefixes, 3 endings), then the free `Sameindasmiður`, then a 10-question multiple-choice quiz, options shuffled                                                                                                |
| 2    | `Stig 2: Nefna sameindir`    | `Nefna sameindir`: 15 drawn molecules to name (3 alkanes, 5 alkenes, 4 alkynes, then 3 branched alkanes), by dragging parts or typing. `Byggja sameindir`: 10 names to build as a chain (carbon count and the bond at each place) |
| 3    | `Stig 3: Hagnýtar sameindir` | Four functional-group cards, then 10 multiple-choice challenges, options shuffled: 3 identify the group, 4 name the compound, 3 give the formula                                                                                  |

- **Grading.** Stig 1 and Stig 3 grade on the tap, by string equality with the correct answer.
  Stig 2's typed name is `type="text"` and compared after lowercasing and stripping accents
  (`normalizeAnswer` in `Level2.tsx`), so `2-metylpropan` is accepted; the drag builder compares
  the same way. Byggja compares the chain, and accepts one built from the other end
  (`isSameUnbranchedChain` in `src/utils/naming.ts`).
- **What counts.** A right answer counts, but not one given after the game printed it: Stig 2's
  wrong-answer feedback shows the right name before `Reyna aftur`, so only a molecule named right
  at the first try counts (`Halda áfram` moves on without a retry). Hints never change a count.
- **The menu shows `N af M rétt`.** Stig 2's two modes have different lengths (15 and 10), so the
  best run is kept as a right/total pair compared by ratio, never as a bare count read against the
  other mode's total (`applyLevelResult` in `src/App.tsx`). A level saved in points before
  mobile-pass decision 1 (b) shows `Lokið`. Progress lives under the localStorage key
  `organic-nomenclature-progress`; `Endurstilla` asks for confirmation.

## What matters before touching it

**Stig 3's options are shuffled (fixed 2026-08-26).** The correct answer sat first in the data on 6
of the 10 challenges, and the options rendered in data order. They now shuffle in a `useMemo` keyed
on the challenge index, so the grid holds still while the student reads. Grading is by string
equality, so reordering is safe here, unlike `2-ar/kinetics`, whose option ids double as the visible
letters. `option-order.test.tsx` plays every challenge and fails against no shuffle and against a
re-shuffle on every render; see `docs/README.md` for the pair of fixes.

**Branched molecules (April 2026 deferred-work pass).** Stig 2's last three molecules are
2-metýlprópan, 2-metýlbútan and 3-metýlpentan, which exercise the longest-chain rule.
`src/utils/organicConverter.ts` gives every atom an explicit position, the branches above the main
chain. **The drag builder has no branch parts, so a branched molecule opens in typing mode** and
the mode toggle is disabled (with a visible note on touch screens, where a disabled button's
tooltip never shows). `molecule-drawing.test.tsx` measures every Stig 2 drawing for overlapping
atoms, branched ones included (the overlap recorded in `docs/REVIEW-QUEUE.md` D1 no longer
reproduces). The branched `Útskýring` adds each `metýlhópur` and its position and says the prefix
counts the longest chain, not every carbon (decision 92); `branched-explanation.test.tsx`.

**The drag builder is the shared `DragDropBuilder`, with touch.** Parts can be dragged, dropped by
touch, or placed by tapping, and on a phone it runs `compact`. Two defects were the game's own:

- **Etan, eten and etýn had no correct build.** The chips read in English roots and the built name
  concatenated them, so the grader saw a spelling no answer key used. The built name now takes the
  textbook stem from `CHAIN_STEMS`, and the chips show it too. `drag-builder-answers.test.tsx`
  builds each of the 12 unbranched molecules from parts written out by hand.
- **A part taken back out stayed in the built name**, because the game's mirror of the zones
  updated only on a drop. Tap-to-place makes this the common case on a phone.
  `name-builder-remove.test.tsx`.

Stig 2's drag mode is one of the listed pins: its `Vísbending | Athuga` row is a `PinnedActions`
with its measurement in `PIN_USES` (`e2e/mobile-vertical.spec.ts`). The typed mode renders the same
row unpinned, since a pin may not sit over a text field.

**The textbook's stems everywhere (decision 89 (a), 2026-10-23).** Stig 1 taught the English roots
and then spelled every name with the Icelandic stems, so its own sums did not add up; Stig 2's
chips, hints and `Útskýring` and the menu's prefix table did the same. `book-stems.test.tsx` holds
the rendered text and the game's `icelandic-text.test.tsx` bans the English roots in source. The
chip ids keep their old spelling (`prefix-eth`): they are not shown, and the e2e paths select
chips by them.

**Byggja and the Sameindasmiður name what is built, by the game's own rule.**

- **Numbering from the other end is the same molecule.** A double bond between C3 and C4 of four
  carbons is 1-búten; Byggja marked it wrong and the builder printed `3-buten`. Both now go
  through `src/utils/naming.ts`, which numbers so the multiple bond gets the lowest number, then
  the branches. `build-from-name.test.tsx` and `molecule-builder-naming.test.tsx`, whose expected
  names are written out from the textbook.
- **The builder allows one multiple bond at most** (decision 91 (a), 2026-10-01). It once named
  CH₂=CH–CH=CH₂ as 1-búten and let a carbon reach five or six bonds; a refused click now says why.
- **Byggja's progress bar** counted only right answers and fell behind its `Áskorun n af 10`
  counter, and **every bond button had the same accessible name**; both fixed in
  `build-from-name.test.tsx`.

**Feedback names the part that is wrong.** The drag builder chose its misconception note by which
zones were filled, and Byggja sent a double bond built for a triple to the position note. Both
compare the parts now; `misconception-diagnosis.test.tsx`.

**The menu explains a name as Stig 1 does** (decision 90 (a), 2026-10-01): two cards, `Forskeyti`
(fjöldi kolefna) and `Viðskeyti` (tegund tengja). A third card had called the bond type the stem
and the ending a functional group. `menu-explainer.test.tsx`.

**No score.** Every level and Byggja showed a `Stig: N` pill, Stig 2 paid 10, 5 or 2 by attempt,
and the menu summed a total. Decision 1 (b), PR #85: `level-results.test.tsx` plays each level (Stig 2's
two modes with and without the hint) and checks the counts, no score on the way, the pair kept
across Stig 2's modes, and old points shown as `Lokið`.

**Text: the book's words.** `icelandic-text.test.tsx` holds `virknihópur` for functional group
(decision 125, replacing a word the textbook does not use), names with their accents (`própan`,
`bútýn`, the ending `-ýn`), neuter `forskeyti`/`viðskeyti`, masculine `alkan`, `metýlhópur` for a
branch (Siggi, 2026-10-01), `Hvaða formúlu hefur X?`, no subscript minus and no English on the
Stig 3 cards.

**The language switcher was stripped on 2026-09-19**: the game had no `t()` call, and its `i18n.ts`
was deleted. `packages/shared/i18n/__tests__/switcher-earns-its-place.test.ts` lists this game and
fails if either returns.

**One name, three places.** The hub card, the `<title>` (`Lífræn nafnagift - Kvennaskólinn`) and
the `Header`'s `gameTitle` agree, held by `game-titles-agree.test.ts`. The `Námsleiðin` chain in
`src/App.tsx` is held by `2-ar/rafeindabygging/src/__tests__/chain-string.test.ts`.

## Layout

```
src/App.tsx                                menu, closing screen, progress (organic-nomenclature-progress)
src/main.tsx, src/styles.css
src/components/Level1.tsx                  Stig 1: prefix and ending cards, the quiz
src/components/MoleculeBuilder.tsx         Stig 1's Sameindasmiður (up to 8 carbons, methyl branches)
src/components/Level2.tsx                  Stig 2: mode screen and Nefna sameindir (the 15 molecules)
src/components/StructureFromNameChallenge.tsx  Stig 2's Byggja sameindir (the 10 names)
src/components/Level3.tsx                  Stig 3: functional-group cards and the 10 challenges
src/utils/naming.ts                        CHAIN_STEMS, chain naming and numbering, bond rules
src/utils/organicConverter.ts              Stig 2 molecule → AnimatedMolecule, explicit positions
src/__tests__/                             option-order, drag-builder-answers, name-builder-remove,
                                           build-from-name, molecule-builder-naming,
                                           branched-explanation, molecule-drawing, organicConverter,
                                           misconception-diagnosis, menu-explainer, book-stems,
                                           level-results, icelandic-text, phone-scroll;
                                           next-guard-clock.ts is a helper
```

There are no side files. Run the tests from the repo root
(`pnpm exec vitest run apps/games/2-ar/organic-nomenclature`): the render tests need the root
config's DOM environment.

## Open

- **The old repo's `Level4.tsx` for this game was never carried over** (`ORPHANED_GAMES_ASSESSMENT.md`
  :33). Under the 2026-08-29 ruling there is no Level 4, so any of it would come in as Apply-phase
  content, rebuilt rather than restored.
- **The Millisameindakraftar → Lífræn nafnagift link** (functional groups and properties) was
  planned in February and never built (`docs/FEBRUARY-DECISIONS-RECOVERED.md`, "Cross-game
  integration").

**Closed.** The April review cycle's deferred items for this game are done: branched molecules in
Stig 2 (above), touch for the drag builder (the shared component's, CLAUDE.md), and the move to
`useGameProgress` (`apps/games/2-ar/REVIEW_TRACKER.md`). The closing screen opened after Stig 3 whatever else was played (found and fixed
2026-11-02): it now opens only when the level just finished completes the set, as in
Millisameindakraftar, held by `completion-screen.test.tsx`.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **`src/styles.css` defines classes nothing uses.** Below its three imports, every class it
  declares (`.carbon-atom`, `.carbon-chain`, `.double-bond`, `.alcohol`, `.ketone`,
  `.chemical-name`, `.animate-pulse-subtle` and the rest) has no user under `src/` (grep,
  2026-11-02).
- **The carbon stems are written in four places**: `CHAIN_STEMS` in `src/utils/naming.ts` (which the
  drag chips and the builder read), Stig 1's own `prefixes` table in `Level1.tsx`, the menu's
  hard-coded `met-` … `pent-` table in `App.tsx`, and the misconception strings in
  `StructureFromNameChallenge.tsx`. `book-stems.test.tsx` and `icelandic-text.test.tsx` catch an
  English root in any of them, not a disagreement between them. The April tracker deferred this
  extraction (`REVIEW_TRACKER.md`, "data duplicated 3×").
- **Stig 2's own heading reads `🏷️ Stig 2: Nafna og byggja`** (`Level2.tsx:631`), where the menu
  card says `Stig 2: Nefna sameindir` and the mode button `Nefna sameindir`.
