import { useState, useCallback } from 'react';

import { LanguageSwitcher, ErrorBoundary, Header } from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

// Import Level components
import { Level0SigFigs } from './components/Level0SigFigs';
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
  const [screen, setScreen] = useState<'menu' | 'level0' | 'level1' | 'level2' | 'level3'>('menu');
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

  // Each screen swap starts the new screen at its top on a phone with its
  // heading focused (the button that caused the swap has unmounted, and focus
  // would otherwise fall to <body>). Back on the menu, the first level not yet
  // done is revealed and focused instead.
  const nextLevel = [0, 1, 2, 3].find((level) => !completedLevels.includes(level));
  useScreenTop(screen, {
    target: () =>
      screen === 'menu' && nextLevel !== undefined
        ? document.querySelector(`[data-level-card="${nextLevel}"]`)
        : null,
  });

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
        <main id="main-content" className="container mx-auto px-4 py-4 sm:py-8">
          <p className="text-lg text-warm-600 text-center mb-4 sm:mb-8 phone:sr-only">
            {t('game.subtitle')}
          </p>

          {/* Main Menu */}
          {screen === 'menu' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-5 sm:p-8 phone:p-4">
                <h2 className="text-2xl font-bold text-warm-800 mb-6 phone:mb-3">
                  {t('mainMenu.selectLevel', 'Veldu stig')}
                </h2>

                {/* Level Cards - Conceptual First Progression */}
                <div className="grid gap-4 phone:gap-3">
                  {/* Level 0 - Significant figures. Siggi's ruling 2026-09-19:
                      this lives inside Einingagreining, not in its own game.
                      It comes first because Level 3 already marks students on
                      it. */}
                  <button
                    data-level-card={0}
                    onClick={() => setScreen('level0')}
                    className="game-card bg-warm-600 hover:bg-warm-700 text-white rounded-lg p-5 sm:p-6 phone:p-4 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 phone:mb-1">
                      <span className="text-2xl">0</span>
                      <h3 className="text-xl font-semibold">Markverðir stafir</h3>
                    </div>
                    <p className="text-warm-100">
                      Hversu nákvæm er mælingin — og hvernig skrifarðu það niður
                    </p>
                    {completedLevels.includes(0) && (
                      <p className="text-sm text-warm-200 mt-2">Lokið</p>
                    )}
                  </button>

                  {/* Level 1 - Conceptual (Visual Learning) */}
                  <button
                    data-level-card={1}
                    onClick={() => setScreen('level1')}
                    className="game-card bg-green-500 hover:bg-green-600 text-white rounded-lg p-5 sm:p-6 phone:p-4 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 phone:mb-1">
                      <span className="text-2xl">1</span>
                      <h3 className="text-xl font-semibold">{t('levels.level1.name', 'Hugtök')}</h3>
                    </div>
                    <p className="text-green-100">
                      {t('levels.level1.description', 'Sjónrænn lærdómur – engir útreikningar')}
                    </p>
                    {completedLevels.includes(1) && (
                      <p className="text-sm text-green-200 mt-2">Lokið</p>
                    )}
                  </button>

                  {/* Level 2 - Application (Predict & Reason) */}
                  <button
                    data-level-card={2}
                    onClick={() => setScreen('level2')}
                    className="game-card bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-5 sm:p-6 phone:p-4 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 phone:mb-1">
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
                    data-level-card={3}
                    onClick={() => setScreen('level3')}
                    className="game-card bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-5 sm:p-6 phone:p-4 text-left transition-colors"
                    style={{ backgroundColor: '#f36b22' }}
                  >
                    <div className="flex items-center gap-2 mb-2 phone:mb-1">
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
                  <strong>Námsleiðin:</strong> <u>Einingagreining</u> → Lotukerfið → Nafnakerfið →
                  Mólmassi → Reynsluformúlur → Stilla efnajöfnur → Útfellingarhvörf → Takmarkandi →
                  Lausnir → Einingakeðjan
                </div>
              </div>
            </div>
          )}

          {/* Level Screens */}
          {screen === 'level0' && (
            <Level0SigFigs
              onComplete={(levelProgress) => {
                if (levelProgress.mastered) markCompleted(0);
                setScreen('menu');
              }}
              onBack={() => setScreen('menu')}
            />
          )}

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
