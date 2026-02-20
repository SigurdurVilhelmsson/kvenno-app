# Game Review: Equilibrium Shifter (Year 3)

## Summary

Equilibrium Shifter (Jafnvægishliðrun) is a comprehensive Le Chatelier's Principle game with two game modes (learning and challenge) covering 30 real equilibrium systems across three difficulty levels. In learning mode, students explore equilibria by selecting stress types (concentration change, temperature change, pressure change, catalyst addition) and predicting shift direction (left, right, no shift). In challenge mode, random stresses are applied with a 20-second time limit per question. The game features three custom visualization components: ParticleEquilibrium (shared ParticleSimulation with dynamic particle counts), QKComparison (Q vs K relationship visualization), and animated equilibrium arrows with directional glow effects. 30 equilibrium systems include real industrial processes (Haber, Contact, Ostwald), biological applications (hemoglobin O₂ binding, blood buffers), and environmental chemistry (ozone, NO₂ pollution). The Le Chatelier logic engine (le-chatelier.ts, 274 lines) handles 9 stress types with correct shift calculations for all cases including edge cases.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | 9 stress types implemented with 100% chemical accuracy: concentration add/remove for reactants and products, temperature increase/decrease for endo/exothermic, pressure increase/decrease with mole counting, and catalyst (always no shift). 30 real equilibria spanning N₂O₄⇌2NO₂, Haber process, Contact process, hemoglobin binding, water autoionization. Tiered hints (topic→strategy→method→solution) provide scaffolded learning. QKComparison visualization explains shifts mechanistically. |
| D2. Graphic Design | 4/5 | ParticleEquilibrium shows dynamic equilibrium with animated particles. Equilibrium arrow (⇌) animates shift direction (scale, flip, shake). Molecule display with emoji-based representations and coefficient counts. Color-coded stress types and difficulty levels. Professional card styling with gradients. **Issues:** Both `.reactants-side.glowing` and `.products-side.glowing` use identical green styling (styles.css:70-80) — both sides glow the same, confusing which side is favored. CSS respects `prefers-reduced-motion`. |
| D3. Scientific Accuracy | 5/5 | Le Chatelier logic verified for all 9 stress types. Concentration: add reactant→right, add product→left, remove reactant→left, remove product→right. Temperature: endothermic (ΔH>0) + increase T→right, exothermic (ΔH<0) + increase T→left. Pressure: shifts toward fewer gas moles. Catalyst: always no shift. ΔH values verified: N₂O₄⇌2NO₂ (+58 kJ/mol ✓), Haber (-92 ✓), Contact (-198 ✓), CaCO₃ decomposition (+178 ✓). Gas mole counts correct for all 30 systems. 21 unit tests validate all scenarios. |
| D4. Physical/Spatial | 3/5 | Responsive with md: breakpoints, max-w-4xl container. Touch-friendly prediction buttons (48px+). Skip link present. High contrast mode toggle. Text size adjustment. ARIA label on ParticleSimulation. **Issues:** CSS `-tranwarm-y-1/2` typo on ParticleEquilibrium.tsx lines 73, 81 mispositions direction arrows. Prediction buttons use color-only differentiation (blue/yellow/green). Missing `:focus` styles on .predict-btn, .stress-btn, .mode-card. Prediction button contrast ratio ~3.8:1 (below WCAG AA 4.5:1). |
| D5. Game Design | 4/5 | Two complementary modes: learning (unlimited time, choose stresses, detailed feedback) and challenge (20s timer, random stresses, scoring). Scoring: 10/20/30 base points for beginner/intermediate/advanced + streak bonus (+5/correct, max +25) + time bonus (+5 if <5s). Achievement integration via shared hooks. Streak display with celebration. **Issues:** Scoring formula unclear — hintMultiplier applies inconsistently. Timer doesn't pause during explanation in challenge mode (App.tsx:94-117). |
| D6. Age-Appropriate | 5/5 | Le Chatelier's Principle matches Year 3 curriculum perfectly. Progressive difficulty: beginner (basic shifts), intermediate (industrial processes), advanced (complex equilibria). Real-world connections: Haber process (fertilizer), Contact process (H₂SO₄), hemoglobin (biology), ozone (environment). Proper Icelandic: jafnvægi, hvarfefni, afurð, hliðrun, varmalosandi, varmabindandi, hvati. |
| D7. Consistency | 5/5 | Uses 8 shared components: HintSystem, LanguageSwitcher, ErrorBoundary, AchievementsButton, AchievementsPanel, AchievementNotificationsContainer, ParticleSimulation, useAccessibility. Plus 5 shared hooks: useProgress, useAccessibility, useI18n, useGameI18n, useAchievements. Full 3-language i18n. Progress persisted via useProgress. Accessibility settings via useAccessibility. |
| **Overall** | **4.4/5** | |

## Strengths

- **Comprehensive Le Chatelier logic engine (274 lines):** Handles all 9 stress types with edge cases — equal gas moles (no pressure shift), no gas molecules (pressure irrelevant), catalyst (always no shift). Each shift returns direction plus detailed explanation. All calculations verified by 21 unit tests covering concentration, temperature, pressure scenarios and edge cases.
- **30 real equilibrium systems across 3 difficulty levels:** Beginner (10): N₂O₄⇌2NO₂, H₂+I₂⇌2HI, Fe³⁺+SCN⁻ (color change). Intermediate (12): Haber (N₂+3H₂⇌2NH₃), Contact (2SO₂+O₂⇌2SO₃), Ostwald (4NH₃+5O₂⇌4NO+6H₂O). Advanced (8): hemoglobin O₂ binding, blood buffer (CO₂+H₂O⇌H₂CO₃), water autoionization. All with verified ΔH values.
- **Two complementary game modes:** Learning mode allows unlimited time, student-selected stresses, and detailed mechanistic feedback — ideal for conceptual understanding. Challenge mode adds 20-second timer, random stresses, scoring, and streaks — ideal for fluency and automaticity.
- **ParticleEquilibrium visualization:** Shared ParticleSimulation component shows dynamic equilibrium with particle counts adjusting based on shift direction. Directional arrows and color-coded indicators show which side is favored. Physics presets (`realGas`) provide realistic particle behavior.
- **Accessibility features beyond most games:** Skip link (`<a href="#main-content">`), high contrast mode toggle, text size adjustment (small/medium/large), and language switching. These are unique among the reviewed games and demonstrate accessibility awareness.
- **QKComparison visualization:** Shows Q vs K relationship and explains WHY shifts occur — not just direction but mechanistic reasoning about reaction quotient exceeding or falling below equilibrium constant.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **CSS `-tranwarm-y-1/2` typo breaks arrow positioning** — ParticleEquilibrium.tsx lines 73, 81: Invalid class `-tranwarm-y-1/2` should be `-translate-y-1/2`. Direction indicator arrows (← →) on the particle simulation are not vertically centered. Same typo pattern as hess-law and ph-titration games.

### Major (significant UX/pedagogical problems)

2. **Both sides glow identically** — styles.css lines 70-80: `.reactants-side.glowing` and `.products-side.glowing` both use identical green gradient (`#86efac → #4ade80`). When equilibrium shifts right, both sides light up the same color. Should differentiate: green for favored side, red/orange for disfavored side.

3. **Challenge timer doesn't pause during explanation** — App.tsx lines 94-117: Timer continues decrementing when `showExplanation === true`. Students see timer running during feedback, creating confusion. Fix: add `&& !showExplanation` to timer condition.

4. **Prediction buttons lack focus styles and color-blind support** — styles.css lines 135-178: `.predict-btn` missing `:focus` styles for keyboard navigation. Left/right/none buttons use only color differentiation (blue/yellow/green) without directional icons. Contrast ratio ~3.8:1 on green button below WCAG AA 4.5:1 minimum.

### Minor (polish, consistency, nice-to-haves)

5. **HTML lang attribute not updated on language change** — App.tsx: `lang="is"` set in index.html but not updated when user switches to English or Polish. Screen readers continue speaking Icelandic.

6. **Hardcoded 20-second timer not configurable** — App.tsx line 154: Timer value hardcoded without constant definition. Teachers cannot adjust time per question.

7. **Missing test coverage for visual components** — Only le-chatelier.ts tested (21 tests). ParticleEquilibrium and QKComparison have no unit tests.

## Recommendations

1. **Fix CSS typo** — Replace `-tranwarm-y-1/2` with `-translate-y-1/2` on ParticleEquilibrium.tsx lines 73 and 81.
2. **Differentiate glow colors** — Use green for favored side and red/neutral for disfavored side in styles.css.
3. **Pause timer during explanation** — Add `&& !showExplanation` to challenge mode timer condition.
4. **Add focus styles and directional icons** — Add `:focus` outline to all interactive buttons. Add ← → arrows alongside color on prediction buttons. Improve green button contrast ratio.
5. **Update document.documentElement.lang** — When language changes, update HTML lang attribute for screen reader accuracy.
