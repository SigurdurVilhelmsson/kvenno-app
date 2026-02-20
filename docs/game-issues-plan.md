# Game Issues Development Plan

> Generated from reviews 01–17 in `docs/game-reviews/`. Work this plan across sessions.
> After each session, update the Session Log at the bottom.

## Status Legend

- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Done
- `[—]` — Skipped / Won't fix

---

## Cross-Cutting Issues (already fixed)

| Issue | Files | Status |
|-------|-------|--------|
| CSS `-tranwarm-` → `-translate-` | 12 files, 8 games | [x] Fixed in `9060395` |
| `focus:outline-hidden` → `focus:outline-none` | 15 files, 12 games | [x] Fixed in `9060395` |

---

## Game 01: Molmassi (4.6/5)

### Critical
- [ ] **1-01a. React 19 + @react-three/fiber incompatibility** — MoleculeViewer3DLazy crashes with `ReactCurrentBatchConfig` undefined. Fix: upgrade @react-three/fiber to v9+ or gate the 3D viewer behind a lazy boundary that catches errors. *(Note: commit `5fdfe5a` may have addressed this — verify)*
- [ ] **1-01b. Build script path mismatch** — `package.json` mv command uses `dist/1-ar/` but output goes to `dist/efnafraedi/1-ar/`. *(Cross-cutting: affects all 17 games — fix in `scripts/build-games.mjs` centrally)*

### Major
- [ ] **1-02. i18n uses ASCII approximations** — i18n.ts: "Molmassi" → "Mólmassi", "Laerdu" → "Lærðu", "Surefni" → "Súrefni" etc. Replace all ~200 strings with proper Icelandic characters.
- [ ] **1-03. Level 2 hints only for one challenge type** — Hint button only appears during `calculate_simple`. Extend HintSystem to `estimate_mass`, `order_molecules`, `find_heaviest_atom`.
- [ ] **1-04. Hydrate pedagogy gap** — CuSO4·5H2O appears in L3 with no explanation of hydrate notation. Add explainer tooltip.

### Minor
- [ ] **1-05. Mystery mode distractors too easy** — 30% range too wide
- [ ] **1-06. feedbackGenerator.ts untested**
- [ ] **1-07. PeriodicTable horizontal scroll on mobile**
- [ ] **1-08. @import CSS warning**

---

## Game 02: Nafnakerfid (4.3/5)

### Critical
- [ ] **2-01. Build script path mismatch** — Same as 1-01b.

### Major
- [ ] **2-02. Level 3 match modal lacks accessibility** — Missing `role="dialog"`, `aria-modal`, focus trap, Escape handler. File: Level3.tsx
- [ ] **2-03. Hardcoded Icelandic UI text** — Level1.tsx, Level2.tsx, Level3.tsx, NameBuilder.tsx: all labels hardcoded. Move to i18n.ts.
- [ ] **2-04. NameBuilder doesn't trigger achievements** — Connect to trackGameComplete/trackLevelComplete.
- [ ] **2-05. Warmup emojis without text fallback** — Metal/nonmetal ⚙️/💨 lack aria-labels. File: Level1.tsx

### Minor
- [ ] **2-06. Hint tracking inconsistency across levels**
- [ ] **2-07. Score scaling not normalized** (L1: 100, L2: 180, L3: 60–200+)
- [ ] **2-08. Level 3 card grid layout on mobile**
- [ ] **2-09. Answer normalization too permissive** (þ→th false positives)
- [ ] **2-10. Polish translations unverified**

---

## Game 03: Dimensional Analysis (4.0/5)

### Critical
- [ ] **3-01. Level 1 mastery logic bug** — mastery.ts requires 8 correct but L1 only has 6 challenges. Fix threshold.
- [ ] **3-02. Level 2 unit prediction broken for compound units** — Always assumes numerator survives. Fix unit cancellation tracking.
- [ ] **3-03. No progress persistence** — All state in React; no localStorage. Integrate useGameProgress. **(Most impactful fix for this game)**

### Major
- [ ] **3-04. No hints in Level 2** — L1 and L3 have hints but L2 doesn't. Use shared HintSystem.
- [ ] **3-05. Significant figures double-counted** — Sig fig errors penalized twice in L3 scoring.
- [ ] **3-06. Unused questions in questions.ts** — 10 defined, only 6 used.
- [ ] **3-07. L3 challenges outside DA scope** — L3-15 (bacterial growth) and L3-16 (temp conversion) aren't dimensional analysis.

### Minor
- [ ] **3-08. Mastery gate messaging missing**
- [ ] **3-09. Hint penalty harsh (-15%)**
- [ ] **3-10. Composite score weightings not shown**

---

## Game 04: Lausnir (4.4/5)

### Critical
- [ ] **4-01. Wrong concept message in L1 Challenge 1** — Shows Henderson-Hasselbalch message for a dilution challenge. Replace with "Styrkur = sameindir / rummal".

### Major
- [ ] **4-02. L2 mastery threshold too low (35%)** — Students advance with minimal accuracy. Increase to 60-70%.
- [ ] **4-03. No hints in Level 2** — L1 and L3 have hints, L2 doesn't.
- [ ] **4-04. Achievement strings not i18n'd** — scoring.ts: hardcoded Icelandic achievement text.

### Minor
- [ ] **4-05. Limited chemical database** (only 7 chemicals)
- [ ] **4-06. Chemistry facts pool too small** (only 7 facts)
- [ ] **4-07. Missing ARIA labels on BeakerVisualization**
- [ ] **4-08. Problem IDs use Math.random()** (should use crypto.randomUUID)

---

## Game 05: Takmarkandi (4.1/5)

### Critical
- [ ] **5-01. Multi-product reactions broken in L2 & L3** — Reactions with 2 products (e.g., CH4+2O2 → CO2+2H2O) only calculate first product. Second gives undefined. Either filter out multi-product reactions or extend UI. **(Most impactful fix)**

### Major
- [ ] **5-02. Difficulty gap L2→L3 too abrupt** — L2 provides step-by-step; L3 demands all answers simultaneously.
- [ ] **5-03. L3 gram mode fixed 0.5x multiplier** — All problems use same multiplier, enabling pattern matching. Randomize 0.3–2.0.
- [ ] **5-04. No ARIA labels on interactive elements** — Molecules, animations, clickable cards lack accessible names.

### Minor
- [ ] **5-05. L1/L2 mastery paradigm mismatch** (75% overall vs 100% per-problem)
- [ ] **5-06. Empty input validation in L3**
- [ ] **5-07. Streak continues across difficulty changes**

---

## Game 06: Lewis Structures (4.4/5)

### Major
- [ ] **6-01. CO formal charge explanation misleading** — L3 Challenge 4 says "triple bonds minimize formal charge" but C≡O has C⁻/O⁺. Rewrite to state octet rule takes priority.
- [ ] **6-02. L2 hint scoring not transparent** — Score drops 5→2 with hint but deduction isn't shown to student.

### Minor
- [ ] **6-03. OctetViolationChecker component unused** (327 lines of dead code)
- [ ] **6-04. Molecular formula subscripts not screen-reader friendly**

---

## Game 07: VSEPR Geometry (4.9/5)

### Major
- [ ] **7-01. SVG animations lack screen reader descriptions** — BondAngleMeasurement, ElectronRepulsionAnimation, ShapeTransitionAnimation: no `<title>`/`<desc>` in SVGs.

### Minor
- [ ] **7-02. Menu title missing diacritics** — "VSEPR Rumfraedi" → "VSEPR Rumfraedi" (App.tsx:251)
- [ ] **7-03. L2 angle validation uses string matching** — Should parse numeric + tolerance ±2°.
- [ ] **7-04. L2 square-planar SVG incomplete** — XeF4 doesn't show 2 lone pairs.

---

## Game 08: Intermolecular Forces (4.7/5)

### Major
- [ ] **8-01. No mastery threshold for level progression** — Students advance with any score > 0. Require 80%+.

### Minor
- [ ] **8-02. L1 2D/3D toggle buttons lack aria-labels**
- [ ] **8-03. ForceStrengthAnimation keyboard navigation** (no arrow key support)
- [ ] **8-04. SolubilityPrediction not scored** (needs "supplementary tool" label)
- [ ] **8-05. Energy range imprecision** (London forces 0.05-40 kJ/mol too broad)

---

## Game 09: Hess Law (4.3/5)

### Major
- [ ] **9-01. L3 challenge content not internationalized** — Titles, descriptions, step-by-step all hardcoded Icelandic. Move to i18n.ts.
- [ ] **9-02. Energy diagrams lack accessibility** — SVGs missing role/aria-label. Color-only exo/endo distinction.
- [ ] **9-03. L2 equation blocks lack keyboard navigation** — Click-only handlers, no Enter/Space/arrow key support.

### Minor
- [ ] **9-04. Duplicated Equation interface** (Level2.tsx redefines instead of importing)
- [ ] **9-05. Scoring scale inconsistent** (L1: 600, L2: 500, L3: 120)

---

## Game 10: Kinetics (4.7/5)

### Major
- [ ] **10-01. Missing orderB validation in Level 2** — L2.tsx:220: disabled check only validates orderA, not orderB. Multi-reactant challenges can be submitted incomplete.
- [ ] **10-02. Polish diacritics missing** — i18n.ts:119-171: "Szybkosc" → "Szybkość" etc.

### Minor
- [ ] **10-03. Particle colors not shape-differentiated** (color-blind accessibility)
- [ ] **10-04. ConcentrationTimeGraph zero-guard missing** on calculateHalfLife()

---

## Game 11: Organic Nomenclature (4.4/5)

### Major
- [ ] **11-01. Mobile buttons below minimum size** — MoleculeBuilder.tsx, StructureFromNameChallenge.tsx: ±buttons are 40px, should be 44px+. Change `w-10 h-10` to `w-12 h-12`.
- [ ] **11-02. Prefix grid overflows mobile** — App.tsx:386: `grid-cols-5` needs `grid-cols-3 md:grid-cols-5`.
- [ ] **11-03. Bond clicking not keyboard accessible** — No tabIndex or keyboard handlers. WCAG violation.
- [ ] **11-04. AchievementsPanel missing focus trap** — Modal focus can escape.

### Minor
- [ ] **11-05. No confirmation before progress reset**
- [ ] **11-06. Inconsistent chemistry terminology** ("efnasameindir" vs "sameindir")

---

## Game 12: Redox Reactions (4.1/5)

### Critical
- [ ] **12-01. i18n translations defined but never used** — Complete 3-language translations exist in i18n.ts but all UI text is hardcoded Icelandic. LanguageSwitcher has no effect. Connect with `t()` calls. **(Most impactful fix)**

### Major
- [ ] **12-02. Missing ARIA labels on inputs** — Level1.tsx:289, Level2.tsx:279, Level3.tsx:118.
- [ ] **12-03. SVG ElectrochemicalCell lacks accessibility** — No `<title>`, no `role="img"`.
- [ ] **12-04. Color-only indicators in OxidationStateDisplay** — Add icon supplements for color-blind users.

### Minor
- [ ] **12-05. electronsDelta calculation** may produce negative animation counts
- [ ] **12-06. Magic numbers in scoring** (hardcoded point values)

---

## Game 13: Buffer Recipe Creator (4.3/5)

### Major
- [ ] **13-01. Problem contexts not internationalized** — level1-challenges.ts, level2-puzzles.ts, level3-puzzles.ts: all Icelandic-only.
- [ ] **13-02. No ARIA labels on interactive elements** — Buttons, inputs, BufferCapacityVisualization SVG.
- [ ] **13-03. Input fields and molecule circles below mobile minimum** — Inputs py-2 (~40px), circles w-8 h-8 (32px).

### Minor
- [ ] **13-04. Dead flask animation CSS** (~60 lines unused)
- [ ] **13-05. Molecule counter cap at 20 arbitrary**
- [ ] **13-06. No confirmation before progress reset**
- [ ] **13-07. Hardcoded inline color styles** (should use Tailwind)

---

## Game 14: Equilibrium Shifter (4.4/5)

### Major
- [ ] **14-01. Both sides glow identically** — styles.css:70-80: reactants and products both use same green glow. Differentiate colors.
- [ ] **14-02. Challenge timer doesn't pause during explanation** — App.tsx:94-117: add `&& !showExplanation` to timer condition.
- [ ] **14-03. Prediction buttons lack focus styles & color-blind support** — Missing `:focus` outlines, color-only differentiation, contrast ratio 3.8:1 < 4.5:1 WCAG AA.

### Minor
- [ ] **14-04. HTML lang not updated on language change**
- [ ] **14-05. Hardcoded 20-second timer** (not configurable)

---

## Game 15: Gas Law Challenge (4.3/5)

### Major
- [ ] **15-01. Browser alert() for input validation** — App.tsx:186: Replace with inline validation message.
- [ ] **15-02. No input bounds validation** — Extreme values accepted with no helpful feedback.
- [ ] **15-03. Deprecated onKeyPress** — App.tsx:665: Replace with onKeyDown.

### Minor
- [ ] **15-04. Polish translations have encoding issues** — i18n.ts: missing diacritics.
- [ ] **15-05. GameStats totalTime field unused**
- [ ] **15-06. No game completion indicator**
- [ ] **15-07. Particle simulation not physics-accurate for extreme values**

---

## Game 16: pH Titration (4.6/5)

### Major
- [ ] **16-01. Missing ARIA labels on lab equipment** — Burette, Flask, PHMeter: no aria-label/aria-valuenow/aria-valuemin/aria-valuemax.
- [ ] **16-02. No keyboard navigation in Level 2** — Burette controls click-only.
- [ ] **16-03. Flask fixed size overflows mobile** — Flask.tsx:34: `w-60 h-70` too wide for <320px. Use `w-48 md:w-60`.

### Minor
- [ ] **16-04. Challenge type labels hardcoded Icelandic** — Level3.tsx:88-97.
- [ ] **16-05. Flask indicator opacity too low** (0.1 nearly invisible)
- [ ] **16-06. Level lock messages not translated**
- [ ] **16-07. L3 tolerance inconsistency** (most 2%, Challenge 7 is 5%)

---

## Game 17: Thermodynamics Predictor (4.4/5)

### Major
- [ ] **17-01. Spontaneity buttons too small on mobile** — App.tsx:644-675: grid-cols-3 makes ~28px buttons. Change to `grid-cols-1 lg:grid-cols-3`.
- [ ] **17-02. CSS variable inline styles without fallback** — App.tsx:510,520: `var(--exothermic)` with no fallback. Add fallback colors.

### Minor
- [ ] **17-03. DG tolerance ±5 kJ/mol generous** — Consider ±2-3 for harder levels.
- [ ] **17-04. No tutorial or onboarding**
- [ ] **17-05. No skip links**

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| Critical (remaining) | 8 | Game-breaking bugs, broken functionality |
| Major (remaining) | 48 | Significant UX, accessibility, pedagogical problems |
| Minor (remaining) | 52 | Polish, consistency, nice-to-haves |

### Suggested Session Order

**Session A — Critical bugs (highest impact)**
1. Game 03: Dimensional Analysis (3 critical: mastery bug, unit prediction, no persistence)
2. Game 05: Takmarkandi (1 critical: multi-product reactions broken)
3. Game 04: Lausnir (1 critical: wrong concept message)
4. Game 12: Redox Reactions (1 critical: i18n connected but unused)

**Session B — Major accessibility fixes (cross-cutting theme)**
- 14-03, 16-01, 16-02, 13-02, 12-02, 12-03, 5-04, 9-02, 7-01 (ARIA labels, keyboard nav, screen reader support)

**Session C — Major UX/mobile fixes**
- 17-01, 13-03, 11-01, 11-02, 16-03, 14-01, 14-02, 15-01, 15-03

**Session D — Major i18n fixes**
- 1-02, 2-03, 9-01, 13-01, 10-02, 15-04 (hardcoded text, missing translations, encoding)

**Session E — Major pedagogical fixes**
- 3-04, 3-05, 4-02, 4-03, 6-01, 8-01, 10-01, 11-03, 11-04

**Session F — Minor issues (remaining polish)**
- All remaining minor items, batched by game

---

## Session Log

*Update this section after each work session.*

| Session | Date | Issues Fixed | Commit(s) | Notes |
|---------|------|-------------|-----------|-------|
| Pre-work | 2026-02-20 | Cross-cutting: -tranwarm-, focus:outline-hidden | `9060395` | 26 files, 12+15 games |
| A | | | | |
| B | | | | |
| C | | | | |
| D | | | | |
| E | | | | |
| F | | | | |
