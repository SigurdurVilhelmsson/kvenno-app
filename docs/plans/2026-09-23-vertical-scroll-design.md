# Vertical scrolling on phones: design for the follow-up PR

**Status:** final synthesis, 2026-09-23. It goes in a separate PR after the mobile pass on
`claude/ultracode-effort-lk5drl`.
**Base design:** _compact_ (compaction + anchoring + adjacency). All three judges ranked it first.
**Grafts:** from _steps_, the focus model, stage hiding and (as a Siggi-gated pilot) paged feedback.
From _dock_, a pinned task strip with a live status for build loops, and a reference drawer for true
reference tables only.
**Rejected wholesale:** the steps split of stimulus from question as a default, the dock's single
Athuga→Næsta element, and the dock's global pins, viewport-meta change and explore drawers.

Paths are relative to the repo root unless stated. `$VS/`, `mobile/vsweep/` and screenshot names
refer to the study's working files (the sweep data, prototypes and screenshots), which were not
committed; every number quoted from them is reproduced in this document.

"Critic:" notes are corrections made by a completeness review after the synthesis; where one
contradicts the text around it, the Critic note wins.

---

## 0. Answer to Siggi's question, in one paragraph

On a phone the whole game can **not** fit one screen, and the data show why. The sweep measured
316 recorded screens × 4 viewports. Only **17 of 316 fit 360×640 as a whole page, 20 fit 390×664,
6 fit the SE and 0 fit landscape**. The median page is **2.1 screens** at 360×640 and **3.3** in
landscape. But the page is the wrong unit. What matters is the **play loop**: the prompt, the
control, the response and the next action. Most loops can be put on one screen with phone-only
compaction plus scroll/focus anchoring, with no split and no content change. A minority cannot:
build loops with a target, the lab benches, multi-panel feedback and landscape. Those get a small
set of structural remedies:

- a pinned target strip;
- play-order flattening;
- hiding stages that are not active yet;
- two columns in landscape;
- tabs for one screen;
- optionally, paging for one feedback.

Teaching pages stay a scroll on purpose.

---

## 1. Findings

### 1.1 Whole-page height (sweep, `mobile/vsweep/sweep-all.json`, clean build on :4175)

`screens` = docH / visible height. The median is over every recorded screen of the game, menu
included.

| Game                          | n   | 360×640  | 390×664 | 375×548 | 740×340  | fits 640                         | worst |
| ----------------------------- | --- | -------- | ------- | ------- | -------- | -------------------------------- | ----- |
| 1-ar/dimensional-analysis     | 13  | 1.83     | 1.63    | 2.02    | 3.31     | 0                                | 3.17  |
| 1-ar/lotukerfid               | 14  | 1.73     | 1.73    | 1.99    | 2.78     | 1                                | 2.67  |
| 1-ar/nafnakerfid              | 11  | 1.61     | 1.45    | 1.81    | 2.68     | 0                                | 2.49  |
| 1-ar/molmassi                 | 13  | 1.39     | 1.28    | 1.58    | 2.19     | 5                                | 2.25  |
| 1-ar/reynsluformulur          | 13  | 1.18     | 1.14    | 1.38    | 2.05     | 4                                | 3.30  |
| 1-ar/utfellingarhvorf         | 14  | 1.90     | 1.71    | 2.21    | 2.90     | 2                                | 3.53  |
| 1-ar/jafna-jofnur             | 12  | 1.43     | 1.33    | 1.80    | 2.20     | 0                                | 2.14  |
| 1-ar/takmarkandi              | 13  | 1.55     | 1.43    | 1.76    | 2.49     | 2                                | 2.22  |
| 1-ar/lausnir                  | 13  | 2.56     | 2.36    | 2.89    | 3.28     | 0                                | 2.98  |
| 1-ar/einingakedjan            | 11  | 2.55     | 2.41    | 2.92    | 3.59     | 0                                | 3.61  |
| 2-ar/hess-law                 | 12  | 2.72     | 2.50    | 3.10    | 4.21     | 0                                | 4.44  |
| 2-ar/kinetics                 | 11  | 2.39     | 2.25    | 2.76    | 3.82     | 0                                | 5.37  |
| 2-ar/lewis-structures         | 15  | 2.07     | 1.95    | 2.36    | 3.46     | 0                                | 2.58  |
| 2-ar/vsepr-geometry           | 12  | 2.56     | 2.41    | 2.99    | 4.08     | 0                                | 6.09  |
| 2-ar/intermolecular-forces    | 12  | 2.95     | 2.71    | 3.37    | 4.46     | 0                                | 3.76  |
| 2-ar/organic-nomenclature     | 14  | 1.90     | 1.66    | 2.10    | 2.85     | 0                                | 2.70  |
| 2-ar/redox-reactions          | 12  | 1.75     | 1.62    | 2.00    | 2.71     | 0                                | 4.56  |
| 2-ar/rafeindabygging          | 11  | 1.48     | 1.41    | 1.71    | 2.41     | 1                                | 2.63  |
| 3-ar/ph-titration             | 11  | 2.66     | 2.48    | 3.09    | 4.34     | 0                                | 3.56  |
| 3-ar/gas-law-challenge        | 11  | 3.29     | 3.08    | 3.70    | 5.11     | 0                                | 4.50  |
| 3-ar/jafnvaegisfasti          | 13  | 1.53     | 1.39    | 1.70    | 2.75     | 0                                | 3.57  |
| 3-ar/equilibrium-shifter      | 10  | 2.94     | 2.76    | 3.38    | 4.86     | 0                                | 5.24  |
| 3-ar/syrufastinn              | 11  | 1.41     | 1.31    | 1.60    | 2.23     | 0                                | 3.44  |
| 3-ar/thermodynamics-predictor | 11  | 4.35     | 4.15    | 5.03    | 7.62     | 0                                | 5.61  |
| 3-ar/buffer-recipe-creator    | 11  | 2.99     | 2.85    | 3.50    | 5.07     | 0                                | 6.05  |
| 3-ar/leysnijafnvaegi          | 12  | 1.81     | 1.68    | 2.03    | 2.84     | 2                                | 3.43  |
| **All**                       | 316 | **2.13** |         |         | **3.31** | **17** (iPhone 20, SE 6, land 0) |       |

> Critic (verified against `sweep-all.json`): counts and medians reproduce (2.12 / 1.95 / 2.40 /
> 3.31). "17" counts `screens ≤ 1.00` after rounding; strictly `docH ≤ vh` it is **16** — takmarkandi
> screen 12 is 642 px at 640. Every "fitting" screen has `docH` exactly equal to `vh`, i.e. the page
> is `min-h-screen`, so "fits" means "shorter than one screen", not "fills it".

### 1.2 Play loops: the numbers that matter

Scrolls are manual scrolls per attempt at 360×640 with touch, measured by the analysts' or designers'
scripted student. It scrolls minimally, so a real student makes fewer, larger scrolls.

**Worst loops today**

| Loop                                               | Today                                                                  | Main cause                                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| equilibrium-shifter, one equilibrium, read in full | 12–14 scrolls / 1 790–2 529 px (landscape 13–15 / 2 887)               | ≈740 px of illustration above the stress list; ≈2 000 px feedback                    |
| dimensional-analysis Stig 2 problem                | 6–7 / 1 520–2 130 px                                                   | the visualizer is never on screen with the tapped factor; Athuga at page 1 700       |
| hess-law Stig 1 challenge                          | 5–8 / 1 154–2 008 px                                                   | 208 px header card, Athuga at the foot, Næsta leaves the next challenge 900 px above |
| organic-nomenclature L2 name builder               | 5–6 / ~800 px per molecule × 15                                        | 240 px square SVG, zones stacked, 290 px pool                                        |
| hess-law Stig 2 puzzle                             | 4–5 / 1 072–1 134 px                                                   | target and running ΔH are 1 070 px apart, never on screen together                   |
| einingakedjan Beita, 3-card chain                  | 3 manual + 3 automatic jumps of ≈500 px                                | tray below target; reveal jumps up after every tap                                   |
| buffer-recipe-creator Stig 1                       | ± buttons 680 px from the pH readout                                   | a two-column desktop layout collapses into one column                                |
| thermodynamics-predictor practice                  | the slider is 780 px above the graph it drives; 1.8 screens to Athuga  | the same                                                                             |
| gas-law-challenge question                         | Athuga 2.2 screens down; the 90 s timer runs while the student scrolls | a 546 px simulator between the question and its data                                 |
| lausnir Stig 2                                     | 3–4 per question                                                       | no anchoring after submit                                                            |
| rafeindabygging L1                                 | 4                                                                      | tall n badge, 64 px cards                                                            |
| intermolecular-forces quiz                         | opens at scrollY 871 with the prompt above the viewport                | no scroll reset at all                                                               |

**Loops that already fit and are models:** redox L3 (step split + nearest reveal, 0 scrolls);
takmarkandi L3 (3-step split under a persistent data card); reynsluformulur Æfa (one column per
step); nafnakerfid L2 (4-step stepper); lotukerfid L1/L3 (`phoneScroll.ts`, 0 manual scrolls);
molmassi L3 (Svara swaps to Næsta in place); leysnijafnvaegi Æfa/Beita.

**Measured prototypes (compact design, touch, before → after, scrolls / px per attempt)**

| Loop             | 360×640        | 390×664        | 375×548        | 740×340        |
| ---------------- | -------------- | -------------- | -------------- | -------------- |
| hess Stig 1 c1   | 5/1154 → 2/220 | 5/1078 → 2/196 | 5/1194 → 3/312 | 5/1098 → 3/300 |
| hess Stig 1 c2   | 6/1560 → 3/448 | 5/1508 → 3/348 | 6/1740 → 4/488 | 7/1568 → 4/400 |
| hess Stig 2      | 5/1134 → 1/142 | 5/1026 → 1/118 | 5/1258 → 2/234 | 4/1570 → 2/288 |
| hess Stig 3      | 4/861 → 1/153  | 4/841 → 1/69   | 4/933 → 1/225  | 4/1172 → 1/349 |
| DA Stig 2 (drag) | 7/1686 → 4/442 | 7/1606 → 4/382 | 7/1778 → 4/514 | 7/1848 → 5/628 |

Other measurements from the same prototypes:

- **Spans.** DA pool → Lokaeining went from 977 to 453 px (fits); in landscape, 875 → 103 px.
  Hess Stig 2 target → Athuga went from 1 278 to 546 px (fits).
- **Screen entry.** The hess Stig 3 intro heading moved from −314 px to +60 px, with focus on the H1.
- **Desktop.** At 1280×800, 11 seeded scenarios render byte-identical PNGs. 647 of 648 tests pass;
  the one failure is a test that mocks the old local reveal helper.

For comparison, other designs measured:

- **steps:** hess Stig 1 went from 6–7 scrolls to 0 at 640/664, at the cost of 1 extra tap. The
  eq-shifter equilibrium went from 12–14 to 3 scrolls, at the cost of 3 extra taps.
- **dock:** hess Stig 2 went from 4 to 1 scroll, with the target and ΔH on screen together 100 % of
  the time. Landscape did not improve (hess L1 stayed at 5 scrolls).

### 1.3 Cross-game defects the analysts found repeatedly (ranked by payoff)

1. **No scroll/focus reset on screen swaps.** Examples:
   - IMF opens its quiz at scrollY 871;
   - syrufastinn returns to its menu at 997, with every phase card above the viewport;
     **Critic: not reproduced** on the :4175 build at 360×640 — choosing Beita from menu scrollY 744
     opens Beita at 0 and '← Til baka' returns the menu to scrollY 0 with focus on `<body>`. The
     real defect is the opposite: at 0 the phase cards sit at y 508/676/820/988, so only Kanna is
     on screen. The `useScreenTop({target})` remedy still applies; re-measure the 997 figure on
     HEAD before quoting it;
   - hess/kinetics/redox intros open 32–454 px past their heading;
   - organic lands 24–520 px down;
   - every Næsta in hess, kinetics and IMF leaves the next title above the viewport.

   On a phone this defeats teach-before-test: the student lands on Byrja without seeing the teaching.

2. **Focus drops to `<body>` whenever the pressed button unmounts.** This happens in almost every
   game: Athuga, Svara, stage buttons, stress/predict, Já/Nei.
3. **Feedback or the next action lands off-screen** after a commit, or feedback is inserted between
   a control and the finger that is using it. Cases: lausnir L1/L2, nafnakerfid quiz/L3, redox L2
   (verdict at viewport 648), hess, kinetics, DA C1/C2 shifts, syrufastinn (verdict visible, action
   not).
4. **Level/phase chrome of 100–340 px** is repeated above every item.
5. **Two-column desktop layouts collapse into one long column**, separating a control from its
   response: thermo, gas-law, buffer L1, ph-titration L2.
6. **Explore widgets and reference cards sit far from the thing they serve**: vsepr L1, kinetics,
   ph L3 tables, lewis/vsepr references.
7. **Landscape is 3–10 screens per attempt**, because the side-by-side layouts start only at md/lg.
8. **Menus show 1–1.5 of their choices on first load** (the four-phase template, lausnir,
   einingakedjan).
9. **16 copies of reveal/scroll helpers exist** (Critic: was "15"; organic-nomenclature's
   `src/hooks/useRevealWhenShown.ts` — `useRevealWhenShown`, `useReturnToPrompt` — was missed),
   each with different header/bar awareness (DA,
   lausnir, nafnakerfid, einingakedjan, reynsluformulur, utfellingarhvorf, ph-titration, buffer,
   jafnvaegisfasti, leysnijafnvaegi, syrufastinn, equilibrium-shifter reveal.ts; lotukerfid and
   vsepr phoneScroll.ts; lewis useRevealOnChange.ts; organic useRevealWhenShown.ts). On top of
   those, **39 non-test game files call `scrollIntoView`/`scrollTo`/`scrollBy` inline** — they are
   helpers too, just unnamed.
   **Critic: most of these helpers are NOT phone-gated.** lausnir, buffer, einingakedjan,
   syrufastinn, leysnijafnvaegi, jafnvaegisfasti and organic scroll whenever the target is
   off-screen, at any width (organic's doc comment: "Where the verdict is already visible — every
   desktop layout — nothing moves"). On a 1280×800 window with a long page (thermo, buffer, eq-
   shifter feedback) they do move today. See the P2 correction.

### 1.4 Caveats that bind the implementers

- **Re-measure from HEAD.** The :4175 sweep build predates several non-layout commits: ed9344c (DA
  L2 reorder), ddcf36c, 9fa2b65, 72e63ea, 0329ef1, a031c04, f7ba1cf. Layout differences are under
  ~20 px except DA L2, whose HEAD numbers above were measured on a scratch copy.
- **Measure with touch emulation.** The sweep ran without touch. Real phones are 20–110 px taller
  on chip, tab and stepper screens (the pointer-coarse 44 px rule).
- ~~**The working tree has uncommitted edits** in vsepr, molmassi (Stig 2 `defaultExpanded:false`)
  and FeedbackPanel (an icon outdent). Coordinate; do not overwrite.~~ **Critic: stale.** At HEAD
  `4a216bf` `git status` is clean; molmassi `Level2.tsx:610` `defaultExpanded: false` and the
  FeedbackPanel change are committed (3669baf / 61699b0). Build on HEAD; nothing to coordinate.
- **Critic: the follow-up PR's base is `claude/ultracode-effort-lk5drl` (PR #65), not `main`**,
  unless #65 has merged by then. Every "pre-PR" baseline in §6.3 must come from that base.

---

## 2. The pattern set (shared primitives)

All primitives sit in `packages/shared`. Every visible change is phone-gated. **Desktop 1280×800
must be byte-identical**, and each migrated game proves it with the seeded comparison in §6.3.

### P1. `phone:` and `phone-land:` Tailwind variants

**File:** `packages/shared/styles/theme.css`

```css
@custom-variant phone {
  @media (max-width: 639.98px) {
    @slot;
  }
  @media (max-height: 500px) {
    @slot;
  }
}
@custom-variant phone-land (@media (orientation: landscape) and (max-height: 500px));
```

- **Use the block form, never the comma shorthand.** All three designs found independently that
  `(@media a, b)` silently drops the second query.
- `phone:` matches a portrait phone, or any phone on its side. The threshold is the same 500 px line
  at which the shared Header goes static. It is emitted after `sm:`/`md:`, so at 740×340 the
  `phone:` value wins. A desktop window shorter than 500 px also matches, which is intended.
- `phone-land:` turns on existing two-column layouts early for a phone on its side.
- Keep `pointer-coarse:` for touch-only target growth, as the mobile pass established.
- Export `PHONE_QUERY` (the same two media queries) from `@shared/utils` for JS. A test asserts that
  the CSS variant and the JS constant agree.
- **Critic (verified by compiling with the repo's Tailwind 4.3.3):** the block form emits two
  separate `@media` rules per utility, and all three custom variants are emitted **after**
  `sm:`/`md:`/`lg:` and after `max-md:`/`max-lg:`, in the order `phone:` → `phone-land:` → `pin:`.
  So `phone-land:block` does override `max-md:contents` / `max-lg:contents` — which the flattening
  recipe (§3, thermo/gas-law/buffer/ph) **depends on and must spell out**: at 740×340 the width is
  below `md` (768) and `lg`, so a wrapper flattened with `max-md:contents` is still flattened in
  landscape, and `phone-land:grid-cols-2` on its parent then lays out the flattened children, not
  the two columns. Each flattened column wrapper also gets `phone-land:block`.
- **Critic: landscape phones wider than 768 px** (iPhone 14/15 at 844×390, Pro Max 932×430) match
  `phone:`/`phone-land:` **and** `md:` — the desktop two-column layouts turn on by width there, and
  `max-md:` flattening does not. Nothing in the sweep measured this band. Add 844×390 as a smoke
  viewport in §6.2 (loops reachable, no sideways scroll), no loop guarantees.

### P2. Shared anchoring and focus: `packages/shared/utils/reveal.ts`

It is exported from `@shared/utils` and replaces all 15 per-game copies (§1.3.9).

```ts
PHONE_QUERY; isPhone(): boolean; prefersReducedMotion(): boolean
usableArea(): { top: number; bottom: number }   // subtracts a sticky <header> and any [data-pinned-top]/[data-pinned-bottom]
revealSpan(bottom: Element, tops: Element[], opts?: { afterExit?: number }): void
revealTop(el: Element, opts?: { always?: boolean }): void
focusTarget(el: HTMLElement | null): void       // tabIndex=-1 if needed, focus({preventScroll:true})
useScreenTop(key: unknown, opts?: { focus?: RefObject<HTMLElement>; target?: () => Element | null }): void
useItemTop<T extends HTMLElement>(key: unknown): RefObject<T>   // focuses [data-item-start] inside the ref, NOT the first h1
useRevealAfterCommit(when: boolean, get: () => { bottom: Element; tops: Element[]; focus: HTMLElement | null }, opts?): void
```

**Behaviour**

- **Critic correction:** "phone only" applies to the **new** behaviours (`useScreenTop`,
  `useItemTop`, the `revealSpan` candidate search). The migrated **existing** reveals keep their
  current any-width "only if off-screen" semantics (§1.3.9) — gating them to phones would silently
  remove scrolling a desktop user gets today on long pages, which is a desktop behaviour change the
  geometry comparison in §6.3 cannot see. Give `revealSpan`/`revealTop` an `{ anyWidth: true }`
  option and pass it at every call site that replaces a non-gated helper; the per-game migration
  commit states which it was.
- `usableArea()` uses `window.visualViewport` (height and `offsetTop`) when present, falling back to
  `innerHeight`. On iOS Safari and on Chrome Android ≥108 the soft keyboard shrinks only the visual
  viewport; `innerHeight` and media queries do not change. (Critic)
- Scrolling happens only on a phone, so it is a no-op on desktop. It is header- and pin-aware,
  moves as little as possible, and jumps instantly under `prefers-reduced-motion` (smooth
  otherwise).
- **`revealSpan`** tries each candidate top in order, from most context to least: question → the
  student's own choice → verdict. It shows the first span down to `bottom` that fits. If none fits,
  it aligns the **verdict** to the top. It never shows only the button (a bug found in the
  prototype, where it hid the verdict in landscape).
- **`useScreenTop`** runs in a layout effect on menu↔level, intro→play, phase or mode changes, so
  there is no flash at the old offset.
  - It goes to the top of the page and focuses the screen heading.
  - **On return to a menu** it reveals and focuses the next uncompleted level/phase card (`target`).
- **`useItemTop`** runs on each item swap (Næsta). It brings the item's top under the header and
  focuses `[data-item-start]`. Each game marks its item heading with `data-item-start`, because the
  compact prototype's `h1, h2, h3` query focused the level H1 instead of the new challenge.
- **Critic: add `revealInline(el, {inline:'end'|'nearest'})`.** Two existing helpers scroll
  **sideways** — lotukerfid `revealScrollLeft` (the periodic table) and einingakedjan's newest-card
  `inline:'end'` in the P7 chain row. Without it, deleting the local copies (§4 step 6) deletes that
  behaviour.
- **`afterExit`** waits a given number of ms for Presence exit animations. It replaces hand-tuned
  constants such as ph-titration `MARKING_EXIT_MS` and thermo `ANSWER_CARD_EXIT_MS`; migrate those
  one game at a time and keep the values.

### P3. Focus-after-commit and anti-skip rule (grafted from steps; resolves a conflict)

**Conflict.** compact focused Næsta after a check. dock kept one element and relabelled it Athuga →
Næsta. Judge 2 reproduced the result: **Enter, Enter within 80 ms, or a double tap 150 ms apart,
skipped the feedback** in both designs. steps, which focuses the new view, survived.

**Rule**

1. After a commit, focus moves to the **feedback region**, not to Næsta. That region is the wrapper
   of FeedbackPanel or the verdict box, with `tabIndex=-1`, `role="group"` and `aria-labelledby`
   pointing at the verdict heading. The next Tab reaches Næsta. A repeated Enter lands on a
   non-button, so nothing happens.
2. **Athuga and Næsta are always separate elements.** Never reuse the Athuga element as Næsta.
3. The shared hook `useArmedAfter(ms = 400)` guards Næsta: it ignores activation for 400 ms after
   Næsta mounts or changes meaning. This covers a touch double-tap, which focus does not.
   - It goes on every post-commit Næsta/Áfram/Halda áfram in migrated screens.
   - It is not a timer the student sees and it grades nothing, so it sits outside the no-timers rule.
4. FeedbackPanel keeps `role="alert"`, and the focused group names the verdict. That can
   double-announce. **Test with VoiceOver and TalkBack in the pilots**; if it does, drop
   `aria-labelledby` and rely on the alert.
5. Screen swaps (P2) focus the new heading. Focus never falls to `<body>`.
6. **Critic: this rule runs on desktop too, and that is a visible change.** Programmatic focus after
   a keyboard or mouse activation can paint a `:focus-visible` ring on the feedback group or
   heading at 1280×800 (Chrome shows it after keyboard use), and the §6.3 PNGs of "one answered
   state per level" would then differ. Either (a) give the `tabIndex=-1` targets
   `focus:outline-none` (acceptable for non-interactive programmatic targets — WCAG 2.4.7 is about
   operable components) and state it in the PR, or (b) accept the ring and record it as the one
   deliberate desktop difference. Siggi should see which; do not let §6.3 be "fixed" by masking.
   Note also that desktop keyboard users gain focus movement they do not have today — a behaviour
   change, deliberate and a11y-positive, but it must be named, not claimed as "byte-identical".

### P4. Level/phase header fold (recipe, plus one shared component where the markup is shared)

**Recipe** (documented in `packages/shared/styles/README.md`). Apply classes to the **existing**
header, never duplicate it:

- card: `phone:px-3 phone:py-2 phone:mb-3`
- row: `phone:flex-nowrap phone:gap-3`
- controls wrapper: `phone:contents`, only on a role-less div
- back link: `phone:order-1 phone:shrink-0`
- title block: `phone:order-2 phone:flex-1 phone:min-w-0`
- counters: `phone:order-3`
- h1: `phone:text-base`
- repeated subtitle/tagline: `phone:sr-only`, never `display:none`
- progress bar: `phone:h-1.5`

Target: one row of at most 70 px (hess measured 208 → 82). The title wraps rather than truncating,
and score/counters stay, only smaller. Also:

- `PhaseHeader` in `packages/shared/components/PhaseHeader.tsx` is shared by the six four-phase games
  (einingakedjan, reynsluformulur, utfellingarhvorf, jafnvaegisfasti, syrufastinn, leysnijafnvaegi).
  It puts `Til baka`, a short title and `Dæmi n af N` on one row.
- The same recipe applies to the four-phase **menu**: tagline `phone:text-base phone:mb-3`, phase
  cards `phone:p-3` with `text-sm` descriptions, intro paragraph after the grid via `phone:order-last`
  (non-focusable text only; **Critic: and only where the paragraph is not teaching** — §3's menu
  rule keeps a teaching blurb first. Check each of the six games' intro text before moving it, and
  note that a CSS-reordered paragraph is read first by a screen reader but seen last, WCAG 1.3.2), `Lokið` as an inline badge, and in landscape a 2×2 grid
  (`phone-land:grid-cols-2`).

### P5. FeedbackPanel phone density

**File:** `packages/shared/components/FeedbackPanel/FeedbackPanel.tsx`. No API change.

- On a phone, a non-interactive `Tengd efni` list (no `onConceptClick`) renders as **one wrapped line
  of words separated by middle dots**. Every word stays visible; do **not** use steps' sideways chip
  row, which clipped chips. Saves 40–90 px. Interactive chips keep their 44 px pills.
- The icon goes inline with the verdict on phones. This builds on the uncommitted outdent in the
  working tree.
- **`Af hverju?` stays expanded by default, and the misconception slot stays outside the collapse
  and visible.** Never add a collapse here to save space.

### P6. `DragDropBuilder compact`

**Files:** `packages/shared/components/DragDropBuilder/{DragDropBuilder.tsx,DropZone.tsx,types.ts}`.

- Adds the prop `compact`. `itemsPoolClassName` and `zonesClassName` already exist.
- On phones: items `px-2 py-1`; zones `min-h-11 p-2`; the zone label becomes `phone:sr-only` while
  the group keeps `aria-label`; the capacity count moves into the corner, and there is no capacity
  line when `maxItems === 1`.
- Tap-to-place, touch drag and keyboard behaviour are unchanged.
- Users: DA Stig 2 and organic L2. Change both in the same commit.

### P7. `TaskStrip` + `status` (grafted from dock; build loops only)

**File:** `packages/shared/components/PinnedTask/TaskStrip.tsx`

```tsx
<TaskStrip>{/* wrap the EXISTING target element, compact form */}</TaskStrip>
```

- **Portrait phone only.** The query is `(max-width: 639.98px) and (min-height: 501px)`; expose it as
  a separate `pin:` variant, not `phone:`.
- In that case it is `position: sticky; top: var(--pin-header-h, 0)`, with an opaque background and
  `data-pinned-top`, and it publishes `--pin-strip-h`. Everywhere else it is a plain block where it
  sits.
- Because it wraps the real element, screen readers read it once.
- **Only for loops where the student compares a running result with a target:** hess L2 (the target
  equation), einingakedjan (the 'Keðjan þín' chain as one horizontal row), jafnvaegisfasti Tengd
  jafnvægi (target + composed equation), buffer L1 (the pH readout + markmið), leysnijafnvaegi Kanna
  (the salt card, compact).
- **Critic (from `3-ar-buffer-recipe-creator--02.png`):** buffer L1's pH readout already carries a
  **live verdict pill** ('Fullkomið!' under 'Núverandi pH: 4,66', shown beside a 'Rangt' feedback
  panel). Wrapping "the existing element" would pin a verdict, which the rule below forbids. The
  buffer strip wraps the pH value + markmið only; the pill stays in flow. Whether that live pill
  should exist at all (it contradicts the check) is a separate defect for §7, not this PR.
- Budget: at most 120 px, with einingakedjan's chain (≈190 px, the student's own work) as the one
  accepted exception.

The **running status**, the one quantity compared with the target (for example Heildar-ΔH), belongs
in P8's `status` slot.

- It is an `aria-hidden` visual copy, **rendered only while pinned**. A hidden twin broke 17
  `getByText` tests in the dock prototype.
- The in-flow readout remains the one screen readers hear.
- **The status shows values only, never a verdict before the check.**

### P8. `PinnedActions` (fallback, measured-need only)

**File:** `packages/shared/components/PinnedTask/PinnedActions.tsx`

```tsx
<PinnedActions status={<>Heildar-ΔH: {sum}</>}>
  {/* the game's OWN existing buttons */}
</PinnedActions>
```

- On a portrait phone (the `pin:` query) it is `position: sticky; bottom: 0` **inside the task card**,
  so it stays in DOM order and is bounded by the card.
- Styling: white/95 background, top shadow, `env(safe-area-inset-bottom)` padding.
  **Critic:** every game's viewport meta is `width=device-width, initial-scale=1.0` with no
  `viewport-fit=cover`, and P12 keeps it, so `env(safe-area-inset-bottom)` resolves to **0** —
  harmless, but it does nothing; do not count on it for the iPhone home indicator. In iOS Safari
  15+ with the bottom address bar, a `bottom:0` sticky bar sits directly above the toolbar and moves
  as the toolbar collapses; check it on a real iPhone (already in §7 risks).
- It publishes `--pin-bar-h`, and `html { scroll-padding-bottom: var(--pin-bar-h, 0px) }` applies
  under `pin:` (WCAG 2.4.11). It carries `data-pinned-bottom` so `usableArea()` subtracts it.
- It reuses the game's own buttons, never a copy.
- **Height budget:** a `ResizeObserver` measures the pinned strip + bar. When they exceed **28 % of
  `visualViewport.height`** (Critic: was `innerHeight`, which does not shrink for the keyboard or
  pinch-zoom on iOS/modern Android) (large text, a short screen), both unpin into flow. Also
  listen to `visualViewport` `resize`, not only the ResizeObserver. At 200 % text the dock covered
  83 % of the screen; this rule forbids that.

**Allowed only when all of these hold:**

1. After compaction plus P2 anchoring, the primary action is still **more than one screen** from its
   question, as measured on the HEAD build with touch.
2. The screen has **no text input.** The soft keyboard covers sticky bottoms, and the iOS decimal
   pad has no return key. **Critic:** the `pin:` media query cannot enforce this — the keyboard
   does not change the layout viewport, so `(min-height: 501px)` stays true with the keyboard open.
   Enforce it in code: `PinnedActions` checks in a layout effect that its task card contains no
   `input:not([type=range],[type=checkbox],[type=radio]), textarea, [contenteditable]`, and in dev/
   test throws (in production, renders unpinned). A jsdom test covers it.
3. The feedback is short; never pin a Næsta that would sit over unread teaching feedback.

Named uses in §4: hess L2 (to carry the running ΔH), lewis L2 small molecules, lausnir L2 (if
still over after compaction), kinetics L2/L3, rafeindabygging L1/L3, organic L2 name mode,
jafna-jofnur at `max-height:600px`, utfellingarhvorf Æfa, ph L2 bench controls.

The primary button uses **kvenno-orange-700** (#f36b22 on white fails AA at 3:1).

### P9. `PhoneDisclosure` (true reference only)

**File:** `packages/shared/components/PhoneDisclosure.tsx`

```tsx
<PhoneDisclosure summary="<the block's existing heading text>">…</PhoneDisclosure>
```

- On a phone (`phone:`) it renders a `<button aria-expanded aria-controls>` of 44 px that starts
  closed. At sm+ and taller the button is `display:none` and the content always shows, so desktop
  is unchanged.
- Content stays mounted. No new strings: the summary reuses the block's own heading.
- **Only for reference tables and non-teaching panels:**
  - Uppflettitöflur (ph L3)
  - Blendnitafla/Skautun (vsepr L3)
  - Formhleðsluformúlan (lewis L3)
  - Gildisrafeindatafla (lewis L1)
  - the lotukerfid legend
  - Lögunartafla (vsepr L2)
  - equilibrium-shifter Aðgengisval
  - thermo's Formúlur
- **Never for explore widgets** (hess StatePathComparison, kinetics Gagnvirk hermun, redox balancer
  and cell, IMF Leysni, buffer capacity viz). Judge 3 ruled that the Explore phase must not become
  one tap away. These stay in flow after the loop; they cost the loop nothing.
- **Never for deliberate scaffolds:** the takmarkandi 'Aðferð' card and the L3 molar-mass table, the
  lausnir FormulaCard, the molmassi 'Einingagreining' block, the lotukerfid L2 locator.

### P10. `StageFlow` hiding (grafted from steps, narrowly)

Not a new component. It is a rule plus a small helper, `stageClass(active: boolean)`, which returns
`phone:hidden` for inactive stages. For a problem that **already stores its stage in state**:

- inactive and future stages are hidden on phones, not greyed;
- completed stages collapse to a one-line read-only summary; **Critic: the summary collapses the
  stage's inputs and givens only — never its feedback, 'Af hverju?' text or misconception.** If a
  completed stage showed teaching feedback, that feedback stays rendered (or the summary is a
  `PhoneDisclosure` that opens to the full stage). Collapsing it would hide content the student
  must read, which §3 Feedback forbids;
- on a stage change, `revealTop` plus `focusTarget` go to the new stage's first input or heading.

Cases: ph-titration L2 phases (the ~500 px disabled indicator list), the gas-law law step (the
~1 480 px disabled solve section), jafnvaegisfasti Beita and Tengd jafnvægi (givens become
summaries), buffer L2/L3, utfellingarhvorf Beita, syrufastinn Æfa. No new stages are invented.

### P11. `AnimatedMolecule fit`

Prop `fit`, phone only: the viewBox becomes the atoms' bounding box plus padding. This recovers
80–150 px on vsepr, IMF, lewis and organic. Desktop keeps the square. It is **not** a fix for
organic's overlap/branch defect (§7).

### P12. Viewport and keyboard

- **No change to viewport meta.** The dock's `interactive-widget=resizes-content` edit across 26
  files is rejected: it reflows every game when the keyboard opens.
- Typed screens stay in flow: the input and its action on one row (`min-w-0` on the input,
  measured necessary at 360 px), Enter submits, `enterKeyHint` is `done` or `next`, and the data
  being typed from sits within ≈250 px above the field.

---

## 3. Rules by screen archetype

| Archetype                                                                                                                      | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Screen swap** (menu↔level, intro→play, mode/phase, return to menu)                                                           | `useScreenTop`. The top of the new screen with its heading focused; on return, the next unfinished card, focused. First thing to ship, in every game.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Item swap** (Næsta)                                                                                                          | `useItemTop` to `[data-item-start]`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Level/phase chrome**                                                                                                         | P4 fold to at most 70 px; repeated subtitles `phone:sr-only`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Menu / chooser**                                                                                                             | Every level/phase choice visible at 360×640 on first load: tiles p-3/p-4, titles on one line (emoji inline, text-lg), restating tag chips `phone:hidden`, a non-teaching explainer after the list via `phone:order`. A **teaching** blurb that precedes the chooser stays first and costs one scroll. The reading below the chooser is fine.                                                                                                                                                                                                                                                                                  |
| **Reading / teaching / worked example / Skilja**                                                                               | A deliberate scroll. Compact only padding and decorative emoji. No split to fit. Existing pagers keep their Næsta at the foot of their content; if it is more than a screen away, `revealSpan` it together with the newly opened rung. A pinned bar is not used.                                                                                                                                                                                                                                                                                                                                                              |
| **Multiple choice with a stimulus**                                                                                            | Target: stimulus + question + options + Athuga within one usable screen after at most one reading scroll. Options p-3; short-token options (−1/0/+1, single short formulas) in a segmented row or 2×2, **conditional on length**, and no formula ever breaks mid-token. Hide on phones only an exact duplicate of FeedbackPanel text (the chosen option's inline explanation, **verified identical string**); keep the correct option's explanation after a wrong answer. After commit: `revealSpan(Næsta, [question, own choice, verdict])` then P3 focus. **Do not split stimulus from question** (steps default rejected). |
| **Typed answer**                                                                                                               | P12. Input + action on one row, Enter submits, no pin. After commit: `revealSpan(Næsta, [input row, verdict])`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Build / manipulate-and-check**                                                                                               | The live response goes directly below the control that drives it; the control → response span fits one screen. Nothing is inserted between a control and the finger that is using it: reserve height or place the insert after. Duplicate renderings of the built object are hidden on phones (DA 'Stuðlar notaðir' in drag mode until feedback). **If the student compares a running result with a target, use P7 + P8 (pinned target + status + actions).** Tray below target: 2–3 columns.                                                                                                                                 |
| **Explore / sandbox**                                                                                                          | Control and readout in one view. On first interaction, `revealSpan(result, [picker])` so the whole loop stays in view. If several widgets share one picker (vsepr L1), use phone-only **tabs** (tablist/tab/tabpanel, arrow keys), removing nothing.                                                                                                                                                                                                                                                                                                                                                                          |
| **Multi-stage problem**                                                                                                        | P10.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Collapsed two-column lab** (thermo, gas-law, buffer L1, ph L2)                                                               | **Play-order flattening** below the breakpoint. Column wrappers become `max-md:contents`/`max-lg:contents` (role-less only), ordered prompt → control → its response → answer → reference. CSS `order` only on non-focusable blocks (role=img canvases, readouts); anything with buttons moves in the DOM (with lifted state) or stays put.                                                                                                                                                                                                                                                                                   |
| **Feedback**                                                                                                                   | 'Af hverju?' expanded, misconception visible. `revealSpan`: verdict through Næsta when it fits, otherwise the verdict at top and the student reads down. Long teaching feedback is legitimate reading; **no pinned Næsta over it.**                                                                                                                                                                                                                                                                                                                                                                                           |
| **Reference while answering**                                                                                                  | P9 disclosure next to the question on phones, unchanged from sm up. Scaffolds stay visible.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Timed modes** (Keppnishamur)                                                                                                 | Compaction + flattening only; no pin, no paging. Keep one announced timer; add an `aria-hidden` copy beside the answer on phones when the header scrolls away (the gas-law pattern).                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Landscape 740×340**                                                                                                          | `phone-land:grid phone-land:grid-cols-2`, stimulus/reference left and task right. Wrap the two groups in plain block divs so desktop margins are unchanged. Sub-components with viewport breakpoints inside a column move to container queries (as EnergyDiagram needed). **No pins in landscape.**                                                                                                                                                                                                                                                                                                                           |
| **Modal**                                                                                                                      | Chart → slider → readouts first, pickers after; full-bleed `max-h-[100dvh]` on phones; ✕ at the top, 44 px.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Level/phase complete, summary** (Critic: archetype was missing)                                                              | `useScreenTop` to the summary heading; the next action (next level / Til baka) reachable with at most one scroll; any teaching recap on it follows the Feedback rule (read in full, no pin).                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Hint opened / all hints open** (Critic: missing; the sweep records such screens, e.g. eq-shifter 4, buffer 5, syrufastinn 4) | Opening a hint must not push Athuga off the usable area without a `revealSpan(action,[hint])`; the hint itself is never collapsed to save space.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

**Accessibility invariants (all archetypes)**

- CSS `order` moves only non-focusable blocks.
- `display:contents` only on role-less wrappers.
- Visually removed headings/subtitles use `phone:sr-only`, never `display:none`.
- No duplicated controls; phone-only additions are JS-gated so jsdom and desktop never see them.
- Every moved feedback keeps `role=status/alert`.
- Pinned regions publish their height for scroll-padding.
- Reduced motion means instant scroll.

---

## 4. Per-game implementation plan

Expected results are at 360×640 with touch, in manual scrolls per attempt. Prototyped figures are
marked **(measured)**; the rest are analyst estimates from CSS injection on :4175 and must be
re-measured from HEAD.

### Phase 0: shared primitives (one commit series, no game behaviour change yet)

1. P1 variants + `PHONE_QUERY` + the agreement test.
2. P2 `reveal.ts`, with unit tests for `revealSpan` (fit, no-fit → verdict, header/pin subtraction,
   reduced motion, desktop no-op), `useScreenTop`, `useItemTop`, `focusTarget`. Keep shared utils at
   ≥80 % coverage.
3. P3 `useArmedAfter` + tests.
4. P5 FeedbackPanel density + tests (non-interactive chips → text on phone; interactive unchanged;
   'Af hverju?' expanded; misconception rendered).
5. P6 `DragDropBuilder compact` + tests.
6. P7/P8 `TaskStrip`/`PinnedActions` + the `pin:` variant + the 28 % budget test.
7. P9 `PhoneDisclosure`, P11 `AnimatedMolecule fit`, `PhaseHeader` (P4).
8. Desktop proof: the shared components' own stories/tests render unchanged at 1280×800.

### Phase 1: pilots (prove the primitives)

**2-ar/hess-law (pilot A: MC + build + typed).** The compact prototype, with these corrections:

- `App.tsx`: `useScreenTop(activeLevel)`; on return, focus the next level card. `Level3.tsx`:
  `useScreenTop(showIntro)`.
- **Stig 1** (`Level1.tsx`):
  - P4 header fold; EnergyDiagram `phone:h-44`, with its labels on container queries.
  - Equation box and options p-3; Snúa við and ×1/2/3 on one row.
  - Hide the chosen option's inline explanation on phones only if it is the identical FeedbackPanel
    string; keep the correct option's.
  - `useItemTop` focuses the challenge pill (`data-item-start`).
  - `revealSpan(Næsta,[question, options, feedback])` + P3.
  - `phone-land:` diagram and equation | question and options.
  - StatePathComparison stays in flow after the card.
- **Stig 2** (`Level2.tsx`), resolving a conflict:
  - compact moved the energy-path diagram after the actions; judge 3 objected.
  - **Resolution:** the diagram stays in place. The target equation becomes a **TaskStrip** and the
    action row a **PinnedActions** with `status` = Heildar-ΔH (values only).
  - Byrja aftur | Athuga lausn on one row; the result box revealed; focus handled by P3.
  - Cards `sm:grid-cols-2` in landscape (desktop already has 2).
- **Stig 3:** compact header; ΔH°f table as one-line rows; the input, ±, unit and Athuga on one row
  (`min-w-0`) with Enter; `revealSpan(Næsta,[answer row, verdict])`.
- **Expected:**
  - Stig 1: 5–8 → 2–3 scrolls **(measured)**; the working set from diagram to Athuga is 572 px and
    fits; feedback 0 manual scrolls.
  - Stig 2: 4–5 → 0–1, with the target and running ΔH always on screen together (the dock measured
    1/169; compact 1/142).
  - Stig 3: 4 → 1 **(measured)**.
  - Landscape: C1 5→3, C2 7→4, L2 4→2 **(measured)**.

**1-ar/dimensional-analysis (pilot B: drag builder + typed + chrome).**

- `App.tsx`: subtitle `phone:sr-only`; `useScreenTop`.
- **Stig 2** (`Level2.tsx`, UnitCancellationVisualizer):
  - One-row header; the start card as one row, `Byrja með: [500 mg] → [g]`; hint and mode toggle on
    one row.
  - `DragDropBuilder compact`.
  - 'Stuðlar notaðir' `phone:hidden` in drag mode until feedback (Siggi; §7).
  - Compact visualizer, with the Teljari/Nefnari badges inside the zones.
  - The 1-second 'Strika út' button `phone:hidden` (the auto-animation does the same; Siggi, §7).
  - Keep the HEAD order: the pool, then the chain, then the visualizer directly under it.
  - Input and Athuga on one row with Enter.
  - `useItemTop` to the problem context; `revealSpan(Næsta,[feedback])` + P3.
  - `phone-land:` factors | visualizer.
  - **Default mode stays drag.** Switching touch users to click mode is not in this PR (§7).
- **Stig 0:** pills on one row (`phone:flex-nowrap overflow-x-auto`, with the current pill kept
  visible); h2 text-lg; number box `py-4 sm:py-6`; Enter + `enterKeyHint` on the Námundaðu fields.
- **Stig 1:**
  - C1: always render the '↑ Þú þarft meira' line with a reserved `min-h-5`; the duplicate question
    `phone:sr-only`; value and hint on one row.
  - C2: the same_unit/wrong_ratio panels after the tray on phones (DOM move gated by the phone
    breakpoint, or `phone:order-last`; the panel is non-focusable and keeps role=status); fraction box
    `p-4 sm:p-8`.
  - C3/C5/C6: factor cards `phone:grid-cols-2`.
  - One-row level bar.
- **Stig 3:**
  - text-xs badges on one row; prompt text-lg; Gefnar upplýsingar `grid-cols-2`.
  - Textarea `h-20 sm:h-28`, with the tip kept.
  - Hint button and Senda inn side by side, in flow. Enter in the answer field moves focus to the
    explanation (`enterKeyHint=next`).
  - `revealSpan` on the feedback.
- **Menu:** tiles p-4, gap-3, 'Veldu stig' mb-3.
- **Critic:** 'Stuðlar notaðir' hiding and 'Strika út' hiding above are **§7 decisions 2a/2b, not
  yet taken**. Implement both behind the decision: the pilot ships without them, and the "7 → 4"
  expectation below must be re-stated for the no-hide case (the measured prototype included the
  hides).
- **Expected:**
  - Stig 2: 7 → 4 counted (≈2 deliberate) scrolls, with pool→Lokaeining 453 px and fitting
    **(measured)**; feedback 0 manual.
  - Stig 0: 0. Stig 1 C1/C2: 3–4 → 0–1 with no shift under the finger. Stig 3: 3–4 → ≈2.
  - Menu: all 4 tiles.
- **Tests:** rewrite `phone-scroll.test.tsx` against the shared helper, in the same commit.

**Pilot exit criteria:** every §6 assertion green for both games at all four viewports; desktop
byte-identical; VO/TalkBack check of P3 done; Siggi has seen both on a phone.

### Phase 2: anchoring-first games (largest win per line of code)

**2-ar/intermolecular-forces**

- `useScreenTop` on phase; `useItemTop` on every currentMolecule/currentProblem/currentChallenge.
  Do not fight `SolubilityPrediction`'s own scrollIntoView or ForceStrengthAnimation's arrow-key
  focus.
- L1 molecule card 528 → ≈270 px: formula text-2xl with the name and 2D/3D toggle inline, `fit`,
  δ legend on one line, badges on one row.
- P4 chrome; options py-3; `revealSpan` + P3; FeedbackPanel density.
- L2 slots p-2 with the arrow merged in.
- The Leysni tool stays in flow under the card; no tabs (Explore rule).
- L3 badge inline.
- `phone-land:` molecule | question.
- **Expected:** quiz from opening with the prompt above the viewport → prompt, options and 1 scroll
  to Athuga; feedback 0; L2 1 → 0–1; L3 2 → 1 reading scroll.

**2-ar/organic-nomenclature**

- `useScreenTop` on activeLevel and on `setMode`, both ways.
- P4 chrome (score pill text-sm, h1 text-xl, subtitle text-sm).
- **L2 name mode:** `fit`/crop on the molecule, `zonesClassName="max-sm:flex-row"`,
  `DragDropBuilder compact`, one-chip parts, and 'Vísbending | Athuga' nowrap in **PinnedActions**
  (a choice screen).
- Drag feedback buttons px-2 nowrap.
- **Text mode:** no pin; verdict box p-4 with ✗ inline.
- **Build mode:** Endurstilla on the stepper row; name card p-3.
- L1 steppers: mb-4/mt-4, nav nowrap.
- **Expected:** L2 name 5–6 → 1 (analyst prototype, measured); text mode 4 → 1 (measured); build
  2 → 0; L1/L3 already 0.

**2-ar/kinetics**

- `useScreenTop` (activeLevel, showIntro); `useItemTop`.
- L1: margins, options p-3; hide the duplicate inline explanation (identical string); `revealSpan`
  to Næsta over the FeedbackPanel and Hugtak.
- L2: compaction plus PinnedActions for Athuga/Næsta (table + selectors + action cannot fit
  otherwise).
- L3: inline step labels (flex-wrap), conditional 2×2 short options, PinnedActions.
- Simulations stay in flow after the loop.
- **Expected:** L1 2 → 0 (loop at 560–616, analyst CSS); L2 3 → 0–1; L3 3 → 1.

**2-ar/redox-reactions**

- `useScreenTop` (all intros; learn→practice).
- Rule carousel: 📖 `phone:hidden`, h1 text-xl, mb-4.
- L1 feedback buttons nowrap plus `revealSpan`.
- L2: h1 text-xl, question box p-3, verdict ✓ inline, `revealSpan(Næsta)`. **Do not pre-reserve the
  80 px OXAST/AFOXAST growth; it is the answer-leak fix.**
- L3 untouched apart from P3 focus.
- Balancer and cell stay in flow.
- **Expected:** carousel Næsta on screen for all 6 rules; L1 0; L2 ≈2 → 0–1 across 32 questions;
  L3 0.

**3-ar/syrufastinn**

- App `useScreenTop(screen, {target: next phase card})`. Today the menu returns at 997.
- `revealSpan` over the whole FeedbackPanel + button block (it currently fires only when the verdict
  itself is off-screen).
- Kanna: anchor the concentration buttons after the first measurement; reveal the question when it
  appears; buttons `grid-cols-4`.
- PhaseHeader ('Til baka' into the h2 row); main `py-4 sm:py-8`; Skilja pills on one row with
  aria-labels and aria-current.
- **Expected:** menu return lands on the next phase; Æfa 0; Beita 1 → 0; Beita 2's long explanation
  stays a reading scroll on purpose; Kanna ≈3 → 0.

### Phase 3: compaction + anchoring games

**1-ar/lotukerfid**

- `PeriodicTable.tsx`, phone only, at the existing 47.99rem query:
  - trailing empty period-7 row becomes a **12 px placeholder** (the table still reads as 7 rows;
    §7);
  - cells `min-h-[46px] md:min-h-[56px]`;
  - swipe hint only until the first horizontal scroll;
  - legend in PhoneDisclosure.
- L2 only: `max-md:order-*` puts the masked table between the question and the options (it is
  non-interactive there). **Never reorder L1/L3**, whose tables are interactive with roving tabindex.
- Menu: tag chips `phone:hidden`, tiles p-4.
- `phoneScroll.ts` → shared.
- **Expected:** L1/L3 0 with every period on screen; L2 two opposite ≈400 px scrolls → one downward
  250–320 px; menu 3 levels.

**1-ar/nafnakerfid**

- Warm-up: emoji hidden, h1 text-xl, symbol card p-3 text-5xl, options `grid-cols-2`.
- Quiz: `revealSpan(Næsta,[options, verdict])`.
- L2 Skref 1: one-row header, subtitle sr-only, type cards `grid-cols-2 p-3`.
- L3: counters inline; the disabled tray `phone:hidden` once answered ('Reyna aftur' restores it and
  focuses the build zone); `revealSpan` the action row.
- L2 Skref 3: the hint after the buttons; `onKeyPress` → `onKeyDown`.
- **Expected:** warm-up 1–2 → 0; quiz 1 → 0 manual on each of 10; L2 0; L3 1 → 0 (SE one short
  scroll).

**1-ar/molmassi** (coordinate with the uncommitted Stig 2 `defaultExpanded:false`, a legitimate
exception because 'Útreikningur' prints the identical text).

- Level header folded; 'Aðferð' and compound card tightened.
- Stig 1 feedback: `revealSpan(Næsta,[verdict])`, with no pin; the span measured 607 px of 624 usable
  (these levels have no shared Header).
- Stig 2: `revealSpan(Næsta,[question])`.
- P3 focus wherever Athuga or Svara unmounts.
- Menu compaction.
- `phone-land:` reference beside the question.
- **Expected:** Stig 1 feedback 1–2 → 0; Stig 2 2 → 0 at 640/664/548; Stig 3 0; menu 3 cards.

**1-ar/reynsluformulur**

- PhaseHeader + four-phase menu recipe.
- Kanna: `revealSpan(note,[chip group])` (538 px span).
- Skilja: compaction only.
- **Æfa untouched** (the model per-column split).
- Beita compaction + P3.
- `phone-land:` two columns for Kanna, Skilja, Æfa.
- **Expected:** menu from 1–1.5 phases to all 4 (194–544 px, analyst CSS); Kanna 0 after the first
  look; Skilja 1 → 0; Æfa/Beita 0.

**1-ar/utfellingarhvorf**

- Menu recipe.
- Kanna: pair grid `grid-cols-3 gap-1.5` with the two formulas stacked (14 px, min-h-11), beakers
  h-16 w-14, `revealSpan(outcome,[pair grid])`.
- Skilja: `revealSpan('Næsta skref',[newly opened rung])`.
- Æfa: the verdict pair inside the compound card, rules py-1.5 with their text verbatim, Athuga in
  **PinnedActions** (a choice screen; P8 met: 2 scrolls today).
- Beita: ± steppers `grid-cols-2`; each stage swap focuses its question.
- **Do not split Æfa's two questions.**
- **Expected:** menu all 4; Kanna 1 manual + 2 automatic → 0 manual after the first look; Skilja 1
  per rung → 0; Æfa 2 → 0–1 (1 only for rules 6–7); Beita 0.

**1-ar/jafna-jofnur**

- `Level.tsx`: one-row header card, 8 px gaps, AtomCounter rows py-1 with status text-sm (≥14 px),
  Vísbending | Athuga as one 2-column row, the revealed hint above the action row.
- For `max-height:600px` portrait, the action row becomes PinnedActions (SE).
- P3 focus to the feedback, then Næsta.
- Menu compaction.
- The AtomCounter must stay fully visible beside the steppers; the B12 banner stays.
- **Expected:** 19 of 20 equations 0 at 640/664 (Athuga 712 → 588/615); Li + H₂O 1; SE action pinned.

**1-ar/takmarkandi**

- One-row header in L1/2/3; a single equation box.
- L2 question card p-4; input and Athuga on one row with Enter.
- P3.
- `phone-land:` L3 data card | task.
- 'Aðferð' and the molar-mass table stay visible.
- **Expected:** L1 0; L2 1 → 0 (794 → 556); L3 0 (628 → 520).

**1-ar/lausnir**

- Menu: 'Hvernig virkar þetta?' after the list, cards p-3.
- Stig 0: class buttons `grid-cols-3`; title text-xl.
- Stig 1:
  - one-row header;
  - prediction options `grid-cols-3`;
  - `revealSpan` the prediction feedback + 'Áfram í verkefni', and the concept panel, then P3;
  - beaker `phone:` ≈140 px with a one-line label; indicator p-3.
- Stig 2: header row + compaction + `revealSpan(Næsta,[chosen option])` after submit. If Staðfesta
  is still more than one screen from the question after compaction (analyst: 286 px over), add
  PinnedActions [Vísbending | Staðfesta].
- Kanna modal: chart → slider → readouts, full-bleed.
- Stig 3: header row.
- **Expected:** menu Stig 0–2 visible; Stig 0 0; Stig 1 prediction 2–3 → 0 (1 on challenge 1);
  beaker + indicator + slider in one view (363 px); Stig 2 3–4 → 1; Stig 3 0.

**2-ar/lewis-structures**

- P4 chrome in all levels.
- L1: FeedbackPanel density, `revealSpan`, Gildisrafeindatafla as PhoneDisclosure.
- L2:
  - banner on one row; formula inline with the title; board `max-h-[42dvh]` via the existing
    `COMPACT_BOARD_QUERY`; counter merged into the lone-pair header; lone-pair rows tighter;
  - wrong-drawing feedback and hints under the board on phones (role=status);
  - **PinnedActions** [Hreinsa | Athuga] with status = electron count;
  - completion: 'Rétt!' merged into the heading, legend on one row, `fit`.
- Guided mode: tracker as one line, the inner progress bar dropped on phones, `useItemTop` per step.
- L3: FC values −1/0/+1 as a segmented row, CO structure cards `grid-cols-2`, molecule chip inline,
  `revealSpan`, Formhleðsluformúlan as a disclosure.
- **Not in this PR:** tap-atom-plus-one-stepper for BF₃/PCl₅/SF₆ (§7).
- **Moving HintSystem must not carry its 'Stig: x / y' line** (§7).
- **Expected:** L1 0, feedback 1 → 0; L2 small molecules 1–2 → 0; SF₆ 1 (the action stays reachable);
  L3 2 → 0–1.

**2-ar/rafeindabygging**

- L1: n badge `px-4 py-1 text-2xl` (it stays: it is the only place n appears in the mₛ question);
  h2 text-base; cards p-3; **PinnedActions** Athuga.
- L2: orbital boxes with ↑↓ side by side on phones (`flex-row sm:flex-col`); element box compact; no
  pin.
- L3: compaction + PinnedActions + the verdict reveal L1/L2 already have.
- **Expected:** L1 4 → 0 (5-option questions: 1 nudge); L2 Fe/Kr 150–230 px → ≈20; L3 2–3 → 0; SE L1
  4 → 2.

**3-ar/jafnvaegisfasti**

- Menu recipe; return to the next phase.
- Kanna: ✓ as a corner badge, preset buttons py-2, reaction box p-3; on the first tap
  `revealSpan(verdict,[preset grid])`; when all presets are seen, reveal the payoff card.
- Æfa tabs: the number-strip idiom SkiljaScreen already uses (172 → 72 px); counter into the h2 row.
- **Tengd jafnvægi:** a TaskStrip holding the target **and** the composed box (the composed box
  shown under the target via `phone:order`, non-focusable); `Athuga jöfnuna` in flow; stage 2 via
  P10 (givens become one-line summaries; focus the mantissa field).
- **Beita:** P10 stages with focus to the input on 'extent'; thead nowrap text-[13px], rows py-1.5,
  problem box p-3; `phone-land:` problem | stage.
- **Expected:** Æfa direction, option 3 → on screen (0); Kc→Kp 0; Tengd jafnvægi: target and
  composed go from never on screen together to always; Beita 1 → 0; Kanna 3–5 → 0.

**3-ar/leysnijafnvaegi**

- Kanna: `revealSpan(salt card,[chips])` on a chip tap; Ksp and s in a `grid-cols-2` dl; chips
  `grid-cols-4` (check there are no mid-word breaks at 68 px).
- Menu return to the next phase.
- Skilja: reveal and focus the newly opened step.
- P3 on Já/Nei (focus currently drops).
- `phone-land:` Æfa/Beita.
- **Expected:** Kanna chip 1 → 0; Æfa/Beita 0 (already); landscape 1 → 0.

### Phase 4: structural remedies

**1-ar/einingakedjan** (compaction is the wrong tool here).

- ChainBuilder in Æfa and Beita, and Kanna: a **TaskStrip** 'Keðjan þín' with the chain in one
  horizontal row (`flex-nowrap overflow-x-auto` plus an edge fade; the newest card scrolled in with
  `inline:'end'`), holding 'Þú ert núna með'. Pool `grid-cols-2` beneath it, pool cards with
  `scroll-margin-top`. PinnedActions [Vísbending | Byrja upp á nýtt | Leysa].
- `reveal.ts` usage switches to the shared helper, which subtracts the strip.
- The modes after the build (Spá → trace → Niðurstaða/Leiðrétting) follow P10; SolveTrace p-3;
  `revealSpan(options,[failed step])`.
- Kanna: 'Þrennt til að prófa' under the intro.
- Menu recipe.
- `phone-land:` chain | pool, with no sticky.
- **Expected:** a 3-card chain goes from 3 manual scrolls + 3 up-jumps to 1–2 small scrolls and no
  jumps; the correction screen shows the failed step and the fixes together.

**2-ar/vsepr-geometry**

- **L1 explore, below lg:** the 8-chip shape picker first (radiogroup), then **tabs**: Fráhrinding ·
  Lögunarbreyting · Tengihorn · Lýsing (tablist semantics, arrow keys; the selection announced via
  aria-live on the Lýsing heading). The existing section headings supply the tab labels; nothing is
  removed.
- Quiz: P4, `fit`, options p-3, `revealSpan`.
- L2: after a correct geometry, `revealTop` the **reveal** (not past it); phone order revealed
  molecule → step panel → 'Hvers vegna' animation (`order-*`, md restores); in the angle and
  explanation steps the 'Hvers vegna' animation goes into a PhoneDisclosure (already seen); one-row
  step chips; `phone-land:` flex-row.
- L3: badge inline, Blendnitafla/Skautun as a disclosure, `revealSpan`.
- Coordinate with the uncommitted vsepr edits. Do not wire the dead `hintMultiplier`.
- **Expected:** L1 goes from 1 402 px to the first shape → 0, one tab per screen; quiz 2 → 0–1; L2
  from the molecule 1 200 px away to on screen with its step; L3 2 → 0–1.

**3-ar/equilibrium-shifter**

- **Game card, reordered on phones:** a compact reaction header (equation text-xl, name + ΔH pill on
  one line) → stress list / prediction / explanation → molecule row, canvas, description. Use
  `phone:order` on non-focusable blocks only; fold '← Til baka' into the card; Aðgengisval becomes a
  PhoneDisclosure; mode cards compacted.
- On a stress tap, `revealTop` the card and focus 'Hvert mun jafnvægið hliðrast?'.
- On 'Prófa annað álag', `revealTop` the card and focus 'Veldu álag'.
- Menu return focuses Lærdómshamur.
- **Feedback, shipped in this PR:** compaction (QKComparison cards `grid-cols-2`) + `revealSpan` with
  the verdict first + P3. Næsta stays at the end, in flow. **Paging is a separate, reversible pilot
  PR if Siggi wants it** (§7): Svar (with the particle canvas) → Q vs K → Tölur → Rök, in DOM order,
  learning mode only, `max-md` only, no skip button.
- Keppnishamur untouched (its 6 s auto-advance is incompatible with paging; the mode is unreachable
  today anyway).
- **Expected:** stress choice from a 500 px scroll → 0; equation→predict 887 → ≈400 px, so the
  student sees the reaction and ΔH while predicting; feedback ≈3 screens → 1.5–2.3 screens of
  reading (paging would be 1 screen per pane at +3 taps).

**3-ar/thermodynamics-predictor**

- Below lg, **play-order flattening:** problem → slider card → graph → answer card → verdict → Lausn.
  Entropy viz, 'Fjórar atburðarásir' and Formúlur follow. Formúlur goes into a PhoneDisclosure; the
  entropy viz and the scenario guide stay in flow (explore).
- ΔH/ΔS 2-up; radios `grid-cols-3`; slim header.
- Verdict above Lausn at text-base, with only 'Rétt!/Rangt.' bold.
- Könnun: the ΔG result box before the slider label (`phone:order`), h2 text-xl.
- Keppnishamur: an aria-hidden timer copy beside 'Svarið þitt'.
- `phone-land:` the lg two-column layout.
- Retune `ANSWER_CARD_EXIT_MS` via `afterExit`.
- **Expected:** slider and graph together (slider 460, graph 827–1091); answer ≈1 scroll; Könnun thumb
  and result on one screen.

**3-ar/gas-law-challenge**

- Below md: column wrappers `max-md:contents`; order scenario → Gefnar → law chip → answer → hints/
  solution → simulator → Upprifjun (`order` on non-focusable blocks only; the law chip, answer, hints
  and solution keep DOM order).
- ~~Score/streak chips `phone:hidden`.~~ **Critic: removed.** Hiding score/streak on phones only
  makes the scoring UI differ by device, which is a scoring change under the fixed constraints and
  pre-empts the open CLAUDE.md item (points/streaks in practice modes). Compact the chips
  (`phone:text-xs phone:px-2`, one row with the level title) and raise their removal with Siggi
  in §7.
- Law step: law grid `grid-cols-2`; P10 hides the disabled solve section. After the auto-advance,
  `revealTop` the answer card **with no autofocus on touch**.
- FeedbackScreen: emoji inline; one comparison card; Árangur compacted, not hidden (Critic: same
  scoring-UI reason as above); Næsta stays at the end
  (the solution is teaching).
- Menu chooser: segmented level row (aria-pressed kept); keyboard legend `pointer-coarse:hidden`.
- `phone-land:` the md grid.
- **Expected:** Athuga 1 336 → ≈690 (2 → 1 scroll; matters most under the timer); law step 1.5
  screens → 1; landscape Athuga 1 134 → 344.

**3-ar/buffer-recipe-creator**

- L1:
  - flask card, phone order: pH readout + bar and ratio + markmið → ± buttons → Athuga → molecules
    (`order` on non-focusable readouts only; the buttons keep DOM order);
  - pH + markmið as a **TaskStrip** — values only; the live 'Fullkomið!' pill stays in flow
    (Critic, see P7);
  - h1 text-xl, subtitle `phone:sr-only`; the stat tiles (Stig / Kláruð / Samtals — a score, per
    `3-ar-buffer-recipe-creator--02.png`) folded into one `phone:text-sm` row rather than hidden
    (Critic: hiding a score on phones only is a scoring-UI change; see gas-law);
  - Lykilhugmynd after the flask card;
  - molecule dots 32 px, labels ≥12 px, no min-h.
- L2/L3:
  - compact header, data tiles `grid-cols-4`;
  - HintSystem moved under the step card on phones (a DOM move with **lifted tier state**, so
    rotation does not reset it);
  - context, FlaskComparison and reference after;
  - P10 for the stepper.
- Completion: Næsta before BufferCapacityVisualization (the viz stays in flow after it).
- **Do not carry HintSystem's 'Stig: x / y' line into any new place** (§7).
- **Expected:** L1: ± and pH go from 680 px apart to together; L2 Athuga 1 584 → ≈810 (1 scroll),
  with the given values and inputs on one screen; completion Næsta 1.5 screens → ≈500 px.

**3-ar/ph-titration**

- L1: P4 compaction (question 342 → 194); `revealSpan(Næsta,[options, feedback], {afterExit})` + P3;
  the 260 px graph floor kept.
- L2, via P10 on the existing `phase`:
  - disabled IndicatorSelector hidden until its phase;
  - hint button and phase bar moved to the top;
  - Burette compact variant with the readout chips on one row;
  - bench controls in PinnedActions while titrating;
  - on marking, `revealTop(curve, {afterExit: MARKING_EXIT_MS})`, with the instructions moved above
    the curve;
  - indicator list p-2 with the 'Valinn' line hidden, Staðfesta val in PinnedActions;
  - result `revealTop`.
- L3: one-row header; Gefið `grid-cols-2`; hint link on the label row; Uppflettitöflur as
  PhoneDisclosure.
- `phone-land:` apparatus | curve and question | options.
- **Expected:** L1 2+ → 1, feedback 0; L2 pouring with bench + controls + curve on one screen,
  marking with curve + slider together, result visible; L3 1 → 0 at 664 (about 20 px over at 640);
  landscape L1 still 1 (graph floor).

### Order of landing (commits within the one PR, or stacked PRs)

1. Phase 0.
2. Pilots: hess-law, then dimensional-analysis. **Stop for review.**
3. Phase 2 (IMF, organic, kinetics, redox, syrufastinn).
4. Phase 3 in list order.
5. Phase 4: einingakedjan, vsepr, equilibrium-shifter, thermo, gas-law, buffer, ph-titration.
6. Delete the per-game reveal copies once the last user has migrated. A grep test forbids new local
   copies (§6).

---

## 5. What stays a scroll, deliberately

| What                                                                                                                                                                                                                                                                                                                                                               | Why                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Teaching intros and worked examples (DA Reglurnar and L2/L3 intros, lotukerfid kennsla ×3, nafnakerfid rule pages, molmassi teach steps and Stig 2 page, jafna-jofnur Stig 1 kynning, takmarkandi kynning, lausnir Stig 0 kennsla, einingakedjan Skilja, hess/kinetics/redox intros, rafeindabygging Stig 2/3 teaching, IMF kynning, ph L1 intro, buffer L3 intro) | The length is the teaching; teach-before-test. Splitting only to fit trades reading for taps and breaks continuity. Only padding and decorative emoji are compacted, and the screen **opens at its heading**. |
| Reading below a chooser (Þú lærir, Lykilformúlur, Af hverju, Námsleiðin, reference grids)                                                                                                                                                                                                                                                                          | Reference, not the loop.                                                                                                                                                                                      |
| A teaching blurb **before** a chooser (hess, kinetics, redox, organic, gas-law, thermo, eq-shifter menus)                                                                                                                                                                                                                                                          | Teach-before-test: it is read first on purpose and costs one scroll.                                                                                                                                          |
| Long teaching feedback (eq-shifter explanation, syrufastinn Beita 2, gas-law FeedbackScreen solution, thermo Lausn, lausnir StepBySolution, molmassi hydrate breakdown, jafnvaegisfasti Skilja step 5, utfellingarhvorf Skilja ladder)                                                                                                                             | 'Af hverju?' stays expanded (CLAUDE.md), and the reading is the point. No pinned Næsta over it, which would invite skipping. Paging eq-shifter is Siggi's separate call.                                      |
| Optional explore widgets after a loop (hess StatePathComparison, kinetics simulations, redox balancer and cell, IMF Leysni and ForceStrength, buffer capacity viz)                                                                                                                                                                                                 | Explore phase; each widget's control→response span already fits once reached; they add nothing to the loop's scroll count. Not hidden behind drawers.                                                         |
| Opened hints                                                                                                                                                                                                                                                                                                                                                       | The student asked for them.                                                                                                                                                                                   |
| Opened reference (nafnakerfid Nafnareglur, the lotukerfid table's sideways scroll, molmassi PeriodicTable modal)                                                                                                                                                                                                                                                   | Deliberate reference; the table's sideways scroll and the pinned element column are intentional.                                                                                                              |
| SE 375×548 residuals (hess 1 extra scroll, DA +1, takmarkandi L2 32 px, jafna-jofnur 40–67 px)                                                                                                                                                                                                                                                                     | The SE is the stretch target. Pins are used only where P8's conditions hold.                                                                                                                                  |
| Landscape residuals (hess C2 4, DA 5, ph L1 1 due to the graph floor)                                                                                                                                                                                                                                                                                              | Two columns do most of the work; the remaining short scrolls are usable with the header static.                                                                                                               |
| Efficiency/reverse types in DA Stig 3, 5-option questions in rafeindabygging L1, SF₆ in lewis L2                                                                                                                                                                                                                                                                   | About one short extra scroll; fixing it needs a mechanic change (§7) or a layout that squeezes targets below 44 px.                                                                                           |

---

## 6. Regression guard

### 6.1 Extend `e2e/mobile-game-screens.ts`

Add an optional `loop` to `GameScreen`. Existing entries stay valid.

```ts
export interface LoopCheck {
  /** Accessible name / selector of the element that states the question or target. */
  prompt: Locator-spec;          // { role, name } | { css } | { text }
  /** The primary action before commit (Athuga/Svara/Staðfesta/Leysa…). */
  action: Locator-spec;
  /** Steps that answer (any answer; wrong preferred, it yields the longest feedback). */
  answer: ScreenStep[];
  /** The verdict element that appears after commit. */
  verdict: Locator-spec;
  /** The next action after commit (Næsta…). */
  next: Locator-spec;
  /** Elements that must be co-visible for the loop to be playable (e.g. target + running sum). */
  together?: Locator-spec[][];
  /** Viewports where the guarantees hold; default ['android','iphone']. SE/landscape opt in. */
  viewports?: ('android' | 'iphone' | 'se' | 'landscape')[];
  /** Critic: landscape always gets the weaker "usable" check (see §6.2.10), opt-in or not. */
  landscapeScrollsToAction?: number;   // default 3
  /** Allowed manual scrolls before the action is reachable; default 0. */
  scrollsToAction?: number;
  typed?: boolean;               // skips pinned assertions, adds keyboard ones
}
export interface GameScreen { name: string; steps: ScreenStep[]; loop?: LoopCheck; }
```

Locator specs use **visible labels and accessible names**, as the file requires today. The same
rule applies: a rename (terminology sweep included) updates the path in the same change. Add a
`loop` to at least one loop screen per level of every migrated game. The pilots add them for every
level.

### 6.2 New spec `e2e/mobile-vertical.spec.ts`

The existing viewports are 360×640, 390×664, 375×548 and 740×340, all with `hasTouch`, `isMobile`
and `reducedMotion: 'reduce'`. Seed `Math.random` via `addInitScript` so shuffles are stable.
Run on Chromium; Firefox runs one loop per game.

For each screen with a `loop`, after replaying `steps`, the spec asserts the following. "Visible"
means ≥90 % of the element's rect lies inside `usableArea()`, computed in the page with the same
function as `reveal.ts`, so it is header- and pin-aware.

1. **On arrival:** the screen heading or `[data-item-start]` is visible, and `document.activeElement`
   is not `body`. This catches the IMF/syrufastinn/organic landing bugs.
2. **Action reachable:** with at most `scrollsToAction` wheel/scroll moves (default 0), `action` is
   visible. For `pin:`-bound screens also assert `getComputedStyle(bar).position === 'sticky'` and
   that the bar is inside the viewport at `scrollY` 0.
3. **Together:** every group in `together` is simultaneously visible at some single scroll position.
   Check by aligning the group's top with the usable top; the group's span must be ≤ the usable
   height.
4. **After commit:**
   - replay `answer`, then activate `action` with a **raw `page.touchscreen.tap`** at its centre, not
     `locator.tap()`, which scrolls sticky elements and honours scroll-padding;
   - then, after the animation frame plus any `afterExit`: `verdict` is visible **and** `next` is
     visible (or reachable with one scroll when the screen's feedback is marked teaching-length);
   - focus is inside the feedback region, not on `next` and not on `body`;
   - FeedbackPanel's 'Af hverju?' toggle has `aria-expanded="true"` wherever the game does not
     deliberately pass `defaultExpanded:false`, and the misconception box is visible when present.
5. **Anti-skip** (Critic: rewritten — the old version started "from the committed state" and
   allowed "advanced by at most one", so a regression where focus lands on Næsta, or Athuga turns
   into Næsta in place, **still passed**: one Enter advances by exactly one). From the
   **pre-commit** state with focus on `action`, press `Enter` twice within 50 ms; in a second run
   do two raw `touchscreen.tap`s at `action`'s centre 150 ms apart. Assert the item index **did not
   advance** (0), `verdict` is visible, and it stays visible for ≥ 400 ms. Verify the test fails
   against the dock prototype's single Athuga→Næsta element before relying on it.
6. **Pinned never hides focus:** Tab through the screen, and for each focused element assert its
   rect does not intersect any `[data-pinned-top]`/`[data-pinned-bottom]` rect (WCAG 2.4.11).
7. **Pin budget:** with `document.documentElement.style.fontSize = '200%'`, pinned regions either
   total ≤ 28 % of `innerHeight` or are not sticky.
8. **Typed screens:** ~~at 360×352 (keyboard emulation), after focusing the input, no pinned
   element is sticky~~ **Critic: that emulation cannot catch the regression.** Resizing the
   Playwright viewport to 352 px changes the _layout_ viewport, which flips `pin:` off by itself;
   a real keyboard on iOS Safari and Chrome Android ≥108 shrinks only the _visual_ viewport, so
   `pin:` stays on and the test passes while the phone fails. Instead, at 360×640: assert **no
   `[data-pinned-bottom]` or `[data-pinned-top]` exists** on any screen with `typed: true` (the
   rule is "no pins on typed screens", so test the rule), and separately assert the input plus the
   first data element above it (`together`) fit within 352 px measured from the input's bottom
   upward. Enter commits.
9. **No sideways page scroll** (the existing mobile-games rule) is re-checked after every step above.
10. **Landscape stays usable** (Critic: added; landscape had no guard because `viewports` defaults
    exclude it). For every screen with a `loop`, at 740×340 regardless of `viewports`: `action`
    reachable within `landscapeScrollsToAction` (default 3) scrolls, `verdict` visible after
    commit, and no element is `position: sticky` except the shared Header's own rule (P8 says "no
    pins in landscape"). Plus the 844×390 smoke run from P1.
11. **Static guard (Critic):** every `PinnedActions`/`TaskStrip` usage is listed in an allow-list
    keyed by game and screen, matching §4's named uses; the list only shrinks or is extended in
    the same change as a measurement justifying the pin (P8 condition 1).

### 6.3 Desktop invariance: `e2e/desktop-unchanged.spec.ts` plus a script

- For each migrated game, run a seeded set of states at 1280×800 (menu, each level start, one
  answered state per level). Compare element geometry (all visible elements: rect, font size,
  colour) against a committed JSON baseline generated from the **pre-PR** build, using the
  `m/desk-cmp.mjs` method from `$VS/work/design-compact/`.
- Geometry equality is required. Full-page PNG equality is required where there is no live canvas;
  live canvases are masked.
- ~~The baseline is generated once from `main` before the PR and committed under
  `e2e/baselines/desktop/`.~~ **Critic:** (1) the base is the mobile-pass branch, not `main`, unless
  #65 has merged — a `main` baseline would fail on every mobile-pass change; (2) a committed
  PNG/geometry baseline breaks across machines (font hinting, Chromium build), so it either
  flakes in CI or gets regenerated on the PR branch, where it proves nothing. Build the **base
  commit and HEAD in the same job** (`git worktree` + `pnpm build:games`) and compare the two live
  builds; commit only the list of seeded states. (3) Geometry cannot see behaviour: add, per
  migrated game, a 1280×800 run of one loop asserting `scrollY` after commit equals what the base
  build does (catches the P2 gating regression) and the focused element's tag/role matches the
  P3 decision.

### 6.4 Unit and static guards (vitest)

- `packages/shared/utils/__tests__/reveal.test.ts`: `revealSpan` fit and fallback; header and pin
  subtraction; reduced motion; desktop no-op.
- `packages/shared/styles/__tests__/phone-variant.test.ts`: the compiled CSS contains **two**
  separate media blocks for `phone:`. This catches the comma-shorthand regression. `PHONE_QUERY`
  matches the CSS.
- `packages/shared/i18n/__tests__/no-local-reveal.test.ts` (grep): after Phase 4, no `apps/games/**`
  file defines `revealTop`, `revealBottom`, `revealIfBelowFold`, `useScrollTopOnChange`,
  `useRevealOnChange` or `scrollTopOnPhone`. It is allow-listed during migration, and the list must
  only shrink. **Critic: a name list cannot catch a new copy** — it already misses 13 of the names
  shipping today (`reveal`, `revealDelta`, `revealNearest`, `revealLastColumn`, `revealOnPhone`,
  `revealScrollLeft`, `revealTopIfAbove`, `scrollPageToTop`, `stickyHeaderBottom`,
  `useRevealTopOnChange`, `useRevealWhenShown`, `useReturnToPrompt`, `prefersSmoothScroll`), and the
  next copy will have a fourteenth. Guard the **calls** instead: no non-test file under
  `apps/games/**/src` calls `scrollIntoView(`, `scrollTo(`, `scrollBy(` or assigns `scrollTop`,
  except via `@shared/utils`; allow-list today's 39 files + 16 helpers, list only shrinks. Also
  forbid `window.innerHeight` in game code (must go through `usableArea()`).
- Components with a phone-only element (TaskStrip status, PinnedActions): a jsdom test asserts
  exactly one element per role/name (no twins), and no `pin:`-only content renders when
  `matchMedia` is absent.
- A FeedbackPanel test: on a phone, non-interactive chips render as text; 'Af hverju?' stays
  expanded; the misconception renders.

---

## 7. Risks and open questions for Siggi (real decisions only)

**Decisions**

1. **equilibrium-shifter feedback: scroll or page?** This PR ships compaction + a verdict-first reveal
   (1.5–2.3 screens of reading). Paging into Svar → Q vs K → Tölur → Rök fits one screen each at +3
   taps, but invites tapping through the Q vs K and Tölur panes. Pilot it in class as a separate
   reversible PR?
2. **dimensional-analysis Stig 2 on phones:**
   - (a) hide 'Stuðlar notaðir' in drag mode until feedback? The drop zone shows the same chain, but
     without the × notation.
   - (b) hide the 1-second 'Strika út' button? The auto-animation performs the same cancellation.
   - (c) make click mode the default on touch? It is **not** in this PR; drag stays the default.
3. **The lotukerfid empty period-7 row:** keep it as a 12 px placeholder (planned, so the table
   still reads as 7 rows, matching 'Lotukerfið hefur 7 lotur'), or drop it?
4. **The SE 375×548 target:** accept one extra scroll on hess/DA/takmarkandi (planned), or use the
   pinned bar there too to reach 0?
5. **lewis-structures L2, SF₆/PCl₅/BF₃:** accept one scroll (planned), or change the mechanic to
   tap-an-atom plus one stepper (keyboard-accessible, phone only)? That is an interaction change.
6. **rafeindabygging L2:** ↑↓ side by side on phones only (planned). Should desktop follow the same
   box notation?
7. **lausnir Stig 1's 2.5 s auto-advance** after a correct answer. It is a timer in a learning phase,
   and the concept panel is half off-screen on a phone. Replace it with a button? This is outside
   the layout scope unless Siggi approves.
8. **(Critic)** Score/streak/Árangur chips in gas-law and buffer's Stig/Kláruð/Samtals tiles: the
   design first hid them on phones only; now they are compacted. Remove them everywhere (the
   CLAUDE.md "points and streaks in practice modes" item), or keep them?
9. **(Critic)** P3's focus movement also runs at 1280×800: accept a focus ring on the feedback
   group, or suppress it on `tabIndex=-1` targets?

**Defects found in passing: report and fix in their own PRs, not this one**

- **Live hint penalties:** `2-ar/lewis-structures` L1 (`HintSystem onPointsChange`, 'Stig: 9 / 15')
  and L3 (15 against 8); `3-ar/buffer-recipe-creator` tier multiplier in all three levels
  (`Level1.tsx:159`, `Level2.tsx:185`, `Level3.tsx:186`). These contradict CLAUDE.md. **No relocated
  hint UI may carry the 'Stig: x / y' line.**
- **thermodynamics-predictor** shows the live ΔG° and the spontaneity verdict before the student
  answers.
- **organic-nomenclature AnimatedMolecule** overlaps atoms from 4 carbons up and draws branched
  molecules as straight chains (on desktop too). `fit` does not fix this; the durable fix changes
  desktop.
- **equilibrium-shifter** Keppnishamur gate: already recorded in CLAUDE.md.
- **lausnir** 'Athuga lausn' gives no feedback when the concentration is outside the tolerance.
- **(Critic) buffer-recipe-creator Stig 1** shows a live 'Fullkomið!' pill on the pH readout that
  can sit beside a 'Rangt' verdict (`vsweep/3-ar/shots/3-ar-buffer-recipe-creator--02.png`): a verdict
  before, and contradicting, the check.
- **(Critic) equilibrium-shifter** shows 'Stig: 0' in Lærdómshamur (sweep screen 2), a score in a
  learning mode.

**Engineering risks (the implementers own these)**

- **Double announcement** when focus moves into a `role=alert` region. Verify with VoiceOver and
  TalkBack in the pilots before Phase 2 (P3.4).
- **Sticky is fragile.** Any `overflow` ancestor or an extra wrapper un-sticks the element or bounds
  its range; §6.2.2 asserts `position: sticky` and in-viewport.
- **Real-device keyboard behaviour is untested.** Pins are never used on typed screens, and pinned
  choice screens must be checked on one real iPhone and one Android phone.
- **Presence timing.** Migrate ph-titration and thermo last among their year, keep their exit
  constants via `afterExit`, and re-measure.
- **CSS order vs DOM order.** It only ever moves non-focusable blocks. Any block containing a button
  is moved in the DOM with lifted state (buffer HintSystem), or left where it is.
- **Test churn.** Replacing 15 helpers breaks tests that mock them. Rewrite each in the same commit.
  e2e paths that click moved controls are updated in the same change (the file's own rule).
- **New Icelandic strings.** None are planned: tab labels, disclosure summaries and statuses reuse
  existing headings and words ('Lokaeining', 'Heildar-ΔH', 'Keðjan þín'). Any new aria-label is
  ordinary Icelandic, never a chemistry coinage, and is flagged in the PR description.
