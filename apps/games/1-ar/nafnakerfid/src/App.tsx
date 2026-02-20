import { useState } from 'react';

import { LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { useAchievements } from '@shared/hooks/useAchievements';
import { useGameI18n } from '@shared/hooks/useGameI18n';
import { useGameProgress } from '@shared/hooks/useGameProgress';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { NameBuilder } from './components/NameBuilder';
import { gameTranslations } from './i18n';

type Screen = 'menu' | 'level1' | 'level2' | 'level3' | 'namebuilder';

interface Progress {
  level1Completed: boolean;
  level1Score: number;
  level2Completed: boolean;
  level2Score: number;
  level3BestMoves: { [key: string]: number };
  totalGamesPlayed: number;
}

const DEFAULT_PROGRESS: Progress = {
  level1Completed: false,
  level1Score: 0,
  level2Completed: false,
  level2Score: 0,
  level3BestMoves: {},
  totalGamesPlayed: 0,
};

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>('nafnakerfidProgress', DEFAULT_PROGRESS);
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

  const handleLevel1Complete = (score: number, maxScore: number, hintsUsed: number) => {
    const wasLevel1Complete = progress.level1Completed;
    updateProgress({
      level1Completed: true,
      level1Score: Math.max(progress.level1Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    trackLevelComplete(1, score, maxScore, { hintsUsed });

    // Check if all levels are now complete
    if (!wasLevel1Complete && progress.level2Completed && Object.keys(progress.level3BestMoves).length > 0) {
      trackGameComplete();
    }
    setScreen('menu');
  };

  const handleLevel2Complete = (score: number, maxScore: number, hintsUsed: number) => {
    const wasLevel2Complete = progress.level2Completed;
    updateProgress({
      level2Completed: true,
      level2Score: Math.max(progress.level2Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
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
    updateProgress({
      level3BestMoves: {
        ...progress.level3BestMoves,
        [key]: Math.min(progress.level3BestMoves[key] || Infinity, moves),
      },
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    // For Level3, score is based on pairs matched - we treat pairs as score
    trackLevelComplete(3, pairs, maxScore, { hintsUsed });

    // Check if all levels are now complete
    if (progress.level1Completed && progress.level2Completed && !wasLevel3Complete) {
      trackGameComplete();
    }
    setScreen('menu');
  };

  // Level screens
  if (screen === 'level1') {
    return (
      <>
        <Level1
          t={t}
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
          t={t}
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
          t={t}
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
          t={t}
          onComplete={(_score, _maxScore) => {
            updateProgress({
              totalGamesPlayed: progress.totalGamesPlayed + 1,
            });
            // NameBuilder is a bonus activity, not a numbered level.
            // Individual answers already tracked via onCorrectAnswer/onIncorrectAnswer.
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
              <h1 className="text-4xl font-bold font-heading text-center mb-2 text-warm-800">{t('game.title')}</h1>
              <p className="text-center text-warm-600">{t('game.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
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
                      {t('levels.level1.name')}
                    </span>
                    <h3 className="text-xl font-bold text-warm-800">{t('levels.level1.title')}</h3>
                  </div>
                  <p className="text-warm-600 text-sm">
                    {t('levels.level1.description')}
                  </p>
                </div>
                <div className="text-right">
                  {progress.level1Completed ? (
                    <div className="text-green-600">
                      <div className="text-2xl font-bold">{progress.level1Score}/10</div>
                      <div className="text-xs">{t('menu.completed')}</div>
                    </div>
                  ) : (
                    <div className="text-warm-400 text-3xl">&rarr;</div>
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
                  : 'border-warm-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-white text-sm font-bold px-3 py-1 rounded-full ${
                      progress.level1Completed ? 'bg-yellow-500' : 'bg-warm-400'
                    }`}>
                      {t('levels.level2.name')}
                    </span>
                    <h3 className="text-xl font-bold text-warm-800">{t('levels.level2.title')}</h3>
                    {!progress.level1Completed && (
                      <span className="text-xs text-warm-500">({t('menu.completeLevel1First')})</span>
                    )}
                  </div>
                  <p className="text-warm-600 text-sm">
                    {t('levels.level2.description')}
                  </p>
                </div>
                <div className="text-right">
                  {progress.level2Completed ? (
                    <div className="text-green-600">
                      <div className="text-2xl font-bold">{progress.level2Score}/12</div>
                      <div className="text-xs">{t('menu.completed')}</div>
                    </div>
                  ) : (
                    <div className="text-warm-400 text-3xl">&rarr;</div>
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
                  : 'border-warm-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-white text-sm font-bold px-3 py-1 rounded-full ${
                      progress.level2Completed ? 'bg-red-500' : 'bg-warm-400'
                    }`}>
                      {t('levels.level3.name')}
                    </span>
                    <h3 className="text-xl font-bold text-warm-800">{t('levels.level3.title')}</h3>
                    {!progress.level2Completed && (
                      <span className="text-xs text-warm-500">({t('menu.completeLevel2First')})</span>
                    )}
                  </div>
                  <p className="text-warm-600 text-sm">
                    {t('levels.level3.description')}
                  </p>
                </div>
                <div className="text-right">
                  {Object.keys(progress.level3BestMoves).length > 0 ? (
                    <div className="text-green-600">
                      <div className="text-xs">{t('menu.best')}:</div>
                      <div className="text-lg font-bold">
                        {Math.min(...Object.values(progress.level3BestMoves))} {t('menu.moves')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-warm-400 text-3xl">&rarr;</div>
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
                      {t('bonus.label')}
                    </span>
                    <h3 className="text-xl font-bold text-warm-800">{t('bonus.title')}</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{t('bonus.newBadge')}</span>
                  </div>
                  <p className="text-warm-600 text-sm">
                    {t('bonus.description')}
                  </p>
                </div>
                <div className="text-purple-500 text-3xl">&#x1f527;</div>
              </div>
            </button>
          </div>
        </div>

        {/* Progress Summary */}
        {progress.totalGamesPlayed > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-warm-700">{t('menu.progress')}</h3>
              <button
                onClick={resetProgress}
                className="text-sm text-warm-500 hover:text-red-500 transition-colors"
              >
                {t('menu.reset')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {[progress.level1Completed, progress.level2Completed].filter(Boolean).length}/2
                </div>
                <div className="text-xs text-warm-600">{t('menu.levelsCompleted')}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {progress.level1Score + progress.level2Score}
                </div>
                <div className="text-xs text-warm-600">{t('menu.totalPoints')}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">
                  {progress.totalGamesPlayed}
                </div>
                <div className="text-xs text-warm-600">{t('menu.gamesPlayed')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Back to games link */}
        <div className="text-center mt-6">
          <a
            href="/games/1-ar/"
            className="text-warm-500 hover:text-warm-700 text-sm transition-colors"
          >
            &larr; {t('menu.backToGames')}
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

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
