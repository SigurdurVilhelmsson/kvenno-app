# Varmafræði spámaður

Year 3, chain position 5 of 8, between Sýrufastinn and pH Títrun (`src/App.tsx:447-448`):
Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis → Sýrufastinn → **Varmafræði** → pH Títrun →
Stuðpúðar → Leysnijafnvægi. The chain string is enforced across all Y3 games by
`3-ar/syrufastinn/src/__tests__/chain-string.test.ts`.

It teaches Gibbs free energy, ΔG° = ΔH° − TΔS°: given ΔH° and ΔS° for a reaction and a
temperature, compute ΔG° and say whether the reaction is `sjálfgengt`, `ekki sjálfgengt` or at
`jafnvægi`, and see how the four sign combinations of ΔH and ΔS decide whether temperature can
change the verdict.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing about this game.

## Structure

One screen per mode, all in `src/App.tsx`; there are no level components.

| Mode                       | What it does                                                                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menu                       | A static derivation of ΔG = ΔH − TΔS, then a difficulty choice (Auðvelt / Miðlungs / Erfitt, 10 / 12 / 8 problems)                                                                  |
| Könnun (`discover`)        | Ungraded. A fixed demo reaction (ΔH = −100 kJ/mol, ΔS = −200 J/(mol·K), crossover 500 K) and a 200–1200 K slider; ΔG and its sign update live                                       |
| Æfingarhamur (`learning`)  | A random problem from the chosen difficulty. Enter ΔG° (kJ/mol) and pick one of three verdicts; the solution then shows the steps and, for scenarios 3–4, the crossover temperature |
| Keppnishamur (`challenge`) | The same problems with a 90-second timer, a score and a streak                                                                                                                      |

Grading (`checkAnswer`, `src/App.tsx:116`): ΔG° is right within **±3 kJ/mol absolute**
(`:121`), parsed with `parseStudentNumber`, so the decimal comma works (`type="text"` +
`inputMode="decimal"`, `:839-840`). The verdict comes from `getSpontaneity`
(`src/utils/thermo-calculations.ts`), which calls |ΔG| < 1 kJ/mol `jafnvægi`. Both must be right.
Wrong answers get `buildSpontaneityReasoning()`, a scenario-specific explanation of which term wins.

The temperature slider is live during a problem, so the student can change T and is graded at
whatever T it is set to.

## Before touching it

- **The data is stored, not derived, and unsourced.** Each of the 30 problems in
  `src/data/problems.ts` carries a hand-typed `deltaH` and `deltaS`. The game does **not** use
  `packages/shared/data/thermo.ts`. Where that file can derive ΔH° (it transcribes the Icelandic
  book's appendix `m68865`), most stored values agree within rounding — methane, water, CO, NO,
  Haber, contact, steam reforming, PCl₅, vaporisation of water. Three do not; see **Open**.
- **What the tests check.** `data-integrity.test.ts` checks required fields, unique ids, and that
  each problem's `scenario` (1–4) matches the signs of its ΔH and ΔS. `thermo-calculations.test.ts`
  checks the formula and the ±1 kJ/mol equilibrium band. **Nothing checks a value against a
  source**, so a wrong number with the right sign passes.
- **The i18n switcher was stripped on 2026-09-19** (`docs/i18n-coverage.md`); there is no
  `i18n.ts` and no `useGameI18n`. The Icelandic is hardcoded in `App.tsx`.
- **Terminology** is governed by `packages/shared/i18n/ordabok.md` and the table in `CLAUDE.md`
  (`vermi`, `sjálfgengur`, `sjálfgengi`). The spontaneity vocabulary is clean. The rest is not —
  see **Open** — and `governed-terms.test.ts` matches strings only, so it cannot catch agreement.
- **Some reactions repeat:** water vaporisation at 298 K and 373 K (ids 5, 13), the Haber process
  three times (11, 23, 24) and the contact process twice (16, 30), each with a different default
  temperature or task. Nothing records whether that was intended.

## Layout

```
index.html                           <title>Varmafræði spámaður - Kvennaskólinn</title>
src/App.tsx                          all four modes, grading, graph data, feedback
src/components/EntropyVisualization.tsx   before/after particle picture of ΔS, via ParticleSimulation
src/data/problems.ts                 30 problems: reaction, ΔH, ΔS, default T, scenario, difficulty
src/data/index.ts                    re-export
src/types.ts                         Problem, GameMode, Spontaneity
src/utils/thermo-calculations.ts     calculateDeltaG, getSpontaneity
src/__tests__/                       data-integrity, thermo-calculations
```

## Fixed

- **Id 25, C(s) + ½O₂(g) → CO(g), stored ΔG°f(CO) as its ΔH — fixed 2026-09-22.** It carried
  −137 kJ/mol, CO's Gibbs energy of formation; the enthalpy of formation is −110,5. Because the
  game computes ΔG° = ΔH − TΔS, it subtracted TΔS from a number that already had it subtracted and
  showed ΔG° = −163,8 at 298 K. The verdict was right by luck — ΔH < 0 and ΔS > 0 make it
  spontaneous at every temperature — but every number was wrong. `co-enthalpy.test.ts` holds ΔH to
  `thermo.ts` and checks that the game's own ΔG° at 298 K lands on ΔG°f(CO), −137,2.

## Open

- **Two stored ΔH° values disagree with what `thermo.ts` derives.** CaCO₃ decomposition (id 12)
  stores 178 against a derived 191,6, and NO₂ dimerisation (id 21) −57 against −55,3 — the same two
  divergences `thermo.ts`'s header records for `equilibrium-shifter`. Neither changes a sign, and
  `thermo.ts` is the Icelandic book, not Brown, so which value is right is not settled. No ΔS° is
  sourced anywhere on the platform, so the ΔS values are unchecked. (A third, id 25, is fixed —
  see below.)
- **The answer is on screen before the student answers.** The "Við núverandi hitastig" panel
  (`src/App.tsx:742-759`) prints the computed ΔG° and the verdict beside the question, and the graph
  marker labels ΔG° at the current T. `REVIEW_TRACKER.md` raised this in iteration 1 and it was
  never resolved. Removing it removes the live feedback the slider exists for, so it is a design
  question, not a deletion.
- **The Erfitt `advancedTask` prompts are not graded.** Ids 23, 24 and 27 ask for K, 28 for
  ΔG° = −nFE°, 25 for Hess's law, 29 for a melting point, 30 for an optimum temperature; the grader
  still checks only ΔG° and the verdict. `ΔG° = −RT ln K` was removed from the formula card for this
  reason, but the prompts asking for K remain.
- **Terminology the glossary settles but the game does not follow.** Entropy is named four ways in
  one game (the glossary's `óreiða`, plus `óregla`, and two spellings of the loanword); enthalpy
  appears as a t-spelled loanword at `:316` and `:673` and as `varmamismunur` at `:490`, never as
  `vermi`; the menu says `Gibbs frjálsa orku` where `ordabok.md` has `Gibbs fríorka`; and the
  exo/endothermic tags at `:687` are not the glossary's `útvermið` / `innvermið`. The roadmap
  listed this game among the three that contradict themselves, and for entropy it still does.
- **Score and streak accrue in Æfingarhamur too.** `checkAnswer` updates `score`, `highScore` and
  `bestStreak` in both modes, and the menu shows them, though only Keppnishamur displays them in
  play.
