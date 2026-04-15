import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';

import { PeriodicTable } from './PeriodicTable';
import { ELEMENTS, type Element } from '../data/elements';

interface Level3Props {
  onBack: () => void;
  onComplete: () => void;
}

type QuestionType = 'protons' | 'electrons' | 'neutrons' | 'identify-by-particles';

interface Question {
  type: QuestionType;
  element: Element;
  text: string;
  correctAnswer: number;
  explanation: string;
  /** For identify-by-particles: the element must be clicked on the table */
  requiresTableClick?: boolean;
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function neutronCount(el: Element): number {
  return Math.round(el.atomicMass) - el.atomicNumber;
}

function generateQuestions(): Question[] {
  const pool = pickRandom(
    ELEMENTS.filter((e) => e.period <= 4),
    12
  );
  const questions: Question[] = [];

  // 2 proton questions
  for (let i = 0; i < 2; i++) {
    const el = pool[i];
    questions.push({
      type: 'protons',
      element: el,
      text: `Hversu margar róteindir hefur ${el.name} (${el.symbol})?`,
      correctAnswer: el.atomicNumber,
      explanation: `Atómnúmer ${el.name} er ${el.atomicNumber}, þannig að það hefur ${el.atomicNumber} róteindir. Fjöldi róteinda = atómnúmer.`,
    });
  }

  // 2 electron questions
  for (let i = 2; i < 4; i++) {
    const el = pool[i];
    questions.push({
      type: 'electrons',
      element: el,
      text: `Hversu margar rafeindir hefur hlutlaust ${el.name} (${el.symbol}) atóm?`,
      correctAnswer: el.atomicNumber,
      explanation: `Hlutlaust atóm hefur jafn margar rafeindir og róteindir. ${el.name} hefur ${el.atomicNumber} rafeindir.`,
    });
  }

  // 2 neutron questions
  for (let i = 4; i < 6; i++) {
    const el = pool[i];
    const n = neutronCount(el);
    questions.push({
      type: 'neutrons',
      element: el,
      text: `Hversu margar nifteindir hefur ${el.name} (${el.symbol})? Notaðu lotukerfið.`,
      correctAnswer: n,
      explanation: `Nifteindir = massatala - atómnúmer = ${Math.round(el.atomicMass)} - ${el.atomicNumber} = ${n}.`,
    });
  }

  // 2 identify-by-particles questions
  for (let i = 6; i < 8; i++) {
    const el = pool[i];
    const n = neutronCount(el);
    questions.push({
      type: 'identify-by-particles',
      element: el,
      text: `Hvaða frumefni hefur ${el.atomicNumber} róteindir og ${n} nifteindir?`,
      correctAnswer: el.atomicNumber,
      explanation: `Frumefni með ${el.atomicNumber} róteindir er ${el.name} (${el.symbol}). Atómnúmerið ákvarðar hvaða frumefni það er.`,
      requiresTableClick: true,
    });
  }

  return shuffle(questions);
}

const TOTAL = 8;

export function Level3({ onBack, onComplete }: Level3Props) {
  const [showIntro, setShowIntro] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(generateQuestions);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [done, setDone] = useState(false);

  const question = questions[index];

  const handleSubmit = () => {
    if (question.requiresTableClick) return;
    const value = parseInt(input, 10);
    if (isNaN(value)) return;
    const correct = value === question.correctAnswer;
    setIsCorrect(correct);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleElementClick = (element: Element) => {
    if (answered || !question.requiresTableClick) return;
    const correct = element.atomicNumber === question.correctAnswer;
    setIsCorrect(correct);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setInput('');
    setAnswered(false);
    setIsCorrect(false);
  };

  const handleRetry = () => {
    setQuestions(generateQuestions());
    setIndex(0);
    setInput('');
    setCorrectCount(0);
    setAnswered(false);
    setIsCorrect(false);
    setDone(false);
  };

  // --- Summary screen ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">
            {correctCount >= 6 ? '🎉' : correctCount >= 4 ? '👍' : '📚'}
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

  // --- Teaching intro ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <button
                onClick={onBack}
                className="text-warm-500 hover:text-warm-700 font-semibold text-sm"
              >
                ← Til baka
              </button>
              <h1 className="text-lg font-bold text-warm-800">Bygging atómsins — Kennsla</h1>
              <span className="text-sm text-warm-500">Yfirlit</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-5 animate-fade-in-up">
            <h2 className="text-xl font-bold text-warm-800">Prótónur, nifteindir og rafeindir</h2>

            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-blue-800">
                <strong>Prótónur (p⁺):</strong> Jákvætt hlaðnar agnir í kjarnanum. Fjöldi prótóna ={' '}
                <strong>raðtala (Z)</strong>.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Rafeindir (e⁻):</strong> Neikvætt hlaðnar agnir utan kjarnans. Í hlutlausu
                atómi: rafeindir = prótónur.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Nifteindir (n⁰):</strong> Hlutlausar agnir í kjarnanum. Fjöldi nifteinda ={' '}
                <strong>massatala − raðtala</strong>.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Dæmi: Kolefni (C)</h3>
              <div className="text-sm text-green-700 space-y-1 font-mono">
                <p>
                  Raðtala (Z) = 6 → <strong>6 prótónur</strong>
                </p>
                <p>
                  Hlutlaust atóm → <strong>6 rafeindir</strong>
                </p>
                <p>
                  Massatala ≈ 12 → Nifteindir = 12 − 6 = <strong>6 nifteindir</strong>
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-bold text-amber-800 mb-2">Hvar finn ég upplýsingarnar?</h3>
              <p className="text-sm text-amber-700">
                Í lotukerfinu: raðtalan er neðst (t.d. 6 fyrir C) og frumeindamassinn er efst (t.d.
                12,01 fyrir C). Námundaðu frumeindamann upp í heiltölu til að fá massatöluna.
              </p>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Byrja æfingar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Gameplay ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-2 sm:p-4">
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
            <h1 className="text-base sm:text-lg font-bold text-warm-800">Sameindagerð</h1>
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
          {question.requiresTableClick && !answered && (
            <p className="text-sm text-warm-500 mt-1">Smelltu á rétt frumefni í lotukerfinu</p>
          )}
        </div>

        {/* Numeric input (for non-table-click questions) */}
        {!question.requiresTableClick && !answered && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-3 max-w-md mx-auto">
            <label className="block text-sm font-medium text-warm-700 mb-2">Svar:</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="t.d. 12"
                className="flex-1 px-4 py-3 border-2 border-warm-300 rounded-xl focus:border-kvenno-orange focus:outline-none text-lg font-mono"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Athuga
              </button>
            </div>
          </div>
        )}

        {/* Periodic table */}
        {question.requiresTableClick && (
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-3">
            <PeriodicTable
              onElementClick={handleElementClick}
              highlightedElements={answered ? new Set([question.element.symbol]) : undefined}
              correctElement={answered && isCorrect ? question.element.symbol : null}
              wrongElement={answered && !isCorrect ? undefined : undefined}
              interactive={!answered}
            />
          </div>
        )}

        {/* Reference table for numeric questions */}
        {!question.requiresTableClick && (
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-3">
            <PeriodicTable
              highlightedElements={answered ? new Set([question.element.symbol]) : undefined}
              correctElement={answered ? question.element.symbol : null}
              interactive={false}
            />
          </div>
        )}

        {/* Feedback */}
        {answered && (
          <div className="space-y-3 mb-3 max-w-lg mx-auto animate-fade-in-up">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: question.explanation,
              }}
              config={{ showExplanation: true }}
            />

            {/* Particle breakdown card */}
            <div className="bg-warm-50 rounded-xl border-2 border-warm-200 p-4">
              <h3 className="font-bold text-warm-800 mb-2">
                {question.element.name} ({question.element.symbol})
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-warm-500 text-xs">Róteindir</div>
                  <div className="font-bold text-lg">{question.element.atomicNumber}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-warm-500 text-xs">Rafeindir</div>
                  <div className="font-bold text-lg">{question.element.atomicNumber}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-warm-500 text-xs">Nifteindir</div>
                  <div className="font-bold text-lg">
                    {Math.round(question.element.atomicMass) - question.element.atomicNumber}
                  </div>
                </div>
              </div>
              <p className="text-xs text-warm-500 mt-2 text-center">
                Massatala = róteindir + nifteindir = {Math.round(question.element.atomicMass)}
              </p>
            </div>

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

export default Level3;
