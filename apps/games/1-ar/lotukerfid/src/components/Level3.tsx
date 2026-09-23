import { useEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import { parseStudentNumber, shuffleArray } from '@shared/utils';

import { PeriodicTable } from './PeriodicTable';
import { ELEMENTS, nameInSentence, type Element } from '../data/elements';
import { particleMisconception } from '../utils/misconceptions';
import { revealOnPhone, scrollTopOnPhone } from '../utils/phoneScroll';

interface Level3Props {
  onBack: () => void;
  onComplete: () => void;
}

type QuestionType = 'protons' | 'electrons' | 'neutrons' | 'identify-by-particles';

export interface Question {
  type: QuestionType;
  element: Element;
  text: string;
  correctAnswer: number;
  explanation: string;
  /** For identify-by-particles: the element must be clicked on the table */
  requiresTableClick?: boolean;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n);
}

function neutronCount(el: Element): number {
  return el.massNumber - el.atomicNumber;
}

/**
 * A count and its noun, agreeing the way Icelandic agrees them: a number that
 * ends in 1, other than 11, takes the singular — `1 róteind`, `21 róteind`,
 * `31 rafeind`, but `11 róteindir`. The pool reaches Z = 1, 21 and 31, so a
 * template that always writes the plural is wrong for vetni, skandíum and gallíum.
 */
function particleCount(n: number, singular: string, plural: string): string {
  return `${n} ${n % 10 === 1 && n % 100 !== 11 ? singular : plural}`;
}

/** Exported for tests: the level's whole question pool for one run. */
export function generateQuestions(): Question[] {
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
      text: `Hversu margar róteindir hefur ${nameInSentence(el)} (${el.symbol})?`,
      correctAnswer: el.atomicNumber,
      // Written with the name as the subject: `Sætistala X` wants X in the
      // genitive, and `það` fits only the neuter names.
      explanation: `${el.name} hefur sætistöluna ${el.atomicNumber} og því ${particleCount(el.atomicNumber, 'róteind', 'róteindir')}. Fjöldi róteinda = sætistala.`,
    });
  }

  // 2 electron questions
  for (let i = 2; i < 4; i++) {
    const el = pool[i];
    questions.push({
      type: 'electrons',
      element: el,
      text: `Hversu margar rafeindir hefur ${nameInSentence(el)} (${el.symbol}) sem hlutlaust atóm?`,
      correctAnswer: el.atomicNumber,
      explanation: `Hlutlaust atóm hefur jafn margar rafeindir og róteindir. ${el.name} hefur ${particleCount(el.atomicNumber, 'rafeind', 'rafeindir')}.`,
    });
  }

  // 2 neutron questions
  for (let i = 4; i < 6; i++) {
    const el = pool[i];
    const n = neutronCount(el);
    questions.push({
      type: 'neutrons',
      element: el,
      text: `Hversu margar nifteindir hefur ${nameInSentence(el)}-${el.massNumber} (${el.symbol}-${el.massNumber})?`,
      correctAnswer: n,
      explanation: `Nifteindir = massatala - sætistala = ${el.massNumber} - ${el.atomicNumber} = ${n}.`,
    });
  }

  // 2 identify-by-particles questions
  for (let i = 6; i < 8; i++) {
    const el = pool[i];
    const n = neutronCount(el);
    questions.push({
      type: 'identify-by-particles',
      element: el,
      text: `Hvaða frumefni hefur ${particleCount(el.atomicNumber, 'róteind', 'róteindir')} og ${particleCount(n, 'nifteind', 'nifteindir')}?`,
      correctAnswer: el.atomicNumber,
      explanation: `Frumefni með ${particleCount(el.atomicNumber, 'róteind', 'róteindir')} er ${nameInSentence(el)} (${el.symbol}). Sætistalan ákvarðar hvaða frumefni það er.`,
      requiresTableClick: true,
    });
  }

  return shuffleArray(questions);
}

const TOTAL = 8;

function hintFor(question: Question): string {
  if (question.type === 'protons') {
    return 'Fjöldi róteinda = sætistala (Z). Finndu frumefnið í lotukerfinu og lestu sætistöluna.';
  }
  if (question.type === 'electrons') {
    return 'Hlutlaust atóm hefur jafnmargar rafeindir og róteindir (= sætistala).';
  }
  if (question.type === 'neutrons') {
    return 'Nifteindir = massatala − sætistala. Massatalan er talan í heiti samsætunnar (t.d. 63 í Cu-63) — hún er ekki meðalatómmassinn sem stendur á lotukerfinu.';
  }
  return 'Sætistalan (fjöldi róteinda) ákvarðar hvaða frumefni þetta er. Leitaðu að þeirri sætistölu í lotukerfinu.';
}

export function Level3({ onBack, onComplete }: Level3Props) {
  const [showIntro, setShowIntro] = useState(true);
  useEscapeKey(onBack, showIntro);
  const [questions, setQuestions] = useState<Question[]>(generateQuestions);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  /** What the student actually answered, so the feedback can diagnose it. */
  const [given, setGiven] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // On a phone the feedback lands below the periodic table, out of sight, and
  // the next question would open scrolled past its own text.
  useEffect(() => scrollTopOnPhone(), [showIntro, index, done]);
  useEffect(() => {
    if (answered) revealOnPhone(feedbackRef.current);
  }, [answered]);

  const question = questions[index];
  // The cell the student tapped on an identify-by-particles question, marked
  // red the way Stig 1 marks a wrong tap. `given` is its sætistala.
  const wrongSymbol =
    answered && !isCorrect && question.requiresTableClick && given !== null
      ? (ELEMENTS.find((e) => e.atomicNumber === given)?.symbol ?? null)
      : null;

  const handleSubmit = () => {
    if (question.requiresTableClick) return;
    // Read the whole number, not its integer prefix: `parseInt` took 6.5 as 6
    // and marked it right. A count of particles that is not whole is wrong.
    if (!input.trim()) return;
    const value = parseStudentNumber(input);
    if (Number.isNaN(value)) return;
    const correct = value === question.correctAnswer;
    setGiven(value);
    setIsCorrect(correct);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleElementClick = (element: Element) => {
    if (answered || !question.requiresTableClick) return;
    const correct = element.atomicNumber === question.correctAnswer;
    setGiven(element.atomicNumber);
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
    setGiven(null);
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleRetry = () => {
    setQuestions(generateQuestions());
    setIndex(0);
    setInput('');
    setCorrectCount(0);
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
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
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
          >
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
            {/* On a phone the title takes a line of its own under the back
                button, instead of being squeezed to a word per line. */}
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-y-1">
              <button
                onClick={onBack}
                className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap md:whitespace-normal pointer-coarse:py-3 pointer-coarse:-my-3"
              >
                ← Til baka
              </button>
              <h1 className="order-last basis-full md:order-none md:basis-auto text-base md:text-lg font-bold text-warm-800">
                Bygging atómsins — Kennsla
              </h1>
              <span className="text-sm text-warm-500">Yfirlit</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-5 animate-fade-in-up">
            <h2 className="text-xl font-bold text-warm-800">Róteindir, nifteindir og rafeindir</h2>

            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-blue-800">
                <strong>Róteindir (p⁺):</strong> Jákvætt hlaðnar agnir í kjarnanum. Fjöldi róteinda
                = <strong>sætistala (Z)</strong>.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Rafeindir (e⁻):</strong> Neikvætt hlaðnar agnir utan kjarnans. Í hlutlausu
                atómi: rafeindir = róteindir.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Nifteindir (n⁰):</strong> Hlutlausar agnir í kjarnanum. Fjöldi nifteinda ={' '}
                <strong>massatala − sætistala</strong>.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Dæmi: Kolefni-12 (C-12)</h3>
              <div className="text-sm text-green-700 space-y-1 font-mono">
                <p>
                  Sætistala (Z) = 6 → <strong>6 róteindir</strong>
                </p>
                <p>
                  Hlutlaust atóm → <strong>6 rafeindir</strong>
                </p>
                <p>
                  Massatala = 12 → Nifteindir = 12 − 6 = <strong>6 nifteindir</strong>
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-bold text-amber-800 mb-2">Hvar finn ég upplýsingarnar?</h3>
              <p className="text-sm text-amber-700">
                Í lotukerfinu: sætistalan er efst (t.d. 6 fyrir C) og meðalatómmassinn er neðst
                (t.d. 12,01 fyrir C). Meðalatómmassinn er meðaltal allra samsæta frumefnisins og er
                því ekki massatalan: massatalan á við eina tiltekna samsætu og er alltaf heiltala.
                Hún stendur í heiti samsætunnar — 12 í kolefni-12 (C-12) — og spurningarnar hér gefa
                hana því beint.
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
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
            >
              ← Til baka
            </button>
            <h1 className="min-w-0 text-center text-base sm:text-lg font-bold text-warm-800">
              Atómbygging
            </h1>
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
          {!answered && !showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="mt-3 text-sm px-4 py-2 pointer-coarse:min-h-11 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none"
            >
              💡 Vísbending
            </button>
          )}
          {!answered && showHint && (
            <div className="mt-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 text-sm text-yellow-900 text-left">
              <span className="font-bold">Vísbending:</span> {hintFor(question)}
            </div>
          )}
        </div>

        {/* Numeric input (for non-table-click questions) */}
        {!question.requiresTableClick && !answered && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-3 max-w-md mx-auto">
            <label className="block text-sm font-medium text-warm-700 mb-2">Svar:</label>
            <div className="flex gap-3">
              <input
                type="number"
                inputMode="numeric"
                autoComplete="off"
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
              wrongElement={wrongSymbol}
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
          <div ref={feedbackRef} className="space-y-3 mb-3 max-w-lg mx-auto animate-fade-in-up">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: question.explanation,
                // Renders outside the collapsible explanation, so it is the one
                // thing a student who reads nothing else still sees.
                misconception:
                  isCorrect || given === null
                    ? undefined
                    : particleMisconception(question.type, question.element, given),
              }}
              config={{ showExplanation: true }}
            />

            {/* Particle breakdown card */}
            <div className="bg-warm-50 rounded-xl border-2 border-warm-200 p-4">
              <h3 className="font-bold text-warm-800 mb-2">
                {question.element.name} ({question.element.symbol})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                <div className="bg-white rounded-lg p-2 border border-warm-200">
                  <div className="text-warm-500 text-xs">Róteindir</div>
                  <div className="font-bold text-lg">{question.element.atomicNumber}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-warm-200">
                  <div className="text-warm-500 text-xs">Rafeindir</div>
                  <div className="font-bold text-lg">{question.element.atomicNumber}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-warm-200">
                  <div className="text-warm-500 text-xs">Massatala</div>
                  <div className="font-bold text-lg">{question.element.massNumber}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-warm-200">
                  <div className="text-warm-500 text-xs">Nifteindir</div>
                  <div className="font-bold text-lg">{neutronCount(question.element)}</div>
                </div>
              </div>
              <p className="text-xs text-warm-500 mt-2 text-center">
                Massatala = róteindir + nifteindir = {question.element.massNumber}
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
