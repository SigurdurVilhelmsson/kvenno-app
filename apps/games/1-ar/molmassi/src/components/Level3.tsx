import { useState, useEffect, useRef } from 'react';
import { Compound, Difficulty, getRandomCompound, COMPOUNDS } from '../data/compounds';
import { PeriodicTable } from './PeriodicTable';
import { CalculationBreakdown } from './CalculationBreakdown';
import { validateInput } from '../utils/validation';
import { validateAnswer, generateContextualFeedback, calculatePoints } from '../utils/calculations';

type PlayMode = 'practice' | 'competition' | 'mystery';

interface Level3Props {
  onBack: () => void;
  onComplete?: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level3({ onBack, onComplete, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [mode, setMode] = useState<'modeSelection' | 'difficultySelection' | 'playing' | 'gameOver'>('modeSelection');
  const [playMode, setPlayMode] = useState<PlayMode>('practice');
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [currentCompound, setCurrentCompound] = useState<Compound | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [inputError, setInputError] = useState('');

  // Mystery mode state
  const [mysteryOptions, setMysteryOptions] = useState<Compound[]>([]);
  const [selectedMysteryOption, setSelectedMysteryOption] = useState<number | null>(null);
  const [mysteryFeedback, setMysteryFeedback] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate mystery options (correct answer + 3 distractors)
  const generateMysteryOptions = (correct: Compound): Compound[] => {
    // Get compounds with similar molar masses (within 30% of correct answer)
    const similarCompounds = COMPOUNDS.filter(c =>
      c.formula !== correct.formula &&
      Math.abs(c.molarMass - correct.molarMass) / correct.molarMass < 0.3
    );

    // If not enough similar compounds, use random ones
    const otherCompounds = similarCompounds.length >= 3
      ? similarCompounds
      : COMPOUNDS.filter(c => c.formula !== correct.formula);

    // Shuffle and pick 3 distractors
    const shuffled = [...otherCompounds].sort(() => Math.random() - 0.5);
    const distractors = shuffled.slice(0, 3);

    // Combine with correct answer and shuffle
    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
    return options;
  };

  // Track if game should end due to timer
  const [shouldEndGame, setShouldEndGame] = useState(false);

  // Timer effect for competition mode
  useEffect(() => {
    if (mode === 'playing' && playMode === 'competition') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setShouldEndGame(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, playMode]);

  // Handle timer-triggered game end
  useEffect(() => {
    if (shouldEndGame && mode === 'playing') {
      // Calculate max score based on questions answered
      const maxScore = questionsAnswered * 30;
      onComplete?.(score, maxScore, totalHintsUsed);
      setMode('gameOver');
      setShouldEndGame(false);
    }
  }, [shouldEndGame, mode, questionsAnswered, score, totalHintsUsed, onComplete]);

  const startGame = (selectedPlayMode: PlayMode, selectedDifficulty: Difficulty | 'mixed') => {
    const newCompound = getRandomCompound(selectedDifficulty);
    setPlayMode(selectedPlayMode);
    setDifficulty(selectedDifficulty);
    setCurrentCompound(newCompound);
    setUserAnswer('');
    setScore(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setTimeRemaining(selectedPlayMode === 'competition' ? 90 : 0);
    setStreak(0);
    setBestStreak(0);
    setHintsUsed(0);
    setShowFeedback(false);
    setLastAnswerCorrect(null);
    setShowSolution(false);
    setInputError('');

    // Mystery mode setup
    if (selectedPlayMode === 'mystery') {
      setMysteryOptions(generateMysteryOptions(newCompound));
      setSelectedMysteryOption(null);
      setMysteryFeedback(null);
    }

    setMode('playing');
    if (selectedPlayMode !== 'mystery') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = () => {
    if (!currentCompound || !userAnswer) return;

    const validation = validateInput(userAnswer);
    if (!validation.valid) {
      setInputError(validation.error);
      return;
    }

    const userValue = parseFloat(userAnswer);
    const isCorrect = validateAnswer(userValue, currentCompound.molarMass);

    if (isCorrect) {
      const points = calculatePoints(currentCompound.difficulty, timeRemaining, hintsUsed);
      const newStreak = streak + 1;
      setScore(prev => prev + points);
      setQuestionsAnswered(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      setShowFeedback(true);
      setLastAnswerCorrect(true);
      setInputError('');
      setHintsUsed(0);
      onCorrectAnswer?.();
    } else {
      setQuestionsAnswered(prev => prev + 1);
      setStreak(0);
      setShowFeedback(true);
      setLastAnswerCorrect(false);
      setInputError(generateContextualFeedback(userValue, currentCompound.molarMass));
      onIncorrectAnswer?.();
    }
  };

  const nextQuestion = () => {
    const newCompound = getRandomCompound(difficulty);
    setCurrentCompound(newCompound);
    setUserAnswer('');
    setShowFeedback(false);
    setLastAnswerCorrect(null);
    setShowSolution(false);
    setInputError('');
    setHintsUsed(0);

    // Mystery mode setup for next question
    if (playMode === 'mystery') {
      setMysteryOptions(generateMysteryOptions(newCompound));
      setSelectedMysteryOption(null);
      setMysteryFeedback(null);
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Handle mystery mode answer
  const handleMysterySubmit = () => {
    if (!currentCompound || selectedMysteryOption === null) return;

    const selectedCompound = mysteryOptions[selectedMysteryOption];
    const isCorrect = selectedCompound.formula === currentCompound.formula;

    if (isCorrect) {
      const points = calculatePoints(currentCompound.difficulty, 0, hintsUsed);
      const newStreak = streak + 1;
      setScore(prev => prev + points);
      setQuestionsAnswered(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      setShowFeedback(true);
      setLastAnswerCorrect(true);
      setMysteryFeedback(`Rétt! ${currentCompound.formula} (${currentCompound.name}) hefur mólmassa ${currentCompound.molarMass.toFixed(2)} g/mol`);
      onCorrectAnswer?.();
    } else {
      setQuestionsAnswered(prev => prev + 1);
      setStreak(0);
      setShowFeedback(true);
      setLastAnswerCorrect(false);
      setMysteryFeedback(`Rangt. ${selectedCompound.formula} hefur mólmassa ${selectedCompound.molarMass.toFixed(2)} g/mol. Rétt svar var ${currentCompound.formula} (${currentCompound.name}).`);
      onIncorrectAnswer?.();
    }
  };

  const showHint = () => {
    setShowSolution(true);
    setHintsUsed(prev => prev + 1);
    setTotalHintsUsed(prev => prev + 1);
  };

  const endGame = () => {
    // Calculate max score based on questions answered (each question worth ~20-50 points depending on difficulty and hints)
    const maxScore = questionsAnswered * 30; // Average expected score per question
    onComplete?.(score, maxScore, totalHintsUsed);
    setMode('gameOver');
  };

  // Mode Selection
  if (mode === 'modeSelection') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🧮</div>
            <h2 className="text-3xl font-bold text-gray-800">Stig 3 - Útreikningar</h2>
            <p className="text-gray-600 mt-2">Reiknaðu nákvæman mólmassa með lotukerfinu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => {
                setPlayMode('practice');
                setMode('difficultySelection');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-6 transition-colors"
            >
              <div className="text-3xl mb-2">📝</div>
              <h3 className="text-xl font-bold mb-2">Æfing</h3>
              <p className="text-sm opacity-90">Reiknaðu mólmassa án tímatakmarka</p>
            </button>

            <button
              onClick={() => {
                setPlayMode('competition');
                setMode('difficultySelection');
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-6 transition-colors"
            >
              <div className="text-3xl mb-2">⏱️</div>
              <h3 className="text-xl font-bold mb-2">Keppni</h3>
              <p className="text-sm opacity-90">90 sekúndur, fáðu sem flest stig!</p>
            </button>

            <button
              onClick={() => {
                setPlayMode('mystery');
                setMode('difficultySelection');
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-6 transition-colors"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-xl font-bold mb-2">Dularfull sameind</h3>
              <p className="text-sm opacity-90">Þekktu sameindina út frá mólmassa!</p>
            </button>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            ← Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // Difficulty Selection
  if (mode === 'difficultySelection') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Veldu erfiðleikastig</h2>

          <div className="space-y-3 mb-6">
            {(['easy', 'medium', 'hard', 'mixed'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => startGame(playMode, diff)}
                className={`w-full text-white font-bold py-4 px-6 rounded-xl transition-colors ${
                  diff === 'easy' ? 'bg-green-500 hover:bg-green-600' :
                  diff === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  diff === 'hard' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {diff === 'easy' ? 'Auðvelt - Einfaldar sameindir' :
                 diff === 'medium' ? 'Miðlungs - Rannsóknarstofuefni' :
                 diff === 'hard' ? 'Erfitt - Hýdröt og flóknar sameindir' :
                 'Blandað - Allar tegundir'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMode('modeSelection')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            ← Til baka
          </button>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (mode === 'gameOver') {
    const accuracy = questionsAnswered > 0 ? ((correctAnswers / questionsAnswered) * 100).toFixed(1) : '0';

    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Leik Lokið!</h2>
            <p className="text-gray-600">Frábært!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600 mt-1">Stig</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{correctAnswers}/{questionsAnswered}</div>
              <div className="text-sm text-gray-600 mt-1">Rétt svör</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-sm text-gray-600 mt-1">Nákvæmni</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{bestStreak}</div>
              <div className="text-sm text-gray-600 mt-1">Lengsta rað</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => startGame(playMode, difficulty)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Spila Aftur
            </button>

            <button
              onClick={onBack}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen - Mystery Mode
  if (mode === 'playing' && currentCompound && playMode === 'mystery') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with stats */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{score}</div>
                  <div className="text-xs text-gray-600">Stig</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}/{questionsAnswered}</div>
                  <div className="text-xs text-gray-600">Rétt</div>
                </div>
                {streak > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{streak} 🔥</div>
                    <div className="text-xs text-gray-600">Rað</div>
                  </div>
                )}
              </div>

              <button
                onClick={endGame}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Enda leik
              </button>
            </div>
          </div>

          {/* Mystery Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-4 card-enter">
            <div className="text-center mb-6">
              <div className="text-lg text-gray-500 mb-2">🔍 Dularfull sameind</div>
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {currentCompound.molarMass.toFixed(2)} g/mol
              </div>
              <p className="text-gray-600">Hvaða sameind hefur þennan mólmassa?</p>
              <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                currentCompound.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentCompound.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentCompound.difficulty === 'easy' ? 'Auðvelt' :
                 currentCompound.difficulty === 'medium' ? 'Miðlungs' :
                 'Erfitt'}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
              {mysteryOptions.map((option, index) => (
                <button
                  key={option.formula}
                  onClick={() => !showFeedback && setSelectedMysteryOption(index)}
                  disabled={showFeedback}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    showFeedback
                      ? option.formula === currentCompound.formula
                        ? 'bg-green-100 border-green-500'
                        : selectedMysteryOption === index
                          ? 'bg-red-100 border-red-500'
                          : 'bg-gray-50 border-gray-200'
                      : selectedMysteryOption === index
                        ? 'bg-purple-100 border-purple-500'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-800">{option.formula}</div>
                  <div className="text-sm text-gray-600">{option.name}</div>
                  {showFeedback && (
                    <div className="text-xs text-gray-500 mt-1">
                      Mólmassi: {option.molarMass.toFixed(2)} g/mol
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Submit / Next button */}
            {!showFeedback ? (
              <button
                onClick={handleMysterySubmit}
                disabled={selectedMysteryOption === null}
                className="w-full max-w-md mx-auto block bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Svara
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full max-w-md mx-auto block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Næsta sameind →
              </button>
            )}

            {/* Feedback */}
            {mysteryFeedback && (
              <div className={`mt-4 p-4 rounded-xl text-center animate-fade-in-up ${
                lastAnswerCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{lastAnswerCorrect ? '🎉' : '😅'}</span>
                  <p className={`text-lg font-bold ${
                    lastAnswerCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {lastAnswerCorrect ? 'Rétt svar!' : 'Rangt svar'}
                  </p>
                </div>
                <p className="text-gray-700 text-sm">{mysteryFeedback}</p>
              </div>
            )}
          </div>

          {/* Hint section */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setShowPeriodicTable(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors btn-press"
            >
              📊 Lotukerfið
            </button>

            {!showSolution && !showFeedback && (
              <button
                onClick={showHint}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors btn-press"
              >
                💡 Sýna útreikning (-5 stig)
              </button>
            )}
          </div>

          {/* Solution (when hint used) */}
          {showSolution && (
            <div className="animate-fade-in-up">
              <CalculationBreakdown compound={currentCompound} />
            </div>
          )}

          {/* Periodic Table Modal */}
          {showPeriodicTable && (
            <PeriodicTable onClose={() => setShowPeriodicTable(false)} />
          )}
        </div>
      </div>
    );
  }

  // Playing Screen - Practice/Competition Mode
  if (mode === 'playing' && currentCompound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with stats */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <div className="text-xs text-gray-600">Stig</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}/{questionsAnswered}</div>
                  <div className="text-xs text-gray-600">Rétt</div>
                </div>
                {streak > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{streak} 🔥</div>
                    <div className="text-xs text-gray-600">Rað</div>
                  </div>
                )}
              </div>

              {playMode === 'competition' && (
                <div className="text-center">
                  <div className={`text-3xl font-bold ${timeRemaining < 20 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600">Tími</div>
                </div>
              )}

              <button
                onClick={endGame}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Enda leik
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-4 card-enter">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-gray-800 mb-2">
                {currentCompound.formula}
              </div>
              <div className="text-xl text-gray-600">
                {currentCompound.name}
              </div>
              <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                currentCompound.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentCompound.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentCompound.difficulty === 'easy' ? 'Auðvelt' :
                 currentCompound.difficulty === 'medium' ? 'Miðlungs' :
                 'Erfitt'}
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hver er mólmassi efnisins? (g/mol)
              </label>

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    setInputError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !showFeedback) {
                      handleSubmit();
                    } else if (e.key === 'Enter' && showFeedback) {
                      nextQuestion();
                    }
                  }}
                  disabled={showFeedback}
                  className={`flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:outline-none ${
                    inputError ? 'border-red-500' : 'border-gray-300 focus:border-primary'
                  }`}
                  placeholder="Sláðu inn mólmassa..."
                  step="0.001"
                />

                {!showFeedback ? (
                  <button
                    onClick={handleSubmit}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors btn-press"
                  >
                    Svara
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors btn-press"
                  >
                    Næsta →
                  </button>
                )}
              </div>

              {inputError && (
                <p className="text-red-600 text-sm mt-2">{inputError}</p>
              )}

              {showFeedback && (
                <div className={`mt-4 p-4 rounded-xl animate-fade-in-up ${
                  lastAnswerCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lastAnswerCorrect ? '🎉' : '😅'}</span>
                    <p className={`text-lg font-bold ${
                      lastAnswerCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {lastAnswerCorrect ? 'Rétt svar!' : 'Rangt svar'}
                    </p>
                  </div>
                  {!lastAnswerCorrect && (
                    <p className="text-gray-700 mt-1">
                      Rétt svar: {currentCompound.molarMass.toFixed(3)} g/mol
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Helper Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setShowPeriodicTable(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors btn-press"
            >
              📊 Lotukerfið
            </button>

            {!showSolution && !showFeedback && (
              <button
                onClick={showHint}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors btn-press"
              >
                💡 Sýna útreikning (-5 stig)
              </button>
            )}
          </div>

          {/* Solution */}
          {showSolution && (
            <div className="animate-fade-in-up">
              <CalculationBreakdown compound={currentCompound} />
            </div>
          )}

          {/* Periodic Table Modal */}
          {showPeriodicTable && (
            <PeriodicTable onClose={() => setShowPeriodicTable(false)} />
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default Level3;
