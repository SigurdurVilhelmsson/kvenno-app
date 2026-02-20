# Game Review: Dimensional Analysis (Year 1)

## Summary

Dimensional Analysis (Einingagreining) is a three-level game teaching unit conversion methodology. Level 1 uses visual, interactive challenges (equivalence balancing, factor building, unit cancellation, factor orientation, chain conversions) without requiring calculations. Level 2 introduces scaffolded problems with a prediction phase (predict the resulting unit before solving). Level 3 features 18 advanced challenges including reverse engineering, error analysis, efficiency optimization, and real-world applications with composite scoring. The game covers mass, volume, length, and time conversions with real-world chemistry contexts (drug dosing, solution prep, bacterial growth).

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 4/5 | Strong constructivism (visual→predictive→computational). Prediction phase in L2 is pedagogically excellent. Misconception targeting in L3 error-analysis challenges. Missing: hints in L2 (gap in scaffolding), spaced repetition. |
| D2. Graphic Design | 4/5 | Color-coded unit blocks (blue=numerator, green=denominator, orange=conversion factors). Balance scale visualization in L1 is clever. Confetti on success, unit cancellation strikethrough animation. SVG connecting lines between matching units. |
| D3. Scientific Accuracy | 4/5 | Conversion factors correct (1 kg = 1000 g, 1 L = 1000 mL, etc.). Icelandic abbreviations correct (klst, mín). Level 3 real-world calculations verified (speed of light, Cu density). **Issue:** L3-15 bacterial growth is exponential, not dimensional analysis; L3-16 temperature conversion uses addition, not unit ratios. |
| D4. Physical/Spatial | 4/5 | Responsive with sm: breakpoints. Flex wrapping on factor buttons prevents overflow. Touch targets properly sized (44-48px). **Critical: No progress persistence** — browser refresh loses all work (uses React state only, no localStorage). |
| D5. Game Design | 3/5 | Good variety in L3 challenge types (6 types × 3 each). Composite scoring (40% answer, 30% method, 20% explanation, 10% efficiency) rewards understanding. **Issues:** L1 mastery logic bug (requires 8 correct but only 6 challenges exist); L2 unit prediction logic flawed for compound units (m/s, km/h); sig fig scoring double-counts penalty. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 1 (Brown Ch. 1). L1 is concrete/visual (no math). L2 bridges to single-step conversions with rounding. L3 applies to real chemistry contexts (medication, density, solution concentration). Difficulty curve within each level is well-calibrated. |
| D7. Consistency | 4/5 | Uses shared components: HintSystem (L1 & L3), FeedbackPanel, AchievementsPanel/Button, LanguageSwitcher, ErrorBoundary, useGameI18n. Has skip-to-content link. Axe accessibility audit passes. **Missing:** Breadcrumbs, shared Header/Footer. Progress not persisted via useGameProgress (uses React state only). |
| **Overall** | **4.0/5** | |

## Strengths

- **Prediction phase in L2:** Students must predict the resulting unit BEFORE solving — an excellent metacognitive exercise that forces conceptual understanding
- **Error analysis challenges (L3):** Students identify and correct mistakes in worked examples — directly addresses common misconceptions by making them explicit
- **Visual unit cancellation:** Animated strikethrough and SVG connecting lines make the abstract process of unit cancellation concrete and visible
- **Real-world chemistry contexts:** Drug dosing ("lyfjagjöf"), density calculations, bacterial growth, solution preparation — authentic applications
- **Comprehensive L3 challenge variety:** 6 challenge types (reverse, error analysis, efficiency, synthesis, real-world, derivation) provide rich assessment
- **Accessibility foundation:** Skip-to-content link, semantic HTML, axe audit passing, 5 dedicated accessibility tests
- **64 unit tests** covering scoring, mastery checks, unit parsing, sig figs, and achievements

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **Level 1 mastery logic bug** — `mastery.ts` requires `questionsCorrect >= 8` but Level1Conceptual only has 6 challenges. Internal mastery in the component uses `>= 5` (which works for 6 challenges), but the mastery check module is inconsistent. Could cause progression issues.

2. **Level 2 unit prediction logic broken for compound units** — The rationale generator always assumes the numerator unit survives cancellation, which is incorrect for compound units like m/s → km/h. Predictions for compound-unit problems will be marked wrong even when correct.

3. **No progress persistence** — All progress is in React state only. Refreshing the page resets everything. The game does NOT use `useGameProgress` hook or localStorage. Students can lose an entire session of work.

### Major (significant UX/pedagogical problems)

4. **No hints in Level 2** — L1 has tiered hints, L3 has hints, but L2 has none. Students who get stuck on multi-step conversions have no scaffolding support. This is a pedagogical gap between the well-scaffolded L1 and the hint-available L3.

5. **Significant figures double-counted** — In L3, the answer score is weighted 70% answer + 30% sig fig, then this combined score is fed into `calculateCompositeScore()` where it gets further weighted. Sig fig errors are penalized twice.

6. **L1 questions.ts unused content** — 10 conceptual questions are defined in `questions.ts` but Level1Conceptual only uses 6 hardcoded challenges. 4 questions (including conceptual reasoning about WHY units work) go unused.

7. **L3 challenges outside dimensional analysis scope** — L3-15 (bacterial growth) involves exponential doubling, and L3-16 (temperature conversion) uses additive conversion — neither is dimensional analysis. Could confuse students about the methodology's boundaries.

### Minor (polish, consistency, nice-to-haves)

8. **Mastery gate messaging missing** — When L2 is locked, the button is disabled but there's no tooltip or message explaining what's needed ("Complete 5/6 in Level 1 to unlock").

9. **Hint penalty harsh (-15%)** — May discourage help-seeking on harder problems. Consider a gentler reduction or making first hint free.

10. **Composite score weightings not shown to students** — Students see a final score but don't know the 40/30/20/10 breakdown. Transparency would help learning.

11. **Build script path mismatch** — Same `mv` path error as other games.

## Recommendations

1. **Add progress persistence** — Integrate `useGameProgress` hook with localStorage. This is the most impactful fix for classroom use.

2. **Fix L1 mastery logic** — Align the mastery check in `mastery.ts` with the actual 6-challenge structure in Level1Conceptual.

3. **Fix L2 compound unit prediction** — Implement proper unit cancellation tracking that handles numerator/denominator units separately.

4. **Add hints to Level 2** — Use the shared HintSystem component with topic→strategy→method→solution tiers.

5. **Fix sig fig scoring** — Apply sig fig weighting only once, either in the answer component or in the composite calculation, not both.

6. **Remove or reclassify non-DA challenges** — Move bacterial growth and temperature conversion to a "bonus" section or remove them.
