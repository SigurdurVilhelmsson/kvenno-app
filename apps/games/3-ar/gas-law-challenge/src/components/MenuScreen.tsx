import { Header, LanguageSwitcher } from '@shared/components';
import type { Language } from '@shared/hooks';

import { questions, type Level } from '../data';
import { GameMode, GameStats } from '../types';

interface MenuScreenProps {
  stats: GameStats;
  selectedLevel: Level;
  setSelectedLevel: (level: Level) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  resetStats: () => void;
  onStart: (mode: GameMode) => void;
}

export function MenuScreen({
  stats,
  selectedLevel,
  setSelectedLevel,
  language,
  setLanguage,
  resetStats,
  onStart,
}: MenuScreenProps) {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Header
          variant="game"
          backHref="/efnafraedi/3-ar/"
          gameTitle="Gas Law Challenge"
          authSlot={
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
          }
        />
        <div className="min-h-screen">
          <main className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <p className="text-lg text-warm-600 mb-2">
                  Læðu að leysa verkefni um tilvalin lofttegundalögmál: PV = nRT
                </p>
                <p className="text-sm text-warm-500">
                  {questions.length} spurningar í boði • Auðvelt, Miðlungs, Erfitt
                </p>

                {stats.questionsAnswered > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-center gap-4 text-sm flex-wrap">
                      <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                        <span className="font-bold text-yellow-800">🏆 Stig: {stats.score}</span>
                      </div>
                      <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        <span className="font-bold text-green-800">
                          ✓ Rétt: {stats.correctAnswers}/{stats.questionsAnswered}
                        </span>
                      </div>
                      <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        <span className="font-bold text-blue-800">
                          🔥 Besta röð: {stats.bestStreak}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={resetStats}
                      className="mt-3 text-sm text-warm-500 hover:text-red-500 transition-colors"
                    >
                      Endurstilla framvindu
                    </button>
                  </div>
                )}
              </div>

              {/* Conceptual intro — WHY does PV=nRT? */}
              <div className="bg-purple-50 p-6 rounded-xl mb-8 border border-purple-200">
                <h2 className="font-bold text-purple-800 mb-3">Af hverju PV = nRT?</h2>
                <p className="text-sm text-purple-700 mb-3">
                  Gasagnir (sameindir) eru á stöðugri hreyfingu. Þegar þær rekast á veggi ílátsins
                  skapa þær <strong>þrýsting</strong>. Þetta tengir saman fjórar stærðir:
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="bg-white p-2 rounded">
                    <strong className="text-blue-700">P (þrýstingur)</strong> — fleiri árekstur =
                    meiri þrýstingur
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong className="text-green-700">V (rúmmál)</strong> — minna ílát = fleiri
                    árekstur
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong className="text-red-700">T (hitastig)</strong> — hærra T = hraðari agnir
                    = harðari árekstur
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong className="text-amber-700">n (mólfjöldi)</strong> — fleiri agnir =
                    fleiri árekstur
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <p className="font-mono text-purple-800 text-lg">PV = nRT</p>
                  <p className="text-xs text-purple-600 mt-1">
                    R = 0,08206 L·atm/(mol·K) — tengir einingarnar saman
                  </p>
                </div>
                <p className="text-xs text-purple-600 mt-3">
                  <strong>Mikilvægt:</strong> T verður alltaf að vera í Kelvin (K = °C + 273). Þetta
                  lögmál gildir best fyrir gas við lágan þrýsting og hátt hitastig (tilvalið gas).
                </p>
              </div>

              {/* Level selector — iter 5 P3 restructure (was: random across 6 laws). */}
              <div className="mb-6">
                <h2 className="font-bold text-warm-800 mb-3">Veldu stig:</h2>
                <div className="grid md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedLevel(1)}
                    aria-pressed={selectedLevel === 1}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      selectedLevel === 1
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-warm-300 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="font-bold text-blue-800">
                      Stig 1 — Tilvalin lofttegundalögmál
                    </div>
                    <div className="text-xs text-warm-600 mt-1 font-mono">PV = nRT</div>
                    <div className="text-xs text-warm-500 mt-2">
                      Lærðu miðlögmálið og allar fjórar breyturnar.
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedLevel(2)}
                    aria-pressed={selectedLevel === 2}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      selectedLevel === 2
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-warm-300 bg-white hover:border-green-300'
                    }`}
                  >
                    <div className="font-bold text-green-800">Stig 2 — Sérstök tilvik</div>
                    <div className="text-xs text-warm-600 mt-1 font-mono">
                      Boyle / Charles / Gay-Lussac
                    </div>
                    <div className="text-xs text-warm-500 mt-2">
                      Sjáðu hvað gerist þegar ein breyta er fastlagt.
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedLevel(3)}
                    aria-pressed={selectedLevel === 3}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      selectedLevel === 3
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-warm-300 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="font-bold text-purple-800">Stig 3 — Samanburður</div>
                    <div className="text-xs text-warm-600 mt-1 font-mono">Sameinað + Avogadro</div>
                    <div className="text-xs text-warm-500 mt-2">Beittu mörgum lögmálum saman.</div>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Practice Mode */}
                <div className="game-card bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <h2 className="text-2xl font-bold mb-3 text-blue-900">Æfingahamur</h2>
                  <ul className="text-warm-700 mb-4 space-y-2 text-sm">
                    <li>✓ Engin tímatakmörk</li>
                    <li>✓ Ótakmarkaðar vísbendingar</li>
                    <li>✓ Sjá lausnir skref fyrir skref</li>
                    <li>✓ Leggja áherslu á nám</li>
                  </ul>
                  <button
                    onClick={() => onStart('practice')}
                    className="w-full py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: '#3b82f6' }}
                  >
                    Byrja að Æfa (Stig {selectedLevel})
                  </button>
                </div>

                {/* Challenge Mode */}
                <div className="game-card bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                  <h2 className="text-2xl font-bold mb-3 text-orange-900">Keppnishamur</h2>
                  <ul className="text-warm-700 mb-4 space-y-2 text-sm">
                    <li>⏱️ 90 sekúndur á spurningu</li>
                    <li>🎯 Tíma bónus fyrir hraða</li>
                    <li>💡 Vísbendingar í boði</li>
                    <li>📊 Stigatafla og röð</li>
                  </ul>
                  <button
                    onClick={() => onStart('challenge')}
                    className="w-full py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: '#f36b22' }}
                  >
                    Byrja Keppni (Stig {selectedLevel})
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-warm-50 p-4 rounded-lg border border-warm-200">
                <h3 className="font-bold text-warm-800 mb-2">Leiðbeiningar:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-warm-700">
                  <div>
                    <p className="font-semibold">Tilvalin lofttegundalögmál:</p>
                    <p className="font-mono bg-white px-2 py-1 rounded mt-1">PV = nRT</p>
                    <p className="text-xs mt-1">þar sem R = 0.08206 L·atm/(mol·K)</p>
                  </div>
                  <div>
                    <p className="font-semibold">Lyklaborð:</p>
                    <p className="text-xs">
                      • <kbd className="px-1 bg-warm-200 rounded">Enter</kbd> Athuga svar
                    </p>
                    <p className="text-xs">
                      • <kbd className="px-1 bg-warm-200 rounded">H</kbd> Vísbending
                    </p>
                    <p className="text-xs">
                      • <kbd className="px-1 bg-warm-200 rounded">S</kbd> Sýna lausn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <div className="max-w-5xl mx-auto px-4 mb-6">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Af hverju gaslögmálin?</h3>
              <p className="text-sm text-amber-700">
                Gaslögmálin útskýra veður, köfunarhættur, hvernig bílvélar virka, og af hverju
                flugvélar eru þrýstijafnaðar. Þau tengja saman þrýsting, hitastig og rúmmál.
              </p>
            </div>
            <div className="mt-3 text-center text-xs text-warm-500">
              <strong>Námsleiðin:</strong> <u>Gaslögmál</u> → Jafnvægi → Varmafræði → pH Títrun →
              Púfferar
            </div>
          </div>

          <footer className="text-center text-sm text-warm-500 py-4">
            <p>© 2024 Kvennaskólinn - Efnafræðileikir</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
