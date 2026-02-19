import { useState, useEffect } from 'react';
import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { useAchievements } from '@shared/hooks/useAchievements';
import { useGameI18n } from '@shared/hooks/useGameI18n';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { LanguageSwitcher } from '@shared/components';
import { gameTranslations } from './i18n';

type ActiveLevel = 'menu' | 'level1' | 'level2' | 'level3' | 'complete';

interface Progress {
  level1Score: number | null;
  level1Completed: boolean;
  level2Score: number | null;
  level2Completed: boolean;
  level3Score: number | null;
  level3Completed: boolean;
  totalGamesPlayed: number;
}

const STORAGE_KEY = 'lausnirProgress';

// Mastery thresholds
const LEVEL1_MASTERY_SCORE = 300; // 5/6 challenges at 60 points each = 300
const LEVEL2_MASTERY_SCORE = 350; // 70% accuracy

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
    level1Score: null,
    level1Completed: false,
    level2Score: null,
    level2Completed: false,
    level3Score: null,
    level3Completed: false,
    totalGamesPlayed: 0,
  };
}

function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const [progress, setProgress] = useState<Progress>(loadProgress());
  const [showAchievements, setShowAchievements] = useState(false);

  const { t, language, setLanguage } = useGameI18n({ gameTranslations });

  const {
    achievements,
    allAchievements,
    notifications,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    trackGameComplete,
    dismissNotification,
    resetAll,
  } = useAchievements({ gameId: 'lausnir' });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleLevel1Complete = (score: number, maxScore: number, hintsUsed: number) => {
    const completed = score >= LEVEL1_MASTERY_SCORE;
    setProgress(prev => ({
      ...prev,
      level1Score: Math.max(prev.level1Score || 0, score),
      level1Completed: completed || prev.level1Completed,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));

    // Track achievement
    trackLevelComplete(1, score, maxScore, { hintsUsed });

    if (completed) {
      setActiveLevel('menu');
    } else {
      // Show message that they need to try again
      setActiveLevel('menu');
    }
  };

  const handleLevel2Complete = (score: number, maxScore: number, hintsUsed: number) => {
    const completed = score >= LEVEL2_MASTERY_SCORE;
    setProgress(prev => ({
      ...prev,
      level2Score: Math.max(prev.level2Score || 0, score),
      level2Completed: completed || prev.level2Completed,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));

    // Track achievement
    trackLevelComplete(2, score, maxScore, { hintsUsed });

    setActiveLevel('menu');
  };

  const handleLevel3Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress(prev => ({
      ...prev,
      level3Score: Math.max(prev.level3Score || 0, score),
      level3Completed: true,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));

    // Track achievement for level 3 completion
    trackLevelComplete(3, score, maxScore, { hintsUsed });

    // Track game completion since all 3 levels are now complete
    trackGameComplete();

    setActiveLevel('complete');
  };

  const resetProgress = () => {
    const newProgress = getDefaultProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Check unlock status
  const isLevel2Unlocked = progress.level1Completed;
  const isLevel3Unlocked = progress.level2Completed;

  // Render active level
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

  // Complete screen
  if (activeLevel === 'complete') {
    const totalScore = (progress.level1Score || 0) + (progress.level2Score || 0) + (progress.level3Score || 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-orange-600">
            {t('completion.title')}
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {t('completion.completedAll')}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-800">{t('levels.level1.name')}</div>
                <div className="text-sm text-blue-600">{t('completion.visualHandling')}</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level1Score || 0}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800">{t('levels.level2.name')}</div>
                <div className="text-sm text-green-600">{t('completion.predictChanges')}</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score || 0}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-800">{t('levels.level3.name')}</div>
                <div className="text-sm text-purple-600">{t('completion.useFormulas')}</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.level3Score || 0}</div>
            </div>

            <div className="bg-orange-100 p-4 rounded-xl flex justify-between items-center border-2 border-orange-400">
              <div className="font-bold text-orange-800 text-lg">{t('completion.totalScore')}</div>
              <div className="text-3xl font-bold text-orange-600">{totalScore}</div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl mb-6">
            <h2 className="font-bold text-yellow-800 mb-3">{t('completion.whatYouLearned')}</h2>
            <ul className="space-y-2 text-yellow-900 text-sm">
              <li>✓ <strong>{t('levels.level1.name')}:</strong> {t('completion.level1Summary')}</li>
              <li>✓ <strong>{t('levels.level2.name')}:</strong> {t('completion.level2Summary')}</li>
              <li>✓ <strong>{t('levels.level3.name')}:</strong> {t('completion.level3Summary')}</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveLevel('menu')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {t('completion.back')}
            </button>
            <button
              onClick={resetProgress}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {t('completion.startOver')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Header with language switcher and achievements button */}
        <div className="flex justify-between items-start mb-4">
          <LanguageSwitcher
            language={language}
            onLanguageChange={setLanguage}
            variant="compact"
          />
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-orange-600">
              {t('game.title')}
            </h1>
            <p className="text-center text-gray-600">
              {t('game.subtitle')}
            </p>
          </div>
          <AchievementsButton
            achievements={achievements}
            onClick={() => setShowAchievements(true)}
          />
        </div>

        {/* Pedagogical explanation */}
        <div className="bg-orange-50 p-6 rounded-xl mb-8">
          <h2 className="font-bold text-orange-800 mb-3">{t('menu.howItWorks')}</h2>
          <p className="text-orange-900 text-sm mb-4">
            {t('menu.howItWorksDesc')}
          </p>
          <div className="text-xs text-orange-700">
            {t('menu.inspiredBy')}
          </div>
        </div>

        {/* Level selection */}
        <div className="space-y-4">
          {/* Level 1 - Always available */}
          <button
            onClick={() => setActiveLevel('level1')}
            className="w-full p-6 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔬</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-800">{t('levels.level1.name')}</span>
                  {progress.level1Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {t('levels.completed')}
                    </span>
                  )}
                  {progress.level1Score !== null && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {progress.level1Score} {t('levels.points')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {t('levels.level1.description')}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {t('levels.level1.details')}
                </div>
                {!progress.level1Completed && progress.level1Score !== null && (
                  <div className="text-xs text-orange-600 mt-2 font-semibold">
                    {t('levels.level1.needScore').replace('{score}', String(LEVEL1_MASTERY_SCORE))}
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Level 2 - Locked until Level 1 completed */}
          <button
            onClick={() => isLevel2Unlocked && setActiveLevel('level2')}
            disabled={!isLevel2Unlocked}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              isLevel2Unlocked
                ? 'border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer'
                : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-70'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{isLevel2Unlocked ? '🤔' : '🔒'}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${isLevel2Unlocked ? 'text-green-800' : 'text-gray-500'}`}>
                    {t('levels.level2.name')}
                  </span>
                  {progress.level2Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {t('levels.completed')}
                    </span>
                  )}
                  {progress.level2Score !== null && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      {progress.level2Score} {t('levels.points')}
                    </span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${isLevel2Unlocked ? 'text-green-600' : 'text-gray-500'}`}>
                  {t('levels.level2.description')}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {isLevel2Unlocked
                    ? t('levels.level2.details')
                    : t('levels.level2.locked')}
                </div>
                {isLevel2Unlocked && !progress.level2Completed && progress.level2Score !== null && (
                  <div className="text-xs text-orange-600 mt-2 font-semibold">
                    {t('levels.level2.needScore').replace('{score}', String(LEVEL2_MASTERY_SCORE))}
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Level 3 - Locked until Level 2 completed */}
          <button
            onClick={() => isLevel3Unlocked && setActiveLevel('level3')}
            disabled={!isLevel3Unlocked}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              isLevel3Unlocked
                ? 'border-purple-400 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-70'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{isLevel3Unlocked ? '📐' : '🔒'}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${isLevel3Unlocked ? 'text-purple-800' : 'text-gray-500'}`}>
                    {t('levels.level3.name')}
                  </span>
                  {progress.level3Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {t('levels.completed')}
                    </span>
                  )}
                  {progress.level3Score !== null && (
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {progress.level3Score} {t('levels.points')}
                    </span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${isLevel3Unlocked ? 'text-purple-600' : 'text-gray-500'}`}>
                  {t('levels.level3.description')}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {isLevel3Unlocked
                    ? t('levels.level3.details')
                    : t('levels.level3.locked')}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Progress summary */}
        {progress.totalGamesPlayed > 0 && (
          <div className="mt-8 bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">{t('menu.progress')}</h3>
              <button
                onClick={resetProgress}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                {t('menu.reset')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-600">
                  {[progress.level1Completed, progress.level2Completed, progress.level3Completed].filter(Boolean).length}/3
                </div>
                <div className="text-xs text-gray-600">{t('menu.levelsCompleted')}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-lg font-bold text-green-600">
                  {(progress.level1Score || 0) + (progress.level2Score || 0) + (progress.level3Score || 0)}
                </div>
                <div className="text-xs text-gray-600">{t('menu.totalPoints')}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {progress.totalGamesPlayed}
                </div>
                <div className="text-xs text-gray-600">{t('menu.games')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Formula reference */}
        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2">{t('menu.formulas')}</h3>
          <div className="font-mono text-sm space-y-1 text-gray-600">
            <p>{t('formulas.molarity')}</p>
            <p>{t('formulas.dilution')}</p>
            <p>{t('formulas.moles')}</p>
            <p>{t('formulas.mixing')}</p>
          </div>
        </div>

        {/* Back to games link */}
        <div className="text-center mt-6">
          <a
            href="/games/1-ar/"
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← {t('menu.backToGames')}
          </a>
        </div>
      </div>

      {/* Achievements Panel Modal */}
      {showAchievements && (
        <AchievementsPanel
          achievements={achievements}
          allAchievements={allAchievements}
          onClose={() => setShowAchievements(false)}
          onReset={resetAll}
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
