import type { TieredHints } from '@shared/types';

export interface Equation {
  id: string;
  reactants: string;
  products: string;
  deltaH: number;
  isReversed: boolean;
  multiplier: number;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  concept: string;
  equation: Equation;
  question: string;
  options: { text: string; correct: boolean; explanation: string }[];
  hints: TieredHints;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Hvað er ΔH?',
    description: 'Skammtavarmi (ΔH) segir okkur hvort hvörf gefi frá sér orku eða taki til sín orku.',
    concept: 'Neikvætt ΔH = exothermic (gefur frá sér varma). Jákvætt ΔH = endothermic (tekur til sín varma).',
    equation: {
      id: 'eq1',
      reactants: 'CH₄(g) + 2O₂(g)',
      products: 'CO₂(g) + 2H₂O(l)',
      deltaH: -890,
      isReversed: false,
      multiplier: 1
    },
    question: 'Brennsla metans gefur ΔH = -890 kJ/mol. Er þetta hvarf exothermic eða endothermic?',
    options: [
      { text: 'Exothermic (gefur frá sér varma)', correct: true, explanation: 'Rétt! Neikvætt ΔH þýðir að kerfið gefur frá sér orku til umhverfisins.' },
      { text: 'Endothermic (tekur til sín varma)', correct: false, explanation: 'Rangt. Neikvætt ΔH þýðir að orka fer ÚT úr kerfinu, ekki inn.' }
    ],
    hints: {
      topic: 'Þetta snýst um formerki ΔH og hvað það þýðir.',
      strategy: 'Hugsaðu um hvort orka fer inn í kerfið eða út úr því.',
      method: 'Neikvætt ΔH = orka fer út (exothermic). Jákvætt ΔH = orka fer inn (endothermic).',
      solution: 'ΔH = -890 kJ er neikvætt, svo orka fer ÚT úr kerfinu. Þetta er exothermic hvarf.'
    }
  },
  {
    id: 2,
    title: 'Snúa við hvörfum',
    description: 'Þegar þú snýrð við efnahvörfum (hvarfefni ↔ afurðir), þá snýst formerkið á ΔH.',
    concept: 'Ef A → B hefur ΔH = -100 kJ, þá hefur B → A ΔH = +100 kJ',
    equation: {
      id: 'eq2',
      reactants: 'H₂(g) + ½O₂(g)',
      products: 'H₂O(l)',
      deltaH: -286,
      isReversed: false,
      multiplier: 1
    },
    question: 'Myndun vatns: H₂(g) + ½O₂(g) → H₂O(l) hefur ΔH = -286 kJ. Hvað er ΔH fyrir sundrun vatns?',
    options: [
      { text: '+286 kJ', correct: true, explanation: 'Rétt! Þegar þú snýrð við hvörfum, snýrðu einnig formerkinu. -286 → +286' },
      { text: '-286 kJ', correct: false, explanation: 'Rangt. Þú þarft að snúa formerkinu þegar þú snýrð við hvörfum.' },
      { text: '-572 kJ', correct: false, explanation: 'Rangt. Þú ert að margfalda, ekki snúa við.' },
      { text: '+572 kJ', correct: false, explanation: 'Rangt. Þú ert bæði að margfalda og snúa við, en við erum bara að snúa.' }
    ],
    hints: {
      topic: 'Þetta snýst um að snúa við efnahvörfum og áhrif á ΔH.',
      strategy: 'Þegar hvörf ganga öfugt, þá gengur orkan einnig öfugt.',
      method: 'Snúðu formerkinu á ΔH. Ef ΔH = -X, þá er öfugt hvarf ΔH = +X.',
      solution: 'Myndun vatns: ΔH = -286 kJ. Sundrun er öfug, svo ΔH = +286 kJ.'
    }
  },
  {
    id: 3,
    title: 'Margfalda jöfnur',
    description: 'Þegar þú margfaldar alla stuðla í jöfnu, þá margfaldar þú einnig ΔH.',
    concept: 'Ef jafna hefur ΔH = -100 kJ, þá hefur 2× jafnan ΔH = -200 kJ',
    equation: {
      id: 'eq3',
      reactants: 'C(s) + O₂(g)',
      products: 'CO₂(g)',
      deltaH: -394,
      isReversed: false,
      multiplier: 1
    },
    question: 'Brennsla kolefnis: C(s) + O₂(g) → CO₂(g) hefur ΔH = -394 kJ. Hvað er ΔH ef við brennum 3 mól af kolefni?',
    options: [
      { text: '-1182 kJ', correct: true, explanation: 'Rétt! 3 × (-394) = -1182 kJ. Þreföld efnismagn gefur þrefalda orku.' },
      { text: '-394 kJ', correct: false, explanation: 'Rangt. Þetta er ΔH fyrir 1 mól. Þú þarft að margfalda með 3.' },
      { text: '-131 kJ', correct: false, explanation: 'Rangt. Þú ert að deila, ekki margfalda.' },
      { text: '+1182 kJ', correct: false, explanation: 'Rangt. Formerkið breytist ekki við margföldun.' }
    ],
    hints: {
      topic: 'Þetta snýst um að margfalda efnahvörf og áhrif á ΔH.',
      strategy: 'Meiri efnismagn = meiri orka. Margfaldaðu ΔH með sama stuðli.',
      method: 'Ef jafna hefur ΔH = X, þá hefur n× jafnan ΔH = n×X. Formerkið helst.',
      solution: '3 mól af C: ΔH = 3 × (-394) = -1182 kJ. Formerkið er enn neikvætt.'
    }
  },
  {
    id: 4,
    title: 'Sameina bæði',
    description: 'Þú getur snúið við OG margfaldað jöfnu. Gættu að röð aðgerða!',
    concept: 'Snúðu fyrst við (breytir formerki), margfaldaðu síðan.',
    equation: {
      id: 'eq4',
      reactants: 'N₂(g) + 3H₂(g)',
      products: '2NH₃(g)',
      deltaH: -92,
      isReversed: false,
      multiplier: 1
    },
    question: 'Myndun ammoníaks: N₂ + 3H₂ → 2NH₃ hefur ΔH = -92 kJ. Hvað er ΔH ef 4 mól af NH₃ sundrast?',
    options: [
      { text: '+184 kJ', correct: true, explanation: 'Rétt! Snúa við: +92 kJ. Margfalda með 2 (4 mól NH₃ = 2× jafnan): +184 kJ' },
      { text: '-184 kJ', correct: false, explanation: 'Rangt. Þú margfaldaðir rétt, en gleymdist að snúa formerkinu (sundrun vs myndun).' },
      { text: '+92 kJ', correct: false, explanation: 'Rangt. Þú snúðir við, en gleymdist að margfalda með 2.' },
      { text: '-92 kJ', correct: false, explanation: 'Rangt. Þetta er ΔH fyrir myndun, ekki sundrun.' }
    ],
    hints: {
      topic: 'Þetta snýst um að sameina snúa við og margfalda.',
      strategy: 'Hugsaðu um aðgerðirnar í réttri röð: sundrun (snúa) og magn (margfalda).',
      method: 'Sundrun er öfug við myndun, svo snúðu formerki. 4 mól NH₃ = 2× jafnan.',
      solution: 'Snúa við: +92 kJ. Margfalda með 2: +184 kJ.'
    }
  },
  {
    id: 5,
    title: 'Lögmál Hess í verki',
    description: 'Við getum fundið ΔH fyrir hvörf með því að leggja saman ΔH úr öðrum hvörfum.',
    concept: 'Ef A → B og B → C, þá A → C = ΔH₁ + ΔH₂',
    equation: {
      id: 'eq5',
      reactants: 'C(s) + ½O₂(g)',
      products: 'CO(g)',
      deltaH: -110,
      isReversed: false,
      multiplier: 1
    },
    question: 'Gefið: (1) C + O₂ → CO₂, ΔH = -394 kJ og (2) CO + ½O₂ → CO₂, ΔH = -283 kJ. Hvað er ΔH fyrir C + ½O₂ → CO?',
    options: [
      { text: '-111 kJ', correct: true, explanation: 'Rétt! Nota jöfnu (1) og snúa við jöfnu (2): -394 + 283 = -111 kJ' },
      { text: '-677 kJ', correct: false, explanation: 'Rangt. Þú lagðir saman, en þú þarft að snúa við jöfnu (2) til að CO sé afurð.' },
      { text: '+111 kJ', correct: false, explanation: 'Rangt. Réttur tölugildið, en rangt formerki.' },
      { text: '-394 kJ', correct: false, explanation: 'Rangt. Þetta er aðeins ΔH fyrir jöfnu (1), en þú þarft að sameina báðar.' }
    ],
    hints: {
      topic: 'Þetta snýst um að nota Hess lögmál til að finna ΔH.',
      strategy: 'Þú þarft að stilla jöfnur þannig að CO sé afurð og annað strikist út.',
      method: 'Nota jöfnu (1) eins og hún er. Snúa við jöfnu (2) svo CO verði afurð.',
      solution: 'Jafna (1): -394 kJ. Öfug jafna (2): +283 kJ. Heildar: -394 + 283 = -111 kJ.'
    }
  },
  {
    id: 6,
    title: 'Orkubraut',
    description: 'Hugsaðu um ΔH sem hæðarmismun. Leiðin skiptir ekki máli, aðeins upphafs- og lokastaða.',
    concept: 'Sama og að ganga upp fjall: sama hæð hvort sem þú ferð beina leið eða hringinn.',
    equation: {
      id: 'eq6',
      reactants: 'A',
      products: 'D',
      deltaH: -50,
      isReversed: false,
      multiplier: 1
    },
    question: 'A → B (ΔH = -30 kJ), B → C (ΔH = +10 kJ), C → D (ΔH = -30 kJ). Hvað er ΔH fyrir A → D?',
    options: [
      { text: '-50 kJ', correct: true, explanation: 'Rétt! -30 + 10 + (-30) = -50 kJ. Leggðu saman öll ΔH.' },
      { text: '-70 kJ', correct: false, explanation: 'Rangt. Gættu að formerkjum: B → C er +10, ekki -10.' },
      { text: '-30 kJ', correct: false, explanation: 'Rangt. Þú þarft að leggja saman öll þrjú ΔH.' },
      { text: '+50 kJ', correct: false, explanation: 'Rangt. Formerkið er rangt.' }
    ],
    hints: {
      topic: 'Þetta snýst um orkubraut og summu ΔH.',
      strategy: 'Leggðu saman öll ΔH á leiðinni. Gættu að formerkjum.',
      method: 'A→B: -30. B→C: +10. C→D: -30. Leggðu saman: -30 + 10 + (-30).',
      solution: '-30 + 10 + (-30) = -30 + 10 - 30 = -50 kJ.'
    }
  }
];
