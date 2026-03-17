import { useState } from 'react';

import { Header, LanguageSwitcher, ErrorBoundary } from '@shared/components';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { AnimatedBackground } from '@shared/components/AnimatedBackground';
import {
  ParticleCelebration,
  useParticleCelebration,
} from '@shared/components/ParticleCelebration';
import { SoundToggle } from '@shared/components/SoundToggle';
import { useGameI18n } from '@shared/hooks';
import { useGameProgress } from '@shared/hooks';
import { useAchievements } from '@shared/hooks/useAchievements';
import { useGameSounds } from '@shared/hooks/useGameSounds';

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
    'kinetics-progress',
    DEFAULT_PROGRESS
  );
  const [showAchievements, setShowAchievements] = useState(false);

  const {
    achievements,
    allAchievements,
    notifications,
    dismissNotification,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    trackGameComplete,
    resetAll: resetAchievements,
  } = useAchievements({ gameId: 'kinetics' });

  const { triggerCorrect, triggerLevelComplete, celebrationProps } = useParticleCelebration('2-ar');
  const {
    playCorrect,
    playWrong,
    playLevelComplete,
    isEnabled: soundEnabled,
    toggleSound,
  } = useGameSounds();

  const handleCorrectAnswer = (...args: Parameters<typeof trackCorrectAnswer>) => {
    trackCorrectAnswer(...args);
    playCorrect();
    triggerCorrect();
  };

  const handleIncorrectAnswer = (...args: Parameters<typeof trackIncorrectAnswer>) => {
    trackIncorrectAnswer(...args);
    playWrong();
  };

  const handleLevel1Complete = (score: number, maxScore: number, hintsUsed: number) => {
    updateProgress({
      level1Completed: true,
      level1Score: Math.max(progress.level1Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    trackLevelComplete(1, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    setActiveLevel('menu');
  };

  const handleLevel2Complete = (score: number, maxScore: number, hintsUsed: number) => {
    updateProgress({
      level2Completed: true,
      level2Score: Math.max(progress.level2Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    trackLevelComplete(2, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    setActiveLevel('menu');
  };

  const handleLevel3Complete = (score: number, maxScore: number, hintsUsed: number) => {
    updateProgress({
      level3Completed: true,
      level3Score: Math.max(progress.level3Score, score),
      totalGamesPlayed: progress.totalGamesPlayed + 1,
    });
    trackLevelComplete(3, score, maxScore, { hintsUsed });
    trackGameComplete();
    playLevelComplete();
    triggerLevelComplete();
    setActiveLevel('complete');
  };

  // Render active level
  if (activeLevel === 'level1') {
    return (
      <>
        <Level1
          onComplete={handleLevel1Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
        <ParticleCelebration {...celebrationProps} />
      </>
    );
  }

  if (activeLevel === 'level2') {
    return (
      <>
        <Level2
          onComplete={handleLevel2Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
        <ParticleCelebration {...celebrationProps} />
      </>
    );
  }

  if (activeLevel === 'level3') {
    return (
      <>
        <Level3
          onComplete={handleLevel3Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
        <ParticleCelebration {...celebrationProps} />
      </>
    );
  }

  // Complete screen
  if (activeLevel === 'complete') {
    const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;

    return (
      <>
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
                  <div className="font-bold text-blue-800">Stig 1: Hraðahugtök</div>
                  <div className="text-sm text-blue-600">Hvað hefur áhrif á hraða?</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{progress.level1Score}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-green-800">Stig 2: Hraðalögmál</div>
                  <div className="text-sm text-green-600">Byggja hraðajöfnur</div>
                </div>
                <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-purple-800">Stig 3: Hvarfgangsháttur</div>
                  <div className="text-sm text-purple-600">Frumskref og millistig</div>
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
                  ✓ <strong>Hraði:</strong> Rate = Δ[efni]/Δt — hversu hratt efnahvörf gerast
                </li>
                <li>
                  ✓ <strong>Hraðalögmál:</strong> Rate = k[A]<sup>m</sup>[B]<sup>n</sup> — tengsl
                  við styrk
                </li>
                <li>
                  ✓ <strong>Röð hvörfunar:</strong> Veldisvísir segir hversu mikið styrkur hefur
                  áhrif
                </li>
                <li>
                  ✓ <strong>Hvarfgangsháttur:</strong> Röð frumskref sem mynda heildarhvörf
                </li>
                <li>
                  ✓ <strong>Hraðaákvarðandi skref:</strong> Hægasta skrefið ræður heildarhraða
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
        <ParticleCelebration {...celebrationProps} />
      </>
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
    <AnimatedBackground yearTheme="2-ar" variant="menu">
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle="Hvarfhraði"
        authSlot={
          <>
            <SoundToggle isEnabled={soundEnabled} onToggle={toggleSound} size="sm" />
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
            <AchievementsButton
              achievements={achievements}
              onClick={() => setShowAchievements(true)}
            />
          </>
        }
      />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <p className="text-center text-warm-600 mb-8">
            Lærðu um hraða efnahvarfa, hraðalögmál og hvarfgangshátt
          </p>

          {/* Pedagogical explanation */}
          <div className="bg-teal-50 p-6 rounded-xl mb-8">
            <h2 className="font-bold text-teal-800 mb-3">Hvað er hvarfhraði?</h2>
            <p className="text-teal-900 text-sm mb-4">
              <strong>Hvarfhraði (reaction rate)</strong> lýsir því hversu hratt hvarfefni breytast
              í afurðir. Hraðinn ákvarðast af mörgum þáttum: styrk hvarfefna, hitastigi, hvata og
              yfirborðsflatarmáli.
            </p>
            <div className="bg-white p-3 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 font-mono text-center">
                Rate = k[A]<sup>m</sup>[B]<sup>n</sup>
              </p>
              <p className="text-xs text-warm-600 text-center mt-1">
                þar sem k = hraðafasti, m og n = veldisvísir (röð hvörfunar)
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
                    <span className="text-xl font-bold text-blue-800">Stig 1: Hraðahugtök</span>
                    {progress.level1Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level1Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Hvað hefur áhrif á hvarfhraða?</div>
                  <div className="text-xs text-warm-600 mt-2">
                    Styrk, hitastig, hvatar, yfirborð — sjáðu hvernig þessir þættir breyta hraðanum.
                  </div>
                </div>
              </div>
            </button>

            {/* Level 2 */}
            <button
              onClick={() => progress.level1Completed && setActiveLevel('level2')}
              className={`game-card w-full p-6 rounded-xl border-4 transition-all text-left ${
                progress.level1Completed
                  ? 'border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer'
                  : 'border-warm-200 bg-warm-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl font-bold ${progress.level1Completed ? 'text-green-800' : 'text-warm-600'}`}
                    >
                      Stig 2: Hraðalögmál
                    </span>
                    {progress.level2Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level2Score} stig
                      </span>
                    )}
                    {!progress.level1Completed && (
                      <span className="text-xs text-warm-500">(Ljúktu stigi 1 fyrst)</span>
                    )}
                  </div>
                  <div
                    className={`text-sm mt-1 ${progress.level1Completed ? 'text-green-600' : 'text-warm-500'}`}
                  >
                    Byggja og túlka hraðalögmál
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Notaðu gögn til að finna röð hvörfunar og hraðafast.
                  </div>
                </div>
              </div>
            </button>

            {/* Level 3 */}
            <button
              onClick={() => progress.level2Completed && setActiveLevel('level3')}
              className={`game-card w-full p-6 rounded-xl border-4 transition-all text-left ${
                progress.level2Completed
                  ? 'border-purple-400 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                  : 'border-warm-200 bg-warm-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⚙️</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl font-bold ${progress.level2Completed ? 'text-purple-800' : 'text-warm-600'}`}
                    >
                      Stig 3: Hvarfgangsháttur
                    </span>
                    {progress.level3Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level3Score} stig
                      </span>
                    )}
                    {!progress.level2Completed && (
                      <span className="text-xs text-warm-500">(Ljúktu stigi 2 fyrst)</span>
                    )}
                  </div>
                  <div
                    className={`text-sm mt-1 ${progress.level2Completed ? 'text-purple-600' : 'text-warm-500'}`}
                  >
                    Frumskref og hraðaákvarðandi skref
                  </div>
                  <div className="text-xs text-warm-600 mt-2">
                    Greindu hvarfgangshætti og finndu millistig.
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
                <strong>Meðalhraði:</strong> Rate = -Δ[hvarfefni]/Δt = +Δ[afurð]/Δt
              </p>
              <p>
                <strong>Hraðalögmál:</strong> Rate = k[A]<sup>m</sup>[B]<sup>n</sup>
              </p>
              <p>
                <strong>Röð hvörfunar:</strong> m + n = heildarröð
              </p>
              <p>
                <strong>Arrhenius:</strong> k = Ae
                <sup>
                  -E<sub>a</sub>/RT
                </sup>
              </p>
            </div>
          </div>

          {/* Credits */}
          <div className="mt-6 text-center text-xs text-warm-500">
            Kafli 14 — Chemistry: The Central Science (Brown et al.)
          </div>
        </div>

        {/* Achievements Panel Modal */}
        {showAchievements && (
          <AchievementsPanel
            achievements={achievements}
            allAchievements={allAchievements}
            onClose={() => setShowAchievements(false)}
            onReset={resetAchievements}
          />
        )}

        {/* Achievement Notifications */}
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
        <ParticleCelebration {...celebrationProps} />
      </div>
    </AnimatedBackground>
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
