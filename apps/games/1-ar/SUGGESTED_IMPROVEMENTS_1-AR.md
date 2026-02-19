# Suggested Improvements (1-ar)

This document tracks incremental, game-by-game improvement ideas for Year 1 (1-ar) titles.

---

## Dimensional Analysis (games/1-ar/dimensional-analysis)

### Current State Analysis
The game has 3 levels:
- **Level 1**: Two phases - "learn" (lessons about dimensional analysis) + "quiz" (multiple choice questions). Uses tiered hints system with `HintSystem` component.
- **Level 2**: Prediction-based challenges where students predict target units after conversion.
- **Level 3**: Real-world multi-step problems with practice/competition modes.

### Suggestions

| Suggestion | Status | Analysis |
|------------|--------|----------|
| Add a short pre-challenge micro-lesson in Level 1 that explicitly introduces "conversion factors equal 1" before the first interaction. | **Partially implemented** | Level 1 already has a comprehensive "learn" phase with 4 lessons covering: basic concepts, step-by-step method, common conversions, and unit cancellation. The "conversion factors equal 1" concept is covered in lesson index 3 (einingahvarf). Consider adding a more explicit visual demonstration showing why 100cm/1m = 1. |
| Require a brief rationale in Level 2 (one-sentence or choice-based) after each unit prediction to reduce trial-and-error and reinforce cancellation logic. | **Recommended** | Currently Level 2 only requires clicking the predicted unit. Adding a "why" step would reduce guessing. Could be implemented as a follow-up multiple choice: "Which conversion did you use?" |
| Expand Level 2 contexts to include chemistry-specific unit changes (e.g., g to mol, mL to L for solutions) to connect to Brown's early stoichiometry sections. | **Recommended** | Current contexts (`CONTEXTS` array in Level2.tsx:16-38) include length, mass, volume, and time but not molar conversions. Adding g to mol requires introducing molar mass, which may be better suited for Level 3 or as a separate chemistry-focused context. |
| In Level 3 real-world tasks, include at least one multi-step laboratory scenario (e.g., dilution prep) with a diagram or table for data extraction. | **Partially addressed** | Level 3 `problems.ts` includes various real-world scenarios. Adding a dilution/lab scenario with visual data extraction would enhance the chemistry connection. Current UI supports images but no problems use them. |
| Add a "check your setup" visualization step in Level 3 that highlights units before numeric entry to reduce calculation-only focus. | **Recommended** | Currently Level 3 shows the problem and jumps straight to numeric input. A unit-path visualization (showing which conversions are needed) before calculation would reinforce the method. |

---

## Lausnir (games/1-ar/lausnir)

### Current State Analysis
The game covers solution chemistry with 3 levels:
- **Level 1**: Visual tank simulator with sliders for concentration/volume, "SolnTank" visualization with molecule counts.
- **Level 2**: Dilution/mixing challenges requiring volume/concentration calculations.
- **Level 3**: Real-world scenario problems (timed mode available).

### Suggestions

| Suggestion | Status | Analysis |
|------------|--------|----------|
| Make the "molecules x 0.01 = moles" mapping explicit (or replace with moles directly) to avoid misconceptions about concentration units. | **Worth investigating** | Level 1 (`Level1.tsx`) uses `concentration` directly in moles/L and displays `Math.round(moles * 100)` as molecule count. The relationship could be made clearer with a label like "100 molecules = 1 mol (simplified model)". |
| Use the per-challenge `conceptMessage` consistently and remove the unrelated pH statement in Level 1; replace with dilution/mixture principles (e.g., `C1V1=C2V2`). | **Needs verification** | Could not find `conceptMessage` in Level 1 code. The educational content appears embedded in UI. Adding consistent concept cards per challenge type would be beneficial. |
| Add a quick prediction step in Level 1 (increase/decrease/unchanged) before slider adjustments to reduce trial-and-error. | **Recommended** | Currently users can freely move sliders. Adding a prediction prompt ("If you add 50mL water, concentration will...") before the interaction would reinforce thinking-first approach. |
| In Level 2, require a one-sentence explanation or a follow-up numeric estimate to reinforce weighted-average reasoning in mixing scenarios. | **Recommended** | Level 2 challenges include mixing scenarios but jump directly to numeric answers. A brief "which solution contributes more?" prompt would help. |
| In Level 3, require unit setup or step entry (formula + units) before final submission to emphasize method, not just answer. | **Recommended** | Level 3 currently only validates final numeric answers. Adding a "select the formula to use" step would reinforce problem-solving methodology. |

---

## Molmassi (games/1-ar/molmassi)

### Current State Analysis
Comprehensive molar mass game with 3 levels:
- **Level 1**: Visual atom circles with colors/sizes, building molecules from elements, introduces atomic mass concept.
- **Level 2**: 4 challenge types: estimate_mass, order_molecules, calculate_simple, find_heaviest_atom. Shows calculation breakdown with approximate masses.
- **Level 3**: Full calculation mode with periodic table reference, practice/competition modes, difficulty selection.

### Suggestions

| Suggestion | Status | Analysis |
|------------|--------|----------|
| Add an explicit "molar mass concept" micro-lesson before Level 1 (1 mol = sum of atomic masses) with a worked example in Icelandic. | **Partially implemented** | Level 1 includes a "learn" phase with educational content about atoms and molar mass. The connection "1 mol = sum of atomic masses in grams" could be more explicitly stated. Current content focuses on building molecules visually. |
| In Level 1, show the numeric mass contribution per element (e.g., O x 2 = 32) next to atoms to reinforce additivity beyond visuals. | **Already implemented** | Level 1 shows atomic mass (`approxMass`) values. Level 2's `MoleculeWithBreakdown` component (Level2.tsx:154-188) explicitly shows the calculation breakdown: "O x 2 x approx16 = 32". Consider adding similar breakdown to Level 1 completion screens. |
| In Level 2 estimation tasks, require a brief reason choice (e.g., "largest contributor is Cl" or "rounded masses") to reduce guessing. | **Recommended** | Current `estimate_mass` challenges show 4 options but don't require reasoning. Adding a follow-up "Why is this the answer?" prompt would reduce random selection. |
| In Level 2 ordering tasks, add at least one isomer-like comparison (same atoms, different counts) to emphasize formula parsing. | **Recommended** | Current `LEVEL2_COMPOUNDS` (Level2.tsx:51-64) are all distinct formulas. Adding pairs like CH3OH vs C2H6 (different but similar) or different hydration states would test formula reading. |
| In Level 3, require students to set up the calculation (element list + atomic masses) before numeric entry to emphasize method over recall. | **Partially implemented** | Level 3 has a "Syna utreikning" (show calculation) hint button that reveals `CalculationBreakdown`. Could make the first step of showing elements mandatory before allowing answer entry. |

---

## Nafnakerfid (games/1-ar/nafnakerfid)

### Current State Analysis
Chemical nomenclature game with 3 levels:
- **Level 1**: Two phases - "learn" (4 naming rules: ionic-simple, ionic-variable, ionic-polyatomic, molecular) + "quiz" (10 questions with tiered hints).
- **Level 2**: Guided naming - 3 steps: identify compound type, build name, enter answer. 12 challenges covering all 4 types.
- **Level 3**: Memory matching game - pair formulas with names, shows compound category badges.

### Suggestions

| Suggestion | Status | Analysis |
|------------|--------|----------|
| Add a quick pre-quiz "classification warm-up" (metal vs nonmetal) to reinforce the decision rule before naming. | **Recommended** | Level 1's learn phase covers rules but doesn't have interactive classification practice. A quick drill "Is Na a metal or nonmetal?" before the quiz would help. |
| In Level 1 quiz, include at least one "why" prompt (explain the chosen suffix or prefix) instead of only multiple choice. | **Partially addressed** | Quiz questions include hints with `solution` field that explains the answer. Question 8 already asks "why" (af hverju heitir CO2...). Could add more reasoning-based questions. |
| In Level 2, require students to select oxidation state explicitly before entering the name for variable-charge metals. | **Already implemented** | Level 2 Step 2 ("build") explicitly shows oxidation state calculation for ionic-variable compounds (e.g., "3 Cl- leads to Fe3+ leads to (III)"). The step-by-step breakdown in `steps.nameParts` includes this reasoning. Consider making it a clickable selection rather than just display. |
| Add a short polyatomic ion drill (recognition to name) before Level 2 to reduce lookup reliance. | **Recommended** | Level 1 covers polyatomic ions in the learn phase but doesn't drill them separately. A flashcard-style drill for SO4 2- = sulfat, NO3- = nitrat would help memorization before Level 2. |
| In Level 3 memory game, show a brief "rule card" after each correct match to reinforce the naming rule, not just the pair. | **Partially implemented** | The match modal (`showMatchInfo`) displays `compound.info` and category type. Could expand to show the specific rule applied (e.g., "Jonefni: malmur + -id endingin"). |

---

## Takmarkandi (games/1-ar/takmarkandi)

### Current State Analysis
Limiting reactant game with 3 levels:
- **Level 1**: Visual challenges with 6 types: which_runs_out, count_times_r1/r2, which_is_limiting, count_products, count_excess. Uses tiered hints via `HintSystem`. Mastery-based progression (6/8 required).
- **Level 2**: Guided 5-step problems: calculate times for R1, R2, identify limiting, calculate products, calculate excess. Visual molecule representations.
- **Level 3**: Timed challenge mode with difficulty selection. Full problem solving with all steps at once.

### Suggestions

| Suggestion | Status | Analysis |
|------------|--------|----------|
| Add a short conceptual intro that distinguishes "limiting reactant" from "limiting reagent in moles" using a real reaction (e.g., H2 + O2 to H2O). | **Recommended** | Current game uses molecule counts which are conceptually equivalent to moles but not explicitly connected. A brief intro explaining "counting molecules is like counting moles" would bridge the gap to textbook stoichiometry. |
| In Level 1, include one visual "before/after" bar or ratio strip showing how coefficients scale counts to reduce formula-only reliance. | **Partially implemented** | Level 1 shows molecule visualizations with `Molecule` components and displays coefficients. Level 2's completion screen (lines 314-405) shows a nice "after reaction" visualization with remaining molecules. Consider adding similar visual to Level 1 feedback. |
| In Level 2, require students to explain why the limiting reactant is limiting (e.g., "fewer reaction runs") before proceeding. | **Partially implemented** | Level 2 Step 3 (limiting selection) shows the comparison directly ("4 skipti vs 2 skipti") and requires selection. The formula hint explicitly states "FAERRI skipti". Could add a required explanation selection after choosing. |
| Add at least one Level 2 or Level 3 scenario based on lab quantities (grams or moles) to connect to stoichiometry in Brown. | **Recommended** | All current problems use molecule counts. Adding problems that start with masses (e.g., "5.0 g of NaCl") and require molar mass conversion would connect to real stoichiometry calculations. Would require adding molar mass data to reactions. |
| In Level 3, add a "setup check" step that verifies student-selected stoichiometric ratios before answer submission. | **Recommended** | Level 3 currently allows free-form entry of all answers at once. A structured approach (select limiting first, then products, then excess) would reinforce the method. Level 2 already does this well - Level 3 could benefit from similar scaffolding at lower difficulties. |

---

## Priority Summary

### High Priority (significant learning impact)
1. **Molmassi L2**: Add reasoning prompts after estimation tasks
2. **Nafnakerfid L1**: Add metal/nonmetal classification warm-up
3. **Takmarkandi L2-3**: Add gram/mole-based scenarios for textbook connection
4. **Dimensional Analysis L2**: Add rationale step after unit prediction
5. **Lausnir L1**: Add prediction step before slider adjustments

### Medium Priority (enhance existing features)
1. **Dimensional Analysis L3**: Add unit-path visualization before calculation
2. **Molmassi L2**: Add isomer-like comparisons in ordering tasks
3. **Nafnakerfid L2**: Make oxidation state selection interactive
4. **Nafnakerfid L3**: Expand rule display after matches
5. **Takmarkandi L1**: Add before/after visualization to feedback

### Lower Priority (already partially addressed or minor)
1. **Dimensional Analysis L1**: Enhance "conversion factors = 1" visualization
2. **Molmassi L1**: Add calculation breakdown to completion screens
3. **Lausnir L2-3**: Add formula selection/explanation steps
4. **Nafnakerfid**: Add polyatomic ion flashcard drill

---

*Last updated: Based on code analysis of all 5 games*
