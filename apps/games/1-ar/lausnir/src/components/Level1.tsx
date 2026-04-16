import { useState, useEffect, useCallback } from 'react';

import { FeedbackPanel } from '@shared/components';
import type { TieredHints } from '@shared/types';

import { Beaker } from './Beaker';

// Challenge types for categorizing feedback
type ChallengeType = 'dilution' | 'mixing' | 'buildSolution' | 'concentrationMatch';

// Misconceptions for each challenge type
const MISCONCEPTIONS: Record<ChallengeType, string> = {
  dilution:
    'Algeng villa er að halda að sameindir hverfi við útþynningu. Sameindir haldast óbreyttar - þær dreifast bara á stærra svæði.',
  mixing:
    'Þegar lausnir blandast, þarf að taka tillit til rúmmáls beggja lausnanna og fjölda sameinda í hvorum.',
  buildSolution: 'Mundu að styrkur = sameindir/rúmmál. Bæði breyturnar hafa áhrif á lokastyrkinn.',
  concentrationMatch:
    'Til að auka styrk með föstu rúmmáli, verður þú að bæta við sameindum. Fleiri sameindir = hærri styrkur.',
};

// Related concepts for each challenge type
const RELATED_CONCEPTS: Record<ChallengeType, string[]> = {
  dilution: ['Útþynning', 'Styrkur og rúmmál', 'Öfug tengsl'],
  mixing: ['Lausnablöndun', 'Magnjöfnun', 'Meðaltalsstyrkur'],
  buildSolution: ['Styrkformúla', 'Mólstyrkur', 'Rúmmálseiningar'],
  concentrationMatch: ['Styrkur', 'Sameindafjöldi', 'Föst rúmmál'],
};

// Types for Level 1
interface Challenge {
  id: number;
  type: 'dilution' | 'mixing' | 'buildSolution' | 'concentrationMatch';
  title: string;
  description: string;
  targetConcentration: number;
  tolerance: number; // percentage tolerance for answer
  initialState: {
    molecules: number;
    volumeML: number;
    molecules2?: number;
    volumeML2?: number;
  };
  constraints: {
    minVolume: number;
    maxVolume: number;
    minMolecules: number;
    maxMolecules: number;
    canChangeMolecules: boolean;
    canChangeVolume: boolean;
  };
  hints: TieredHints;
  conceptMessage: string;
}

const CHALLENGES: Challenge[] = [
  // Challenge 1: Simple dilution - understand inverse relationship
  {
    id: 1,
    type: 'dilution',
    title: 'Útþynning - Skilja vensl',
    description: 'Bættu við vatni til að ná markmiðsstyrk. Fylgstu með hvernig sameindir dreifast.',
    targetConcentration: 2.0,
    tolerance: 5,
    initialState: { molecules: 50, volumeML: 100 },
    constraints: {
      minVolume: 100,
      maxVolume: 500,
      minMolecules: 50,
      maxMolecules: 50, // Can't change molecules in dilution!
      canChangeMolecules: false,
      canChangeVolume: true,
    },
    hints: {
      topic: 'Þetta snýst um útþynningu og hvernig styrkur breytist með rúmmáli.',
      strategy: 'Þegar þú bætir við vatni, dreifast sameindir á stærra svæði.',
      method: 'Styrkur = sameindir / rúmmál. Finndu rúmmálið sem gefur 2.0 M.',
      solution: '50 sameindir × 0.01 = 0.5 mól. 0.5 mól / 2.0 M = 0.25 L = 250 mL',
    },
    conceptMessage: 'Styrkur = sameindir / rúmmál',
  },
  // Challenge 2: Build concentration from scratch
  {
    id: 2,
    type: 'buildSolution',
    title: 'Byggja lausn',
    description: 'Bættu við sameindum og stilltu rúmmál til að ná 1.5 M styrk.',
    targetConcentration: 1.5,
    tolerance: 5,
    initialState: { molecules: 20, volumeML: 200 },
    constraints: {
      minVolume: 100,
      maxVolume: 400,
      minMolecules: 10,
      maxMolecules: 100,
      canChangeMolecules: true,
      canChangeVolume: true,
    },
    hints: {
      topic: 'Þetta snýst um að búa til lausn með ákveðnum styrk.',
      strategy: 'Þú getur breytt bæði sameindum og rúmmáli til að ná markmiði.',
      method: 'Styrkur = sameindir × 0.01 / (rúmmál í lítrum). Prófaðu mismunandi samsetningar.',
      solution: 'Til dæmis: 30 sameindir í 200 mL gefur 0.3 mól / 0.2 L = 1.5 M',
    },
    conceptMessage: 'Meira af sameindum í sama rúmmáli = hærri styrkur',
  },
  // Challenge 3: More dilution practice
  {
    id: 3,
    type: 'dilution',
    title: 'Nákvæm útþynning',
    description: 'Þú ert með sterka lausn. Þynntu hana niður í 0.8 M.',
    targetConcentration: 0.8,
    tolerance: 5,
    initialState: { molecules: 40, volumeML: 100 },
    constraints: {
      minVolume: 100,
      maxVolume: 600,
      minMolecules: 40,
      maxMolecules: 40,
      canChangeMolecules: false,
      canChangeVolume: true,
    },
    hints: {
      topic: 'Þetta snýst um útþynningu sterkar lausnar.',
      strategy: 'Sameindir haldast óbreyttar. Aðeins rúmmálið breytist!',
      method: 'Styrkur = (sameindir × 0.01) / rúmmál í lítrum. Leysðu fyrir rúmmál.',
      solution: '40 × 0.01 = 0.4 mól. 0.4 mól / 0.8 M = 0.5 L = 500 mL',
    },
    conceptMessage: 'Við útþynningu: sameindir haldast, styrkur minnkar',
  },
  // Challenge 4: Concentration matching with molecules
  {
    id: 4,
    type: 'concentrationMatch',
    title: 'Styrkjamöt',
    description: 'Breyttu fjölda sameinda til að ná 3.0 M styrk í 150 mL.',
    targetConcentration: 3.0,
    tolerance: 5,
    initialState: { molecules: 30, volumeML: 150 },
    constraints: {
      minVolume: 150,
      maxVolume: 150, // Fixed volume
      minMolecules: 10,
      maxMolecules: 100,
      canChangeMolecules: true,
      canChangeVolume: false,
    },
    hints: {
      topic: 'Þetta snýst um að stilla fjölda sameinda til að ná ákveðnum styrk.',
      strategy: 'Rúmmálið er fast. Þú þarft að finna réttan fjölda sameinda.',
      method: 'sameindir = Styrkur × rúmmál í lítrum / 0.01',
      solution: '3.0 M × 0.15 L = 0.45 mól. 0.45 / 0.01 = 45 sameindir',
    },
    conceptMessage: 'Fleiri sameindir í sama rúmmáli = hærri styrkur',
  },
  // Challenge 5: Advanced dilution
  {
    id: 5,
    type: 'dilution',
    title: 'Þrefalt þynnt',
    description: 'Þynntu 5 M lausnina niður í einn þriðja af upphaflega styrknum.',
    targetConcentration: 1.67,
    tolerance: 5,
    initialState: { molecules: 50, volumeML: 100 },
    constraints: {
      minVolume: 100,
      maxVolume: 500,
      minMolecules: 50,
      maxMolecules: 50,
      canChangeMolecules: false,
      canChangeVolume: true,
    },
    hints: {
      topic: 'Þetta snýst um hlutfallslega útþynningu.',
      strategy: 'Til að þynna í þriðjung þarftu þrefalt meira rúmmál!',
      method: 'Upphaflegt: 5 M í 100 mL. Markmiðsstyrkur er ~1.67 M (þriðjungur).',
      solution: 'Þrefalda rúmmálið: 100 mL × 3 = 300 mL gefur ~1.67 M',
    },
    conceptMessage: 'Styrkur × rúmmál = fasti (heildarmagn sameinda)',
  },
  // Challenge 6: Build specific concentration
  {
    id: 6,
    type: 'buildSolution',
    title: 'Sérsmíðuð lausn',
    description: 'Búðu til nákvæmlega 2.5 M lausn með því að stilla bæði sameindir og rúmmál.',
    targetConcentration: 2.5,
    tolerance: 3,
    initialState: { molecules: 25, volumeML: 200 },
    constraints: {
      minVolume: 50,
      maxVolume: 500,
      minMolecules: 10,
      maxMolecules: 150,
      canChangeMolecules: true,
      canChangeVolume: true,
    },
    hints: {
      topic: 'Þetta snýst um að búa til nákvæman styrk með tveimur breytum.',
      strategy: 'Margar samsetningar virka! Finndu eina þar sem niðurstaðan er 2.5 M.',
      method: 'Styrkur = (sameindir × 0.01) / rúmmál í lítrum. Prófaðu auðveldar tölur.',
      solution: 'Til dæmis: 50 sameindir í 200 mL: 0.5 mól / 0.2 L = 2.5 M',
    },
    conceptMessage: 'Sama styrkur getur orðið með mismunandi magni',
  },
];

// Concentration indicator with color feedback
function ConcentrationIndicator({
  current,
  target,
  tolerance,
}: {
  current: number;
  target: number;
  tolerance: number;
}) {
  const difference = Math.abs(current - target);
  const percentOff = (difference / target) * 100;
  const isCorrect = percentOff <= tolerance;
  const isClose = percentOff <= tolerance * 2;

  let bgColor: string;
  let textColor: string;
  let indicator: string;

  if (isCorrect) {
    bgColor = 'bg-green-100 border-green-400';
    textColor = 'text-green-700';
    indicator = '✓';
  } else if (isClose) {
    bgColor = 'bg-yellow-100 border-yellow-400';
    textColor = 'text-yellow-700';
    indicator = current < target ? '↑' : '↓';
  } else {
    bgColor = 'bg-red-50 border-red-300';
    textColor = 'text-red-700';
    indicator = current < target ? '↑↑' : '↓↓';
  }

  return (
    <div className={`p-4 rounded-xl border-2 ${bgColor} transition-all duration-300`}>
      <div className="text-center">
        <div className="text-sm text-warm-600 mb-1">Núverandi styrkur</div>
        <div className={`text-3xl font-bold ${textColor}`}>
          {current.toFixed(2)} M {indicator}
        </div>
        <div className="text-sm text-warm-500 mt-1">
          Markmið: {target.toFixed(2)} M (±{tolerance}%)
        </div>
      </div>

      {/* Visual bar comparison */}
      <div className="mt-3 relative h-4 bg-warm-200 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-warm-400 opacity-50"
          style={{
            left: `${Math.max(0, (target / (target * 2)) * 100 - 5)}%`,
            width: '10%',
          }}
        />
        <div
          className={`absolute h-full transition-all duration-300 ${isCorrect ? 'bg-green-500' : isClose ? 'bg-yellow-500' : 'bg-orange-500'}`}
          style={{
            width: `${Math.min(100, (current / (target * 2)) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

interface Level1Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

// Prediction question types based on challenge type
type PredictionAnswer = 'increase' | 'decrease' | 'unchanged';

interface PredictionQuestion {
  question: string;
  correctAnswer: PredictionAnswer;
  explanation: string;
}

function getPredictionQuestion(challenge: Challenge): PredictionQuestion {
  if (challenge.type === 'dilution') {
    return {
      question: 'Ef þú bætir við vatni (eykur rúmmál), hvað gerist við styrkinn?',
      correctAnswer: 'decrease',
      explanation:
        'Rétt! Þegar þú bætir við vatni, dreifast sameindir á stærra svæði og styrkur MINNKAR.',
    };
  } else if (challenge.type === 'concentrationMatch') {
    return {
      question: 'Ef þú bætir við fleiri sameindum í sama rúmmáli, hvað gerist við styrkinn?',
      correctAnswer: 'increase',
      explanation: 'Rétt! Fleiri sameindir í sama rúmmáli þýðir HÆRRI styrk.',
    };
  } else {
    // buildSolution
    return {
      question: 'Til að auka styrk, hvað getur þú gert?',
      correctAnswer: 'increase',
      explanation: 'Rétt! Þú getur bætt við sameindum EÐA minnkað rúmmálið til að auka styrk.',
    };
  }
}

// Main Level1 component
export function Level1({ onComplete, onBack }: Level1Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [molecules, setMolecules] = useState(50);
  const [volumeML, setVolumeML] = useState(100);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showConcept, setShowConcept] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Prediction phase state
  const [showPrediction, setShowPrediction] = useState(true);
  const [predictionAnswer, setPredictionAnswer] = useState<PredictionAnswer | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [predictionComplete, setPredictionComplete] = useState(false);

  const challenge = CHALLENGES[currentChallenge];
  const predictionQuestion = getPredictionQuestion(challenge);

  // Calculate current concentration (molecules per liter)
  // Using a scale where 10 molecules = 0.1 mol for simplicity
  const moleFactor = 0.01; // Each "molecule" represents 0.01 mol
  const currentConcentration = (molecules * moleFactor) / (volumeML / 1000);

  // Check if answer is within tolerance
  const isCorrect =
    (Math.abs(currentConcentration - challenge.targetConcentration) /
      challenge.targetConcentration) *
      100 <=
    challenge.tolerance;

  // Reset state when challenge changes
  useEffect(() => {
    if (challenge) {
      setMolecules(challenge.initialState.molecules);
      setVolumeML(challenge.initialState.volumeML);
      setShowHint(false);
      setShowConcept(false);
      // Reset prediction state
      setShowPrediction(true);
      setPredictionAnswer(null);
      setPredictionFeedback(null);
      setPredictionComplete(false);
    }
  }, [currentChallenge, challenge]);

  // Handle prediction submission
  const handlePredictionSubmit = () => {
    if (!predictionAnswer) return;

    const isCorrect = predictionAnswer === predictionQuestion.correctAnswer;
    if (isCorrect) {
      setPredictionFeedback(predictionQuestion.explanation);
      setPredictionComplete(true);
    } else {
      const wrongFeedback =
        predictionAnswer === 'increase'
          ? 'Ekki rétt. Hugsaðu um hvað gerist þegar rúmmál eykst en sameindir haldast óbreyttar.'
          : predictionAnswer === 'decrease'
            ? 'Ekki rétt. Hugsaðu um vensl sameinda og styrks.'
            : 'Ekki rétt. Breytingar á rúmmáli eða sameindum hafa áhrif á styrk.';
      setPredictionFeedback(wrongFeedback);
    }
  };

  // Continue to main challenge after prediction
  const handleContinueToChallenge = () => {
    setShowPrediction(false);
  };

  // Handle molecule change
  const changeMolecules = useCallback(
    (delta: number) => {
      if (!challenge.constraints.canChangeMolecules) return;
      setMolecules((prev) =>
        Math.max(
          challenge.constraints.minMolecules,
          Math.min(challenge.constraints.maxMolecules, prev + delta)
        )
      );
    },
    [challenge]
  );

  // Handle volume change
  const changeVolume = useCallback(
    (newVolume: number) => {
      if (!challenge.constraints.canChangeVolume) return;
      setVolumeML(
        Math.max(
          challenge.constraints.minVolume,
          Math.min(challenge.constraints.maxVolume, newVolume)
        )
      );
    },
    [challenge]
  );

  // Submit answer
  const checkAnswer = useCallback(() => {
    if (isCorrect) {
      const pointsEarned = 100;
      setScore((prev) => prev + pointsEarned);
      setCompleted((prev) => [...prev, challenge.id]);
      setShowConcept(true);

      // Move to next challenge after delay
      setTimeout(() => {
        if (currentChallenge < CHALLENGES.length - 1) {
          setCurrentChallenge((prev) => prev + 1);
        } else {
          setGameComplete(true);
        }
      }, 2500);
    }
  }, [isCorrect, showHint, challenge.id, currentChallenge]);

  // Game complete screen
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-blue-600">
            Til hamingju!
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-warm-800 mb-2">Þú hefur lokið Stigi 1!</div>
            <div className="text-lg text-warm-600">
              Stig: {score} / {CHALLENGES.length * 100}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl mb-6">
            <h2 className="font-bold text-blue-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-blue-900">
              <li>✓ Styrkur = sameindir deilt með rúmmáli</li>
              <li>✓ Útþynning: sameindir haldast, rúmmál eykst → styrkur minnkar</li>
              <li>✓ Fleiri sameindir í sama rúmmáli = hærri styrkur</li>
              <li>✓ Styrkur og rúmmál hafa öfug tengsl við útþynningu</li>
            </ul>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => {
                setGameComplete(false);
                setCurrentChallenge(0);
                setScore(0);
                setCompleted([]);
              }}
              className="flex-1 bg-warm-600 hover:bg-warm-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Spila aftur
            </button>
            <button
              onClick={() => onComplete(score)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Áfram í Stig 2 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Lausnir - Stigur 1</h1>
              <p className="text-sm text-warm-600">Skildu hugtökin - ENGIN útreikningar!</p>
            </div>

            <div className="flex gap-4 items-center">
              <button onClick={onBack} className="text-warm-600 hover:text-warm-800 text-sm">
                ← Til baka
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{score}</div>
                <div className="text-xs text-warm-600">Stig</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {completed.length}/{CHALLENGES.length}
                </div>
                <div className="text-xs text-warm-600">Lokið</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-warm-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completed.length / CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Prediction Phase */}
        {showPrediction && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🤔</div>
              <h2 className="text-2xl font-bold text-blue-800">Hugsaðu fyrst!</h2>
              <p className="text-warm-600 mt-2">Áður en þú byrjar, spáðu fyrir um útkomunna</p>
            </div>

            {/* Bridging note: connect abstract units to real chemistry (shown on first challenge) */}
            {currentChallenge === 0 && (
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl mb-6">
                <h3 className="font-semibold text-indigo-800 mb-2">Um einingar í þessu verkefni</h3>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>
                    Í þessu stigi notum við <strong>&laquo;sameindir&raquo;</strong> sem abstrakta
                    einingu &mdash; hver sameind táknar 0,01 mól.
                  </li>
                  <li>Á stigi 3 notum við raunverulegar einingar: grömm, mól og mólmassa.</li>
                  <li>
                    Hugmyndin er sú sama:{' '}
                    <strong>styrkur = magn efnis &divide; rúmmál lausnar</strong>.
                  </li>
                </ul>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <div className="text-sm text-warm-600 mb-2">
                Verkefni {currentChallenge + 1}: {challenge.title}
              </div>
              <p className="font-semibold text-warm-800">{challenge.description}</p>
            </div>

            <div className="mb-6">
              <p className="font-semibold text-warm-700 mb-4 text-center text-lg">
                {predictionQuestion.question}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setPredictionAnswer('increase')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    predictionAnswer === 'increase'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-warm-200 hover:border-warm-300 text-warm-700'
                  }`}
                >
                  <div className="text-2xl mb-1">📈</div>
                  <div className="font-semibold">Eykst</div>
                </button>
                <button
                  onClick={() => setPredictionAnswer('decrease')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    predictionAnswer === 'decrease'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-warm-200 hover:border-warm-300 text-warm-700'
                  }`}
                >
                  <div className="text-2xl mb-1">📉</div>
                  <div className="font-semibold">Minnkar</div>
                </button>
                <button
                  onClick={() => setPredictionAnswer('unchanged')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    predictionAnswer === 'unchanged'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-warm-200 hover:border-warm-300 text-warm-700'
                  }`}
                >
                  <div className="text-2xl mb-1">➡️</div>
                  <div className="font-semibold">Óbreytt</div>
                </button>
              </div>
            </div>

            {predictionFeedback && (
              <div className="mb-4">
                <FeedbackPanel
                  feedback={{
                    isCorrect: predictionComplete,
                    explanation: predictionFeedback,
                    misconception: predictionComplete
                      ? undefined
                      : MISCONCEPTIONS[challenge.type as ChallengeType],
                    relatedConcepts: RELATED_CONCEPTS[challenge.type as ChallengeType],
                    nextSteps: predictionComplete
                      ? 'Þú skilur venslin! Nú skaltu prófa að ná markmiðsstyrknum.'
                      : 'Hugsaðu um hvað gerist við styrk þegar rúmmál eða sameindir breytast.',
                  }}
                  config={{
                    showExplanation: true,
                    showMisconceptions: !predictionComplete,
                    showRelatedConcepts: true,
                    showNextSteps: true,
                  }}
                />
              </div>
            )}

            <div className="flex gap-3">
              {!predictionComplete ? (
                <button
                  onClick={handlePredictionSubmit}
                  disabled={!predictionAnswer}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-warm-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Athuga spá
                </button>
              ) : (
                <button
                  onClick={handleContinueToChallenge}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Áfram í verkefni →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Challenge area */}
        {!showPrediction && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            {/* Challenge header */}
            <div className="mb-6">
              <div className="inline-block bg-blue-100 px-4 py-2 rounded-full text-sm font-semibold text-blue-800 mb-2">
                Verkefni {currentChallenge + 1}: {challenge.title}
              </div>
              <p className="text-lg text-warm-700">{challenge.description}</p>
            </div>

            {/* Main interaction area */}
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              {/* Static labeled beaker */}
              <div className="flex flex-col items-center">
                <Beaker
                  volume={volumeML}
                  maxVolume={challenge.constraints.maxVolume}
                  concentration={currentConcentration}
                  color={challenge.type === 'dilution' ? '#f97316' : '#3b82f6'}
                  label={`${molecules} sameindir\n${volumeML} mL\n${currentConcentration.toFixed(2)} M`}
                />

                <div className="mt-4 bg-warm-50 rounded-lg p-3 text-center w-full">
                  <div className="text-xs text-warm-500 mb-1">Styrkur = sameindir ÷ rúmmál</div>
                  <div className="font-mono text-sm text-warm-700">
                    {molecules} × 0.01 mol ÷ {(volumeML / 1000).toFixed(3)} L ={' '}
                    <span className="font-bold text-blue-600">
                      {currentConcentration.toFixed(2)} M
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls and feedback */}
              <div className="space-y-6">
                <ConcentrationIndicator
                  current={currentConcentration}
                  target={challenge.targetConcentration}
                  tolerance={challenge.tolerance}
                />

                {/* Molecule controls */}
                {challenge.constraints.canChangeMolecules && (
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <div className="text-sm font-semibold text-warm-700 mb-2">Sameindir</div>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => changeMolecules(-10)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold w-12 h-12 rounded-lg text-xl transition-colors"
                        disabled={molecules <= challenge.constraints.minMolecules}
                      >
                        -10
                      </button>
                      <button
                        onClick={() => changeMolecules(-1)}
                        className="bg-orange-400 hover:bg-orange-500 text-white font-bold w-10 h-10 rounded-lg transition-colors"
                        disabled={molecules <= challenge.constraints.minMolecules}
                      >
                        -1
                      </button>
                      <span className="text-2xl font-bold w-16 text-center">{molecules}</span>
                      <button
                        onClick={() => changeMolecules(1)}
                        className="bg-orange-400 hover:bg-orange-500 text-white font-bold w-10 h-10 rounded-lg transition-colors"
                        disabled={molecules >= challenge.constraints.maxMolecules}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => changeMolecules(10)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold w-12 h-12 rounded-lg text-xl transition-colors"
                        disabled={molecules >= challenge.constraints.maxMolecules}
                      >
                        +10
                      </button>
                    </div>
                  </div>
                )}

                {/* Volume controls */}
                {challenge.constraints.canChangeVolume && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-sm font-semibold text-warm-700 mb-2">Rúmmál (mL)</div>
                    <input
                      type="range"
                      min={challenge.constraints.minVolume}
                      max={challenge.constraints.maxVolume}
                      value={volumeML}
                      onChange={(e) => changeVolume(parseInt(e.target.value))}
                      aria-label="Rúmmál lausnar í millilítrum"
                      aria-valuetext={`${volumeML} millilítrar af ${challenge.constraints.maxVolume}`}
                      className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-sm text-warm-600 mt-1">
                      <span>{challenge.constraints.minVolume} mL</span>
                      <span className="font-bold text-blue-600">{volumeML} mL</span>
                      <span>{challenge.constraints.maxVolume} mL</span>
                    </div>
                  </div>
                )}

                {/* Fixed parameter notice */}
                {!challenge.constraints.canChangeMolecules && (
                  <div className="bg-warm-100 p-3 rounded-lg text-center text-sm text-warm-600">
                    Sameindir eru fastar við {molecules} (þetta er útþynning!)
                  </div>
                )}
                {!challenge.constraints.canChangeVolume && (
                  <div className="bg-warm-100 p-3 rounded-lg text-center text-sm text-warm-600">
                    Rúmmál er fast við {volumeML} mL
                  </div>
                )}
              </div>
            </div>

            {/* Hint section */}
            {showHint && (
              <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Vísbending:</h4>
                <p className="text-yellow-900">{challenge.hints.method}</p>
              </div>
            )}

            {/* Concept reveal after correct answer */}
            {showConcept && isCorrect && (
              <div className="mb-6">
                <FeedbackPanel
                  feedback={{
                    isCorrect: true,
                    explanation:
                      challenge.type === 'dilution'
                        ? 'Við útþynningu haldast sameindir óbreyttar. Meira rúmmál = lægri styrkur!'
                        : 'Styrkur = sameindir / rúmmál. Þú getur breytt hvoru tveggja til að ná markmiði!',
                    relatedConcepts: RELATED_CONCEPTS[challenge.type as ChallengeType],
                    nextSteps:
                      currentChallenge < CHALLENGES.length - 1
                        ? 'Næsta verkefni mun reyna meira á skilning þinn.'
                        : 'Þú ert að ljúka stiginu! Sjáum hvað þú lærðir.',
                  }}
                  config={{
                    showExplanation: true,
                    showMisconceptions: false,
                    showRelatedConcepts: true,
                    showNextSteps: true,
                  }}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              {!showHint && !showConcept && (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Syna visbendingu
                </button>
              )}

              <button
                onClick={checkAnswer}
                disabled={showConcept}
                className={`flex-1 font-bold py-3 px-6 rounded-xl transition-colors ${
                  isCorrect && !showConcept
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : showConcept
                      ? 'bg-warm-300 text-warm-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {showConcept ? 'Hleð næsta verkefni...' : 'Athuga lausn ✓'}
              </button>
            </div>
          </div>
        )}

        {/* Challenge navigation */}
        <div className="mt-6 flex justify-center gap-2">
          {CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              onClick={() =>
                !completed.includes(c.id) &&
                i <=
                  Math.max(
                    ...completed.map((id) => CHALLENGES.findIndex((ch) => ch.id === id)),
                    0
                  ) +
                    1 &&
                setCurrentChallenge(i)
              }
              className={`w-10 h-10 rounded-full font-bold transition-colors ${
                completed.includes(c.id)
                  ? 'bg-green-500 text-white'
                  : i === currentChallenge
                    ? 'bg-blue-500 text-white'
                    : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
              }`}
              disabled={completed.includes(c.id)}
            >
              {completed.includes(c.id) ? '✓' : i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Level1;
