import { useState } from 'react';

import { Header, LanguageSwitcher, ErrorBoundary } from '@shared/components';
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
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'lewis-structures-progress',
    DEFAULT_PROGRESS
  );

  const applyLevelResult = (level: 1 | 2 | 3, score: number, next: ActiveLevel) => {
    const key = `level${level}` as const;
    updateProgress({
      [`${key}Completed`]: true,
      [`${key}Score`]: Math.max(progress[`${key}Score`], score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    } as Partial<Progress>);
    setActiveLevel(next);
  };

  const handleLevel1Complete = (score: number) => applyLevelResult(1, score, 'menu');
  const handleLevel2Complete = (score: number) => applyLevelResult(2, score, 'menu');
  const handleLevel3Complete = (score: number) => applyLevelResult(3, score, 'complete');

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
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
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
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-800">Stig 1: Gildisrafeindir</div>
                <div className="text-sm text-blue-600">Telja og skilja</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800">Stig 2: Teikna Lewis</div>
                <div className="text-sm text-green-600">Byggja formúlur</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Formhleðsla</div>
                <div className="text-sm text-purple-600">Samsvörunarformúlur</div>
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
                ✓ <strong>Gildisrafeindir:</strong> Rafeindir í ystu skel ákvarða efnatengsl
              </li>
              <li>
                ✓ <strong>Áttureglann:</strong> Atóm vilja hafa 8 rafeindir (H vill 2)
              </li>
              <li>
                ✓ <strong>Lewis-formúlur:</strong> Sýna hvernig rafeindir dreifast í sameindum
              </li>
              <li>
                ✓ <strong>Formhleðsla:</strong> FC = Gildisraf. - (óbundin + ½ bundin)
              </li>
              <li>
                ✓ <strong>Samsvörun:</strong> Margar jafngildar formúlur fyrir sömu sameind
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
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle="Lewis-formúlur"
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <p className="text-center text-warm-600 mb-8">
            Lærðu að teikna rafeindasamsetningu sameinda
          </p>

          {/* Pedagogical explanation */}
          <div className="bg-teal-50 p-6 rounded-xl mb-8">
            <h2 className="font-bold text-teal-800 mb-3">Hvað eru Lewis-formúlur?</h2>
            <p className="text-teal-900 text-sm mb-4">
              <strong>Lewis-formúlur</strong> (eða rafeinapunktaformúlur) sýna hvernig
              gildisrafeindir dreifast á milli atóma í sameind. Þær hjálpa okkur að skilja
              efnatengsl og lögun sameinda.
            </p>
            <div className="bg-white p-3 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 font-mono text-center">
                Alls rafeindir = Σ gildisrafeindir - hleðsla
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
                <div className="text-4xl">🔢</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-800">Stig 1: Gildisrafeindir</span>
                    {progress.level1Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level1Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Telja gildisrafeindir og skilja átturegluna
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Hvaða rafeindir taka þátt í efnatengslum? Lærðu að telja þær.
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
                <div className="text-4xl">✏️</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-800">
                      Stig 2: Teikna Lewis-formúlur
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level2Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Byggja Lewis-formúlur skref fyrir skref
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Settu miðatóm, teiknaðu tengsl og einstæð rafeindarapör.
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
                <div className="text-4xl">⚖️</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-800">
                      Stig 3: Formhleðsla og samsvörun
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level3Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Reikna formhleðslu og finna samsvörunarformúlur
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Hvernig finnur þú bestu Lewis-formúluna?
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

          {/* Valence electron reference */}
          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-2">🔢 Gildisrafeindir eftir hópi</h3>
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
              Lewis-formúlur sýna hvernig rafeindir tengjast milli atóma — lykilin að lyfjahönnun,
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
