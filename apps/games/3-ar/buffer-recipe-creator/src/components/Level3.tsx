import { useState, useEffect, useRef } from 'react';
import { LEVEL3_PUZZLES } from '../data/level3-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { HintSystem } from '@shared/components';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

type Step = 'ratio' | 'moles' | 'volumes' | 'complete';

/**
 * Level 3: Design with Stock Solutions
 *
 * Learning Objectives:
 * - Calculate volumes from stock solutions
 * - Apply dilution formula: C1V1 = C2V2
 * - Design buffers with practical constraints
 *
 * 3-Step Flow:
 * 1. Ratio: Calculate required [Base]/[Acid] ratio
 * 2. Moles: Calculate moles of each component
 * 3. Volumes: Calculate volumes of stock solutions needed
 */
export default function Level3({
  onComplete,
  onBack,
  onCorrectAnswer,
  onIncorrectAnswer,
}: Level3Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>('ratio');
  const [score, setScore] = useState(0);
  const [hintsUsedTotal, setHintsUsedTotal] = useState(0);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintResetKey, setHintResetKey] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);

  // Step 1: Ratio
  const [ratioInput, setRatioInput] = useState('');
  const [ratioFeedback, setRatioFeedback] = useState<string | null>(null);
  const [ratioCorrect, setRatioCorrect] = useState(false);

  // Step 2: Moles
  const [acidMolesInput, setAcidMolesInput] = useState('');
  const [baseMolesInput, setBaseMolesInput] = useState('');
  const [molesFeedback, setMolesFeedback] = useState<string | null>(null);
  const [molesCorrect, setMolesCorrect] = useState(false);

  // Step 3: Volumes
  const [acidVolumeInput, setAcidVolumeInput] = useState('');
  const [baseVolumeInput, setBaseVolumeInput] = useState('');
  const [volumeFeedback, setVolumeFeedback] = useState<string | null>(null);
  const [volumeCorrect, setVolumeCorrect] = useState(false);

  // Show explanation after puzzle completion
  const [showExplanation, setShowExplanation] = useState(false);

  const puzzle = LEVEL3_PUZZLES[currentIndex];
  const problem = BUFFER_PROBLEMS.find(p => p.id === puzzle.problemId);
  const maxScore = LEVEL3_PUZZLES.length * 100;

  // Safety check
  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <p className="text-red-600 font-bold">Villa: Gat ekki fundið verkefnagögn</p>
          <button onClick={onBack} className="mt-4 text-blue-600 underline">Til baka</button>
        </div>
      </div>
    );
  }

  // Calculate correct values
  const targetMoles = puzzle.targetConcentration * (puzzle.targetVolume / 1000);
  const correctRatio = Math.pow(10, problem.targetPH - problem.pKa);
  const correctBaseMoles = targetMoles * correctRatio / (1 + correctRatio);
  const correctAcidMoles = targetMoles - correctBaseMoles;

  // Check completion
  useEffect(() => {
    if (completed >= LEVEL3_PUZZLES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score, maxScore, hintsUsedTotal);
    }
  }, [completed, score, maxScore, hintsUsedTotal, onComplete]);

  // Handle hint usage
  const handleHintUsed = () => {
    setHintsUsedTotal(prev => prev + 1);
  };

  // Step 1: Check ratio answer
  const checkRatio = () => {
    const userRatio = parseFloat(ratioInput);
    if (isNaN(userRatio) || userRatio <= 0) {
      setRatioFeedback('Vinsamlegast sláðu inn jákvæða tölu.');
      return;
    }

    const tolerance = 0.10; // 10% tolerance
    const relativeError = Math.abs(userRatio - correctRatio) / correctRatio;

    if (relativeError <= tolerance) {
      setRatioCorrect(true);
      setRatioFeedback(`Rétt! Hlutfall = ${correctRatio.toFixed(2)}. Nú skaltu reikna mól.`);
      setStep('moles');
    } else {
      setRatioFeedback(
        `Ekki rétt. Hlutfall = 10^(pH - pKa) = 10^(${problem.targetPH.toFixed(2)} - ${problem.pKa.toFixed(2)}) = 10^${(problem.targetPH - problem.pKa).toFixed(2)}`
      );
      onIncorrectAnswer?.();
    }
  };

  // Step 2: Check moles answer
  const checkMoles = () => {
    const userAcidMoles = parseFloat(acidMolesInput);
    const userBaseMoles = parseFloat(baseMolesInput);

    if (isNaN(userAcidMoles) || isNaN(userBaseMoles) || userAcidMoles <= 0 || userBaseMoles <= 0) {
      setMolesFeedback('Vinsamlegast sláðu inn jákvæðar tölur.');
      return;
    }

    const tolerance = 0.10;
    const acidError = Math.abs(userAcidMoles - correctAcidMoles) / correctAcidMoles;
    const baseError = Math.abs(userBaseMoles - correctBaseMoles) / correctBaseMoles;

    if (acidError <= tolerance && baseError <= tolerance) {
      setMolesCorrect(true);
      setMolesFeedback(`Rétt! Nú skaltu reikna rúmmál af birgðalausnum.`);
      setStep('volumes');
    } else {
      let feedback = 'Ekki rétt. ';
      feedback += `Heildar mól = ${puzzle.targetConcentration} M × ${puzzle.targetVolume/1000} L = ${targetMoles.toFixed(4)} mol. `;
      feedback += `Skiptu samkvæmt hlutfalli ${correctRatio.toFixed(2)}.`;
      setMolesFeedback(feedback);
      onIncorrectAnswer?.();
    }
  };

  // Step 3: Check volumes answer
  const checkVolumes = () => {
    const userAcidVolume = parseFloat(acidVolumeInput);
    const userBaseVolume = parseFloat(baseVolumeInput);

    if (isNaN(userAcidVolume) || isNaN(userBaseVolume) || userAcidVolume <= 0 || userBaseVolume <= 0) {
      setVolumeFeedback('Vinsamlegast sláðu inn jákvæðar tölur.');
      return;
    }

    const tolerance = puzzle.volumeTolerance;
    const acidError = Math.abs(userAcidVolume - puzzle.correctAcidVolume) / puzzle.correctAcidVolume;
    const baseError = Math.abs(userBaseVolume - puzzle.correctBaseVolume) / puzzle.correctBaseVolume;

    if (acidError <= tolerance && baseError <= tolerance) {
      setVolumeCorrect(true);
      const points = Math.round(100 * hintMultiplier);
      setScore(prev => prev + points);
      setVolumeFeedback(`Frábært! +${points} stig`);
      setShowExplanation(true);
      setStep('complete');
      onCorrectAnswer?.();
    } else {
      let feedback = 'Ekki rétt. ';
      feedback += `Muna: V = n / C (rúmmál = mól / styrkur birgðalausnar).`;
      if (acidError > tolerance) {
        feedback += ` Sýrurúmmál er ${userAcidVolume > puzzle.correctAcidVolume ? 'of hátt' : 'of lágt'}.`;
      }
      if (baseError > tolerance) {
        feedback += ` Basarúmmál er ${userBaseVolume > puzzle.correctBaseVolume ? 'of hátt' : 'of lágt'}.`;
      }
      setVolumeFeedback(feedback);
      onIncorrectAnswer?.();
    }
  };

  // Next puzzle
  const nextPuzzle = () => {
    setCompleted(prev => prev + 1);

    if (currentIndex < LEVEL3_PUZZLES.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetPuzzleState();
    }
  };

  // Reset puzzle state
  const resetPuzzleState = () => {
    setStep('ratio');
    setRatioInput('');
    setRatioFeedback(null);
    setRatioCorrect(false);
    setAcidMolesInput('');
    setBaseMolesInput('');
    setMolesFeedback(null);
    setMolesCorrect(false);
    setAcidVolumeInput('');
    setBaseVolumeInput('');
    setVolumeFeedback(null);
    setVolumeCorrect(false);
    setShowExplanation(false);
    setHintMultiplier(1.0);
    setHintResetKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
                {completed + 1} / {LEVEL3_PUZZLES.length}
              </div>
              <div className="text-lg font-bold text-green-600">
                Stig: {score}
              </div>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold mt-2 text-green-700">
            Stuðpúðasmíði - Stig 3
          </h1>
          <p className="text-gray-600 text-sm">Birgðalausnir og rúmmálsútreikningar</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-green-500"
              style={{ width: `${(completed / LEVEL3_PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border-t-4 border-green-500">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-white text-sm font-bold px-3 py-1 rounded-full bg-green-600">
              #{puzzle.id}
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{problem.system}</h2>
              <p className="text-gray-700 mt-1">{puzzle.taskIs}</p>
            </div>
          </div>

          {/* Problem Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-500">pKa</div>
              <div className="text-lg font-bold text-gray-800">{problem.pKa}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-500">Markmið pH</div>
              <div className="text-lg font-bold text-green-600">{problem.targetPH}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-500">Lokarúmmál</div>
              <div className="text-lg font-bold text-gray-800">{puzzle.targetVolume} mL</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-500">Lokastyrkur</div>
              <div className="text-lg font-bold text-gray-800">{puzzle.targetConcentration} M</div>
            </div>
          </div>

          {/* Stock Solution Info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-red-50 p-3 rounded-lg border-2 border-red-200">
              <div className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <span className="text-lg">🧪</span> Sýrubirgð
              </div>
              <div className="font-bold text-red-800">{problem.acidName}</div>
              <div className="text-sm text-red-600">{puzzle.stockAcidConc} M birgðalausn</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
              <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                <span className="text-lg">🧪</span> Basabirgð
              </div>
              <div className="font-bold text-blue-800">{problem.baseName}</div>
              <div className="text-sm text-blue-600">{puzzle.stockBaseConc} M birgðalausn</div>
            </div>
          </div>

          {/* Context */}
          {problem.context && (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
              <p className="text-sm text-green-800">{problem.context}</p>
            </div>
          )}

          {/* Hint System */}
          <div className="mb-4">
            <HintSystem
              hints={puzzle.hints}
              basePoints={100}
              onHintUsed={handleHintUsed}
              onPointsChange={setHintMultiplier}
              disabled={step === 'complete'}
              resetKey={hintResetKey}
            />
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step === 'ratio' ? 'font-bold' : ''}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                ratioCorrect ? 'bg-green-500 text-white' : step === 'ratio' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {ratioCorrect ? '✓' : '1'}
              </div>
              <div className="text-xs text-gray-600">Hlutfall</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-gray-200" />
            <div className={`flex-1 text-center ${step === 'moles' ? 'font-bold' : ''}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                molesCorrect ? 'bg-green-500 text-white' : step === 'moles' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {molesCorrect ? '✓' : '2'}
              </div>
              <div className="text-xs text-gray-600">Mól</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-gray-200" />
            <div className={`flex-1 text-center ${step === 'volumes' || step === 'complete' ? 'font-bold' : ''}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                volumeCorrect ? 'bg-green-500 text-white' : step === 'volumes' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {volumeCorrect ? '✓' : '3'}
              </div>
              <div className="text-xs text-gray-600">Rúmmál</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Step 1: Ratio */}
          {step === 'ratio' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Skref 1: Reiknaðu [Basi]/[Sýra] hlutfallið
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Formúla:</strong> Hlutfall = 10<sup>(pH - pKa)</sup> = 10<sup>({problem.targetPH} - {problem.pKa})</sup>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hlutfall [Basi]/[Sýra]:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ratioInput}
                  onChange={(e) => setRatioInput(e.target.value)}
                  placeholder="t.d. 1.58"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              {ratioFeedback && (
                <div className={`p-3 rounded-lg mb-4 ${
                  ratioFeedback.includes('Rétt') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {ratioFeedback}
                </div>
              )}

              <button
                onClick={checkRatio}
                disabled={!ratioInput}
                className="w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
              >
                Athuga svar
              </button>
            </div>
          )}

          {/* Step 2: Moles */}
          {step === 'moles' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Skref 2: Reiknaðu mól af sýru og basa
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Heildar mól:</strong> n = C × V = {puzzle.targetConcentration} M × {puzzle.targetVolume/1000} L = {targetMoles.toFixed(4)} mol
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Skipting:</strong> Notaðu hlutfallið {correctRatio.toFixed(2)} til að skipta mólum.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Mól sýru:
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={acidMolesInput}
                    onChange={(e) => setAcidMolesInput(e.target.value)}
                    placeholder="t.d. 0.0039"
                    className="w-full p-3 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Mól basa:
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={baseMolesInput}
                    onChange={(e) => setBaseMolesInput(e.target.value)}
                    placeholder="t.d. 0.0061"
                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {molesFeedback && (
                <div className={`p-3 rounded-lg mb-4 ${
                  molesFeedback.includes('Rétt') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {molesFeedback}
                </div>
              )}

              <button
                onClick={checkMoles}
                disabled={!acidMolesInput || !baseMolesInput}
                className="w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
              >
                Athuga svar
              </button>
            </div>
          )}

          {/* Step 3: Volumes */}
          {step === 'volumes' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Skref 3: Reiknaðu rúmmál af birgðalausnum (í mL)
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Formúla:</strong> V = n / C (rúmmál = mól / styrkur birgðalausnar)
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Sýrubirgð er {puzzle.stockAcidConc} M, basabirgð er {puzzle.stockBaseConc} M
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Rúmmál sýru (mL):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={acidVolumeInput}
                    onChange={(e) => setAcidVolumeInput(e.target.value)}
                    placeholder="t.d. 7.76"
                    className="w-full p-3 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Rúmmál basa (mL):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={baseVolumeInput}
                    onChange={(e) => setBaseVolumeInput(e.target.value)}
                    placeholder="t.d. 12.24"
                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {volumeFeedback && (
                <div className={`p-3 rounded-lg mb-4 ${
                  volumeFeedback.includes('Frábært') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {volumeFeedback}
                </div>
              )}

              <button
                onClick={checkVolumes}
                disabled={!acidVolumeInput || !baseVolumeInput}
                className="w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
              >
                Athuga svar
              </button>
            </div>
          )}

          {/* Completion & Explanation */}
          {step === 'complete' && showExplanation && (
            <div>
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-green-800 mb-2">Rétt svar!</h3>
                <p className="text-green-700 mb-3">{puzzle.explanationIs}</p>

                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Útreikningur:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Hlutfall = 10^({problem.targetPH} - {problem.pKa}) = {correctRatio.toFixed(2)}</li>
                    <li>• Heildar mól = {puzzle.targetConcentration} M × {puzzle.targetVolume/1000} L = {targetMoles.toFixed(4)} mol</li>
                    <li>• Sýra: {correctAcidMoles.toFixed(4)} mol / {puzzle.stockAcidConc} M = {puzzle.correctAcidVolume} mL</li>
                    <li>• Basi: {correctBaseMoles.toFixed(4)} mol / {puzzle.stockBaseConc} M = {puzzle.correctBaseVolume} mL</li>
                    <li>• Vatn: {puzzle.targetVolume} - {puzzle.correctAcidVolume} - {puzzle.correctBaseVolume} ≈ {puzzle.correctWaterVolume} mL</li>
                  </ul>
                </div>

                {/* Visual Recipe Card */}
                <div className="mt-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-4 border-2 border-green-300">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">📋</span> Uppskrift
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">1</span>
                      <span>Bættu <strong>{puzzle.correctAcidVolume} mL</strong> af {puzzle.stockAcidConc} M {problem.acidName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                      <span>Bættu <strong>{puzzle.correctBaseVolume} mL</strong> af {puzzle.stockBaseConc} M {problem.baseName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs">3</span>
                      <span>Fylltu upp í <strong>{puzzle.targetVolume} mL</strong> með eimuðu vatni</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={nextPuzzle}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
              >
                {currentIndex < LEVEL3_PUZZLES.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →'}
              </button>
            </div>
          )}
        </div>

        {/* Formula Reference */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">📐 Lykilformúlur</h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <p><strong>Henderson-Hasselbalch:</strong> pH = pK<sub>a</sub> + log([A⁻]/[HA])</p>
            <p><strong>Hlutfall:</strong> [A⁻]/[HA] = 10<sup>(pH - pK<sub>a</sub>)</sup></p>
            <p><strong>Mól:</strong> n = C × V</p>
            <p><strong>Þynning:</strong> V<sub>birgð</sub> = n / C<sub>birgð</sub></p>
          </div>
        </div>
      </div>
    </div>
  );
}
