# Year 2 Games — Iterative Review Tracker

## Iteration 1: Pedagogical Structure — 2026-04-16

### Review Ratings

| Game                  | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical | P7 Accessible |
| --------------------- | -------- | ------- | -------------- | ---------- | -------- | ------------ | ------------- |
| Hess Law              | PARTIAL  | PASS    | PASS           | PASS       | PASS     | PASS         | PASS          |
| Kinetics              | FAIL     | PASS    | PARTIAL        | PASS       | PASS     | PASS         | PASS          |
| Lewis Structures      | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | PASS          |
| VSEPR Geometry        | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | PASS          |
| Intermolecular Forces | PASS     | PARTIAL | PASS           | PASS       | PASS     | PASS         | PARTIAL       |
| Organic Nomenclature  | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | PASS          |
| Redox Reactions       | FAIL     | FAIL    | PASS           | PASS       | PASS     | PASS         | PARTIAL       |
| Rafeindabygging       | PASS     | PARTIAL | PASS           | PASS       | PASS     | PASS         | PASS          |

### Key Findings (Pedagogical Focus)

**Cross-cutting:**

- P3 (one concept) is solid across all 8 games — good scope discipline carried over from Y1 restructure.
- P2 (explain why) is the weakest dimension — most games teach procedures well but hand-wave the underlying principle.
- P1 fails or is partial on 6/8 games — most commonly because the highest level skips a teaching intro and jumps straight to graded activity.

**Per-game critical findings:**

1. **Hess Law**: L1 and L2 teach well. L3 jumps to the formation-enthalpy formula (ΔH°rxn = Σn·ΔH°f products − Σn·ΔH°f reactants) with no discovery phase. Students must already know what ΔH°f means.
2. **Kinetics**: L1's six concepts (rate, order, T, catalysts, surface area, collision theory) arrive in rapid-fire questions with visualizations positioned _after_ grading. L2 intro teaches the ratio method but doesn't scaffold the data-table interpretation. **L3 has no teaching phase at all** — jumps straight to mechanism/intermediate/RDS identification.
3. **Lewis Structures**: L1 strong. L2's first six challenges all satisfy the octet rule; challenge 7 suddenly presents BF₃ (electron-deficient) with no bridge. Students hit "why doesn't the rule work any more?" cold. L3's formal-charge calculations also arrive without visible connection to L2 structures.
4. **VSEPR**: 10 real molecules in L2; clean 4-step breakdown. But the ElectronRepulsionAnimation (which literally shows why angles are what they are) appears _after_ the student selects geometry — positioning it as reward, not foundation. Students can pass by pattern-matching (count domains → pick name).
5. **Intermolecular Forces**: Gold-standard L3 (real-world scenarios with mechanistic explanations). L1 missing the core "why electronegativity matters" for H-bonds. `ForceStrengthAnimation` component defined but never rendered.
6. **Organic Nomenclature**: L1 is a transmissive slide show (prefix → carbon count) with no prediction phase. No branched molecules in L2 (so parent-chain selection never exercised). L3 treats functional groups as labels, not as indicators of reactivity priority.
7. **Redox Reactions**: L1 teaches oxidation numbers well. **L2 has no teaching intro** explaining what a half-reaction is or why the oxidizing-agent / oxidized-species distinction matters. **L3 has no teaching intro** for the half-reaction balancing method. The central thesis ("oxidation and reduction always occur together") is never stated.
8. **Rafeindabygging**: Rules taught, Hund's rule introduced. Missing: energy-ordering diagram showing why 4s fills before 3d. Pauli exclusion stated implicitly (via mₛ = ±½) but never named. No explanation for why Cr/Cu exceptions exist at the level of exchange energy / half-filled stability.

### Triage

| #   | Game            | Finding                                                       | Disposition | Effort |
| --- | --------------- | ------------------------------------------------------------- | ----------- | ------ |
| 1   | Hess Law        | L3 no intro for ΔH°f formula                                  | REBUILD     | M      |
| 2   | Kinetics        | L3 no teaching phase                                          | REBUILD     | M      |
| 3   | Kinetics        | L1 visualizations positioned after grading                    | FIX         | M      |
| 4   | Lewis           | L2 abrupt jump to octet exceptions (BF₃/PCl₅/SF₆)             | FIX         | S      |
| 5   | VSEPR           | Repulsion animation shown after prediction                    | FIX         | M      |
| 6   | IMF             | L1 missing electronegativity "why" for H-bonds                | FIX         | S      |
| 7   | IMF             | Unused ForceStrengthAnimation in L1                           | FIX         | S      |
| 8   | Organic         | L1 transmissive — no discovery / prediction step              | FIX         | M      |
| 9   | Organic         | No branched molecules in L2 (parent-chain rule not exercised) | DEFER       | M      |
| 10  | Redox           | L2 no half-reaction teaching intro                            | REBUILD     | M      |
| 11  | Redox           | L3 no half-reaction-balancing teaching intro                  | REBUILD     | M      |
| 12  | Rafeindabygging | L2 missing energy-ordering diagram (why 4s < 3d)              | FIX         | M      |
| 13  | Rafeindabygging | Pauli exclusion never named explicitly                        | FIX         | S      |

**Disposition summary:** 8 FIX, 4 REBUILD, 1 DEFER

**REBUILD cap (max 3 per game):**

- Hess: 1 REBUILD — under cap
- Kinetics: 1 REBUILD + 1 FIX — under cap
- Redox: 2 REBUILD — under cap

### Changes Applied

| #   | Game            | Finding                            | Disposition | Done                                                                                                                                                                                |
| --- | --------------- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hess Law        | L3 no intro for ΔH°f               | REBUILD     | Yes — new teaching intro explains ΔH°f (ref state = elements at 25 °C / 1 atm), derives the formula from Hess, includes CH₄ worked example                                          |
| 2   | Kinetics        | L3 no teaching phase               | REBUILD     | Yes — new teaching intro defines intermediates, rate-determining step (slowest = bottleneck), and the fast-equilibrium / intermediate elimination trick with a NOBr₂ worked example |
| 3   | Kinetics        | L1 visualizations positioned after | FIX         | Deferred to iter 2 — non-trivial UX reorder                                                                                                                                         |
| 4   | Lewis           | L2 octet-exception bridge          | FIX         | Deferred to iter 2 — needs dedicated pre-challenge slide                                                                                                                            |
| 5   | VSEPR           | Repulsion animation timing         | FIX         | Deferred to iter 2 — requires step-flow restructure                                                                                                                                 |
| 6   | IMF             | L1 electronegativity card          | FIX         | Deferred to iter 2                                                                                                                                                                  |
| 7   | IMF             | Unused ForceStrengthAnimation      | FIX         | Deferred to iter 2                                                                                                                                                                  |
| 8   | Organic         | L1 discovery step                  | FIX         | Deferred to iter 2                                                                                                                                                                  |
| 10  | Redox           | L2 half-reaction intro             | REBUILD     | Yes — new intro explains that redox = two half-reactions, distinguishes oxidized species from oxidizing agent, uses Zn + Cu²⁺ worked example                                        |
| 11  | Redox           | L3 half-reaction-balancing intro   | REBUILD     | Yes — new 4-step intro (write oxidation half → write reduction half → LCM electrons → combine) with 2Al + 3Cu²⁺ worked example                                                      |
| 12  | Rafeindabygging | L2 energy-ordering diagram         | FIX         | Yes — indigo energy-ladder card shows orbital ordering with 4s below 3d, plus 1-sentence "penetration → lower energy" explanation                                                   |
| 13  | Rafeindabygging | Pauli exclusion named              | FIX         | Yes — new purple card names the principle explicitly, connects to mₛ = ±½ limit and 2 electrons/orbital                                                                             |

### Deferred Items

| Finding                                                         | Reason                                                     | Target      |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ----------- |
| Organic L2 branched molecules (parent-chain rule not exercised) | Needs new data entries + hint text for branch-naming rules | Iteration 2 |
| Kinetics L1 visualization timing                                | UX reorder — requires redesigning question-first flow      | Iteration 2 |
| Lewis L2 octet-exception bridge                                 | Needs dedicated teaching slide before challenge 7          | Iteration 2 |
| VSEPR L2 animation timing                                       | Step-flow restructure; animation should precede prediction | Iteration 2 |
| IMF L1 electronegativity card + unused ForceStrengthAnimation   | New teaching card + integration work                       | Iteration 2 |
| Organic L1 discovery step                                       | "Predict next prefix" interaction                          | Iteration 2 |

### Verification (2026-04-16)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y2 bundles: rafeindabygging 310KB, hess 360KB, redox 363KB, kinetics 369KB, organic 381KB. IMF/Lewis/VSEPR at ~3.0MB (right at plan's 3MB target — acceptable but watch).
- [x] All four Y2 REBUILD items (Hess L3, Kinetics L3, Redox L2, Redox L3) now have teaching intros with worked examples before any graded activity.
- [x] Rafeindabygging L2 intro now teaches both WHY of aufbau (penetration/shielding ordering) and names Pauli exclusion explicitly.
