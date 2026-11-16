/**
 * Flokkun efnahvarfa (classifying reactions), book ch04/m68710 — the module
 * this game is built on. Siggi's Phase 4 ruling (2026-11-15): recognition
 * only, in year 1. No oxidation numbers are worked and no pH is computed; the
 * student says which kind of reaction an equation is, from what can be seen
 * in it. Redox and acid–base in depth stay in years 2 and 3.
 *
 * Terms: `útfellingarhvarf` and `brunaefnahvarf` are `ordabok.md`'s (the book
 * writes `brunahvörf`; the glossary entry is Siggi's 2026-08-27 ruling),
 * `redox-hvarf` is `ordabok.md`'s, and `sýru-basa hvarf` is the book's term,
 * which the glossary does not list.
 */

export type ReactionType = 'utfelling' | 'syrubasa' | 'redox' | 'bruni';

export const TYPE_LABEL: Record<ReactionType, string> = {
  utfelling: 'Útfellingarhvarf',
  syrubasa: 'Sýru-basa hvarf',
  redox: 'Redox-hvarf',
  bruni: 'Brunaefnahvarf',
};

export const TYPE_ORDER: ReactionType[] = ['utfelling', 'syrubasa', 'redox', 'bruni'];

/** What gives each type away, shown with every verdict. */
export const TYPE_SIGN: Record<ReactionType, string> = {
  utfelling: 'Tvær lausnir (aq) mynda fast efni (s), botnfall.',
  syrubasa: 'Sýra gefur H⁺ og basi tekur við því; sýra og basi gefa oft salt og vatn.',
  redox: 'Frumefni breytir um oxunartölu: oftast stendur frumefni eitt og sér öðrum megin.',
  bruni: 'Efni hvarfast við O₂ og gefur hita og loga; kolvetni gefa CO₂ og H₂O.',
};

export interface ReactionItem {
  id: string;
  equation: string;
  context?: string;
  type: ReactionType;
  /** Why this one, where the equation could mislead. */
  note?: string;
}

export const REACTION_ITEMS: ReactionItem[] = [
  {
    id: 'agcl',
    equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)',
    type: 'utfelling',
  },
  {
    id: 'hcl-naoh',
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    type: 'syrubasa',
  },
  {
    id: 'nacl',
    equation: '2 Na(s) + Cl₂(g) → 2 NaCl(s)',
    type: 'redox',
    note: 'Natríum fer úr oxunartölu 0 í +1 og klór úr 0 í −1. Fast efni myndast, en ekki úr tveimur lausnum.',
  },
  {
    id: 'metan',
    equation: 'CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(g)',
    context: 'Jarðgas brennur á gaseldavél.',
    type: 'bruni',
    note: 'Brunaefnahvarf er líka redox-hvarf: kolefnið oxast og súrefnið afoxast.',
  },
  {
    id: 'mgoh2',
    equation: 'Mg(OH)₂(s) + 2 HCl(aq) → MgCl₂(aq) + 2 H₂O(l)',
    context: 'Magnesíummjólk hlutleysir magasýru.',
    type: 'syrubasa',
    note: 'Hér hverfur fast efni í stað þess að myndast: hýdroxíðið er basi sem tekur við H⁺ úr sýrunni.',
  },
  {
    id: 'zn-hcl',
    equation: 'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)',
    type: 'redox',
    note: 'Sýra kemur við sögu, en sinkið fer úr 0 í +2 og vetnið úr +1 í 0: málmur leysist upp í sýru í einföldu útskiptahvarfi.',
  },
  {
    id: 'pbi2',
    equation: 'Pb(NO₃)₂(aq) + 2 KI(aq) → PbI₂(s) + 2 KNO₃(aq)',
    type: 'utfelling',
  },
  {
    id: 'cu-ag',
    equation: 'Cu(s) + 2 AgNO₃(aq) → Cu(NO₃)₂(aq) + 2 Ag(s)',
    type: 'redox',
    note: 'Fast efni myndast, en úr málmi og lausn: koparinn fer úr 0 í +2 og silfrið úr +1 í 0.',
  },
  {
    id: 'propan',
    equation: 'C₃H₈(g) + 5 O₂(g) → 3 CO₂(g) + 4 H₂O(g)',
    context: 'Própan brennur á gasgrilli.',
    type: 'bruni',
  },
];
