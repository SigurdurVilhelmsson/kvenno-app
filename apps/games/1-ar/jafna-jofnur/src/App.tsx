import { useState } from 'react';

import { LanguageSwitcher, ErrorBoundary, Header } from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';

import { Level } from './components/Level';
import { LEVEL1_CONFIG, LEVEL2_CONFIG, LEVEL3_CONFIG } from './components/levelConfigs';
import { gameTranslations } from './i18n';

type AppMode = 'menu' | 'level1' | 'level2' | 'level3';

interface Progress {
  level1Completed: boolean;
  level2Completed: boolean;
  level3Completed: boolean;
}

const DEFAULT_PROGRESS: Progress = {
  level1Completed: false,
  level2Completed: false,
  level3Completed: false,
};

const LEVEL_KEYS: Record<1 | 2 | 3, keyof Progress> = {
  1: 'level1Completed',
  2: 'level2Completed',
  3: 'level3Completed',
};

function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'jafnaJofnurProgress',
    DEFAULT_PROGRESS
  );

  const { t, language, setLanguage } = useGameI18n({ gameTranslations });

  const completeLevel = (level: 1 | 2 | 3) => {
    updateProgress({ [LEVEL_KEYS[level]]: true } as Partial<Progress>);
    setMode('menu');
  };

  // Render current mode
  if (mode === 'level1') {
    return (
      <Level
        config={LEVEL1_CONFIG}
        onBack={() => setMode('menu')}
        onComplete={() => completeLevel(1)}
      />
    );
  }

  if (mode === 'level2') {
    return (
      <Level
        config={LEVEL2_CONFIG}
        onBack={() => setMode('menu')}
        onComplete={() => completeLevel(2)}
      />
    );
  }

  if (mode === 'level3') {
    return (
      <Level
        config={LEVEL3_CONFIG}
        onBack={() => setMode('menu')}
        onComplete={() => completeLevel(3)}
      />
    );
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
            {/* Level 1: Simple Equations */}
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
                  {t('menu.level1.tags.simple')}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.smallCoeffs')}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.hints')}
                </span>
              </div>
            </button>

            {/* Level 2: Medium Equations */}
            <button
              onClick={() => setMode('level2')}
              className="game-card w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                    🔬
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
                  {t('menu.level2.tags.medium')}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.multiElement')}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.larger')}
                </span>
              </div>
            </button>

            {/* Level 3: Hard Equations */}
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
                  {t('menu.level3.tags.combustion')}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.displacement')}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.complex')}
                </span>
              </div>
            </button>
          </div>

          {/* Learning Path */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-warm-800 mb-3">{t('menu.learningPath.title')}</h3>
            <div className="space-y-3 text-sm text-warm-600">
              {([1, 2, 3] as const).map((step) => {
                const completed = progress[LEVEL_KEYS[step]];
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

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju jafna jöfnur?</h3>
            <p className="text-sm text-amber-700">
              Massavarðveislulögmálið segir að atóm hverfa ekki og myndast ekki — þau breyta bara um
              tengsl. Jöfnuð jafna tryggir að fjöldi atóma er sá sami beggja megin.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →{' '}
            <u>Jafna jöfnur</u> → Takmarkandi → Lausnir
          </div>

          {/* Reset */}
          {(progress.level1Completed || progress.level2Completed || progress.level3Completed) && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  if (confirm(t('menu.resetConfirm'))) {
                    resetProgress();
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
