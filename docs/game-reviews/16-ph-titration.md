# Game Review: pH Titration (Year 3)

## Summary

pH Titration (pH Títrun) is a three-level game teaching acid-base titrations through a conceptual→practical→quantitative progression. Level 1 covers titration fundamentals through 6 conceptual multiple-choice challenges about titration curves, indicator selection, and buffer regions. Level 2 provides 6 interactive laboratory simulations with custom Burette (graduated with 0.05/1/5 mL delivery), Flask (Erlenmeyer with pH-based color and indicator overlay), PHMeter (digital LCD display with gradient scale), and IndicatorSelector components. Level 3 presents 8 calculation challenges covering concentration, volume, polyprotic acids, and Henderson-Hasselbalch equation with ±2% tolerance and worked solutions. The game covers 13 real titrations: 3 strong-strong (HCl, HNO₃, HClO₄ with bases), 4 weak acid-strong base (CH₃COOH, HF, HCOOH, C₆H₅COOH), 2 strong acid-weak base (NH₃, CH₃NH₂), and 4 polyprotic (H₂SO₃, H₂C₂O₄ diprotic + H₃PO₄ triprotic). 5 acid-base indicators with correct pH ranges are included.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Comprehensive coverage: strong-strong, weak-strong, strong-weak, and polyprotic titrations. Explicit misconception correction: "Jafngildispunktur er EKKI alltaf við pH 7" (equivalence ≠ pH 7). Bidirectional learning: L1 conceptual → L2 hands-on simulation → L3 quantitative calculations. Buffer region teaching (pH = pKa±1, half-equivalence). Real lab procedure mirrored with burette/flask/indicator/pH meter. 5 indicators with correct pH ranges. References Brown et al. Chapter 17. |
| D2. Graphic Design | 5/5 | Four custom lab equipment components: Burette with gradient fill, 0-60 mL scale marks, animated drip, and stopcock. Flask with clip-path Erlenmeyer shape, pH-based color fill, indicator overlay (mix-blend-mode), and swirl animation. PHMeter with LCD display, gradient scale bar, and position marker. TitrationCurve via shared InteractiveGraph with buffer region bands, pKa lines, and current position marker. Purple/indigo Year 3 theme. |
| D3. Scientific Accuracy | 5/5 | pH calculation functions verified for 5 titration types (strong-strong, weak-strong, strong-weak, diprotic, triprotic). Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA]) correct. pKa values match literature: acetic acid 4.74, HF 3.17, formic acid 3.75, H₂SO₃ Ka1=1.3×10⁻² / Ka2=6.3×10⁻⁸, H₃PO₄ Ka1=7.1×10⁻³ / Ka2=6.3×10⁻⁸ / Ka3=4.5×10⁻¹³. Equivalence pH correct: strong-strong=7.0, weak acid-strong base>7, weak base-strong acid<7. 23 unit tests validate calculations. |
| D4. Physical/Spatial | 3/5 | Responsive with md:/lg: breakpoints. Burette has responsive height variants (320/420/500px). Touch-friendly buttons (p-3/p-4). **Critical issue:** CSS `-tranwarm-x-1/2` typo in Burette.tsx:86 (drip position), Flask.tsx:67 (stirring bar), PHMeter.tsx:73 (scale marker) — 3 visual elements misaligned. Missing ARIA labels on Burette fill, Flask color, PHMeter scale (no aria-valuenow/min/max). No keyboard navigation for Level 2 burette controls. Flask fixed w-60 h-70 may overflow on screens <320px. |
| D5. Game Design | 4/5 | Varied scoring: L1 100pts/challenge with hint multiplier, L2 100pts (50 with hint), L3 20pts (10 with hint). Sequential level unlocking. Tiered hints in L1 via shared HintSystem (4 tiers). L2 simple hint toggle. L3 worked solution steps (solutionStepsIs bilingual). Achievement integration via shared hooks. Progress persisted to localStorage with best-score tracking. FeedbackPanel with misconception display in L1. |
| D6. Age-Appropriate | 5/5 | Titration matches Year 3 curriculum perfectly. Progressive: conceptual (L1) → practical simulation (L2) → quantitative (L3). Real lab equipment simulation builds practical skills. Proper Icelandic: títrun, jafngildispunktur, vísi, stuðpúðasvæði, veik sýra. Polyprotic examples (H₂SO₃, H₃PO₄) match advanced curriculum. References Brown Ch. 17. 20 challenges provide substantial practice. |
| D7. Consistency | 5/5 | Uses 8 shared components: LanguageSwitcher, ErrorBoundary, AchievementsButton, AchievementsPanel, AchievementNotificationsContainer, HintSystem (L1), InteractiveGraph (TitrationCurve), FeedbackPanel (L1). Plus useGameI18n, useAchievements hooks. Full 3-language i18n (221 lines). localStorage progress with JSON try-catch safety. Design follows Year 3 purple/indigo theme. |
| **Overall** | **4.6/5** | |

## Strengths

- **Four custom lab equipment components:** Burette with gradient fill, 0-60 mL graduated scale, animated drip on pour, and stopcock toggle (130 lines). Flask with CSS clip-path Erlenmeyer shape, pH-based color fill using 15-color spectrum, indicator color overlay with mix-blend-mode, and swirl animation during titration (103 lines). PHMeter with LCD-style digital readout and gradient scale bar with position marker (97 lines). IndicatorSelector with large clickable indicator cards showing acid/base color pairs (70 lines).
- **Comprehensive titration type coverage (13 titrations):** 3 strong-strong (HCl+NaOH, HNO₃+KOH, HClO₄+LiOH), 4 weak acid-strong base (CH₃COOH, HF, HCOOH, C₆H₅COOH with NaOH/KOH), 2 strong acid-weak base (NH₃+HCl, CH₃NH₂+HCl), 2 diprotic (H₂SO₃, H₂C₂O₄), and 2 polyprotic including H₃PO₄ triprotic. All with proper Ka/Kb/pKa values and calculated equivalence volumes/pH values.
- **pH calculation engine (365 lines):** Separate functions for 5 titration types handling all regions: initial pH, pre-equivalence (Henderson-Hasselbalch for weak), equivalence, and post-equivalence (excess titrant). Polyprotic functions handle multiple equivalence points correctly. Curve generation uses 0.5 mL increments with fine points near equivalence for smooth curves.
- **Explicit misconception targeting:** Level 1 Challenge 2 directly teaches that weak acid + strong base equivalence pH > 7 (not 7). Challenge 5 teaches buffer region = pKa±1. Challenge 6 teaches indicator selection by matching equivalence pH, not assuming pH 7. FeedbackPanel shows specific misconception corrections.
- **Real lab simulation fidelity (Level 2):** Dropwise delivery (0.05 mL) plus 1 mL and 5 mL bulk addition plus continuous pour toggle. Real-time pH calculation updates PHMeter display and Flask color. Indicator color changes at correct transition pH ranges. Titration curve updates with current position marker. Mirrors actual titration laboratory procedure.
- **5 indicators with verified pH ranges:** Methyl orange (3.1-4.4, red→orange), bromothymol blue (6.0-7.6, yellow→blue), phenolphthalein (8.2-10.0, colorless→pink), methyl red (4.4-6.2, red→yellow), and thymol blue (8.0-9.6, yellow→blue). Color pairs correctly implemented in IndicatorSelector.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **3 CSS `-tranwarm-x-1/2` typos breaking visual alignment** — Burette.tsx line 86: drip animation not horizontally centered below stopcock. Flask.tsx line 67: stirring bar not centered in flask. PHMeter.tsx line 73: scale marker not centered on pH indicator. All three should be `-translate-x-1/2`. Same typo pattern as hess-law and equilibrium-shifter games.

### Major (significant UX/pedagogical problems)

2. **Missing ARIA labels on lab equipment** — Burette.tsx (fill percentage), Flask.tsx (solution color/pH), PHMeter.tsx (pH value/scale): No `aria-label`, `aria-valuenow`, `aria-valuemin`, or `aria-valuemax` attributes. Screen reader users cannot understand titration state.

3. **No keyboard navigation in Level 2** — Level2.tsx: Burette controls (0.05 mL, 1 mL, 5 mL buttons) are click-only without keyboard shortcuts. Students using keyboard-only navigation cannot perform titrations.

4. **Flask fixed size may overflow mobile** — Flask.tsx line 34: Fixed `w-60 h-70` (240×280px) exceeds width on screens <320px. Fix: use `w-48 md:w-60` for responsive sizing.

### Minor (polish, consistency, nice-to-haves)

5. **Challenge type labels hardcoded in Icelandic** — Level3.tsx lines 88-97: getChallengeTypeLabel returns Icelandic labels ('Styrkur', 'Rúmmál', etc.) regardless of selected language. Should use i18n translation keys.

6. **Flask transparent indicator hard to see** — Flask.tsx line 60: When phenolphthalein is below transition pH, opacity 0.1 makes liquid nearly invisible. Fix: use opacity 0.2-0.3 or light tint.

7. **Level lock messages not translated** — App.tsx lines 319-340: "(Ljúktu stigi 1 fyrst)" lock text is Icelandic-only.

8. **Level 3 tolerance inconsistency** — level3-challenges.ts: Most challenges use tolerance 0.02 (2%), but Challenge 7 (Henderson-Hasselbalch ratio) uses 0.05 (5%). Inconsistent grading standards without documentation.

## Recommendations

1. **Fix CSS typos** — Replace all 3 instances of `-tranwarm-x-1/2` with `-translate-x-1/2` in Burette.tsx:86, Flask.tsx:67, PHMeter.tsx:73.
2. **Add ARIA labels to lab equipment** — Add `aria-label` with current values to Burette (volume dispensed), Flask (pH and color), PHMeter (current pH). Add `aria-valuenow`/`aria-valuemin`/`aria-valuemax` to PHMeter.
3. **Add keyboard shortcuts to Level 2** — Add onKeyDown handlers: arrow keys for fine delivery, +/- for 1 mL, Shift+arrow for 5 mL.
4. **Make Flask responsive** — Change to `w-48 md:w-60` to prevent overflow on small screens.
5. **Internationalize remaining hardcoded labels** — Move Level 3 challenge type labels and level lock messages to i18n.ts.
