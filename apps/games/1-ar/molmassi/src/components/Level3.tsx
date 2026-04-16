import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { shuffleArray } from '@shared/utils';

import { PeriodicTable } from './PeriodicTable';
import { COMPOUNDS, type Compound } from '../data/compounds';

const AVOGADRO = 6.022e23;
const TOTAL_QUESTIONS = 8;

type ProblemType = 'mass-to-particles' | 'particles-to-mass' | 'mass-to-moles-of-atom';

interface Problem {
  type: ProblemType;
  question: string;
  answer: number;
  unit: string;
  steps: string[];
}

// --- Compact problem descriptors ---
type Desc =
  | {
      type: 'mass-to-particles';
      formula: string;
      mass: number;
      massLabel: string;
      particleWord: string;
    }
  | {
      type: 'particles-to-mass';
      formula: string;
      count: number;
      countLabel: string;
      particleWord: string;
    }
  | {
      type: 'mass-to-moles-of-atom';
      formula: string;
      mass: number;
      massLabel: string;
      element: string;
      elementName: string;
      atomCount: number;
    };

const DESCRIPTORS: Desc[] = [
  // mass -> particles (6)
  {
    type: 'mass-to-particles',
    formula: 'H\u2082O',
    mass: 36,
    massLabel: '36',
    particleWord: 'sameindir',
  },
  {
    type: 'mass-to-particles',
    formula: 'CO\u2082',
    mass: 88,
    massLabel: '88',
    particleWord: 'sameindir',
  },
  {
    type: 'mass-to-particles',
    formula: 'NaCl',
    mass: 117,
    massLabel: '117',
    particleWord: 'formúlueiningar',
  },
  {
    type: 'mass-to-particles',
    formula: 'CH\u2084',
    mass: 8,
    massLabel: '8,0',
    particleWord: 'sameindir',
  },
  {
    type: 'mass-to-particles',
    formula: 'NH\u2083',
    mass: 34,
    massLabel: '34',
    particleWord: 'sameindir',
  },
  {
    type: 'mass-to-particles',
    formula: 'O\u2082',
    mass: 64,
    massLabel: '64',
    particleWord: 'sameindir',
  },
  // particles -> mass (4)
  {
    type: 'particles-to-mass',
    formula: 'CO\u2082',
    count: 3.011e23,
    countLabel: '3,011 \u00d7 10\u00b2\u00b3',
    particleWord: 'sameindir',
  },
  {
    type: 'particles-to-mass',
    formula: 'H\u2082O',
    count: 1.2044e24,
    countLabel: '1,204 \u00d7 10\u00b2\u2074',
    particleWord: 'sameindir',
  },
  {
    type: 'particles-to-mass',
    formula: 'HCl',
    count: 6.022e23,
    countLabel: '6,022 \u00d7 10\u00b2\u00b3',
    particleWord: 'sameindir',
  },
  {
    type: 'particles-to-mass',
    formula: 'NaOH',
    count: 1.8066e24,
    countLabel: '1,807 \u00d7 10\u00b2\u2074',
    particleWord: 'formúlueiningar',
  },
  // mass -> moles of atom (5)
  {
    type: 'mass-to-moles-of-atom',
    formula: 'C\u2086H\u2081\u2082O\u2086',
    mass: 180,
    massLabel: '180',
    element: 'O',
    elementName: 'súrefnisatómum',
    atomCount: 6,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'H\u2082O',
    mass: 90,
    massLabel: '90',
    element: 'H',
    elementName: 'vetni',
    atomCount: 2,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'H\u2082SO\u2084',
    mass: 196,
    massLabel: '196',
    element: 'O',
    elementName: 'súrefnisatómum',
    atomCount: 4,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'CaCO\u2083',
    mass: 200,
    massLabel: '200',
    element: 'O',
    elementName: 'súrefnisatómum',
    atomCount: 3,
  },
  {
    type: 'mass-to-moles-of-atom',
    formula: 'C\u2082H\u2085OH',
    mass: 46,
    massLabel: '46',
    element: 'C',
    elementName: 'kolefnisatómum',
    atomCount: 2,
  },
];

function find(formula: string): Compound {
  const c = COMPOUNDS.find((c) => c.formula === formula);
  if (!c) throw new Error(`Compound ${formula} not found`);
  return c;
}

function fmtSci(n: number): string {
  if (Math.abs(n) < 1000 && Math.abs(n) >= 0.01) return n.toPrecision(3);
  const exp = Math.floor(Math.log10(Math.abs(n)));
  return `${(n / 10 ** exp).toFixed(2)} \u00d7 10^${exp}`;
}

function buildProblem(d: Desc): Problem {
  const c = find(d.formula);
  const M = c.molarMass;
  if (d.type === 'mass-to-particles') {
    const n = d.mass / M;
    const N = n * AVOGADRO;
    return {
      type: d.type,
      question: `Hversu margar ${d.particleWord} eru í ${d.massLabel} g af ${c.name.toLowerCase()} (${c.formula})?`,
      answer: N,
      unit: d.particleWord,
      steps: [
        `Skref 1: Finna mólmassa\n  M(${c.formula}) = ${M.toFixed(3)} g/mol`,
        `Skref 2: g → mól (einingagreining)\n  ${d.mass} g × (1 mól / ${M.toFixed(3)} g) = ${n.toFixed(3)} mól\n  Einingin g strikast út.`,
        `Skref 3: mól → ${d.particleWord} (einingagreining)\n  ${n.toFixed(3)} mól × (6,022 × 10²³ / 1 mól) = ${fmtSci(N)} ${d.particleWord}\n  Einingin mól strikast út.`,
      ],
    };
  }
  if (d.type === 'particles-to-mass') {
    const n = d.count / AVOGADRO;
    const m = n * M;
    return {
      type: d.type,
      question: `Hvað vega ${d.countLabel} ${d.particleWord} af ${c.name.toLowerCase()} (${c.formula}) í grömmum?`,
      answer: m,
      unit: 'g',
      steps: [
        `Skref 1: Finna mólmassa\n  M(${c.formula}) = ${M.toFixed(3)} g/mol`,
        `Skref 2: ${d.particleWord} → mól (einingagreining)\n  ${d.countLabel} × (1 mól / 6,022 × 10²³) = ${n.toFixed(3)} mól\n  Einingin ${d.particleWord} strikast út.`,
        `Skref 3: mól → g (einingagreining)\n  ${n.toFixed(3)} mól × (${M.toFixed(3)} g / 1 mól) = ${m.toFixed(2)} g\n  Einingin mól strikast út.`,
      ],
    };
  }
  // mass-to-moles-of-atom
  const n = d.mass / M;
  const nAtom = n * d.atomCount;
  return {
    type: d.type,
    question: `Hversu mörg mól af ${d.elementName} (${d.element}) eru í ${d.massLabel} g af ${c.name.toLowerCase()} (${c.formula})?`,
    answer: nAtom,
    unit: 'mól',
    steps: [
      `Skref 1: Finna mólmassa\n  M(${c.formula}) = ${M.toFixed(2)} g/mol`,
      `Skref 2: g → mól (einingagreining)\n  ${d.mass} g × (1 mól / ${M.toFixed(2)} g) = ${n.toFixed(3)} mól ${c.formula}\n  Einingin g strikast út.`,
      `Skref 3: Nota hlutfallið úr efnaformúlunni\n  Í hverju móli af ${c.formula} eru ${d.atomCount} mól af ${d.element}\n  ${n.toFixed(3)} mól ${c.formula} × (${d.atomCount} mól ${d.element} / 1 mól ${c.formula}) = ${nAtom.toFixed(2)} mól ${d.element}`,
    ],
  };
}

function parseAnswer(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, '.').replace(/\s+/g, '');
  const direct = parseFloat(cleaned);
  if (!isNaN(direct) && isFinite(direct)) return direct;
  const m = cleaned.match(/^([+-]?\d+\.?\d*)[x*\u00d7]10\^([+-]?\d+)$/i);
  if (m) {
    const val = parseFloat(m[1]) * 10 ** parseInt(m[2]);
    if (isFinite(val)) return val;
  }
  return null;
}

function withinTolerance(user: number, correct: number): boolean {
  if (correct === 0) return Math.abs(user) < 1e-10;
  return Math.abs(user - correct) / Math.abs(correct) <= 0.05;
}

// --- Props ---
interface Level3Props {
  onBack: () => void;
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

  const submit = () => {
    if (!p || !input.trim()) return;
    const val = parseAnswer(input);
    if (val === null) {
      setError('Ógilt gildi. Notaðu t.d. 1.2e24 eða 1.2x10^24');
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
          <h2 className="text-3xl font-bold text-warm-800 mb-2">Æfing lokið!</h2>
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
              onClick={retry}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={onBack}
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
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-warm-800">Samþætt æfing — Stig 3</h2>
            <p className="text-sm text-warm-500">
              Spurning {idx + 1} af {TOTAL_QUESTIONS}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-green-600">{score} rétt</span>
            <button
              onClick={() => setShowPT(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              Lotukerfið
            </button>
            <button
              onClick={onBack}
              className="bg-warm-200 hover:bg-warm-300 text-warm-700 text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              Til baka
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-4">
          <div
            className="bg-kvenno-orange h-2 rounded-full transition-all duration-300"
            style={{ width: `${(idx / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>

        {p && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4 card-enter">
            {/* Type badge */}
            <div className="mb-4">
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
                  ? 'Massi \u2192 Sameindir'
                  : p.type === 'particles-to-mass'
                    ? 'Sameindir \u2192 Massi'
                    : 'Massi \u2192 Mól af atómi'}
              </span>
            </div>

            <p className="text-lg font-semibold text-warm-800 mb-6">{p.question}</p>

            {/* Input */}
            <div className="max-w-md">
              <label className="block text-sm font-medium text-warm-600 mb-1">
                Svar ({p.unit}):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (submitted) next();
                      else submit();
                    }
                  }}
                  disabled={submitted}
                  placeholder="t.d. 1.2e24 eða 22.0"
                  className={`flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:outline-none ${error ? 'border-red-400' : 'border-warm-300 focus:border-kvenno-orange'}`}
                />
                {!submitted ? (
                  <button
                    onClick={submit}
                    disabled={!input.trim()}
                    className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:bg-warm-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                  >
                    Svara
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                  >
                    {idx + 1 < TOTAL_QUESTIONS ? 'Næsta \u2192' : 'Sjá niðurstöðu'}
                  </button>
                )}
              </div>
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              <p className="text-xs text-warm-400 mt-1">
                Hægt að nota vísisrithátt: 1.2e24, 1.2x10^24, eða venjulega tölu
              </p>
            </div>

            {/* Feedback + solution */}
            {submitted && (
              <div className="mt-6 space-y-4 animate-fade-in-up">
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
                <div className="bg-warm-50 border border-warm-200 rounded-xl p-4">
                  <h3 className="font-bold text-warm-700 mb-3">Lausnarleiðin:</h3>
                  <div className="space-y-3">
                    {p.steps.map((step, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-warm-100">
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
