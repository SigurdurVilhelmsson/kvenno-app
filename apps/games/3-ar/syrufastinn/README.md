# Sýrufastinn

Year 3, chain position 4 of 8: **Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis → _Sýrufastinn_ → Varmafræði → pH Títrun → Stuðpúðar → Leysnijafnvægi**

Phase 5 of `docs/plans/2026-08-16-games-roadmap.md`, the Ka/Kb gap. Started 2026-08-29,
finished 2026-09-03 once the four blocking rulings came in.

**Status: complete and registered.** Four phases, 76 tests, in `build-games.mjs`, on the
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

**Verified 2026-09-19.** Siggi supplied Tables D.1 and D.2 directly and every Ka here matches
D.1 exactly, so the earlier "not verified against the school's own copy" caveat is retired.
That check also settled the two disagreements that had kept acids out — HNO₂ (4,5 against a
competing 5,6 × 10⁻⁴) and HCN (4,9 against 6,2 × 10⁻¹⁰) — and both are now in the pool, which
is **nine acids, seven of them monoprotic**.

`appendix-d-conformance` lives inside `ka.test.ts`: its `D1` record must list every acid in
the pool, so a new acid cannot be added without stating the Appendix D row it came from.

Every Icelandic name either already ships elsewhere on the platform or carries the ruling that
established it; `nameEstablished` records which, and a test requires it non-empty.

### Names decline, so the data carries the cases

`WeakAcid` has `nameDative` and `nameGenitive` beside `name`. Icelandic needs the dative after
`af` (`lausn af ediksýru`, `af fenóli`, `af vetnissýaníði`) and the genitive after `samoka basa`,
and the pool spans all three genders — a rule that got `-sýra` right would still print
`af vetnissýaníð`.

This was a live defect until HNO₂ and HCN arrived: the templates interpolated
`name.toLowerCase()`, so the Æfa screen and every Beita rule-breaker read `lausn af flússýra`.
It was invisible while every acid was a feminine `-sýra` and obvious the moment a neuter and a
masculine joined them. Two tests in `problems.test.ts` now hold the templates to the declined
forms; both were verified to fail against the old interpolation.

### Names the platform could not agree on — all ruled, 2026-09-19

This section used to list three acids kept out of the pool because the platform spelled them
more than one way, plus two strays. **All five were ruled and swept in the same week**, and each
now has a row in `governed-terms.test.ts`, so the wrong forms cannot come back:

| Acid     | Ruled              | Was also shipped as                                            |
| -------- | ------------------ | -------------------------------------------------------------- |
| HF       | `flússýra`         | `Flúorsýra`, `flúorsýru` — **two words inside one game**       |
| HNO₃     | `saltpéturssýra`   | `saltpétursýru` (one `s`), `salpeturssýru` (no `t`, no accent) |
| H₃PO₄    | `fosfórsýra`       | `fosforsýru` — a missed site of the 2026-08-26 B5 ruling       |
| H₂SO₄    | `brennisteinssýra` | `brennisteinsýru` (one `s`)                                    |
| C₆H₅COOH | `bensósýra`        | `Benzoesýru`, `Benzoesýrustuðpúði`                             |

The HF ruling is the one to remember: it went **against platform frequency**, which stood 3 to 1
the other way. Counting occurrences is not how this is decided.

HNO₂ and HCN were a different problem — not two spellings but none. `ordabok.md` had no entry
for either acid or either conjugate base, so they waited on the four terms Siggi ruled the same
day: `saltpéturssýrlingur`, `nítrítjón`, `vetnissýaníð` (`blásýra`), `sýaníðjón`. They carry no
banned form, because nothing had ever spelled them wrong — nothing had spelled them at all.

## Guards on the data

- **`protons`** keeps polyprotic acids out of every calculation, the `lausnir` `form` /
  `molmassi` `state` pattern: the data declares what it is, so the generator cannot pose a
  question the engine answers wrongly.
- **`isAnswerable(acid, concentration)`** applies the same discipline to the _pair_.
  `solveWeakAcid` neglects water's own H⁺, and at 0,1 M fenól that is 2,8 % of the total —
  the pH the game would grade is not the pH the solution has. Fenól at 1,0 M is fine; below
  that it is refused. 10 of 49 pairs are rejected, and a test asserts the guard rejects
  something so it cannot quietly become vacuous.

The Æfa set is entirely inside the 5 % rule; the Beita set is not, and its rule-breakers are
real pairs from the pool (HF, maurasýra and saltpéturssýrlingur at the lower concentrations),
not contrived. A rule that never fires is a rule nobody believes.

### Beita: one rule-breaking pair per acid

**Siggi's ruling, 2026-09-22, built the same day.** Adding HNO₂ had taken Beita from 12 problems
to 16, twelve of them one generated template differing only in acid and concentration. It now
poses **seven**: the four hand-written problems (pH, Ka, Kb, klofnunarhlutfall) and one
rule-breaker per acid — `APPLY_RULE_BREAKERS` in `src/data/problems.ts`.

**Which pair per acid was not in the ruling, and the grader decided it: the most dilute.** Near
the 5 % line the gap between √(Ka·C) and the exact root is only about 0,011 in pH, inside
`PH_TOLERANCE` (±0,02), so a student who skipped the check was **graded correct** — while the
misconception text told them they had used the approximation. Five of the twelve old rule-breakers
were like that. The three kept are HF at 0,010 M (22,9 %, gap 0,056), saltpéturssýrlingur at
0,010 M (19,1 %, gap 0,046) and maurasýra at 0,010 M (12,6 %, gap 0,029), so the three still fail
by visibly different margins. `problems.test.ts` asserts one pair per rule-breaking acid, that it
is the most dilute, and that the approximate answer is rejected on every rule-breaker Beita poses.

## Layout

```
src/engine/ka.ts              equilibrium maths; no React, no Icelandic
src/engine/grade.ts           the grading ruling, and the tolerances it implies
src/data/acids.ts             acids, with protons / nameEstablished / answerability guards
src/data/problems.ts          the Æfa and Beita sets, generated from the engine
src/components/               ExploreScreen, UnderstandScreen, PracticeScreen, ApplyScreen, KlofnunBar,
                              ScientificKeys
src/utils/reveal.ts           brings a verdict, a first measurement or a new Skilja step on screen, only when off it
src/__tests__/                ka, grade, problems, chain-string, phone-input
```

## Playing on a phone

**The answer fields keep the decimal keypad, and two keys make up what it lacks.** Æfa's first
step and Beita's Ka and Kb are answered in scientific notation — the placeholder and the hints
show `1,3e-3` and `1,8e-5`, which is what `parseStudentNumber` reads — but a phone's decimal
keypad has no `e`, and an iPhone's has no minus either. Without them the only route to Beita's Kb
(5,6 × 10⁻¹⁰) was typing nine zeros. `ScientificKeys` puts an `e` key and a `−` key beside those
fields on touch screens only (`pointer-coarse:`), inserting at the caret without taking focus from
the field, so the keypad stays up. Desktop is unchanged. `phone-input.test.tsx` plays Æfa's x and
Beita's Ka and Kb through the keys, and asserts that every scientific answer in the game can be
keyed with keypad characters plus those two.

`revealIfBelowFold` exists because Beita's verdict renders under the klofnun bar: on a phone held
sideways and at 320 × 568 it landed below the bottom edge, so tapping "Svara" appeared to do
nothing. It scrolls only when the verdict is off screen and allows for the sticky header. Kanna
uses it for the first measurement, whose table row opens under the concentration buttons.
`revealTopIfAbove` is the same guard for Skilja: its step buttons sit under the step, so on a phone
the next step opened with its heading already scrolled past. It scrolls back to the heading only
when the heading is above the visible area.

## Tests

61. They check the engine against literature values rather than against itself: the exact
    root satisfies `x² + Ka·x − Ka·C = 0`; the approximation always overestimates `[H⁺]`;
    `approximationValid` flips exactly at 5 %; `Ka·Kb = Kw` for every acid; `kaFromMeasuredPH`
    round-trips; non-physical inputs throw rather than returning `NaN`; the quoted pH reproduces
    pH Títrun's stored 2,87 and 11,13; every Apply problem accepts its own answer and rejects
    zero, double, half and `NaN`; every number in student-facing text uses the Icelandic decimal
    comma; and `chain-string.test.ts` asserts all six Y3 games print the same `Námsleiðin` and
    that every game the build script emits has an entry — which nothing enforced before.
