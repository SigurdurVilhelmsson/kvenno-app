# Year 1 Games — Iterative Review Tracker

## Iteration 1: Pedagogical Structure — 2026-04-15

### Review Ratings

| Game            | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical | P7 Accessible |
| --------------- | -------- | ------- | -------------- | ---------- | -------- | ------------ | ------------- |
| Einingagreining | PARTIAL  | FAIL    | PASS           | PARTIAL    | PARTIAL  | PARTIAL      | PARTIAL       |
| Lotukerfid      | FAIL     | FAIL    | PASS           | PARTIAL    | FAIL     | PARTIAL      | FAIL          |
| Nafnakerfid     | PARTIAL  | PARTIAL | PASS           | FAIL       | PASS     | PARTIAL      | PARTIAL       |
| Molmassi        | FAIL     | FAIL    | PASS           | PARTIAL    | PARTIAL  | PARTIAL      | FAIL          |
| Jafna Jofnur    | PARTIAL  | FAIL    | PASS           | PARTIAL    | PARTIAL  | FAIL         | PARTIAL       |
| Takmarkandi     | FAIL     | FAIL    | PASS           | PARTIAL    | PARTIAL  | PARTIAL      | PARTIAL       |
| Lausnir         | PARTIAL  | PARTIAL | PARTIAL        | PARTIAL    | PASS     | PARTIAL      | PARTIAL       |

### Key Findings (Pedagogical Focus)

**Cross-cutting:**

- All 7 games pass P3 (one concept) — good scope discipline
- All 7 games fail or partially fail P2 (explain why) — procedures taught, principles not
- 4/7 games fail P1 (teach before test) — Levels 2-3 drop scaffolding abruptly
- Dead code (unused CSS animations, abandoned features) in all games
- Code duplication across all games (shuffle, progress, state management)

**Per-game critical findings:**

1. **Einingagreining**: L1 excellent (visual discovery), L2-L3 regress to text quizzes. Confetti/number-morph animations serve no learning purpose. Explanation grading uses brittle keyword matching.

2. **Lotukerfid**: L1 has ZERO teaching — drops students into "find element X" with no intro. Color-only element categories (inaccessible). No hint system at all.

3. **Nafnakerfid**: ~900 lines of molecular structure visualization (ball-and-stick) that has zero relevance to learning naming rules. Assumes prerequisite vocabulary (Greek prefixes, polyatomic ions) without teaching it. Level 2 challenges hardcoded inline instead of data-driven.

4. **Molmassi**: L2 introduces dimensional analysis and Avogadro's number with NO teaching phase. L3 hard-codes 15 problems inline. Hydrate formula parsing is fragile string manipulation. Unused CSS animations (confetti, wiggle, etc.).

5. **Jafna Jofnur**: Atom counter is excellent. But 3 level components are 95% identical code (massive DRY violation). ~100 lines of unused CSS animations. No strategy instruction (balance metals first, then nonmetals, then O/H). Feedback is binary ("Rétt"/"Rangt") with no diagnostic detail.

6. **Takmarkandi**: Never explains WHY limiting reagent matters. Entire molar-masses.ts defined but never imported. Menu promises "choose difficulty & race against time" but neither exists. Optional reaction animation is 250+ lines for low pedagogical value.

7. **Lausnir**: Best pedagogical design overall. But L1 uses arbitrary "sameindir" units that don't connect to L3's real units (grams, moles). Temperature-solubility content in L2 is partial scope creep. L1 has too many simultaneous UI elements.

### Triage

| #   | Game            | Finding                                                    | Disposition | Effort |
| --- | --------------- | ---------------------------------------------------------- | ----------- | ------ |
| 1   | Einingagreining | L2-L3 are quizzes, not teaching                            | REBUILD     | L      |
| 2   | Einingagreining | Confetti/morph animations don't serve learning             | REMOVE      | S      |
| 3   | Einingagreining | Keyword-matching explanation grading                       | FIX         | M      |
| 4   | Einingagreining | Hint system gives away full solutions at tier 3+           | FIX         | S      |
| 5   | Lotukerfid      | L1 has no teaching intro                                   | REBUILD     | M      |
| 6   | Lotukerfid      | No hint system at all                                      | REBUILD     | M      |
| 7   | Lotukerfid      | Color-only element categories                              | FIX         | M      |
| 8   | Nafnakerfid     | 900 lines molecular visualization irrelevant to naming     | REMOVE      | S      |
| 9   | Nafnakerfid     | Prerequisites (Greek prefixes, polyatomic ions) not taught | REBUILD     | L      |
| 10  | Nafnakerfid     | L2 challenges hardcoded inline                             | FIX         | M      |
| 11  | Molmassi        | L2 has no teaching phase for new concepts                  | REBUILD     | M      |
| 12  | Molmassi        | L3 problems hard-coded inline                              | FIX         | M      |
| 13  | Molmassi        | Unused CSS animations                                      | REMOVE      | S      |
| 14  | Molmassi        | Hydrate parsing fragile                                    | DEFER       | M      |
| 15  | Jafna Jofnur    | 3 level components are 95% identical                       | REBUILD     | M      |
| 16  | Jafna Jofnur    | ~100 lines unused CSS                                      | REMOVE      | S      |
| 17  | Jafna Jofnur    | No strategy instruction for balancing method               | REBUILD     | M      |
| 18  | Jafna Jofnur    | Binary feedback, no diagnostics                            | FIX         | M      |
| 19  | Takmarkandi     | Never explains WHY limiting reagent matters                | REBUILD     | M      |
| 20  | Takmarkandi     | molar-masses.ts defined but never used                     | REMOVE      | S      |
| 21  | Takmarkandi     | Menu promises features that don't exist                    | FIX         | S      |
| 22  | Takmarkandi     | Reaction animation 250+ lines for low value                | REMOVE      | S      |
| 23  | Lausnir         | L1 "sameindir" units disconnect from L3 real units         | REBUILD     | L      |
| 24  | Lausnir         | Temperature-solubility content is scope creep in L2        | DEFER       | L      |
| 25  | Lausnir         | L1 has too many simultaneous UI elements                   | FIX         | M      |
| 26  | ALL             | No game explains WHY (P2 fail)                             | REBUILD     | L      |
| 27  | ALL             | Unused CSS animations across multiple games                | REMOVE      | S      |

**Disposition summary:** 7 REMOVE, 8 FIX, 10 REBUILD, 2 DEFER

**REBUILD cap (max 3 per game):**

- Einingagreining: 1 REBUILD (L2-L3 teaching) — under cap
- Lotukerfid: 2 REBUILD (L1 intro, hint system) — under cap
- Nafnakerfid: 1 REBUILD (prerequisites teaching) — under cap
- Molmassi: 1 REBUILD (L2 teaching phase) — under cap
- Jafna Jofnur: 3 REBUILD (consolidate levels, strategy instruction, P2-why) — at cap
- Takmarkandi: 1 REBUILD (explain why) — under cap
- Lausnir: 1 REBUILD (unit bridge L1→L3) — under cap, 1 DEFERRED

### Deferred Items

| Finding                                                | Reason                                                                              | Target      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------- |
| Molmassi hydrate parsing fragile                       | Needs data model redesign, not just code fix                                        | Iteration 2 |
| Lausnir temperature-solubility scope creep             | Large content decision — may need teacher input on whether to keep, move, or remove | Iteration 2 |
| Cross-game code duplication (shuffle, progress, state) | Requires shared library work                                                        | Iteration 2 |

### Changes Applied

| #   | Game            | Finding                              | Disposition | Done                                                                                                   |
| --- | --------------- | ------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Einingagreining | L2-L3 are quizzes, not teaching      | REBUILD     | Yes — added teaching intros to L2 (WHY factors work, unit cancellation) and L3 (problem type overview) |
| 2   | Einingagreining | Confetti/morph animations            | REMOVE      | Yes — ~130 lines dead CSS removed                                                                      |
| 3   | Einingagreining | Keyword-matching explanation grading | FIX         | Yes — replaced with honest "credit for effort" scoring                                                 |
| 4   | Einingagreining | Hint system gives away solutions     | FIX         | No — verified hints are already strategic, not solution-revealing                                      |
| 5   | Lotukerfid      | L1 has no teaching intro             | REBUILD     | Yes — added intro explaining periods, groups, how to read the table                                    |
| 6   | Lotukerfid      | No hint system                       | REBUILD     | Deferred — needs more design work                                                                      |
| 7   | Lotukerfid      | Color-only element categories        | FIX         | Deferred to Iteration 3 (accessibility focus)                                                          |
| 8   | Nafnakerfid     | 900 lines molecular visualization    | REMOVE      | Yes — deleted MolecularStructure.tsx (897 lines) and dead Card.tsx (53 lines)                          |
| 9   | Nafnakerfid     | Prerequisites not taught             | REBUILD     | Deferred — needs new content design for Greek prefix drills                                            |
| 10  | Nafnakerfid     | L2 challenges hardcoded + duplicates | FIX         | Yes — consolidated ELEMENT_ROOTS and PREFIXES into data/naming.ts                                      |
| 11  | Molmassi        | L2 has no teaching phase             | REBUILD     | Yes — added intro explaining moles, Avogadro, three key relationships, worked H₂O example              |
| 12  | Molmassi        | L3 problems hard-coded inline        | FIX         | Deferred to Iteration 2                                                                                |
| 13  | Molmassi        | Unused CSS animations                | REMOVE      | Yes — removed 9 unused keyframes and 8 unused classes                                                  |
| 14  | Molmassi        | Hydrate parsing fragile              | DEFER       | Deferred to Iteration 2                                                                                |
| 15  | Jafna Jofnur    | 3 identical level components         | REBUILD     | Deferred to Iteration 2 (code dedup)                                                                   |
| 16  | Jafna Jofnur    | ~100 lines unused CSS                | REMOVE      | Yes — removed ~120 lines dead CSS                                                                      |
| 17  | Jafna Jofnur    | No strategy instruction              | REBUILD     | Yes — added L1 teaching intro with conservation of mass, worked example, balancing strategy            |
| 18  | Jafna Jofnur    | Binary feedback                      | FIX         | Yes — added per-element diagnostic feedback using buildUnbalancedDiagnostic()                          |
| 19  | Takmarkandi     | Never explains WHY                   | REBUILD     | Yes — added L1 teaching intro with principle, cooking analogy, math method                             |
| 20  | Takmarkandi     | molar-masses.ts unused               | REMOVE      | Yes — deleted file and removed re-export                                                               |
| 21  | Takmarkandi     | False menu promises                  | FIX         | Yes — updated L3 description to match actual content                                                   |
| 22  | Takmarkandi     | Reaction animation 250+ lines        | REMOVE      | Yes — deleted ReactionAnimation.tsx and all references                                                 |
| 23  | Lausnir         | L1→L3 unit disconnect                | REBUILD     | Yes — added bridging note explaining sameindir→mól→real units                                          |
| 24  | Lausnir         | Temperature-solubility scope creep   | DEFER       | Deferred                                                                                               |
| 25  | Lausnir         | L1 UI overload                       | FIX         | Yes — removed redundant "key concept reminder" box                                                     |
| 26  | ALL             | No game explains WHY                 | REBUILD     | Partially — teaching intros added to 6 games addressing WHY                                            |
| 27  | ALL             | Unused CSS across games              | REMOVE      | Yes — cleaned across all 7 games                                                                       |

### Verification (2026-04-15)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] All 7 Y1 game files under 400KB (well within 3MB limit)
- [x] All teaching intros added show before graded interactions

---

## Iteration 2: Technical Quality & Code Health — 2026-04-15

### Review Ratings

| Game            | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical | P7 Accessible |
| --------------- | -------- | ------- | -------------- | ---------- | -------- | ------------ | ------------- |
| Einingagreining | PASS     | PASS    | PASS           | PASS       | PASS     | FAIL         | PASS          |
| Lotukerfid      | PASS     | PASS    | PASS           | PASS       | PASS     | PARTIAL      | PARTIAL       |
| Nafnakerfid     | PASS     | PARTIAL | PASS           | PARTIAL    | PASS     | FAIL         | PASS          |
| Molmassi        | PASS     | PASS    | PARTIAL        | PASS       | PASS     | FAIL         | PASS          |
| Jafna Jofnur    | PASS     | PASS    | PASS           | PASS       | PARTIAL  | FAIL         | PASS          |
| Takmarkandi     | PASS     | PASS    | PASS           | PASS       | PARTIAL  | PARTIAL      | PASS          |
| Lausnir         | PASS     | PASS    | PASS           | PASS       | PASS     | PARTIAL      | PASS          |

**Change from Iteration 1:** P1-P5 all significantly improved by iter 1 work (teaching intros, explanations). P6 remained the focus gap — addressed by this iteration.

### Key Findings (Technical Focus)

**Cross-cutting pattern (all 7 games):**

- Every game reimplemented Fisher-Yates shuffle locally despite `shuffleArray` existing in `@shared/utils`
- 6/7 games had manual localStorage boilerplate instead of the `useGameProgress` hook
- 4/7 games had unsafe `as keyof Progress` template-literal casts
- 4/7 games had unused callback props (`onCorrectAnswer`, `onIncorrectAnswer`) threaded through but never invoked from App

**Per-game critical findings:**

1. **Einingagreining**: Dead prediction modal (~155 lines: state + handlers + JSX never reachable because `showPredictionPrompt` is never set to true). Unused `utils/mastery.ts`, `data/lessons.ts`. Non-null assertions in drop handlers.
2. **Lotukerfid**: 3× Fisher-Yates shuffle, manual localStorage, `as keyof Progress` cast.
3. **Nafnakerfid**: `NameBuilder.tsx` (394 lines) never imported. Empty `data/index.ts`. Legacy `types.ts` (Card/GameState from removed card game). Shuffle re-implemented in Level3 + compounds.ts.
4. **Molmassi**: 6 unreferenced modules (`challengeGenerator`, `feedbackGenerator`, `validation`, `moleculeConverter`, `GameComplete`, `AtomVisuals`) totaling ~500+ LOC. Missing `animate-slide-in` CSS class referenced 3×. 5 unused CSS classes. 3× shuffle.
5. **Jafna Jofnur**: Level1/2/3 files had ~630 lines of near-identical code (state shape, handlers, render tree) — biggest single duplication in the codebase.
6. **Takmarkandi**: `utils/sounds.ts` (70 LOC), `utils/validation.ts`, `calculatePoints()` all unreferenced. Unused callback props.
7. **Lausnir**: `BeakerVisualization.tsx`, `ParticleBeaker.tsx` never imported. Shuffle in Level3. Manual localStorage.

### Triage

| #   | Game            | Finding                                                                | Disposition | Effort |
| --- | --------------- | ---------------------------------------------------------------------- | ----------- | ------ |
| 1   | Einingagreining | Dead pendingFactor state + prediction modal (Level2.tsx)               | REMOVE      | S      |
| 2   | Einingagreining | data/lessons.ts + utils/mastery.ts unused                              | REMOVE      | S      |
| 3   | Einingagreining | CancellationChallenge local shuffle                                    | FIX         | S      |
| 4   | Einingagreining | Manual localStorage                                                    | FIX         | S      |
| 5   | Einingagreining | Non-null assertions in drop handlers                                   | FIX         | S      |
| 6   | Lotukerfid      | 3× shuffle reimplementation                                            | FIX         | S      |
| 7   | Lotukerfid      | Manual localStorage + `as keyof Progress` cast                         | FIX         | S      |
| 8   | Nafnakerfid     | NameBuilder.tsx + empty data/index.ts + legacy types.ts                | REMOVE      | S      |
| 9   | Nafnakerfid     | Shuffle in Level3 + compounds.ts                                       | FIX         | S      |
| 10  | Nafnakerfid     | Unsafe `as RuleId` / `as DetailedFeedback` / `as [CompoundType,...][]` | FIX         | S      |
| 11  | Molmassi        | 6 unreferenced modules (~500 LOC) + orphan tests                       | REMOVE      | M      |
| 12  | Molmassi        | Missing animate-slide-in CSS + 5 unused CSS classes                    | FIX         | S      |
| 13  | Molmassi        | 3× shuffle + manual localStorage                                       | FIX         | S      |
| 14  | Jafna Jofnur    | Level1/2/3 consolidation into single `<Level config={...}/>`           | REBUILD     | L      |
| 15  | Jafna Jofnur    | Manual localStorage + `as keyof Progress`                              | FIX         | S      |
| 16  | Takmarkandi     | Unused utils (sounds, validation, calculatePoints) + storage.ts        | REMOVE      | S      |
| 17  | Takmarkandi     | Manual localStorage + unused callback props + 3-arg onComplete         | FIX         | S      |
| 18  | Lausnir         | BeakerVisualization.tsx + ParticleBeaker.tsx unused                    | REMOVE      | S      |
| 19  | Lausnir         | Shuffle in Level3 + manual localStorage + unused callback props        | FIX         | S      |

**Disposition summary:** 5 REMOVE, 13 FIX, 1 REBUILD, 0 DEFER

### Changes Applied

| #   | Game            | Finding                                                    | Disposition | Done                                                                                                                                                 |
| --- | --------------- | ---------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Einingagreining | Dead prediction phase (Level2.tsx ~155 lines)              | REMOVE      | Yes                                                                                                                                                  |
| 2   | Einingagreining | lessons.ts + mastery.ts unused                             | REMOVE      | Yes — files + orphan tests removed                                                                                                                   |
| 3   | Einingagreining | Local shuffle in CancellationChallenge                     | FIX         | Yes — now uses `shuffleArray` from @shared/utils                                                                                                     |
| 4   | Einingagreining | Manual localStorage                                        | FIX         | Yes — migrated to `useGameProgress` (storage key changed to `dimensional-analysis-progress`)                                                         |
| 5   | Einingagreining | Non-null assertions in Level2/Level3                       | FIX         | Yes — replaced with optional chaining + null guards                                                                                                  |
| 6   | Lotukerfid      | 3× shuffle in Level1/2/3                                   | FIX         | Yes — single import of `shuffleArray` per file                                                                                                       |
| 7   | Lotukerfid      | Manual localStorage + `as` cast                            | FIX         | Yes — `useGameProgress` + typed `LEVEL_KEYS` lookup                                                                                                  |
| 8   | Nafnakerfid     | NameBuilder.tsx (394 lines), types.ts, empty data/index.ts | REMOVE      | Yes                                                                                                                                                  |
| 9   | Nafnakerfid     | Shuffle duplication in Level3 + compounds.ts               | FIX         | Yes — both use `shuffleArray`                                                                                                                        |
| 10  | Nafnakerfid     | Unsafe `as` casts                                          | FIX         | Yes — tightened `QuizQuestion.ruleId` to `RuleId`; replaced cast with typed declaration; refactored Object.entries cast                              |
| 11  | Molmassi        | 6 unreferenced modules + 2 test files                      | REMOVE      | Yes — deleted challengeGenerator, feedbackGenerator, validation, moleculeConverter, GameComplete, AtomVisuals + their tests; trimmed calculations.ts |
| 12  | Molmassi        | Missing animate-slide-in + 5 unused CSS                    | FIX         | Yes — replaced with animate-fade-in-up; removed unused keyframes/classes                                                                             |
| 13  | Molmassi        | 3× shuffle + manual localStorage                           | FIX         | Yes — all 3 levels use `shuffleArray`; App migrated to `useGameProgress`                                                                             |
| 14  | Jafna Jofnur    | Level1/2/3 consolidation                                   | REBUILD     | Yes — new `Level.tsx` (295 lines) + `levelConfigs.tsx` (110 lines) replaces 849 lines across 3 files (52% reduction)                                 |
| 15  | Jafna Jofnur    | Manual localStorage + unsafe casts                         | FIX         | Yes — `useGameProgress` + typed `LEVEL_KEYS`                                                                                                         |
| 16  | Takmarkandi     | sounds.ts, validation.ts, calculatePoints, storage.ts      | REMOVE      | Yes                                                                                                                                                  |
| 17  | Takmarkandi     | Manual localStorage + unused callbacks + 3-arg onComplete  | FIX         | Yes — migrated to `useGameProgress`; simplified onComplete to `(score) => void`; removed onCorrectAnswer/onIncorrectAnswer props                     |
| 18  | Lausnir         | BeakerVisualization.tsx + ParticleBeaker.tsx               | REMOVE      | Yes                                                                                                                                                  |
| 19  | Lausnir         | Shuffle + manual localStorage + unused callbacks           | FIX         | Yes — `shuffleArray` in Level3; `useGameProgress` in App; unused callback props removed; simplified onComplete signatures                            |

### Deferred Items

| Finding                                                                                                               | Reason                                                                              | Target                  |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------- |
| Molmassi input parsing / tolerance unification                                                                        | Review suggested 3 divergent parsers be unified — defer pending integration testing | Iteration 3             |
| Lausnir explicit return types on problem-generator helpers                                                            | Low-impact style improvement                                                        | Iteration 3             |
| Lausnir temperature-solubility scope creep (deferred from Iter 1)                                                     | Still defer — needs teacher input on pedagogical scope                              | Iter 3 / content review |
| Nafnakerfid CompoundType naming conflict (Level2 has a different 4-variant local type vs data/compounds.ts 2-variant) | Not a duplicate — distinct types; rename local if confusion arises                  | Iteration 3             |

### Verification (2026-04-15)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] All 7 Y1 game files under 400KB (296KB–377KB; well within 3MB limit)
- [x] No remaining local Fisher-Yates shuffle implementations in Y1 games
- [x] No remaining manual `loadProgress`/`saveProgress` pairs in Y1 App.tsx files
- [x] No remaining unsafe `as keyof Progress` template-literal casts in Y1 games
- [x] Jafna Jofnur reduced from 849 lines (3 Level files) to ~400 lines (Level.tsx + levelConfigs.tsx)

---

## Iteration 3: UX & Accessibility — 2026-04-16

### Review Ratings

| Game            | P1 Teach | P2 Why  | P3 One Concept | P4 Visuals | P5 Hints | P6 Technical | P7 Accessible  |
| --------------- | -------- | ------- | -------------- | ---------- | -------- | ------------ | -------------- |
| Einingagreining | PASS     | PASS    | PASS           | PASS       | PARTIAL  | PASS         | FAIL → PARTIAL |
| Lotukerfid      | PASS     | PASS    | PASS           | PARTIAL    | FAIL     | PASS         | FAIL → PASS    |
| Nafnakerfid     | PASS     | PARTIAL | PASS           | PARTIAL    | PASS     | PASS         | PARTIAL        |
| Molmassi        | PASS     | PASS    | PARTIAL        | PASS       | PASS     | PASS         | PARTIAL → PASS |
| Jafna Jofnur    | PASS     | PASS    | PASS           | PASS       | PARTIAL  | PASS         | PARTIAL → PASS |
| Takmarkandi     | PASS     | PASS    | PASS           | PASS       | PARTIAL  | PASS         | PARTIAL → PASS |
| Lausnir         | PASS     | PASS    | PASS           | PASS       | PASS     | PASS         | PARTIAL → PASS |

### Key Findings (UX & Accessibility Focus)

**Cross-cutting:**

- Lotukerfid's periodic table had NO keyboard navigation (126 buttons, no arrow keys). Critical blocker for keyboard-only users.
- Molmassi's periodic-table modal lacked Escape handling and focus trap (WCAG 2.1 AA fail).
- Several games had touch targets below the 44px WCAG recommendation (Jafna Jofnur coefficient controls at 36px, Einingagreining small buttons).
- AtomCounter (Jafna Jofnur) status was conveyed by color + monochrome ✓/✗ — inaccessible to red-green colorblind users.
- Lausnir's beaker concentration was encoded only in color intensity.
- Takmarkandi Level 3 locked students forward after any wrong answer — no retry per step.

**Per-game critical findings:**

1. **Einingagreining**: `EquivalenceChallenge` +/- buttons lack visible focus ring, no WCAG 44px targets, no descriptive ARIA labels. Text labels (±1/±0.5/±0.1) already distinguish direction — no pure color dependence.
2. **Lotukerfid**: Periodic table elements differentiated only by color; no category abbreviation visible; no keyboard arrow navigation; cells at 40px (< 44px).
3. **Nafnakerfid**: Level 3 name-part buttons at px-3 py-1.5 (~24-30px); no character-level feedback on typos; no role-grouping for name pools. (deferred)
4. **Molmassi**: Periodic-table modal traps keyboard focus with no Escape key or focus trap; close button could be auto-focused. Error feedback lacks per-element diagnostic (deferred).
5. **Jafna Jofnur**: Coefficient +/- buttons 36px; no arrow-key support; AtomCounter status only in color + ✓/✗ glyph.
6. **Takmarkandi**: Level 3 no step retry — wrong answer forces advance; feedback uses FeedbackPanel (has ✓/✗ icons).
7. **Lausnir**: Volume slider missing `aria-label`/`aria-valuetext`; beaker concentration encoded only in fill color.

### Triage

| #   | Game            | Finding                                                                          | Disposition | Effort |
| --- | --------------- | -------------------------------------------------------------------------------- | ----------- | ------ |
| 1   | Einingagreining | EquivalenceChallenge buttons: no focus ring, <44px, no aria-label                | FIX         | S      |
| 2   | Lotukerfid      | PeriodicTable: no keyboard nav, no category label, cells <44px, no aria-label    | REBUILD     | M      |
| 3   | Lotukerfid      | Legend lacks category abbreviation so user can map cell→category                 | FIX         | S      |
| 4   | Molmassi        | PeriodicTable modal: no Escape, no focus trap, no `role="dialog"`                | FIX         | S      |
| 5   | Molmassi        | Close button initial focus                                                       | FIX         | S      |
| 6   | Jafna Jofnur    | CoefficientControl buttons 36px; no arrow-key support; no per-formula aria-label | FIX         | S      |
| 7   | Jafna Jofnur    | AtomCounter: color-only status; no aria-label describing balanced/unbalanced     | FIX         | S      |
| 8   | Takmarkandi     | Level 3 no step retry on wrong answer                                            | FIX         | S      |
| 9   | Lausnir         | Volume slider missing aria-label/aria-valuetext                                  | FIX         | S      |
| 10  | Lausnir         | Beaker concentration color-only (no numeric overlay)                             | FIX         | S      |
| 11  | Nafnakerfid     | Level 3 name-part button touch targets                                           | DEFER       | S      |
| 12  | Nafnakerfid     | Character-level typo feedback                                                    | DEFER       | M      |
| 13  | Molmassi        | Per-element diagnostic feedback                                                  | DEFER       | M      |
| 14  | ALL             | Escape-to-close on teaching intros                                               | DEFER       | S      |

**Disposition summary:** 9 FIX, 1 REBUILD, 4 DEFER

### Changes Applied

| #   | Game            | Finding                                   | Disposition | Done                                                                                                                                                          |
| --- | --------------- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Einingagreining | EquivalenceChallenge buttons a11y + 44px  | FIX         | Yes — refactored map; added `min-h-[44px] min-w-[44px]` + `focus-visible:ring-2` + `aria-label`                                                               |
| 2   | Lotukerfid      | PeriodicTable keyboard nav + a11y rebuild | REBUILD     | Yes — added roving `tabIndex`, arrow-key navigation (skipping gaps), `aria-label` per cell, category abbreviation badge, `focus-visible:ring-3`, 44px minimum |
| 3   | Lotukerfid      | Category legend shows abbreviation        | FIX         | Yes — legend labels now include `Al — Alkalímálmar`, etc.                                                                                                     |
| 4   | Molmassi        | PeriodicTable modal dialog semantics      | FIX         | Yes — `role="dialog"` + `aria-modal` + `aria-labelledby` + backdrop click + Escape handler                                                                    |
| 5   | Molmassi        | Close button auto-focus                   | FIX         | Yes — `closeButtonRef` auto-focuses on open; widened button to 44px                                                                                           |
| 6   | Jafna Jofnur    | CoefficientControl 44px + arrow keys      | FIX         | Yes — buttons `w-11 h-11`, display has `role="spinbutton"` with ArrowUp/Down/+/- handlers + `aria-valuenow/min/max`; per-formula `aria-label`                 |
| 7   | Jafna Jofnur    | AtomCounter a11y                          | FIX         | Yes — row `aria-label` describes balanced/unbalanced with counts; visible "jafnað/ójafnað" text alongside ✓/✗ glyph                                           |
| 8   | Takmarkandi     | Level 3 step retry                        | FIX         | Yes — new `retryStep` handler + "Reyna aftur" button shown alongside "Næsta skref" on wrong answers                                                           |
| 9   | Lausnir         | Slider aria-label/aria-valuetext          | FIX         | Yes — Level 1 volume slider has descriptive Icelandic labels                                                                                                  |
| 10  | Lausnir         | Beaker numeric concentration overlay      | FIX         | Yes — SVG `<text>` shows `{conc} M` with white stroke halo when fill is sufficient                                                                            |

### Deferred Items

| Finding                                   | Reason                                                                                                                            | Target          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Nafnakerfid Level 3 touch-target polish   | Review's button-size concern is borderline (px-3 py-1.5 often renders ≥36px in practice); skip until validated with real students | Iter 4 / future |
| Nafnakerfid character-level typo feedback | Needs a Levenshtein/diff algorithm — valuable but not an accessibility blocker                                                    | Iter 4 / future |
| Molmassi per-element diagnostic feedback  | Needs logic to infer which element was miscounted (non-trivial)                                                                   | Iter 4 / future |
| Escape-to-close on teaching intros        | Low impact — intros already have visible "Til baka" + "Byrja æfingar" buttons; keyboard users can Tab+Enter those                 | Iter 4 / future |

### Verification (2026-04-16)

- [x] `pnpm type-check` passes across entire monorepo (0 errors)
- [x] `pnpm build:games` — 20 succeeded, 0 failed
- [x] All 7 Y1 game files still under 400KB (298KB–377KB)
- [x] PeriodicTable arrow-key navigation verified in source (skips gaps between groups 2 and 13 on periods 2–3)
- [x] CoefficientControl responds to ArrowUp/Down, +/- keys when focused
- [x] AtomCounter row status announced via aria-label regardless of color
- [x] Molmassi modal closes on Escape; focus lands on close button on open
