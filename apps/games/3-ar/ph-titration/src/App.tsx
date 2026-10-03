import { useCallback, useEffect, useRef, useState } from 'react';

import { Header, ErrorBoundary, FadePresence, Presence } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { focusTarget, revealSpan, revealTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';

/** Exit duration of each screen's FadePresence. */
const SCREEN_FADE_MS = 200;

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
    'ph-titration-progress',
    DEFAULT_PROGRESS
  );

  // Each screen replaces the last in place, so without this a student who
  // scrolled down the menu to a level card starts that level a screen or more
  // below its top (on a phone, past the whole intro). The page jumps to its top
  // at every width, as it always has.
  const pageTopRef = useRef<HTMLDivElement>(null);
  const firstScreen = useRef(true);
  const returningToMenu = useRef(false);
  useEffect(() => {
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    revealTop(pageTopRef.current, { anyWidth: true, always: true, gap: 0, instant: true });
    returningToMenu.current = activeLevel === 'menu';
  }, [activeLevel]);

  // Back on the menu, focus the next level not yet done (the button that was
  // pressed has unmounted), and on a phone bring that card on screen. Run as
  // the menu's root attaches: FadePresence mounts the entering screen a render
  // after `activeLevel` changes, so an effect here would find no card yet. The
  // level that was left still fades out above the menu for SCREEN_FADE_MS, so
  // the card is measured once it has gone. The levels focus their own heading
  // as they mount.
  const nextLevelRef = useRef<string>('level1');
  nextLevelRef.current = !progress.level1Completed
    ? 'level1'
    : !progress.level2Completed
      ? 'level2'
      : !progress.level3Completed
        ? 'level3'
        : 'level1';
  const menuRoot = useCallback((el: HTMLDivElement | null) => {
    // The first load is not a return: focus stays where the browser put it.
    if (!el || !returningToMenu.current) return;
    returningToMenu.current = false;
    const card = el.querySelector<HTMLElement>(`[data-level-card="${nextLevelRef.current}"]`);
    revealSpan(card, [], { afterExit: SCREEN_FADE_MS + 20 });
    focusTarget(card);
  }, []);

  // The completion screen focuses its heading as it mounts.
  const completeRoot = useCallback((el: HTMLHeadingElement | null) => {
    if (el) focusTarget(el);
  }, []);

  const applyLevelResult = (
    level: 1 | 2 | 3,
    correct: number,
    total: number,
    nextScreen: ActiveLevel
  ) => {
    const key = `level${level}` as const;
    updateProgress({
      [`${key}Completed`]: true,
      [`${key}Correct`]: Math.max(progress[`${key}Correct`] ?? 0, correct),
      [`${key}Total`]: total,
    } as Partial<Progress>);
    setActiveLevel(nextScreen);
  };

  const handleLevel1Complete = (correct: number, total: number) =>
    applyLevelResult(1, correct, total, 'menu');
  const handleLevel2Complete = (correct: number, total: number) =>
    applyLevelResult(2, correct, total, 'menu');
  const handleLevel3Complete = (correct: number, total: number) =>
    applyLevelResult(3, correct, total, 'complete');

  /**
   * "6 af 8 rétt", or "Lokið" for a level finished before counts were kept.
   * Levels are not gated, so the end screen can list one never played.
   */
  const resultLabel = (level: 1 | 2 | 3): string => {
    if (!progress[`level${level}Completed`]) return 'Ekki lokið';
    const correct = progress[`level${level}Correct`];
    const total = progress[`level${level}Total`];
    return correct === undefined || total === undefined ? 'Lokið' : `${correct} af ${total} rétt`;
  };

  const levelsCompleted = [
    progress.level1Completed,
    progress.level2Completed,
    progress.level3Completed,
  ].filter(Boolean).length;

  return (
    <div ref={pageTopRef}>
      <FadePresence show={activeLevel === 'level1'} exitDuration={SCREEN_FADE_MS}>
        <Level1 onComplete={handleLevel1Complete} onBack={() => setActiveLevel('menu')} />
      </FadePresence>

      <FadePresence show={activeLevel === 'level2'} exitDuration={SCREEN_FADE_MS}>
        <Level2 onComplete={handleLevel2Complete} onBack={() => setActiveLevel('menu')} />
      </FadePresence>

      <FadePresence show={activeLevel === 'level3'} exitDuration={SCREEN_FADE_MS}>
        <Level3 onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} />
      </FadePresence>

      <FadePresence show={activeLevel === 'complete'} exitDuration={SCREEN_FADE_MS}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
          <Presence show={activeLevel === 'complete'} exitDuration={300}>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h1
                ref={completeRoot}
                className="text-3xl md:text-4xl font-bold text-center mb-6 text-purple-600"
              >
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
                  <div>
                    <div className="font-bold text-blue-800">Stig 1: Skilningur</div>
                    <div className="text-sm text-blue-600">Títrunarferlar og vísar</div>
                  </div>
                  <div className="font-bold text-blue-700 whitespace-nowrap">{resultLabel(1)}</div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center gap-3">
                  <div>
                    <div className="font-bold text-green-800">Stig 2: Framkvæmd</div>
                    <div className="text-sm text-green-600">Gagnvirk títrun</div>
                  </div>
                  <div className="font-bold text-green-700 whitespace-nowrap">{resultLabel(2)}</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center gap-3">
                  <div>
                    <div className="font-bold text-purple-800">Stig 3: Útreikningar</div>
                    <div className="text-sm text-purple-600">Styrk- og pH-reikningar</div>
                  </div>
                  <div className="font-bold text-purple-700 whitespace-nowrap">
                    {resultLabel(3)}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl mb-6">
                <h2 className="font-bold text-purple-800 mb-3">Hvað lærðir þú?</h2>
                <ul className="space-y-2 text-purple-900 text-sm">
                  <li>
                    ✓ <strong>Títrunarferlar:</strong> Munur á sterkum og veikum sýru-basa ferlum
                  </li>
                  <li>
                    ✓ <strong>Jafngildispunktur:</strong> Hvar öll sýra/basi hefur hvarfast
                  </li>
                  <li>
                    ✓ <strong>Vísar:</strong> Hvernig velja réttan vísi fyrir hverja títrun
                  </li>
                  <li>
                    ✓ <strong>Henderson-Hasselbalch:</strong> pH = pKₐ + log([A⁻]/[HA])
                  </li>
                  <li>
                    ✓ <strong>Fjölvirkar sýrur:</strong> Margir jafngildispunktar fyrir H₂SO₃, H₃PO₄
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveLevel('menu')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                Til baka í valmynd
              </button>
            </div>
          </Presence>
        </div>
      </FadePresence>

      <FadePresence show={activeLevel === 'menu'} exitDuration={SCREEN_FADE_MS}>
        <div ref={menuRoot} className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="pH Títrun" />
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
              <p className="text-warm-600 mb-4 phone:mb-3">
                Lærðu um sýru-basa títranir, títrunarferla og vísa
              </p>

              {/* Pedagogical explanation */}
              <div className="bg-purple-50 p-4 sm:p-6 rounded-xl mb-8 phone:mb-4">
                <h2 className="font-bold text-purple-800 mb-3">Hvað er títrun?</h2>
                <p className="text-purple-900 text-sm mb-4">
                  <strong>Títrun</strong> er aðferð til að ákvarða styrk óþekkts efnis með því að
                  bæta við þekktu efni (títrantur) þar til efnahvarfinu er lokið. Við mælum pH allan
                  tímann og finnum <em>jafngildispunktinn</em> þar sem öll sýra/basi hefur hvarfast.
                </p>
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <p className="text-base md:text-sm text-purple-800 font-mono text-center">
                    {/* Each side kept whole, so a narrow phone breaks at the = */}
                    <span className="whitespace-nowrap">
                      V<sub>sýra</sub> × M<sub>sýra</sub>
                    </span>{' '}
                    <span className="whitespace-nowrap">
                      = V<sub>basa</sub> × M<sub>basa</sub>
                    </span>
                  </p>
                </div>
              </div>

              {/* Level selection */}
              <div className="space-y-4 phone:space-y-3">
                {/* Level 1 */}
                <button
                  data-level-card="level1"
                  onClick={() => setActiveLevel('level1')}
                  className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl phone:text-2xl">📈</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-xl font-bold text-blue-800 phone:text-lg">
                          Stig 1: Skilningur
                        </span>
                        {progress.level1Completed && (
                          <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            ✓ {resultLabel(1)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">Títrunarferlar og vísar</div>
                      <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                        Skildu hvernig títrunarferlar líta út fyrir mismunandi sýru-basa
                        samsetningar. Lærðu um vísa og litabreytingar.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 2 */}
                <button
                  data-level-card="level2"
                  onClick={() => setActiveLevel('level2')}
                  className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl phone:text-2xl">🧪</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-xl font-bold text-green-800 phone:text-lg">
                          Stig 2: Framkvæmd
                        </span>
                        {progress.level2Completed && (
                          <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            ✓ {resultLabel(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Gagnvirk títrun í rannsóknarstofu
                      </div>
                      <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                        Framkvæmdu títrun, veldu réttan vísi og finndu jafngildispunkt. Byggðu upp
                        færni í rannsóknarstofuvinnu.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 3 */}
                <button
                  data-level-card="level3"
                  onClick={() => setActiveLevel('level3')}
                  className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl phone:text-2xl">📐</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-xl font-bold text-purple-800 phone:text-lg">
                          Stig 3: Útreikningar
                        </span>
                        {progress.level3Completed && (
                          <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            ✓ {resultLabel(3)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-purple-600 mt-1">
                        Styrkreikningar og fjölvirkar sýrur
                      </div>
                      <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                        Reiknaðu styrk, pH og rúmmál. Leystu verkefni um fjölvirkar sýrur og notaðu
                        Henderson-Hasselbalch jöfnuna.
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
                    className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
                  >
                    Endurstilla
                  </button>
                </div>
              )}

              {/* Formula reference */}
              <div className="mt-6 bg-warm-50 p-4 rounded-xl">
                <h3 className="font-semibold text-warm-700 mb-2">📐 Lykilformúlur</h3>
                <div className="font-mono text-base md:text-sm space-y-2 text-warm-600">
                  <p>
                    <strong>Títrunarjafna:</strong>{' '}
                    <span className="whitespace-nowrap">
                      V<sub>sýra</sub> × M<sub>sýra</sub>
                    </span>{' '}
                    <span className="whitespace-nowrap">
                      = V<sub>basa</sub> × M<sub>basa</sub>
                    </span>
                  </p>
                  <p>
                    <strong>Henderson-Hasselbalch:</strong> pH = pK<sub>a</sub> + log([A⁻]/[HA])
                  </p>
                  <p>
                    <strong>Stuðpúðasvæði:</strong>{' '}
                    <span className="whitespace-nowrap">
                      pH = pK<sub>a</sub> ± 1
                    </span>
                  </p>
                  <p>
                    <strong>Fjölvirkar sýrur:</strong> Margir jafngildispunktar fyrir H₂SO₃, H₃PO₄
                  </p>
                </div>
              </div>

              {/* Why this matters + curriculum */}
              <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">Af hverju títrun?</h3>
                <p className="text-sm text-amber-700">
                  Títrun er ein mikilvægasta greiningaraðferð efnafræðinnar. Hún er notuð til að
                  ákvarða styrk sýru í regni, magasýru í meltingarfærum, og vítamín C í ávöxtum.
                </p>
              </div>
              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis →
                Sýrufastinn → Varmafræði → <u>pH Títrun</u> → Stuðpúðar → Leysnijafnvægi
              </div>
              <div className="mt-2 text-center text-xs text-warm-400">
                Kafli 17 — Chemistry: The Central Science (Brown et al.)
              </div>
            </div>
          </div>
        </div>
      </FadePresence>
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
