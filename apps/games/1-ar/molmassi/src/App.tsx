import { useState } from 'react';

import { LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { useAchievements } from '@shared/hooks/useAchievements';
import { useGameI18n } from '@shared/hooks/useGameI18n';
import { ParticleCelebration, useParticleCelebration } from '@shared/components/ParticleCelebration';
import { AnimatedBackground } from '@shared/components/AnimatedBackground';
import { SoundToggle } from '@shared/components/SoundToggle';
import { useGameSounds } from '@shared/hooks/useGameSounds';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

type AppMode = 'menu' | 'level1' | 'level2' | 'level3';

interface Progress {
  level1Completed: boolean;
  level2Completed: boolean;
  level3HighScore: number;
}

function loadProgress(): Progress {
  const saved = localStorage.getItem('molmassiLevelProgress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { level1Completed: false, level2Completed: false, level3HighScore: 0 };
    }
  }
  return { level1Completed: false, level2Completed: false, level3HighScore: 0 };
}

function saveProgress(progress: Progress): void {
  localStorage.setItem('molmassiLevelProgress', JSON.stringify(progress));
}

function App() {
  const [mode, setMode] = useState<AppMode>('menu');
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
  } = useAchievements({ gameId: 'molmassi' });

  const { triggerCorrect, triggerLevelComplete, celebrationProps } = useParticleCelebration('1-ar');
  const { playCorrect, playWrong, playLevelComplete, isEnabled: soundEnabled, toggleSound } = useGameSounds();

  const handleCorrectAnswer = (...args: Parameters<typeof trackCorrectAnswer>) => {
    trackCorrectAnswer(...args);
    playCorrect();
    triggerCorrect();
  };

  const handleIncorrectAnswer = (...args: Parameters<typeof trackIncorrectAnswer>) => {
    trackIncorrectAnswer(...args);
    playWrong();
  };

  const completeLevel1 = (score: number, maxScore: number, hintsUsed: number) => {
    const newProgress = { ...progress, level1Completed: true };
    setProgress(newProgress);
    saveProgress(newProgress);
    trackLevelComplete(1, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    setMode('level2');
  };

  const completeLevel2 = (score: number, maxScore: number, hintsUsed: number) => {
    const newProgress = { ...progress, level2Completed: true };
    setProgress(newProgress);
    saveProgress(newProgress);
    trackLevelComplete(2, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    setMode('level3');
  };

  const completeLevel3 = (score: number, maxScore: number, hintsUsed: number) => {
    trackLevelComplete(3, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    // Check if all levels are complete to track game completion
    if (progress.level1Completed && progress.level2Completed) {
      trackGameComplete();
    }
  };

  // Render current mode
  if (mode === 'level1') {
    return (
      <>
        <Level1
          onBack={() => setMode('menu')}
          onComplete={completeLevel1}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
        <ParticleCelebration {...celebrationProps} />
      </>
    );
  }

  if (mode === 'level2') {
    return (
      <>
        <Level2
          onBack={() => setMode('menu')}
          onComplete={completeLevel2}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
        <ParticleCelebration {...celebrationProps} />
      </>
    );
  }

  if (mode === 'level3') {
    return (
      <>
        <Level3
          onBack={() => setMode('menu')}
          onComplete={completeLevel3}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
        <ParticleCelebration {...celebrationProps} />
      </>
    );
  }

  // Main Menu with Level Selection
  return (
    <AnimatedBackground yearTheme="1-ar" variant="menu" showSymbols>
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header with Language Switcher and Achievements Button */}
        <div className="flex justify-between items-center mb-4 animate-fade-in-up">
          <LanguageSwitcher
            language={language}
            onLanguageChange={setLanguage}
            variant="compact"
          />
          <AchievementsButton
            achievements={achievements}
            onClick={() => setShowAchievements(true)}
          />
          <SoundToggle isEnabled={soundEnabled} onToggle={toggleSound} size="sm" />
        </div>

        {/* Title */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-6xl mb-4">⚗️</div>
          <h1 className="text-4xl font-bold font-heading text-warm-800 mb-2">{t('game.title')}</h1>
          <p className="text-warm-600">{t('game.subtitle')}</p>
        </div>

        {/* Level Cards */}
        <div className="space-y-4">
          {/* Level 1 */}
          <button
            onClick={() => setMode('level1')}
            className="game-card w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all transform hover:scale-[1.02] animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                  🔬
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-warm-800">{t('menu.level1.title')}</h2>
                    {progress.level1Completed && (
                      <span className="text-green-500 text-lg">✓</span>
                    )}
                  </div>
                  <p className="text-warm-600 text-sm">{t('menu.level1.description')}</p>
                </div>
              </div>
              <span className="text-warm-400 text-2xl">→</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{t('menu.level1.tags.countAtoms')}</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{t('menu.level1.tags.compare')}</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{t('menu.level1.tags.buildMolecules')}</span>
            </div>
          </button>

          {/* Level 2 */}
          <button
            onClick={() => setMode('level2')}
            className={`game-card w-full bg-white rounded-2xl shadow-lg p-6 text-left transition-all transform animate-fade-in-up ${
              !progress.level1Completed
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:shadow-xl hover:scale-[1.02]'
            }`}
            style={{ animationDelay: '200ms' }}
            disabled={!progress.level1Completed}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                  📊
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-warm-800">{t('menu.level2.title')}</h2>
                    {progress.level2Completed && (
                      <span className="text-green-500 text-lg">✓</span>
                    )}
                    {!progress.level1Completed && (
                      <span className="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">🔒 {t('menu.level2.locked')}</span>
                    )}
                  </div>
                  <p className="text-warm-600 text-sm">{t('menu.level2.description')}</p>
                </div>
              </div>
              <span className="text-warm-400 text-2xl">→</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{t('menu.level2.tags.estimateMass')}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{t('menu.level2.tags.sortMolecules')}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{t('menu.level2.tags.wholeNumbers')}</span>
            </div>
          </button>

          {/* Level 3 */}
          <button
            onClick={() => setMode('level3')}
            className={`game-card w-full bg-white rounded-2xl shadow-lg p-6 text-left transition-all transform animate-fade-in-up ${
              !progress.level2Completed
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:shadow-xl hover:scale-[1.02]'
            }`}
            style={{ animationDelay: '300ms' }}
            disabled={!progress.level2Completed}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
                  🧮
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-warm-800">{t('menu.level3.title')}</h2>
                    {!progress.level2Completed && (
                      <span className="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">🔒 {t('menu.level2.locked')}</span>
                    )}
                  </div>
                  <p className="text-warm-600 text-sm">{t('menu.level3.description')}</p>
                </div>
              </div>
              <span className="text-warm-400 text-2xl">→</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{t('menu.level3.tags.periodicTable')}</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{t('menu.level3.tags.preciseCalculations')}</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{t('menu.level3.tags.competition')}</span>
            </div>
          </button>
        </div>

        {/* Learning Path Description */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="font-bold text-warm-800 mb-3 flex items-center gap-2">
            <span>📚</span> {t('menu.learningPath.title')}
          </h3>
          <div className="space-y-3 text-sm text-warm-600">
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress.level1Completed ? 'bg-green-500 text-white' : 'bg-warm-200 text-warm-600'}`}>1</div>
              <div>
                <span className="font-medium text-warm-800">{t('menu.learningPath.step1.title')}</span> - {t('menu.learningPath.step1.description')}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress.level2Completed ? 'bg-green-500 text-white' : 'bg-warm-200 text-warm-600'}`}>2</div>
              <div>
                <span className="font-medium text-warm-800">{t('menu.learningPath.step2.title')}</span> - {t('menu.learningPath.step2.description')}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-warm-200 text-warm-600">3</div>
              <div>
                <span className="font-medium text-warm-800">{t('menu.learningPath.step3.title')}</span> - {t('menu.learningPath.step3.description')}
              </div>
            </div>
          </div>
        </div>

        {/* Reset Progress (small link) */}
        {(progress.level1Completed || progress.level2Completed) && (
          <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={() => {
                if (confirm(t('menu.resetConfirm'))) {
                  const reset = { level1Completed: false, level2Completed: false, level3HighScore: 0 };
                  setProgress(reset);
                  saveProgress(reset);
                }
              }}
              className="text-xs text-warm-400 hover:text-warm-600 underline"
            >
              {t('menu.resetProgress')}
            </button>
          </div>
        )}
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
      <ParticleCelebration {...celebrationProps} />
    </div>
    </AnimatedBackground>
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
