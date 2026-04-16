import { useState, useCallback } from 'react';

import { LanguageSwitcher, ErrorBoundary, Header } from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';

// Import Level components
import { Level1Conceptual } from './components/Level1Conceptual';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { gameTranslations } from './i18n';

interface Progress {
  completed: number[];
}

/**
 * Main application component for Dimensional Analysis Game
 */
function App() {
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const [screen, setScreen] = useState<'menu' | 'level1' | 'level2' | 'level3'>('menu');
  const { progress, updateProgress } = useGameProgress<Progress>('dimensional-analysis-progress', {
    completed: [],
  });
  const completedLevels = progress.completed;

  const markCompleted = useCallback(
    (level: number) => {
      if (completedLevels.includes(level)) return;
      updateProgress({ completed: [...completedLevels, level] });
    },
    [completedLevels, updateProgress]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header
        variant="game"
        backHref="/efnafraedi/1-ar/"
        gameTitle={t('game.title')}
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />
      <div className="min-h-screen">
        {/* Accessibility Skip Link */}
        <a href="#main-content" className="skip-link">
          {t('accessibility.skipToContent', 'Fara beint í efni')}
        </a>

        {/* Main Content */}
        <main id="main-content" className="container mx-auto px-4 py-8">
          <p className="text-lg text-warm-600 text-center mb-8">{t('game.subtitle')}</p>

          {/* Main Menu */}
          {screen === 'menu' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-warm-800 mb-6">
                  {t('mainMenu.selectLevel', 'Veldu stig')}
                </h2>

                {/* Level Cards - Conceptual First Progression */}
                <div className="grid gap-4">
                  {/* Level 1 - Conceptual (Visual Learning) */}
                  <button
                    onClick={() => setScreen('level1')}
                    className="game-card bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">1</span>
                      <h3 className="text-xl font-semibold">{t('levels.level1.name', 'Hugtök')}</h3>
                    </div>
                    <p className="text-green-100">
                      {t('levels.level1.description', 'Sjónræn lærdómur - engar útreikninga')}
                    </p>
                    {completedLevels.includes(1) && (
                      <p className="text-sm text-green-200 mt-2">Lokið</p>
                    )}
                  </button>

                  {/* Level 2 - Application (Predict & Reason) */}
                  <button
                    onClick={() => setScreen('level2')}
                    className="game-card bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">2</span>
                      <h3 className="text-xl font-semibold">
                        {t('levels.level2.name', 'Beiting')}
                      </h3>
                    </div>
                    <p className="text-blue-100">
                      {t('levels.level2.description', 'Spá fyrir og rökstyðja')}
                    </p>
                    {completedLevels.includes(2) && (
                      <p className="text-sm text-blue-200 mt-2">Lokið</p>
                    )}
                  </button>

                  {/* Level 3 - Calculation (Full Problems) */}
                  <button
                    onClick={() => setScreen('level3')}
                    className="game-card bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-6 text-left transition-colors"
                    style={{ backgroundColor: '#f36b22' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">3</span>
                      <h3 className="text-xl font-semibold">
                        {t('levels.level3.name', 'Útreikningar')}
                      </h3>
                    </div>
                    <p className="text-orange-100">
                      {t('levels.level3.description', 'Fullir útreikningar með formúlum')}
                    </p>
                    {completedLevels.includes(3) && (
                      <p className="text-sm text-orange-200 mt-2">Lokið</p>
                    )}
                  </button>
                </div>

                {/* Why this matters + curriculum position */}
                <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Af hverju einingagreining?</h3>
                  <p className="text-sm text-amber-700">
                    Árið 1999 tapaðist Mars Climate Orbiter geimfarið vegna einingavillu — eitt
                    teymi notaði pund-kraft, annað Newton. Einingagreining kemur í veg fyrir slíkar
                    villur í lyfjafræði, verkfræði og öllum vísindum.
                  </p>
                </div>

                <div className="mt-3 text-center text-xs text-warm-500">
                  <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi
                  → Jafna jöfnur → Takmarkandi → Lausnir
                </div>
              </div>
            </div>
          )}

          {/* Level Screens */}
          {screen === 'level1' && (
            <Level1Conceptual
              onComplete={(levelProgress) => {
                if (levelProgress.mastered) markCompleted(1);
                setScreen('menu');
              }}
              onBack={() => setScreen('menu')}
              initialProgress={undefined}
            />
          )}

          {screen === 'level2' && (
            <Level2
              onComplete={(levelProgress) => {
                if (levelProgress.mastered) markCompleted(2);
                setScreen('menu');
              }}
              onBack={() => setScreen('menu')}
              initialProgress={undefined}
            />
          )}

          {screen === 'level3' && (
            <Level3
              onComplete={(levelProgress) => {
                if (levelProgress.mastered) markCompleted(3);
                setScreen('menu');
              }}
              onBack={() => setScreen('menu')}
              initialProgress={undefined}
            />
          )}
        </main>
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
