# Game Review: Redox Reactions (Year 2)

## Summary

Redox Reactions (Oxun og Afoxun) is a three-level game teaching electron transfer chemistry through oxidation number rules, redox reaction identification, and half-reaction balancing. Level 1 teaches 6 oxidation number rules through a learn-then-practice format with 10 progressively complex compounds (NaCl → Cr₂O₇²⁻), including misconception corrections for H in hydrides and O in peroxides. Level 2 presents 8 real redox reactions (2Na+Cl₂, Fe+CuSO₄, Zn+2HCl, 2Mg+O₂, etc.) where students identify oxidized/reduced species and oxidizing/reducing agents (4 questions per reaction = 32 total). Level 3 guides students through the 5-step half-reaction balancing method for 6 problems using LCM/GCD calculations for electron transfer. The game features two custom visualization components: OxidationStateDisplay (animated electron transfer with color-coded badges) and ElectrochemicalCell (SVG galvanic cell with 4 selectable cell types showing proper E° values).

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Excellent scaffolding from oxidation rules → redox identification → half-reaction balancing. Misconception correction for H in hydrides (-1), O in peroxides (-1), and OF₂ (+2). FeedbackPanel provides targeted explanations. Real chemistry: displacement reactions, metal extraction (Fe₂O₃+C), halogen activity series (Cl₂+2KBr). ElectrochemicalCell connects to battery applications. |
| D2. Graphic Design | 4/5 | OxidationStateDisplay uses animated electron flow (yellow circles) with color-coded badges (blue negative, orange positive). ElectrochemicalCell is a comprehensive SVG with half-cells, electrodes, salt bridge, voltmeter, and animated particles. Distinctive red/pink color scheme differentiates from other Year 2 games. **Issue:** Both reactant and product sides use identical glow styling. |
| D3. Scientific Accuracy | 5/5 | All 10 oxidation number problems verified correct. All 8 Level 2 reactions stoichiometrically balanced with correct oxidation state changes. 6 Level 3 half-reactions verified (LCM calculation correct). Electrode potentials match literature: Zn²⁺/Zn -0.76V, Cu²⁺/Cu +0.34V, Mg²⁺/Mg -2.37V, Fe²⁺/Fe -0.44V, Ag⁺/Ag +0.80V. Cell potentials correctly calculated (Daniell cell: 1.10V ✓). 20+ tests in 2 test files validate data integrity and balancing utilities. |
| D4. Physical/Spatial | 3/5 | Responsive with md: breakpoints, flexible grids. Touch-friendly buttons (py-3 px-6). Number inputs optimized for mobile (spinner removed). Respects prefers-reduced-motion. **Issues:** Missing ARIA labels on number inputs (Level1:289, Level2:279, Level3:118). SVG ElectrochemicalCell lacks `<title>` tags. Color-only distinction for OXAST/AFOXAST badges (text present but color is primary differentiator). |
| D5. Game Design | 4/5 | Multi-attempt scoring: L1 gives 10/5/2 points for 1st/2nd/3rd attempts. L2 flat 10 points per correct. L3 composite scoring (15+10+10+20 per problem). Hint system with tracking. Achievement integration via shared hooks. Progress persisted. **Issue:** Scoring scales inconsistent across levels (L1 max 100, L2 max 320, L3 max 330). |
| D6. Age-Appropriate | 5/5 | Matches Year 2 curriculum perfectly. Proper Icelandic terminology: oxunartölur, rafeindasamskipti, helmingshvarf, oxunarefni/afoxunarefni, saltbrú. Real-world connections: battery chemistry, corrosion, metal extraction, displacement reactions. Abstract concepts supported by OxidationStateDisplay visualization and ElectrochemicalCell simulation. |
| D7. Consistency | 3/5 | Uses 8 shared components correctly (LanguageSwitcher, ErrorBoundary, Achievements suite, FeedbackPanel, useGameI18n, useGameProgress, useAchievements). **Critical issue:** i18n gameTranslations object is fully defined for 3 languages but NEVER USED — all UI text is hardcoded in Icelandic. English/Polish speakers get Icelandic interface despite language switcher being present. |
| **Overall** | **4.1/5** | |

## Strengths

- **ElectrochemicalCell simulation (546 lines):** Comprehensive SVG galvanic cell with two half-cells (colored solutions), electrodes (gradient-filled), salt bridge, voltmeter showing E°cell calculation, and animated particles (electrons yellow, cations colored). 4 selectable cell types (Zn-Cu, Mg-Cu, Fe-Cu, Zn-Ag) with accurate standard electrode potentials (all within ±0.01V of literature values).
- **OxidationStateDisplay with animated electron transfer:** Color-coded oxidation state badges (blue for negative, orange-red for positive, gray for zero). Animated yellow electron circles moving between species. Before/after state comparison with labeled arrows (↑ OXAST, ↓ AFOXAST). Clear legend explaining color scheme.
- **Comprehensive oxidation number coverage:** 10 compounds spanning simple (NaCl, H₂O) to complex (KMnO₄ with Mn+7, Cr₂O₇²⁻ with Cr+6). Misconceptions explicitly addressed: H in metal hydrides (-1), O in peroxides (-1), O in OF₂ (+2). Sum rule for both neutral compounds and polyatomic ions.
- **Half-reaction method with LCM calculation:** Level 3 implements the 5-step method rigorously. LCM/GCD utility (redox-balancing.ts, 58 lines) properly handles electron balancing. 6 problems verified: Zn+Cu²⁺, Fe+Ag⁺, Al+H⁺ (LCM of 3,2 = 6 ✓), Mg+O₂, Cl₂+Br⁻, Fe³⁺+Sn²⁺.
- **Robust test coverage:** 2 test files (154 total lines): half-reactions-data.test.ts validates data integrity (6 tests), redox-balancing.test.ts validates utility functions (20+ cases including LCM, charge stripping, species matching).
- **Real-world reaction contexts:** 8 Level 2 reactions include practical chemistry: Fe+CuSO₄ (displacement), 2Mg+O₂ (combustion), Fe₂O₃+C (metal extraction), Cl₂+2KBr (halogen activity series), 2Al+3CuO (thermite variant).

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **i18n translations defined but never used** — App.tsx, Level1.tsx, Level2.tsx, Level3.tsx: All UI text is hardcoded in Icelandic despite a complete 3-language gameTranslations object in i18n.ts (175 lines). LanguageSwitcher is present but switching language has no effect on game content. English and Polish speakers cannot use the game effectively.

### Major (significant UX/pedagogical problems)

2. **Missing ARIA labels on critical inputs** — Level1.tsx:289, Level2.tsx:279, Level3.tsx:118: Number and text inputs lack `aria-label` or `aria-labelledby`. Screen reader users cannot understand input purpose.

3. **SVG ElectrochemicalCell lacks accessibility** — ElectrochemicalCell.tsx line 348: No `<title>` tags, no `role="img"`, no description. Screen readers cannot describe the cell diagram. Fix: add `<title>Galvanísk klefi</title>` inside SVG.

4. **Color-only indicators in OxidationStateDisplay** — OxidationStateDisplay.tsx lines 150-158: "↑ OXAST" and "↓ AFOXAST" labels use color as primary differentiator (orange vs blue). Text IS present but color-blind users may struggle to quickly distinguish. Fix: add icon supplements (e.g., ⬆/⬇ arrows).

### Minor (polish, consistency, nice-to-haves)

5. **OxidationStateDisplay electronsDelta calculation** — OxidationStateDisplay.tsx lines 41-47: `electronsDelta = c.before - c.after` produces negative values for oxidation (e.g., Fe 0→+2 gives -2). Works by coincidence with `isOxidized` check but animation count display may be incorrect. Fix: use `Math.abs()`.

6. **Inconsistent Level 2 option generation** — Level2.tsx lines 181-187: For agent questions, options are [oxidizingAgent, reducingAgent] vs element names for other questions. Presentation inconsistency between question types.

7. **Magic numbers in scoring** — Level1.tsx:128-129, Level2.tsx:167, Level3.tsx:34-35: Point values (10, 5, 2, 15, 20) hardcoded without constants or explanation. Fix: define scoring constants at file top.

8. **Minor Icelandic terminology inconsistency** — "oxunartölur" vs "oxidunartala" used in plural/singular forms across files. Not incorrect but slightly inconsistent.

## Recommendations

1. **Connect i18n to UI** — Replace all hardcoded Icelandic strings in Level1/2/3.tsx and App.tsx with `t()` calls from the existing gameTranslations object. This is the most impactful fix — the translation infrastructure is already complete.
2. **Add ARIA labels** — Add `aria-label` to all number inputs, `<title>` to ElectrochemicalCell SVG, and icon supplements to OxidationStateDisplay badges.
3. **Fix electronsDelta calculation** — Use `Math.abs(c.before - c.after)` for consistent electron count display.
4. **Define scoring constants** — Extract point values to named constants at the top of each level file for maintainability.
