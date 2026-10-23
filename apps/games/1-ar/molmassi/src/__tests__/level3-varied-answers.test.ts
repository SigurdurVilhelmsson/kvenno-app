import { describe, expect, it } from 'vitest';

import { buildProblem, DESCRIPTORS } from '../components/Level3';

/**
 * Decision 43 (b). Five of Stig 3's six mass-to-particles problems were 2 mól —
 * 36 g of water, 88 g of CO₂, 117 g of NaCl, 34 g of NH₃ and 64 g of O₂ — so all
 * five came to 1,20 × 10²⁴, and a student who noticed could answer without
 * calculating. Water, CO₂ and NaCl now weigh 27 g, 110 g and 175,5 g: 1,5, 2,5
 * and 3 mól. The answers are still derived from the masses, never written.
 * NH₃ and O₂ were left at 2 mól, as the ruling named only the three.
 */

const AVOGADRO = 6.022e23;
const massToParticles = DESCRIPTORS.filter((d) => d.type === 'mass-to-particles').map(
  (d) => [d.formula, buildProblem(d)] as const
);

/** Same answer, as the level grades it: within 5 %. */
const same = (a: number, b: number) => Math.abs(a - b) / Math.abs(b) <= 0.05;

describe('Stig 3 mass-to-particles answers', () => {
  it('are six problems', () => {
    expect(massToParticles).toHaveLength(6);
  });

  it.each([
    ['H₂O', 1.5],
    ['CO₂', 2.5],
    ['NaCl', 3],
  ])('%s comes to %s mól', (formula, moles) => {
    const [, problem] = massToParticles.find(([f]) => f === formula)!;
    expect(problem.answer / AVOGADRO).toBeCloseTo(moles, 2);
  });

  it('no answer is shared by more than two problems', () => {
    for (const [formula, { answer }] of massToParticles) {
      const sharing = massToParticles.filter(([, p]) => same(p.answer, answer));
      expect(sharing.length, `${formula}: ${sharing.map(([f]) => f).join(', ')}`).toBeLessThan(3);
    }
  });

  it('prints a mass with a decimal comma in the worked steps', () => {
    const [, nacl] = massToParticles.find(([f]) => f === 'NaCl')!;
    expect(nacl.question).toContain('175,5 g');
    expect(nacl.steps[1]).toContain('175,5 g ×');
  });
});
