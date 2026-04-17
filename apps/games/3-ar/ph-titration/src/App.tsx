import { useState } from 'react';

import {
  Header,
  LanguageSwitcher,
  ErrorBoundary,
  FadePresence,
  Presence,
} from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

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
    'ph-titration-progress',
    DEFAULT_PROGRESS
  );

  const applyLevelResult = (
    levelKey: 'level1' | 'level2' | 'level3',
    score: number,
    nextScreen: ActiveLevel
  ) => {
    const completedKey = `${levelKey}Completed` as const;
    const scoreKey = `${levelKey}Score` as const;
    updateProgress({
      [completedKey]: true,
      [scoreKey]: Math.max(progress[scoreKey], score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    } as Partial<Progress>);
    setActiveLevel(nextScreen);
  };

  const handleLevel1Complete = (score: number) => applyLevelResult('level1', score, 'menu');
  const handleLevel2Complete = (score: number) => applyLevelResult('level2', score, 'menu');
  const handleLevel3Complete = (score: number) => applyLevelResult('level3', score, 'complete');

  const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;
  const levelsCompleted = [
    progress.level1Completed,
    progress.level2Completed,
    progress.level3Completed,
  ].filter(Boolean).length;

  return (
    <>
      <FadePresence show={activeLevel === 'level1'} exitDuration={200}>
        <Level1 onComplete={handleLevel1Complete} onBack={() => setActiveLevel('menu')} />
      </FadePresence>

      <FadePresence show={activeLevel === 'level2'} exitDuration={200}>
        <Level2 onComplete={handleLevel2Complete} onBack={() => setActiveLevel('menu')} />
      </FadePresence>

      <FadePresence show={activeLevel === 'level3'} exitDuration={200}>
        <Level3 onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} t={t} />
      </FadePresence>

      <FadePresence show={activeLevel === 'complete'} exitDuration={200}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
          <Presence show={activeLevel === 'complete'} exitDuration={300}>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-purple-600">
                Til hamingju!
              </h1>

              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-2xl font-bold text-warm-800 mb-2">
                  Þú hefur lokið öllum stigum!
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-blue-800">Stig 1: Skilningur</div>
                    <div className="text-sm text-blue-600">Títrunarkúrfur og vísar</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-green-800">Stig 2: Framkvæmd</div>
                    <div className="text-sm text-green-600">Gagnvirk títrun</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-purple-800">Stig 3: Útreikningar</div>
                    <div className="text-sm text-purple-600">Styrk- og pH-reikningar</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{progress.level3Score}</div>
                </div>

                <div className="bg-orange-100 p-4 rounded-xl flex justify-between items-center border-2 border-orange-400">
                  <div className="font-bold text-orange-800 text-lg">Heildarstig</div>
                  <div className="text-3xl font-bold text-orange-600">{totalScore}</div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl mb-6">
                <h2 className="font-bold text-purple-800 mb-3">Hvað lærðir þú?</h2>
                <ul className="space-y-2 text-purple-900 text-sm">
                  <li>
                    ✓ <strong>Títrunarkúrfur:</strong> Munur á sterkum og veikum sýru-basa kúrfum
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
                    ✓ <strong>Fjölprótón sýrur:</strong> Margar jafngildispunktar fyrir H₂SO₃, H₃PO₄
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

      <FadePresence show={activeLevel === 'menu'} exitDuration={200}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <Header
            variant="game"
            backHref="/efnafraedi/3-ar/"
            gameTitle="pH Titrun"
            authSlot={
              <LanguageSwitcher
                language={language}
                onLanguageChange={setLanguage}
                variant="compact"
              />
            }
          />
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <p className="text-warm-600 mb-4">
                Lærðu um sýru-basa títranir, títrunarkúrfur og vísa
              </p>

              {/* Pedagogical explanation */}
              <div className="bg-purple-50 p-6 rounded-xl mb-8">
                <h2 className="font-bold text-purple-800 mb-3">Hvað er títrun?</h2>
                <p className="text-purple-900 text-sm mb-4">
                  <strong>Títrun</strong> er aðferð til að ákvarða styrk óþekkts efnis með því að
                  bæta við þekktu efni (títrant) þar til efnahvörfin er lokið. Við mælum pH allan
                  tímann og finnum <em>jafngildispunktinn</em> þar sem öll sýra/basi hefur hvarfast.
                </p>
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 font-mono text-center">
                    V<sub>sýra</sub> × M<sub>sýra</sub> = V<sub>basa</sub> × M<sub>basa</sub>
                  </p>
                </div>
              </div>

              {/* Level selection */}
              <div className="space-y-4">
                {/* Level 1 */}
                <button
                  onClick={() => setActiveLevel('level1')}
                  className="game-card w-full p-6 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📈</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-blue-800">Stig 1: Skilningur</span>
                        {progress.level1Completed && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            ✓ {progress.level1Score} stig
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">Títrunarkúrfur og vísar</div>
                      <div className="text-xs text-warm-600 mt-2">
                        Skildu hvernig títrunarkúrfur líta út fyrir mismunandi sýru-basa
                        samsetningar. Lærðu um vísa og litabreytingar.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 2 */}
                <button
                  onClick={() => setActiveLevel('level2')}
                  className="game-card w-full p-6 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🧪</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-800">Stig 2: Framkvæmd</span>
                        {progress.level2Completed && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            ✓ {progress.level2Score} stig
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Gagnvirk títrun í rannsóknarstofu
                      </div>
                      <div className="text-xs text-warm-600 mt-2">
                        Framkvæmdu títrun, veldu réttan vísi og finndu jafngildispunkt. Byggðu upp
                        færni í rannsóknarstofuvinnu.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 3 */}
                <button
                  onClick={() => setActiveLevel('level3')}
                  className="game-card w-full p-6 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📐</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-purple-800">
                          Stig 3: Útreikningar
                        </span>
                        {progress.level3Completed && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            ✓ {progress.level3Score} stig
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-purple-600 mt-1">
                        Styrkreikningar og fjölprótón sýrur
                      </div>
                      <div className="text-xs text-warm-600 mt-2">
                        Reiknaðu styrk, pH og rúmmál. Leystu fjölprótón sýruverkefni og notaðu
                        Henderson-Hasselbalch jöfnuna.
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
                      className="text-sm text-warm-500 hover:text-red-500 transition-colors"
                    >
                      Endurstilla
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{levelsCompleted}/3</div>
                      <div className="text-xs text-warm-600">Stig lokið</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">{totalScore}</div>
                      <div className="text-xs text-warm-600">Heildar stig</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
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
                    <strong>Títrunarjafna:</strong> V<sub>sýra</sub> × M<sub>sýra</sub> = V
                    <sub>basa</sub> × M<sub>basa</sub>
                  </p>
                  <p>
                    <strong>Henderson-Hasselbalch:</strong> pH = pK<sub>a</sub> + log([A⁻]/[HA])
                  </p>
                  <p>
                    <strong>Púffur svæði:</strong> pH = pK<sub>a</sub> ± 1
                  </p>
                  <p>
                    <strong>Fjölprótón:</strong> Mörg jafngildispunkt fyrir H₂SO₃, H₃PO₄
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
                <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægi → Varmafræði → <u>pH Títrun</u> →
                Púfferar
              </div>
              <div className="mt-2 text-center text-xs text-warm-400">
                Kafli 17 — Chemistry: The Central Science (Brown et al.)
              </div>
            </div>
          </div>
        </div>
      </FadePresence>
    </>
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
