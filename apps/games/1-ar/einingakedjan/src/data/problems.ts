/**
 * Problems for the practice (Æfa) and apply (Beita) phases.
 *
 * Every problem starts from something a student can picture and hold: a strip of
 * magnesium ribbon, a teaspoon of salt, a glass of water, an antacid tablet.
 * That is the point of the game — the older `dimensional-analysis` game's Level 2
 * says "Breyttu massa úr g í kg", which is a units drill with no chemistry in it.
 *
 * There is no answer key. `expectedValue` below exists only so the test suite can
 * assert the engine computes what the chemistry says; the game itself never reads
 * it, and a student who finds a different valid route through the pool solves the
 * problem just the same.
 */

import { quantity, signature, type Quantity, type UnitSignature } from '../engine/units';

export type Phase = 'aefa' | 'beita';

export interface Problem {
  id: string;
  phase: Phase;
  /** Emoji anchor for the scenario card. Decorative only — always paired with text. */
  icon: string;
  /** The thing being measured, in a sentence a student can visualise. */
  context: string;
  /** Plain-language statement of what to find, e.g. "fjölda magnesíumatóma". */
  goal: string;
  start: Quantity;
  /**
   * The starting measurement exactly as the scenario states it, trailing zeros
   * included. A JS number cannot carry "5,00" and the precision is part of the
   * measurement, so it is stated rather than formatted.
   */
  startLabel: string;
  target: UnitSignature;
  /** Balanced equation, shown above the pool when the problem needs one. */
  equation?: string;
  /** Ids from `data/ratios.ts` offered for this problem, correct ones and distractors. */
  poolIds: string[];
  /** Strategy-level nudge. Free, always — using it costs nothing and is never counted. */
  hint: string;
  /** Why this calculation is worth doing outside a classroom. */
  why: string;
  /** Expected result, for the data-integrity test only. */
  expectedValue: number;
  /** Shortest correct chain length, for the test and for the "how many steps?" note. */
  expectedSteps: number;
}

export const problems: Problem[] = [
  /* ------------------------------------------------------------------- Æfa */
  {
    id: 'A1',
    phase: 'aefa',
    icon: '🎗️',
    context:
      'Þú heldur á 5,00 g búti af magnesíumborða — svona silfurgljáandi ræmu sem kviknar skært í á brennara.',
    goal: 'fjölda magnesíumatóma í bútnum',
    start: quantity(5.0, 'g', 'Mg'),
    startLabel: '5,00',
    target: signature('atóm', 'Mg'),
    poolIds: ['mm-Mg', 'avo-Mg', 'mm-MgO', 'metric-g-kg'],
    hint: 'Avogadro-talan tengir mól við fjölda agna, ekki grömm við fjölda agna. Þú þarft því að komast í mól fyrst.',
    why: 'Þetta er stærðargráðan sem gerir efnafræði sérstaka: fimm grömm af málmi eru meira en hundrað þúsund milljarðar milljarða af atómum.',
    expectedValue: 1.2386e23,
    expectedSteps: 2,
  },
  {
    id: 'A2',
    phase: 'aefa',
    icon: '🧪',
    context: 'Í bikarglasi eru 250 mL af 0,100 M NaOH-lausn, tilbúin fyrir títrun.',
    goal: 'mólfjölda NaOH í glasinu',
    start: quantity(250, 'mL', 'NaOH(aq)'),
    startLabel: '250',
    target: signature('mol', 'NaOH'),
    poolIds: ['metric-mL-L', 'molstyrkur-NaOH-0100', 'molstyrkur-HCl-0100', 'mm-NaOH'],
    hint: 'Mólstyrkur er gefinn á lítra, ekki millilítra. Skoðaðu nefnarann á mólstyrkshlutfallinu og athugaðu hvað þú ert með.',
    why: 'Enginn mælir efni í mólum á rannsóknarstofu — það er mælt í millilítrum af lausn. Þessi umbreyting er fyrsta skrefið í hverri einustu títrun.',
    expectedValue: 0.025,
    expectedSteps: 2,
  },
  {
    id: 'A3',
    phase: 'aefa',
    icon: '⚗️',
    context: 'Þú mælir 25,0 mL af etanóli í mæliglas.',
    goal: 'mólfjölda etanóls',
    start: quantity(25.0, 'mL', 'C₂H₅OH'),
    startLabel: '25,0',
    target: signature('mol', 'C₂H₅OH'),
    poolIds: ['edlismassi-etanol', 'mm-etanol', 'edlismassi-vatn', 'mm-CO2'],
    hint: 'Mólmassi tengir grömm við mól — en þú mældir rúmmál. Hvaða stærð tengir rúmmál við massa?',
    why: 'Vökva er alltaf þægilegra að mæla í rúmmáli en að vigta. Eðlismassinn er brúin þar á milli, og án hennar kemstu ekki í mól.',
    expectedValue: 0.4281528,
    expectedSteps: 2,
  },
  {
    id: 'A4',
    phase: 'aefa',
    icon: '🧂',
    context: 'Ein slétt teskeið af matarsalti er um 5,80 g af NaCl.',
    goal: 'fjölda formúlueininga af NaCl',
    start: quantity(5.8, 'g', 'NaCl'),
    startLabel: '5,80',
    target: signature('formúlueiningar', 'NaCl'),
    poolIds: ['mm-NaCl', 'avo-NaCl', 'mm-H2O', 'metric-mg-g'],
    hint: 'Sama leið og með magnesíumborðann: grömm → mól → agnir. Tvö skref, ekki eitt.',
    why: 'NaCl myndar ekki sameindir heldur jónagrind, svo við teljum formúlueiningar frekar en sameindir — en Avogadro-talan virkar nákvæmlega eins.',
    expectedValue: 5.9767e22,
    expectedSteps: 2,
  },
  {
    id: 'A5',
    phase: 'aefa',
    icon: '🥛',
    context: 'Í vatnsglasi eru 200,0 mL af vatni.',
    goal: 'mólfjölda vatnssameinda í glasinu',
    start: quantity(200.0, 'mL', 'H₂O'),
    startLabel: '200,0',
    target: signature('mol', 'H₂O'),
    poolIds: ['edlismassi-vatn', 'mm-H2O', 'edlismassi-etanol', 'mm-Fe'],
    hint: 'Eðlismassi vatns er 1,00 g/mL, sem gerir fyrsta skrefið auðvelt í hausnum — en það þarf samt að vera í keðjunni.',
    why: 'Rúmlega ellefu mól í einu vatnsglasi. Þetta er gagnleg viðmiðun til að meta hvort svör í öðrum dæmum séu á réttri stærðargráðu.',
    expectedValue: 11.0988,
    expectedSteps: 2,
  },

  /* ----------------------------------------------------------------- Beita */
  {
    id: 'B1',
    phase: 'beita',
    icon: '✨',
    context:
      'Þú brennir 5,00 g af magnesíumborða í lofti. Eftir stendur hvítt duft — magnesíumoxíð.',
    goal: 'massa magnesíumoxíðsins sem myndast, í grömmum',
    start: quantity(5.0, 'g', 'Mg'),
    startLabel: '5,00',
    target: signature('g', 'MgO'),
    equation: '2 Mg + O₂ → 2 MgO',
    poolIds: ['mm-Mg', 'jafna-Mg-MgO', 'mm-MgO', 'jafna-Mg-O2', 'mm-O2', 'metric-g-kg'],
    hint: 'Efnajafnan tengir mól við mól — aldrei grömm við grömm. Þú þarft því að fara inn í mól, yfir jöfnuna, og út í grömm aftur.',
    why: 'Massi frá einu efni yfir í annað er algengasta útreikningur efnafræðinnar: hversu mikið hráefni þarf til að fá tiltekið magn af afurð?',
    expectedValue: 8.28877,
    expectedSteps: 3,
  },
  {
    id: 'B2',
    phase: 'beita',
    icon: '🧁',
    context:
      'Þú setur eina teskeið af matarsóda, 4,60 g af NaHCO₃, í heitan ofn. Hann klofnar og gefur frá sér koltvísýring — það er gasið sem lyftir kökunni.',
    goal: 'massa koltvísýringsins sem myndast, í grömmum',
    start: quantity(4.6, 'g', 'NaHCO₃'),
    startLabel: '4,60',
    target: signature('g', 'CO₂'),
    equation: '2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂',
    poolIds: ['mm-NaHCO3', 'jafna-NaHCO3-CO2', 'mm-CO2', 'jafna-NaHCO3-Na2CO3', 'mm-Na2CO3'],
    hint: 'Stuðlarnir í jöfnunni eru ekki 1:1 hér. Tvö mól af matarsóda gefa aðeins eitt mól af koltvísýringi.',
    why: 'Uppskriftir að lyftidufti eru hannaðar út frá þessum útreikningi — of mikið og kakan fellur, of lítið og hún lyftir sér ekki.',
    expectedValue: 1.20489,
    expectedSteps: 3,
  },
  {
    id: 'B3',
    phase: 'beita',
    icon: '💊',
    context:
      'Sýrubindandi tafla inniheldur 500 mg af kalsíumkarbónati. Í maganum hvarfast það við saltsýru.',
    goal: 'rúmmál 0,100 M saltsýru sem taflan getur hlutleyst, í lítrum',
    start: quantity(500, 'mg', 'CaCO₃'),
    startLabel: '500',
    target: signature('L', 'HCl(aq)'),
    equation: 'CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂',
    poolIds: [
      'metric-mg-g',
      'mm-CaCO3',
      'jafna-CaCO3-HCl',
      'molstyrkur-HCl-0100',
      'molstyrkur-NaOH-0100',
      'jafna-CaCO3-CO2',
    ],
    hint: 'Fjögur skref. Byrjaðu á að losna við milligrömmin, og mundu að mólstyrkur er hlutfall sem má snúa við eins og hverju öðru.',
    why: 'Þetta er nákvæmlega útreikningurinn á bak við skammtastærð sýrubindandi lyfja — hversu mikla magasýru ein tafla ræður við.',
    expectedValue: 0.0999101,
    expectedSteps: 4,
  },
  {
    id: 'B4',
    phase: 'beita',
    icon: '🔥',
    context:
      'Í einum skammti af handspritti eru um 25,0 mL af etanóli. Þegar það brennur myndast koltvísýringur og vatn.',
    goal: 'massa koltvísýrings sem myndast við brunann, í grömmum',
    start: quantity(25.0, 'mL', 'C₂H₅OH'),
    startLabel: '25,0',
    target: signature('g', 'CO₂'),
    equation: 'C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O',
    poolIds: [
      'edlismassi-etanol',
      'mm-etanol',
      'jafna-etanol-CO2',
      'mm-CO2',
      'jafna-etanol-O2',
      'edlismassi-vatn',
    ],
    hint: 'Fjögur skref, og þau nota fjórar ólíkar tegundir hlutfalla: eðlismassa, mólmassa, stuðla úr jöfnunni og mólmassa aftur.',
    why: 'Sami útreikningur og notaður er til að meta kolefnisspor eldsneytis: rúmmál inn, massi af CO₂ út.',
    expectedValue: 37.686,
    expectedSteps: 4,
  },
  {
    id: 'B5',
    phase: 'beita',
    icon: '🔩',
    context: 'Járnnagli sem vegur 2,50 g ryðgar alveg í rakri geymslu. Ryðið er járn(III)oxíð.',
    goal: 'massa ryðsins sem myndast, í grömmum',
    start: quantity(2.5, 'g', 'Fe'),
    startLabel: '2,50',
    target: signature('g', 'Fe₂O₃'),
    equation: '4 Fe + 3 O₂ → 2 Fe₂O₃',
    poolIds: ['mm-Fe', 'jafna-Fe-Fe2O3', 'mm-Fe2O3', 'jafna-Fe-O2', 'mm-O2'],
    hint: 'Fjögur mól af járni gefa tvö mól af ryði — hlutfallið er 4:2, ekki 1:1. Ryðið á að vega meira en naglinn, því súrefnið bætist við.',
    why: 'Ryð vegur meira en járnið sem það kom úr. Þess vegna er hægt að meta tæringu í brú eða skipi með því einu að vigta.',
    expectedValue: 3.57398,
    expectedSteps: 3,
  },
];

export const problemsForPhase = (phase: Phase): Problem[] =>
  problems.filter((p) => p.phase === phase);
