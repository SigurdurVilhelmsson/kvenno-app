/**
 * Electrons in an ion — Stig 3 (year-1 plan item 12, 2026-11-15). The book
 * (`ch02/m68692`) defines `jón`, `katjón` and `anjón` and works Na⁺ and O²⁻:
 * a neutral sodium atom has 11 electrons and the cation 10; oxygen gains two, 8 → 10.
 *
 * Each ion is the one its element forms in the main groups the level covers, with the
 * names `1-ar/nafnakerfid` teaches. The count is derived: electrons = Z − charge.
 */

export interface Ion {
  symbol: string;
  charge: number;
  /** Nominative definite, the subject of the question: `natríumjónin`. */
  name: string;
}

export const IONS: Ion[] = [
  { symbol: 'Li', charge: 1, name: 'litíumjónin' },
  { symbol: 'Na', charge: 1, name: 'natríumjónin' },
  { symbol: 'K', charge: 1, name: 'kalíumjónin' },
  { symbol: 'Mg', charge: 2, name: 'magnesíumjónin' },
  { symbol: 'Ca', charge: 2, name: 'kalsíumjónin' },
  { symbol: 'Al', charge: 3, name: 'áljónin' },
  { symbol: 'N', charge: -3, name: 'nítríðjónin' },
  { symbol: 'O', charge: -2, name: 'oxíðjónin' },
  { symbol: 'S', charge: -2, name: 'súlfíðjónin' },
  { symbol: 'F', charge: -1, name: 'flúoríðjónin' },
  { symbol: 'Cl', charge: -1, name: 'klóríðjónin' },
  { symbol: 'Br', charge: -1, name: 'brómíðjónin' },
];

const SUPERSCRIPT: Record<string, string> = { '1': '¹', '2': '²', '3': '³', '+': '⁺', '-': '⁻' };

/** `Na⁺`, `Mg²⁺`, `O²⁻`: the charge as a superscript, the 1 left out. */
export function ionFormula(ion: Ion): string {
  const size = Math.abs(ion.charge);
  const sign = ion.charge > 0 ? '+' : '-';
  const text = (size === 1 ? '' : String(size)) + sign;
  return ion.symbol + [...text].map((c) => SUPERSCRIPT[c]).join('');
}

/** `1+`, `2−`: the charge as the book writes it in prose. */
export function chargeText(charge: number): string {
  return `${Math.abs(charge)}${charge > 0 ? '+' : '−'}`;
}
