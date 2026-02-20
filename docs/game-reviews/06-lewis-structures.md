# Game Review: Lewis Structures (Year 2)

## Summary

Lewis Structures (Lewis-formúlur) is a three-level game teaching Lewis dot structure construction and analysis. Level 1 covers valence electron fundamentals through 8 progressive challenges (counting, totaling, octet rule, electron need). Level 2 teaches interactive Lewis structure drawing for 9 molecules with a 3-step guided process, covering single/double/triple bonds and octet exceptions (BF₃, PCl₅, SF₆, NO radical). Level 3 introduces formal charge calculation and resonance structures (NO₂⁻, CO₃²⁻, O₃). The game includes optional 3D molecular visualization via MoleculeViewer3DLazy and a drag-drop lone pair building activity.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Excellent constructivism — valence electrons → Lewis drawing → formal charges → resonance. L2 covers all three octet exception types (electron-deficient BF₃, expanded octet PCl₅/SF₆, odd-electron radical NO). LewisGuidedMode provides complete step-by-step tutorial for beginners. Misconception targeting per challenge type. 4-tier HintSystem in L1, simpler hints in L2/L3. |
| D2. Graphic Design | 4/5 | Year 2 teal theme throughout. Color-coded levels (blue/green/purple). AnimatedMolecule provides clear 2D Lewis visualization. Optional 3D viewer toggle. Drag-drop builder for lone pair placement. Clear atom color coding (blue=central, green=surrounding, gray=hydrogen). **Issue:** 6 CSS `-tranwarm-` typos cause broken lone pair positioning in L3 and guided mode label alignment. |
| D3. Scientific Accuracy | 5/5 | Valence electron data correct for all elements. Lewis structure rules properly implemented (central atom selection, bond counting, lone pair distribution). Formal charge formula FC = V - (L + ½B) correctly applied. Octet exceptions well-categorized: electron-deficient (BF₃ 6e), expanded octet (PCl₅ 10e, SF₆ 12e), odd-electron (NO 11e). Resonance structures correct (NO₂⁻, CO₃²⁻, O₃). lewisConverter.ts geometry inference verified by 9 test suites. |
| D4. Physical/Spatial | 4/5 | Responsive with md: breakpoints. Touch-friendly buttons (py-4 px-6). Mobile single-column, desktop multi-column. ARIA labels on molecule visualizations. Reduced motion support via CSS media query. **Issue:** Broken lone pair dot positioning due to CSS typos. Drag-drop builder accessibility depends on shared DragDropBuilder implementation. |
| D5. Game Design | 4/5 | Three distinct cognitive modes (learn, build, analyze). L2 drag-drop building adds +10 bonus points. Hint penalties proportional (-7 in L1, -3 in L2). Progression gates enforce order. Achievement integration complete (trackCorrectAnswer, trackLevelComplete, trackGameComplete). **Issue:** L2 hint score deduction not visually communicated to player. |
| D6. Age-Appropriate | 5/5 | Perfect for Year 2 (Brown Ch. 8–9). L1 is accessible (counting valence electrons from periodic table group). L2 builds structures progressively (H₂O → NH₃ → CO₂ → CH₄ → NO → HCl → BF₃ → PCl₅ → SF₆). L3 introduces formal charge algebra and resonance — appropriate for students with Year 1 stoichiometry background. Octet exceptions covered at the right depth. |
| D7. Consistency | 4/5 | Uses shared components: HintSystem (L1), FeedbackPanel, AchievementsPanel/Button, AchievementNotificationsContainer, LanguageSwitcher, ErrorBoundary, AnimatedMolecule, MoleculeViewer3DLazy, useAchievements, useGameI18n. Progress persisted. **Missing:** Breadcrumbs, shared Header/Footer. OctetViolationChecker component exists but appears unused in game flow. |
| **Overall** | **4.4/5** | |

## Strengths

- **Three octet exception types:** Covers electron-deficient (BF₃), expanded octet (PCl₅, SF₆), and odd-electron radical (NO) — comprehensive treatment of all exception categories students need.
- **LewisGuidedMode tutorial:** Complete step-by-step walkthrough for beginners who need extra scaffolding before attempting the main L2 challenges. Separate from the main flow so advanced students can skip it.
- **Drag-drop lone pair builder:** L2 includes an interactive building activity where students physically place lone pairs on atoms. Bonus points (+10) reward engagement without penalizing those who skip.
- **Formal charge → resonance progression (L3):** Teaches FC calculation first (challenges 1-4), then applies it to evaluate competing structures (challenge 5 — CO), then introduces resonance as a natural extension (challenges 6-8 — NO₂⁻, CO₃²⁻, O₃).
- **2D/3D visualization toggle:** Students can view molecules as flat Lewis diagrams (AnimatedMolecule) or toggle to 3D ball-and-stick (MoleculeViewer3DLazy) to connect Lewis structures to molecular geometry.
- **lewisConverter.ts with thorough tests:** 9 test suites covering water, CO₂, NH₃, CH₄, BF₃, NH₄⁺, SF₆, and diatomics — verifies geometry inference, bond handling, and expanded octets.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **6 CSS `-tranwarm-` typos causing broken positioning** — Level3.tsx has 5 instances and LewisGuidedMode.tsx has 1 instance where `-tranwarm-x-1/2` or `-tranwarm-y-1/2` should be `-translate-x-1/2` or `-translate-y-1/2`. These are Tailwind translate utility classes — the typos mean lone pair dots in L3 and guided mode labels are not properly centered. Locations:
   - Level3.tsx line 269: `'top': 'absolute -top-4 left-1/2 -tranwarm-x-1/2'`
   - Level3.tsx line 270: `'bottom': 'absolute -bottom-4 left-1/2 -tranwarm-x-1/2'`
   - Level3.tsx line 271: `'left': 'absolute top-1/2 -left-4 -tranwarm-y-1/2'`
   - Level3.tsx line 272: `'right': 'absolute top-1/2 -right-4 -tranwarm-y-1/2'`
   - Level3.tsx line 359: `<div className="absolute top-1/2 -right-3 transform -tranwarm-y-1/2">`
   - LewisGuidedMode.tsx line 291: `<div className="absolute -bottom-6 left-1/2 transform -tranwarm-x-1/2 ...">`

### Major (significant UX/pedagogical problems)

2. **CO formal charge explanation slightly misleading** — Level3 Challenge 4 states "Þreföld tengsl uppfylla áttu fyrir bæði atóm og lágmarka formhleðslu" (triple bonds satisfy octet AND minimize formal charge). However, C≡O has C⁻ and O⁺ — formal charges are NOT minimized. The correct reasoning is that the octet rule takes priority over formal charge minimization. The text does acknowledge this later but the initial phrasing could confuse students.

3. **L2 hint scoring not transparent** — When hints are used in L2, score drops from 5 to 2 points per step, but this deduction isn't visually communicated. Students don't see why their score is lower than expected.

### Minor (polish, consistency, nice-to-haves)

4. **OctetViolationChecker component unused** — A 327-line component exists at `components/OctetViolationChecker.tsx` but is not imported or used in any level. Either integrate it or remove dead code.

5. **Missing integration tests** — Only `lewisConverter.test.ts` exists with 9 test suites. No tests for Level1/Level2/Level3 game logic, formal charge calculations, or drag-drop validation.

6. **Molecular formula subscripts not screen-reader friendly** — H₂O, CO₂ etc. use Unicode subscripts without aria-label alternatives for screen readers.

7. **Build script path mismatch** — Same `mv` path error as other games.

## Recommendations

1. **Fix CSS typos** — Replace all 6 instances of `-tranwarm-` with `-translate-` in Level3.tsx and LewisGuidedMode.tsx.

2. **Clarify CO formal charge explanation** — Rewrite L3 Challenge 4 to explicitly state the priority order: (1) satisfy octet rule > (2) minimize formal charge > (3) place negative charge on electronegative atom.

3. **Show hint penalties in L2** — Add visual indicator when hint reduces score from 5 to 2 points (e.g., strikethrough original points, show new value).

4. **Remove or integrate OctetViolationChecker** — Either add it to L2/L3 as an interactive tool or remove the unused component.

5. **Add integration tests** — Test Level1 quiz logic, Level2 step validation, Level3 formal charge calculations, and drag-drop builder.

6. **Add screen reader labels** — Use `aria-label` on molecular formula displays (e.g., `aria-label="H two O"` for H₂O).
