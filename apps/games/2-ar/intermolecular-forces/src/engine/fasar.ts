/**
 * Fasabreytingar og fasarit: the arithmetic of heating curves and the Clausius-Clapeyron
 * equation, from the book's ch. 10.3 (m68768, Fasabreytingar).
 *
 * The constants are the ones the book's own worked example uses for water (135 g of ice at
 * −15 °C to steam at 120 °C): specific heats 2,09, 4,184 and 1,84 J/(g·°C), ΔH(bræðslu) =
 * 6,01 kJ/mól at 0 °C and ΔH(gufunar) = 40,67 kJ/mól at 100 °C, the value at the boiling point
 * rather than the 44,01 kJ/mól at 25 °C, as the book notes.
 */
import { molarMassOf } from '@shared/utils';

export const R = 8.314;

export const WATER = {
  M: molarMassOf('H2O'),
  cIce: 2.09,
  cWater: 4.184,
  cSteam: 1.84,
  fusion: 6.01,
  vaporisation: 40.67,
  melts: 0,
  boils: 100,
} as const;

export type Phase = 'ís' | 'vatn' | 'gufa';

export interface Step {
  /** What happens in this stretch: one phase warming or cooling, or a phase change. */
  kind: 'hitun' | 'hamskipti';
  phase: Phase;
  /** The phase after the step: the same as `phase` while warming. */
  to: Phase;
  from: number;
  until: number;
  /** Heat into the water, in kJ: negative while it cools. */
  q: number;
}

const phaseAt = (t: number, warming: boolean): Phase =>
  t < WATER.melts || (t === WATER.melts && warming)
    ? 'ís'
    : t < WATER.boils || (t === WATER.boils && warming)
      ? 'vatn'
      : 'gufa';

const cOf = (p: Phase) => (p === 'ís' ? WATER.cIce : p === 'vatn' ? WATER.cWater : WATER.cSteam);

/**
 * The steps that take `mass` grams of water from `t1` to `t2` (°C), each with its heat in kJ:
 * q = m·c·ΔT while one phase warms or cools, q = n·ΔH across a phase change, with the sign
 * of ΔH turned for freezing and condensing.
 */
export function heatSteps(mass: number, t1: number, t2: number): Step[] {
  const warming = t2 > t1;
  const n = mass / WATER.M;
  const marks = [WATER.melts, WATER.boils].filter((m) =>
    warming ? m > t1 && m < t2 : m < t1 && m > t2
  );
  if (!warming) marks.reverse();
  const steps: Step[] = [];
  let t = t1;
  let phase = phaseAt(t1, warming);
  for (const mark of [...marks, t2]) {
    if (mark !== t) {
      steps.push({
        kind: 'hitun',
        phase,
        to: phase,
        from: t,
        until: mark,
        q: (mass * cOf(phase) * (mark - t)) / 1000,
      });
    }
    t = mark;
    if (mark === t2) break;
    const next: Phase =
      mark === WATER.melts ? (warming ? 'vatn' : 'ís') : warming ? 'gufa' : 'vatn';
    const dH = mark === WATER.melts ? WATER.fusion : WATER.vaporisation;
    steps.push({
      kind: 'hamskipti',
      phase,
      to: next,
      from: mark,
      until: mark,
      q: (warming ? 1 : -1) * n * dH,
    });
    phase = next;
  }
  return steps;
}

/** Total heat into the water, in kJ. */
export const totalHeat = (mass: number, t1: number, t2: number) =>
  heatSteps(mass, t1, t2).reduce((sum, s) => sum + s.q, 0);

/** The heat to melt `mass` grams of a substance of molar mass `M` with ΔH(bræðslu) in kJ/mól. */
export const meltHeat = (mass: number, M: number, fusion: number) => (mass / M) * fusion;

/**
 * ΔH(gufunar) in kJ/mól from the vapour pressure at two temperatures (°C), the
 * Clausius-Clapeyron equation: ln(P₂/P₁) = (ΔH/R)(1/T₁ − 1/T₂).
 */
export function vaporisationEnthalpy(t1: number, p1: number, t2: number, p2: number): number {
  const T1 = t1 + 273.15;
  const T2 = t2 + 273.15;
  return (R * Math.log(p2 / p1)) / (1 / T1 - 1 / T2) / 1000;
}

export interface CurvePoint {
  /** Heat added so far, kJ. */
  q: number;
  t: number;
}

/** The corners of the heating curve from `t1` to `t2`, for drawing. */
export function heatingCurve(mass: number, t1: number, t2: number): CurvePoint[] {
  const points: CurvePoint[] = [{ q: 0, t: t1 }];
  let q = 0;
  for (const s of heatSteps(mass, t1, t2)) {
    q += s.q;
    points.push({ q, t: s.until });
  }
  return points;
}

export interface State {
  t: number;
  ice: number;
  water: number;
  steam: number;
}

/**
 * Where the water is after `added` kJ from the start of the curve: its temperature and how many
 * grams are ice, liquid and steam. On a plateau the temperature stands still and the heat goes
 * into the phase change.
 */
export function stateAfter(mass: number, t1: number, t2: number, added: number): State {
  let left = added;
  const at = (phase: Phase, t: number): State => ({
    t,
    ice: phase === 'ís' ? mass : 0,
    water: phase === 'vatn' ? mass : 0,
    steam: phase === 'gufa' ? mass : 0,
  });
  const steps = heatSteps(mass, t1, t2);
  for (const s of steps) {
    if (left <= s.q) {
      const f = s.q === 0 ? 1 : left / s.q;
      if (s.kind === 'hitun') return at(s.phase, s.from + f * (s.until - s.from));
      const changed = f * mass;
      const state = at(s.phase, s.from);
      if (s.phase === 'ís') return { ...state, ice: mass - changed, water: changed };
      return { ...state, water: mass - changed, steam: changed };
    }
    left -= s.q;
  }
  const last = steps[steps.length - 1];
  return at(last ? last.to : phaseAt(t2, true), t2);
}

/** Within 1 % of the key, which the book's three-figure answers fit. */
export function closeTo(value: number, key: number, tolerance = 0.01): boolean {
  return Number.isFinite(value) && Math.abs(value - key) <= Math.abs(key) * tolerance;
}
