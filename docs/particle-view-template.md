# Particle views: the Agnasýn template

Agnasýn (`apps/games/3-ar/ph-titration`, 2026-11-14, PR #147) shows one titration three ways at
once: the particles in the flask, the equations, and the curve as far as the NaOH added. Siggi
asked for its design and logic to be the template for later visualisation modules. This file is
that template: what to copy, in what order, and why each rule is there. Read the game's README
section `## Agnasýn` beside it for what the screen itself teaches.

## What it is

An Explore-phase screen inside an existing game, opened from the first card on the menu. Nothing is
graded, scored, timed or stored. A visualisation is a teaching scene, not a level, so it does not
report `N af M rétt` and it does not gate anything.

## The files, and what each one owns

| File                            | Owns                                                    | Rule                                |
| ------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| `utils/agnasyn.ts`              | The chemistry: constants, pH, species, particle counts  | Pure. No React, no randomness       |
| `utils/particles.ts`            | The particle system: positions, drift, reactions, fades | Pure apart from an `rng` passed in  |
| `data/agnasyn-steps.tsx`        | The scenes: title, volume, equations, text, note        | Every number printed is computed    |
| `components/ParticleBeaker.tsx` | Drawing the system in SVG; the frame loop               | Holds no chemistry                  |
| `components/ProgressCurve.tsx`  | The curve drawn to the current volume, with markers     | Reads the same `pHAt` as the beaker |
| `components/NaOHDissolve.tsx`   | A side panel for one process (the solid dissolving)     | Optional, per scene                 |
| `components/Agnasyn.tsx`        | Scene navigation, playback, slider, readouts, legend    | The only stateful screen            |

Keep the split. The chemistry and the particle system are tested without a DOM; the components only
draw what those two say.

## Logic

1. **One source of truth for the numbers.** Take every value from the function the game already
   uses (here `calculateWeakStrongPH`, which draws every curve in Stig 2) and derive the rest from
   it: the species from the pH, the readout from the species. A visualisation that computes its own
   pH will one day disagree with the level beside it, in front of a class. Pick the worked example
   from the textbook if one exists (here ch. 14, equivalence at pH 8,72) so the screen, the book
   and the game describe one flask.
2. **Particles are amounts on a fixed scale.** Choose particles per mmól so the main species is a
   readable number (8 per mmól gives 20 acid molecules, and one Na⁺ plus one OH⁻ per 1,25 mL).
   Every count drawn is the amount rounded, and a test holds that (`agnasyn.test.ts`). Do not tune
   counts for looks.
3. **Exaggerate only where a scene is about something too small to see, and say so.** The ionised
   acid at the start is 0,27 of a particle; acetate's OH⁻ at equivalence is 0,002. At exactly those
   two volumes one pair is drawn with a dashed ring, a note names it as exaggerated, and it gives
   the true value (`trueMinorParticles`). Everywhere else the true count stands, even when it is 0.
4. **Show equilibrium as dynamic.** Where a flagged pair is drawn, one pair recombines while another
   forms every few seconds (`flicker`). A frozen pair teaches that the reaction stopped.
5. **Model the stoichiometry, not the kinetics.** `particleCountsAt(v)` is the reaction table in
   particles: each OH⁻ added turns one acid into its conjugate base until none is left, then
   accumulates. The particle system animates the change; it never decides it.
6. **Formulas printed from the counts.** Henderson-Hasselbalch is shown as `log(5/15)` from the
   particles on screen, and the text says where it parts from the curve (4,74 against the ICE root's
   4,75 at half-equivalence). When two correct numbers differ in the last digit, say why on screen
   rather than rounding one to match.
7. **Scenes are data.** A `Step` is `{ title, volume, drip, dissolve?, equations, body, note? }`.
   Navigation tweens the volume from the last scene's to this one's (0,7 s per drop), so beaker, pH
   readout and curve move together. The last scene is a free slider with jump buttons to the
   points the scenes taught.

## Design

- **Three views, one volume.** Top to bottom: the scene title and its equations, then beaker and
  curve (side by side from `sm:` up, stacked on a phone) with the legend and the scene buttons, then
  the scene text beside the numbers table (side by side from `lg:` up). The title and equations
  stay above the picture so a class reads the reaction before watching it. One `volume` drives
  beaker, readout and curve.
- **One colour and glyph per species, held everywhere**: in the flask, in the legend
  (`ParticleGlyph`), and in the table. A label inside the glyph (`HA`, `A⁻`, `+`, `−`) so colour is
  never the only cue.
- **A spectator is drawn faded once the scene has named it** (`dimSpectator`), and behind the
  reacting particles, so the eye goes to what changes.
- **Equations break only at the arrow** (`Eq`), so a 360 px phone never splits a species. A struck
  spectator in the full ionic equation leads into the net ionic one.
- **The true amounts are one tap away**: a `PhoneDisclosure` table of particles and concentrations
  under the views. A concentration shows `0` only when it is exactly zero; otherwise scientific
  notation.
- **Write the species the class writes.** Agnasýn says H⁺, not H₃O⁺, because Siggi's students do
  (2026-11-14). Ask before choosing.

## Platform rules it had to meet

Every one of these is enforced by a test or CI job, and every one bit during the build:

- Icelandic only; numbers through `formatDecimal` / `formatScientific`, never `toFixed` in a
  component; `agnasyn-screen.test.tsx` fails on any `\d.\d` in text or an `aria-label`.
- Terminology from `packages/shared/i18n/ordabok.md`; `governed-terms.test.ts` scans comments too
  (a constant once named for a "puff" of water tripped the `púffer` ban).
- Scrolling only through `@shared/utils` (`revealTop(..., { anyWidth: true })`, `focusTarget` on the
  new scene's heading). A panel inserted above the view shifted it out of sight through scroll
  anchoring; the scene container carries `[overflow-anchor:none]`.
- Reduced motion: no drift, no swims, every change at once (`still`). The screen test runs that way.
- Every moving SVG carries `data-live`, or `desktop-compare` reports it on every PR.
- Each screen gets a path in `e2e/mobile-game-screens.ts`, named by visible labels, and must not
  scroll sideways at 360 px.
- Particles overlap unless pushed apart (`separate()` in `step`).

## Tests to copy

- **Chemistry against the book**: the pH at each scene's volume equals the book's numbers, and Ka
  traces to `packages/shared/data/appendix-d.ts`.
- **Counts equal rounded amounts** at every scene volume and across the slider's range.
- **The particle system through a whole run**: drip from start to end and check `realCounts` after
  every drop; then 200 random slider moves with a seeded `rng`, checking after each.
- **The screen walked as a student would**, reduced motion, fake timers: each scene's heading,
  pH readout, particle `aria-label`, exaggeration note present exactly when the scene has one,
  and focus on the new heading.

## Adapting it

For a new system, replace `utils/agnasyn.ts` (constants, `pHAt` or its equivalent, `speciesAt`,
`particleCountsAt`, which volumes are flagged) and `data/*-steps.tsx`. `particles.ts`,
`ParticleBeaker.tsx` and `ProgressCurve.tsx` are written around titration species (`Kind`) and a
volume axis; for a second consumer, move them to `packages/shared` with the species as a parameter,
rather than copying them into another game. Open review items for Agnasýn itself are C23 in
`docs/REVIEW-QUEUE.md`.
