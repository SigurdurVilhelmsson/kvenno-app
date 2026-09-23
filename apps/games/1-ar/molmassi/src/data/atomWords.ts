/**
 * The stem an element takes when it compounds with `atóm`: `súrefnisatóm`,
 * `klóratóm`, `natríumatóm`.
 *
 * Two templates built the word from the element's name instead, and a name is
 * not a stem: Stig 2 asked `Hversu mörg Súrefni-atóm (O)`, capitalised
 * mid-sentence, and Stig 1's diagnosis said `einu súrefni-atómi`. The `-efni`
 * names and `brennisteinn` link with a genitive `-s`, the metals and `klór` do
 * not, and nothing in the name says which — so it is written down here.
 *
 * Every form but two is the textbook's own (`vetnisatóm` 419 times,
 * `kolefnisatóm` 538, `klóratóm` 79, `natríumatóm` 9, `koparatóm` 14,
 * `álatóm` 2 …). `kalíumatóm` and `járnatóm` do not occur in it and follow the
 * pattern of `natríumatóm` and `koparatóm`.
 */
export const ATOM_STEM: Record<string, string> = {
  H: 'vetnis',
  C: 'kolefnis',
  N: 'köfnunarefnis',
  O: 'súrefnis',
  Na: 'natríum',
  Mg: 'magnesíum',
  Al: 'ál',
  P: 'fosfór',
  S: 'brennisteins',
  Cl: 'klór',
  K: 'kalíum',
  Ca: 'kalsíum',
  Fe: 'járn',
  Cu: 'kopar',
};

/** `súrefnisatóm` for `O`; throws on an element with no stem written down. */
export function atomWord(symbol: string): string {
  const stem = ATOM_STEM[symbol];
  if (stem === undefined) {
    throw new Error(`Enginn stofn skráður fyrir ${symbol}-atóm í atomWords.ts`);
  }
  return `${stem}atóm`;
}
