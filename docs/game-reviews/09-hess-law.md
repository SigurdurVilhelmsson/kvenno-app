# Game Review: Hess Law (Year 2)

## Summary

Hess Law (Lögmál Hess) is a three-level game teaching thermochemistry and Hess's Law. Level 1 covers fundamentals through 6 challenges: ΔH sign conventions, reaction reversal (flip ΔH sign), coefficient multiplication (multiply ΔH), and combining operations — all with interactive energy diagrams. Level 2 presents 6 realistic chemistry puzzles where students select, reverse, and multiply given equations to reach a target equation and sum ΔH values. Level 3 provides 6 calculation challenges using standard formation enthalpies (ΔHf°) with a reference table. The game features two custom visualization components: EnergyPathwayDiagram (cumulative staircase SVG) and StatePathComparison (path-independence demonstration with 3 real examples).

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Excellent scaffolding from ΔH sign conventions → manipulation rules → puzzle application → ΔHf° calculations. L1 interactive sliders let students reverse/multiply equations and see real-time energy diagram changes. L2 puzzle format (select → manipulate → combine → verify) forces complete Hess's Law reasoning. StatePathComparison demonstrates path-independence with 3 real examples (CO₂, H₂O, NH₃). Misconceptions addressed at each level. |
| D2. Graphic Design | 4/5 | EnergyPathwayDiagram shows cumulative staircase with green (correct) vs blue (in-progress) paths against dark grid background. Energy diagrams in L1 use blue bars (reactants), green bars (products), and red/blue arrows (exo/endo). Consistent color coding: red=exothermic, blue=endothermic, orange=target. **Issue:** 4 CSS `-tranwarm-` typos cause misaligned energy diagram labels and state comparison toggle positioning. |
| D3. Scientific Accuracy | 5/5 | All formation enthalpies match literature values exactly: H₂O(l) −285.8, CO₂(g) −393.5, CO(g) −110.5, CH₄(g) −74.8, NH₃(g) −46.1, NO(g) +90.3, SO₂(g) −296.8 kJ/mol. Elements correctly at 0 kJ/mol. Hess's Law logic verified: reverse → flip sign, multiply → multiply ΔH, combined operations correct. L3 ΔH°rxn formula (Σ products − Σ reactants) properly implemented. 29 tests validate all calculations including 2% tolerance checking. |
| D4. Physical/Spatial | 3/5 | Responsive with md: breakpoints. Max-width containers. Touch-friendly buttons. **Issues:** CSS typos break label positioning. Energy diagram SVGs lack role/aria-label attributes. Equation blocks in L2 use click handlers but no keyboard navigation. Red/blue ΔH distinction relies solely on color without icon supplement — accessibility concern for color-blind users. |
| D5. Game Design | 4/5 | L2 puzzle mechanic is engaging — selecting, reversing, and multiplying equations feels like solving a chemistry jigsaw. Scoring generous: 100 pts per challenge in L1/L2, 20 pts in L3. Hint costs 50% of points (100→50 in L1/L2, 20→10 in L3). Multiple attempts allowed without penalty beyond initial hint cost. Progress persisted via localStorage. **Issue:** Scoring scale inconsistent across levels (max 600 vs 500 vs 120). |
| D6. Age-Appropriate | 5/5 | Perfect for Year 2 (Brown Ch. 5). L1 is accessible — interactive sliders require no calculation. L2 puzzles use real chemistry contexts (Contact Process SO₃, thermite reaction, ethanol biofuel combustion). L3 ΔHf° calculations are algebraic but scaffolded with reference table and step-by-step workspace. Industrial examples connect classroom to real-world thermochemistry. |
| D7. Consistency | 4/5 | Uses shared components: LanguageSwitcher, ErrorBoundary, AchievementsPanel/Button, AchievementNotificationsContainer, FeedbackPanel, useGameI18n, useGameProgress, useAchievements. Progress persisted. **Issues:** Level 2 duplicates Equation interface instead of importing from challenges.ts. L3 challenge content hardcoded in Icelandic (not in i18n system). Missing Breadcrumbs, shared Header/Footer. |
| **Overall** | **4.3/5** | |

## Strengths

- **Interactive equation manipulation (L1):** Slider controls let students reverse and multiply equations in real-time while watching the energy diagram update. This makes abstract sign-flipping and coefficient-multiplication rules concrete and visual.
- **EnergyPathwayDiagram:** Cumulative staircase SVG showing how individual ΔH steps add up to the total. Green path for correct solution, blue for work-in-progress. Target line (dashed orange) shows goal ΔH. Animated stroke drawing makes the energy journey visible.
- **StatePathComparison:** Demonstrates path-independence — the core principle of Hess's Law — with 3 real examples (CO₂ formation via direct vs CO intermediate, H₂O formation vs phase change, NH₃ synthesis routes). Toggle overlays multiple paths to show they reach the same ΔH.
- **Real-world L2 puzzles:** 6 puzzles using authentic industrial/practical chemistry: CO formation, water phase transitions, ethanol biofuel combustion, NO₂ pollution chemistry, Contact Process (SO₃), and thermite reactions. Each includes a chemistry context paragraph.
- **Verified thermochemical data:** All 8+ formation enthalpies match standard reference values. 29 tests validate ΔH calculations, tolerance checking, equation coefficient handling (including fractions like ½), and sign conventions.
- **L3 step-by-step workspace:** Calculation challenges provide a reference table of ΔHf° values and a structured workspace. Students see the formula, plug in values, and verify. Includes both forward (calculate ΔH°rxn) and reverse (find unknown ΔHf°) problem types.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **4 CSS `-tranwarm-` typos causing misaligned labels** — Level1.tsx has 3 instances and StatePathComparison.tsx has 1 instance where `-tranwarm-y-1/2`, `-tranwarm-x-1/2`, or `tranwarm-x-5` should be `-translate-y-1/2`, `-translate-x-1/2`, or `translate-x-5`. Energy diagram axis labels and state comparison toggle are visually mispositioned. Locations:
   - Level1.tsx line 61: `-tranwarm-y-1/2`
   - Level1.tsx line 89: `-tranwarm-x-1/2`
   - Level1.tsx line 103: `tranwarm-x-5`
   - StatePathComparison.tsx line 236: `-tranwarm-x-1/2`

### Major (significant UX/pedagogical problems)

2. **L3 challenge content not internationalized** — Level 3 challenge titles, descriptions, and step-by-step content are hardcoded in Icelandic within the component files, not pulled from i18n.ts. English and Polish speakers cannot use L3 effectively.

3. **Energy diagrams lack accessibility** — SVG energy diagrams have no `role` or `aria-label` attributes. Red/blue ΔH distinction uses color only without icon or text supplement. Color-blind users cannot distinguish exothermic from endothermic in the diagrams.

4. **L2 equation blocks lack keyboard navigation** — Equation selection, reversal, and multiplier controls use mouse click handlers without corresponding keyboard event handlers. Tab navigation works for buttons but the equation manipulation workflow is mouse-centric.

### Minor (polish, consistency, nice-to-haves)

5. **Duplicated Equation interface** — Level2.tsx redefines the `Equation` interface instead of importing from `data/challenges.ts`. Both are identical but this violates DRY.

6. **Scoring scale inconsistent** — L1 max is 600 (6×100), L2 max is 500 (approximate), L3 max is 120 (6×20). Total possible ~1220 points. The different scales make cross-level comparison difficult.

7. **No integration tests for level components** — Only utility functions tested (29 tests for equation-math and hess-calculations). No tests for Level1/Level2/Level3 UI logic, scoring flow, or hint interactions.

8. **Build script path mismatch** — Same `mv` path error as other games.

## Recommendations

1. **Fix CSS typos** — Replace all 4 instances of `tranwarm` with `translate` in Level1.tsx and StatePathComparison.tsx.

2. **Internationalize L3 content** — Move all Level 3 challenge text to i18n.ts so English and Polish translations work throughout the game.

3. **Add accessibility to energy diagrams** — Add `role="img"` and `aria-label` to SVG energy diagrams. Add icon indicators (↓ for exothermic, ↑ for endothermic) alongside color coding for color-blind accessibility.

4. **Add keyboard navigation to L2** — Implement keyboard event handlers for equation selection, reversal toggle, and multiplier controls. Support Enter/Space for selection, arrow keys for multiplier adjustment.

5. **Normalize scoring** — Consider a consistent 0–100 scale across levels, or display percentage alongside raw points.

6. **Add integration tests** — Test L2 puzzle solving flow (equation selection → manipulation → verification) and L3 calculation validation with tolerance.
