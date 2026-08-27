# Lausnir — the saturation harvest, and the row that was already done

**Landed:** 2026-08-27 · **Roadmap:** `docs/plans/2026-08-16-games-roadmap.md`, Phase 3, row 4
**Source:** `namsbokasafn-leikir` at `379266e`, `games/1-ar/lausnir/src/data/saturation.ts`

## The roadmap's premise for this row is false

The row reads: _"`data/saturation.ts` — solubility vs temperature, 6 points per compound … **Real
sourced curves in place of the shipped game's hand-typed arrays**."_

The shipped game's arrays **are** those curves, digit for digit. All four solids —
KNO₃ `[13, 32, 64, 110, 169, 246]`, NaCl `[35.7, 36.0, 36.4, 37.1, 38.0, 39.2]`, sucrose
`[179, 204, 238, 287, 362, 487]`, CaSO₄ `[0.176, 0.209, 0.21, 0.193, 0.162, 0.114]` — are identical
between `saturation.ts` and `TemperatureSolubility.tsx`, and the shipped set is a **superset**: it
adds O₂ and CO₂, which the old file never had. Phase 1b then corrected the two gas curves and the
axis label they sat under (B3), so the shipped data is strictly better than the thing this row
proposed replacing it with. There was no swap to make.

That leaves the question of what in `saturation.ts` was actually missing here, which is not the
curves but what the old file asked _about_ them.

## What was genuinely missing: the cooling direction

Level 2 has ten "what happens when…" scenarios. Four are about temperature, and **every one of them
heats** the solution and asks whether more dissolves. `TemperatureComparison` has drawn a
"❄️ Kæla" arrow since the day it was written and no scenario ever asked for one.

Cooling is the direction that carries the chemistry. It is why crystals grow, why rock candy works,
and how a solid is purified by recrystallisation. Two scenarios now close that, both taken from the
old file's problems and both checked against the curve the same screen draws:

- **Kristöllun við kælingu** — 200 g KNO₃ in 100 g of water at 100 °C, cooled to 20 °C. The 100 °C
  limit is 246 g so it all stays in solution; the 20 °C limit is 32 g, so 168 g comes out as
  crystals. The distractor that catches the common error is "about 32 g falls out" — 32 g is what
  _stays_.
- **Öfug leysni** — CaSO₄ in a heating system at 40 °C, heated to 80 °C. Retrograde solubility was
  named in a static explanation box in this level and never asked. It is why scale builds on the
  hottest surface.

Not ported: the old file's `sat2` and `sat7` both key **`supersaturated`** for a solution that has
more solid than it can hold at that temperature. That is a saturated solution with undissolved
excess. Supersaturation is a metastable state holding _more_ than the limit in solution, which is a
different thing and the more interesting one. The old file also wrote `Lausnin er mettað` and
`verður ómettað`; `lausn` is feminine, so those are `mettuð` and `ómettuð`.

## `leysigeta` → `leysni`

This game named its own subject with a coined word. `packages/shared/i18n/ordabok.md` gives
`solubility;leysni`, and the school's textbook corpus has **260** hits for `leysni` against **zero**
for `leysigeta` — in **19** places across Level 2, including the section heading a student sees
first. `2-ar/intermolecular-forces` had one `leysanleiki` (corpus: 6), corrected with them.

The swap is safe in a way most are not: `leysigeta` and `leysni` are both feminine, and `leysni`
does not decline in the singular oblique cases, so no adjective or determiner moves. `CLAUDE.md`'s
warning — that replacing a term is not a string swap — is about the three Phase-2 terms that change
gender; this is not one of them. One phrase needed real rewriting rather than substitution:
`skoðaðu leysigetu feril` was already ungrammatical and is now `skoðaðu leysniferilinn`.

**Ruled 2026-08-27: `leysni`**, so it is in the banned-term table in `CLAUDE.md` and enforced
repo-wide by `packages/shared/i18n/__tests__/governed-terms.test.ts`, which also caught a
`Leysanleiki` label still sitting in `2-ar/intermolecular-forces`' i18n block. This game's own test
stays as the positive assertion.

## One more defect, found while wiring the scenarios up

`getCompound` returned `SOLUBILITY_DATA[0]` — potassium nitrate — for any formula it did not
recognise. A typo in a scenario would have drawn the KNO₃ curve under a question about calcium
sulfate while every figure in the explanation still described the compound that was meant. It throws
now.

## What guards it

`src/__tests__/cooling-scenarios.test.ts` — the level has a cooling scenario at all; every scenario
has exactly one correct option; both new scenarios' premises and quoted figures are recomputed from
`SOLUBILITY_DATA` rather than trusted as prose (so 168 g and the 0.21 → 0.16 pair cannot drift away
from the curve); and `leysigeta` cannot come back.
