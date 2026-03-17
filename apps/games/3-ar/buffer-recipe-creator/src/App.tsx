import { useState, useEffect } from 'react';

import { Header, LanguageSwitcher, ErrorBoundary, FadePresence } from '@shared/components';
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

import Level1 from './components/Level1';
import Level2 from './components/Level2';
import Level3 from './components/Level3';
import { gameTranslations } from './i18n';
import './styles.css';

type ActiveLevel = 'menu' | 'level1' | 'level2' | 'level3';

interface Progress {
  level1Completed: boolean;
  level1Score: number;
  level2Completed: boolean;
  level2Score: number;
  level3Completed: boolean;
  level3Score: number;
  totalGamesPlayed: number;
}

const STORAGE_KEY = 'buffer-recipe-creator-progress';

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

/**
 * Buffer Builder - Conceptual Chemistry Game
 *
 * Level 1: Visual molecule manipulation (NO calculations)
 * Level 2: Henderson-Hasselbalch calculations (3-step process)
 * Level 3: Design constraints (coming soon)
 */
function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [showAchievements, setShowAchievements] = useState(false);

  // Achievement system
  const {
    achievements,
    allAchievements,
    notifications,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    dismissNotification,
    resetAll: resetAchievements,
  } = useAchievements({ gameId: 'buffer-recipe-creator' });

  const { triggerCorrect, triggerLevelComplete, celebrationProps } = useParticleCelebration('3-ar');
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

  // Handle level 1 completion
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

  // Handle level 2 completion
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

  // Handle level 3 completion
  const handleLevel3Complete = (score: number, maxScore: number, hintsUsed: number) => {
    setProgress((prev) => ({
      ...prev,
      level3Completed: true,
      level3Score: Math.max(prev.level3Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1,
    }));
    trackLevelComplete(3, score, maxScore, { hintsUsed });
    playLevelComplete();
    triggerLevelComplete();
    setActiveLevel('menu');
  };

  const resetProgress = () => {
    if (!window.confirm('Ertu viss um að þú viljir endurstilla alla framvindu?')) return;
    const newProgress = getDefaultProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Main Menu computed values
  const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;
  const levelsCompleted = [
    progress.level1Completed,
    progress.level2Completed,
    progress.level3Completed,
  ].filter(Boolean).length;

  return (
    <>
      <FadePresence show={activeLevel === 'level1'} exitDuration={200}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          {/* Back button */}
          <div className="fixed top-4 left-4 z-40">
            <button
              onClick={() => setActiveLevel('menu')}
              className="bg-white px-4 py-2 rounded-lg shadow-md text-warm-600 hover:text-warm-800 flex items-center gap-2"
            >
              ← Til baka
            </button>
          </div>

          {/* Achievements button */}
          <div className="fixed top-4 right-4 z-40">
            <AchievementsButton
              achievements={achievements}
              onClick={() => setShowAchievements(true)}
            />
          </div>

          <Level1
            onCorrectAnswer={() => handleCorrectAnswer()}
            onIncorrectAnswer={() => handleIncorrectAnswer()}
            onLevelComplete={handleLevel1Complete}
          />
        </div>
      </FadePresence>

      <FadePresence show={activeLevel === 'level2'} exitDuration={200}>
        <Level2
          onComplete={handleLevel2Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => handleCorrectAnswer()}
          onIncorrectAnswer={() => handleIncorrectAnswer()}
        />
      </FadePresence>

      <FadePresence show={activeLevel === 'level3'} exitDuration={200}>
        <Level3
          onComplete={handleLevel3Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => handleCorrectAnswer()}
          onIncorrectAnswer={() => handleIncorrectAnswer()}
        />
      </FadePresence>

      <FadePresence show={activeLevel === 'menu'} exitDuration={200}>
        <AnimatedBackground yearTheme="3-ar" variant="menu">
          <Header
            variant="game"
            backHref="/efnafraedi/3-ar/"
            gameTitle="Stuðpúðasmíði"
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
              <p className="text-warm-600 mb-4">
                Lærðu að búa til stuðpúða með Henderson-Hasselbalch jöfnunni
              </p>

              {/* Pedagogical explanation */}
              <div className="p-6 rounded-xl mb-8 bg-kvenno-orange/10">
                <h2 className="font-bold mb-3 text-kvenno-orange">Hvað er stuðpúði?</h2>
                <p className="text-warm-800 text-sm mb-4">
                  <strong>Stuðpúði</strong> er lausn sem getur viðhaldið stöðugu pH þegar litlu
                  magni af sýru eða basa er bætt við. Hann samanstendur af veikri sýru og samoka
                  basa hennar (eða veikum basa og samoka sýru hans).
                </p>
                <div className="bg-white p-3 rounded-lg border border-kvenno-orange">
                  <p className="text-sm font-mono text-center text-kvenno-orange">
                    pH = pK<sub>a</sub> + log([A⁻]/[HA])
                  </p>
                  <p className="text-xs text-warm-600 text-center mt-1">
                    Henderson-Hasselbalch jafnan
                  </p>
                </div>
              </div>

              {/* Level selection */}
              <div className="space-y-4">
                {/* Level 1 */}
                <button
                  onClick={() => setActiveLevel('level1')}
                  className="game-card w-full p-6 rounded-xl border-4 transition-all text-left hover:shadow-lg border-kvenno-orange bg-kvenno-orange/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🔬</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-kvenno-orange">
                          Stig 1: Hugmyndafræði
                        </span>
                        {progress.level1Completed && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            ✓ {progress.level1Score} stig
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1 text-kvenno-orange-600">
                        Sjónræn sameindameðferð - engar tölur!
                      </div>
                      <div className="text-xs text-warm-600 mt-2">
                        Skildu hvernig hlutfall sýru/basa hefur áhrif á pH. Lærðu að pH = pKa þegar
                        jafnt er af hvoru tveggja.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 2 */}
                <button
                  onClick={() => progress.level1Completed && setActiveLevel('level2')}
                  className={`game-card w-full p-6 rounded-xl border-4 transition-all text-left ${
                    progress.level1Completed
                      ? 'hover:shadow-lg cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  style={{
                    borderColor: progress.level1Completed ? '#22c55e' : '#d1d5db',
                    backgroundColor: progress.level1Completed
                      ? 'rgba(34, 197, 94, 0.05)'
                      : '#f9fafb',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📐</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xl font-bold ${
                            progress.level1Completed ? 'text-green-700' : 'text-warm-500'
                          }`}
                        >
                          Stig 2: Útreikningar
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
                        className={`text-sm mt-1 ${
                          progress.level1Completed ? 'text-green-600' : 'text-warm-500'
                        }`}
                      >
                        Henderson-Hasselbalch útreikningar
                      </div>
                      <div className="text-xs text-warm-600 mt-2">
                        Reiknaðu hlutfall [Basi]/[Sýra] og massa hvers efnis. 3-skrefa ferli: stefna
                        → hlutfall → massi.
                      </div>
                    </div>
                  </div>
                </button>

                {/* Level 3 */}
                <button
                  onClick={() => progress.level2Completed && setActiveLevel('level3')}
                  className={`game-card w-full p-6 rounded-xl border-4 transition-all text-left ${
                    progress.level2Completed
                      ? 'hover:shadow-lg cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  style={{
                    borderColor: progress.level2Completed ? '#10b981' : '#d1d5db',
                    backgroundColor: progress.level2Completed
                      ? 'rgba(16, 185, 129, 0.05)'
                      : '#f9fafb',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🏭</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xl font-bold ${
                            progress.level2Completed ? 'text-emerald-700' : 'text-warm-500'
                          }`}
                        >
                          Stig 3: Hönnun
                        </span>
                        {progress.level3Completed && (
                          <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                            ✓ {progress.level3Score} stig
                          </span>
                        )}
                        {!progress.level2Completed && (
                          <span className="text-xs text-warm-500">(Ljúktu stigi 2 fyrst)</span>
                        )}
                      </div>
                      <div
                        className={`text-sm mt-1 ${
                          progress.level2Completed ? 'text-emerald-600' : 'text-warm-500'
                        }`}
                      >
                        Birgðalausnir og rúmmálsútreikningar
                      </div>
                      <div className="text-xs text-warm-600 mt-2">
                        Notaðu tilbúnar birgðalausnir til að búa til stuðpúða. Reiknaðu rúmmál til
                        að taka úr hverri birgðalausn.
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
                    <div className="rounded-lg p-3 bg-kvenno-orange/10">
                      <div className="text-2xl font-bold text-kvenno-orange">
                        {levelsCompleted}/3
                      </div>
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
                    <strong>Henderson-Hasselbalch:</strong> pH = pK<sub>a</sub> + log([A⁻]/[HA])
                  </p>
                  <p>
                    <strong>Hlutfall:</strong> [A⁻]/[HA] = 10
                    <sup>
                      (pH - pK<sub>a</sub>)
                    </sup>
                  </p>
                  <p>
                    <strong>Púffursvæði:</strong> pH = pK<sub>a</sub> ± 1
                  </p>
                  <p>
                    <strong>Massi:</strong> m = n × M (mól × mólmassi)
                  </p>
                </div>
              </div>

              {/* Credits */}
              <div className="mt-6 text-center text-xs text-warm-500">
                Kafli 16 — Chemistry: The Central Science (Brown et al.)
              </div>
            </div>
          </div>
        </AnimatedBackground>
      </FadePresence>

      {/* Achievements Panel Modal */}
      {showAchievements && (
        <AchievementsPanel
          achievements={achievements}
          allAchievements={allAchievements}
          onClose={() => setShowAchievements(false)}
          onReset={resetAchievements}
        />
      )}

      <AchievementNotificationsContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <ParticleCelebration {...celebrationProps} />
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
