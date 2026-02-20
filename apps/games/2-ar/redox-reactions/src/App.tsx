import { useState } from 'react';

import { LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { useGameI18n } from '@shared/hooks';
import { useGameProgress } from '@shared/hooks';
import { useAchievements } from '@shared/hooks/useAchievements';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
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

const DEFAULT_PROGRESS: Progress = {
  level1Completed: false,
  level1Score: 0,
  level2Completed: false,
  level2Score: 0,
  level3Completed: false,
  level3Score: 0,
  totalGamesPlayed: 0
};

function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>('redox-reactions-progress', DEFAULT_PROGRESS);
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
  } = useAchievements({ gameId: 'redox-reactions' });

  const handleLevel1Complete = (score: number, maxScore: number, hintsUsed: number) => {
    updateProgress({
      level1Completed: true,
      level1Score: Math.max(progress.level1Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1
    });
    trackLevelComplete(1, score, maxScore, { hintsUsed });
    setActiveLevel('menu');
  };

  const handleLevel2Complete = (score: number, maxScore: number, hintsUsed: number) => {
    updateProgress({
      level2Completed: true,
      level2Score: Math.max(progress.level2Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1
    });
    trackLevelComplete(2, score, maxScore, { hintsUsed });
    setActiveLevel('menu');
  };

  const handleLevel3Complete = (score: number, maxScore: number, hintsUsed: number) => {
    updateProgress({
      level3Completed: true,
      level3Score: Math.max(progress.level3Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1
    });
    trackLevelComplete(3, score, maxScore, { hintsUsed });
    trackGameComplete();
    setActiveLevel('complete');
  };

  if (activeLevel === 'level1') {
    return (
      <>
        <Level1
          t={t}
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
          t={t}
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
          t={t}
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-amber-600">
            {t('complete.title')}
          </h1>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-2xl font-bold text-warm-800">{t('complete.allCompleted')}</div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-800">{t('complete.level1Name')}</div>
                <div className="text-sm text-blue-600">{t('complete.level1Desc')}</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800">{t('complete.level2Name')}</div>
                <div className="text-sm text-green-600">{t('complete.level2Desc')}</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-800">{t('complete.level3Name')}</div>
                <div className="text-sm text-purple-600">{t('complete.level3Desc')}</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.level3Score}</div>
            </div>
            <div className="bg-amber-100 p-4 rounded-xl flex justify-between items-center border-2 border-amber-400">
              <div className="font-bold text-amber-800 text-lg">{t('complete.totalScore')}</div>
              <div className="text-3xl font-bold text-amber-600">{totalScore}</div>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-xl mb-6">
            <h2 className="font-bold text-amber-800 mb-3">{t('complete.whatLearned')}</h2>
            <ul className="space-y-2 text-amber-900 text-sm">
              <li>✓ <strong>{t('concepts.oxidationNumber')}:</strong> {t('complete.learnOxNum')}</li>
              <li>✓ <strong>{t('concepts.oxidation')}:</strong> {t('complete.learnOx')}</li>
              <li>✓ <strong>{t('concepts.reduction')}:</strong> {t('complete.learnRed')}</li>
              <li>✓ <strong>{t('concepts.balancing')}:</strong> {t('complete.learnBalance')}</li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
          >
            {t('complete.backToMenu')}
          </button>
        </div>
      </div>
    );
  }

  // Main menu
  const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;
  const levelsCompleted = [progress.level1Completed, progress.level2Completed, progress.level3Completed].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-end mb-4 gap-2">
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
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-center mb-2 text-amber-600">
          ⚡ {t('menu.title')}
        </h1>
        <p className="text-center text-warm-600 mb-8">
          {t('menu.subtitle')}
        </p>

        <div className="bg-amber-50 p-6 rounded-xl mb-8">
          <h2 className="font-bold text-amber-800 mb-3">{t('intro.title')}</h2>
          <p className="text-amber-900 text-sm mb-4">
            {t('intro.description')}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="font-bold text-blue-800">{t('concepts.oxidation')}</div>
              <div className="text-blue-600">{t('concepts.oxidation') === 'Oxun' ? 'Tapa e⁻ → ox# ↑' : t('concepts.oxidation') === 'Utlenianie' ? 'Utrata e⁻ → ox# ↑' : 'Lose e⁻ → ox# ↑'}</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-center">
              <div className="font-bold text-red-800">{t('concepts.reduction')}</div>
              <div className="text-red-600">{t('concepts.reduction') === 'Afoxun' ? 'Öðlast e⁻ → ox# ↓' : t('concepts.reduction') === 'Redukcja' ? 'Zyskanie e⁻ → ox# ↓' : 'Gain e⁻ → ox# ↓'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setActiveLevel('level1')}
            className="w-full p-6 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔢</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-800">{t('levels.level1.name')}</span>
                  {progress.level1Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ {progress.level1Score} {t('progress.points', 'stig')}</span>
                  )}
                </div>
                <div className="text-sm text-blue-600 mt-1">{t('menu.level1Desc')}</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => progress.level1Completed && setActiveLevel('level2')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level1Completed
                ? 'border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer'
                : 'border-warm-200 bg-warm-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔄</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level1Completed ? 'text-green-800' : 'text-warm-600'}`}>
                    {t('levels.level2.name')}
                  </span>
                  {progress.level2Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ {progress.level2Score} {t('progress.points', 'stig')}</span>
                  )}
                  {!progress.level1Completed && (
                    <span className="text-xs text-warm-500">({t('levels.level2.locked')})</span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${progress.level1Completed ? 'text-green-600' : 'text-warm-500'}`}>
                  {t('menu.level2Desc')}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => progress.level2Completed && setActiveLevel('level3')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level2Completed
                ? 'border-purple-400 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                : 'border-warm-200 bg-warm-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚖️</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level2Completed ? 'text-purple-800' : 'text-warm-600'}`}>
                    {t('levels.level3.name')}
                  </span>
                  {progress.level3Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ {progress.level3Score} {t('progress.points', 'stig')}</span>
                  )}
                  {!progress.level2Completed && (
                    <span className="text-xs text-warm-500">({t('levels.level3.locked')})</span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${progress.level2Completed ? 'text-purple-600' : 'text-warm-500'}`}>
                  {t('menu.level3Desc')}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Progress Summary */}
        {progress.totalGamesPlayed > 0 && (
          <div className="mt-8 bg-warm-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-warm-700">{t('progress.title')}</h3>
              <button
                onClick={resetProgress}
                className="text-sm text-warm-500 hover:text-red-500 transition-colors"
              >
                {t('progress.reset')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-600">{levelsCompleted}/3</div>
                <div className="text-xs text-warm-600">{t('progress.levelsCompleted')}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{totalScore}</div>
                <div className="text-xs text-warm-600">{t('progress.totalScore')}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{progress.totalGamesPlayed}</div>
                <div className="text-xs text-warm-600">{t('progress.gamesPlayed')}</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-warm-50 p-4 rounded-xl">
          <h3 className="font-semibold text-warm-700 mb-2">📋 {t('menu.rulesTitle')}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white p-2 rounded border">{t('menu.ruleElement')}</div>
            <div className="bg-white p-2 rounded border">{t('menu.ruleMonatomic')}</div>
            <div className="bg-white p-2 rounded border">{t('menu.ruleH')}</div>
            <div className="bg-white p-2 rounded border">{t('menu.ruleO')}</div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-warm-500">
          {t('menu.footer')}
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

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
