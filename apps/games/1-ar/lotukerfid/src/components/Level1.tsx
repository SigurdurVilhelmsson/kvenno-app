import { useState, useCallback } from 'react';

import { FeedbackPanel } from '@shared/components';

import { PeriodicTable } from './PeriodicTable';
import { ELEMENTS, CATEGORY_COLORS, type Element } from '../data/elements';

interface Level1Props {
  onBack: () => void;
  onComplete: () => void;
}

type QuestionType = 'find-by-name' | 'find-by-position' | 'name-by-symbol';

interface Question {
  type: QuestionType;
  element: Element;
  text: string;
  /** For multiple-choice questions (name-by-symbol) */
  options?: string[];
  correctOption?: string;
}

/** Fisher-Yates shuffle — proper unbiased randomization */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n unique random items */
function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Generate 10 random questions across the 3 types */
function generateQuestions(): Question[] {
  const pool = pickRandom(ELEMENTS, 20);
  const questions: Question[] = [];

  // 4 find-by-name questions
  for (let i = 0; i < 4; i++) {
    const el = pool[i];
    questions.push({
      type: 'find-by-name',
      element: el,
      text: `Hvar er ${el.name} (${el.symbol}) í lotukerfinu?`,
    });
  }

  // 3 find-by-position questions
  for (let i = 4; i < 7; i++) {
    const el = pool[i];
    questions.push({
      type: 'find-by-position',
      element: el,
      text: `Hvaða frumefni er á lotu ${el.period}, flokki ${el.group}?`,
    });
  }

  // 3 name-by-symbol questions (multiple choice)
  for (let i = 7; i < 10; i++) {
    const el = pool[i];
    const distractors = pickRandom(
      ELEMENTS.filter((e) => e.symbol !== el.symbol),
      3
    ).map((e) => e.name);
    const options = shuffle([...distractors, el.name]);
    questions.push({
      type: 'name-by-symbol',
      element: el,
      text: `Hvað heitir frumefnið með táknið ${el.symbol}?`,
      options,
      correctOption: el.name,
    });
  }

  return shuffle(questions);
}

const TOTAL = 10;

export function Level1({ onBack, onComplete }: Level1Props) {
  const [questions, setQuestions] = useState<Question[]>(generateQuestions);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctSymbol, setCorrectSymbol] = useState<string | null>(null);
  const [wrongSymbol, setWrongSymbol] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const question = questions[index];

  const handleElementClick = useCallback(
    (element: Element) => {
      if (answered) return;
      const correct = element.symbol === question.element.symbol;
      setIsCorrect(correct);
      setCorrectSymbol(question.element.symbol);
      if (!correct) setWrongSymbol(element.symbol);
      if (correct) setCorrectCount((prev) => prev + 1);
      setAnswered(true);
    },
    [answered, question]
  );

  const handleOptionClick = (option: string) => {
    if (answered) return;
    const correct = option === question.correctOption;
    setIsCorrect(correct);
    setCorrectSymbol(question.element.symbol);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setAnswered(false);
    setIsCorrect(false);
    setCorrectSymbol(null);
    setWrongSymbol(null);
  };

  const handleRetry = () => {
    setQuestions(generateQuestions());
    setIndex(0);
    setCorrectCount(0);
    setAnswered(false);
    setIsCorrect(false);
    setCorrectSymbol(null);
    setWrongSymbol(null);
    setDone(false);
  };

  // --- Summary screen ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">
            {correctCount >= 7 ? '🎉' : correctCount >= 4 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú svaraðir <span className="font-bold text-kvenno-orange">{correctCount}</span> af{' '}
            <span className="font-bold">{TOTAL}</span> rétt
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(correctCount / TOTAL) * 100}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={onComplete}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button onClick={onBack} className="text-warm-500 hover:text-warm-700 text-sm">
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // --- Gameplay ---
  const elementInfo = answered ? question.element : null;
  const colors = elementInfo ? CATEGORY_COLORS[elementInfo.category] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-3">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm"
            >
              ← Til baka
            </button>
            <h1 className="text-base sm:text-lg font-bold text-warm-800">Þekkja frumefni</h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-2 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange progress-fill"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-3 text-center animate-fade-in-up"
          key={index}
        >
          <p className="text-lg sm:text-xl font-bold text-warm-800">{question.text}</p>
          {question.type !== 'name-by-symbol' && (
            <p className="text-sm text-warm-500 mt-1">Smelltu á rétt frumefni í lotukerfinu</p>
          )}
        </div>

        {/* Multiple choice options for name-by-symbol */}
        {question.type === 'name-by-symbol' && (
          <div className="grid grid-cols-2 gap-3 mb-3 max-w-lg mx-auto">
            {question.options!.map((option) => {
              const isSelected = answered && option === question.correctOption;
              const isWrongChoice = answered && !isCorrect && option !== question.correctOption;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  disabled={answered}
                  className={`p-3 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all ${
                    isSelected
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : isWrongChoice
                        ? 'bg-warm-100 border-warm-300 text-warm-400'
                        : 'bg-white border-warm-300 text-warm-700 hover:border-kvenno-orange hover:bg-orange-50'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {/* Periodic Table */}
        {question.type !== 'name-by-symbol' && (
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-3">
            <PeriodicTable
              onElementClick={handleElementClick}
              highlightedElements={answered ? new Set([question.element.symbol]) : undefined}
              correctElement={answered && isCorrect ? correctSymbol : null}
              wrongElement={wrongSymbol}
              interactive={!answered}
            />
          </div>
        )}

        {/* Feedback + element info */}
        {answered && (
          <div className="space-y-3 mb-3 max-w-lg mx-auto animate-fade-in-up">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rétt! ${question.element.name} (${question.element.symbol}) er á lotu ${question.element.period}, flokki ${question.element.group}.`
                  : `Rangt. Rétt svar er ${question.element.name} (${question.element.symbol}), á lotu ${question.element.period}, flokki ${question.element.group}.`,
              }}
              config={{ showExplanation: true }}
            />

            {/* Element detail card */}
            {elementInfo && colors && (
              <div
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 flex items-center gap-4`}
              >
                <div
                  className={`w-16 h-16 rounded-lg ${colors.bg} ${colors.border} border-2 flex flex-col items-center justify-center`}
                >
                  <span className="text-xs text-warm-500">{elementInfo.atomicNumber}</span>
                  <span className="text-2xl font-bold">{elementInfo.symbol}</span>
                </div>
                <div className="text-sm">
                  <div className="font-bold text-warm-800">{elementInfo.name}</div>
                  <div className="text-warm-600">Atómnúmer: {elementInfo.atomicNumber}</div>
                  <div className="text-warm-600">
                    Atómmassi: {elementInfo.atomicMass.toFixed(3)} g/mol
                  </div>
                  <div className="text-warm-600">
                    Lota {elementInfo.period}, Flokkur {elementInfo.group}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < TOTAL ? 'Næsta spurning →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level1;
