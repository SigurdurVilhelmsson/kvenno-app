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
      returning browser can run the old bundle. See D for the lasting fix. **Moot from the deploy
      that carries PR #82**: the entry is hashed there, so new HTML names a file no browser has
      cached.
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

- [ ] 1–11 Platform-wide. All eleven are now applied. Items 1, 2 and 9 were applied
      2026-10-03 in every game they name (PR #85); items 3–8, 10 and 11 earlier. Still open:
      item 5's feedback wording is a draft, and its trailing-text strictness was not ruled. Item
      1's judgement calls are listed below, under "Item 1 as applied".
- [ ] 12–21 Terminology that spans games. Item 20 done 2026-10-01 (PRs #72, #73); items 14,
      15, 16, 17, 18, 19 and 21 done 2026-10-02; item 12 done 2026-10-03 (PR #85). Item 13
      left.
- [ ] 22–34 dimensional-analysis. Items 22, 23 and 33 done 2026-10-02.
- [x] 35 lotukerfid — done 2026-10-02
- [ ] 36–41 nafnakerfid. Item 39 done 2026-10-02.
- [ ] 42–45 molmassi
- [ ] 46–47 reynsluformulur. Item 46 done 2026-10-02.
- [ ] 48–49 stilla-efnajofnur. Item 48 done 2026-10-02.
- [ ] 50–53 utfellingarhvorf
- [ ] 54–57 takmarkandi. Item 54 done 2026-10-03 with item 1 (PR #85).
- [ ] 58–60 lausnir. Item 58 done 2026-10-03 with item 1 (PR #85). Item 60 done 2026-10-03: a wrong `Athuga lausn` says whether the
      concentration is too low or too high and points at the readout's arrows. The wording is a
      Claude draft, yours to change (`Level1.tsx`, the `missShown` block).
- [ ] 61–62 einingakedjan
- [ ] 63–64 rafeindabygging. Items 63 and 64 done 2026-10-01.
- [x] 65–66 lewis-structures — done 2026-09-30 (PR #70)
- [ ] 67–71 vsepr-geometry. All five applied 2026-10-01; confirm 70's angle sets.
- [ ] 72–74 intermolecular-forces. Items 72 and 74 done 2026-10-01; 73 left.
- [ ] 75–79 hess-law. Items 75, 76, 77 and 79 done 2026-10-01; 78 left.
- [x] 80–82 kinetics. Item 82 done 2026-10-01; item 81's `stig efnahvarfs` done 2026-10-03
      with item 1 (PR #85). Item 80 was applied 2026-10-01.
- [ ] 83–88 redox-reactions. Items 83, 85, 86, 87 and 88 done 2026-10-01; 84 left.
- [ ] 89–92 organic-nomenclature. Items 90, 91 and 92 done 2026-10-01; 89 left.
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

#### Item 1 as applied (2026-10-03, PR #85): confirm or change

Applying item 1 in seventeen games needed calls the ruling did not make. Each is reversible.

- [ ] **Levels that cannot end wrong report completion, not a count** (as item 23 did):
      `lausnir` Stig 1 (`Þú kláraðir öll 6 verkefnin`) and all three `buffer-recipe-creator`
      levels (`✓ Lokið`). Buffer's Stig 2 and 3 steps can be answered wrong before the student
      moves on, but a retried right answer counts, so a count would always be full.
- [ ] **An answer the game had already printed does not count after a retry:** `redox-reactions`
      Stig 1, `nafnakerfid` Stig 3, `takmarkandi` Stig 3 (item 54), `organic-nomenclature` Stig 2,
      `hess-law` Stig 1, `ph-titration` Stig 2. The other way out is to hide the answer while a
      retry is on offer, which would let retries count.
- [ ] **Hints that state the answer still count** (item 2 says hints never change a count):
      VSEPR Stig 2's second tier (`horn nálægt X`), gas-law's last practice hint,
      equilibrium-shifter's fourth tier. Count them as a revealed answer instead?
- [ ] **`redox-reactions` Stig 2 content change:** the diagram labelled `Cl afoxast` from the first
      answer on, so `Hvað afoxast?` was asked under its own answer. The labels now appear after
      the second answer.
- [ ] **Practice became rounds** in `gas-law-challenge` (13, 6, 4 questions on Stig 1–3) and
      `thermodynamics-predictor` (10, 12, 8 on Auðvelt–Erfitt), so there is an end to report
      `N af M rétt` at; the best round is kept, and a round left early saves nothing.
      Keppnishamur keeps its points and now starts every run at 0.
- [ ] **What is counted:** VSEPR Stig 2 counts its three graded steps per molecule (30), not the
      written explanation, which is checked only for length; `organic-nomenclature` Stig 2 keeps
      its two modes' best as one right/total pair.
- [ ] **Einingagreining Stig 2 and 3 end without `N af M rétt`,** because their mastery gate
      (items 30 and 31) could contradict a count. `molmassi` Stig 2 keeps its 6/10 gate (item 42
      is unruled).
- [ ] **Wording to confirm:** `Stigi 3 lokið`, `Þú kláraðir öll 6 verkefnin` (lausnir);
      `N af 15 skrefum rétt` (takmarkandi); `Stig í [A]:` (kinetics' rate-law rows; questions use
      the book's `stig með tilliti til A`); `Met á Stigi N`, `Keppnismet`, `Æfingu lokið`,
      `Æfa stigið aftur`, `Lærdómshamur, síðasta lota` (gas-law, thermodynamics,
      equilibrium-shifter); `Framvinda: N af 3 stigum lokið`. The new en/pl strings in
      `lausnir`, `nafnakerfid` and `redox-reactions` (`z`, `poprawnie`, `Ukończono`) are drafts.

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
- [x] **molmassi names HCl `Saltsýra`** (a solution) while quoting the compound's molar mass. See
      also C3 item 14. — 2026-10-02: now `Vetnisklóríð`, a gas, and in the molar-volume pool.
- [ ] **Two-word vs solid spellings.** `nettójónajafna` against the book's glossary `nettó
jónajafna`, and `prósentuheimtur` against `heimtur í prósentum`. Solid forms were taken.
- [ ] **Two glossary forms whose paragraphs disagree:** `ferflötungur` and `eðalgas`. These are
      C4 items 123 and 124.
- [x] **The water-gas reaction's name** (`Vatnsgashvarfið`). The corpus cannot settle it. Same as C3
      item 19. — 2026-10-02: the compound, confirmed; a `governed-terms` row bans the split.
- [ ] **equilibrium-shifter's ten systems with no sourced constant.** Sourcing them would need the
      Icelandic book's complex-ion constants (`m68869`), which is a new source.
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
      blank takes. That tagging is a teaching call, per frame.
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

## D. Work that needs no ruling

### D1. Defects found in passing (their own PRs)

From the vertical-scroll design's §7 and the mobile-pass decisions' last section.

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
wording, item by item below. The words it introduced have not been looked up in BÍN: run
`pnpm islenskubraut:bin --fetch` (45 new forms, among them `ferkantað`, `ílangt`, `kúlulaga`,
`oddhvasst`, `hraðskreitt`, `hægfara`, `litríkt` and the new feminine and plural adjectives).

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
    `straumlínulaga` and `þríhyrningslaga` (the last is in `ordabok.md`'s chemistry terms). Each
    part is in BÍN. A person who has checked them lists them in `bin/ekki-i-bin.yaml` with a
    reason; Íslensk nútímamálsorðabók was not reachable from the session to do it.
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

- [ ] **Move the examples (`Dæmi`) and teacher notes into the YAML.** They are hard-coded twice,
      in `apps/islenskubraut/src/components/SpjaldPreview.tsx` and as `\u` escapes in
      `server/src/lib/islenskubraut-pdf.tsx`, so neither the spreadsheet review nor the BÍN check
      sees them. They hold the most errors: `delfínn` → `höfrungur`, `ólíkt fisk` → `ólíkt fiski`,
      `mynduleg` → `myndarleg`, `flugvél sem er notað` → `notuð`, and pronouns that ignore the
      noun's gender (`Þetta er úlpa. Það er blátt.`, `peysa … klæðist því`,
      `jakki … Það er svart`, `ávöxtur … Það er sætt`).
- [ ] **Take the teacher note off the student card.** The PDF prints `Fyrir kennara` on the sheet
      students laminate, and the note is the same in all six categories.

**PDF and preview**

- [ ] **10 of the 18 PDFs run onto a fourth page**: A2 and B1 in every category but Manneskja. The
      question card overflows, and the second row of context boxes splits, with their coloured
      headers at the foot of page 3 and their words on page 4. Make each page fit, keep a box from
      splitting across a page break, and add a test that every PDF is three pages.
- [ ] **The vocabulary page fills half of A4 at 10 pt.** Larger type for laminated cards.
- [ ] **Pre-render the 18 PDFs at build time** and serve them as static files. Each depends only
      on category and level. It removes the backend from the download (the failures behind PRs
      #87–#89), lets the button become a plain link, and lets CI run the three-page test.
- [ ] **The preview does not match the PDF.** Different page order, and the preview's fixed-ratio
      boxes scroll inside themselves instead of showing where the page overflows.

**Accessibility and UX (`apps/islenskubraut/`)**

- [ ] **Contrast below WCAG AA.** White on Klæðnaður `#F4A261` is 2,1:1 and on Matur `#E76F51`
      3,1:1 (home card, page header, download button); the orange chip text on Klæðnaður is 2,0:1,
      in the PDF too; the green and orange context headers are 3,3:1 and 3,6:1 for small text.
      `a11y.test.tsx` cannot catch it: jsdom has no contrast check and the test mocks the real
      header and footer. Add a Playwright axe run on the real pages.
- [ ] **Level and tab buttons do not expose their state.** No `aria-pressed` on the level buttons,
      no `role="tab"`/`aria-selected` on the tabs.
- [ ] **Put the level in the URL** (`/spjald/dyr?stig=B1`) so a card can be bookmarked and shared;
      every visit starts at A1 today.
- [ ] **Google Fonts are imported in `src/index.css`**, which the CSP in `server/nginx-site.conf`
      (`font-src 'self'`) blocks wherever that config is live. Self-host the two fonts or drop
      them.
- [ ] **Download errors use `alert()`**, and the client and server name the file differently
      (`dyr-A1-spjald.pdf` against `spjald-dyr-A1.pdf`). Moot once the PDFs are static.

**Code**

- [ ] **Which questions are "context" (the coloured boxes) is decided by their emoji**, from a
      list kept in both `SpurningaSpjald.tsx` and the PDF renderer, as is each question's label.
      Make it an explicit field in the YAML.
- [ ] **Smaller items.** `Home.tsx` hard-codes `grid-rows-3`/`grid-rows-2`, so a seventh category
      breaks the grid. The `Category` type is duplicated between the app and the server. The PDF
      renderer writes `React.createElement` in a `.tsx` file. `content/islenskubraut/README.md`
      still says `data/index.ts` is edited by hand; it is generated.

**Features (larger, each its own PR)**

- [ ] **Sentence builder for students**: pick a frame, tap words, get the correctly inflected
      sentence. Needs C7's gender and case data.
- [ ] **Picture support**: a printable picture set per category, and pictograms on the A1 chips.
      Check any pictogram set's licence first.
- [ ] **A teacher sheet per category** with activities (guessing games, pair work), replacing the
      note on the student card.
- [ ] **Optional glosses in learners' languages.** Needs a decision on who writes and checks them.
