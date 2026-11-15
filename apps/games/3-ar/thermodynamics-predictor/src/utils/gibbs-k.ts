import { parseStudentNumber } from '@shared/utils';

/**
 * ΔG° = −RT ln K, both ways (Brown 19.7; the school's book, ch. 16, m68819 "Frjáls orka og
 * jafnvægi").
 *
 * R is 8,314 J/(mól·K), the value the book prints beside this equation, so a student's
 * calculator and the game agree to the last digit shown. ΔG° is in kJ/mól everywhere in this
 * game, and the factor of 1000 is written out here, not hidden in R, because forgetting it is
 * the mistake the feedback names.
 */
export const R_J = 8.314;

/** K from ΔG° (kJ/mól) at T (K). */
export function kFromDeltaG(deltaG: number, temp: number): number {
  return Math.exp((-deltaG * 1000) / (R_J * temp));
}

/** ΔG° (kJ/mól) from K at T (K). */
export function deltaGFromK(k: number, temp: number): number {
  return (-R_J * temp * Math.log(k)) / 1000;
}

/** How many kJ/mól of ΔG° change K tenfold at T: RT ln 10, 5,7 kJ/mól at 298 K. */
export function kJPerDecade(temp: number): number {
  return (Math.LN10 * R_J * temp) / 1000;
}

/** K is right within this fraction: rounding ΔG°/RT to two decimals moves K by up to 0,5 %. */
export const K_TOLERANCE = 0.05;

/**
 * How far (kJ/mól) a typed ΔG° may be from the answer: 1 %, at least 0,1.
 *
 * K is given to two figures, and the answer is worked from K exactly as printed, so rounding
 * ln K to three figures stays inside 1 %. Every slip the feedback names lands far outside it:
 * the sign (200 %), log₁₀ for ln (a factor 2,3), joules for kilojoules (a factor 1000).
 */
export function deltaGTolerance(answer: number): number {
  return Math.max(0.1, 0.01 * Math.abs(answer));
}

export function isGibbsDeltaGCorrect(typed: string, answer: number): boolean {
  const value = parseStudentNumber(typed);
  return Number.isFinite(value) && Math.abs(value - answer) <= deltaGTolerance(answer);
}

/** A mistake the feedback can name, read from the value the student gave. */
export type GibbsSlip = 'formerki' | 'kilojoule' | 'log10';

const near = (value: number, target: number, tol: number) =>
  Number.isFinite(value) &&
  Number.isFinite(target) &&
  Math.abs(value - target) <= tol * Math.abs(target);

/** Which slip, if any, gives the K a student found (`k`) from ΔG° at T. */
export function kSlip(k: number, deltaG: number, temp: number): GibbsSlip | null {
  if (near(k, 1 / kFromDeltaG(deltaG, temp), K_TOLERANCE)) return 'formerki';
  if (near(k, Math.exp(-deltaG / (R_J * temp)), 0.01)) return 'kilojoule';
  if (near(k, Math.pow(10, (-deltaG * 1000) / (R_J * temp)), K_TOLERANCE)) return 'log10';
  return null;
}

/** Which slip, if any, gives the ΔG° a student found (`deltaG`, kJ/mól) from K at T. */
export function deltaGSlip(deltaG: number, k: number, temp: number): GibbsSlip | null {
  const answer = deltaGFromK(k, temp);
  if (near(deltaG, -answer, 0.01)) return 'formerki';
  if (near(deltaG, answer * 1000, 0.01)) return 'kilojoule';
  if (near(deltaG, answer / Math.LN10, 0.01)) return 'log10';
  return null;
}
