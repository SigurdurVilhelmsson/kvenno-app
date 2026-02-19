export interface MechanismStep {
  equation: string;
  type: 'fast' | 'slow' | 'equilibrium';
  label?: string;
}

export interface MechanismChallenge {
  id: number;
  title: string;
  description: string;
  overallReaction: string;
  mechanism: MechanismStep[];
  question: string;
  type: 'identify_intermediate' | 'rate_determining' | 'rate_law' | 'identify_catalyst';
  options: { id: string; text: string; correct: boolean; explanation: string }[];
  hint: string;
  conceptExplanation: string;
}

export const challenges: MechanismChallenge[] = [
  {
    id: 1,
    title: 'Millistig (Intermediate)',
    description: 'Millistig myndast í einu skrefi og eyðist í öðru.',
    overallReaction: '2NO₂ + F₂ → 2NO₂F',
    mechanism: [
      { equation: 'NO₂ + F₂ → NO₂F + F', type: 'slow', label: 'Skref 1 (hægt)' },
      { equation: 'NO₂ + F → NO₂F', type: 'fast', label: 'Skref 2 (hratt)' },
    ],
    question: 'Hvert er millistigið í þessum hvarfgangshátt?',
    type: 'identify_intermediate',
    options: [
      { id: 'a', text: 'F (flúoratom)', correct: true, explanation: 'F myndast í skrefi 1 og eyðist í skrefi 2 - klassískt millistig!' },
      { id: 'b', text: 'NO₂', correct: false, explanation: 'NO₂ er hvarfefni sem er til staðar í upphafi.' },
      { id: 'c', text: 'NO₂F', correct: false, explanation: 'NO₂F er lokafurð, ekki millistig.' },
      { id: 'd', text: 'F₂', correct: false, explanation: 'F₂ er hvarfefni sem er til staðar í upphafi.' },
    ],
    hint: 'Millistig birtist á hægri hlið eins skrefs og vinstri hlið annars',
    conceptExplanation: 'Millistig eru efni sem myndast og eyðast innan hvarfgangsháttarins. Þau eru aldrei meðal upphaflegra hvarfefna eða lokaafurða.'
  },
  {
    id: 2,
    title: 'Hraðaákvarðandi skref',
    description: 'Hægasta skrefið ræður heildarhraðanum.',
    overallReaction: 'O₃ + O → 2O₂',
    mechanism: [
      { equation: 'O₃ ⇌ O₂ + O', type: 'equilibrium', label: 'Skref 1 (hratt jafnvægi)' },
      { equation: 'O + O₃ → 2O₂', type: 'slow', label: 'Skref 2 (hægt)' },
    ],
    question: 'Hvert skref er hraðaákvarðandi?',
    type: 'rate_determining',
    options: [
      { id: 'a', text: 'Skref 2 (hægt)', correct: true, explanation: 'Hægasta skrefið er alltaf hraðaákvarðandi - það er "flöskuhálsinn".' },
      { id: 'b', text: 'Skref 1 (hratt jafnvægi)', correct: false, explanation: 'Hraðar skref bíða eftir hægari skrefum.' },
      { id: 'c', text: 'Bæði skref jafn mikilvæg', correct: false, explanation: 'Eitt skref ræður alltaf heildarhraðanum.' },
      { id: 'd', text: 'Hvorugt skref', correct: false, explanation: 'Í hvarfgangshátt er alltaf eitt skref hraðaákvarðandi.' },
    ],
    hint: 'Hugsaðu um umferð: hægasti bíllinn ákvarðar hraða allra',
    conceptExplanation: 'Hraðaákvarðandi skref (rate-determining step) er hægasta frumskrefið. Heildarhraðinn getur aldrei verið hraðari en hægasta skrefið.'
  },
  {
    id: 3,
    title: 'Hraðalögmál úr hvarfgangshátt',
    description: 'Hraðalögmálið ræðst af hraðaákvarðandi skrefi.',
    overallReaction: '2NO + Br₂ → 2NOBr',
    mechanism: [
      { equation: 'NO + Br₂ ⇌ NOBr₂', type: 'fast', label: 'Skref 1 (hratt jafnvægi)' },
      { equation: 'NOBr₂ + NO → 2NOBr', type: 'slow', label: 'Skref 2 (hægt)' },
    ],
    question: 'Hvert er hraðalögmálið fyrir þetta hvörf?',
    type: 'rate_law',
    options: [
      { id: 'a', text: 'Rate = k[NO]²[Br₂]', correct: true, explanation: 'Skref 2 er hægt, en NOBr₂ er millistig. Setjum jafnvægi frá skrefi 1 inn → [NOBr₂] = K[NO][Br₂], svo Rate = k\'[NO][Br₂][NO] = k[NO]²[Br₂].' },
      { id: 'b', text: 'Rate = k[NO][Br₂]', correct: false, explanation: 'Þetta vantar annan NO þátt frá skrefi 2.' },
      { id: 'c', text: 'Rate = k[NOBr₂][NO]', correct: false, explanation: 'Rétt frá skrefi 2, en NOBr₂ er millistig - ekki má vera í hraðalögmáli.' },
      { id: 'd', text: 'Rate = k[Br₂]', correct: false, explanation: 'Þetta tekur ekki tillit til NO styrks.' },
    ],
    hint: 'Millistig má ekki vera í hraðalögmáli - notaðu jafnvægið til að losna við það',
    conceptExplanation: 'Þegar millistig er í hraðaákvarðandi skrefi, notum við jafnvægislíkinguna til að skipta því út fyrir upprunalegu hvarfefnin.'
  },
  {
    id: 4,
    title: 'Hvatar í hvarfgangshátt',
    description: 'Hvatar lækka virkjunarorku en breytast ekki sjálfir.',
    overallReaction: 'H₂O₂ → H₂O + ½O₂ (hvataður af I⁻)',
    mechanism: [
      { equation: 'H₂O₂ + I⁻ → H₂O + IO⁻', type: 'slow', label: 'Skref 1' },
      { equation: 'H₂O₂ + IO⁻ → H₂O + O₂ + I⁻', type: 'fast', label: 'Skref 2' },
    ],
    question: 'Hvaða efni er hvatinn í þessu hvarfi?',
    type: 'identify_catalyst',
    options: [
      { id: 'a', text: 'I⁻ (joðíð)', correct: true, explanation: 'I⁻ eyðist í skrefi 1 og myndast aftur í skrefi 2 - klassískt hvataeinkenni!' },
      { id: 'b', text: 'IO⁻', correct: false, explanation: 'IO⁻ er millistig (myndast og eyðist), ekki hvati.' },
      { id: 'c', text: 'H₂O₂', correct: false, explanation: 'H₂O₂ er hvarfefni sem eyðist.' },
      { id: 'd', text: 'O₂', correct: false, explanation: 'O₂ er afurð hvarfsins.' },
    ],
    hint: 'Hvati birtist bæði sem hvarfefni og afurð í heildarferlinu',
    conceptExplanation: 'Hvati tekur þátt í hvörfum en myndast aftur. Í hvarfgangshátt sést þetta þar sem hvatinn eyðist í einu skrefi og myndast í öðru.'
  },
  {
    id: 5,
    title: 'Samræmi við tilraun',
    description: 'Hvarfgangsháttur verður að passa við mælt hraðalögmál.',
    overallReaction: 'Cl₂ + CHCl₃ → CCl₄ + HCl',
    mechanism: [
      { equation: 'Cl₂ → 2Cl', type: 'fast', label: 'Skref 1 (hratt jafnvægi)' },
      { equation: 'Cl + CHCl₃ → CCl₃ + HCl', type: 'slow', label: 'Skref 2 (hægt)' },
      { equation: 'CCl₃ + Cl → CCl₄', type: 'fast', label: 'Skref 3 (hratt)' },
    ],
    question: 'Ef þessi hvarfgangsháttur er réttur, hvert ætti hraðalögmálið að vera?',
    type: 'rate_law',
    options: [
      { id: 'a', text: 'Rate = k[CHCl₃][Cl₂]^½', correct: true, explanation: 'Skref 2 er hægt: Rate = k\'[Cl][CHCl₃]. Frá jafnvægi skrefs 1: [Cl] = K[Cl₂]^½. Þannig: Rate = k[CHCl₃][Cl₂]^½.' },
      { id: 'b', text: 'Rate = k[Cl₂][CHCl₃]', correct: false, explanation: 'Þetta væri rétt ef skref 2 notaði Cl₂ beint.' },
      { id: 'c', text: 'Rate = k[Cl][CHCl₃]', correct: false, explanation: 'Cl er millistig - ekki má vera í lokahraðalögmáli.' },
      { id: 'd', text: 'Rate = k[Cl₂]', correct: false, explanation: 'CHCl₃ tekur þátt í hraðaákvarðandi skrefi.' },
    ],
    hint: 'Jafnvægi Cl₂ ⇌ 2Cl gefur [Cl] = √(K[Cl₂])',
    conceptExplanation: 'Þegar millistig (Cl) er í hraðaákvarðandi skrefi og kemur frá jafnvægi, þá kemur brotveldi (½) í hraðalögmálið.'
  },
  {
    id: 6,
    title: 'Greina hvarfgangshátt',
    description: 'Samræmdu hvarfgangshátt og hraðalögmál.',
    overallReaction: '2N₂O₅ → 4NO₂ + O₂',
    mechanism: [
      { equation: 'N₂O₅ ⇌ NO₂ + NO₃', type: 'fast', label: 'Skref 1 (hratt jafnvægi)' },
      { equation: 'NO₂ + NO₃ → NO₂ + O₂ + NO', type: 'slow', label: 'Skref 2 (hægt)' },
      { equation: 'NO + NO₃ → 2NO₂', type: 'fast', label: 'Skref 3 (hratt)' },
    ],
    question: 'Hvaða millistig eru í þessum hvarfgangshátt?',
    type: 'identify_intermediate',
    options: [
      { id: 'a', text: 'NO₃ og NO', correct: true, explanation: 'NO₃ myndast í skrefi 1 og eyðist í skrefum 2 og 3. NO myndast í skrefi 2 og eyðist í skrefi 3.' },
      { id: 'b', text: 'Aðeins NO₃', correct: false, explanation: 'NO myndast líka tímabundið innan hvarfgangsháttarins.' },
      { id: 'c', text: 'Aðeins NO₂', correct: false, explanation: 'NO₂ er lokafurð, ekki millistig.' },
      { id: 'd', text: 'Aðeins NO', correct: false, explanation: 'NO₃ er einnig millistig.' },
    ],
    hint: 'Leitaðu að efnum sem myndast og eyðast innan hvarfgangsháttarins',
    conceptExplanation: 'Í flóknum hvarfgangsháttum geta verið mörg millistig. Þau eru öll efni sem myndast og eyðast innan ferlisins.'
  },
];

export const MAX_SCORE = 20 * 6; // 20 points per challenge, 6 challenges
