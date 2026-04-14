import { useState } from 'react';

import { LanguageSwitcher, ErrorBoundary, Header } from '@shared/components';
import { useGameI18n } from '@shared/hooks/useGameI18n';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

type AppMode = 'menu' | 'level1' | 'level2' | 'level3';

interface Progress {
  level1Completed: boolean;
  level2Completed: boolean;
  level3Completed: boolean;
}

function loadProgress(): Progress {
  const saved = localStorage.getItem('molhugtakidProgress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { level1Completed: false, level2Completed: false, level3Completed: false };
    }
  }
  return { level1Completed: false, level2Completed: false, level3Completed: false };
}

function saveProgress(progress: Progress): void {
  localStorage.setItem('molhugtakidProgress', JSON.stringify(progress));
}

function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [progress, setProgress] = useState<Progress>(loadProgress());

  const { t, language, setLanguage } = useGameI18n({ gameTranslations });

  const completeLevel = (level: 1 | 2 | 3) => {
    const key = `level${level}Completed` as keyof Progress;
    const newProgress = { ...progress, [key]: true };
    setProgress(newProgress);
    saveProgress(newProgress);
    setMode('menu');
  };

  // Render current mode
  if (mode === 'level1') {
    return <Level1 onBack={() => setMode('menu')} onComplete={() => completeLevel(1)} />;
  }

  if (mode === 'level2') {
    return <Level2 onBack={() => setMode('menu')} onComplete={() => completeLevel(2)} />;
  }

  if (mode === 'level3') {
    return <Level3 onBack={() => setMode('menu')} onComplete={() => completeLevel(3)} />;
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header
        variant="game"
        backHref="/efnafraedi/1-ar/"
        gameTitle={t('game.title')}
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <p className="text-warm-600">{t('game.subtitle')}</p>
          </div>

          {/* Level Cards */}
          <div className="space-y-4">
            {/* Level 1: Molar Mass */}
            <button
              onClick={() => setMode('level1')}
              className="game-card w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                    ⚖️
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
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.calculate')}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.periodicTable')}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.formula')}
                </span>
              </div>
            </button>

            {/* Level 2: Mole Conversions */}
            <button
              onClick={() => setMode('level2')}
              className="game-card w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                    🔄
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-warm-800">{t('menu.level2.title')}</h2>
                      {progress.level2Completed && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-warm-600 text-sm">{t('menu.level2.description')}</p>
                  </div>
                </div>
                <span className="text-warm-400 text-2xl">→</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.massToMoles')}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.molesToMass')}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.molesToParticles')}
                </span>
              </div>
            </button>

            {/* Level 3: Combined Practice */}
            <button
              onClick={() => setMode('level3')}
              className="game-card w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                    🧪
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-warm-800">{t('menu.level3.title')}</h2>
                      {progress.level3Completed && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-warm-600 text-sm">{t('menu.level3.description')}</p>
                  </div>
                </div>
                <span className="text-warm-400 text-2xl">→</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.multiStep')}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.combined')}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.mastery')}
                </span>
              </div>
            </button>
          </div>

          {/* Learning Path */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-warm-800 mb-3">{t('menu.learningPath.title')}</h3>
            <div className="space-y-3 text-sm text-warm-600">
              {[1, 2, 3].map((step) => {
                const completed = progress[`level${step}Completed` as keyof Progress];
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completed ? 'bg-green-500 text-white' : 'bg-warm-200 text-warm-600'
                      }`}
                    >
                      {step}
                    </div>
                    <div>
                      <span className="font-medium text-warm-800">
                        {t(`menu.learningPath.step${step}.title`)}
                      </span>{' '}
                      - {t(`menu.learningPath.step${step}.description`)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          {(progress.level1Completed || progress.level2Completed || progress.level3Completed) && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  if (confirm(t('menu.resetConfirm'))) {
                    const reset = {
                      level1Completed: false,
                      level2Completed: false,
                      level3Completed: false,
                    };
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
      </div>
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
