import { useState } from 'react';

import { Header, LanguageSwitcher } from '@shared/components';
import { useGameI18n } from '@shared/hooks';

import { puzzles } from '../data/quantum-numbers';
import { gameTranslations } from '../i18n';

interface Level1Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level1({ onComplete, onBack }: Level1Props) {
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [phase, setPhase] = useState<'teach' | 'practice'>('teach');
  const [teachStep, setTeachStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const puzzle = puzzles[currentIndex];
  const isLast = currentIndex >= puzzles.length - 1;

  const handleToggle = (idx: number) => {
    if (submitted) return;
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const handleSubmit = () => {
    if (submitted || selected.size === 0) return;
    setSubmitted(true);

    // Check: each selected option should be valid, each unselected should be invalid
    let correct = true;
    puzzle.options.forEach((opt, idx) => {
      const wasSelected = selected.has(idx);
      if (opt.isValid !== wasSelected) correct = false;
    });

    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(score);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(new Set());
    setSubmitted(false);
  };

  const formatMs = (ms: number) => (ms > 0 ? `+${ms}` : `${ms}`);

  // ==================== TEACHING PHASE ====================
  if (phase === 'teach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <Header
          variant="game"
          backHref="/efnafraedi/2-ar/"
          gameTitle="Skammtatölur — Kennsla"
          authSlot={
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
          }
        />
        <div className="max-w-lg mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="text-warm-600 hover:text-warm-800">
              ← Til baka
            </button>
            <span className="text-sm text-warm-500">Kennsla {teachStep + 1}/3</span>
          </div>

          {teachStep === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-slide-in">
              <h2 className="text-xl font-bold text-warm-800">Hvað eru skammtatölur?</h2>
              <p className="text-warm-700">
                Hvert rafeind í atómi hefur fjórar <strong>skammtatölur</strong> sem lýsa stöðu
                hennar og hegðun. Saman virka þær eins og „heimilisfang" rafeindarinnar.
              </p>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong className="text-blue-800">n</strong>{' '}
                  <span className="text-blue-600">(aðalskammtatala)</span>
                  <p className="text-sm text-blue-700 mt-1">
                    Ákvarðar skelina / orkustigið. n = 1, 2, 3, ...
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <strong className="text-green-800">l</strong>{' '}
                  <span className="text-green-600">(hliðarskammtatala)</span>
                  <p className="text-sm text-green-700 mt-1">
                    Ákvarðar lögun svigrúmsins. l = 0 til n−1
                  </p>
                  <p className="text-xs text-green-600 mt-1">l=0 → s, l=1 → p, l=2 → d, l=3 → f</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <strong className="text-purple-800">mₗ</strong>{' '}
                  <span className="text-purple-600">(segulskammtatala)</span>
                  <p className="text-sm text-purple-700 mt-1">
                    Stefna svigrúmsins í rúminu. mₗ = −l til +l
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <strong className="text-amber-800">mₛ</strong>{' '}
                  <span className="text-amber-600">(spunaskammtatala)</span>
                  <p className="text-sm text-amber-700 mt-1">
                    Snúningur rafeindarinnar. mₛ = +½ eða −½
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTeachStep(1)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Sjáum dæmi →
              </button>
            </div>
          )}

          {teachStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-slide-in">
              <h2 className="text-xl font-bold text-warm-800">Dæmi: n = 2</h2>
              <p className="text-warm-700">Hvaða gildi eru leyfileg þegar n = 2?</p>

              <div className="bg-warm-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-warm-800">l getur verið 0 eða 1</p>
                  <p className="text-sm text-warm-600 ml-4">Reglan: l = 0 til n−1, þ.e. 0 til 1</p>
                  <p className="text-sm text-warm-600 ml-4">
                    l=0 → 2s svigrúm &bull; l=1 → 2p svigrúm
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">Fyrir l = 1 (2p): mₗ = −1, 0, +1</p>
                  <p className="text-sm text-warm-600 ml-4">
                    Þrjár stefnur → þrjú 2p svigrúm (2px, 2py, 2pz)
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">mₛ = +½ eða −½ alltaf</p>
                  <p className="text-sm text-warm-600 ml-4">
                    Tvær rafeindir í hverju svigrúmi (gagnstæður snúningur)
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Ógilt:</strong> l = 2 þegar n = 2 — l getur aldrei verið jafn eða stærri
                  en n!
                </p>
              </div>

              <button
                onClick={() => setTeachStep(2)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Eitt dæmi til →
              </button>
            </div>
          )}

          {teachStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-slide-in">
              <h2 className="text-xl font-bold text-warm-800">Dæmi: n = 3</h2>

              <div className="bg-warm-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-warm-700">
                  <strong>l</strong> getur verið 0, 1, eða 2 → 3s, 3p, 3d svigrúm
                </p>
                <p className="text-sm text-warm-700">
                  <strong>Fyrir l = 2 (3d):</strong> mₗ = −2, −1, 0, +1, +2 → fimm svigrúm
                </p>
                <p className="text-sm text-warm-700">
                  <strong>Samtals:</strong> 1 + 3 + 5 = 9 svigrúm, allt að 18 rafeindir
                </p>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-bold text-teal-800 mb-2">Reglurnar í stuttu máli</h3>
                <div className="text-sm text-teal-700 space-y-1 font-mono">
                  <p>l: 0 til n−1 (aldrei ≥ n)</p>
                  <p>mₗ: −l til +l</p>
                  <p>mₛ: +½ eða −½ (alltaf)</p>
                </div>
              </div>

              <button
                onClick={() => setPhase('practice')}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Ég er tilbúin/n — byrja æfingar →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== PRACTICE PHASE ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle="Skammtatölur"
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Progress */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="text-warm-600 hover:text-warm-800">
            ← Til baka
          </button>
          <div className="text-sm text-warm-600">
            Spurning {currentIndex + 1} / {puzzles.length} &bull; Stig: {score}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-slide-in">
          {/* Quantum number display */}
          <div className="text-center mb-6">
            <div className="inline-block bg-teal-100 px-6 py-3 rounded-xl">
              <span className="text-3xl font-bold text-teal-800">n = {puzzle.n}</span>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-warm-800 mb-4 text-center">
            {language === 'is' ? puzzle.description_is : puzzle.description_en}
          </h2>

          {/* Rules reminder */}
          <div className="bg-blue-50 p-3 rounded-lg mb-6 text-sm text-blue-800">
            <strong>Reglur:</strong> l: 0 til n-1 &bull; mₗ: -l til +l &bull; mₛ: +½ eða -½
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {puzzle.options.map((opt, idx) => {
              const isSelected = selected.has(idx);
              let className = 'quantum-card';
              if (isSelected && !submitted) className += ' selected';
              if (submitted) {
                if (opt.isValid) className += ' correct';
                else if (isSelected) className += ' incorrect';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleToggle(idx)}
                  className={className}
                  disabled={submitted}
                >
                  <div className="font-mono text-lg text-center">
                    l = {opt.l}, mₗ = {opt.ml}, mₛ = {formatMs(opt.ms)}
                  </div>
                  {submitted && (
                    <div className="text-center mt-2 text-sm">
                      {opt.isValid ? '✓ Gilt' : '✗ Ógilt'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit / Next */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selected.size === 0}
              className="game-btn w-full py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 disabled:bg-warm-300 disabled:cursor-not-allowed transition-colors"
            >
              Athuga svar
            </button>
          ) : (
            <>
              <div
                className={`p-4 rounded-xl mb-2 ${
                  puzzle.options.every((opt, idx) => opt.isValid === selected.has(idx))
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-red-50 border-2 border-red-300'
                }`}
              >
                <div className="text-lg font-bold mb-2">
                  {puzzle.options.every((opt, idx) => opt.isValid === selected.has(idx))
                    ? '✅ Rétt!'
                    : '❌ Ekki rétt'}
                </div>
                <p className="text-sm text-warm-700">
                  {language === 'is' ? puzzle.explanation_is : puzzle.explanation_en}
                </p>
              </div>
              <button
                onClick={handleNext}
                className="game-btn w-full mt-4 py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 transition-colors"
              >
                {isLast ? 'Ljúka stigi' : 'Næsta spurning →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
