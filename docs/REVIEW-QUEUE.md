# Review queue

**One list of every open check and decision.** It was started on 2026-09-29, after PRs #65, #66
and #67 shipped the mobile pass, the vertical-scroll rollout and the jafna-jofnur rename.

- Each entry points to where its full detail lives. This file is the index; the linked documents
  hold the reasoning.
- **Keep it current.** When an item is done, tick it and add the date and the PR or commit. When a
  session finds something that needs a check or a ruling, add it here as well as wherever else it
  is written up. `CLAUDE.md` points here.

Sections A and B are checks someone has to do by hand. C is rulings for Siggi. D is work that
needs no ruling, only time.

---

## A. After the 2026-09-29 deploy

- [ ] **Old game URL redirects.** `curl -I https://kvenno.app/efnafraedi/1-ar/games/jafna-jofnur.html`
      should return 301 to `stilla-efnajofnur.html`.
  - `scripts/deploy.sh` does **not** install the nginx config. If you get a 200, copy
    `server/nginx-site.conf` over the live site file, then run
    `sudo nginx -t && sudo systemctl reload nginx`.
  - Check the live filename first. `README.md` says `sites-available/kvenno` and
    `docs/DEPLOYMENT.md` says `sites-available/kvenno.app` (see D).
- [ ] **Phone smoke test.** On a phone, play one question of a few games, e.g. Stilla efnajöfnur,
      Mólhugtakið and Lögmál Hess.
  - Expect question → answer → feedback → Næsta with little or no scrolling.
  - After Næsta, the next item should open at its top.
- [ ] **Hard-refresh the three 3D games** (VSEPR, Lewis, IMF) on a device that visited before the
      deploy. Their `{game}.js` entry file has a fixed name and nginx caches it for a year, so a
      returning browser can run the old bundle. See D for the lasting fix.

## B. Device and accessibility checks (never run)

Nothing in CI can do these. The design's risks section, §7 of
`docs/plans/2026-09-23-vertical-scroll-design.md`, explains why each matters.

- [ ] **VoiceOver (iPhone) and TalkBack (Android):**
  - after Athuga, focus moves into the feedback. Is the verdict announced **twice**? FeedbackPanel
    is `role="alert"` and also receives focus.
  - the same question for an opened hint.
  - the same question for lewis Stig 2's wrong-drawing note.
- [ ] **Real iPhone, Safari:**
  - pinned bars (hess Stig 2, einingakedjan, jafnvaegisfasti Tengd jafnvægi) sitting above the
    collapsing bottom toolbar;
  - the soft keyboard when focus moves programmatically.
- [ ] **Real Android phone, Chrome:** the same two checks.
- [ ] **Siggi plays each game on a phone once.** This was the design's exit criterion for the
      pilots, and nobody has done it.

## C. Decisions for Siggi

### C1. Vertical scrolling: confirm or change (PR #66)

Detail: §7 and the Outcome section of `docs/plans/2026-09-23-vertical-scroll-design.md`. Each item
shipped with the design's "planned" option.

- [ ] 1. equilibrium-shifter feedback: keep the scroll that shipped, or pilot paging (Svar → Q vs K
      → Tölur → Rök)?
- [ ] 2. Einingagreining Stig 2 on phones:
  - (a) hide "Stuðlar notaðir" in drag mode?
  - (b) hide "Strika út"?
  - (c) make click mode the default on touch?

  None of these is done.

- [ ] 3. lotukerfid: keep the empty period-7 row as a 12 px placeholder, or drop it?
- [ ] 4. iPhone SE (375×548): accept the one or two residual scrolls, or use pinned bars there too?
- [ ] 5. lewis Stig 2 for SF₆/PCl₅/BF₃: accept one scroll, or change the mechanic to tap-an-atom?
- [ ] 6. rafeindabygging Stig 2: should desktop also use the phone's side-by-side ↑↓ box notation?
- [ ] 7. lausnir Stig 1: the 2.5 s auto-advance after a correct answer is a timer in a learning phase.
      Replace it with a button?
- [ ] 8. Score, streak and Árangur chips in gas-law and buffer: now smaller on phones. Remove them
      everywhere? This overlaps C3 item 1.
- [ ] 9. No focus ring on programmatic focus targets (feedback, headings) at desktop width. Confirm?

### C2. Desktop behaviour changes: confirm (PR #66)

Detail: "Deliberate desktop behaviour changes" in the design's Outcome section.

- [ ] Focus moves at every width to the feedback, the new heading or an opened hint, with no ring.
- [ ] Enter in an answer field commits, or moves to the next field, in the typed-answer games.
- [ ] A Næsta, Reyna aftur, Áfram or Ljúka pressed within 400 ms of appearing is ignored, at every
      width.
- [ ] dimensional-analysis can scroll up to 56 px more on desktop, and the shared helpers jump
      instantly under reduced motion.

### C3. Content, teaching and terminology rulings: items 1–122 (PR #65)

Detail: `docs/plans/2026-09-23-mobile-pass-decisions.md`. Each item gives the decision, where it
lives, the options and a recommendation. Reply by number, e.g. "4 (b), 17 as recommended, 30
leave".

- [ ] 1–11 Platform-wide. Items 1 and 2 were ruled (b) for `lewis-structures` alone on
      2026-09-30, and item 7 applied there; each stays open for the other games it names. Examples:
  - scores and streaks in practice;
  - the two games that still charge for hints;
  - the i18n question;
  - reading `1.300`;
  - which book's formation enthalpies to use.
- [ ] 12–21 Terminology that spans games.
- [ ] 22–34 dimensional-analysis
- [ ] 35 lotukerfid
- [ ] 36–41 nafnakerfid
- [ ] 42–45 molmassi
- [ ] 46–47 reynsluformulur
- [ ] 48–49 stilla-efnajofnur
- [ ] 50–53 utfellingarhvorf
- [ ] 54–57 takmarkandi
- [ ] 58–60 lausnir
- [ ] 61–62 einingakedjan
- [ ] 63–64 rafeindabygging
- [x] 65–66 lewis-structures — done 2026-09-30 (PR #70)
- [ ] 67–71 vsepr-geometry
- [ ] 72–74 intermolecular-forces
- [ ] 75–79 hess-law
- [ ] 80–82 kinetics
- [ ] 83–88 redox-reactions
- [ ] 89–92 organic-nomenclature
- [ ] 93–94 gas-law-challenge
- [ ] 95–100 jafnvaegisfasti
- [ ] 101–104 equilibrium-shifter. 101 is the Keppnishamur unlock gate, which is live and needs a
      ruling.
- [ ] 105–108 syrufastinn
- [ ] 109–111 thermodynamics-predictor. 109: the live ΔG° panel shows the answer while the
      question is open.
- [ ] 112–116 ph-titration
- [ ] 117–119 buffer-recipe-creator
- [ ] 120–122 leysnijafnvaegi

### C4. Already applied: confirm or undo (PR #65)

Same document, items 123–126. Each is reversible.

- [ ] 123 `eðalgas` for noble gas
- [ ] 124 `ferflötungur` for tetrahedral
- [ ] 125 `virknihópur` for functional group
- [ ] 126 Einingagreining Stig 2 accepts the right factors in either order

### C5. Other open rulings recorded in `CLAUDE.md` (older than these PRs)

- [ ] **Íslenskubraut review workbook.** The reviewer-facing Icelandic in
      `scripts/islenskubraut/export-xlsx.mjs` is marked `PLACEHOLDER ICELANDIC`. Siggi must rewrite it
      before any export goes to a colleague.
- [ ] **molmassi names HCl `Saltsýra`** (a solution) while quoting the compound's molar mass. See
      also C3 item 14.
- [ ] **Two-word vs solid spellings.** `nettójónajafna` against the book's glossary `nettó
jónajafna`, and `prósentuheimtur` against `heimtur í prósentum`. Solid forms were taken.
- [ ] **Two glossary forms whose paragraphs disagree:** `ferflötungur` and `eðalgas`. These are
      C4 items 123 and 124.
- [ ] **The water-gas reaction's name** (`Vatnsgashvarfið`). The corpus cannot settle it. Same as C3
      item 19.
- [ ] **equilibrium-shifter's ten systems with no sourced constant.** Sourcing them would need the
      Icelandic book's complex-ion constants (`m68869`), which is a new source.
- [ ] **3D atom labels** fetch a font from `cdn.jsdelivr.net`. On a network that blocks it, the 3D
      view never finishes loading. Fixing it means bundling a font.

### C6. Lewis-formúlur design review (2026-09-30)

A design review of `2-ar/lewis-structures` found nine problems. Five were fixed the same day in
PR #70, whose description lists them. These four need a ruling, since each
changes how the game teaches or looks rather than correcting a defect.

- [ ] **Teach before test.** All three levels open on a question.
  - The only worked example, Leiðsögn, is opt-in and offered only on molecule 1.
  - Leiðsögn uses H₂O, the same molecule the student then draws.
  - Proposal: open Stig 2 and Stig 3 with a short worked step on a molecule outside the set, with
    Leiðsögn becoming that step.
- [x] **One way to draw a Lewis structure.** Ruled 2026-09-30 (the proposal), done the same day.
      Every screen — the Stig 2 board, the structure shown after it, the walkthrough and Stig 3's
      formal-charge, CO and resonance questions — now draws from `utils/lewisLayout.ts` with
      `components/LewisStructure.tsx`: element symbols, bond lines, dot pairs and circled formal
      charges, in the book's flat layout. The 3D view stays, as the VSEPR shape. Guarded by
      `lewis-layout.test.ts` and `one-renderer.test.tsx`.
- [ ] **Chrome.**
  - The shared Header appears only on the menu; each level builds its own "← Til baka".
  - There are three level accents plus an indigo Næsta, and kvenno-orange appears nowhere.
  - Emoji stand in for icons.
  - Proposal: one accent for actions, and the shared Header on every screen with the level in
    `gameTitle`.
- [ ] **Terms and content.**
  - The bond names, resonance (`samsvörun` against the book's `vok-`) and `formhleðsla` are C3
    item 20. The English Y2 chain is C3 item 3.
  - Not covered anywhere yet: the `2D Lewis` toggle label, `flippar` in Stig 3 question 7, and
    the legend's bare `Stakt par`.
  - BF₃'s explanation says it is stable "vegna þess að bór er lítið atóm". BF₃ is a reactive Lewis
    acid, so that oversimplifies.

## D. Work that needs no ruling

### D1. Defects found in passing (their own PRs)

From the vertical-scroll design's §7 and the mobile-pass decisions' last section.

- [ ] **buffer Stig 1** shows a live 'Fullkomið!' pill on the pH readout that can contradict a
      'Rangt' verdict.
- [ ] **equilibrium-shifter** shows 'Stig: 0' in Lærdómshamur, a score in a learning mode. This
      overlaps C3 item 1.
- [ ] **lausnir** Stig 1: 'Athuga lausn' gives no feedback outside the tolerance. This is C3 item
      60, listed here because it is a plain defect.
- [ ] **organic-nomenclature `AnimatedMolecule`** overlapped atoms from 4 carbons up. Check whether
      PR #65's branched-molecule fix covers it.
- [ ] **syrufastinn, leysnijafnvaegi:** `Áfram í Skilja` / `Áfram í Æfa` return to the menu
      instead of the next phase.
- [ ] **jafnvaegisfasti `AefaScreen.tsx`:** the KpTask `veldisvisir` message blames the wrong
      mistakes.
- [ ] **lotukerfid `PeriodicTable.tsx`:** `role="grid"` with no rows or cells.
- [ ] **hess-law Stig 2 `EquationBlock`:** a `role="button"` card containing its own buttons.
- [ ] **vsepr `BondAngleMeasurement.tsx`:** tick labels show the half-angle.
- [x] **lewis Stig 3:** a formal charge of 0 prints as `+0`. Fixed 2026-09-30 (PR #70).
- [ ] **Lewis +1 formal-charge badge** is red on a red O atom, so it is hard to see.
- [ ] **`gradeScientific`:**
  - it diagnoses a 10× slip as wrong digits;
  - its `ogilt` prompt could say what went wrong;
  - it rejects `-5,0` as an exponent.

  See the decisions doc's last section.

### D2. Operations and tooling

- [ ] **`deploy.sh` never installs `server/nginx-site.conf`.** Either document the manual step in
      `docs/DEPLOYMENT.md`, or add an opt-in step to the script.
- [ ] **The docs disagree on the nginx site filename:** `README.md` says `kvenno`,
      `docs/DEPLOYMENT.md` says `kvenno.app`. Fix them to match whatever the server actually uses.
- [ ] **The three 3D games' unhashed `{game}.js`/`{game}.css` are cached for a year.** Hash them,
      or give them a short cache header.
- [x] **pnpm 9.15 → current:** 12.8.1, 2026-09-29, PR #69. It needed `allowBuilds` for esbuild
      and unrs-resolver. `pnpm deploy` still bundles the backend.
- [ ] **`scripts/desktop-compare.mjs` is not in CI.** It needs a base build in the same job, and a
      mask for the animated states: buffer Stig 2, vsepr Stig 2, the redox galvanic cell.
- [ ] **`e2e/` has no `tsconfig`**, so `pnpm type-check` does not cover the specs.
