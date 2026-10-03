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
  const {
    progress,
    updateProgress,
    resetProgress: resetStoredProgress,
  } = useGameProgress<Progress>('organic-nomenclature-progress', DEFAULT_PROGRESS);

  // Each screen swap starts the new screen at its top with its heading focused
  // (on a phone the page would otherwise stay at the old offset, and focus
  // would fall to <body> with the button that caused the swap). Back on the
  // menu, the next unfinished level card is revealed and focused instead.
  const nextLevel = !progress.level1Completed
    ? 'level1'
    : !progress.level2Completed
      ? 'level2'
      : !progress.level3Completed
        ? 'level3'
        : null;
  useScreenTop(activeLevel, {
    target: () =>
      activeLevel === 'menu' && nextLevel
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
    // The best run is kept as a pair. Stig 2's two modes have different lengths, so the
    // larger count alone could be read against the other mode's total ("10 af 8 rétt").
    const best = progress[`${key}Correct`];
    const bestTotal = progress[`${key}Total`];
    const better =
      best === undefined || bestTotal === undefined || correct * bestTotal >= best * total;
    updateProgress({
      [`${key}Completed`]: true,
      ...(better ? { [`${key}Correct`]: correct, [`${key}Total`]: total } : {}),
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

  const resetProgress = () => {
    if (!window.confirm('Ertu viss um að þú viljir endurstilla alla framvindu?')) return;
    resetStoredProgress();
  };

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-emerald-600 phone:mb-3">
            Til hamingju!
          </h1>
          <div className="text-center mb-8 phone:mb-4">
            <div className="text-6xl mb-4 phone:text-4xl phone:mb-2">🎓</div>
            <div className="text-2xl font-bold text-warm-800">Þú hefur lokið öllum stigum!</div>
          </div>

          <div className="space-y-4 mb-8 phone:space-y-2 phone:mb-4">
            <div className="bg-warm-50 p-4 rounded-xl flex justify-between items-center gap-3 phone:px-3 phone:py-2">
              <div>
                <div className="font-bold text-warm-800">Stig 1: Grunnreglur</div>
                <div className="text-sm text-warm-600">Forskeyti og viðskeyti</div>
              </div>
              <div className="font-bold text-warm-700 whitespace-nowrap">{resultLabel(1)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center gap-3 phone:px-3 phone:py-2">
              <div>
                <div className="font-bold text-green-800">Stig 2: Nefna sameindir</div>
                <div className="text-sm text-green-600">Alkanar, alkenar, alkýnar</div>
              </div>
              <div className="font-bold text-green-700 whitespace-nowrap">{resultLabel(2)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center gap-3 phone:px-3 phone:py-2">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Hagnýtar sameindir</div>
                <div className="text-sm text-purple-600">Virknihópar og formúlur</div>
              </div>
              <div className="font-bold text-purple-700 whitespace-nowrap">{resultLabel(3)}</div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-xl mb-6 phone:p-4 phone:mb-4">
            <h2 className="font-bold text-emerald-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-emerald-900 text-sm">
              <li>
                ✓ <strong>Forskeyti:</strong> meth-, eth-, prop-, but-, pent-...
              </li>
              <li>
                ✓ <strong>Viðskeyti:</strong> -an (eintengi), -en (tvítengi), -ýn (þrítengi)
              </li>
              <li>
                ✓ <strong>Staðsetningartölur:</strong> Númer til að tilgreina staðsetningu
              </li>
              <li>
                ✓ <strong>Virknihópar:</strong> -OH (alkóhól), -CHO (aldehýð), -COOH (karboxýlsýra)
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header variant="game" backHref="/efnafraedi/2-ar/" gameTitle="Lífræn nafnagift" />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <p className="text-center text-warm-600 mb-8 phone:mb-4">
            Lærðu IUPAC nafnakerfið fyrir lífrænar sameindir
          </p>

          <div className="bg-emerald-50 p-4 sm:p-6 rounded-xl mb-8 phone:mb-4">
            <h2 className="font-bold text-emerald-800 mb-3">Hvað er IUPAC nafnakerfið?</h2>
            <p className="text-emerald-900 text-sm mb-4">
              <strong>IUPAC</strong> (International Union of Pure and Applied Chemistry) setti
              reglur til að nefna sameindir á samræmdan hátt. Nafn lífræns efnis segir okkur um
              byggingu þess.
            </p>
            {/* The two parts Stig 1 teaches. A third card used to call the bond type the
                stem and the suffix a functional group, against Stig 1 (decisions item 90). */}
            <div data-name-parts className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="font-bold text-blue-600">Forskeyti</div>
                <div className="text-warm-600">Fjöldi kolefna</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="font-bold text-green-600">Viðskeyti</div>
                <div className="text-warm-600">Tegund tengja</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 phone:space-y-3">
            <button
              data-level-card="level1"
              onClick={() => setActiveLevel('level1')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-warm-400 bg-warm-50 hover:bg-warm-100 transition-all text-left phone:p-3"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-3xl">📚</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-warm-800 phone:text-lg">
                      Stig 1: Grunnreglur
                    </span>
                    {progress.level1Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(1)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-warm-600 mt-1">Lærðu forskeyti og viðskeyti</div>
                </div>
              </div>
            </button>

            <button
              data-level-card="level2"
              onClick={() => setActiveLevel('level2')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer phone:p-3"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-3xl">🏷️</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-green-800 phone:text-lg">
                      Stig 2: Nefna sameindir
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Nefndu alkana, alkena og alkýna</div>
                </div>
              </div>
            </button>

            <button
              data-level-card="level3"
              onClick={() => setActiveLevel('level3')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer phone:p-3"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-3xl">🔬</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-purple-800 phone:text-lg">
                      Stig 3: Hagnýtar sameindir
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(3)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Virknihópar og flóknari sameindir
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Progress: which levels are done, and the way to start over. */}
          {levelsCompleted > 0 && (
            <div className="mt-8 bg-warm-50 p-4 rounded-xl flex justify-between items-center gap-3">
              <div className="text-warm-700">
                <span className="font-semibold">Framvinda:</span> {levelsCompleted} af 3 stigum
                lokið
              </div>
              <button
                onClick={resetProgress}
                className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3 pointer-coarse:px-2 pointer-coarse:-mx-2"
              >
                Endurstilla
              </button>
            </div>
          )}

          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-2">📋 Forskeyti (kolefnisfjöldi)</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm text-center">
              <div className="bg-white px-1 py-2 sm:p-2 rounded border whitespace-nowrap">
                <span className="font-bold">1</span> meth-
              </div>
              <div className="bg-white px-1 py-2 sm:p-2 rounded border whitespace-nowrap">
                <span className="font-bold">2</span> eth-
              </div>
              <div className="bg-white px-1 py-2 sm:p-2 rounded border whitespace-nowrap">
                <span className="font-bold">3</span> prop-
              </div>
              <div className="bg-white px-1 py-2 sm:p-2 rounded border whitespace-nowrap">
                <span className="font-bold">4</span> but-
              </div>
              <div className="bg-white px-1 py-2 sm:p-2 rounded border whitespace-nowrap">
                <span className="font-bold">5</span> pent-
              </div>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju lífræn nafnagift?</h3>
            <p className="text-sm text-amber-700">
              Lyfjaefnafræðingar, líftæknifræðingar og matvælafræðingar nota IUPAC nöfn daglega.
              Rétt nafn segir uppbyggingu sameindarinnar — forsenda samskipta í vísindum.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → Lewis-formúlur → VSEPR →
            Millisameindakraftar → Lögmál Hess → Hvarfhraði → Oxun og afoxun →{' '}
            <u>Lífræn nafnagift</u>
          </div>
          <div className="mt-2 text-center text-xs text-warm-400">
            Sérsniðið námsefni — Lífræn efnafræði
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
