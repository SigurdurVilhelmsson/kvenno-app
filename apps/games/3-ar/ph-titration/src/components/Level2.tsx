import { useState, useRef, useEffect, useCallback } from 'react';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { getTitrationById } from '../data/titrations';
import { indicators } from '../data/indicators';
import { calculatePH, generateTitrationCurve } from '../utils/ph-calculations';
import { Burette } from './Burette';
import { Flask } from './Flask';
import { TitrationCurve } from './TitrationCurve';
import { IndicatorSelector } from './IndicatorSelector';
import type { MonoproticTitration, IndicatorType } from '../types';

interface Level2Props {
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);

  // Titration state
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorType | null>(null);
  const [isPouring, setIsPouring] = useState(false);
  const [isSwirling, setIsSwirling] = useState(false);
  const [curveData, setCurveData] = useState<{ volume: number; pH: number }[]>([]);

  // UI state
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<'titrating' | 'select-indicator' | 'result'>('titrating');
  const [submittedVolume, setSubmittedVolume] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [indicatorCorrect, setIndicatorCorrect] = useState(false);

  const puzzle = LEVEL2_PUZZLES[currentIndex];
  const titration = getTitrationById(puzzle.titrationId) as MonoproticTitration | null;
  const maxScore = LEVEL2_PUZZLES.length * 100;

  // Calculate current pH
  const currentPH = titration ? calculatePH(titration, volumeAdded) : 7;

  // Generate curve data for current titration
  useEffect(() => {
    if (titration) {
      const fullCurve = generateTitrationCurve(titration, 60);
      setCurveData(fullCurve);
    }
  }, [titration?.id]);

  // Reset state when changing puzzles
  useEffect(() => {
    setVolumeAdded(0);
    setSelectedIndicator(null);
    setPhase('titrating');
    setShowHint(false);
    setSubmittedVolume(null);
    setIsCorrect(false);
    setIndicatorCorrect(false);
  }, [currentIndex]);

  // Check completion
  useEffect(() => {
    if (completed >= LEVEL2_PUZZLES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score, maxScore, hintsUsed);
    }
  }, [completed, score, maxScore, hintsUsed, onComplete]);

  // Pouring interval
  useEffect(() => {
    if (!isPouring || !titration) return;

    const interval = setInterval(() => {
      setVolumeAdded(prev => {
        const newVolume = Math.min(prev + 0.1, 60);
        return Math.round(newVolume * 100) / 100;
      });
      setIsSwirling(true);
    }, 50);

    return () => {
      clearInterval(interval);
      setIsSwirling(false);
    };
  }, [isPouring, titration]);

  const handleAddDrop = useCallback(() => {
    if (phase !== 'titrating') return;
    setVolumeAdded(prev => {
      const newVolume = Math.min(prev + 0.05, 60);
      return Math.round(newVolume * 1000) / 1000;
    });
    setIsSwirling(true);
    setTimeout(() => setIsSwirling(false), 200);
  }, [phase]);

  const handleAdd1mL = useCallback(() => {
    if (phase !== 'titrating') return;
    setVolumeAdded(prev => {
      const newVolume = Math.min(prev + 1, 60);
      return Math.round(newVolume * 100) / 100;
    });
    setIsSwirling(true);
    setTimeout(() => setIsSwirling(false), 300);
  }, [phase]);

  const handleAdd5mL = useCallback(() => {
    if (phase !== 'titrating') return;
    setVolumeAdded(prev => {
      const newVolume = Math.min(prev + 5, 60);
      return Math.round(newVolume * 100) / 100;
    });
    setIsSwirling(true);
    setTimeout(() => setIsSwirling(false), 500);
  }, [phase]);

  const handleSubmitVolume = () => {
    if (!titration) return;
    setSubmittedVolume(volumeAdded);
    setPhase('select-indicator');
  };

  const handleIndicatorSelect = (indicator: IndicatorType) => {
    if (phase === 'select-indicator') {
      setSelectedIndicator(indicator);
    }
  };

  const handleSubmitIndicator = () => {
    if (!titration || submittedVolume === null || !selectedIndicator) return;

    const equivalenceVolume = titration.equivalenceVolume;
    const volumeError = Math.abs(submittedVolume - equivalenceVolume);
    const volumeCorrect = volumeError <= puzzle.volumeTolerance;
    const indicatorOk = puzzle.acceptableIndicators.includes(selectedIndicator);

    setIsCorrect(volumeCorrect && indicatorOk);
    setIndicatorCorrect(indicatorOk);
    setPhase('result');

    if (volumeCorrect && indicatorOk) {
      const points = showHint ? 50 : 100;
      setScore(prev => prev + points);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setCompleted(prev => prev + 1);

    if (currentIndex < LEVEL2_PUZZLES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setVolumeAdded(0);
    setSelectedIndicator(null);
    setPhase('titrating');
    setSubmittedVolume(null);
    setIsCorrect(false);
    setIndicatorCorrect(false);
  };

  if (!titration) {
    return <div className="p-8 text-center text-red-600">Villa: Títrun fannst ekki</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              ← Til baka
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {completed + 1} / {LEVEL2_PUZZLES.length}
              </div>
              <div className="text-lg font-bold text-green-600">
                Stig: {score}
              </div>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-green-600 mt-2">
            🧪 Stig 2: Gagnvirk títrun
          </h1>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completed / LEVEL2_PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {puzzle.id}
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-green-800 mb-1">
                {titration.name}
              </h2>
              <p className="text-green-900">{puzzle.taskIs}</p>
              <p className="text-sm text-green-700 mt-2">
                <span className="font-semibold">Sýni:</span> {titration.analyte.volume} mL af {titration.analyte.molarity} M {titration.analyte.name}
                <br />
                <span className="font-semibold">Títrant:</span> {titration.titrant.molarity} M {titration.titrant.name}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Apparatus */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row items-start justify-center gap-8">
              {/* Burette */}
              <div className="flex flex-col items-center">
                <Burette
                  volumeAdded={volumeAdded}
                  maxVolume={60}
                  isAnimating={isPouring}
                />

                {/* Controls */}
                {phase === 'titrating' && (
                  <div className="mt-4 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddDrop}
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold"
                      >
                        +0.05 mL
                      </button>
                      <button
                        onClick={handleAdd1mL}
                        className="px-3 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg text-sm font-semibold"
                      >
                        +1 mL
                      </button>
                      <button
                        onClick={handleAdd5mL}
                        className="px-3 py-2 bg-blue-300 hover:bg-blue-400 text-blue-800 rounded-lg text-sm font-semibold"
                      >
                        +5 mL
                      </button>
                    </div>
                    <button
                      onMouseDown={() => setIsPouring(true)}
                      onMouseUp={() => setIsPouring(false)}
                      onMouseLeave={() => setIsPouring(false)}
                      onTouchStart={() => setIsPouring(true)}
                      onTouchEnd={() => setIsPouring(false)}
                      className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold"
                    >
                      Halda inni til að hella
                    </button>
                  </div>
                )}
              </div>

              {/* Flask */}
              <div className="flex flex-col items-center">
                <Flask
                  pH={currentPH}
                  selectedIndicator={selectedIndicator}
                  volumeAnalyte={titration.analyte.volume}
                  volumeTitrant={volumeAdded}
                  isSwirling={isSwirling}
                />
              </div>
            </div>

            {/* Titration Curve */}
            <div className="mt-6">
              <TitrationCurve
                curveData={curveData.filter(p => p.volume <= volumeAdded)}
                currentVolume={volumeAdded}
                currentPH={currentPH}
                titration={titration}
                showEquivalencePoints={phase === 'result'}
                width={600}
                height={300}
              />
            </div>

            {/* Submit volume button */}
            {phase === 'titrating' && volumeAdded > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleSubmitVolume}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold"
                >
                  Staðfesta rúmmál ({volumeAdded.toFixed(2)} mL) →
                </button>
              </div>
            )}
          </div>

          {/* Right: Indicator selector and info */}
          <div className="space-y-4">
            {/* Indicator selector */}
            <div className={phase === 'select-indicator' ? '' : 'opacity-50'}>
              <IndicatorSelector
                selectedIndicator={selectedIndicator}
                onSelect={handleIndicatorSelect}
                disabled={phase !== 'select-indicator'}
              />
            </div>

            {/* Submit indicator button */}
            {phase === 'select-indicator' && selectedIndicator && (
              <button
                onClick={handleSubmitIndicator}
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold"
              >
                Staðfesta val →
              </button>
            )}

            {/* Hint */}
            {phase !== 'result' && (
              <div>
                {showHint ? (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                    <div className="font-bold text-yellow-800 mb-1">💡 Vísbending:</div>
                    <p className="text-yellow-900 text-sm">{puzzle.hintIs}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleShowHint}
                    className="text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-2"
                  >
                    💡 Sýna vísbendingu (-50 stig)
                  </button>
                )}
              </div>
            )}

            {/* Result feedback */}
            {phase === 'result' && submittedVolume !== null && (
              <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
                <div className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '✓ Rétt!' : '✗ Ekki rétt'}
                  {isCorrect && showHint && ' (50 stig)'}
                  {isCorrect && !showHint && ' (+100 stig)'}
                </div>

                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Þitt rúmmál:</span> {submittedVolume.toFixed(2)} mL
                    <br />
                    <span className="font-semibold">Jafngildisrúmmál:</span> {titration.equivalenceVolume.toFixed(2)} mL
                    <br />
                    <span className={Math.abs(submittedVolume - titration.equivalenceVolume) <= puzzle.volumeTolerance ? 'text-green-600' : 'text-red-600'}>
                      Skekkja: ±{Math.abs(submittedVolume - titration.equivalenceVolume).toFixed(2)} mL
                      {Math.abs(submittedVolume - titration.equivalenceVolume) <= puzzle.volumeTolerance ? ' ✓' : ' ✗'}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold">Þinn vísir:</span>{' '}
                    {indicators.find(i => i.id === selectedIndicator)?.name}
                    <br />
                    <span className={indicatorCorrect ? 'text-green-600' : 'text-red-600'}>
                      {indicatorCorrect ? '✓ Góður vísir' : '✗ Ekki besti vísirinn'}
                    </span>
                  </div>
                </div>

                <div className={`mt-3 text-sm ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                  {puzzle.explanationIs}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold"
                  >
                    Reyna aftur
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
                  >
                    {currentIndex < LEVEL2_PUZZLES.length - 1 ? 'Næsta →' : 'Ljúka →'}
                  </button>
                </div>
              </div>
            )}

            {/* Phase indicator */}
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-2">Framvinda:</div>
              <div className="flex gap-2">
                <div className={`flex-1 h-2 rounded ${phase === 'titrating' ? 'bg-blue-500' : 'bg-blue-200'}`} />
                <div className={`flex-1 h-2 rounded ${phase === 'select-indicator' ? 'bg-orange-500' : phase === 'result' ? 'bg-orange-200' : 'bg-gray-300'}`} />
                <div className={`flex-1 h-2 rounded ${phase === 'result' ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Títra</span>
                <span>Vísi</span>
                <span>Niðurstaða</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
