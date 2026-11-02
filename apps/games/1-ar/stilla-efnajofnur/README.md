# Stilla efnajöfnur

Chain position 6 of 10 in Year 1, between Reynsluformúlur and Útfellingarhvörf. The game teaches
balancing a chemical equation with coefficients, by the law of conservation of mass
(`Massavarðveislulögmálið`), and it is one of the platform's gold-standard games for its atom
counter: a table of each element's count on each side that updates as the student steps a
coefficient.

## Structure

Three levels, none gated; any can be opened from the menu. All three are one component,
`components/Level.tsx`, configured per level in `components/levelConfigs.tsx`. Each plays every
equation of its tier once, in a shuffled order, from the 20 in `data/reactions.ts`.

| Stig | Menu name                  | What it asks                                                                                                                        |
| ---- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `Stig 1: Einfaldar jöfnur` | A teaching screen (why we balance, a worked H₂ + O₂ example, the method), then 7 equations with two or three elements, stored hints |
| 2    | `Stig 2: Miðlungs jöfnur`  | 7 equations with three or four elements, stored hints                                                                               |
| 3    | `Stig 3: Erfiðar jöfnur`   | 6 equations: two combustions of hydrocarbons, glucose, ammonia, two single displacements; the hint is computed from the live counts |

The student sets each coefficient with `+` and `−` steppers (1 to 9, `EquationEditor.tsx`), so
there is no typed input. `Athuga` grades once per equation: right means the atoms balance **and**
the coefficients are the lowest whole numbers (`isBalanced && isReduced`). A wrong answer shows
the right coefficients, so there is no retry. In Stig 1 the hint also highlights the unbalanced
rows of the atom counter. Stig 2's reaction 13, CaCO₃ → CaO + CO₂, is balanced as printed, and its
hint says so.

There is no running score: each level ends `Þú stilltir N af M jöfnum rétt` with `Reyna aftur` (a
fresh shuffle) and `Ljúka stigi`, which marks the level done at any score; the menu shows a ✓
beside each level done. Progress is saved under `stillaEfnajofnurProgress`.

## What matters before touching it

**The name and the identifier (2026-09-24).** The verb for balancing an equation is `stilla`
(Siggi's ruling, 2026-08-26; the governed-terms row bans the old verb in the forms that shipped),
and the game was renamed for it in August. On 2026-09-24 the identifier followed: the folder, the
URL and the progress key moved from the old `jafna-jofnur` names.

- `server/nginx-site.conf` 301-redirects `/efnafraedi/1-ar/games/jafna-jofnur.html` to
  `stilla-efnajofnur.html`; confirmed live on 2026-10-18 (`docs/REVIEW-QUEUE.md`, section A).
  **Keep the redirect**: links in old class material outlive any deploy.
- `App.tsx` passes `['jafnaJofnurProgress']` as `useGameProgress`'s `legacyKeys`, so progress saved
  under the old key is carried over once and the old key removed
  (`packages/shared/hooks/__tests__/useGameProgress.test.ts`, "legacy keys").
- The same name is on the hub card, the tab title and the menu header, which
  `packages/shared/i18n/__tests__/game-titles-agree.test.ts` holds.

**B12 — a doubled answer is not an answer (fixed 2026-08-26).** `4H₂ + 2O₂ → 4H₂O` balances, and
the old check said `Rétt!`. `checkBalance` in `utils/balanceChecker.ts` now returns `isReduced`
beside `isBalanced`, the level requires both, and a balanced but unreduced set gets its own
feedback (`Atómin standast á, en stuðlarnir eru ekki í lægstu heilu tölum …`) rather than a bare
`Rangt`. The game also has to say the rule before grading it: Stig 1's banner reads `Notaðu lægstu
heilu tölurnar sem ganga upp.`, and since 2026-10-23 (decisions item 49 (b)) the Stig 2 and Stig 3
menu descriptions carry the same sentence, since a student can start at either.
`balance-checker.test.ts` was this game's first test file; it also checks that all 20 stored
answer keys balance, are reduced and reject their own double. `wording.test.ts` holds the menu
sentence.

**Stig 3's hint agrees with the grader.** It is computed from the live counts, and it used to look
only at the atom balance, so on a doubled set it said the equation looked balanced and sent the
student to `Athuga`, which marked it wrong — spending their one attempt. It now says what is still
wrong. `hint-agrees-with-grader.test.tsx` plays every Stig 3 equation through the real steppers.

**A wrong answer gets a reason (2026-08-27).** `diagnoseMisconception` fills the `FeedbackPanel`
misconception slot from the coefficients the student set: nothing changed (what a coefficient
does, and that the subscripts must never change), only one side changed where the other needs a
coefficient, an element counted in one molecule but not another on the same side, and the
diatomic parity trap. It says nothing where it cannot read the answer, and nothing about a
balanced but unreduced set. The subscript word is `lágstafur` (decisions item 13, 2026-10-23).
`misconception.test.ts` guards it.

**The method teaches the book's order (decisions item 48 (c), 2026-10-02).** Stig 1's `Aðferð til
að stilla` used to list a fixed order that put súrefni before vetni, while reaction 8's hint said
`stilltu súrefni síðast`, as the textbook does. It now teaches the principle: elements in one
substance per side first, those in several (usually súrefni and vetni) last, a free element such as
O₂ allra síðast. `method-order.test.tsx` checks the list against every hint.

**Wording.** `wording.test.ts` scans the game's own source for what the platform guard could not
see here: conjugated and bare forms of the old verb, a non-word participle, a pronoun that did not
agree with neuter element names, `viðbrögð` for a reaction, a coined word for a displacement, and bare `skiptihvarf` without its qualifier (`einfalt` /
`tvöfalt`, Siggi's ruling 2026-08-29). It also holds the menu to the data: Stig 3's description
says `einföld skiptihvörf`, which reactions 17 and 18 are, and no language may claim a double
displacement; and the learning path's element counts (`2–3`, `3+`) must match Stig 1 and Stig 2.

**Phones.** On a short portrait phone (the SE, at most 600 px tall) the `Athuga | Vísbending` row
is wrapped in `PinnedActions`; its measurement is the `stilla-efnajofnur` entry in `PIN_USES`,
`e2e/mobile-vertical.spec.ts`. After `Athuga` focus moves to the feedback, and `Næsta` ignores a
press within 400 ms (`phone-scroll.test.tsx`).

## Layout

```
src/App.tsx                       menu, chain string, progress (stillaEfnajofnurProgress,
                                  legacy key jafnaJofnurProgress)
src/i18n.ts                       is/en/pl; only game.* and menu.* are read
src/components/Level.tsx          the one level: equation, atom counter, Athuga, hint, feedback
src/components/levelConfigs.tsx   per-level title, hint source, Stig 1's intro and banner
src/components/EquationEditor.tsx coefficient steppers, 1 to 9
src/components/AtomCounter.tsx    the live count table
src/data/reactions.ts             20 reactions: 7 easy, 7 medium, 6 hard, answer coefficients
src/utils/balanceChecker.ts       checkBalance, coefficientsAreReduced, the diagnostic and
                                  misconception text
src/__tests__/                    balance-checker, hint-agrees-with-grader, method-order,
                                  misconception, phone-scroll, wording;
                                  next-guard-clock.ts is a helper
```

Run the tests from the repo root: `pnpm exec vitest run apps/games/1-ar/stilla-efnajofnur`.

## Open

- **i18n.** The menu goes through `t()` with `en` and `pl` blocks; the levels are hardcoded
  Icelandic, so English or Polish reaches the menu only. This is one of the nine games that keep
  the switcher, inside the platform-wide undecided `useGameI18n` question (`CLAUDE.md`, "Remaining
  deferred"; `docs/i18n-coverage.md`).
- **The counter can be chased.** The August review noted the atom counter is never gated, so a
  student can press `+` toward the smaller number until every row turns green without reasoning
  (`apps/games/1-ar/CURRICULUM_REVIEW.md:209`). No ruling.
- **Phone smoke test** on a real phone, Stilla efnajöfnur among the games named:
  `docs/REVIEW-QUEUE.md`, section A.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **Dead translation blocks.** `i18n.ts` carries `equation`, `results` and `level` blocks in all
  three languages, but `t()` is called only in `App.tsx`, for `game.*` and `menu.*`. `Level.tsx`
  writes its own Icelandic, so nothing reads those blocks.
