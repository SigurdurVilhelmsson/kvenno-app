# Game Review: Gas Law Challenge (Year 3)

## Summary

Gas Law Challenge (Lofttegundalögmál) is a problem-solving game focused on the Ideal Gas Law (PV=nRT) with 14 real-world gas law questions across easy (4), medium (6), and hard (4) difficulty levels. The game offers two modes: practice (unlimited time, progressive hints, law identification step, full solutions) and challenge (90-second time limit, hint penalties). In practice mode, students first identify which gas law applies (Ideal Gas Law, Boyle's, Charles, Gay-Lussac, Combined, Avogadro's) before solving numerically. Each question includes 4 progressive hints and a 4-step worked solution (formula rearrangement, substitution, calculation, summary). The game features a shared ParticleSimulation component showing gas molecules with temperature-dependent speed and pressure-dependent container border color. Real-world scenarios include hot air balloons, scuba diving, Mount Everest altitude, aircraft cabin pressure, weather balloons, and spacecraft environments.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 5/5 | Two-step practice mode forces conceptual understanding: identify law BEFORE solving numerically. 14 questions with real-world contexts (balloons, bike tires, scuba diving, Everest, aircraft, industrial gas cylinders, weather balloons, spacecraft). Progressive hints scaffold from concept identification through formula through substitution to final calculation. Detailed 4-step solutions show complete worked approach. Feedback distinguishes "Fullkomið!" (<1% error) from "Rétt!" (within tolerance). |
| D2. Graphic Design | 4/5 | ParticleSimulation shows gas behavior with temperature-proportional speed and pressure-indicated border color (blue=low, green=normal, red=high). Clean card-based UI with warm gradients. Emoji usage enhances visual communication (🎈, 🤿, 🏔️, ✈️). Distinct mode cards (blue practice, orange challenge). Color-coded difficulty levels. Professional typography (Plus Jakarta Sans headings, DM Sans body). |
| D3. Scientific Accuracy | 5/5 | All 14 questions mathematically verified: R = 0.08206 L·atm/(mol·K) consistently used. Sample checks: balloon V = (0.15×0.08206×310)/1 = 3.82 L ✓, Everest n = (0.33×5.0)/(0.08206×243) = 0.083 mol ✓, aircraft V = (0.50×0.08206×223)/0.26 = 35.2 L ✓. Real-world physical accuracy: Everest 0.33 atm at 8849m ✓, 100m dive = 11 atm ✓, aircraft 10km = 0.26 atm ✓. 39 unit tests validate all calculation functions including edge cases. |
| D4. Physical/Spatial | 3/5 | Responsive with md:grid-cols-2/3, max-w-5xl container. Touch-friendly buttons (py-3 px-6, 48px+). Keyboard shortcuts documented (Enter: check, H: hint, S: solution). ariaLabel on ParticleSimulation. **Issues:** `focus:outline-hidden` (invalid Tailwind, App.tsx:664) breaks focus visibility. `onKeyPress` deprecated (App.tsx:665, should be `onKeyDown`). No aria-labels on law selection buttons. Emoji usage provides non-color cues (✓, ❌, 🔥, 🏆). |
| D5. Game Design | 4/5 | Scoring: 100 base + 50 accuracy bonus (<1% error) + 50 time bonus (>60s remaining in challenge) − 10 per hint. Streak tracking with best-streak persistence. Achievement system via shared hooks with milestone tracking every 5 questions. Two modes serve different learning goals (exploration vs. speed). Progress persisted to localStorage. **Issues:** Browser `alert()` for invalid input (App.tsx:186) disrupts game flow. No game completion indicator. |
| D6. Age-Appropriate | 5/5 | Ideal Gas Law matches Year 3 curriculum. Progressive difficulty: easy (basic PV=nRT), medium (mixed real-world scenarios), hard (complex multi-step). Real-world connections (scuba safety, aircraft engineering, weather science, space technology) motivate learning. Proper Icelandic: lofttegundalögmál, þrýstingur, rúmmál, hiti, mólfjöldi. Assumes prerequisite algebra skills appropriately. |
| D7. Consistency | 4/5 | Uses 8 shared components: ParticleSimulation (with PARTICLE_TYPES, PHYSICS_PRESETS), LanguageSwitcher, ErrorBoundary, AchievementsButton, AchievementsPanel, AchievementNotificationsContainer, useGameI18n, useAchievements. Full 3-language i18n (290 lines). localStorage progress with safe JSON serialization. **Issue:** Polish translations have encoding issues ("cwiczeniowy" should be "ćwiczeniowy"). |
| **Overall** | **4.3/5** | |

## Strengths

- **Two-step practice mode scaffolding:** Law identification step before numerical solving forces conceptual understanding. Students must recognize WHICH law applies (from 6 options) before calculating. Clear feedback on incorrect selection explains the correct law with its formula. "Skip" button available for confident students.
- **14 real-world gas law scenarios:** Hot air balloons (thermal expansion), bike tires (temperature-pressure), soda bottles (dissolved gas pressure), scuba diving (depth-pressure), Mount Everest (altitude-pressure at 0.33 atm, -30°C), aircraft at 10km (0.26 atm, -50°C), industrial gas cylinders, weather balloons, and spacecraft environments. Physical values verified against real-world data.
- **Comprehensive test suite (39 test cases):** Tests cover all calculation functions: solveGasLaw for each variable, checkAnswer with tolerance ranges, calculateError, getFormula, getUnit, and getVariableName. Edge cases tested including zero tolerance, missing values, and extreme pressures.
- **Progressive hint system with 4 levels:** Each question has 4 hints moving from concept identification → formula selection → substitution with values → calculation result. Helps weak students construct understanding without giving away the answer. Hint cost in challenge mode (-10 points) discourages overuse.
- **Detailed worked solutions:** 4-step solution display: formula rearrangement (e.g., V = nRT/P), substitution with units (V = (0.15)(0.08206)(310)/(1.0)), calculation (V = 3.82 L), and summary explanation connecting to the physical scenario.
- **Particle simulation with physics feedback:** ParticleSimulation shows gas molecules with speed proportional to temperature (kinetic theory: v ∝ √T) and container border color indicating pressure (blue=low, green=normal, red=high). Configurable particle count (10-80) based on moles.

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **Invalid Tailwind class `focus:outline-hidden`** — App.tsx line 664: Number input field uses `focus:outline-hidden` which is not a valid Tailwind CSS class (should be `focus:outline-none`). Focus outline behavior is undefined, breaking keyboard focus visibility (WCAG 2.4.7 Focus Visible violation).

### Major (significant UX/pedagogical problems)

2. **Browser `alert()` for input validation** — App.tsx line 186: `alert('Vinsamlegast sláðu inn gilt númer')` uses a modal browser dialog instead of inline error message. Disrupts game flow, is not internationalized, and creates poor UX. Fix: replace with inline validation message.

3. **No input bounds validation** — App.tsx lines 184-187: User can enter extreme values (1,000,000 or -5) with no helpful feedback. Tolerance check marks as incorrect but doesn't distinguish typos from calculation errors.

4. **Deprecated `onKeyPress` handler** — App.tsx line 665: Uses `onKeyPress` which is deprecated in React. Should be `onKeyDown` for future compatibility.

### Minor (polish, consistency, nice-to-haves)

5. **Polish translations have encoding issues** — i18n.ts lines 211, 236: "cwiczeniowy" should be "ćwiczeniowy", missing diacritics throughout Polish section. Polish version is unusable for proper terminology.

6. **No game completion indicator** — Challenge mode has no fixed "end" — players continue until choosing to stop. Achievement at 15 questions provides partial closure, but no explicit "game complete" state.

7. **GameStats totalTime field unused** — types.ts line 120: `totalTime` field defined in GameStats but never updated in App.tsx. Timer runs in challenge mode but time data isn't persisted.

8. **Particle simulation not physics-accurate for extreme values** — App.tsx lines 586-589: Container size fixed at 400×280px regardless of volume. Q6 (hot air balloon, 4924 L) renders same container as Q1 (3.82 L). Visualization is decorative rather than quantitative.

## Recommendations

1. **Fix Tailwind class** — Replace `focus:outline-hidden` with `focus:outline-none` on App.tsx line 664.
2. **Replace alert() with inline validation** — Show error message below input field using a state variable and conditional rendering. Internationalize the message via i18n.
3. **Fix Polish diacritics** — Have a Polish speaker review all translations in i18n.ts lines 195-289.
4. **Replace onKeyPress with onKeyDown** — Update App.tsx line 665 for React compatibility.
5. **Add input range validation** — Show helpful messages for clearly out-of-range values (negative, extremely large) before tolerance checking.
