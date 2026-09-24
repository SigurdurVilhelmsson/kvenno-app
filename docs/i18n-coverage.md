# i18n Coverage Audit

This document tracks internationalization (i18n) coverage across the kvenno-app monorepo.

## Supported Languages

- **Icelandic (is)** - Primary language, default
- **English (en)** - Full UI translation for games
- **Polish (pl)** - Full UI translation for games

Language preference is persisted in `localStorage` under the key `kvenno-language`.

## i18n Hooks

| Hook          | Location                               | Purpose                                                                                     |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `useGameI18n` | `packages/shared/hooks/useGameI18n.ts` | Synchronous hook with built-in shared translations + game-specific merge. Used by games.    |
| `useI18n`     | `packages/shared/hooks/useI18n.ts`     | Async hook that fetches translations from JSON files via `fetch()`. Legacy/general-purpose. |

`useGameI18n` is the preferred hook for games because it embeds shared translations directly (no network fetch needed), which is important for single-file HTML game builds.

## Games i18n Coverage

Re-measured 2026-08-17 across all 20 games then wired. (The 2026-08-15 pass counted only `t('` —
the single-quoted form — and so undercounted seven games; the counts below include the
template-literal `` t(`…` ``, variable-key `t(c…)` and line-wrapped forms.)

**Eight of those games were stripped on 2026-09-19 — Siggi's ruling.** They imported the hook,
rendered a switcher, and translated nothing, so picking English or Polish moved the control and left
the page in Icelandic. Their dead `i18n.ts` files (1 661 lines across the eight) were deleted with
zero consumers. `packages/shared/i18n/__tests__/switcher-earns-its-place.test.ts` now enforces the
rule as a property: **a game that renders `LanguageSwitcher` must have at least one `t()` call.**

That leaves **12 games with i18n wiring and 10 without.** Of the ten, eight are the stripped ones;
`1-ar/einingakedjan` (Aug 2026) and `3-ar/syrufastinn` (Sep 2026) never had any, deliberately.

Counting every `t()` call site per game, as measured before the strip:

| Game                     | Year | `t()` calls | Translated?             |
| ------------------------ | ---- | ----------- | ----------------------- |
| redox-reactions          | 2-ar | 156         | yes                     |
| nafnakerfid              | 1-ar | 91          | yes                     |
| lausnir                  | 1-ar | 48          | yes                     |
| hess-law                 | 2-ar | 32          | yes                     |
| molmassi                 | 1-ar | 22          | yes                     |
| lotukerfid               | 1-ar | 22          | yes                     |
| stilla-efnajofnur             | 1-ar | 22          | yes                     |
| dimensional-analysis     | 1-ar | 10          | partial                 |
| equilibrium-shifter      | 3-ar | 7           | partial                 |
| takmarkandi              | 1-ar | 2           | partial                 |
| vsepr-geometry           | 2-ar | 2           | partial                 |
| rafeindabygging          | 2-ar | 1           | partial                 |
| ph-titration             | 3-ar | 1           | **stripped 2026-09-19** |
| kinetics                 | 2-ar | 0           | **stripped 2026-09-19** |
| lewis-structures         | 2-ar | 0           | **stripped 2026-09-19** |
| organic-nomenclature     | 2-ar | 0           | **stripped 2026-09-19** |
| intermolecular-forces    | 2-ar | 0           | **stripped 2026-09-19** |
| gas-law-challenge        | 3-ar | 0           | **stripped 2026-09-19** |
| buffer-recipe-creator    | 3-ar | 0           | **stripped 2026-09-19** |
| thermodynamics-predictor | 3-ar | 0           | **stripped 2026-09-19** |

**The eight stripped are the seven with zero `t()` calls, plus `ph-titration`.** Its single call was
a template literal with a hardcoded Icelandic fallback (`src/components/Level3.tsx:104`) covering
five badge labels; the Icelandic it now prints is the string that lookup already fell back to, so
nothing a student sees changed.

**`2-ar/rafeindabygging` was left alone, and it is the closest call.** It also has exactly one `t()`
call — but that one is `t('game.title')`, a real translated string rather than a fallback, so
switching language does change something visible. The ruling drew the line at zero and this is not
zero. It, `2-ar/vsepr-geometry` (2) and `1-ar/takmarkandi` (2) are the barely-translated remainder,
and finishing or stripping them is still open.

Caveats on this measurement:

- `t()` count is a proxy for effort, not a coverage percentage. A game with 20 calls may still have
  many hardcoded strings; no game here has been audited string-by-string.
- Deliberately **no overall percentage** is quoted. The previous "~94% (16/17 games)" figure counted
  hook imports, which overstated real coverage by a wide margin.

This conflicted with CLAUDE.md's "Icelandic UI only" rule and was tracked as an open decision —
**settled 2026-09-19: strip the scaffolding where it translates nothing.** The three barely-wired
games above are what is left of the question.

## Shared Components i18n Coverage

### Components with i18n support

| Component          | i18n Method                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `LanguageSwitcher` | Imports `Language` type from `useGameI18n`; renders language names/flags from its own internal map. |

### Components with hardcoded Icelandic strings (no i18n)

| Component                      | Hardcoded Strings                                                                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header`                       | "Námsvefur Kvennó", "Efnafræði", "Íslenskubraut", "Svið" (nav aria-label), "Til baka" (default `backLabel`), "Upplýsingar" (only when `onInfoClick` is passed) |
| `Footer`                       | "Kvennaskólinn í Reykjavík" copyright text                                                                                                                     |
| `Breadcrumbs`                  | `aria-label="Brauðmolar"` only — the visible labels, "Heim" included, come from the caller-supplied `items` array                                              |
| `ErrorBoundary`                | Error fallback messages                                                                                                                                        |
| `AchievementsPanel`            | Achievement titles and descriptions (dormant — no game imports it)                                                                                             |
| `AchievementNotificationPopup` | Notification text (dormant — no game imports it)                                                                                                               |
| `HintSystem`                   | Hint tier labels                                                                                                                                               |
| `FeedbackPanel`                | Feedback messages                                                                                                                                              |
| `InteractiveGraph`             | Axis labels, tooltips                                                                                                                                          |
| `DragDropBuilder`              | Instruction text                                                                                                                                               |
| `ResponsiveContainer`          | No visible text                                                                                                                                                |
| `MoleculeViewer`               | Atom labels (chemistry terms)                                                                                                                                  |
| `ParticleSimulation`           | No visible text                                                                                                                                                |

### Estimated shared component i18n coverage: ~7% (1/14 listed components)

## Non-Game Apps i18n Coverage

| App             | Uses i18n hooks | Notes                                                                |
| --------------- | --------------- | -------------------------------------------------------------------- |
| `landing`       | No              | All strings hardcoded in Icelandic                                   |
| `lab-reports`   | No              | All strings hardcoded in Icelandic                                   |
| `islenskubraut` | No              | All strings hardcoded in Icelandic (Icelandic language teaching app) |

## Shared Translations (built into `useGameI18n`)

The `useGameI18n` hook includes built-in translations for these namespaces:

- `common` - Generic UI (start, continue, next, submit, cancel, etc.) - 21 keys
- `language` - Language names (select, is, en, pl) - 4 keys
- `levels` - Level names and descriptions (level1-3) - 6 keys (nested)
- `feedback` - Success/error/warning messages - 6 keys
- `ui` - UI labels (reset progress, learning path, achievements, settings) - 5 keys

**Total shared translation keys: ~42 (in 3 languages = ~126 translated strings)**

## Recommendations (Priority Order)

### Medium Priority

1. **Shared `Header` component** - Add i18n for the track tabs ("Efnafræði", "Íslenskubraut"), the "Svið" nav aria-label, the default `backLabel` "Til baka", and the "Upplýsingar" button. The track tabs and aria-label appear on every page that renders the default variant; "Upplýsingar" only renders when a caller passes `onInfoClick`. There is no "Kennarar" button — it was removed, and `Header.test.tsx` asserts its absence.

2. **Shared `Breadcrumbs` component** - Add i18n for the `aria-label="Brauðmolar"`. The visible labels are not the component's to translate: callers pass them in via `items`, so "Heim" has to be fixed at each call site. The separator is a `ChevronRight` icon, not text.

3. **`ErrorBoundary`** - Add i18n for error fallback messages shown to users.

### Low Priority

4. **`HintSystem`** - Hint tier labels during gameplay.

5. **`FeedbackPanel`** - Game feedback messages.

6. **`landing` app** - Track selector page. Lower priority since the school's primary audience is Icelandic-speaking.

7. **`lab-reports` app** - Teacher-facing tool. The audience is primarily Icelandic teachers.

8. **`AchievementsPanel` / `AchievementNotificationPopup`** - Dormant, so effectively "do not do". No game imports either component as of Aug 2026; the only matches in `apps/` are `vi.mock` stubs in `dimensional-analysis/src/__tests__/a11y.test.tsx:74,128,132`. Their strings are shown to nobody, so translating them is wasted work until the achievements family is either revived or retired — Siggi's call. (Earlier versions of this file ranked this Medium on the claim that the titles "are shown during gameplay". They are not.)

### Intentionally Icelandic-Only

The following should remain in Icelandic as they are educational chemistry content tied to the Icelandic school curriculum:

- Chemical element names and symbols
- Chemical equations and formulas
- Experiment descriptions in lab reports
- Icelandic chemical nomenclature rules (nafnakerfid game data)
- Islenskubraut content (Icelandic language teaching materials)

## Summary

| Category                               | Coverage                                                        |
| -------------------------------------- | --------------------------------------------------------------- |
| Games importing `useGameI18n`          | 12/22 — every one of them routes at least one string through it |
| Games with no i18n wiring at all       | 10/22 — the 8 stripped, plus einingakedjan and syrufastinn      |
| Games shipping a switcher that is dead | **0** — enforced by `switcher-earns-its-place.test.ts`          |
| Shared components with i18n            | 1/14 (~7%)                                                      |
| Non-game apps with i18n                | 0/3 (0%)                                                        |

**No overall percentage is quoted deliberately.** The previous "~60-65%" rested on counting hook
imports as coverage, which overstated it. Any honest figure needs a string-by-string audit that has
not been done — a game with 20 `t()` calls may still have dozens of hardcoded strings.

Year 3 now has **one** game with i18n wiring (`equilibrium-shifter`, 7 calls); the other five
either never had it or were stripped. Shared components and non-game apps remain Icelandic-only by
design, serving an Icelandic-only audience.

Note: the earlier version of this file claimed `nafnakerfid` was the one game _not_ wired up. That is
wrong — it has 91 `t()` calls, the second-highest in the repo.
