import { useState } from 'react';

import { Header, ErrorBoundary } from '@shared/components';
import { useGameProgress } from '@shared/hooks';

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
    'kinetics-progress',
    DEFAULT_PROGRESS
  );

  /**
   * Levels are not gated (ruling 2026-08-29), so they can be finished in any order. The
   * completion screen — "Þú hefur lokið öllum stigum!" — follows a finished level only once all
   * three are done, whichever of them completes the set; before that it is back to the menu. It
   * used to follow Stig 3 unconditionally, so a student who started there was congratulated on
   * finishing all three with Stig 1 and Stig 2 at zero.
   */
  const finishLevel = (updates: Partial<Progress>) => {
    const next = { ...progress, ...updates, totalGamesPlayed: progress.totalGamesPlayed + 1 };
    updateProgress(next);
    const allDone = next.level1Completed && next.level2Completed && next.level3Completed;
    setActiveLevel(allDone ? 'complete' : 'menu');
  };

  const handleLevel1Complete = (score: number) =>
    finishLevel({ level1Completed: true, level1Score: Math.max(progress.level1Score, score) });

  const handleLevel2Complete = (score: number) =>
    finishLevel({ level2Completed: true, level2Score: Math.max(progress.level2Score, score) });

  const handleLevel3Complete = (score: number) =>
    finishLevel({ level3Completed: true, level3Score: Math.max(progress.level3Score, score) });

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
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-teal-600">
            Til hamingju!
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-2xl font-bold text-warm-800 mb-2">
              Þú hefur lokið öllum stigum!
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center gap-3">
              <div className="min-w-0">
                <div className="font-bold text-blue-800">Stig 1: Hraðahugtök</div>
                <div className="text-sm text-blue-600">Hvað hefur áhrif á hraða?</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center gap-3">
              <div className="min-w-0">
                <div className="font-bold text-green-800">Stig 2: Hraðalögmál</div>
                <div className="text-sm text-green-600">Byggja hraðajöfnur</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center gap-3">
              <div className="min-w-0">
                <div className="font-bold text-purple-800">Stig 3: Hvarfgangur</div>
                <div className="text-sm text-purple-600">Grunnskref og milliefni</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.level3Score}</div>
            </div>

            <div className="bg-orange-100 p-4 rounded-xl flex justify-between items-center border-2 border-orange-400">
              <div className="font-bold text-orange-800 text-lg">Heildarstig</div>
              <div className="text-3xl font-bold text-orange-600">{totalScore}</div>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-xl mb-6">
            <h2 className="font-bold text-teal-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-teal-900 text-sm">
              <li>
                ✓ <strong>Hraði:</strong> hraði = Δ[efni]/Δt — hversu hratt efnahvörf gerast
              </li>
              <li>
                ✓ <strong>Hraðalögmál:</strong> hraði = k[A]<sup>m</sup>[B]<sup>n</sup> — tengsl við
                styrk
              </li>
              <li>
                ✓ <strong>Röð hvörfunar:</strong> Veldisvísir segir hversu mikið styrkur hefur áhrif
              </li>
              <li>
                ✓ <strong>Hvarfgangur:</strong> Röð grunnskrefa sem mynda heildarhvarfið
              </li>
              <li>
                ✓ <strong>Hraðaákvarðandi skref:</strong> Hægasta skrefið ræður heildarhraða
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

  // Year 2: Teal/Cyan theme
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header variant="game" backHref="/efnafraedi/2-ar/" gameTitle="Hvarfhraði" />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <p className="text-center text-warm-600 mb-8">
            Lærðu um hraða efnahvarfa, hraðalögmál og hvarfgang
          </p>

          {/* Pedagogical explanation */}
          <div className="bg-teal-50 p-6 rounded-xl mb-8">
            <h2 className="font-bold text-teal-800 mb-3">Hvað er hvarfhraði?</h2>
            <p className="text-teal-900 text-sm mb-4">
              <strong>Hvarfhraði (reaction rate)</strong> lýsir því hversu hratt hvarfefni breytast
              í myndefni. Hraðinn ákvarðast af mörgum þáttum: styrk hvarfefna, hitastigi, hvata og
              yfirborðsflatarmáli.
            </p>
            <div className="bg-white p-3 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 font-mono text-center">
                hraði = k[A]<sup>m</sup>[B]<sup>n</sup>
              </p>
              <p className="text-xs text-warm-600 text-center mt-1">
                þar sem k = hraðafasti, m og n = veldisvísar (röð hvörfunar)
              </p>
            </div>
          </div>

          {/* Level selection */}
          <div className="space-y-4">
            {/* Level 1 */}
            <button
              onClick={() => setActiveLevel('level1')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">🔬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-base min-[360px]:text-lg sm:text-xl font-bold text-blue-800">
                      Stig 1: Hraðahugtök
                    </span>
                    {progress.level1Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {progress.level1Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Hvað hefur áhrif á hvarfhraða?</div>
                  <div className="text-xs text-warm-600 mt-2">
                    Styrkur, hitastig, hvatar, yfirborð — sjáðu hvernig þessir þættir breyta
                    hraðanum.
                  </div>
                </div>
              </div>
            </button>

            {/* Level 2 */}
            <button
              onClick={() => setActiveLevel('level2')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">📊</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-base min-[360px]:text-lg sm:text-xl font-bold text-green-800">
                      Stig 2: Hraðalögmál
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {progress.level2Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Byggja og túlka hraðalögmál</div>
                  <div className="text-xs text-warm-600 mt-2">
                    Notaðu gögn til að finna röð hvörfunar og hraðafastann.
                  </div>
                </div>
              </div>
            </button>

            {/* Level 3 */}
            <button
              onClick={() => setActiveLevel('level3')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">⚙️</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-base min-[360px]:text-lg sm:text-xl font-bold text-purple-800">
                      Stig 3: Hvarfgangur
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {progress.level3Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Grunnskref og hraðaákvarðandi skref
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Greindu hvarfganga og finndu milliefni.
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Progress Summary */}
          {progress.totalGamesPlayed > 0 && (
            <div className="mt-8 bg-warm-50 p-3 sm:p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-warm-700">Framvinda</h3>
                <button
                  onClick={resetProgress}
                  className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
                >
                  Endurstilla
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {levelsCompleted}/3
                  </div>
                  <div className="text-xs text-warm-600">Stig lokið</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{totalScore}</div>
                  <div className="text-xs text-warm-600">Heildarstig</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {progress.totalGamesPlayed}
                  </div>
                  <div className="text-xs text-warm-600">Leikir spilaðir</div>
                </div>
              </div>
            </div>
          )}

          {/* Formula reference */}
          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-2">📐 Lykilformúlur</h3>
            <div className="font-mono text-sm space-y-2 text-warm-600">
              <p>
                <strong>Meðalhraði:</strong> hraði = −Δ[hvarfefni]/Δt = +Δ[myndefni]/Δt
              </p>
              <p>
                <strong>Hraðalögmál:</strong> hraði = k[A]<sup>m</sup>[B]<sup>n</sup>
              </p>
              <p>
                <strong>Röð hvörfunar:</strong> m + n = heildarröð
              </p>
              <p>
                <strong>Arrhenius:</strong> k = Ae
                <sup>
                  -E<sub>a</sub>/RT
                </sup>
              </p>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju hvarfhraði?</h3>
            <p className="text-sm text-amber-700">
              Hvarfhraði ræður hversu hratt lyf virka, hversu lengi matvæli halda, og hversu hratt
              járn ryðgar. Skilningur á hraða gefur okkur völd til að stýra efnahvörfum.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → Lewis → VSEPR → IMF → Hess →{' '}
            <u>Kinetics</u> → Redox → Organic
          </div>
          <div className="mt-2 text-center text-xs text-warm-400">
            Kafli 14 — Chemistry: The Central Science (Brown et al.)
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
