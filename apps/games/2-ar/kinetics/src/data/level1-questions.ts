import type { TieredHints } from '@shared/types';

export interface KineticsChallenge {
  id: number;
  title: string;
  question: string;
  type: 'multiple_choice' | 'slider' | 'ordering';
  options?: { id: string; text: string; correct: boolean; explanation: string }[];
  sliderConfig?: {
    variable: string;
    min: number;
    max: number;
    correctRange: [number, number];
    unit: string;
  };
  orderItems?: { id: string; text: string; correctOrder: number }[];
  hints: TieredHints;
  conceptExplanation: string;
}

export const challenges: KineticsChallenge[] = [
  {
    id: 1,
    title: 'Hvað er hvarfhraði?',
    question: 'Hvörf A → B tekur 10 sekúndur og styrkur A breytist úr 1.0 M í 0.5 M. Hver er meðalhraðinn?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '0.05 M/s', correct: true, explanation: 'Rate = Δ[A]/Δt = (1.0 - 0.5)/10 = 0.05 M/s' },
      { id: 'b', text: '0.5 M/s', correct: false, explanation: 'Þetta er styrkbreytingin, ekki hraðinn (vantar /Δt)' },
      { id: 'c', text: '5.0 M/s', correct: false, explanation: 'Þú margfaldaðir í stað þess að deila' },
      { id: 'd', text: '0.1 M/s', correct: false, explanation: 'Athugaðu útreikninginn aftur: 0.5/10 = 0.05' },
    ],
    hints: {
      topic: 'Þetta snýst um hvarfhraða og styrkbreytingu',
      strategy: 'Reiknaðu breytingu á styrk og deildu með tíma',
      method: 'Rate = Δ[styrk]/Δ[tími]',
      solution: 'Rate = (1.0 - 0.5) M / 10 s = 0.5/10 = 0.05 M/s',
    },
    conceptExplanation: 'Hvarfhraði mælist í styrkbreytingu á tímaeiningu (M/s eða mol/L·s).'
  },
  {
    id: 2,
    title: 'Áhrif styrks',
    question: 'Ef styrkur hvarfefnis tvöfaldast, hvað gerist við hraðann í 1. stigs hvörf?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Hraðinn tvöfaldast', correct: true, explanation: 'Í 1. stigs hvörf: Rate = k[A]. Ef [A] tvöfaldast, tvöfaldast Rate.' },
      { id: 'b', text: 'Hraðinn helst sá sami', correct: false, explanation: 'Þetta myndi gilda fyrir 0. stigs hvörf.' },
      { id: 'c', text: 'Hraðinn fjórfaldast', correct: false, explanation: 'Þetta myndi gilda fyrir 2. stigs hvörf.' },
      { id: 'd', text: 'Hraðinn helmingast', correct: false, explanation: 'Hærri styrkur leiðir til hraðari hvörfunar.' },
    ],
    hints: {
      topic: 'Þetta snýst um hvörfunarröð (reaction order)',
      strategy: 'Hugsaðu um sambandið milli styrks og hraða í hvarfhraðajöfnu',
      method: 'Í 1. stigs hvörf er veldisvísir = 1, þ.e. Rate = k[A]^1',
      solution: 'Rate = k[A]. Ef [A] tvöfaldast: Rate_new = k(2[A]) = 2k[A] = 2 x Rate_old',
    },
    conceptExplanation: 'Röð hvörfunar (order) segir til um hversu mikið styrkur hefur áhrif. 1. stig: línuleg, 2. stig: ferning.'
  },
  {
    id: 3,
    title: 'Hitastig og hraði',
    question: 'Hvers vegna hraðar hitastig efnahvörf?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Fleiri sameidir hafa nógu mikla orku til að komast yfir virkjunarorku', correct: true, explanation: 'Rétt! Hærra hitastig = fleiri sameidir með E ≥ Ea.' },
      { id: 'b', text: 'Virkjunarorkan minnkar', correct: false, explanation: 'Ea breytist ekki með hitastigi (aðeins hvatar breytir Ea).' },
      { id: 'c', text: 'Hraðafastinn k minnkar', correct: false, explanation: 'k hækkar með hitastigi samkvæmt Arrhenius jöfnunni.' },
      { id: 'd', text: 'Sameidir verða stærri', correct: false, explanation: 'Hitastig breytir hreyfiorku, ekki stærð sameinda.' },
    ],
    hints: {
      topic: 'Þetta snýst um hitastig og hvarfhraða',
      strategy: 'Hugsaðu um orkudreifingu Maxwell-Boltzmann',
      method: 'Arrhenius jafnan: k = Ae^(-Ea/RT) - hærra T hækkar k',
      solution: 'Hærra hitastig eykur hreyfiorku, þannig fleiri sameidir hafa E ≥ Ea',
    },
    conceptExplanation: 'Arrhenius jafnan: k = Ae^(-Ea/RT). Þegar T hækkar, hækkar k veldisvísislega.'
  },
  {
    id: 4,
    title: 'Hvatar (catalysts)',
    question: 'Hvernig hraðar hvati efnahvörf?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Hvati lækkar virkjunarorkuna (Ea)', correct: true, explanation: 'Hvati býður upp á annan hvarfgangshátt með lægri Ea.' },
      { id: 'b', text: 'Hvati eykur hitastig hvarfsins', correct: false, explanation: 'Hvatar breyta ekki hitastigi.' },
      { id: 'c', text: 'Hvati eykur styrk hvarfefna', correct: false, explanation: 'Hvatar breyta ekki styrk.' },
      { id: 'd', text: 'Hvati breytir jafnvæginu til hægri', correct: false, explanation: 'Hvatar hraðar bæði fram- og bakhvörf jafnt.' },
    ],
    hints: {
      topic: 'Þetta snýst um hvata (catalysts)',
      strategy: 'Hvatar taka þátt en myndast aftur í lok hvarfsins',
      method: 'Hvati lækkar virkjunarorku (Ea) með öðrum hvarfgangshátt',
      solution: 'Hvati býður upp á annan hvarfgangshátt með lægri Ea, þannig fleiri árekstur hafa nóga orku',
    },
    conceptExplanation: 'Hvati lækkar Ea en breytir ekki ΔH eða jafnvægi. Hann hraðar bara leiðina að jafnvægi.'
  },
  {
    id: 5,
    title: 'Yfirborðsflatarmál',
    question: 'Járn (Fe) brennur hraðar sem járnduft en sem kubbur. Hvers vegna?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Meira yfirborð er í snertingu við O₂', correct: true, explanation: 'Fleiri árekstur við súrefni = hraðari hvörf.' },
      { id: 'b', text: 'Járnduft er heitara', correct: false, explanation: 'Hitastig er það sama.' },
      { id: 'c', text: 'Járnduft hefur aðra efnaformúlu', correct: false, explanation: 'Báðar eru Fe - sama efnið.' },
      { id: 'd', text: 'Duftið hefur meiri massa', correct: false, explanation: 'Massi getur verið sá sami.' },
    ],
    hints: {
      topic: 'Þetta snýst um yfirborðsflatarmál og hvörf',
      strategy: 'Hvörf gerast á yfirborði fastra efna',
      method: 'Meira yfirborð = fleiri árekstrarmöguleikar með hvarfefni',
      solution: 'Járnduft hefur miklu meira yfirborð en kubbur, þannig fleiri árekstur við O2 = hraðari hvörf',
    },
    conceptExplanation: 'Meira yfirborð = fleiri árekstrar = hraðari hvörf. Þess vegna eru lítil agnir hættulegri.'
  },
  {
    id: 6,
    title: 'Árekstrarkennningin',
    question: 'Samkvæmt árekstrarkenningu, hvað þarf til að hvörf eigi sér stað?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Árekstur með nógu mikilli orku OG réttri stefnu', correct: true, explanation: 'Báðir þættir skipta máli: orka ≥ Ea og rétt stefna (orientation).' },
      { id: 'b', text: 'Aðeins nógu mikil orka', correct: false, explanation: 'Stefna skiptir líka máli - sameidir þurfa að snerta á "réttum" stað.' },
      { id: 'c', text: 'Aðeins rétt stefna', correct: false, explanation: 'Orkukrafan er nauðsynleg til að rjúfa tengsl.' },
      { id: 'd', text: 'Hvatar verða alltaf að vera til staðar', correct: false, explanation: 'Hvatar hraða, en hvörf geta gerst án þeirra.' },
    ],
    hints: {
      topic: 'Þetta snýst um árekstrarkenningu (collision theory)',
      strategy: 'Hugsaðu um bílárekstur - stefna og hraði skipta báðir máli',
      method: 'Tveir þættir: orka ≥ Ea OG rétt stefna (orientation)',
      solution: 'Árekstur verður að hafa nógu mikla orku til að rjúfa tengsl OG sameidir þurfa að snerta á réttum stað',
    },
    conceptExplanation: 'Árekstrartíðni ákvarðar hversu oft sameidir mætast. En aðeins brot þeirra hefur nóga orku og rétta stefnu.'
  },
];

export const MAX_SCORE = 20 * 6; // 20 points per challenge, 6 challenges
