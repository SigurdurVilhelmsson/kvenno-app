import { useState, useMemo } from 'react';

import { FeedbackPanel } from '@shared/components';
import type { TieredHints, DetailedFeedback } from '@shared/types';
import { shuffleArray } from '@shared/utils';

// Rule IDs for categorizing questions
type RuleId = 'ionic-simple' | 'ionic-variable' | 'ionic-polyatomic' | 'molecular';

// Misconceptions for each rule type
const MISCONCEPTIONS: Record<RuleId, string> = {
  'ionic-simple':
    'Algeng villa er að rugla saman jónefnum og sameindum. Jónefni eru málmur + málmleysingi og nota ekki grísk forskeyti.',
  'ionic-variable':
    'Rómverska talan sýnir hleðslu málmsins, ekki fjölda atóma. (II) þýðir +2 hleðslu, ekki 2 atóm.',
  'ionic-polyatomic':
    'Fjölatóma jónir hafa föst nöfn sem þarf að læra. Súlfat er SO₄²⁻, ekki SO₃²⁻ (það er súlfít).',
  molecular:
    'Í sameindum notum við grísk forskeyti (mono, dí, trí...) en fyrra frumefnið fær aldrei "mono-" forskeytið.',
};

// Related concepts for each rule type
const RELATED_CONCEPTS: Record<RuleId, string[]> = {
  'ionic-simple': ['Jónabindingar', 'Málmar og málmleysingjar', 'Endingar (-íð)'],
  'ionic-variable': ['Breytilegar hleðslur', 'Rómverskar tölur', 'Þróunarmálmar'],
  'ionic-polyatomic': ['Fjölatóma jónir', 'Hleðslujöfnun', 'Sérstök nöfn'],
  molecular: ['Samgild binding', 'Grísk forskeyti', 'Málmleysingjar'],
};

interface Level1Props {
  t: (key: string, fallback?: string) => string;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface NamingRule {
  id: string;
  title: string;
  description: string;
  rules: string[];
  examples: { formula: string; name: string; explanation: string }[];
  color: string;
}

const namingRules: NamingRule[] = [
  {
    id: 'ionic-simple',
    title: 'Einföld jónefni',
    description: 'Málmur + málmleysingi (hópar 1, 2, 13)',
    rules: [
      'Málmurinn kemur fyrst og heldur nafni sínu',
      'Málmleysinginn fær endinguna -íð',
      'Dæmi: klór → klóríð, súrefni → oxíð, brennisteinn → súlfíð',
    ],
    examples: [
      { formula: 'NaCl', name: 'Natríumklóríð', explanation: 'Natríum (málmur) + klór → klóríð' },
      { formula: 'MgO', name: 'Magnesíumoxíð', explanation: 'Magnesíum + súrefni → oxíð' },
      { formula: 'CaF₂', name: 'Kalsíumflúoríð', explanation: 'Kalsíum + flúor → flúoríð' },
      { formula: 'Al₂O₃', name: 'Áloxíð', explanation: 'Ál + súrefni → oxíð' },
    ],
    color: 'blue',
  },
  {
    id: 'ionic-variable',
    title: 'Málmar með breytilega hleðslu',
    description: 'Járn, kopar, tin, blý og fleiri',
    rules: [
      'Notaðu rómverskar tölur til að sýna hleðslu málmsins',
      'Talan kemur í sviga á eftir nafni málmsins',
      'Dæmi: Fe²⁺ = járn(II), Fe³⁺ = járn(III), Cu⁺ = kopar(I)',
    ],
    examples: [
      { formula: 'FeCl₂', name: 'Járn(II)klóríð', explanation: 'Fe²⁺ + 2Cl⁻ → járn(II) + klóríð' },
      {
        formula: 'FeCl₃',
        name: 'Járn(III)klóríð',
        explanation: 'Fe³⁺ + 3Cl⁻ → járn(III) + klóríð',
      },
      { formula: 'CuO', name: 'Kopar(II)oxíð', explanation: 'Cu²⁺ + O²⁻ → kopar(II) + oxíð' },
      { formula: 'Cu₂O', name: 'Kopar(I)oxíð', explanation: '2Cu⁺ + O²⁻ → kopar(I) + oxíð' },
    ],
    color: 'purple',
  },
  {
    id: 'ionic-polyatomic',
    title: 'Fjölatóma jónir',
    description: 'Samsettar jónir með sérstök nöfn',
    rules: [
      'Sumar jónir eru samsettar úr mörgum atómum',
      'Þær hafa föst nöfn sem þarf að læra',
      'Algengastar: súlfat (SO₄²⁻), nítrat (NO₃⁻), karbónat (CO₃²⁻), hýdroxíð (OH⁻)',
    ],
    examples: [
      { formula: 'Na₂SO₄', name: 'Natríumsúlfat', explanation: 'Natríum + súlfat (SO₄²⁻)' },
      { formula: 'KNO₃', name: 'Kalíumnítrat', explanation: 'Kalíum + nítrat (NO₃⁻)' },
      { formula: 'CaCO₃', name: 'Kalsíumkarbónat', explanation: 'Kalsíum + karbónat (CO₃²⁻)' },
      { formula: 'NaOH', name: 'Natríumhýdroxíð', explanation: 'Natríum + hýdroxíð (OH⁻)' },
    ],
    color: 'green',
  },
  {
    id: 'molecular',
    title: 'Sameindir (málmleysingjar)',
    description: 'Tveir eða fleiri málmleysingjar',
    rules: [
      'Notaðu grískar forskeytir til að sýna fjölda atóma',
      'Forskeytir: mono (1), dí (2), trí (3), tetra (4), penta (5), hexa (6)',
      'Fyrra frumefnið fær ekki "mono-" en það síðara fær alltaf forsetið',
      'Síðara frumefnið fær endinguna -íð',
    ],
    examples: [
      { formula: 'CO₂', name: 'Koldíoxíð', explanation: 'C (eitt) + O₂ (tvö) = kol + dí + oxíð' },
      {
        formula: 'N₂O₄',
        name: 'Díniturtetroxíð',
        explanation: 'N₂ (tvö) + O₄ (fjögur) = dí + nitur + tetra + oxíð',
      },
      {
        formula: 'SF₆',
        name: 'Brennisteinshexaflúoríð',
        explanation: 'S (eitt) + F₆ (sex) = brennisteinn + hexa + flúoríð',
      },
      {
        formula: 'PCl₅',
        name: 'Fosforpentaklóríð',
        explanation: 'P (eitt) + Cl₅ (fimm) = fosfor + penta + klóríð',
      },
    ],
    color: 'orange',
  },
];

interface QuizQuestion {
  id: number;
  question: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  hints: TieredHints;
  ruleId: RuleId;
}

// Classification warm-up questions
interface WarmupQuestion {
  symbol: string;
  name: string;
  isMetal: boolean;
  hint: string;
}

const warmupQuestions: WarmupQuestion[] = [
  {
    symbol: 'Na',
    name: 'Natríum',
    isMetal: true,
    hint: 'Í hópi 1 (alkalímálmar) - alltaf málmur!',
  },
  {
    symbol: 'Cl',
    name: 'Klór',
    isMetal: false,
    hint: 'Í hópi 17 (halógein) - alltaf málmleysingi!',
  },
  {
    symbol: 'Mg',
    name: 'Magnesíum',
    isMetal: true,
    hint: 'Í hópi 2 (jarðalkalímálmar) - alltaf málmur!',
  },
  { symbol: 'O', name: 'Súrefni', isMetal: false, hint: 'Í hópi 16 - málmleysingi!' },
  { symbol: 'Fe', name: 'Járn', isMetal: true, hint: 'Þróunarmálmur - einn þekktur málmanna!' },
  { symbol: 'S', name: 'Brennisteinn', isMetal: false, hint: 'Í hópi 16 - málmleysingi!' },
  { symbol: 'Ca', name: 'Kalsíum', isMetal: true, hint: 'Í hópi 2 - jarðalkalímálmur!' },
  { symbol: 'N', name: 'Köfnunarefni', isMetal: false, hint: 'Í hópi 15 - málmleysingi!' },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Hvaða ending fær klór í jónefnum?',
    options: ['-íð (klóríð)', '-at (klórat)', '-ít (klórít)', '-an (klóran)'],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um endingar málmleysinga í jónefnum.',
      strategy: 'Einatóma málmleysingjar fá alltaf sömu endinguna í jónefnum.',
      method: 'Endingin er -íð. Breyttu nafni frumefnisins: klór → klór + íð.',
      solution: 'Klór → klóríð. Einatóma málmleysingjar fá endinguna -íð.',
    },
    ruleId: 'ionic-simple',
  },
  {
    id: 2,
    question: 'Hvað heitir MgO?',
    formula: 'MgO',
    options: ['Magnesíumoxíð', 'Magnesíumoxat', 'Dímagnesíumoxíð', 'Magnesíum(II)oxíð'],
    correctIndex: 0,
    hints: {
      topic: 'Þetta er jónefni - málmur og málmleysingi.',
      strategy: 'Mg er í hópi 2 og hefur alltaf sömu hleðslu. Þarf ekki rómverskar tölur.',
      method: 'Nafn málmsins + nafn málmleysingsins með endingu -íð. Súrefni → oxíð.',
      solution: 'Magnesíum + oxíð = Magnesíumoxíð. Ekki þarf grísk forskeyti eða rómverskar tölur.',
    },
    ruleId: 'ionic-simple',
  },
  {
    id: 3,
    question: 'Af hverju heitir FeCl₂ "Járn(II)klóríð" en ekki bara "Járnklóríð"?',
    formula: 'FeCl₂',
    options: [
      'Járn getur haft mismunandi hleðslu',
      'Það eru tvö klór atóm',
      'Járn er í hópi 2',
      'Klór er tvígilt',
    ],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um málma með breytilega hleðslu.',
      strategy:
        'Sumir málmar geta haft mismunandi jónhleðslu. Við þurfum að tilgreina hvaða hleðslu.',
      method: 'Rómverska talan sýnir hleðslu málmsins: (II) þýðir +2, (III) þýðir +3.',
      solution: 'Járn getur verið Fe²⁺ eða Fe³⁺. Talan (II) segir okkur að þetta er Fe²⁺.',
    },
    ruleId: 'ionic-variable',
  },
  {
    id: 4,
    question: 'Hvað heitir CuO?',
    formula: 'CuO',
    options: ['Kopar(II)oxíð', 'Kopar(I)oxíð', 'Koparoxíð', 'Díkoparoxíð'],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um málma með breytilega hleðslu.',
      strategy: 'Kopar getur verið Cu⁺ eða Cu²⁺. Þú þarft að finna hleðsluna.',
      method: 'Súrefni er alltaf O²⁻. Heildin þarf að vera hlutlaus. CuO → Cu + O²⁻ = 0.',
      solution: 'O er -2, svo Cu verður að vera +2. Svarið er Kopar(II)oxíð.',
    },
    ruleId: 'ionic-variable',
  },
  {
    id: 5,
    question: 'Hver er formúlan fyrir natríumsúlfat?',
    options: ['Na₂SO₄', 'NaSO₄', 'Na₂SO₃', 'NaS'],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um fjölatóma jónir.',
      strategy: 'Súlfat er fjölatóma jón með sína eigin formúlu og hleðslu.',
      method: 'Súlfat = SO₄²⁻. Natríum = Na⁺. Jafnaðu hleðslurnar.',
      solution: 'Súlfat er SO₄²⁻. Natríum er Na⁺. Þarf 2 Na⁺ til að jafna -2 hleðsluna: Na₂SO₄.',
    },
    ruleId: 'ionic-polyatomic',
  },
  {
    id: 6,
    question: 'Hvað þýðir "dí-" í nafni sameindar?',
    options: ['Tvö atóm', 'Eitt atóm', 'Þrjú atóm', 'Fjögur atóm'],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um grísk forskeyti í sameindum.',
      strategy: 'Grísk forskeyti segja okkur fjölda atóma.',
      method: 'Listi: mono=1, dí=2, trí=3, tetra=4, penta=5, hexa=6.',
      solution: 'Dí þýðir 2. Dæmi: koldíoxíð hefur 2 súrefnisatóm.',
    },
    ruleId: 'molecular',
  },
  {
    id: 7,
    question: 'Hvað heitir N₂O₅?',
    formula: 'N₂O₅',
    options: ['Díniturpentoxíð', 'Niturpentoxíð', 'Dínituroxíð', 'Niturdíoxíð'],
    correctIndex: 0,
    hints: {
      topic: 'Þetta er sameind - tveir málmleysingjar.',
      strategy: 'Sameindir nota grísk forskeyti til að sýna fjölda atóma.',
      method: 'N₂ = 2 nitur → "dí" forskeyti. O₅ = 5 súrefni → "penta" forskeyti + oxíð ending.',
      solution: 'N₂ = dínitur, O₅ = pentoxíð. Saman: Díniturpentoxíð.',
    },
    ruleId: 'molecular',
  },
  {
    id: 8,
    question: 'Af hverju heitir CO₂ "koldíoxíð" en ekki "monokoldíoxíð"?',
    formula: 'CO₂',
    options: [
      'Fyrra frumefnið fær ekki "mono-"',
      'Kol er undantekning',
      'Það er aðeins eitt kol',
      'Dí þýðir líka eitt',
    ],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um notkun grísku forskeytanna í sameindum.',
      strategy: 'Það er sérstök regla um hvenær við notum "mono-" forskeytið.',
      method:
        'Við sleppum "mono-" fyrir FYRRA frumefnið, en síðara frumefnið fær alltaf forskeyti.',
      solution:
        'Reglan: Fyrra frumefnið fær ekki "mono-". Þess vegna koldíoxíð en ekki monokoldíoxíð.',
    },
    ruleId: 'molecular',
  },
  {
    id: 9,
    question: 'Hvernig þekkir þú hvort efnasamband er jónefni eða sameind?',
    options: [
      'Jónefni: málmur + málmleysingi. Sameind: tveir málmleysingjar.',
      'Jónefni eru alltaf föst, sameindir alltaf gas',
      'Jónefni hafa fleiri atóm',
      'Það er engin leið að sjá það',
    ],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um greinarmun á jónefnum og sameindum.',
      strategy: 'Líttu á hvaða frumefni eru í efnasambandinu - málmar eða málmleysingjar.',
      method:
        'Málmar gefa rafeindir, málmleysingjar taka. Ef báðir eru málmleysingjar, deila þeir.',
      solution:
        'Jónefni: málmur + málmleysingi (jónabindingar). Sameind: tveir málmleysingjar (samgild binding).',
    },
    ruleId: 'ionic-simple',
  },
  {
    id: 10,
    question: 'Hvað heitir Ca(OH)₂?',
    formula: 'Ca(OH)₂',
    options: ['Kalsíumhýdroxíð', 'Kalsíumdíhýdroxíð', 'Kalsíum(II)hýdroxíð', 'Díkalsíumhýdroxíð'],
    correctIndex: 0,
    hints: {
      topic: 'Þetta snýst um fjölatóma jónir í jónefnum.',
      strategy: 'OH⁻ er fjölatóma jón með sérstakt nafn. Jónefni nota ekki grísk forskeyti.',
      method: 'Fjölatóma jónin: OH⁻ = hýdroxíð. Nafnið: málmur + nafn jónar.',
      solution:
        'OH⁻ er hýdroxíð jónin. Nafnið er kalsíumhýdroxíð. Ekki grísk forskeyti í jónefnum.',
    },
    ruleId: 'ionic-polyatomic',
  },
];

export function Level1({ t, onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [phase, setPhase] = useState<'learn' | 'warmup' | 'quiz'>('learn');
  const [currentRule, setCurrentRule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintsUsedTier, setHintsUsedTier] = useState(0);

  // Warmup state
  const [currentWarmup, setCurrentWarmup] = useState(0);
  const [warmupAnswer, setWarmupAnswer] = useState<boolean | null>(null);
  const [warmupFeedback, setWarmupFeedback] = useState<string | null>(null);
  const [warmupCorrect, setWarmupCorrect] = useState(0);

  const rule = namingRules[currentRule];
  const question = quizQuestions[currentQuestion];
  const warmupQ = warmupQuestions[currentWarmup];

  // Shuffle options for current question - memoize to keep stable during question
  const shuffledOptions = useMemo(() => {
    const indices = question.options.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    return {
      options: shuffledIndices.map((i) => question.options[i]),
      correctShuffledIndex: shuffledIndices.indexOf(question.correctIndex),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-shuffle when question index changes
  }, [currentQuestion, question.options, question.correctIndex]);

  const handleNextRule = () => {
    if (currentRule < namingRules.length - 1) {
      setCurrentRule((prev) => prev + 1);
    } else {
      setPhase('warmup'); // Go to warmup before quiz
    }
  };

  const handlePrevRule = () => {
    if (currentRule > 0) {
      setCurrentRule((prev) => prev - 1);
    }
  };

  // Warmup handlers
  const handleWarmupAnswer = (isMetal: boolean) => {
    if (warmupFeedback !== null) return;

    setWarmupAnswer(isMetal);
    const correct = isMetal === warmupQ.isMetal;

    if (correct) {
      setWarmupFeedback(`Rétt! ${warmupQ.hint}`);
      setWarmupCorrect((prev) => prev + 1);
    } else {
      setWarmupFeedback(
        `Ekki rétt. ${warmupQ.name} er ${warmupQ.isMetal ? 'málmur' : 'málmleysingi'}. ${warmupQ.hint}`
      );
    }
  };

  const handleNextWarmup = () => {
    if (currentWarmup < warmupQuestions.length - 1) {
      setCurrentWarmup((prev) => prev + 1);
      setWarmupAnswer(null);
      setWarmupFeedback(null);
    } else {
      setPhase('quiz');
    }
  };

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);

    if (index === shuffledOptions.correctShuffledIndex) {
      const points = Math.round(10 * hintMultiplier);
      setScore((prev) => prev + points);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setHintMultiplier(1.0);
      setHintsUsedTier(0);
    } else {
      onComplete(score, quizQuestions.length * 10, hintsUsedTier);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: {
        bg: 'bg-blue-500',
        border: 'border-blue-400',
        text: 'text-blue-800',
        light: 'bg-blue-50',
      },
      purple: {
        bg: 'bg-purple-500',
        border: 'border-purple-400',
        text: 'text-purple-800',
        light: 'bg-purple-50',
      },
      green: {
        bg: 'bg-green-500',
        border: 'border-green-400',
        text: 'text-green-800',
        light: 'bg-green-50',
      },
      orange: {
        bg: 'bg-orange-500',
        border: 'border-orange-400',
        text: 'text-orange-800',
        light: 'bg-orange-50',
      },
    };
    return colors[color] || colors.blue;
  };

  if (phase === 'learn') {
    const colors = getColorClasses(rule.color);

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 flex items-center gap-2"
            >
              <span>←</span> {t('common.back', 'Til baka')}
            </button>
            <div className="text-sm text-warm-500">
              {t('level1.ui.ruleNOfM', 'Regla {n} af {m}')
                .replace('{n}', String(currentRule + 1))
                .replace('{m}', String(namingRules.length))}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-indigo-600">
            {t('level1.ui.rulesTitle', 'Reglur um nafnagift')}
          </h1>
          <p className="text-center text-warm-600 mb-6">
            {t('level1.ui.rulesSubtitle', 'Lærðu hvernig efnasambönd eru nefnd')}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {namingRules.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => setCurrentRule(idx)}
                className={`w-4 h-4 rounded-full transition-all ${
                  idx === currentRule
                    ? `${getColorClasses(r.color).bg} scale-125`
                    : idx < currentRule
                      ? 'bg-green-500'
                      : 'bg-warm-300 hover:bg-warm-400'
                }`}
                aria-label={`Regla ${idx + 1}: ${r.title}`}
              />
            ))}
          </div>

          {/* Rule card */}
          <div className={`${colors.light} border-2 ${colors.border} rounded-2xl p-6 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`${colors.bg} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold`}
              >
                {currentRule + 1}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${colors.text}`}>{rule.title}</h2>
                <p className="text-warm-600 text-sm">{rule.description}</p>
              </div>
            </div>

            {/* Rules list */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-warm-700 mb-2">
                {t('level1.ui.rulesLabel', 'Reglur:')}
              </h3>
              <ul className="space-y-2">
                {rule.rules.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-warm-700">
                    <span className={`${colors.text} font-bold mt-0.5`}>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Examples */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-semibold text-warm-700 mb-3">
                {t('level1.ui.examplesLabel', 'Dæmi:')}
              </h3>
              <div className="grid gap-3">
                {rule.examples.map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-warm-50 rounded-lg">
                    <div className="text-2xl font-mono font-bold text-warm-800 min-w-[80px]">
                      {ex.formula}
                    </div>
                    <div className="text-2xl text-warm-400">→</div>
                    <div className="flex-1">
                      <div className={`font-bold ${colors.text}`}>{ex.name}</div>
                      <div className="text-sm text-warm-600">{ex.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevRule}
              disabled={currentRule === 0}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                currentRule === 0
                  ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                  : 'bg-warm-500 hover:bg-warm-600 text-white'
              }`}
            >
              ← {t('level1.ui.prevRule', 'Fyrri regla')}
            </button>
            <button
              onClick={handleNextRule}
              className={`flex-1 ${colors.bg} hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all`}
            >
              {currentRule === namingRules.length - 1
                ? t('level1.ui.startQuiz', 'Hefja próf') + ' →'
                : t('level1.ui.nextRule', 'Næsta regla') + ' →'}
            </button>
          </div>

          {/* Quick reference */}
          <div className="mt-6 bg-warm-50 rounded-xl p-4">
            <h3 className="font-semibold text-warm-700 mb-2">
              {t('level1.ui.ruleOverview', 'Yfirlit yfir reglur:')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {namingRules.map((r, idx) => (
                <div
                  key={r.id}
                  className={`p-2 rounded-lg ${idx === currentRule ? getColorClasses(r.color).light : 'bg-white'} border`}
                >
                  <div className={`font-bold ${getColorClasses(r.color).text} text-xs`}>
                    {r.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Warmup phase - metal/nonmetal classification
  if (phase === 'warmup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setPhase('learn')}
              className="text-warm-500 hover:text-warm-700 flex items-center gap-2"
            >
              <span>←</span> {t('level1.ui.backToRules', 'Til baka í reglur')}
            </button>
            <div className="text-sm text-warm-500">
              {currentWarmup + 1} af {warmupQuestions.length}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔬</div>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">
              {t('level1.ui.warmupTitle', 'Upphitun: Málmur eða málmleysingi?')}
            </h1>
            <p className="text-warm-600">
              {t('level1.ui.warmupSubtitle', 'Þetta er mikilvægt til að velja rétta nafnareglu!')}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentWarmup + 1) / warmupQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-6 text-center">
            <div className="text-6xl font-mono font-bold text-warm-800 mb-2">{warmupQ.symbol}</div>
            <div className="text-xl text-warm-600">{warmupQ.name}</div>
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleWarmupAnswer(true)}
              disabled={warmupFeedback !== null}
              className={`p-6 rounded-xl border-3 transition-all ${
                warmupFeedback !== null && warmupAnswer === true
                  ? warmupQ.isMetal
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-red-100 border-red-500 text-red-800'
                  : warmupFeedback !== null && warmupQ.isMetal
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-blue-50 border-blue-300 hover:border-blue-500 hover:bg-blue-100'
              }`}
            >
              <div className="text-3xl mb-2" aria-hidden="true">
                ⚙️
              </div>
              <div className="font-bold text-lg">{t('level1.ui.metal', 'Málmur')}</div>
              <div className="text-xs text-warm-500">
                {t('level1.ui.metalHint', '(gefur rafeindir)')}
              </div>
            </button>
            <button
              onClick={() => handleWarmupAnswer(false)}
              disabled={warmupFeedback !== null}
              className={`p-6 rounded-xl border-3 transition-all ${
                warmupFeedback !== null && warmupAnswer === false
                  ? !warmupQ.isMetal
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-red-100 border-red-500 text-red-800'
                  : warmupFeedback !== null && !warmupQ.isMetal
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-orange-50 border-orange-300 hover:border-orange-500 hover:bg-orange-100'
              }`}
            >
              <div className="text-3xl mb-2" aria-hidden="true">
                💨
              </div>
              <div className="font-bold text-lg">{t('level1.ui.nonmetal', 'Málmleysingi')}</div>
              <div className="text-xs text-warm-500">
                {t('level1.ui.nonmetalHint', '(tekur rafeindir)')}
              </div>
            </button>
          </div>

          {/* Feedback */}
          {warmupFeedback && (
            <div
              className={`p-4 rounded-xl mb-4 ${
                warmupAnswer === warmupQ.isMetal
                  ? 'bg-green-100 border-2 border-green-400 text-green-800'
                  : 'bg-amber-100 border-2 border-amber-400 text-amber-800'
              }`}
            >
              {warmupFeedback}
            </div>
          )}

          {/* Next button */}
          {warmupFeedback && (
            <button
              onClick={handleNextWarmup}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {currentWarmup < warmupQuestions.length - 1
                ? t('level1.ui.nextElement', 'Næsta frumefni') + ' →'
                : t('level1.ui.startQuiz', 'Hefja próf') + ' →'}
            </button>
          )}

          {/* Score summary */}
          <div className="mt-6 text-center text-sm text-warm-500">
            {t('level1.ui.correctCount', 'Rétt:')} {warmupCorrect} /{' '}
            {currentWarmup + (warmupFeedback ? 1 : 0)}
          </div>

          {/* Key reminder */}
          <div className="mt-4 bg-warm-50 rounded-xl p-4">
            <h3 className="font-semibold text-warm-700 mb-2 text-sm">
              {t('level1.ui.remember', 'Mundu:')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <span className="font-bold text-blue-700">
                  {t('level1.ui.metalsGroups', 'Málmar:')}
                </span>{' '}
                hópar 1, 2, 3-12
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <span className="font-bold text-orange-700">
                  {t('level1.ui.nonmetalsGroups', 'Málmleysingjar:')}
                </span>{' '}
                hópar 15-18
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz phase
  const ruleForQuestion = namingRules.find((r) => r.id === question.ruleId);
  const questionColors = ruleForQuestion
    ? getColorClasses(ruleForQuestion.color)
    : getColorClasses('blue');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-warm-500 hover:text-warm-700">
            ← {t('common.back', 'Til baka')}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-warm-500">
              {t('level1.ui.questionNOfM', 'Spurning {n} af {m}')
                .replace('{n}', String(currentQuestion + 1))
                .replace('{m}', String(quizQuestions.length))}
            </div>
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
              {t('common.score', 'Stig')}: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-indigo-600">
          {t('level1.ui.quizTitle', 'Próf: Nafnareglur')}
        </h1>

        {/* Question */}
        <div
          className={`${questionColors.light} border-2 ${questionColors.border} rounded-xl p-6 mb-6`}
        >
          <div className="text-sm font-medium text-warm-500 mb-2">{ruleForQuestion?.title}</div>
          <div className="text-xl font-bold text-warm-800 mb-4">{question.question}</div>
          {question.formula && (
            <div className="text-3xl font-mono font-bold text-center text-warm-800 bg-white rounded-lg py-4">
              {question.formula}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid gap-3 mb-6">
          {shuffledOptions.options.map((option, idx) => {
            let buttonClass =
              'bg-white border-2 border-warm-200 hover:border-indigo-400 hover:bg-indigo-50';

            if (showFeedback) {
              if (idx === shuffledOptions.correctShuffledIndex) {
                buttonClass = 'bg-green-100 border-2 border-green-500 text-green-800';
              } else if (idx === selectedAnswer && idx !== shuffledOptions.correctShuffledIndex) {
                buttonClass = 'bg-red-100 border-2 border-red-500 text-red-800';
              } else {
                buttonClass = 'bg-warm-100 border-2 border-warm-200 text-warm-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`p-4 rounded-xl font-medium text-left transition-all ${buttonClass}`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mb-6">
            <FeedbackPanel
              feedback={(() => {
                const correct = selectedAnswer === shuffledOptions.correctShuffledIndex;
                const { ruleId } = question;
                const feedback: DetailedFeedback = {
                  isCorrect: correct,
                  explanation: question.hints.solution,
                  misconception: correct ? undefined : MISCONCEPTIONS[ruleId],
                  relatedConcepts: RELATED_CONCEPTS[ruleId],
                  nextSteps: correct
                    ? 'Þú ert að ná góðum tökum á þessari reglu. Haltu áfram!'
                    : 'Lestu útskýringuna vandlega og reyndu að muna regluna fyrir næstu spurningu.',
                };
                return feedback;
              })()}
              config={{
                showExplanation: true,
                showMisconceptions: selectedAnswer !== shuffledOptions.correctShuffledIndex,
                showRelatedConcepts: true,
                showNextSteps: true,
              }}
            />
          </div>
        )}

        {/* Next button */}
        {showFeedback && (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            {currentQuestion < quizQuestions.length - 1
              ? t('level1.ui.nextQuestion', 'Næsta spurning') + ' →'
              : t('level1.ui.finishLevel', 'Ljúka stigi') + ' →'}
          </button>
        )}

        {/* Progress bar */}
        <div className="mt-6 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        {/* Quick reference */}
        <div className="mt-6 bg-warm-50 rounded-xl p-4">
          <h3 className="font-semibold text-warm-700 mb-2 text-sm">
            {t('level1.ui.cheatSheet', 'Minnisblað:')}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <span className="font-bold text-blue-700">{t('level1.ui.refIonic', 'Jónefni:')}</span>{' '}
              málmur + -íð
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <span className="font-bold text-purple-700">
                {t('level1.ui.refVariable', 'Breytileg:')}
              </span>{' '}
              rómverskar tölur
            </div>
            <div className="bg-green-50 p-2 rounded">
              <span className="font-bold text-green-700">
                {t('level1.ui.refPolyatomic', 'Fjölatóma:')}
              </span>{' '}
              sérstök nöfn
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <span className="font-bold text-orange-700">
                {t('level1.ui.refMolecular', 'Sameindir:')}
              </span>{' '}
              grísk forskeyti
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
