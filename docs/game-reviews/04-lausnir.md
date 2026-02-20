# Game Review: Lausnir (Year 1)

## Summary

Lausnir ("Solutions") is a three-level game teaching solution chemistry (molarity, dilution, mixing) inspired by PhET Interactive Simulations. Level 1 uses visual particle simulation — students adjust molecule count and volume sliders to match target concentrations, with a prediction phase before each challenge. Level 2 features multiple-choice reasoning questions about concentration changes plus an interactive temperature-solubility explorer with real solubility curve data. Level 3 provides calculation practice (M₁V₁=M₂V₂, M=n/V, mixing formulas) with customizable difficulty, timer mode, and step-by-step solutions. The game covers 7 chemicals with accurate molar masses.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Exceptional constructivism — PhET-inspired concept-first approach with prediction phase. Misconceptions explicitly addressed ("sameindir hverfa ekki við útþynningu"). Dual coding excellent (particles + numbers + colors). Temperature-solubility explorer with real data teaches Le Chatelier's principle. Multiple problem types in L3 (dilution, molarity, mass-based, mixing). |
| D2. Graphic Design | 4/5 | ParticleBeaker with Brownian motion and meniscus detail is visually impressive. BeakerVisualization shows before/after states with animated pour/mix/dissolve transitions. ConcentrationIndicator provides real-time color feedback (red→yellow→green). Temperature slider with ❄️→🔥 gradient. Clean color-coded levels (blue/green/purple). |
| D3. Scientific Accuracy | 5/5 | Core formulas correct: M=n/V, M₁V₁=M₂V₂, mixing formula. Molar masses accurate (NaCl 58.5, H₂SO₄ 98, glucose 180). Solubility curves use real data (KNO₃: 13→246 g/100g, 0-100°C). Gas solubility correctly shows inverse temperature relationship. Chemistry facts verified ("0.15 M NaCl isotonic", "1 M glucose = 180 g/L"). |
| D4. Physical/Spatial | 4/5 | Responsive layouts with max-w-4xl container. Formula card repositions from sidebar (desktop) to inline (mobile). Touch-friendly buttons. **One content error:** L1 Challenge 1 has `conceptMessage: 'pH = pKa...'` — buffer equation has nothing to do with concentration concepts. Progress persisted via localStorage (unlike Dimensional Analysis). |
| D5. Game Design | 4/5 | Three game modes in L3 (practice vs competition, timer optional). Difficulty selection (easy/medium/hard) provides appropriate challenge. Streak mechanics with fire emoji. Hint system with point penalties (3 tiers). Step-by-step solutions shown after incorrect attempts. Mastery gates at 50% (L1) and 35% (L2). L2 threshold possibly too low. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 1 (Brown Ch. 4). L1 is concrete/visual (no formulas needed). L2 reasoning questions bridge intuition to theory. L3 calculations are algebraic but scaffolded with formula cards. Real-world contexts: blood chemistry, medication, cooking sugar solutions. Appropriate for students who haven't yet learned algebra-heavy approaches. |
| D7. Consistency | 4/5 | Uses shared components: LanguageSwitcher, ErrorBoundary, FeedbackPanel, AchievementsPanel/Button, AchievementNotificationsContainer, ParticleSimulation, useAchievements, useGameI18n. Progress persisted. **Missing:** Breadcrumbs, shared Header/Footer. Achievement strings hardcoded in Icelandic (not i18n'd). |
| **Overall** | **4.4/5** | |

## Strengths

- **PhET-inspired concept-first design:** Students manipulate visual sliders (molecule count, volume) to build intuition about concentration = solute/volume BEFORE encountering formulas. This is research-backed pedagogy at its finest.
- **Prediction phase:** Each L1 challenge asks "What will happen?" before students interact — forces metacognitive engagement and reveals misconceptions before they calcify.
- **Temperature-solubility explorer:** Interactive curve graph with real data for 8 compounds (KNO₃, NaCl, CaCl₂, sugar, Li₂SO₄, O₂, CO₂). Students can explore how temperature affects solubility for different compound types. Uses emoji-labeled compound buttons (🧂🧪🍬).
- **ParticleBeaker visualization:** Animated particles with Brownian motion, liquid fill percentage, meniscus detail — makes the abstract concept of "molecules per volume" tangible.
- **Contextual feedback based on error magnitude:** >50% off gets "wrong formula?", 20-50% gets "check mL→L conversion", 5-20% gets "rounding error?", <5% gets "close but outside tolerance" — systematically addresses root causes.
- **Multiple L3 modes:** Practice (no penalties) vs. Competition (scoring), optional timer, difficulty selection — students can customize their challenge level.
- **Step-by-step solutions:** StepBySolution component shows algebraic steps for all 5 problem types when students get wrong answers or request help.
- **Verified chemistry facts:** "Blóð er u.þ.b. 0.15 M NaCl lausn", "1 mól = 6.022 × 10²³ sameindir" — connects abstract concepts to real-world chemistry.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **Wrong concept message in L1 Challenge 1** — `conceptMessage: 'pH = pKa þegar [Base] = [Acid]'` (Henderson-Hasselbalch equation). This buffer chemistry concept has nothing to do with the challenge, which is about dilution and concentration. Should be something like "Styrkur × rúmmál = heildarmagn sameinda (fasti)".

### Major (significant UX/pedagogical problems)

2. **L2 mastery threshold too low (35%)** — Students can progress to L3 (calculation problems) with only 35% accuracy on reasoning questions. This means students with poor conceptual understanding can reach calculation level, undermining the pedagogical progression. Should be at least 60-70%.

3. **No hints in Level 2** — L1 has hints, L3 has hints, but L2 reasoning questions have no hint support. Struggling students are stuck with pure trial-and-error.

4. **Achievement strings not i18n'd** — Level 3 achievement text ("Útþynningar sérfræðingur!", "Fullkomin blöndun!") is hardcoded in Icelandic in `scoring.ts`. Displays in Icelandic regardless of language setting.

### Minor (polish, consistency, nice-to-haves)

5. **Limited chemical database** — Only 7 chemicals with molar masses. L3 hard problems could benefit from more variety (KOH, CaCO₃, citric acid, etc.).

6. **Chemistry facts pool too small** — Only 7 facts that rotate. Could add 10+ more concentration-related facts.

7. **Missing ARIA labels on BeakerVisualization** — Some states lack accessible descriptions despite `role="img"`.

8. **Problem IDs use Math.random()** — Not GUID-safe; should use `crypto.randomUUID()` for uniqueness.

9. **Build script path mismatch** — Same `mv` path error as other games.

## Recommendations

1. **Fix L1 Challenge 1 concept message** — Replace buffer equation with concentration-appropriate concept (e.g., "Styrkur = sameindir ÷ rúmmál").

2. **Raise L2 mastery threshold** — Increase from 35% to at least 60-70%. Students should demonstrate conceptual reasoning proficiency before advancing to calculations.

3. **Add hints to Level 2** — At minimum, provide conceptual hints for reasoning questions ("Think about the ratio of molecules to volume").

4. **Move achievement strings to i18n** — Extract all achievement text to `i18n.ts` so it respects the language setting.

5. **Expand chemical database** — Add 8-10 more compounds with molar masses for more L3 variety.

6. **Add spaced repetition** — Track which problem types students struggle with and recommend focused practice.
