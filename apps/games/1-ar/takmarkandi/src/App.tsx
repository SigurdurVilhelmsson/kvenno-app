import { useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';

import './styles.css';

type Screen = 'menu' | 'level1' | 'level2' | 'level3';

type Level = 1 | 2 | 3;

/**
 * What the game remembers: which levels are done, and the best count of right
 * answers in each. There is no score — every level paid points, and Stig 3 paid
 * a step put right after its answer was shown the same as one right at once
 * (mobile-pass decisions 1 (b) and 54 (a)).
 *
 * Progress saved before the change carries points and no `levelNCorrect`; those
 * levels show as done with no count, rather than reading old points as a
 * number of right answers.
 */
interface Progress {
  level1Completed: boolean;
  level1Correct?: number;
  level1Total?: number;
  level2Completed: boolean;
  level2Correct?: number;
  level2Total?: number;
  /** Optional: progress saved before it existed lacks it. */
  level3Completed?: boolean;
  level3Correct?: number;
  level3Total?: number;
  /**
   * The old format's Stig 3 points, read only to tell that the level was
   * played before `level3Completed` existed. Never shown.
   */
  level3BestScore?: number;
}

const DEFAULT_PROGRESS: Progress = {
  level1Completed: false,
  level2Completed: false,
  level3Completed: false,
};

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'takmarkandi-levels-progress',
    DEFAULT_PROGRESS
  );

  // Each screen swap opens the new screen at the top of the page, as it always
  // has at every width (`anyWidth`), with its heading focused: the button that
  // caused the swap has unmounted, and focus would otherwise fall to <body>.
  // Back on the menu, the first level not yet done is focused instead (Stig 1
  // once all are), and a phone also brings that card into view.
  // Finishing Stig 3 counts even with nothing right; old points alone stand in
  // for progress saved before the flag.
  const level3Done = Boolean(progress.level3Completed) || (progress.level3BestScore ?? 0) > 0;
  const done = [progress.level1Completed, progress.level2Completed, level3Done];
  const nextLevel = done.findIndex((d) => !d) + 1 || 1;
  const levelsCompleted = done.filter(Boolean).length;
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
    return correct === undefined || total === undefined ? 'Lokið' : `${correct} af ${total} rétt`;
  };

  // Level screens
  if (screen === 'level1') {
    return <Level1 onComplete={completeLevel(1)} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'level2') {
    return <Level2 onComplete={completeLevel(2)} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'level3') {
    return <Level3 onComplete={completeLevel(3)} onBack={() => setScreen('menu')} />;
  }

  // Main Menu - Year 1: Orange/Amber theme
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/1-ar/" gameTitle="Takmarkandi hvarfefni" />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* On a phone the card and its tiles are tighter, so all three levels
              show on first load. */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-6 phone:p-3 phone:mb-4">
            <p className="text-center text-warm-600 mb-4 phone:mb-3">
              Lærðu að finna takmarkandi hvarfefni og reikna heimtur
            </p>

            <div className="space-y-4 phone:space-y-3">
              {/* Level 1 */}
              <button
                data-level-card={1}
                onClick={() => setScreen('level1')}
                className="game-card w-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-4 sm:p-6 phone:p-3 text-left transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 phone:mb-1">
                      <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Stig 1
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-warm-800">Grunnhugtök</h3>
                    </div>
                    <p className="text-warm-600 text-sm">
                      Skildu hugtökin sjónrænt - hvað eyðist fyrst?
                    </p>
                  </div>
                  <div className="text-right">
                    {progress.level1Completed ? (
                      <div className="text-green-700 text-sm sm:text-base font-bold whitespace-nowrap">
                        ✓ {resultLabel(1)}
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl">→</div>
                    )}
                  </div>
                </div>
              </button>

              {/* Level 2 */}
              <button
                data-level-card={2}
                onClick={() => setScreen('level2')}
                className="game-card w-full bg-white border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl p-4 sm:p-6 phone:p-3 text-left transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 phone:mb-1">
                      <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Stig 2
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-warm-800">
                        Leiðbeind æfing
                      </h3>
                    </div>
                    <p className="text-warm-600 text-sm">
                      Leystu verkefni skref fyrir skref með leiðsögn
                    </p>
                  </div>
                  <div className="text-right">
                    {progress.level2Completed ? (
                      <div className="text-green-700 text-sm sm:text-base font-bold whitespace-nowrap">
                        ✓ {resultLabel(2)}
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl">→</div>
                    )}
                  </div>
                </div>
              </button>

              {/* Level 3 */}
              <button
                data-level-card={3}
                onClick={() => setScreen('level3')}
                className="game-card w-full bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl p-4 sm:p-6 phone:p-3 text-left transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 phone:mb-1">
                      <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Stig 3
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-warm-800">Meistarapróf</h3>
                    </div>
                    <p className="text-warm-600 text-sm">
                      Samþætt verkefni í grömmum: finndu takmarkandi hvarfefni, fræðilegar heimtur
                      og prósentuheimtur
                    </p>
                  </div>
                  <div className="text-right">
                    {level3Done ? (
                      <div className="text-green-700 text-sm sm:text-base font-bold whitespace-nowrap">
                        ✓ {resultLabel(3)}
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl">→</div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Which levels are done, and the way to start over. No total: each
              level's count is on its own card (decision 1 (b)). */}
          {levelsCompleted > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-warm-700">Framvinda</h3>
                <button
                  onClick={resetProgress}
                  className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
                >
                  Endurstilla
                </button>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {levelsCompleted}/3
                </div>
                <div className="text-xs text-warm-600">Stigum lokið</div>
              </div>
            </div>
          )}

          {/* What you'll learn */}
          <div className="bg-orange-50 rounded-xl p-6 mt-6">
            <h3 className="font-bold text-orange-800 mb-3">Hvað lærir þú?</h3>
            <ul className="text-sm text-warm-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Hvað er takmarkandi hvarfefni og hvers vegna það skiptir máli</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Hvernig á að finna takmarkandi hvarfefni út frá stuðlum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Reikna magn myndefna og afganga eftir hvarf</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Nota hlutfallaefnafræði til að leysa raunveruleg vandamál</span>
              </li>
            </ul>
          </div>
          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju takmarkandi hvarfefni?</h3>
            <p className="text-sm text-amber-700">
              Í iðnaði skiptir máli að vita hvaða hráefni klárast fyrst — það ákvarðar hversu mikið
              myndefni verður. Lyfjafyrirtæki nota þetta til að hámarka framleiðslu og lágmarka
              sóun.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →
            Reynsluformúlur → Stilla efnajöfnur → Útfellingarhvörf → <u>Takmarkandi</u> → Lausnir →
            Einingakeðjan
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
