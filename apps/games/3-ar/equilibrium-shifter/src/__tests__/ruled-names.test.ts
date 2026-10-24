import { describe, expect, it } from 'vitest';

import { equilibria } from '../data/equilibria';

/**
 * Two rulings of 2026-10-23 on the systems' data.
 *
 * **Decision 102 (b): acetic acid offers no temperature stress.** It is in the
 * game twice: id 8 with a bare proton stored ΔH = +5 kJ/mól and answered heating
 * as a shift, and id 24 with hydronium stored 0, the same chemistry. Neither
 * value is sourced and the literature value is near 0, so heating id 8 graded a
 * direction nobody can stand behind. The stored ΔH stays: the book's table of
 * species in water, transcribed 2026-10-23, has no row for CH₃COOH(aq) or
 * CH₃COO⁻(aq), so nothing sources it.
 *
 * **Decision 104: names.** The complex ions take `flókajón`, as `ordabok.md`
 * has it; steam reforming is named as the textbook names it; and two systems
 * named as if they were several reactions are named for the one equation each
 * shows. `icelandic-text.test.ts` bans the old forms in the source.
 */

const byId = (id: number) => equilibria.find((e) => e.id === id)!;

describe('acetic acid', () => {
  it('offers no temperature stress, in either system', () => {
    for (const id of [8, 24]) {
      expect(byId(id).equation, String(id)).toContain('CH₃COOH');
      expect(
        byId(id).possibleStresses.filter((s) => s.type.includes('temp')),
        String(id)
      ).toEqual([]);
    }
  });
});

describe('the ruled names', () => {
  it.each([
    [6, 'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)', 'Járn-þíósýanatflókajón'],
    [17, 'CH₄(g) + H₂O(g) ⇌ CO(g) + 3H₂(g)', 'Hvarf metans og vatnsgufu'],
    [22, 'Cu(NH₃)₄²⁺(aq) ⇌ Cu²⁺(aq) + 4NH₃(aq)', 'Kopar-ammóníakflókajón'],
    [23, '2C(s) + O₂(g) ⇌ 2CO(g)', 'Bruni kolefnis í kolmónoxíð'],
    [27, 'H₃PO₄(aq) ⇌ H⁺(aq) + H₂PO₄⁻(aq)', 'Fyrsta klofnunarþrep fosfórsýru'],
  ])('id %i', (id, equation, name) => {
    expect(byId(id).equation).toBe(equation);
    expect(byId(id).nameIs).toBe(name);
  });
});
