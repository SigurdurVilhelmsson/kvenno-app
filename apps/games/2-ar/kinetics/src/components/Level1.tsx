import { useState, useMemo } from 'react';
import { FeedbackPanel } from '@shared/components';
import type { TieredHints } from '@shared/types';
import { CollisionDemo } from './CollisionDemo';
import { MaxwellBoltzmann } from './MaxwellBoltzmann';
import { CatalystEffectDemo } from './CatalystEffectDemo';
import { shuffleArray } from '@shared/utils';

// Misconceptions for kinetics concepts
const MISCONCEPTIONS: Record<number, string> = {
  1: 'Hvarfhraði = Δ[styrk]/Δtími. Mundu að deila, ekki margfalda!',
  2: 'Í 1. stigs hvörf (order=1) tvöfaldast hraðinn þegar styrkur tvöfaldast. Í 2. stigs (order=2) fjórfaldast hann.',
  3: 'Hitastig breytir EKKI virkjunarorku (Ea). Það eykur hlutfall sameinda sem hafa E ≥ Ea.',
  4: 'Hvatar lækka Ea með öðrum hvarfgangshátt - þeir hita EKKI hvörfin upp.',
  5: 'Yfirborð skiptir máli vegna fjölda árekstrarstaða, ekki efnaformúlu eða massa.',
  6: 'Ekki nóg að árekstur hafi orku - stefna (orientation) skiptir líka máli!',
};

// Related concepts for each challenge
const RELATED_CONCEPTS: Record<number, string[]> = {
  1: ['Hvarfhraði', 'Styrkbreyting', 'M/s'],
  2: ['Hvörfunarröð', 'Hraðajafna', 'k[A]^n'],
  3: ['Maxwell-Boltzmann', 'Arrhenius', 'Ea og T'],
  4: ['Hvatar', 'Virkjunarorka', 'Hvarfgangsháttur'],
  5: ['Yfirborð', 'Árekstur', 'Heterogens hvörf'],
  6: ['Árekstrarkennning', 'Orka og stefna', 'Árekstrartíðni'],
};

interface Level1Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface Challenge {
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

const challenges: Challenge[] = [
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

const MAX_SCORE = 20 * 6; // 20 points per challenge, 6 challenges

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [score, setScore] = useState(0);

  // Shared state for visualizations
  const [temperature, setTemperature] = useState(350);
  const [activationEnergy, setActivationEnergy] = useState(40);

  const challenge = challenges[currentChallenge];

  // Shuffle options for current challenge - memoize to keep stable during challenge
  const shuffledOptions = useMemo(() => {
    if (!challenge.options) return [];
    const shuffled = shuffleArray(challenge.options);
    // Assign new sequential IDs (a, b, c, d) after shuffling
    return shuffled.map((opt, idx) => ({
      ...opt,
      id: String.fromCharCode(97 + idx) // 'a', 'b', 'c', 'd'
    }));
  }, [currentChallenge, challenge.options]);

  const handleAnswerSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const selectedOption = shuffledOptions.find(opt => opt.id === selectedAnswer);
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
        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
        : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50';
    }

    if (option.correct) {
      return 'border-green-500 bg-green-50';
    }

    if (selectedAnswer === option.id && !option.correct) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-200 bg-gray-50 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Stig 1 / Þraut {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-blue-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">
            {challenge.title}
          </h2>
          <p className="text-gray-700 text-lg mb-6">{challenge.question}</p>

          {/* Multiple choice options */}
          {challenge.type === 'multiple_choice' && shuffledOptions.length > 0 && (
            <div className="space-y-3 mb-6">
              {shuffledOptions.map(option => (
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
          )}

          {/* Hint button */}
          {!showResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm underline mb-4"
            >
              Sýna vísbendingu (-10 stig)
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hints.method}</span>
            </div>
          )}

          {/* Check answer button */}
          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Detailed Feedback Panel */}
          {showResult && (
            <div className="mb-4">
              <FeedbackPanel
                feedback={{
                  isCorrect: shuffledOptions.find(opt => opt.id === selectedAnswer)?.correct || false,
                  explanation: `${shuffledOptions.find(opt => opt.id === selectedAnswer)?.explanation || ''}\n\n**Hugtak:** ${challenge.conceptExplanation}`,
                  misconception: shuffledOptions.find(opt => opt.id === selectedAnswer)?.correct
                    ? undefined
                    : MISCONCEPTIONS[challenge.id],
                  relatedConcepts: RELATED_CONCEPTS[challenge.id],
                  nextSteps: shuffledOptions.find(opt => opt.id === selectedAnswer)?.correct
                    ? 'Frábært! Þú skilur þetta hugtak vel. Haltu áfram.'
                    : 'Skoðaðu útskýringuna og hugsaðu um samband milli þáttanna.',
                }}
                config={{
                  showExplanation: true,
                  showMisconceptions: !shuffledOptions.find(opt => opt.id === selectedAnswer)?.correct,
                  showRelatedConcepts: true,
                  showNextSteps: true,
                }}
              />
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <button
              onClick={nextChallenge}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 1'}
            </button>
          )}
        </div>

        {/* Interactive Visualizations */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-4">Gagnvirk hermun</h3>

          {/* Shared Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span className="flex items-center gap-1">
                  <span>🌡️</span> Hitastig
                </span>
                <span className="font-mono font-bold text-blue-600">{temperature} K</span>
              </label>
              <input
                type="range"
                min="250"
                max="500"
                step="10"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>250 K</span>
                <span>500 K</span>
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span className="flex items-center gap-1">
                  <span>⚡</span> Virkjunarorka (Ea)
                </span>
                <span className="font-mono font-bold text-red-600">{activationEnergy} kJ/mol</span>
              </label>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={activationEnergy}
                onChange={(e) => setActivationEnergy(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>20 kJ/mol</span>
                <span>80 kJ/mol</span>
              </div>
            </div>
          </div>

          {/* Side-by-side visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MaxwellBoltzmann
              temperature={temperature}
              activationEnergy={activationEnergy}
            />
            <CollisionDemo
              temperature={temperature}
              activationEnergy={activationEnergy}
              showLabels={true}
            />
          </div>

          {/* Connection explanation */}
          <div className="mt-3 text-center text-xs text-gray-500 bg-blue-50 p-2 rounded">
            Prófaðu að breyta hitastigi og sjáðu hvernig bæði orkudreifingin og árekstrartíðnin breytast!
          </div>

          {/* Catalyst Effect Demo */}
          <div className="mt-4">
            <CatalystEffectDemo
              temperature={temperature}
              baseActivationEnergy={activationEnergy}
              catalyzedActivationEnergy={Math.max(20, activationEnergy - 25)}
              interactive={true}
            />
          </div>
        </div>

        {/* Visual concept helper */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-3">Þættir sem hafa áhrif á hvarfhraða</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🧪</div>
              <div className="font-bold text-blue-800">Styrkur</div>
              <div className="text-blue-600 text-xs">Hærri → hraðari</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🌡️</div>
              <div className="font-bold text-red-800">Hitastig</div>
              <div className="text-red-600 text-xs">Hærra → hraðari</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">⚗️</div>
              <div className="font-bold text-green-800">Hvati</div>
              <div className="text-green-600 text-xs">Lækkar Ea</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🔬</div>
              <div className="font-bold text-purple-800">Yfirborð</div>
              <div className="text-purple-600 text-xs">Meira → hraðari</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
