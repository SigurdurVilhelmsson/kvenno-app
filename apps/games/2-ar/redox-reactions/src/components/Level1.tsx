import { useState } from 'react';
import { FeedbackPanel } from '@shared/components';

// Misconceptions for oxidation states
const OXIDATION_MISCONCEPTIONS: Record<string, string> = {
  element: 'Hreint frumefni (ekki bundið við annað) hefur alltaf oxunartölu 0.',
  hydrogen: 'Vetni er yfirleitt +1, NEMA í málmhýdríðum (t.d. NaH) þar sem það er -1.',
  oxygen: 'Súrefni er yfirleitt -2, NEMA í peroxíðum (-1) og OF₂ (+2).',
  halogen: 'Halógenar (F, Cl, Br, I) eru -1 þegar bundnar við málma eða vetni.',
  sum: 'Summa oxunartalna í sameind = 0 (hlutlaust) eða = heildarhleðsla (jón).',
};

// Related concepts for redox
const OXIDATION_RELATED: string[] = ['Oxunartölur', 'Redox hvörf', 'Rafeindasameignir'];

interface Level1Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface OxidationRule {
  id: number;
  rule: string;
  example: string;
  explanation: string;
}

interface OxidationProblem {
  id: number;
  compound: string;
  compoundDisplay: string;
  targetElement: string;
  correctAnswer: number;
  hint: string;
}

const oxidationRules: OxidationRule[] = [
  {
    id: 1,
    rule: "Hreint frumefni = 0",
    example: "Fe, O₂, N₂, S₈",
    explanation: "Öll frumefni í sinni hreinustu mynd hafa oxunartölu 0"
  },
  {
    id: 2,
    rule: "Einatóma jón = hleðsla",
    example: "Na⁺ = +1, Cl⁻ = -1, Fe³⁺ = +3",
    explanation: "Oxunartala einatóma jónar er jöfn hleðslu hennar"
  },
  {
    id: 3,
    rule: "Vetni (H) = +1 yfirleitt",
    example: "H₂O, HCl, NH₃",
    explanation: "Vetni er +1 nema í málmhýdríðum (þá -1)"
  },
  {
    id: 4,
    rule: "Súrefni (O) = -2 yfirleitt",
    example: "H₂O, CO₂, MgO",
    explanation: "Súrefni er -2 nema í peroxíðum (-1) og OF₂ (+2)"
  },
  {
    id: 5,
    rule: "Halógenar = -1 yfirleitt",
    example: "NaCl, HBr, KI",
    explanation: "F, Cl, Br, I eru -1 þegar þau eru bundin við málma eða vetni"
  },
  {
    id: 6,
    rule: "Summa = 0 (hlutlaust) eða hleðsla (jón)",
    example: "H₂O: 2(+1) + (-2) = 0",
    explanation: "Summa allra oxunartalna í sameind jafngildir heildarhleðslu"
  }
];

const problems: OxidationProblem[] = [
  { id: 1, compound: "NaCl", compoundDisplay: "NaCl", targetElement: "Cl", correctAnswer: -1, hint: "Natríum er +1, summan er 0" },
  { id: 2, compound: "H2O", compoundDisplay: "H₂O", targetElement: "O", correctAnswer: -2, hint: "Vetni er +1, summan er 0" },
  { id: 3, compound: "CO2", compoundDisplay: "CO₂", targetElement: "C", correctAnswer: 4, hint: "Súrefni er -2, summan er 0" },
  { id: 4, compound: "Fe2O3", compoundDisplay: "Fe₂O₃", targetElement: "Fe", correctAnswer: 3, hint: "3 súrefni × (-2) = -6, þú þarft +6 frá 2 Fe" },
  { id: 5, compound: "H2SO4", compoundDisplay: "H₂SO₄", targetElement: "S", correctAnswer: 6, hint: "2H (+2) + 4O (-8) = -6, S þarf að vera +6" },
  { id: 6, compound: "KMnO4", compoundDisplay: "KMnO₄", targetElement: "Mn", correctAnswer: 7, hint: "K (+1) + 4O (-8) = -7, Mn þarf að vera +7" },
  { id: 7, compound: "NH3", compoundDisplay: "NH₃", targetElement: "N", correctAnswer: -3, hint: "3H = +3, summan er 0" },
  { id: 8, compound: "HNO3", compoundDisplay: "HNO₃", targetElement: "N", correctAnswer: 5, hint: "H (+1) + 3O (-6) = -5, N þarf að vera +5" },
  { id: 9, compound: "CuSO4", compoundDisplay: "CuSO₄", targetElement: "Cu", correctAnswer: 2, hint: "SO₄ er -2 (sulfat jón)" },
  { id: 10, compound: "Cr2O7_2-", compoundDisplay: "Cr₂O₇²⁻", targetElement: "Cr", correctAnswer: 6, hint: "7O (-14) + heildarhleðsla (-2), 2 Cr þarf að gefa +12" }
];

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [phase, setPhase] = useState<'learn' | 'practice'>('learn');
  const [currentRule, setCurrentRule] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  // Maximum possible score: 10 problems * 10 points each = 100
  const maxScore = problems.length * 10;

  const handleNextRule = () => {
    if (currentRule < oxidationRules.length - 1) {
      setCurrentRule(prev => prev + 1);
    } else {
      setPhase('practice');
    }
  };

  const handlePrevRule = () => {
    if (currentRule > 0) {
      setCurrentRule(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answer = parseInt(userAnswer);
    const correct = answer === problems[currentProblem].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = attempts === 0 ? 10 : attempts === 1 ? 5 : 2;
      setScore(prev => prev + points);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleNext = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(prev => prev + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setShowHint(false);
      setAttempts(0);
    } else {
      onComplete(score, maxScore, totalHintsUsed);
    }
  };

  const handleTryAgain = () => {
    setShowFeedback(false);
    setUserAnswer('');
    setAttempts(prev => prev + 1);
    setShowHint(true);
  };

  if (phase === 'learn') {
    const rule = oxidationRules[currentRule];

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
              ← Til baka
            </button>
            <div className="text-sm text-gray-500">
              Regla {currentRule + 1} af {oxidationRules.length}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-blue-600">
            📚 Reglur um oxunartölur
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Lærðu grunnreglurnar
          </p>

          <div className="mb-8">
            <div className="flex justify-center gap-2 mb-6">
              {oxidationRules.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full ${
                    idx === currentRule ? 'bg-blue-500' : idx < currentRule ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl border-2 border-blue-200 animate-slide-in">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">📖</div>
                <div className="text-2xl font-bold text-blue-800 mb-2">
                  {rule.rule}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl mb-4">
                <div className="text-sm text-gray-500 mb-1">Dæmi:</div>
                <div className="text-xl font-mono text-center text-gray-800">
                  {rule.example}
                </div>
              </div>

              <div className="bg-blue-100 p-4 rounded-xl">
                <div className="text-sm text-blue-600 mb-1">Útskýring:</div>
                <div className="text-blue-800">
                  {rule.explanation}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrevRule}
              disabled={currentRule === 0}
              className={`flex-1 py-3 px-6 rounded-xl font-bold ${
                currentRule === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              ← Fyrri
            </button>
            <button
              onClick={handleNextRule}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {currentRule === oxidationRules.length - 1 ? 'Byrja æfingar →' : 'Næsta →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  const problem = problems[currentProblem];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← Til baka
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Spurning {currentProblem + 1} af {problems.length}
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-blue-600">
          🔢 Finndu oxunartöluna
        </h1>

        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-2">Hvað er oxunartala</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-mono font-bold text-gray-800">
                {problem.compoundDisplay}
              </span>
            </div>
            <div className="inline-block bg-amber-100 px-4 py-2 rounded-full">
              <span className="text-amber-800 font-bold text-xl">{problem.targetElement}</span>
              <span className="text-amber-600"> í þessari sameind?</span>
            </div>
          </div>
        </div>

        {showHint && (
          <div className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="text-yellow-800">{problem.hint}</span>
            </div>
          </div>
        )}

        {!showFeedback ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Sláðu inn tölu..."
                className="text-center text-2xl font-bold w-32 p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="text-center text-sm text-gray-500">
              Notaðu neikvæðar tölur fyrir neikvæðar oxunartölur (t.d. -2)
            </p>
            <div className="flex gap-4">
              {!showHint && (
                <button
                  onClick={() => {
                    setShowHint(true);
                    setTotalHintsUsed(prev => prev + 1);
                  }}
                  className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-3 px-6 rounded-xl"
                >
                  💡 Vísbending
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={userAnswer === ''}
                className={`flex-1 font-bold py-3 px-6 rounded-xl ${
                  userAnswer === ''
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Athuga svar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rétt! Oxunartala ${problem.targetElement} í ${problem.compoundDisplay} er ${problem.correctAnswer > 0 ? `+${problem.correctAnswer}` : problem.correctAnswer}.`
                  : `Þú svaraðir ${userAnswer}, en rétt svar er ${problem.correctAnswer > 0 ? `+${problem.correctAnswer}` : problem.correctAnswer}. ${problem.hint || ''}`,
                misconception: isCorrect ? undefined : OXIDATION_MISCONCEPTIONS.sum,
                relatedConcepts: OXIDATION_RELATED,
                nextSteps: isCorrect
                  ? 'Frábært! Þú skilur hvernig á að reikna oxunartölur.'
                  : 'Mundu reglurnar: H=+1, O=-2, summa=0 (eða hleðsla).',
              }}
              config={{
                showExplanation: true,
                showMisconceptions: !isCorrect,
                showRelatedConcepts: true,
                showNextSteps: true,
              }}
            />

            {isCorrect ? (
              <button
                onClick={handleNext}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl"
              >
                {currentProblem < problems.length - 1 ? 'Næsta spurning →' : 'Ljúka stigi →'}
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleTryAgain}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl"
                >
                  Reyna aftur
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl"
                >
                  Halda áfram →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2">📋 Muna reglurnar:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2 rounded border">Frumefni = 0</div>
            <div className="bg-white p-2 rounded border">Jón = hleðsla</div>
            <div className="bg-white p-2 rounded border">H = +1</div>
            <div className="bg-white p-2 rounded border">O = -2</div>
            <div className="bg-white p-2 rounded border">Halógen = -1</div>
            <div className="bg-white p-2 rounded border">Summa = hleðsla</div>
          </div>
        </div>

        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
