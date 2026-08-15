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

Re-measured 2026-08-15 across all 20 games.

**All 20 games import `useGameI18n` and render `LanguageSwitcher`** — so importing the hook says
nothing about whether a game is actually translated. What matters is whether its UI strings go
through `t()`. Counting `t('` calls per game:

| Game                     | Year | `t()` calls | Translated? |
| ------------------------ | ---- | ----------- | ----------- |
| redox-reactions          | 2-ar | 154         | yes         |
| nafnakerfid              | 1-ar | 91          | yes         |
| lausnir                  | 1-ar | 48          | yes         |
| hess-law                 | 2-ar | 28          | yes         |
| molmassi                 | 1-ar | 20          | yes         |
| lotukerfid               | 1-ar | 20          | yes         |
| jafna-jofnur             | 1-ar | 20          | yes         |
| dimensional-analysis     | 1-ar | 10          | partial     |
| equilibrium-shifter      | 3-ar | 7           | partial     |
| takmarkandi              | 1-ar | 2           | partial     |
| vsepr-geometry           | 2-ar | 2           | partial     |
| rafeindabygging          | 2-ar | 1           | partial     |
| kinetics                 | 2-ar | 0           | **no**      |
| lewis-structures         | 2-ar | 0           | **no**      |
| organic-nomenclature     | 2-ar | 0           | **no**      |
| intermolecular-forces    | 2-ar | 0           | **no**      |
| ph-titration             | 3-ar | 0           | **no**      |
| gas-law-challenge        | 3-ar | 0           | **no**      |
| buffer-recipe-creator    | 3-ar | 0           | **no**      |
| thermodynamics-predictor | 3-ar | 0           | **no**      |

**8 of 20 games have zero `t()` calls.** They import the hook, render a language switcher, and
serve hardcoded Icelandic — so switching to EN or PL changes nothing a student can see. That is
all of Year 3 plus four Year 2 games.

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

| Component                      | Hardcoded Strings                             |
| ------------------------------ | --------------------------------------------- |
| `Header`                       | "Námsvefur Kvennó", "Kennarar", "Upplýsingar" |
| `Footer`                       | "Kvennaskólinn í Reykjavík" copyright text    |
| `Breadcrumbs`                  | "Heim" (home link)                            |
| `ErrorBoundary`                | Error fallback messages                       |
| `AchievementsPanel`            | Achievement titles and descriptions           |
| `AchievementNotificationPopup` | Notification text                             |
| `HintSystem`                   | Hint tier labels                              |
| `FeedbackPanel`                | Feedback messages                             |
| `InteractiveGraph`             | Axis labels, tooltips                         |
| `DragDropBuilder`              | Instruction text                              |
| `ResponsiveContainer`          | No visible text                               |
| `MoleculeViewer`               | Atom labels (chemistry terms)                 |
| `ParticleSimulation`           | No visible text                               |

### Estimated shared component i18n coverage: ~5% (1/14 visible components)

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

### High Priority

1. **`nafnakerfid` game** - Wire up the existing `i18n.ts` file to use `useGameI18n` in `App.tsx`. The translation file already exists; this is likely a straightforward integration.

### Medium Priority

2. **Shared `Header` component** - Add i18n for "Kennarar" and "Upplýsingar" button labels. These appear on every page.

3. **Shared `Breadcrumbs` component** - Add i18n for "Heim" and any separator text.

4. **`ErrorBoundary`** - Add i18n for error fallback messages shown to users.

5. **`AchievementsPanel` / `AchievementNotificationPopup`** - Achievement titles and descriptions are shown during gameplay.

### Low Priority

6. **`HintSystem`** - Hint tier labels during gameplay.

7. **`FeedbackPanel`** - Game feedback messages.

8. **`landing` app** - Track selector page. Lower priority since the school's primary audience is Icelandic-speaking.

9. **`lab-reports` app** - Teacher-facing tool. The audience is primarily Icelandic teachers.

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
| Games actually routing UI through `t()` | 12/20 translated or partial; **8/20 have zero `t()` calls** |
| Shared components with i18n             | 1/14 (~7%)                                                  |
| Non-game apps with i18n                 | 0/3 (0%)                                                    |

**No overall percentage is quoted deliberately.** The previous "~60-65%" rested on counting hook
imports as coverage, which overstated it: every game imports the hook, and 8 of them translate
nothing. Any honest figure needs a string-by-string audit that has not been done.

The gap is concentrated in Year 3 (all 5 games at zero) and four Year 2 games. Shared components and
non-game apps remain Icelandic-only by design, serving an Icelandic-only audience.

Note: the earlier version of this file claimed `nafnakerfid` was the one game _not_ wired up. That is
wrong — it has 91 `t()` calls, the second-highest in the repo.
