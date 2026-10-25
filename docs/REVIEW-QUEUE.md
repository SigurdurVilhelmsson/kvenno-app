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

- [x] **Old game URL redirects** — done 2026-10-18, after the deploy carrying PR #107 with the
      nginx config installed: `curl -I https://kvenno.app/efnafraedi/1-ar/games/jafna-jofnur.html`
      returns 301 to `stilla-efnajofnur.html`.
  - `scripts/deploy.sh` does **not** install the nginx config. If you get a 200, copy
    `server/nginx-site.conf` over the live site file, then run
    `sudo nginx -t && sudo systemctl reload nginx`.
  - Check the live filename first. Every doc says `sites-available/kvenno.app` since 2026-10-03;
    the server has not been looked at (D2).
- [ ] **Phone smoke test.** On a phone, play one question of a few games, e.g. Stilla efnajöfnur,
      Mólhugtakið and Lögmál Hess.
  - Expect question → answer → feedback → Næsta with little or no scrolling.
  - After Næsta, the next item should open at its top.
- [x] **Hard-refresh the three 3D games** — moot, checked 2026-10-18: the live HTML of all three
      names a hashed entry (`assets/vsepr-geometry/vsepr-geometry-<hash>.js`), so PR #82 is
      deployed. The original check: hard-refresh them on a device that visited before the
      deploy. Their `{game}.js` entry file has a fixed name and nginx caches it for a year, so a
      returning browser can run the old bundle. See D for the lasting fix. **Moot from the deploy
      that carries PR #82**: the entry is hashed there, so new HTML names a file no browser has
      cached.
- [x] **Íslenskubraut recordings and review pages, after the deploy that carries them** — done
      2026-10-18 (PR #107), apart from the device check below. Deployed, with the nginx config
      installed. Checked from a cloud session: the live app's assets are the ones `main`
      builds; all 524 recordings answer 200 `audio/mpeg` with `Cache-Control: no-cache`, and
      `0000000000000000.mp3` a 404; all 105 PDFs under `spjold/` answer 200 `application/pdf`; both
      review pages load. The game pages also send the CSP in `server/nginx-site.conf` exactly.
      Before sending colleagues to review (C20), the check was:
  - Install `server/nginx-site.conf` as above. It gives `/islenskubraut/hljod/` its own location
    (2026-10-16): without it a missing recording is answered with the app's HTML and a 200, and
    a remade one can be served from a browser's cache.
  - `curl -I https://kvenno.app/islenskubraut/hljod/<a file in apps/islenskubraut/public/hljod>`
    should return 200 with `audio/mpeg`, and `…/hljod/0000000000000000.mp3` a 404.
  - Open https://kvenno.app/islenskubraut/yfirferd on a phone and a laptop. Every PDF link should
    open a PDF, and a recording on `/islenskubraut/yfirferd/hljod` should play.
- [ ] **Refuse compressed request bodies at nginx, after the deploy that carries the 2026-10-23
      hardening (D4).** The backend refuses them itself from that deploy; the nginx copy also
      covers a backend left on an unpatched Node.
  - Install `server/nginx-site.conf` as above: its `/api/` location now answers a request
    carrying a `Content-Encoding` other than `identity` with 415.
  - Check: `printf '{}' | gzip | curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Origin: https://kvenno.app' -H 'Content-Type: application/json' -H 'Content-Encoding: gzip' --data-binary @- https://kvenno.app/api/analyze-2ar`
    should print 415. It printed 400 before (the body was decoded and read).
- [ ] **Play a recording on the review pages on a phone and on a laptop**, the one part of the item
      above a request cannot show: a PDF link opens in the browser's viewer and a recording on
      `/islenskubraut/yfirferd/hljod` is heard.
- [x] **Íslenskubraut PDF download** — done 2026-10-06 (PRs #87, #88): works on kvenno.app.
      The check: on https://kvenno.app/islenskubraut/, open any card and press
      `Hlaða niður PDF`. Expect a PDF in Noto Sans, not the alert
      `Villa kom upp við niðurhal`.
  - The first deploy of #88 still failed because `pnpm build` was skipped: `deploy.sh` shipped
    whatever was in `server/dist`, and its health check passes against the old backend too.
    Since then `deploy.sh` runs `pnpm build` itself.
  - The deploy carrying only the bundled-font fix (PR #87) still failed, as reported the same
    day. The cause was the backend's production rule refusing every request with no `Origin`
    header: a browser sends none on a same-origin GET, which is what the button makes, so every
    card got a 500 (`Error: Origin header required` in `journalctl -u kvenno-backend`). The rule
    now applies only to methods other than GET and HEAD.
  - If it still fails, read `journalctl -u kvenno-backend -n 50` on the host first. A failing
    download that never reaches the backend points at the live nginx config: check it has the
    `/api/` location from `server/nginx-site.conf`, which `deploy.sh` does not install.

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
shipped with the design's "planned" option. **Settled 2026-10-23 on Claude's recommendation**
(Siggi: "continue, using your recommendations and best judgment"; PR #112): each planned option is
kept, except 7, which is changed, and 8, which decision 1 had already settled. Each is reversible.

- [x] 1. equilibrium-shifter feedback: keep the scroll that shipped, or pilot paging (Svar → Q vs K
      → Tölur → Rök)? Kept: paging invites tapping through the Q vs K and Tölur panes.
- [x] 2. Einingagreining Stig 2 on phones:
  - (a) hide "Stuðlar notaðir" in drag mode?
  - (b) hide "Strika út"? Moot since 2026-10-23: decision 29 (a) removed the button.
  - (c) make click mode the default on touch?

  None of these is done, and none is wanted: drag stays the default, and the chain stays shown.

- [x] 3. lotukerfid: keep the empty period-7 row as a 12 px placeholder, or drop it? Kept.
- [x] 4. iPhone SE (375×548): accept the one or two residual scrolls, or use pinned bars there too?
      Accepted; the SE is the stretch target.
- [x] 5. lewis Stig 2 for SF₆/PCl₅/BF₃: accept one scroll, or change the mechanic to tap-an-atom?
      Accepted; an interaction change for one scroll on three molecules is not worth it.
- [x] 6. rafeindabygging Stig 2: should desktop also use the phone's side-by-side ↑↓ box notation?
      No; desktop keeps its layout, as the pass promised.
- [x] 7. lausnir Stig 1: the 2.5 s auto-advance after a correct answer is a timer in a learning phase.
      Replace it with a button? Yes: the concept panel stays until `Næsta verkefni` (`Ljúka stigi`
      on the last task), guarded against a double tap (`phone-scroll.test.tsx`).
- [x] 8. Score, streak and Árangur chips in gas-law and buffer: now smaller on phones. Remove them
      everywhere? This overlaps C3 item 1. Settled by item 1 (PR #85): gas-law shows score and
      streak in Keppnishamur only, and buffer's tiles count progress, not points.
- [x] 9. No focus ring on programmatic focus targets (feedback, headings) at desktop width. Confirm?
      Confirmed.

### C2. Desktop behaviour changes: confirm (PR #66)

Detail: "Deliberate desktop behaviour changes" in the design's Outcome section. **All four
confirmed 2026-10-23 on Claude's recommendation** (PR #112): each is guarded by tests and makes
desktop safer or more consistent, not different in look.

- [x] Focus moves at every width to the feedback, the new heading or an opened hint, with no ring.
- [x] Enter in an answer field commits, or moves to the next field, in the typed-answer games.
- [x] A Næsta, Reyna aftur, Áfram or Ljúka pressed within 400 ms of appearing is ignored, at every
      width.
- [x] dimensional-analysis can scroll up to 56 px more on desktop, and the shared helpers jump
      instantly under reduced motion.

### C3. Content, teaching and terminology rulings: items 1–122 (PR #65)

Detail: `docs/plans/2026-09-23-mobile-pass-decisions.md`. Each item gives the decision, where it
lives, the options and a recommendation. Reply by number, e.g. "4 (b), 17 as recommended, 30
leave".

- [x] 1–11 Platform-wide. All eleven are now applied. Items 1, 2 and 9 were applied
      2026-10-03 in every game they name (PR #85); items 3–8, 10 and 11 earlier. Item 1's
      judgement calls, below under "Item 1 as applied", were ruled 2026-10-23. Item 5's last two
      parts were settled on Claude's recommendation 2026-10-23 (PR #112): the drafted note
      stands, and trailing text that carries a number on (`8,3 × 10²`) is unreadable, not its
      first part; a unit still reads.

**2026-10-23: every item with a clear recommendation was applied as recommended** (Siggi:
"apply all your recommendations"), each marked `Ruled 2026-10-23` in the decisions doc with what
was done. The last three, ruled the same day:

- [x] 51 utfellingarhvorf: the FeCl₃ coagulant sentence. Siggi took the draft, 2026-10-23 (PR #112).
- [x] 94 gas-law-challenge: an Explore screen. Siggi: skip for now, 2026-10-23. Reopen when wanted.
- [x] 103 equilibrium-shifter: the systems with no constant. Siggi: source them from `m68869`,
      2026-10-23 (PR #112). It covers the two complex ions; eight remain with no source.

Done: 12–122. Siggi ruled 27 (a), 32 (b), 40 (b),
42 (c), 51, 57 (a), 61 (a), 73, 97 (a), 103 and 110's last name on 2026-10-23, applied the same day. Items 45, 50, 52, 53, 100 and 122 were "keep" or "leave", so nothing changed.

#### Drafted wording from 2026-10-23: accepted

The recommendations did not give these words; the agents applying them wrote them. Each file
says where. Siggi accepted all of it as written, 2026-10-23 (PR #112).

- [x] dimensional-analysis Level 3 summary (31), mastered and not:
      `Stigi lokið: {n} af {m} rétt. Þú hefur náð tökum á stiginu.` /
      `… Til að ná tökum á stiginu þarf rétt svar og útskýringu í flestum áskorunum.`
- [x] nafnakerfid: Level 2 `Rétt — en skrifaðu {nafn}` (36); the rules panel's added line
      `Einnig ammóníum (NH₄⁺), fosfat (PO₄³⁻), vetniskarbónat (HCO₃⁻) og díkrómat (Cr₂O₇²⁻).` (38).
- [x] reynsluformulur (13): the column `Lágstafur`, `Ekki alveg — Lágstafasúlan`, and the hint
      `Lágstafirnir eru hlutföllin sjálf, námunduð að næstu heilu tölu.`;
      stilla-efnajofnur:
      `Lágstöfunum (litlu tölunum) má aldrei breyta: þeir segja hvaða efni þetta er.`
- [x] takmarkandi Stig 3 (56): natriumklorid's new context and the two misconception sentences
      (`yieldProblems.ts`, `Level3.tsx` `wrongPickMisconception`).
- [x] intermolecular-forces challenge 3 (73):
      `Vatnssameind er í raun léttari en sameindir lífrænna leysa: 18 g/mól á móti 58 g/mól í asetoni.`
- [x] dimensional-analysis Stig 0, rule 4 (32): the rule's title
      `Núll aftast telja ef þau standa á eftir kommu`, its body, the two examples, the c4/c5
      misconceptions, the r5 note and the added sentence
      `Komma aftast, án tölustafa á eftir, breytir engu (regla 4).`
      (`data/sigfig-items.ts`, `Level0SigFigs.tsx`).
- [x] einingakedjan (61): the ten repair explanations in `engine/chain.ts` `correctionPrompt`,
      e.g. `Rétt. Síðasta hlutfallið leiddi þig frá markinu. …`.
- [x] gas-law (93): `Rétta svarið var sýnt áður en þú reyndir aftur, svo svarið telst ekki með.`
- [x] jafnvaegisfasti: `Sýna svarið og halda áfram` (95), and the new problem's context (96),
      `Tilraun 2 úr kennslubókinni. Q er langt yfir K, svo hvarfið gengur afturábak: …`.
- [x] equilibrium-shifter (104): `Fyrsta klofnunarþrep fosfórsýru` (id 27) and id 22's
      description `Djúpblá kopar-ammóníakflókajón, dæmi um tenglaskipti.`
- [x] thermodynamics-predictor (111): `Til umhugsunar (ekki metið):` and the eight reworded
      prompts (`data/problems.ts`, ids 23–30); (109) `Í keppni er hitastigið fast.`
- [x] ph-titration (112–114): the question-6 misconception note, the Level 2 explanations naming
      the accepted indicators, and two indicator descriptions (`indicators.ts`).
- [x] buffer-recipe-creator (119): the caption
      `Eftir að {n} mól af sterkri sýru er bætt við {V} L`.
- [x] leysnijafnvaegi (120): the two `Algeng villa:` sentences for √Ksp and the forgotten 4.

#### Found while applying them

- [x] **syrufastinn Æfa now has seven problems, not five** (106 (b), one per acid read
      literally). Siggi: keep seven, 2026-10-23.
- [x] **ph-titration grades indicators against the equivalence pH as printed** (113): unrounded,
      HF's 7,97 fits no indicator, so HF now accepts þýmólblátt only. Siggi: only þýmólblátt
      counts, 2026-10-23.
- [x] **`ordabok.md` says `indicator;litvísir`**, while 116 kept `vísir`. Siggi: `litvísir`,
      2026-10-23; swept in `ph-titration`, with a row in its `icelandic-text.test.ts`.
- [x] **Q reads neuter in places** (`Q er minna`) in jafnvaegisfasti. Siggi: neuter for both K
      and Q, 2026-10-23 (99); the masculine K applied earlier that day is reverted, held by
      `k-gender.test.ts`.
- [x] **molmassi Stig 3: NH₃ and O₂ still both come to 2 mól** (43 named three problems). —
      2026-10-24: O₂ weighs 32 g, 1 mól, so no two of the six share an answer
      (`level3-varied-answers.test.ts`).

#### Item 1 as applied (2026-10-03, PR #85): ruled 2026-10-23

Applying item 1 in seventeen games needed calls the ruling did not make. Each is reversible.
Siggi, 2026-10-23: accept 1, 2, 4, 5, 6 and 8 as applied; 3 and 7 as recommended (PR #112).

- [x] **Levels that cannot end wrong report completion, not a count** (as item 23 did):
      `lausnir` Stig 1 (`Þú kláraðir öll 6 verkefnin`) and all three `buffer-recipe-creator`
      levels (`✓ Lokið`). Buffer's Stig 2 and 3 steps can be answered wrong before the student
      moves on, but a retried right answer counts, so a count would always be full.
- [x] **An answer the game had already printed does not count after a retry:** `redox-reactions`
      Stig 1, `nafnakerfid` Stig 3, `takmarkandi` Stig 3 (item 54), `organic-nomenclature` Stig 2,
      `hess-law` Stig 1, `ph-titration` Stig 2. The other way out is to hide the answer while a
      retry is on offer, which would let retries count.
- [x] **Hints that state the answer still count** (item 2 says hints never change a count):
      VSEPR Stig 2's second tier (`horn nálægt X`), gas-law's last practice hint,
      equilibrium-shifter's fourth tier. Count them as a revealed answer instead? — 2026-10-23:
      yes. A right answer after such a hint is not counted, and the feedback says
      `Síðasta vísbendingin gaf svarið, svo svarið telst ekki með.` (VSEPR, whose verdict is
      one line, prefixes `Rétt!`). In equilibrium-shifter a wrong answer after it drops out of
      the count too, as an answer the game had shown always has there.
- [x] **Follow-up: gas-law's Keppnishamur hints** gave the answer for full points (call 3 covers
      practice only). — 2026-10-23, Siggi: "use your recommendations": Keppnishamur offers every
      hint but the last, as it offers no worked solution; no points penalty
      (`last-hint-reveals-answer.test.tsx`).
- [x] **`redox-reactions` Stig 2 content change:** the diagram labelled `Cl afoxast` from the first
      answer on, so `Hvað afoxast?` was asked under its own answer. The labels now appear after
      the second answer.
- [x] **Practice became rounds** in `gas-law-challenge` (13, 6, 4 questions on Stig 1–3) and
      `thermodynamics-predictor` (10, 12, 8 on Auðvelt–Erfitt), so there is an end to report
      `N af M rétt` at; the best round is kept, and a round left early saves nothing.
      Keppnishamur keeps its points and now starts every run at 0.
- [x] **What is counted:** VSEPR Stig 2 counts its three graded steps per molecule (30), not the
      written explanation, which is checked only for length; `organic-nomenclature` Stig 2 keeps
      its two modes' best as one right/total pair.
- [x] **Einingagreining Stig 2 and 3 end without `N af M rétt`,** because their mastery gate
      (items 30 and 31) could contradict a count. `molmassi` Stig 2 keeps its 6/10 gate (item 42
      is unruled). — 2026-10-23: out of date. Item 31 gave Stig 3 a summary line with the count,
      and Siggi ruled Stig 2 gets the same; item 42 is ruled (c).
- [x] **Wording to confirm:** `Stigi 3 lokið`, `Þú kláraðir öll 6 verkefnin` (lausnir);
      `N af 15 skrefum rétt` (takmarkandi); `Stig í [A]:` (kinetics' rate-law rows; questions use
      the book's `stig með tilliti til A`); `Met á Stigi N`, `Keppnismet`, `Æfingu lokið`,
      `Æfa stigið aftur`, `Lærdómshamur, síðasta lota` (gas-law, thermodynamics,
      equilibrium-shifter); `Framvinda: N af 3 stigum lokið`. The new en/pl strings in
      `lausnir`, `nafnakerfid` and `redox-reactions` (`z`, `poprawnie`, `Ukończono`) are drafts.

### C4. Already applied: confirm or undo (PR #65)

Same document, items 123–126. Each is reversible.

- [x] 123 `eðalgas` for noble gas — confirmed by Siggi 2026-10-23
- [x] 124 `ferflötungur` for tetrahedral — confirmed by Siggi 2026-10-23
- [x] 125 `virknihópur` for functional group — confirmed by Siggi 2026-10-23
- [x] 126 Einingagreining Stig 2 accepts the right factors in either order — confirmed by Siggi
      2026-10-23

### C5. Other open rulings recorded in `CLAUDE.md` (older than these PRs)

- [ ] **Íslenskubraut review workbook.** The reviewer-facing Icelandic in
      `scripts/islenskubraut/export-xlsx.mjs` is marked `PLACEHOLDER ICELANDIC`. Siggi must rewrite it
      before any export goes to a colleague.
- [x] **molmassi names HCl `Saltsýra`** (a solution) while quoting the compound's molar mass. See
      also C3 item 14. — 2026-10-02: now `Vetnisklóríð`, a gas, and in the molar-volume pool.
- [x] **Two-word vs solid spellings.** `nettójónajafna` against the book's glossary `nettó
      jónajafna`, and `prósentuheimtur` against `heimtur í prósentum`. Solid forms were taken. —
      2026-10-23, kept on Claude's recommendation (PR #112): the book's running prose writes them
      solid (23 to 8 for `nettójónajafna`), and `ordabok.md` already does.
- [x] **Two glossary forms whose paragraphs disagree:** `ferflötungur` and `eðalgas`. These are
      C4 items 123 and 124, confirmed by Siggi 2026-10-23.
- [x] **The water-gas reaction's name** (`Vatnsgashvarfið`). The corpus cannot settle it. Same as C3
      item 19. — 2026-10-02: the compound, confirmed; a `governed-terms` row bans the split.
- [x] **equilibrium-shifter's ten systems with no sourced constant.** Sourcing them would need the
      Icelandic book's complex-ion constants (`m68869`), which is a new source. — 2026-10-23
      (PR #112): Siggi said yes; it sources the two complex ions. Eight remain, with no source.
- [x] **equilibrium-shifter's aqueous ΔH.** `thermo.ts` transcribed no dissolved ions, though the
      book's `m68865` lists them. — 2026-10-23 (PR #112): Siggi said transcribe them; all 46
      readable (aq) rows are in. They move ids 7 and 10 by under half a kJ, no sign. The book has
      no row for the weak acids, ammonia or the complexes, so the rest stay unsourced.
- [x] **3D atom labels** fetch a font from `cdn.jsdelivr.net`. On a network that blocks it, the 3D
      view never finishes loading. Fixing it means bundling a font. — 2026-10-01, PR #71. Worse than
      recorded: the CSP in `server/nginx-site.conf` refuses both that fetch and troika's worker, so
      wherever that config is live the view never loaded at all. Fixed with a bundled font and troika's worker off; see
      `CLAUDE.md` "3D labels fixed".

### C6. Lewis-formúlur design review (2026-09-30)

A design review of `2-ar/lewis-structures` found nine problems. Five were fixed the same day in
PR #70, whose description lists them. These four need a ruling, since each
changes how the game teaches or looks rather than correcting a defect.

- [x] **Teach before test.** All three levels open on a question.
  - The only worked example, Leiðsögn, is opt-in and offered only on molecule 1.
  - Leiðsögn uses H₂O, the same molecule the student then draws.
  - Proposal: open Stig 2 and Stig 3 with a short worked step on a molecule outside the set, with
    Leiðsögn becoming that step.
  - **Done 2026-10-01 (the proposal), PR #72.** Stig 2 opens on Leiðsögn for PCl₃, with a button
    to skip it. Stig 3 opens on a worked example: the book's own CO₂ comparison for formal charge
    (O=C=O against O≡C–O), then SO₂ for vok. None of the three molecules is asked about in its
    level. Stig 1 still opens on a question; it teaches the counting rule beside it.
    Guarded by `teach-before-test.test.tsx`.
- [x] **One way to draw a Lewis structure.** Ruled 2026-09-30 (the proposal), done the same day.
      Every screen — the Stig 2 board, the structure shown after it, the walkthrough and Stig 3's
      formal-charge, CO and resonance questions — now draws from `utils/lewisLayout.ts` with
      `components/LewisStructure.tsx`: element symbols, bond lines, dot pairs and circled formal
      charges, in the book's flat layout. The 3D view stays, as the VSEPR shape. Guarded by
      `lewis-layout.test.ts` and `one-renderer.test.tsx`.
- [x] **Chrome.**
  - The shared Header appears only on the menu; each level builds its own "← Til baka".
  - There are three level accents plus an indigo Næsta, and kvenno-orange appears nowhere.
  - Emoji stand in for icons.
  - Proposal: one accent for actions, and the shared Header on every screen with the level in
    `gameTitle`.
  - **Done 2026-10-01, PR #72, with one change.** The shared Header is on every screen and goes
    back to the menu through its new `onBack`. The level is named on the page, not in `gameTitle`:
    `game-titles-agree.test.ts` holds every `gameTitle` to the hub card's name. Every action is
    kvenno-orange; green and red now mean only right and wrong. The emoji are lucide icons, and
    the two celebration ones (🏆, 🎉) are gone.
- [x] **Terms and content.**
  - The bond names, resonance (`samsvörun` against the book's `vok-`) and `formhleðsla` are C3
    item 20. The English Y2 chain is C3 item 3.
  - Not covered anywhere yet: the `2D Lewis` toggle label, `flippar` in Stig 3 question 7, and
    the legend's bare `Stakt par`.
  - BF₃'s explanation says it is stable "vegna þess að bór er lítið atóm". BF₃ is a reactive Lewis
    acid, so that oversimplifies.
  - **Done 2026-10-01 in Lewis, PR #72.** Item 20's Lewis part, from the glossary and the book's
    ch. 7: `eintengi`/`tvítengi`/`þrítengi`, `formleg hleðsla`, `vokmynd`/`vok`, `áttund`, and
    `ofgild sameind` for an expanded octet. Item 87 for Lewis: `Samgild tengi`. Item 8 in all three
    3D games. `flippar` is gone; `2D Lewis` and `Stakt par` went with PR #71. BF₃ now says it is very
    reactive and takes a lone pair readily, as the book does. Two more were found: SF₆'s hint
    called 12 electrons "tvöfalt meira" than 8, and Stig 3's closing rules put formal charge
    ahead of the octet. `icelandic-text.test.ts` now fails on the old forms.
  - **Done 2026-10-01 in VSEPR.** Item 20's VSEPR part: `svigrúmablöndun` (ordabok, 151 to 0
    against `blendni`), `svæði rafeindaþéttleika` (the book, 29 to 2 against `rafeindasvið`), the
    glossary's shape names (`vegasalt`, `ferningslaga flatt`, `þríhyrningslaga flatt`,
    `þríhyrningslaga pýramídi`) and the book's `þríhyrndur tvípýramídi`, and `tengi` for a bond.
    Item 7 (b) applied to its PCl₅ and SF₆ explanations. `intermolecular-forces` needed no change:
    it already said `vetnistengi` and `tengi`, and its own test bans the old forms. Eight of the
    terms are now `governed-terms.test.ts` rows, so they hold platform-wide, and `ordabok.md`
    gained seven entries taken from the book (`electron domain`, `formal charge`, `octet`,
    `resonance structure`, `resonance hybrid`, `trigonal bipyramidal`, `hypervalent molecule`).
  - **Done 2026-10-01 in redox.** Item 87: Stig 1's related-concept chip `Rafeindasameignir`,
    not a word, is now `Rafeindaflutningur`, the game's own word for electron transfer.
  - **Done 2026-10-01, all eight Y2 games.** Item 3: the `Námsleiðin` chain uses the hub-card
    names (`VSEPR` kept as the acronym), guarded by a Y2 `chain-string.test.ts` like Y1's and Y3's.

### C7. Íslenskubraut against BÍN (2026-10-08)

`pnpm islenskubraut:bin` checks every word in `content/islenskubraut/*.yaml` against
BÍN-kjarninn. The first live run was 2026-10-09 (D2): 522 words, 514 known, 8 left for a
person, now 5 (D3). These two need a ruling.

- [ ] **Gate CI on it?** The check is offline once `content/islenskubraut/bin/ordmyndir.json`
      is committed, so CI could run it. The cost is that every new word needs a fetch, or an
      entry in `bin/ekki-i-bin.yaml`, before its PR goes green.
- [ ] **Show gender and the needed form on the cards.** The original ask: a frame like
      `Það hefur ___.` needs `feld`, `hala`, `gogg`, while the chips say `feldur`, `hali`,
      `goggur`. BÍN supplies the gender and the forms; it cannot say which case each frame's
      blank takes. That tagging is a teaching call, per frame. **Drafted for A1 on 2026-10-11 for
      the sentence builder; confirm it under C9.**
  - When the cards show BÍN forms, the SPA card and the printed PDF must name the source in
    BÍN's wording (see `content/islenskubraut/bin/README.md`). The data is CC BY-SA 4.0, so
    also decide whether the card content that carries it is published under that licence too.
    That is a licensing question, not a code one.

### C8. Íslenskubraut levels (2026-10-09)

From a review of the app on 2026-10-09. The levels differ less than they look: the vocabulary
page is the same at A1, A2 and B1, and A2 and B1 mostly add more words of the same kind. The
proposal below keeps A2 and B1 and splits A1 into steps, each a different card with a new
language function rather than a longer list:

| Step | The learner…             | Frames                            | Words                             |
| ---- | ------------------------ | --------------------------------- | --------------------------------- |
| A1.1 | names things             | `Þetta er ___.`                   | a handful of nouns, with pictures |
| A1.2 | describes them           | `Hann/Hún/Það er ___.`            | adjectives in the noun's gender   |
| A1.3 | says what it does or has | `Það hefur ___.`, `Það étur ___.` | in the right case                 |

Gender comes before case, so the steps follow the grammar, and A1.3 depends on C7's case
tagging.

- [ ] **Split A1 into two or three steps, as above?** Before deciding:
  - If the Íslenskubraut courses already have names or numbers, match them rather than adding
    a second scheme.
  - The content to write and proofread grows by one card per category per new step.
  - The code hard-codes `A1 | A2 | B1` in about five places (the SPA's types, the server's
    level check, `scripts/islenskubraut/load.mjs`, the spreadsheet export and the PDF's
    teacher notes). Move the level list into the content first, so changing levels later
    needs no code edit.

### C9. Sentence builder tags, A1 (2026-10-11)

The sentence builder (D3, Features) needs to know, for each card frame, which words fill the blank
and in what form, and which words in the frame follow the subject. Claude drafted these for all six
categories at A1, under `builder:` at the end of each `content/islenskubraut/*.yaml`. **Nothing
reaches students until they are confirmed.** `pnpm islenskubraut:smidur` prints every sentence the
tags produce. The inflection tables were fetched on 2026-10-11, and every sentence builds; the
two defects below were found by reading them.

How the tags read: the subject (picked by the student from a list, or fixed, as `dýr` is) has a
gender and number from BÍN. `NF` and `ÞF` mark a pronoun that follows it (`Það er` → `Hann er`,
`notar það` → `notar hann`), `sögn` marks `er`, which becomes `eru` for a plural subject. A blank
is filled as written, made to `agree` (an adjective: `sætt` → `sætur`), or put in the `ÞF` (a noun
after `hefur`: `feldur` → `feld`).

- [ ] **Confirm the tags, category by category.** In brief:
  - `dyr`: fixed subject `dýr`. `Það er ___.` agrees with Stærð; `Það hefur ___.` puts the
    appearance nouns in ÞF; sounds and uses as written.
  - `matur`, `farartaeki`, `stadir`, `klaednadur`: the student picks the subject from
    "Hvers konar … er þetta?" and `Þetta er ___.` names it. `Það er ___.` agrees with the
    appearance or taste answers; the rest as written.
  - `manneskja`: the student picks `hún` or `hann`, since a person's pronoun follows the person,
    not the noun (`kennari` can be `hún`). `Þetta er ___.` takes the job as written.
- [ ] **Should the builder change the card's `Það` at all?** The cards print `Það er ___.` and
      `Maður notar það ___.`; for a masculine or feminine subject the builder writes `Hann er
stór.` and `Maður notar hann …`. That is correct Icelandic, but it means an A1 learner meets
      the gendered pronouns here before C8's A1.2 step would teach them. The other choice is to
      keep `Það` and agree only the adjective, which is wrong for a gendered noun (`Það er stór`).
- [ ] **Two readings chosen by Claude.** BÍN reads `hali` as three words (`hal`, `hali`,
      `halur`) and `sætt` as two (`sær`, `sætur`); the builder refuses to guess, so the YAML
      names `hali` and `sætur` under `lemmas`. Confirm both.
- [ ] **`skór` is read as plural** (`Þetta eru skór.`), since BÍN gives the same form for one
      and many. Listed under `plural:` in `klaednadur.yaml`.
- [ ] **Two drafted tags read wrong once the sentences were printed (2026-10-11).** Drafted
      fixes 2026-10-16, to confirm (the YAML keys are in `content/islenskubraut/README.md`):
  - `matur`: the frame now has `except: [drykkur]`, so a drink is never offered
    `Maður borðar hann …`. The printed card still has the frame, since it is about the food on
    it.
  - `farartaeki`: the blank has `forms: { þögult: agree }`, so it prints `Hann hljómar þögull.`
    and `Hún hljómar þögul.`, with `hátt` and `lágt` as written. `dyr` needed nothing: its
    subject `dýr` is neuter. If `þögull` is the wrong word after `hljómar`, change the chip.
  - What was found:
    - `matur`: `Maður borðar það ___.` takes every subject, so it printed
      `Maður borðar hann á morgnana.` about a `drykkur`. One drinks a drink.
    - `dyr`, `farartaeki`: `Það hljómar ___.` put the sound chips in as written. `hátt` and
      `lágt` work as adverbs for any subject, but `þögult` is the neuter adjective, so
      `Hún hljómar þögult.` (a `rúta`) and `Hann hljómar þögult.` (a `bíll`) did not agree. Tagging
      the whole blank `agree` would also have turned `hátt` into `hár`.
- [ ] **The page's own Icelandic, drafted by Claude.** The title `Setningasmiður`, the prompts
      `Veldu setningaramma` and `Um hvern er setningin?`, the draft note `Drög: kennari hefur ekki
enn farið yfir þessar setningar.`, and the note under the sentence, `Undirstrikuðu orðin
breytast frá spjaldinu svo að þau passi við setninguna.` Try it at
      `/islenskubraut/smidur/klaednadur` after the next deploy. The teachers' list at
      `/islenskubraut/smidur` (2026-10-16, linked from nowhere) adds three more: its intro, `Opna
setningasmið`, and the statuses `drög, ekki birt nemendum` / `staðfest, birt á spjaldinu`.
- [ ] **To sign a category off**, add `confirmed: true` under `builder: A1:` in its YAML. The card
      page then links to the builder (`content/islenskubraut/README.md`).
- [ ] **Chips that are phrases are left as written** apart from their adjectives:
      `með hjólum` stays `með hjólum` in `Hann er með hjólum.` Check the printed list reads
      right with every subject.

### C10. Pictograms on the A1 chips (2026-10-11)

ARASAAC was chosen on 2026-10-11 (CC BY-NC-SA 4.0), and the website's A1 chips first. Every chip a
student sees at A1 has an entry in `content/islenskubraut/myndir/myndir.yaml` with an English
search word Claude drafted; the workflow is `content/islenskubraut/myndir/README.md`.

- [ ] **Fetch the pictures.** Run `pnpm islenskubraut:myndir --fetch` on a machine that can reach
      ARASAAC (this session cannot). It chooses the best match for each chip and downloads it.
- [ ] **Approve each pairing.** Open `islenskubraut-myndir-yfirlit.html`, check every picture
      against its word, swap in a better number where one is shown, and set `approved: true`.
      Nothing is shown to students before that. Abstract chips need the closest look:
      `til að gæta`, `til að klappa`, `ekkert` (no smell), `án hjóla`, `til að líta vel út`, `gróft`.
- [ ] **The licence on the cards.** The cards that carry ARASAAC pictures become CC BY-NC-SA:
      free for the school, not for sale, shared on the same terms. Confirm that is acceptable for
      the printed cards before the PDF PR adds the pictures there.
- [ ] **The credit's Icelandic**, drafted by Claude from ARASAAC's English wording: `Myndtáknin
eru eign ríkisstjórnar Aragóníu og gerð af Sergio Palao fyrir ARASAAC (https://arasaac.org),
sem dreifir þeim með Creative Commons-leyfinu BY-NC-SA.` Also the review sheet's few lines.

### C11. Links out from the card pages, "Fleiri úrræði" (2026-10-16)

Each card page can show links to resources elsewhere: Bildetema's Icelandic edition (one theme per
card), the Icelandic–Polish dictionary, Icelandic Online, IceFlash 4K, Málið, ISLEX, MMS's
Orðasjóður and Hvítar lygar, and MEMM's materials list. They are in
`content/islenskubraut/tenglar/tenglar.yaml`. Every address answered on 2026-10-16. Claude drafted
the names and descriptions.

- [ ] **Open each link with `?drog` on a card page** (e.g. `/islenskubraut/spjald/dyr?drog`), and
      set `approved: true` on the ones to keep. Nothing shows without `?drog` until then. Points to
      look at:
  - **Staðir.** Bildetema has no theme for places in town, so Staðir links to
    "Hús og heimili" (house types and rooms).
  - **IceFlash 4K.** Its hi.is project pages now return 404, so it links to HÍ's English set-up
    PDF.
  - **Orðasjóður and Hvítar lygar.** Both are listed for teachers, not students.
- [ ] **The panel's own Icelandic**: `Fleiri úrræði`, `Fyrir nemendur`, `Fyrir kennara`, and the
      draft note.
- [ ] **Run `pnpm islenskubraut:tenglar --online` once a term**, from a machine that can reach the
      sites. A link that has moved fails it.

### C12. Word lists, "Orðalisti" (2026-10-16)

One printable page per card and level: the words new at that level, a line for the student's own
language, and four review boxes. A2 and B1 list only the answers the level below does not print.

- [ ] **Read one list per category** from a card page's "Orðalisti (PDF)" link. Is "new at this
      level" the right choice, or should A2 and B1 repeat the level below?
- [ ] **The Icelandic, drafted by Claude:**
  - the title `Orðalisti`
  - the column headings `Orð` and `Á mínu tungumáli`
  - the review headings `1.`, `3.`, `7.` and `14.`
  - the instruction `Orðin á spjaldinu.` / `Ný orð á spjaldinu á stigi A2.` `Skrifaðu hvert orð á
þínu tungumáli. Rifjaðu orðin upp eftir 1, 3, 7 og 14 daga og merktu við í hvert sinn.`
  - the button `Orðalisti (PDF)`
- [ ] **The A1 pictograms go on the lists** once C10 has approved them and settled the licence for
      print, as for the printed cards.

### C13. Guessing game, "Hvað er þetta?" (2026-10-16)

Two printable pages per card and level: cut-out cards that each name a thing and say what the card
says about it, and a question sheet for the student who guesses. The things and their descriptions
are in `content/islenskubraut/giskaleikur/`, one file per category, and were **drafted by Claude**:
eight or nine things per category. The card page does not link a game until its file says
`confirmed: true`; add `?drog` to a card page's address to see the link anyway.

- [ ] **Read each category's game at all three levels**, from a card page with `?drog`. Is each
      description true, and are the things ones a student at that level knows? The A2 and B1 games
      add things the A1 game does not have.
- [ ] **The Icelandic, drafted by Claude:**
  - the page titles `Hvað er þetta? Spjöld` and `Hvað er þetta? Spurningablað`
  - the rules: `Leikurinn er fyrir tvo. Nemandi A dregur spjald og segir ekki hvað er á því.
Nemandi B spyr spurninganna hér fyrir neðan, einnar í einu. A svarar í heilli setningu með
orðunum á spjaldinu. B strikar yfir það sem getur ekki verið rétt. Þegar B veit svarið spyr B:
„Er þetta …?“ Svo skiptið þið um hlutverk.`
  - the headings `Spurningar`, `Hvað getur það verið?` and `Svaraðu svona`
  - the button `Hvað er þetta? (PDF)`
- [ ] **Set `confirmed: true`** in each category's file once it is right. That is what puts the
      link on the card page.

### C14. Talk-to-write sheets, "Frá tali til texta" (2026-10-16)

One printable page per card and level: say it with the frames, read a short model text, fill the
same text with the card's words taken out, then write your own. The 18 model texts are in
`content/islenskubraut/texti/` and were **drafted by Claude**. Every sentence parses in Greynir,
which checks grammar, not meaning. The card page does not link a sheet until its file says
`confirmed: true`; add `?drog` to see the link anyway.

- [ ] **Read all three levels of each category**, from a card page with `?drog`. Is each text
      true, natural Icelandic, and at its level? A2 grows from the card's own example; B1 is a
      school genre (Dýr a report, Matur a comparison, Farartæki an explanation, Manneskja a job
      description, Staðir a description of a place, Klæðnaður advice).
- [ ] **Look at the gaps on each sheet.** The build chooses them from BÍN and the card's words, so
      a teacher may want a word added to or removed from the card, or the text reworded.
- [ ] **The Icelandic, drafted by Claude:**
  - the title `Frá tali til texta: <genre>` and the step headings `1. Segðu frá`, `2. Lestu`,
    `3. Fylltu í`, `4. Skrifaðu`
  - `Veldu eitthvað á spjaldinu og segðu félaga þínum frá því. Notaðu rammana.`
  - `Lestu textann. Hver hluti hans segir eitthvað ákveðið og nafnið stendur við hann.`
  - `Brjóttu blaðið svo að textinn hér fyrir ofan sjáist ekki. Fylltu í eyðurnar með orðunum í
rammanum.`
  - `Skrifaðu tvær til fimm setningar um eitthvað annað á spjaldinu. Notaðu rammana í 1. hluta.`
  - the genre and stage names in each file, and the button `Frá tali til texta (PDF)`
- [ ] **Set `confirmed: true`** in each category's file once it is right.

### C15. Recordings on the cards, "Hlustaðu" (2026-10-16)

A play button beside every word, frame and worked example on the card page: 524 recordings,
synthesised with Reykjavík University's Talrómur C voice (CC BY 4.0). **None plays for students
until a teacher approves it on the listening page** and `pnpm islenskubraut:yfirferd --apply`
writes it `true` in `content/islenskubraut/hljod/hljod.yaml`; the build refuses a `true` written by
hand. Add `?drog` to a card page to hear them. Workflow: `content/islenskubraut/hljod/README.md`.

- [ ] **Listen to the recordings** on `/islenskubraut/yfirferd/hljod` (2026-10-16), which marks
      each one `Rétt` or `Rangt` and sends the marks back as a file (C20).
      `pnpm islenskubraut:yfirferd <files> --apply` then adds their verdicts to the record, a
      new file in `content/islenskubraut/hljod/mat/`, which is committed, and gives every recording the
      value all the verdicts there give it: `true` heard as right and never wrong, `rangt` the
      other way, `false` heard both ways. A recording made again goes back to `false`, and a
      ruling (`--urskurdur "Nafn"`, kept in the record) settles one heard both ways
      (`content/islenskubraut/hljod/README.md`). The page puts first the eight that a speech recogniser
      heard as something else, over 20 %: `les`, `gogg`, `goggur`, `úr ull`, `reglustika`, `feld`,
      `húfa`, `oddhvasst`. The research estimated 3–5 hours for all of them, so the work can be
      split by card.
- [ ] **Is a synthetic voice acceptable for the cards at all?** If not, the same files can be
      recorded by a person under the same names. Each one then goes back to `false` until it has
      been heard again, so nothing a person recorded plays to students unheard.
- [ ] **Record `hlýtt`** (2026-10-18), the one text on the cards without a clip. The clothes card
      said `heitt` to the touch until a teacher's correction: `heitt` is for food, `hlýtt` for
      clothes. It has no play button until `pnpm islenskubraut:hljod --jobs` and
      `talgerving.py` have made one, on a machine with the Talrómur setup.
- [ ] **The QR codes on the printed cards** wait until some recordings are approved.
- [ ] **The Icelandic, drafted by Claude:** the button label `Hlusta: <texti>` (read by screen
      readers) and the credit line `Upptökur: <rödd>.`. The listening page's own text is C20's.

### C16. Can-do statements, "Ég get…" (2026-10-16)

Three or four statements per card and level, printed as four strips for students to rate
themselves (_ekki enn_, _með hjálp_, _sjálf/ur_) and a class checklist for the teacher, in
`egget-*.pdf`. The 72 statements are in `content/islenskubraut/egget/` and were **drafted by
Claude** from each card's questions and frames. The card page does not link a sheet until its file
says `confirmed: true`; add `?drog` to see the link anyway.

- [ ] **Read each category's statements at all three levels.** Does each describe something the
      card at that level really lets a student do? Should they follow MMS's hæfnirammi or the
      ÍSAN1Í course outcomes more closely?
- [ ] **The ratings and the checklist's instructions, drafted by Claude:**
  - the ratings `ekki enn`, `með hjálp`, `sjálf/ur`
  - `Klippið blaðið í fjóra miða, einn fyrir hvern nemanda. Lestu hverja setningu og merktu við
það sem passar núna. Þetta er ekki próf.`
  - `Hlustaðu á nemanda tala um spjaldið og skrifaðu H (með hjálp) eða S (sjálf/ur) í reitinn.
Listinn er til að fylgjast með framförum, ekki til einkunnar.`
  - the button `Ég get… (PDF)`
- [ ] **Label every card "A1 · 1. stig" and so on**, matching MMS's framework, as the research
      proposes? Not done: it changes the printed cards, and it belongs with C8's question of how
      the levels are named.
- [ ] **Set `confirmed: true`** in each category's file once it is right.

### C17. Visible grammar on the sentence builder (2026-10-16)

Item 7 of the research, built on the sentence builder page (`/islenskubraut/smidur/<flokkur>`), so
it reaches students exactly when the builder does: once C9 confirms a category's tags. Three
parts, all read off the builder's tags and BÍN's tables:

- **Why each underlined word changed.** One line per word, from five templates in
  `apps/islenskubraut/src/components/Malfraedi.tsx` (`reason`):
  - `„það“ verður „hann“ af því að „ávöxtur“ er karlkyns og í eintölu.`
  - `„það“ verður „hún“: fornafnið fylgir manneskjunni.`
  - `„er“ verður „eru“ af því að „skór“ er í fleirtölu.`
  - `„sætt“ verður „sætur“: lýsingarorðið fylgir „ávöxtur“ (karlkyn, eintala).`
  - `„feldur“ verður „feld“: á eftir „hefur“ kemur þolfall.`
- **Allar myndir orðsins:** under an inflected word, its BÍN table:
  - a noun's four cases in each number
  - an adjective's four cases in each gender, singular

  What differs from the base form is in bold, and the form in the sentence is ringed.

- **Æfing:** a sentence with an inflected word left out and its forms to pick from. A wrong pick
  says `Ekki alveg. Reyndu aftur.`, a right one `Rétt.` and the reason. There is no score, and
  nothing is saved.

- [ ] **Read the five templates.** Is `þolfall` the word to use with A1 students, or should the
      line say less? Should the reason name the case of the pronoun too?
- [ ] **Try the drill** on two or three categories. It asks about every inflected word in the
      level's sentences, in order. Is that the right length, or should it stop after ten?
- [ ] **Not built:** a gender colour on every card, the research's optional fourth part. It would
      change the printed cards, so it waits for C8.

### C18. Students' own languages, "Á þínu máli" (2026-10-16)

A picker on the card page puts a student's own language beside each word on the question card,
with a link to look the word up. One file per language in `content/islenskubraut/glossur/`. **Only
an approved language is offered**; `?drog` shows drafts. Workflow:
`content/islenskubraut/glossur/README.md`.

- [ ] **Polish: glosses, the dictionary, or both?** `pl.yaml` glosses every chip at every level,
      **drafted by machine translation (Claude)**: the 103 A1 chips first, then on 2026-10-18 the
      223 that appear only at A2 and B1, which until then showed the dictionary link alone. The
      A2 and B1 drafts were each checked against Árnastofnun's dictionary by the drafter and by a
      second reviewer. Each chip also links to that dictionary
      (`polska.arnastofnun.is/pl/leit/<word>`, which finds `feld` under `feldur`). Calls a speaker
      should look at first:
  - **Smell takes an adverb** (`Jak pachnie? — mocno, świeżo`), as the A1 `gott → dobrze` already
    did, while taste and looks take a neuter adjective (`mocne`). On Matur the same chips answer
    both, so `pl.yaml` has a `questions` key for a gloss under one question of a card; Farartæki
    uses it too, where `hátt` is loud under Hljóð and tall under Útlit.
  - `námsráðgjafi` → `pedagog szkolny`, the dictionary's `doradca zawodowy i edukacyjny` being too
    long for a chip; `listir` → `sztuka`; `félagsfræði` → `socjologia`; `úlpa` → `kurtka zimowa`,
    since `jakki` is `kurtka`; `í hádeginu` → `w przerwie obiadowej`.
  - `sportvagn` → `samochód sportowy`, which waits on the word itself (D3: `sportbíll` or `sporvagn`).
  - **With a Polish speaker:** they read the glosses, then set `approved: true` and `approvedBy`.
  - **Without one:** delete `words` and `categories` and approve the dictionary link alone. Its
    entries are written by Árnastofnun's editors.
- [ ] **Which other languages, and who checks them?** The research's cost is 1–2 hours of a
      speaker's time per language for the A1 chips. Arabic and Farsi are written right to left,
      which the page already handles.
- [ ] **The Icelandic, drafted by Claude:** the picker's label `Á þínu máli`, its first option
      `Bara íslenska`, and the link name `Orðabók: <orð>` that screen readers say.

### C19. Skólinn, a seventh category (2026-10-16)

`content/islenskubraut/skolinn.yaml` is the language of school, drafted by Claude: things in the
school bag, subjects, instructions, where, who and when.

- **A1** names things and follows simple instructions (`lestu`, `skrifaðu`).
- **A2** adds task verbs (`lýstu`, `berðu saman`, `útskýrðu`) and asking for help.
- **B1** frames follow WIDA's four key uses (recount, explain, argue, discuss). A B1-only
  "Námsorð" question holds the twelve most frequent nouns, verbs and adjectives of LÍNO-2
  (CC BY 4.0), in MÍNO order: `hluti`, `áhrif`, `breyting`, `mikilvægur`, `einstaklingur`,
  `starf`, `auka`, `meðferð`, `heimild`, `greina`, `tengja`, `hugmynd`.

**The category is a draft (`draft: true`)**: the home page leaves it out, its card works at
`/islenskubraut/spjald/skolinn`, and `/islenskubraut/?drog` shows it in the grid. Its guessing
game, talk-to-write text, can-do statements, pictogram search words, recordings and Polish glosses
are drafts too, under C13–C18.

- [ ] **Read the card at all three levels.** Are these the right things, places and subjects for
      Kvennaskólinn? Is the list of instructions the one teachers actually use?
- [ ] **Námsorð:** keep the top twelve by frequency, or pick twelve from LÍNO-2 by hand? Words
      like `meðferð` and `heimild` are frequent across subjects but not obvious at B1. The
      research suggested 30–50; twelve fit the printed card.
- [ ] **BÍN does not know** `námsorð`, `verkefnablað` and `LÍNO` (in the B1 teacher note).
      `verkefnablað` (a headword in Íslensk nútímamálsorðabók) and `LÍNO` (the list's name) were
      accepted in `content/islenskubraut/bin/ekki-i-bin.yaml` on 2026-10-16. `námsorð` is in no
      dictionary on Málið.is, nor is `námsorðaforði`; it is LÍNO's own word, so keep it or name
      it otherwise (`orð sem eru notuð í öllum fögum`?).
- [ ] **When it is right,** delete `draft: true` from `skolinn.yaml`, and the card joins the grid.

### C20. The teachers' review pages (2026-10-16)

`/islenskubraut/yfirferd` lists everything on Íslenskubraut that waits for a teacher, card by
card. For each card it shows the card itself, the word list, the guessing game, the talk-to-write
text, the can-do statements, the sentence builder, the recordings, the links and the glosses. Each
has its state (`birt nemendum`, `staðfest` or `drög`), links that open it as a student sees it and
as it prints, and a box for a note. `/islenskubraut/yfirferd/hljod` plays every recording with
`Rétt` and `Rangt` beside it (C15). No page a student can reach links to either; they link to each
other, and `Yfirferd.test.tsx` fails if any other file in the app quotes their routes.

The notes stay in the teacher's own browser, also after they press `Sækja skrá`, which saves a
file, or `Afrita sem texta`, which copies text for an email, until they clear them. No server holds
them. Two tabs with the pages open keep each other up to date. A private window keeps them until it
is closed, and Safari on iPhone and iPad deletes them after seven days without a visit; the page
cannot tell, so it says both in any case, and it warns when the browser refuses storage outright. `pnpm islenskubraut:yfirferd <files>` prints every note by item, with the
verdicts on the recordings, and `--apply` adds them to the committed record `hljod/mat/` and
writes the values (C15). Per recording, a reviewer's latest verdict counts; pressing the pressed
button takes one back, and a mark merely missing from a later file, as after `Hreinsa allt`, still
stands from an earlier one. A teacher types a name before sending, for the report; the page also
gives each browser a random id, and the record keeps a hash of it and the name, so two teachers
of one name stay two, as do two sharing a browser, and the record names nobody.

An adversarial review of the pages on 2026-10-16 found and fixed: two tabs overwriting each other,
a double click on `Hreinsa allt` erasing the review, the "not yet marked" filter hiding a row
before its note could be written, links that opened only the A1 card for links and glosses that
differ by level, a note box that closed when emptied, pages opening scrolled to the middle, a tab
left open across a deploy going blank, and a recording marked wrong being approvable by a later
run. A second review of those fixes the same night found and fixed: a recording replaced after it
was approved still playing as approved, a conflict a person had settled being undone by the next
run, a second tab's echo swallowing keystrokes, a reload losing the reader's place on every page,
two teachers' files sharing one name, and a verdict taken back still counting. A third pass
found that deciding by when a verdict was given, against when a value was set, let a "wrong" that
arrived after an `--apply` vanish without a word; values are now worked out from all the verdicts
together, whatever order the files arrive in, and a person settles a disagreement with a ruling.
A fourth pass found that working them out from the files passed let a machine holding fewer files
approve a recording another had heard as wrong, and that a ruling lasted only for the run that
made it; the verdicts and rulings are now kept in the committed record (`hljod/mat/`), and the reviewer is
the browser, not the name typed. A fifth pass found that a git merge of two runs could still
leave `hljod.yaml` approving what the record rejected, that a ruler could never change their mind
from another browser, that a verdict on one recording of a text was overwritten by one on the next,
that a page left open across a deploy stamped verdicts with the old audio, that two reviewers'
downloads could share a name, and that the review pages lost their place after a `#card` link or
on the way back. The build now checks `hljod.yaml` against the record, the latest ruling decides,
the record keeps each recording's verdicts apart, the listening page checks the audio it plays,
the download names the browser, and the scroll keeper was fixed for both. A sixth pass found that
resolving a merge conflict by taking one side whole revived a removed ruler, lost one side's new
recordings and approvals, and could approve a remade recording nobody had heard; that Firefox
replays the previous page's copy of a clip for a while after a reload, so the audio check passed
on old audio; that a note could still be written on a remade row; that a later download from the
same browser replaced an earlier one; that the copied text could not be applied; and that the
report miscounted. Conflicts are now merged recording by recording against the base, a clip is
asked for by its version, downloads carry their time, the copied text carries the file's data,
and a dry run says whether the files' verdicts are in the record yet. A seventh pass found that a
`true` could still reach students unheard when a person took one side of a conflict whole, since
nothing in the files tells a carried-over approval from a real one; that a stale tab could still
overwrite a newer verdict before playing the clip; that the copied text broke under an email's
line wrapping, carried no data for a review of the cards alone, and lost a second copy in the same
email; and that a merge dropped the other side's voice credit and miscounted what it revoked. Now
a recording plays only with an approval of its current audio in the record, every clip address
carries its version, the copied text is base64 in short lines and always present, and a conflicted
`hljod.yaml` starts from git's own merge. An eighth pass found that taking one side of `mat.json`
whole still let a recording a teacher heard as wrong play, since the approval left was backed; that
a criss-cross merge revived a removed ruler; that a CRLF checkout could not resolve a conflict;
that a stale tab, or one still checking what it had just played, could file a verdict under the
wrong audio; that two teachers sharing a browser were one reviewer; and that the recordings sheet
still said to write `true` by hand. Now a file git holds unmerged is merged again whatever it shows,
the build refuses a merged record that lost an entry, the real merge bases stand in for git's
crossed one, a play locks its row until its audio is known, a reviewer is the browser and the
name, and approvals are given only on the listening page. A ninth pass found
that the record, a single `mat.json`, could still lose a teacher's "wrong" in a merge: where a side
held an older verdict under the same key, in a rebase or cherry-pick, and its rulers too; that a
failed or late audio check unlocked a row already found remade; and that a retyped name could not
take a mark back. The record is now a folder of files only ever added, so git never merges it;
only the latest play's check counts and a failed one changes nothing; and a browser's later
withdrawal cancels its earlier approval under any name. A tenth pass found
that a `git revert` or `merge -s ours` could still take a file of the record out, that a stale
`REBASE_HEAD` made the tools merge markers from an unrelated operation, that rulings went by each
machine's clock, and that leaving the listening page within the app forgot a remade recording. The
tools now refuse while a record file is missing, count a rebase only while it runs, stamp rulings
after the latest, and keep what plays found until a reload. An eleventh pass found that a file a
merge commit added escaped that check, that a commit dropped by `git rebase --skip` takes its files
with nothing left to say so, that a shallow clone sees only part of history, and that stamping a
ruling after the latest made two machines' rulings tie. Now the check reads merge commits, the
tools warn before a skip and refuse to add to the record while a merge, rebase, cherry-pick or
revert is open, CI checks with the whole history, and a ruling on a clock not past the latest is
refused. The level buttons on the card page also ran 2 px past a 360 px screen in a wide fallback
font (DejaVu Sans) until the web font arrived; they now share the row on a phone.

This was chosen over the spreadsheet round trip for this first review, for two reasons. The
workbook's instructions are still placeholder Icelandic (`CLAUDE.md`, "UNFINISHED"). And the
workbook carries only the card text, not the PDFs, recordings, builder or links.

- [ ] **The pages' Icelandic, drafted by Claude.** On the review page: the intro and its four
      steps, each item's one-line hint, the three states, and the sending box
      (`Senda yfirferðina`, `Sækja skrá`, `Afrita sem texta`, `Hreinsa allt`, `Hætta við` and the
      confirmation, what each says once pressed, the line on what the browser keeps, the request
      for a name, and `Dregið til baka`, `Metnar áður en …` and the line before the data in the
      copied text). On the listening page: the three paragraphs, the filters,
      `Talgervillinn segir: …`, `(merkt röng)`,
      `Í þessum vafra er mat á annarri útgáfu upptökunnar. Hlustaðu á hana hér áður en þú metur hana.` and
      `Þessi upptaka hefur verið gerð aftur síðan þú opnaðir síðuna. …`. The script's report is
      Icelandic too, and drafted the same way.
      They are the only instructions a reviewer gets, so read them as a colleague will.
- [ ] **Who reviews what?** One teacher per card, or everyone everything? The listening page
      filters by card, so a link like `/islenskubraut/yfirferd/hljod?flokkur=dyr` hands one
      reviewer one card's recordings.
- [ ] **The Polish glosses need a Polish speaker**, not an Icelandic teacher (C18). The page says
      so on that row.
- [ ] **Run the deploy check in A first**, so that every link on the page opens.

## D. Work that needs no ruling

### D1. Defects found in passing (their own PRs)

From the vertical-scroll design's §7 and the mobile-pass decisions' last section.

- [x] **The phone bottom bar's active item failed contrast**: brand orange on orange-50 is 2.9:1,
      under the 4.5:1 that 12 px text needs. Found 2026-10-16 by the first axe check run at 360 px
      (the Íslenskubraut recordings' e2e test); every earlier axe check ran at desktop width,
      where the bar is hidden. Fixed in `packages/shared/components/BottomNav.tsx` with
      `kvenno-orange-700`, as the games' orange text already uses. Only phones see the change.
- [x] **buffer Stig 1** shows a live 'Fullkomið!' pill on the pH readout that can contradict a
      'Rangt' verdict. Already fixed 2026-09-23, found 2026-10-02: the pill reads the grader's own
      `isCorrect`, and `level1-flow.test.tsx` holds it.
- [x] **equilibrium-shifter** shows 'Stig: 0' in Lærdómshamur, a score in a learning mode. This
      overlaps C3 item 1. Already gone since 2026-09-23 (`2f8340d`); with item 1 (PR #85),
      Lærdómshamur also stops keeping a hidden score and counts `N af M rétt` instead.
- [x] **lausnir** Stig 1: 'Athuga lausn' gives no feedback outside the tolerance. This is C3 item
      60, listed here because it is a plain defect. Fixed 2026-10-03: the message says which way
      the concentration is off and goes once the beaker changes, held by `phone-scroll.test.tsx`.
      Its wording is a draft.
- [x] **organic-nomenclature `AnimatedMolecule`** overlapped atoms from 4 carbons up. No longer
      reproduces, checked 2026-10-01 (PR #79): every Stig 2 molecule, branched ones included, is
      drawn with all atoms apart (tightest gap 12,8 units, hexane), and `molecule-drawing.test.tsx`
      now holds it.
- [x] **syrufastinn, leysnijafnvaegi:** `Áfram í Skilja` / `Áfram í Æfa` return to the menu
      instead of the next phase. Fixed 2026-10-02 (PR #82), held by each game's
      `phase-flow.test.tsx`.
- [x] **jafnvaegisfasti `AefaScreen.tsx`:** the KpTask `veldisvisir` message blames the wrong
      mistakes. Fixed 2026-10-02 (PR #82): neither slip it named lands there, so the message now
      names the power of ten, and `kpSlip` reads the Δn-sign and °C slips off the value and names
      them (`kp-slip.test.tsx`).
- [x] **lotukerfid `PeriodicTable.tsx`:** `role="grid"` with no rows or cells. Fixed 2026-10-02
      (PR #82): a labelled group of buttons, arrow keys unchanged.
- [x] **hess-law Stig 2 `EquationBlock`:** a `role="button"` card containing its own buttons.
      Fixed 2026-10-01 (PR #79): the card is a group, and selecting it is a real toggle button.
- [x] **vsepr `BondAngleMeasurement.tsx`:** tick labels show the half-angle. Fixed 2026-10-01
      (PR #79): the tick for an angle sits at half of it, so a bond lies on its own label.
- [x] **lewis Stig 3:** a formal charge of 0 prints as `+0`. Fixed 2026-09-30 (PR #70).
- [x] **Lewis +1 formal-charge badge** is red on a red O atom, so it is hard to see. Lewis no
      longer draws with `AnimatedMolecule` (PR #71); the shared badge now has a white ring as
      well, 2026-10-01, PR #72.
- [x] **vsepr Stig 1, the three-domain bent card** — **not a defect, retracted 2026-10-02.** The
      pyramid sentence belongs to the `trigonal-pyramidal` card two entries below; `bent-2` says
      `Stakt par ýtir bindandi pörum saman — lægra horn.`, which is right. Misread from a grep.
- [x] **`bg-kvenno-orange-dark` and `hover:bg-kvenno-orange-dark` do nothing.** No such colour
      token exists (the theme has `kvenno-orange-600`), so 77 hover states across the games never
      change colour. Found 2026-10-01; Lewis uses `kvenno-orange-600`. Fixed 2026-10-02 (PR #82):
      hover and ring `-600`, the eight text uses `-700`, held by `kvenno-orange-tokens.test.ts`.
      The text colour is a visible desktop change in `jafnvaegisfasti`.
- [x] **`gradeScientific`:** fixed 2026-10-02 (PR #82) — it reads the value the fields make, so
      a whole power of ten is the power however the fields split it; `-5,0` is read as -5; and an
      `ogilt` carries a `reason`, so the four call sites say what to fix
      (`INVALID_ENTRY_MESSAGE`).
  - it diagnoses a 10× slip as wrong digits;
  - its `ogilt` prompt could say what went wrong;
  - it rejects `-5,0` as an exponent.

  See the decisions doc's last section.

- [x] **The brand fonts never load on landing, lab-reports or the games** (found 2026-10-10, with
      D3). `theme.css` names DM Sans and Plus Jakarta Sans, and `apps/landing/src/index.css`,
      `apps/lab-reports/src/index.css` and `packages/shared/styles/game-base.css` import them from
      Google, but each `@import url(…)` comes after other rules, so the build drops it: the landing
      bundle's CSS holds no import at all. Every page has shown the system font. The CSP would
      block Google anyway. Íslenskubraut now bundles both from `@fontsource`; doing the same
      elsewhere changes how every page looks, so `desktop-compare` will report every game. The
      alternative is to drop the two names from `theme.css` and keep the system font on purpose.
      — 2026-10-24, the alternative, since CLAUDE.md's design system says "System font stack":
      the three Google imports are gone, the shared tokens and `game-base.css` name the system
      font, and Íslenskubraut sets the two names in its own `index.css` beside the fonts it
      bundles. No page changes, since none ever loaded them. `system-font.test.ts` holds it.

### D2. Operations and tooling

- [x] **`deploy.sh` never installs `server/nginx-site.conf`.** Either document the manual step in
      `docs/DEPLOYMENT.md`, or add an opt-in step to the script. Documented 2026-10-02 (PR #82).
- [ ] **The docs disagree on the nginx site filename:** `README.md` says `kvenno`,
      `docs/DEPLOYMENT.md` says `kvenno.app`. Fix them to match whatever the server actually uses.
      2026-10-03: `README.md` now says `kvenno.app`, as `server/nginx-site.conf`'s own header,
      `server/README.md` and `docs/DEPLOYMENT.md` do. Nobody has looked at the server, so tick
      this when the A-section redirect check reads the live filename.
- [x] **The three 3D games' unhashed `{game}.js`/`{game}.css` are cached for a year.** Hash them,
      or give them a short cache header. Hashed 2026-10-02 (PR #82), under `assets/{game}/`.
- [x] **pnpm 9.15 → current:** 12.8.1, 2026-09-29, PR #69. It needed `allowBuilds` for esbuild
      and unrs-resolver. `pnpm deploy` still bundles the backend.
- [x] **`scripts/desktop-compare.mjs` is not in CI.** It needs a base build in the same job, and a
      mask for the animated states: buffer Stig 2, vsepr Stig 2, the redox galvanic cell. In CI
      from 2026-10-03 as the `desktop-compare` job: a report in the job summary, not a gate,
      since a content change moves desktop geometry on purpose. A build compared with itself
      differed at 9 of 370 states (PR #83); with the running animations marked `data-live`, SVG
      `<animate>` stripped before capture, and pixels off by at most 16/255 counted as
      anti-aliasing (an input border in redox Stig 3 differed by 11/255 under load), it differs
      at 0 to 1 (nafnakerfid Stig 2, under load).
- [x] **`e2e/` has no `tsconfig`**, so `pnpm type-check` does not cover the specs. Added
      2026-10-02 (PR #82); `pnpm type-check` now runs it, and the specs were already clean.
- [x] **First BÍN lookup.** Done 2026-10-09 (PRs #92, #93), from a cloud session that could now
      reach `bin.arnastofnun.is`; `content/islenskubraut/bin/ordmyndir.json` is committed.
  - The live API answers an unknown form with HTTP 200 and `{"0":""}`, which the documentation
    does not mention; the first run stopped at `umar` until #92 read it as not found.
    The forms field is `bmyndir`, as the documentation's example says.
  - It flagged `endurunnru` and `hálkt`, now `endurunnu` and `hált` (BÍN's neuter dative of
    `endurunninn` and neuter of `háll`). It passed `mjallar` and `súðar` as real forms of
    `mjöll` and `súð`: a check of forms cannot see a real word in the wrong place. In a list of
    animal sounds they are now `mjálmar` and `suðar`. `gelur` is right (`gala`, as a cock
    crows). Siggi confirmed all four the same day.
  - Eight words were left unknown to BÍN-kjarninn. Three sound words were removed the same day;
    five compounds remain (D3's "Words and grammar" item). The check exits 1 until a person
    settles them, which matters only if C7 gates CI on it.
  - [x] **BÍN's licence** — 2026-10-09, supplied by Siggi: CC BY-SA 4.0, and the terms of use
        say not to change the data and to name it as from Beygingarlýsing íslensks
        nútímamáls, owned by Stofnun Árna Magnússonar í íslenskum fræðum. The saved lookups
        carry both statements (`_heimild`, `_leyfi`), and `content/islenskubraut/bin/README.md`
        marks that file as CC BY-SA in an otherwise MIT repo. Nothing a student sees uses BÍN
        data yet, so no page or PDF needs the attribution yet. C7 covers the cards.

### D3. Íslenskubraut review (2026-10-09)

A full review of the app, its content and its PDFs. The levels question is C8 and the grammar work
is C7; everything else is here. All 18 PDFs were generated and read for this. Content fixes change
what students read, so an Icelandic teacher should confirm the new wording in the same PR.

**Content (`content/islenskubraut/*.yaml`)**

Applied 2026-10-10 (PR for this branch). An Icelandic teacher still has to confirm the new
wording, item by item below. Siggi looked up the new words in BÍN on 2026-10-10 (98 forms,
from the content fixes and the examples and notes). BÍN knew all but one, `setningaramma`, which
joins the list of probably-right compounds below.

- [x] **Frames copied into categories they do not fit.** Manneskja no longer treats a person as
      an object: `Maður notar það til að ___.` is gone, `Maður finnur það ___.` is
      `Hún/Hann er oft ___.`, `Maður notar það ___.` is gone, and
      `Það er oftast notað af ___ til að ___.` is `Hún/Hann er oft ___ vegna þess að ___.`
      Its `Fyrir hvað er manneskjan þekkt?` is now `Hvað gerir hún/hann?`, answered with
      `vinnur`, `lærir`, `leikur sér`, `syngur`, `læknar`, `kennir`, `stjórnar`, `skapar`, which
      also fill A1's `Hún/Hann ___.` Staðir's touch frame is
      `Mér finnst þetta ___ vegna þess að ___.` The repeated A1 `Það er ___.` is gone from Dýr,
      Matur and Klæðnaður.
  - **Left as it was:** Dýr's `Maður notar það ___.` It matches the card's own question
    `Til hvers er það notað?`; whether animals should be asked about at all in terms of use is
    a teaching call.
- [ ] **Words and grammar that look wrong.** The first BÍN run (D2, 2026-10-09) settled part of
      this, and the rest was fixed 2026-10-10.
  - **Fixed, and confirmed by Siggi 2026-10-09:** `endurunnru` → `endurunnu` (three categories),
    `hálkt` → `hált` (Matur, Klæðnaður), and in the sound lists `mjallar` → `mjálmar` and
    `súðar` → `suðar` (Dýr; `suðar` in Farartæki too). The first two are BÍN's forms; the
    last two were real forms of the wrong words, so BÍN alone could not have caught them.
  - **Removed 2026-10-09, Siggi's call:** the sound words `umar`, `dúnar` and `þrymir` (Dýr and
    Farartæki, B1). BÍN knew none of them and which word was meant was unclear.
  - **Fixed 2026-10-10, to confirm:** `Hvenær er þetta sést?` → `Hvenær sést þetta?`,
    `í hátíðum` → `á hátíðum` (five categories), `í sérstakar tilefni` →
    `við sérstök tilefni`, `pilsið` → `pils`, and `sælgæti-sætt` → `mjög sætt`.
  - **Not in BÍN-kjarninn, probably right:** `lestarbraut`, `sportvagn`, `sívalningslaga`,
    `straumlínulaga` and `þríhyrningslaga` (the last is in `ordabok.md`'s chemistry terms), and
    since 2026-10-10 `setningaramma` (B1 teacher note in all six; the app's own tab is
    `Setningarammar`). Each part is in BÍN. A person who has checked them lists them in
    `bin/ekki-i-bin.yaml` with a reason.
  - **Checked on Málið.is, 2026-10-16:** `sívalningslaga`, `straumlínulaga` and
    `þríhyrningslaga` are headwords in Íslensk nútímamálsorðabók and are now accepted. The rest
    are not, and each needs a person:
    - `á lestarbraut` (Farartæki): `lestabraut` is only in Blöndal, while `járnbraut` is in 18
      sources. `á teinum` or `á járnbraut`?
    - `sportvagn` (Farartæki): in no dictionary. `sporvagn` (a tram, 17 sources) or `sportbíll`
      (16) was probably meant; they are different things.
    - `setningaramma` (B1 teacher note in six categories): `setningarammi` is in no dictionary,
      though the app's own tab says `Setningarammar`. Keep it, or accept it with a reason.
- [x] **The shape question is not about shape.** Now shapes only, in all five categories: A1
      `kringlótt`, `ferkantað`, `ílangt`, `flatt`; A2 adds `kúlulaga`, `oddhvasst`, `bogið`,
      `beint`; B1 adds `sporöskjulaga`, `þríhyrningslaga`, `sívalningslaga`, `óreglulegt`. Size
      stays where it already was, in each card's size and looks lists. Farartæki's looks
      question has `ferkantað` for `fernt` and `litríkt` for `hraðvirkt`, and its Eiginleikar
      list `hraðskreitt`/`hægfara` for `hraðvirkt`/`hægvirkt`.
- [x] **Chips repeat what the frame already says.** Where the chips carry the word, the frame
      gives it up: `Það er gert ___.` in Farartæki, Staðir and Klæðnaður, whose chips read
      `úr málmi`; frames end `notað ___` and `fer þangað ___` where the chips read `til að …`;
      Klæðnaður B1 is `Þetta er ___ sem er ___. Maður notar það ___.` The old
      `Það er oftast notað af ___ til að ___.` needed the dative of its who-chips and is now
      `___ nota það oftast ___.`, which takes them as written. Matur keeps `gert úr ___`: it has
      no `úr` chips. Dýr's vocabulary page drops the frame's verb from its chips (`feld`, not
      `hefur feld`; `plöntur (grasæta)`, not `étur plöntur`), with `flýgur`, `syndir`,
      `hleypur` moved to a new `Hreyfing` list, and Farartæki's `hefur hjól` is `hjól`.
  - **Not done here, C7's:** the question cards still give nouns in the nominative
    (`feldur`, `fjórir fætur`) where the frames want another case.
- [x] **Colours and other adjectives offer no feminine form.** Klæðnaður's colours are
      `rauður/rauð/rautt` and so on, with a new `Litur í fleirtölu` list (`rauðir/rauðar`) for
      `buxur`, `sokkar`, `skór` and `hanskar`. Manneskja's one-gender adjectives got the other
      (`látin/látinn`, `fræg/frægur`, `fullorðin/fullorðinn`, `sköllótt/sköllóttur`, and
      `öldruð/aldraður` in the fem/masc order the rest use); Staðir's size is
      `lítill/lítil/lítið`. Neuter-only adjectives that describe `það` (Dýr, Matur) are C7's.

**Examples and teacher notes**

- [x] **Move the examples (`Dæmi`) and teacher notes into the YAML.** Done 2026-10-10: each
      category's YAML now has `examples` and `teacherNotes`, one per level, and the loader
      refuses a missing or empty one. The SPA and the PDF read them from there, so the
      spreadsheet review (`Dæmi`, `Fyrir kennara` rows) and the BÍN check see them too.
      Corrected on the way, for a teacher to confirm: `delfínn` → `höfrungur`, `ólíkt fisk` →
      `ólíkt fiski`, `mynduleg` → `myndarleg`, `flugvél sem er notað` → `notuð`, and the
      pronoun now follows the noun (`Þetta er úlpa. Hún er blá.`, `peysa … klæðist henni`,
      `jakki … Hann er svartur`, `ávöxtur … Hann er sætur`, `bíll … Hann er stór`). Klæðnaður B1
      follows its new frame (`Þetta er jakki sem er úr leðri. Maður notar hann …`). The A1 note
      gains one sentence on the pronoun, since the examples now show it.
- [x] **Take the teacher note off the student card.** Done 2026-10-10: the PDF no longer prints
      it, and the web page shows it below the card, marked as not printed. The notes still read
      the same in all six categories; each category now has its own copy, so a teacher can make
      them specific there.

**PDF and preview**

- [x] **`Efniviður` printed as `fniviður`** on nine cards: Farartæki, Staðir and Klæðnaður at every
      level, in the label beside `Úr hverju er það gert?`. Found 2026-10-16 by comparing every
      string on every card with the text react-pdf writes. **Fixed 2026-10-16.**
  - The cause was not the label, the content or the font format. It was rendering one PDF after
    another in the same process. react-pdf keeps one font object per file, and a document set
    after another could lose a capital from the page and the text layer. Rendered alone, every
    card was whole, which is why the defect would not reproduce in a small document.
  - The talk-to-write sheets showed it too (`Ullin` → `llin`). `renderPdf` in
    `server/src/lib/islenskubraut-pdf.tsx` now reloads the fonts for each document, and every
    PDF goes through it. A test draws `Ullin`, `Um`, `Efniviður` and `Uxi` after a card and
    counts the glyphs; it fails without the reload.
  - Every word of all 72 PDFs now matches its text layer (5,386 words, checked with `pdftotext`).
    The bold `syndir` that lost its `s` and the bold `y` written wrongly into the text layer were
    most likely the same defect: the bold card questions with `lyktar` now extract whole. The
    word lists stay in regular weight, which costs nothing.
- [x] **10 of the 18 PDFs ran onto a fourth page**: A2 and B1 in every category but Manneskja,
      with the question card's second row of context boxes split from their words. Fixed
      2026-10-10 in `server/src/lib/islenskubraut-pdf.tsx`: each question's label sits beside it
      rather than under it, context answers wrap as a line instead of one per line, the question
      page's header is smaller, and no question, context box, word group or frame is split across
      a page break (`wrap: false`). `islenskubraut-pdf.test.ts` holds all 18 to three pages; it
      fails on exactly those 10 against the old renderer. Also fixed while there: react-pdf
      hyphenated words at line ends (`sér-` / `fræðingar`), which a learner reads as two words.
      It now never breaks a word.
- [x] **The vocabulary page filled half of A4 at 10 pt.** Its words are 12 pt now, in larger chips,
      and Klæðnaður's seven word groups still fit one page. 13 pt did not.
- [x] **Pre-render the 18 PDFs at build time.** Done 2026-10-11 (PR for this branch).
      `server/src/scripts/render-spjold.ts` (`pnpm islenskubraut:spjold`) writes every card to
      `apps/islenskubraut/public/spjold/`, gitignored, before the app's `dev` and `build`, so
      they ship as `dist/islenskubraut/spjold/spjald-<flokkur>-<stig>.pdf`. The build fails on a
      card that is not three pages. The button is a plain link with `download`; the app no
      longer calls the backend, and its dev proxy is gone. An e2e test downloads a card through
      the link and fetches all 18, with a missing one answering 404.
  - [x] **After the deploy that carries it, install `server/nginx-site.conf`** — done by
        2026-10-18 (A: the config is installed and all 105 PDFs under `spjold/` answer 200)
        (`deploy.sh` does not install it): it adds `location ^~ /islenskubraut/spjold/`, which revalidates the cards
        rather than caching them and answers a missing one with 404 instead of the app's
        `index.html`. The download works without it, through the `/islenskubraut/` location.
        Then, on https://kvenno.app/islenskubraut/, download one card and check it opens.
  - [x] **Remove `GET /api/islenskubraut/pdf`** once that deploy is live — done 2026-10-24, the
        PR carrying this entry, with its rate limiter and query type. Nothing in the app had
        called it since 2026-10-11, and the 2026-10-18 check (A) showed the static cards live.
- [x] **The preview does not match the PDF.** Done 2026-10-11 (PR for this branch). The tabs
      follow the PDF's pages, `Orðaforði`, `Setningarammar`, `Spurningaspjald`, and the page
      opens on page 1, where it used to open on the question card, the PDF's last page. Each
      sheet is drawn by one `Sheet` frame with the PDF's header and footer, captioned
      `Bls. 1 af 3`, and is A4 at least: content grows the sheet instead of scrolling inside
      it. The question card puts each label beside its question and runs context answers on one
      line, as the PDF does; emoji, which the PDF cannot print, are gone from inside the sheets.
      `preview-matches-pdf.test.tsx` renders all 18 cards both ways and requires every string
      each PDF page prints to appear on its web sheet in the same order; it fails on 18 of 18
      against the old question card.
  - **Siggi's to confirm:** opening on page 1 rather than on the question card. The order is
    one line in `SpjaldPage.tsx`, and the PDF's order could change instead.

**Accessibility and UX (`apps/islenskubraut/`)**

All five fixed 2026-10-10 (PR for this branch).

- [x] **Contrast below WCAG AA.** White on Klæðnaður `#F4A261` was 2,1:1 and on Matur `#E76F51`
      3,1:1, and axe found 63 more failures across the pages. Klæðnaður is now `#A6500C` and Matur
      `#BF3B1A`, the least darkening of each hue that carries white text and its own tinted chips
      at 4,5:1; the other four already passed. The context colours are the `-700` shades, on the web
      and in the PDF. The card text drops its white-on-white washes (`text-white/80`, the `CC`
      subheader, the `bg-white/20` level badge), the grey and warm text on the cards and buttons
      is one shade darker, and the shared header's active track tab is `kvenno-orange-700`.
      `e2e/islenskubraut-a11y.spec.ts` runs axe (WCAG 2.1 AA) on the home page and on every tab of
      every category, with the real header, fonts and colours; it fails on 7 of 7 pages against
      the old code. **Siggi to confirm the two new category colours**, which also print on the
      PDFs.
- [x] **Level and tab buttons do not expose their state.** The level buttons are a labelled group
      with `aria-pressed`; the views are a `tablist` of `tab`s with `aria-selected`, one
      `tabpanel`, and arrow keys, Home and End between them.
- [x] **Put the level in the URL.** `/spjald/dyr?stig=B1` opens at B1, and choosing a level
      writes it there (replacing the history entry, so Back still leaves the page). An unknown
      level falls back to A1.
- [x] **Google Fonts are imported in `src/index.css`.** They never loaded, CSP or not: the
      `@import url(…)` comes after other rules, so the build drops it, and the app has always shown
      the system font. DM Sans and Plus Jakarta Sans are now bundled from `@fontsource` (Latin
      subset, 84 KB of woff2), so Íslenskubraut shows its fonts for the first time; an e2e test
      asserts both load with every off-site request refused. The same import is dead in landing,
      lab-reports and the games (D1).
- [x] **Download errors use `alert()`.** The error now shows below the button in a live region,
      and the file is saved as `spjald-dyr-A1.pdf`, the name the server gives it.
      Since 2026-10-11 the button is a link to a static file, so there is no request to fail.

**Code**

Both fixed 2026-10-10 (PR for this branch).

- [x] **Which questions are "context" (the coloured boxes) is decided by their emoji.** Each
      question in the YAML now says which it is: a main question carries `label: Útlit`, a
      context question `context: hvar` (or `hvenaer`, `hver`, `notagildi`), and the loader refuses
      one with neither or both. The four colours are set once, in `CONTEXT_COLORS` in
      `scripts/islenskubraut/load.mjs`, and reach both renderers through the generated data. Every
      question kept the role its emoji gave it, so no card changed; that includes Manneskja's
      `Hvað gerir hún/hann?`, which stays a context box (`notagildi`) and could as well be a main
      question. The labels are now words the BÍN check reads, and three of them (`Flokkar`,
      `Lykt`, `Efniviður`) need a `--fetch`. The spreadsheet carries them as it carries icons:
      from the YAML, not as editable rows.
- [x] **Smaller items.** The home grid adds rows as needed (`sm:auto-rows-fr`). The types are
      generated once into both `apps/islenskubraut/src/data/types.ts` and
      `server/src/types/islenskubraut.ts`, and a test holds the two identical; the server's
      `CEFRLevel` is `Level`, as in the app. The PDF renderer is JSX, and its test now calls the
      renderer's components, so it checks every question and label the card prints. The README
      no longer says `data/index.ts` is edited by hand. Also fixed in the PDF while there: the
      vocabulary page's faded subheaders, the white-on-white level badge and the grey footer were
      below 4,5:1, as they were on the web (accessibility, above).

**Features (larger, each its own PR)**

- [ ] **Sentence builder for students**: pick a frame, tap words, get the correctly inflected
      sentence. A1 only, a page of its own per category. In two PRs:
  - [x] Data and engine (2026-10-11): the drafted tags in the YAML (C9), BÍN's inflection
        tables in `content/islenskubraut/bin/beygingar.json` (fetched by
        `pnpm islenskubraut:bin --fetch`), the grammar in `scripts/islenskubraut/smidur.mjs`, and
        `pnpm islenskubraut:smidur` to print every sentence for review.
  - [x] The inflection tables, fetched and committed (2026-10-11). `smidur.test.ts` now builds
        every sentence from them, so a tag or word added without a `--fetch` fails CI.
  - [x] The student page, `/islenskubraut/smidur/:flokkur`, with BÍN's attribution (2026-10-11).
        It shows "Drög" and the card page does not link to it until a level's YAML says
        `confirmed: true`, which is C9's sign-off.
- [ ] **Picture support**: a printable picture set per category, and pictograms on the A1 chips.
      ARASAAC, chosen 2026-10-11 (C10).
  - [x] The A1 chips on the website (2026-10-11): the question card's chips and the sentence
        builder's, with ARASAAC's credit. `pnpm islenskubraut:myndir` fetches, checks and writes
        the review sheet. No picture shows until it is fetched and approved (C10).
  - [ ] The printed A1 cards, once the pairings are approved and C10's licence point is settled.
  - [ ] A printable picture set per category (picture and word, for flashcards).
  - [ ] The vocabulary page's chips (about 150 more words, mostly nouns).
- [ ] **A teacher sheet per category** with activities (guessing games, pair work), replacing the
      note on the student card.
- [ ] **Optional glosses in learners' languages.** Needs a decision on who writes and checks them.
- [ ] **The 2026-10-16 research on next additions**, in
      [`docs/research/islenskubraut-additions/`](research/islenskubraut-additions/README.md).
      It ranks nine additions by value per teacher hour: links out, word sheets, information-gap
      cards, talk-to-write sheets, audio, can-do strips, visible grammar, L1 glosses, and a
      "Skólinn" category. The two items above (the teacher sheet and the glosses) are its items 3
      and 8. Its thirteen open checks are listed there. Two of them needed Siggi: asking Tiro or Almannarómur where the Icelandic TTS service went
      (no longer needed: the voices used in item 5 are open, 2026-10-16) and asking MEMM to list
      Íslenskubraut on its Námsefni page
  - [x] Item 1, a links panel per card and level (2026-10-16). Its links await approval (C11).
  - [x] Item 2, a word list per card and level (2026-10-16). Its wording awaits review (C12).
  - [x] Item 3, a guessing game per card and level (2026-10-16). Its items and wording await
        review (C13).
  - [x] Item 4, a talk-to-write sheet per card and level (2026-10-16). Its texts and wording
        await review (C14).
  - [x] Item 5, a recording of every word, frame and example on the card page (2026-10-16). The
        recordings await a listener (C15); the QR codes wait for them.
  - [x] Item 6, can-do strips and a class checklist per card and level (2026-10-16). The
        statements await review, and the level labels a ruling (C16).
  - [x] Item 7, reasons, word tables and a drill on the sentence builder (2026-10-16). They go
        live with the builder (C9); the wording is C17.
  - [x] Item 8, a student's own language beside the chips (2026-10-16). Polish is drafted with a
        dictionary link; who checks it is C18.
  - [x] Item 9, the Skólinn category (2026-10-16), a draft kept off the home page until it is
        read (C19).

### D4. Security inspection (2026-10-23)

An inspection of all the owner's repos after the October alerts (PHP2Shell, Node2Shell, the
eMudhra CA keys). Its report went to Siggi, not into the repo; the kvenno-app items are here.

- [x] **Node on the host to 22.23.4+** (Node2Shell, CVE-2026-111497): done 2026-10-23 by Siggi.
      Express 5's body parsers decoded `Content-Encoding: br` request bodies from anyone, before
      any check; kvenno-backend and ritstjorn share the host's `/usr/bin/node`.
- [x] **Refuse compressed request bodies** in the backend (415, before parsing; both parsers
      `inflate: false`); run LibreOffice and pandoc without the server's environment, so the
      Claude key is not inherited; give pandoc a 30 s timeout; `permissions: contents: read` in
      CI; `qs` 6.16.1, `proxy-addr` 2.0.8, `ip-address` 10.7.4. 2026-10-23, the PR carrying this
      entry. The nginx copy of the refusal is a hand step in A.
- [x] **The Claude endpoints check no login.** `/api/analyze`, `/api/analyze-2ar` and
      `/api/process-document` accepted anyone who sent `Origin: https://kvenno.app`, so the key was
      an open Claude Opus proxy (10 requests a minute per IP). Fixed 2026-10-24, the PR carrying
      this entry: the lab-reports app sends its MSAL ID token (`utils/authToken.ts`) and the server
      verifies it (`server/src/lib/auth.ts`: RS256 against the tenant's published keys, `aud` = the
      client ID, `iss` and `tid` = the tenant, `exp`/`nbf` with five minutes' drift). No new
      dependency; `auth.test.ts` covers forged, expired, foreign and unsigned tokens.
  - [ ] **Before deploying it**, add to `server/.env` on the host
        `AZURE_TENANT_ID=` and `AZURE_CLIENT_ID=`, the same values as `VITE_AZURE_TENANT_ID` and
        `VITE_AZURE_CLIENT_ID` in `apps/lab-reports/.env`. Without them the server fails closed:
        lab reports answer 503 for everyone (logged at startup as `[auth] AZURE_TENANT_ID …`).
  - [ ] **After deploying it**, sign in on `/efnafraedi/2-ar/lab-reports/` and analyse one report
        (and one `.docx`, which goes through `/api/process-document`). Then
        `curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Origin: https://kvenno.app' -H 'Content-Type: application/json' -d '{}' https://kvenno.app/api/analyze-2ar`
        should print 401 (it printed 400 before).
  - [ ] **The two error messages a student may see** were drafted by Claude
        (`apps/lab-reports/src/utils/authToken.ts`): `Innskráning fannst ekki. Endurhlaðið síðuna
        og skráið ykkur inn.` and `Innskráningin er útrunnin. Skráið ykkur inn aftur.`; the
        server's are `Innskráning þarf — skráðu þig inn aftur` (401) and `Innskráning er ekki
        stillt á þjóninum` (503). Read them once.
- [ ] **Spend limit and usage alerts on the Anthropic key** (hand, Anthropic Console), and a look
      at usage since November 2025: the older LabReports backend, with no origin check or rate
      limit, probably served the site until the 2026-08-15 switch (commit `2538c79`).
- [ ] **Old copies of the key on the host:** `/home/siggi/repos/LabReports/server/.env` and
      `/var/www/labreports/server/.env`, if they still exist (the old guide set one to
      `chmod 644`). Delete the old checkouts.
- [ ] **Voice-tool venv** (`content/islenskubraut/hljod/README.md`): it pins `pip<24.1`, whose
      CA bundle predates the eMudhra fix, so run `pip install -U "certifi>=2026.10.19"` there
      before the next model download; pin `revision=` in `talgerving.py` and `hlustun.py`.
- [x] **Small things:** `server_tokens off;` in nginx; `/api/` responses carry nginx's and
      helmet's headers twice (`X-Frame-Options` both `SAMEORIGIN` and `DENY`). Fixed in
      `server/nginx-site.conf` 2026-10-24, the PR carrying this entry: `server_tokens off` in both
      server blocks, and `/api/` hides helmet's five copies (`proxy_hide_header`) so nginx's
      server-level ones are the only ones sent. `nginx-config.test.ts` holds both.
  - [ ] **Install the config on the host** (`deploy.sh` does not), then check:
        `curl -sI https://kvenno.app/ | grep -i '^server'` reads `nginx` with no version, and
        `curl -sI https://kvenno.app/health | grep -ci '^x-frame-options'` prints 1.
- [x] **Dependency updates were never automated:** no Dependabot pull request had ever been
      opened. `.github/dependabot.yml` added 2026-10-24, the PR carrying this entry: a weekly
      pull request each for the pnpm workspace and the GitHub Actions, minor and patch updates
      grouped, every major update on its own.
  - [x] **Turn on Dependabot alerts and security updates** (hand, repo Settings → Code security)
        — done 2026-10-24 by Siggi. Read any open alerts there. The config file covers version updates only; alerts are
        not visible from a cloud session. If the first npm pull request fails to update the
        lockfile, Dependabot may not yet support pnpm 12 (`packageManager` in `package.json`).
