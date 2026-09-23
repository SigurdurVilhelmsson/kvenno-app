import { useEffect, useRef, useState } from 'react';

import { Header, LanguageSwitcher } from '@shared/components';
import { useGameI18n } from '@shared/hooks';

import { configPuzzles, normalizeConfig } from '../data/electron-configs';
import { gameTranslations } from '../i18n';
import { countElectrons, hundFilling, rafeindir } from '../utils/electrons';

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level2({ onComplete, onBack }: Level2Props) {
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const puzzle = configPuzzles[currentIndex];
  const isLast = currentIndex >= configPuzzles.length - 1;
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);

  // A new screen (the exercises, or the next element) starts at its top: the
  // browser keeps the old scroll offset, which on a phone hides the new element.
  // window.scrollTo rather than scrollIntoView, which would also send the
  // keyboard's Tab back to the header.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showIntro, currentIndex]);

  // The orbital diagram is drawn above the verdict, so from sodium on the
  // verdict lands entirely below the fold on a phone. `nearest` leaves the page
  // alone where it is already in view.
  useEffect(() => {
    if (submitted) feedbackRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [submitted]);

  const handleSubmit = () => {
    if (submitted || !userInput.trim()) return;

    const userNorm = normalizeConfig(userInput);
    const correctNorm = normalizeConfig(puzzle.correctConfig);
    const correct = userNorm === correctNorm;

    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) {
      setScore((s) => s + 1);
      setDiagnostic(null);
    } else {
      // Counted from what the student typed, not from userNorm: normalizing
      // strips the spaces, and `1s2 2s2` would then read as 22 electrons.
      const userCount = countElectrons(userInput);
      const correctCount = countElectrons(puzzle.correctConfig);
      if (userCount !== null && correctCount !== null && userCount !== correctCount) {
        const diff = correctCount - userCount;
        if (diff > 0) {
          setDiagnostic(
            `Þig vantar ${diff} ${rafeindir(diff)} (heild: ${userCount}, ætti að vera ${correctCount}).`
          );
        } else {
          setDiagnostic(
            `Þú ert með ${-diff} ${rafeindir(-diff)} aukalega (heild: ${userCount}, ætti að vera ${correctCount}).`
          );
        }
      } else {
        setDiagnostic(null);
      }
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(score);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setUserInput('');
    setSubmitted(false);
    setIsCorrect(false);
    setDiagnostic(null);
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
                {/* Hund's rule, which this level teaches: one electron in every
                    orbital before any pairs. Filling box by box drew carbon's 2p²
                    as one pair and two empty boxes. */}
                {hundFilling(count, numBoxes).map((electronsInBox, boxIdx) => {
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

  // --- Teaching intro ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <Header
          variant="game"
          backHref="/efnafraedi/2-ar/"
          gameTitle="Rafeindasmíð — Kennsla"
          authSlot={
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
          }
        />
        <div className="max-w-lg mx-auto p-4 md:p-8">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 mb-4 pointer-coarse:py-2.5 pointer-coarse:-mt-2.5 pointer-coarse:mb-1.5"
          >
            ← Til baka
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 animate-slide-in">
            <h2 className="text-xl font-bold text-warm-800">Hvernig fylla á í svigrúm?</h2>
            <p className="text-warm-700">
              Rafeindir fylla svigrúm í ákveðinni röð — frá lægstu orku til hæstu. Þetta kallast{' '}
              <strong>Aufbau-reglan</strong>.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Aufbau-röðin</h3>
              <p className="font-mono text-sm text-blue-700 text-center">
                1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → ...
              </p>
              <p className="text-xs text-blue-600 mt-2 text-center">
                Athugið: 4s fyllist FYRIR 3d (lægri orka)
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-bold text-indigo-800 mb-2">Orkuröðun — af hverju 4s &lt; 3d?</h3>
              <div className="my-3 text-xs font-mono">
                <div className="text-right text-indigo-700">
                  <div>5s 5p 4d ────────────</div>
                  <div className="mt-1">4p ────</div>
                  <div className="mt-1">3d ───</div>
                  <div className="mt-1">4s ──</div>
                  <div className="mt-1">3s 3p ──</div>
                  <div className="mt-1">2s 2p ─</div>
                  <div className="mt-1">1s ─</div>
                </div>
                <p className="text-indigo-700 text-center mt-2">↑ hærri orka · neðst = lægri</p>
              </div>
              <p className="text-sm text-indigo-700">
                3d-svigrúmið er <strong>minna ígengt</strong> og meira skýlt fyrir kjarnanum en
                4s-svigrúmið. Því er 4s-orkan aðeins lægri — og rafeindir fylla það fyrst.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">Einsetulögmál Paulis</h3>
              <p className="text-sm text-purple-700">
                Engar tvær rafeindir í sama atómi mega hafa allar fjórar skammtatölur eins — þar með
                er ljóst að í hverju svigrúmi (sömu n, l, m<sub className="text-[0.875em]">l</sub>)
                rúmast að hámarki <strong>tvær rafeindir</strong> með gagnstæðan spuna (m
                <sub className="text-[0.875em]">s</sub> = +½ og −½).
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Dæmi: Súrefni (O, Z=8)</h3>
              <div className="text-sm text-green-700 font-mono space-y-1">
                <p>1s² → 2 rafeindir (samtals 2 af 8)</p>
                <p>2s² → 2 rafeindir (samtals 4 af 8)</p>
                <p>2p⁴ → 4 rafeindir (samtals 8 af 8) ✓</p>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Rafeindaskipan: <strong>1s² 2s² 2p⁴</strong>
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-bold text-amber-800 mb-2">Regla Hunds</h3>
              <p className="text-sm text-amber-700">
                Rafeindir dreifast fyrst einar (↑) í öll svigrúm undirhvolfs áður en þær byrja að
                parast (↑↓). Þetta lágmarkar fráhrindingu.
              </p>
            </div>

            <div className="bg-warm-50 p-3 rounded-lg text-sm text-warm-700">
              <strong>Skrifaðu svona:</strong> 1s2 eða 1s² — bæði virka. Hafðu bil milli
              undirhvolfa: 1s2 2s2 2p4
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
        gameTitle="Rafeindasmíð"
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
          >
            ← Til baka
          </button>
          <div className="text-sm text-warm-600">
            Frumefni {currentIndex + 1} / {configPuzzles.length} &bull; Stig: {score}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 animate-slide-in">
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
                <div className="text-sm text-warm-600">
                  {puzzle.atomicNumber} {rafeindir(puzzle.atomicNumber)}
                </div>
              </div>
            </div>
          </div>

          {/* Aufbau reminder */}
          <div className="bg-blue-50 p-3 rounded-lg mb-6 text-sm text-blue-800">
            <strong>Aufbau-röð:</strong> 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p
          </div>

          {/* Input */}
          <div className="mb-6">
            <label htmlFor="config-input" className="block text-sm font-medium text-warm-700 mb-2">
              Sláðu inn rafeindaskipan (t.d. 1s2 2s2 2p4):
            </label>
            <input
              id="config-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="1s2 2s2 2p4..."
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="config-input"
              disabled={submitted}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-xs text-warm-500 mt-1">
              Notaðu tölustafi (1s2) eða yfirskrift (1s²) — bæði virka.
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

              <div ref={feedbackRef} className="scroll-mb-4">
                <div
                  className={`p-4 rounded-xl mb-2 ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}
                >
                  <div className="text-lg font-bold mb-2">
                    {isCorrect ? '✅ Rétt!' : '❌ Ekki rétt'}
                  </div>
                  {!isCorrect && (
                    <>
                      <p className="text-sm font-mono text-warm-800 mb-2">
                        Rétt svar: {puzzle.correctConfig}
                      </p>
                      {diagnostic && (
                        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
                          <span className="font-semibold">Athugaðu: </span>
                          {diagnostic}
                        </p>
                      )}
                    </>
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
