# Game Review: Organic Nomenclature (Year 2)

## Summary

Organic Nomenclature (Lífræn Nafnagift) is a three-level game teaching IUPAC naming conventions for organic compounds. Level 1 introduces nomenclature fundamentals through a tutorial-builder-quiz sequence: 10 prefix cards (meth- through dec-), 3 suffix cards (-an, -en, -yn), an interactive MoleculeBuilder, and a 10-question quiz. Level 2 covers naming 12 molecules (alkanes, alkenes, alkynes including positional isomers like 1-búten vs 2-búten) through two modes — drag-drop name building and text input — plus a reverse StructureFromNameChallenge with 10 problems where students build carbon chains from IUPAC names. Level 3 introduces 4 functional groups (alcohol -ól, aldehyde -al, ketone -ón, carboxylic acid -sýra) through a learn-then-challenge format with 10 identification problems. The game features a custom MoleculeBuilder component (freeform carbon chain construction with clickable bonds cycling single→double→triple) and uses shared AnimatedMolecule and DragDropBuilder components.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Excellent scaffolding: tutorial → builder → quiz → naming → structure → functional groups. Explicit misconception handling in all 3 levels (prefix/suffix/position confusion). Interactive MoleculeBuilder makes abstract naming rules tangible. Bidirectional learning (name→structure and structure→name). Level 2 covers positional isomers (1-búten vs 2-búten). All 60+ formulas verified correct (CₙH₂ₙ₊₂ for alkanes, CₙH₂ₙ for alkenes, CₙH₂ₙ₋₂ for alkynes). |
| D2. Graphic Design | 4/5 | Clear carbon chain visualization: circular atoms (40-44px) with single/double/triple bond lines color-coded (warm-400, green-400, purple-400). Systematic color scheme: prefixes (blue), roots (gray), suffixes (green), positions (red). Functional group colors consistent (blue-alcohol, amber-aldehyde, orange-ketone, red-carboxylic acid). Dot indicators for tutorial progress. **Issue:** No CSS errors found; overall clean implementation. |
| D3. Scientific Accuracy | 5/5 | All molecular formulas verified: 10 alkanes (CH₄ through C₁₀H₂₂), 12 Level 2 molecules, all functional group examples. Hydrogen calculation (MoleculeBuilder lines 91-128) correctly implements: H = 4 - sum(bond values per carbon). IUPAC rules properly implemented: longest chain, lowest position numbers, correct prefix/suffix mapping. Common/trivial names noted (acetone = própanón, acetic acid = etansýra). |
| D4. Physical/Spatial | 3/5 | Responsive with md: breakpoints, max-w-3xl containers, overflow-x-auto for carbon chains. Touch-friendly full-width buttons. **Issues:** MoleculeBuilder ±buttons are 40×40px (below 44px mobile minimum). Prefix grid uses grid-cols-5 without responsive breakpoint (overflows on <400px screens). Bond clicking not keyboard accessible (only mouse/touch). AchievementsPanel lacks focus trap. |
| D5. Game Design | 4/5 | Varied scoring: L1 quiz (10 pts/question), L2 naming (10/5/2 for 1st/2nd/3rd attempt), L2 structure (15 first, 8 with hint), L3 (10 pts). Sequential level unlocking. Achievement system via shared hooks. Two input modes (drag-drop, text) accommodate different learners. Text input normalizes diacritics (etan/etán both accepted). **Issue:** No confirmation dialog before progress reset. |
| D6. Age-Appropriate | 5/5 | IUPAC nomenclature matches Year 2 curriculum perfectly. Progressive complexity: prefixes → suffixes → naming → positional isomers → functional groups. Real-world connections (acetaldehyde, acetone, acetic acid). Icelandic terminology standard (hóptengi, kolefniskeðjur, hýdroxýlhópur). Approximately 32+ challenges provide substantial practice. |
| D7. Consistency | 5/5 | Uses 8 shared components: LanguageSwitcher, ErrorBoundary, AchievementsPanel/Button/Notifications, FeedbackPanel, AnimatedMolecule, DragDropBuilder. Full 3-language i18n (is/en/pl). localStorage progress with JSON parse/try-catch safety. 43-line test file for organicConverter validates molecule rendering. |
| **Overall** | **4.4/5** | |

## Strengths

- **Bidirectional learning in Level 2:** Both name→structure and structure→name challenges force deep understanding. Drag-drop builder (prefix + position + suffix dropzones) provides kinaesthetic learning; text input offers keyboard alternative with diacritics normalization.
- **Interactive MoleculeBuilder:** Freeform carbon chain construction where clicking bonds cycles single→double→triple. Live IUPAC name generation. Hydrogen count updates automatically via correct formula (H = 4 - sum of bond values per carbon). Unicode subscript display (₀-₉).
- **Comprehensive nomenclature coverage:** 10 prefixes (meth- through dec-), 3 suffixes (-an, -en, -yn), positional isomers (1-búten, 2-búten, 2-pentyn), 4 functional groups (-ól, -al, -ón, -sýra). Covers essential IUPAC rules: longest chain, lowest position numbers, functional group priority.
- **Explicit misconception correction:** Three sets of misconceptions defined: Level1 (prefix/suffix confusion), Level2 (position number rules for 4+ carbons), StructureFromNameChallenge (bond type from suffix). FeedbackPanel shows targeted corrections with "next steps" guidance.
- **43-test organicConverter validation:** Tests cover atom creation, bond types (single/double/triple), formula preservation, carbon chain length, and highlighting — ensuring molecule rendering is correct.
- **Multi-attempt scoring with degradation:** Level 2 naming awards 10/5/2 points for 1st/2nd/3rd+ attempts, encouraging first-attempt thinking while allowing retry without permanent failure.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

None.

### Major (significant UX/pedagogical problems)

1. **Mobile button size below minimum** — MoleculeBuilder.tsx lines 315-322, 332-339; StructureFromNameChallenge.tsx lines 432-439, 449-456: ± buttons are `w-10 h-10` (40px), below iOS recommended 44×44px minimum. Fix: change to `w-12 h-12`.

2. **Prefix grid overflows on mobile** — App.tsx line 386: `grid-cols-5` without responsive breakpoint. On screens <400px wide, 5 columns of prefix cards wrap awkwardly. Fix: change to `grid-cols-3 md:grid-cols-5`.

3. **Bond clicking not keyboard accessible** — MoleculeBuilder.tsx lines 225-284, StructureFromNameChallenge.tsx lines 350-401: Bond cycling responds only to mouse/touch click. No tabIndex or keyboard event handlers. WCAG 2.1 Level A violation. Fix: add `tabIndex="0"` and `onKeyDown` for Enter/Space.

4. **Missing focus trap in AchievementsPanel** — App.tsx lines 400-407: Modal opens without focus management. Keyboard focus can escape outside the modal. Fix: implement focus trap or add `aria-modal="true"` + close on Escape.

### Minor (polish, consistency, nice-to-haves)

5. **Polish translations may contain errors** — i18n.ts lines 145-213: Polish chemical terminology not verified. Potential issues: "heks-" prefix, "okt-" vs "okta-", "-owy" suffix for carboxylic acid. Should be reviewed by a Polish chemistry educator.

6. **No confirmation before progress reset** — App.tsx lines 360-365: Single click wipes all progress without dialog. Could accidentally erase student work.

7. **Inconsistent chemistry terminology** — Multiple files use "efnasameindir" vs "sameindir" interchangeably. Minor style inconsistency but no functional impact.

## Recommendations

1. **Increase mobile touch targets** — Change ± buttons to `w-12 h-12` and prefix grid to `grid-cols-3 md:grid-cols-5`.
2. **Add keyboard navigation to bonds** — Add `tabIndex="0"` and `onKeyDown` handlers for bond cycling in MoleculeBuilder and StructureFromNameChallenge.
3. **Add focus trap to modal** — Implement keyboard focus management for AchievementsPanel (trap focus, close on Escape).
4. **Add confirmation dialog** — Show confirmation before clearing progress on reset button.
5. **Verify Polish translations** — Have a Polish chemistry educator review all terminology in i18n.ts.
