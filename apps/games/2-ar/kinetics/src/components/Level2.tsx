import { useState } from 'react';
import { ConcentrationTimeGraph } from './ConcentrationTimeGraph';

interface Level2Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface ExperimentData {
  experiment: number;
  concentrationA: number;
  concentrationB: number;
  initialRate: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  equation: string;
  data: ExperimentData[];
  correctOrderA: number;
  correctOrderB: number;
  correctRateConstant: number;
  rateConstantUnit: string;
  hint: string;
  explanation: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Einföld hvörf',
    description: 'Finndu röð hvörfunar fyrir A og B með því að bera saman tilraunir.',
    equation: 'A + B → Products',
    data: [
      { experiment: 1, concentrationA: 0.10, concentrationB: 0.10, initialRate: 0.015 },
      { experiment: 2, concentrationA: 0.20, concentrationB: 0.10, initialRate: 0.030 },
      { experiment: 3, concentrationA: 0.10, concentrationB: 0.20, initialRate: 0.060 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 15,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'Berðu saman tilraunir þar sem aðeins einn styrkur breytist',
    explanation: 'Tilraun 1→2: [A] tvöfaldast, Rate tvöfaldast → 1. stig í A. Tilraun 1→3: [B] tvöfaldast, Rate fjórfaldast → 2. stig í B.'
  },
  {
    id: 2,
    title: 'Núllta stigs hvörf',
    description: 'Þegar ensím eru mettað virkar hvörf oft á 0. stigi.',
    equation: 'S → P (ensímhvörf)',
    data: [
      { experiment: 1, concentrationA: 0.50, concentrationB: 0, initialRate: 0.020 },
      { experiment: 2, concentrationA: 1.00, concentrationB: 0, initialRate: 0.020 },
      { experiment: 3, concentrationA: 2.00, concentrationB: 0, initialRate: 0.020 },
    ],
    correctOrderA: 0,
    correctOrderB: 0,
    correctRateConstant: 0.020,
    rateConstantUnit: 'M·s⁻¹',
    hint: 'Ef hraðinn breytist ekki þegar styrkur breytist, hver er röðin?',
    explanation: 'Styrkur tvöfaldast en hraðinn helst sá sami → 0. stigs hvörf. Rate = k = 0.020 M/s.'
  },
  {
    id: 3,
    title: 'Annars stigs hvörf',
    description: 'Finndu hraðalögmálið fyrir þetta hvörf.',
    equation: '2NO₂ → 2NO + O₂',
    data: [
      { experiment: 1, concentrationA: 0.010, concentrationB: 0, initialRate: 0.0010 },
      { experiment: 2, concentrationA: 0.020, concentrationB: 0, initialRate: 0.0040 },
      { experiment: 3, concentrationA: 0.030, concentrationB: 0, initialRate: 0.0090 },
    ],
    correctOrderA: 2,
    correctOrderB: 0,
    correctRateConstant: 10,
    rateConstantUnit: 'M⁻¹s⁻¹',
    hint: 'Hvað gerist við hraðann þegar styrkur tvöfaldast? Þrefaldast?',
    explanation: 'Tilraun 1→2: [NO₂] tvöfaldast (×2), Rate fjórfaldast (×4 = 2²) → 2. stigs. k = Rate/[A]² = 0.001/0.01² = 10 M⁻¹s⁻¹.'
  },
  {
    id: 4,
    title: 'Tvö hvarfefni',
    description: 'Greindu röðina fyrir bæði BrO₃⁻ og Br⁻.',
    equation: 'BrO₃⁻ + 5Br⁻ + 6H⁺ → 3Br₂ + 3H₂O',
    data: [
      { experiment: 1, concentrationA: 0.10, concentrationB: 0.10, initialRate: 0.80 },
      { experiment: 2, concentrationA: 0.20, concentrationB: 0.10, initialRate: 1.60 },
      { experiment: 3, concentrationA: 0.10, concentrationB: 0.30, initialRate: 2.40 },
    ],
    correctOrderA: 1,
    correctOrderB: 1,
    correctRateConstant: 80,
    rateConstantUnit: 'M⁻¹s⁻¹',
    hint: 'A = BrO₃⁻, B = Br⁻ (H⁺ er stöðugur)',
    explanation: 'Tilraun 1→2: [A] tvöfaldast → Rate tvöfaldast → 1. stig í A. Tilraun 1→3: [B] þrefaldast → Rate þrefaldast → 1. stig í B.'
  },
  {
    id: 5,
    title: 'Flóknari tilfelli',
    description: 'Ákvarðaðu heildarröð hvörfunar.',
    equation: '2H₂ + 2NO → N₂ + 2H₂O',
    data: [
      { experiment: 1, concentrationA: 0.10, concentrationB: 0.10, initialRate: 0.0050 },
      { experiment: 2, concentrationA: 0.20, concentrationB: 0.10, initialRate: 0.0100 },
      { experiment: 3, concentrationA: 0.10, concentrationB: 0.20, initialRate: 0.0200 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 50,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'A = H₂, B = NO. Heildarröð = m + n',
    explanation: 'H₂ er 1. stigs, NO er 2. stigs. Heildarröð = 1 + 2 = 3. stigs hvörf.'
  },
  {
    id: 6,
    title: 'Reikna k',
    description: 'Þú veist nú röðina. Reiknaðu hraðafastann k.',
    equation: 'A + 2B → C',
    data: [
      { experiment: 1, concentrationA: 0.50, concentrationB: 0.50, initialRate: 0.250 },
      { experiment: 2, concentrationA: 1.00, concentrationB: 0.50, initialRate: 0.500 },
      { experiment: 3, concentrationA: 0.50, concentrationB: 1.00, initialRate: 1.000 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 2.0,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'k = Rate / ([A]^m × [B]^n)',
    explanation: 'Rate = k[A][B]². Notum tilraun 1: k = 0.250 / (0.50 × 0.50²) = 0.250 / 0.125 = 2.0 M⁻²s⁻¹.'
  },
];

const MAX_SCORE = 20 * 6; // 20 points per challenge, 6 challenges

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [orderA, setOrderA] = useState<number | null>(null);
  const [orderB, setOrderB] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  const checkAnswer = () => {
    const correctA = orderA === challenge.correctOrderA;
    const correctB = orderB === challenge.correctOrderB || (challenge.correctOrderB === 0 && orderB === null);

    const correct = correctA && correctB;
    setIsCorrect(correct);

    if (correct) {
      if (!showHint) {
        setScore(prev => prev + 20);
      } else {
        setScore(prev => prev + 10);
      }
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setOrderA(null);
      setOrderB(null);
      setShowHint(false);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      onComplete(score, MAX_SCORE, totalHintsUsed);
    }
  };

  const hasSecondReactant = challenge.data.some(d => d.concentrationB > 0);

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
            <div className="text-sm text-gray-600">Stig 2 / Þraut {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-green-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {challenge.title}
          </h2>
          <p className="text-gray-600 mb-4">{challenge.description}</p>

          {/* Chemical equation */}
          <div className="bg-green-50 p-4 rounded-xl mb-6">
            <div className="text-center font-mono text-xl">
              {challenge.equation}
            </div>
          </div>

          {/* Experimental data table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Tilraun</th>
                  <th className="p-3 text-center">[A] (M)</th>
                  {hasSecondReactant && <th className="p-3 text-center">[B] (M)</th>}
                  <th className="p-3 text-center">Upphafshraði (M/s)</th>
                </tr>
              </thead>
              <tbody>
                {challenge.data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-bold">{row.experiment}</td>
                    <td className="p-3 text-center font-mono">{row.concentrationA.toFixed(2)}</td>
                    {hasSecondReactant && (
                      <td className="p-3 text-center font-mono">{row.concentrationB.toFixed(2)}</td>
                    )}
                    <td className="p-3 text-center font-mono">{row.initialRate.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order selection */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Veldu röð hvörfunar:</h3>

            <div className="space-y-4">
              {/* Order for A */}
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold w-32">Röð í [A]:</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map(order => (
                    <button
                      key={order}
                      onClick={() => !showResult && setOrderA(order)}
                      disabled={showResult}
                      className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                        orderA === order
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                      } ${showResult ? 'cursor-not-allowed' : ''}`}
                    >
                      {order}
                    </button>
                  ))}
                </div>
                {showResult && (
                  <span className={orderA === challenge.correctOrderA ? 'text-green-600' : 'text-red-600'}>
                    {orderA === challenge.correctOrderA ? '✓' : `✗ (rétt: ${challenge.correctOrderA})`}
                  </span>
                )}
              </div>

              {/* Order for B (if applicable) */}
              {hasSecondReactant && (
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold w-32">Röð í [B]:</span>
                  <div className="flex gap-2">
                    {[0, 1, 2].map(order => (
                      <button
                        key={order}
                        onClick={() => !showResult && setOrderB(order)}
                        disabled={showResult}
                        className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                          orderB === order
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                        } ${showResult ? 'cursor-not-allowed' : ''}`}
                      >
                        {order}
                      </button>
                    ))}
                  </div>
                  {showResult && (
                    <span className={orderB === challenge.correctOrderB ? 'text-green-600' : 'text-red-600'}>
                      {orderB === challenge.correctOrderB ? '✓' : `✗ (rétt: ${challenge.correctOrderB})`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Rate law preview */}
            {(orderA !== null || orderB !== null) && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="font-mono text-center text-lg">
                  Rate = k[A]<sup>{orderA ?? '?'}</sup>
                  {hasSecondReactant && <>[B]<sup>{orderB ?? '?'}</sup></>}
                </div>
              </div>
            )}
          </div>

          {/* Hint button */}
          {!showResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-green-600 hover:text-green-800 text-sm underline mb-4"
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
              disabled={orderA === null}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Result feedback */}
          {showResult && (
            <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Rétt!' : 'Rangt'}
              </div>
              <div className="text-sm text-gray-700 mb-2">
                {challenge.explanation}
              </div>
              <div className="font-mono text-sm bg-white p-2 rounded border">
                <strong>Hraðalögmál:</strong> Rate = k[A]<sup>{challenge.correctOrderA}</sup>
                {hasSecondReactant && <>[B]<sup>{challenge.correctOrderB}</sup></>}
                <br />
                <strong>Hraðafasti:</strong> k = {challenge.correctRateConstant} {challenge.rateConstantUnit}
              </div>
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <button
              onClick={nextChallenge}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 2'}
            </button>
          )}
        </div>

        {/* Method reminder */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-2">Aðferð til að finna röð:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Finndu tvær tilraunir þar sem aðeins EINN styrkur breytist</li>
            <li>Reiknaðu hlutfallið: (Rate₂/Rate₁) = ([A]₂/[A]₁)<sup>m</sup></li>
            <li>Ef styrkur tvöfaldast og Rate tvöfaldast → m = 1</li>
            <li>Ef styrkur tvöfaldast og Rate fjórfaldast → m = 2</li>
            <li>Ef styrkur breytist en Rate helst sama → m = 0</li>
          </ol>
        </div>

        {/* Concentration vs Time Graph */}
        <div className="mt-6">
          <ConcentrationTimeGraph
            initialConcentration={1.0}
            rateConstant={0.1}
            order={challenge.correctOrderA === 0 ? 0 : challenge.correctOrderA === 2 ? 2 : 1}
            showComparison={showResult}
            interactive={true}
          />
        </div>
      </div>
    </div>
  );
}
