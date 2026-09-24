# Jafnvægisstjóri

Chain position 3 of 8 in Year 3, between Jafnvægisfastinn and Sýrufastinn. The node is labelled
**Hliðrun jafnvægis** in the `Námsleiðin` string (`src/App.tsx:568-569`), not by the game's title,
because two adjacent nodes are now about equilibrium. The game teaches Le Chatelier's principle: a
student applies a stress to an equilibrium and predicts which way it shifts, and — since
2026-09-20 — sees the arithmetic behind the answer.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing whatever about this game. Nothing was lost by replacing it.

## Structure

There are no levels. The menu offers two modes over one pool of 30 equilibria
(`src/data/equilibria.ts`), drawn at random from all three difficulty tags (10 beginner, 12
intermediate, 8 advanced); the tag only sets the points a correct answer is worth.

| Mode             | What it asks                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lærdómshamur** | The student picks a stress, predicts left / none / right, and gets the explanation, the Q vs K panel, the numbers panel and the reasoning list |
| **Keppnishamur** | 10 questions, a random stress each, 20 seconds per question (`CHALLENGE_SECONDS`, `App.tsx:36`), points, streaks and a speed bonus             |

The Q vs K and numbers panels render in learning mode and after any wrong answer in challenge mode
(`App.tsx:828-869`). Hints are free: `HintSystem` is passed `showPointCost={false}`. Points and
streaks are shown in Keppnishamur only.

## What matters before touching it

**Two engines, and the split is deliberate.** `src/utils/le-chatelier.ts` gives the direction and
is the original qualitative engine. `src/engine/stress.ts` says how far, by computing: it drives
the shared solver in `packages/shared/engine/equilibrium.ts`, which `3-ar/jafnvaegisfasti` also
imports, so two adjacent games cannot compute different answers about the same flask. A test in
`numbers.test.ts` holds the two engines to the same direction on every stress the numbers can
compute.

**The topic is one distinction, and `stress.ts` is arranged around it.** Every stress but
temperature moves **Q** and leaves K alone; heating or cooling moves **K itself** (van 't Hoff,
`shiftConstantWithTemperature` in `packages/shared/data/thermo.ts`) and leaves the mixture where it
is.

**`kUnknown` is not `inert`, and must not be merged into it.** A temperature stress on a system with
no reference temperature or no derivable ΔH leaves K and the mixture unmoved — numerically the same
as a catalyst, and the opposite in meaning. `StressOutcome` carries both flags, and
`numbers-panel.test.tsx` and `numbers.test.ts` hold them apart.

**20 of the 30 systems carry a sourced constant; 10 carry none, each with a written reason.**
`src/data/constants.ts` takes acids, bases and Ksp from `@shared/data/appendix-d`, gas-phase Kc
from the ch. 13 citations `jafnvaegisfasti` already carries, and a reaction written backwards
takes `1/K` rather than a second lookup. `numbers.test.ts` asserts the count of unsourced systems
is exactly ten, so quietly supplying one fails. Starting mixtures (`STARTING_MIXTURES`) are the
problem, not the answer; every equilibrium mixture shown is computed.

**ΔH is derived, and the stored value is held equal to it.** `derivedEnthalpy` sums the Icelandic
book's formation enthalpies (`packages/shared/data/thermo.ts`, appendix `m68865`) for the 20
reactions the table covers, and `numbers.test.ts` requires `thermodynamics.deltaH` to match to one
decimal. This is what makes the HI defect unwritable: the game shipped +53 kJ/mol for
H₂(g) + I₂(g) ⇌ 2HI(g), which is the enthalpy with **solid** iodine, so both temperature stresses
were answered backwards on a beginner system. It is now −9,48 (`equilibria.ts:54`). `thermo.ts` is
the other book, not Brown, and has not been checked against Brown; two values moved by more than
rounding (N₂O₄ ⇌ 2NO₂ to 55,3, CaCO₃ ⇌ CaO + CO₂ to 191,6) without changing a sign.

**The Q vs K panel's pressure sentence depends on the sign of Δn.** Compressing multiplies every gas
concentration by f, so Q moves by f^Δn. `QKComparison.tsx` used to say Q rises for every pressure
increase — wrong on 14 of the 21 systems offering a pressure stress, and contradicting its own
bars. `qk-pressure.test.tsx` drives the real component.

**Six slots are two reactions repeated, on purpose.** The Haber process appears four times and the
contact process twice, each with its own framing and name; acetic acid appears twice as two
different equations (bare proton against hydronium). `numbers.test.ts` pins all of it so nobody
"fixes" it and it cannot grow.

**Terminology already swept here** — see the CLAUDE.md table before editing any string. The reverse
reaction is `bakhvarf` (id 18 is `Bakhvarf vatnsgashvarfsins`), the buffer system is
`Stuðpúðakerfi`, and Q is `hvarfstuðull`; `governed-terms.test.ts` bans the old forms.

## Layout

```
src/App.tsx                       menu, both modes, feedback and results screens
src/data/equilibria.ts            the 30 equilibria, with stored ΔH held to the derived value
src/data/constants.ts             sourced K per system, the ten unsourced reasons, starting mixtures
src/data/index.ts                 data exports
src/engine/stress.ts              what a stress does to Q, K and the mixture
src/utils/le-chatelier.ts         the qualitative shift and its explanations
src/components/QKComparison.tsx   the Q vs K bars, drawn from the shift direction
src/components/NumbersPanel.tsx   the same comparison in computed numbers
src/components/ParticleEquilibrium.tsx  particle picture
src/types.ts, src/i18n.ts, src/styles.css, src/main.tsx
src/utils/reveal.ts               brings a new screen or question back into view
src/__tests__/                    le-chatelier, numbers, numbers-panel, qk-pressure,
                                  reveal-top, bar-labels
```

**On a phone (2026-09-23).** Everything below `sm` is a phone layout and `sm:`/`md:` restore the
desktop one, which was checked pixel-identical at 1280 and 768. Four choices are not obvious:

- **Reactants and products stay side by side at every width.** Stacking them put "left" above
  "right", and the whole game is about which way the equilibrium moves. Below `md` each molecule is
  an inline-block so a long side wraps between molecules.
- **`revealTop` (`src/utils/reveal.ts`).** Every screen is two to three phone screens tall and the
  buttons that move on sit at the bottom, so the next equilibrium used to open with its equation,
  ΔH and (in Keppnishamur) the running timer scrolled past. A new screen or question now scrolls
  its top back into view, only when that top is above the viewport.
- **The numbers table scrolls sideways inside its own box** where a row of scientific notation is
  wider than the phone (the weak acids at 360 px, most systems at 320 px). The species column is
  pinned (`.table-pin`, which also carries its high-contrast background) and a shadow marks the
  hidden right edge (`.table-scroll-cue`), both in `styles.css`. The note under the table sits
  outside the scrolling box, so it does not scroll out of view with the numbers.
- **A K or Q bar is never narrower than its label, and both share the wider label's floor**
  (`BarValue` in `NumbersPanel.tsx`), so a pinned bar can come out level with the other but never
  longer than a bar whose value is larger.

The shared pieces it depends on: `packages/shared/engine/equilibrium.ts`,
`packages/shared/data/thermo.ts`, `packages/shared/data/appendix-d.ts`. `MIGRATION-SUMMARY.md` is a
historical record of the port from the old HTML game and is out of date on most specifics.

## Fixed 2026-09-23 (after the phone pass)

Each has a test that fails against the version before it.

- **Keppnishamur skipped questions.** The automatic advance (six seconds after an answer, three
  after a timeout) was a bare `setTimeout` that nothing cancelled, so «Næsta strax →» moved on and
  the timer moved on again, unanswered; «← Til baka» did not stop it either, so it later fired into
  Lærdómshamur. It also ran a stale handler, so a round ended by the timer saved one correct answer
  too few. The advance is now one cancellable timer (`scheduleAdvance`/`cancelAdvance` in
  `App.tsx`) that calls the latest handler, and the countdown text names the delay that applies.
  `challenge-advance.test.tsx`.
- **«+N stig!» disagreed with the score** by the streak bonus of the answer itself; it now shows the
  points that were added.
- **Lærdómshamur showed points and a streak**, against the no-scoring-during-learning rule. They now
  appear in Keppnishamur only. `learning-feedback.test.tsx`.
- **English inside the Icelandic feedback.** `calculateShift` now returns `reasoningIs` and
  `molecularViewIs` beside the English ones, and the Icelandic screen reads them.
- **ΔH** is printed with a decimal comma and `kJ/mól` in the pill and in the explanations, as the
  numbers panel already did, and the acetic-acid buffer's ΔH of 0 is no longer labelled exothermic.
- **Terms settled by `ordabok.md`** replaced ungoverned ones across the game: `útvermið`/`innvermið`
  (was `varmalosandi`/`varmabindandi`), `varmi` for heat, `virkjunarorka`, `sameind`, `framhvarf`/
  `bakhvarf`, `sjálfjónun`, `klofnun`, `niðurbrot`, `útfelling`, `botnfall`, `flókajón`,
  `misleit hvötun`, `stuðpúðakerfi` (the id-21 description said `blóðpufferkerfi`, which escapes
  the platform ban because it has no accent), and `brennisteinsvetni` from the corpus. Grammar and
  spelling fixes with them. `icelandic-text.test.ts` holds every one.

## Open

- **The Keppnishamur gate cannot be opened.** It requires `progress.problemsCompleted >= 5`
  (`App.tsx:521-522`), but the only write to `problemsCompleted` is at the end of a challenge round
  (`App.tsx:427`). Learning mode never updates it, so a new student can never reach challenge
  mode, and «Framvinda þín: Verkefni kláruð» on the menu stays at 0 however much Lærdómshamur a
  student plays. The gate itself was already flagged as needing a ruling (a mode gate, outside the
  2026-08-29 level-gating ruling); it now also needs fixing or removing, whichever the ruling is.
- **The ten unsourced systems** would need the Icelandic book's complex-ion formation constants
  (`m68869`) or another new source — Siggi's call.
- **Aqueous temperature stresses stay directional.** They have a constant but no derivable ΔH,
  because `thermo.ts` carries no dissolved ions, so the numbers panel reports K as unknown. Their
  stored ΔH values are unsourced, and two describe the same chemistry differently: acetic acid is
  +5 (endothermic, id 8, offered a heating stress) and the acetic-acid buffer is 0 (id 24).
- **Water-gas naming** — `Vatnsgashvarfið` matches `jafnvaegisfasti`, but that is a spelling
  harmonisation; the corpus has no hits for either form, so it is Siggi's call.
- **Names that need a naming ruling.** Id 1 is called `Díköfnunarefnisoxíð`, which names N₂O, not
  N₂O₄; `1-ar/nafnakerfid` says `Díniturtetroxíð` and the textbook `tvíköfnunarefnistetraoxíð`.
  Ids 6 and 22 say `komplex` and `ligandskipti` where `ordabok.md` has `flóki`/`flókajón` and
  `tengill`; id 17's `Gufuumbrot` (steam reforming) has no corpus support; the principle is called
  `Le Chatelier meginreglan` where the book's one use is `lögmál Le Chateliers`; and the menu's
  `Veltudæmi` bullet is not a word anyone could source.
- **i18n is partial** — 7 `t()` calls, the rest hardcoded Icelandic; see `docs/i18n-coverage.md`.
