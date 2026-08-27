import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import { shuffleArray } from '@shared/utils';

import { COMPOUNDS, type Compound } from '../data/compounds';
import { getElementBySymbol } from '../data/elements';
import { parseScientificAnswer } from '../utils/parseAnswer';

const AVOGADRO = 6.022e23;
const TOTAL = 10;

export type ConvType =
  | 'mass_to_moles'
  | 'moles_to_mass'
  | 'moles_to_particles'
  | 'particles_to_moles'
  /**
   * Moles of a compound to atoms of one element in it — the step where the
   * subscript in the formula does the work. Harvested from the frozen repo's
   * `avogadro.ts` (`atoms_in_compound`), which is the one conversion of its
   * five that this level did not already ask.
   */
  | 'moles_to_element_atoms';

export interface Problem {
  compound: Compound;
  correctAnswer: number;
  questionText: string;
  solutionFormula: string;
  solutionSteps: string;
}

interface Level2Props {
  onBack: () => void;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
  /** Whether the student has previously completed this level */
  initialProgress?: boolean;
}

function sigfig(n: number, f: number): number {
  if (n === 0) return 0;
  const mag = 10 ** (f - Math.ceil(Math.log10(Math.abs(n))));
  return Math.round(n * mag) / mag;
}

function fmt(n: number): string {
  return Math.abs(n) >= 1e6 ? n.toExponential(3) : sigfig(n, 4).toString();
}

function randRange(min: number, max: number, step: number): number {
  return sigfig(min + Math.floor(Math.random() * (Math.round((max - min) / step) + 1)) * step, 3);
}

/** Does the formula have an element appearing more than once? */
export function hasRepeatedElement(c: Compound): boolean {
  return c.elements.some((e) => e.count > 1);
}

/** Pre-generate all problems using unique compounds */
export function generateAllProblems(): Problem[] {
  const types: ConvType[] = [
    'mass_to_moles',
    'moles_to_mass',
    'moles_to_particles',
    'particles_to_moles',
    'moles_to_element_atoms',
  ];

  // `moles_to_element_atoms` is only a question when a subscript is above one:
  // on NaCl or KCl it collapses into the moles-to-molecules question the level
  // already asks, with a step that multiplies by 1. Those slots draw from the
  // compounds that have a real subscript; the rest draw from anything left.
  const shuffled = shuffleArray(COMPOUNDS);
  const used = new Set<string>();
  const take = (predicate: (c: Compound) => boolean): Compound => {
    const compound = shuffled.find((c) => !used.has(c.formula) && predicate(c)) ?? shuffled[0];
    used.add(compound.formula);
    return compound;
  };

  return Array.from({ length: TOTAL }, (_, i) => {
    const type = types[i % types.length];
    const compound =
      type === 'moles_to_element_atoms' ? take(hasRepeatedElement) : take(() => true);
    return generateProblem(compound, type);
  });
}

export function generateProblem(c: Compound, type: ConvType): Problem {
  const M = c.molarMass;
  const label = `${c.name} (${c.formula})`;

  if (type === 'mass_to_moles') {
    const m = randRange(5, 500, 5);
    const ans = m / M;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hversu mörg mól eru í ${m} g af ${label}?`,
      solutionFormula: 'Einingagreining: g × (1 mól / g) → mól',
      solutionSteps: `${m} g × (1 mól / ${M} g) = ${fmt(ans)} mól\nEiningin g strikast út og mól verður eftir.`,
    };
  }
  if (type === 'moles_to_mass') {
    const n = randRange(0.1, 5.0, 0.1);
    const ans = n * M;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hvað vega ${n} mól af ${label} í grömmum?`,
      solutionFormula: 'Einingagreining: mól × (g / 1 mól) → g',
      solutionSteps: `${n} mól × (${M} g / 1 mól) = ${fmt(ans)} g\nEiningin mól strikast út og g verður eftir.`,
    };
  }
  if (type === 'moles_to_particles') {
    const n = randRange(0.1, 5.0, 0.1);
    const ans = n * AVOGADRO;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hversu margar sameindir eru í ${n} mól af ${label}?`,
      solutionFormula: 'Einingagreining: mól × (sameindir / 1 mól) → sameindir',
      solutionSteps: `${n} mól × (6,022 × 10²³ sameindir / 1 mól) = ${fmt(ans)} sameindir\nEiningin mól strikast út.`,
    };
  }
  if (type === 'moles_to_element_atoms') {
    // Only a question when a subscript is above one. On a flat formula like
    // NaCl this collapses into the moles-to-molecules question with a step
    // that multiplies by 1, so ask that one outright instead.
    // `generateAllProblems` only ever sends a compound with a real subscript.
    if (!hasRepeatedElement(c)) return generateProblem(c, 'moles_to_particles');

    // The element with the largest subscript, so the multiplication is the
    // point of the question.
    const element = [...c.elements].sort((a, b) => b.count - a.count)[0];
    const elementName = getElementBySymbol(element.symbol)?.name ?? element.symbol;
    const n = randRange(0.1, 5.0, 0.1);
    const ans = n * element.count * AVOGADRO;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hversu mörg ${elementName}-atóm (${element.symbol}) eru í ${n} mól af ${label}?`,
      solutionFormula: 'Einingagreining: mól × (atóm af frumefninu / 1 mól) × (atóm / 1 mól)',
      solutionSteps: `Í hverri sameind af ${c.formula} eru ${element.count} ${element.symbol}-atóm.\n${n} mól × (${element.count} mól ${element.symbol} / 1 mól ${c.formula}) × (6,022 × 10²³ atóm / 1 mól) = ${fmt(ans)} atóm\nEiningin mól strikast út tvisvar.`,
    };
  }

  // particles_to_moles
  const coeff = randRange(0.5, 9.0, 0.5);
  const ans = (coeff * 1e23) / AVOGADRO;
  return {
    compound: c,
    correctAnswer: ans,
    questionText: `Hversu mörg mól eru ${coeff} × 10²³ sameindir?`,
    solutionFormula: 'Einingagreining: sameindir × (1 mól / sameindir) → mól',
    solutionSteps: `${coeff} × 10²³ sameindir × (1 mól / 6,022 × 10²³ sameindir) = ${fmt(ans)} mól\nEiningin sameindir strikast út.`,
  };
}

function withinTolerance(user: number, correct: number): boolean {
  if (correct === 0) return Math.abs(user) < 0.001;
  return Math.abs(user - correct) / Math.abs(correct) <= 0.05;
}

export function Level2({
  onBack,
  onComplete,
  onCorrectAnswer,
  onIncorrectAnswer,
  initialProgress,
}: Level2Props) {
  const [showIntro, setShowIntro] = useState(!initialProgress);
  useEscapeKey(onBack, showIntro);
  const [problems, setProblems] = useState<Problem[]>(generateAllProblems);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);

  const problem = problems[idx];

  const submit = () => {
    if (feedback) return;
    const v = parseScientificAnswer(input);
    if (v === null) return;
    const ok = withinTolerance(v, problem.correctAnswer);
    setCorrect(ok);
    setFeedback(true);
    if (ok) {
      setScore((s) => s + 10);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const next = () => {
    if (idx + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setInput('');
    setFeedback(false);
  };

  const retry = () => {
    setProblems(generateAllProblems());
    setIdx(0);
    setInput('');
    setScore(0);
    setFeedback(false);
    setDone(false);
  };

  // ==================== TEACHING INTRO ====================
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <button
                onClick={onBack}
                className="text-warm-500 hover:text-warm-700 font-semibold text-sm"
              >
                ← Til baka
              </button>
              <h1 className="text-lg font-bold text-warm-800">Mól-umbreytingar — Kennsla</h1>
              <span className="text-sm text-warm-500">Stig 2</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
            {/* What is a mole? */}
            <div>
              <h2 className="text-xl font-bold text-warm-800 mb-2">Hvað er mól?</h2>
              <p className="text-warm-700">
                Ein mól er 6,022 × 10²³ eindir — jafn margar og atóm í 12 g af kolefni-12. Þetta er{' '}
                <strong>Avogadro-talan</strong>.
              </p>
            </div>

            {/* Three key relationships */}
            <div>
              <h3 className="text-lg font-bold text-warm-800 mb-3">Þrjú lykilsambönd</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-mono text-blue-800 text-center">
                    massi (g) ÷ mólmassi (g/mól) = fjöldi móla
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="font-mono text-purple-800 text-center">
                    fjöldi móla × 6,022 × 10²³ = fjöldi einda
                  </p>
                </div>
                <div className="bg-warm-50 border border-warm-200 rounded-lg p-3 text-sm text-warm-700 text-center">
                  Þetta er bara margföldun og deiling — sama einingagreining og í Stigi 1.
                </div>
              </div>
            </div>

            {/* How big Avogadro's number actually is. Harvested with the
                problems: the level named the number and moved straight to
                arithmetic with it, which teaches it as a symbol rather than a
                quantity. */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 mb-2">Hversu stór er þessi tala?</h3>
              <ul className="text-sm text-amber-900 space-y-2 list-disc list-inside">
                <li>
                  Ef þú teldir eina milljón atóma á sekúndu tæki það um{' '}
                  <strong>19 milljarða ára</strong> að telja eitt mól — meira en aldur alheimsins.
                </li>
                <li>
                  Eitt mól af borðtenniskúlum myndi hylja alla jörðina í um{' '}
                  <strong>60 km þykku lagi</strong>.
                </li>
                <li>
                  Í einu glasi af vatni (250 mL) eru um <strong>8 × 10²⁴ sameindir</strong> — meira
                  en tíu mól.
                </li>
              </ul>
            </div>

            {/* Worked example */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-800 mb-2">Dæmi: Vatn (H₂O)</h3>
              <p className="text-green-700 text-sm mb-3">
                Mólmassi vatns er 18,02 g/mól. Það þýðir að 18,02 g af vatni er nákvæmlega 1 mól.
              </p>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <p className="text-sm text-warm-700">
                  <strong>Spurning:</strong> Hversu margar vatnssameindir eru í 1 móli?
                </p>
                <p className="font-mono text-warm-800 text-center text-sm">
                  1 mól × 6,022 × 10²³ = 6,022 × 10²³ sameindir
                </p>
              </div>
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

  // ==================== SUMMARY SCREEN ====================
  if (done) {
    const passed = score >= 60;
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">{passed ? '🎉' : '📚'}</div>
            <h2 className="text-2xl font-bold text-warm-800 mb-2">
              {passed ? 'Vel gert!' : 'Haltu áfram að æfa!'}
            </h2>
            <p className="text-warm-600 mb-6">
              Þú fékkst {score} af {TOTAL * 10} stigum
            </p>
            <div className="h-3 bg-warm-200 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full transition-all duration-700 ${passed ? 'bg-green-500' : 'bg-kvenno-orange'}`}
                style={{ width: `${(score / (TOTAL * 10)) * 100}%` }}
              />
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={retry}
                className="bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Reyna aftur
              </button>
              {passed && (
                <button
                  onClick={() => onComplete(score, TOTAL * 10, 0)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Ljúka stigi →
                </button>
              )}
            </div>
            <button
              onClick={onBack}
              className="mt-4 text-warm-500 hover:text-warm-700 font-semibold py-2"
            >
              ← Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-warm-800">Mól-umbreytingar - Stig 2</h1>
              <p className="text-sm text-warm-600">Massi, mól og sameindir</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-kvenno-orange">{score}</div>
              <div className="text-xs text-warm-600">Stig</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-warm-500 mb-1">
              <span>
                Dæmi {idx + 1}/{TOTAL}
              </span>
              <span>
                {score}/{TOTAL * 10}
              </span>
            </div>
            <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-kvenno-orange transition-all duration-500"
                style={{ width: `${((idx + 1) / TOTAL) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dimensional analysis reference */}
        <div className="bg-white/80 border border-warm-200 rounded-xl p-3 mb-4">
          <div className="text-center text-xs text-warm-500 mb-2">
            Einingagreining — umbreytingarstuðlar
          </div>
          <div className="text-sm font-mono text-warm-700 space-y-1 text-center">
            <div>
              g → mól: margfaldaðu með <span className="font-bold">(1 mól / M g)</span>
            </div>
            <div>
              mól → g: margfaldaðu með <span className="font-bold">(M g / 1 mól)</span>
            </div>
            <div>
              mól → sameindir: margfaldaðu með{' '}
              <span className="font-bold">(6,022×10²³ / 1 mól)</span>
            </div>
          </div>
          <div className="text-center text-xs text-warm-400 mt-2">
            M = mólmassi (g/mol) — einingin sem á að hverfa fer í nefnara
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4" key={idx}>
          <p className="text-lg text-warm-800 font-medium mb-6">{problem.questionText}</p>

          {!feedback && (
            <div className="flex gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Svar..."
                autoFocus
                className="flex-1 border-2 border-warm-200 focus:border-kvenno-orange rounded-xl px-4 py-3 text-lg outline-none transition-colors"
              />
              <button
                onClick={submit}
                disabled={!input.trim()}
                className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Svara
              </button>
            </div>
          )}

          {feedback && (
            <div className="mt-2 space-y-3">
              <FeedbackPanel
                feedback={{
                  isCorrect: correct,
                  explanation: `${problem.solutionFormula}\n${problem.solutionSteps}`,
                  misconception: correct
                    ? undefined
                    : 'Notaðu einingagreiningu: settu eininguna sem á að hverfa í nefnara umbreytingarstuðulsins.',
                }}
                config={{
                  showExplanation: true,
                  showMisconceptions: true,
                  showRelatedConcepts: false,
                  showNextSteps: false,
                }}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">Útreikningur:</p>
                <p className="font-mono">{problem.solutionFormula}</p>
                <p className="font-mono">{problem.solutionSteps}</p>
              </div>
              <button
                onClick={next}
                className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                {idx + 1 < TOTAL ? 'Næsta dæmi →' : 'Sjá niðurstöður →'}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full text-warm-500 hover:text-warm-700 font-semibold py-2"
        >
          ← Til baka í valmynd
        </button>
      </div>
    </div>
  );
}

export default Level2;
