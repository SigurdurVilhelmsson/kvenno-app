import { useState } from 'react';

import { Header, LanguageSwitcher } from '@shared/components';
import { useGameI18n } from '@shared/hooks';

import { periodicPuzzles } from '../data/periodic-configs';
import { gameTranslations } from '../i18n';

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level3({ onComplete, onBack }: Level3Props) {
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const puzzle = periodicPuzzles[currentIndex];
  const isLast = currentIndex >= periodicPuzzles.length - 1;
  const isCorrect = selectedOption === puzzle.fullShorthand;

  const handleSubmit = () => {
    if (submitted || !selectedOption) return;
    setSubmitted(true);
    if (selectedOption === puzzle.fullShorthand) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(score);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
    setSubmitted(false);
  };

  // --- Teaching intro ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <Header
          variant="game"
          backHref="/efnafraedi/2-ar/"
          gameTitle="Eðalgasstytting — Kennsla"
          authSlot={
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
          }
        />
        <div className="max-w-lg mx-auto p-4 md:p-8">
          <button onClick={onBack} className="text-warm-600 hover:text-warm-800 mb-4">
            ← Til baka
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-slide-in">
            <h2 className="text-xl font-bold text-warm-800">Eðalgasstytting</h2>
            <p className="text-warm-700">
              Í stað þess að skrifa alla rafeindauppsetninguna frá 1s² getum við notað
              <strong> eðalgasstyttingu</strong> — byrjum á nánasta eðalgasi og skrifum aðeins
              gildisrafeindir.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Dæmi: Járn (Fe, Z=26)</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>Full uppsetning: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶</p>
                <p>Nánasta eðalgas: Argon (Ar, Z=18) = 1s² 2s² 2p⁶ 3s² 3p⁶</p>
                <p>
                  Stytting: <strong className="text-lg">[Ar] 4s² 3d⁶</strong>
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-lg">
              <h3 className="font-bold text-amber-800 mb-2">⚠️ Undantekningar</h3>
              <p className="text-sm text-amber-700 mb-2">
                Sumir d-blokkarmálmar hafa óvænta uppsetningu vegna stöðugleika hálf- eða
                fullfyltrar d-skeljar:
              </p>
              <div className="text-sm text-amber-700 font-mono space-y-1">
                <p>
                  <strong>Cr (Z=24):</strong> [Ar] 4s¹ 3d⁵ (EKKI 4s² 3d⁴) — hálffyllt d
                </p>
                <p>
                  <strong>Cu (Z=29):</strong> [Ar] 4s¹ 3d¹⁰ (EKKI 4s² 3d⁹) — full d
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Byrja æfingar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle="Lotukerfi og rafeindir"
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
            Frumefni {currentIndex + 1} / {periodicPuzzles.length} &bull; Stig: {score}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-slide-in">
          {/* Element display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-4">
              <div
                className={`px-6 py-4 rounded-xl ${puzzle.isException ? 'bg-amber-100' : 'bg-teal-100'}`}
              >
                <div
                  className={`text-4xl font-bold ${puzzle.isException ? 'text-amber-800' : 'text-teal-800'}`}
                >
                  {puzzle.element}
                </div>
                <div
                  className={`text-sm ${puzzle.isException ? 'text-amber-600' : 'text-teal-600'}`}
                >
                  Z = {puzzle.atomicNumber}
                </div>
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-warm-800">
                  {language === 'is' ? puzzle.elementName_is : puzzle.elementName_en}
                </div>
                {puzzle.isException && (
                  <div className="text-xs text-amber-600 font-medium">⚠️ Undantekning</div>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-warm-800 mb-4 text-center">
            Hvaða eðalgasstytting er rétt?
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {puzzle.options.map((option) => {
              let className = 'mc-option';
              if (submitted) {
                if (option === puzzle.fullShorthand) className += ' correct';
                else if (option === selectedOption) className += ' incorrect';
              } else if (option === selectedOption) {
                className += ' border-teal-500 bg-teal-50';
              }

              return (
                <button
                  key={option}
                  onClick={() => !submitted && setSelectedOption(option)}
                  className={className}
                  disabled={submitted}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Submit */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="game-btn w-full py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 disabled:bg-warm-300 disabled:cursor-not-allowed transition-colors"
            >
              Athuga svar
            </button>
          ) : (
            <>
              <div
                className={`p-4 rounded-xl mb-2 ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}
              >
                <div className="text-lg font-bold mb-2">
                  {isCorrect ? '✅ Rétt!' : '❌ Ekki rétt'}
                </div>
                {puzzle.isException && (
                  <div className="bg-amber-50 p-3 rounded-lg mb-2 text-sm text-amber-800">
                    ⚠️{' '}
                    {language === 'is'
                      ? puzzle.exceptionExplanation_is
                      : puzzle.exceptionExplanation_en}
                  </div>
                )}
                <p className="text-sm font-mono text-warm-800 mb-1">
                  Rétt svar: {puzzle.fullShorthand}
                </p>
                <p className="text-xs text-warm-600">
                  Eðalgasgrunnur: {puzzle.nobleGasCore}, Gildisrafeindir: {puzzle.valenceConfig}
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
