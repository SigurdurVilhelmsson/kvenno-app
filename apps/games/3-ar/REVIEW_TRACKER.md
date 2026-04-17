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
