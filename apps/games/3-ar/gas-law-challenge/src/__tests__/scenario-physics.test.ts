import { describe, expect, it } from 'vitest';

import { questions } from '../data/questions';
import { GAS_LAW_INFO } from '../types';

/**
 * Scenarios that taught wrong physics, fixed 2026-11-14 from the Year-3 development plan.
 */
const byId = (id: number) => questions.find((q) => q.id === id)!;

describe('the scenarios', () => {
  it('does not put a car tyre at constant pressure (Charles), since a tyre keeps its volume', () => {
    const q = byId(17);
    expect(q.gasLaw).toBe('charles');
    expect(q.scenario_is).not.toMatch(/dekk|hjólbarð/i);
  });

  it('tells the student that Gay-Lussac needs total pressure, not a tyre gauge reading', () => {
    expect(byId(19).scenario_is).toMatch(/heildarþrýsting/i);
  });

  it('keeps no liquid seawater below its freezing point', () => {
    expect(byId(8).scenario_is).not.toMatch(/dýpi|hafi/i);
  });

  it('puts no air in the lungs at −30 °C', () => {
    expect(byId(9).scenario_is).not.toMatch(/lung/i);
  });
});

describe('the kinetic picture in the principle texts', () => {
  it('ties temperature to mean kinetic energy, and never calls pressure only a count', () => {
    expect(GAS_LAW_INFO.ideal.principleIs).toMatch(/meðalhreyfiorku/);
    expect(GAS_LAW_INFO.ideal.principleIs).not.toMatch(/fjölda árekstra \(P\)/);
    expect(GAS_LAW_INFO.avogadro.principleIs).not.toMatch(/sama árekstri/);
    expect(GAS_LAW_INFO['gay-lussac'].principleIs).not.toMatch(/harðari árekstur\b/);
  });
});
