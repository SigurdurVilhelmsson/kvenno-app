import { useLayoutEffect, useState } from 'react';

import { LanguageSwitcher, ErrorBoundary, Header } from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';
import { revealTop, useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';
import { tabletBelowMd } from './utils/tableLayout';

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
    'lotukerfidProgress',
    DEFAULT_PROGRESS
  );

  const { t, language, setLanguage } = useGameI18n({ gameTranslations });

  // A level opened from low on the menu would otherwise start scrolled down:
  // each screen swap starts the new screen at its top on a phone, with its
  // heading focused (the button that caused the swap has unmounted, and focus
  // would otherwise fall to <body>). Back on the menu, the first level not yet
  // done is revealed and focused instead — the first one once all are done.
  const nextLevel = ([1, 2, 3] as const).find((level) => !progress[LEVEL_KEYS[level]]) ?? 1;
  useScreenTop(mode, {
    target: () =>
      mode === 'menu' ? document.querySelector(`[data-level-card="${nextLevel}"]`) : null,
  });
  // Below md but wider than a phone, the game's old helper started every
  // screen at the top of the page too, in one jump, and still does.
  useLayoutEffect(() => {
    if (tabletBelowMd())
      revealTop(document.documentElement, { anyWidth: true, always: true, instant: true });
  }, [mode]);

  const completeLevel = (level: 1 | 2 | 3) => {
    updateProgress({ [LEVEL_KEYS[level]]: true } as Partial<Progress>);
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
          <div className="text-center mb-8 phone:mb-3">
            <p className="text-warm-600">{t('game.subtitle')}</p>
          </div>

          {/* Level Cards. On a phone the wrapping title beside each icon tile
              squeezed it into a narrow pill, so below md the tiles (and the
              numbered circles further down) keep their size. On a phone the
              cards are compact and the tag chips, which restate the
              description, are hidden, so all three levels show at once. */}
          <div className="space-y-4 phone:space-y-3">
            {/* Level 1: Identify Elements */}
            <button
              data-level-card={1}
              onClick={() => setMode('level1')}
              className="game-card w-full bg-white rounded-2xl shadow-lg p-6 phone:p-4 text-left hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 phone:gap-3">
                  <div className="w-14 h-14 phone:w-10 phone:h-10 shrink-0 md:shrink rounded-xl bg-green-100 flex items-center justify-center text-2xl phone:text-xl">
                    🔍
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl phone:text-lg font-bold text-warm-800">
                        {t('menu.level1.title')}
                      </h2>
                      {progress.level1Completed && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-warm-600 text-sm">{t('menu.level1.description')}</p>
                  </div>
                </div>
                <span className="text-warm-400 text-2xl">→</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 phone:hidden">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.find')}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.symbols')}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {t('menu.level1.tags.position')}
                </span>
              </div>
            </button>

            {/* Level 2: Groups and Trends */}
            <button
              data-level-card={2}
              onClick={() => setMode('level2')}
              className="game-card w-full bg-white rounded-2xl shadow-lg p-6 phone:p-4 text-left hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 phone:gap-3">
                  <div className="w-14 h-14 phone:w-10 phone:h-10 shrink-0 md:shrink rounded-xl bg-blue-100 flex items-center justify-center text-2xl phone:text-xl">
                    📊
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl phone:text-lg font-bold text-warm-800">
                        {t('menu.level2.title')}
                      </h2>
                      {progress.level2Completed && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-warm-600 text-sm">{t('menu.level2.description')}</p>
                  </div>
                </div>
                <span className="text-warm-400 text-2xl">→</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 phone:hidden">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.classify')}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.trends')}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {t('menu.level2.tags.groups')}
                </span>
              </div>
            </button>

            {/* Level 3: Atomic Structure */}
            <button
              data-level-card={3}
              onClick={() => setMode('level3')}
              className="game-card w-full bg-white rounded-2xl shadow-lg p-6 phone:p-4 text-left hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 phone:gap-3">
                  <div className="w-14 h-14 phone:w-10 phone:h-10 shrink-0 md:shrink rounded-xl bg-purple-100 flex items-center justify-center text-2xl phone:text-xl">
                    ⚛️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl phone:text-lg font-bold text-warm-800">
                        {t('menu.level3.title')}
                      </h2>
                      {progress.level3Completed && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-warm-600 text-sm">{t('menu.level3.description')}</p>
                  </div>
                </div>
                <span className="text-warm-400 text-2xl">→</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 phone:hidden">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.protons')}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.neutrons')}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {t('menu.level3.tags.electrons')}
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
                      className={`w-6 h-6 shrink-0 md:shrink rounded-full flex items-center justify-center text-xs font-bold ${
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
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju lotukerfið?</h3>
            <p className="text-sm text-amber-700">
              Lotukerfið raðar frumefnum eftir eiginleikum — þannig getum við spáð fyrir um hegðun
              óþekktra efna. Efnafræðingar notuðu lotukerfið til að spá fyrir um frumefni sem höfðu
              ekki enn verið uppgötvuð.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Einingagreining → <u>Lotukerfið</u> → Nafnakerfið →
            Mólmassi → Reynsluformúlur → Stilla efnajöfnur → Útfellingarhvörf → Takmarkandi →
            Lausnir → Einingakeðjan
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
                className="text-xs text-warm-400 hover:text-warm-600 underline pointer-coarse:py-3.5 pointer-coarse:-my-3.5"
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
