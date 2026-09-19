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

| PR                                                               | What                                                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [#46](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/46) | Prettier backlog cleared (83 files); dead `deploy.yml` removed                      |
| [#47](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/47) | Five acid names ruled + guarded; CI format gate; Y1 chain test; generated SPA index |
| [#48](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/48) | Buffer recipes derived instead of stored; six Appendix D corrections                |
| [#49](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/49) | TRIS problems dropped; `flússýra` added to Sýrufastinn                              |
| [#51](https://github.com/SigurdurVilhelmsson/kvenno-app/pull/51) | HNO₂ and HCN added to Sýrufastinn; acid names now decline                           |

Suite went **1948 → 2032** tests (plus 46 server). `pnpm check-all` passes all three legs for the
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

### Ruled but not built

- **Strip the i18n switcher** from the eight games that route nothing through `t()` — the ruling is
  made, the work is not done. Per-game counts: `docs/i18n-coverage.md`.
- **Significant figures as a Stig 0 in `1-ar/einingakedjan`** — real content work.
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

## Two operational facts worth keeping

- **`Deploy` never worked.** `deploy.yml` ran 100 times with 0 successes from Feb 2026 until it was
  deleted in #46: its four secrets were never created, so every run died at `ssh-keyscan` with an
  empty host. `scripts/deploy.sh` is the deploy path and always was. If automated deploy is ever
  wanted, `docs/DEPLOYMENT.md` records the two blockers behind the secrets (passwordless sudo, and
  an ownership model that contradicts the manual script).
- **commitlint rejects any uppercase in a commit subject** (`subject-case: lower-case`). "Appendix D"
  in a subject fails. This cost three retries today.
