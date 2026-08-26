# Phase 1: Stop teaching wrong chemistry — Implementation Plan

> **STATUS: executed 2026-08-18** on branch `fix/phase-1-correctness`. All four tasks and the
> whole-phase verification are done — `pnpm type-check` clean, `pnpm test` green (1061 passed,
> 3 expected-fail), `pnpm build` exit 0. Deviations and findings, so the record matches the code:
>
> - **Commit scopes.** The messages below use game-name scopes (`fix(ph-titration)`) which the
>   repo's own `commitlint.config.js` `scope-enum` does not allow. Shipped as `fix(3-ar)`,
>   `fix(1-ar)`, `fix(2-ar)` instead.
> - **Task 1.** `it.fails.each` does chain in this Vitest (4.1.10), so the three disagreeing
>   titrations are pinned as expected-failures rather than skipped. Measured gaps: id 6 HF
>   1.996 vs 2.08, id 11 H₂SO₃ 1.443 vs 1.5, id 12 oxalic 1.163 vs 1.3 — matching this plan's
>   table exactly. Their declared values still need a teacher decision.
> - **Task 2.** The eleven-element table was verified three ways independently before being
>   written; all three agreed with each other and with the plan on all 42 records. Two of the
>   seven in-pool mismatches are near-ties (Br 50.69/49.31, Ge 36.5/27.45), which sharpens the
>   derivability question this plan raises in Step 6 — recorded in `docs/README.md`.
>   The dead "Notaðu lotukerfið" pointer in the neutron question was deleted as part of the fix,
>   since it named a table that cannot answer it under any of the options. Whether the question
>   should name the nuclide is still open.
> - **Task 3.** The placeholder leak was real: L3-6 is the only `derivation` item with
>   `scientificNotation`, so `t.d. 1.08e12` printed that question's own key in the input box.
> - **Task 4.** Step 7's sweep found that a data-only scan overstates this defect by four files —
>   `nafnakerfid` L1, `lotukerfid` L2, `hess-law` L1 and `kinetics` L1 all shuffle at render and
>   are **not** defects. Two real cases remain: `kinetics` L3 (6/6) and `organic-nomenclature`
>   L3 (6/10).
> - **Not done, deliberately:** the seven Tier-0 items in "What this phase deliberately does not
>   do" below. Phase 1b is a decision for Siggi.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Fix four defects in shipped games that teach or grade chemistry incorrectly, and guard each one with a test that fails before the fix. Four, not all four — see _What this phase deliberately does not do_ for the seven Tier-0 correctness items this phase leaves standing.

**Architecture:** Four independent tasks, one per defect. Each follows the same shape: write a test that pins the correct value against a source of truth already in the repo, watch it fail, make the minimal fix, watch it pass, commit. No task depends on another; they can be done in any order or in parallel.

**Tech Stack:** Vitest (`globals: true`, jsdom), TypeScript, React 19. Tests live in `<game>/src/__tests__/*.test.ts`. Run with `pnpm vitest run <path>`.

**Spec:** `docs/plans/2026-08-16-games-roadmap.md` (Phase 1). Evidence for every defect: `apps/games/1-ar/CURRICULUM_REVIEW.md` and `apps/games/ORPHANED_GAMES_ASSESSMENT.md`.

## Global Constraints

- **All user-facing text must be in Icelandic.** Test names and code comments may be English.
- **Icelandic terminology is governed by `packages/shared/i18n/ordabok.md`.** Do not invent chemistry terms. If a fix requires a term not in the glossary, check `~/dev/repos/namsbokasafn-efni` before asking.
- **Commit subjects must be lower-case** (commitlint `subject-case`). `docs: fix the thing`, never `docs: Fix the Thing`.
- **Do not reformat files you are not fixing.** A prettier pre-commit hook runs on staged files only.
- **Do not change scoring, add timers, streaks, or hint penalties.** The April 2026 restructure removed them deliberately.
- **These fixes change live answer keys.** Where a fix changes what a student is told is correct, say so in the commit message.

---

### Task 1: pH titration initial-pH is 1000× out

**Files:**

- Modify: `apps/games/3-ar/ph-titration/src/utils/ph-calculations.ts:57,95,133,198`
- Test: `apps/games/3-ar/ph-titration/src/__tests__/ph-calculations.test.ts:51-56`

**Interfaces:**

- Consumes: `calculateWeakStrongPH(volumeAcid, molarityAcid, Ka, volumeBase, molarityBase): number` and `calculateStrongWeakPH(volumeBase, molarityBase, pKa, volumeAcid, molarityAcid): number`, both already exported. **Note the asymmetry — it is real, not a typo here:** the weak-acid function takes a `Ka` and derives `pKa` internally (`ph-calculations.ts:53`), while the weak-base function takes a **`pKa`** and derives `Ka` internally (`:83` declares the parameter, `:90` does `const Ka = Math.pow(10, -pKa)`). Passing a Ka to the second one silently returns nonsense.
- Produces: nothing new. Signatures are unchanged.

**Background.** `molesAcid = (volumeAcid * molarityAcid) / 1000` is **correct** — volume arrives in mL. But line 57 is `Math.sqrt(Ka * (molarityAcid / 1000))`, and molarity is already mol/L. The same error repeats at `:95` (weak base, via `Math.log10(molarityBase / 1000)`), `:133` and `:198` (diprotic and triprotic). Do not touch the `volume * molarity / 1000` lines.

The existing test at `:51-56` asserts only `1 < pH < 7`, so the wrong value 4.37 passes it. `src/data/titrations.ts:76` records the true answer: `initialPH: 2.87` for 25.0 mL of 0.100 M acetic acid, `Ka: 1.8e-5`.

- [x] **Step 1: Replace the loose assertion with one that pins the data file's own value**

In `apps/games/3-ar/ph-titration/src/__tests__/ph-calculations.test.ts`, replace the body of `it('returns acidic pH for initial weak acid solution', ...)`:

```typescript
it('returns acidic pH for initial weak acid solution', () => {
  // 25.0 mL of 0.100 M acetic acid, Ka = 1.8e-5.
  // pH = -log10(sqrt(Ka * C)) = -log10(sqrt(1.8e-6)) = 2.87
  // This is the value the game's own data asserts: data/titrations.ts:76 initialPH: 2.87
  const pH = calculateWeakStrongPH(25.0, 0.1, 1.8e-5, 0, 0.1);
  expect(pH).toBeCloseTo(2.87, 2);
});

it('initial pH does not depend on the volume of acid present', () => {
  // Concentration, not amount, sets the initial pH. A 1000x volume change must not move it.
  const small = calculateWeakStrongPH(25.0, 0.1, 1.8e-5, 0, 0.1);
  const large = calculateWeakStrongPH(25000, 0.1, 1.8e-5, 0, 0.1);
  expect(small).toBeCloseTo(large, 6);
});

it('returns the correct initial pOH-derived pH for a weak base', () => {
  // 25.0 mL of 0.100 M NH3. The third parameter is a pKa, NOT a Ka -- see the
  // Interfaces note above. data/titrations.ts:143 records pKa: 9.26 for this curve.
  //   Ka  = 10^-9.26
  //   Kb  = Kw/Ka = 1e-14 / 10^-9.26 = 10^(-14+9.26) = 10^-4.74 = 1.82e-5
  //   pOH = 0.5*(-log10(Kb) - log10(C)) = 0.5*(4.74 + 1.00) = 2.87
  //   pH  = 14 - 2.87 = 11.13, which is data/titrations.ts:138 initialPH: 11.13
  const pH = calculateStrongWeakPH(25.0, 0.1, 9.26, 0, 0.1);
  expect(pH).toBeCloseTo(11.13, 1);
});
```

The asserted 11.13 is arithmetic, not a lookup: `14 − 0.5·(4.74 + 1.00) = 14 − 2.87`. It agrees with the data file's own `initialPH`, which is the point of the test. Passing `5.6e-10` here instead — as an earlier draft of this plan did — makes the function read it as a pKa of 5.6e-10, giving `Ka ≈ 1`, `Kb ≈ 1e-14`, and a returned pH of **5.00** both before and (as 6.50) after the fix. Neither number has anything to do with ammonia.

- [x] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run apps/games/3-ar/ph-titration --reporter=verbose`
Expected: FAIL. The first reports `expected 4.37 to be close to 2.87`; the second passes only by coincidence and may pass; the third reports **9.63** instead of 11.13.

That 9.63 is the whole point of the weak-base case, and it is the _opposite_ direction from the acid: `log10(0.1/1000) = −4` instead of `−1`, so the spurious division inflates pOH by 1.5 and therefore pulls the **pH down** by 1.5. Weak acids start ~1.5 units too high; weak bases start ~1.5 units too low.

- [x] **Step 3: Remove the four spurious divisions**

In `apps/games/3-ar/ph-titration/src/utils/ph-calculations.ts`, change line 57:

```typescript
const sqrtKaCa = Math.sqrt(Ka * molarityAcid);
```

line 95:

```typescript
const pOH = 0.5 * (-Math.log10(Kb) - Math.log10(molarityBase));
```

and lines 133 and 198, which are identical to each other:

```typescript
const sqrtKaCa = Math.sqrt(Ka1 * molarityAcid);
```

Leave every `(volume * molarity) / 1000` and `(volumeAcid + volumeBase) / 1000` line untouched.

- [x] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run apps/games/3-ar/ph-titration --reporter=verbose`
Expected: PASS, all three.

- [x] **Step 5: Check the curve start against the data file for every weak titration**

Add to the same test file:

```typescript
import { titrations } from '../data/titrations';
import { calculatePH } from '../utils/ph-calculations';

describe('every titration starts where its data says it does', () => {
  it.each(titrations.map((t) => [`${t.id} ${t.name}`, t] as const))(
    '%s starts at its declared initialPH',
    (_label, t) => {
      expect(calculatePH(t, 0)).toBeCloseTo(t.initialPH, 1);
    }
  );
});
```

The label carries `id` as well as `name` because two entries share the name `'HCl + NaOH'` (`data/titrations.ts:13` and `:41`); without the id the report shows two identically-named cases.

The export is `titrations`, lower-case (`data/titrations.ts:8`); there is no `TITRATIONS` anywhere in the repo.

Run: `pnpm vitest run apps/games/3-ar/ph-titration --reporter=verbose`

Expected: **10 of 13 pass, 3 fail** — do not expect a clean sweep here. Measured against the corrected code, three declared `initialPH` values disagree with what the (now correct) formula produces:

| id  | Titration                | computed | declared | gap  |
| --- | ------------------------ | -------- | -------- | ---- |
| 6   | `HF + NaOH`              | 1.996    | 2.08     | 0.08 |
| 11  | `H₂SO₃ + NaOH`           | 1.443    | 1.5      | 0.06 |
| 12  | `H₂C₂O₄ + NaOH` (oxalic) | 1.163    | 1.3      | 0.14 |

All three miss `toBeCloseTo(x, 1)`, which needs agreement within 0.05. These three are named here so the implementer is not surprised into "fixing" the code back. The gaps are small and plausibly come from the declared values having been computed with an activity correction or a different Ka, rather than from a fresh defect — but that is a guess, not a measurement, and it is exactly what wants reporting.

If any case fails, that titration's `initialPH` or its `Ka` is itself wrong — report it, do not edit the expectation to match the code.

To keep `pnpm test` green without hiding the finding, split the `it.each` rather than trying to wrap three of its generated cases — you cannot mark individual rows of a single `it.each`. Hoist the three ids and run two blocks:

```typescript
// Declared initialPH disagrees with the corrected formula by 0.06-0.14.
// Left failing on purpose, pending a teacher decision on the declared values.
// Keyed by id, not name: 'HCl + NaOH' is the name of both id 1 and id 3.
const KNOWN_DISAGREEING = [6, 11, 12]; // HF + NaOH, H₂SO₃ + NaOH, H₂C₂O₄ + NaOH
```

Then `it.each` over `titrations.filter((t) => !KNOWN_DISAGREEING.includes(t.id))` for the ten that pass, and a second block for the three. Key on `id`, not `name` — `data/titrations.ts:13` and `:41` carry the identical name `'HCl + NaOH'`, so a name-based filter would be ambiguous. It happens to be harmless here (both HCl entries pass), which is exactly why it would be easy to write and hard to notice. Check whether `it.fails.each` chains in this repo's Vitest version before relying on that spelling; if it does not, write three plain `it.fails` cases, or `it.skip` them with the comment above.

Do not widen the tolerance to swallow them. `toBeCloseTo(x, 0)` would still catch a return of the 1000× defect — that shifts pH by ~1.5 and precision 0 allows only ±0.5 — but ±0.5 is far too loose for what this test is _for_: buffer-region and equivalence-point drift of 0.2–0.3 is entirely plausible and would sail through.

- [x] **Step 6: Commit**

```bash
git add apps/games/3-ar/ph-titration/src/utils/ph-calculations.ts apps/games/3-ar/ph-titration/src/__tests__/ph-calculations.test.ts
git commit -m "fix(ph-titration): stop dividing molarity by 1000 in initial-ph branches

Molarity arrives in mol/L; the volume-to-moles conversion above these
lines is what needs the /1000. Four sites (57, 95, 133, 198) applied it
twice, so 0.100 M acetic acid rendered pH 4.37 where the game's own
data/titrations.ts:76 asserts 2.87.

The sign of the error depends on which side of neutral the curve starts:
weak acids started about 1.5 units too high, weak bases about 1.5 units
too low. NH3 rendered 9.63 where titrations.ts:138 asserts 11.13.

The existing test asserted only 1 < pH < 7, which the wrong value passed.
It now pins the data file's value, and every titration's curve start is
checked against its own declared initialPH. Three of the thirteen (ids 6, 11, 12 -
HF, H2SO3, oxalic) still disagree by 0.06-0.14 and are marked as such
rather than papered over; their declared values need a teacher decision.

This changes displayed answers for all weak-acid and weak-base titrations."
```

---

### Task 2: Lotukerfið teaches a false neutron rule

**Files:**

- Modify: `apps/games/1-ar/lotukerfid/src/data/elements.ts` (add `massNumber` to the interface and to **all 42** element records — the file holds 42, of which Level 3 draws only the 36 with `period <= 4`), and delete or correct the dead `APPROX_MASSES` table at `:476` (Step 6b)
- Modify: `apps/games/1-ar/lotukerfid/src/components/Level3.tsx` — `:31-33` (the helper), `:75` (the worked explanation), `:106` (the hint), `:253` and `:261-262` (the intro), and **`:405` and `:410` (the particle-breakdown card, which recomputes the rounding inline and bypasses the helper entirely)**
- Test: `apps/games/1-ar/lotukerfid/src/__tests__/data-integrity.test.ts` (create)

**Interfaces:**

- Consumes: `Element` from `../data/elements`, `ELEMENTS` array.
- Produces: `Element.massNumber: number` — the mass number of the most abundant natural isotope. Later tasks and any future isotope level rely on this field name.

**Background.** `neutronCount()` is `Math.round(el.atomicMass) - el.atomicNumber`, and it is taught as _the method_, not used as a private helper. For copper it prints `64 − 29 = 35`; real Cu-63 has 34. Rounding the periodic-table mass is not an approximation of the mass number — it is a different quantity, because the tabulated mass is a weighted average over isotopes.

**Eleven of the file's 42 records mismatch.** Seven are inside Level 3's `period <= 4` draw pool (Ni, Cu, Zn, Ga, Ge, Se, Br — a contiguous Z = 28–35 block, where the heavy-isotope tail of the transition and post-transition metals pulls the weighted mean off the modal isotope), and four are outside it (Ag, Ba, Hg, Pb). Six of the seven — all but Ge — round to a mass number with **no natural abundance at all**, so the game asserts a neutron count for a nuclide the student will not find on any chart.

Two things follow that shape the fix. First, the field must be populated on all 42 records, not just the 36 the game currently draws, because Step 3 declares it non-optional. Second, the exposure is wider than "the neutron question": `Level3.tsx:35-94` draws 12 elements from the 36 and uses `pool[0..7]` for the eight questions, and the particle-breakdown card at `:389-412` is gated on `answered` alone with **no** `question.type` condition — so it prints a neutron count after every one of the eight, whatever was asked.

Measured against the real Fisher-Yates shuffle (`packages/shared/utils/shuffle.ts:12`), by hypergeometric calculation and confirmed by a 2,000,000-run simulation:

| what goes wrong                            | slots at risk                 | probability per playthrough      |
| ------------------------------------------ | ----------------------------- | -------------------------------- |
| a correct student answer is mis-graded     | 2 graded `neutrons` questions | `1 − C(29,2)/C(36,2)` = **~36%** |
| a wrong neutron count is displayed         | 4 neutron-derived slots       | `1 − C(29,4)/C(36,4)` = **~60%** |
| at least one wrong value is shown anywhere | all 8 questions               | `1 − C(29,8)/C(36,8)` = **~86%** |

These supersede the ~31% / ~54% / ~81% figures quoted elsewhere, which were computed against a six-element mismatch set that omitted Ge.

- [x] **Step 1: Write the failing test**

Create `apps/games/1-ar/lotukerfid/src/__tests__/data-integrity.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

import { ELEMENTS } from '../data/elements';

// Mass number of the most abundant natural isotope, for every element in this
// file where rounding the standard atomic mass gives the wrong answer.
// Abundances are from the NIST "Atomic Weights and Isotopic Compositions"
// tables; Ge, Ag, Ba, Hg and Pb were additionally checked against CIAAW, which
// agrees. These eleven are the complete set across all 42 records -- NOT just
// the 36 with period <= 4 that Level 3 draws from. The four out-of-pool entries
// are here on purpose: without them this test cannot see a wrong literal
// written into Ag, Ba, Hg or Pb in Step 4.
const KNOWN_MOST_ABUNDANT: Record<string, number> = {
  // in Level 3's period <= 4 draw pool
  Ni: 58, // atomicMass 58.693 rounds to 59; Ni-59 has no natural abundance
  Cu: 63, // 63.546  -> 64; Cu-64 has no natural abundance
  Zn: 64, // 65.38   -> 65; Zn-65 has no natural abundance
  Ga: 69, // 69.723  -> 70; Ga-70 has no natural abundance
  Ge: 74, // 72.63   -> 73; Ge-73 IS natural but minor, ~7.8% against Ge-74's ~36.5%
  Se: 80, // 78.971  -> 79; Se-79 has no natural abundance
  Br: 79, // 79.904  -> 80; Br-80 has no natural abundance (79/81 are near 50/50)
  // outside the draw pool, but in the file and equally wrong if derived
  Ag: 107, // 107.868 -> 108; Ag-108 has no natural abundance (t-half 2.4 min)
  Ba: 138, // 137.327 -> 137; Ba-137 IS natural but 2nd at ~11.2%
  Hg: 202, // 200.592 -> 201; Hg-201 IS natural but 4th at ~13.2%
  Pb: 208, // 207.2   -> 207; see the caveat in Step 4 -- lead is provenance-dependent
};

describe('element data', () => {
  it('every element declares a mass number', () => {
    const missing = ELEMENTS.filter((e) => typeof e.massNumber !== 'number');
    expect(missing.map((e) => e.symbol)).toEqual([]);
  });

  it('mass number is a whole number at least as large as the atomic number', () => {
    const bad = ELEMENTS.filter(
      (e) => !Number.isInteger(e.massNumber) || e.massNumber < e.atomicNumber
    );
    expect(bad.map((e) => e.symbol)).toEqual([]);
  });

  it.each(Object.entries(KNOWN_MOST_ABUNDANT))(
    '%s has mass number %i, which rounding the atomic mass would get wrong',
    (symbol, expected) => {
      const el = ELEMENTS.find((e) => e.symbol === symbol);
      expect(el).toBeDefined();
      expect(el!.massNumber).toBe(expected);
      expect(Math.round(el!.atomicMass)).not.toBe(expected);
    }
  );
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run apps/games/1-ar/lotukerfid --reporter=verbose`

Expected: FAIL, but **not with a type error**. `vitest.config.ts` declares no `typecheck` block, and esbuild strips types without checking them, so `pnpm vitest run` never reports `massNumber` does not exist on type `Element`. At runtime `e.massNumber` is simply `undefined`, so:

- the first case fails listing **all 42** symbols (`ELEMENTS` is unfiltered here, so the count is the file's 42, not Level 3's 36);
- the second fails the same way, `Number.isInteger(undefined)` being false;
- all eleven `KNOWN_MOST_ABUNDANT` cases fail on `expect(undefined).toBe(58)` and so on.

The type error is real, but you will only see it from `pnpm type-check` — which is Step 7.

- [x] **Step 3: Add the field to the interface**

In `apps/games/1-ar/lotukerfid/src/data/elements.ts`:

```typescript
export interface Element {
  symbol: string;
  name: string;
  atomicMass: number;
  /** Mass number (protons + neutrons) of the most abundant natural isotope.
   *  NOT the rounded atomicMass — that is a weighted average over isotopes,
   *  so rounding it names the wrong nuclide for eleven records in this file:
   *  Ni, Cu, Zn, Ga, Ge, Se, Br (inside Level 3's period<=4 pool) and
   *  Ag, Ba, Hg, Pb (outside it). Source: NIST atomic weights and isotopic
   *  compositions. */
  massNumber: number;
  atomicNumber: number;
  period: number;
  group: number;
  category: ElementCategory;
}
```

- [x] **Step 4: Populate `massNumber` on all 42 records**

The file holds **42 elements**; Level 3 draws only from the 36 with `period <= 4`. Populate the field on **all 42**, not the 36 — Step 3 declared `massNumber` non-optional, so leaving six records without it fails `pnpm type-check`. Add `massNumber:` after `atomicMass:` on every record, using the most abundant natural isotope.

**Eleven differ from `Math.round(atomicMass)`.** Seven are in the draw pool:

```
Ni 58 · Cu 63 · Zn 64 · Ga 69 · Ge 74 · Se 80 · Br 79
```

and four are outside it, which the same rounding gets equally wrong:

```
Ag 107 · Ba 138 · Hg 202 · Pb 208
```

The out-of-pool six are `Ag, I, Ba, Au, Hg, Pb` (verified in `elements.ts:405-458`, the tail of the `ELEMENTS` array) — so four of the six mismatch, and only `I 127` and `Au 197` round correctly. That is a high enough hit rate that "the ones past period 4 are probably fine" is exactly the wrong instinct.

Do not skim the out-of-pool four. An earlier draft of this plan said "for every other element `Math.round(atomicMass)` happens to agree" — **that is false**, and an implementer who trusted it would write `Ag: 108`, `Ba: 137`, `Hg: 201` and `Pb: 207` into the file, i.e. hand-copy the exact defect this task exists to remove. Level 3 cannot reach these today, but the field is declared as a general fact about the element and any future isotope level would inherit the error. The `KNOWN_MOST_ABUNDANT` table in Step 1 covers all eleven precisely so a wrong literal here is caught.

Sourcing, stated rather than assumed: the eleven come from the NIST _Atomic Weights and Isotopic Compositions_ tables, with Ge, Ag, Ba, Hg and Pb cross-checked against CIAAW (they agree). The file's `atomicMass` values were separately compared against NIST standard atomic weights and none needs correcting — the defect is entirely in the method, not the data.

**One caveat, and it is genuine:** lead is the one element where "most abundant" is not a fixed fact. Pb-206/207/208 are the end-products of U-238/U-235/Th-232 decay, so CIAAW publishes overlapping ranges rather than point abundances and the composition varies with ore provenance. `Pb: 208` is NIST's representative composition (52.4%) and is the right value to write, but it is representative, not invariant. Pb-207 is never the majority isotope in ordinary lead, so the mismatch itself is safe. Argon has variable composition too but is **not** a mismatch and must not be treated as one: `round(39.948) = 40` and Ar-40 really is ~99.6% of natural argon, so `Ar: 40` is correct.

For every element not in the eleven, `Math.round(atomicMass)` does agree — but write the literal anyway; the point of the field is that the value is stated rather than derived. Example:

```typescript
  {
    symbol: 'Cu',
    name: 'Kopar',
    atomicMass: 63.546,
    massNumber: 63,
    atomicNumber: 29,
    period: 4,
    group: 11,
    category: 'transition-metal',
  },
```

- [x] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run apps/games/1-ar/lotukerfid --reporter=verbose`
Expected: PASS. If a case fails, the literal you wrote disagrees with the known isotope — fix the literal.

- [x] **Step 6: Use the field, and stop teaching the rounding rule**

In `apps/games/1-ar/lotukerfid/src/components/Level3.tsx`, replace the helper at `:31-33`:

```typescript
function neutronCount(el: Element): number {
  return el.massNumber - el.atomicNumber;
}
```

**Replacing the helper is not sufficient on its own.** `Level3.tsx:405` recomputes the rounding _inline_ and never calls `neutronCount()`:

```tsx
{
  Math.round(question.element.atomicMass) - question.element.atomicNumber;
}
```

and `:410` prints the rounded mass as the mass number:

```tsx
Massatala = róteindir + nifteindir = {Math.round(question.element.atomicMass)}
```

Both live in the particle-breakdown card at `:389-412`, which is gated on `answered` alone with no `question.type` condition — so it renders after **all eight** questions, not just the neutron ones. Miss these two and the fix makes the game _worse than before_: for copper the explanation would say 34 directly above a card saying 35, and a student would have no way to tell which the game means. Replace both with `neutronCount(question.element)` and `question.element.massNumber`.

Then fix the four places that teach the old method:

| line                                               | what it currently says                                         | fix                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `:106` (hint)                                      | "Rúnaðu frumeindamassann og dragðu frá atómnúmerinu"           | stop naming rounding as the method                                           |
| `:75` (worked explanation)                         | interpolates `${Math.round(el.atomicMass)}` as the mass number | interpolate `el.massNumber`                                                  |
| `:253` (intro worked example)                      | "Massatala ≈ 12 → Nifteindir = 12 − 6"                         | the `≈` is the rounding rule in disguise; carbon's mass number is exactly 12 |
| `:261-262` (intro, "Hvar finn ég upplýsingarnar?") | "Námundaðu frumeindamann upp í heiltölu til að fá massatöluna" | this is the false rule stated outright, and must go                          |

Note the string at `:262` is misspelt in the source — _frumeindamann_, not _frumeindamassann_ — so grepping for the correct spelling will not find it. The typo goes away with the sentence.

**Terminology — decide once, do not half-convert.** `sætistala` is the ruled term for atomic number (`packages/shared/i18n/ordabok.md:41`, `atomic number;sætistala`). But `Level3.tsx` today uses **two** other terms for the same concept: `atómnúmer` at `:50`, `:75`, `:88`, `:100`, `:103`, `:106`, `:108`, and `raðtala` at `:231`, `:239`, `:247`, `:261`. Writing `sætistala` into the replacement strings while leaving those alone would leave **three** words for one concept in one file, which is worse for a student than any one of them.

So: **use the file's existing dominant term, `atómnúmer`, in the strings you touch in this task, and defer the whole-file conversion to Phase 2.** The neutron rule is the correctness defect and it is what this phase is for; the glossary conversion is a terminology change with no victim, it spans strings this task has no other reason to open, and doing it here would bury the answer-key change in a diff of unrelated edits. Phase 2 should convert `atómnúmer`'s seven lines and `raðtala`'s four in one pass.

The hint at `:106` accordingly becomes:

```typescript
'Nifteindir = massatala − atómnúmer. Massatalan er heiltala — hún er ekki frumeindamassinn sem stendur á lotukerfinu.';
```

If Siggi would rather have the glossary term now, convert **every** occurrence in the file in this task and say so in the commit message. What is not acceptable is the mixture.

**One consequence for Siggi to rule on — a decision point, not a blocker on this task.** Removing the rounding rule removes the student's only stated route to the mass number. The intro at `:261` tells them where to read the atomic mass off the periodic table, and rounding it was the (wrong) bridge from there to the mass number. With that bridge gone, "Hversu margar nifteindir hefur Cu?" has a correct key the student cannot derive from the table in front of them, because the mass number is an isotope fact the game never shows.

Two ways out, and they are not equivalent in scope:

- **Show the mass number.** Have the breakdown card print `massNumber` as a labelled fact alongside protons and electrons. This is display only, changes no question and no key beyond what Step 6 already changes, and can go in this commit.
- **State the nuclide in the question** — "Hversu margar nifteindir hefur kopar-63 (Cu-63)?". This is the pedagogically better answer, but it changes _what the question tests_ (from "apply a rule" to "read a nuclide symbol"), so under Global Constraint 6 it needs saying in the commit message, and it is arguably curriculum work belonging with the isotope material in a later phase.

Take the first now. Put the second to Siggi alongside the L3-12 significant-figures question and the `sætistala` choice, and if he wants it, add a line to the Task 2 commit message saying the neutron questions now name the isotope.

- [x] **Step 6b: Deal with the second whole-number mass table**

`elements.ts:476` exports `APPROX_MASSES`, a `Record<string, number>` of whole-number masses that carries **the exact values this task is removing** — `Cu: 64`, `Zn: 65`, `Br: 80`, `Ag: 108`, `Ba: 137`, `Hg: 201`, `Pb: 207`. Leaving it behind re-seeds the defect for the next author, who will reasonably read an exported table as the file's answer on the question.

It is dead **today**: `grep -rn "APPROX_MASSES" --include=*.ts --include=*.tsx . | grep -v node_modules` returns only its own declaration in this file plus a _separate, unrelated_ table of the same name in `apps/games/1-ar/molmassi/src/data/elements.ts:109`, which `molmassi/src/components/PeriodicTable.tsx` does import. Zero importers of the lotukerfid one.

Prefer deleting it — an unused export with wrong values has no upside. If you would rather keep it, correct the seven entries above to the `massNumber` values and add a comment saying it must track them. Either way do it in **this** commit: the point is that no whole-number mass in this file disagrees with the new field. Confirm no importers appeared before deleting, and note that the identically named `molmassi` table is out of scope for this task.

- [x] **Step 7: Verify the whole game still builds and the suite is green**

Run: `pnpm type-check && pnpm vitest run apps/games/1-ar/lotukerfid`
Expected: no type errors, tests pass. Step 7 is where the missing-`massNumber` type error surfaces if Step 4 skipped any of the 42 records — `pnpm vitest run` alone will not tell you.

- [x] **Step 8: Commit**

```bash
git add apps/games/1-ar/lotukerfid/src/data/elements.ts apps/games/1-ar/lotukerfid/src/components/Level3.tsx apps/games/1-ar/lotukerfid/src/__tests__/data-integrity.test.ts
git commit -m "fix(lotukerfid): count neutrons from mass number, not rounded atomic mass

Level 3 computed neutrons as round(atomicMass) - Z and taught that
rounding as the method. The tabulated atomic mass is a weighted average
over isotopes, so it is a different quantity: for copper the game printed
64 - 29 = 35, and real Cu-63 has 34. Eleven of the file's 42 records
mismatch - seven of them inside the level's period<=4 draw pool, six of
those rounding to nuclides with no natural abundance at all.

The breakdown card recomputed the rounding inline rather than calling the
helper, and renders after every question rather than only the neutron
ones, so it is fixed too - otherwise the explanation and the card would
have disagreed on screen.

Adds an explicit massNumber per element, sourced from NIST, and a test
pinning all eleven that rounding gets wrong. Drops the dead APPROX_MASSES
export, which carried the same wrong whole-number masses.

This changes live answer keys for Ni, Cu, Zn, Ga, Ge, Se and Br."
```

---

### Task 3: One broken key in Einingagreining

**Files:**

- Modify: `apps/games/1-ar/dimensional-analysis/src/data/challenges.ts:271`
- Test: `apps/games/1-ar/dimensional-analysis/src/__tests__/data-integrity.test.ts` (create)

**Interfaces:**

- Consumes: `level3Challenges` from `../data/challenges`. It is a **discriminated union** of six member types (`reverse`, `error_analysis`, `efficiency`, `synthesis`, `real_world`, `derivation`), and `startValue`/`expectedAnswer` are not on all of them — `Level3ChallengeReverse` carries a `setup` object instead. Any test that reads those fields must narrow on `type` first.
- Produces: nothing.

**Background.** The speed-of-light item (`L3-6`, `type: 'derivation'`) converts 3.00e8 m/s to km/klst. `3.00e8 × (1/1000) × 3600 = 1.08e9`, but `expectedAnswer` is `1.08e12` — a factor of 1000 out. That is the whole of this task.

**One key, not two.** Earlier drafts of this plan, and `ORPHANED_GAMES_ASSESSMENT.md` before them, also called the item at `:354` unsatisfiable. **That claim was executed and falsified in Aug 2026 — do not act on it.** `:354` is the line `significantFigures: 3` inside item `L3-12`, a property rather than a defect site. Rendering the real `Level3` component and submitting answers, `29.25`, `29.3`, `29.2`, `29.0` and `29` all grade correct; `29.3` satisfies the 1% value check _and_ reports as exactly 3 significant figures, so the original "no input passes both" reasoning is false on its own terms. Independently, there were never two gates: `Level3.tsx:159-162` computes the significant-figure result and `:175-180` never passes it to `calculateCompositeScore`, so it renders as a feedback panel and cannot affect grading. Leave the item's data and its key alone.

- [x] **Step 1: Write the failing test**

Create `apps/games/1-ar/dimensional-analysis/src/__tests__/data-integrity.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

import { level3Challenges } from '../data/challenges';

describe('speed of light conversion', () => {
  it('the L3-6 key is the value the conversion actually gives', () => {
    // 3.00e8 m/s * (1 km / 1000 m) * (3600 s / 1 klst) = 1.08e9 km/klst
    const expected = (3.0e8 / 1000) * 3600;

    // level3Challenges is a discriminated union; startValue and expectedAnswer
    // exist only on some members, so narrow on `type` before reading them.
    const item = level3Challenges.find((c) => c.type === 'derivation' && c.startValue === 3.0e8);
    expect(item).toBeDefined();

    // Re-narrow for the compiler: `find` gives back the union, not the member.
    if (item?.type !== 'derivation') throw new Error('L3-6 is not a derivation item');
    expect(item.expectedAnswer).toBeCloseTo(expected, -3);
  });
});
```

The narrowing guard is not decoration: without `c.type === 'derivation'` the snippet does not compile, because `Level3ChallengeReverse` has no `startValue` and `Level3ChallengeErrorAnalysis` no `expectedAnswer`.

Note what this test does _not_ do. An earlier draft opened with a case that computed `(3.0e8 / 1000) * 3600` from its own local constant and asserted it was close to `1.08e9` — reading no repo data at all. That case passes whatever `challenges.ts` says, before and after the fix, so it is arithmetic practice rather than a regression guard. The version above keeps the independent computation but compares it against `item.expectedAnswer`, which is the only comparison that can fail.

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run apps/games/1-ar/dimensional-analysis --reporter=verbose`
Expected: FAIL, one case — `expected 1080000000000 to be close to 1080000000`. If it passes at this point you have written the self-referential version; make it read `item.expectedAnswer`.

- [x] **Step 3: Fix the key**

At `apps/games/1-ar/dimensional-analysis/src/data/challenges.ts:271`:

```typescript
    expectedAnswer: 1.08e9,
```

Then check the same item's input placeholder — the review found the wrong value leaked there too. If the placeholder shows an answer of any kind, remove it; a placeholder must not contain the answer.

- [x] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run apps/games/1-ar/dimensional-analysis --reporter=verbose`
Expected: PASS.

- [x] **Step 5: (investigation closed — no code change) Note the one open teaching question**

This step used to say "work the conversion by hand from `startValue`/`startUnit` to `targetUnit`; if no chain of the offered factors reaches the target, fix the data". Its own text provided for the other branch — "if it turns out to be satisfiable, say so and leave it alone" — and **that branch has now been taken**, so there is nothing to do here.

Two reasons the old diagnostic would not have worked anyway. `L3-12` is a `synthesis` item, not a `derivation` one: it has no offered conversion factors to chain, only `density: 58.5` / `densityUnit: 'g/mol'` and `requiredSteps: ['multiply by molar mass']`. And the arithmetic is not in dispute — `0.5 mol × 58.5 g/mol = 29.25 g` is exactly the declared `expectedAnswer`.

What survives is a teaching judgement for Siggi, not a correctness fix:

> Is the `0.5 mol` in L3-12 a _measurement_ — in which case it carries one significant figure, the sig-fig-correct answer is `30`, and the 1% value check rejects it — or an _exact prep target_, the quantity you set out to weigh, in which case significant figures come from `58.5`, `significantFigures: 3` is right, and `29.3` is the intended answer?

The prompt ("Þú ert að undirbúa tilraun sem krefst 0.5 mol af NaCl") reads as the second. Under that reading the item is already internally consistent and needs nothing. Do not change the data before this is answered — and if it is answered "measurement", the fix is to the prompt or the tolerance, not to the key.

- [x] **Step 6: Commit**

```bash
git add apps/games/1-ar/dimensional-analysis/src/data/challenges.ts apps/games/1-ar/dimensional-analysis/src/__tests__/data-integrity.test.ts
git commit -m "fix(dimensional-analysis): correct the speed-of-light key

3.00e8 m/s is 1.08e9 km/klst, not 1.08e12 - the key was 1000x out, and
the wrong value was also leaking through the input placeholder. Adds a
data-integrity test that works the conversion independently."
```

---

### Task 4: Unshuffled option arrays

**Files:**

- Modify: `apps/games/2-ar/rafeindabygging/src/components/Level3.tsx`
- Test: `apps/games/2-ar/rafeindabygging/src/__tests__/data-integrity.test.ts` (create)

**Interfaces:**

- Consumes: `shuffleArray<T>(array: T[]): T[]` from `packages/shared/utils/shuffle.ts:12`. `periodicPuzzles: PeriodicConfigPuzzle[]` from `apps/games/2-ar/rafeindabygging/src/data/periodic-configs.ts:16`, where the correct answer is the `fullShorthand: string` field and `options: string[]` holds four candidates.
- Produces: nothing.

**Background.** Level 3 imports `periodicPuzzles` from `../data/periodic-configs`. Do not confuse it with either of the other two puzzle arrays in this game: `puzzles` in `quantum-numbers.ts` belongs to **Level 1** (`Level1.tsx:6`), and Level 2 imports `configPuzzles` from `electron-configs` (`Level2.tsx:6`). Verified against the shipped data: **all eight puzzles have `fullShorthand` at `options[0]`** — Ca, Ti, Cr, Cu, Br, Sr, Fe, Se. The level is passable by always clicking first.

Do **not** shuffle `2-ar/kinetics` or `2-ar/redox-reactions` problem _order_ — that is a deliberate exam-stability choice recorded in the project instructions. This task is about the position of the correct option _within_ a question, which is a different thing.

- [x] **Step 1: Write the failing test**

Create `apps/games/2-ar/rafeindabygging/src/__tests__/data-integrity.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

import { periodicPuzzles } from '../data/periodic-configs';

describe('level 3 puzzle data', () => {
  it('every puzzle offers its own correct answer among the options', () => {
    const broken = periodicPuzzles.filter((p) => !p.options.includes(p.fullShorthand));
    expect(broken.map((p) => p.element)).toEqual([]);
  });

  it('the correct answer is not always in the same slot', () => {
    const positions = periodicPuzzles.map((p) => p.options.indexOf(p.fullShorthand));
    expect(new Set(positions).size).toBeGreaterThan(1);
  });

  it('every puzzle offers four distinct options', () => {
    const bad = periodicPuzzles.filter(
      (p) => p.options.length !== 4 || new Set(p.options).size !== 4
    );
    expect(bad.map((p) => p.element)).toEqual([]);
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run apps/games/2-ar/rafeindabygging --reporter=verbose`
Expected: the first and third cases PASS; the second FAILs with `expected 1 to be greater than 1`, because every position is 0.

- [x] **Step 3: Spread the correct answers in the data**

In `apps/games/2-ar/rafeindabygging/src/data/periodic-configs.ts`, reorder each puzzle's `options` array so the correct string is not always first. Move only the array elements — do not change any string's characters, since the distractors encode specific misconceptions (`[Ar] 3d²` is the "fills 3d before 4s" error, `[Ar] 4s¹ 3d³` the "always promote" error). Aim for a roughly even spread across the four slots over the eight puzzles.

- [x] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run apps/games/2-ar/rafeindabygging --reporter=verbose`
Expected: PASS, all three.

- [x] **Step 5: Also shuffle at render time, so a replay differs**

Reordering the data fixes the current pool; shuffling at render stops the next author recreating the problem and varies the order between attempts. In `Level3.tsx`, add:

```typescript
import { useMemo } from 'react';

import { shuffleArray } from '@shared/utils';

// inside the component, where `puzzle` is the current PeriodicConfigPuzzle:
const displayedOptions = useMemo(() => shuffleArray(puzzle.options), [puzzle]);
```

Render `displayedOptions` in place of `puzzle.options`, and grade by comparing the selected **string** against `puzzle.fullShorthand` — never by index. Keying the memo on `puzzle` means the order is stable while a student reads it and changes only when the question changes.

`@shared/utils` is the right import path — `packages/shared/utils/index.ts:9` does `export * from './shuffle'`, so the barrel re-exports `shuffleArray` and no deep import is needed.

- [x] **Step 6: Verify the game still builds**

Run: `pnpm type-check && pnpm vitest run apps/games/2-ar/rafeindabygging`
Expected: no type errors, tests pass.

- [x] **Step 7: Record the remaining unshuffled games**

Sweep the other shipped games for option arrays whose correct answer sits at a constant index, and add what you find to `docs/README.md` under the live-defects section, with counts. Do not fix them in this task — one game per commit keeps answer-key changes reviewable. A quick way in:

```bash
grep -rln "options:" apps/games/*/*/src/data/*.ts
```

then, for each hit, check whether the field naming the correct answer always equals `options[0]`.

- [x] **Step 8: Commit**

```bash
git add apps/games/2-ar/rafeindabygging/src docs/README.md
git commit -m "fix(rafeindabygging): stop putting every level 3 answer first

All eight periodic-config puzzles had fullShorthand at options[0], so the
level was passable by always clicking the first choice. The data is
reordered, and options are additionally shuffled per question at render
so a replay differs and the pattern cannot creep back. Grading compares
the selected string, not its index.

Records the other unshuffled games in docs/README.md for follow-up."
```

---

## Verification for the whole phase

- [x] `pnpm type-check` — no errors
- [x] `pnpm test` — green, and now containing four tests that fail if any of these defects returns
- [x] `pnpm build` — all games build
- [x] Load `1-ar/lotukerfid` Level 3 and answer a copper question correctly; confirm it is marked correct — and check the particle-breakdown card underneath says 34, not 35
- [x] Load `3-ar/ph-titration` and confirm the acetic acid curve starts near pH 2.87, and the ammonia curve near pH 11.13

## What this phase deliberately does not do

Answer leaks, the `FeedbackPanel` collapse, the decimal-comma parser, terminology, and every curriculum gap. Those are Phases 2–5 in the roadmap.

**It also skips seven of the nine Tier-0 correctness items**, and that needs saying plainly, because the phase title claims more than the phase delivers. `CURRICULUM_REVIEW.md:207` lists nine Tier-0 items; Task 2 covers B1 and Task 3 covers B2. The other seven are untouched, and four of them sit in the review's own _"Teaches false chemistry"_ table:

> **Update 2026-08-26.** Phase 1b closed **B3, B6 and B8** on 2026-08-18 (PR #24); **B4 and B13**
> were closed on 2026-08-26 (PR #30); **B5 and B12** were closed on 2026-08-26. **None of the seven
> below is open, and with them the whole Tier-0 list is closed.** Every row is marked in place; the
> descriptions are the pre-fix state and some measured rates were later sharpened — see
> `docs/README.md`. Each of the nine now carries a test that fails if it returns.

| item                             | what it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | where                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **B8** Takmarkandi generator (M) | **FIXED 2026-08-18.** reactant counts drawn at random with no relation to the coefficients, then the run count floored — a student following the game's own printed hint `min(A/c1, B/c2)` is graded wrong on ~44% of Level 2 and ~70% of Level 3 problems                                                                                                                                                                                                                                                   | `takmarkandi/src/utils/calculations.ts:48-66`, `:14`                                                       |
| **B3** gas solubility            | **FIXED 2026-08-18.** Lausnir's gas data is 10× too high: g/L values printed under a `g/100g H₂O` axis label (CO₂ 3.35 should be 0.335; O₂ 0.069 should be 0.0069)                                                                                                                                                                                                                                                                                                                                           | `lausnir/src/components/TemperatureSolubility.tsx:59,67`, label at `:220`                                  |
| **B6** molarity ceiling          | **FIXED 2026-08-18.** Lausnir Level 3 generates physically impossible solutions — mass 10–100 g against volume 50–500 mL with no solubility ceiling, up to 54 M HCl; ~14–20% of generated problems exceed real solubility                                                                                                                                                                                                                                                                                    | `lausnir/src/utils/problem-generator.ts:116-120`                                                           |
| ~~**B12** GCD check~~            | **FIXED 2026-08-26.** Stilla efnajöfnur accepts non-reduced coefficient sets (`4H₂ + 2O₂ → 4H₂O` passes); the lowest-whole-number requirement is never checked or mentioned. `checkBalance` now returns `isReduced`, the level requires it, and the instructions state the rule — it was never mentioned either                                                                                                                                                                                              | `jafna-jofnur/src/utils/balanceChecker.ts:71-74`                                                           |
| ~~**B4** breakdown sums~~        | 12 of Mólmassi's 29 compounds print a per-element breakdown whose lines do not sum to the total printed underneath (Al₂(SO₄)₃ lines sum to 342.132, total prints 342.151) — in the one game whose entire skill is summing element masses                                                                                                                                                                                                                                                                     | `molmassi/src/data/compounds.ts` vs `elements.ts:50,60`, via `CalculationBreakdown.tsx:36-49`              |
| ~~**B5** compound names~~        | **FIXED 2026-08-26.** wrong names taught as fact: P₄O₁₀ as "Fosfordekoxíð" (missing _tetra-_), Co(NO₃)₂ as "Kóbolt(II)nítrat" (Icelandic is _kóbalt_), `naming.ts:25` giving S the non-word root _brennisteinið_, Na₂CO₃·10H₂O as "Vatnaglas hýdrat" (it is _þvottasódi_). Four more were found in the same pass and fixed with them — PCl₅'s unaccented _Fosfor-_ and three hydrates carrying no water count. Fe₃O₄'s wrong name doubled as Level 3's filter flag, now an explicit `excludeFromNameBuilder` | `nafnakerfid/src/data/compounds.ts:357,440,548`, `naming.ts:25`; `molmassi/src/data/compounds.ts:33,46,51` |
| ~~**B13** tolerance~~            | Einingagreining grades on an absolute 0.01 tolerance, so on an answer of 0.005 kg typing `0` scores correct                                                                                                                                                                                                                                                                                                                                                                                                  | `dimensional-analysis/src/components/Level2.tsx:254,295`                                                   |

Note that **B13 is in the same game as Task 3 but is not swept by it** — Task 3 touches only `challenges.ts`, and B13 lives in `Level2.tsx`. Do not assume "the Einingagreining task" covered it.

The decimal-comma parser (B9/B10) is a separate item, listed in the review just after the Tier-0 nine rather than among them; it is deferred here too and wants one repo-wide pass.

So: this phase is _some_ of the chemistry that is currently wrong — the four defects with the clearest evidence and the smallest diffs — not all of it. If Tier 0 is the bar, this phase does not reach it, and B8, B3 and B6 in particular are strong candidates for a Phase 1b before anything in Phases 2–5 starts.
