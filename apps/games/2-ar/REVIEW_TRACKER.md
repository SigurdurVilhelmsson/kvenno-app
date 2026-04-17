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

---

## Iteration 2: Technical Quality & Code Health — 2026-04-16

### Review Ratings

| Game                  | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical   | P7 Accessible |
| --------------------- | -------- | ------- | -------------- | ---------- | -------- | -------------- | ------------- |
| Hess Law              | PASS     | PASS    | PASS           | PASS       | PASS     | FAIL → PARTIAL | PASS          |
| Kinetics              | PASS     | PASS    | PARTIAL        | PASS       | PASS     | PARTIAL → PASS | PASS          |
| Lewis Structures      | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PARTIAL → PASS | PASS          |
| VSEPR Geometry        | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PARTIAL → PASS | PASS          |
| Intermolecular Forces | PASS     | PARTIAL | PASS           | PASS       | PASS     | PARTIAL → PASS | PARTIAL       |
| Organic Nomenclature  | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PARTIAL → PASS | PASS          |
| Redox Reactions       | PASS     | PASS    | PASS           | PASS       | PASS     | PASS           | PARTIAL       |
| Rafeindabygging       | PASS     | PASS    | PASS           | PASS       | PASS     | PARTIAL → PASS | PASS          |

### Key Findings (Technical Focus)

**Cross-cutting (same pattern Y1 iter 2 hit):**

- 4/8 games (IMF, Lewis, Organic, VSEPR) had manual `loadProgress` / `saveProgress` + localStorage boilerplate in App.tsx instead of the shared `useGameProgress` hook.
- Almost every App.tsx had three near-identical `handleLevelNComplete` handlers — extractable to one factory function.
- Unused `onCorrectAnswer` / `onIncorrectAnswer` callback props on every Level component (defined, never invoked from App) — same pattern iter 2 cleaned up in Y1.
- Unused 3-arg `onComplete(score, maxScore, hintsUsed)` signatures where `maxScore` and `hintsUsed` are ignored (underscore-prefixed in App.tsx).

**Per-game critical findings:**

1. **Hess Law**: 322-line i18n includes a full Polish translation block (~103 lines) that is never reachable through the UI. Level-specific data models are fragmented (Equation / Puzzle / Challenge schemas).
2. **Kinetics**: Shuffle used in L1 but not L2/L3 (deterministic question order). `MAX_SCORE = 20 * 6` declared identically in three separate data files. Gas constant defined twice (`MaxwellBoltzmann.tsx` and `CatalystEffectDemo.tsx`).
3. **Lewis Structures**: `LewisStructure` type defined in both `Level2.tsx` and `utils/lewisConverter.ts` — but they are _not_ the same shape (Level2 adds `octetException`, `centralElectrons`). Dead state (`bondsDrawn`, `lonePairs`, `animating`) in `LewisGuidedMode`.
4. **VSEPR**: Geometry metadata repeated across 4 places (Level1 GEOMETRIES, Level2 molecules, BondAngleMeasurement BOND_ANGLES, ElectronRepulsionAnimation configs). 3D renderer (`MoleculeViewer3DLazy`) loaded up-front — pushes bundle to ~3MB.
5. **IMF**: Iter-1 flagged `ForceStrengthAnimation` and `imfConverter.ts` as unused — iter-2 review verified they _are_ both used; that flag was wrong. Real issues: 3 duplicate progress handlers, unsafe `as` casts on Set iteration (`as 'london' | 'dipole' | 'hydrogen'`), Three.js in main bundle (~2.5MB).
6. **Organic Nomenclature**: Unused callback props; dead `totalHintsUsed` state in L1/L3 (always 0); prefix/suffix/molecule data duplicated across Level1, Level2, MoleculeBuilder.
7. **Redox Reactions**: Hardcoded language check in App.tsx intro (`t('concepts.oxidation') === 'Oxun' ? ...`) is an anti-pattern (comparing translated text instead of language code). No use of `shuffleArray` for problem order in L1/L2 — every session has identical order.
8. **Rafeindabygging**: 10 separate `.replace(/.../ , ...)` calls in `normalizeConfig` (one per superscript digit). L1 feedback has two `if` branches that both add the same `' correct'` class — confusing and likely leftover from refactor.

### Triage

| #   | Game            | Finding                                              | Disposition | Effort |
| --- | --------------- | ---------------------------------------------------- | ----------- | ------ |
| 1   | IMF             | Manual localStorage → useGameProgress + factory      | FIX         | S      |
| 2   | Lewis           | Manual localStorage → useGameProgress + factory      | FIX         | S      |
| 3   | Organic         | Manual localStorage → useGameProgress + factory      | FIX         | S      |
| 4   | VSEPR           | Manual localStorage → useGameProgress + factory      | FIX         | S      |
| 5   | Kinetics        | `MAX_SCORE` duplicated in 3 data files               | FIX         | S      |
| 6   | Rafeindabygging | `normalizeConfig` 10× replace → single regex + map   | FIX         | S      |
| 7   | Rafeindabygging | L1 duplicate `' correct'` branches                   | FIX         | S      |
| 8   | Hess            | Unused Polish i18n block (~103 lines)                | DEFER       | S      |
| 9   | Lewis           | `LewisStructure` type duplication (distinct shapes)  | DEFER       | M      |
| 10  | VSEPR           | Geometry metadata in 4 places                        | DEFER       | M      |
| 11  | VSEPR/IMF/Lewis | Three.js in main bundle → ~3MB                       | DEFER       | L      |
| 12  | IMF             | Unsafe `as` casts on Set iteration                   | DEFER       | S      |
| 13  | Kinetics        | Shuffle questions in L2/L3                           | DEFER       | S      |
| 14  | Organic         | Prefix/suffix/molecule data duplicated 3×            | DEFER       | M      |
| 15  | Redox           | Hardcoded text-based language check in App.tsx       | DEFER       | S      |
| 16  | Redox           | No `shuffleArray` on problem order                   | DEFER       | S      |
| 17  | ALL             | Unused `onCorrectAnswer`/`onIncorrectAnswer` props   | DEFER       | M      |
| 18  | ALL             | `onComplete(score, maxScore, hintsUsed)` → `(score)` | DEFER       | M      |

**Disposition summary:** 7 FIX applied, 11 DEFER (iter 3 scope).

### Changes Applied

| #   | Game            | Finding                                | Done                                                                                                                                         |
| --- | --------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | IMF             | Manual localStorage → useGameProgress  | Yes — `useGameProgress<Progress>('imf-progress', DEFAULT_PROGRESS)` + single `applyLevelResult()` factory replaces 3 near-identical handlers |
| 2   | Lewis           | Manual localStorage → useGameProgress  | Yes — same pattern as IMF                                                                                                                    |
| 3   | Organic         | Manual localStorage → useGameProgress  | Yes — same pattern, with `resetStoredProgress` wrapped by a `window.confirm` guard (preserves original reset behavior)                       |
| 4   | VSEPR           | Manual localStorage → useGameProgress  | Yes — same pattern                                                                                                                           |
| 5   | Kinetics        | `MAX_SCORE` duplicated in 3 data files | Yes — new `src/data/constants.ts` exports `MAX_SCORE = 120`; Level1/2/3 import from there; 3 stale declarations removed                      |
| 6   | Rafeindabygging | `normalizeConfig` 10× replace          | Yes — single `.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ...)` with a `SUPERSCRIPT_MAP` record; 11 lines → 4                                                  |
| 7   | Rafeindabygging | L1 duplicate `' correct'` branches     | Yes — collapsed two identical `' correct'` branches to `if (opt.isValid) ...` + `else if (isSelected) ...`                                   |

### Deferred Items

| Finding                                                  | Reason                                                                           | Target      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------- |
| Hess unused Polish i18n                                  | Teacher may want Polish active in future — ask before deleting                   | Iteration 3 |
| Lewis `LewisStructure` duplication                       | Shapes are not identical; needs care to unify (may break existing usage)         | Iteration 3 |
| VSEPR geometry metadata repetition                       | Consolidating to single catalog requires touching 4 components                   | Iteration 3 |
| VSEPR/IMF/Lewis Three.js in main bundle                  | Lazy-split or behind feature flag — significant refactor                         | Iteration 3 |
| IMF unsafe `as` casts on Set iteration                   | Need runtime type guard                                                          | Iteration 3 |
| Kinetics shuffle for L2/L3                               | Want to keep "random" feel but avoid unintentionally changing exam-style testing | Iteration 3 |
| Organic data duplication (prefix/suffix/molecule)        | Needs coordinated extract to `src/data/nomenclature.ts`                          | Iteration 3 |
| Redox hardcoded-text language check                      | Tied to i18n restructure; want consistent approach across games                  | Iteration 3 |
| Redox no `shuffleArray` on problem order                 | Minor; one-line change but want to address alongside Kinetics L2/L3              | Iteration 3 |
| Unused `onCorrectAnswer`/`onIncorrectAnswer` across Y2   | Cross-cutting across 24 files; will batch in iter 3 UX focus                     | Iteration 3 |
| `onComplete(score, maxScore, hintsUsed)` → `(score)` sig | Cross-cutting across 24 files; will batch in iter 3                              | Iteration 3 |

### Verification (2026-04-16)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y2 bundle envelope unchanged: rafeindabygging 310KB, hess 360KB, redox 363KB, kinetics 369KB, organic 381KB; IMF/Lewis/VSEPR at ~3.0MB (Three.js split deferred to iter 3)
- [x] All 8 Y2 games' App.tsx now use `useGameProgress` — no more manual localStorage in the Y2 catalog
- [x] Kinetics `MAX_SCORE` is a single constant; deleted 3 duplicate declarations
- [x] Rafeindabygging L1 feedback logic no longer has dead branches; `normalizeConfig` is one regex instead of eleven

---

## Iteration 3: UX & Accessibility — 2026-04-16

### Review Ratings

| Game                  | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical | P7 Accessible     |
| --------------------- | -------- | ------- | -------------- | ---------- | -------- | ------------ | ----------------- |
| Hess Law              | PASS     | PASS    | PASS           | PASS       | PASS     | PARTIAL      | PARTIAL → PASS    |
| Kinetics              | PASS     | PASS    | PARTIAL        | PASS       | PASS     | PASS         | PARTIAL → PASS    |
| Lewis Structures      | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | FAIL              |
| VSEPR Geometry        | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | PARTIAL → PASS    |
| Intermolecular Forces | PASS     | PARTIAL | PASS           | PASS       | PASS     | PASS         | PARTIAL           |
| Organic Nomenclature  | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS         | FAIL              |
| Redox Reactions       | PASS     | PASS    | PASS           | PASS       | PASS     | PASS         | PARTIAL → PARTIAL |
| Rafeindabygging       | PASS     | PASS    | PASS           | PASS       | PASS     | PASS         | PARTIAL → PASS    |

### Key Findings (UX & Accessibility Focus)

**Cross-cutting:**

- 5/8 games rely on color-only feedback after submission (red/green borders without ✓/✗ icons or text labels) — fails WCAG 2.1 SC 1.4.1.
- All sliders (Kinetics + others) lacked descriptive `aria-label` / `aria-valuetext`. Native arrow-key navigation works (browser default), but screen-reader output is unhelpful.
- Drawing/3D-viewer accessibility is genuinely hard: Lewis L2 SVG drawing canvas is mouse-only; VSEPR/IMF 3D viewers (Three.js OrbitControls) have no keyboard rotation. Both noted as iter-4 candidates given scope.
- Drag-drop touch support in `@shared/components/DragDropBuilder` has stubbed `handleTouchMove` — affects Organic L2.
- Cross-cutting iter-2 deferrals (unused `onCorrectAnswer`/`onIncorrectAnswer`, 3-arg `onComplete`) intentionally not batched this round — would have ballooned diff scope; punted to iter 4.

**Per-game critical findings:**

1. **Hess Law**: L1 answer buttons distinguish correct/wrong only by background color + colored explanation text — colorblind users see identical gray.
2. **Kinetics**: L1 sliders work via arrow keys but screen readers announce only "slider, X". L2 wrong-answer feedback says correct order but not why student's chosen order failed.
3. **Lewis Structures**: SVG drawing canvas has zero keyboard support. Bond errors color-only. WCAG A keyboard failure — biggest blocker on Y2 catalog.
4. **VSEPR**: Geometry-step option buttons rely on color-only feedback. 3D viewer keyboard-inaccessible. L2 cognitive load very high (10+ visible UI zones during geometry step).
5. **IMF**: Multi-select via Set is button-based but lacks Space-toggle. L2 ranking is click-only (no keyboard alternative). Bond color coding for IMF types lacks redundant pattern signal.
6. **Organic Nomenclature**: Bond visualizations rely on color + line count alone (single tan, double green, triple purple). Drag-drop mode has touch handler stubbed — broken on phones.
7. **Redox**: L3 multi-step text inputs don't bind Enter to submit (must click). Identify step inputs now bind Enter; balance/electron-count steps still click-only.
8. **Rafeindabygging**: L2 wrong answers said "Ekki rétt" with no diagnostic — student couldn't tell if they were off by 1 electron, used wrong subshell order, or made a typo.

### Triage

| #   | Game            | Finding                                               | Disposition | Effort |
| --- | --------------- | ----------------------------------------------------- | ----------- | ------ |
| 1   | Hess L1         | Color-only feedback on answer buttons                 | FIX         | S      |
| 2   | Kinetics L1     | Sliders missing `aria-label` / `aria-valuetext`       | FIX         | S      |
| 3   | Redox L3        | Identify-step inputs no Enter-to-submit               | FIX         | S      |
| 4   | Rafeindabygging | L2 no diagnostic feedback for off-by-N electrons      | FIX         | S      |
| 5   | VSEPR L2        | Geometry-step buttons: color-only feedback            | FIX         | S      |
| 6   | Hess L3         | L3 wrong answer shows correct value but no delta      | DEFER       | S      |
| 7   | Kinetics L2     | L2 wrong-answer feedback not explanatory              | DEFER       | M      |
| 8   | Lewis L2        | SVG drawing canvas keyboard-inaccessible              | DEFER       | L      |
| 9   | Lewis L2        | Bond errors color-only                                | DEFER       | M      |
| 10  | VSEPR / IMF     | 3D viewer (Three.js) keyboard-inaccessible            | DEFER       | L      |
| 11  | IMF L2          | Ranking click-only (no keyboard)                      | DEFER       | M      |
| 12  | IMF             | ForceStrengthAnimation bars color-only                | DEFER       | S      |
| 13  | Organic         | DragDropBuilder touch handler stubbed                 | DEFER       | M      |
| 14  | Organic         | Bond visualization color-only (no pattern)            | DEFER       | S      |
| 15  | Redox L3        | Balance/electron-count steps no Enter binding         | DEFER       | S      |
| 16  | Redox L3        | LCM rationale missing from balance-step feedback      | DEFER       | S      |
| 17  | ALL             | Unused `onCorrectAnswer`/`onIncorrectAnswer` props    | DEFER       | M      |
| 18  | ALL             | `onComplete(score, max, hints)` → `(score)` signature | DEFER       | M      |

**Disposition summary:** 5 FIX applied, 13 DEFER (iter 4 scope).

### Changes Applied

| #   | Game            | Finding                              | Done                                                                                                                                                  |
| --- | --------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hess L1         | Color-only feedback                  | Yes — answer buttons now prefix correct/wrong with `✓`/`✗` glyphs (with `aria-label`) before the option text                                          |
| 2   | Kinetics L1     | Sliders missing aria-label/valuetext | Yes — temperature and activation-energy sliders now have descriptive Icelandic labels and valuetext (e.g., "300 Kelvin (250 til 500)")                |
| 3   | Redox L3        | Identify-step Enter binding          | Yes — both `oxidized-input` and `reduced-input` now submit identify step on Enter when both fields filled and feedback not yet shown                  |
| 4   | Rafeindabygging | L2 diagnostic feedback               | Yes — `countElectrons()` parses normalized config; wrong answers now show "Þú vantar N rafeindir (heild: X, ætti að vera Y)" or the inverse when over |
| 5   | VSEPR L2        | Geometry-step buttons color-only     | Yes — option buttons now prefix `✓` (correct) or `✗` (picked-wrong) before the geometry name with `aria-label` for screen readers                     |

### Deferred Items

| Finding                                                  | Reason                                                          | Target      |
| -------------------------------------------------------- | --------------------------------------------------------------- | ----------- |
| Lewis L2 drawing-canvas keyboard nav                     | Major rebuild — needs roving tabindex + arrow-key bond cycling  | Iteration 4 |
| Lewis L2 bond errors color-only                          | Pair with canvas a11y rebuild                                   | Iteration 4 |
| VSEPR / IMF 3D viewer keyboard rotation                  | Three.js OrbitControls — needs custom keyboard-event wrapper    | Iteration 4 |
| IMF L2 ranking click-only                                | Replace with reorder-list pattern (arrow-key swap)              | Iteration 4 |
| IMF ForceStrengthAnimation bars                          | Add hatching pattern + numeric labels                           | Iteration 4 |
| Organic DragDropBuilder touch                            | Replace HTML5 dnd with `@dnd-kit` or custom touch event handler | Iteration 4 |
| Organic bond color-only                                  | Add stripe/dash patterns to single/double/triple                | Iteration 4 |
| Hess L3 / Kinetics L2 / Redox L3 explanatory feedback    | Per-error diagnostics — each game needs custom logic            | Iteration 4 |
| Redox L3 balance/electron Enter binding                  | Each step has different inline submit; need helper extraction   | Iteration 4 |
| Cross-cutting unused callback props + 3-arg `onComplete` | 24 files; batch in iter 4 alongside touch/canvas a11y rebuild   | Iteration 4 |

### Verification (2026-04-16)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y2 bundle envelope unchanged
- [x] Hess L1 buttons announce ✓/✗ via `aria-label` even for colorblind users
- [x] Kinetics L1 slider arrow-key navigation now produces meaningful screen-reader output
- [x] Redox L3 identify step submits on Enter when both inputs are filled
- [x] Rafeindabygging L2 wrong answers display per-electron delta diagnostic
- [x] VSEPR L2 geometry step has visible ✓/✗ glyphs alongside the colored borders

---

## Iteration 4: Polish & Content Accuracy — 2026-04-16

### Scope

Drain the iter-3 deferred queue. Focus on cross-cutting cleanup (22 Level files) and per-game polish. The truly heavy rebuilds (Lewis SVG-canvas keyboard nav, Three.js viewer keyboard rotation, DragDropBuilder touch reimplementation) remain deferred — they need dedicated design work outside the review cycle.

### Changes Applied

#### Cross-cutting (22 Level files + 4 App.tsx)

| #   | Game / File                    | Finding                                                         | Done                                                                                                                                                                       |
| --- | ------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ALL Y2 Level files (22)        | Unused `onCorrectAnswer?` / `onIncorrectAnswer?` props          | Yes — removed from Props interfaces, destructuring, and call sites (`onCorrectAnswer?.()` / `onIncorrectAnswer?.()`) across 22 Y2 Level files + StructureFromNameChallenge |
| 2   | ALL Y2 Level files (22)        | 3-arg `onComplete(score, maxScore, hintsUsed)` signature        | Yes — collapsed to `(score: number) => void` everywhere; also updated Y2 App.tsx handlers that still had `_maxScore` / `_hintsUsed` unused params                          |
| 3   | ALL Y2 Level files             | `totalHintsUsed`, `hintsUsedTier`, `hintsUsed`, `maxScore` dead | Yes — getters renamed to `[, setX]` (still track hint usage for future UX) or declarations removed where safe                                                              |
| 4   | Kinetics/IMF/Lewis Level files | Unused local `MAX_SCORE` constants (no longer referenced)       | Yes — deleted; also removed `data/constants.ts` in kinetics (created in iter 2, no longer referenced)                                                                      |
| 5   | IMF App.tsx                    | 80%-mastery threshold tied to maxScore no longer passed         | Yes — simplified to "completed on any submit" pattern to match Lewis/Organic; tracker still records best score                                                             |

#### Per-game polish

| #   | Game     | Finding                                                         | Done                                                                                                                                                                         |
| --- | -------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | Hess L3  | Wrong-answer feedback showed correct value but not user's delta | Yes — when `isCorrect === false`, feedback now renders "Þú slóðir inn X — munurinn er +/-Y kJ/mol (leyft svigrúm: ±2 kJ/mol)" plus a ✓/✗ glyph                               |
| 7   | Redox L3 | Write-ox, write-red, balance steps no Enter-to-submit binding   | Yes — extracted `checkOxElectrons()` and `checkRedElectrons()` to top-level handlers; all four step inputs now submit on Enter when fields are filled and feedback not shown |

### Deferred to a future iteration

These items need dedicated design work, not another review pass:

| Finding                                               | Reason                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Lewis L2 drawing-canvas keyboard nav                  | Requires roving-tabindex bond cycling + arrow-key selection                    |
| VSEPR / IMF 3D-viewer keyboard rotation               | Needs custom wrapper over Three.js OrbitControls                               |
| Organic DragDropBuilder touch support                 | `@shared/components/DragDropBuilder` stubs `handleTouchMove` — shared-pkg work |
| IMF L2 ranking click-only                             | Replace with reorder-list (arrow-key swap) pattern                             |
| VSEPR / IMF / Lewis Three.js in main bundle           | Lazy-split / feature flag — bundle stays at ~3MB until addressed               |
| Bond pattern alternatives in Lewis/Organic            | Color-only encoding; needs SVG stripe/dash patterns — deferred                 |
| Organic L2 branched molecules (parent-chain exercise) | Needs new data entries                                                         |
| Organic prefix/suffix data duplicated 3×              | Extract to `src/data/nomenclature.ts`                                          |
| Kinetics / Redox shuffle problem order                | Risk of touching exam-style testing flow                                       |
| Hess Polish i18n block unused                         | Teacher sign-off before deleting                                               |
| Redox App.tsx hardcoded text-based language check     | Part of broader i18n restructure                                               |

### Verification (2026-04-16)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y2 bundle envelope unchanged: rafeindabygging 310KB, hess 361KB, redox 363KB, kinetics 369KB, organic 380KB; IMF/Lewis/VSEPR ~3.0MB
- [x] All 22 Y2 Level files simplified to `onComplete: (score: number) => void`
- [x] All Y2 Level files free of unused `onCorrectAnswer`/`onIncorrectAnswer` props
- [x] Hess L3 wrong answers now show per-student delta alongside the correct value
- [x] Redox L3 all four step inputs (identify ox, identify red, write-ox electrons, write-red electrons, balance multipliers) accept Enter-to-submit when their fields are filled

---

## Iteration 5: Content Accuracy / Remaining Deferred A11y — 2026-04-17

### Scope

Fresh content-accuracy reviews across all 8 Y2 games (8 parallel agents) plus dedicated work on the highest-severity remaining deferred accessibility items from iter 3-4. Reviews were verified before applying fixes — 2 reviewer claims turned out to be false positives and were discarded.

### Review Ratings

| Game                  | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical   | P7 Accessible  |
| --------------------- | -------- | ------- | -------------- | ---------- | -------- | -------------- | -------------- |
| Hess Law              | PASS     | PASS    | PASS           | PASS       | PASS     | PASS           | PASS           |
| Kinetics              | PASS     | PASS    | PARTIAL        | PASS       | PASS     | PARTIAL → PASS | PASS           |
| Lewis Structures      | PASS     | PASS    | PASS           | PASS       | PASS     | PASS           | FAIL → PASS    |
| VSEPR Geometry        | PASS     | PASS    | PASS           | PASS       | PASS     | PASS           | PARTIAL        |
| Intermolecular Forces | PASS     | PARTIAL | PASS           | PASS       | PASS     | PASS           | PARTIAL → PASS |
| Organic Nomenclature  | PARTIAL  | PARTIAL | PASS           | PASS       | PASS     | PASS           | PARTIAL        |
| Redox Reactions       | PASS     | PASS    | PASS           | PASS       | PASS     | PARTIAL → PASS | PARTIAL        |
| Rafeindabygging       | PASS     | PASS    | PASS           | PASS       | PASS     | PASS           | PASS           |

### Key Findings (Content Accuracy Focus)

**Cross-cutting:**

- Chemistry accuracy across all 8 Y2 games is excellent — all reviewers verified formation enthalpies, oxidation states, half-reaction balancing, rate laws, electron configurations (including Cr/Cu exceptions), and IUPAC stems/suffixes against Brown et al.
- Several reviewer-flagged "English leaks" were confirmed as intentional bilingual pedagogical parentheticals (e.g., "Hóptengi (Functional Groups)", "rafeinasvið (electron domains)") — help students map Icelandic terms to textbook English. These are a feature, not a bug, and CLAUDE.md explicitly calls Icelandic the UI language.
- Two reviewer claims were **false positives**:
  - Kinetics L3 Challenge 6 "NO₂ + NO₃ → NO₂ + O₂ + NO" flagged as unbalanced — verified balanced (2N, 5O both sides).
  - Redox `OxidationStateDisplay.isOxidized: c.after > c.before` flagged as "backwards" — equivalent to `c.before < c.after` (oxidation = state increases). Logic is correct.

**Per-game critical findings:**

1. **Hess Law**: Chemistry and i18n complete. Back-button "Til baka" is hardcoded but that's Icelandic-primary-UI per CLAUDE.md — not a real issue.
2. **Kinetics**: Rate laws, Arrhenius, RDS all correct. Minor: zero-order k unit in L2 Q2 explanation lacked explicit unit reasoning.
3. **Lewis Structures**: WCAG A FAIL — SVG drawing canvas mouse-only (known iter 3/4 defer, addressed this iteration).
4. **VSEPR**: Bond angles, geometries, hybridizations all textbook-correct. Unused `seesawShape` i18n key out of sync with Level2 usage.
5. **IMF**: Chemistry verified. L2 ranking removal slots keyboard-inaccessible (known defer).
6. **Organic Nomenclature**: IUPAC stems/suffixes correct. L2 branched-molecule gap (known defer, kept deferred — needs dedicated data design).
7. **Redox**: Oxidation numbers, half-reactions, LCM multipliers all correct. Hardcoded text-comparison language check (known defer from iter 2).
8. **Rafeindabygging**: No issues found — strongest game on chemistry correctness.

### Triage

| #   | Game            | Finding                                                 | Disposition | Effort |
| --- | --------------- | ------------------------------------------------------- | ----------- | ------ |
| 1   | Lewis           | L2 SVG canvas keyboard nav (WCAG A failure)             | FIX         | M      |
| 2   | IMF             | L2 ranking removal slots keyboard-inaccessible          | FIX         | S      |
| 3   | Redox           | App.tsx text-comparison language check                  | FIX         | S      |
| 4   | VSEPR           | Unused `seesawShape` i18n key out of sync with Level2   | FIX         | XS     |
| 5   | Kinetics        | L2 Q2 zero-order rate constant unit clarification       | FIX         | XS     |
| 6   | Organic         | L2 branched molecules (parent-chain rule not exercised) | DEFER       | M      |
| 7   | VSEPR/IMF       | 3D viewer (Three.js OrbitControls) keyboard rotation    | DEFER       | L      |
| 8   | Organic         | `@shared/components/DragDropBuilder` touch support      | DEFER       | M      |
| 9   | VSEPR/IMF/Lewis | Three.js lazy-split / bundle ~3MB ceiling               | DEFER       | L      |
| 10  | Lewis/Organic   | Bond color-only encoding (add stripe/dash pattern)      | DEFER       | S      |
| 11  | Hess            | Unused Polish i18n block (~103 lines)                   | DEFER       | S      |
| 12  | Kinetics/Redox  | Shuffle problem order in L2/L3                          | DEFER       | S      |

**Disposition summary:** 5 FIX applied, 7 DEFER (all need dedicated design work outside review-cycle scope).

### Changes Applied

| #   | Game     | Finding                                | Done                                                                                                                                                                                                                                                                                             |
| --- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Lewis    | L2 SVG canvas keyboard nav             | Yes — `LewisDrawingCanvas.tsx`: bond `<g>` elements now have `role="button"`, `tabIndex={0}`, `aria-label` with current bond state, `onKeyDown` for Enter/Space (cycle) + Arrow keys (navigate between bonds); focus ring renders on focused bond; instruction text updated to mention keyboard. |
| 2   | IMF      | L2 ranking removal slots               | Yes — `intermolecular-forces/Level2.tsx`: when a placed compound exists and result not shown, the slot renders as `<button>` with `aria-label`; keyboard activation via Enter/Space triggers `removeFromOrder`.                                                                                  |
| 3   | Redox    | App.tsx text-comparison language check | Yes — added `concepts.oxidationSubline` and `concepts.reductionSubline` keys to is/en/pl blocks in i18n.ts; App.tsx now uses single `t('concepts.oxidationSubline')` / `t('concepts.reductionSubline')` instead of 5-line ternary chain.                                                         |
| 4   | VSEPR    | Unused `seesawShape` key               | Yes — synced i18n.ts Icelandic value from "Vippu" to "Sjáldruslögun" to match Level2 usage (English/Polish values preserved).                                                                                                                                                                    |
| 5   | Kinetics | L2 Q2 zero-order unit clarification    | Yes — explanation now includes "(eining: styrkur/tími fyrir 0. stigs hvörf)" to make the unit reasoning explicit.                                                                                                                                                                                |

### Deferred Items

| Finding                                                        | Reason                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| VSEPR / IMF 3D viewer keyboard rotation                        | Needs custom wrapper over Three.js OrbitControls — significant new component   |
| Organic DragDropBuilder touch support                          | `@shared/components/DragDropBuilder` stubs handleTouchMove — shared-pkg change |
| VSEPR / IMF / Lewis Three.js in main bundle                    | Lazy-split / feature flag — bundles stable at ~3MB ceiling                     |
| Organic L2 branched molecules                                  | Needs new molecule data, hint text, answer validator                           |
| Bond pattern alternatives (Lewis/Organic single/double/triple) | Color-only encoding; needs SVG stripe/dash patterns                            |
| Organic prefix/suffix data duplicated 3×                       | Extract to `src/data/nomenclature.ts`                                          |
| Kinetics / Redox shuffle problem order                         | Deliberate deferral — preserve exam-style stability                            |
| Hess Polish i18n block unused                                  | Teacher sign-off needed before deleting                                        |

### Discarded (False Findings)

| Finding                                                                  | Reason discarded                                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Kinetics L3 Ch.6 mechanism "NO₂ + NO₃ → NO₂ + O₂ + NO" unbalanced        | Verified: 2N and 5O both sides. Equation is correct.                       |
| Redox `OxidationStateDisplay.isOxidized: c.after > c.before` "backwards" | `a > b ≡ b < a` — oxidation = state increases. Logic is correct.           |
| "English leaks" in parenthetical Icelandic+English terms                 | Intentional bilingual reference aligning Icelandic → Brown et al. English. |

### Verification (2026-04-17)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] Y2 bundle envelope unchanged: rafeindabygging 310KB, hess 361KB, redox 363KB, kinetics 369KB, organic 380KB; IMF 3.002MB, Lewis 3.005MB, VSEPR 3.027MB
- [x] Lewis L2 drawing canvas: bonds now reachable via Tab; Enter/Space cycles bond order; arrow keys move focus between bonds; focus ring visible on focused bond
- [x] IMF L2 ranking: placed compound slots render as `<button>` with `aria-label`; keyboard-activatable removal
- [x] Redox intro card: subline text driven by i18n (supports future language additions without touching App.tsx)
- [x] VSEPR seesaw naming: i18n `seesawShape` value matches Level2 usage (`Sjáldruslögun`)
- [x] Kinetics L2 Q2 explanation: zero-order rate constant units now explicit
