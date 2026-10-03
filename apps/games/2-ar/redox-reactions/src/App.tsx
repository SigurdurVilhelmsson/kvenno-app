import { useState } from 'react';

import { Header, LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { useGameI18n } from '@shared/hooks';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

type ActiveLevel = 'menu' | 'level1' | 'level2' | 'level3' | 'complete';

/**
 * What the game remembers: which levels are done, and the best count of right
 * answers in each. There is no score — points were dropped from every level
 * (mobile-pass decision 1 (b)), and a hint never changes a count (decision 2 (b)).
 *
 * Progress saved before that change carries `levelNScore` in points and no
 * `levelNCorrect`; those levels show as done with no count, rather than
 * reading old points as a number of right answers.
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
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'redox-reactions-progress',
    DEFAULT_PROGRESS
  );

  // Each screen swap starts the new screen at its top on a phone, with its heading focused
  // (the button that caused the swap has unmounted, and focus would otherwise fall to
  // <body>). Back on the menu, the first level not yet done is revealed and focused instead.
  const nextLevel = ([1, 2, 3] as const).find((n) => !progress[`level${n}Completed`]);
  useScreenTop(activeLevel, {
    target: () =>
      activeLevel === 'menu' && nextLevel !== undefined
        ? document.querySelector(`[data-level-card="${nextLevel}"]`)
        : null,
  });

  // The closing screen says "Þú hefur lokið öllum stigum!", so it follows whichever level
  // completes the set. Levels are not gated, and sending Stig 3 there unconditionally told a
  // student who had played only Stig 3 that they had finished all three.
  const applyLevelResult = (level: 1 | 2 | 3, correct: number, total: number) => {
    const key = `level${level}` as const;
    const update = {
      [`${key}Completed`]: true,
      [`${key}Correct`]: Math.max(progress[`${key}Correct`] ?? 0, correct),
      [`${key}Total`]: total,
    } as Partial<Progress>;
    const next = { ...progress, ...update };
    updateProgress(update);
    const allDone = next.level1Completed && next.level2Completed && next.level3Completed;
    setActiveLevel(allDone ? 'complete' : 'menu');
  };

  const handleLevel1Complete = (correct: number, total: number) =>
    applyLevelResult(1, correct, total);
  const handleLevel2Complete = (correct: number, total: number) =>
    applyLevelResult(2, correct, total);
  const handleLevel3Complete = (correct: number, total: number) =>
    applyLevelResult(3, correct, total);

  /** "6 af 8 rétt", or "Lokið" for a level finished before counts were kept. */
  const resultLabel = (level: 1 | 2 | 3): string => {
    const correct = progress[`level${level}Correct`];
    const total = progress[`level${level}Total`];
    return correct === undefined || total === undefined
      ? t('progress.done', 'Lokið')
      : `${correct} ${t('progress.of', 'af')} ${total} ${t('progress.correct', 'rétt')}`;
  };

  if (activeLevel === 'level1') {
    return <Level1 t={t} onComplete={handleLevel1Complete} onBack={() => setActiveLevel('menu')} />;
  }
  if (activeLevel === 'level2') {
    return <Level2 t={t} onComplete={handleLevel2Complete} onBack={() => setActiveLevel('menu')} />;
  }
  if (activeLevel === 'level3') {
    return <Level3 t={t} onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-3 sm:p-4 md:p-8 phone:p-3">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 phone:mb-3 text-amber-600">
            {t('complete.title')}
          </h1>
          <div className="text-center mb-8 phone:mb-4">
            <div className="text-6xl mb-4 phone:text-4xl phone:mb-2">🏆</div>
            <div className="text-2xl font-bold text-warm-800">{t('complete.allCompleted')}</div>
          </div>

          {/* A phone on its side: the results | what was learned. The two groups are plain
              blocks, so desktop margins are unchanged. */}
          <div className="phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start">
            <div className="space-y-4 mb-8 phone:space-y-2 phone:mb-4">
              <div className="bg-blue-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-blue-800">{t('complete.level1Name')}</div>
                  <div className="text-sm text-blue-600">{t('complete.level1Desc')}</div>
                </div>
                <div className="font-bold text-blue-700 whitespace-nowrap">{resultLabel(1)}</div>
              </div>
              <div className="bg-green-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-green-800">{t('complete.level2Name')}</div>
                  <div className="text-sm text-green-600">{t('complete.level2Desc')}</div>
                </div>
                <div className="font-bold text-green-700 whitespace-nowrap">{resultLabel(2)}</div>
              </div>
              <div className="bg-purple-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-purple-800">{t('complete.level3Name')}</div>
                  <div className="text-sm text-purple-600">{t('complete.level3Desc')}</div>
                </div>
                <div className="font-bold text-purple-700 whitespace-nowrap">{resultLabel(3)}</div>
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-xl mb-6 phone:p-4 phone:mb-4">
              <h2 className="font-bold text-amber-800 mb-3">{t('complete.whatLearned')}</h2>
              <ul className="space-y-2 text-amber-900 text-sm">
                <li>
                  ✓ <strong>{t('concepts.oxidationNumber')}:</strong> {t('complete.learnOxNum')}
                </li>
                <li>
                  ✓ <strong>{t('concepts.oxidation')}:</strong> {t('complete.learnOx')}
                </li>
                <li>
                  ✓ <strong>{t('concepts.reduction')}:</strong> {t('complete.learnRed')}
                </li>
                <li>
                  ✓ <strong>{t('concepts.balancing')}:</strong> {t('complete.learnBalance')}
                </li>
              </ul>
            </div>
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
  const levelsCompleted = [
    progress.level1Completed,
    progress.level2Completed,
    progress.level3Completed,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle={t('menu.title')}
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />
      <div className="min-h-screen p-3 sm:p-4 md:p-8 phone:p-3">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-4">
          <p className="text-center text-warm-600 mb-8 phone:mb-3 phone:text-sm">
            {t('menu.subtitle')}
          </p>

          {/* Teaching that comes before the level choice stays first on a phone: it is read
              first on purpose, and costs one scroll (design §5). */}
          <div className="bg-amber-50 p-4 sm:p-6 rounded-xl mb-8 phone:p-3 phone:mb-4">
            <h2 className="font-bold text-amber-800 mb-3 phone:mb-2">{t('intro.title')}</h2>
            <p className="text-amber-900 text-sm mb-4 phone:mb-3">{t('intro.description')}</p>
            <div className="grid grid-cols-2 gap-4 text-sm phone:gap-3">
              <div className="bg-blue-100 p-3 rounded-lg text-center">
                <div className="font-bold text-blue-800">{t('concepts.oxidation')}</div>
                <div className="text-blue-600">{t('concepts.oxidationSubline')}</div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg text-center">
                <div className="font-bold text-red-800">{t('concepts.reduction')}</div>
                <div className="text-red-600">{t('concepts.reductionSubline')}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 phone:space-y-3">
            <button
              data-level-card="1"
              onClick={() => setActiveLevel('level1')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-2xl">🔢</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-blue-800 phone:text-lg">
                      {t('levels.level1.name')}
                    </span>
                    {progress.level1Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(1)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">{t('menu.level1Desc')}</div>
                </div>
              </div>
            </button>

            <button
              data-level-card="2"
              onClick={() => setActiveLevel('level2')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-2xl">🔄</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-green-800 phone:text-lg">
                      {t('levels.level2.name')}
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">{t('menu.level2Desc')}</div>
                </div>
              </div>
            </button>

            <button
              data-level-card="3"
              onClick={() => setActiveLevel('level3')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-2xl">⚖️</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-purple-800 phone:text-lg">
                      {t('levels.level3.name')}
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(3)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">{t('menu.level3Desc')}</div>
                </div>
              </div>
            </button>
          </div>

          {/* Progress: which levels are done, and the way to start over. */}
          {levelsCompleted > 0 && (
            <div className="mt-8 bg-warm-50 p-3 sm:p-4 rounded-xl flex justify-between items-center gap-3">
              <div className="text-warm-700">
                <span className="font-semibold">{t('progress.levelsCompleted')}:</span>{' '}
                {levelsCompleted} {t('progress.of', 'af')} 3
              </div>
              <button
                onClick={resetProgress}
                className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
              >
                {t('progress.reset')}
              </button>
            </div>
          )}

          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-2">📋 {t('menu.rulesTitle')}</h3>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 text-sm">
              <div className="bg-white p-2 rounded border">{t('menu.ruleElement')}</div>
              <div className="bg-white p-2 rounded border">{t('menu.ruleMonatomic')}</div>
              <div className="bg-white p-2 rounded border">{t('menu.ruleH')}</div>
              <div className="bg-white p-2 rounded border">{t('menu.ruleO')}</div>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju oxun og afoxun?</h3>
            <p className="text-sm text-amber-700">
              Rafhlöður, ryð, rafgreining og ljóstillífun — allt eru redox-hvörf. Skilningur á
              rafeindaflutningi er lykillinn að orkutækni og efnafræði lífsins.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → Lewis-formúlur → VSEPR →
            Millisameindakraftar → Lögmál Hess → Hvarfhraði → <u>Oxun og afoxun</u> → Lífræn
            nafnagift
          </div>
          <div className="mt-2 text-center text-xs text-warm-400">{t('menu.footer')}</div>
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
