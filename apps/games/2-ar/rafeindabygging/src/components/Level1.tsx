import { useState } from 'react';

import { Header, LanguageSwitcher } from '@shared/components';
import { useGameI18n } from '@shared/hooks';

import { puzzles } from '../data/quantum-numbers';
import { gameTranslations } from '../i18n';

interface Level1Props {
  onComplete: (score: number, maxScore: number) => void;
  onBack: () => void;
}

export function Level1({ onComplete, onBack }: Level1Props) {
  const { language, setLanguage } = useGameI18n({ gameTranslations });
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
      onComplete(score, puzzles.length);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(new Set());
    setSubmitted(false);
  };

  const formatMs = (ms: number) => (ms > 0 ? `+${ms}` : `${ms}`);

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
                if (opt.isValid && isSelected) className += ' correct';
                else if (opt.isValid && !isSelected) className += ' correct';
                else if (!opt.isValid && isSelected) className += ' incorrect';
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
