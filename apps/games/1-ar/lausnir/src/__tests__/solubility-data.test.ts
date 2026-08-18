import { describe, it, expect } from 'vitest';

import { SOLUBILITY_DATA, formatSolubility } from '../components/TemperatureSolubility';

const at = (formula: string) => {
  const d = SOLUBILITY_DATA.find((x) => x.formula === formula);
  if (!d) throw new Error(`no solubility data for ${formula}`);
  return d;
};

describe('solubility data is all in one unit', () => {
  // The chart's y-axis is labelled g/100g H2O and the solids are in that unit
  // (NaCl 35.7 at 0 C, KNO3 13.3, sucrose 179). The two gases held g/L figures
  // instead, so every gas curve sat 10x too high under a label that said
  // otherwise. 1 L of water is 1000 g, so g/L / 10 = g/100 g.
  it('CO2 is g/100 g water at 1 atm, not g/L', () => {
    expect(at('CO₂').solubility[0]).toBeCloseTo(0.335, 4);
  });

  it('O2 is g/100 g water at 1 atm, not g/L', () => {
    expect(at('O₂').solubility[0]).toBeCloseTo(0.0069, 5);
  });

  it('no gas exceeds 1 g per 100 g of water', () => {
    // A sanity bound, not a ranking: CO2 at 0.335 genuinely beats calcium
    // sulfate at 0.21, so "gases are less soluble than solids" is false here.
    // But no gas in this set approaches 1 g/100g at 1 atm, so a value above it
    // means the g/L figures have come back.
    for (const gas of SOLUBILITY_DATA.filter((d) => d.type === 'gas')) {
      expect(Math.max(...gas.solubility), gas.formula).toBeLessThan(1);
    }
  });

  it('every gas curve falls with temperature and reaches zero at boiling', () => {
    for (const gas of SOLUBILITY_DATA.filter((d) => d.type === 'gas')) {
      const strictlyFalling = gas.solubility
        .slice(0, -1)
        .every((v, i) => v > gas.solubility[i + 1]);
      expect(strictlyFalling, `${gas.formula} should fall with temperature`).toBe(true);
      expect(gas.solubility[gas.solubility.length - 1]).toBe(0);
    }
  });
});

describe('formatSolubility', () => {
  // toFixed(1) everywhere printed the corrected O2 figure as "0.0", so fixing the
  // data alone would have hidden the gas curves behind a rounded-away label.
  it('keeps a small gas value visible', () => {
    expect(formatSolubility(0.0069)).toBe('0.0069');
  });

  it('does not pad a large solid value with noise', () => {
    expect(formatSolubility(245.9)).toBe('246');
  });

  it('keeps one decimal in the ordinary range', () => {
    expect(formatSolubility(35.7)).toBe('35.7');
  });

  it('renders zero plainly', () => {
    expect(formatSolubility(0)).toBe('0');
  });
});
