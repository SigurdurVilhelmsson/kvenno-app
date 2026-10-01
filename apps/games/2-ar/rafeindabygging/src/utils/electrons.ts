/**
 * The arithmetic and wording this game derives rather than stores.
 *
 * Every function here replaces something that used to be written out by hand
 * and was wrong: an electron count read off a string whose spaces had been
 * stripped, an orbital diagram that paired electrons before Hund's rule allows
 * it, and a valence-electron line that counted a full 3d¹⁰ as valence.
 */

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/**
 * Sum the electrons in a configuration a student typed, such as `1s2 2s2 2p4`,
 * `1s² 2s² 2p⁴` or `1s22s22p4` — or `null` when the text is not a sequence of
 * subshells at all (a noble-gas core like `[Ne]`, stray punctuation), because a
 * diagnostic built on a guess is worse than none.
 *
 * It must read the student's own text, not the grader's normalised copy: that
 * copy has its spaces stripped, so `1s2 2s2` arrives as `1s22s2`, and a greedy
 * read takes `1s22` for twenty-two electrons.
 *
 * Unspaced ASCII is still readable, because the parse must consume the whole
 * string: in `1s22s2`, a two-digit exponent `22` would leave `s2`, which is not a
 * subshell, so only `2` followed by `2s2` fits. The two readings can never both
 * fit, since after a two-digit exponent the next character must be a digit (the
 * next shell's n) and after a one-digit exponent it must be a letter.
 */
export function countElectrons(input: string): number | null {
  const subshells = readSubshells(input);
  return subshells === null ? null : subshells.reduce((sum, s) => sum + s.electrons, 0);
}

/** One subshell as a student wrote it: `3d⁶` is `{ subshell: '3d', electrons: 6 }`. */
export interface WrittenSubshell {
  subshell: string;
  electrons: number;
}

/**
 * The subshells a student typed, in the order typed, or `null` when the text is
 * not a sequence of subshells. Spaces, commas, semicolons and a caret before the
 * exponent (`1s^2`) all separate; the reading rules are `countElectrons`'s.
 */
export function readSubshells(input: string): WrittenSubshell[] | null {
  const text = input
    // A run of superscripts is unambiguous; end it with a space so its ASCII
    // copy cannot run into the next subshell's n.
    .replace(
      /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,
      (run) => Array.from(run, (c) => SUPERSCRIPT_DIGITS.indexOf(c)).join('') + ' '
    )
    .replace(/\^/g, '')
    .toLowerCase()
    .trim();
  if (!text) return null;
  return readFrom(text, 0);
}

function readFrom(text: string, start: number): WrittenSubshell[] | null {
  let i = start;
  while (i < text.length && /[\s,;]/.test(text[i])) i++;
  if (i === text.length) return [];

  const match = /^([1-7][spdf])(\d{1,2})/.exec(text.slice(i));
  if (!match) return null;
  const digits = match[2];
  for (const length of [2, 1]) {
    if (digits.length < length) continue;
    const rest = readFrom(text, i + 2 + length);
    if (rest !== null)
      return [{ subshell: match[1], electrons: parseInt(digits.slice(0, length), 10) }, ...rest];
  }
  return null;
}

/**
 * When a wrong answer holds exactly the right subshells with the right electrons
 * and only their order differs, the first pair out of order: `['4s', '3d']` for
 * iron written `… 3d⁶ 4s²`. `null` otherwise. Stig 2 grades the order the book
 * writes, the Aufbau order, and this lets it say so rather than only "Rangt",
 * since the electron counts it checks first all agree (decisions item 64).
 */
export function firstOutOfOrder(typed: string, correct: string): [string, string] | null {
  const mine = readSubshells(typed);
  const right = readSubshells(correct);
  if (!mine || !right || mine.length !== right.length) return null;
  const key = (s: WrittenSubshell) => `${s.subshell}${s.electrons}`;
  const sorted = (list: WrittenSubshell[]) => list.map(key).sort().join(' ');
  if (sorted(mine) !== sorted(right)) return null;
  const i = mine.findIndex((s, k) => s.subshell !== right[k].subshell);
  return i === -1 ? null : [right[i].subshell, mine[i].subshell];
}

/**
 * How many electrons each orbital of a subshell holds, by Hund's rule: one in
 * every orbital before any pairs. 2p² is `[1, 1, 0]`, never `[2, 0, 0]`; 3d⁶ is
 * `[2, 1, 1, 1, 1]`.
 */
export function hundFilling(electrons: number, orbitals: number): number[] {
  const paired = electrons - orbitals;
  return Array.from({ length: orbitals }, (_, i) => (i < paired ? 2 : i < electrons ? 1 : 0));
}

/**
 * The noun after a number. Icelandic takes the singular after 1 and after any
 * compound ending in one — `tuttugu og ein rafeind` — but not after 11.
 */
export function rafeindir(count: number): 'rafeind' | 'rafeindir' {
  const n = Math.abs(count);
  return n % 10 === 1 && n % 100 !== 11 ? 'rafeind' : 'rafeindir';
}

/**
 * A quantum number as the teaching text writes it: ½ rather than 0.5, a true
 * minus sign, and an explicit + on a positive spin. `+0.5` read as a decimal
 * with a point, which the platform does not print, and matched nothing else on
 * screen.
 */
export function formatQuantum(value: number, { signed = false } = {}): string {
  const magnitude = Math.abs(value);
  const body = magnitude === 0.5 ? '½' : String(magnitude);
  if (value < 0) return `−${body}`;
  if (value > 0 && signed) return `+${body}`;
  return body;
}

/** A subshell in a written configuration: `3d¹⁰` is n = 3, type d, 10 electrons. */
interface Subshell {
  text: string;
  n: number;
  type: string;
}

function subshellsOf(config: string): Subshell[] {
  return config
    .split(/\s+/)
    .filter((part) => /^[1-7][spdf]/.test(part))
    .map((text) => ({ text, n: Number(text[0]), type: text[1] }));
}

/**
 * The valence electrons of a noble-gas shorthand, by the textbook's rule
 * (Efnafræði, kafli 6.4): for a main-group element they are the ones with the
 * highest n — "Alveg fyllt d-svigrúm teljast sem kjarna-, ekki gildisrafeindir"
 * — and for a transition metal the ns and (n − 1)d electrons, which is every
 * subshell written after the core.
 *
 * So bromine, `[Ar] 4s² 3d¹⁰ 4p⁵`, has the seven valence electrons `4s² 4p⁵`,
 * while iron, `[Ar] 4s² 3d⁶`, has `4s² 3d⁶`.
 */
export function valenceOf(shorthand: string): { valence: string; core: string[] } {
  const subshells = subshellsOf(shorthand);
  const mainGroup = subshells.some((s) => s.type === 'p');
  const highest = Math.max(...subshells.map((s) => s.n));
  const isValence = (s: Subshell) => !mainGroup || s.n === highest;
  return {
    valence: subshells
      .filter(isValence)
      .map((s) => s.text)
      .join(' '),
    core: subshells.filter((s) => !isValence(s)).map((s) => s.text),
  };
}
