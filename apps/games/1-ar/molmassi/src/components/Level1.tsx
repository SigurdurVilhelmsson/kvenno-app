import { useState, useEffect } from 'react';

import { FeedbackPanel, MoleculeViewer3DLazy } from '@shared/components';

import { elementsToMolecule } from '../utils/moleculeConverter';
import type { Challenge } from '../utils/challengeGenerator';
import { generateChallenge } from '../utils/challengeGenerator';
import { getDetailedFeedback } from '../utils/feedbackGenerator';

import { ATOM_VISUALS, AtomCircle, MoleculeVisual } from './AtomVisuals';
import { GameComplete } from './GameComplete';
import { PeriodicTable } from './PeriodicTable';

interface Level1Props {
  onBack: () => void;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

// Main Level 1 Component
export function Level1({ onBack, onComplete, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [challengeNumber, setChallengeNumber] = useState(0);
  const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge(0));
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintsUsedTier, setHintsUsedTier] = useState(0);
  const [_totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);

  // For build_molecule challenge
  const [builtAtoms, setBuiltAtoms] = useState<{ symbol: string; count: number }[]>([]);

  const totalChallenges = 8;
  const masteryThreshold = 6; // 6/8 = 75% required to pass
  const hasMastery = correctCount >= masteryThreshold;
  const isComplete = challengeNumber >= totalChallenges || hasMastery;

  // Reset built atoms when challenge changes
  useEffect(() => {
    setBuiltAtoms([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setHintMultiplier(1.0);
    setHintsUsedTier(0);
    setShowHint(false);
  }, [challenge]);

  const checkAnswer = (answer: number | string) => {
    setSelectedAnswer(answer);
    let correct = false;

    switch (challenge.type) {
      case 'count_atoms':
        correct = answer === challenge.correctCount;
        break;

      case 'compare_mass': {
        const isHeavier = challenge.compound.molarMass > (challenge.compareCompound?.molarMass || 0);
        correct = (answer === 'first' && isHeavier) || (answer === 'second' && !isHeavier);
        break;
      }

      case 'estimate_range':
        correct = answer === challenge.correctRangeIndex;
        break;

      case 'build_molecule': {
        // Check if built atoms match the compound
        const targetElements = [...challenge.compound.elements].sort((a, b) => a.symbol.localeCompare(b.symbol));
        const builtElements = [...builtAtoms].sort((a, b) => a.symbol.localeCompare(b.symbol));
        correct = JSON.stringify(targetElements) === JSON.stringify(builtElements);
        break;
      }
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = Math.round(10 * hintMultiplier);
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const nextChallenge = () => {
    const next = challengeNumber + 1;
    setChallengeNumber(next);
    if (next < totalChallenges) {
      setChallenge(generateChallenge(next));
    }
  };

  const addAtom = (symbol: string) => {
    setBuiltAtoms(prev => {
      const existing = prev.find(a => a.symbol === symbol);
      if (existing) {
        return prev.map(a => a.symbol === symbol ? { ...a, count: a.count + 1 } : a);
      }
      return [...prev, { symbol, count: 1 }];
    });
  };

  const removeAtom = (symbol: string) => {
    setBuiltAtoms(prev => {
      const existing = prev.find(a => a.symbol === symbol);
      if (existing && existing.count > 1) {
        return prev.map(a => a.symbol === symbol ? { ...a, count: a.count - 1 } : a);
      }
      return prev.filter(a => a.symbol !== symbol);
    });
  };

  const checkBuiltMolecule = () => {
    checkAnswer('build');
  };

  const resetGame = () => {
    setChallengeNumber(0);
    setScore(0);
    setCorrectCount(0);
    setChallenge(generateChallenge(0));
    setHintMultiplier(1.0);
    setHintsUsedTier(0);
  };

  // Game complete screen with celebration
  if (isComplete) {
    const questionsAnswered = challengeNumber + (showFeedback ? 1 : 0);

    return (
      <GameComplete
        passedLevel={hasMastery}
        correctCount={correctCount}
        questionsAnswered={questionsAnswered}
        score={score}
        masteryThreshold={masteryThreshold}
        hintsUsedTier={hintsUsedTier}
        totalChallenges={totalChallenges}
        onComplete={onComplete}
        onReplay={resetGame}
        onBack={onBack}
      />
    );
  }

  // Challenge-specific content
  const renderChallenge = () => {
    switch (challenge.type) {
      case 'count_atoms':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Hversu margar <span className="font-bold">{ATOM_VISUALS[challenge.targetElement!]?.name || challenge.targetElement}</span> frumeindir
                ({challenge.targetElement}) eru í <span className="font-bold">{challenge.compound.name}</span>?
              </p>

              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>

              {viewMode === '2d' ? (
                <MoleculeVisual elements={challenge.compound.elements} />
              ) : (
                <div className="bg-gray-900 rounded-xl p-4">
                  <MoleculeViewer3DLazy
                    molecule={elementsToMolecule(challenge.compound.elements, challenge.compound.formula, challenge.compound.name)}
                    style="ball-stick"
                    showLabels={true}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    height={180}
                    backgroundColor="transparent"
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    Dragðu til að snúa, skrollaðu til að stækka
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => !showFeedback && checkAnswer(num)}
                  disabled={showFeedback}
                  className={`w-14 h-14 rounded-xl font-bold text-xl transition-all ${
                    showFeedback && selectedAnswer === num
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : showFeedback && num === challenge.correctCount
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Líttu á lítlu tölurnar í formúlunni.
                  Talan við hliðina á {challenge.targetElement} segir þér hversu margar eru!
                </p>
              </div>
            )}
          </div>
        );

      case 'compare_mass':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Hvort efnið er <span className="font-bold">þyngra</span>?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => !showFeedback && checkAnswer('first')}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-2 transition-all ${
                  showFeedback && selectedAnswer === 'first'
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : showFeedback && challenge.compound.molarMass > (challenge.compareCompound?.molarMass || 0)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary hover:bg-orange-50'
                }`}
              >
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {challenge.compound.formula}
                </div>
                <div className="text-sm text-gray-600 mb-3">{challenge.compound.name}</div>
                {viewMode === '2d' ? (
                  <MoleculeVisual elements={challenge.compound.elements} />
                ) : (
                  <div className="bg-gray-900 rounded-lg p-2">
                    <MoleculeViewer3DLazy
                      molecule={elementsToMolecule(challenge.compound.elements, challenge.compound.formula, challenge.compound.name)}
                      style="ball-stick"
                      showLabels={true}
                      autoRotate={true}
                      autoRotateSpeed={2}
                      height={120}
                      backgroundColor="transparent"
                    />
                  </div>
                )}
              </button>

              <button
                onClick={() => !showFeedback && checkAnswer('second')}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-2 transition-all ${
                  showFeedback && selectedAnswer === 'second'
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : showFeedback && (challenge.compareCompound?.molarMass || 0) > challenge.compound.molarMass
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary hover:bg-orange-50'
                }`}
              >
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {challenge.compareCompound?.formula}
                </div>
                <div className="text-sm text-gray-600 mb-3">{challenge.compareCompound?.name}</div>
                {viewMode === '2d' ? (
                  <MoleculeVisual elements={challenge.compareCompound?.elements || []} />
                ) : (
                  <div className="bg-gray-900 rounded-lg p-2">
                    <MoleculeViewer3DLazy
                      molecule={elementsToMolecule(challenge.compareCompound?.elements || [], challenge.compareCompound?.formula || '', challenge.compareCompound?.name)}
                      style="ball-stick"
                      showLabels={true}
                      autoRotate={true}
                      autoRotateSpeed={2}
                      height={120}
                      backgroundColor="transparent"
                    />
                  </div>
                )}
              </button>
            </div>

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Stærri frumeindir eru þyngri.
                  Fleiri frumeindir þýðir einnig meiri massa!
                </p>
              </div>
            )}
          </div>
        );

      case 'build_molecule': {
        // Get available elements from the compound
        const availableElements = [...new Set(challenge.compound.elements.map(e => e.symbol))];

        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">
                Byggðu sameindina <span className="font-bold">{challenge.compound.name}</span>
              </p>
              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>
            </div>

            {/* Built molecule display */}
            <div className="bg-gray-100 rounded-xl p-4 min-h-[100px]">
              <div className="text-xs text-gray-500 mb-2 text-center">Þín sameind:</div>
              {builtAtoms.length > 0 ? (
                <MoleculeVisual elements={builtAtoms} showMassBar={true} />
              ) : (
                <div className="text-center text-gray-400 py-4">
                  Smelltu á frumeindir til að bæta þeim við
                </div>
              )}
            </div>

            {/* Atom palette */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-3 text-center">Veldu frumeindir:</div>
              <div className="flex flex-wrap justify-center gap-4">
                {availableElements.map(symbol => {
                  const count = builtAtoms.find(a => a.symbol === symbol)?.count || 0;
                  return (
                    <div key={symbol} className="flex flex-col items-center gap-2">
                      <AtomCircle
                        symbol={symbol}
                        onClick={() => !showFeedback && addAtom(symbol)}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => !showFeedback && removeAtom(symbol)}
                          disabled={showFeedback || count === 0}
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold">{count}</span>
                        <button
                          onClick={() => !showFeedback && addAtom(symbol)}
                          disabled={showFeedback}
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!showFeedback && (
              <button
                onClick={checkBuiltMolecule}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Athuga sameind
              </button>
            )}

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Líttu á formúluna. Tölurnar segja þér nákvæmlega
                  hversu margar af hverri frumeind þú þarft!
                </p>
              </div>
            )}
          </div>
        );
      }

      case 'estimate_range':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Í hvaða massabil fellur <span className="font-bold">{challenge.compound.name}</span>?
              </p>

              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>

              {viewMode === '2d' ? (
                <MoleculeVisual elements={challenge.compound.elements} showMassBar={true} />
              ) : (
                <div className="bg-gray-900 rounded-xl p-4 mb-4">
                  <MoleculeViewer3DLazy
                    molecule={elementsToMolecule(challenge.compound.elements, challenge.compound.formula, challenge.compound.name)}
                    style="ball-stick"
                    showLabels={true}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    height={180}
                    backgroundColor="transparent"
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    Dragðu til að snúa, skrollaðu til að stækka
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {challenge.ranges?.map((range, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && checkAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                    showFeedback && selectedAnswer === index
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : showFeedback && index === challenge.correctRangeIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Hugsaðu um stærðina á frumeindunum og hversu margar eru.
                  H er um 1 g/mol, O er um 16 g/mol, C er um 12 g/mol.
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  const getChallengeTitle = () => {
    switch (challenge.type) {
      case 'count_atoms': return 'Telja frumeindir';
      case 'compare_mass': return 'Bera saman massa';
      case 'build_molecule': return 'Byggja sameind';
      case 'estimate_range': return 'Áætla massabil';
      default: return 'Áskorun';
    }
  };

  // Note: TieredHints available via HintSystem component for future integration
  // getChallengeHints() can be implemented when HintSystem is added to this game

  // Hints available via getChallengeHints() for future HintSystem integration

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mólmassi - Stig 1</h1>
              <p className="text-sm text-gray-600">Skildu sameindir án útreikninga</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-xs text-gray-600">Stig</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Áskorun {challengeNumber + 1}/{totalChallenges}</span>
              <span>{getChallengeTitle()}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((challengeNumber + 1) / totalChallenges) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Toolbar: 2D/3D Toggle + Periodic Table */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === '2d'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === '3d'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              3D
            </button>
          </div>

          {/* Periodic Table Button */}
          <button
            onClick={() => setShowPeriodicTable(true)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-1"
          >
            <span>📊</span> Lotukerfið
          </button>
        </div>

        {/* Challenge Card with entrance animation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 card-enter" key={challengeNumber}>
          {renderChallenge()}
        </div>

        {/* Detailed Feedback with FeedbackPanel */}
        {showFeedback && (
          <div className="mb-4 animate-fade-in-up">
            <FeedbackPanel
              feedback={getDetailedFeedback(challenge, isCorrect)}
              config={{
                showExplanation: true,
                showMisconceptions: true,
                showRelatedConcepts: true,
                showNextSteps: true,
              }}
              className="mb-3"
            />

            {isCorrect && (
              <p className="text-green-700 text-sm text-center mb-3">+{Math.round(10 * hintMultiplier)} stig!</p>
            )}

            <button
              onClick={nextChallenge}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors btn-press"
            >
              {challengeNumber + 1 < totalChallenges ? 'Næsta áskorun →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}

        {/* Hint button */}
        {!showFeedback && !showHint && (
          <button
            onClick={() => {
              setShowHint(true);
              setTotalHintsUsed(prev => prev + 1);
            }}
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            💡 Vísbending
          </button>
        )}

        {/* Educational note */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <h3 className="font-bold text-blue-800 mb-2">Lykilhugmynd:</h3>
          <p className="text-sm text-gray-700">
            {challenge.type === 'count_atoms' && 'Formúlan segir þér hversu margar frumeindir eru í sameind. Lítlu tölurnar (subscripts) sýna fjöldann.'}
            {challenge.type === 'compare_mass' && 'Stærri frumeindir eru þyngri. Súrefni (O) er ~16× þyngri en vetni (H).'}
            {challenge.type === 'build_molecule' && 'Sameindir eru byggðar úr frumeindum. Hver frumeind hefur sinn eigin massa.'}
            {challenge.type === 'estimate_range' && 'Mólmassi er summa allra frumeindasmassa í sameind. H≈1, C≈12, N≈14, O≈16 g/mol.'}
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 font-semibold py-2"
        >
          ← Til baka í valmynd
        </button>
      </div>

      {/* Periodic Table Modal */}
      {showPeriodicTable && (
        <PeriodicTable
          onClose={() => setShowPeriodicTable(false)}
          showApproximate={true}
          highlightElements={challenge.compound.elements.map(e => e.symbol)}
        />
      )}
    </div>
  );
}

export default Level1;
