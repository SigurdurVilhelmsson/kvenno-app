import { useState } from 'react';

import { Header, ErrorBoundary } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';

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
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'imf-progress',
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

  const applyLevelResult = (level: 1 | 2 | 3, score: number) => {
    const key = `level${level}` as const;
    updateProgress({
      [`${key}Completed`]: true,
      [`${key}Score`]: Math.max(progress[`${key}Score`], score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    } as Partial<Progress>);
    // The closing screen says every level is done, so it opens only when that is true, after
    // whichever level completes the set. Levels are not gated, and finishing Stig 3 first used
    // to open it anyway, over two levels the student had never started.
    const allDone = ([1, 2, 3] as const).every(
      (n) => n === level || progress[`level${n}Completed`]
    );
    setActiveLevel(allDone ? 'complete' : 'menu');
  };

  const handleLevel1Complete = (score: number) => applyLevelResult(1, score);
  const handleLevel2Complete = (score: number) => applyLevelResult(2, score);
  const handleLevel3Complete = (score: number) => applyLevelResult(3, score);

  if (activeLevel === 'level1') {
    return <Level1 onComplete={handleLevel1Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'level2') {
    return <Level2 onComplete={handleLevel2Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'level3') {
    return <Level3 onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'complete') {
    const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 phone:p-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 phone:mb-3 text-indigo-600">
            Til hamingju!
          </h1>

          <div className="text-center mb-8 phone:mb-4">
            <div className="text-6xl mb-4 phone:text-4xl phone:mb-2">🏆</div>
            <div className="text-2xl font-bold text-warm-800 mb-2">
              Þú hefur lokið öllum stigum!
            </div>
          </div>

          <div className="space-y-4 mb-8 phone:space-y-2 phone:mb-4">
            <div className="bg-purple-50 p-4 phone:p-3 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-800">Stig 1: Tegundir</div>
                <div className="text-sm text-purple-600">Greina millisameindakrafta</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.level1Score}</div>
            </div>

            <div className="bg-blue-50 p-4 phone:p-3 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-800">Stig 2: Röðun</div>
                <div className="text-sm text-blue-600">Raða efnum eftir eiginleikum</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level2Score}</div>
            </div>

            <div className="bg-green-50 p-4 phone:p-3 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800">Stig 3: Greining</div>
                <div className="text-sm text-green-600">Flókinn samanburður</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level3Score}</div>
            </div>

            <div className="bg-indigo-100 p-4 phone:p-3 rounded-xl flex justify-between items-center border-2 border-indigo-400">
              <div className="font-bold text-indigo-800 text-lg">Heildarstig</div>
              <div className="text-3xl font-bold text-indigo-600">{totalScore}</div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-xl mb-6 phone:p-4 phone:mb-4">
            <h2 className="font-bold text-indigo-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-indigo-900 text-sm">
              <li>
                ✓ <strong>London kraftar:</strong> Til staðar í öllum sameindum, eykst með stærð
              </li>
              <li>
                ✓ <strong>Tvískauts-tvískauts:</strong> Milli skautaðra sameinda
              </li>
              <li>
                ✓ <strong>Vetnistengi:</strong> H við F, O, eða N — sterkasta tegund
              </li>
              <li>
                ✓ <strong>Áhrif:</strong> Sterkari IMF → hærra suðumark, seigja, yfirborðsspenna
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
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
      <Header variant="game" backHref="/efnafraedi/2-ar/" gameTitle="Millisameindakraftar" />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
          <p className="text-center text-warm-600 mb-8 phone:mb-3">
            Lærðu að greina krafta milli sameinda og áhrif þeirra á eðliseiginleika
          </p>

          {/* Pedagogical explanation */}
          {/* Teaching that comes before the level choice stays first on a phone: it is read
              first on purpose, and costs one scroll (design §5). */}
          <div className="bg-indigo-50 p-4 sm:p-6 rounded-xl mb-8 phone:p-3 phone:mb-4">
            <h2 className="font-bold text-indigo-800 mb-3">Hvað eru millisameindakraftar (IMF)?</h2>
            <p className="text-indigo-900 text-sm mb-4">
              <strong>Millisameindakraftar</strong> eru aðdráttarkraftar milli sameinda sem ákvarða
              eðliseiginleika eins og suðumark, bræðslumark og seigju. Þeir eru veikari en efnatengi
              en afar mikilvægir fyrir hegðun efna.
            </p>
            {/* Phones: one row per force (name left, strength right); a three-column grid
                split 'Vetnistengi' and 'Sterkastur' mid-word. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-purple-100 p-2 rounded-lg flex items-center justify-between gap-2 sm:block">
                <div className="font-bold text-purple-800">London</div>
                <div className="text-purple-600">Veikastur</div>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg flex items-center justify-between gap-2 sm:block">
                <div className="font-bold text-blue-800">Tvískauts-tvískauts</div>
                <div className="text-blue-600">Meðal</div>
              </div>
              <div className="bg-red-100 p-2 rounded-lg flex items-center justify-between gap-2 sm:block">
                <div className="font-bold text-red-800">Vetnistengi</div>
                <div className="text-red-600">Sterkastur</div>
              </div>
            </div>
          </div>

          {/* Level selection */}
          <div className="space-y-4 phone:space-y-3">
            <button
              data-level-card="1"
              onClick={() => setActiveLevel('level1')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl phone:text-2xl shrink-0">🔬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-lg sm:text-xl font-bold text-purple-800">
                      Stig 1: Greina IMF tegundir
                    </span>
                    {progress.level1Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level1Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Lærðu að greina hvaða kraftar eru til staðar í sameind
                  </div>
                </div>
              </div>
            </button>

            <button
              data-level-card="2"
              onClick={() => setActiveLevel('level2')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl phone:text-2xl shrink-0">📊</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-lg sm:text-xl font-bold text-blue-800">
                      Stig 2: Raða eftir eiginleikum
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level2Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Raðaðu efnum eftir suðumarki, seigju o.fl.
                  </div>
                </div>
              </div>
            </button>

            <button
              data-level-card="3"
              onClick={() => setActiveLevel('level3')}
              className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl phone:text-2xl shrink-0">🧠</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-lg sm:text-xl font-bold text-green-800">
                      Stig 3: Flókin greining
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level3Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Berðu saman efni og útskýrðu áhrif á eiginleika
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Progress Summary */}
          {progress.totalGamesPlayed > 0 && (
            <div className="mt-8 bg-warm-50 p-4 rounded-xl phone:mt-4 phone:p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-warm-700">Framvinda</h3>
                <button
                  onClick={resetProgress}
                  className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
                >
                  Endurstilla
                </button>
              </div>
              {/* Narrower gaps on a phone, so 'Heildarstig' fits its third at 320 px. */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 phone:gap-1 text-center">
                <div className="bg-purple-50 rounded-lg px-1 py-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {levelsCompleted}/3
                  </div>
                  <div className="text-xs text-warm-600">Stig lokið</div>
                </div>
                <div className="bg-green-50 rounded-lg px-1 py-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{totalScore}</div>
                  <div className="text-xs text-warm-600">Heildarstig</div>
                </div>
                <div className="bg-blue-50 rounded-lg px-1 py-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {progress.totalGamesPlayed}
                  </div>
                  <div className="text-xs text-warm-600">Leikir spilaðir</div>
                </div>
              </div>
            </div>
          )}

          {/* IMF Reference */}
          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-3">📋 Tegundir millisameindakrafta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3 p-2 bg-purple-50 rounded">
                <span className="font-bold text-purple-700 w-44 shrink-0">London</span>
                <span className="text-purple-600">
                  Öll efni — eykst með mólmassa og yfirborðsflatarmáli
                </span>
              </div>
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3 p-2 bg-blue-50 rounded">
                <span className="font-bold text-blue-700 w-44 shrink-0">Tvískauts-tvískauts</span>
                <span className="text-blue-600">Skautaðar sameindir — δ+ laðar að δ-</span>
              </div>
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3 p-2 bg-red-50 rounded">
                <span className="font-bold text-red-700 w-44 shrink-0">Vetnistengi</span>
                <span className="text-red-600">H bundið við F, O, eða N — sterkasta IMF</span>
              </div>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju millisameindakraftar?</h3>
            <p className="text-sm text-amber-700">
              IMF útskýra af hverju vatn er fljótandi en metan er gas, af hverju gekkóar klifra á
              veggi, og af hverju ís flýtur. Suðumark, seigja og leysni — allt ræðst af kraftunum.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → Lewis → VSEPR → <u>IMF</u> → Hess →
            Kinetics → Redox → Organic
          </div>
          <div className="mt-2 text-center text-xs text-warm-400">
            Kafli 11 — Chemistry: The Central Science (Brown et al.)
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
