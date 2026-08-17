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

Re-measured 2026-08-17 across all 20 games. (The 2026-08-15 pass counted only `t('` — the
single-quoted form — and so undercounted seven games; the counts below include the template-literal
`` t(`…` ``, variable-key `t(c…)` and line-wrapped forms.)

**All 20 games import `useGameI18n` and render `LanguageSwitcher`** — so importing the hook says
nothing about whether a game is actually translated. What matters is whether its UI strings go
through `t()`. Counting every `t()` call site per game:

| Game                     | Year | `t()` calls | Translated? |
| ------------------------ | ---- | ----------- | ----------- |
| redox-reactions          | 2-ar | 156         | yes         |
| nafnakerfid              | 1-ar | 91          | yes         |
| lausnir                  | 1-ar | 48          | yes         |
| hess-law                 | 2-ar | 32          | yes         |
| molmassi                 | 1-ar | 22          | yes         |
| lotukerfid               | 1-ar | 22          | yes         |
| jafna-jofnur             | 1-ar | 22          | yes         |
| dimensional-analysis     | 1-ar | 10          | partial     |
| equilibrium-shifter      | 3-ar | 7           | partial     |
| takmarkandi              | 1-ar | 2           | partial     |
| vsepr-geometry           | 2-ar | 2           | partial     |
| rafeindabygging          | 2-ar | 1           | partial     |
| ph-titration             | 3-ar | 1           | partial     |
| kinetics                 | 2-ar | 0           | **no**      |
| lewis-structures         | 2-ar | 0           | **no**      |
| organic-nomenclature     | 2-ar | 0           | **no**      |
| intermolecular-forces    | 2-ar | 0           | **no**      |
| gas-law-challenge        | 3-ar | 0           | **no**      |
| buffer-recipe-creator    | 3-ar | 0           | **no**      |
| thermodynamics-predictor | 3-ar | 0           | **no**      |

**7 of 20 games have zero `t()` calls.** They import the hook, render a language switcher, and
serve hardcoded Icelandic — so switching to EN or PL changes nothing a student can see. That is
three of the five Year 3 games plus four Year 2 games.

Two more are zero in all but name: `rafeindabygging` and `ph-titration` have exactly one `t()` call
each (`ph-titration`'s is a template literal with a hardcoded Icelandic fallback,
`src/components/Level3.tsx:104`). Nine of the twenty are therefore effectively untranslated.

Caveats on this measurement:

- `t()` count is a proxy for effort, not a coverage percentage. A game with 20 calls may still have
  many hardcoded strings; no game here has been audited string-by-string.
- Deliberately **no overall percentage** is quoted. The previous "~94% (16/17 games)" figure counted
  hook imports, which overstated real coverage by a wide margin.

This conflicts with CLAUDE.md's "Icelandic UI only" rule and is tracked there as an open decision:
strip the i18n scaffolding, finish wiring it, or leave it. Needs a teacher's call, not a code change.

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

| Category                                | Coverage                                                    |
| --------------------------------------- | ----------------------------------------------------------- |
| Games importing `useGameI18n`           | 20/20 (100%) — but see caveat below                         |
| Games actually routing UI through `t()` | 13/20 translated or partial; **7/20 have zero `t()` calls** |
| Shared components with i18n             | 1/14 (~7%)                                                  |
| Non-game apps with i18n                 | 0/3 (0%)                                                    |

**No overall percentage is quoted deliberately.** The previous "~60-65%" rested on counting hook
imports as coverage, which overstated it: every game imports the hook, and 7 of them translate
nothing. Any honest figure needs a string-by-string audit that has not been done.

The gap is concentrated in Year 3 (3 of 5 games at zero, and `ph-titration` at a single call) and
four Year 2 games. Shared components and non-game apps remain Icelandic-only by design, serving an
Icelandic-only audience.

Note: the earlier version of this file claimed `nafnakerfid` was the one game _not_ wired up. That is
wrong — it has 91 `t()` calls, the second-highest in the repo.
