/**
 * Valence electrons, Lewis symbols and the configurations of ions, worked out from Z, for the
 * bridge to Lewis-formúlur. The book: ch. 6 (m68734) for valence and core electrons and for
 * ions ("Rafeindaskipan jóna"), ch. 7 (m68739) for Lewis symbols.
 *
 * Nothing here is stored per element. A configuration is built by the Aufbau order, with the two
 * exceptions the game already teaches (Cr and Cu, Stig 3), and an ion is made from its atom:
 * electrons leave from the highest n first, and within it from the highest l, which is the book's
 * rule for both cases — a main-group atom loses the electrons it gained last, a transition metal
 * loses ns before (n − 1)d. Electrons an anion gains go in by Aufbau order.
 */

export interface Subshell {
  n: number;
  l: number;
  e: number;
}

/** Filling order as far as krypton, which is as far as the game goes. */
const FILLING: readonly [number, number][] = [
  [1, 0],
  [2, 0],
  [2, 1],
  [3, 0],
  [3, 1],
  [4, 0],
  [3, 2],
  [4, 1],
];
const LETTER = ['s', 'p', 'd', 'f'];
const capacity = (l: number) => 2 * (2 * l + 1);
const MAX_Z = 36;

/** The two exceptions of the first transition series, as Stig 3 teaches them. */
const EXCEPTIONS: Record<number, Subshell[]> = {
  24: [
    { n: 4, l: 0, e: 1 },
    { n: 3, l: 2, e: 5 },
  ],
  29: [
    { n: 4, l: 0, e: 1 },
    { n: 3, l: 2, e: 10 },
  ],
};

const order = (s: Subshell) => FILLING.findIndex(([n, l]) => n === s.n && l === s.l);
const sorted = (subs: Subshell[]) => [...subs].sort((a, b) => order(a) - order(b));

function fill(subs: Subshell[], electrons: number): Subshell[] {
  const out = subs.map((s) => ({ ...s }));
  let left = electrons;
  for (const [n, l] of FILLING) {
    if (left === 0) break;
    let sub = out.find((s) => s.n === n && s.l === l);
    if (!sub) {
      sub = { n, l, e: 0 };
      out.push(sub);
    }
    const take = Math.min(capacity(l) - sub.e, left);
    sub.e += take;
    left -= take;
  }
  if (left > 0) throw new Error(`more than ${MAX_Z} electrons`);
  return sorted(out.filter((s) => s.e > 0));
}

/** The ground-state configuration of a neutral atom, Z from 1 to 36. */
export function atomConfig(z: number): Subshell[] {
  if (!Number.isInteger(z) || z < 1 || z > MAX_Z) throw new Error(`Z = ${z} is outside 1–36`);
  const base = fill([], z);
  const exception = EXCEPTIONS[z];
  if (!exception) return base;
  return sorted([
    ...base.filter((s) => !exception.some((x) => x.n === s.n && x.l === s.l)),
    ...exception,
  ]);
}

/** The configuration of the ion of charge `charge` made from atom Z. */
export function ionConfig(z: number, charge: number): Subshell[] {
  const atom = atomConfig(z);
  if (charge < 0) return fill(atom, -charge);
  const out = atom.map((s) => ({ ...s }));
  for (let i = 0; i < charge; i++) {
    const from = out.filter((s) => s.e > 0).sort((a, b) => b.n - a.n || b.l - a.l)[0];
    if (!from) throw new Error(`Z = ${z} has fewer than ${charge} electrons`);
    from.e -= 1;
  }
  return sorted(out.filter((s) => s.e > 0));
}

const NOBLE: readonly [number, string][] = [
  [36, 'Kr'],
  [18, 'Ar'],
  [10, 'Ne'],
  [2, 'He'],
];

const SUP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
};
const sup = (text: string) => [...text].map((c) => SUP[c] ?? c).join('');

export const subshellText = (s: Subshell) => `${s.n}${LETTER[s.l]}${sup(String(s.e))}`;

/** Every subshell written out, in filling order: `1s² 2s² 2p⁶`. */
export function fullText(subs: Subshell[]): string {
  return sorted(subs).map(subshellText).join(' ');
}

/**
 * The noble-gas shorthand: the largest noble gas whose every subshell the configuration holds
 * full, then the rest in filling order. An ion with a noble gas's electrons is that gas alone,
 * so Cl⁻ is `[Ar]` and Na⁺ is `[Ne]`.
 */
export function shorthand(subs: Subshell[]): string {
  for (const [z, symbol] of NOBLE) {
    const core = atomConfig(z);
    const held = core.every((c) => subs.some((s) => s.n === c.n && s.l === c.l && s.e === c.e));
    if (!held) continue;
    const rest = sorted(subs).filter((s) => !core.some((c) => c.n === s.n && c.l === s.l));
    return [`[${symbol}]`, ...rest.map(subshellText)].join(' ');
  }
  return fullText(subs);
}

/** Z of the transition metals in the game's range, which have no main-group valence count. */
const isTransition = (z: number) => z >= 21 && z <= 30;

/**
 * Valence electrons of a main-group atom: those with the highest n (m68734). A filled d subshell
 * below them counts as core, so bromine has seven, not seventeen.
 */
export function valenceSubshells(z: number): Subshell[] {
  if (isTransition(z)) throw new Error(`Z = ${z} is a transition metal`);
  const atom = atomConfig(z);
  const highest = Math.max(...atom.map((s) => s.n));
  return atom.filter((s) => s.n === highest);
}

export function valenceElectrons(z: number): number {
  return valenceSubshells(z).reduce((sum, s) => sum + s.e, 0);
}

/** Dots on the four sides of a Lewis symbol, in the order top, right, bottom, left. */
export type Sides = readonly [number, number, number, number];

/**
 * A Lewis symbol's dots: one on each side before any side takes a second (m68739). So nitrogen
 * is a pair and three singles, never two pairs and a single.
 */
export function lewisSides(valence: number): Sides {
  if (!Number.isInteger(valence) || valence < 1 || valence > 8) {
    throw new Error(`a Lewis symbol has 1 to 8 dots, not ${valence}`);
  }
  const sides = [0, 0, 0, 0];
  for (let i = 0; i < valence; i++) sides[i % 4] += 1;
  return sides as unknown as Sides;
}

export const sameSides = (a: Sides, b: Sides) => a.every((n, i) => n === b[i]);

/** `Fe²⁺`, `O²⁻`, `Na⁺`. */
export function ionLabel(symbol: string, charge: number): string {
  if (charge === 0) return symbol;
  const size = Math.abs(charge) === 1 ? '' : String(Math.abs(charge));
  return `${symbol}${sup(size + (charge > 0 ? '+' : '-'))}`;
}

/** How a Lewis symbol's dots read aloud: `5 punktar: eitt par og þrír stakir`. */
export function sidesLabel(sides: Sides): string {
  const total = sides.reduce((a, b) => a + b, 0);
  const pairs = sides.filter((n) => n === 2).length;
  const singles = sides.filter((n) => n === 1).length;
  const PAIRS = ['engin pör', 'eitt par', 'tvö pör', 'þrjú pör', 'fjögur pör'];
  const SINGLES = ['enginn stakur', 'einn stakur', 'tveir stakir', 'þrír stakir', 'fjórir stakir'];
  if (total === 1) return '1 punktur';
  const head = `${total} punktar`;
  if (pairs === 0) return `${head}, allir stakir`;
  if (singles === 0) return `${head}, ${PAIRS[pairs]}`;
  return `${head}: ${PAIRS[pairs]} og ${SINGLES[singles]}`;
}
