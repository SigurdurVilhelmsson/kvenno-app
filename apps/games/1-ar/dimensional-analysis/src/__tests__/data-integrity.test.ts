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
