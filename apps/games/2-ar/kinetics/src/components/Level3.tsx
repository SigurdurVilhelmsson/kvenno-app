import { useState } from 'react';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface MechanismStep {
  equation: string;
  type: 'fast' | 'slow' | 'equilibrium';
  label?: string;
}

interface Challenge {
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

const challenges: Challenge[] = [
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

const MAX_SCORE = 20 * 6; // 20 points per challenge, 6 challenges

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  const handleAnswerSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const selectedOption = challenge.options.find(opt => opt.id === selectedAnswer);
    if (selectedOption?.correct) {
      setScore(prev => prev + (showHint ? 10 : 20));
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      onComplete(score, MAX_SCORE, totalHintsUsed);
    }
  };

  const getOptionStyle = (option: { id: string; correct: boolean }) => {
    if (!showResult) {
      return selectedAnswer === option.id
        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50';
    }

    if (option.correct) {
      return 'border-green-500 bg-green-50';
    }

    if (selectedAnswer === option.id && !option.correct) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-200 bg-gray-50 opacity-50';
  };

  const getStepStyle = (type: MechanismStep['type']) => {
    switch (type) {
      case 'slow':
        return 'border-red-400 bg-red-50';
      case 'fast':
        return 'border-green-400 bg-green-50';
      case 'equilibrium':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Stig 3 / Þraut {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-purple-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">
            {challenge.title}
          </h2>
          <p className="text-gray-600 mb-4">{challenge.description}</p>

          {/* Overall reaction */}
          <div className="bg-purple-50 p-4 rounded-xl mb-6">
            <div className="text-sm text-purple-600 mb-1">Heildarhvarf:</div>
            <div className="text-center font-mono text-xl font-bold">
              {challenge.overallReaction}
            </div>
          </div>

          {/* Mechanism steps */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-3">Hvarfgangsháttur:</h3>
            <div className="space-y-3">
              {challenge.mechanism.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${getStepStyle(step.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg">{step.equation}</div>
                    {step.label && (
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        step.type === 'slow' ? 'text-red-700 bg-red-100' :
                        step.type === 'fast' ? 'text-green-700 bg-green-100' :
                        'text-blue-700 bg-blue-100'
                      }`}>
                        {step.label}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <div className="font-bold text-gray-800">{challenge.question}</div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {challenge.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(option)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-500 uppercase">{option.id}.</span>
                  <span className="flex-1">{option.text}</span>
                  {showResult && option.correct && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                  {showResult && selectedAnswer === option.id && !option.correct && (
                    <span className="text-red-600 font-bold">✗</span>
                  )}
                </div>
                {showResult && selectedAnswer === option.id && (
                  <div className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}>
                    {option.explanation}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Hint button */}
          {!showResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-purple-600 hover:text-purple-800 text-sm underline mb-4"
            >
              Sýna vísbendingu (-10 stig)
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hint}</span>
            </div>
          )}

          {/* Check answer button */}
          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Concept explanation */}
          {showResult && (
            <div className="bg-purple-50 p-4 rounded-xl mb-4">
              <div className="font-bold text-purple-800 mb-2">Hugtak:</div>
              <div className="text-purple-900 text-sm">
                {challenge.conceptExplanation}
              </div>
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <button
              onClick={nextChallenge}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 3'}
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-3">Lykilhugtök</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-400"></span>
              <span>Hægt skref (RDS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-400"></span>
              <span>Hratt skref</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-400"></span>
              <span>Jafnvægi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-400"></span>
              <span>Millistig</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
