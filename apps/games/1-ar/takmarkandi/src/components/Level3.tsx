import { useState, useEffect } from 'react';

import { getMolarMass, roundMass } from '../data/molar-masses';
import { REACTIONS } from '../data/reactions';
import { Reaction, Difficulty } from '../types';
import { Molecule } from './Molecule';
import { calculateCorrectAnswer, generateReactantCounts, calculatePoints } from '../utils/calculations';

type UnitMode = 'molecules' | 'grams';

interface Level3Props {
  onComplete: (score: number, correctAnswers: number, totalQuestions: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface GameState {
  currentReaction: Reaction | null;
  reactant1Count: number;
  reactant2Count: number;
  // For grams mode
  reactant1Grams: number;
  reactant2Grams: number;
  reactant1MolarMass: number;
  reactant2MolarMass: number;
  userLimiting: string;
  userProducts: Record<string, string>;
  userExcess: string;
  isAnswered: boolean;
  isCorrect: boolean | null;
  showingSolution: boolean;
}

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [screen, setScreen] = useState<'setup' | 'game' | 'results'>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [unitMode, setUnitMode] = useState<UnitMode>('molecules');
  const [timerMode, setTimerMode] = useState(false);
  const isGramMode = unitMode === 'grams';
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [gameState, setGameState] = useState<GameState>({
    currentReaction: null,
    reactant1Count: 0,
    reactant2Count: 0,
    reactant1Grams: 0,
    reactant2Grams: 0,
    reactant1MolarMass: 0,
    reactant2MolarMass: 0,
    userLimiting: '',
    userProducts: {},
    userExcess: '',
    isAnswered: false,
    isCorrect: null,
    showingSolution: false
  });

  // Timer countdown
  useEffect(() => {
    if (screen === 'game' && timerMode && timeRemaining > 0 && !gameState.isAnswered) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timerMode && timeRemaining === 0 && !gameState.isAnswered) {
      setScreen('results');
    }
  }, [screen, timerMode, timeRemaining, gameState.isAnswered]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setTimeRemaining(120);
    loadNewQuestion();
    setScreen('game');
  };

  const loadNewQuestion = () => {
    const availableReactions = REACTIONS.filter(r => r.difficulty === difficulty);
    const reaction = availableReactions[Math.floor(Math.random() * availableReactions.length)];
    const { r1Count, r2Count } = generateReactantCounts(difficulty);

    const products: Record<string, string> = {};
    reaction.products.forEach(p => { products[p.formula] = ''; });

    // Calculate gram values if in gram mode
    const r1MolarMass = getMolarMass(reaction.reactant1.formula);
    const r2MolarMass = getMolarMass(reaction.reactant2.formula);
    const molesR1 = isGramMode ? roundMass(r1Count * 0.5) : r1Count;
    const molesR2 = isGramMode ? roundMass(r2Count * 0.5) : r2Count;
    const r1Grams = roundMass(molesR1 * r1MolarMass);
    const r2Grams = roundMass(molesR2 * r2MolarMass);

    setGameState({
      currentReaction: reaction,
      reactant1Count: isGramMode ? molesR1 : r1Count,
      reactant2Count: isGramMode ? molesR2 : r2Count,
      reactant1Grams: r1Grams,
      reactant2Grams: r2Grams,
      reactant1MolarMass: r1MolarMass,
      reactant2MolarMass: r2MolarMass,
      userLimiting: '',
      userProducts: products,
      userExcess: '',
      isAnswered: false,
      isCorrect: null,
      showingSolution: false
    });

    if (timerMode) {
      setTimeRemaining(120);
    }
  };

  const handleSubmit = () => {
    if (!gameState.currentReaction || gameState.isAnswered) return;

    const correctAnswer = calculateCorrectAnswer(
      gameState.currentReaction,
      gameState.reactant1Count,
      gameState.reactant2Count
    );

    // Tolerance for gram calculations (5% error)
    const isCloseEnough = (val: number, expected: number) => {
      if (expected === 0) return val === 0;
      const tolerance = Math.abs(expected * 0.05);
      return Math.abs(val - expected) <= Math.max(tolerance, 0.01);
    };

    // Validate all parts
    const limitingCorrect = gameState.userLimiting === correctAnswer.limitingReactant;

    // For gram mode, calculate expected gram values
    let excessCorrect: boolean;
    let productsCorrect = true;

    if (isGramMode) {
      // Calculate expected grams for excess
      const excessMolarMass = correctAnswer.limitingReactant === gameState.currentReaction.reactant1.formula
        ? gameState.reactant2MolarMass
        : gameState.reactant1MolarMass;
      const expectedExcessGrams = roundMass(correctAnswer.excessRemaining * excessMolarMass);
      excessCorrect = isCloseEnough(parseFloat(gameState.userExcess), expectedExcessGrams);

      // Calculate expected grams for products
      gameState.currentReaction.products.forEach(p => {
        const productMolarMass = getMolarMass(p.formula);
        const expectedGrams = roundMass(correctAnswer.productsFormed[p.formula] * productMolarMass);
        if (!isCloseEnough(parseFloat(gameState.userProducts[p.formula]), expectedGrams)) {
          productsCorrect = false;
        }
      });
    } else {
      excessCorrect = parseInt(gameState.userExcess) === correctAnswer.excessRemaining;
      gameState.currentReaction.products.forEach(p => {
        if (parseInt(gameState.userProducts[p.formula]) !== correctAnswer.productsFormed[p.formula]) {
          productsCorrect = false;
        }
      });
    }

    const allCorrect = limitingCorrect && excessCorrect && productsCorrect;

    if (allCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = calculatePoints(difficulty, newStreak, timeRemaining, timerMode);
      setScore(prev => {
        const newScore = prev + points;
        if (newScore > bestScore) {
          setBestScore(newScore);
        }
        return newScore;
      });
      setCorrectAnswers(prev => prev + 1);
      onCorrectAnswer?.();
    } else {
      setStreak(0);
      onIncorrectAnswer?.();
    }

    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      isCorrect: allCorrect
    }));

    setQuestionsAnswered(prev => prev + 1);
  };

  const handleNext = () => {
    loadNewQuestion();
  };

  const handleQuit = () => {
    setScreen('results');
  };

  const correctAnswer = gameState.currentReaction
    ? calculateCorrectAnswer(gameState.currentReaction, gameState.reactant1Count, gameState.reactant2Count)
    : null;

  const canSubmit =
    gameState.userLimiting !== '' &&
    gameState.userExcess.trim() !== '' &&
    gameState.currentReaction?.products.every(p => gameState.userProducts[p.formula]?.trim() !== '');

  // Setup screen
  if (screen === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🏆</div>
              <h1 className="text-3xl font-bold text-warm-800 mb-2">Stig 3: Meistarapróf</h1>
              <p className="text-warm-600">Prófaðu kunnáttu þína á tímamörkum!</p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-warm-700">Erfiðleikastig:</h3>
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    difficulty === diff
                      ? diff === 'easy' ? 'border-green-500 bg-green-50' :
                        diff === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-red-500 bg-red-50'
                      : 'border-warm-200 hover:border-warm-300'
                  }`}
                >
                  <div className="font-bold">
                    {diff === 'easy' ? 'Auðvelt' : diff === 'medium' ? 'Miðlungs' : 'Erfitt'}
                  </div>
                  <div className="text-sm text-warm-600">
                    {diff === 'easy' ? 'Einföld hlutföll (1:1, 2:1)' :
                     diff === 'medium' ? 'Flóknari hlutföll (3:1, 2:3)' :
                     'Stór stuðlar og margar afurðir'}
                  </div>
                </button>
              ))}
            </div>

            {/* Unit mode selection */}
            <div className="space-y-3 mb-6">
              <h3 className="font-bold text-warm-700">Einingar:</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUnitMode('molecules')}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    unitMode === 'molecules'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-warm-200 hover:border-warm-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🔵</div>
                  <div className="font-bold text-sm">Sameindir</div>
                  <div className="text-xs text-warm-500">Telja sameindir</div>
                </button>
                <button
                  onClick={() => setUnitMode('grams')}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    unitMode === 'grams'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-warm-200 hover:border-warm-300'
                  }`}
                >
                  <div className="text-2xl mb-1">⚖️</div>
                  <div className="font-bold text-sm">Grömm</div>
                  <div className="text-xs text-warm-500">Vinna með massa</div>
                </button>
              </div>
            </div>

            <div className="bg-warm-50 rounded-xl p-4 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerMode}
                  onChange={(e) => setTimerMode(e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <div>
                  <span className="font-semibold text-warm-700">Tímamörk</span>
                  <p className="text-sm text-warm-500">120 sekúndur á hvert dæmi</p>
                </div>
              </label>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors mb-4"
            >
              Byrja leik
            </button>

            <button
              onClick={onBack}
              className="w-full text-warm-500 hover:text-warm-700 font-semibold py-2"
            >
              ← Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (screen === 'results') {
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">
              {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🥈' : '📈'}
            </div>
            <h2 className="text-3xl font-bold text-warm-800 mb-2">
              {accuracy >= 80 ? 'Meistari!' : accuracy >= 60 ? 'Vel gert!' : 'Góð æfing!'}
            </h2>

            <div className="bg-orange-50 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-orange-600 mb-1">{score}</div>
              <div className="text-sm text-warm-600">Heildarfjöldi stiga</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}/{questionsAnswered}</div>
                <div className="text-xs text-warm-600">Rétt</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-xs text-warm-600">Nákvæmni</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{streak}</div>
                <div className="text-xs text-warm-600">Besta röð</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setScreen('setup');
                  setTotalHintsUsed(0);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Spila aftur
              </button>
              <button
                onClick={() => onComplete(score, correctAnswers, questionsAnswered, bestScore, totalHintsUsed)}
                className="w-full bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Til baka í valmynd
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-warm-600">Stig</p>
                <p className="text-2xl font-bold text-orange-600">{score}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600">Röð</p>
                <p className="text-2xl font-bold text-purple-600">
                  {streak > 0 && '🔥'} {streak}
                </p>
              </div>
              <div>
                <p className="text-sm text-warm-600">Rétt</p>
                <p className="text-2xl font-bold text-green-600">
                  {correctAnswers}/{questionsAnswered}
                </p>
              </div>
            </div>
            {timerMode && (
              <div>
                <p className="text-sm text-warm-600">Tími</p>
                <p className={`text-2xl font-bold ${timeRemaining < 30 ? 'text-red-600' : 'text-blue-600'}`}>
                  {timeRemaining}s
                </p>
              </div>
            )}
          </div>
        </div>

        {gameState.currentReaction && (
          <div className="space-y-4">
            {/* Equation */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-center text-2xl font-mono bg-warm-50 p-4 rounded-lg">
                {gameState.currentReaction.equation}
              </div>
            </div>

            {/* Reactants */}
            <div className="grid md:grid-cols-2 gap-4">
              <div
                role="button"
                tabIndex={0}
                aria-label={`Velja ${gameState.currentReaction.reactant1.formula} sem takmarkandi hvarfefni`}
                aria-pressed={gameState.userLimiting === gameState.currentReaction.reactant1.formula}
                onClick={() => !gameState.isAnswered && setGameState(prev => ({ ...prev, userLimiting: prev.currentReaction!.reactant1.formula }))}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !gameState.isAnswered) { e.preventDefault(); setGameState(prev => ({ ...prev, userLimiting: prev.currentReaction!.reactant1.formula })); } }}
                className={`bg-white rounded-xl shadow-md p-6 cursor-pointer border-4 transition-all ${
                  gameState.userLimiting === gameState.currentReaction.reactant1.formula
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-transparent hover:border-warm-200'
                } ${gameState.isAnswered && correctAnswer?.limitingReactant === gameState.currentReaction.reactant1.formula ? 'ring-4 ring-green-400' : ''}`}
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-warm-600">Hvarfefni 1</p>
                  <p className="text-xl font-bold">{gameState.currentReaction.reactant1.formula}</p>
                  {isGramMode && (
                    <p className="text-xs text-warm-500">M = {gameState.reactant1MolarMass} g/mol</p>
                  )}
                </div>
                {isGramMode ? (
                  <div className="flex justify-center mb-4">
                    <div className="bg-yellow-100 rounded-lg p-4">
                      <span className="text-3xl">⚖️</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {Array.from({ length: Math.min(gameState.reactant1Count, 12) }).map((_, i) => (
                      <Molecule
                        key={i}
                        formula={gameState.currentReaction!.reactant1.formula}
                        color={gameState.currentReaction!.reactant1.color}
                        size={35}
                      />
                    ))}
                    {gameState.reactant1Count > 12 && <span className="text-warm-500">+{gameState.reactant1Count - 12}</span>}
                  </div>
                )}
                <p className="text-center text-xl font-bold">
                  {isGramMode
                    ? `${gameState.reactant1Grams} g`
                    : `${gameState.reactant1Count} sameind${gameState.reactant1Count !== 1 ? 'ir' : ''}`
                  }
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label={`Velja ${gameState.currentReaction.reactant2.formula} sem takmarkandi hvarfefni`}
                aria-pressed={gameState.userLimiting === gameState.currentReaction.reactant2.formula}
                onClick={() => !gameState.isAnswered && setGameState(prev => ({ ...prev, userLimiting: prev.currentReaction!.reactant2.formula }))}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !gameState.isAnswered) { e.preventDefault(); setGameState(prev => ({ ...prev, userLimiting: prev.currentReaction!.reactant2.formula })); } }}
                className={`bg-white rounded-xl shadow-md p-6 cursor-pointer border-4 transition-all ${
                  gameState.userLimiting === gameState.currentReaction.reactant2.formula
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-transparent hover:border-warm-200'
                } ${gameState.isAnswered && correctAnswer?.limitingReactant === gameState.currentReaction.reactant2.formula ? 'ring-4 ring-green-400' : ''}`}
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-warm-600">Hvarfefni 2</p>
                  <p className="text-xl font-bold">{gameState.currentReaction.reactant2.formula}</p>
                  {isGramMode && (
                    <p className="text-xs text-warm-500">M = {gameState.reactant2MolarMass} g/mol</p>
                  )}
                </div>
                {isGramMode ? (
                  <div className="flex justify-center mb-4">
                    <div className="bg-yellow-100 rounded-lg p-4">
                      <span className="text-3xl">⚖️</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {Array.from({ length: Math.min(gameState.reactant2Count, 12) }).map((_, i) => (
                      <Molecule
                        key={i}
                        formula={gameState.currentReaction!.reactant2.formula}
                        color={gameState.currentReaction!.reactant2.color}
                        size={35}
                      />
                    ))}
                    {gameState.reactant2Count > 12 && <span className="text-warm-500">+{gameState.reactant2Count - 12}</span>}
                  </div>
                )}
                <p className="text-center text-xl font-bold">
                  {isGramMode
                    ? `${gameState.reactant2Grams} g`
                    : `${gameState.reactant2Count} sameind${gameState.reactant2Count !== 1 ? 'ir' : ''}`
                  }
                </p>
              </div>
            </div>

            {/* Products input */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-warm-800 mb-4">
                {isGramMode ? 'Hversu mörg grömm af afurðum myndast?' : 'Hversu margar afurðir myndast?'}
              </h3>
              <div className="space-y-4">
                {gameState.currentReaction.products.map((product) => {
                  const productMolarMass = getMolarMass(product.formula);
                  const expectedGrams = correctAnswer
                    ? roundMass(correctAnswer.productsFormed[product.formula] * productMolarMass)
                    : 0;
                  const userVal = parseFloat(gameState.userProducts[product.formula]);
                  const isCorrectAnswer = isGramMode
                    ? Math.abs(userVal - expectedGrams) <= Math.max(expectedGrams * 0.05, 0.01)
                    : parseInt(gameState.userProducts[product.formula]) === correctAnswer?.productsFormed[product.formula];

                  return (
                    <div key={product.formula} className="flex items-center gap-4">
                      <Molecule
                        formula={product.formula}
                        color={product.color}
                        size={45}
                      />
                      <div className="w-28">
                        <span className="text-lg font-semibold">{product.formula}:</span>
                        {isGramMode && (
                          <div className="text-xs text-warm-500">M = {productMolarMass} g/mol</div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={gameState.userProducts[product.formula] || ''}
                        onChange={(e) => setGameState(prev => ({
                          ...prev,
                          userProducts: { ...prev.userProducts, [product.formula]: e.target.value }
                        }))}
                        disabled={gameState.isAnswered}
                        aria-label={`Magn ${product.formula} afurðar${isGramMode ? ' í grömmum' : ''}`}
                        className={`w-24 px-3 py-2 border-2 rounded-lg text-lg ${
                          gameState.isAnswered
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-warm-300'
                        }`}
                        placeholder="0"
                      />
                      <span className="text-warm-600 text-sm">{isGramMode ? 'g' : ''}</span>
                      {gameState.isAnswered && (
                        <span className="text-sm text-warm-600">
                          (Rétt: {isGramMode ? `${expectedGrams} g` : correctAnswer?.productsFormed[product.formula]})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Excess input */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-warm-800 mb-4">
                {isGramMode ? 'Afgangur í grömmum:' : 'Afgangur af hinu hvarfefninu:'}
              </h3>
              {(() => {
                const excessMolarMass = correctAnswer?.limitingReactant === gameState.currentReaction.reactant1.formula
                  ? gameState.reactant2MolarMass
                  : gameState.reactant1MolarMass;
                const expectedExcessGrams = correctAnswer
                  ? roundMass(correctAnswer.excessRemaining * excessMolarMass)
                  : 0;
                const userVal = parseFloat(gameState.userExcess);
                const isCorrectExcess = isGramMode
                  ? Math.abs(userVal - expectedExcessGrams) <= Math.max(expectedExcessGrams * 0.05, 0.01)
                  : parseInt(gameState.userExcess) === correctAnswer?.excessRemaining;

                return (
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={gameState.userExcess}
                      onChange={(e) => setGameState(prev => ({ ...prev, userExcess: e.target.value }))}
                      disabled={gameState.isAnswered}
                      className={`w-24 px-3 py-2 border-2 rounded-lg text-lg ${
                        gameState.isAnswered
                          ? isCorrectExcess
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-warm-300'
                      }`}
                      placeholder="0"
                    />
                    <span className="text-warm-600">
                      {isGramMode ? 'g' : `sameind${parseInt(gameState.userExcess) !== 1 ? 'ir' : ''}`}
                    </span>
                    {gameState.isAnswered && (
                      <span className="text-sm text-warm-600">
                        (Rétt: {isGramMode ? `${expectedExcessGrams} g` : correctAnswer?.excessRemaining})
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Solution (after answering) */}
            {gameState.showingSolution && correctAnswer && (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h4 className="font-bold text-warm-800 mb-4">Lausn:</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>1.</strong> {gameState.currentReaction.reactant1.formula}: {gameState.reactant1Count} / {gameState.currentReaction.reactant1.coeff} = {correctAnswer.timesFromR1.toFixed(2)} skipti
                  </p>
                  <p>
                    <strong>2.</strong> {gameState.currentReaction.reactant2.formula}: {gameState.reactant2Count} / {gameState.currentReaction.reactant2.coeff} = {correctAnswer.timesFromR2.toFixed(2)} skipti
                  </p>
                  <p>
                    <strong>3.</strong> Takmarkandi: <span className="font-bold text-green-700">{correctAnswer.limitingReactant}</span> ({Math.min(correctAnswer.timesFromR1, correctAnswer.timesFromR2)} skipti)
                  </p>
                  <p>
                    <strong>4.</strong> Afurðir: {correctAnswer.timesReactionRuns} × stuðull = {Object.entries(correctAnswer.productsFormed).map(([f, n]) => `${n} ${f}`).join(', ')}
                  </p>
                  <p>
                    <strong>5.</strong> Afgangur: {correctAnswer.excessRemaining} {correctAnswer.excessReactant}
                  </p>
                </div>
              </div>
            )}

            {/* Feedback */}
            {gameState.isAnswered && (
              <div className={`rounded-xl p-6 ${gameState.isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                <h3 className="text-2xl font-bold mb-2">
                  {gameState.isCorrect ? '✓ Rétt!' : '✗ Rangt'}
                </h3>
                {gameState.isCorrect ? (
                  <p className="text-green-800">
                    Vel gert! {streak > 1 && `${streak} rétt í röð!`}
                  </p>
                ) : (
                  <p className="text-red-800">Skoðaðu lausnina og reyndu aftur!</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4">
              {!gameState.isAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex-1 font-bold py-4 px-6 rounded-xl transition-colors ${
                    canSubmit
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-warm-300 text-warm-500 cursor-not-allowed'
                  }`}
                >
                  Athuga svar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                  >
                    Næsta spurning
                  </button>
                  <button
                    onClick={() => {
                      if (!gameState.showingSolution) {
                        setTotalHintsUsed(prev => prev + 1);
                      }
                      setGameState(prev => ({ ...prev, showingSolution: !prev.showingSolution }));
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                  >
                    {gameState.showingSolution ? 'Fela lausn' : 'Sýna lausn'}
                  </button>
                </>
              )}
              <button
                onClick={handleQuit}
                className="bg-warm-500 hover:bg-warm-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                Hætta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level3;
