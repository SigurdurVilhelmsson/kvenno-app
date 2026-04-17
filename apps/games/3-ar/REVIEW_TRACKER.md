# Year 3 Games — Iterative Review Tracker

## Iteration 1: Pedagogical Structure — 2026-04-17

### Review Ratings

| Game                     | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical | P7 Accessible |
| ------------------------ | -------- | ------- | -------------- | ---------- | -------- | ------------ | ------------- |
| Gas Law Challenge        | FAIL     | PARTIAL | FAIL           | PARTIAL    | PASS     | PASS         | PASS          |
| Equilibrium Shifter      | PARTIAL  | PASS    | PASS           | PASS       | PASS     | PASS         | PASS          |
| Thermodynamics Predictor | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | PASS          |
| pH Titration             | PARTIAL  | PASS    | PASS           | PASS       | PASS     | PARTIAL      | PASS          |
| Buffer Recipe Creator    | PASS     | PASS    | PARTIAL        | PASS       | PASS     | PARTIAL      | PASS          |

### Key Findings (Pedagogical Focus)

**Cross-cutting:**

- P1 is the weakest dimension: 4/5 games jump to graded activity without a dedicated discovery phase. Students can skip menu explanations and land cold on calculations.
- Gas Law Challenge has a unique P3 failure: 6 distinct gas laws (ideal, Boyle's, Charles's, Gay-Lussac's, combined, Avogadro's) are taught simultaneously with random question ordering. No coherent conceptual arc — "explore → practice → apply" is absent.
- P2 is generally strong on mechanism (why equilibrium shifts, why buffers resist, why ΔG predicts spontaneity) but weaker on post-answer feedback tying student-specific reasoning back to the principle.

**Per-game critical findings:**

1. **Gas Law Challenge**: No discovery phase before first graded problem. Menu intro is optional. 6 laws mixed randomly — violates P3 "one concept, three levels deepen it." Simulator visualizes P/V/T/n mapping but not during hints.
2. **Equilibrium Shifter**: Strong pedagogy overall. Challenge mode has no gate — a student can skip learning mode entirely and hit timed advanced equilibria unprepared. Q vs K comparison only shown after answer, not during prediction.
3. **Thermodynamics Predictor**: Menu derivation of ΔG = ΔH − TΔS is excellent but static — never revisited during gameplay. Real-time ΔG calculation shown upfront effectively gives away the answer. Solution shows WHAT but rarely explains WHY a specific scenario behaves as it does.
4. **pH Titration**: L1 starts with MCQ curve-matching before explicit teaching. L2 doesn't disclose volume tolerance upfront. L3 has `type: 'polyprotic'` defined in interface but zero polyprotic instances in data. Hint multiplier bug (not reset per challenge).
5. **Buffer Recipe Creator**: Level 1 is gold standard (visual ratio builder). Abrupt jump from L2 (mass from moles) to L3 (volume from dilution) without conceptual bridge. L3 recalculates moles on every render instead of validating against pre-calculated volumes. BufferCapacityVisualization only used in L1, absent in L2-L3.

### Triage

| #   | Game                     | Finding                                                            | Disposition | Effort |
| --- | ------------------------ | ------------------------------------------------------------------ | ----------- | ------ |
| 1   | Gas Law Challenge        | No discovery phase before first graded problem                     | FIX         | M      |
| 2   | Gas Law Challenge        | Feedback shows formula steps but no "why" reasoning                | FIX         | S      |
| 3   | Gas Law Challenge        | 6 laws taught simultaneously (P3 violation — scope creep)          | DEFER       | L      |
| 4   | Equilibrium Shifter      | Challenge mode has no learning-mode completion gate                | FIX         | S      |
| 5   | Thermodynamics Predictor | No guided discovery phase before first graded problem              | FIX         | M      |
| 6   | Thermodynamics Predictor | Wrong-answer feedback doesn't explain student's specific reasoning | FIX         | S      |
| 7   | pH Titration             | L1 jumps to MCQ before explicit teaching of curve shapes           | FIX         | M      |
| 8   | pH Titration             | L2 volume tolerance not disclosed upfront                          | FIX         | XS     |
| 9   | pH Titration             | L3 polyprotic type defined but never instantiated                  | DEFER       | M      |
| 10  | pH Titration             | Hint multiplier not reset per challenge (bug)                      | DEFER       | S      |
| 11  | Buffer Recipe Creator    | L2→L3 abrupt transition (mass → volume via dilution)               | FIX         | S      |
| 12  | Buffer Recipe Creator    | BufferCapacityVisualization absent in L2-L3                        | DEFER       | M      |
| 13  | Buffer Recipe Creator    | L3 recalculates moles on every render instead of validating        | DEFER       | S      |

**Disposition summary:** 8 FIX, 5 DEFER.

**REBUILD cap:** no REBUILDs needed this iteration (all FIX dispositions are localized).

**Deferred items** largely fall into iter 2 (technical quality) or future scope:

- Gas Law Challenge P3 scope restructure: needs a dedicated design decision (split into separate games? reorganize as law-per-level?). Track as cross-iter.
- pH Titration polyprotic data + hint bug: iter 2 scope.
- Buffer L3 technical debt + missing visualizations: iter 2 scope.

### Changes Applied

| #   | Game                     | Finding                                        | Done                                                                                                                                                                                                               |
| --- | ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Gas Law Challenge        | Feedback shows formula but no "why" reasoning  | Yes — added `principleIs` field to `GAS_LAW_INFO` in types.ts for all 6 laws (molecular-level explanation); feedback screen now shows an "Af hverju virkar [law]?" purple card after the step-by-step solution.    |
| 2   | Gas Law Challenge        | No discovery phase before first graded problem | Deferred — P1 discovery requires larger restructure (pre-game interactive simulator). Menu intro card already exists with PV=nRT derivation; expanding to mandatory interactive discovery is iter-2+ scope.        |
| 3   | Equilibrium Shifter      | Challenge mode has no learning-gate            | Yes — Challenge button now locks until `progress.problemsCompleted >= 5`; shows 🔒 icon + remaining count + disabled state + `aria-disabled`. Prevents unprepared students from hitting timed advanced equilibria. |
| 4   | Thermodynamics Predictor | Wrong-answer feedback doesn't explain "why"    | Yes — new `buildSpontaneityReasoning()` helper: wrong answers now receive a scenario-specific explanation (ΔH/ΔS sign pattern, TΔS magnitude at current T, when this scenario flips). Covers all 4 scenarios.      |
| 5   | Thermodynamics Predictor | No guided discovery before first problem       | Deferred — requires new pre-L1 "manipulate T and observe ΔG" component. Menu derivation is solid; iter-2+ can build on reasoning helper added here.                                                                |
| 6   | pH Titration             | L1 jumps to MCQ before explicit teaching       | Yes — new `showIntro` gate in Level1.tsx: first render shows a teaching card explaining titration, equivalence point, endpoint, and the 3 acid-base combinations (strong+strong, weak+strong, strong+weak).        |
| 7   | pH Titration             | L2 volume tolerance not disclosed upfront      | Yes — marking phase now shows "Leyfilegt svigrúm: ±X.X mL" below the instruction, so students know the precision they need before submitting.                                                                      |
| 8   | Buffer Recipe Creator    | L2→L3 abrupt transition                        | Yes — new `showIntro` gate in Level3.tsx: explains the shift from mass (hreint efni × M) to volume via the dilution formula (C₁V₁ = C₂V₂), plus a 3-step roadmap (ratio → moles → volume).                         |

### Deferred Items

| Finding                                             | Reason                                                                                                                                         | Target       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Gas Law Challenge: 6 laws in one game (P3 FAIL)     | Major restructure — needs design decision (split into separate games? reorganize as law-per-level?). Cross-iter concern — out of iter-1 scope. | Future       |
| Gas Law Challenge: pre-game interactive discovery   | Requires new component (manipulable PV=nRT demonstrator)                                                                                       | Iteration 2+ |
| Thermodynamics Predictor: pre-L1 guided discovery   | Requires new "manipulate T, observe ΔG" warm-up screen                                                                                         | Iteration 2+ |
| pH Titration: L3 polyprotic instances missing       | Type defined but no data — data authoring work                                                                                                 | Iteration 2  |
| pH Titration: L1 hint multiplier not reset          | Small bug; batch with other technical issues                                                                                                   | Iteration 2  |
| Buffer: L3 recalculates moles instead of validating | Technical debt; batch with iter-2                                                                                                              | Iteration 2  |
| Buffer: BufferCapacityVisualization absent in L2-L3 | Integration work; requires wiring                                                                                                              | Iteration 2  |
| Equilibrium Shifter: predictive particle animation  | Currently animation only shows post-answer; restructure for pre-answer                                                                         | Iteration 2+ |
| Thermodynamics Predictor: formula reference cleanup | Remove unused ΔG° = −RT ln K from reference card (or wire into grading)                                                                        | Iteration 2  |

### Verification (2026-04-17)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y3 bundle sizes: thermodynamics 318KB, gas-law 333KB, equilibrium 353KB, ph-titration 372KB, buffer 399KB. All well under 3MB ceiling.
- [x] Gas Law Challenge feedback now shows molecular-level "Af hverju" principle card tied to the specific law in play
- [x] Equilibrium Shifter Challenge mode locked until 5 Learning-mode problems completed
- [x] Thermodynamics Predictor wrong-answer feedback includes scenario-specific TΔS reasoning
- [x] pH Titration Level 1 now opens with a teaching card (equivalence point vs endpoint, 3 acid-base combos)
- [x] pH Titration Level 2 marking phase discloses volume tolerance upfront
- [x] Buffer Recipe Creator Level 3 opens with a dilution-formula intro bridging from L2 (mass) to L3 (volume)

---

## Iteration 2: Technical Quality & Code Health — 2026-04-17

### Review Ratings

| Game                     | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical   | P7 Accessible |
| ------------------------ | -------- | ------- | -------------- | ---------- | -------- | -------------- | ------------- |
| Gas Law Challenge        | PASS     | PASS    | FAIL           | PARTIAL    | PASS     | FAIL → PARTIAL | PASS          |
| Equilibrium Shifter      | PASS     | PASS    | PASS           | PASS       | PASS     | PASS           | PASS          |
| Thermodynamics Predictor | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PARTIAL → PASS | PASS          |
| pH Titration             | PARTIAL  | PASS    | PASS           | PASS       | PASS     | PARTIAL → PASS | PASS          |
| Buffer Recipe Creator    | PASS     | PASS    | PARTIAL        | PASS       | PASS     | PARTIAL → PASS | PASS          |

### Key Findings (Technical Focus)

**Cross-cutting:**

- 4 of 5 Y3 games had manual `loadProgress`/`saveProgress` + localStorage boilerplate in App.tsx (gas-law, buffer, ph-titration, thermo). Equilibrium-shifter already used the `useProgress` shared hook. Same pattern Y2 iter 2 fixed.
- Bilingual-translation infrastructure (`useGameI18n` + `gameTranslations`) is imported in all Y3 games but `t()` is largely unused — all UI text is hardcoded Icelandic. This is consistent with CLAUDE.md "Primary Language: Icelandic (all UI text must be in Icelandic)". The `language`/`setLanguage` state drives the `LanguageSwitcher` but has no visible effect. Out of scope for iter 2 — same pattern exists in Y2.
- Two reviewer claims were false positives (discarded):
  - pH Titration "`type: 'polyprotic'` vs `'polyprotic-diprotic' | 'polyprotic-triprotic'` mismatch" — these are two unrelated types (Level3Challenge.type vs Titration.type) with non-intersecting unions. No mismatch.
  - Equilibrium Shifter "unused setters `setHintMultiplier`/`setHintsUsedTier`" — verified both setters are called (lines 164, 165, 351, 662). The Y2 iter-4 pattern of discarding only the getter was applied correctly.

**Per-game critical findings:**

1. **Gas Law Challenge**: Manual `loadStats`/`saveStats` (80+ lines of boilerplate); unsafe `Object.keys(GAS_LAW_INFO) as GasLaw[]` cast; 980-line monolithic App.tsx.
2. **Equilibrium Shifter**: Clean code; uses `useProgress` correctly. No critical issues.
3. **Thermodynamics Predictor**: Manual `loadProgress`/`saveProgress`; ~60 lines of dead CSS (`.entropy-container`, `.particle*`, `@keyframes vibrate/float/pulse-success/shake`) for a component that uses inline-styled `ParticleSimulation`.
4. **pH Titration**: Manual `loadProgress`/`saveProgress`; `titration.Ka3!` non-null assertion (acceptable under discriminated-union narrowing but imperfect).
5. **Buffer Recipe Creator**: Manual `loadProgress`/`saveProgress`; `correctAcidMoles?` / `correctBaseMoles?` optional-chained despite being required in `BufferProblem` type (dead defensive code).

### Triage

| #   | Game                     | Finding                                                                  | Disposition | Effort |
| --- | ------------------------ | ------------------------------------------------------------------------ | ----------- | ------ |
| 1   | pH Titration             | Manual localStorage → `useGameProgress` + applyLevelResult factory       | FIX         | S      |
| 2   | Buffer Recipe Creator    | Manual localStorage → `useGameProgress` + applyLevelResult               | FIX         | S      |
| 3   | Thermodynamics Predictor | Manual localStorage → `useGameProgress`                                  | FIX         | S      |
| 4   | Gas Law Challenge        | Manual `loadStats`/`saveStats` → `useGameProgress`                       | FIX         | S      |
| 5   | Thermodynamics Predictor | Dead CSS (`entropy-container`, particle classes, unused keyframes)       | FIX         | XS     |
| 6   | Buffer Recipe Creator    | Remove unnecessary optional chaining on required fields                  | FIX         | XS     |
| 7   | Gas Law Challenge        | Unsafe `Object.keys as GasLaw[]` cast → `Object.entries`                 | FIX         | XS     |
| 8   | pH Titration             | `titration.Ka3!` non-null assertion (discriminated-union limit)          | DEFER       | S      |
| 9   | Gas Law Challenge        | 980-line monolithic App.tsx (extract to Level components)                | DEFER       | L      |
| 10  | All Y3                   | `useGameI18n` imported but `t()` largely unused (Icelandic-only UI)      | DEFER       | M      |
| 11  | Thermodynamics Predictor | ΔG° = −RT ln K in formula card but K never graded                        | DEFER       | S      |
| 12  | pH Titration             | L3 hint multiplier bug (iter 1 deferred)                                 | DEFER       | S      |
| 13  | pH Titration             | L3 polyprotic data instances                                             | DEFER       | M      |
| 14  | Buffer Recipe Creator    | BufferCapacityVisualization absent in L2-L3                              | DEFER       | M      |
| 15  | All Y3 Level files       | Legacy `onComplete(score, maxScore?, hintsUsed?)` 3-arg signature        | DEFER       | M      |
| 16  | All Y3 Level files       | Unused `onCorrectAnswer?`/`onIncorrectAnswer?` props (Y2 iter-4 pattern) | DEFER       | M      |

**Disposition summary:** 7 FIX applied, 9 DEFER.

### Changes Applied

| #   | Game                     | Finding                               | Done                                                                                                                                                                                                            |
| --- | ------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | pH Titration             | Manual localStorage → useGameProgress | Yes — `useGameProgress<Progress>('ph-titration-progress', DEFAULT_PROGRESS)` with `applyLevelResult(levelKey, score, nextScreen)` factory replaces 3 near-identical level handlers.                             |
| 2   | Buffer Recipe Creator    | Manual localStorage → useGameProgress | Yes — same pattern + `handleResetProgress` wraps `resetProgress` with `window.confirm` guard (preserves original reset behavior).                                                                               |
| 3   | Thermodynamics Predictor | Manual localStorage → useGameProgress | Yes — `progress`/`updateProgress`/`resetProgress` replace manual load+save+setProgress; correct-answer branch now uses `updateProgress({ ... })` instead of `setProgress(prev => ...)`.                         |
| 4   | Gas Law Challenge        | Manual `loadStats`/`saveStats` → hook | Yes — `useGameProgress<GameStats>('gas-law-challenge-progress', DEFAULT_STATS)` renamed via destructure (`progress: stats`, `updateProgress: updateStats`, `resetProgress: resetStats`).                        |
| 5   | Thermodynamics Predictor | Dead CSS cleanup                      | Yes — removed `.entropy-container`, `.particle*`, `.pulse-success`, `.shake` classes + `@keyframes vibrate`/`float`/`pulse-success`/`shake` + legacy `#deltaGGraph` IDs + empty mobile block. ~60 lines.        |
| 6   | Buffer Recipe Creator    | Unnecessary optional chaining         | Yes — Level2.tsx: `problem.correctAcidMoles?.toFixed(4)` → `problem.correctAcidMoles.toFixed(4)` (same for Base). Type is required; optional chaining was dead defensive code.                                  |
| 7   | Gas Law Challenge        | Unsafe `Object.keys` cast             | Yes — changed `(Object.keys(GAS_LAW_INFO) as GasLaw[]).map(...)` → `Object.entries(GAS_LAW_INFO).map(([law, info]) => ...)` — avoids the blanket cast, keeps one local cast at `setSelectedLaw(law as GasLaw)`. |

### Deferred Items

| Finding                                                              | Reason                                                                                                    | Target       |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------ |
| Gas Law Challenge 980-line App.tsx monolith                          | Large refactor — extract to Level components                                                              | Iteration 3+ |
| Y3 Level files: 3-arg `onComplete(score, max?, hints?)` signature    | Cross-cutting across all 15 Y3 Level files; batch in iter 3 alongside onCorrectAnswer cleanup             | Iteration 3  |
| Y3 Level files: unused `onCorrectAnswer?`/`onIncorrectAnswer?` props | Same cross-cutting batch                                                                                  | Iteration 3  |
| All Y3: `useGameI18n` imported but `t()` unused                      | Repo-wide pattern; CLAUDE.md says Icelandic-only UI. Needs discussion before removing `LanguageSwitcher`. | Future       |
| Thermodynamics: ΔG° = −RT ln K in formula card but K not graded      | Design question — remove card or add K grading                                                            | Iteration 3  |
| pH Titration: L3 polyprotic data instances                           | Data authoring work                                                                                       | Iteration 3  |
| pH Titration: L3 hint multiplier bug                                 | Small bug — batch with data fixes                                                                         | Iteration 3  |
| Buffer: BufferCapacityVisualization absent in L2-L3                  | Integration design work                                                                                   | Iteration 3  |
| pH Titration: `Ka3!` non-null assertion                              | Discriminated-union refactor to separate di/tri types                                                     | Iteration 3  |

### Discarded (False Findings)

| Finding                                                                   | Reason discarded                                                                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| pH Titration `type: 'polyprotic'` vs union mismatch                       | Two unrelated types (Level3Challenge.type vs Titration.type); no conflict.                                               |
| Equilibrium Shifter `setHintMultiplier`/`setHintsUsedTier` unused setters | Both setters ARE called (lines 164, 165, 351, 662). Y2 iter-4 pattern (discarded getter, kept setter) applied correctly. |

### Verification (2026-04-17)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y3 bundle envelope unchanged or smaller: thermo 317KB (was 318), gas-law 333KB, equilibrium 353KB, ph-titration 371KB, buffer 398KB
- [x] All 5 Y3 games' App.tsx now use shared hooks (`useGameProgress` for 4, `useProgress` for equilibrium-shifter)
- [x] Thermodynamics styles.css trimmed of ~60 lines of dead CSS
- [x] Gas-law `Object.keys` cast eliminated; type safety preserved at single `as GasLaw` on the id passed to setter
- [x] Buffer Level2 optional chaining removed on required fields

---

## Iteration 3: UX & Accessibility — 2026-04-17

### Review Ratings

| Game                     | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical | P7 Accessible     |
| ------------------------ | -------- | ------- | -------------- | ---------- | -------- | ------------ | ----------------- |
| Gas Law Challenge        | PASS     | PASS    | FAIL           | PARTIAL    | PASS     | PARTIAL      | PARTIAL → PARTIAL |
| Equilibrium Shifter      | PASS     | PASS    | PASS           | PASS       | PASS     | PASS         | PARTIAL → PASS    |
| Thermodynamics Predictor | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | PARTIAL → PASS    |
| pH Titration             | PARTIAL  | PASS    | PASS           | PASS       | PASS     | PASS         | PARTIAL → PARTIAL |
| Buffer Recipe Creator    | PASS     | PASS    | PARTIAL        | PASS       | PASS     | PASS         | PARTIAL → PASS    |

### Key Findings (UX & Accessibility Focus)

**Cross-cutting:**

- Missing focus-visible rings on L1 MCQ/selection buttons across multiple games — keyboard-only users couldn't see where focus was.
- Color-only signals: Flask acidity/basicity (pH Titration), scenario badges (Thermodynamics), time urgency (Gas Law). All ran afoul of WCAG 2.1 SC 1.4.1.
- No `role="radio"` / `aria-checked` on tri-state button groups (Thermodynamics spontaneity). Feedback divs lacked `role="alert"` / `aria-live`.
- Three reviewer claims were **false positives** (discarded after verification):
  - Gas-law-challenge: "law selection buttons not keyboard-accessible" — native `<button>` elements handle Enter/Space natively via browser defaults.
  - Thermodynamics: "temperature slider not keyboard-accessible" — `<input type="range">` is natively keyboard-operable via arrow keys (what was missing was `aria-valuetext` for screen readers).
  - Buffer: "L1 molecule display lacks color-independent text fallback" — text labels "Sýra (HA)" / "Basi (A⁻)" already present at Level1.tsx:299–300.

**Per-game critical findings:**

1. **Gas Law Challenge**: Time-remaining indicator was color-only (red bg when <30s). Input field used placeholder only, no label element. Missing aria-live for timer in challenge mode.
2. **Equilibrium Shifter**: Stress buttons (12px padding) and prediction buttons (20px padding) both missed WCAG 2.5.5 44px minimum touch target. No aria-live when stress was applied — screen-reader user never learned the stress had been accepted.
3. **Thermodynamics Predictor**: Scenario badges showed only "Atburðarás 1" with no indication of meaning (color only). Slider had no `aria-label`/`aria-valuetext`. Spontaneity buttons lacked `role="radio"` + `aria-checked`. Feedback div missing `role="alert"` / `aria-live`.
4. **pH Titration**: Flask indicated acid/base only through solution color (aria-label existed for screen readers but nothing visible). L3 input had `<label>` as sibling with no `htmlFor`/`id` association. L1 MCQ buttons had no focus-visible outlines.
5. **Buffer Recipe Creator**: L1 add/remove buttons had no focus-visible outlines. (Molecule color legend is present — false finding; IMF-style indicator color legend is out of scope.)

### Triage

| #   | Game                     | Finding                                                   | Disposition | Effort |
| --- | ------------------------ | --------------------------------------------------------- | ----------- | ------ |
| 1   | Thermodynamics Predictor | Scenario badges color-only (WCAG 1.4.1)                   | FIX         | XS     |
| 2   | Thermodynamics Predictor | Slider lacks aria-label + aria-valuetext                  | FIX         | XS     |
| 3   | Thermodynamics Predictor | Spontaneity buttons lack role="radio" / aria-checked      | FIX         | S      |
| 4   | Thermodynamics Predictor | Feedback div missing role="alert"/aria-live               | FIX         | XS     |
| 5   | pH Titration             | Flask acidity/basicity color-only (visible text missing)  | FIX         | XS     |
| 6   | pH Titration             | L3 input lacks label htmlFor/id association               | FIX         | XS     |
| 7   | pH Titration             | L1 MCQ buttons missing focus-visible outlines             | FIX         | XS     |
| 8   | Gas Law Challenge        | Input field missing label element                         | FIX         | XS     |
| 9   | Gas Law Challenge        | Timer color-only urgency + missing aria-live              | FIX         | S      |
| 10  | Equilibrium Shifter      | Stress buttons + prediction buttons below 44px min-height | FIX         | XS     |
| 11  | Equilibrium Shifter      | Applied-stress status lacks aria-live                     | FIX         | XS     |
| 12  | Buffer Recipe Creator    | L1 add/remove buttons missing focus-visible outlines      | FIX         | XS     |
| 13  | pH Titration             | Flask visible; IndicatorSelector swatches title-only      | DEFER       | S      |
| 14  | pH Titration             | TitrationCurve not responsive at 375px                    | DEFER       | M      |
| 15  | Gas Law Challenge        | Particle simulator may overflow on mobile at high volumes | DEFER       | S      |
| 16  | Equilibrium Shifter      | Q vs K bar white-on-saturated contrast                    | DEFER       | S      |
| 17  | Equilibrium Shifter      | Challenge mode explanation auto-advance too fast (3s)     | DEFER       | XS     |

**Disposition summary:** 12 FIX applied, 5 DEFER.

### Changes Applied

| #   | Game                     | Finding                             | Done                                                                                                                                                                                            |
| --- | ------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Thermodynamics Predictor | Scenario badges color-only          | Yes — badge text now includes ΔH/ΔS shorthand: "Atburðarás 1: ΔH<0, ΔS>0" for each of 4 scenarios. Color retained as redundant signal; text now primary.                                        |
| 2   | Thermodynamics Predictor | Slider a11y                         | Yes — added `aria-label="Hitastig í Kelvinum"` and `aria-valuetext` reporting current K + °C to the temperature `<input type="range">`.                                                         |
| 3   | Thermodynamics Predictor | Spontaneity buttons radio semantics | Yes — wrapped the 3-button group in `role="radiogroup"` with `aria-label`; each button now has `role="radio"` + `aria-checked={userSpontaneity === '...'}`.                                     |
| 4   | Thermodynamics Predictor | Feedback alert semantics            | Yes — feedback `<div>` now has `role="alert"` + `aria-live="polite"` so the right/wrong announcement reaches assistive tech.                                                                    |
| 5   | pH Titration             | Flask visible acidity/basicity text | Yes — Flask.tsx now renders a third pill next to Rúmmál/pH labeled "Eðli" with Súr / Hlutlaus / Basísk based on pH (`<6.5` / `7.5-6.5` / `>7.5`). Flex layout wraps at mobile widths.           |
| 6   | pH Titration             | L3 input label association          | Yes — Level3.tsx: `<label htmlFor="ph-titration-l3-answer">` + input `id="ph-titration-l3-answer"`. Screen reader now announces "Svar (unit)" when focus lands on the input.                    |
| 7   | pH Titration             | L1 MCQ focus-visible                | Yes — added `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600` to the option button className.                                                             |
| 8   | Gas Law Challenge        | Input field label                   | Yes — heading `<h3>` now wraps a `<label htmlFor="gas-law-answer">`; input has matching `id` + `aria-label` including variable name and unit.                                                   |
| 9   | Gas Law Challenge        | Timer color + live region           | Yes — timer `<div>` now has `role="timer"`; `aria-live="assertive"` when ≤10 s; `aria-label` describes remaining seconds + urgency; visible ⚠️ prefix when <30 s (text signal alongside color). |
| 10  | Equilibrium Shifter      | Touch target min-height             | Yes — `.stress-btn` and `.predict-btn` CSS now include `min-height: 44px` so both meet WCAG 2.5.5 on mobile widths.                                                                             |
| 11  | Equilibrium Shifter      | Applied-stress aria-live            | Yes — applied-stress container `<div>` now has `role="status"` + `aria-live="polite"` so the newly-applied stress is announced to screen readers.                                               |
| 12  | Buffer Recipe Creator    | L1 focus-visible rings              | Yes — all 4 add/remove buttons (Sýra remove/add, Basi remove/add) now have `focus-visible:outline-2 focus-visible:outline-offset-2` with color-matched outline per button.                      |

### Deferred Items

| Finding                                                     | Reason                                                           | Target       |
| ----------------------------------------------------------- | ---------------------------------------------------------------- | ------------ |
| pH Titration IndicatorSelector swatches title-only          | Needs visible label layout rework                                | Iteration 4  |
| pH Titration TitrationCurve not responsive at 375px         | Component width is fixed 600px; requires shared-component change | Iteration 4+ |
| Gas Law particle simulator mobile overflow at high volumes  | Bounded already by container max-width; watch on real mobile     | Iteration 4  |
| Equilibrium Shifter Q vs K bar white-on-saturated contrast  | Needs contrast testing + palette redesign                        | Iteration 4  |
| Equilibrium Shifter challenge-mode 3s auto-advance too fast | Design call — balance timer pressure vs reading time             | Iteration 4  |

### Discarded (False Findings)

| Finding                                                            | Reason discarded                                                        |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Gas-law-challenge "law selection buttons not keyboard-accessible"  | Native `<button>` elements handle Enter/Space by default via browser.   |
| Thermodynamics "temperature slider not keyboard-accessible"        | `<input type="range">` is natively keyboard-operable via arrow keys.    |
| Buffer "L1 molecule display lacks color-independent text fallback" | Labels "Sýra (HA)" / "Basi (A⁻)" already present at Level1.tsx:299–300. |

### Verification (2026-04-17)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y3 bundle sizes: thermo 318KB, gas-law 333KB, equilibrium 353KB, ph-titration 372KB, buffer 399KB — ~100-400 byte increases from added `aria-*` attributes, all well under 3MB ceiling.
- [x] Thermodynamics scenario badges now announce ΔH/ΔS sign meaning alongside color
- [x] Thermodynamics slider reports Kelvin and Celsius value to screen readers via aria-valuetext
- [x] Thermodynamics spontaneity buttons form a proper radio group with aria-checked
- [x] pH Titration Flask displays visible Súr/Hlutlaus/Basísk eðli pill alongside pH
- [x] Gas Law Challenge timer speaks remaining seconds to screen readers at ≤10s assertive threshold; visible ⚠️ appears at <30s
- [x] Equilibrium Shifter stress and prediction buttons now meet 44px WCAG 2.5.5 touch target minimum

---

## Iteration 4: Polish & Cross-Cutting Cleanup — 2026-04-17

### Scope

Drain iter 1-3 deferred queue, focusing on cross-cutting legacy patterns (pH Titration + Buffer Level files) that Y1/Y2 iter 4 already cleaned up. No fresh reviews this iteration — the work is known from prior iterations.

### Changes Applied

#### Cross-cutting (6 Level files)

| #   | Game / File                                    | Finding                                                         | Done                                                                                                                                   |
| --- | ---------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | pH Titration Level1/L2/L3                      | Unused `onCorrectAnswer?` / `onIncorrectAnswer?` props          | Yes — removed from Props interfaces, destructuring, and call sites. Matches Y2 iter 4 pattern.                                         |
| 2   | Buffer Level1/L2/L3                            | Unused `onCorrectAnswer?` / `onIncorrectAnswer?` props          | Yes — removed from all three. Level1 previously used `onLevelComplete` instead of `onComplete`; kept name but trimmed to `(score) =>`. |
| 3   | pH Titration Level1/L2/L3                      | 3-arg `onComplete(score, maxScore?, hintsUsed?)` signature      | Yes — collapsed to `(score: number) => void` everywhere. Matches Y2 iter 4.                                                            |
| 4   | Buffer Level2/L3                               | 3-arg `onComplete(score, maxScore, hintsUsed)` signature        | Yes — collapsed to `(score: number) => void`.                                                                                          |
| 5   | pH Titration Level1/L2/L3, Buffer Level1/L2/L3 | Dead `hintsUsed` / `hintsUsedTotal` getters + `maxScore` locals | Yes — getters renamed to `[, setX]` where setter still writes; unused `maxScore` locals deleted. 6 files cleaned.                      |

#### Per-game polish

| #   | Game                     | Finding                                                     | Done                                                                                                                              |
| --- | ------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 6   | Thermodynamics Predictor | `ΔG° = −RT ln K` formula in reference card but never graded | Yes — removed from formula-reference card; added `ΔG° < 0 → sjálfviljugt` spontaneity rule as a more useful quick-reference item. |

### Discarded (verified false findings from prior iterations)

| Finding                                                          | Reason discarded                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| pH Titration "L1 hint multiplier not reset per challenge"        | Verified: `setHintMultiplier(1.0)` is called in `handleNext` at Level1.tsx:99. Works as intended. |
| pH Titration "L3 polyprotic type defined but never instantiated" | Verified: 2 polyprotic instances exist at level3-challenges.ts:144 and :177.                      |

### Deferred to a future iteration

These remain outside iter 4 scope — each needs dedicated design work:

| Finding                                                      | Reason                                                           |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| Gas Law Challenge: P3 scope restructure (6 laws in one game) | Design decision (split games or law-per-level)                   |
| Gas Law Challenge: 980-line App.tsx extraction               | Large refactor — extract to Level/Mode components                |
| Gas Law Challenge: pre-game interactive discovery            | Requires new manipulable PV=nRT component                        |
| Thermodynamics Predictor: pre-L1 guided discovery            | Requires new "manipulate T, observe ΔG" warm-up screen           |
| pH Titration: IndicatorSelector swatches title-only          | Needs visible label layout rework                                |
| pH Titration: TitrationCurve not responsive at 375px         | Shared component width is fixed 600px                            |
| Gas Law: particle simulator mobile overflow at high volumes  | Watch on real mobile hardware                                    |
| Equilibrium Shifter: Q vs K bar white-on-saturated contrast  | Needs contrast testing + palette redesign                        |
| Equilibrium Shifter: challenge-mode 3s auto-advance too fast | Design decision balancing timer pressure and reading time        |
| Buffer: BufferCapacityVisualization absent in L2-L3          | Integration design work                                          |
| All Y3: `useGameI18n` imported but `t()` largely unused      | Repo-wide pattern — needs project-level decision on bilingual UI |

### Verification (2026-04-17)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y3 bundle envelope unchanged: thermo 317KB, gas-law 333KB, equilibrium 353KB, ph-titration 372KB, buffer 399KB
- [x] All 6 Y3 Level files simplified to `onComplete: (score: number) => void`
- [x] All 6 Y3 Level files free of unused `onCorrectAnswer?` / `onIncorrectAnswer?` props
- [x] Thermodynamics formula reference no longer advertises ΔG° = −RT ln K (never graded); added spontaneity rule instead

### Done Criteria Check (per plan)

Per `~/.claude/plans/logical-wandering-llama.md`:

1. Most recent review has zero FAIL ratings across all games — **partial**: Gas Law Challenge retains P3 FAIL (6 laws in one game); all other Y3 games zero FAIL.
2. No REBUILD dispositions needed — **yes**: iter 4 had no REBUILDs; all FIX.
3. All verification checklists pass — **yes**.

Gas Law Challenge P3 failure requires a dedicated design decision (split games or law-per-level restructure). Tracked as a cross-iter concern; not blocking per the plan's escalation note. The remaining four Y3 games satisfy the stop criteria.
