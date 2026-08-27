/**
 * The cooling direction, and the numbers the scenarios quote.
 *
 * Every temperature scenario this level shipped with heats the solution and
 * asks whether more dissolves. `TemperatureComparison` has drawn a "❄️ Kæla"
 * arrow since it was written and no scenario ever asked for one — so the level
 * never taught the direction that matters: cooling a saturated solution forces
 * the excess out as crystals, which is how crystals are grown and how a solid
 * is purified by recrystallisation. Two scenarios harvested from the frozen
 * repo's saturation data close that, and this pins them.
 *
 * The figures in an explanation are prose, so nothing stops them drifting away
 * from the curve the same screen draws. These read both out of
 * `SOLUBILITY_DATA` and check the arithmetic the student is being shown.
 */

import { describe, it, expect } from 'vitest';

import { SCENARIOS } from '../components/Level2';
import { SOLUBILITY_DATA } from '../components/TemperatureSolubility';

const TEMPERATURES = [0, 20, 40, 60, 80, 100];

function solubilityAt(formula: string, temperature: number): number {
  const compound = SOLUBILITY_DATA.find((d) => d.formula === formula);
  if (!compound) throw new Error(`no solubility data for ${formula}`);
  const index = TEMPERATURES.indexOf(temperature);
  if (index === -1) throw new Error(`${temperature}°C is not a tabulated temperature`);
  return compound.solubility[index];
}

const temperatureScenarios = SCENARIOS.filter((s) => s.type === 'temperature');
const scenario = (id: number) => {
  const found = SCENARIOS.find((s) => s.id === id);
  if (!found || found.type !== 'temperature') throw new Error(`no temperature scenario ${id}`);
  return found;
};
const correctOption = (id: number) => {
  const options = scenario(id).options.filter((o) => o.isCorrect);
  expect(options, `scenario ${id} must have exactly one correct option`).toHaveLength(1);
  return options[0];
};

describe('the level asks about cooling at all', () => {
  it('has at least one scenario that cools the solution', () => {
    const cooling = temperatureScenarios.filter((s) => s.tempAfter < s.tempBefore);
    expect(cooling.map((s) => s.title)).not.toEqual([]);
  });

  it('every scenario has exactly one correct option', () => {
    for (const s of SCENARIOS) {
      expect(
        s.options.filter((o) => o.isCorrect),
        s.title
      ).toHaveLength(1);
    }
  });
});

describe('kristöllun við kælingu (KNO₃, 100°C → 20°C)', () => {
  const s = scenario(11);

  it('cools potassium nitrate over the tabulated range', () => {
    expect(s.compound.formula).toBe('KNO₃');
    expect(s.tempBefore).toBe(100);
    expect(s.tempAfter).toBe(20);
  });

  it('starts from an amount the hot solution can actually hold', () => {
    // 200 g is the premise. If it exceeded the 100°C limit the question would
    // be about something else entirely — undissolved solid, not crystallisation.
    expect(solubilityAt('KNO₃', 100)).toBeGreaterThan(200);
  });

  it('quotes the mass the curve actually gives', () => {
    const precipitated = 200 - solubilityAt('KNO₃', 20);
    expect(Math.round(precipitated)).toBe(168);
    expect(correctOption(11).text).toContain('168');
  });
});

describe('öfug leysni (CaSO₄, 40°C → 80°C)', () => {
  const s = scenario(12);

  it('heats calcium sulfate, the retrograde case', () => {
    expect(s.compound.formula).toBe('CaSO₄');
    expect(s.tempBefore).toBe(40);
    expect(s.tempAfter).toBe(80);
  });

  it('is only a question because the curve really does fall', () => {
    // The whole scenario rests on CaSO₄ being the exception. If the data were
    // ever "corrected" to rise with temperature, the keyed answer would become
    // wrong and this says so.
    expect(solubilityAt('CaSO₄', 80)).toBeLessThan(solubilityAt('CaSO₄', 40));
  });

  it('quotes both figures to the precision the curve supports', () => {
    expect(solubilityAt('CaSO₄', 40).toFixed(2)).toBe('0.21');
    expect(solubilityAt('CaSO₄', 80).toFixed(2)).toBe('0.16');
    expect(correctOption(12).explanation).toContain('0.21');
    expect(correctOption(12).explanation).toContain('0.16');
  });
});

describe('the word for solubility', () => {
  // `ordabok.md` gives `solubility;leysni`, and the school's textbook corpus
  // has 260 hits for `leysni` against zero for `leysigeta` — the coinage this
  // game shipped in all nineteen places it names its own subject.
  const allText = SCENARIOS.flatMap((s) => [
    s.title,
    s.setup,
    s.question,
    s.hint,
    s.concept,
    ...s.options.flatMap((o) => [o.text, o.explanation]),
  ]).join('\n');

  it('is leysni, never leysigeta or leysanleiki', () => {
    expect(allText).not.toMatch(/leysigetu?/i);
    expect(allText).not.toMatch(/leysanleik/i);
    expect(allText).toMatch(/leysni/);
  });
});
