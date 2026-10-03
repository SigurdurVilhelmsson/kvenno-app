import { useState } from 'react';

import { Header, LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { useGameI18n } from '@shared/hooks';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

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
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'hess-law-progress',
    DEFAULT_PROGRESS
  );

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
    return <Level3 t={t} onComplete={handleLevel3Complete} onBack={() => setActiveLevel('menu')} />;
  }

  // Complete screen
  if (activeLevel === 'complete') {
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
              <div>
                <div className="font-bold text-blue-800">Stig 1: Skilningur</div>
                <div className="text-sm text-blue-600">Orkubrautir og ΔH</div>
              </div>
              <div className="font-bold text-blue-700 whitespace-nowrap">{resultLabel(1)}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center gap-3">
              <div>
                <div className="font-bold text-green-800">Stig 2: Þrautir</div>
                <div className="text-sm text-green-600">Sameina jöfnur</div>
              </div>
              <div className="font-bold text-green-700 whitespace-nowrap">{resultLabel(2)}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center gap-3">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Útreikningar</div>
                <div className="text-sm text-purple-600">Myndunarvermi</div>
              </div>
              <div className="font-bold text-purple-700 whitespace-nowrap">{resultLabel(3)}</div>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-xl mb-6">
            <h2 className="font-bold text-teal-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-teal-900 text-sm">
              <li>
                ✓ <strong>Lögmál Hess:</strong> ΔH er það sama óháð leiðinni
              </li>
              <li>
                ✓ <strong>Snúa við:</strong> Ef þú snýrð við hvörfum, snýrðu einnig formerki ΔH
              </li>
              <li>
                ✓ <strong>Margfalda:</strong> Ef þú margfaldar jöfnu, margfaldar þú einnig ΔH
              </li>
              <li>
                ✓ <strong>Myndunarvermi:</strong> ΔH°<sub>rxn</sub> = Σ&nbsp;ΔH°<sub>f</sub>
                (myndefni) - Σ&nbsp;ΔH°<sub>f</sub>(hvarfefni)
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
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <p className="text-warm-600 mb-4">
            Lærðu um orkubreytingar í efnahvörfum og hvernig á að reikna ΔH
          </p>

          {/* Pedagogical explanation */}
          <div className="bg-teal-50 p-4 sm:p-6 rounded-xl mb-8">
            <h2 className="font-bold text-teal-800 mb-3">Hvað er lögmál Hess?</h2>
            <p className="text-teal-900 text-sm mb-4">
              <strong>Vermi (ΔH)</strong> er ástandsfall — það skiptir ekki máli hvaða leið
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
              data-level-card="level1"
              onClick={() => setActiveLevel('level1')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">🔬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xl font-bold text-blue-800">Stig 1: Skilningur</span>
                    {progress.level1Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(1)}
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
              data-level-card="level2"
              onClick={() => setActiveLevel('level2')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">🧩</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xl font-bold text-green-800">Stig 2: Þrautir</span>
                    {progress.level2Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Sameina jöfnur til að ná markmiðsjöfnu
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Notaðu 2-3 jöfnur til að búa til nýja jöfnu.
                  </div>
                </div>
              </div>
            </button>

            {/* Level 3 */}
            <button
              data-level-card="level3"
              onClick={() => setActiveLevel('level3')}
              className="game-card w-full p-4 sm:p-6 rounded-xl border-4 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">📐</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xl font-bold text-purple-800">Stig 3: Útreikningar</span>
                    {progress.level3Completed && (
                      <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        ✓ {resultLabel(3)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">Myndunarvermi og flókin hvörf</div>
                  <div className="text-xs text-warm-600 mt-2">
                    Notaðu ΔH°<sub>f</sub> töflur til að reikna ΔH°<sub>rxn</sub>. Leystu öfug
                    verkefni.
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
            <div className="font-mono text-sm space-y-2 text-warm-600">
              <p>
                <strong>Lögmál Hess:</strong> ΔH<sub>heild</sub> = Σ&nbsp;ΔH<sub>skref</sub>
              </p>
              <p>
                <strong>Snúa við hvörfum:</strong> ΔH → -ΔH
              </p>
              <p>
                <strong>Margfalda jöfnu:</strong> n × jafna → n × ΔH
              </p>
              <p>
                <strong>Myndunarvermi:</strong> ΔH°<sub>rxn</sub> = Σ&nbsp;ΔH°<sub>f</sub>
                (myndefni) - Σ&nbsp;ΔH°<sub>f</sub>(hvarfefni)
              </p>
            </div>
          </div>

          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju lögmál Hess?</h3>
            <p className="text-sm text-amber-700">
              Sum hvörf er ómögulegt að mæla beint í tilraunastofu. Lögmál Hess leyfir okkur að
              reikna ΔH með því að sameina jöfnur sem VIÐ GETUM mælt — undirstaða varmafræðinnar.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Rafeindabygging → Lewis-formúlur → VSEPR →
            Millisameindakraftar → <u>Lögmál Hess</u> → Hvarfhraði → Oxun og afoxun → Lífræn
            nafnagift
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
