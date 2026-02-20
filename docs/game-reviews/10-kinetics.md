# Game Review: Kinetics (Year 2)

## Summary

Kinetics (Hvarfhraði) is a three-level game teaching chemical kinetics through interactive simulations and progressive challenges. Level 1 covers fundamental rate concepts across 6 challenges: reaction rate definition, rate order, temperature effects, catalysts, surface area, and collision theory — each paired with interactive visualizations (Maxwell-Boltzmann distribution, collision simulation, catalyst energy diagram). Level 2 presents 6 experimental datasets where students determine reaction order from concentration/rate data and calculate rate constants. Level 3 introduces 6 reaction mechanism problems requiring identification of intermediates, rate-determining steps, and derivation of rate laws from elementary steps. The game features four custom visualizations: MaxwellBoltzmann (SVG energy distribution with 500-step trapezoidal integration), CollisionDemo (real-time particle animation via shared ParticleSimulation), CatalystEffectDemo (dual energy pathway comparison), and ConcentrationTimeGraph (0th/1st/2nd order decay curves with half-life markers).

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Exceptional scaffolding from rate definition → experimental data analysis → mechanism interpretation. 6 explicit misconceptions corrected (e.g., "temperature does NOT change Ea", "catalyst lowers Ea via different pathway"). Interactive sliders on Maxwell-Boltzmann and CatalystEffectDemo let students see real-time effects. Collision theory demo shows energy + orientation requirements. Real chemistry examples: Fe burning, enzyme kinetics, ozone chemistry, BrO₃⁻/Br⁻ kinetics. |
| D2. Graphic Design | 5/5 | Four high-quality SVG/canvas visualizations: Maxwell-Boltzmann with green shaded area above Ea, collision simulation with animated particles, catalyst energy diagrams with dual Gaussian pathways, and concentration-time graphs with half-life markers. Consistent teal/cyan Year 2 theme. Color-coded levels (blue L1, green L2, purple L3). Professional card styling (rounded-xl, shadow-2xl). CSS respects `prefers-reduced-motion`. |
| D3. Scientific Accuracy | 5/5 | All formulas correct: Rate = Δ[A]/Δt, Rate = k[A]^m[B]^n, k = Ae^(-Ea/RT), R = 8.314×10⁻³ kJ/(mol·K). Half-life formulas for all three orders verified. Level 2 experimental data produces correct orders and rate constants (spot-checked 3/6 datasets). Level 3 mechanisms use real chemistry (NO₂+F₂, O₃+O, BrO₃⁻+Br⁻, H₂O₂ catalyzed decomposition). 8 unit tests validate scoring logic. |
| D4. Physical/Spatial | 4/5 | Responsive with md: breakpoints, max-w-3xl containers. SVGs use viewBox with preserveAspectRatio. Touch-friendly buttons (48px+). Comprehensive ARIA labels on all 4 visualizations. Sliders keyboard-accessible. **Issues:** Particle collision colors not shape-differentiated for color-blind users. No aria-pressed on toggle buttons. |
| D5. Game Design | 4/5 | Simple, fair scoring: 20 points per correct, 10 with hint. Tiered hints (topic → strategy → method → solution) — excellent pedagogical structure. Achievement system via shared hooks. Progress persisted to localStorage with best-score tracking. **Issue:** Missing orderB validation in Level 2 (App.tsx line 220) — can submit incomplete multi-reactant answers. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 2 (Brown Ch. 14). Progressive: conceptual → experimental analysis → mechanism synthesis. Real-world examples (iron combustion, enzyme saturation, atmospheric ozone, H₂O₂ decomposition). Proper Icelandic vocabulary: hvarfhraði, röð hvörfunar, virkjunarorka, hvarfgangsháttur. 18 challenges ≈ 20-30 min gameplay. |
| D7. Consistency | 5/5 | Uses 8 shared components: LanguageSwitcher, ErrorBoundary, AchievementsPanel/Button, AchievementNotificationsContainer, FeedbackPanel, ParticleSimulation, useResponsiveSize. Full 3-language i18n (is/en/pl). Progress persisted via useGameProgress. All interactions follow shared patterns. |
| **Overall** | **4.7/5** | |

## Strengths

- **Four interactive visualizations:** Maxwell-Boltzmann distribution with real-time temperature/Ea control and 500-step numerical integration showing fraction above Ea. Collision simulation with animated particles counting successful reactions. CatalystEffectDemo comparing catalyzed vs uncatalyzed pathways with speedup factor (e^(ΔEa/RT) calculation). ConcentrationTimeGraph with order selector, half-life markers, and comparison mode across orders.
- **Exceptional misconception handling:** 6 explicit corrections embedded in Level 1 challenges (Level1.tsx lines 13-20): confusing Δ[A] with rate, order confusion, "temperature changes Ea" myth, catalyst heating myth, surface area mechanism, collision orientation requirement.
- **Tiered hint system:** Four progressive tiers (topic, strategy, method, solution) provide scaffolded help. Example Q1: concept → approach → formula → full worked solution (Rate = (1.0-0.5)/10 = 0.05 M/s).
- **Real experimental data in Level 2:** 6 datasets using authentic kinetics systems (BrO₃⁻+Br⁻, NO₂ decomposition, H₂+NO) where students determine order from concentration ratios and calculate k with proper units.
- **Level 3 mechanism analysis:** 6 multi-step mechanisms requiring identification of intermediates, rate-determining steps, and derivation of observable rate laws. Includes equilibrium pre-steps and catalyst identification.
- **Clean, performant codebase:** ~2,885 lines. TypeScript strict types throughout. Proper useMemo for expensive calculations. 8 unit tests for scoring. CSS respects prefers-reduced-motion.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

None.

### Major (significant UX/pedagogical problems)

1. **Missing orderB validation in Level 2** — Level2.tsx line 220: disabled check only validates `orderA === null` but not `orderB === null`. For multi-reactant challenges (1, 4, 5, 6), students can submit without selecting order for reactant B. Fix: add `|| (hasSecondReactant && orderB === null)` to disabled condition.

2. **Polish diacritics missing in i18n.ts** — Lines 119-171: Polish translations omit required diacritics. "Szybkosc" should be "Szybkość", "Rozklad" should be "Rozkład", "Czestotliwosc" should be "Częstotliwość". Polish-speaking users see garbled terms.

### Minor (polish, consistency, nice-to-haves)

3. **Particle colors not shape-differentiated** — CollisionDemo.tsx: Particles A (orange), B (blue), AB (green) differ only by color. Add shape/pattern differentiation (e.g., hollow vs filled circles) for color-blind accessibility.

4. **ConcentrationTimeGraph edge case** — ConcentrationTimeGraph.tsx lines 115-118: No zero-guard on `calculateHalfLife()` return value. If t_half were 0, `Math.min(100, t_half * 5)` would produce maxTime=0. Practically safe but fragile.

5. **No integration tests for level components** — Only utility functions tested (8 tests for kinetics-scoring). No tests for Level1/Level2/Level3 UI logic, scoring flow, or hint interactions.

## Recommendations

1. **Add orderB validation** — Fix Level2.tsx line 220 disabled condition to require both order selections for multi-reactant challenges.
2. **Fix Polish diacritics** — Have a Polish speaker review all translations in i18n.ts lines 119-171.
3. **Add shape differentiation to particles** — Use hollow vs filled circles or different sizes for A, B, AB particles alongside color coding.
4. **Add integration tests** — Test Level 2 data interpretation flow (order selection → k calculation → verification) and Level 3 mechanism analysis.
