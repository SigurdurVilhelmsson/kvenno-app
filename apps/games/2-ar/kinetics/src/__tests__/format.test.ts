import { describe, it, expect } from 'vitest';

import { formatFactor, formatPercent, formatSignificant } from '../utils/format';

/**
 * The readouts under the catalyst demo and the Maxwell–Boltzmann curve print numbers that run
 * from a few per cent down to 10⁻¹⁵ %, so they switch to powers of ten. A value just under a
 * power of ten must carry into the next one: at 470 K and Ea' = 45 kJ/mol the catalysed
 * fraction is 9,97 × 10⁻⁴ %, and it printed as "10,0 × 10⁻⁴ %".
 */
describe('the kinetics number formats', () => {
  it('never prints a mantissa of ten', () => {
    expect(formatPercent(9.9685e-4)).toBe('1,0 × 10⁻³');
    expect(formatPercent(9.9935e-11)).toBe('1,0 × 10⁻¹⁰');
    expect(formatFactor(99_960)).toBe('1,0 × 10⁵');
    expect(formatSignificant(9.96)).toBe('10');
  });

  it('keeps two significant figures and the decimal comma', () => {
    expect(formatPercent(4.7e-4)).toBe('4,7 × 10⁻⁴');
    expect(formatPercent(0.024)).toBe('2,4 × 10⁻²');
    expect(formatPercent(12.3)).toBe('12');
    expect(formatPercent(0.1)).toBe('0,10');
    expect(formatFactor(973)).toBe('970');
    expect(formatFactor(8.7e11)).toBe('8,7 × 10¹¹');
    expect(formatSignificant(5)).toBe('5,0');
    expect(formatSignificant(0.02)).toBe('0,020');
  });

  it('matches the catalyst demo’s own arithmetic at 470 K and Ea′ = 45 kJ/mol', () => {
    const percent = 100 * Math.exp(-45 / (8.314e-3 * 470));
    expect(formatPercent(percent)).not.toMatch(/^10,/);
  });
});
