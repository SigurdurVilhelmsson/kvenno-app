# Game Review: Mólmassi (Year 1)

## Summary

Mólmassi is a three-level progressive chemistry game teaching students to understand and calculate molar mass. Level 1 focuses on conceptual understanding (counting atoms, comparing masses, building molecules) without calculations. Level 2 introduces estimation using rounded atomic masses. Level 3 requires precise calculations with three play modes (practice, competition, mystery molecule). The game covers 32 compounds across easy/medium/hard tiers using 38 elements with IUPAC-standard atomic masses.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Excellent constructivism (build→estimate→calculate), strong misconception targeting, 4-tier hint system, dual coding (atom visuals + formulas). Only weakness: no spaced repetition mechanism. |
| D2. Graphic Design | 4/5 | Clean visual hierarchy, color-coded atoms by element, smooth animations (bounce-in, fade-in-up). Mass bar visualization effective. Atom size encoding communicates relative mass well. Minor: warm palette sometimes low contrast on light backgrounds. |
| D3. Scientific Accuracy | 5/5 | Precise IUPAC atomic masses (3 decimal places). All 32 compound molar masses verified correct including hydrates (CuSO₄·5H₂O = 249.685). Correct Icelandic element names (Vetni, Kolefni, Súrefni). Hydrate dot notation handled properly. |
| D4. Physical/Spatial | 4/5 | Responsive layout (md: breakpoints). Periodic table adapts from grid to list on mobile. 3D molecule viewer has 2D fallback toggle. **Critical bug: game does not load in browser** due to React 19 / @react-three/fiber@8.18 incompatibility (`ReactCurrentBatchConfig` undefined error). |
| D5. Game Design | 5/5 | Excellent flow: L1 gate (6/8 correct) prevents premature advancement. L3 offers three modes (practice/competition/mystery) for replayability. Streak mechanics encourage sustained engagement. Failure is productive — feedback explains *why* answers are wrong. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 1 (Brown Ch. 1–3). L1 is concrete/visual (no math). L2 uses whole-number approximations (mental arithmetic). L3 introduces precise lookup. Compounds are real-world (water, salt, sugar, methane). Complexity builds within each level. |
| D7. Consistency | 4/5 | Uses shared components well: HintSystem (4-tier), FeedbackPanel, AchievementsPanel/Button, LanguageSwitcher, ErrorBoundary, useAchievements, useGameProgress, useGameI18n. Has back-to-menu link. **Missing:** Breadcrumbs, shared Header/Footer. |
| **Overall** | **4.6/5** | |

## Strengths

- **Exceptional scaffolding:** The L1→L2→L3 progression (concept→estimation→calculation) is textbook Vygotsky ZPD, removing exactly one source of difficulty per level
- **Scientific accuracy:** All 32 compound molar masses are verified correct against IUPAC standard atomic masses, including complex hydrates
- **Misconception-aware feedback:** FeedbackPanel generates context-specific explanations addressing exactly *why* an answer is wrong (e.g., "subscripts apply to one element only")
- **Rich compound database:** 32 compounds across 3 difficulty tiers with real-world relevance (vatn, borðsalt, metan, glúkósa)
- **Multiple engagement modes:** L3 offers practice, timed competition, and reverse-engineering (mystery molecule) — strong replayability
- **Atom visualization:** Color/size encoding makes relative atomic mass intuitive (H is tiny/gray, O is medium/red, Fe is large/brown)
- **Achievement integration:** Tracks correct answers, streaks, level completion, and game completion via shared achievement system
- **Comprehensive test coverage:** 25 unit tests covering calculations, validation, scoring, and challenge generation

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **GAME DOES NOT LOAD IN BROWSER** — React 19 + @react-three/fiber@8.18 incompatibility causes `ReactCurrentBatchConfig` / `ReactCurrentOwner` undefined errors. The 3D molecule viewer (MoleculeViewer3DLazy using Three.js) triggers this. The game builds to a 3MB single-file HTML but crashes on load. This affects ALL games using the shared MoleculeViewer3D component.

2. **Build script path mismatch** — `package.json` build script has `mv ../../../../dist/1-ar/games/index.html` but output goes to `dist/efnafraedi/1-ar/games/index.html`. The `mv` fails, making the build exit with error code 1 (though the HTML file is actually created correctly at the `efnafraedi/` path).

### Major (significant UX/pedagogical problems)

3. **i18n uses ASCII approximations for Icelandic** — All Icelandic text in `i18n.ts` uses ASCII-only characters: "Molmassi" instead of "Mólmassi", "Laerdu" instead of "Lærðu", "Surefni" instead of "Súrefni", "Kofnunarefni" instead of "Köfnunarefni", "thyngri" instead of "þyngri". This is a systematic issue affecting ~200 strings. The game title, all hint text, all feedback text, and all UI labels are affected.

4. **Level 2 hints only available for one challenge type** — The hint button only appears during `calculate_simple` challenges. The three other L2 challenge types (estimate_mass, order_molecules, find_heaviest_atom) have no hint support, creating inconsistent scaffolding.

5. **Hydrate pedagogy gap** — Hydrated compounds (e.g., CuSO₄·5H₂O, MgSO₄·7H₂O) appear in Level 3 but there is no educational content explaining what hydrates are or how to read the dot notation. Students encounter these for the first time with no scaffolding.

### Minor (polish, consistency, nice-to-haves)

6. **No shared Header/Footer** — Game uses its own minimal header. No breadcrumbs ("Heim > Efnafræði > 1. ár > Mólmassi") for navigation context.

7. **Mystery mode distractors too easy** — Compounds within ±30% molar mass are offered as alternatives. For a 100 g/mol molecule, this includes anything from 70–130 g/mol — too wide a range for challenging gameplay.

8. **Missing feedback generation tests** — `feedbackGenerator.ts` is untested; only utility functions have test coverage.

9. **PeriodicTable may need horizontal scroll on mobile** — The 18-column grid layout requires scroll on screens < 768px. The list-view fallback mitigates this.

10. **@import CSS warning** — `@import url(...)` for Google Fonts placed after other CSS rules causes PostCSS warning during build. Should be moved to `<head>` in `index.html` instead.

## Recommendations

1. **Fix React/Three.js compatibility** — Either upgrade `@react-three/fiber` to v9+ (React 19 compatible) or downgrade React to 18.x across the monorepo. Alternatively, remove the 3D viewer dependency and use only the 2D atom visualization (which works without Three.js).

2. **Fix Icelandic i18n text** — Replace all ASCII approximations with proper Icelandic characters (á, é, í, ó, ú, ý, ð, þ, æ, ö) throughout `i18n.ts`. This is ~200 strings.

3. **Fix build script paths** — Update `package.json` build scripts to use `efnafraedi/` prefix in the `mv` command.

4. **Add hints for all L2 challenge types** — Extend the HintSystem integration to estimate_mass, order_molecules, and find_heaviest_atom challenges.

5. **Add hydrate explainer** — When a hydrate compound appears in L3, show a tooltip or info panel explaining the dot notation and how to calculate molar mass of hydrated compounds.

6. **Add shared navigation components** — Integrate shared Header with breadcrumbs for consistent platform navigation.
