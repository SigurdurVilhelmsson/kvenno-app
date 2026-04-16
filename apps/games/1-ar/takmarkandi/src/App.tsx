import { useState } from 'react';

import { LanguageSwitcher, ErrorBoundary, Header } from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';

import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

import './styles.css';

type Screen = 'menu' | 'level1' | 'level2' | 'level3';

interface Progress {
  level1Completed: boolean;
  level1Score: number;
  level2Completed: boolean;
  level2Score: number;
  level3BestScore: number;
  totalGamesPlayed: number;
}

const DEFAULT_PROGRESS: Progress = {
  level1Completed: false,
  level1Score: 0,
  level2Completed: false,
  level2Score: 0,
  level3BestScore: 0,
  totalGamesPlayed: 0,
};

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'takmarkandi-levels-progress',
    DEFAULT_PROGRESS
  );
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });

  const handleLevel1Complete = (score: number) => {
    updateProgress({
      level1Completed: true,
      level1Score: Math.max(progress.level1Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    setScreen('menu');
  };

  const handleLevel2Complete = (score: number) => {
    updateProgress({
      level2Completed: true,
      level2Score: Math.max(progress.level2Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    setScreen('menu');
  };

  const handleLevel3Complete = (score: number) => {
    updateProgress({
      level3BestScore: Math.max(progress.level3BestScore, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    setScreen('menu');
  };

  // Level screens
  if (screen === 'level1') {
    return <Level1 onComplete={handleLevel1Complete} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'level2') {
    return <Level2 onComplete={handleLevel2Complete} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'level3') {
    return <Level3 onComplete={handleLevel3Complete} onBack={() => setScreen('menu')} />;
  }

  // Main Menu - Year 1: Orange/Amber theme
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header
        variant="game"
        backHref="/efnafraedi/1-ar/"
        gameTitle={t('game.title', 'Takmarkandi Hvarfefni')}
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <p className="text-center text-warm-600 mb-4">
              {t('game.description', 'Lærðu að finna takmarkandi hvarfefni og reikna heimtir')}
            </p>

            <div className="space-y-4">
              {/* Level 1 */}
              <button
                onClick={() => setScreen('level1')}
                className="game-card w-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Stig 1
                      </span>
                      <h3 className="text-xl font-bold text-warm-800">Grunnhugtök</h3>
                    </div>
                    <p className="text-warm-600 text-sm">
                      Skildu hugtökin sjónrænt - hvað eyðist fyrst?
                    </p>
                  </div>
                  <div className="text-right">
                    {progress.level1Completed ? (
                      <div className="text-green-600">
                        <div className="text-2xl font-bold">{progress.level1Score}</div>
                        <div className="text-xs">stig - Lokið</div>
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl">→</div>
                    )}
                  </div>
                </div>
              </button>

              {/* Level 2 */}
              <button
                onClick={() => setScreen('level2')}
                className="game-card w-full bg-white border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Stig 2
                      </span>
                      <h3 className="text-xl font-bold text-warm-800">Leiðbeind æfing</h3>
                    </div>
                    <p className="text-warm-600 text-sm">
                      Leystu verkefni skref fyrir skref með leiðsögn
                    </p>
                  </div>
                  <div className="text-right">
                    {progress.level2Completed ? (
                      <div className="text-green-600">
                        <div className="text-2xl font-bold">{progress.level2Score}</div>
                        <div className="text-xs">stig - Lokið</div>
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl">→</div>
                    )}
                  </div>
                </div>
              </button>

              {/* Level 3 */}
              <button
                onClick={() => setScreen('level3')}
                className="game-card w-full bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Stig 3
                      </span>
                      <h3 className="text-xl font-bold text-warm-800">Meistarapróf</h3>
                    </div>
                    <p className="text-warm-600 text-sm">
                      Samþætt verkefni: finndu takmarkandi, reiknaðu afurðir og afgang
                    </p>
                  </div>
                  <div className="text-right">
                    {progress.level3BestScore > 0 ? (
                      <div className="text-green-600">
                        <div className="text-2xl font-bold">{progress.level3BestScore}</div>
                        <div className="text-xs">stig</div>
                      </div>
                    ) : (
                      <div className="text-warm-400 text-3xl">→</div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Progress Summary */}
          {progress.totalGamesPlayed > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
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
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      [
                        progress.level1Completed,
                        progress.level2Completed,
                        progress.level3BestScore > 0,
                      ].filter(Boolean).length
                    }
                    /3
                  </div>
                  <div className="text-xs text-warm-600">Stig lokið</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {progress.level1Score + progress.level2Score + progress.level3BestScore}
                  </div>
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

          {/* What you'll learn */}
          <div className="bg-orange-50 rounded-xl p-6 mt-6">
            <h3 className="font-bold text-orange-800 mb-3">Hvað lærir þú?</h3>
            <ul className="text-sm text-warm-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Hvað er takmarkandi hvarfefni og hvers vegna það skiptir máli</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Hvernig á að finna takmarkandi hvarfefni út frá stuðlum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Reikna magn afurða og afganga eftir hvarf</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Nota stökjómetríu til að leysa raunveruleg vandamál</span>
              </li>
            </ul>
          </div>
          {/* Why this matters + curriculum */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Af hverju takmarkandi hvarfefni?</h3>
            <p className="text-sm text-amber-700">
              Í iðnaði skiptir máli að vita hvaða hráefni klárast fyrst — það ákvarðar hversu mikil
              afurð verður. Lyfjafyrirtæki nota þetta til að hámarka framleiðslu og lágmarka sóun.
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-warm-500">
            <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →
            Jafna jöfnur → <u>Takmarkandi</u> → Lausnir
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
