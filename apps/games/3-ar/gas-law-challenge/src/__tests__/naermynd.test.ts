import { describe, expect, it } from 'vitest';

import {
  CONTROLS,
  FIXED,
  MOL_PER_PARTICLE,
  N0,
  P0,
  P_GAUGE_MAX,
  T0,
  V0,
  V_DRAW_MAX,
  kinetic,
  particleCount,
  stateAt,
  type SceneKind,
} from '../engine/naermynd';
import { R } from '../types';

const KINDS: SceneKind[] = ['boyle', 'charles', 'gayLussac', 'avogadro'];

function across(kind: SceneKind) {
  const { min, max, step } = CONTROLS[kind];
  const out: number[] = [];
  for (let x = min; x <= max + 1e-9; x += step) out.push(x);
  return out;
}

describe('Nærmynd engine (gas laws)', () => {
  it('starts every scene at 1,00 mól, 300 K and 1,00 atm', () => {
    for (const kind of KINDS) {
      const s = stateAt(kind, CONTROLS[kind].start);
      expect(s.n, kind).toBeCloseTo(N0, 10);
      expect(s.T, kind).toBeCloseTo(T0, 10);
      expect(s.P, kind).toBeCloseTo(P0, 2);
    }
  });

  it('obeys PV = nRT with the game’s R everywhere it can be put', () => {
    for (const kind of KINDS) {
      for (const x of across(kind)) {
        const s = stateAt(kind, x);
        expect(s.P * s.V, `${kind} ${x}`).toBeCloseTo(s.n * R * s.T, 9);
      }
    }
  });

  it('holds fixed exactly what each scene says it holds fixed', () => {
    const start = { P: P0, V: V0, T: T0, n: N0 };
    for (const kind of KINDS) {
      for (const x of across(kind)) {
        const s = stateAt(kind, x);
        for (const v of FIXED[kind]) expect(s[v], `${kind} ${v}`).toBeCloseTo(start[v], 10);
      }
    }
  });

  it('keeps every scene inside the drawn cylinder and the gauge, so nothing clamps', () => {
    for (const kind of KINDS) {
      for (const x of across(kind)) {
        const s = stateAt(kind, x);
        expect(s.V, kind).toBeLessThanOrEqual(V_DRAW_MAX);
        expect(s.P, kind).toBeLessThanOrEqual(P_GAUGE_MAX);
      }
    }
  });

  it('draws one circle per 0,050 mól, so a step of the n slider adds exactly one', () => {
    expect(MOL_PER_PARTICLE).toBe(0.05);
    expect(particleCount(N0)).toBe(20);
    const counts = across('avogadro').map((n) => particleCount(n));
    counts.slice(1).forEach((c, i) => expect(c - counts[i]).toBe(1));
  });

  it('builds P/P₀ from hits × push, the two bars the screen draws', () => {
    for (const kind of KINDS) {
      for (const x of across(kind)) {
        const s = stateAt(kind, x);
        const k = kinetic(s);
        expect(k.hits * k.push).toBeCloseTo(s.P / P0, 2);
      }
    }
  });

  it('halving the volume doubles the hits and leaves each push alone (Boyle)', () => {
    const a = kinetic(stateAt('boyle', 24));
    const b = kinetic(stateAt('boyle', 12));
    expect(b.hits / a.hits).toBeCloseTo(2, 10);
    expect(b.push).toBeCloseTo(a.push, 10);
  });
});
