import { useState, useRef, useEffect, useMemo } from 'react';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { generateTitrationCurve } from '../utils/ph-calculations';
import { titrations } from '../data/titrations';
import type { MonoproticTitration } from '../types';
import { HintSystem, InteractiveGraph, FeedbackPanel } from '@shared/components';
import type { DataPoint, DataSeries, MarkerConfig } from '@shared/components';
import { shuffleArray } from '@shared/utils';

// Misconceptions for titration concepts
const TITRATION_MISCONCEPTIONS: Record<string, string> = {
  equivalence: 'Jafngildi (equivalence point) er þar sem mól sýru = mól basa. pH fer ekki alltaf í 7!',
  strong_strong: 'Sterk sýra + sterkur basi gefur pH = 7 við jafngildi vegna þess að salt og vatn myndast.',
  weak_strong: 'Veik sýra + sterkur basi gefur pH > 7 við jafngildi vegna þess að samoki basinn er eftir.',
  indicator: 'Veljið vísi sem breytir lit nálægt pH við jafngildi, ekki endilega pH = 7.',
  buffer_region: 'Á milli upphafs og jafngildis er stuðpúðasvæðið þar sem pH breytist hægt.',
};

// Related concepts for titration
const TITRATION_RELATED: string[] = ['Títrun', 'Jafngildispunktur', 'Vísar', 'Stuðpúðasvæði'];

interface Level1Props {
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

// Get sample titration data for curve visualization (only monoprotic)
const strongStrongTitration = titrations.find(
  (t): t is MonoproticTitration => t.type === 'strong-strong'
);
const weakStrongTitration = titrations.find(
  (t): t is MonoproticTitration => t.type === 'weak-strong'
);

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintResetKey, setHintResetKey] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);

  const challenge = LEVEL1_CHALLENGES[currentIndex];
  const maxScore = LEVEL1_CHALLENGES.length * 100;

  // Shuffle options for current challenge - memoize to keep stable during challenge
  const shuffledOptions = useMemo(() => {
    if (!challenge.options) return [];
    const shuffled = shuffleArray(challenge.options);
    // Assign new sequential IDs (a, b, c, d) after shuffling
    return shuffled.map((opt, idx) => ({
      ...opt,
      id: String.fromCharCode(97 + idx) // 'a', 'b', 'c', 'd'
    }));
  }, [currentIndex, challenge.options]);

  useEffect(() => {
    if (completed >= LEVEL1_CHALLENGES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score, maxScore, hintsUsed);
    }
  }, [completed, score, maxScore, hintsUsed, onComplete]);

  const handleOptionSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
  };

  const handleCheck = () => {
    if (!selectedOption || showResult) return;

    const selectedOpt = shuffledOptions.find(o => o.id === selectedOption);
    const isCorrect = selectedOpt?.isCorrect ?? false;

    setShowResult(true);

    if (isCorrect) {
      const points = Math.round(100 * hintMultiplier);
      setScore(prev => prev + points);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleNext = () => {
    setCompleted(prev => prev + 1);

    if (currentIndex < LEVEL1_CHALLENGES.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setHintMultiplier(1.0);
      setHintResetKey(prev => prev + 1);
    }
  };

  const handleHintUsed = () => {
    setHintsUsed(prev => prev + 1);
  };

  const selectedOpt = shuffledOptions.find(o => o.id === selectedOption);
  const isCorrect = selectedOpt?.isCorrect ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Til baka
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {completed + 1} / {LEVEL1_CHALLENGES.length}
            </div>
            <div className="text-lg font-bold text-blue-600">
              Stig: {score}
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
          📈 Stig 1: Skilningur á títrunarkúrfum
        </h1>
        <p className="text-gray-600 mb-6">
          Lærðu að þekkja mismunandi títrunarkúrfur og skilja hvernig pH breytist.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((completed) / LEVEL1_CHALLENGES.length) * 100}%` }}
          />
        </div>

        {/* Challenge card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {challenge.id}
            </span>
            <div>
              <h2 className="text-lg font-bold text-blue-800">
                {challenge.type === 'match-curve' && 'Þekktu kúrfuna'}
                {challenge.type === 'predict-color' && 'Spáðu um litinn'}
                {challenge.type === 'find-equivalence' && 'Finndu jafngildispunkt'}
                {challenge.type === 'curve-feature' && 'Einkenni kúrfunnar'}
              </h2>
            </div>
          </div>

          <p className="text-blue-900 text-lg mb-6">
            {challenge.questionIs}
          </p>

          {/* Curve visualization for relevant challenges */}
          {(challenge.type === 'match-curve' || challenge.type === 'curve-feature') && (
            <div className="mb-6">
              <TitrationCurvePreview curveType={challenge.curveType} />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {shuffledOptions.map(option => {
              const isSelected = selectedOption === option.id;
              const isOptionCorrect = option.isCorrect;

              let bgColor = 'bg-white hover:bg-blue-50';
              let borderColor = 'border-gray-200';

              if (showResult) {
                if (isOptionCorrect) {
                  bgColor = 'bg-green-100';
                  borderColor = 'border-green-500';
                } else if (isSelected && !isOptionCorrect) {
                  bgColor = 'bg-red-100';
                  borderColor = 'border-red-500';
                }
              } else if (isSelected) {
                bgColor = 'bg-blue-100';
                borderColor = 'border-blue-500';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgColor} ${borderColor} ${
                    showResult ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-bold ${showResult && isOptionCorrect ? 'text-green-600' : 'text-blue-600'}`}>
                      {option.id}.
                    </span>
                    <span className="text-gray-800">{option.labelIs}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tiered Hint System */}
        {!showResult && (
          <div className="mb-4">
            <HintSystem
              hints={challenge.hints}
              basePoints={100}
              onHintUsed={handleHintUsed}
              onPointsChange={setHintMultiplier}
              disabled={showResult}
              resetKey={hintResetKey}
            />
          </div>
        )}

        {/* Result feedback */}
        {showResult && (
          <div className="mb-6">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: `${isCorrect ? '✓ Rétt!' : '✗ Rangt'}${isCorrect ? ` (+${Math.round(100 * hintMultiplier)} stig)` : ''}\n\n${challenge.explanationIs}`,
                misconception: isCorrect ? undefined : TITRATION_MISCONCEPTIONS.equivalence,
                relatedConcepts: TITRATION_RELATED,
                nextSteps: isCorrect
                  ? 'Frábært! Þú skilur títrunarkúrfur vel.'
                  : 'Skoðaðu kúrfuna og athugaðu hvar pH breytist mest.',
              }}
              config={{
                showExplanation: true,
                showMisconceptions: !isCorrect,
                showRelatedConcepts: true,
                showNextSteps: true,
              }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            {hintMultiplier < 1 && '💡 Vísbending notuð'}
          </div>
          <div className="flex gap-3">
            {!showResult ? (
              <button
                onClick={handleCheck}
                disabled={!selectedOption}
                className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                  selectedOption
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Staðfesta
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                {currentIndex < LEVEL1_CHALLENGES.length - 1 ? 'Næsta →' : 'Ljúka stigi →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Curve preview using InteractiveGraph
function TitrationCurvePreview({ curveType }: { curveType?: string }) {
  const { series, marker } = useMemo(() => {
    let curveData: { volume: number; pH: number }[] = [];
    let equivVolume = 25;
    let equivPH = 7;

    if (curveType === 'strong-strong' && strongStrongTitration) {
      curveData = generateTitrationCurve(strongStrongTitration, 50);
      equivVolume = strongStrongTitration.equivalenceVolume;
      equivPH = strongStrongTitration.equivalencePH;
    } else if ((curveType === 'weak-strong' || curveType === 'strong-weak') && weakStrongTitration) {
      curveData = generateTitrationCurve(weakStrongTitration, 50);
      equivVolume = weakStrongTitration.equivalenceVolume;
      equivPH = weakStrongTitration.equivalencePH;
    } else {
      // Default strong-strong curve
      curveData = Array.from({ length: 51 }, (_, i) => ({
        volume: i,
        pH: i < 24 ? 1 + (i / 24) * 2 : i < 26 ? 3 + (i - 24) * 2 : 11 + (i - 26) * 0.1
      }));
    }

    const dataPoints: DataPoint[] = curveData.map(pt => ({ x: pt.volume, y: pt.pH }));

    const curveSeries: DataSeries = {
      id: 'titration',
      data: dataPoints,
      color: '#3b82f6',
      lineWidth: 3
    };

    const equivMarker: MarkerConfig = {
      x: equivVolume,
      y: equivPH,
      color: '#22c55e',
      radius: 6,
      label: 'Jafngildispunktur'
    };

    return { series: [curveSeries], marker: equivMarker };
  }, [curveType]);

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200">
      <InteractiveGraph
        width={500}
        height={300}
        series={series}
        xAxis={{ min: 0, max: 50, label: 'Rúmmál (mL)', tickInterval: 10 }}
        yAxis={{ min: 0, max: 14, label: 'pH', tickInterval: 2 }}
        markers={[marker]}
        horizontalLines={[{
          y: 7,
          color: '#94a3b8',
          lineDash: [5, 5],
          label: 'pH 7',
          labelPosition: 'right'
        }]}
        ariaLabel="Títrunarkúrfa"
      />
    </div>
  );
}
