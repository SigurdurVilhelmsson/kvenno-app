# Auditing and developing a year's games

The process used on the Year-3 games in November 2026, written down so it can be run again on
another year or on the same year later (Siggi, 2026-11-15). It has four stages: audit each game,
propose animations where they teach, find the curriculum's gaps, then write a plan and work it.

Worked examples to read first:

- `/mnt/project-files/ph-titrun/review-2026-11-14.md` — the single-game audit the others copied.
- `/mnt/project-files/3-ar-throun/throunaraaetlun-2026-11-14.md` — the Year-3 plan built from seven
  such audits.
- PRs #147–#157 — the plan worked in order, one PR per item.

## 0. Before starting

- Read `CLAUDE.md`, `docs/README.md` and each game's README. The READMEs' `## Open` sections and
  `docs/REVIEW-QUEUE.md` already list known defects and rulings; don't report those again as new.
- Clone the textbook:
  `git clone https://github.com/SigurdurVilhelmsson/namsbokasafn-efni.git`, and use only
  `books/efnafraedi-2e/02-mt-output/`. Module text is in `chXX/<module>-segments.is.md`, and
  equations are in `02-structure/chXX/<module>-equations.json`.
- Check project memory for rulings that are newer than the docs. Terminology rulings live in
  `chemistry-terminology-rulings.md`, for example meðjón and H⁺.
- Change no code during the audit. Run the existing tests once, so the report can say they pass.

## 1. Audit each game

Read everything in the game: the menu, every level, the data, the engine, the components and the
tests. Check numbers by running the game's own functions in a throwaway vitest file, not by eye.
Write one report per game (or one section per game in the year's plan). Rank its items from most
to least serious, and give each one what is wrong, `file:line`, and what you checked.

What to check, in the order of the titration review:

**A. Chemistry.**

- Every constant and fact should agree with the Icelandic textbook. Where the book has no row, use
  Brown's Appendix D, whose ruling is that a constant with no row there does not ship. Where the
  book and Brown disagree, say which values flip a verdict.
- Look for numbers that are stored where they should be derived. A stored answer beside its
  inputs can disagree with them. Derive the answer and test that the stored copy, if any, equals
  it. Many past defects were this kind: B4, buffer L2, `reynsluformulur` and the I₂ ΔH.
- Check significant figures through each problem → givens → answer chain.
- Check tolerances. The answer must reject 0, double, half and NaN, and relative and absolute
  tolerances should not be mixed up.
- Check that each scenario's physics matches its text.

**B. Pedagogy.**

- The game should teach before it tests (Explore → Understand → Practice → Apply).
- Look for giveaways: the answer drawn beside the question, the correct option always first, a
  hint that names the answer, a scaffold that prints the result. Check the inverse too: removing a
  leak can remove the student's only route to the answer.
- Look for gaps in what the level claims to cover, measured against the book's chapter for it.
- Check that pictures are physically correct (the titration burette was drawn upside down).
- No running score, no timer, no streak and no hint penalty outside Keppnishamur. Results end as
  `N af M rétt`.

**C. Icelandic.**

- Terms should follow `packages/shared/i18n/ordabok.md`, then the textbook corpus, then a ruling.
  Count corpus hits with `grep -roi "<stem>[a-uáéíóúýþæö]*" --include=*.md . | wc -l` and give
  the counts.
- Check grammar around any swapped term (gender and case move with it).
- Numbers print with a decimal comma through `formatDecimal` or `formatScientific`, never
  `toFixed`.
- Look for English left in student text, and for one game calling one thing by two names.

**D. UX, accessibility and code.**

- `aria-pressed` on selection buttons, `aria-valuetext` on sliders, and focus that moves to the
  verdict after a commit.
- The play loop should fit a 360 px phone (the rules in `CLAUDE.md` under "Phones").
- Look for duplicated helpers that belong in `packages/shared`.

Priority key for every item:

- **P0**: a wrong answer, wrong chemistry or a broken step that a student meets now.
- **P1**: misleading teaching, a giveaway, or a broken ruling.
- **P2**: gaps, polish and animation.

## 2. Propose animations, only where they teach

Animations follow `docs/particle-view-template.md`, whose model is the Nærmynd screen in pH
Títrun. Propose one only where seeing the particles answers a question the game asks, and say
which misconception it removes. Skip the proposal where the topic is already visual or the
picture would only decorate it. For each proposal give:

- The scenes as data: what is held fixed, what the student moves, and what changes.
- Where every number comes from. It must be the game's own function, never a second calculation.
- The scale, stated on screen, and any exaggeration, marked and said in the scene.
- Nothing graded.

If a second game needs the particle system, move it to `packages/shared` first instead of copying
it. Year 3 did this in #151.

## 3. Find the knowledge gaps

For each game, list the topics in its textbook chapter that no game on the platform teaches.
Count corpus hits to show weight (e.g. "Daltons 31, hlutþrýsting 73"). Then grep the platform
for the topic's terms to show that it really is absent. Sort each gap into one of two kinds:

- **Small:** fits as a new problem type or step in an existing level.
- **Scoping:** needs a new screen or game. This needs Siggi's decision on whether to build it and
  where, so it goes on the plan's decision list.

The no-Level-4 ruling (2026-08-29) applies: new material becomes Apply-phase content or a menu
screen of its own, never a fourth level. A menu screen follows Skilja → Kanna → Æfa, as
`thermodynamics-predictor`'s `GibbsKScreen` and `gas-law-challenge`'s `BlondurScreen` do.

## 4. Write the plan

One file for the year, in `/mnt/project-files/<year>-throun/`, laid out like the Year-3 plan:

1. **Suggested order of work**, in phases:
   - Phase 0: correctness fixes, one small PR per game, with no design questions.
   - Phase 1: shared infrastructure that later items need.
   - Phases 2–3: animations, most teaching value first.
   - Phase 4: content gaps that need scoping.
2. **One section per game:** Fixes (with priorities), Graphics, Animation proposal, Content gaps.
3. **Across the games:** patterns that recur in several games.
4. **Decisions for Siggi:** numbered, each with a recommendation.

Post the plan, and put the decisions on decision cards as the work reaches them, not all at once.

## 5. Work the plan

Siggi's standing instruction for Year 3: work the plan in order, and merge each PR once its tests
pass.

- **One PR per item:** a draft first, then subscribe to its activity. Mark it ready and
  squash-merge when CI is green.
- **Each PR carries:**
  - tests that fail without the change;
  - phone paths and a `loop` in `e2e/mobile-game-screens.ts` for any new screen;
  - the game's README (`## Open` or a dated section);
  - `docs/REVIEW-QUEUE.md` for anything that waits on a ruling. All Icelandic wording drafted by
    Claude is marked as such there.
- **Rulings:** record them where `CLAUDE.md` says, and in project memory the turn you get them.
- **Leftovers:** list what a phase leaves undone in `docs/REVIEW-QUEUE.md` (Year 3: C24 and C25).
  Don't hold a PR for them.

Fast checks before each push:

- vitest on the game and on `packages/shared` (the platform guards);
- `tsc --noEmit -p` for the game;
- eslint;
- prettier on the changed files;
- for a new screen, the game's e2e: `node scripts/build-games.mjs --game=<folder>`, then
  `npx serve dist -l 4173` and the two mobile specs with `--grep`.

Things that cost time in Year 3:

- commitlint refuses an upper-case letter in the subject, so write "gibbs energy", not "ΔG°".
- A loop's arrival check needs the first `[data-item-start]` on screen. A problem screen opens at
  its own top, with the page title `phone:sr-only` in Æfa.
- Typed loops need `typedTogether`.
- `useScreenTop` does not focus on mount, so a screen opened from the menu focuses its own title.
- Guards scan comments too, so don't write a banned term even to explain why it is avoided.
