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

/** Icelandic element roots for building compound names */
export const ELEMENT_ROOTS: Record<string, { root: string; full: string }> = {
  H: { root: 'vetni', full: 'Vetni' },
  C: { root: 'kol', full: 'Kolefni' },
  N: { root: 'nitur', full: 'Köfnunarefni' },
  O: { root: 'oxíð', full: 'Súrefni' },
  F: { root: 'flúoríð', full: 'Flúor' },
  Cl: { root: 'klóríð', full: 'Klór' },
  Br: { root: 'brómíð', full: 'Bróm' },
  I: { root: 'joðíð', full: 'Joð' },
  S: { root: 'brennisteinið', full: 'Brennisteinn' },
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
};
