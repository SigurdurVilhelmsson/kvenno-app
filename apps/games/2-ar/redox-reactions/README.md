# Oxun og afoxun

Chain position 7 in Year 2, between Hvarfhraði and Lífræn nafnagift (`App.tsx`, the `Námsleiðin`
line). The game teaches oxidation numbers, how to tell what is oxidised and reduced in a reaction
and which species is the oxidising or reducing agent, and how to balance a redox equation by the
half-reaction method. Its Stig 3 is one of the platform's gold-standard levels (`CLAUDE.md`): the
half-reactions are scaffolded one step at a time.

## Structure

Three levels, none gated (Siggi's ruling, 2026-08-29). The menu names them from `i18n.ts`.

| Stig | Menu name                     | What it asks                                                                                       |
| ---- | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| 1    | `Stig 1: Oxunartölur`         | Six rule cards, then type the oxidation number of one element in 10 formulas, NaCl to Cr₂O₇²⁻      |
| 2    | `Stig 2: Greina redox-hvörf`  | Intro, then 8 reactions × 4 two-option questions (oxast, afoxast, oxunarefnið, afoxunarefnið) = 32 |
| 3    | `Stig 3: Stilla redox-jöfnur` | Intro, then 6 problems × 4 steps = 24: name both species, each half's electrons, the multipliers   |

- **Stig 1** reads a `type="number"` field through `parseWholeNumber` (`utils/answers.ts`), which
  accepts a whole number, signed or not, and rejects `-1.5` (a `parseInt` used to round it to -1).
  A wrong answer prints the right one and offers `Reyna aftur`; a right answer on the retry is one
  the student has been shown and is not counted.
- **Stig 2** shuffles the two options per question and grades by the option's text. Below the
  questions sit two ungraded explore panels: `HalfReactionBalancer` (four half-reactions in five
  steps) and `ElectrochemicalCell` (a running galvanic cell, four metal pairs).
- **Stig 3**'s identify step is two `type="text"` fields read by `matchesSpecies`, which accepts
  the species as printed (`Cu²⁺`), as a phone types it (`Cu2+`) or as the bare symbol, and rejects
  another charge or the product. The electron counts and multipliers are `type="number"` with
  `inputMode="numeric"`, read by `parseWholeNumber`. The fifth screen shows the balanced equation.
- **Problem order is fixed in all three levels, deliberately** (exam-style stability; `CLAUDE.md`,
  "Remaining deferred"). Only Stig 2's option order is shuffled.
- No running score anywhere (mobile-pass decision 1 (b)); a hint never changes a count (decision
  2 (b)). The menu shows `N af M rétt` per level, or `Lokið` for a level finished under the old
  points format. Progress is kept under the localStorage key `redox-reactions-progress`. The
  closing screen follows whichever level completes the set.

## What matters before touching it

**Nothing on screen answers a question before it is asked.**

- **Stig 2's diagram labelled the answer.** It drew `↑ OXAST` and `↓ AFOXAST` on the species before
  the first answer; once that was fixed the labels arrived with the first answer, so the second
  question, `Hvað afoxast?`, sat under its own answer. They now come with the second answer, and no
  electrons fly while the verdict is hidden, since their direction is the verdict too.
  `level2-verdict.test.tsx` and `right-count.test.tsx`.
- **Stig 2's option order:** the oxidised species came first in six of eight reactions, so the left
  button answered `Hvað oxast?` three times in four. `level2-verdict.test.tsx`.
- **Stig 3's placeholder** is `t.d. Na`, which is not the answer to any problem.
  `level3-play.test.tsx`.

**Stig 3 can be answered from a phone keyboard.** The identify step once wanted the species in the
form the grader expected; `matchesSpecies` now reads superscripts, subscripts, a caret, a
typographic minus and stray spaces. `answers.test.ts` checks every Stig 3 species in all forms, and
`level3-play.test.tsx` plays all six problems through the real buttons, including in plain ASCII,
and marks `2,5` electrons wrong where the answer is 2.

**The galvanic cell (`ElectrochemicalCell.tsx`).**

- **Its half-equations were unbalanced** on the default view: the anode label hardcoded one
  electron for 2+ ions, and a hardcoded `+ 2e⁻` gave silver two. The count is now read from the
  ion's charge (`electronsPerIon`). Potentials print with the decimal comma (`formatVolts`), and E°
  carries the textbook's subscript, `E°ker`. `cell-readout.test.tsx`.
- **Terminology:** `galvaníhlað` (Siggi's ruling, 2026-08-27) in the `aria-label` and on the card,
  `rafefnahlað` (2026-08-29) in the SVG `<title>`, and `anóða` / `katóða` with both accents (the
  accentless pair survived in this file's `aria-label` until 2026-08-27). The Daniell cell is
  `Daniell-hlað (Zn–Cu)` (decision 88). Platform rows in `governed-terms.test.ts` hold the first
  three; the game's `icelandic-text.test.ts` holds the Daniell name and bans English cell names.
- **The diagram moves on every frame while running**, so its `<svg>` carries `data-live` and
  `scripts/desktop-compare.mjs` masks it. Its labels grow in viewBox units so they stay at least
  12 px when the SVG shrinks on a phone. `phone-play.test.tsx`.

**Terminology and wording.**

- **`stilla`, not the verb `jafna`** (Siggi's ruling, 2026-08-26). The sweep reached this game as
  well as the Y1 game it was named for, because the same verb balanced half-reactions, atoms,
  oxygen, hydrogen and charge here.
- **`redox-hvarf` is acceptable beside `oxunar-afoxunarhvarf`, always hyphenated** (decision 83,
  2026-10-01); a `governed-terms.test.ts` row bans the solid and open forms.
- **One name per level everywhere** (decision 84, 2026-10-23): `Stig 2: Greina redox-hvörf` and
  `Stig 3: Stilla redox-jöfnur` on the menu, the level and the closing screen.
  `icelandic-text.test.ts`.
- **Stig 1 asks `í þessu efnasambandi?`, and `í þessari jón?` for Cr₂O₇²⁻** (decision 85), not
  `sameind` of all ten. The ion is read off the charge suffix in its id.
  `level1-question-noun.test.tsx`.
- **Decisions 86 and 87:** the intro says `minnsta sameiginlega margfeldi` where an English acronym
  and a non-word stood, and Stig 1's related-concept chip is `Rafeindaflutningur`, replacing a
  non-word. `icelandic-text.test.ts` holds both among the 27 forms it bans, most from the
  2026-09-23 pass (`hálfhvarf`, `rafeindaflutningur`, `Bæði hálfhvörfin`, `Ímynduð hleðsla`, …),
  and checks the header title matches the tab and the hub card, since `gameTitle` comes from
  `t('menu.title')` where `game-titles-agree.test.ts` cannot see it.
- **Flattened Icelandic in `t()` fallbacks (fixed 2026-09-22).** Five fallbacks had lost their
  accents, and the game shipped one button label both with and without them.
  `packages/shared/i18n/__tests__/no-flattened-icelandic.test.ts` now covers game source.
- **The dichromate ion stays** (Stig 1's last item, the oxidation number of Cr in Cr₂O₇²⁻). Siggi
  removed K₂Cr₂O₇ from `1-ar/lausnir` on 2026-08-26 because a student was told to weigh it out;
  here it is a paper exercise, and was kept deliberately.

**Counts and focus.** `right-count.test.tsx` plays each level with some answers wrong and every
hint open and checks the count, Stig 3's four steps per problem included.
`completion-screen.test.tsx` holds the closing screen to the set being complete: finishing Stig 3
first used to send a student there. `focus-and-guard.test.tsx` holds focus moving to the verdict
after an answer and every button that appears with it ignoring a press within 400 ms
(`useArmedAfter`).

## Layout

```
src/App.tsx                              menu, closing screen, level routing, progress
src/i18n.ts                              is/en/pl strings; components also carry Icelandic fallbacks
src/components/Level1.tsx                Stig 1: rules and 10 problems, both defined inline
src/components/Level2.tsx                Stig 2: 8 reactions inline, the explore panels below
src/components/Level3.tsx                Stig 3: intro and the four-step balancer
src/components/OxidationStateDisplay.tsx Stig 2's oxidation-number diagram and electron animation
src/components/HalfReactionBalancer.tsx  explore panel: four half-reactions, five steps
src/components/ElectrochemicalCell.tsx   explore panel: the running galvanic cell
src/data/half-reactions.ts               Stig 3's 6 problems, multipliers and hints
src/utils/answers.ts                     normalizeSpecies, matchesSpecies, parseWholeNumber
src/utils/redox-balancing.ts             gcd, lcm, calculateMultipliers; imported only by its test
src/__tests__/                           answers, half-reactions-data, redox-balancing,
                                         level1-grading, level1-question-noun, level2-verdict,
                                         level3-play, cell-readout, completion-screen,
                                         focus-and-guard, phone-play, right-count,
                                         icelandic-text; next-guard-clock.ts and play-level3.ts
                                         are helpers
```

There are no side files. Run the tests from the repo root:
`pnpm exec vitest run apps/games/2-ar/redox-reactions`.

## Open

- **i18n.** This is one of the nine games that keep a `LanguageSwitcher`, and the most translated
  (156 `t()` calls in `docs/i18n-coverage.md`). Whether to finish wiring the nine is the
  platform-wide undecided `useGameI18n` question (`CLAUDE.md`, "Remaining deferred").
- **Hints that state the answer still count here** (found 2026-11-02, not yet fixed). Stig 3 shows
  one hint, the same on all four steps, and on all six problems it gives both halves' electron
  counts, on five the multiplier outright (`data/half-reactions.ts`, `hint:`), and on four which
  species gives and which takes electrons. Stig 1's hint ends `S þarf að vera +6`, `Mn þarf að vera
+7` and `N þarf að vera +5` on three of ten. A right answer given with them open counts, which
  `right-count.test.tsx` asserts. The 2026-10-23 ruling that such a hint counts as a revealed
  answer (REVIEW-QUEUE C3, "Hints that state the answer") was applied to VSEPR, gas-law and
  equilibrium-shifter only.
- **The orphaned `electrochemistry` game's two levels and a Faraday node** were proposed as
  additions here (`apps/games/ORPHANED_GAMES_ASSESSMENT.md`, recommendation 11): cell potentials
  from an E° table, with per-option diagnosis of the sign error. Not tracked elsewhere.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **`utils/redox-balancing.ts` is dead.** Nothing outside `__tests__/redox-balancing.test.ts`
  imports it; Stig 3 compares against the multipliers stored in `data/half-reactions.ts`.
- **Translation keys no component reads:** `game.title`, `game.subtitle`, `game.description`,
  `intro.mnemonic` (an English mnemonic, even in the `is` block), `concepts.halfReaction`,
  `concepts.electronTransfer` and every level's `levels.*.description` and `details`.
  `menu.level2Title` and `menu.level3Title` are read only by `icelandic-text.test.ts`.
