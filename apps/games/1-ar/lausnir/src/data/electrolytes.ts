/**
 * Stig 0 — Rafkleyfi. What a solute turns into when it dissolves.
 *
 * Brown ch. 11 in the school's own textbook, which is why this lives in Lausnir
 * and not in `1-ar/utfellingarhvorf`: the book puts precipitation in ch. 4 and
 * electrolytes in ch. 11, so the two halves of February's "both" answer land on
 * either side of the Y1 chain.
 *
 * **Nothing declares its own answer.** Each substance declares what *kind* of
 * thing it is — a soluble ionic compound, a strong or weak acid or base, or a
 * molecular compound — and `classify()` derives the electrolyte class from that.
 * A substance therefore cannot be labelled a strong electrolyte while its
 * explanation says it is a weak acid, which is the shape of defect the old
 * `jonir-i-lausn` carried by storing `type`, `description` and `hint` as three
 * independent strings.
 *
 * **The answer leak is the other thing fixed here, and it was total.**
 * `ORPHANED_GAMES_ASSESSMENT.md:320` measured it: all fifteen of the old game's
 * descriptions named the classifying property, eight by literal stem-match
 * ("Sterk sýra sem leysist algjörlega"), and they rendered *above* the answer
 * buttons. The assessment's prescribed fix was to split the field, and that is
 * what `observable` and `why` are: something a student could actually see or
 * already know before answering, and the reason afterwards.
 *
 * **Terminology.** `rafkleyfi` is masculine — the school's textbook says
 * `sterkur rafkleyfi` and `sterkir rafkleyfar`. The old game put a neuter
 * adjective on it, on every answer button. Non-electrolyte is not a noun at all
 * but an adjective plus one: `órafkleyft efni`, which is what `ordabok.md:389`
 * carries and what the textbook uses; the old file coined a noun instead.
 * Three other names in the old file were wrong and are corrected here: HF is
 * `flússýra` and not the accentless flúor- spelling (Siggi's ruling,
 * 2026-09-19), HNO₂ is `saltpéturssýrlingur` and not the -sýrulingur form, and
 * `basi` is masculine, so it takes `sterkur`/`veikur` rather than the feminine
 * adjectives the old data used.
 *
 * The banned forms are deliberately **not spelled out** above.
 * `governed-terms.test.ts` scans this directory, so naming them here would fail
 * the very test that bans them — which is how this comment was first written.
 */

/** What the substance *is*, from which its electrolyte class follows. */
export type SoluteKind =
  'jonaefni' | 'sterk-syra' | 'sterkur-basi' | 'veik-syra' | 'veikur-basi' | 'sameindaefni';

export type ElectrolyteClass = 'sterkur' | 'veikur' | 'orafkleyft';

export interface Solute {
  id: string;
  name: string;
  formula: string;
  kind: SoluteKind;
  /**
   * Something true that a student can see or already knows, which does **not**
   * name the class. This is what renders before they answer.
   */
  observable: string;
  /** The reason, shown only afterwards. */
  why: string;
  /**
   * How it comes apart in water. A full arrow means complete, a double arrow
   * means an equilibrium — so this is itself an answer and is never shown
   * before the student commits.
   */
  dissociation?: string;
}

/**
 * The rule, in one place.
 *
 * Soluble ionic compounds and strong acids and bases come apart completely, so
 * the solution is full of ions and conducts well. Weak acids and bases come
 * apart only partly. A molecular compound that is neither dissolves without
 * making ions at all — which is the case students find hardest, because
 * dissolving and ionising feel like the same event and are not.
 */
export function classify(kind: SoluteKind): ElectrolyteClass {
  switch (kind) {
    case 'jonaefni':
    case 'sterk-syra':
    case 'sterkur-basi':
      return 'sterkur';
    case 'veik-syra':
    case 'veikur-basi':
      return 'veikur';
    case 'sameindaefni':
      return 'orafkleyft';
  }
}

export const CLASSES: Record<
  ElectrolyteClass,
  { name: string; short: string; bulb: 'bright' | 'dim' | 'off'; description: string }
> = {
  sterkur: {
    name: 'Sterkur rafkleyfi',
    short: 'Sterkur',
    bulb: 'bright',
    description: 'Klofnar algjörlega í jónir í vatni. Lausnin leiðir rafstraum vel.',
  },
  veikur: {
    name: 'Veikur rafkleyfi',
    short: 'Veikur',
    bulb: 'dim',
    description: 'Klofnar aðeins að hluta. Fáar jónir, og lausnin leiðir illa.',
  },
  orafkleyft: {
    name: 'Órafkleyft efni',
    short: 'Órafkleyft',
    bulb: 'off',
    description: 'Leysist upp en myndar engar jónir. Lausnin leiðir ekki rafstraum.',
  },
};

export const KIND_NAMES: Record<SoluteKind, string> = {
  jonaefni: 'Leysanlegt jónaefni',
  'sterk-syra': 'Sterk sýra',
  'sterkur-basi': 'Sterkur basi',
  'veik-syra': 'Veik sýra',
  'veikur-basi': 'Veikur basi',
  sameindaefni: 'Sameindaefni',
};

export const SOLUTES: Solute[] = [
  {
    id: 'nacl',
    name: 'Natríumklóríð',
    formula: 'NaCl',
    kind: 'jonaefni',
    observable: 'Borðsalt. Hvítir kristallar sem hverfa fljótt í vatni.',
    why: 'Jónaefni er þegar byggt úr jónum — vatnið dregur þær bara í sundur. Öll leysanleg jónaefni eru sterkir rafkleyfar.',
    dissociation: 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)',
  },
  {
    id: 'hcl',
    name: 'Saltsýra',
    formula: 'HCl',
    kind: 'sterk-syra',
    // `Saltsýra` names HCl(aq), the solution, which is exactly what this level
    // is about — so it is right here even though CLAUDE.md flags the same name
    // as an open question in `1-ar/molmassi`, where it labels a molar mass.
    observable: 'Sýran í magasafa. Tær vökvi með stingandi lykt.',
    why: 'Sterk sýra gefur frá sér allar H⁺ jónirnar sínar. Ekkert HCl verður eftir heilt í lausninni.',
    dissociation: 'HCl(aq) → H⁺(aq) + Cl⁻(aq)',
  },
  {
    id: 'naoh',
    name: 'Natríumhýdroxíð',
    formula: 'NaOH',
    kind: 'sterkur-basi',
    observable: 'Vítissódi, í stífluhreinsi. Hvítar kúlur sem hitna þegar þær leysast.',
    why: 'Sterkur basi klofnar algjörlega og gefur OH⁻ jónir út í lausnina.',
    dissociation: 'NaOH(s) → Na⁺(aq) + OH⁻(aq)',
  },
  {
    id: 'kno3',
    name: 'Kalíumnítrat',
    formula: 'KNO₃',
    kind: 'jonaefni',
    observable: 'Saltpétur, notaður í áburð.',
    why: 'Kalíumsölt eru alltaf leysanleg, og leysanlegt jónaefni klofnar algjörlega.',
    dissociation: 'KNO₃(s) → K⁺(aq) + NO₃⁻(aq)',
  },
  {
    id: 'h2so4',
    name: 'Brennisteinssýra',
    formula: 'H₂SO₄',
    kind: 'sterk-syra',
    observable: 'Sýran í bílarafgeymum. Þykk og olíukennd.',
    why: 'Sterk sýra. Fyrsta róteindin fer af algjörlega, og lausnin er full af jónum.',
    dissociation: 'H₂SO₄(aq) → 2H⁺(aq) + SO₄²⁻(aq)',
  },
  {
    id: 'ch3cooh',
    name: 'Ediksýra',
    formula: 'CH₃COOH',
    kind: 'veik-syra',
    observable: 'Edik er um 5 % ediksýra í vatni.',
    why: 'Veik sýra. Aðeins um ein sameind af hverjum hundrað gefur frá sér róteind — hinar eru heilar. Jafnvægið liggur til vinstri.',
    dissociation: 'CH₃COOH(aq) ⇌ CH₃COO⁻(aq) + H⁺(aq)',
  },
  {
    id: 'hf',
    name: 'Flússýra',
    formula: 'HF',
    kind: 'veik-syra',
    observable: 'Notuð til að æta gler. Hættulegasta sýran í þessum lista.',
    why: 'Hættuleg er ekki það sama og sterk. HF er veik sýra — tengið milli vetnis og flúors er of sterkt til að slitna alveg.',
    dissociation: 'HF(aq) ⇌ H⁺(aq) + F⁻(aq)',
  },
  {
    id: 'nh3',
    name: 'Ammóníak',
    formula: 'NH₃',
    kind: 'veikur-basi',
    observable: 'Lyktin af sumum hreinsiefnum.',
    why: 'Veikur basi. Tekur við róteind frá vatni, en aðeins lítill hluti sameindanna gerir það hverju sinni.',
    dissociation: 'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
  },
  {
    id: 'h2co3',
    name: 'Kolsýra',
    formula: 'H₂CO₃',
    kind: 'veik-syra',
    observable: 'Myndast þegar koldíoxíð leysist í vatni — freyðingin í gosi.',
    why: 'Veik sýra, og meira að segja óstöðug: mest af henni fer aftur út sem koldíoxíð.',
    dissociation: 'H₂CO₃(aq) ⇌ H⁺(aq) + HCO₃⁻(aq)',
  },
  {
    id: 'hno2',
    name: 'Saltpéturssýrlingur',
    formula: 'HNO₂',
    kind: 'veik-syra',
    observable: 'Nítrítsölt af henni eru notuð til að verja unnar kjötvörur.',
    why: 'Veik sýra — og ekki sama efni og saltpéturssýra, HNO₃, sem er sterk. Eitt súrefnisatóm skilur á milli.',
    dissociation: 'HNO₂(aq) ⇌ H⁺(aq) + NO₂⁻(aq)',
  },
  {
    id: 'c6h12o6',
    name: 'Glúkósi',
    formula: 'C₆H₁₂O₆',
    kind: 'sameindaefni',
    observable: 'Þrúgusykur. Leysist mjög vel í vatni.',
    why: 'Leysist vel og myndar samt engar jónir. Sameindirnar dreifast heilar um vatnið — að leysast upp og að jónast er ekki sami hluturinn.',
  },
  {
    id: 'c2h5oh',
    name: 'Etanól',
    formula: 'C₂H₅OH',
    kind: 'sameindaefni',
    observable: 'Áfengi. Blandast vatni í hvaða hlutfalli sem er.',
    why: 'OH í formúlunni gerir etanól ekki að basa. Það gefur ekki frá sér OH⁻ og myndar engar jónir.',
  },
  {
    id: 'ch3oh',
    name: 'Metanól',
    formula: 'CH₃OH',
    kind: 'sameindaefni',
    observable: 'Tréspíri, notaður sem frostlögur og eldsneyti.',
    why: 'Sameindaefni eins og etanól — leysist, en klofnar ekki.',
  },
  {
    id: 'c12h22o11',
    name: 'Súkrósi',
    formula: 'C₁₂H₂₂O₁₁',
    kind: 'sameindaefni',
    observable: 'Venjulegur strásykur.',
    why: 'Sykur leysist í vatni en myndar engar jónir. Sykurvatn leiðir ekki rafstraum.',
  },
  {
    id: 'urea',
    name: 'Þvagefni',
    formula: 'CO(NH₂)₂',
    kind: 'sameindaefni',
    observable: 'Algengasti köfnunarefnisáburður í heimi.',
    why: 'Sameindaefni þrátt fyrir köfnunarefnið. Leysist auðveldlega og jónast ekki.',
  },
];

/** The class every substance falls into, derived rather than declared. */
export function classOf(solute: Solute): ElectrolyteClass {
  return classify(solute.kind);
}
