import { useState, useEffect } from 'react';
import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { NameBuilder } from './components/NameBuilder';
import { useAchievements } from '@shared/hooks/useAchievements';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';

type Screen = 'menu' | 'level1' | 'level2' | 'level3' | 'namebuilder';

interface Progress {
  level1Completed: boolean;
  level1Score: number;
  level2Completed: boolean;
  level2Score: number;
  level3BestMoves: { [key: string]: number };
  totalGamesPlayed: number;
}

const STORAGE_KEY = 'nafnakerfidProgress';

function loadProgress(): Progress {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultProgress();
    }
  }
  return getDefaultProgress();
}

function getDefaultProgress(): Progress {
  return {
    level1Completed: false,
    level1Score: 0,
    level2Completed: false,
    level2Score: 0,
    level3BestMoves: {},
    totalGamesPlayed: 0,
  };
}

function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [progress, setProgress] = useState<Progress>(loadProgress());
  const [showAchievements, setShowAchievements] = useState(false);

  const {
    achievements,
    allAchievements,
    notifications,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    trackGameComplete,
    dismissNotification,
    resetAll: resetAchievementsData,
  } = useAchievements({ gameId: 'nafnakerfid' });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleLevel1Complete = (score: number, maxScore: number, hintsUsed: number) => {
    const wasLevel1Complete = progress.level1Completed;
    setProgress(prev => ({
      ...prev,
      level1Completed: true,
      level1Score: Math.max(prev.level1Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));
    trackLevelComplete(1, score, maxScore, { hintsUsed });

    // Check if all levels are now complete
    if (!wasLevel1Complete && progress.level2Completed && Object.keys(progress.level3BestMoves).length > 0) {
      trackGameComplete();
    }
    setScreen('menu');
  };

  const handleLevel2Complete = (score: number, maxScore: number, hintsUsed: number) => {
    const wasLevel2Complete = progress.level2Completed;
    setProgress(prev => ({
      ...prev,
      level2Completed: true,
      level2Score: Math.max(prev.level2Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));
    trackLevelComplete(2, score, maxScore, { hintsUsed });

    // Check if all levels are now complete
    if (progress.level1Completed && !wasLevel2Complete && Object.keys(progress.level3BestMoves).length > 0) {
      trackGameComplete();
    }
    setScreen('menu');
  };

  const handleLevel3Complete = (moves: number, difficulty: string, pairs: number, maxScore: number, hintsUsed: number) => {
    const key = `${difficulty}-${pairs}`;
    const wasLevel3Complete = Object.keys(progress.level3BestMoves).length > 0;
    setProgress(prev => ({
      ...prev,
      level3BestMoves: {
        ...prev.level3BestMoves,
        [key]: Math.min(prev.level3BestMoves[key] || Infinity, moves),
      },
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));
    // For Level3, score is based on pairs matched - we treat pairs as score
    trackLevelComplete(3, pairs, maxScore, { hintsUsed });

    // Check if all levels are now complete
    if (progress.level1Completed && progress.level2Completed && !wasLevel3Complete) {
      trackGameComplete();
    }
    setScreen('menu');
  };

  const resetProgress = () => {
    const newProgress = getDefaultProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Level screens
  if (screen === 'level1') {
    return (
      <>
        <Level1
          onComplete={handleLevel1Complete}
          onBack={() => setScreen('menu')}
          onCorrectAnswer={trackCorrectAnswer}
          onIncorrectAnswer={trackIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  if (screen === 'level2') {
    return (
      <>
        <Level2
          onComplete={handleLevel2Complete}
          onBack={() => setScreen('menu')}
          onCorrectAnswer={trackCorrectAnswer}
          onIncorrectAnswer={trackIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  if (screen === 'level3') {
    return (
      <>
        <Level3
          onComplete={handleLevel3Complete}
          onBack={() => setScreen('menu')}
          onCorrectAnswer={trackCorrectAnswer}
          onIncorrectAnswer={trackIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  if (screen === 'namebuilder') {
    return (
      <>
        <NameBuilder
          onComplete={() => {
            setProgress(prev => ({
              ...prev,
              totalGamesPlayed: prev.totalGamesPlayed + 1,
            }));
            setScreen('menu');
          }}
          onBack={() => setScreen('menu')}
          onCorrectAnswer={trackCorrectAnswer}
          onIncorrectAnswer={trackIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Nafnakerfið</h1>
              <p className="text-center text-gray-600">Læra að nefna efnasambönd</p>
            </div>
            <AchievementsButton
              achievements={achievements}
              onClick={() => setShowAchievements(true)}
            />
          </div>

          <div className="space-y-4">
            {/* Level 1 */}
            <button
              onClick={() => setScreen('level1')}
              className="w-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-6 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Stig 1
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">Grunnreglur</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Læra reglurnar um nafngiftir efnasambanda
                  </p>
                </div>
                <div className="text-right">
                  {progress.level1Completed ? (
                    <div className="text-green-600">
                      <div className="text-2xl font-bold">{progress.level1Score}/10</div>
                      <div className="text-xs">Lokið</div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-3xl">→</div>
                  )}
                </div>
              </div>
            </button>

            {/* Level 2 */}
            <button
              onClick={() => setScreen('level2')}
              className={`w-full bg-white border-2 rounded-xl p-6 text-left transition-all ${
                progress.level1Completed
                  ? 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-white text-sm font-bold px-3 py-1 rounded-full ${
                      progress.level1Completed ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}>
                      Stig 2
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">Æfing með leiðsögn</h3>
                    {!progress.level1Completed && (
                      <span className="text-xs text-gray-500">(Ljúktu stigi 1 fyrst)</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Æfðu þig í að nefna efnasambönd skref fyrir skref
                  </p>
                </div>
                <div className="text-right">
                  {progress.level2Completed ? (
                    <div className="text-green-600">
                      <div className="text-2xl font-bold">{progress.level2Score}/12</div>
                      <div className="text-xs">Lokið</div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-3xl">→</div>
                  )}
                </div>
              </div>
            </button>

            {/* Level 3 */}
            <button
              onClick={() => setScreen('level3')}
              className={`w-full bg-white border-2 rounded-xl p-6 text-left transition-all ${
                progress.level2Completed
                  ? 'border-red-200 hover:border-red-400 hover:bg-red-50'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-white text-sm font-bold px-3 py-1 rounded-full ${
                      progress.level2Completed ? 'bg-red-500' : 'bg-gray-400'
                    }`}>
                      Stig 3
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">Minnisleikur</h3>
                    {!progress.level2Completed && (
                      <span className="text-xs text-gray-500">(Ljúktu stigi 2 fyrst)</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Paraðu saman formúlur og nöfn í minnisleik
                  </p>
                </div>
                <div className="text-right">
                  {Object.keys(progress.level3BestMoves).length > 0 ? (
                    <div className="text-green-600">
                      <div className="text-xs">Besta:</div>
                      <div className="text-lg font-bold">
                        {Math.min(...Object.values(progress.level3BestMoves))} leikir
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-3xl">→</div>
                  )}
                </div>
              </div>
            </button>

            {/* Name Builder - Bonus Mode */}
            <button
              onClick={() => setScreen('namebuilder')}
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:from-purple-100 hover:to-pink-100 rounded-xl p-6 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Bónus
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">Nafnasmiðja</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Nýtt!</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Byggðu efnanöfn úr pörtum - læra nafnareglurnar!
                  </p>
                </div>
                <div className="text-purple-500 text-3xl">🔧</div>
              </div>
            </button>
          </div>
        </div>

        {/* Progress Summary */}
        {progress.totalGamesPlayed > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Framvinda</h3>
              <button
                onClick={resetProgress}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Endurstilla
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {[progress.level1Completed, progress.level2Completed].filter(Boolean).length}/2
                </div>
                <div className="text-xs text-gray-600">Stig lokið</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {progress.level1Score + progress.level2Score}
                </div>
                <div className="text-xs text-gray-600">Heildar stig</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">
                  {progress.totalGamesPlayed}
                </div>
                <div className="text-xs text-gray-600">Leikir spilaðir</div>
              </div>
            </div>
          </div>
        )}

        {/* Back to games link */}
        <div className="text-center mt-6">
          <a
            href="/games/1-ar/"
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Til baka í leikjayfirlit
          </a>
        </div>
      </div>

      {/* Achievements Panel Modal */}
      {showAchievements && (
        <AchievementsPanel
          achievements={achievements}
          allAchievements={allAchievements}
          onClose={() => setShowAchievements(false)}
          onReset={resetAchievementsData}
        />
      )}

      {/* Achievement Notifications */}
      <AchievementNotificationsContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

export default App;
