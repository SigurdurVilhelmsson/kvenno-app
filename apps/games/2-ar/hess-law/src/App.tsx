import { useState } from 'react';

import { Header, LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { useGameI18n } from '@shared/hooks';
import { useGameProgress } from '@shared/hooks';

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
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'hess-law-progress',
    DEFAULT_PROGRESS
  );

  const handleLevel1Complete = (score: number, _maxScore: number = 600, _hintsUsed: number = 0) => {
    updateProgress({
      level1Completed: true,
      level1Score: Math.max(progress.level1Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    setActiveLevel('menu');
  };

  const handleLevel2Complete = (score: number, _maxScore: number = 500, _hintsUsed: number = 0) => {
    updateProgress({
      level2Completed: true,
      level2Score: Math.max(progress.level2Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    setActiveLevel('menu');
  };

  const handleLevel3Complete = (score: number, _maxScore: number = 500, _hintsUsed: number = 0) => {
    updateProgress({
      level3Completed: true,
      level3Score: Math.max(progress.level3Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    setActiveLevel('complete');
  };

  // Render active level
  if (activeLevel === 'level1') {
    return <Level1 onComplete={handleLevel1Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'level2') {
    return <Level2 onComplete={handleLevel2Complete} onBack={() => setActiveLevel('menu')} />;
  }

  if (activeLevel === 'level3') {
    return <Level3 t={t} onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} />;
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
                <div className="font-bold text-blue-800">Stig 1: Skilningur</div>
                <div className="text-sm text-blue-600">Orkubrautir og ΔH</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800">Stig 2: Þrautir</div>
                <div className="text-sm text-green-600">Sameina jöfnur</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Útreikningar</div>
                <div className="text-sm text-purple-600">Myndunarvarminn</div>
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
                ✓ <strong>Lögmál Hess:</strong> ΔH fer sama leiðina óháð hvörfunarferlinu
              </li>
              <li>
                ✓ <strong>Snúa við:</strong> Ef þú snýrð við hvörfum, snýrðu einnig formerki ΔH
              </li>
              <li>
                ✓ <strong>Margfalda:</strong> Ef þú margfaldar jöfnu, margfaldar þú einnig ΔH
              </li>
              <li>
                ✓ <strong>Myndunarvarminn:</strong> ΔH°<sub>rxn</sub> = Σ ΔH°<sub>f</sub>(afurðir) -
                Σ ΔH°<sub>f</sub>(hvarfefni)
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
        gameTitle="Lögmál Hess"
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <p className="text-warm-600 mb-4">
            Lærðu um orkubreytingar í efnahvörfum og hvernig á að reikna ΔH
          </p>

          {/* Pedagogical explanation */}
          <div className="bg-teal-50 p-6 rounded-xl mb-8">
            <h2 className="font-bold text-teal-800 mb-3">Hvað er lögmál Hess?</h2>
            <p className="text-teal-900 text-sm mb-4">
              <strong>Skammtavarmi (ΔH)</strong> er ástandsfall — það skiptir ekki máli hvaða leið
              efnahvörfin taka, aðeins upphafs- og lokaaðstæður skipta máli. Þetta þýðir að við
              getum <em>sameinað</em> jöfnur til að finna ΔH fyrir hvörf sem erfitt er að mæla
              beint.
            </p>
            <div className="bg-white p-3 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 font-mono text-center">
                ΔH<sub>heild</sub> = ΔH<sub>1</sub> + ΔH<sub>2</sub> + ΔH<sub>3</sub> + ...
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
                <div className="text-4xl">🔬</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-800">Stig 1: Skilningur</span>
                    {progress.level1Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level1Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Orkubrautir og ΔH merki</div>
                  <div className="text-xs text-warm-600 mt-2">
                    Sjáðu hvernig ΔH breytist þegar þú snýrð við eða margfaldar jöfnur. Byggðu
                    innsæi fyrir lögmál Hess.
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
                <div className="text-4xl">🧩</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-800">Stig 2: Þrautir</span>
                    {progress.level2Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level2Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Sameina jöfnur til að ná markmiðsjöfnu
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Notaðu 2-3 jöfnur til að búa til nýja jöfnu. Útskýrðu rökstuðning.
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
                    <span className="text-xl font-bold text-purple-800">Stig 3: Útreikningar</span>
                    {progress.level3Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level3Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Myndunarvarminn og flókin hvörf
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Notaðu ΔH°<sub>f</sub> töflur til að reikna ΔH°<sub>rxn</sub>. Leystu öfug
                    verkefni.
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
                <strong>Lögmál Hess:</strong> ΔH<sub>heild</sub> = Σ ΔH<sub>skref</sub>
              </p>
              <p>
                <strong>Snúa við hvörfum:</strong> ΔH → -ΔH
              </p>
              <p>
                <strong>Margfalda jöfnu:</strong> n × jafna → n × ΔH
              </p>
              <p>
                <strong>Myndunarvarminn:</strong> ΔH°<sub>rxn</sub> = Σ ΔH°<sub>f</sub>(afurðir) - Σ
                ΔH°<sub>f</sub>(hvarfefni)
              </p>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju lögmál Hess?</h3>
            <p className="text-sm text-amber-700">
              Sum hvörf er ómögulegt að mæla beint í tilraunastofu. Lögmál Hess leyfir okkur að
              reikna ΔH með því að sameina jöfnur sem VER GETUM mælt — undirstaða varmafræðinnar.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → Lewis → VSEPR → IMF → <u>Hess</u> →
            Kinetics → Redox → Organic
          </div>
          <div className="mt-2 text-center text-xs text-warm-400">
            Kafli 5 — Chemistry: The Central Science (Brown et al.)
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
