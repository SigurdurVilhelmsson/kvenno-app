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
- [x] **1-01a. React 19 + @react-three/fiber incompatibility** — Verified fixed in commit `5fdfe5a` (fiber v9.5.0, drei v10.7.7, triple error-boundary).
- [x] **1-01b. Build script path mismatch** — Fixed all 17 package.json `mv` paths: `dist/X-ar/` → `dist/efnafraedi/X-ar/`. *(Session A)*

### Major
- [x] **1-02. i18n uses ASCII approximations** — Replaced all ~70 strings with proper Icelandic diacritics (á, é, í, ó, ú, ý, ð, þ, æ, ö). *(Session D)*
- [ ] **1-03. Level 2 hints only for one challenge type** — Hint button only appears during `calculate_simple`. Extend HintSystem to `estimate_mass`, `order_molecules`, `find_heaviest_atom`.
- [ ] **1-04. Hydrate pedagogy gap** — CuSO4·5H2O appears in L3 with no explanation of hydrate notation. Add explainer tooltip.

### Minor
- [x] **1-05. Mystery mode distractors too easy** — Tightened from 30% to 15% range. *(Session F)*
- [ ] **1-06. feedbackGenerator.ts untested**
- [ ] **1-07. PeriodicTable horizontal scroll on mobile**
- [—] **1-08. @import CSS warning** — No `@import url()` found; false positive. *(Session F)*

---

## Game 02: Nafnakerfid (4.3/5)

### Critical
- [x] **2-01. Build script path mismatch** — Fixed in 1-01b (all 17 games). *(Session A)*

### Major
- [ ] **2-02. Level 3 match modal lacks accessibility** — Missing `role="dialog"`, `aria-modal`, focus trap, Escape handler. File: Level3.tsx
- [x] **2-03. Hardcoded Icelandic UI text** — Added ~77 i18n keys (level1.ui, level2.ui, level3.ui, nameBuilder.ui) in is/en/pl. Passed `t` prop to all 4 components, replaced all UI chrome strings. Fixed Polish diacritics. *(Session D)*
- [ ] **2-04. NameBuilder doesn't trigger achievements** — Connect to trackGameComplete/trackLevelComplete.
- [ ] **2-05. Warmup emojis without text fallback** — Metal/nonmetal ⚙️/💨 lack aria-labels. File: Level1.tsx

### Minor
- [ ] **2-06. Hint tracking inconsistency across levels**
- [ ] **2-07. Score scaling not normalized** (L1: 100, L2: 180, L3: 60–200+)
- [x] **2-08. Level 3 card grid layout on mobile** — Changed medium/hard to `grid-cols-3` on mobile. *(Session F)*
- [ ] **2-09. Answer normalization too permissive** (þ→th false positives)
- [ ] **2-10. Polish translations unverified**

---

## Game 03: Dimensional Analysis (4.0/5)

### Critical
- [x] **3-01. Level 1 mastery logic bug** — Fixed mastery.ts thresholds to 5/6 matching actual game structure. *(Session A)*
- [x] **3-02. Level 2 unit prediction broken for compound units** — Rewrote unitConversion.ts compound section with proper pair-wise cancellation. *(Session A)*
- [—] **3-03. No progress persistence** — False positive: `useProgress` hook already persists to localStorage via `saveProgress()`/`loadProgress()`. *(Session A)*

### Major
- [x] **3-04. No hints in Level 2** — Added `hint` field to Level2Problem interface and all 15 problems. Added hint button, display, and state tracking to Level2.tsx. *(Session E)*
- [x] **3-05. Significant figures double-counted** — Removed 30% answerScore penalty for wrong sig figs in Level3.tsx; sig figs now displayed as informational feedback only. *(Session E)*
- [ ] **3-06. Unused questions in questions.ts** — 10 defined, only 6 used.
- [ ] **3-07. L3 challenges outside DA scope** — L3-15 (bacterial growth) and L3-16 (temp conversion) aren't dimensional analysis.

### Minor
- [x] **3-08. Mastery gate messaging missing** — Added lock messages with i18n (is/en/pl) for L2 and L3. *(Session F)*
- [x] **3-09. Hint penalty harsh (-15%)** — Reduced to 10% (0.90 multiplier). *(Session F)*
- [ ] **3-10. Composite score weightings not shown**

---

## Game 04: Lausnir (4.4/5)

### Critical
- [x] **4-01. Wrong concept message in L1 Challenge 1** — Changed to "Styrkur = sameindir / rúmmál" in Level1.tsx:77. *(Session A)*

### Major
- [x] **4-02. L2 mastery threshold too low (35%)** — Changed LEVEL2_MASTERY_SCORE from 350 to 650 (65% of 1000 max). *(Session E)*
- [x] **4-03. No hints in Level 2** — Added `hint` field to BaseScenario interface and all 10 scenarios. Added hint button/display with 50-point penalty (vs 100 without hint). *(Session E)*
- [ ] **4-04. Achievement strings not i18n'd** — scoring.ts: hardcoded Icelandic achievement text.

### Minor
- [ ] **4-05. Limited chemical database** (only 7 chemicals)
- [ ] **4-06. Chemistry facts pool too small** (only 7 facts)
- [x] **4-07. Missing ARIA labels on BeakerVisualization** — Added `role="img"`, `aria-label`, `<title>` to Beaker SVG. *(Session F)*
- [ ] **4-08. Problem IDs use Math.random()** (should use crypto.randomUUID)

---

## Game 05: Takmarkandi (4.1/5)

### Critical
- [x] **5-01. Multi-product reactions broken in L2** — Added `r.products.length === 1` filter to Level2.tsx (L3 already handles multi-product). *(Session A)*

### Major
- [ ] **5-02. Difficulty gap L2→L3 too abrupt** — L2 provides step-by-step; L3 demands all answers simultaneously.
- [ ] **5-03. L3 gram mode fixed 0.5x multiplier** — All problems use same multiplier, enabling pattern matching. Randomize 0.3–2.0.
- [x] **5-04. No ARIA labels on interactive elements** — Added `role="img"` + `aria-label` to Molecule.tsx, `aria-label` to ReactionAnimation reset button, keyboard-accessible divs (`role="button"`, `tabIndex`, `onKeyDown`, `aria-pressed`) in Level3.tsx, `aria-label` on product inputs. *(Session B)*

### Minor
- [ ] **5-05. L1/L2 mastery paradigm mismatch** (75% overall vs 100% per-problem)
- [x] **5-06. Empty input validation in L3** — Added `.trim()` to userExcess check in canSubmit. *(Session F)*
- [ ] **5-07. Streak continues across difficulty changes**

---

## Game 06: Lewis Structures (4.4/5)

### Major
- [x] **6-01. CO formal charge explanation misleading** — Rewrote structure explanation for C≡O triple bond: removed "lágmarka formhleðslu" claim, now correctly states áttureglan weighs more despite non-zero formal charges. *(Session E)*
- [ ] **6-02. L2 hint scoring not transparent** — Score drops 5→2 with hint but deduction isn't shown to student.

### Minor
- [x] **6-03. OctetViolationChecker component unused** — Deleted 327-line unused component. *(Session F)*
- [x] **6-04. Molecular formula subscripts not screen-reader friendly** — Added `role="img"`, `aria-label` to formula displays in Level1 and Level3. *(Session F)*

---

## Game 07: VSEPR Geometry (4.9/5)

### Major
- [x] **7-01. SVG animations lack screen reader descriptions** — Added `role="img"`, `aria-label`, `<title>` to BondAngleMeasurement (compact + full), ElectronRepulsionAnimation, and ShapeTransitionAnimation SVGs. *(Session B)*

### Minor
- [x] **7-02. Menu title missing diacritics** — Replaced hardcoded strings with `t('game.title')` and `t('game.description')`. *(Session F)*
- [ ] **7-03. L2 angle validation uses string matching** — Should parse numeric + tolerance ±2°.
- [ ] **7-04. L2 square-planar SVG incomplete** — XeF4 doesn't show 2 lone pairs.

---

## Game 08: Intermolecular Forces (4.7/5)

### Major
- [x] **8-01. No mastery threshold for level progression** — Added 80% mastery check to all 3 handleLevelComplete functions; levelCompleted only set when score/maxScore >= 0.8, preserving previous mastery. *(Session E)*

### Minor
- [x] **8-02. L1 2D/3D toggle buttons lack aria-labels** — Added `role="radiogroup"`, `role="radio"`, `aria-checked`, `aria-label` to 2D/3D toggle. *(Session F)*
- [ ] **8-03. ForceStrengthAnimation keyboard navigation** (no arrow key support)
- [x] **8-04. SolubilityPrediction not scored** — Added "Aukaverkfæri – telst ekki í stigagjöf" label. *(Session F)*
- [ ] **8-05. Energy range imprecision** (London forces 0.05-40 kJ/mol too broad)

---

## Game 09: Hess Law (4.3/5)

### Major
- [x] **9-01. L3 challenge content not internationalized** — Added `level3` section to i18n.ts with ~40 keys (6 challenges × 4 fields + UI strings) in is/en/pl. Rewrote Level3.tsx to use `t()` with key references. Fixed Polish diacritics. *(Session D)*
- [x] **9-02. Energy diagrams lack accessibility** — Added `role="img"`, `aria-label`, `<title>` to EnergyPathwayDiagram and StatePathComparison SVGs. Added `▼`/`▲` text indicators to legend for color-blind distinction. *(Session B)*
- [ ] **9-03. L2 equation blocks lack keyboard navigation** — Click-only handlers, no Enter/Space/arrow key support.

### Minor
- [x] **9-04. Duplicated Equation interface** — Replaced local definition with `import type { Equation } from '../data/challenges'`. *(Session F)*
- [ ] **9-05. Scoring scale inconsistent** (L1: 600, L2: 500, L3: 120)

---

## Game 10: Kinetics (4.7/5)

### Major
- [x] **10-01. Missing orderB validation in Level 2** — Added `(hasSecondReactant && orderB === null)` to submit button disabled check. *(Session E)*
- [x] **10-02. Polish diacritics missing** — Fixed all Polish diacritics (ś, ć, ź, ż, ń, ó, ł, ą, ę) throughout i18n.ts `pl` section. *(Session D)*

### Minor
- [ ] **10-03. Particle colors not shape-differentiated** (color-blind accessibility)
- [x] **10-04. ConcentrationTimeGraph zero-guard missing** — Added `if (k <= 0 || A0 <= 0) return 0` guard. *(Session F)*

---

## Game 11: Organic Nomenclature (4.4/5)

### Major
- [x] **11-01. Mobile buttons below minimum size** — Changed `w-10 h-10` to `w-12 h-12` (48px) in MoleculeBuilder.tsx and StructureFromNameChallenge.tsx. *(Session C)*
- [x] **11-02. Prefix grid overflows mobile** — Changed `grid-cols-5` to `grid-cols-3 md:grid-cols-5` in App.tsx. *(Session C)*
- [x] **11-03. Bond clicking not keyboard accessible** — Added `focus-visible` ring styles and dynamic `aria-label` (bond type + position) to bond buttons in MoleculeBuilder.tsx. *(Session E)*
- [x] **11-04. AchievementsPanel missing focus trap** — Added `role="dialog"`, `aria-modal`, focus trap (Tab wrapping), Escape key handler, auto-focus close button, and backdrop click-to-close to shared AchievementsPanel. *(Session E)*

### Minor
- [x] **11-05. No confirmation before progress reset** — Added `window.confirm()` dialog. *(Session F)*
- [ ] **11-06. Inconsistent chemistry terminology** ("efnasameindir" vs "sameindir")

---

## Game 12: Redox Reactions (4.1/5)

### Critical
- [x] **12-01. i18n translations defined but never used** — Extracted `t` from `useGameI18n` in App.tsx, passed to all 3 Level components. Replaced ~60 hardcoded strings with `t()` calls across App.tsx, Level1.tsx, Level2.tsx, Level3.tsx. Added `menu`/`complete` sections to i18n.ts. Fixed Polish diacritics. *(Session D)*

### Major
- [x] **12-02. Missing ARIA labels on inputs** — Added `aria-label="Oxunartala"` to Level1.tsx number input, `htmlFor`/`id` pairs to Level3.tsx label/input elements. *(Session B)*
- [x] **12-03. SVG ElectrochemicalCell lacks accessibility** — Added `role="img"`, `aria-label`, `<title>` to ElectrochemicalCell.tsx SVG. *(Session B)*
- [ ] **12-04. Color-only indicators in OxidationStateDisplay** — Add icon supplements for color-blind users.

### Minor
- [x] **12-05. electronsDelta calculation** — Fixed misleading comment; Math.abs() already guards animation. *(Session F)*
- [ ] **12-06. Magic numbers in scoring** (hardcoded point values)

---

## Game 13: Buffer Recipe Creator (4.3/5)

### Major
- [x] **13-01. Problem contexts not internationalized** — Added optional `*En`/`*Pl` fields to all data interfaces. Translated all 6 level1 challenges, 6 level2 puzzles, 6 level3 puzzles, and 30 buffer problems into English and Polish. *(Session D)*
- [x] **13-02. No ARIA labels on interactive elements** — Added `role="img"`, `aria-label`, `<title>` to BufferCapacityVisualization SVG. Added `aria-label` to acid/base add/remove buttons in Level1.tsx and concentration buttons. *(Session B)*
- [x] **13-03. Input fields and molecule circles below mobile minimum** — Changed buttons `py-2` to `py-3` (44px+) in Level1.tsx and BufferCapacityVisualization.tsx. Changed molecule circles `w-8 h-8` to `w-10 h-10` (40px) in Level1.tsx. *(Session C)*

### Minor
- [x] **13-04. Dead flask animation CSS** — Removed 61 lines of unused CSS. *(Session F)*
- [ ] **13-05. Molecule counter cap at 20 arbitrary**
- [x] **13-06. No confirmation before progress reset** — Added `window.confirm()` dialog. *(Session F)*
- [ ] **13-07. Hardcoded inline color styles** (should use Tailwind)

---

## Game 14: Equilibrium Shifter (4.4/5)

### Major
- [x] **14-01. Both sides glow identically** — Changed reactants glow to blue (`#93c5fd`/`#60a5fa`) while products keep green in styles.css. *(Session C)*
- [x] **14-02. Challenge timer doesn't pause during explanation** — Added `&& !showExplanation` to timer condition and `showExplanation` to dependency array in App.tsx. *(Session C)*
- [x] **14-03. Prediction buttons lack focus styles & color-blind support** — Added `:focus-visible` outlines to `.predict-btn`, `.stress-btn`, `.mode-card` in styles.css. Added `::after` content (`✓`/`✗`) for correct/incorrect states. Added `focus-visible:outline` classes to Tailwind-styled buttons in App.tsx. *(Session B)*

### Minor
- [x] **14-04. HTML lang not updated on language change** — Added `document.documentElement.lang = lang` to shared `useGameI18n` hook (all 17 games). *(Session F)*
- [ ] **14-05. Hardcoded 20-second timer** (not configurable)

---

## Game 15: Gas Law Challenge (4.3/5)

### Major
- [x] **15-01. Browser alert() for input validation** — Replaced `alert()` with inline `validationError` state and `role="alert"` message in App.tsx. *(Session C)*
- [ ] **15-02. No input bounds validation** — Extreme values accepted with no helpful feedback.
- [x] **15-03. Deprecated onKeyPress** — Replaced `onKeyPress` with `onKeyDown` in App.tsx. *(Session C)*

### Minor
- [x] **15-04. Polish translations have encoding issues** — Fixed all Polish diacritics throughout i18n.ts `pl` section. *(Session D)*
- [x] **15-05. GameStats totalTime field unused** — Removed from interface and default stats. *(Session F)*
- [ ] **15-06. No game completion indicator**
- [ ] **15-07. Particle simulation not physics-accurate for extreme values**

---

## Game 16: pH Titration (4.6/5)

### Major
- [x] **16-01. Missing ARIA labels on lab equipment** — Added `role="meter"`, `aria-label`, `aria-valuenow/min/max` to Burette.tsx and PHMeter.tsx. Added `role="img"`, `aria-label` to Flask.tsx body. *(Session B)*
- [x] **16-02. No keyboard navigation in Level 2** — Added `onKeyDown`/`onKeyUp`/`onBlur` handlers to hold-to-pour button for Space/Enter keyboard operation. Added `aria-label` to increment buttons (+0.05, +1, +5 mL). Added `focus-visible:outline` classes to all controls. *(Session B)*
- [x] **16-03. Flask fixed size overflows mobile** — Changed `w-60` to `w-48 md:w-60` on both outer container and flask body in Flask.tsx. *(Session C)*

### Minor
- [ ] **16-04. Challenge type labels hardcoded Icelandic** — Level3.tsx:88-97.
- [x] **16-05. Flask indicator opacity too low** — Increased from 0.1 to 0.3. *(Session F)*
- [x] **16-06. Level lock messages not translated** — Replaced hardcoded text with `t('levels.level2/3.locked')`. *(Session F)*
- [ ] **16-07. L3 tolerance inconsistency** (most 2%, Challenge 7 is 5%)

---

## Game 17: Thermodynamics Predictor (4.4/5)

### Major
- [x] **17-01. Spontaneity buttons too small on mobile** — Changed `grid-cols-3` to `grid-cols-1 lg:grid-cols-3` in App.tsx. *(Session C)*
- [x] **17-02. CSS variable inline styles without fallback** — Added fallback hex colors to all 4 CSS variable references in App.tsx. *(Session C)*

### Minor
- [ ] **17-03. DG tolerance ±5 kJ/mol generous** — Consider ±2-3 for harder levels.
- [ ] **17-04. No tutorial or onboarding**
- [x] **17-05. No skip links** — Added "Fara í efni" / "Fara í verkefni" skip links to menu and game screens. *(Session F)*

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| Critical (remaining) | 0 | All critical issues resolved |
| Critical (fixed) | 7 + 1 false positive | 1-01a, 1-01b/2-01, 3-01, 3-02, 4-01, 5-01, 12-01; 3-03 was false positive |
| Major (fixed) | 33 | Session B(9) + C(9) + D(6) + E(9) |
| Major (remaining) | 15 | UX, accessibility, pedagogical problems |
| Minor (fixed) | 23 | Session F: 22 fixes + 1 false positive |
| Minor (remaining) | 28 | Polish, consistency, nice-to-haves |

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

**Session D — Major i18n fixes** *(completed)*
- 1-02, 2-03, 9-01, 10-02, 12-01, 13-01, 15-04 (hardcoded text, missing translations, encoding, unused i18n)

**Session E — Major pedagogical fixes** *(completed)*
- 3-04, 3-05, 4-02, 4-03, 6-01, 8-01, 10-01, 11-03, 11-04

**Session F — Minor issues (remaining polish)** *(completed)*
- 1-05, 2-08, 3-08, 3-09, 4-07, 5-06, 6-03, 6-04, 7-02, 8-02, 8-04, 9-04, 10-04, 11-05, 12-05, 13-04, 13-06, 14-04, 15-05, 16-05, 16-06, 17-05 (+ 1-08 false positive)

---

## Session Log

*Update this section after each work session.*

| Session | Date | Issues Fixed | Commit(s) | Notes |
|---------|------|-------------|-----------|-------|
| Pre-work | 2026-02-20 | Cross-cutting: -tranwarm-, focus:outline-hidden | `9060395` | 26 files, 12+15 games |
| A | 2026-02-20 | 3-01, 3-02, 3-03(FP), 4-01, 5-01, 1-01a(verified), 1-01b(×17) | `fix/session-a-critical-bugs` | 6 critical fixed, 1 false positive, 12-01 deferred to D |
| B | 2026-02-20 | 14-03, 16-01, 16-02, 13-02, 12-02, 12-03, 5-04, 9-02, 7-01 | `fix/session-b-accessibility` | 9 major accessibility fixes across 7 games: ARIA labels, keyboard nav, screen reader SVGs, focus styles, color-blind support |
| C | 2026-02-20 | 17-01, 17-02, 13-03, 11-01, 11-02, 16-03, 14-01, 14-02, 15-01, 15-03 | `fix/session-c-ux-mobile` | 9 major UX/mobile fixes across 6 games: responsive grids, touch targets, CSS fallbacks, timer pause, inline validation, deprecated API |
| D | 2026-02-20 | 1-02, 2-03, 9-01, 10-02, 12-01, 13-01, 15-04 | `fix/session-d-i18n` | 7 major i18n fixes across 6 games: Icelandic diacritics (molmassi), Polish diacritics (kinetics, gas-law, +4 others), hardcoded UI→i18n (nafnakerfid ~77 keys, redox ~60 strings), L3 content i18n (hess-law ~40 keys), data i18n (buffer ~48 translations) |
| E | 2026-02-20 | 3-04, 3-05, 4-02, 4-03, 6-01, 8-01, 10-01, 11-03, 11-04 | `fix/session-e-pedagogical` | 9 major pedagogical/a11y fixes across 7 games: hints added (DA L2, lausnir L2), sig fig scoring fixed, mastery thresholds (lausnir 65%, IMF 80%), CO explanation corrected, kinetics validation, bond keyboard a11y, AchievementsPanel focus trap |
| F | 2026-02-20 | 1-05, 1-08(FP), 2-08, 3-08, 3-09, 4-07, 5-06, 6-03, 6-04, 7-02, 8-02, 8-04, 9-04, 10-04, 11-05, 12-05, 13-04, 13-06, 14-04, 15-05, 16-05, 16-06, 17-05 | `fix/session-f-polish` | 22 minor fixes + 1 false positive across 14 games: dead code removal (OctetViolationChecker, flask CSS, totalTime), a11y (ARIA labels, skip links, focus styles, screen reader formulas), i18n (VSEPR title, lock messages, HTML lang), UX (reset confirmations, distractor range, mobile grids, hint penalty, opacity), validation (zero-guard, input trim) |
