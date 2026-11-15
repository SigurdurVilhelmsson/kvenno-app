# Hvarfhraði

Chain position 6 in Year 2, between Lögmál Hess and Oxun og afoxun. The game teaches what
`hvarfhraði` is and what changes it (concentration, temperature, catalysts, surface area,
collisions), how to read a `hraðalögmál` and the `stig efnahvarfs` from initial-rate data, and how
a `hvarfgangur` of elementary steps, with its `hraðatakmarkandi` step and `milliefni`, gives the
rate law. The menu credits Kafli 14 of Brown et al.

## Structure

Three levels, none gated, each picked from the menu.

| Stig | Menu name             | What it asks                                                                           |
| ---- | --------------------- | -------------------------------------------------------------------------------------- |
| 1    | `Stig 1: Hraðahugtök` | 6 multiple-choice questions, with the `Gagnvirk hermun` demos on the same screen       |
| 2    | `Stig 2: Hraðalögmál` | Teach screen, then 6 initial-rate tables: pick the order in [A] (and [B]) from 0, 1, 2 |
| 3    | `Stig 3: Hvarfgangur` | Teach screen, then 8 mechanisms with a multiple-choice question each                   |

- **Stig 1** (`components/Level1.tsx`, data in `data/level1-questions.ts`) has no separate teach
  screen; under each question sit temperature and Ea sliders driving `MaxwellBoltzmann` and
  `CollisionDemo`, and a `CatalystEffectDemo` with its own sliders. Wrong answers get a
  misconception line in the shared `FeedbackPanel`.
- **Stig 2** (`components/Level2.tsx`, data in `data/level2-questions.ts`) grades the orders, and on
  `Reikna k` (the one challenge marked `asksForRateConstant`) also a typed k: `type="text"` +
  `inputMode="decimal"`, read through `parseStudentNumber` and graded at 2 % relative
  (`RATE_CONSTANT_TOLERANCE`). After each answer it prints `Hraðafasti: k = …`, derived from the
  table. A `ConcentrationTimeGraph` sits under the level.
- **Stig 3** (`components/Level3.tsx`, data in `data/level3-questions.ts`) shows each mechanism's
  steps marked slow, fast or fast equilibrium, and asks for the intermediate, the rate-determining
  step, the rate law or the catalyst. **Molecularity since 2026-11-15** (year-2 plan, Phase 4):
  the teach screen has a fourth card, `Sameindatala grunnhvarfs`, and challenges 7 and 8 ask
  for the molecularity and rate law of 2NO + O₂ → 2NO₂ and whether the decomposition of
  cyclobutane could be one unimolecular step, both the book's examples (kafli 12, Hvarfgangar,
  m68794). `molecularity.test.ts` derives each correct rate law from its step's reactants.

No level offers a retry, so a right answer is a right first answer. Each level reports
`N af M rétt` to the menu, or `Lokið` for a level saved in points before counts were kept.
Progress is in localStorage under `kinetics-progress`. There is no timed mode.

## What matters before touching it

**Stig 3's options are shuffled, and grading must look in the shuffled list (fixed 2026-08-26).**
The correct option was first in the data on all six challenges, so "pick the top one" scored full
marks. The options now shuffle in a `useMemo` keyed on the challenge index, as Stig 1's always did.
The trap: the option `id`s double as the visible letters, so the shuffle reassigns them a/b/c/d by
position, and the id a student clicks no longer names the same entry in `challenge.options`.
`checkAnswer` therefore reads `shuffledOptions`. `__tests__/option-order.test.tsx` plays every
challenge twice and fails against no shuffle and against a shuffle graded on the original array.
Stig 1's data also has the correct option in a fixed place and shuffles at render the same way —
not a defect (`docs/README.md`).

**The problem order is deliberately not shuffled.** The six challenges of each level come in data
order, for exam-style stability (`CLAUDE.md`, "Kinetics/Redox problem order shuffle"). That is a
choice about the order of problems, not about the place of the right option within one, and it
does not generalise to other games.

**Stored arithmetic is derived or checked.**

- Stig 2 printed a stored k, and `Flóknari tilfelli` showed 50 M⁻²s⁻¹ where its own rows give 5.
  k is now `rateConstantOf` (`data/level2-questions.ts`), from the challenge's first row.
  `__tests__/rate-constants.test.tsx` checks the shown k against every row of every table, that
  each table fits a single rate law, and that the k field rejects 0, double, half and `NaN`. The k
  field itself is decision 82 (a), 2026-10-01: `Reikna k` used to ask for k and grade only the
  orders.
- Two Stig 3 cards printed an overall equation their steps do not add up to (the ozone card, and
  the iodide-catalysed card at half scale). `__tests__/mechanisms.test.ts` adds up every
  mechanism, checks that a step's arrow, colour and label agree on whether it is an equilibrium,
  and holds the Cl₂ pre-equilibrium to `[Cl] = √(K[Cl₂])`.
- The half-life line for a zero-order reaction under `ConcentrationTimeGraph` said the opposite of
  the formula beside it; `__tests__/half-life.test.tsx` checks each order's line against t₁/₂.

**A hint never changes a result.** Stig 1 gave 20 for a right answer and 10 once the hint was
open — a real penalty, the shape `2-ar/hess-law` carried until 2026-08-26 — and points went from
every level with mobile-pass decision 1 (b) on 2026-10-03. `__tests__/hint-cost.test.tsx` plays
Stig 1 with and without every hint; `__tests__/right-count.test.tsx` plays all three with some
answers wrong and checks the count and the absence of any running score.

**The closing screen follows the last level finished, not Stig 3.** It used to open after Stig 3
whatever else was done, so a student who started there was told all three were finished.
`applyLevelResult` in `App.tsx` now opens it only once all three are complete;
`__tests__/app-complete.test.tsx`.

**Terminology, from mobile-pass decision 81** and enforced platform-wide by
`governed-terms.test.ts`: `hraðalögmál` for the rate law and `hraðatakmarkandi` for the
rate-determining step (2026-10-01, `ordabok.md` corrected to the book for the first), and
`stig efnahvarfs` / `heildarstig` for reaction order (2026-10-03). The last waited for decision 1,
so that `stig` would not mean level, points and order on one screen; it is neuter (`hvert er
stigið`), and question text uses the book's `stig með tilliti til A`. The rate-law rows read
`Stig í [A]:` (REVIEW-QUEUE C3, wording confirmed).

**Everything a student reads is checked by playing it.** `__tests__/screen-text.test.tsx` plays
all three levels right and wrong with hints open, the menu, the closing screen and the demos at
several settings, and also scans every string in the question data. It fails on a decimal point,
JavaScript exponent notation, English in the Icelandic UI (`Rate`, `Catalyst`, `Order`, `RDS`,
`vs` and others), literal markdown, a bare English gloss outside the book's `(e. …)` form
(decision 6 (c)), known misspellings, and forms `ordabok.md` replaces (it names
`hvarfgangur`, `milliefni`, `grunnskref`, `árekstrakenning`, `jafnvægisfasti`). Numbers that run to
10⁻¹⁵ % print through `utils/format.ts` (`__tests__/format.test.ts`: no mantissa of ten);
`keepFormulasWhole` stops a rate law such as `k[NO][Br₂]` breaking across lines on a phone
without changing its text (`__tests__/keep-formulas-whole.test.tsx`); and Stig 1's feedback no
longer shows literal `**Hugtak:**` (`__tests__/level1-feedback.test.tsx`).

**Demos.** The catalyst energy diagram keeps both peaks inside the plot across its Ea range, keeps
the catalysed Ea below the uncatalysed one, and names every slider (`__tests__/demos.test.tsx`).
The collision demo's `Árekstrar/sek` counter changes every run, so it carries `data-live` and
`scripts/desktop-compare.mjs` masks it; a new animated readout needs the same mark.

**The language switcher was stripped on 2026-09-19.** The game had no `t()` call and no `i18n.ts`
is left; `switcher-earns-its-place.test.ts` lists it among the stripped games and fails if the
switcher returns. All text is hardcoded Icelandic.

**Phones.** `__tests__/phone-scroll.test.tsx` holds the shared reveal and focus rules: a screen
swap opens at the top with its heading focused, focus goes to the feedback after `Athuga svar`,
`Næsta þraut` ignores a press within 400 ms, and opening a hint focuses the hint.

## Layout

```
src/App.tsx                            menu, closing screen, progress (localStorage key kinetics-progress)
src/main.tsx, src/styles.css
src/components/Level1.tsx              Stig 1: questions, MISCONCEPTIONS, the demos and their sliders
src/components/MaxwellBoltzmann.tsx    Stig 1 energy distribution and fraction above Ea
src/components/CollisionDemo.tsx       Stig 1 particle simulation (shared ParticleSimulation)
src/components/CatalystEffectDemo.tsx  Stig 1 energy diagram with and without a catalyst
src/components/Level2.tsx              Stig 2: teach screen, order buttons, k field
src/components/ConcentrationTimeGraph.tsx  Stig 2 [A] against t for orders 0, 1, 2
src/components/Level3.tsx              Stig 3: teach screen, mechanisms, shuffled options
src/data/level1-questions.ts           6 questions
src/data/level2-questions.ts           6 tables, rateConstantOf, rateConstantMatches
src/data/level3-questions.ts           6 mechanisms
src/utils/format.ts                    formatSignificant, formatPercent, formatFactor
src/utils/keep-formulas-whole.tsx      no-wrap spans for bracketed rate laws
src/__tests__/                         option-order, rate-constants, mechanisms, half-life,
                                       hint-cost, right-count, app-complete, screen-text, format,
                                       keep-formulas-whole, level1-feedback, demos, phone-scroll;
                                       playthrough.tsx and next-guard-clock.ts are helpers
```

There are no side files. Run the tests from the repo root
(`pnpm exec vitest run apps/games/2-ar/kinetics`): the render tests need the root config's DOM
environment.

## Nærmynd (2026-11-15)

The amber card above the levels opens a particle view of half-life, built on the template in
`docs/particle-view-template.md`. Nothing in it is graded or stored.

- **Two flasks side by side.** The first is the book's decomposition of H₂O₂ (ch12/m68791):
  1,000 M, halving every 6,00 klst., so 32 → 16 → 8 → 4 particles. The second is a zero-order
  reaction made up for the comparison, with the same start and the same first half-life, and the
  screen says so: the two agree at 6 klst. and the zero-order flask is empty at 12.
- `engine/rate-laws.ts` holds the integrated rate laws and the half-life formulas. They used to
  live inside `ConcentrationTimeGraph.tsx`, which now imports them, so the graph and the flasks
  cannot compute different answers. `engine/naermynd.ts` turns them into counts on a fixed
  scale (one particle per 1/32 of the start), rounded.
- Each particle has a fixed place and a fixed turn to react, so a time always draws the same
  picture. The caption under each flask gives the half-life from what is left: fixed at first
  order, shrinking at zero order.
- Scenes are data in `data/naermynd-steps.tsx`. The misconception it targets is that the second
  half takes as long as the first and then the reaction is over.

## Heildað hraðalögmál og Arrhenius (2026-11-15)

The second amber card opens the integrated rate laws, half-lives and the two-point Arrhenius
equation (year-2 audit, Phase 3; book ch. 12.4, m68791, and 12.5, m68793). It is not a level:
never marked done, counted toward nothing. Skilja: the three integrated laws, which plot is
straight and the half-lives, and `Arrheniusarjafnan`. Kanna: move [A]₀ at each order; only at first
order does the half-life stay put. Æfa: ten items, one attempt each, ending `N af M rétt`.

- **The numbers are the book's**: cyclobutane, butadiene, H₂O₂, cyclopropane, N₂O₅, HI and
  acetaldehyde, each item citing its example or exercise. The data says which formula answers
  it; the key comes from `engine/rate-laws.ts` (`timeToLeave`, `kFromHalfLife`,
  `activationEnergy`, beside the laws the graph and Nærmynd already share). `heildun.test.ts`
  holds every key to the answer the book prints where it prints one.
- **Grading.** Within 1 %, or 3 % for an activation energy so the book's two-figure answers
  pass (it gives HI's Ea as 1,8 × 10⁵ J/mól from the same two points that give 185 kJ/mól).
  Every graded number refuses 0, its negative, double and half. A wrong number is diagnosed
  where it can be: 80 % taken as what is left, the first-order formula on a second-order
  reaction, Ea in J or with log for ln.
- Terms are the book's: `heildaða hraðalögmálið`, `helmingunartími`, `virkjunarorka`,
  `hraðafasti`, `Arrheniusarjafnan`, which Stig 1 now writes too (it said `Arrhenius jafnan`).
- **Molecularity** (the rate law of an elementary step) is the one ch. 12 gap the plan listed that
  this does not cover. It is queued as a small follow-up.

## Open

- **The Maxwell–Boltzmann panel cannot show its tail** (mobile-pass decision 80). At real scale the
  fraction above Ea is tiny, so the shading is invisible at every setting; the recommendation is a
  magnified inset. The same item asks whether the catalyst demo should follow Stig 1's sliders —
  it copies them only on mount (`useState(temperature)` in `CatalystEffectDemo.tsx`), so the screen
  has two temperature sliders. The decisions doc records no ruling, and the code is unchanged,
  though REVIEW-QUEUE C3 lists items 12–122 as done.

**Fixed 2026-11-15** (year-2 audit, Phase 0). Stig 1 said a collision must have the energy to
`rjúfa tengsl`; a bond is `tengi`. Stig 2's bromate challenge holds [H⁺] fixed, and its
explanation now says the reaction is second order in H⁺, so the k worked from the table is
k[H⁺]². Stig 2's order buttons carry `aria-pressed`. `audit-2026-11-15.test.ts` holds all three.
The new wording was drafted by Claude. The rate tables' mixed figures (P2 in the plan) are still
open.

**Closed.** The Stig 3 option order (2026-08-26), the hint penalty, the running score (decision 1
(b)), the k field (decision 82), the terminology of decision 81, and the closing screen, all above.

## Leftovers

Not recorded anywhere else; found while writing this file.

- **Stig 1 shows one hint tier of four.** Each question carries `TieredHints` (`topic`,
  `strategy`, `method`, `solution`), and the level renders `hints.method` only.
- **Unused question types:** `KineticsChallenge` allows `'slider'` and `'ordering'` with
  `sliderConfig` and `orderItems`; every question is `'multiple_choice'` and no component reads
  the other two.
- **`compareTemperature`** on `MaxwellBoltzmann` is passed by nothing.
- **Most of `styles.css` is dead.** Its custom classes (`rate-graph`, `graph-line`,
  `energy-profile`, `molecule`, `rate-law-builder`, `order-button`, `mechanism-step`, `catalyst`,
  `intermediate`, `animate-fade-in`, `animate-draw` and the rest) appear in no component; only its
  `animate-pulse` rule is reached, and that redefines Tailwind's utility of the same name.
