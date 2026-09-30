import { useState } from 'react';

import { Header, ErrorBoundary } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';

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
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'lewis-structures-progress',
    DEFAULT_PROGRESS
  );

  // Each screen replaces the one before it in place, so a level tapped from a
  // scrolled-down menu opened at that same offset: on a phone, deep inside the
  // level. Every screen switch starts at the top — at any width, as it did
  // before this moved to the shared helper — with its heading focused, since
  // the button that caused the switch has unmounted and focus would otherwise
  // fall to <body>. Back on the menu, a phone reveals the first level not yet
  // done, and focus moves to it at every width.
  const nextLevel = ([1, 2, 3] as const).find((n) => !progress[`level${n}Completed`]);
  useScreenTop(activeLevel, {
    anyWidth: true,
    target: () =>
      activeLevel === 'menu' && nextLevel !== undefined
        ? document.querySelector(`[data-level-card="${nextLevel}"]`)
        : null,
  });

  const applyLevelResult = (
    level: 1 | 2 | 3,
    correct: number,
    total: number,
    next: ActiveLevel
  ) => {
    const key = `level${level}` as const;
    updateProgress({
      [`${key}Completed`]: true,
      [`${key}Correct`]: Math.max(progress[`${key}Correct`] ?? 0, correct),
      [`${key}Total`]: total,
    } as Partial<Progress>);
    setActiveLevel(next);
  };

  const handleLevel1Complete = (correct: number, total: number) =>
    applyLevelResult(1, correct, total, 'menu');
  const handleLevel2Complete = (correct: number, total: number) =>
    applyLevelResult(2, correct, total, 'menu');
  const handleLevel3Complete = (correct: number, total: number) =>
    applyLevelResult(3, correct, total, 'complete');

  /** "6 af 8 rétt", or "Lokið" for a level finished before counts were kept. */
  const resultLabel = (level: 1 | 2 | 3): string => {
    const correct = progress[`level${level}Correct`];
    const total = progress[`level${level}Total`];
    return correct === undefined || total === undefined ? 'Lokið' : `${correct} af ${total} rétt`;
  };

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
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
                <div className="font-bold text-blue-800">Stig 1: Gildisrafeindir</div>
                <div className="text-sm text-blue-600">Telja og skilja</div>
              </div>
              <div className="font-bold text-blue-700 whitespace-nowrap">{resultLabel(1)}</div>
            </div>

            <div className="bg-green-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
              <div>
                <div className="font-bold text-green-800">Stig 2: Teikna Lewis</div>
                <div className="text-sm text-green-600">Byggja formúlur</div>
              </div>
              <div className="font-bold text-green-700 whitespace-nowrap">{resultLabel(2)}</div>
            </div>

            <div className="bg-purple-50 p-4 phone:p-3 rounded-xl flex justify-between items-center gap-3">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Formhleðsla</div>
                <div className="text-sm text-purple-600">Samsvörunarformúlur</div>
              </div>
              <div className="font-bold text-purple-700 whitespace-nowrap">{resultLabel(3)}</div>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-xl mb-6 phone:p-4 phone:mb-4">
            <h2 className="font-bold text-teal-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-teal-900 text-sm">
              <li>
                ✓ <strong>Gildisrafeindir:</strong> Rafeindir í ysta hvolfi ákvarða efnatengsl
              </li>
              <li>
                ✓ <strong>Áttureglan:</strong> Atóm vilja hafa 8 rafeindir (H vill 2)
              </li>
              <li>
                ✓ <strong>Lewis-formúlur:</strong> Sýna hvernig rafeindir dreifast í sameindum
              </li>
              <li>
                ✓ <strong>Formhleðsla:</strong> FC = Gildisraf. - (óbundnar + ½ bundnar)
              </li>
              <li>
                ✓ <strong>Samsvörun:</strong> Margar jafngildar formúlur fyrir sömu sameind
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 phone:py-3 rounded-xl transition-colors"
          >
            Til baka í valmynd
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

  // Year 2: Teal/Cyan theme
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header variant="game" backHref="/efnafraedi/2-ar/" gameTitle="Lewis-formúlur" />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
          <p className="text-center text-warm-600 mb-8 phone:mb-3">
            Lærðu að teikna rafeindasamsetningu sameinda
          </p>

          {/* Pedagogical explanation. Teaching that comes before the level choice stays first on a
              phone: it is read first on purpose, and costs one scroll (design §5). */}
          <div className="bg-teal-50 p-4 sm:p-6 rounded-xl mb-8 phone:mb-4">
            <h2 className="font-bold text-teal-800 mb-3">Hvað eru Lewis-formúlur?</h2>
            <p className="text-teal-900 text-sm mb-4">
              <strong>Lewis-formúlur</strong> (eða rafeindapunktaformúlur) sýna hvernig
              gildisrafeindir dreifast á milli atóma í sameind. Þær hjálpa okkur að skilja
              efnatengsl og lögun sameinda.
            </p>
            <div className="bg-white p-3 phone:p-2 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 font-mono text-center">
                Alls rafeindir = Σ gildisrafeindir - hleðsla
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
                <div className="text-3xl sm:text-4xl phone:text-2xl">🔢</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-lg min-[360px]:text-xl font-bold text-blue-800">
                      Stig 1: Gildisrafeindir
                    </span>
                    {progress.level1Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(1)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Telja gildisrafeindir og skilja átturegluna
                  </div>
                  <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                    Hvaða rafeindir taka þátt í efnatengslum? Lærðu að telja þær.
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
                <div className="text-3xl sm:text-4xl phone:text-2xl">✏️</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-lg min-[360px]:text-xl font-bold text-green-800">
                      Stig 2: Teikna Lewis-formúlur
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Byggja Lewis-formúlur skref fyrir skref
                  </div>
                  <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                    Settu miðatóm, teiknaðu tengsl og stök rafeindapör.
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
                <div className="text-3xl sm:text-4xl phone:text-2xl">⚖️</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-lg min-[360px]:text-xl font-bold text-purple-800">
                      Stig 3: Formhleðsla og samsvörun
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(3)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Reikna formhleðslu og finna samsvörunarformúlur
                  </div>
                  <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                    Hvernig finnur þú bestu Lewis-formúluna?
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Progress: which levels are done, and the way to start over. */}
          {levelsCompleted > 0 && (
            <div className="mt-8 bg-warm-50 p-3 sm:p-4 rounded-xl phone:mt-4 flex justify-between items-center">
              <div className="text-warm-700">
                <span className="font-semibold">Framvinda:</span> {levelsCompleted} af 3 stigum
                lokið
              </div>
              <button
                onClick={resetProgress}
                className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
              >
                Endurstilla
              </button>
            </div>
          )}

          {/* Valence electron reference */}
          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-2">🔢 Fjöldi gildisrafeinda</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-sm">
              <div className="bg-red-50 p-2 rounded text-center">
                <div className="font-bold text-red-700">1</div>
                <div className="text-xs text-red-600">H, Li, Na</div>
              </div>
              <div className="bg-orange-50 p-2 rounded text-center">
                <div className="font-bold text-orange-700">2</div>
                <div className="text-xs text-orange-600">Be, Mg</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded text-center">
                <div className="font-bold text-yellow-700">3</div>
                <div className="text-xs text-yellow-600">B, Al</div>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <div className="font-bold text-green-700">4</div>
                <div className="text-xs text-green-600">C, Si</div>
              </div>
              <div className="bg-teal-50 p-2 rounded text-center">
                <div className="font-bold text-teal-700">5</div>
                <div className="text-xs text-teal-600">N, P</div>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <div className="font-bold text-blue-700">6</div>
                <div className="text-xs text-blue-600">O, S</div>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <div className="font-bold text-purple-700">7</div>
                <div className="text-xs text-purple-600">F, Cl, Br</div>
              </div>
              <div className="bg-warm-100 p-2 rounded text-center">
                <div className="font-bold text-warm-700">8</div>
                <div className="text-xs text-warm-600">Ne, Ar</div>
              </div>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju Lewis-formúlur?</h3>
            <p className="text-sm text-amber-700">
              Lewis-formúlur sýna hvernig rafeindir tengjast milli atóma — lykillinn að lyfjahönnun,
              efnafræðilegri hvarfgirni og skilningi á hvernig efni hegða sér.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → <u>Lewis</u> → VSEPR → IMF → Hess →
            Kinetics → Redox → Organic
          </div>
          <div className="mt-2 text-center text-xs text-warm-400">
            Kafli 8 — Chemistry: The Central Science (Brown et al.)
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
