# Rafeindabygging

Chain position 1 in Year 2, before Lewis-formúlur (`App.tsx`, the `Námsleiðin` line). The game
teaches the electronic structure of atoms from Brown ch. 6: the four quantum numbers and which
combinations are allowed, writing an electron configuration in Aufbau order with Hund's rule, and
the noble-gas shorthand, including the Cr and Cu exceptions.

## Structure

Three levels, none gated (Siggi's ruling, 2026-08-29). Each opens with teaching screens before its
eight graded items.

| Stig | Menu name                        | What it asks                                                                                            |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1    | `Stig 1: Skammtatölur`           | Three teaching steps, then 8 puzzles: tick every valid (l, mₗ, mₛ) for a given n among 4 or 5 cards     |
| 2    | `Stig 2: Rafeindasmíð`           | Intro, then type the configuration of 8 elements (H, C, N, O, Na, Cl, Fe, Kr); an orbital diagram after |
| 3    | `Stig 3: Lotukerfi og rafeindir` | Intro, then pick the noble-gas shorthand of 8 elements (Ca, Ti, Cr, Cu, Br, Sr, Fe, Se) from 4 options  |

- **Stig 1** is right only when every valid card is ticked and every invalid one left alone
  (`Level1.tsx`, `handleSubmit`). The cards are toggles and say so with `aria-pressed`.
- **Stig 2** reads a `type="text"` field through `normalizeConfig` (`data/electron-configs.ts`),
  which strips spaces, commas, semicolons and a caret before an exponent and reads superscripts as
  digits, so `1s2, 2s2`, `1s^2 2s^2` and `1s² 2s²` are one answer. Order is graded: the subshells
  must come in filling order (decision 64 (a), below). There is no decimal and no count field.
- **Stig 3** grades the option's text, not its position.
- No level offers a retry, so a right answer is a right first answer. The menu shows `N af M rétt`
  per level, or `Lokið` for one finished under the old points format (`utils/progress.ts`,
  `resultLabel`); there is no running score anywhere (mobile-pass decision 1 (b)). Progress is
  kept under the localStorage key `rafeindabygging-progress`.

**The one header exemption on the platform.** Every other game gives the shared `Header` one
`gameTitle` that matches its hub card. This one names the sub-topic per screen: `Rafeindabygging`
on the menu, `Skammtatölur — Kennsla` and `Skammtatölur` in Stig 1, `Rafeindasmíð — Kennsla` and
`Rafeindasmíð` in Stig 2, `Eðalgasstytting — Kennsla` and `Lotukerfi og rafeindir` in Stig 3.
`packages/shared/i18n/__tests__/game-titles-agree.test.ts` lists it in `HEADER_EXEMPT` and asserts
the waiver is still earned, so collapsing the levels to one title means deleting the exemption.

## What matters before touching it

**Every answer has to be found by reading, not by position.**

- **Stig 3's constant answer index (Phase 1, 2026-08-18):** the correct option sat at `options[0]`
  on all eight puzzles. The data now spreads it and `Level3.tsx` shuffles per question at render.
  `data-integrity.test.ts` checks the answer is offered, is not always in one slot, and that every
  puzzle has four distinct options.
- **Stig 1 listed every valid combination before every invalid one**, and drew them in data order,
  so ticking the first two or three cards passed all eight. It now shuffles per question, and the
  grader reads the shuffled list (the half a careless fix leaves out; see the kinetics note in
  `docs/README.md`). `level1-options.test.tsx` guards both, and that mₛ prints `+½` / `−½`, not the
  decimal point it once printed.

**The teaching matches the textbook (Efnafræði kafli 6.4).**

- **The noble-gas core is the one before the element, not the nearest.** For Cu, Se and Br the
  nearest is krypton, and `[Kr] …` is a distractor on all three, so the intro's old rule led to a
  wrong answer on three of eight questions. The feedback also called bromine's `4s² 3d¹⁰ 4p⁵` its
  valence electrons; it has seven, `4s² 4p⁵`, since a filled d subshell counts as core.
  `level3-feedback.test.tsx`, plus `data-integrity.test.ts`, which checks every key against the
  preceding noble gas and that it accounts for every electron.
- **Stig 2's orbital diagram follows Hund's rule** (`hundFilling` in `utils/electrons.ts`). It used
  to draw carbon's 2p² as one pair and two empty boxes, above an explanation saying the opposite.
  `level2-feedback.test.tsx` and `electrons.test.ts`.
- **Stig 2's keys are derived-checked:** `data-integrity.test.ts` rebuilds each `correctConfig`
  from its orbital counts, checks the counts sum to Z, and that no subshell is overfilled.

**Stig 2's feedback says what is wrong, not just that it is.**

- **The electron-count hint read the grader's spaceless copy**, so `1s2 2s2` for hydrogen was
  counted as 22 electrons. It now counts what the student typed (`countElectrons`), and its
  Icelandic was fixed with it (`Þig vantar`, `1 rafeind`, `aukalega`). `level2-feedback.test.tsx`.
- **Decision 64 (a), 2026-10-01:** filling order stays the only accepted form, but an answer with
  the right subshells in the wrong order now says which comes first: `Réttar rafeindir, en skrifaðu
í Aufbau-röð: 4s fyllist á undan 3d.` (`firstOutOfOrder`). `level2-feedback.test.tsx` and
  `electrons.test.ts`. This also answers the February note that the 4s/3d order in shorthand was a
  convention never picked: Stig 2 grades filling order, and Stig 3 writes 4s before 3d throughout.

**Terminology.** `icelandic-text.test.ts` scans the source, `index.html` and comments, so write an
explanation of an avoided form without writing the form. It holds, among others,
`rafeindaskipan` for electron configuration, `einsetulögmál Paulis`, `spuni`, `undirhvolf` for a
subshell, `fráhrinding`, the `-íum` element names (the February review found two ending `-ín`),
`dreifast` (not the non-word the February review found three times) and `hávísir` for a
superscript (decision 13 (a), 2026-10-23). Platform-wide rows in `governed-terms.test.ts`
cover the rest:

- **`hvolf`** for an electron shell (Siggi's ruling, 2026-08-27). It is neuter where the old word
  was feminine, so the sweep here moved adjectives too; see the row in `CLAUDE.md` before touching
  any string with it.
- **`aðalskammtatala` and `aukaskammtatala`** for n and l (decision 63, 2026-10-01), correcting
  `ordabok.md`'s old pair to the book's. Both appear in the menu's `📐 Skammtatölur` reference.
- **`nitur`** for nitrogen (decision 15, 2026-10-02).

**The summary screen opens only when all three levels are done.** It says `Þú hefur lokið öllum
stigum!`, and it used to follow Stig 3 unconditionally, congratulating a student who started there
beside two empty results. `screenAfterLevel` in `utils/progress.ts` now opens it after Stig 3 or
after whichever level completes the set. The screen also named Stig 3 `Eðalgasstytting` where the
menu says `Lotukerfi og rafeindir`. `completion.test.tsx`.

**The Y2 chain lives here.** `src/__tests__/chain-string.test.ts` (2026-10-01) holds the
`Námsleiðin` line in all eight Y2 games to the hub-card names and checks that every 2-ar game
`scripts/build-games.mjs` emits has an entry, so a ninth Y2 game fails here until its chain is
added. Its whitespace handling models JSX rendering, which matters when Prettier rewraps the line.

**i18n was stripped (decisions item 4, 2026-10-02).** The game had one `t()` call, the title, so
its `LanguageSwitcher` translated nothing a student reads past the header. The switcher and
`i18n.ts` are gone, and `switcher-earns-its-place.test.ts` lists the game so they stay gone.

**Phones (2026-09).** Every screen and every next item starts at the top at any width, focus moves
to the verdict after `Athuga svar`, and `Næsta` ignores a press within 400 ms (`useArmedAfter`).
`phone-scroll.test.tsx`. On a phone Stig 2's diagram draws a pair side by side, ↑↓, halving each
box's height (`styles.css`); REVIEW-QUEUE C1 item 6 settled that desktop keeps its stacked layout.

## Layout

```
src/App.tsx                     menu, summary screen, level routing, progress
src/components/Level1.tsx       Stig 1: three teaching steps, then the option cards
src/components/Level2.tsx       Stig 2: intro, typed configuration, orbital diagram, feedback
src/components/Level3.tsx       Stig 3: intro, multiple choice, valence feedback
src/data/quantum-numbers.ts     Stig 1's 8 puzzles
src/data/electron-configs.ts    Stig 2's 8 elements and normalizeConfig
src/data/periodic-configs.ts    Stig 3's 8 elements, shorthand and options
src/utils/electrons.ts          countElectrons, firstOutOfOrder, hundFilling, rafeindir,
                                formatQuantum, valenceOf
src/utils/progress.ts           Progress, resultLabel, screenAfterLevel
src/utils/itemStart.ts          the focus target when a level's exercises open
src/styles.css                  orbital boxes and cards, phone variants
src/__tests__/                  data-integrity, electrons, level1-options, level2-feedback,
                                level3-feedback, right-count, completion, phone-scroll,
                                icelandic-text, chain-string; next-guard-clock.ts is a helper
```

There are no side files. Run the tests from the repo root:
`pnpm exec vitest run apps/games/2-ar/rafeindabygging`.

## Open

- **Stig 2 prints the oxygen answer while asking for oxygen** (found 2026-11-02, not yet fixed).
  The input's label reads `Sláðu inn rafeindaskipan (t.d. 1s2 2s2 2p4):` and its placeholder
  `1s2 2s2 2p4...` (`Level2.tsx:307,314`) on every element, and O (`1s² 2s² 2p⁴`) is the fourth.
  The menu card's `t.d. 1s² 2s² 2p⁴ fyrir súrefni` (`App.tsx:245`) and the intro's worked example
  are oxygen too. `redox-reactions` fixed the same shape in its Stig 3 placeholder.
- **The bridge to Lewis is not built.** February's spec had five levels; this game builds three.
  Energy ordering (why 4s fills before 3d) is a teaching panel in Stig 2 with no practice, and the
  s/p/d/f blocks → valence electrons → Lewis dot symbols level, the reason the game sits before
  Lewis-formúlur, does not exist. Tracked only in `docs/FEBRUARY-DECISIONS-RECOVERED.md` (the
  five-level table, and "Then finish `rafeindabygging`").

## Leftovers

Not recorded anywhere else; found while writing this file.

- **English fields nothing renders.** All three data files still carry `description_en`,
  `explanation_en`, `elementName_en` and `exceptionExplanation_en`, left from before the i18n strip.
  No component reads a `_en` field.
- **`apps/games/2-ar/REVIEW_TRACKER.md`** still describes this game's April state (for example the
  ten-call `normalizeConfig` and the hint wording since corrected); `docs/README.md` says those
  trackers are superseded. Nothing in it is a live item.
