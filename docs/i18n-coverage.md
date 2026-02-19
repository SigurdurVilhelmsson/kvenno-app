# i18n Coverage Audit

This document tracks internationalization (i18n) coverage across the kvenno-app monorepo.

## Supported Languages

- **Icelandic (is)** - Primary language, default
- **English (en)** - Full UI translation for games
- **Polish (pl)** - Full UI translation for games

Language preference is persisted in `localStorage` under the key `kvenno-language`.

## i18n Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useGameI18n` | `packages/shared/hooks/useGameI18n.ts` | Synchronous hook with built-in shared translations + game-specific merge. Used by games. |
| `useI18n` | `packages/shared/hooks/useI18n.ts` | Async hook that fetches translations from JSON files via `fetch()`. Legacy/general-purpose. |

`useGameI18n` is the preferred hook for games because it embeds shared translations directly (no network fetch needed), which is important for single-file HTML game builds.

## Games i18n Coverage

### Games using `useGameI18n` (16 of 17 games)

All of these games have a dedicated `src/i18n.ts` file with game-specific translations in all three languages, merged with shared translations via `useGameI18n`:

**Year 1 (4 of 5):**
- `molmassi` - Molar mass calculator
- `takmarkandi` - Limiting reagent
- `lausnir` - Solutions
- `dimensional-analysis` - Unit conversion

**Year 2 (7 of 7):**
- `hess-law` - Hess's law energy diagrams
- `intermolecular-forces` - Intermolecular forces
- `kinetics` - Reaction kinetics
- `lewis-structures` - Lewis dot structures
- `organic-nomenclature` - Organic naming
- `redox-reactions` - Oxidation-reduction
- `vsepr-geometry` - VSEPR molecular geometry

**Year 3 (5 of 5):**
- `buffer-recipe-creator` - Buffer solutions
- `equilibrium-shifter` - Le Chatelier's principle
- `gas-law-challenge` - Gas law calculations
- `ph-titration` - pH and titration curves
- `thermodynamics-predictor` - Thermodynamics predictions

### Games NOT using `useGameI18n` (1 of 17)

- **`nafnakerfid`** (Year 1) - Chemical naming game. Has an `i18n.ts` file but the `App.tsx` does not import or use `useGameI18n`. UI strings appear to be hardcoded in Icelandic.

### Estimated game i18n coverage: ~94% (16/17 games)

## Shared Components i18n Coverage

### Components with i18n support

| Component | i18n Method |
|-----------|-------------|
| `LanguageSwitcher` | Imports `Language` type from `useGameI18n`; renders language names/flags from its own internal map. |

### Components with hardcoded Icelandic strings (no i18n)

| Component | Hardcoded Strings |
|-----------|-------------------|
| `Header` | "Námsvefur Kvennó", "Kennarar", "Upplýsingar" |
| `Footer` | "Kvennaskólinn í Reykjavík" copyright text |
| `Breadcrumbs` | "Heim" (home link) |
| `ErrorBoundary` | Error fallback messages |
| `AchievementsPanel` | Achievement titles and descriptions |
| `AchievementNotificationPopup` | Notification text |
| `HintSystem` | Hint tier labels |
| `FeedbackPanel` | Feedback messages |
| `InteractiveGraph` | Axis labels, tooltips |
| `DragDropBuilder` | Instruction text |
| `ResponsiveContainer` | No visible text |
| `MoleculeViewer` | Atom labels (chemistry terms) |
| `ParticleSimulation` | No visible text |

### Estimated shared component i18n coverage: ~5% (1/14 visible components)

## Non-Game Apps i18n Coverage

| App | Uses i18n hooks | Notes |
|-----|----------------|-------|
| `landing` | No | All strings hardcoded in Icelandic |
| `lab-reports` | No | All strings hardcoded in Icelandic |
| `islenskubraut` | No | All strings hardcoded in Icelandic (Icelandic language teaching app) |

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

| Category | Coverage |
|----------|----------|
| Games using `useGameI18n` | 16/17 (94%) |
| Shared components with i18n | 1/14 (~7%) |
| Non-game apps with i18n | 0/3 (0%) |
| **Overall estimated translatable UI strings via hooks** | **~60-65%** |

The game layer has strong i18n coverage. The main gaps are in shared components and non-game apps, which currently serve an Icelandic-only audience. The `nafnakerfid` game is the easiest win since it already has an `i18n.ts` file that just needs to be connected.
