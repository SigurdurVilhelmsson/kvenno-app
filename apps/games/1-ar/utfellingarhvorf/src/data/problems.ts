/**
 * The scenarios Útfellingarhvörf teaches with.
 *
 * **A scenario is two soluble salts and a sentence of context. Nothing else.**
 * No equation, no product, no verdict, no spectator list is written down here —
 * `react()` derives all of it at module load. That is the same cure
 * `1-ar/reynsluformulur` got, and it is aimed at a defect this game's ancestor
 * actually shipped: `jonir-i-lausn` stored a molecular equation, a net ionic
 * equation and an explanation as three independent strings, and tested a
 * chromate precipitate against a rule table with no chromate row
 * (`ORPHANED_GAMES_ASSESSMENT.md:326`). Here that cannot be written: `react()`
 * throws if no rule covers an ion, and the equations are one computation, so
 * they cannot disagree with each other or with the verdict.
 *
 * The `react()` call also refuses a scenario whose reactants are not both
 * soluble, so "pour the AgCl solution" is not expressible.
 */

import { makeSalt, react, type Reaction, type Salt } from '../engine/precipitation';
import { solubility, type Verdict } from '../engine/precipitation';

export interface Scenario {
  id: string;
  /** Where a student meets this, in one sentence. */
  context: string;
  difficulty: 'ledd' | 'mid' | 'thung';
  reaction: Reaction;
}

/** A scenario is written as the two bottles you pour, and nothing more. */
const SOURCES: {
  id: string;
  a: [string, string];
  b: [string, string];
  difficulty: Scenario['difficulty'];
  context: string;
}[] = [
  {
    id: 'agno3-nacl',
    a: ['Ag⁺', 'NO₃⁻'],
    b: ['Na⁺', 'Cl⁻'],
    difficulty: 'ledd',
    context:
      'Klassíska prófið á klóríð: dropi af silfurnítrati í saltvatn gefur hvítt botnfall samstundis. Svona er klóríð mælt í drykkjarvatni.',
  },
  {
    id: 'pbno3-ki',
    a: ['Pb²⁺', 'NO₃⁻'],
    b: ['K⁺', 'I⁻'],
    difficulty: 'ledd',
    context:
      'Blýjoðíð er skærgult og fellur út í gylltum flögum — kennslubókin kallar það joðgult og það var einu sinni notað sem litarefni listamanna.',
  },
  {
    id: 'bacl2-na2so4',
    a: ['Ba²⁺', 'Cl⁻'],
    b: ['Na⁺', 'SO₄²⁻'],
    difficulty: 'ledd',
    context:
      'Baríumsúlfat er svo torleyst að sjúklingur má drekka það fyrir röntgenmyndatöku, þótt baríumjónir séu eitraðar.',
  },
  {
    id: 'cacl2-na2co3',
    a: ['Ca²⁺', 'Cl⁻'],
    b: ['Na⁺', 'CO₃²⁻'],
    difficulty: 'ledd',
    context:
      'Þetta er kalkið í hraðsuðukatlinum: kalsíumjónir úr hörðu vatni mæta karbónati og setjast sem kalsíumkarbónat.',
  },
  {
    id: 'fecl3-naoh',
    a: ['Fe³⁺', 'Cl⁻'],
    b: ['Na⁺', 'OH⁻'],
    difficulty: 'mid',
    context:
      'Rauðbrúnt járn(III)hýdroxíð fellur út sem hlaup. Þannig eru járnjónir felldar úr skólpi í hreinsistöðvum.',
  },
  {
    id: 'cuso4-na2s',
    a: ['Cu²⁺', 'SO₄²⁻'],
    b: ['Na⁺', 'S²⁻'],
    difficulty: 'mid',
    context:
      'Koparsúlfíð er nær svart. Þungmálmar eru oft felldir út sem súlfíð því súlfíðin eru með þeim torleystustu sem til eru.',
  },
  {
    id: 'nicl2-naoh',
    a: ['Ni²⁺', 'Cl⁻'],
    b: ['Na⁺', 'OH⁻'],
    difficulty: 'mid',
    context: 'Nikkel(II)hýdroxíð er ljósgrænt og er notað í rafskaut endurhlaðanlegra rafhlaðna.',
  },
  {
    id: 'agno3-k2cro4',
    a: ['Ag⁺', 'NO₃⁻'],
    b: ['K⁺', 'CrO₄²⁻'],
    difficulty: 'thung',
    context:
      'Silfurkrómat er múrsteinsrautt. Hlutfallið er ekki 1:1 — það þarf tvær silfurjónir á hverja krómatjón, og stuðlarnir í nettójónajöfnunni sýna það.',
  },
  {
    id: 'cacl2-na3po4',
    a: ['Ca²⁺', 'Cl⁻'],
    b: ['Na⁺', 'PO₄³⁻'],
    difficulty: 'thung',
    context:
      'Kalsíumfosfat er meginuppistaðan í beinum og tönnum. Þyngsta stillingin í leiknum: 3 á móti 2.',
  },
  {
    id: 'nacl-kno3',
    a: ['Na⁺', 'Cl⁻'],
    b: ['K⁺', 'NO₃⁻'],
    difficulty: 'ledd',
    context:
      'Ekkert gerist. Allar fjórar jónirnar verða áfram í lausn — og þá er engin nettójónajafna til, því allar jónirnar eru áhorfendajónir.',
  },
  {
    id: 'mgno3-nacl',
    a: ['Mg²⁺', 'NO₃⁻'],
    b: ['Na⁺', 'Cl⁻'],
    difficulty: 'mid',
    context: 'Aftur ekkert botnfall: bæði MgCl₂ og NaNO₃ eru leysanleg.',
  },
  {
    id: 'bacl2-naoh',
    a: ['Ba²⁺', 'Cl⁻'],
    b: ['Na⁺', 'OH⁻'],
    difficulty: 'thung',
    context:
      'Gildran: hýdroxíð eru óleysanleg — nema með flokki 1 og Ba²⁺. Ba(OH)₂ er einmitt undantekningin, svo ekkert fellur út.',
  },
  {
    id: 'mgcl2-na2so4',
    a: ['Mg²⁺', 'Cl⁻'],
    b: ['Na⁺', 'SO₄²⁻'],
    difficulty: 'thung',
    context:
      'Berðu þetta saman við baríumklóríð og natríumsúlfat hér að ofan: sama anjónin, sama súlfatreglan, en ekkert botnfall. Magnesíum er ekki á undantekningalistanum og það er allur munurinn.',
  },
  {
    id: 'nh4cl-nano3',
    a: ['NH₄⁺', 'Cl⁻'],
    b: ['Na⁺', 'NO₃⁻'],
    difficulty: 'ledd',
    context:
      'Ammóníum, natríum, nítrat og klóríð — fjórar jónir sem allar eru á leysanlegu hliðinni. Ekkert getur fallið út.',
  },
  {
    id: 'cano3-naf',
    a: ['Ca²⁺', 'NO₃⁻'],
    b: ['Na⁺', 'F⁻'],
    difficulty: 'thung',
    context:
      'Kalsíumflúoríð er steintegundin flúorít, og hún er líka ástæðan fyrir því að flúor sest í glerung tanna. Flúoríð eru leysanleg — nema með jarðalkalímálmum.',
  },
  {
    id: 'znso4-na2co3',
    a: ['Zn²⁺', 'SO₄²⁻'],
    b: ['Na⁺', 'CO₃²⁻'],
    difficulty: 'mid',
    context: 'Sinkkarbónat er hvítt og er notað í húðkrem gegn kláða.',
  },
  {
    id: 'srcl2-na2so4',
    a: ['Sr²⁺', 'Cl⁻'],
    b: ['Na⁺', 'SO₄²⁻'],
    difficulty: 'thung',
    context:
      'Strontíum er í sömu lotu og baríum og hegðar sér eins: strontíumsúlfat er líka undantekning frá súlfatreglunni.',
  },
];

export const SCENARIOS: Scenario[] = SOURCES.map((s) => ({
  id: s.id,
  context: s.context,
  difficulty: s.difficulty,
  reaction: react(makeSalt(s.a[0], s.a[1]), makeSalt(s.b[0], s.b[1])),
}));

export const PRECIPITATING = SCENARIOS.filter((s) => s.reaction.formsPrecipitate);
export const NON_PRECIPITATING = SCENARIOS.filter((s) => !s.reaction.formsPrecipitate);

/**
 * Single compounds for the solubility drill.
 *
 * Written as an ion pair, so the formula, the verdict and the rule that decides
 * it are all derived. A compound whose anion no rule covers throws here rather
 * than becoming an unanswerable question.
 */
export interface DrillItem {
  id: string;
  salt: Salt;
  verdict: Verdict;
}

const DRILL_PAIRS: [string, string][] = [
  ['Na⁺', 'NO₃⁻'],
  ['K⁺', 'Cl⁻'],
  ['NH₄⁺', 'S²⁻'],
  ['Ag⁺', 'Cl⁻'],
  ['Ag⁺', 'NO₃⁻'],
  ['Pb²⁺', 'I⁻'],
  ['Pb²⁺', 'NO₃⁻'],
  ['Ba²⁺', 'SO₄²⁻'],
  ['Ba²⁺', 'OH⁻'],
  ['Ca²⁺', 'OH⁻'],
  ['Ca²⁺', 'CO₃²⁻'],
  ['Na⁺', 'CO₃²⁻'],
  ['Mg²⁺', 'SO₄²⁻'],
  ['Ca²⁺', 'SO₄²⁻'],
  ['Fe³⁺', 'OH⁻'],
  ['Cu²⁺', 'S²⁻'],
  ['Ag⁺', 'CrO₄²⁻'],
  ['K⁺', 'CrO₄²⁻'],
  ['Ca²⁺', 'PO₄³⁻'],
  ['Na⁺', 'PO₄³⁻'],
  ['Mg²⁺', 'F⁻'],
  ['Na⁺', 'F⁻'],
  ['Zn²⁺', 'CO₃²⁻'],
  ['Sr²⁺', 'SO₄²⁻'],
];

export const DRILL_ITEMS: DrillItem[] = DRILL_PAIRS.map(([c, a]) => {
  const salt = makeSalt(c, a);
  return { id: `${c}-${a}`, salt, verdict: solubility(salt) };
});

/**
 * The pairs that exist to break a rule-of-thumb, kept together so a test can
 * assert the drill still contains them.
 *
 * Each one is a case where the general rule and the answer disagree: three
 * exceptions that make a normally-soluble ion precipitate, and three
 * exceptions that make a normally-insoluble one dissolve. A drill of only
 * general cases teaches "look at the anion" and nothing else.
 */
export const EXCEPTION_ITEMS = DRILL_ITEMS.filter((d) => d.verdict.byException);
