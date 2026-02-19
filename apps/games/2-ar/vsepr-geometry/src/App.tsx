import { useState, useEffect } from 'react';
import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { useAchievements } from '@shared/hooks/useAchievements';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { useGameI18n } from '@shared/hooks';
import { LanguageSwitcher } from '@shared/components';
import { gameTranslations } from './i18n';

type ActiveLevel = 'menu' | 'level1' | 'level2' | 'level3' | 'complete';

interface Progress {
  level1Completed: boolean;
  level1Score: number;
  level2Completed: boolean;
  level2Score: number;
  level3Completed: boolean;
  level3Score: number;
  totalGamesPlayed: number;
}

const STORAGE_KEY = 'vsepr-geometry-progress';

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
    level3Completed: false,
    level3Score: 0,
    totalGamesPlayed: 0
  };
}

function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [progress, setProgress] = useState<Progress>(loadProgress);
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
    resetAll: resetAchievements,
  } = useAchievements({ gameId: 'vsepr-geometry' });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleLevel1Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress(prev => ({
      ...prev,
      level1Completed: true,
      level1Score: Math.max(prev.level1Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));
    trackLevelComplete(1, score, maxScore, { hintsUsed });
    setActiveLevel('menu');
  };

  const handleLevel2Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress(prev => ({
      ...prev,
      level2Completed: true,
      level2Score: Math.max(prev.level2Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));
    trackLevelComplete(2, score, maxScore, { hintsUsed });
    setActiveLevel('menu');
  };

  const handleLevel3Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress(prev => ({
      ...prev,
      level3Completed: true,
      level3Score: Math.max(prev.level3Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));
    trackLevelComplete(3, score, maxScore, { hintsUsed });
    trackGameComplete();
    setActiveLevel('complete');
  };

  const resetProgress = () => {
    const newProgress = getDefaultProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Render active level
  if (activeLevel === 'level1') {
    return (
      <>
        <Level1
          onComplete={handleLevel1Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => trackCorrectAnswer()}
          onIncorrectAnswer={() => trackIncorrectAnswer()}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  if (activeLevel === 'level2') {
    return (
      <>
        <Level2
          onComplete={handleLevel2Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => trackCorrectAnswer()}
          onIncorrectAnswer={() => trackIncorrectAnswer()}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  if (activeLevel === 'level3') {
    return (
      <>
        <Level3
          onComplete={handleLevel3Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => trackCorrectAnswer()}
          onIncorrectAnswer={() => trackIncorrectAnswer()}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  // Complete screen
  if (activeLevel === 'complete') {
    const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-teal-600">
            Til hamingju!
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              Þú hefur lokið öllum stigum!
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-800">Stig 1: VSEPR Kenning</div>
                <div className="text-sm text-blue-600">Lögun og rafeinasvið</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800">Stig 2: Spá fyrir um lögun</div>
                <div className="text-sm text-green-600">Frá Lewis til rúmfræði</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Blendni og skautun</div>
                <div className="text-sm text-purple-600">Flókin sameindir</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.level3Score}</div>
            </div>

            <div className="bg-teal-100 p-4 rounded-xl flex justify-between items-center border-2 border-teal-400">
              <div className="font-bold text-teal-800 text-lg">Heildarstig</div>
              <div className="text-3xl font-bold text-teal-600">{totalScore}</div>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-xl mb-6">
            <h2 className="font-bold text-teal-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-teal-900 text-sm">
              <li>✓ <strong>VSEPR:</strong> Rafeindasvið hrinda hvert öðru frá — ákvarðar lögun</li>
              <li>✓ <strong>Rafeinasvið:</strong> Bindandi pör + einstæð pör = rafeinasvið</li>
              <li>✓ <strong>Sameindarlögun:</strong> Einstæð pör „fela sig" en hafa áhrif á horn</li>
              <li>✓ <strong>Blendni:</strong> sp (línuleg), sp² (þríhyrnd), sp³ (fjórflötungur)...</li>
              <li>✓ <strong>Skautun:</strong> Ósamhverf lögun = sameind skautuð</li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // Main menu
  const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;
  const levelsCompleted = [progress.level1Completed, progress.level2Completed, progress.level3Completed].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1" />
          <h1 className="text-3xl md:text-4xl font-bold text-center text-teal-600 flex-1">
            VSEPR Rumfraedi
          </h1>
          <div className="flex-1 flex justify-end items-center gap-2">
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
            <AchievementsButton
              achievements={achievements}
              onClick={() => setShowAchievements(true)}
            />
          </div>
        </div>
        <p className="text-center text-gray-600 mb-8">
          Laerdu ad spa fyrir um logun sameinda
        </p>

        {/* Pedagogical explanation */}
        <div className="bg-teal-50 p-6 rounded-xl mb-8">
          <h2 className="font-bold text-teal-800 mb-3">Hvað er VSEPR?</h2>
          <p className="text-teal-900 text-sm mb-4">
            <strong>VSEPR</strong> (Valence Shell Electron Pair Repulsion) segir að
            rafeindasvið í ystu skel miðatóms <em>hrindi hvert öðru frá</em> og
            staðsetji sig eins langt í sundur og hægt er. Þetta ákvarðar lögun sameindarinnar.
          </p>
          <div className="bg-white p-3 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-800 font-mono text-center">
              Rafeinasvið = Bindandi pör + Einstæð pör
            </p>
          </div>
        </div>

        {/* Level selection */}
        <div className="space-y-4">
          {/* Level 1 */}
          <button
            onClick={() => setActiveLevel('level1')}
            className="w-full p-6 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔮</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-800">Stig 1: VSEPR Kenning</span>
                  {progress.level1Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {progress.level1Score} stig
                    </span>
                  )}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Kynntu þér mismunandi sameindarlögun
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Sjáðu hvernig rafeinasvið hrinda hvert öðru og mynda mismunandi rúmfræði.
                </div>
              </div>
            </div>
          </button>

          {/* Level 2 */}
          <button
            onClick={() => progress.level1Completed && setActiveLevel('level2')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level1Completed
                ? 'border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧩</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level1Completed ? 'text-green-800' : 'text-gray-600'}`}>
                    Stig 2: Spá fyrir um lögun
                  </span>
                  {progress.level2Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {progress.level2Score} stig
                    </span>
                  )}
                  {!progress.level1Completed && (
                    <span className="text-xs text-gray-500">(Ljúktu stigi 1 fyrst)</span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${progress.level1Completed ? 'text-green-600' : 'text-gray-500'}`}>
                  Ákvarðaðu lögun út frá Lewis-formúlu
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Teldu rafeinasvið og spáðu fyrir um sameindarlögun og tengihorn.
                </div>
              </div>
            </div>
          </button>

          {/* Level 3 */}
          <button
            onClick={() => progress.level2Completed && setActiveLevel('level3')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level2Completed
                ? 'border-purple-400 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚗️</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level2Completed ? 'text-purple-800' : 'text-gray-600'}`}>
                    Stig 3: Blendni og skautun
                  </span>
                  {progress.level3Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {progress.level3Score} stig
                    </span>
                  )}
                  {!progress.level2Completed && (
                    <span className="text-xs text-gray-500">(Ljúktu stigi 2 fyrst)</span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${progress.level2Completed ? 'text-purple-600' : 'text-gray-500'}`}>
                  Ákvarðaðu blendni og hvort sameind sé skautuð
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Flóknari sameindir með mörgum miðatómum og tvískautsvægi.
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Progress Summary */}
        {progress.totalGamesPlayed > 0 && (
          <div className="mt-8 bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Framvinda</h3>
              <button
                onClick={resetProgress}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Endurstilla
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-teal-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-teal-600">{levelsCompleted}/3</div>
                <div className="text-xs text-gray-600">Stig lokið</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{totalScore}</div>
                <div className="text-xs text-gray-600">Heildar stig</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{progress.totalGamesPlayed}</div>
                <div className="text-xs text-gray-600">Leikir spilaðir</div>
              </div>
            </div>
          </div>
        )}

        {/* Geometry reference */}
        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-3">📐 Algengar sameindarlögun</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-white p-2 rounded border text-center">
              <div className="text-lg mb-1">—</div>
              <div className="font-bold text-gray-800">Línuleg</div>
              <div className="text-xs text-gray-500">180°</div>
            </div>
            <div className="bg-white p-2 rounded border text-center">
              <div className="text-lg mb-1">△</div>
              <div className="font-bold text-gray-800">Þríhyrnd</div>
              <div className="text-xs text-gray-500">120°</div>
            </div>
            <div className="bg-white p-2 rounded border text-center">
              <div className="text-lg mb-1">◇</div>
              <div className="font-bold text-gray-800">Fjórflötungur</div>
              <div className="text-xs text-gray-500">109.5°</div>
            </div>
            <div className="bg-white p-2 rounded border text-center">
              <div className="text-lg mb-1">∠</div>
              <div className="font-bold text-gray-800">Beygð</div>
              <div className="text-xs text-gray-500">&lt;109.5°</div>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Kafli 9 — Chemistry: The Central Science (Brown et al.)
        </div>
      </div>

      {showAchievements && (
        <AchievementsPanel
          achievements={achievements}
          allAchievements={allAchievements}
          onClose={() => setShowAchievements(false)}
          onReset={resetAchievements}
        />
      )}

      <AchievementNotificationsContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

export default App;
