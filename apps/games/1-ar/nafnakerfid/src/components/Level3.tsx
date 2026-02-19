import { useState, useEffect, useCallback } from 'react';
import { getCompoundsByDifficulty, type Compound } from '../data/compounds';
import { CompoundVisualization } from './MolecularStructure';

interface Level3Props {
  onComplete: (moves: number, difficulty: string, pairs: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type CardType = 'formula' | 'name';

interface GameCard {
  id: string;
  compound: Compound;
  type: CardType;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MatchedPair {
  compound: Compound;
  timestamp: number;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const difficultyConfig = {
  easy: { pairs: 6, label: 'Auðvelt', description: 'Einföld jónefni', color: 'green' },
  medium: { pairs: 8, label: 'Miðlungs', description: 'Fjölatóma jónir', color: 'yellow' },
  hard: { pairs: 10, label: 'Erfitt', description: 'Allar tegundir', color: 'red' }
};

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  'jónefni': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Jónefni' },
  'sameind': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Sameind' },
  'sameindaefni': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Sameind' },
  'málmar-breytilega-hleðsla': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Breytileg hleðsla' }
};

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'complete'>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<MatchedPair[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [showMatchInfo, setShowMatchInfo] = useState<Compound | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalHintsUsed] = useState(0); // Level3 has no hints

  const initializeGame = useCallback((diff: Difficulty) => {
    const config = difficultyConfig[diff];
    const availableCompounds = getCompoundsByDifficulty(diff);
    const selectedCompounds = shuffleArray(availableCompounds).slice(0, config.pairs);

    const gameCards: GameCard[] = [];
    selectedCompounds.forEach((compound, index) => {
      gameCards.push({
        id: `formula-${index}`,
        compound,
        type: 'formula',
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: `name-${index}`,
        compound,
        type: 'name',
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(shuffleArray(gameCards));
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setScore(0);
    setShowMatchInfo(null);
    setGameState('playing');
  }, []);

  const handleCardClick = (cardId: string) => {
    if (isProcessing) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Flip the card
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match if two cards are flipped
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsProcessing(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      // Safety check - cards should always be found
      if (!firstCard || !secondCard) {
        setFlippedCards([]);
        setIsProcessing(false);
        return;
      }

      // Check if they match (same compound, different type)
      if (firstCard.compound.formula === secondCard.compound.formula &&
          firstCard.type !== secondCard.type) {
        // Match found!
        onCorrectAnswer?.();
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchedPairs(prev => [...prev, {
            compound: firstCard.compound,
            timestamp: Date.now()
          }]);
          setShowMatchInfo(firstCard.compound);
          setScore(prev => prev + calculateMatchScore());
          setFlippedCards([]);
          setIsProcessing(false);
        }, 500);
      } else {
        // No match - flip back
        onIncorrectAnswer?.();
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const calculateMatchScore = () => {
    const baseScore = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
    return baseScore;
  };

  const dismissMatchInfo = () => {
    setShowMatchInfo(null);
  };

  // Check for game completion
  useEffect(() => {
    if (gameState === 'playing' && cards.length > 0) {
      const allMatched = cards.every(c => c.isMatched);
      if (allMatched) {
        setTimeout(() => {
          setGameState('complete');
        }, 500);
      }
    }
  }, [cards, gameState]);

  // Setup screen
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
              ← Til baka
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-purple-600">
            Minnisleikur: Nafnagift
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Paraðu saman efnaformúlur og nöfn þeirra
          </p>

          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <h2 className="font-bold text-purple-800 mb-4">Veldu erfiðleikastig:</h2>
            <div className="grid gap-4">
              {(Object.entries(difficultyConfig) as [Difficulty, typeof difficultyConfig.easy][]).map(([diff, config]) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    difficulty === diff
                      ? 'border-purple-500 bg-purple-100'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-800">{config.label}</div>
                      <div className="text-sm text-gray-600">{config.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{config.pairs}</div>
                      <div className="text-xs text-gray-500">pör</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Hvernig á að spila:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Snúðu við tveimur kortum í einu</li>
              <li>• Paraðu saman efnaformúlu og nafn</li>
              <li>• Þegar þú finnur par sérðu námsupplýsingar</li>
              <li>• Reyndu að klára með sem fæstum tilraunum</li>
            </ul>
          </div>

          <button
            onClick={() => initializeGame(difficulty)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg"
          >
            Byrja leik →
          </button>
        </div>
      </div>
    );
  }

  // Complete screen
  if (gameState === 'complete') {
    const totalPairs = difficultyConfig[difficulty].pairs;
    const efficiency = Math.round((totalPairs / moves) * 100);
    const bonusScore = efficiency > 50 ? Math.round(efficiency / 2) : 0;
    const finalScore = score + bonusScore;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Til hamingju!</h1>
            <p className="text-gray-600">Þú kláraðir minnisleikinn</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{moves}</div>
              <div className="text-sm text-gray-600">Tilraunir</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{totalPairs}</div>
              <div className="text-sm text-gray-600">Pör fundin</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{efficiency}%</div>
              <div className="text-sm text-gray-600">Skilvirkni</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{finalScore}</div>
              <div className="text-sm text-gray-600">Heildarstig</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Efnasambönd sem þú lærðir:</h3>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {matchedPairs.map((pair, idx) => {
                const typeInfo = typeColors[pair.compound.category] || typeColors['jónefni'];
                return (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{pair.compound.formula}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">{pair.compound.name}</span>
                    </div>
                    <span className={`${typeInfo.bg} ${typeInfo.text} text-xs px-2 py-1 rounded-full`}>
                      {typeInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setGameState('setup')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              Spila aftur
            </button>
            <button
              onClick={() => onComplete(moves, difficulty, difficultyConfig[difficulty].pairs, difficultyConfig[difficulty].pairs, totalHintsUsed)}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              Ljúka stigi →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  const gridCols = difficulty === 'easy' ? 'grid-cols-3 md:grid-cols-4' :
                   difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
              ← Til baka
            </button>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{moves}</div>
                <div className="text-xs text-gray-500">Tilraunir</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{matchedPairs.length}/{difficultyConfig[difficulty].pairs}</div>
                <div className="text-xs text-gray-500">Pör</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-xs text-gray-500">Stig</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game board */}
        <div className={`grid ${gridCols} gap-2 md:gap-3`}>
          {cards.map(card => {
            const typeInfo = typeColors[card.compound.category] || typeColors['jónefni'];

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || isProcessing}
                className={`aspect-[3/4] rounded-xl transition-all duration-300 transform ${
                  card.isMatched
                    ? 'bg-green-100 border-2 border-green-400 scale-95 opacity-75'
                    : card.isFlipped
                      ? 'bg-white border-2 border-purple-400 shadow-lg'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                {(card.isFlipped || card.isMatched) ? (
                  <div className="h-full flex flex-col items-center justify-center p-2 gap-1">
                    {card.type === 'formula' ? (
                      <>
                        <div className="text-base md:text-xl font-mono font-bold text-gray-800">
                          {card.compound.formula}
                        </div>
                        <CompoundVisualization compound={card.compound} size="small" showLabels={true} />
                        <div className={`${typeInfo.bg} ${typeInfo.text} text-[10px] px-2 py-0.5 rounded-full`}>
                          Formúla
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs md:text-sm font-bold text-gray-800 text-center leading-tight">
                          {card.compound.name}
                        </div>
                        <CompoundVisualization compound={card.compound} size="small" showLabels={false} />
                        <div className={`${typeInfo.bg} ${typeInfo.text} text-[10px] px-2 py-0.5 rounded-full`}>
                          Nafn
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-white text-3xl">
                    🧪
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Match info modal */}
        {showMatchInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={dismissMatchInfo}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">✓</div>
                <div className="text-xl font-bold text-green-600">Par fundið!</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="text-2xl font-mono font-bold text-gray-800">
                    {showMatchInfo.formula}
                  </div>
                  <div className="text-2xl text-gray-400">=</div>
                  <div className="text-xl font-bold text-gray-800">
                    {showMatchInfo.name}
                  </div>
                </div>

                {/* Molecular structure visualization */}
                <div className="flex justify-center mb-3 py-2">
                  <CompoundVisualization compound={showMatchInfo} size="medium" showLabels={true} />
                </div>

                <div className="flex justify-center mb-3">
                  <span className={`${typeColors[showMatchInfo.category]?.bg || 'bg-gray-100'} ${typeColors[showMatchInfo.category]?.text || 'text-gray-700'} px-3 py-1 rounded-full text-sm font-medium`}>
                    {typeColors[showMatchInfo.category]?.label || showMatchInfo.category}
                  </span>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Námsupplýsingar:</div>
                  <div className="text-gray-800">{showMatchInfo.info}</div>
                </div>
              </div>

              <button
                onClick={dismissMatchInfo}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl"
              >
                Halda áfram
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
