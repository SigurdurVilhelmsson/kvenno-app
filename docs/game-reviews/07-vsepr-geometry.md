# Game Review: VSEPR Geometry (Year 2)

## Summary

VSEPR Geometry (VSEPR Rúmfræði) is a three-level game teaching molecular geometry prediction via VSEPR theory. Level 1 features an exploration phase with an interactive geometry library (8 shapes with 2D/3D visualization) followed by an 8-question quiz covering geometry identification, electron domain counting, and lone pair effects. Level 2 provides guided 4-step molecular analysis (count domains → predict geometry → predict angles → explain reasoning) for 10 molecules including expanded octets (SF₄, XeF₄, ClF₃). Level 3 introduces hybridization (sp, sp², sp³, sp³d, sp³d²), polarity analysis, and dipole moment evaluation across 12 questions. The game includes three custom animation components: BondAngleMeasurement, ElectronRepulsionAnimation, and ShapeTransitionAnimation.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Outstanding constructivism — exploration phase before quiz (L1), then guided step-by-step prediction (L2), then synthesis with hybridization and polarity (L3). Critical distinction between electron geometry and molecular geometry is consistently reinforced. Lone pair repulsion effects taught explicitly ("Einstæð pör hrinda meira en bindandi pör"). L3 wrong answers unlock collapsible concept explanations for deep learning. |
| D2. Graphic Design | 5/5 | Three custom animation components: ElectronRepulsionAnimation (physics-based spring simulation showing domains pushing apart), ShapeTransitionAnimation (smooth easing between geometries), BondAngleMeasurement (SVG arc visualization with angle labels). 2D/3D toggle throughout. Color-coded domains: green=bonding pairs, yellow=lone pairs, red=force arrows. Clean teal Year 2 theme. |
| D3. Scientific Accuracy | 5/5 | All VSEPR predictions correct. Bond angles accurate: tetrahedral 109.5°, trigonal planar 120°, linear 180°, pyramidal ~107°, bent 104.5°, octahedral 90°, trigonal bipyramidal 90°/120°. Lone pair compression effects correctly shown. Expanded octets properly handled (PCl₅, SF₄, SF₆, XeF₄, ClF₃). Hybridization correctly mapped to geometry. Polarity analysis sound — CCl₄ nonpolar (symmetry cancels), NF₃ vs NH₃ dipole direction (lone pair alignment). |
| D4. Physical/Spatial | 4/5 | Responsive with md: breakpoints. SVG diagrams scale with compact/fullsize variants. MoleculeViewer3D with gesture support (drag-rotate, scroll-zoom). ARIA labels on interactive elements. High contrast colors. Reduced motion CSS support. **Issue:** SVG diagrams in BondAngleMeasurement and ElectronRepulsionAnimation lack `<title>` or `<desc>` elements for screen readers. |
| D5. Game Design | 5/5 | L1 exploration-before-quiz design is excellent — students can reference the geometry library during the quiz. L2's 4-step workflow (count → geometry → angle → explain) forces complete reasoning. L3 concept explanation panels unlock on wrong answers — failure becomes a learning moment. Scoring well-balanced: 15/10/12 base points with proportional hint penalties. Total 664 points possible. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 2 (Brown Ch. 9). L1 covers basic geometries with familiar molecules (CH₄, H₂O, NH₃, CO₂, BF₃). L2 extends to expanded octets (SF₄, XeF₄, ClF₃) — appropriate after students learn d-orbital concepts. L3 hybridization (sp, sp², sp³, sp³d, sp³d²) and polarity analysis build on Lewis structure knowledge from the previous game. Multi-center molecules (C₂H₄, C₂H₂) extend to organic chemistry preview. |
| D7. Consistency | 5/5 | Uses shared components: LanguageSwitcher, ErrorBoundary, AchievementsPanel/Button, AchievementNotificationsContainer, FeedbackPanel, AnimatedMolecule, MoleculeViewer3DLazy, useGameI18n, useAchievements, shuffleArray. Progress persisted via localStorage. i18n complete (IS/EN/PL). **This is the most consistently integrated game reviewed so far.** |
| **Overall** | **4.9/5** | |

## Strengths

- **Exploration-before-quiz design (L1):** Students browse an interactive geometry library with 8 shapes, each showing electron domains, bonding/lone pairs, bond angles, and example molecules — with both 2D and 3D visualization. Only after exploring do they face the quiz. This matches the 5E model's Explore→Explain sequence.
- **ElectronRepulsionAnimation:** Physics-based spring simulation showing electron domains pushing apart into their minimum-energy arrangement. Makes the abstract concept of "electrons repel and maximize distance" concrete and visual.
- **ShapeTransitionAnimation:** Smooth animated transitions between geometries as electron domains are added/removed. Students can see how adding a lone pair transforms tetrahedral into trigonal pyramidal.
- **BondAngleMeasurement:** SVG arc visualization showing exact bond angles with clear labels. Demonstrates how lone pairs compress angles (109.5° → 107° → 104.5°).
- **Electron vs molecular geometry distinction:** Consistently reinforced throughout — L1 quiz Q3 explicitly asks why NH₃ "appears pyramidal but has tetrahedral electron geometry." This addresses the most common VSEPR misconception.
- **L3 concept explanation panels:** Wrong answers unlock collapsible deep-dive explanations. Students who get NF₃ vs NH₃ wrong discover that in NH₃ the lone pair and bond dipoles align, while in NF₃ they oppose — a nuanced polarity concept.
- **Comprehensive test suite:** 22 passing vitest tests for vseprConverter covering geometry mapping, atom creation, lone pairs, bond types, and alias handling.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

None identified. This is a scientifically accurate, well-functioning game.

### Major (significant UX/pedagogical problems)

1. **SVG animations lack screen reader descriptions** — BondAngleMeasurement, ElectronRepulsionAnimation, and ShapeTransitionAnimation use SVG without `<title>` or `<desc>` elements. Screen reader users cannot access the visual explanations that are central to the learning experience. **Fix:** Add descriptive `<title>` and `<desc>` to each SVG root.

### Minor (polish, consistency, nice-to-haves)

2. **Menu title missing Icelandic diacritics** — App.tsx line 251 shows "VSEPR Rumfraedi" instead of "VSEPR Rúmfræði". The i18n system has the correct form but the hardcoded menu title lacks diacritics.

3. **L2 angle validation uses string matching** — Angle answers are validated via `normalizedAnswer.includes('104')` rather than numeric tolerance (±1.5°). This works but could reject valid answers like "104.4°" or "~105°". **Suggestion:** Parse numeric input and accept within ±2° of expected value.

4. **L2 square-planar SVG incomplete** — The bond angle visualization for XeF₄ (square-planar) only draws 4 bonds. While correct for the molecular geometry, it doesn't show the 2 lone pairs that make it different from tetrahedral. Adding lone pair indicators would reinforce the electron vs molecular geometry distinction.

5. **Build script path mismatch** — Same `mv` path error as other games.

## Recommendations

1. **Add SVG accessibility** — Add `<title>` and `<desc>` elements to all three custom animation SVG components. Include descriptive text like "Fjórflatningsformið: fjórir bindandi parar í 109.5° horni" (Tetrahedral shape: four bonding pairs at 109.5° angle).

2. **Fix menu diacritics** — Change "VSEPR Rumfraedi" to "VSEPR Rúmfræði" in App.tsx.

3. **Improve angle validation** — Replace string matching with numeric parsing and ±2° tolerance for more robust answer checking.

4. **Add lone pair indicators to square-planar SVG** — Show the 2 lone pairs in the XeF₄ visualization to reinforce that square-planar is derived from octahedral electron geometry.

5. **Consider adding more L3 molecules** — The game could benefit from additional polarity challenges (e.g., ozone O₃, nitrate ion NO₃⁻) as stretch content.
