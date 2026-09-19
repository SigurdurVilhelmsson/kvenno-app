# Session record — 2026-09-19

**Read this before picking up Y3 chemistry work or the roadmap.** It is the handoff from the
2026-09-19 cloud session: four PRs merged, eight rulings taken, one Tier-0 grading defect found and
fixed, and two items left explicitly blocked.

It exists because this repo has lost session context before. `CLAUDE.md`'s own notes on
`mighty-mixing-puffin.md` and `logical-wandering-llama.md` record two plan files that no longer
exist anywhere — "a branch that is never merged is indistinguishable from work that never happened".
This file is committed for that reason.

---

## What merged

| PR                                                               | What                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [#46](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/46) | Prettier backlog cleared (83 files); dead `deploy.yml` removed                        |
| [#47](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/47) | Five acid names ruled + guarded; CI format gate; Y1 chain test; generated SPA index   |
| [#48](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/48) | Buffer recipes derived instead of stored; six Appendix D corrections                  |
| [#49](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/49) | TRIS problems dropped; `flússýra` added to Sýrufastinn                                |
| [#51](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/51) | HNO₂ and HCN added to Sýrufastinn; acid names now decline                             |
| [#52](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/52) | i18n switcher stripped from the eight games that translated nothing                   |
| [#53](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/53) | Gas-law game renamed to Icelandic; `Púfferuppskrift` swept; term scan widened to HTML |

Suite went **1948 → 2101** tests (plus 46 server). `pnpm check-all` passes all three legs for the
first time, and `format:check` is now a CI step so it stays that way.

---

## The one real defect found today

**`buffer-recipe-creator` Level 2 graded students against arithmetic that contradicted itself.**

`data/problems.ts` stored `correctAcidMass`, `correctBaseMass`, `correctAcidMoles`,
`correctBaseMoles` and `ratio` per problem. `data-integrity.test.ts` checked the stored `ratio`
against `10^(pH − pKa)` and it always passed — but **nothing checked that the moles followed from
the ratio, or the masses from the moles**, and 13 of the 29 real problems had at least one that did
not. Worst was #15, whose base mass was `totalConcentration × molarMass` (0.15 × 141.96 = 21.29 g)
instead of `baseMoles × molarMass` (0.08 × 141.96 = 11.36 g).

Level 2 grades entered masses at ±5 %, so on **three of the six problems it served** (#14, #17, #19)
a student who did the chemistry correctly was marked wrong, and the explanation panel then printed
the false multiplication back as the worked answer.

**Fixed by deriving.** `engine/buffer.ts` computes everything; the five fields are gone from the
type and the data. Level 3 was never affected — it already derived at runtime, which is the shape
the fix adopted. Same cure B4 got in `1-ar/molmassi`.

**The trap in that change, if you ever touch it:** problem #25 carries `phAdjustment: true` and is
not a two-salt recipe — you weigh out _all_ the weak acid and add NaOH. That model lived **only in
the stored numbers**; `Level2.tsx` never read the flag. Deriving with the standard formula would
have silently broken the one problem whose data was already right. `engine/buffer.ts` branches on
it and `buffer-engine.test.ts` holds the branch from both sides.

---

## Rulings taken today

All Siggi's, all 2026-09-19. The terminology ones are in `ordabok.md` and enforced by
`governed-terms.test.ts`; see the table in `CLAUDE.md` for grammar notes.

| Question               | Ruling                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- |
| HF                     | `flússýra` — **against platform frequency**, which stood 3 to 1 the other way      |
| HNO₃                   | `saltpéturssýra` (double s)                                                        |
| H₂SO₄                  | `brennisteinssýra` (double s)                                                      |
| benzoic acid           | `bensósýra` (no z, no -oe-)                                                        |
| i18n                   | **Strip** the switcher from games that route nothing through `t()`                 |
| Keppnishamur mode gate | **Keep** — `equilibrium-shifter/src/App.tsx`                                       |
| significant figures    | A **Stig 0 inside Einingagreining**, not its own game                              |
| Phase 5 build order    | empirical formula → electrolytes/precipitation → Ksp → `equilibrium-shifter` Kc/Kp |
| constants              | **Appendix D is authoritative**; a constant with no Appendix D row does not ship   |
| Íslenskubraut          | **On hold** as a project                                                           |
| Beita's length         | **Trim** the rule-breaking set — selection rule still Siggi's to give              |
| `molmassi` name        | **`Mólhugtakið`** — the hub-card name; its tab had said `Molmassi Leikur`          |
| `nafnakerfid` name     | **`Nafnakerfið`** — the hub-card name; its tab had said `Nafnapör - Efnanöfn`      |
| HNO₂ / NO₂⁻            | `saltpéturssýrlingur` / `nítrítjón`                                                |
| HCN / CN⁻              | `vetnissýaníð` (`blásýra`) / `sýaníðjón`                                           |

---

## Open, and what each needs

### Closed the same day — the four Icelandic terms

`3-ar/syrufastinn`'s pool was **7 acids, not the 9 the ruling admitted**, because D.1 had settled
both Ka values (HNO₂ 4,5 × 10⁻⁴, HCN 4,9 × 10⁻¹⁰) while `ordabok.md` carried no word for either
acid or either conjugate base. Siggi ruled all four, so **the pool is 9**:

| Species | Icelandic                  |
| ------- | -------------------------- |
| HNO₂    | `saltpéturssýrlingur`      |
| NO₂⁻    | `nítrítjón`                |
| HCN     | `vetnissýaníð` (`blásýra`) |
| CN⁻     | `sýaníðjón`                |

All four are in `ordabok.md`. No banned form exists for any of them — nothing on the platform
spelled them any other way, because nothing on the platform said them at all — so they get glossary
entries and no `governed-terms.test.ts` row, the same treatment `brunaefnahvarf` and `niðurbrot`
got. The existing nitric-acid row already covers the near miss: its `/saltpétursýr/i` ban catches a
future one-`s` `saltpétursýrlingur` without touching the correct double-`s` form.

### Built after the rulings

- **The i18n switcher is stripped** from the eight games that routed nothing through `t()` —
  `2-ar/kinetics`, `lewis-structures`, `organic-nomenclature`, `intermolecular-forces`;
  `3-ar/buffer-recipe-creator`, `gas-law-challenge`, `thermodynamics-predictor`, `ph-titration`.
  1 661 lines of dead `i18n.ts` deleted, zero consumers.
  `packages/shared/i18n/__tests__/switcher-earns-its-place.test.ts` states the rule as a property
  rather than a list — **a game rendering `LanguageSwitcher` must have at least one `t()` call** —
  so the next half-wiring fails instead of shipping. Both its guards were verified to fail against
  a reintroduction.

  **`ph-titration` was the judgement call.** Its single `t()` was a fallback-backed lookup over
  five badge labels, so stripping it changed nothing a student sees. **`2-ar/rafeindabygging` also
  has exactly one call and was left alone**, because that one is `t('game.title')` — a real
  translated string, not a fallback. The ruling drew the line at zero and this is not zero. It,
  `vsepr-geometry` (2) and `takmarkandi` (2) are what is left of the question.

### Ruled but not built

- **Trim Sýrufastinn's Beita phase** — ruled 2026-09-19. Adding HNO₂ took it from 12 problems to
  16, twelve of them one generated template differing only in acid and concentration.
  `APPLY_PROBLEMS` appends every member of `RULE_BREAKING_PROBLEMS`; that is the one line to
  change. **The selection rule was not part of the ruling and must not be improvised into one** —
  see the roadmap's item 13 for the unruled candidates and the two constraints any of them must
  keep.
- ~~**Significant figures as a Stig 0**~~ **built 2026-09-19** — see the section below.
- **Phase 5, in the ruled order**: empirical formula (Y1) first.

### Not ruled

- `equilibrium-shifter` is still entirely qualitative — general Kc/Kp and ICE remain unbuilt.
- The Hess Polish i18n block still wants teacher sign-off.
- `molmassi` names HCl `Saltsýra` (a solution) while quoting the compound's molar mass. Excluded
  from molar-volume questions rather than renamed; still a naming question.

---

## Corrections to things said earlier in the session

Recorded because the wrong versions were stated confidently before being checked.

- **"15 of 29 buffer problems have a bad mass" was wrong; it is 13 of 29.** The first audit applied
  the standard two-salt model to every problem, which mis-flagged **#25** — correct under its own
  `phAdjustment` model — as the worst case at 182 %. The real worst is #15 at 87 %.
- **`saltpéturssýrlingur` for HNO₂ was mine, not a ruling.** It was written into `CLAUDE.md` mid-session
  as though settled; it is not, and it is one of the four terms still needed.
- **A sixth Ka correction was missed from the original list: formic, 3.75 → 3.74.** The proof is
  internal — formic and acetic share the mantissa 1.8, so their pKa values differ by exactly 1.000
  (3.7447 and 4.7447). The platform rounded one to 4.74 and the other to 3.75.
- **Adding HNO₂ and HCN surfaced a grammar defect nobody had looked for.** Sýrufastinn's question
  templates interpolated `acid.name.toLowerCase()` after `af`, which governs the dative — so the
  Æfa screen and every Beita rule-breaker read `lausn af flússýra` and `lausn af própansýra`.
  Invisible while every acid in the pool was a feminine `-sýra`; obvious the moment a neuter
  (`vetnissýaníð`) and a masculine (`saltpéturssýrlingur`) joined it. `WeakAcid` now carries
  `nameDative` and `nameGenitive`, and two tests hold the templates to them. **This is exactly what
  `CLAUDE.md` warns about under "What the test cannot do":** `governed-terms.test.ts` matches
  strings and cannot see agreement, so a pool that spans three genders needs the cases in the data.
- **`ph-titration`'s Level 3 reference table was the largest single find and was not on any list.**
  Six of its nine values came from another book: H₂CO₃ read `6.35, 10.33` against Appendix D's
  `6.37, 10.25`, H₃PO₄ read `2.15, 7.20, 12.35` against `2.12, 7.21, 12.38`. That table is the
  student's route to the answer, so it disagreeing with the grader is the Phase 4 answer-leak
  lesson running in reverse — **check the reference tables, not just the data.**

---

## Found last, ruled, and closed the same day

**Ten of the twenty-two games disagreed with themselves about their own name.** Found while fixing
the gas-law title, by comparing three surfaces per game: the hub card in
`apps/landing/src/pages/GamesHub.tsx`, the browser-tab `<title>` in the game's `index.html`, and the
`gameTitle` on its `Header`.

**All ten are fixed, and `packages/shared/i18n/__tests__/game-titles-agree.test.ts` now holds them
there** — the hub card is the source of truth, being the only one of the three a student reads
before choosing the game. Four distinct problems were tangled together:

1. **A banned term.** `buffer-recipe-creator`'s tab read `Púfferuppskrift`; `púffer` has been banned
   since August. Fixed, and the root cause with it: `governed-terms.test.ts` scanned `.tsx?` only,
   so no `index.html` had ever been read. It scans `.html` too now, verified both ways. **Markdown
   is still uncovered** — the same blind spot that let CLAUDE.md's Y3 chain line say `Púfferar`.
2. **An English name**, `Gas Law Challenge`, at four student-facing sites. Now `Gaslögmál`, which is
   not a coinage — it is the hub card, the chain node in all six Y3 games, and this game's own chain
   chip. A code comment in `types.ts:2` still says it; not user-facing, left alone.
3. **Two games carrying two different names each.** **Siggi's ruling, 2026-09-19: `Mólhugtakið` for
   `molmassi` and `Nafnakerfið` for `nafnakerfid` — the hub-card name both times.** `molmassi`'s tab
   had said `Molmassi Leikur`, also missing the accent on `Mól-`; `nafnakerfid`'s had said
   `Nafnapör - Efnanöfn`. This mattered most of the four: the tab title is what a bookmark keeps.
4. **Drift.** Mid-title capitals Icelandic does not take (`Takmarkandi Hvarfefni`, `Oxun og Afoxun`,
   `Lífræn Nafnagift`, `Varmafræði Spámaður`), a missing accent in the `pH Titrun` header, and three
   tabs suffixed `| Kvennaskólinn` / `| Kvennó` where nineteen used `- Kvennaskólinn`. Swept once
   (3) was ruled.

**The ruling is what made the test writable.** It needs to know which name is right, and a test
cannot settle a naming question — only hold one that is settled. `2-ar/rafeindabygging` is the sole
header exemption: it sets `gameTitle` per screen so the header names the sub-topic, which is
deliberate, and the test asserts that waiver is still earned so it cannot outlive its reason.

## Stig 0 — Markverðir stafir (built)

Siggi's ruling: significant figures live **inside Einingagreining**, not in a game of their own.

**The target was nearly got wrong.** This record first said `1-ar/einingakedjan`. Einingagreining is
`1-ar/dimensional-analysis` (`GamesHub.tsx:31`); `Einingakeðjan` is the separate game at
`GamesHub.tsx:66`. Four letters apart, adjacent in the Y1 chain. Caught before any code was written,
by checking the hub card rather than trusting the note.

The ruling's target was right on the merits too: **`dimensional-analysis` already marked students on
significant figures and never taught them.** `Level3.tsx:167-169` counts them and shows a red panel;
`challenges.ts` asks for "3 markverðum stöfum" in the problem text. **The roadmap's open question of
whether Levels 1–2 also grade on it is now settled — they do not mention them at all**, and the L3
check is feedback-only (`calculateCompositeScore` takes four scores and this is not one).

Two things worth carrying forward:

- **`utils/sigfigs.ts` works on the written string, never a `number`.** `1200`, `1200,` and
  `1,200 × 10³` are one quantity at three precisions and a float cannot tell them apart.
- **A round-trip property test changed the design.** 60,221 to two significant figures **cannot be
  written in plain decimal** — `60` claims one figure by rule 4 — so `roundToSigFigs` verifies its
  own output and falls back to `6,0 × 10¹`. The test asserts 455 cases; it found this, I did not.

## A soft hyphen, and the guard it bought

Writing the new Icelandic content, Claude put a **U+00AD soft hyphen inside `ónákvæmasta`**.
Invisible in an editor, survives review, breaks search and screen readers — and precisely the defect
that left the Íslenskubraut server copy reading `Orða{soft hyphen}forði` for months.
`load.mjs` has validated the YAML since August; **game and app source was never covered**, which is
where this one landed.

`packages/shared/i18n/__tests__/no-invisible-characters.test.ts` now covers `.ts`, `.tsx`, `.html`,
`.yaml` and `.md` across the app and shared roots. A repo-wide sweep found **exactly two other
occurrences, both legitimate** and both allow-listed: a U+200D joiner inside an emoji in
`challenges.ts`, and a U+00A0 in `numbers.test.ts`, which tests that `parseStudentNumber` handles
one. A third assertion fails if an allow-list entry outlives its character.

## Two operational facts worth keeping

- **`Deploy` never worked.** `deploy.yml` ran 100 times with 0 successes from Feb 2026 until it was
  deleted in #46: its four secrets were never created, so every run died at `ssh-keyscan` with an
  empty host. `scripts/deploy.sh` is the deploy path and always was. If automated deploy is ever
  wanted, `docs/DEPLOYMENT.md` records the two blockers behind the secrets (passwordless sudo, and
  an ownership model that contradicts the manual script).
- **commitlint rejects any uppercase in a commit subject** (`subject-case: lower-case`). "Appendix D"
  in a subject fails. This cost three retries today.
