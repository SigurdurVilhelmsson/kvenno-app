import { useState, useEffect } from 'react';

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

const STORAGE_KEY = 'organic-nomenclature-progress';

function loadProgress(): Progress {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultProgress();
    }
  }
  return getDefaultProgress();
}

function getDefaultProgress(): Progress {
  return {
    level1Completed: false,
    level1Score: 0,
    level2Completed: false,
    level2Score: 0,
    level3Completed: false,
    level3Score: 0,
    totalGamesPlayed: 0,
  };
}

function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [showAchievements, setShowAchievements] = useState(false);

  const {
    achievements,
    allAchievements,
    notifications,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    trackGameComplete,
    dismissNotification,
    resetAll,
  } = useAchievements({ gameId: 'organic-nomenclature' });

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

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleLevel1Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress((prev) => ({
      ...prev,
      level1Completed: true,
      level1Score: Math.max(prev.level1Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));
    trackLevelComplete(1, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    setActiveLevel('menu');
  };

  const handleLevel2Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress((prev) => ({
      ...prev,
      level2Completed: true,
      level2Score: Math.max(prev.level2Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));
    trackLevelComplete(2, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    setActiveLevel('menu');
  };

  const handleLevel3Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress((prev) => ({
      ...prev,
      level3Completed: true,
      level3Score: Math.max(prev.level3Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));
    trackLevelComplete(3, score, maxScore, { hintsUsed });
    trackGameComplete();
    playLevelComplete();
    triggerLevelComplete();
    setActiveLevel('complete');
  };

  const resetProgress = () => {
    if (!window.confirm('Ertu viss um að þú viljir endurstilla alla framvindu?')) return;
    const newProgress = getDefaultProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  };

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

  if (activeLevel === 'complete') {
    const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-emerald-600">
            Til hamingju!
          </h1>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎓</div>
            <div className="text-2xl font-bold text-warm-800">Þú hefur lokið öllum stigum!</div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-warm-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-warm-800">Stig 1: Grunnreglur</div>
                <div className="text-sm text-warm-600">Forskeytir og viðskeytir</div>
              </div>
              <div className="text-2xl font-bold text-warm-600">{progress.level1Score}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-green-800">Stig 2: Nefna sameindir</div>
                <div className="text-sm text-green-600">Alkanar, alkenar, alkynar</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{progress.level2Score}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-800">Stig 3: Hagnýtar sameindir</div>
                <div className="text-sm text-purple-600">Hóptengi og formúlur</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.level3Score}</div>
            </div>
            <div className="bg-emerald-100 p-4 rounded-xl flex justify-between items-center border-2 border-emerald-400">
              <div className="font-bold text-emerald-800 text-lg">Heildarstig</div>
              <div className="text-3xl font-bold text-emerald-600">{totalScore}</div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-xl mb-6">
            <h2 className="font-bold text-emerald-800 mb-3">Hvað lærðir þú?</h2>
            <ul className="space-y-2 text-emerald-900 text-sm">
              <li>
                ✓ <strong>Forskeytir:</strong> meth-, eth-, prop-, but-, pent-...
              </li>
              <li>
                ✓ <strong>Viðskeytir:</strong> -an (eintengi), -en (tvítengi), -yn (þrítengi)
              </li>
              <li>
                ✓ <strong>Staðsetningartölur:</strong> Númer til að tilgreina staðsetningu
              </li>
              <li>
                ✓ <strong>Hóptengi:</strong> -OH (alkóhól), -CHO (aldehýð), -COOH (karboxýlsýra)
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Til baka í valmynd
          </button>
        </div>
        <ParticleCelebration {...celebrationProps} />
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

  return (
    <AnimatedBackground yearTheme="2-ar" variant="menu" showSymbols>
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle="Lífræn Nafnagift"
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
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <p className="text-center text-warm-600 mb-8">
            Lærðu IUPAC nafnakerfið fyrir lífrænar sameindir
          </p>

          <div className="bg-emerald-50 p-6 rounded-xl mb-8">
            <h2 className="font-bold text-emerald-800 mb-3">Hvað er IUPAC nafnakerfið?</h2>
            <p className="text-emerald-900 text-sm mb-4">
              <strong>IUPAC</strong> (International Union of Pure and Applied Chemistry) setti
              reglur til að nefna sameindir á samræmdan hátt. Nafn lífræns efnis segir okkur um
              byggingu þess.
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="font-bold text-blue-600">Forskeyti</div>
                <div className="text-warm-600">Fjöldi kolefna</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="font-bold text-warm-800">Stofn</div>
                <div className="text-warm-600">Tegund tengja</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="font-bold text-green-600">Viðskeyti</div>
                <div className="text-warm-600">Hóptengi</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setActiveLevel('level1')}
              className="game-card w-full p-6 rounded-xl border-4 border-warm-400 bg-warm-50 hover:bg-warm-100 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">📚</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-warm-800">Stig 1: Grunnreglur</span>
                    {progress.level1Completed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ {progress.level1Score} stig
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-warm-600 mt-1">Lærðu forskeytir og viðskeytir</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => progress.level1Completed && setActiveLevel('level2')}
              className={`game-card w-full p-6 rounded-xl border-4 transition-all text-left ${
                progress.level1Completed
                  ? 'border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer'
                  : 'border-warm-200 bg-warm-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏷️</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl font-bold ${progress.level1Completed ? 'text-green-800' : 'text-warm-600'}`}
                    >
                      Stig 2: Nefna sameindir
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
                    Nefndu alkanar, alkenar og alkynar
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => progress.level2Completed && setActiveLevel('level3')}
              className={`game-card w-full p-6 rounded-xl border-4 transition-all text-left ${
                progress.level2Completed
                  ? 'border-purple-400 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                  : 'border-warm-200 bg-warm-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔬</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl font-bold ${progress.level2Completed ? 'text-purple-800' : 'text-warm-600'}`}
                    >
                      Stig 3: Hagnýtar sameindir
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
                    Hóptengi og flóknari sameindir
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
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-emerald-600">{levelsCompleted}/3</div>
                  <div className="text-xs text-warm-600">Stig lokið</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{totalScore}</div>
                  <div className="text-xs text-warm-600">Heildar stig</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.totalGamesPlayed}
                  </div>
                  <div className="text-xs text-warm-600">Leikir spilaðir</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-2">📋 Forskeytir (kolefnisfjöldi)</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm text-center">
              <div className="bg-white p-2 rounded border">
                <span className="font-bold">1</span> meth-
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="font-bold">2</span> eth-
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="font-bold">3</span> prop-
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="font-bold">4</span> but-
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="font-bold">5</span> pent-
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-warm-500">
            Sérsniðið námsefni — Lífræn efnafræði
          </div>
        </div>

        {showAchievements && (
          <AchievementsPanel
            achievements={achievements}
            allAchievements={allAchievements}
            onClose={() => setShowAchievements(false)}
            onReset={resetAll}
          />
        )}

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
