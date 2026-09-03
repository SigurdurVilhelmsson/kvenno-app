# Sýrufastinn

Year 3, chain position 3: **Gaslögmál → Jafnvægi → _Sýrufastinn_ → Varmafræði → pH Títrun → Stuðpúðar**

Phase 5 of `docs/plans/2026-08-16-games-roadmap.md`, the Ka/Kb gap. Started 2026-08-29,
finished 2026-09-03 once the four blocking rulings came in.

**Status: complete and registered.** Four phases, 61 tests, in `build-games.mjs`, on the
GamesHub card, and in the `Námsleiðin` chain of all five sibling Y3 games.

## What it fills, measured

February ruled Ka/Kb a _prerequisite_ of pH Títrun. Measured on 2026-08-29, that is
exactly right, and the shape of the hole is specific:

| Where                        | What it does with Ka                                                                                                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `3-ar/equilibrium-shifter`   | Teaches equilibrium **purely qualitatively.** No `Kc`, no `Kp`, no K values in the data or even in its `types.ts`. `QKComparison.tsx` compares Q and K as _widths of bars_ chosen from the shift direction — there is no number anywhere |
| `3-ar/ph-titration`          | **Computes** with Ka, Kb, `Kw/Ka` and `√(Ka·Ca)` correctly (`utils/ph-calculations.ts:40-105`), and hands the student `pKa` as `challenge.givenData.pKa`                                                                                 |
| `3-ar/buffer-recipe-creator` | Uses Henderson–Hasselbalch, `pH = pKa + log([A⁻]/[HA])`, with pKa given                                                                                                                                                                  |

So the platform went from "equilibrium shifts left or right" straight to "here is pKa,
substitute it". Nothing in between said what Ka **is**. `sýrufasti` — the glossary's own
word for it — had zero occurrences platform-wide.

**Still open, and deliberately not fixed here:** `equilibrium-shifter` remains entirely
qualitative. The scope ruling was the weak-acid case only, so general Kc/Kp and ICE for
arbitrary equilibria are untouched. That gap is real and is the obvious next Phase 5 item.

## The four rulings this was blocked on

Siggi, 2026-09-03:

1. **Kb is `basafasti`.** Now `base dissociation constant;basafasti` in `ordabok.md`.
2. **Percent dissociation is `klofnunarhlutfall`.** Now `percent dissociation;klofnunarhlutfall`.
   Note the near neighbours that make a wrong form tempting: `massaprósenta`,
   `rúmmálsprósenta` and `prósentuheimtur` all use `-prósenta`. This one is built on
   `dissociation;klofnun` instead, deliberately. `governed-terms.test.ts` bans
   `klofnunarprósenta` so nobody "corrects" it.
3. **The title is `Sýrufastinn`**, so the slug is `syrufastinn` and the chain string is fixed.
4. **Grade on the approximation, by the 5 % rule.** See below.

Scope and placement were ruled earlier (2026-08-29): the **weak-acid case only**, placed
immediately after Jafnvægi — following the concept it extends rather than sitting next to
the game that consumes it.

## The grading ruling, and why it was the right call

`3-ar/ph-titration` stores `initialPH: 2.87` for 0,100 M ediksýra (`data/titrations.ts:76`)
and `11.13` for 0,100 M ammóníak (`:138`). **Both are `√(Ka·C)` values.** Had this game
taught the exact quadratic and graded 2,88, two adjacent nodes of one chain would have
disagreed about the same beaker — the defect in numbers that the glossary work spent a week
eliminating in words.

So `referencePH` quotes the approximation where the 5 % rule licenses it and the exact root
where it does not, and a test asserts it reproduces both of pH Títrun's stored values.

**Accepting both routes needs no special case, and the arithmetic says why.** Since
`h_exact = h_approx·√(1−α)`, the pH gap is `−½·log₁₀(1−α)`, which under the 5 % rule is at
most **0,0111** — inside the ±0,02 rounding tolerance. A student who solved the quadratic
therefore lands in tolerance automatically. `EXACT_APPROX_MAX_GAP` names that bound and a
test pins `PH_TOLERANCE` above it, because tightening the tolerance below ~0,012 would start
marking correct quadratic solutions wrong.

> An earlier draft of `grade.ts` put that gap at 0,022 — that is `−log₁₀(1−α)`, missing the
> factor of ½ from the square root — and built a second comparison branch on the strength of
> it. The branch was unreachable. The half matters, and the test now carries the derivation
> rather than the assertion.

**What the grader deliberately does not claim.** Across most of the pool the two roots agree
to well inside tolerance, so a correct answer is _not_ evidence of which method the student
used. `PHGrade` therefore exposes `approximationValid` — a property of the problem, always
known — and nothing that purports to identify the route. Feedback may say the rule held; it
may not say the student approximated.

## Two defects found and fixed while building the Apply set

Both were in problems I had just written, and both are shapes this repo has shipped before.

- **A question that disagreed with its own grader.** `apply-ka` asks for Ka given
  pH = 2,87 in a 0,100 M solution, and stored the tidy table value 1,8 × 10⁻⁵. The stated pH
  actually implies **1,84 × 10⁻⁵** — 2,5 % away, outside the 1 % tolerance. A student doing
  the arithmetic correctly would have been marked wrong. The answer is now computed by
  `kaFromMeasuredPH` from the pH the question states.
- **A tolerance that accepted zero.** `apply-klofnun` originally asked for fenól's
  klofnunarhlutfall at 1,0 M — **0,0011 %** — under an absolute ±0,1 percentage-point
  tolerance, which accepts a bare `0`. That is B13 exactly. Klofnunarhlutfall is now graded
  relatively and the question uses ediksýra at 0,100 M (1,33 %), where the answer is a
  number a student can reason about.

`problems.test.ts` guards both, and each was verified to fail against the pre-fix code.
The general guard is `never lets a tolerance admit a trivially wrong answer`, which asserts
no problem accepts `0`, double, half, or `NaN` — a property, rather than trust in the choice
of comparison mode.

A related tolerance finding, now encoded: **Ka back-calculated from a two-decimal pH cannot
be graded at 1 %.** Ka ∝ [H⁺]², so ±0,005 in pH is 2·ln10·0,005 = **2,3 %** in Ka before the
student rounds anything. `KA_FROM_PH_TOLERANCE` is 5 %.

## The data

**Ka values are Brown et al., _Chemistry: The Central Science_, Appendix D, 25 °C** — the
textbook the platform already cites by name on `buffer-recipe-creator`'s menu, and the source
whose acetic-acid Ka `ph-titration` is already computing with.

**Not verified against the school's own copy.** `~/dev/repos/namsbokasafn-efni` is not
reachable from a cloud session. The pool is therefore restricted to acids whose Ka does not
disagree between sources — HNO₂ (4,5 vs 5,6 × 10⁻⁴) and HCN (6,2 vs 4,9 × 10⁻¹⁰) are absent
for that reason. **This is the one thing worth checking before the game is put in front of a
class.**

Every Icelandic name already ships elsewhere on the platform; `nameEstablished` records
where, and a test requires it non-empty.

### Names the platform cannot agree on

Three acids that would otherwise belong are excluded because the platform contradicts
itself, and these want a ruling:

| Acid      | Forms shipped                                                                                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HF        | `Flússýra` (`ph-titration/data/titrations.ts:87`), `Flúorsýra` (`2-ar/intermolecular-forces/components/Level1.tsx:426`), `flúorsýru` (`ph-titration/data/level2-puzzles.ts:82`, `level3-challenges.ts:303`) — **two words inside one game** |
| HNO₂/HNO₃ | `saltpéturssýra`, `saltpétursýru` (one `s`, `ph-titration/data/level2-puzzles.ts:52`), `salpeturssýru` (missing `t` and accent, `equilibrium-shifter/data/equilibria.ts:415`)                                                               |
| H₃PO₄     | `Fosfórsýra` and `fosforsýru` (accentless, `equilibrium-shifter/data/equilibria.ts:856`) — B5 already ruled `Fosfór`, so this is a missed site of an existing ruling, not a new question                                                    |

Also spotted, unrelated to this game: `brennisteinsýru` with one `s`
(`2-ar/hess-law/components/Level2.tsx:177`), and `Benzoesýrustuðpúði`
(`buffer-recipe-creator/data/problems.ts:146`) with a `z`.

## Guards on the data

- **`protons`** keeps polyprotic acids out of every calculation, the `lausnir` `form` /
  `molmassi` `state` pattern: the data declares what it is, so the generator cannot pose a
  question the engine answers wrongly.
- **`isAnswerable(acid, concentration)`** applies the same discipline to the _pair_.
  `solveWeakAcid` neglects water's own H⁺, and at 0,1 M fenól that is 2,8 % of the total —
  the pH the game would grade is not the pH the solution has. Fenól at 1,0 M is fine; below
  that it is refused. 6 of 28 pairs are rejected, and a test asserts the guard rejects
  something so it cannot quietly become vacuous.

The Æfa set is entirely inside the 5 % rule; the Beita set is not, and its rule-breakers are
real pairs from the pool (maurasýra at 0,05 M and below), not contrived. A rule that never
fires is a rule nobody believes.

## Layout

```
src/engine/ka.ts              equilibrium maths; no React, no Icelandic
src/engine/grade.ts           the grading ruling, and the tolerances it implies
src/data/acids.ts             acids, with protons / nameEstablished / answerability guards
src/data/problems.ts          the Æfa and Beita sets, generated from the engine
src/components/               ExploreScreen, UnderstandScreen, PracticeScreen, ApplyScreen, KlofnunBar
src/__tests__/                61 tests across ka, grade, problems, chain-string
```

## Tests

61. They check the engine against literature values rather than against itself: the exact
    root satisfies `x² + Ka·x − Ka·C = 0`; the approximation always overestimates `[H⁺]`;
    `approximationValid` flips exactly at 5 %; `Ka·Kb = Kw` for every acid; `kaFromMeasuredPH`
    round-trips; non-physical inputs throw rather than returning `NaN`; the quoted pH reproduces
    pH Títrun's stored 2,87 and 11,13; every Apply problem accepts its own answer and rejects
    zero, double, half and `NaN`; every number in student-facing text uses the Icelandic decimal
    comma; and `chain-string.test.ts` asserts all six Y3 games print the same `Námsleiðin` and
    that every game the build script emits has an entry — which nothing enforced before.
