import { describe, it, expect } from 'vitest';

import {
  APPENDIX_D1_ACIDS,
  APPENDIX_D2_BASES,
  pKa,
  pKaOfConjugateAcid,
} from '@shared/data/appendix-d';

import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { BUFFER_PROBLEMS } from '../data/problems';

/**
 * Every pKa this game grades against must trace to Brown et al. Appendix D.
 *
 * Siggi's ruling, 2026-09-19. Before it, four of the values here were a
 * different book's: bicarbonate at 10.33 against Appendix D's 10.25 (a 19.7 %
 * swing in the required ratio at that problem's target pH), benzoic at 4.19
 * against 4.20, citric at 4.76 against 4.77, and the ammonium ion at 9.25 here
 * while `3-ar/ph-titration` said 9.26 for the same ion — one platform, two
 * numbers, on adjacent nodes of one chain.
 */

/** pKa to two decimals, the precision most of these problems are written to. */
const round2 = (x: number) => Math.round(x * 100) / 100;

/**
 * How many decimals a stored value is written to, so it can be compared at its
 * own precision. `7.2` for the dihydrogen-phosphate buffer is a legitimate
 * one-decimal rounding of Appendix D's 7.2076; demanding 7.21 of it would be
 * pedantry, while demanding only one decimal of a two-decimal value would let
 * a genuinely different source's number through.
 */
const decimals = (x: number) => (String(x).split('.')[1] ?? '').length;
const roundTo = (x: number, d: number) => Number(x.toFixed(d));

/** Every pKa Appendix D can justify, with the row it comes from. */
const SOURCED: { pKa: number; source: string }[] = [
  ...Object.entries(APPENDIX_D1_ACIDS).flatMap(([name, { ka }]) =>
    ka.map((k, i) => ({
      pKa: pKa(k),
      source: `D.1 ${name}${ka.length > 1 ? ` Ka${i + 1}` : ''}`,
    }))
  ),
  ...Object.entries(APPENDIX_D2_BASES).map(([name, { kb }]) => ({
    pKa: pKaOfConjugateAcid(kb),
    source: `D.2 ${name} (conjugate acid)`,
  })),
];

/**
 * TRIS is **not in Appendix D at all**, and this game ships it at two different
 * pKa values (7.82 and 8.06) from an unrecorded source. Siggi's ruling of
 * 2026-09-19 is that such problems are dropped; that removal is logged as
 * pending work rather than done here, so the exemption is explicit and
 * temporary. Do not add to this list — the ruling is that unsourced constants
 * do not ship.
 */
const PENDING_REMOVAL = new Set([7.82, 8.06]);

/**
 * Problem #30 asks for a buffer's useful range from a stated pKa. Its acid is
 * `Veikt sýra` — a hypothetical, not a substance — so there is no Appendix D row
 * to trace it to and nothing is being claimed about a real chemical.
 */
const HYPOTHETICAL = new Set([5.2]);

function describeSourced() {
  return SOURCED.map((s) => `${round2(s.pKa)} (${s.source})`).join(', ');
}

describe('every pKa traces to Brown Appendix D', () => {
  const rows = [
    ...BUFFER_PROBLEMS.map((p) => ({
      what: `problem #${p.id} ${p.acidName}`,
      pKa: p.pKa,
      acid: p.acidName,
    })),
    ...LEVEL1_CHALLENGES.map((c, i) => ({
      what: `level 1 challenge ${i + 1} ${c.acidName}`,
      pKa: c.pKa,
      acid: c.acidName,
    })),
  ];

  it('has problems to check', () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  it.each(rows)('$what (pKa $pKa)', ({ what, pKa: value }) => {
    if (PENDING_REMOVAL.has(value) || HYPOTHETICAL.has(value)) return;
    const d = decimals(value);
    const hit = SOURCED.find((s) => roundTo(s.pKa, d) === roundTo(value, d));
    expect(
      hit,
      `${what} uses pKa ${value}, which is not in Appendix D. Sourced values: ${describeSourced()}`
    ).toBeDefined();
  });

  it('the specific values corrected on 2026-09-19 are the Appendix D ones', () => {
    // Pinned so a future edit cannot quietly walk them back to the other book's numbers.
    expect(round2(pKa(APPENDIX_D1_ACIDS.carbonic.ka[1]))).toBe(10.25); // was 10.33
    expect(round2(pKa(APPENDIX_D1_ACIDS.benzoic.ka[0]))).toBe(4.2); // was 4.19
    expect(round2(pKa(APPENDIX_D1_ACIDS.citric.ka[1]))).toBe(4.77); // was 4.76
    expect(round2(pKaOfConjugateAcid(APPENDIX_D2_BASES.ammonia.kb))).toBe(9.26); // was 9.25
    expect(round2(pKa(APPENDIX_D1_ACIDS.formic.ka[0]))).toBe(3.74); // was 3.75
  });

  it('no problem still carries a superseded value', () => {
    // Matched on the acid as well as the number, deliberately. 4.19 is the wrong
    // value for benzoic AND the right value for oxalic Ka₂ (6.4 × 10⁻⁵), so a
    // bare numeric ban would block a legitimate oxalate buffer if one is ever
    // added. Every row here means "this number, for this acid, came from
    // somewhere other than Appendix D".
    const superseded = [
      { value: 10.33, acid: /HCO₃|NaHCO|bíkarb|karbón/i, why: 'carbonic Ka₂ gives 10.25' },
      { value: 4.19, acid: /C₆H₅COOH|bens[oó]|benz/i, why: 'benzoic gives 4.20' },
      { value: 4.76, acid: /citric|sítrón/i, why: 'citric Ka₂ gives 4.77' },
      { value: 9.25, acid: /NH₄|amm[oó]n/i, why: 'ammonia Kb gives pKa(NH₄⁺) = 9.26' },
      { value: 3.75, acid: /HCOOH|maura|formic/i, why: 'formic gives 3.74, as acetic gives 4.74' },
    ];
    for (const { what, pKa: value, acid } of rows) {
      const hit = superseded.find((x) => x.value === value && x.acid.test(acid));
      expect(hit, `${what} still uses a superseded value — Appendix D ${hit?.why}`).toBeUndefined();
    }
  });
});
