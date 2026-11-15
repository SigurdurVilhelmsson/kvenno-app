/**
 * Samþynningareiginleikar: the ten Æfa items, each from the book's ch. 11.4 (m68783) and holding
 * only what the book gives. Every number key is worked out by `engine/lausnir.ts`, never typed.
 * `lausnir.test.ts` holds each to the book's own answer.
 */
import type { SolventId } from '../engine/lausnir';

interface Base {
  id: string;
  setting: string;
  question: string;
  source: string;
}

interface NumericBase extends Base {
  unit: string;
  /** What the book prints as the answer, or what its worked solution comes to. */
  bookAnswer: number;
}

/** Vapour pressure of a solvent with a nonvolatile solute in it, by Raoult's law. */
export interface RaoultItem extends NumericBase {
  kind: 'raoult';
  solute: { formula: string; grams: number };
  solvent: { formula: string; grams: number };
  pure: number;
}

/** Boiling or freezing point of a solution: from its molality, or from the masses. */
export interface PointItem extends NumericBase {
  kind: 'sudumark' | 'frostmark';
  solvent: SolventId;
  /** The molality where the book gives it, else the solute's formula and grams. */
  m?: number;
  solute?: { formula: string; grams: number };
  solventGrams?: number;
  /** The van 't Hoff factor, as the book's predicted value for full dissociation. */
  i: number;
}

/** Osmotic pressure of a solution of given molarity. */
export interface OsmoticItem extends NumericBase {
  kind: 'osmosa';
  M: number;
  celsius: number;
}

export interface ChoiceItem extends Base {
  kind: 'val';
  /** The first option is the right one; the screen shuffles them. */
  options: readonly { text: string; slip?: string }[];
  why: readonly string[];
}

export type NumericItem = RaoultItem | PointItem | OsmoticItem;
export type LausnirItem = NumericItem | ChoiceItem;

const SRC = 'kafli 11, „Samþynningareiginleikar“ (m68783)';

export const LAUSNIR_ITEMS: readonly LausnirItem[] = [
  {
    id: 'raoult-glyserin',
    kind: 'raoult',
    setting:
      'Kjörlausn inniheldur 92,1 g af glýseríni, C₃H₅(OH)₃, og 184,4 g af etanóli, C₂H₅OH, við 40 °C. Gufunarþrýstingur hreins etanóls er 0,178 atm við 40 °C og glýserín er órokgjarnt.',
    question: 'Hver er gufunarþrýstingur lausnarinnar?',
    unit: 'atm',
    solute: { formula: 'C3H8O3', grams: 92.1 },
    solvent: { formula: 'C2H6O', grams: 184.4 },
    pure: 0.178,
    bookAnswer: 0.142,
    source: `${SRC}, sýnidæmi um lögmál Raoults`,
  },
  {
    id: 'raoult-thvagefni',
    kind: 'raoult',
    setting:
      'Lausn inniheldur 5,00 g af þvagefni, CO(NH₂)₂, sem er órokgjarnt, og 100 g af vatni. Gufunarþrýstingur hreins vatns við 25 °C er 23,7 torr.',
    question: 'Hver er gufunarþrýstingur lausnarinnar?',
    unit: 'torr',
    solute: { formula: 'CON2H4', grams: 5 },
    solvent: { formula: 'H2O', grams: 100 },
    pure: 23.7,
    bookAnswer: 23.4,
    source: `${SRC}, „Kannaðu þekkingu þína“`,
  },
  {
    id: 'val-agnir',
    kind: 'val',
    setting: 'Eitt mól af NaCl og eitt mól af glýseríni eru hvort um sig leyst í 1 kg af vatni.',
    question: 'Af hverju lækkar NaCl frostmarkið næstum tvöfalt meira?',
    options: [
      { text: 'Hver formúlueining NaCl gefur tvær jónir, Na⁺ og Cl⁻' },
      {
        text: 'NaCl hefur meiri mólmassa',
        slip: 'Mólmassinn skiptir engu: samþynningareiginleikar ráðast af fjölda agna, ekki massa þeirra.',
      },
      {
        text: 'NaCl myndar sterkari vetnistengi við vatn',
        slip: 'Gerð agnanna skiptir ekki máli, aðeins hve margar þær eru í hverju kg af leysi.',
      },
      {
        text: 'Glýserín gufar upp úr lausninni',
        slip: 'Glýserín er órokgjarnt. Munurinn er að glýserín klofnar ekki en NaCl gefur tvær jónir.',
      },
    ],
    why: [
      'Frostmarkslækkun er ΔTf = i·Kf·m. Glýserín klofnar ekki, i = 1; NaCl gefur Na⁺ og Cl⁻, i = 2.',
      'Mælt i fyrir NaCl er 1,9, aðeins minna en 2, því sumar jónirnar mynda jónapör.',
    ],
    source: `${SRC}, æfing í lok kaflans`,
  },
  {
    id: 'sudumark-bensen',
    kind: 'sudumark',
    setting: 'Lausn af órokgjörnu efni í benseni er 0,33 m. Gerðu ráð fyrir kjörlausn.',
    question: 'Hvert er suðumark lausnarinnar?',
    unit: '°C',
    solvent: 'bensen',
    m: 0.33,
    i: 1,
    bookAnswer: 80.9,
    source: `${SRC}, sýnidæmið Útreikningur á suðumarki lausnar`,
  },
  {
    id: 'sudumark-jod',
    kind: 'sudumark',
    setting:
      '92,1 g af joði, I₂, eru leyst í 800,0 g af klóróformi, CHCl₃. Joðið er órokgjarnt og lausnin kjörlausn.',
    question: 'Hvert er suðumark lausnarinnar?',
    unit: '°C',
    solvent: 'klóróform',
    solute: { formula: 'I2', grams: 92.1 },
    solventGrams: 800,
    i: 1,
    bookAnswer: 62.91,
    source: `${SRC}, sýnidæmi um suðumark út frá massa`,
  },
  {
    id: 'frostmark-nitrobensen',
    kind: 'frostmark',
    setting:
      'Lausn af órokgjörnu efni, sem er ekki rafkleyfi, í nítróbenseni er 1,85 m. Gerðu ráð fyrir kjörlausn.',
    question: 'Hvert er frostmark lausnarinnar?',
    unit: '°C',
    solvent: 'nítróbensen',
    m: 1.85,
    i: 1,
    bookAnswer: -9.3,
    source: `${SRC}, „Kannaðu þekkingu þína“`,
  },
  {
    id: 'osmosa-glukosi',
    kind: 'osmosa',
    setting:
      '0,30 M glúkósalausn í vatni er notuð í innrennslisgjöf í æð, við líkamshita, 37 °C. Gerðu ráð fyrir kjörlausn.',
    question: 'Hver er osmósuþrýstingur lausnarinnar?',
    unit: 'atm',
    M: 0.3,
    celsius: 37,
    bookAnswer: 7.6,
    source: `${SRC}, sýnidæmi um osmósuþrýsting`,
  },
  {
    id: 'frostmark-sjor',
    kind: 'frostmark',
    setting:
      "Jónastyrkur sjávar er um sá sami og í lausn af 4,2 g af NaCl í 125 g af vatni. Notaðu spáð gildi van 't Hoff-stuðulsins og gerðu ráð fyrir kjörlausn.",
    question: 'Hvert er frostmark lausnarinnar?',
    unit: '°C',
    solvent: 'vatn',
    solute: { formula: 'NaCl', grams: 4.2 },
    solventGrams: 125,
    i: 2,
    bookAnswer: -2.1,
    source: `${SRC}, sýnidæmið Frostmark lausnar rafkleyfis`,
  },
  {
    id: 'frostmark-cacl2',
    kind: 'frostmark',
    setting:
      '0,724 g af CaCl₂ eru leyst í 175 g af vatni. Gerðu ráð fyrir fullkominni sundrun og kjörlausn.',
    question: 'Hvert er frostmark lausnarinnar?',
    unit: '°C',
    solvent: 'vatn',
    solute: { formula: 'CaCl2', grams: 0.724 },
    solventGrams: 175,
    i: 3,
    bookAnswer: -0.208,
    source: `${SRC}, „Prófaðu þekkingu þína“`,
  },
  {
    id: 'val-laegst',
    kind: 'val',
    setting:
      "Fjórar 0,050 m vatnslausnir. Mæld gildi van 't Hoff-stuðulsins eru súkrósi 1,0, NaCl 1,9, MgCl₂ 2,7 og FeCl₃ 3,4.",
    question: 'Hver lausnanna hefur lægst frostmark?',
    options: [
      { text: 'FeCl₃' },
      {
        text: 'Súkrósi',
        slip: 'Súkrósi klofnar ekki, i = 1, svo hann lækkar frostmarkið minnst.',
      },
      {
        text: 'NaCl',
        slip: 'NaCl gefur tvær jónir, en FeCl₃ gefur fjórar: Fe³⁺ og 3Cl⁻.',
      },
      {
        text: 'MgCl₂',
        slip: 'MgCl₂ gefur þrjár jónir, en FeCl₃ fjórar, og mælt i er 2,7 á móti 3,4.',
      },
    ],
    why: [
      'Við sama mólalstyrk ræður i: ΔTf = i·Kf·m. FeCl₃ hefur stærst i, 3,4, og lægst frostmark.',
      'Mælda gildið er lægra en spáða gildið, 4, því jónirnar mynda að hluta jónapör.',
    ],
    source: `${SRC}, tafla um spáða og mælda van 't Hoff-stuðla`,
  },
];
