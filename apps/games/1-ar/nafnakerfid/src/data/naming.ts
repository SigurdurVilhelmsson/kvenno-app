/**
 * The naming morphemes this game teaches, and a decomposer that splits a
 * compound name back into them.
 *
 * Level 3 asks a student to build a name by clicking parts. Those parts used to
 * be improvised from the compound's element symbols, which meant the level could
 * only pose a question when the name happened to be `prefix + elementRoot`.
 * Measured against the real pool, **33 of 51 compounds could not be assembled at
 * all** and so could never be marked correct: there was no token for a Roman
 * numeral, none for a polyatomic ion (`súlfat` and `nítrat` existed only as
 * _distractors_), no root for Mn, Cr, Pb, Hg, Sn or Co, and no form for the
 * elided prefixes — `dekoxíð` cannot be reached from `deka` + `oxíð`, which
 * concatenate to `dekaoxíð`.
 *
 * The inventory below is the fix. It is the naming vocabulary itself, declared
 * once, and `segmentName` recovers the parts of any name built from it.
 * `__tests__/name-builder.test.ts` requires every compound in the pool to
 * segment, so a compound whose name needs a morpheme that is missing fails
 * loudly at build time instead of silently becoming an ungradeable question.
 */

/** Greek prefixes for molecular compounds */
export const PREFIXES: Record<number, string> = {
  1: 'mónó',
  2: 'dí',
  3: 'trí',
  4: 'tetra',
  5: 'penta',
  6: 'hexa',
  7: 'hepta',
  8: 'okta',
  9: 'nóna',
  10: 'deka',
};

/**
 * Icelandic element forms used in compound names.
 *
 * `root` is the form the element takes as the second half of a binary name —
 * for the non-metals that is the -íð anion (`oxíð`, `klóríð`), for the metals it
 * is just the element (`natríum`, `járn`). `stem` is the separate form some
 * non-metals take when they come *first*: sulfur is `súlfíð` as an anion but
 * `brennisteins-` in Brennisteinsdíoxíð.
 */
export const ELEMENT_ROOTS: Record<string, { root: string; full: string; stem?: string }> = {
  H: { root: 'vetni', full: 'Vetni' },
  C: { root: 'kol', full: 'Kolefni' },
  N: { root: 'nitur', full: 'Köfnunarefni' },
  O: { root: 'oxíð', full: 'Súrefni' },
  F: { root: 'flúoríð', full: 'Flúor' },
  Cl: { root: 'klóríð', full: 'Klór', stem: 'klór' },
  Br: { root: 'brómíð', full: 'Bróm' },
  I: { root: 'joðíð', full: 'Joð', stem: 'joð' },
  S: { root: 'súlfíð', full: 'Brennisteinn', stem: 'brennisteins' },
  P: { root: 'fosfór', full: 'Fosfór' },
  Na: { root: 'natríum', full: 'Natríum' },
  K: { root: 'kalíum', full: 'Kalíum' },
  Ca: { root: 'kalsíum', full: 'Kalsíum' },
  Mg: { root: 'magnesíum', full: 'Magnesíum' },
  Al: { root: 'ál', full: 'Ál' },
  Fe: { root: 'járn', full: 'Járn' },
  Cu: { root: 'kopar', full: 'Kopar' },
  Zn: { root: 'sink', full: 'Sink' },
  Ag: { root: 'silfur', full: 'Silfur' },
  Li: { root: 'litíum', full: 'Litíum' },
  Ba: { root: 'baríum', full: 'Baríum' },
  Xe: { root: 'xenon', full: 'Xenon' },
  Mn: { root: 'mangan', full: 'Mangan' },
  Cr: { root: 'króm', full: 'Króm' },
  Pb: { root: 'blý', full: 'Blý' },
  Hg: { root: 'kvikasilfur', full: 'Kvikasilfur' },
  Sn: { root: 'tin', full: 'Tin' },
  Co: { root: 'kóbalt', full: 'Kóbalt' },
};

/**
 * Prefix + oxíð where Icelandic drops the prefix's final -a before the vowel.
 *
 * These are single morphemes rather than two, because that is how they are
 * written and what a student has to recognise: the choice is `tetroxíð` over
 * `tetraoxíð`, not a rule applied after the fact.
 */
export const ELIDED_OXIDES: Record<number, string> = {
  4: 'tetroxíð',
  5: 'pentoxíð',
  7: 'heptoxíð',
  10: 'dekoxíð',
};

/** Polyatomic ions that keep a fixed name whatever they are bonded to. */
export const POLYATOMIC_IONS = [
  'ammóníum',
  'súlfat',
  'nítrat',
  'karbónat',
  'vetniskarbónat',
  'fosfat',
  'hýdroxíð',
  'díkrómat',
] as const;

/** Oxidation states written as Roman numerals, for metals with a variable charge. */
export const ROMAN_NUMERALS = ['(I)', '(II)', '(III)', '(IV)', '(VII)', '(II,III)'] as const;

export type MorphemeKind = 'prefix' | 'root' | 'ion' | 'charge';

export interface Morpheme {
  /** The text exactly as it is written inside a name. */
  text: string;
  kind: MorphemeKind;
}

function buildInventory(): Morpheme[] {
  const seen = new Set<string>();
  const out: Morpheme[] = [];
  const add = (text: string, kind: MorphemeKind) => {
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ text, kind });
  };

  Object.values(PREFIXES).forEach((p) => add(p, 'prefix'));
  Object.values(ELIDED_OXIDES).forEach((o) => add(o, 'root'));
  Object.values(ELEMENT_ROOTS).forEach(({ root, stem }) => {
    add(root, 'root');
    if (stem) add(stem, 'root');
  });
  POLYATOMIC_IONS.forEach((i) => add(i, 'ion'));
  ROMAN_NUMERALS.forEach((r) => add(r, 'charge'));

  return out;
}

/** Every morpheme a name in this game may be built from. */
export const MORPHEMES: Morpheme[] = buildInventory();

/**
 * Split a compound name into the morphemes it is written from.
 *
 * Returns `null` when the name cannot be built from the inventory at all —
 * a trivial name like Vatn, or a name needing a morpheme nobody has declared.
 * That null is what the test turns into a named failure.
 *
 * Longest match first, with backtracking. The strings are a dozen characters
 * long, so the search is free, and backtracking removes a whole class of
 * near-miss bug: greedy alone would commit to `dí` inside a name that in fact
 * begins with a longer morpheme and then fail on the remainder.
 */
export function segmentName(name: string): Morpheme[] | null {
  const target = name.toLowerCase();
  const candidates = [...MORPHEMES].sort((a, b) => b.text.length - a.text.length);

  const walk = (at: number): Morpheme[] | null => {
    if (at === target.length) return [];
    for (const morpheme of candidates) {
      const text = morpheme.text.toLowerCase();
      if (!target.startsWith(text, at)) continue;
      const rest = walk(at + text.length);
      if (rest) return [morpheme, ...rest];
    }
    return null;
  };

  return walk(0);
}
