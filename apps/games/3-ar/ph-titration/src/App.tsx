import { useState, useEffect } from 'react';
import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { useAchievements } from '@shared/hooks/useAchievements';
import { useGameI18n } from '@shared/hooks';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { LanguageSwitcher } from '@shared/components';
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

const STORAGE_KEY = 'ph-titration-progress';

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
    totalGamesPlayed: 0
  };
}

function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function App() {
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('menu');
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [showAchievements, setShowAchievements] = useState(false);

  // Achievement system
  const {
    achievements,
    allAchievements,
    notifications,
    trackLevelComplete,
    trackGameComplete,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    dismissNotification,
    resetAll: resetAchievements,
  } = useAchievements({ gameId: 'ph-titration' });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleLevel1Complete = (score: number, maxScore: number = 600, hintsUsed: number = 0) => {
    setProgress(prev => ({
      ...prev,
      level1Completed: true,
      level1Score: Math.max(prev.level1Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));
    trackLevelComplete(1, score, maxScore, { hintsUsed });
    setActiveLevel('menu');
  };

  const handleLevel2Complete = (score: number, maxScore: number = 600, hintsUsed: number = 0) => {
    setProgress(prev => ({
      ...prev,
      level2Completed: true,
      level2Score: Math.max(prev.level2Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));
    trackLevelComplete(2, score, maxScore, { hintsUsed });
    setActiveLevel('menu');
  };

  const handleLevel3Complete = (score: number, maxScore: number = 160, hintsUsed: number = 0) => {
    setProgress(prev => ({
      ...prev,
      level3Completed: true,
      level3Score: Math.max(prev.level3Score, score),
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));
    trackLevelComplete(3, score, maxScore, { hintsUsed });
    trackGameComplete();
    setActiveLevel('complete');
  };

  const resetProgress = () => {
    const newProgress = getDefaultProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Render active level
  if (activeLevel === 'level1') {
    return (
      <>
        <Level1
          onComplete={handleLevel1Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => trackCorrectAnswer()}
          onIncorrectAnswer={() => trackIncorrectAnswer()}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  if (activeLevel === 'level2') {
    return (
      <>
        <Level2
          onComplete={handleLevel2Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => trackCorrectAnswer()}
          onIncorrectAnswer={() => trackIncorrectAnswer()}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  if (activeLevel === 'level3') {
    return (
      <>
        <Level3
          onComplete={handleLevel3Complete}
          onBack={() => setActiveLevel('menu')}
          onCorrectAnswer={() => trackCorrectAnswer()}
          onIncorrectAnswer={() => trackIncorrectAnswer()}
        />
        <AchievementNotificationsContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </>
    );
  }

  // Complete screen
  if (activeLevel === 'complete') {
    const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-purple-600">
            Til hamingju!
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
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
              <li>✓ <strong>Títrunarkúrfur:</strong> Munur á sterkum og veikum sýru-basa kúrfum</li>
              <li>✓ <strong>Jafngildispunktur:</strong> Hvar öll sýra/basi hefur hvarfast</li>
              <li>✓ <strong>Vísar:</strong> Hvernig velja réttan vísi fyrir hverja títrun</li>
              <li>✓ <strong>Henderson-Hasselbalch:</strong> pH = pKₐ + log([A⁻]/[HA])</li>
              <li>✓ <strong>Fjölprótón sýrur:</strong> Margar jafngildispunktar fyrir H₂SO₃, H₃PO₄</li>
            </ul>
          </div>

          <button
            onClick={() => setActiveLevel('menu')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // Main menu
  const totalScore = progress.level1Score + progress.level2Score + progress.level3Score;
  const levelsCompleted = [progress.level1Completed, progress.level2Completed, progress.level3Completed].filter(Boolean).length;

  // Year 3: Purple/Indigo theme
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Header with achievements button */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-purple-600">
              🧪 pH Títrun
            </h1>
            <p className="text-gray-600">
              Lærðu um sýru-basa títranir, títrunarkúrfur og vísa
            </p>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
            <AchievementsButton
              achievements={achievements}
              onClick={() => setShowAchievements(true)}
            />
          </div>
        </div>

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
            className="w-full p-6 rounded-xl border-4 border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all text-left"
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
                <div className="text-sm text-blue-600 mt-1">
                  Títrunarkúrfur og vísar
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Skildu hvernig títrunarkúrfur líta út fyrir mismunandi sýru-basa samsetningar.
                  Lærðu um vísa og litabreytingar.
                </div>
              </div>
            </div>
          </button>

          {/* Level 2 */}
          <button
            onClick={() => progress.level1Completed && setActiveLevel('level2')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level1Completed
                ? 'border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧪</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level1Completed ? 'text-green-800' : 'text-gray-600'}`}>
                    Stig 2: Framkvæmd
                  </span>
                  {progress.level2Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {progress.level2Score} stig
                    </span>
                  )}
                  {!progress.level1Completed && (
                    <span className="text-xs text-gray-500">(Ljúktu stigi 1 fyrst)</span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${progress.level1Completed ? 'text-green-600' : 'text-gray-500'}`}>
                  Gagnvirk títrun í rannsóknarstofu
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Framkvæmdu títrun, veldu réttan vísi og finndu jafngildispunkt.
                  Byggðu upp færni í rannsóknarstofuvinnu.
                </div>
              </div>
            </div>
          </button>

          {/* Level 3 */}
          <button
            onClick={() => progress.level2Completed && setActiveLevel('level3')}
            className={`w-full p-6 rounded-xl border-4 transition-all text-left ${
              progress.level2Completed
                ? 'border-purple-400 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">📐</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${progress.level2Completed ? 'text-purple-800' : 'text-gray-600'}`}>
                    Stig 3: Útreikningar
                  </span>
                  {progress.level3Completed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {progress.level3Score} stig
                    </span>
                  )}
                  {!progress.level2Completed && (
                    <span className="text-xs text-gray-500">(Ljúktu stigi 2 fyrst)</span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${progress.level2Completed ? 'text-purple-600' : 'text-gray-500'}`}>
                  Styrkreikningar og fjölprótón sýrur
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Reiknaðu styrk, pH og rúmmál. Leystu fjölprótón sýruverkefni
                  og notaðu Henderson-Hasselbalch jöfnuna.
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Progress Summary */}
        {progress.totalGamesPlayed > 0 && (
          <div className="mt-8 bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Framvinda</h3>
              <button
                onClick={resetProgress}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Endurstilla
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{levelsCompleted}/3</div>
                <div className="text-xs text-gray-600">Stig lokið</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{totalScore}</div>
                <div className="text-xs text-gray-600">Heildar stig</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">{progress.totalGamesPlayed}</div>
                <div className="text-xs text-gray-600">Leikir spilaðir</div>
              </div>
            </div>
          </div>
        )}

        {/* Formula reference */}
        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2">📐 Lykilformúlur</h3>
          <div className="font-mono text-sm space-y-2 text-gray-600">
            <p><strong>Títrunarjafna:</strong> V<sub>sýra</sub> × M<sub>sýra</sub> = V<sub>basa</sub> × M<sub>basa</sub></p>
            <p><strong>Henderson-Hasselbalch:</strong> pH = pK<sub>a</sub> + log([A⁻]/[HA])</p>
            <p><strong>Púffur svæði:</strong> pH = pK<sub>a</sub> ± 1</p>
            <p><strong>Fjölprótón:</strong> Mörg jafngildispunkt fyrir H₂SO₃, H₃PO₄</p>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Kafli 17 — Chemistry: The Central Science (Brown et al.)
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
    </div>
  );
}

export default App;
