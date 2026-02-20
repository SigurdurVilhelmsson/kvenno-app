# Game Review: Thermodynamics Predictor (Year 3)

## Summary

Thermodynamics Predictor (Varmafræði Spámaður) is a comprehensive Gibbs free energy game with 30 problems across three difficulty levels, teaching the ΔG = ΔH − TΔS relationship and spontaneity prediction. The game offers two modes: learning (unlimited time, real-time formula display, interactive temperature slider, detailed step-by-step solutions) and challenge (90-second time limit, streak bonuses). Each problem requires two answers: calculate ΔG at a given temperature AND predict spontaneity (spontaneous/equilibrium/non-spontaneous). The game features two custom visualizations: an EntropyVisualization component (ParticleSimulation with chaotic vs ordered particles representing high/low entropy) and a ΔG vs Temperature graph (shared InteractiveGraph showing linear ΔG(T) relationship with colored spontaneity regions and crossover temperature). 30 problems cover real-world thermodynamics: combustion, phase changes, Haber process, photosynthesis, ATP hydrolysis, protein unfolding, and electrochemistry.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Excellent dual-answer format: students must calculate ΔG AND predict spontaneity — addresses the common misconception "I calculated it but don't understand what it means." Interactive temperature slider enables discovery learning (what-if exploration). Real-time formula display shows how ΔG changes with T. 4-step solutions with explicit unit conversion (J→kJ for ΔS). Crossover temperature explanation for scenarios 3 & 4 (ΔH and ΔS same sign). All 4 thermodynamic scenarios covered. |
| D2. Graphic Design | 4/5 | EntropyVisualization uses ParticleSimulation: high entropy = chaotic fast particles (speedMultiplier 1.2, green), low entropy = ordered slow particles (speedMultiplier 0.3, blue, friction 0.02). ΔG vs T graph via InteractiveGraph shows colored spontaneity regions (green=spontaneous, red=non-spontaneous), crossover temperature vertical line, and current T marker. Clean card-based UI. **Issue:** CSS variables (--exothermic, --endothermic) used in inline styles without fallback colors (App.tsx:510, 520). |
| D3. Scientific Accuracy | 5/5 | ΔG = ΔH − TΔS correctly implemented with proper unit conversion (ΔS J/(mol·K) → kJ/(mol·K) by /1000). All 4 scenarios verified: (1) ΔH<0, ΔS>0 → always spontaneous; (2) ΔH>0, ΔS<0 → never spontaneous; (3) ΔH<0, ΔS<0 → low-T spontaneous; (4) ΔH>0, ΔS>0 → high-T spontaneous. Thermodynamic data verified: Haber process ΔH=−92 kJ/mol ✓ (exact match), methane combustion ΔH=−802 ✓. 37 total tests (21 calculation + 16 data integrity) validate all formulas and problem data. |
| D4. Physical/Spatial | 3/5 | Responsive with lg:grid-cols-2 (1-col mobile). Input type="range" keyboard accessible. ARIA labels on graph and entropy visualization. Semantic HTML with proper label/input associations. Color + icons (✓, ✗, ⚖️) — never color-only. **Issues:** `focus:outline-hidden` invalid Tailwind (App.tsx:635). Spontaneity buttons in grid-cols-3 gap-2 produce ~28px wide targets on mobile (below 44px minimum). CSS variable inline styles lack fallback colors. |
| D5. Game Design | 4/5 | Learning mode: unlimited time, temperature slider for exploration, real-time ΔG display, detailed 4-step solutions. Challenge mode: 90-second timer (red at <20s), streak bonuses (100 + 10×streak), auto-show solution on timeout. Achievement system tracks milestones every 5 problems. High score and best streak persisted. **Issues:** ΔG tolerance ±5 kJ/mol is generous (could accept significantly wrong answers). No tutorial or onboarding for first-time players. |
| D6. Age-Appropriate | 5/5 | ΔG = ΔH − TΔS matches Year 3 curriculum perfectly. Three difficulty tiers: beginner (simple reactions, 298K), intermediate (industrial processes at 500-1200K, Haber/Contact), advanced (open-ended tasks: "Calculate K at 298K", cross-disciplinary links to electrochemistry and biochemistry). Real-world relevance: ATP hydrolysis, protein denaturation, battery chemistry, photosynthesis. Proper Icelandic: Gibbs frjálsa orka, sjálfviljugt, óreiða, umbreytingarhitastig. |
| D7. Consistency | 5/5 | Uses 8 shared components: InteractiveGraph, LanguageSwitcher, ErrorBoundary, AchievementsButton, AchievementsPanel, AchievementNotificationsContainer, ParticleSimulation (EntropyVisualization), useGameI18n, useAchievements. Full 3-language i18n (194 lines). localStorage progress persistence with auto-save. Correct design system usage: kvenno-orange, warm palette, font-heading class. |
| **Overall** | **4.4/5** | |

## Strengths

- **Dual-answer format requiring calculation AND interpretation:** Students must calculate ΔG numerically AND select spontaneity classification (spontaneous/equilibrium/non-spontaneous). Separate feedback for each — students can be "right on calculation but wrong on interpretation" or vice versa. This directly addresses the most common student error: computing without understanding.
- **Interactive temperature exploration (learning mode):** Temperature slider (100-1500K range) with real-time ΔG display. Students can manipulate temperature to discover crossover points where spontaneity changes. ΔG vs T graph updates dynamically showing current position relative to ΔG=0 line. Enables discovery learning alongside structured problem solving.
- **ΔG vs Temperature graph with spontaneity regions:** Shared InteractiveGraph shows linear ΔG(T) relationship with colored regions (green=spontaneous, red=non-spontaneous), crossover temperature marked as vertical line at ΔG=0. Current temperature marked dynamically. Scenario guide cards show all 4 thermodynamic scenarios at a glance.
- **EntropyVisualization via ParticleSimulation:** High entropy shown as chaotic fast particles (speedMultiplier 1.2, no friction, green) vs low entropy as ordered slow particles (speedMultiplier 0.3, friction 0.02, blue). Provides concrete visual for abstract entropy concept. ARIA-labeled for accessibility.
- **Comprehensive problem bank with real-world chemistry:** 30 problems: beginner (10) — combustion, phase changes, decomposition; intermediate (12) — Haber process, Contact process, steelmaking, photosynthesis; advanced (8) — ATP hydrolysis, protein unfolding, electrochemistry (Zn-Cu). Bloom's taxonomy progression from knowledge→application→analysis.
- **Robust test coverage (37 tests):** thermo-calculations.test.ts (21 tests) validates ΔG calculation, spontaneity classification, and edge cases (zero entropy, equilibrium boundary). data-integrity.test.ts (16 tests) validates all 30 problems have required fields, correct scenario classification, and valid difficulty labels. Unique IDs verified.
- **4-step worked solutions with explicit unit conversion:** Each solution shows: (1) formula ΔG° = ΔH° − TΔS°, (2) unit conversion ΔS from J→kJ ("126 J/(mol·K) × (1 kJ/1000 J) = 0.126 kJ/(mol·K)"), (3) substitution with numbers, (4) interpretation with crossover temperature explanation for scenarios 3/4.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

None.

### Major (significant UX/pedagogical problems)

1. **Invalid Tailwind class `focus:outline-hidden`** — App.tsx line 635: ΔG number input uses `focus:outline-hidden` instead of valid `focus:outline-none`. Focus ring behavior undefined, breaking keyboard focus visibility (WCAG 2.4.7). Same issue as gas-law-challenge.

2. **Spontaneity buttons too small on mobile** — App.tsx lines 644-675: Three buttons in `grid grid-cols-3 gap-2` create ~28px wide targets on mobile, far below 44px minimum. Each button ("✓ Sjálfviljugt", "⚖️ Jafnvægi", "✗ Ekki sjálfviljugt") is unusable on phones. Fix: `grid-cols-1 lg:grid-cols-3` for stacked layout on mobile.

3. **CSS variable inline styles without fallback** — App.tsx lines 510, 520: `style={{color: 'var(--exothermic)'}}` used without fallback colors. If CSS variables not defined or browser doesn't support them, text color disappears. Fix: use Tailwind classes or provide fallback: `var(--exothermic, #ef4444)`.

### Minor (polish, consistency, nice-to-haves)

4. **ΔG tolerance ±5 kJ/mol is generous** — App.tsx line 137: `deltaGDiff <= 5` accepts answers within ±5 kJ/mol. For ΔG = -50, answers from -55 to -45 all pass. Consider ±2-3 for harder difficulties.

5. **No tutorial or onboarding** — Game starts at menu with no guided walkthrough. First-time players may be overwhelmed by mode selection and problem format. Consider adding optional "How to Play" modal.

6. **No skip links or keyboard navigation documentation** — Despite good ARIA labels on visualizations, no skip-to-content link or keyboard shortcut guide.

7. **Equilibrium classification uses |ΔG| < 1 kJ/mol threshold** — thermo-calculations.ts line 23: `Math.abs(deltaG) < 1` defines equilibrium. While practically reasonable, students may think exact ΔG=0 is required. Solution section clarifies with inequality signs.

## Recommendations

1. **Fix Tailwind class** — Replace `focus:outline-hidden` with `focus:outline-none` on App.tsx line 635.
2. **Fix mobile button layout** — Change spontaneity buttons from `grid-cols-3` to `grid-cols-1 lg:grid-cols-3` so they stack vertically on mobile.
3. **Add CSS variable fallbacks** — Change inline styles to include fallback: `color: var(--exothermic, #ef4444)` or switch to Tailwind conditional classes.
4. **Tighten ΔG tolerance for harder levels** — Use ±2-3 kJ/mol for intermediate/advanced problems while keeping ±5 for beginner.
5. **Add onboarding modal** — Show optional "How to Play" walkthrough on first visit explaining the dual-answer format and temperature slider.
