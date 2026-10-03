import { useState } from 'react';

import { LanguageSwitcher, ErrorBoundary, Header } from '@shared/components';
import { useGameI18n } from '@shared/hooks/useGameI18n';
import { useGameProgress } from '@shared/hooks/useGameProgress';
import { useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

type Screen = 'menu' | 'level1' | 'level2' | 'level3';
type Level = 1 | 2 | 3;

/**
 * What the game remembers: which levels are done, and the best count of right
 * answers in each. There is no score — the levels paid points and showed them
 * as they went (mobile-pass decision 1 (b)), and a hint never changes a count.
 *
 * Progress saved before the change carries `levelNScore` in points and no
 * `levelNCorrect`; those levels show as done with no count, rather than
 * reading old points as a number of right answers. That also retires the
 * menu's mismatched denominators: Level 3's score was shown over nothing.
 */
interface Progress {
  level1Completed: boolean;
  level1Correct?: number;
  level1Total?: number;
  level2Completed: boolean;
  level2Correct?: number;
  level2Total?: number;
  level3Completed: boolean;
  level3Correct?: number;
  level3Total?: number;
}

const DEFAULT_PROGRESS: Progress = {
  level1Completed: false,
  level2Completed: false,
  level3Completed: false,
};

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'nafnakerfidProgress',
    DEFAULT_PROGRESS
  );

  // Each screen replaces the whole page. Without this a level opened from a
  // scrolled phone menu starts part-way down, and finishing a level lands
  // mid-menu. The page goes to the top at every width, as it always did here,
  // and focus moves to the new screen's heading (the button that caused the
  // swap has unmounted, and focus would otherwise fall to <body>). Back on the
  // menu, the first level not yet done is focused — and on a phone revealed.
  // With all three done it is the first level: the menu has no heading of its
  // own outside the site header, so there is nothing else for focus to land on.
  const nextLevel = !progress.level1Completed
    ? 'level1'
    : !progress.level2Completed
      ? 'level2'
      : !progress.level3Completed
        ? 'level3'
        : 'level1';
  useScreenTop(screen, {
    anyWidth: true,
    target: () =>
      screen === 'menu' ? document.querySelector(`[data-level-card="${nextLevel}"]`) : null,
  });

  const completeLevel = (level: Level) => (correct: number, total: number) => {
    const key = `level${level}` as const;
    updateProgress({
      [`${key}Completed`]: true,
      [`${key}Correct`]: Math.max(progress[`${key}Correct`] ?? 0, correct),
      [`${key}Total`]: total,
    } as Partial<Progress>);
    setScreen('menu');
  };

  /** "6 af 8 rétt", or "Lokið" for a level finished before counts were kept. */
  const resultLabel = (level: Level): string => {
    const correct = progress[`level${level}Correct`];
    const total = progress[`level${level}Total`];
    return correct === undefined || total === undefined
      ? t('menu.completed')
      : `${correct} ${t('menu.of')} ${total} ${t('menu.correct')}`;
  };

  const levelsCompleted = [
    progress.level1Completed,
    progress.level2Completed,
    progress.level3Completed,
  ].filter(Boolean).length;

  // Level screens
  if (screen === 'level1') {
    return <Level1 t={t} onComplete={completeLevel(1)} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'level2') {
    return <Level2 t={t} onComplete={completeLevel(2)} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'level3') {
    return <Level3 t={t} onComplete={completeLevel(3)} onBack={() => setScreen('menu')} />;
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
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-6 phone:p-4">
            {/* The tagline restates the game's title: a phone leaves it to screen
                readers, so all three levels show on the first screen, on its
                side too. */}
            <p className="text-center text-warm-600 mb-4 phone:sr-only">{t('game.subtitle')}</p>

            {/* A phone on its side: the three levels side by side, so every
                choice is on the first screen. Each tile then stacks its result
                under its text, and drops the decorative arrow, so no title
                breaks mid-word in a third of the width. */}
            <div className="space-y-4 phone-land:grid phone-land:grid-cols-3 phone-land:gap-3 phone-land:space-y-0">
              {/* Level 1 */}
              <button
                data-level-card="level1"
                onClick={() => setScreen('level1')}
                className="game-card w-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-4 sm:p-6 phone:p-3 text-left transition-all"
              >
                <div className="flex items-center justify-between gap-3 phone-land:flex-col phone-land:items-start phone-land:gap-1">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="shrink-0 whitespace-nowrap bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {t('levels.level1.name')}
                      </span>
                      <h3 className="min-w-0 text-base min-[360px]:text-lg sm:text-xl font-bold text-warm-800">
                        {t('levels.level1.title')}
                      </h3>
                    </div>
                    <p className="text-warm-600 text-sm">{t('levels.level1.description')}</p>
                  </div>
                  <div className="shrink-0 text-right phone-land:text-left">
                    {progress.level1Completed ? (
                      <div className="text-green-700 text-sm sm:text-base font-bold whitespace-nowrap">
                        ✓ {resultLabel(1)}
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl phone-land:hidden">&rarr;</div>
                    )}
                  </div>
                </div>
              </button>

              {/* Level 2 */}
              <button
                data-level-card="level2"
                onClick={() => setScreen('level2')}
                className="game-card w-full bg-white border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl p-4 sm:p-6 phone:p-3 text-left transition-all"
              >
                <div className="flex items-center justify-between gap-3 phone-land:flex-col phone-land:items-start phone-land:gap-1">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="shrink-0 whitespace-nowrap bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {t('levels.level2.name')}
                      </span>
                      <h3 className="min-w-0 text-base min-[360px]:text-lg sm:text-xl font-bold text-warm-800">
                        {t('levels.level2.title')}
                      </h3>
                    </div>
                    <p className="text-warm-600 text-sm">{t('levels.level2.description')}</p>
                  </div>
                  <div className="shrink-0 text-right phone-land:text-left">
                    {progress.level2Completed ? (
                      <div className="text-green-700 text-sm sm:text-base font-bold whitespace-nowrap">
                        ✓ {resultLabel(2)}
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl phone-land:hidden">&rarr;</div>
                    )}
                  </div>
                </div>
              </button>

              {/* Level 3 */}
              <button
                data-level-card="level3"
                onClick={() => setScreen('level3')}
                className="game-card w-full bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl p-4 sm:p-6 phone:p-3 text-left transition-all"
              >
                <div className="flex items-center justify-between gap-3 phone-land:flex-col phone-land:items-start phone-land:gap-1">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="shrink-0 whitespace-nowrap bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {t('levels.level3.name')}
                      </span>
                      <h3 className="min-w-0 text-base min-[360px]:text-lg sm:text-xl font-bold text-warm-800">
                        {t('levels.level3.title')}
                      </h3>
                    </div>
                    <p className="text-warm-600 text-sm">{t('levels.level3.description')}</p>
                  </div>
                  <div className="shrink-0 text-right phone-land:text-left">
                    {progress.level3Completed ? (
                      <div className="text-green-700 text-sm sm:text-base font-bold whitespace-nowrap">
                        ✓ {resultLabel(3)}
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl phone-land:hidden">&rarr;</div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Progress Summary */}
          {/* Which levels are done, and the way to start over. No total: each
              level's count is on its own card (decision 1 (b)). */}
          {levelsCompleted > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-warm-700">{t('menu.progress')}</h3>
                <button
                  onClick={resetProgress}
                  className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3 pointer-coarse:px-2 pointer-coarse:-mx-2"
                >
                  {t('menu.reset')}
                </button>
              </div>
              <div className="bg-blue-50 rounded-lg px-1 py-2 sm:p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{levelsCompleted}/3</div>
                <div className="text-xs text-warm-600">{t('menu.levelsCompleted')}</div>
              </div>
            </div>
          )}

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju nafnakerfið?</h3>
            <p className="text-sm text-amber-700">
              IUPAC nafnakerfið gerir vísindamönnum um allan heim kleift að eiga samskipti um efni
              án misskilnings. Sama nafn, sama efni — óháð tungumáli.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → <u>Nafnakerfið</u> →
            Mólmassi → Reynsluformúlur → Stilla efnajöfnur → Útfellingarhvörf → Takmarkandi →
            Lausnir → Einingakeðjan
          </div>
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
