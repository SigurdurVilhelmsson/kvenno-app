# Game Review: Intermolecular Forces (Year 2)

## Summary

Intermolecular Forces (Millisameindakraftar) is a three-level game teaching intermolecular force identification, property prediction, and conceptual synthesis. Level 1 features a learning phase with animated force-strength visualizations followed by a 10-molecule quiz where students identify all applicable IMFs (London, dipole-dipole, H-bonding). Level 2 has 10 ranking problems where students order compounds by boiling point, vapor pressure, viscosity, or surface tension using real data. Level 3 presents 10 rich conceptual scenarios covering anomalies (ice floating, water's high surface tension), real-world applications (gecko adhesion, soap bubbles), and multi-factor comparisons. The game includes a standalone SolubilityPrediction tool and a custom ForceStrengthAnimation SVG component.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Exceptional misconception targeting — explicitly addresses "London forces always present," "H on C doesn't form H-bonds," "CH₄ has H but NO H-bonding." L2 Problem 10 teaches that H-bond count matters more than per-bond strength (HF vs H₂O). L3 synthesizes concepts with real-world phenomena (gecko feet, ice anomaly, oil immiscibility). FeedbackPanel provides personalized misconception corrections. |
| D2. Graphic Design | 5/5 | ForceStrengthAnimation uses spring-based SVG with oscillating molecules — stronger forces = tighter springs. Color coding: purple=London, blue=dipole-dipole, red=H-bonding. 2D/3D molecule toggle in L1 with partial charges (δ+/δ−) and dipole arrows. L2 bar charts with temperature gradients. SolubilityPrediction beaker animation shows dissolution/separation. All animations respect prefers-reduced-motion. |
| D3. Scientific Accuracy | 5/5 | All 10 L1 molecules correctly categorized. IMF hierarchy correct (London < dipole-dipole < H-bonding). Energy ranges reasonable (London 0.05–40, dipole 5–25, H-bonding 10–40 kJ/mol). H-bonding criteria meticulously enforced (H bonded to F, O, or N only). All L2 ranking problems use real boiling point data. Polarity reasoning sound — CO₂ and CCl₄ correctly identified as nonpolar despite polar bonds. Surface area effects on London forces correctly taught (n-butane vs isobutane). |
| D4. Physical/Spatial | 4/5 | Responsive with md: breakpoints. Touch-friendly buttons. SVG animations scale properly. ARIA labels on most visualizations. Color coding supplemented with text/icons. **Issue:** L1 2D/3D toggle buttons lack aria-labels. ForceStrengthAnimation could benefit from keyboard navigation for force selection. |
| D5. Game Design | 4/5 | Three well-differentiated cognitive modes: identify (L1), rank (L2), synthesize (L3). SolubilityPrediction tool adds interactive exploration. Hint penalties proportional (15→8 in L1/L2, 12→6 in L3). Achievement integration complete. **Issue:** No mastery threshold — students can advance with any score > 0. SolubilityPrediction doesn't integrate with scoring. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 2 (Brown Ch. 11). L1 builds on polarity concepts from VSEPR game. L2 connects IMFs to measurable properties (BP, viscosity, surface tension, vapor pressure). L3 requires multi-factor reasoning appropriate for 16–17 year olds. Real-world contexts (gecko feet, soap bubbles, oil/water) make abstract concepts tangible. |
| D7. Consistency | 5/5 | Uses shared components: LanguageSwitcher, ErrorBoundary, AchievementsPanel/Button, AchievementNotificationsContainer, FeedbackPanel, AnimatedMolecule, MoleculeViewer3DLazy, useGameI18n, useAchievements, shuffleArray. Progress persisted via localStorage. i18n complete (IS/EN/PL). No missing integrations. |
| **Overall** | **4.7/5** | |

## Strengths

- **Misconception-focused pedagogy:** Explicitly targets the most common IMF errors. L1 quiz includes CH₄ (has H atoms but NO H-bonding — C is not F, O, or N) and CCl₄ (has polar bonds but nonpolar molecule — tetrahedral symmetry cancels dipoles). Each wrong answer triggers specific misconception feedback via FeedbackPanel.
- **ForceStrengthAnimation:** Custom SVG component visualizing IMF strengths with oscillating molecules connected by springs. Stronger forces = tighter springs with fewer waves. Includes single-force detail mode and side-by-side comparison mode with proportional energy bars.
- **Real boiling point data in L2:** All 10 ranking problems use actual boiling points, not approximations. Students see real numbers after ranking, reinforcing that their predictions match reality.
- **L3 conceptual depth:** Goes beyond identification to synthesis. Challenge 5 (gecko adhesion from accumulated weak van der Waals forces), Challenge 7 (ice floating from crystalline H-bonding network), Challenge 10 (HF vs H₂O — bond count outweighs per-bond strength) require genuine multi-factor reasoning.
- **SolubilityPrediction tool:** Standalone interactive feature with beaker animation showing "like dissolves like." Handles polar, nonpolar, ionic, and amphiphilic molecules with detailed explanations.
- **10 L1 molecules well-chosen:** Range from simple (CH₄ — London only) to nuanced (CHCl₃ — polar but no H-bonding despite having H). Covers the full spectrum students need for exam preparation.
- **Complete i18n:** All three languages (IS/EN/PL) fully translated including force types, property names, and concept terms. Natural Icelandic throughout.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

None identified. This game is scientifically accurate and fully functional.

### Major (significant UX/pedagogical problems)

1. **No mastery threshold for level progression** — Students can advance from L1→L2→L3 with any score > 0. A student who guesses through L1 can immediately access L2 ranking problems without demonstrating understanding of IMF identification. **Suggestion:** Require 80%+ accuracy to unlock next level.

### Minor (polish, consistency, nice-to-haves)

2. **L1 2D/3D toggle buttons lack aria-labels** — Screen readers cannot distinguish between the visualization mode buttons.

3. **ForceStrengthAnimation keyboard navigation** — Force selection buttons in the animation component don't support arrow key navigation. Tab-only navigation works but is less intuitive.

4. **SolubilityPrediction not scored** — The standalone solubility tool doesn't contribute to game scoring. Students may not realize it's supplementary. A brief label ("Aukaverkfæri" / "Supplementary tool") would clarify.

5. **No integration tests** — Only `imfConverter.test.ts` (14 tests) exists. No tests for Level1/Level2/Level3 scoring logic or hint mechanics.

6. **Energy range imprecision in ForceStrengthAnimation** — London forces shown as 0.05–40 kJ/mol is technically correct but the broad range could confuse students. Large nonpolar molecules (I₂) have much stronger London forces than small ones (He). A note about size dependence in the animation would help.

7. **Build script path mismatch** — Same `mv` path error as other games.

## Recommendations

1. **Add mastery threshold** — Require 80%+ on L1 before L2 unlocks, 70%+ on L2 before L3. This ensures conceptual foundation before application.

2. **Add aria-labels to toggle buttons** — Label the 2D/3D toggle buttons for screen reader accessibility.

3. **Label SolubilityPrediction as supplementary** — Add a subtitle or badge clarifying it's an exploration tool, not a scored activity.

4. **Add integration tests** — Test L1 multi-select scoring, L2 ranking validation, L3 multiple-choice scoring, and hint penalty mechanics.

5. **Annotate London force energy range** — Add a note in ForceStrengthAnimation explaining that London force strength depends on molecular size (small molecules: ~0.05 kJ/mol, large molecules: up to 40 kJ/mol).
