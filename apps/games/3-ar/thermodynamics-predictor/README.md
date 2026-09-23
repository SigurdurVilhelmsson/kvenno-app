# Varmafræði spámaður

Year 3, chain position 5 of 8, between Sýrufastinn and pH Títrun (`src/App.tsx:518-519`):
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

Grading (`checkAnswer`, `src/App.tsx:184`): ΔG° goes through `isDeltaGCorrect`
(`src/utils/thermo-calculations.ts`), parsed with `parseStudentNumber`, so the decimal comma works
(`type="text"` + `inputMode="decimal"`, `src/App.tsx:927-928`). It is right within **±3 kJ/mol,
but never more than a quarter of |ΔG°|, and never less than 0,1** (`deltaGTolerance`). The quarter
was added on 2026-09-23: a flat ±3 marked `0`, half and double right wherever |ΔG°| < 6, e.g.
Demant → Grafít (−2,9 kJ/mol at 298 K). It bites only below |ΔG°| = 12; a whole-number answer
still passes wherever |ΔG°| ≥ 2. The verdict comes from `getSpontaneity`, which calls
|ΔG| < 1 kJ/mol `jafnvægi`, and the worked solution and Könnun now use the same function, so none
of the three can disagree about a borderline value. Both must be right. Wrong answers get
`buildSpontaneityReasoning()`, a scenario-specific explanation of which term wins.

The temperature slider is live during a problem, so the student can change T and is graded at
whatever T it is set to.

## Before touching it

- **The data is stored, not derived, and unsourced.** Each of the 30 problems in
  `src/data/problems.ts` carries a hand-typed `deltaH` and `deltaS`. The game does **not** use
  `packages/shared/data/thermo.ts`. Where that file can derive ΔH° (it transcribes the Icelandic
  book's appendix `m68865`), most stored values agree within rounding — methane, water, CO, NO,
  Haber, contact, steam reforming, PCl₅, vaporisation of water. Three did not: one is fixed
  (see **Fixed**), two are **Open**.
- **What the tests check.** `data-integrity.test.ts` checks required fields, unique ids, and that
  each problem's `scenario` (1–4) matches the signs of its ΔH and ΔS. `thermo-calculations.test.ts`
  checks the formula and the ±1 kJ/mol equilibrium band. `grading.test.ts` asserts the ΔG°
  grader rejects `0`, half, double and `NaN` for every problem at every slider temperature.
  `decimal-comma.test.tsx` plays all 30 problems to their solution and reads the whole screen for a
  decimal point, a `-0` or a double minus. **Nothing checks a value against a source**, so a wrong
  number with the right sign passes.
- **The i18n switcher was stripped on 2026-09-19** (`docs/i18n-coverage.md`); there is no
  `i18n.ts` and no `useGameI18n`. The Icelandic is hardcoded in `App.tsx`.
- **Terminology** is governed by `packages/shared/i18n/ordabok.md` and the table in `CLAUDE.md`
  (`vermi`, `sjálfgengur`, `sjálfgengi`). Since 2026-09-23 the game follows it for enthalpy
  (`vermi`, `vermibreyting`), entropy (`óreiða`, and the textbook's `óreiðubreyting`), and
  exo/endothermic (`útvermið` / `innvermið`); `icelandic-text.test.tsx` holds those. Five names
  are still Siggi's call — see **Open** — and `governed-terms.test.ts` matches strings only, so it
  cannot catch agreement.
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
src/utils/thermo-calculations.ts     calculateDeltaG, getSpontaneity, crossoverTemperature,
                                     isDeltaGCorrect, deltaGAxisHalfRange
src/utils/sign.ts                    toggleSign, behind the ± button (see Phones)
src/utils/format.ts                  formatRounded: formatDecimal that never prints -0
src/__tests__/                       data-integrity, thermo-calculations, co-enthalpy, phone-play,
                                     grading, answer-checking, decimal-comma, graph-range,
                                     crossover, icelandic-text (play-helpers.tsx drives the game
                                     for them)
```

## Phones

**The `±` button is what makes a negative ΔG° typeable on an iPhone.** The ΔG° field raises the
decimal keypad, as the decimal-comma rule requires, and on an iPhone that keypad has no minus key —
while 18 of the 30 problems have a negative ΔG° at their default temperature. The button flips the
sign of whatever is in the field. It shows only on touch screens (`pointer-coarse`); a desktop
keyboard has a minus key and the desktop row is unchanged. `phone-play.test.tsx` plays a negative
answer through it.

Where the screen lands, since the menu and the solution are long on a phone: a new mode and
"Næsta spurning" open at the top, and once an answer is checked — or the challenge timer runs out —
the verdict box is scrolled into view when its first line is off screen, after the answer card has
left. It does nothing when the verdict is already visible.

On touch screens the temperature sliders are 44 px tall, all of it draggable (the 8 px track is the
track pseudo-element, drawn in the middle; padding would not do, since a drag that starts in an
input's padding does not move the thumb), with a 28 px thumb, and `<sub>` has a 12 px floor, both in
`src/styles.css` under `(pointer: coarse)`. The rest is
layout, each piece restoring the desktop look at `sm`: cards lose padding; the ΔH and ΔS cards stack
in Könnun and in the problem card; the progress stats become rows; the graph legend is one column;
the entropy before/after panels stack at full size instead of shrinking side by side; the challenge
stats take a row of their own; and Könnun's two buttons stack.

## Fixed

- **Id 25, C(s) + ½O₂(g) → CO(g), stored ΔG°f(CO) as its ΔH — fixed 2026-09-22.** It carried
  −137 kJ/mol, CO's Gibbs energy of formation; the enthalpy of formation is −110,5. Because the
  game computes ΔG° = ΔH − TΔS, it subtracted TΔS from a number that already had it subtracted and
  showed ΔG° = −163,8 at 298 K. The verdict was right by luck — ΔH < 0 and ΔS > 0 make it
  spontaneous at every temperature — but every number was wrong. `co-enthalpy.test.ts` holds ΔH to
  `thermo.ts` and checks that the game's own ΔG° at 298 K lands on ΔG°f(CO), −137,2.
- **Fixed 2026-09-23, each guarded by a test that failed against the code before it:**
  - **Practice mode became unplayable after one timed-out challenge.** Entering a mode calls
    `startNewProblem` in the same click as `setMode`, so its `mode === 'challenge'` check read the
    screen being left and never reset the clock; the time-out did not check the mode either. So
    the clock stayed at 0 and every Æfingarhamur problem opened already marked "Tíminn rann út!",
    and a second Keppnishamur run inherited the first run's remaining seconds. Now every new
    problem gets 90 s and only Keppnishamur can time out (`answer-checking.test.tsx`).
  - **A half-right answer was boxed in green.** The box looked for `Rétt` in the message, and
    both half-right messages say "Rétt svar: …". It now reads whether the answer was right.
  - **"Spurning N" was the stored count of correct answers plus one**, so it stood still on a
    wrong answer and opened at "Spurning 8" on a return visit. It now counts this run's questions.
  - **The ΔG° grader accepted `0`, half and double** for small ΔG° — see Grading above.
  - **The worked solution disagreed with the grader at |ΔG°| = 1** (`≤ 1` against `< 1`): protein
    unfolding at 332 K was "JAFNVÆGI" in Skref 3 and "Ekki sjálfgengt" in the feedback. And Könnun
    called ΔG = 0 at 500 K "Ekki sjálfgengt — ΔG > 0", at the one temperature its own "Hvað sést?"
    list calls equilibrium. Both now use `getSpontaneity`.
  - **A crossover temperature was shown where there is none.** The game took T = |ΔH°/ΔS°| for
    every problem, so the absolute value invented one wherever ΔH° and ΔS° have opposite signs
    and ΔG° never reaches 0. Demant → Grafít (id 15) was given an `Umbreytingarhitastig` of 576 K
    and told in red that 298 K was "undir T_cross", and its graph drew a "ΔG = 0" point at 576 K,
    3,8 kJ/mol off its own line; the ATP problem (id 27) had the same at 571 K. Now
    `crossoverTemperature` returns nothing unless the quotient is positive
    (`crossover.test.tsx`).
  - **The ΔG° graph was empty for methane combustion and photosynthesis**, whose lines lie outside
    the fixed ±500 kJ/mol axis (ΔG° ≈ −800 and +2870). The axis now widens to ±1000, ±2000, ±5000 …
    only when the line needs it (`deltaGAxisHalfRange`, `graph-range.test.tsx`).
  - **Every number printed a full stop** — the placeholder, stored ΔH°/ΔS°, the live panel, the
    solution, the feedback, `R` and `E°`. Rounding printed `273 K (-0°C)`; Skref 2 printed a negative
    TΔS bare (`-283 - -25.9`); and ΔS° = 3,3 J/(mol·K) was converted to `0.003` kJ/(mol·K), so the
    steps did not reproduce their own total.
  - **Icelandic:** English (`Óreiða (Entropy)`, `solid → liquid → gas`), grammar (`tvær
drifkraftir`, `ræður orkuáhrifin`, `Byrja æfingarhamur`, `Fjögur Atburðarás`, `Lofttegundir
hvarf`, `Bræðsla ís`, `Próteín (felltur)`, `við háum hita`), spelling (`óreguáhrif`,
    `vetnisproxíðs`, `örstaður`, which the textbook calls `örástand`), the name `Dímun NO₂`, which
    is in neither the glossary nor the textbook (the book writes `tvíliðun NO₂` for this very
    reaction), and the menu's promise of `vísbendingar` in a mode that has no hints.

## Open

- **Two stored ΔH° values disagree with what `thermo.ts` derives.** CaCO₃ decomposition (id 12)
  stores 178 against a derived 191,6, and NO₂ dimerisation (id 21) −57 against −55,3 — the same two
  divergences `thermo.ts`'s header records for `equilibrium-shifter`. Neither changes a sign, and
  `thermo.ts` is the Icelandic book, not Brown, so which value is right is not settled. No ΔS° is
  sourced anywhere on the platform, so the ΔS values are unchecked.
- **The answer is on screen before the student answers.** The "Við núverandi hitastig" panel
  (`src/App.tsx:826-846`) prints the computed ΔG° and the verdict beside the question, and the graph
  marker labels ΔG° at the current T. `REVIEW_TRACKER.md` raised this in iteration 1 and it was
  never resolved. Removing it removes the live feedback the slider exists for, so it is a design
  question, not a deletion. Because the student is graded at whatever T the slider is set to, it
  also lets a Keppnishamur player slide any scenario 3 or 4 problem to the printed T_cross and
  answer `0` / Jafnvægi for full points.
- **The Erfitt `advancedTask` prompts are not graded.** Ids 23, 24 and 27 ask for K, 28 for
  ΔG° = −nFE°, 25 for Hess's law, 29 for a melting point, 30 for an optimum temperature; the grader
  still checks only ΔG° and the verdict. `ΔG° = −RT ln K` was removed from the formula card for this
  reason, but the prompts asking for K remain.
- **Five names are unsettled, so they were left as they are.** The menu's `Gibbs frjálsa orku`:
  `ordabok.md` says `Gibbs fríorka`, the textbook says `Gibbs frjáls orka` (and `fríork-` has zero
  corpus hits) — they disagree. The crossover temperature is `þveragahitastig` in Könnun and
  `Umbreytingarhitastig` (with an English `T_cross`) in the game; neither source names it. And id 16
  is `Contact aðferðin`, English, where `equilibrium-shifter` says `Snertiaðferð`, a name neither
  source has. Two more problem names have no source term either: id 17 `Gufumyndun` (steam
  reforming, CH₄ + H₂O → CO + 3H₂, where the word reads as vapour formation) and id 27
  `ATP vatnsrofhvarfun` (the glossary has `vatnsrof` for hydrolysis, but not this compound).
- **Score and streak accrue in Æfingarhamur too.** `checkAnswer` updates `score`, `highScore` and
  `bestStreak` in both modes, and practice feedback says "Rétt! +100 stig". The score is never reset,
  so Keppnishamur's "Stig" is a lifetime total including practice, `Hæsta stig` always equals it, and
  the menu's `Spurningar` counts correct answers only.
