import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Header, ErrorBoundary, FadePresence } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { focusTarget, revealSpan, revealTop } from '@shared/utils';

import Level1 from './components/Level1';
import Level2 from './components/Level2';
import Level3 from './components/Level3';
import './styles.css';

type ActiveLevel = 'menu' | 'level1' | 'level2' | 'level3';

/**
 * What the game remembers: which levels are done. There is no score — points were dropped
 * from every level (mobile-pass decision 1 (b)), and a hint costs nothing (decision 2 (b)).
 *
 * No level keeps a count of right answers either. None can be left unsolved — Næsta waits
 * for a right answer, and Stig 1's pH bar names the verdict before the check — so every run
 * would read "N af N rétt". Each level reports that it is done instead, as Einingakeðjan's
 * Stig 1 does (decision 23). Progress saved before this carries `levelNScore` and
 * `totalGamesPlayed`; they are ignored, and a finished level shows "Lokið" either way.
 */
interface Progress {
  level1Completed: boolean;
  level2Completed: boolean;
  level3Completed: boolean;
}

/** How long a screen takes to fade out (each FadePresence's exitDuration below). */
const SCREEN_FADE_MS = 200;

const DEFAULT_PROGRESS: Progress = {
  level1Completed: false,
  level2Completed: false,
  level3Completed: false,
};

/**
 * Buffer Builder - Conceptual Chemistry Game
 *
 * Level 1: Visual molecule manipulation (NO calculations)
 * Level 2: Henderson-Hasselbalch calculations (3-step process)
 * Level 3: Design constraints (coming soon)
 */
function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'buffer-recipe-creator-progress',
    DEFAULT_PROGRESS
  );

  // A level card is tapped from wherever the menu was scrolled to. Without this the level
  // opens at that same offset, which on a phone lands deep inside it (Stig 1 opened on its
  // footer), so start every screen switch at the top, at every width, as the game always
  // has. The first render is skipped. Each level focuses its own heading as it mounts (the
  // screens fade, so a level mounts a render after this runs).
  const pageTopRef = useRef<HTMLDivElement>(null);
  const previousLevel = useRef(activeLevel);
  const returningToMenu = useRef(false);
  useLayoutEffect(() => {
    if (previousLevel.current === activeLevel) return;
    previousLevel.current = activeLevel;
    returningToMenu.current = activeLevel === 'menu';
    revealTop(pageTopRef.current, { anyWidth: true, always: true, gap: 0, instant: true });
  }, [activeLevel]);

  // Back on the menu, the next level not yet done is focused and, on a phone, revealed once
  // the level has faded out; with every level done, the menu's heading is focused.
  const nextLevel = !progress.level1Completed
    ? 'level1'
    : !progress.level2Completed
      ? 'level2'
      : !progress.level3Completed
        ? 'level3'
        : null;
  const nextLevelRef = useRef(nextLevel);
  nextLevelRef.current = nextLevel;
  const menuRoot = useCallback((el: HTMLDivElement | null) => {
    if (!el || !returningToMenu.current) return;
    returningToMenu.current = false;
    const card = nextLevelRef.current
      ? el.querySelector<HTMLElement>(`[data-level-card="${nextLevelRef.current}"]`)
      : null;
    focusTarget(card ?? el.querySelector<HTMLElement>('h2'));
    if (card) window.setTimeout(() => revealSpan(card), SCREEN_FADE_MS + 20);
  }, []);

  const applyLevelResult = (level: 1 | 2 | 3) => {
    updateProgress({ [`level${level}Completed`]: true } as Partial<Progress>);
    setActiveLevel('menu');
  };

  const handleLevel1Complete = () => applyLevelResult(1);
  const handleLevel2Complete = () => applyLevelResult(2);
  const handleLevel3Complete = () => applyLevelResult(3);

  const handleResetProgress = () => {
    if (!window.confirm('Ertu viss um að þú viljir endurstilla alla framvindu?')) return;
    resetProgress();
  };

  // Main Menu computed values
  const levelsCompleted = [
    progress.level1Completed,
    progress.level2Completed,
    progress.level3Completed,
  ].filter(Boolean).length;

  return (
    <div ref={pageTopRef}>
      <FadePresence show={activeLevel === 'level1'} exitDuration={SCREEN_FADE_MS}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          {/* Back button */}
          {/* In flow on phones, where a fixed button covered the level as it scrolled. */}
          <div className="px-4 pt-4 md:p-0 md:fixed md:top-4 md:left-4 z-40">
            <button
              onClick={() => setActiveLevel('menu')}
              className="bg-white px-4 py-2 min-h-11 md:min-h-0 rounded-lg shadow-md text-warm-600 hover:text-warm-800 flex items-center gap-2"
            >
              ← Til baka
            </button>
          </div>

          <Level1 onLevelComplete={handleLevel1Complete} />
        </div>
      </FadePresence>

      <FadePresence show={activeLevel === 'level2'} exitDuration={SCREEN_FADE_MS}>
        <Level2 onComplete={handleLevel2Complete} onBack={() => setActiveLevel('menu')} />
      </FadePresence>

      <FadePresence show={activeLevel === 'level3'} exitDuration={SCREEN_FADE_MS}>
        <Level3 onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} />
      </FadePresence>

      <FadePresence show={activeLevel === 'menu'} exitDuration={SCREEN_FADE_MS}>
        <div ref={menuRoot} className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Stuðpúðasmíði" />
          <div className="min-h-screen p-4 md:p-8 phone:p-3">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
              <p className="text-warm-600 mb-4 phone:mb-2">
                Lærðu að búa til stuðpúða með Henderson-Hasselbalch jöfnunni
              </p>

              {/* Pedagogical explanation */}
              <div className="p-4 sm:p-6 rounded-xl mb-8 bg-kvenno-orange/10 phone:p-3 phone:mb-3">
                <h2 className="font-bold mb-3 text-kvenno-orange phone:mb-1">Hvað er stuðpúði?</h2>
                <p className="text-warm-800 text-sm mb-4 phone:mb-2">
                  <strong>Stuðpúði</strong> er lausn sem getur viðhaldið stöðugu pH þegar litlu
                  magni af sýru eða basa er bætt við. Hann samanstendur af veikri sýru og samoka
                  basa hennar (eða veikum basa og samoka sýru hans).
                </p>
                <div className="bg-white p-3 rounded-lg border border-kvenno-orange phone:p-2">
                  <p className="text-sm font-mono text-center text-kvenno-orange">
                    pH = pK<sub>a</sub> + log([A⁻]/[HA])
                  </p>
                  <p className="text-xs text-warm-600 text-center mt-1">
                    Henderson-Hasselbalch jafnan
                  </p>
                </div>
              </div>

              {/* Level selection */}
              <div className="space-y-4 phone:space-y-2">
                {/* Level 1 */}
                <button
                  data-level-card="level1"
                  onClick={() => setActiveLevel('level1')}
                  className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 transition-all text-left hover:shadow-lg border-kvenno-orange bg-kvenno-orange/5"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl phone:text-2xl">🔬</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-kvenno-orange">
                          Stig 1: Hugmyndafræði
                        </span>
                        {progress.level1Completed && (
                          <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">
                            ✓ Lokið
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1 phone:mt-0 text-kvenno-orange-600">
                        Sjónræn sameindameðferð - engar tölur!
                      </div>
                      <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                        Skildu hvernig hlutfall sýru/basa hefur áhrif á pH. Lærðu að pH = pKa þegar
                        jafnt er af hvoru tveggja.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 2 */}
                <button
                  data-level-card="level2"
                  onClick={() => setActiveLevel('level2')}
                  className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 transition-all text-left hover:shadow-lg cursor-pointer"
                  style={{
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl phone:text-2xl">📐</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-green-700">
                          Stig 2: Útreikningar
                        </span>
                        {progress.level2Completed && (
                          <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">
                            ✓ Lokið
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1 phone:mt-0 text-green-600">
                        Henderson-Hasselbalch útreikningar
                      </div>
                      <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                        Reiknaðu hlutfall [Basi]/[Sýra] og massa hvers efnis. 3-skrefa ferli: stefna
                        → hlutfall → massi.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 3 */}
                <button
                  data-level-card="level3"
                  onClick={() => setActiveLevel('level3')}
                  className="game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 transition-all text-left hover:shadow-lg cursor-pointer"
                  style={{
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl phone:text-2xl">🏭</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-emerald-700">
                          Stig 3: Hönnun
                        </span>
                        {progress.level3Completed && (
                          <span className="bg-emerald-700 text-white text-xs px-2 py-1 rounded-full">
                            ✓ Lokið
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1 phone:mt-0 text-emerald-600">
                        Birgðalausnir og rúmmálsútreikningar
                      </div>
                      <div className="text-xs text-warm-600 mt-2 phone:mt-1">
                        Notaðu tilbúnar birgðalausnir til að búa til stuðpúða. Reiknaðu rúmmál til
                        að taka úr hverri birgðalausn.
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Progress: which levels are done, and the way to start over. */}
              {levelsCompleted > 0 && (
                <div className="mt-8 bg-warm-50 p-3 sm:p-4 rounded-xl flex justify-between items-center gap-3">
                  <div className="text-warm-700">
                    <span className="font-semibold">Framvinda:</span> {levelsCompleted} af 3 stigum
                    lokið
                  </div>
                  <button
                    onClick={handleResetProgress}
                    className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3 pointer-coarse:px-2 pointer-coarse:-mx-2"
                  >
                    Endurstilla
                  </button>
                </div>
              )}

              {/* Formula reference */}
              <div className="mt-6 bg-warm-50 p-4 rounded-xl">
                <h3 className="font-semibold text-warm-700 mb-2">📐 Lykilformúlur</h3>
                <div className="font-mono text-sm space-y-2 text-warm-600">
                  <p>
                    <strong>Henderson-Hasselbalch:</strong> pH = pK<sub>a</sub> + log([A⁻]/[HA])
                  </p>
                  <p>
                    <strong>Hlutfall:</strong> [A⁻]/[HA] = 10
                    <sup>
                      (pH - pK<sub>a</sub>)
                    </sup>
                  </p>
                  <p>
                    <strong>Stuðpúðasvæði:</strong> pH = pK<sub>a</sub> ± 1
                  </p>
                  <p>
                    <strong>Massi:</strong> m = n × M (mól × mólmassi)
                  </p>
                </div>
              </div>

              {/* Why this matters + curriculum */}
              <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">Af hverju stuðpúðar?</h3>
                <p className="text-sm text-amber-700">
                  Blóð mannsins er stuðpúðað við pH 7,4 — ef pH breytist um meira en 0,3 er
                  lífshætta. Stuðpúðalausnir eru einnig mikilvægar í umhverfisefnafræði og líftækni.
                </p>
              </div>
              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis →
                Sýrufastinn → Varmafræði → pH Títrun → <u>Stuðpúðar</u> → Leysnijafnvægi
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
