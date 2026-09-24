/**
 * The salts Leysnijafnvægi works with.
 *
 * **Each one carries a formula and a name, and nothing else.** The Ksp comes
 * from `@shared/data/appendix-d`, and the molar solubility, the Ksp expression
 * and every answer are computed from it. Nothing here can drift from the book,
 * because nothing here restates the book.
 *
 * **Two filters decide the pool, and both are enforced by tests.**
 *
 * 1. **No hydrolytic sulfide.** Table D.3's own footnote says the starred
 *    entries are for `MS(s) + H₂O(l) ⇌ M²⁺(aq) + HS⁻(aq) + OH⁻(aq)`, so their
 *    constant is a three-species product `[M²⁺][HS⁻][OH⁻]` and **not**
 *    `[M²⁺][S²⁻]`. Feeding CuS to `molarSolubility` would return √(6 × 10⁻³⁷),
 *    a number with no physical meaning, and it would look perfectly reasonable
 *    on screen. This is the single easiest way to ship a wrong answer in this
 *    topic, so the pool excludes them outright.
 * 2. **Prefer compounds the two books agree on.** Brown D.3 is authoritative
 *    (Siggi's ruling, 2026-09-19) and is what the engine computes with. But the
 *    Icelandic textbook's own `Leysnimargfeldi` appendix disagrees by 3× or
 *    more on 13 of the 33 compounds they share, so a student checking the book
 *    they can actually read would find the game contradicting it. Every salt
 *    below is on `AGREES_WITH_ICELANDIC_APPENDIX` except where the note says
 *    otherwise and says why.
 */

import { AGREES_WITH_ICELANDIC_APPENDIX, APPENDIX_D3_KSP } from '@shared/data/appendix-d';

import type { CompoundFormula, Salt } from '../engine/ksp';

interface SaltSource {
  formula: CompoundFormula;
  name: string;
  cation: string;
  anion: string;
  colour?: string;
  /** Where a student meets it. */
  context: string;
  /** Set only where the compound is NOT in the agreeing set, with the reason. */
  divergenceNote?: string;
}

const SOURCES: SaltSource[] = [
  {
    formula: 'AgCl',
    name: 'Silfurklóríð',
    cation: 'Ag⁺',
    anion: 'Cl⁻',
    colour: 'hvítt',
    context:
      'Sama efnið og fellur út í klóríðprófinu í Útfellingarhvörfum. Þar var svarið „óleysanlegt“; hér færðu töluna á bak við það orð.',
  },
  {
    formula: 'AgBr',
    name: 'Silfurbrómíð',
    cation: 'Ag⁺',
    anion: 'Br⁻',
    colour: 'fölgult',
    context:
      'Ljósnæma efnið í gamaldags ljósmyndafilmum. Torleystara en silfurklóríð — og það sést á Ksp.',
  },
  {
    formula: 'AgI',
    name: 'Silfurjoðíð',
    cation: 'Ag⁺',
    anion: 'I⁻',
    colour: 'gult',
    context: 'Notað til að sá í ský til að framkalla úrkomu. Torleystast silfurhalíðanna þriggja.',
    divergenceNote:
      'Íslenska kennslubókin segir 1,5 × 10⁻¹⁶ þar sem Brown segir 8,3 × 10⁻¹⁷ — tæplega tvöfaldur munur. Haldið hér vegna þess að silfurhalíðin þrjú saman sýna leysniröðina, og munurinn er minni en stærðarþrep.',
  },
  {
    formula: 'CaF₂',
    name: 'Kalsíumflúoríð',
    cation: 'Ca²⁺',
    anion: 'F⁻',
    colour: 'hvítt',
    context:
      'Steintegundin flúorít, og ástæðan fyrir því að flúor sest í glerung tanna. Hlutfallið 1:2 er það sem brýtur √Ksp-regluna.',
  },
  {
    formula: 'PbCl₂',
    name: 'Blýklóríð',
    cation: 'Pb²⁺',
    anion: 'Cl⁻',
    colour: 'hvítt',
    context: 'Eitt af fáum blýsöltum sem leysist merkjanlega — og það sést á því hve Ksp er stórt.',
  },
  {
    formula: 'PbF₂',
    name: 'Blýflúoríð',
    cation: 'Pb²⁺',
    anion: 'F⁻',
    colour: 'hvítt',
    context: 'Annað 1:2 salt, svo hægt er að bera það beint saman við kalsíumflúoríð.',
  },
  {
    formula: 'Ag₂CrO₄',
    name: 'Silfurkrómat',
    cation: 'Ag⁺',
    anion: 'CrO₄²⁻',
    colour: 'múrsteinsrautt',
    context:
      'Hlutfallið er 2:1, svo Ksp = [Ag⁺]²[CrO₄²⁻] og mólarleysnin er ekki kvaðratrótin. Þetta er efnið sem afhjúpar hvort þú kannt almenna formúluna.',
    divergenceNote:
      'Bækurnar tvær eru 7,5-falt á milli hér (Brown 1,2 × 10⁻¹², íslenska bókin 9,0 × 10⁻¹²). Haldið vegna þess að 2:1 hlutfall er nauðsynlegt til kennslu og ekkert samþykkt efni hefur það.',
  },
  {
    formula: 'Ag₂CO₃',
    name: 'Silfurkarbónat',
    cation: 'Ag⁺',
    anion: 'CO₃²⁻',
    colour: 'fölgult',
    context: 'Annað 2:1 salt, og bækurnar tvær eru sammála um það upp á tölustaf.',
  },
  {
    formula: 'Ag₂SO₄',
    name: 'Silfursúlfat',
    cation: 'Ag⁺',
    anion: 'SO₄²⁻',
    colour: 'hvítt',
    context:
      'Langleysanlegasta silfursaltið hér — Ksp er 10⁻⁵, ekki 10⁻¹⁰. „Silfursölt eru óleysanleg“ er regla með undantekningum.',
  },
  {
    formula: 'CaCO₃',
    name: 'Kalsíumkarbónat',
    cation: 'Ca²⁺',
    anion: 'CO₃²⁻',
    colour: 'hvítt',
    // The Icelandic word for seashells is deliberately not used here, and
    // deliberately not written in this comment either: the hvolf ruling bans
    // that word and all its inflections, and governed-terms.test.ts scans
    // comments too. Naming it to explain why it is avoided is exactly how
    // this comment failed the test the first time — the second time today,
    // after the same thing happened in lausnir's electrolyte data.
    context: 'Kalkið í katlinum, kalksteinn, marmari og dropasteinar.',
    divergenceNote:
      'Íslenska bókin segir 8,7 × 10⁻⁹ gegn 4,5 × 10⁻⁹ hjá Brown — innan við tvöfaldur munur. Haldið því þetta er efnið sem nemandinn þekkir best úr daglegu lífi.',
  },
  {
    formula: 'SrCO₃',
    name: 'Strontíumkarbónat',
    cation: 'Sr²⁺',
    anion: 'CO₃²⁻',
    colour: 'hvítt',
    context: 'Notað í flugelda til að gefa rauðan lit.',
  },
  {
    formula: 'FeCO₃',
    name: 'Járn(II)karbónat',
    cation: 'Fe²⁺',
    anion: 'CO₃²⁻',
    colour: 'hvítt',
    context: 'Steintegundin síderít, ein helsta járngrýtistegundin.',
  },
  {
    formula: 'BaSO₄',
    name: 'Baríumsúlfat',
    cation: 'Ba²⁺',
    anion: 'SO₄²⁻',
    colour: 'hvítt',
    context:
      'Sjúklingur drekkur það fyrir röntgenmyndatöku þótt baríumjónir séu eitraðar — og Ksp er nákvæmlega ástæðan fyrir því að það er óhætt.',
    divergenceNote:
      '**Stærsta ósamræmið í safninu: 209-faldur munur.** Brown segir 1,1 × 10⁻¹⁰, íslenska bókin 2,3 × 10⁻⁸, sem munar 14-földu í mólarleysni. Haldið vegna þess að röntgendæmið er það sannfærandasta sem til er um hvað Ksp þýðir í raun — en ef nemandi flettir því upp í íslensku bókinni fær hann annað svar, og það er þess virði að segja honum það.',
  },
  {
    formula: 'Mn(OH)₂',
    name: 'Mangan(II)hýdroxíð',
    cation: 'Mn²⁺',
    anion: 'OH⁻',
    colour: 'fölbleikt',
    context: 'Hýdroxíð með 1:2 hlutfalli, og bækurnar eru sammála um það.',
  },
];

/** The shipped pool, with every constant read from Appendix D.3 at module load. */
export const SALTS: Salt[] = SOURCES.map((s) => {
  const row = APPENDIX_D3_KSP[s.formula];
  if ('hydrolytic' in row && row.hydrolytic) {
    throw new RangeError(
      `${s.formula} is one of Table D.3's starred sulfides. Its constant is ` +
        `[M²⁺][HS⁻][OH⁻], not [M²⁺][S²⁻], so every molar solubility computed from ` +
        `it would be meaningless. Remove it from the pool.`
    );
  }
  return {
    formula: s.formula,
    name: s.name,
    ksp: row.ksp,
    x: row.cation,
    y: row.anion,
    cation: s.cation,
    anion: s.anion,
    colour: s.colour,
  };
});

/** The prose that goes with each salt, kept beside the pool but out of the maths. */
export const SALT_NOTES = new Map(
  SOURCES.map((s) => [s.formula, { context: s.context, divergenceNote: s.divergenceNote }])
);

export const AGREEING = new Set<string>(AGREES_WITH_ICELANDIC_APPENDIX);

/** Salts whose two books disagree — each one carries a written reason. */
export const DIVERGENT = SALTS.filter((s) => !AGREEING.has(s.formula));

export function saltBy(formula: string): Salt {
  const found = SALTS.find((s) => s.formula === formula);
  if (!found) throw new RangeError(`No salt ${formula} in the pool`);
  return found;
}
