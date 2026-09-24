import { describe, expect, it } from 'vitest';

import { ruleFor } from '../components/Level3';
import { segmentName } from '../data/naming';
import { buildablePool } from '../utils/nameParts';

/**
 * The rule Level 3 prints after each answer must describe the name just built.
 *
 * The variable-charge rule said only `Málmur(rómversk tala) + málmleysingi-íð`,
 * so after Kopar(II)súlfat, Járn(III)nítrat, Blý(II)nítrat and Kóbalt(II)nítrat
 * it told the student the anion ends in -íð — for four names whose anion is a
 * polyatomic ion that ends in -at. The plain ionic rule already carried the
 * polyatomic caveat; the variable-charge one did not.
 */

const pool = buildablePool();
const hasIon = (name: string) => (segmentName(name) ?? []).some((m) => m.kind === 'ion');

describe('Level 3 rule text', () => {
  const variableWithIon = pool.filter(
    (c) => c.category === 'málmar-breytilega-hleðsla' && hasIon(c.name)
  );

  it('finds the variable-charge compounds that carry a polyatomic ion', () => {
    expect(variableWithIon.map((c) => c.formula).sort()).toEqual(
      ['Co(NO₃)₂', 'CuSO₄', 'Fe(NO₃)₃', 'Pb(NO₃)₂'].sort()
    );
  });

  it.each(variableWithIon.map((c) => [c.name, c] as const))(
    '%s: names the polyatomic ion, not only -íð',
    (_name, compound) => {
      expect(ruleFor(compound)).toMatch(/fjölatóma jón/);
    }
  );

  it('every compound with a polyatomic ion gets the polyatomic caveat', () => {
    for (const c of pool.filter((p) => hasIon(p.name))) {
      expect(ruleFor(c), c.name).toMatch(/fjölatóma jón/);
    }
  });

  it('spells the Greek prefix as the parts do', () => {
    const molecular = pool.find((c) => c.type === 'molecular')!;
    expect(ruleFor(molecular)).toMatch(/Mónó-/);
  });
});
