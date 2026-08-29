# Sýrufastinn (working title)

Year 3, chain position 3: **Gaslögmál → Jafnvægi → _Sýrufastinn_ → Varmafræði → pH Títrun → Stuðpúðar**

Phase 5 of `docs/plans/2026-08-16-games-roadmap.md`, the Ka/Kb gap. Started 2026-08-29.

**Status: foundation only.** The engine, the acid data and 19 tests exist and pass.
No components, no i18n, not registered in `build-games.mjs`, not on the hub, and the
chain string in the five existing Y3 games is untouched. Several questions below
block the Icelandic content, and the title itself is unconfirmed.

## What it fills, measured

February ruled Ka/Kb a _prerequisite_ of pH Títrun. Measured on 2026-08-29, that is
exactly right, and the shape of the hole is specific:

| Where                        | What it does with Ka                                                                                                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `3-ar/equilibrium-shifter`   | Teaches equilibrium **purely qualitatively.** No `Kc`, no `Kp`, no K values in the data or even in its `types.ts`. `QKComparison.tsx` compares Q and K as _widths of bars_ chosen from the shift direction — there is no number anywhere |
| `3-ar/ph-titration`          | **Computes** with Ka, Kb, `Kw/Ka` and `√(Ka·Ca)` correctly (`utils/ph-calculations.ts:40-105`), and hands the student `pKa` as `challenge.givenData.pKa`                                                                                 |
| `3-ar/buffer-recipe-creator` | Uses Henderson–Hasselbalch, `pH = pKa + log([A⁻]/[HA])`, with pKa given                                                                                                                                                                  |

So the platform goes from "equilibrium shifts left or right" straight to
"here is pKa, substitute it". Nothing in between says what Ka **is**.
`sýrufasti` — the glossary's own word for it — has **zero occurrences** platform-wide.

## Scope, as ruled

Siggi, 2026-08-29: **the weak-acid case only.** Not general Kc. So this game teaches
the K expression and ICE reasoning for `HA ⇌ H⁺ + A⁻` specifically, and the general
quantitative-equilibrium gap in `equilibrium-shifter` is left open and recorded here.

Placement, also his ruling: immediately after Jafnvægi, i.e. it follows the concept it
extends rather than sitting next to the game that consumes it.

## The design decision everything else follows from

**The exact quadratic is the source of truth; `√(Ka·C)` is a thing the student is
taught to _check_, not something the game secretly relies on.**

`ph-titration` computes initial pH as `-log₁₀(√(Ka·Ca))` with no validity test
(`ph-calculations.ts:57-58`). That is fine for the acids it ships, but it is the habit
this game exists to replace: a student who cannot say _why_ the approximation is
allowed cannot tell when it stops being. So `solveWeakAcid` returns both roots, the
relative error between them, and `approximationValid` against the 5 % rule.

`kaFromMeasuredPH` runs the other direction — measure pH, recover Ka — so that in the
Explore phase Ka arrives as something derived from an observation, not as a number
handed over in a table.

## Verify before this ships

**Every Ka value needs checking against the school's textbook.** Literature differs in
the second significant figure between sources — HNO₂ is quoted as both 4.5 × 10⁻⁴ and
5.6 × 10⁻⁴, HCN as both 6.2 × 10⁻¹⁰ and 4.9 × 10⁻¹⁰ — and the number a student is
graded against must be the one they were taught. The corpus at
`~/dev/repos/namsbokasafn-efni` is not reachable from a cloud session, so this was not
checkable here. Three acids ship so far, all with names already established elsewhere
on the platform; the pool is deliberately small until the values are confirmed.

## Open questions — these block the Icelandic content

1. **Kb has no governed term.** `ordabok.md` has `acid dissociation constant;sýrufasti`
   but nothing for the base constant, and `basafasti` has zero hits platform-wide.
   The `-fasti` pattern is well established (`jafnvægisfasti`, `hraðafasti`,
   `myndunarfasti`, `klofningsfasti vatns`), but coining from a pattern is still
   coining, which this repo forbids.
2. **Percent dissociation has no term either.** `ordabok.md` has `dissociation;klofnun`
   and nothing for the percentage. The game cannot teach the 5 % rule without a word
   for what the 5 % is _of_.
3. **The game's title.** `Sýrufastinn` is a placeholder chosen to match the glossary
   term. It fixes the slug, the hub card and the chain string in all five existing Y3
   games, so it is worth deciding before any of that is wired.
4. **Exact or approximate, for grading?** See below — this one is a finding, not just
   a preference.

## A finding: the platform's quoted pH values are the approximate ones

`3-ar/ph-titration/src/data/titrations.ts` stores `initialPH: 2.87` for 0.100 M acetic
acid (`:76`) and `initialPH: 11.13` for 0.100 M ammonia (`:138`). Both are the
**approximation**:

|                         | 0.100 M CH₃COOH, Ka 1.8 × 10⁻⁵ | 0.100 M NH₃, Kb 1.8 × 10⁻⁵ |
| ----------------------- | ------------------------------ | -------------------------- |
| `√(Ka·C)` approximation | 2.8725 → **2.87**              | **11.13**                  |
| Exact quadratic         | 2.8753 → **2.88**              | **11.1247**                |

Neither is wrong — the approximation is the textbook convention and is well inside the
5 % rule here. But if this game teaches the exact route and grades 2.88 while pH Títrun
starts its curve at 2.87, two adjacent nodes of one chain disagree, which is the defect
the glossary work spent a week eliminating in words.

**Recommendation:** grade on the approximation wherever it is valid — that is what the
textbook and the exam do — teach the exact solution as the check that licenses it, and
accept both inside tolerance. That keeps the chain consistent without teaching the
student to substitute blindly. Not implemented either way pending a ruling.

## Layout

```
src/engine/ka.ts          the whole graded surface; no React, no Icelandic
src/data/acids.ts         acids with Ka, protons, and a nameEstablished flag
src/__tests__/ka.test.ts  19 tests
```

`protons` guards the monoprotic-only scope the same way `lausnir`'s `form` and
`molmassi`'s `state` guard theirs: the data declares what it is, so a generator cannot
ask a question the student cannot correctly answer. `MONOPROTIC_ACIDS` is the only pool
a calculation question may draw from, and a test asserts the guard is load-bearing
rather than vacuous.

## Tests

19, all passing. They check the engine against literature values, not against itself:
the exact root satisfies `x² + Ka·x − Ka·C = 0`; the approximation always overestimates
`[H⁺]`; `approximationValid` flips exactly at 5 % dissociation; `Ka·Kb = Kw` for every
shipped acid; `kaFromMeasuredPH` round-trips; non-physical inputs throw rather than
returning `NaN`; and a pH implying more than full dissociation is refused.

## Not done

Components, i18n, `build-games.mjs` registration, the `GamesHub` card, and the chain
string in `gas-law-challenge`, `equilibrium-shifter`, `thermodynamics-predictor`,
`ph-titration` and `buffer-recipe-creator` — six edits that all depend on the title.
