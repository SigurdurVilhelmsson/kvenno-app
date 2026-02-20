# Game Review: Takmarkandi (Year 1)

## Summary

Takmarkandi ("Limiting Reagent") is a three-level game teaching stoichiometry and limiting reagent identification. Level 1 uses visual molecule representations with 6 challenge types (identify what runs out, count reaction times, compare ratios, calculate products, calculate excess). Level 2 offers guided step-by-step practice in two modes: Molecules (5 steps) and Grams & Moles (7 steps with molar mass conversions). Level 3 is a customizable mastery challenge with difficulty selection (easy/medium/hard), unit mode (molecules/grams), and optional timer. The game covers 20 balanced chemical reactions across 3 difficulty tiers using 44 compounds with accurate molar masses.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 4/5 | Excellent constructivism — visual molecule counting builds intuition before calculation. Strong misconception targeting ("limiting reagent is NOT always the smaller amount"). Two L2 modes (molecules vs grams) serve different learning paths. HintSystem provides 4-tier scaffolding. **Issue:** Multi-product reactions broken in L2/L3; difficulty gap between L2 (step-guided) and L3 (simultaneous answers). |
| D2. Graphic Design | 4/5 | Color-coded molecules (distinct per element). ReactionAnimation component visualizes reactions with molecular motion. Molecule count display gracefully limits to 8 with "+N" overflow. Level cards color-coded (blue/yellow/red). Progress indicators throughout. **Issue:** CSS typo in ReactionAnimation (`-tranwarm-x-1/2` instead of `-translate-x-1/2`). |
| D3. Scientific Accuracy | 4/5 | All 20 reactions properly balanced (verified). Molar masses accurate for 44 compounds (H₂ 2.0, Fe₂O₃ 159.7, Al₂O₃ 102.0). Stoichiometric logic correct: limiting = min(count÷coeff). Real reactions (Haber process, iron oxidation, pyrite oxidation, combustion). **Issue:** Multi-product reactions (CH₄+O₂, FeS₂+O₂) only calculate first product in L2/L3 — ignores second product. |
| D4. Physical/Spatial | 4/5 | Responsive grid layouts with mobile stacking. Molecule display caps at 8 with overflow text. Touch-friendly buttons. Animation area uses percentage-based positioning. Progress persisted via localStorage. **Issue:** No ARIA labels on interactive elements; no keyboard navigation; equation uses HTML entities without alt text. |
| D5. Game Design | 4/5 | L3 customization (difficulty + units + timer) provides replayability. Streak bonuses at 3, 5, and 10 consecutive correct. Speed bonuses when timer active. Best score tracking. L1→L2 mastery gate at 75%, L2→L3 requires 6 error-free problems. **Issue:** L3 gram mode always uses 0.5× mole multiplier (not randomized); gap between L2's step scaffolding and L3's simultaneous input. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 1 (Brown Ch. 3). L1 is visual/concrete — counting molecules requires no algebra. L2 Molecules mode extends to ratios. L2 Grams mode introduces the gram→mole→ratio→mole→gram chain. L3 applies full stoichiometric calculations. Reactions range from simple (2H₂+O₂) to complex (4FeS₂+11O₂). |
| D7. Consistency | 4/5 | Uses shared components: HintSystem (4-tier), FeedbackPanel, AchievementsPanel/Button, AchievementNotificationsContainer, LanguageSwitcher, ErrorBoundary, useAchievements, useGameI18n. Progress persisted. **Missing:** Breadcrumbs, shared Header/Footer. ReactionAnimation doesn't use shared animation utilities. |
| **Overall** | **4.1/5** | |

## Strengths

- **Two L2 modes (Molecules vs Grams):** Students can practice stoichiometry using molecule counts first, then graduate to gram-based calculations with molar mass conversions. This dual-mode approach serves different skill levels within the same class.
- **20 authentic chemical reactions:** Range from simple (Mg + O₂ → MgO) to complex industrial processes (4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂). All properly balanced.
- **Misconception-targeted hints:** Each of 6 L1 challenge types has 4 tiers of hints addressing specific misconceptions (e.g., "deila með stuðlinum, ekki margfalda" — divide by coefficient, don't multiply). The hints build from topic to worked example.
- **ReactionAnimation component:** Visualizes molecules approaching, colliding, and forming products with animated motion — makes the abstract stoichiometric process concrete.
- **L3 customization:** Students choose difficulty, unit mode, and timer — promotes autonomy and appropriate challenge. Streak and speed bonuses gamify without undermining learning.
- **Comprehensive molar mass database:** 44 compounds with educational-grade precision. Covers elements, diatomics, simple compounds, and complex oxides.
- **Thorough unit tests:** 20+ test cases in calculations.test.ts covering limiting reagent identification, multi-product handling, reactant generation ranges, point calculations, and answer validation with tolerance.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **Multi-product reactions broken in Level 2 & Level 3** — Reactions with multiple products (CH₄ + 2O₂ → CO₂ + 2H₂O, 4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂, 2Al + 3CuO → Al₂O₃ + 3Cu) only calculate the first product. The second product gives undefined/incorrect answers. Students see equations with multiple products but can only input one — scientifically misleading. **Fix:** Either filter out multi-product reactions from L2/L3, or extend the UI to accept all products.

2. **CSS typo in ReactionAnimation.tsx** — `className="... -tranwarm-x-1/2 ..."` should be `-translate-x-1/2`. The "Afurðir" (Products) label is misaligned in the reaction animation.

### Major (significant UX/pedagogical problems)

3. **Difficulty gap between L2 and L3** — L2 provides full step-by-step scaffolding (each step validated individually with feedback). L3 suddenly requires all three answers simultaneously (limiting reagent, products, excess) with no intermediate scaffolding. Students who mastered L2's guided process may struggle with the cognitive load shift. **Suggestion:** L3-Easy could retain step-by-step scaffolding.

4. **L3 gram mode uses fixed 0.5× mole multiplier** — All gram problems generate reactant amounts as `moleculeCount × 0.5` moles. This creates artificial regularity that students could exploit (pattern matching instead of calculating). Should randomize the multiplier.

5. **No ARIA labels on interactive elements** — Molecule visualizations, animation controls, and clickable reaction cards lack accessible names. No keyboard navigation support. Equations use HTML subscript entities (H₂O) without screen-reader-friendly alt text.

### Minor (polish, consistency, nice-to-haves)

6. **L1 and L2 mastery paradigm mismatch** — L1 requires 75% overall accuracy (6/8 correct). L2 requires 100% per-problem accuracy (6 error-free problems). The different paradigms aren't explained to students.

7. **Empty input validation in L3** — Allows submission with empty fields; `canSubmit` checks `trim() !== ''` but empty strings parse to NaN. Should show "fill in all fields" message.

8. **No analytics for learning gaps** — Game doesn't track which reactions or challenge types students struggle with. This data would help teachers identify common misconceptions.

9. **Streak continues across difficulty changes in L3** — Switching from Easy to Hard mid-session preserves the streak, which may not reflect consistent performance.

10. **Build script path mismatch** — Same `mv` path error as other games.

## Recommendations

1. **Fix multi-product reactions** — For L2/L3, either:
   - (A) Filter reactions to single-product only (simplest fix), or
   - (B) Extend UI to accept all product amounts (more complete but larger change)

2. **Fix CSS typo** — Change `-tranwarm-x-1/2` to `-translate-x-1/2` in ReactionAnimation.tsx.

3. **Bridge L2→L3 difficulty gap** — Make L3-Easy mode retain step-by-step scaffolding similar to L2. Only L3-Medium and L3-Hard should require simultaneous answers.

4. **Randomize gram mode multipliers** — Use random values (0.3–2.0) instead of fixed 0.5× to prevent pattern matching.

5. **Add accessibility** — Add ARIA labels to molecule visualizations, equation displays, and interactive elements. Add keyboard navigation for L3 input fields.

6. **Add analytics tracking** — Record which reactions and challenge types have lowest accuracy to help teachers identify common student misconceptions.
