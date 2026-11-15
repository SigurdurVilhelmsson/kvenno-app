/**
 * Fasabreytingar og fasarit: the ten Æfa items. Each holds only what the book gives (ch. 10.3,
 * m68768, and 10.4, m68769) and says which kind of question it is; every number key is worked
 * out by `engine/fasar.ts`, never typed. `fasar.test.ts` holds each to the book's own answer.
 */

interface Base {
  id: string;
  /** The setting and the givens, as the student reads them. */
  setting: string;
  question: string;
  /** Where in the book the item comes from. */
  source: string;
}

interface NumericBase extends Base {
  unit: string;
  /** What the book prints as the answer, for the test to hold the engine to. */
  bookAnswer: number;
}

/** Heat to take water from one temperature to another, through any phase changes. */
export interface WaterHeatItem extends NumericBase {
  kind: 'vatn';
  mass: number;
  t1: number;
  t2: number;
  /** Asked as the heat given off, so the answer is positive while the water cools. */
  released?: boolean;
}

/** Heat to melt a mass of a substance at its melting point. */
export interface MeltItem extends NumericBase {
  kind: 'braedsla';
  formula: string;
  mass: number;
  fusion: number;
}

/** ΔH(gufunar) from the vapour pressure at two temperatures. */
export interface ClausiusItem extends NumericBase {
  kind: 'gufunarvermi';
  t1: number;
  p1: number;
  t2: number;
  p2: number;
}

/** A question with options; the first option is the right one and the screen shuffles them. */
export interface ChoiceItem extends Base {
  kind: 'val';
  options: readonly { text: string; slip?: string }[];
  why: readonly string[];
}

export type NumericItem = WaterHeatItem | MeltItem | ClausiusItem;
export type FasarItem = NumericItem | ChoiceItem;

const M68768 = 'kafli 10, „Fasabreytingar“ (m68768)';
const M68769 = 'kafli 10, „Fasarit“ (m68769)';

export const FASAR_ITEMS: readonly FasarItem[] = [
  {
    id: 'vatn-hitun',
    kind: 'vatn',
    setting: '135 g af ís við −15 °C eru hituð þar til úr verður vatnsgufa við 120 °C.',
    question: 'Hve mikinn varma þarf?',
    unit: 'kJ',
    mass: 135,
    t1: -15,
    t2: 120,
    bookAnswer: 416,
    source: `${M68768}, sýnidæmi um heildarvarma hitunarferils`,
  },
  {
    id: 'val-slétta',
    kind: 'val',
    setting:
      'Varma er bætt við ís við 0 °C. Hitastigið helst 0 °C þar til allur ísinn er bráðnaður.',
    question: 'Hvert fer varminn meðan hitastigið stendur í stað?',
    options: [
      { text: 'Hann yfirvinnur kraftana milli sameindanna í ísnum, svo ísinn bráðnar' },
      {
        text: 'Hann eykur hreyfiorku sameindanna',
        slip: 'Meðalhreyfiorka sameindanna er það sem hitamælir mælir. Hún eykst ekki meðan hitastigið stendur í stað.',
      },
      {
        text: 'Hann tapast allur út í umhverfið',
        slip: 'Varminn fer í ísinn: magn íss minnkar og magn vatns vex, þótt hitastigið breytist ekki.',
      },
      {
        text: 'Hann rýfur samgildu tengin í vatnssameindunum',
        slip: 'Við bráðnun haldast sameindirnar heilar. Það eru kraftarnir milli þeirra sem gefa eftir.',
      },
    ],
    why: [
      'Varminn veitir orkuna sem þarf til að yfirvinna aðdráttarkraftana milli sameindanna að hluta, og ísinn breytist í vatn.',
      'Aðeins magn íss og vatns breytist. Þegar ísinn er allur bráðnaður fer hitastigið að hækka aftur.',
    ],
    source: `${M68768}, æfing í lok kaflans`,
  },
  {
    id: 'vatn-kolnun',
    kind: 'vatn',
    setting: '94,0 g af vatni við 80,0 °C kólna og verða að ís við −30,0 °C.',
    question: 'Hve mikill varmi losnar?',
    unit: 'kJ',
    mass: 94,
    t1: 80,
    t2: -30,
    released: true,
    bookAnswer: 68.7,
    source: `${M68768}, „Kannaðu þekkingu þína“`,
  },
  {
    id: 'val-utvermid',
    kind: 'val',
    setting: 'Sex fasabreytingar tengja fast efni, vökva og gas.',
    question: 'Hver þessara fasabreytinga er útvermin?',
    options: [
      { text: 'Þétting' },
      {
        text: 'Bráðnun',
        slip: 'Við bráðnun þarf að yfirvinna krafta milli sameinda, svo hún tekur til sín varma.',
      },
      {
        text: 'Uppgufun',
        slip: 'Uppgufun tekur til sín varma: þess vegna kælir sviti húðina.',
      },
      {
        text: 'Þurrgufun',
        slip: 'Þurrgufun tekur til sín enn meiri varma en uppgufun, því kraftarnir í fasta efninu eru allir yfirunnir.',
      },
    ],
    why: [
      'Bráðnun, uppgufun og þurrgufun taka til sín varma til að yfirvinna kraftana milli sameinda.',
      'Gagnstæðu ferlin, storknun, þétting og hélun, gefa frá sér varma þegar kraftarnir myndast að nýju.',
    ],
    source: `${M68768}, lykilhugtök og samantekt`,
  },
  {
    id: 'vatn-gufa',
    kind: 'vatn',
    setting: '422 g af vatni við 23,5 °C eru hituð þar til úr verður gufa við 150 °C.',
    question: 'Hve mikinn varma þarf?',
    unit: 'kJ',
    mass: 422,
    t1: 23.5,
    t2: 150,
    bookAnswer: 1125,
    source: `${M68768}, æfing í lok kaflans`,
  },
  {
    id: 'braedsla-ticl4',
    kind: 'braedsla',
    setting: 'Títantetraklóríð, TiCl₄, hefur bræðslumark −23,2 °C og ΔH(bræðslu) = 9,37 kJ/mól.',
    question: 'Hve mikla orku þarf til að bræða 263,1 g af TiCl₄?',
    unit: 'kJ',
    formula: 'TiCl4',
    mass: 263.1,
    fusion: 9.37,
    bookAnswer: 13.0,
    source: `${M68768}, æfing í lok kaflans`,
  },
  {
    id: 'gufunarvermi-etanol',
    kind: 'gufunarvermi',
    setting: 'Við 20,0 °C er gufunarþrýstingur etanóls 5,95 kPa og við 63,5 °C er hann 53,3 kPa.',
    question: 'Metið gufunarvermi etanóls.',
    unit: 'kJ/mól',
    t1: 20,
    p1: 5.95,
    t2: 63.5,
    p2: 53.3,
    bookAnswer: 41.4,
    source: `${M68768}, „Kannaðu þekkingu þína“ um Clausius-Clapeyron-jöfnuna`,
  },
  {
    id: 'val-undir-thripunkti',
    kind: 'val',
    setting:
      'Þrípunktur vatns er við 0,01 °C og 0,61 kPa. Við lægri þrýsting en það getur vatn ekki verið vökvi.',
    question: 'Í hvaða ham er vatn við 50 °C og 0,3 kPa?',
    options: [
      { text: 'Gas' },
      {
        text: 'Vökvi',
        slip: '0,3 kPa er undir þrýstingi þrípunktsins, og þar er enginn vökvi við neitt hitastig.',
      },
      {
        text: 'Fast efni',
        slip: 'Við 50 °C er vatn langt fyrir ofan bræðslumark sitt; við svo lágan þrýsting er það gas.',
      },
    ],
    why: [
      'Undir þrípunktinum skilur aðeins ferillinn milli fasts efnis og gass fasana að.',
      'Við 50 °C og 0,3 kPa er vatn hægra megin við hann, í gasham. Þar þurrgufar ís án þess að bráðna, sem er nýtt við frostþurrkun.',
    ],
    source: `${M68769}, sýnidæmið Að ákvarða ástand vatns`,
  },
  {
    id: 'val-thurris',
    kind: 'val',
    setting: 'Þrípunktur koldíoxíðs er vel yfir 1 atm.',
    question: 'Hvað verður um þurrís, fast CO₂, sem hitnar við 1 atm?',
    options: [
      { text: 'Hann þurrgufar: verður beint að gasi' },
      {
        text: 'Hann bráðnar fyrst og sýður svo',
        slip: 'Til þess þyrfti þrýstingurinn að vera yfir þrýstingi þrípunktsins. Við 1 atm er enginn vökvaferill að fara yfir.',
      },
      {
        text: 'Hann bráðnar en sýður ekki',
        slip: 'Fljótandi CO₂ er ekki til við 1 atm, því þrýstingurinn er undir þrípunktinum.',
      },
    ],
    why: [
      'Undir þrýstingi þrípunktsins getur efni ekki verið vökvi, hvert sem hitastigið er.',
      'Þrípunktur CO₂ er yfir 1 atm, svo við venjulegan loftþrýsting fer fast CO₂ beint í gas. Þess vegna heitir það þurrís.',
    ],
    source: `${M68769}, fasarit koldíoxíðs`,
  },
  {
    id: 'val-jokull',
    kind: 'val',
    setting:
      'Í fasariti vatns hallar ferillinn milli íss og vatns örlítið til vinstri, ólíkt flestum efnum.',
    question: 'Hvað verður um bræðslumark íss þegar þrýstingurinn eykst?',
    options: [
      { text: 'Það lækkar lítillega' },
      {
        text: 'Það hækkar lítillega',
        slip: 'Svo er um flest efni, til dæmis CO₂, en ferill vatns hallar á hinn veginn.',
      },
      {
        text: 'Það breytist ekki',
        slip: 'Ferillinn er ekki lóðréttur: hann hallar örlítið, svo bræðslumarkið breytist með þrýstingi.',
      },
    ],
    why: [
      'Ís er eðlisléttari en vatn, svo aukinn þrýstingur ýtir jafnvæginu að vatninu og bræðslumarkið lækkar.',
      'Undir jöklum er þrýstingurinn svo mikill að hluti íssins bráðnar og vatnslag auðveldar jöklinum að skríða.',
    ],
    source: `${M68769}, fasarit vatns`,
  },
];
