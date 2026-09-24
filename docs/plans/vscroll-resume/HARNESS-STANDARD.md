# kvenno-app mobile standard (the bar every game must clear)

Goal: a student on a phone (portrait 360×740 is the design target; 320×568 must still work;
landscape 740×360 must remain usable) can play every screen of every game by touch alone,
without zooming, without horizontal page scroll, and without missing information that
desktop users get by hovering. The desktop layout (1280×800) must not regress.

> **DISK — READ FIRST.** The textbook corpus (namsbokasafn-efni) is ALREADY cloned, read-only, at
> `/tmp/claude-0/-home-user-kvenno-app/671be487-23c0-5f0c-aac4-83ccc70ea7bc/scratchpad/mobile/corpus` — grep `/tmp/claude-0/-home-user-kvenno-app/671be487-23c0-5f0c-aac4-83ccc70ea7bc/scratchpad/mobile/corpus/books/efnafraedi-2e/02-mt-output/`. **Never clone it again**: a
> full clone is 4.5 GB and the shared disk is small; several parallel clones fill it and break every
> other agent's builds and tests. Do not copy node_modules into scratch dirs either.

## Tools (already set up — use them)

- Harness: `/tmp/claude-0/-home-user-kvenno-app/671be487-23c0-5f0c-aac4-83ccc70ea7bc/scratchpad/mobile/mobile-lib.mjs`
  exports `openPage(url, vp)`, `audit(page, label)`, `runSteps(page, steps)`, `summarize(r)`,
  `closeBrowser()`, `VIEWPORTS` (phone, se, small, landscape, tablet, desktop).
  Phone viewports emulate touch (`isMobile`, `hasTouch`) so `locator.tap()` works.
- CLI: `node <scratchpad>/mobile/mobile-probe.mjs <url> [--vp phone] [--steps steps.json] [--shot out.png] [--full]`
  Steps format is documented at the top of `runSteps` in mobile-lib.mjs
  (`{click:'text'}`, `{css:'sel'}`, `{tap:'sel'}`, `{fill:['sel','v']}`, `{audit:'label'}`, `{shot:'/abs.png'}`, …).
- Write your own Playwright scripts freely — put them in your own scratch subdirectory
  (`<scratchpad>/mobile/work/<your-unit>/`), import the harness by absolute path, and import
  Playwright (if needed directly) from `/home/user/kvenno-app/node_modules/@playwright/test/index.mjs`.
  Chromium executable: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Look at your screenshots with the Read tool. Seeing the screen is the point; numbers alone miss
  cramped-but-not-overflowing layouts.
- Live dev server for ONE game (hot-reloads your edits):
  `cd /home/user/kvenno-app/apps/games/<year>/<game> && npx vite --port <YOUR_PORT> --strictPort`
  (run it in the background; use only the port you were assigned; kill it when you finish).
  Dev mode lays out identically to the production build.
- A production build of every game from BEFORE this work is being served at
  `http://localhost:4173/efnafraedi/<year>/games/<game>.html` — use it as the "before" baseline
  (desktop screenshots especially). Do not rebuild into `dist/` (parallel builds collide there).
- Tests for one game: `cd /home/user/kvenno-app && npx vitest run apps/games/<year>/<game>`
  Type-check one game: `cd apps/games/<year>/<game> && npx tsc --noEmit`
  Lint: `npx eslint <files you changed>`; format: `npx prettier --write <files you changed>`.
  Never run repo-wide `--write`/`--fix` commands and never run `git commit`, `git stash`,
  `git checkout`, or `git reset` — other agents are editing other directories of this same tree.

## What "mobile-ready" means — check each on EVERY screen, level, phase and modal

R1  No horizontal page scroll at 320 px and up. Prefer reflow (stack, wrap, collapse grid
    columns, `min-w-0`, `break-words`) over scrolling. Genuinely wide content (a long equation,
    a data table, a periodic table) may scroll inside its own `overflow-x-auto` container —
    then make that obvious (it should not look cut off by accident).
R2  Touch targets: primary controls (answer options, submit/next/hint buttons, level cards,
    inputs, toggles) at least 44×44 CSS px. Nothing interactive under 24×24 unless it is an
    inline text link. Dense inherently-grid UIs (a periodic table) are judged by whether a
    student can reliably hit the intended cell — give a mobile layout, zoom or larger cells if not.
R3  Touch-only operability. HTML5 drag-and-drop (`draggable`, `onDragStart`, `onDrop`) does not
    work by touch on most phones: every drag interaction needs a tap alternative (tap item →
    tap destination), which also helps keyboard users. Hover-only information (`title=""`,
    `onMouseEnter`, `group-hover:`) needs a tap equivalent if the information matters to play.
    Pointer interactions on SVG/canvas must use pointer events (or touch + mouse), and dragging
    a handle must not scroll the page (`touch-action: none` on the handle/drag surface only —
    never on a large area the student needs to scroll past).
R4  Inputs: correct mobile keyboard. Follow CLAUDE.md's decimal rule exactly — non-integer
    answers are `type="text" inputMode="decimal"` parsed with `parseStudentNumber`; count
    fields keep `type="number"` (`packages/shared/utils/__tests__/decimal-input.test.ts`
    enforces this — do not fight it). For formula / chemical-name / free-text answer fields set
    `autoCapitalize="none" autoCorrect="off" spellCheck={false}` (plus `autoComplete="off"`)
    where phone autocorrect/autocapitalise could corrupt an answer — check how the grader
    compares first (case-sensitive element symbols like `Co` vs `CO` matter!). Input text
    must render at ≥16 px on touch devices or iOS Safari zooms the page on focus (a shared
    CSS rule handles most cases — verify with the harness's `zoomInputs`).
R5  Diagrams (SVG/canvas) scale to the container: `viewBox` + `w-full h-auto` (+ a `max-w-*`),
    no fixed pixel widths wider than the phone. Labels must stay legible (≈ ≥11 px rendered).
    If a diagram becomes illegible at 360 px, give it a mobile variant (fewer ticks, larger
    font in viewBox units, taller aspect) rather than letting it shrink to unreadable.
R6  Text: nothing a student must read renders below 12 px; body copy ≥14 px.
R7  Layout: multi-column grids collapse on phones (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
    style — keep the existing desktop column count at the breakpoint where it applied before);
    side-by-side panels stack; fixed `w-[NNNpx]`/`min-w-[NNNpx]` become `w-full max-w-[NNNpx]`
    unless inside a deliberate scroll container. Cramped-but-not-overflowing counts as a defect
    if a student would struggle (e.g., 5 answer buttons squeezed to 60 px each).
R8  Modals/overlays fit the viewport: `max-h-[90dvh] overflow-y-auto`, close button reachable
    and ≥44 px, not hidden under the sticky header.
R9  Nothing clipped by mobile browser chrome: avoid `h-screen`/`100vh` for content containers
    (use `min-h-dvh`/`min-h-screen` or natural height); fixed bottom bars respect
    `env(safe-area-inset-bottom)` and do not cover content.
R10 After the student submits, the feedback must be findable: if at 360×740 the result appears
    entirely below the fold (student taps "Athuga" and nothing visibly happens), scroll the
    feedback into view (`scrollIntoView({ block: 'nearest', behavior: 'smooth' })`) — only where
    that problem actually occurs; do not add scrolling where feedback is already visible.
R11 Landscape phone (740×360): the game must still be playable — the sticky header must not eat
    the screen, and nothing essential may be unreachable. Do not add orientation locks.
R12 Desktop must not regress. Work mobile-first: the base classes are the phone layout, and a
    breakpoint (`sm:`/`md:`/`lg:`) restores exactly what desktop had before. Compare 1280×800
    screenshots before (localhost:4173) and after (your dev server) for every screen you changed.

## Hard constraints

- No pedagogy, grading, content, scoring, or data changes. You are changing layout, input
  mechanics and touch handling only. If you believe a non-layout change is needed, report it
  instead of making it.
- All user-facing text is Icelandic. If an instruction must change (e.g., "Dragðu …" now that
  tapping also works), use `smelltu`/`veldu` wording consistent with the rest of the game, keep
  it minimal, and report every changed string. Never invent chemistry terms (CLAUDE.md
  terminology rules; `governed-terms.test.ts`, `no-flattened-icelandic.test.ts` and
  `no-invisible-characters.test.ts` scan comments too — do not write banned forms even in
  comments).
- Match the surrounding code style (Tailwind utility classes, existing component idioms,
  comment density). Do not add dependencies.
- Keep every existing test passing. Add a focused vitest test when you change interaction logic
  (e.g., a tap-to-place alternative to drag-and-drop), in the game's existing `__tests__` dir.
- Stay inside the files you were assigned. If you find a defect in a shared component
  (`packages/shared/`) while working on a game, REPORT it — do not edit shared files.

## Also read before starting

- `SHARED-CHANGES.md` (next to this file): what the shared layer already fixed and how it
  behaves now. Do not duplicate or fight it. Its per-game notes (mid-word breaks, raw `:hover`
  rules in your `styles.css`, known defects) are leads for you.
- Mid-word-break helper: `import { midWordBreaks } from '<scratchpad>/mobile/midword.mjs'`
  → `await midWordBreaks(page)`. The shared `overflow-wrap: break-word` default turns
  a too-long word into a mid-word split; every split is a layout defect to fix.

## Harness caveats found during the pass (read these)

- `page.screenshot({ fullPage: true })` on a touch-emulated page SILENTLY turns off touch
  emulation for the rest of that page's life: `matchMedia('(pointer: coarse)')` flips to false and
  every `pointer-coarse:` size then measures as desktop. Take viewport screenshots (scroll first)
  on touch pages; if you need a full-page shot, take it as the LAST action on that page, or open a
  fresh page afterwards.
- `getComputedStyle(el).width` on a flex item returns the used (shrunk) width, so a `w-6` box
  squeezed to 14 px will not show up in a width filter — compare rendered size to the class.
- Desktop comparisons against the Vite dev server occasionally render an `sm:`/`md:` restore as
  missing (dev CSS ordering). If a desktop diff looks like a lost breakpoint, re-check before
  "fixing" it.
- Range inputs: do NOT enlarge an `input[type=range]` touch target with padding plus
  `bg-clip-content` — a drag that starts in the padding does not move the thumb. Enlarge the thumb
  via `::-webkit-slider-thumb` / `::-moz-range-thumb` or wrap it in a taller label instead.
- Screen swaps: many games swap screens by state and keep the old scroll position, so on a phone
  the student lands partway down the new screen. A platform-wide fix is planned as a follow-up;
  fix it locally only where it breaks play on this game, and say so.
