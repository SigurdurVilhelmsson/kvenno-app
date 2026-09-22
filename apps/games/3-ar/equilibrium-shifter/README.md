# Jafnvægisstjóri

Chain position 3 of 8 in Year 3, between Jafnvægisfastinn and Sýrufastinn. The node is labelled
**Hliðrun jafnvægis** in the `Námsleiðin` string (`src/App.tsx:469-470`), not by the game's title,
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
| **Keppnishamur** | 10 questions, a random stress each, 20 seconds per question (`CHALLENGE_SECONDS`, `App.tsx:34`), points, streaks and a speed bonus             |

The Q vs K and numbers panels render in learning mode and after any wrong answer in challenge mode
(`App.tsx:704-746`). Hints are free: `HintSystem` is passed `showPointCost={false}`.

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
src/__tests__/                    le-chatelier, numbers, numbers-panel, qk-pressure
```

The shared pieces it depends on: `packages/shared/engine/equilibrium.ts`,
`packages/shared/data/thermo.ts`, `packages/shared/data/appendix-d.ts`. `MIGRATION-SUMMARY.md` is a
historical record of the port from the old HTML game and is out of date on most specifics.

## Open

- **The Keppnishamur gate cannot be opened.** It requires `progress.problemsCompleted >= 5`
  (`App.tsx:422-424`), but the only write to `problemsCompleted` is at the end of a challenge round
  (`App.tsx:336-337`). Learning mode never updates it, so a new student can never reach challenge
  mode. The gate itself was already flagged as needing a ruling (a mode gate, outside the
  2026-08-29 level-gating ruling); it now also needs fixing or removing, whichever the ruling is.
- **Learning mode shows points.** A correct answer prints `+N stig!` with a streak bonus in both
  modes (`App.tsx:764-770`), against the no-scoring-during-learning rule.
- **The ten unsourced systems** would need the Icelandic book's complex-ion formation constants
  (`m68869`) or another new source — Siggi's call.
- **Aqueous temperature stresses stay directional.** They have a constant but no derivable ΔH,
  because `thermo.ts` carries no dissolved ions, so the numbers panel reports K as unknown.
- **Water-gas naming** — `Vatnsgashvarfið` matches `jafnvaegisfasti`, but that is a spelling
  harmonisation; the corpus has no hits for either form, so it is Siggi's call.
- **i18n is partial** — 7 `t()` calls, the rest hardcoded Icelandic; see `docs/i18n-coverage.md`.
