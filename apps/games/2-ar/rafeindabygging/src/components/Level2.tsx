import { useState } from 'react';

import { Header, LanguageSwitcher } from '@shared/components';
import { useGameI18n } from '@shared/hooks';

import { configPuzzles, normalizeConfig } from '../data/electron-configs';
import { gameTranslations } from '../i18n';

interface Level2Props {
  onComplete: (score: number, maxScore: number) => void;
  onBack: () => void;
}

export function Level2({ onComplete, onBack }: Level2Props) {
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const puzzle = configPuzzles[currentIndex];
  const isLast = currentIndex >= configPuzzles.length - 1;

  const handleSubmit = () => {
    if (submitted || !userInput.trim()) return;

    const userNorm = normalizeConfig(userInput);
    const correctNorm = normalizeConfig(puzzle.correctConfig);
    const correct = userNorm === correctNorm;

    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(score, configPuzzles.length);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setUserInput('');
    setSubmitted(false);
    setIsCorrect(false);
  };

  // Orbital box diagram
  const renderOrbitalDiagram = () => {
    return (
      <div className="flex flex-wrap gap-4 justify-center items-end">
        {puzzle.orbitalOrder.map((orbital, idx) => {
          const count = puzzle.electronCounts[idx];
          const maxE = puzzle.maxElectrons[idx];
          const numBoxes = maxE <= 2 ? 1 : maxE / 2;

          return (
            <div key={orbital} className="text-center">
              <div className="flex gap-0.5 justify-center mb-1">
                {Array.from({ length: numBoxes }, (_, boxIdx) => {
                  const electronsInBox = Math.min(2, Math.max(0, count - boxIdx * 2));
                  const boxClass =
                    electronsInBox === 2
                      ? 'orbital-box filled'
                      : electronsInBox === 1
                        ? 'orbital-box half-filled'
                        : 'orbital-box empty';

                  return (
                    <div key={boxIdx} className={boxClass}>
                      {electronsInBox >= 1 && <span className="text-blue-600 text-sm">↑</span>}
                      {electronsInBox >= 2 && <span className="text-red-600 text-sm">↓</span>}
                      {electronsInBox === 0 && <span className="text-gray-300 text-sm">_</span>}
                    </div>
                  );
                })}
              </div>
              <div className="text-xs font-mono text-warm-600">{orbital}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle="Rafeindasmíð"
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="text-warm-600 hover:text-warm-800">
            ← Til baka
          </button>
          <div className="text-sm text-warm-600">
            Frumefni {currentIndex + 1} / {configPuzzles.length} &bull; Stig: {score}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-slide-in">
          {/* Element display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-4">
              <div className="bg-teal-100 px-6 py-4 rounded-xl">
                <div className="text-4xl font-bold text-teal-800">{puzzle.element}</div>
                <div className="text-sm text-teal-600">Z = {puzzle.atomicNumber}</div>
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-warm-800">
                  {language === 'is' ? puzzle.elementName_is : puzzle.elementName_en}
                </div>
                <div className="text-sm text-warm-600">{puzzle.atomicNumber} rafeindir</div>
              </div>
            </div>
          </div>

          {/* Aufbau reminder */}
          <div className="bg-blue-50 p-3 rounded-lg mb-6 text-sm text-blue-800">
            <strong>Aufbau röð:</strong> 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-warm-700 mb-2">
              Sláðu inn rafeindauppsetningu (t.d. 1s2 2s2 2p4):
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="1s2 2s2 2p4..."
              className="config-input"
              disabled={submitted}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-xs text-warm-500 mt-1">
              Notuðu tölustafi (1s2) eða yfirskrift (1s²) — bæði virka.
            </p>
          </div>

          {/* Submit */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="game-btn w-full py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 disabled:bg-warm-300 disabled:cursor-not-allowed transition-colors"
            >
              Athuga svar
            </button>
          ) : (
            <>
              {/* Orbital diagram */}
              <div className="bg-warm-50 p-4 rounded-xl mb-4">
                <h3 className="text-sm font-semibold text-warm-700 mb-3 text-center">
                  Svigrúmamynd:
                </h3>
                {renderOrbitalDiagram()}
              </div>

              <div
                className={`p-4 rounded-xl mb-2 ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}
              >
                <div className="text-lg font-bold mb-2">
                  {isCorrect ? '✅ Rétt!' : '❌ Ekki rétt'}
                </div>
                {!isCorrect && (
                  <p className="text-sm font-mono text-warm-800 mb-2">
                    Rétt svar: {puzzle.correctConfig}
                  </p>
                )}
                <p className="text-sm text-warm-700">
                  {language === 'is' ? puzzle.explanation_is : puzzle.explanation_en}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="game-btn w-full mt-4 py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 transition-colors"
              >
                {isLast ? 'Ljúka stigi' : 'Næsta frumefni →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
