# Game Review: Nafnakerfið (Year 1)

## Summary

Nafnakerfið ("The Naming System") is a four-mode chemistry game teaching Icelandic chemical nomenclature. Level 1 teaches four naming rule categories (simple ionic, variable oxidation state, polyatomic ion, molecular) through a learn→warmup→quiz progression. Level 2 provides guided step-by-step naming practice. Level 3 is a memory matching game pairing formulas with names. A bonus "Nafnasmiðja" (Name Builder) activity has students construct compound names from word parts. The game covers 59 compounds across three difficulty tiers.

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| D1. Science Education | 4/5 | Strong constructivism (learn rules→practice→recall→construct). 4-tier hints in L1 quiz. Misconception targeting for all 4 rule types. Missing: spaced repetition, and NameBuilder lacks misconception feedback when wrong. L2's "explain why" reasoning is excellent. |
| D2. Graphic Design | 4/5 | Clean level-coded design (blue/yellow/red/purple). Card flip animation in L3 is satisfying. MolecularStructure component provides ball-model and structural formula visualizations. Warm palette consistent with platform. Minor: L3 card grid can be awkward on mobile for easy difficulty (3-col with 6 cards). |
| D3. Scientific Accuracy | 5/5 | 59 compounds correctly named in Icelandic nomenclature. Proper -íð endings, Roman numerals for variable oxidation states, Greek prefixes for molecular compounds. Real compound database including common lab chemicals and advanced molecules (XeF₄, Mn₂O₇, Fe₃O₄). Element names correct in Icelandic. |
| D4. Physical/Spatial | 4/5 | Responsive layout with md: breakpoints throughout. Level 1 learn phase has good mobile scaling. Level 3 memory card grid may clip on small screens for certain difficulties. Input fields properly sized. Modal dialogs (match info in L3) lack ARIA attributes and focus trap. |
| D5. Game Design | 4/5 | Four distinct modes provide variety (learn, guided practice, memory, construction). Level gating (must complete L1 before L2) enforces progression. Memory game is engaging with match celebrations showing compound info. NameBuilder is creative but scoring is too forgiving (minimum 5 points regardless of attempts). |
| D6. Age-Appropriate | 5/5 | Perfect for Year 1 (Brown Ch. 2–3). Simple ionic compounds dominate easy tier. Variable oxidation states and polyatomic ions in medium tier. Greek prefixes and exotic compounds in hard tier. Progression matches what students would learn in first-year chemistry. |
| D7. Consistency | 4/5 | Uses shared components: LanguageSwitcher, ErrorBoundary, AchievementsPanel/Button, AchievementNotificationsContainer, FeedbackPanel, useGameI18n, useGameProgress, useAchievements. Has back link to game overview. **Missing:** Breadcrumbs, shared Header/Footer. NameBuilder doesn't trigger achievement tracking. |
| **Overall** | **4.3/5** | |

## Strengths

- **Four-mode learning design:** Rules→warmup→quiz (L1) → guided step-by-step (L2) → recall via memory game (L3) → construction (NameBuilder) provides four different cognitive approaches to the same content
- **Excellent compound database:** 59 compounds with correct Icelandic nomenclature, categorized by difficulty and compound type, with educational info for each compound
- **Misconception-aware design:** Four explicit misconceptions addressed in L1 (ionic vs. molecular confusion, Roman numeral meaning, polyatomic ion names, mono- prefix rule)
- **Memory game with learning moments:** L3 pauses on each match to show the formula-name pair with molecular visualization and info text — turns a simple memory game into a teaching moment
- **Warmup phase in L1:** The metal/nonmetal classification warmup (8 questions) builds prerequisite knowledge before the naming quiz, excellent scaffolding
- **Answer normalization in L2:** Accepts various input formats (with/without diacritics, with/without parentheses, case-insensitive) reducing frustration from formatting errors
- **Strong test coverage:** 30 tests covering data integrity, app navigation, and state management

## Issues (prioritized)

### Critical (scientific inaccuracy, broken functionality)

1. **Build script path mismatch** — `package.json` build script has `mv ../../../../dist/1-ar/games/index.html` but output goes to `dist/efnafraedi/1-ar/games/index.html`. The `mv` fails (exit code 1), though the HTML file is created correctly. Identical issue to Mólmassi — likely affects all games.

### Major (significant UX/pedagogical problems)

2. **Level 3 match modal lacks accessibility** — The match info modal at Level3.tsx uses a simple `div` with `onClick={dismissMatchInfo}` but is missing:
   - `role="dialog"` and `aria-modal="true"`
   - Focus trap (keyboard users can tab to elements behind the modal)
   - Escape key handler to dismiss
   - This is a WCAG 2.1 AA violation

3. **Hardcoded Icelandic UI text** — All level titles, instructions, button labels, and feedback strings are hardcoded in Icelandic within the component files rather than using the i18n system. Examples: "Reglur um nafngift" (Level1.tsx), "Nefndu efnasambandið" (Level2.tsx), "Minnisleikur: Nafnagift" (Level3.tsx), "Nafnasmiðja" (NameBuilder.tsx). This prevents the English and Polish translations from working for in-game text.

4. **NameBuilder doesn't trigger achievements** — Completing the bonus activity calls `onComplete` but doesn't hook into `trackGameComplete()` or `trackLevelComplete()`. Students who play the NameBuilder get no achievement recognition.

5. **Warmup phase uses emoji without text fallback** — The metal/nonmetal classification uses ⚙️ and 💨 emojis without aria-labels or text alternatives. Screen readers cannot convey the meaning.

### Minor (polish, consistency, nice-to-haves)

6. **Hint tracking inconsistency across levels** — L1 tracks hints by tier (max 4), L2 tracks by count, L3 doesn't track hints at all. Makes cross-level learning analytics unreliable.

7. **Score scaling not normalized** — L1 max: 100 points (10 × 10), L2 max: 180 points (12 × 15), L3 max: 60–200+ (varies by difficulty). Scores across levels are not comparable.

8. **Level 3 card grid layout on mobile** — Easy difficulty creates a 3-column grid for 6 pairs (12 cards), which works but cards may be small with `aspect-[3/4]` ratio on narrow screens.

9. **Answer normalization too permissive** — Level2.tsx line 265 converts `þ` to `th`, which could theoretically cause false positives. Low-risk but inconsistent with proper Icelandic handling.

10. **Missing component-level tests** — No tests for warmup question logic, L2 answer normalization edge cases, L3 memory flip/match mechanics, or NameBuilder part ordering.

11. **Polish translations unverified** — Polish chemistry terminology in i18n.ts has not been reviewed by a Polish chemistry educator.

## Recommendations

1. **Fix L3 modal accessibility** — Add `role="dialog"`, `aria-modal="true"`, focus trap, and escape key handler to the match info modal.

2. **Extract hardcoded strings to i18n** — Move all in-component Icelandic text to `i18n.ts` keys so English and Polish translations work throughout the game.

3. **Connect NameBuilder to achievements** — Call `trackCorrectAnswer()` on each correct name and `trackLevelComplete()` on completion.

4. **Add emoji text alternatives** — Add `role="img"` and `aria-label` to warmup emojis, or replace with text labels + icons.

5. **Normalize score scaling** — Consider a consistent 0–100 scale across all levels, or display percentage alongside raw points.

6. **Fix build script paths** — Update `mv` path in `package.json` to use `efnafraedi/` prefix (platform-wide fix needed for all games).
