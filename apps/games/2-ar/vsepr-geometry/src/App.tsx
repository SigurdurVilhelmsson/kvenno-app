import { useState } from 'react';

import { Header, LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';
import { useTabletTopOnChange } from './utils/tabletBand';

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
  totalGamesPlayed: 0,
};

function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { language, setLanguage, t } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'vsepr-geometry-progress',
    DEFAULT_PROGRESS
  );
  // Stig 2 and 3 have no heading of their own, so there focus goes to where the level
  // starts — the molecule's formula or the question — as it does on each Næsta.
  const screenStart = {
    get current(): HTMLElement | null {
      const heading = Array.from(document.querySelectorAll<HTMLElement>('h1, h2')).find(
        (h) => !h.closest('header')
      );
      return heading ?? document.querySelector<HTMLElement>('[data-item-start]');
    },
  };
  // Each screen swap starts the new screen at its top on a phone, with its heading focused
  // (the button that caused the swap has unmounted, and focus would otherwise fall to
  // <body>). Back on the menu, the first level not yet done is revealed and focused instead,
  // or Stig 1 once all three are done. Between a phone and md the old jump to the top stays.
  const nextLevel = ([1, 2, 3] as const).find((n) => !progress[`level${n}Completed`]) ?? 1;
  useScreenTop(activeLevel, {
    focus: screenStart,
    target: () =>
      activeLevel === 'menu' ? document.querySelector(`[data-level-card="${nextLevel}"]`) : null,
  });
  useTabletTopOnChange(activeLevel);

  const applyLevelResult = (level: 1 | 2 | 3) => (score: number) => {
    const key = `level${level}` as const;
    updateProgress({
      [`${key}Completed`]: true,
      [`${key}Score`]: Math.max(progress[`${key}Score`], score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    } as Partial<Progress>);
    // The completion screen says every level is done, so it follows the level
    // that finishes the set, in whatever order they were played. It used to
    // follow Stig 3 alone, and congratulated a student who had played only it.
    const allDone = ([1, 2, 3] as const).every(
      (l) => l === level || progress[`level${l}Completed`]
    );
    setActiveLevel(allDone ? 'complete' : 'menu');
  };

  const handleLevel1Complete = applyLevelResult(1);
  const handleLevel2Complete = applyLevelResult(2);
  const handleLevel3Complete = applyLevelResult(3);

  // Render active level
  if (activeLevel === 'level1') {
    return <Level1 onComplete={handleLevel1Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'level2') {
    return <Level2 onComplete={handleLevel2Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'level3') {
    return <Level3 onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} />;
  }

  // Complete screen
  if (activeLevel === 'complete') {
    const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 phone:mb-3 text-teal-600">
            Til hamingju!
          </h1>

          <div className="text-center mb-8 phone:mb-4">
            <div className="text-6xl mb-4 phone:text-4xl phone:mb-2">🏆</div>
            <div className="text-2xl font-bold text-warm-800 mb-2">
              Þú hefur lokið öllum stigum!
            </div>
          </div>

          <div className="space-y-4 mb-8 phone:space-y-2 phone:mb-4">
            <div className="bg-blue-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
              <div>
                <div className="font-bold text-blue-800">Stig 1: VSEPR Kenning</div>
                <div className="text-sm text-blue-600">Lögun og svæði rafeindaþéttleika</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
            </div>

            <div className="bg-green-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
              <div>
                <div className="font-bold text-green-800">Stig 2: Spá fyrir um lögun</div>
                <div className="text-sm text-green-600">Frá Lewis til rúmfræði</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
            </div>

            <div className="bg-purple-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Svigrúmablöndun og skautun</div>
                <div className="text-sm text-purple-600">Flóknar sameindir</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.level3Score}</div>
            </div>

            <div className="bg-teal-100 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3 border-2 border-teal-400">
              <div className="font-bold text-teal-800 text-lg">Heildarstig</div>
              <div className="text-3xl font-bold text-teal-600">{totalScore}</div>
            </div>
          </div>

          <div className="bg-teal-50 p-4 sm:p-6 rounded-xl mb-6 phone:mb-4">
            <h2 className="font-bold text-teal-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-teal-900 text-sm">
              <li>
                ✓ <strong>VSEPR:</strong> Svæði rafeindaþéttleika hrinda hvert öðru frá — ákvarðar
                lögun
              </li>
              <li>
                ✓ <strong>Svæði rafeindaþéttleika:</strong> Bindandi pör + stök pör = svæði
                rafeindaþéttleika
              </li>
              <li>
                ✓ <strong>Sameindarlögun:</strong> Stök pör „fela sig" en hafa áhrif á horn
              </li>
              <li>
                ✓ <strong>Svigrúmablöndun:</strong> sp (línuleg), sp² (þríhyrningslaga flöt), sp³
                (ferflötungur)...
              </li>
              <li>
                ✓ <strong>Skautun:</strong> Ósamhverf lögun = sameind skautuð
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // Main menu
  const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;
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
        gameTitle={t('game.title')}
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
          <p className="text-center text-warm-600 mb-8 phone:mb-3">{t('game.description')}</p>

          {/* Pedagogical explanation. Teaching that comes before the level choice stays first
              on a phone: it is read first on purpose, and costs one scroll (design §5). */}
          <div className="bg-teal-50 p-4 sm:p-6 rounded-xl mb-8 phone:p-3 phone:mb-4">
            <h2 className="font-bold text-teal-800 mb-3">Hvað er VSEPR?</h2>
            <p className="text-teal-900 text-sm mb-4 phone:mb-3">
              <strong>VSEPR</strong> (Valence Shell Electron Pair Repulsion) segir að svæði
              rafeindaþéttleika í ysta hvolfi miðatóms <em>hrindi hvert öðru frá</em> og staðsetji
              sig eins langt í sundur og hægt er. Þetta ákvarðar lögun sameindarinnar.
            </p>
            <div className="bg-white p-3 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 font-mono text-center">
                Svæði rafeindaþéttleika = Bindandi pör + Stök pör
              </p>
            </div>
          </div>

          {/* Level selection */}
          <div className="space-y-4 phone:space-y-3">
            {/* Level 1 */}
            <button
              data-level-card="1"
              onClick={() => setActiveLevel('level1')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl phone:text-2xl phone:shrink-0">🔮</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl phone:text-lg font-bold text-blue-800">
                      Stig 1: VSEPR Kenning
                    </span>
                    {progress.level1Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level1Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Kynntu þér mismunandi sameindarlögun
                  </div>
                  <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                    Sjáðu hvernig svæði rafeindaþéttleika hrinda hvert öðru og mynda mismunandi
                    rúmfræði.
                  </div>
                </div>
              </div>
            </button>

            {/* Level 2 */}
            <button
              data-level-card="2"
              onClick={() => setActiveLevel('level2')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl phone:text-2xl phone:shrink-0">🧩</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl phone:text-lg font-bold text-green-800">
                      Stig 2: Spá fyrir um lögun
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level2Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Ákvarðaðu lögun út frá Lewis-formúlu
                  </div>
                  <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                    Teldu svæði rafeindaþéttleika og spáðu fyrir um sameindarlögun og tengihorn.
                  </div>
                </div>
              </div>
            </button>

            {/* Level 3 */}
            <button
              data-level-card="3"
              onClick={() => setActiveLevel('level3')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl phone:text-2xl phone:shrink-0">⚗️</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl phone:text-lg font-bold text-purple-800">
                      Stig 3: Svigrúmablöndun og skautun
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level3Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Ákvarðaðu svigrúmablöndun og hvort sameind sé skautuð
                  </div>
                  <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                    Flóknari sameindir með mörgum miðatómum og tvískautsvægi.
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Progress Summary */}
          {progress.totalGamesPlayed > 0 && (
            <div className="mt-8 bg-warm-50 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-warm-700">Framvinda</h3>
                <button
                  onClick={resetProgress}
                  className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:min-h-11"
                >
                  Endurstilla
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="bg-teal-50 rounded-lg p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-teal-600">
                    {levelsCompleted}/3
                  </div>
                  <div className="text-xs text-warm-600">Stig lokið</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{totalScore}</div>
                  <div className="text-xs text-warm-600">Heildar stig</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {progress.totalGamesPlayed}
                  </div>
                  <div className="text-xs text-warm-600">Leikir spilaðir</div>
                </div>
              </div>
            </div>
          )}

          {/* Geometry reference */}
          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-3">📐 Algeng sameindarlögun</h3>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-white p-2 rounded border text-center">
                <div className="text-lg mb-1">—</div>
                <div className="font-bold text-warm-800">Línuleg</div>
                <div className="text-xs text-warm-500">180°</div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="text-lg mb-1">△</div>
                <div className="font-bold text-warm-800">Þríhyrnd</div>
                <div className="text-xs text-warm-500">120°</div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="text-lg mb-1">◇</div>
                <div className="font-bold text-warm-800">Ferflötungur</div>
                <div className="text-xs text-warm-500">109,5°</div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="text-lg mb-1">∠</div>
                <div className="font-bold text-warm-800">Beygð</div>
                <div className="text-xs text-warm-500">&lt;109,5°</div>
              </div>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju VSEPR?</h3>
            <p className="text-sm text-amber-700">
              Lögun sameinda ákvarðar virkni þeirra — af hverju vatn er beygt (og leysir), af hverju
              DNA er tvíþráður, af hverju lyf passa í ensím. Lögunin skýrir eiginleikana.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → Lewis → <u>VSEPR</u> → IMF → Hess →
            Kinetics → Redox → Organic
          </div>
          <div className="mt-2 text-center text-xs text-warm-400">
            Kafli 9 — Chemistry: The Central Science (Brown et al.)
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
