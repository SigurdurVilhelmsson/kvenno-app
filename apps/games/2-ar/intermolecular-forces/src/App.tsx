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

const STORAGE_KEY = 'imf-progress';

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
    dismissNotification,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    trackGameComplete,
    resetAll: resetAchievements,
  } = useAchievements({ gameId: 'intermolecular-forces' });

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

  if (activeLevel === 'level1') {
    return (
      <>
        <Level1
          onComplete={handleLevel1Complete}
          onBack={() => setActiveLevel('menu')}
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

  if (activeLevel === 'level2') {
    return (
      <>
        <Level2
          onComplete={handleLevel2Complete}
          onBack={() => setActiveLevel('menu')}
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

  if (activeLevel === 'level3') {
    return (
      <>
        <Level3
          onComplete={handleLevel3Complete}
          onBack={() => setActiveLevel('menu')}
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

  if (activeLevel === 'complete') {
    const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-indigo-600">
              Til hamingju!
            </h1>

            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                Þú hefur lokið öllum stigum!
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-purple-800">Stig 1: Tegundir</div>
                  <div className="text-sm text-purple-600">Greina millisameindakrafta</div>
                </div>
                <div className="text-2xl font-bold text-purple-600">{progress.level1Score}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-blue-800">Stig 2: Röðun</div>
                  <div className="text-sm text-blue-600">Raða efnum eftir eiginleikum</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{progress.level2Score}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-green-800">Stig 3: Greining</div>
                  <div className="text-sm text-green-600">Flókin samanburður</div>
                </div>
                <div className="text-2xl font-bold text-green-600">{progress.level3Score}</div>
              </div>

              <div className="bg-indigo-100 p-4 rounded-xl flex justify-between items-center border-2 border-indigo-400">
                <div className="font-bold text-indigo-800 text-lg">Heildarstig</div>
                <div className="text-3xl font-bold text-indigo-600">{totalScore}</div>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl mb-6">
              <h2 className="font-bold text-indigo-800 mb-3">Hvað lærðir þú?</h2>
              <ul className="space-y-2 text-indigo-900 text-sm">
                <li>✓ <strong>London kraftar:</strong> Til staðar í öllum sameindum, eykst með stærð</li>
                <li>✓ <strong>Tvípól-tvípól:</strong> Milli skauttaðra sameinda</li>
                <li>✓ <strong>Vetnistengi:</strong> H við F, O, eða N — sterkasta tegund</li>
                <li>✓ <strong>Áhrif:</strong> Sterkari IMF → hærra suðumark, seigja, yfirborðsspenna</li>
              </ul>
            </div>

            <button
              onClick={() => setActiveLevel('menu')}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Til baka í valmynd
            </button>
          </div>
        </div>
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  // Main menu
  const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;
  const levelsCompleted = [progress.level1Completed, progress.level2Completed, progress.level3Completed].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Header with achievements button */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-24" /> {/* Spacer for centering */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-600">
            Millisameindakraftar
          </h1>
          <div className="w-24 flex justify-end items-center gap-2">
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
          Lærðu að greina krafta milli sameinda og áhrif þeirra á eðliseiginleika
        </p>

        {/* Pedagogical explanation */}
        <div className="bg-indigo-50 p-6 rounded-xl mb-8">
          <h2 className="font-bold text-indigo-800 mb-3">Hvað eru millisameindakraftar (IMF)?</h2>
          <p className="text-indigo-900 text-sm mb-4">
            <strong>Millisameindakraftar</strong> eru aðdráttarkraftar milli sameinda sem ákvarða
            eðliseiginleika eins og suðumark, bræðslumark og seigju. Þeir eru veikari en efnatengi
            en afar mikilvægir fyrir hegðun efna.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-purple-100 p-2 rounded-lg">
              <div className="font-bold text-purple-800">London</div>
              <div className="text-purple-600">Veikastur</div>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <div className="font-bold text-blue-800">Tvípól-tvípól</div>
              <div className="text-blue-600">Meðal</div>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <div className="font-bold text-red-800">Vetnistengi</div>
              <div className="text-red-600">Sterkastur</div>
            </div>
          </div>
        </div>

        {/* Level selection */}
        <div className="space-y-4">
          <button
            onClick={() => setActiveLevel('level1')}
            className="w-full p-6 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔬</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-purple-800">Stig 1: Greina IMF tegundir</span>
                  {progress.level1Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {progress.level1Score} stig
                    </span>
                  )}
                </div>
                <div className="text-sm text-purple-600 mt-1">
                  Lærðu að greina hvaða kraftar eru til staðar í sameind
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => progress.level1Completed && setActiveLevel('level2')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level1Completed
                ? 'border-blue-400 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">📊</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level1Completed ? 'text-blue-800' : 'text-gray-600'}`}>
                    Stig 2: Raða eftir eiginleikum
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
                <div className={`text-sm mt-1 ${progress.level1Completed ? 'text-blue-600' : 'text-gray-500'}`}>
                  Raðaðu efnum eftir suðumarki, seigju o.fl.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => progress.level2Completed && setActiveLevel('level3')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level2Completed
                ? 'border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧠</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level2Completed ? 'text-green-800' : 'text-gray-600'}`}>
                    Stig 3: Flókin greining
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
                <div className={`text-sm mt-1 ${progress.level2Completed ? 'text-green-600' : 'text-gray-500'}`}>
                  Berðu saman efni og útskýrðu áhrif á eiginleika
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
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">{levelsCompleted}/3</div>
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

        {/* IMF Reference */}
        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-3">📋 Tegundir millisameindakrafta</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 p-2 bg-purple-50 rounded">
              <span className="font-bold text-purple-700 w-32">London (LDF)</span>
              <span className="text-purple-600">Öll efni — eykst með mólmassa og yfirborðsflatarmáli</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
              <span className="font-bold text-blue-700 w-32">Tvípól-tvípól</span>
              <span className="text-blue-600">Skautaðar sameindir — δ+ laðar að δ-</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
              <span className="font-bold text-red-700 w-32">Vetnistengi</span>
              <span className="text-red-600">H bundið við F, O, eða N — sterkasta IMF</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Kafli 11 — Chemistry: The Central Science (Brown et al.)
        </div>
      </div>

      {/* Achievements Panel Modal */}
      {showAchievements && (
        <AchievementsPanel
          achievements={achievements}
          allAchievements={allAchievements}
          onClose={() => setShowAchievements(false)}
          onReset={resetAchievements}
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
