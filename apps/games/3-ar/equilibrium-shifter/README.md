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
streaks are Keppnishamur's only (mobile-pass decision 1 (b)). Lærdómshamur scores nothing and
counts instead: when the student goes back to the menu, it shows the sitting as
`Lærdómshamur, síðasta lota: N af M rétt`, kept under its own storage key
(`equilibrium-shifter-laerdomshamur`). The same stress on the same equilibrium, answered again
after its explanation has shown the answer, is not counted, nor is one given with the fourth hint
tier open (below). The first three tiers never change the count. `learning-count.test.tsx` holds
this, and which answers add to `problemsCompleted`.

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

**22 of the 30 systems carry a sourced constant; 8 carry none, each with a written reason.**
`src/data/constants.ts` takes acids, bases and Ksp from `@shared/data/appendix-d`, gas-phase Kc
from the ch. 13 citations `jafnvaegisfasti` already carries, the two complex ions from the
Icelandic book's appendix K (`m68869`, Siggi's ruling 103, 2026-10-23: Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ at
Kf = 8,9 × 10², and the copper ammine written coming apart, so `Kd = 1/Kf`), and a reaction
written backwards takes `1/K` rather than a second lookup. Appendix K states no temperature, so the
complex ions' temperature stresses say K moves without saying how far. `numbers.test.ts` asserts
the count of unsourced systems is exactly eight, so quietly supplying one fails. Starting mixtures (`STARTING_MIXTURES`) are the
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
src/data/constants.ts             sourced K per system, the eight unsourced reasons, starting mixtures
src/data/index.ts                 data exports
src/engine/stress.ts              what a stress does to Q, K and the mixture
src/utils/le-chatelier.ts         the qualitative shift and its explanations
src/components/QKComparison.tsx   the Q vs K bars, drawn from the shift direction
src/components/NumbersPanel.tsx   the same comparison in computed numbers
src/components/ParticleEquilibrium.tsx  particle picture
src/types.ts, src/i18n.ts, src/styles.css, src/main.tsx
src/__tests__/                    le-chatelier, numbers, numbers-panel, qk-pressure,
                                  screen-anchoring, bar-labels, learning-count, ruled-names
```

**On a phone (2026-09-23).** Everything below `sm` is a phone layout and `sm:`/`md:` restore the
desktop one, which was checked pixel-identical at 1280 and 768. Four choices are not obvious:

- **Reactants and products stay side by side at every width.** Stacking them put "left" above
  "right", and the whole game is about which way the equilibrium moves. Below `md` each molecule is
  an inline-block so a long side wraps between molecules.
- **Where the page goes (`@shared/utils`, vertical-scroll pass 2026-09).** The game's own
  `utils/reveal.ts` is gone. A new question (`useItemTop`) or screen scrolls its top back into view
  when it is above the viewport, at every width, as before. On a phone only: the task comes
  straight after the reaction and the particle picture follows it (CSS `order`, which moves only
  the pictures); choosing a stress or «Prófa annað álag» brings the card's top back; an answer
  shows the verdict at the top of the screen once the prediction buttons have faded, and the
  student reads down to Næsta, which stays at the foot of the explanation (read in full, design
  §5); Aðgengisval starts closed; on its side the card is two columns. At every width focus moves
  to the equation, the question, the stress list, the feedback or Lærdómshamur, and a press on a
  feedback button within 400 ms of it appearing is dropped (`useArmedAfter`), so a double tap on
  a prediction cannot skip the explanation. Screen swaps do not use `useScreenTop`: the screens
  fade (`FadePresence`), which mounts the new one a render later, so the same steps run as its
  root attaches — and without setting state, because every render of `App` re-seeds the particle
  picture from `Math.random`.
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

## Fixed 2026-10-23: acetic acid's heating stress, and the names

- **Acetic acid offers no temperature stress** (mobile-pass decision 102 (b)). Id 8 stored an
  unsourced ΔH = +5 kJ/mól and answered heating as a shift, while id 24, the same reaction written
  with hydronium, stored 0; the literature value is near 0. Id 8's heating stress is gone, and the
  stored value stays: the book's table of species in water, transcribed 2026-10-23, has no row
  for CH₃COOH(aq) or CH₃COO⁻(aq), so option (a) has nothing to source it from.
  `ruled-names.test.ts`.
- **The names are ruled** (decision 104). Ids 6 and 22 are `Járn-þíósýanatflókajón` and
  `Kopar-ammóníakflókajón`, and id 22's description says `tenglaskipti`. Id 17 is
  `Hvarf metans og vatnsgufu`, the textbook's phrase (`ch13/m68801`). Ids 23 and 27, each one
  reaction, are named for their equations: `Bruni kolefnis í kolmónoxíð` and
  `Fyrsta klofnunarþrep fosfórsýru`. The principle is `lögmál Le Chateliers` throughout the
  Icelandic, as the book has it, and the Lærdómshamur card's last bullet reads `Útskýrð svör`.
  Id 1's name (decision 15), `Snertiferlið` (17) and `Vatnsgashvarfið` (19) were already applied.
  `ruled-names.test.ts` holds the names, and `icelandic-text.test.ts` bans the old forms.

## Fixed 2026-10-23: the Keppnishamur gate opens

The card promises Keppnishamur opens after five problems in Lærdómshamur, and the menu counts
them as «Verkefni kláruð», but only the end of a Keppnishamur round wrote that count, so the gate
in front of Keppnishamur could never open. On 2026-09-19 Siggi ruled that the gate stays; on
2026-10-23 Siggi ruled what it counts (mobile-pass decision 101 (a)): each right Lærdómshamur answer
the sitting counts adds one. A repeat the game had already shown, and a wrong answer, add nothing.
A Keppnishamur round still adds its right answers. `learning-count.test.tsx` plays five right
answers and opens Keppnishamur.

## Fixed 2026-10-23: the fourth hint tier gives the answer

Item 1 as applied, call 3/7, Siggi 2026-10-23. The fourth tier of Lærdómshamur's hints prints
`Rétt svar: …` with the explanation, so an answer given with it open is one the game had already
shown: it is not counted in the sitting's `N af M rétt` and adds nothing to `problemsCompleted`,
right or wrong. A right one says so under the verdict:
`Síðasta vísbendingin gaf svarið, svo svarið telst ekki með.` (the sentence `gas-law-challenge`
uses for its last hint). Tiers 1–3 stay free (decision 2). The tiers close with each new stress,
so a fourth tier opened on one stress does not reach the next. Keppnishamur has no hints.
`learning-count.test.tsx` (`does not count an answer the fourth hint tier gave, …`) holds it.

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

- **The eight unsourced systems** (hemoglobin, the two with nothing on one side of K, five gas
  reactions the book gives no number for) have no source on the platform. The two complex ions
  were sourced from `m68869` on 2026-10-23.
- **Most aqueous temperature stresses stay directional.** `thermo.ts` has carried every (aq) row
  of the book's `m68865` since 2026-10-23 (Siggi's ruling). That derives ΔH for water's
  autoionisation (+55,83, was 56) and AgCl dissolving (+65,4, was 65), but the book has no row for
  the weak acids, ammonia, SCN⁻ or the complex ions in water, so ids 6, 8, 9, 21, 22, 24 and 27
  keep a stored, unsourced ΔH and the numbers panel reports K as unknown when they are heated. Acetic acid's +5 (id 8) no longer reaches a question (below), but
  it still disagrees with the 0 stored for the same chemistry as id 24 until a source is ruled on.
- **i18n is partial** — 7 `t()` calls, the rest hardcoded Icelandic; see `docs/i18n-coverage.md`.
