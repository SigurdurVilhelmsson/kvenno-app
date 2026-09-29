import { useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  formatDecimal,
  formatScientific,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { PeriodicTable } from './PeriodicTable';
import { atomWord } from '../data/atomWords';
import { COMPOUNDS, type Compound } from '../data/compounds';
import { parseScientificAnswer } from '../utils/parseAnswer';

const AVOGADRO = 6.022e23;
const TOTAL_QUESTIONS = 8;

type ProblemType = 'mass-to-particles' | 'particles-to-mass' | 'mass-to-moles-of-atom';

interface Problem {
  type: ProblemType;
  question: string;
  answer: number;
  unit: string;
  steps: string[];
  /** `sameindir`, or `formúlueiningar` for an ionic compound; names the badge. */
  particles: string;
}

// --- Compact problem descriptors ---
type Desc =
  | {
      type: 'mass-to-particles';
      formula: string;
      mass: number;
      massLabel: string;
    }
  | {
      type: 'particles-to-mass';
      formula: string;
      count: number;
      countLabel: string;
    }
  | {
      type: 'mass-to-moles-of-atom';
      formula: string;
      mass: number;
      massLabel: string;
      element: string;
      atomCount: number;
    };

export const DESCRIPTORS: Desc[] = [
  // mass -> particles (6)
  {
    type: 'mass-to-particles',
    formula: 'H\u2082O',
    mass: 36,
    massLabel: '36',
  },
  {
    type: 'mass-to-particles',
    formula: 'CO\u2082',
    mass: 88,
    massLabel: '88',
  },
  {
    type: 'mass-to-particles',
    formula: 'NaCl',
    mass: 117,
    massLabel: '117',
  },
  {
    type: 'mass-to-particles',
    formula: 'CH\u2084',
    mass: 8,
    massLabel: '8,0',
  },
  {
    type: 'mass-to-particles',
    formula: 'NH\u2083',
    mass: 34,
    massLabel: '34',
  },
  {
    type: 'mass-to-particles',
    formula: 'O\u2082',
    mass: 64,
    massLabel: '64',
  },
  // particles -> mass (4)
  {
    type: 'particles-to-mass',
    formula: 'CO\u2082',
    count: 3.011e23,
    countLabel: '3,011 \u00d7 10\u00b2\u00b3',
  },
  {
    type: 'particles-to-mass',
    formula: 'H\u2082O',
    count: 1.2044e24,
    countLabel: '1,204 \u00d7 10\u00b2\u2074',
  },
  {
    type: 'particles-to-mass',
    formula: 'HCl',
    count: 6.022e23,
    countLabel: '6,022 \u00d7 10\u00b2\u00b3',
  },
  {
    type: 'particles-to-mass',
    formula: 'NaOH',
    count: 1.8066e24,
    countLabel: '1,807 \u00d7 10\u00b2\u2074',
  },
  // mass -> moles of atom (5)
  {
    type: 'mass-to-moles-of-atom',
    formula: 'C\u2086H\u2081\u2082O\u2086',
    mass: 180,
    massLabel: '180',
    element: 'O',
    atomCount: 6,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'H\u2082O',
    mass: 90,
    massLabel: '90',
    element: 'H',
    atomCount: 2,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'H\u2082SO\u2084',
    mass: 196,
    massLabel: '196',
    element: 'O',
    atomCount: 4,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'CaCO\u2083',
    mass: 200,
    massLabel: '200',
    element: 'O',
    atomCount: 3,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'C\u2082H\u2085OH',
    mass: 46,
    massLabel: '46',
    element: 'C',
    atomCount: 2,
  },
];

function find(formula: string): Compound {
  const c = COMPOUNDS.find((c) => c.formula === formula);
  if (!c) throw new Error(`Compound ${formula} not found`);
  return c;
}

/**
 * A result to three significant figures, as a student reads it: Icelandic
 * decimal comma, and Avogadro-scale values as `1,20 × 10²⁴` rather than
 * `× 10^24` — which `parseScientificAnswer` reads back, superscripts and all.
 */
function fmtSci(n: number): string {
  if (Math.abs(n) < 1000 && Math.abs(n) >= 0.01) {
    // Three significant figures, trailing zeros kept (`36,0`), as toPrecision.
    return formatDecimal(n, Math.max(0, 2 - Math.floor(Math.log10(Math.abs(n)))));
  }
  return formatScientific(n, 3);
}

export function buildProblem(d: Desc): Problem {
  const c = find(d.formula);
  const M = c.molarMass;
  // Molecules, or formula units for an ionic compound — derived from the
  // compound rather than written beside each problem.
  const particles = c.ionic ? 'formúlueiningar' : 'sameindir';
  if (d.type === 'mass-to-particles') {
    const n = d.mass / M;
    const N = n * AVOGADRO;
    return {
      type: d.type,
      question: `Hversu margar ${particles} eru í ${d.massLabel} g af ${c.nameDative} (${c.formula})?`,
      answer: N,
      unit: particles,
      particles,
      steps: [
        `Skref 1: Finna mólmassa\n  M(${c.formula}) = ${formatDecimal(M, 3)} g/mól`,
        `Skref 2: g → mól (einingagreining)\n  ${d.mass} g × (1 mól / ${formatDecimal(M, 3)} g) = ${formatDecimal(n, 3)} mól\n  Einingin g strikast út.`,
        `Skref 3: mól → ${particles} (einingagreining)\n  ${formatDecimal(n, 3)} mól × (6,022 × 10²³ / 1 mól) = ${fmtSci(N)} ${particles}\n  Einingin mól strikast út.`,
      ],
    };
  }
  if (d.type === 'particles-to-mass') {
    const n = d.count / AVOGADRO;
    const m = n * M;
    return {
      type: d.type,
      question: `Hvað vega ${d.countLabel} ${particles} af ${c.nameDative} (${c.formula}) í grömmum?`,
      answer: m,
      unit: 'g',
      particles,
      steps: [
        `Skref 1: Finna mólmassa\n  M(${c.formula}) = ${formatDecimal(M, 3)} g/mól`,
        `Skref 2: ${particles} → mól (einingagreining)\n  ${d.countLabel} × (1 mól / 6,022 × 10²³) = ${formatDecimal(n, 3)} mól\n  Einingin ${particles} strikast út.`,
        `Skref 3: mól → g (einingagreining)\n  ${formatDecimal(n, 3)} mól × (${formatDecimal(M, 3)} g / 1 mól) = ${formatDecimal(m, 2)} g\n  Einingin mól strikast út.`,
      ],
    };
  }
  // mass-to-moles-of-atom
  const n = d.mass / M;
  const nAtom = n * d.atomCount;
  return {
    type: d.type,
    // `mól af súrefnisatómum`, dative plural, for every element alike: the
    // hydrogen problem said `mól af vetni`, which a student can fairly read as
    // moles of H₂ and so answer half the key.
    question: `Hversu mörg mól af ${atomWord(d.element)}um (${d.element}) eru í ${d.massLabel} g af ${c.nameDative} (${c.formula})?`,
    answer: nAtom,
    unit: 'mól',
    particles,
    steps: [
      `Skref 1: Finna mólmassa\n  M(${c.formula}) = ${formatDecimal(M, 2)} g/mól`,
      `Skref 2: g → mól (einingagreining)\n  ${d.mass} g × (1 mól / ${formatDecimal(M, 2)} g) = ${formatDecimal(n, 3)} mól ${c.formula}\n  Einingin g strikast út.`,
      `Skref 3: Nota hlutfallið úr efnaformúlunni\n  Í hverju móli af ${c.formula} eru ${d.atomCount} mól af ${d.element}\n  ${formatDecimal(n, 3)} mól ${c.formula} × (${d.atomCount} mól ${d.element} / 1 mól ${c.formula}) = ${formatDecimal(nAtom, 2)} mól ${d.element}`,
    ],
  };
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function withinTolerance(user: number, correct: number): boolean {
  if (correct === 0) return Math.abs(user) < 1e-10;
  return Math.abs(user - correct) / Math.abs(correct) <= 0.05;
}

// --- Props ---
interface Level3Props {
  onBack: () => void;
  /**
   * Called as the last answer is left and the summary opens. It records the
   * level and must not navigate: the summary is the screen it leads to, with
   * its own buttons for trying again and going back.
   */
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level3({ onBack, onComplete, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [problems, setProblems] = useState(() =>
    shuffleArray(DESCRIPTORS.map(buildProblem)).slice(0, TOTAL_QUESTIONS)
  );
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed] = useState(0);
  const [showPT, setShowPT] = useState(false);
  const [error, setError] = useState('');

  const done = idx >= TOTAL_QUESTIONS;
  const p = done ? null : problems[idx];

  // The results, and a new run from them, start at the top on a phone with
  // the heading focused.
  useScreenTop(done);
  // Each new question brings its card back under the top edge on a phone, and
  // focus goes to the question (`data-item-start`).
  const cardRef = useItemTop<HTMLDivElement>(idx);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const answerRowRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  // After Svara, Næsta takes its place beside the answer and the verdict opens
  // below them: the question down to the verdict if it fits, else the answer
  // row and the verdict; the worked solution under it is read by scrolling.
  // Focus moves to the feedback, not to Næsta (design P3).
  useRevealAfterCommit(submitted, () => ({
    bottom: feedbackRef.current?.querySelector('.feedback-panel') ?? feedbackRef.current,
    tops: [questionRef.current, answerRowRef.current],
    focus: feedbackRef.current,
  }));
  // Næsta is its own element, not Svara relabelled, and a press within 400 ms
  // of it appearing is dropped, so a double tap on Svara cannot skip the
  // feedback; the results buttons likewise.
  const armed = useArmedAfter(400, `${idx}:${submitted}`);
  const armedResults = useArmedAfter(400, done);

  const submit = () => {
    if (!p || !input.trim()) return;
    const val = parseScientificAnswer(input);
    if (val === null) {
      setError('Ógilt gildi. Notaðu t.d. 2,5e20 eða 2,5 × 10^20');
      return;
    }
    const ok = withinTolerance(val, p.answer);
    setCorrect(ok);
    setSubmitted(true);
    setError('');
    if (ok) {
      setScore((s) => s + 1);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const next = () => {
    const ni = idx + 1;
    if (ni >= TOTAL_QUESTIONS) {
      // Shows the summary below; `onComplete` only records the level.
      setIdx(ni);
      onComplete(score, TOTAL_QUESTIONS, hintsUsed);
      return;
    }
    setIdx(ni);
    setInput('');
    setSubmitted(false);
    setCorrect(false);
    setError('');
  };

  const retry = () => {
    setProblems(shuffleArray(DESCRIPTORS.map(buildProblem)).slice(0, TOTAL_QUESTIONS));
    setIdx(0);
    setInput('');
    setSubmitted(false);
    setCorrect(false);
    setScore(0);
    setError('');
  };

  // --- Summary ---
  if (done) {
    const pct = Math.round((score / TOTAL_QUESTIONS) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 animate-fade-in-up text-center">
          <h2 className="text-3xl font-bold text-warm-800 mb-2">Æfingu lokið!</h2>
          <p className="text-warm-600 mb-6">Samþætt mól-æfing</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600">
                {score}/{TOTAL_QUESTIONS}
              </div>
              <div className="text-sm text-warm-600">Rétt svör</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600">{pct}%</div>
              <div className="text-sm text-warm-600">Árangur</div>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={armedResults(retry)}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={armedResults(onBack)}
              className="w-full bg-warm-100 hover:bg-warm-200 text-warm-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Playing ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header. On a phone it is tighter; the title and its counter still
            take a row of their own above the controls, which need the width. */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-wrap justify-between items-center gap-3 phone:px-3 phone:py-2 phone:mb-3 phone:gap-2">
          <div>
            <h2 className="text-lg font-bold text-warm-800 phone:text-base">
              Samþætt æfing — Stig 3
            </h2>
            <p className="text-sm text-warm-500">
              Spurning {idx + 1} af {TOTAL_QUESTIONS}
            </p>
          </div>
          {/* At 320px the three only fit on one row with a narrower gap. */}
          <div className="flex items-center gap-2 min-[360px]:gap-3 whitespace-nowrap">
            <span className="text-sm font-semibold text-green-600">{score} rétt</span>
            <button
              onClick={() => setShowPT(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 pointer-coarse:min-h-11 rounded-lg transition-colors"
            >
              Lotukerfið
            </button>
            <button
              onClick={onBack}
              className="bg-warm-200 hover:bg-warm-300 text-warm-700 text-sm font-semibold py-2 px-3 pointer-coarse:min-h-11 rounded-lg transition-colors"
            >
              Til baka
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-4 phone:h-1.5 phone:mb-3">
          <div
            className="bg-kvenno-orange h-2 phone:h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(idx / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>

        {p && (
          <div
            ref={cardRef}
            className="bg-white rounded-xl shadow-lg p-6 mb-4 card-enter phone:p-4 phone:mb-3"
          >
            {/* Type badge */}
            <div className="mb-4 phone:mb-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  p.type === 'mass-to-particles'
                    ? 'bg-blue-100 text-blue-700'
                    : p.type === 'particles-to-mass'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-teal-100 text-teal-700'
                }`}
              >
                {p.type === 'mass-to-particles'
                  ? `Massi \u2192 ${capitalize(p.particles)}`
                  : p.type === 'particles-to-mass'
                    ? `${capitalize(p.particles)} \u2192 Massi`
                    : 'Massi \u2192 Mól af atómi'}
              </span>
            </div>

            <p
              ref={questionRef}
              data-item-start
              className="text-lg font-semibold text-warm-800 mb-6 phone:mb-3"
            >
              {p.question}
            </p>

            {/* Input */}
            <div className="max-w-md">
              <label className="block text-sm font-medium text-warm-600 mb-1">
                Svar ({p.unit}):
              </label>
              <div ref={answerRowRef} className="flex gap-2">
                {/* No inputMode="decimal" here, deliberately: most answers in this
                    level are Avogadro-scale, and a phone's decimal keypad has no
                    `e`, `×` or `^` to write them with. type="text" keeps the comma.
                    The examples here, in the line below and in the error must not
                    be answers: they were `1,2e24` and `22,0`, and five of the six
                    mass-to-molecules problems come to 1,20 × 10²⁴ while CO₂'s
                    particles-to-mass one comes to 22,0 g. */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (submitted) armed(next)();
                      else submit();
                    }
                  }}
                  enterKeyHint="done"
                  disabled={submitted}
                  placeholder="t.d. 2,5e20 eða 12,5"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className={`flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:outline-none phone:min-w-0 phone:px-3 ${error ? 'border-red-400' : 'border-warm-300 focus:border-kvenno-orange'}`}
                />
                {/* Two elements, keyed apart: React would otherwise reuse the
                    Svara button as Næsta, and the second tap of a double tap
                    would press it. */}
                {!submitted ? (
                  <button
                    key="check"
                    onClick={submit}
                    disabled={!input.trim()}
                    className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:bg-warm-300 text-white font-bold px-6 py-3 rounded-xl transition-colors phone:shrink-0 phone:px-4"
                  >
                    Svara
                  </button>
                ) : (
                  <button
                    key="next"
                    onClick={armed(next)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors phone:shrink-0 phone:px-4"
                  >
                    {idx + 1 < TOTAL_QUESTIONS ? 'Næsta \u2192' : 'Sjá niðurstöðu'}
                  </button>
                )}
              </div>
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              <p className="text-xs text-warm-400 mt-1">
                Hægt að nota vísisrithátt: 2,5e20, 2,5 × 10^20, eða venjulega tölu
              </p>
            </div>

            {/* Feedback + solution */}
            {/* The verdict and the worked solution: the region focus moves to
                after Svara. FeedbackPanel keeps its own role="alert". */}
            {submitted && (
              <div
                ref={feedbackRef}
                tabIndex={-1}
                role="group"
                className="mt-6 space-y-4 animate-fade-in-up phone:mt-3 phone:space-y-3"
              >
                <FeedbackPanel
                  feedback={{
                    isCorrect: correct,
                    explanation: correct
                      ? 'Vel gert! Þú reiknaðir öll skrefin rétt.'
                      : `Rétt svar: ${fmtSci(p.answer)} ${p.unit}`,
                  }}
                  config={{
                    showExplanation: true,
                    showMisconceptions: false,
                    showRelatedConcepts: false,
                    showNextSteps: false,
                  }}
                />
                <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 phone:p-3">
                  <h3 className="font-bold text-warm-700 mb-3 phone:mb-2">Lausnarleiðin:</h3>
                  <div className="space-y-3 phone:space-y-2">
                    {p.steps.map((step, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg p-3 border border-warm-100 phone:p-2"
                      >
                        <pre className="text-sm text-warm-700 whitespace-pre-wrap font-sans">
                          {step}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showPT && <PeriodicTable onClose={() => setShowPT(false)} />}
    </div>
  );
}

export default Level3;
