import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import {
  parseStudentNumber,
  revealSpan,
  revealTop,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { PeriodicTable } from './PeriodicTable';
import { ELEMENTS, nameInSentence, type Element } from '../data/elements';
import { particleMisconception } from '../utils/misconceptions';
import { tabletBelowMd } from '../utils/tableLayout';

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
  const question = questions[index];

  // Each screen (teaching, questions, results) starts at its top on a phone,
  // with its heading focused; each new question brings its card back under
  // the top of the screen. The button that moved on has unmounted, and focus
  // would otherwise fall to <body>. A typed question keeps what it always had,
  // focus in its answer field (`data-item-start` is the field there), and a
  // table question focuses the question.
  const screen = showIntro ? 'intro' : done ? 'done' : 'play';
  const inputRef = useRef<HTMLInputElement>(null);
  useScreenTop(screen, { focus: inputRef });
  const itemRef = useItemTop<HTMLDivElement>(index);

  // After an answer the feedback lands below the periodic table, out of sight
  // on a phone: the question through "Næsta" if it fits, else the table the
  // student tapped, else the feedback at the top. Focus moves to the feedback,
  // not to "Næsta", so a second tap or Enter lands on nothing (design P3).
  const tableRef = useRef<HTMLDivElement>(null);
  const feedbackBoxRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: nextRef.current,
    tops: [
      itemRef.current,
      question.requiresTableClick ? tableRef.current : null,
      feedbackRef.current,
    ],
    focus: feedbackRef.current,
  }));
  // "Næsta" ignores a press within 400 ms of appearing, so the second tap of a
  // double tap on "Athuga" or a cell cannot skip the feedback; the results'
  // buttons likewise, after the last "Næsta".
  const armed = useArmedAfter(400, `${index}:${answered}`);
  // One tap on a cell or an option is the answer, so the answers ignore a tap
  // within 400 ms of a question appearing: the second tap of a double tap on
  // "Byrja æfingar" or "Næsta" must not answer a question nobody has read.
  const armedAnswer = useArmedAfter(400, `${screen}:${index}`);
  const armedResults = useArmedAfter(400, done);

  // Opening the hint replaces its button, which dropped focus to <body> and
  // pushed the answer field or the table down: focus moves to the hint, and a
  // phone keeps the hint and what it is about on screen together.
  const hintRef = useRef<HTMLDivElement>(null);
  const answerRowRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(showHint && !answered, () => ({
    bottom: question.requiresTableClick ? tableRef.current : answerRowRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));

  // Below md but wider than a phone, the game's old helper started each screen
  // and each question at the top of the page, in one jump, and brought the feedback into
  // view the way `scrollIntoView({ block: 'nearest' })` does; it still does.
  useLayoutEffect(() => {
    if (tabletBelowMd())
      revealTop(document.documentElement, { anyWidth: true, always: true, instant: true });
  }, [screen, index]);
  useEffect(() => {
    if (answered && tabletBelowMd()) {
      revealSpan(feedbackBoxRef.current, [], { anyWidth: true, gap: 0 });
    }
  }, [answered]);
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
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6 phone:p-6 phone:space-y-4">
          <div className="text-5xl phone:text-4xl">
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
              onClick={armedResults(handleRetry)}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={armedResults(onComplete)}
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
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-4 phone:py-3">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:p-3 phone:mb-3">
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

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-5 animate-fade-in-up phone:space-y-4">
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-2 sm:p-4 phone:p-2">
      <div className="max-w-6xl mx-auto">
        {/* Header: one short row on a phone (design P4) */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-3 phone:py-2 phone:mb-2">
          <div className="flex justify-between items-center gap-2 phone:gap-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3 phone:shrink-0"
            >
              ← Til baka
            </button>
            <h1 className="min-w-0 text-center text-base sm:text-lg font-bold text-warm-800 phone:flex-1 phone:text-base">
              Atómbygging
            </h1>
            <span className="text-sm font-semibold text-warm-600 phone:shrink-0">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-2 h-2 bg-warm-200 rounded-full overflow-hidden phone:mt-1.5 phone:h-1.5">
            <div
              className="h-full bg-kvenno-orange progress-fill"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* A phone on its side (below md, where the table scrolls sideways): the
            question and the answer field | the table, with the feedback across
            both below them. Everywhere else a plain block, so nothing moves. */}
        <div className="max-md:phone-land:grid max-md:phone-land:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] max-md:phone-land:gap-x-3 max-md:phone-land:items-start">
          {/* The item: the question and, for a typed question, its answer field,
            which is where focus lands on a new question. A plain block, so the
            cards' margins pass through it and nothing moves. */}
          <div ref={itemRef}>
            {/* Question */}
            <div
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-3 text-center animate-fade-in-up phone:p-3 phone:mb-2"
              key={index}
            >
              <p
                data-item-start={question.requiresTableClick ? '' : undefined}
                className="text-lg sm:text-xl font-bold text-warm-800 phone:text-lg"
              >
                {question.text}
              </p>
              {question.requiresTableClick && !answered && (
                <p className="text-sm text-warm-500 mt-1">Smelltu á rétt frumefni í lotukerfinu</p>
              )}
              {!answered && !showHint && (
                <button
                  onClick={() => setShowHint(true)}
                  className="mt-3 phone:mt-2 text-sm px-4 py-2 pointer-coarse:min-h-11 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none"
                >
                  💡 Vísbending
                </button>
              )}
              {!answered && showHint && (
                <div
                  ref={hintRef}
                  className="mt-3 phone:mt-2 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 text-sm text-yellow-900 text-left"
                >
                  <span className="font-bold">Vísbending:</span> {hintFor(question)}
                </div>
              )}
            </div>

            {/* Numeric input (for non-table-click questions) */}
            {/* On a phone the label, the field and Athuga share one row. */}
            {!question.requiresTableClick && !answered && (
              <div
                ref={answerRowRef}
                className="bg-white rounded-xl shadow-md p-4 mb-3 max-w-md mx-auto phone:flex phone:items-center phone:gap-2 phone:p-3 phone:mb-2"
              >
                <label className="block text-sm font-medium text-warm-700 mb-2 phone:mb-0 phone:shrink-0">
                  Svar:
                </label>
                <div className="flex gap-3 phone:flex-1 phone:min-w-0 phone:gap-2">
                  <input
                    ref={inputRef}
                    data-item-start
                    type="number"
                    inputMode="numeric"
                    enterKeyHint="done"
                    autoComplete="off"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="t.d. 12"
                    className="flex-1 px-4 py-3 border-2 border-warm-300 rounded-xl focus:border-kvenno-orange focus:outline-none text-lg font-mono phone:min-w-0 phone:px-3 phone:py-2"
                    autoFocus
                  />
                  <button
                    key="check"
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-colors phone:shrink-0 phone:px-4 phone:py-2"
                  >
                    Athuga
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Periodic table */}
          {question.requiresTableClick && (
            <div
              ref={tableRef}
              className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-3 phone:mb-2 phone:p-2 max-md:phone-land:col-start-2 max-md:phone-land:row-start-1"
            >
              <PeriodicTable
                onElementClick={armedAnswer(handleElementClick)}
                highlightedElements={answered ? new Set([question.element.symbol]) : undefined}
                correctElement={answered && isCorrect ? question.element.symbol : null}
                wrongElement={wrongSymbol}
                interactive={!answered}
              />
            </div>
          )}

          {/* Reference table for numeric questions */}
          {!question.requiresTableClick && (
            <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-3 phone:mb-2 phone:p-2 max-md:phone-land:col-start-2 max-md:phone-land:row-start-1">
              <PeriodicTable
                highlightedElements={answered ? new Set([question.element.symbol]) : undefined}
                correctElement={answered ? question.element.symbol : null}
                interactive={false}
              />
            </div>
          )}

          {/* Feedback */}
          {answered && (
            <div
              ref={feedbackBoxRef}
              className="space-y-3 mb-3 max-w-lg mx-auto animate-fade-in-up max-md:phone-land:col-span-2 max-md:phone-land:w-full max-md:phone-land:max-w-none"
            >
              {/* The verdict and the particle breakdown: the region focus moves
                to after an answer. FeedbackPanel keeps its own role="alert".
                On a phone on its side they sit side by side, so the two and
                "Næsta" fit one screen. */}
              <div
                ref={feedbackRef}
                tabIndex={-1}
                role="group"
                className="space-y-3 max-md:phone-land:grid max-md:phone-land:grid-cols-2 max-md:phone-land:gap-3 max-md:phone-land:items-start max-md:phone-land:space-y-0"
              >
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
                <div className="bg-warm-50 rounded-xl border-2 border-warm-200 p-4 phone:p-3">
                  <h3 className="font-bold text-warm-800 mb-2">
                    {question.element.name} ({question.element.symbol})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm phone:gap-2 max-md:phone-land:grid-cols-2">
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
              </div>

              <button
                key="next"
                ref={nextRef}
                onClick={armed(handleNext)}
                className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                {index + 1 < TOTAL ? 'Næsta spurning →' : 'Sjá niðurstöður →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Level3;
