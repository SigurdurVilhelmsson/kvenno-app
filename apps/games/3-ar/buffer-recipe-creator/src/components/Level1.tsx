import { useState, useEffect, useRef } from 'react';
import { LEVEL1_CHALLENGES, type Level1Challenge } from '../data';
import { HintSystem, FeedbackPanel } from '@shared/components';
import { BufferCapacityVisualization } from './BufferCapacityVisualization';

// Misconceptions for buffer concepts
const BUFFER_MISCONCEPTIONS = {
  ratio_low: 'Ef hlutfallið [Basi]/[Sýra] er of lágt, þá er of mikið af sýru og pH verður lægra en markmiðið.',
  ratio_high: 'Ef hlutfallið [Basi]/[Sýra] er of hátt, þá er of mikið af basa og pH verður hærra en markmiðið.',
  equal: 'Þegar [Basi] = [Sýra], þá er pH = pKa. Þetta er miðpunktur stuðpúðans.',
  concept: 'Stuðpúðar virka vegna þess að veika sýran og samoki basinn geta tekið við eða gefið frá sér H⁺ jónir.',
};

// Related concepts for buffers
const BUFFER_RELATED: string[] = ['Henderson-Hasselbalch', 'pKa', 'Stuðpúðargeta', 'Veik sýru-basa pör'];

interface Level1Props {
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
  onLevelComplete?: (score: number, maxScore: number, hintsUsed: number) => void;
}

/**
 * Level 1: Buffer Builder - Conceptual Foundation
 *
 * Learning Objectives:
 * - Understand buffers need BOTH weak acid and conjugate base
 * - Visualize how ratio affects pH
 * - Learn that equal amounts -> pH = pKa
 * - NO calculations - pure conceptual understanding
 */

export default function Level1({
  onCorrectAnswer,
  onIncorrectAnswer,
  onLevelComplete,
}: Level1Props) {
  const [currentChallenge, setCurrentChallenge] = useState<Level1Challenge>(LEVEL1_CHALLENGES[0]);
  const [acidCount, setAcidCount] = useState(5);
  const [baseCount, setBaseCount] = useState(5);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [hintsUsedTotal, setHintsUsedTotal] = useState(0);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [, setHintsUsedTier] = useState(0);
  const [hintResetKey, setHintResetKey] = useState(0);
  const levelCompleteReported = useRef(false);

  // Calculate current ratio [Base]/[Acid]
  const currentRatio = acidCount > 0 ? baseCount / acidCount : 0;

  // Estimate pH using simplified Henderson-Hasselbalch
  // pH = pKa + log([Base]/[Acid])
  const estimatedPH = acidCount > 0 && baseCount > 0
    ? currentChallenge.pKa + Math.log10(currentRatio)
    : currentChallenge.pKa;

  // Get pH color
  const getPhColor = (pH: number): string => {
    if (pH < 4) return '#ef4444'; // red
    if (pH < 6) return '#f97316'; // orange
    if (pH < 8) return '#eab308'; // yellow
    if (pH < 10) return '#22c55e'; // green
    return '#3b82f6'; // blue
  };

  // Check if ratio is within target range
  const isCorrect = currentRatio >= currentChallenge.targetRatioMin &&
                    currentRatio <= currentChallenge.targetRatioMax;

  // Calculate ratio bar percentages
  const totalMolecules = acidCount + baseCount;
  const acidPercent = totalMolecules > 0 ? (acidCount / totalMolecules) * 100 : 50;
  const basePercent = totalMolecules > 0 ? (baseCount / totalMolecules) * 100 : 50;

  // Handle molecule addition
  const addAcid = () => {
    if (acidCount < 20) setAcidCount(acidCount + 1);
    setFeedback(null);
    setShowExplanation(false);
  };

  const removeAcid = () => {
    if (acidCount > 0) setAcidCount(acidCount - 1);
    setFeedback(null);
    setShowExplanation(false);
  };

  const addBase = () => {
    if (baseCount < 20) setBaseCount(baseCount + 1);
    setFeedback(null);
    setShowExplanation(false);
  };

  const removeBase = () => {
    if (baseCount > 0) setBaseCount(baseCount - 1);
    setFeedback(null);
    setShowExplanation(false);
  };

  // Handle hint usage from HintSystem
  const handleHintUsed = (tier: 1 | 2 | 3 | 4) => {
    setHintsUsedTier(tier);
    setHintsUsedTotal(prev => prev + 1);
  };

  // Check answer
  const checkBuffer = () => {
    if (acidCount === 0 || baseCount === 0) {
      setFeedback('Stuðpúði þarf BÆÐI sýru og basa!');
      onIncorrectAnswer?.();
      return;
    }

    if (isCorrect) {
      const basePoints = 100;
      const points = Math.round(basePoints * hintMultiplier);
      setScore(score + points);
      setFeedback(`Frábært! Stuðpúðinn er tilbúinn! +${points} stig`);
      setChallengesCompleted(challengesCompleted + 1);
      setShowExplanation(true);
      onCorrectAnswer?.();
    } else {
      const phDiff = Math.abs(estimatedPH - currentChallenge.targetPH);
      if (phDiff < 0.5) {
        setFeedback('Næstum rétt! Fínstilltu hlutfallið aðeins.');
      } else if (estimatedPH > currentChallenge.targetPH) {
        setFeedback('pH er of hátt. Bættu við SÝRU eða fjarlægðu BASA.');
      } else {
        setFeedback('pH er of lágt. Bættu við BASA eða fjarlægðu SÝRU.');
      }
      onIncorrectAnswer?.();
    }
  };

  // Next challenge
  const nextChallenge = () => {
    const currentIndex = LEVEL1_CHALLENGES.findIndex(c => c.id === currentChallenge.id);
    const nextIndex = (currentIndex + 1) % LEVEL1_CHALLENGES.length;
    setCurrentChallenge(LEVEL1_CHALLENGES[nextIndex]);
    setAcidCount(5);
    setBaseCount(5);
    setFeedback(null);
    setShowExplanation(false);
    setHintMultiplier(1.0);
    setHintsUsedTier(0);
    setHintResetKey(prev => prev + 1);
  };

  // Track level completion when all challenges are done
  const maxScore = LEVEL1_CHALLENGES.length * 100;
  useEffect(() => {
    if (challengesCompleted >= LEVEL1_CHALLENGES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onLevelComplete?.(score, maxScore, hintsUsedTotal);
    }
  }, [challengesCompleted, score, maxScore, hintsUsedTotal, onLevelComplete]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#f36b22' }}>
          Stuðpúðasmíði - Stig 1
        </h1>
        <p className="text-lg text-gray-600">
          Skildu hvernig hlutfall sýru/basa hefur áhrif á pH
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{score}</div>
          <div className="text-sm text-gray-600">Stig</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{challengesCompleted}</div>
          <div className="text-sm text-gray-600">Kláruð</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {LEVEL1_CHALLENGES.length}
          </div>
          <div className="text-sm text-gray-600">Samtals</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Challenge & Instructions */}
        <div className="space-y-6">
          {/* Challenge Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Verkefni #{currentChallenge.id}
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-3">{currentChallenge.system}</h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-gray-700">{currentChallenge.context}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">pKa</div>
                <div className="text-xl font-bold">{currentChallenge.pKa}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Markmið pH</div>
                <div className="text-xl font-bold" style={{ color: '#f36b22' }}>
                  {currentChallenge.targetPH}
                </div>
              </div>
            </div>

            {/* Tiered Hint System */}
            <div className="mb-4">
              <HintSystem
                hints={currentChallenge.hints}
                basePoints={100}
                onHintUsed={handleHintUsed}
                onPointsChange={setHintMultiplier}
                disabled={showExplanation}
                resetKey={hintResetKey}
              />
            </div>

            {/* Key Concept */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Lykilhugmynd:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• pH = pKa þegar [Basi] = [Sýra]</li>
                <li>• Meira af basa → Hærra pH</li>
                <li>• Meira af sýru → Lægra pH</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Visual Flask & Controls */}
        <div className="space-y-6">
          {/* Flask Visualization */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Þinn stuðpúði</h3>

            {/* pH Indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Núverandi pH:</span>
                <span className="text-2xl font-bold" style={{ color: getPhColor(estimatedPH) }}>
                  {estimatedPH.toFixed(2)}
                </span>
              </div>
              <div className="h-8 rounded-full relative overflow-hidden"
                   style={{ background: getPhColor(estimatedPH) }}>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  {estimatedPH < currentChallenge.targetPH - 0.1 && 'Of súrt'}
                  {estimatedPH > currentChallenge.targetPH + 0.1 && 'Of basískt'}
                  {Math.abs(estimatedPH - currentChallenge.targetPH) <= 0.1 && 'Fullkomið!'}
                </div>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2 text-center">Hlutfall sýru/basa</div>
              <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
                <div
                  className="bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
                  style={{ width: `${acidPercent}%` }}
                >
                  {acidPercent > 15 && `${acidCount}`}
                </div>
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
                  style={{ width: `${basePercent}%` }}
                >
                  {basePercent > 15 && `${baseCount}`}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sýra (HA)</span>
                <span>Basi (A⁻)</span>
              </div>
            </div>

            {/* Molecule Display */}
            <div className="border-4 rounded-lg p-6 mb-6 transition-colors duration-300"
                 style={{
                   borderColor: isCorrect ? '#22c55e' : '#cbd5e1',
                   backgroundColor: '#f8fafc',
                   minHeight: '280px'
                 }}>

              {/* Acid Molecules */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-red-600">{currentChallenge.acidName}</span>
                  <span className="text-sm font-mono bg-red-100 px-2 py-1 rounded">
                    Fjöldi: {acidCount}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] bg-red-50 rounded-lg p-3">
                  {Array.from({ length: acidCount }).map((_, i) => (
                    <div key={`acid-${i}`}
                         className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-all duration-200 hover:scale-110"
                         style={{
                           animation: `fadeIn 0.2s ease-out ${i * 0.02}s both`
                         }}>
                      HA
                    </div>
                  ))}
                </div>
              </div>

              {/* Base Molecules */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-600">{currentChallenge.baseName}</span>
                  <span className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                    Fjöldi: {baseCount}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] bg-blue-50 rounded-lg p-3">
                  {Array.from({ length: baseCount }).map((_, i) => (
                    <div key={`base-${i}`}
                         className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-all duration-200 hover:scale-110"
                         style={{
                           animation: `fadeIn 0.2s ease-out ${i * 0.02}s both`
                         }}>
                      A⁻
                    </div>
                  ))}
                </div>
              </div>

              {/* Ratio Display */}
              <div className="mt-4 bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 mb-1">Hlutfall [Basi]/[Sýra]</div>
                <div className="text-3xl font-bold transition-colors duration-300" style={{ color: isCorrect ? '#22c55e' : '#f36b22' }}>
                  {acidCount > 0 ? currentRatio.toFixed(2) : '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Markmið: {currentChallenge.targetRatioMin.toFixed(1)} - {currentChallenge.targetRatioMax.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-center font-bold text-red-600 mb-2">Sýra</div>
                <div className="flex gap-2">
                  <button
                    onClick={removeAcid}
                    disabled={acidCount === 0}
                    className="flex-1 py-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-bold transition-colors"
                  >
                    − Fjarlægja
                  </button>
                  <button
                    onClick={addAcid}
                    disabled={acidCount >= 20}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg font-bold transition-colors"
                  >
                    + Bæta við
                  </button>
                </div>
              </div>

              <div>
                <div className="text-center font-bold text-blue-600 mb-2">Basi</div>
                <div className="flex gap-2">
                  <button
                    onClick={removeBase}
                    disabled={baseCount === 0}
                    className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-bold transition-colors"
                  >
                    − Fjarlægja
                  </button>
                  <button
                    onClick={addBase}
                    disabled={baseCount >= 20}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-bold transition-colors"
                  >
                    + Bæta við
                  </button>
                </div>
              </div>
            </div>

            {/* Check Button */}
            <button
              onClick={checkBuffer}
              className="w-full py-3 px-6 text-white font-bold text-lg rounded-lg transition-colors mb-3 hover:opacity-90"
              style={{ backgroundColor: '#f36b22' }}
            >
              Athuga stuðpúða
            </button>

            {/* Feedback */}
            {feedback && (
              <div className="mb-3">
                <FeedbackPanel
                  feedback={{
                    isCorrect: feedback.includes('Frábært'),
                    explanation: showExplanation
                      ? `${feedback} ${currentChallenge.explanation}`
                      : feedback,
                    misconception: feedback.includes('Frábært')
                      ? undefined
                      : currentRatio < 1
                        ? BUFFER_MISCONCEPTIONS.ratio_low
                        : BUFFER_MISCONCEPTIONS.ratio_high,
                    relatedConcepts: BUFFER_RELATED,
                    nextSteps: feedback.includes('Frábært')
                      ? 'Frábært! Þú skilur hvernig hlutfallið hefur áhrif á pH.'
                      : 'Stilltu hlutfallið [Basi]/[Sýra] til að ná markmiðs-pH.',
                  }}
                  config={{
                    showExplanation: true,
                    showMisconceptions: !feedback.includes('Frábært'),
                    showRelatedConcepts: true,
                    showNextSteps: true,
                  }}
                />
              </div>
            )}

            {/* Next Button */}
            {isCorrect && feedback && (
              <button
                onClick={nextChallenge}
                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg transition-colors"
              >
                Næsta verkefni →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Buffer Capacity Visualization */}
      <div className="mt-8">
        <BufferCapacityVisualization
          pKa={currentChallenge.pKa}
          acidConc={acidCount * 0.01} // Convert count to concentration
          baseConc={baseCount * 0.01}
          totalConc={(acidCount + baseCount) * 0.01}
          acidName={currentChallenge.acidName}
          baseName={currentChallenge.baseName}
          showAdditionSim={true}
        />
      </div>

      {/* Educational Footer */}
      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-3">Hvað ertu að læra?</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded p-3">
            <div className="font-bold mb-1">1. Samsetning stuðpúða</div>
            <p className="text-gray-600">Stuðpúði þarf BÆÐI veika sýru og samoka basa hennar</p>
          </div>
          <div className="bg-white rounded p-3">
            <div className="font-bold mb-1">2. Hlutfall skiptir máli</div>
            <p className="text-gray-600">Hlutfall [Basi]/[Sýra] ákvarðar pH stuðpúðans</p>
          </div>
          <div className="bg-white rounded p-3">
            <div className="font-bold mb-1">3. pKa er miðpunktur</div>
            <p className="text-gray-600">Þegar pH = pKa, þá er jafnt af sýru og basa</p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
