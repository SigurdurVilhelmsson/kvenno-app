import { useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import {
  formatDecimal,
  formatScientific,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { atomWord } from '../data/atomWords';
import { COMPOUNDS, STANDARD_MOLAR_VOLUME, STP_LABEL, type Compound } from '../data/compounds';
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
  | 'moles_to_element_atoms'
  /**
   * Moles of a gas to its volume at STP, and back. The third leg of the mole
   * chain: mass, particles, and — for a gas only — volume. Both directions,
   * matching how the mass and particle conversions are already asked.
   */
  | 'moles_to_gas_volume'
  | 'gas_volume_to_moles';

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

/**
 * A result as a student reads it: four significant figures, Icelandic decimal
 * comma, and Avogadro-scale values as `1,204 × 10²⁴` — which
 * `parseScientificAnswer` reads back, superscripts and all.
 */
function fmt(n: number): string {
  return Math.abs(n) >= 1e6 ? formatScientific(n, 4) : formatDecimal(sigfig(n, 4));
}

/**
 * A molar mass as printed in a worked solution: two decimals, as the intro's
 * `18,02 g/mól` does. The value itself is summed from the atomic masses and
 * carries float noise (HCl is 36.458000000000006), which must not reach the
 * screen; the answer is still graded against the unrounded value.
 */
function fmtMolarMass(M: number): string {
  return formatDecimal(M, 2);
}

function randRange(min: number, max: number, step: number): number {
  return sigfig(min + Math.floor(Math.random() * (Math.round((max - min) / step) + 1)) * step, 3);
}

/** Is this a gas at STP, so that 22,4 L/mól applies to it? */
export function isGas(c: Compound): boolean {
  return c.state === 'gas';
}

/**
 * What one mole of this compound is a mole of: molecules, or — for an ionic
 * compound, which has none — formula units. Stig 3 already said
 * `formúlueiningar` for NaCl; this level asked for the `sameindir` in it.
 */
export function particlesOf(c: Compound): string {
  return c.ionic ? 'formúlueiningar' : 'sameindir';
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
    'moles_to_gas_volume',
    'gas_volume_to_moles',
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
    // The molar-volume slots must draw a gas: one mole occupies 22,4 L only if
    // it is one. The subscript slot needs a formula with a subscript above one.
    let compound: Compound;
    if (type === 'moles_to_gas_volume' || type === 'gas_volume_to_moles') {
      compound = take(isGas);
    } else if (type === 'moles_to_element_atoms') {
      compound = take(hasRepeatedElement);
    } else {
      compound = take(() => true);
    }
    return generateProblem(compound, type);
  });
}

export function generateProblem(c: Compound, type: ConvType): Problem {
  const M = c.molarMass;
  // Every template puts this after `af`, which takes the dative.
  const label = `${c.nameDative} (${c.formula})`;

  if (type === 'mass_to_moles') {
    const m = randRange(5, 500, 5);
    const ans = m / M;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hversu mörg mól eru í ${formatDecimal(m)} g af ${label}?`,
      solutionFormula: 'Einingagreining: g × (1 mól / g) → mól',
      solutionSteps: `${formatDecimal(m)} g × (1 mól / ${fmtMolarMass(M)} g) = ${fmt(ans)} mól\nEiningin g strikast út og mól verður eftir.`,
    };
  }
  if (type === 'moles_to_mass') {
    const n = randRange(0.1, 5.0, 0.1);
    const ans = n * M;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hvað vega ${formatDecimal(n)} mól af ${label} í grömmum?`,
      solutionFormula: 'Einingagreining: mól × (g / 1 mól) → g',
      solutionSteps: `${formatDecimal(n)} mól × (${fmtMolarMass(M)} g / 1 mól) = ${fmt(ans)} g\nEiningin mól strikast út og g verður eftir.`,
    };
  }
  if (type === 'moles_to_particles') {
    const n = randRange(0.1, 5.0, 0.1);
    const ans = n * AVOGADRO;
    const particles = particlesOf(c);
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hversu margar ${particles} eru í ${formatDecimal(n)} mól af ${label}?`,
      solutionFormula: `Einingagreining: mól × (${particles} / 1 mól) → ${particles}`,
      solutionSteps: `${formatDecimal(n)} mól × (6,022 × 10²³ ${particles} / 1 mól) = ${fmt(ans)} ${particles}\nEiningin mól strikast út.`,
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
    const n = randRange(0.1, 5.0, 0.1);
    const ans = n * element.count * AVOGADRO;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hversu mörg ${atomWord(element.symbol)} (${element.symbol}) eru í ${formatDecimal(n)} mól af ${label}?`,
      // The first factor turns moles of compound into moles of the element, as
      // the worked line below does. It used to put atoms over moles there too,
      // which leaves atoms squared over moles once the second factor is applied.
      solutionFormula: 'Einingagreining: mól × (mól af frumefninu / 1 mól) × (atóm / 1 mól) → atóm',
      solutionSteps: `Í hverri ${c.ionic ? 'formúlueiningu' : 'sameind'} af ${c.formula} eru ${element.count} ${element.symbol}-atóm.\n${formatDecimal(n)} mól × (${element.count} mól ${element.symbol} / 1 mól ${c.formula}) × (6,022 × 10²³ atóm / 1 mól) = ${fmt(ans)} atóm\nEiningin mól strikast út tvisvar.`,
    };
  }

  if (type === 'moles_to_gas_volume' || type === 'gas_volume_to_moles') {
    // Never asked about a solid or a liquid: `generateAllProblems` only sends a
    // gas, and a pool that somehow held none would ask the mass question rather
    // than claim 22,4 L for a spoonful of salt.
    if (!isGas(c)) return generateProblem(c, 'mass_to_moles');

    if (type === 'moles_to_gas_volume') {
      const n = randRange(0.1, 5.0, 0.1);
      const ans = n * STANDARD_MOLAR_VOLUME;
      return {
        compound: c,
        correctAnswer: ans,
        questionText: `Hvaða rúmmál taka ${formatDecimal(n)} mól af ${label} við ${STP_LABEL}?`,
        solutionFormula: 'Einingagreining: mól × (L / 1 mól) → L',
        solutionSteps: `${formatDecimal(n)} mól × (${formatDecimal(STANDARD_MOLAR_VOLUME)} L / 1 mól) = ${fmt(ans)} L\nEiningin mól strikast út. Þetta gildir aðeins um gas — 22,4 L/mól segir ekkert um fast efni eða vökva.`,
      };
    }

    const volume = randRange(2, 60, 2);
    const ans = volume / STANDARD_MOLAR_VOLUME;
    return {
      compound: c,
      correctAnswer: ans,
      questionText: `Hversu mörg mól eru í ${formatDecimal(volume)} L af ${label} við ${STP_LABEL}?`,
      solutionFormula: 'Einingagreining: L × (1 mól / L) → mól',
      solutionSteps: `${formatDecimal(volume)} L × (1 mól / ${formatDecimal(STANDARD_MOLAR_VOLUME)} L) = ${fmt(ans)} mól\nEiningin L strikast út. Þetta gildir aðeins um gas.`,
    };
  }

  // particles_to_moles
  const coeff = randRange(0.5, 9.0, 0.5);
  const ans = (coeff * 1e23) / AVOGADRO;
  return {
    compound: c,
    correctAnswer: ans,
    questionText: `Hversu mörg mól eru ${formatDecimal(coeff)} × 10²³ sameindir?`,
    solutionFormula: 'Einingagreining: sameindir × (1 mól / sameindir) → mól',
    solutionSteps: `${formatDecimal(coeff)} × 10²³ sameindir × (1 mól / 6,022 × 10²³ sameindir) = ${fmt(ans)} mól\nEiningin sameindir strikast út.`,
  };
}

/**
 * The keyboard a phone should open for an answer. Molecule and atom counts are
 * Avogadro-scale, and a decimal keypad has no `e`, `×` or `^` to write them with,
 * so those questions get the full keyboard; everything else keeps the keypad.
 * `parseScientificAnswer` reads `2,5e20` and `2,5 x 10^20` alike.
 */
export function answerInputMode(correctAnswer: number): 'decimal' | 'text' {
  return Math.abs(correctAnswer) >= 1e6 ? 'text' : 'decimal';
}

/**
 * What to say when an answer cannot be read. The keyboard decides which: on the
 * full keyboard the likely slip is a half-written power of ten.
 *
 * The notation example is deliberately far below any count this level asks
 * for (the smallest is 0,1 mól, 6,0 × 10²²): an example that is an answer is
 * an answer leak, which is what Stig 3's `1,2e24` was.
 */
export function unreadableAnswerMessage(mode: 'decimal' | 'text'): string {
  return mode === 'text'
    ? 'Ógilt gildi. Notaðu t.d. 2,5e20 eða 2,5 × 10^20'
    : 'Ógilt gildi. Skrifaðu tölu, t.d. 2,5';
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
  const [error, setError] = useState('');

  const problem = problems[idx];
  const inputMode = answerInputMode(problem.correctAnswer);

  // Intro → practice → results each start at the top on a phone, with the
  // screen's start focused: the answer field in the practice (it has always
  // autofocused), the heading otherwise.
  const inputRef = useRef<HTMLInputElement>(null);
  useScreenTop(`${showIntro}:${done}`, { focus: inputRef });
  // Each new question brings its card back under the top edge on a phone, and
  // focus goes to the answer field (`data-item-start`), as its autofocus did.
  const cardRef = useItemTop<HTMLDivElement>(idx);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  // After Svara: the question through Næsta if it fits, else the verdict at
  // the top. Focus moves to the feedback, not to Næsta (design P3).
  useRevealAfterCommit(feedback, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // A press on Næsta within 400 ms of it appearing is dropped, so a double tap
  // on Svara cannot skip the feedback; the results buttons likewise.
  const armed = useArmedAfter(400, `${idx}:${feedback}`);
  const armedResults = useArmedAfter(400, done);

  const submit = () => {
    if (feedback) return;
    const v = parseScientificAnswer(input);
    if (v === null) {
      // Say so, as Stig 3 does. Returning silently left a student who typed
      // `3,5 × 10` tapping Svara with nothing happening at all.
      setError(unreadableAnswerMessage(inputMode));
      return;
    }
    setError('');
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
    setError('');
    setFeedback(false);
  };

  const retry = () => {
    setProblems(generateAllProblems());
    setIdx(0);
    setInput('');
    setError('');
    setScore(0);
    setFeedback(false);
    setDone(false);
  };

  // ==================== TEACHING INTRO ====================
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          {/* On a phone the padding is tighter; the layout is unchanged. */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3">
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center">
              <button
                onClick={onBack}
                className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
              >
                ← Til baka
              </button>
              <h1 className="order-last basis-full mt-1 sm:order-none sm:basis-auto sm:mt-0 text-lg font-bold text-warm-800">
                Mól-umbreytingar — Kennsla
              </h1>
              <span className="text-sm text-warm-500 whitespace-nowrap">Stig 2</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-5 phone:p-4 phone:space-y-4">
            {/* What is a mole? */}
            <div>
              <h2 className="text-xl font-bold text-warm-800 mb-2">Hvað er mól?</h2>
              <p className="text-warm-700">
                Eitt mól er 6,022 × 10²³ eindir — jafn margar og atóm í 12 g af kolefni-12. Þetta er{' '}
                <strong>Avogadro-talan</strong>.
              </p>
            </div>

            {/* Three key relationships */}
            <div>
              <h3 className="text-lg font-bold text-warm-800 mb-3">Fjögur lykilsambönd</h3>
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
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="font-mono text-teal-800 text-center">
                    fjöldi móla × {formatDecimal(STANDARD_MOLAR_VOLUME)} L/mól = rúmmál{' '}
                    <strong>gass</strong>
                  </p>
                  <p className="text-xs text-teal-700 text-center mt-2">
                    Aðeins við {STP_LABEL} — og aðeins fyrir gas. Eitt mól af hvaða gasi sem er
                    tekur sama rúmmál, því sameindirnar eru svo langt hver frá annarri að stærð
                    þeirra skiptir ekki máli. Eitt mól af salti eða vatni gerir það ekki.
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={armedResults(retry)}
                className="bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Reyna aftur
              </button>
              {passed && (
                <button
                  onClick={armedResults(() => onComplete(score, TOTAL * 10, 0))}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Ljúka stigi →
                </button>
              )}
            </div>
            <button
              onClick={armedResults(onBack)}
              className="mt-4 text-warm-500 hover:text-warm-700 font-semibold py-2 pointer-coarse:min-h-11"
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
      <div className="max-w-lg mx-auto phone-land:max-w-none">
        {/* Header. On a phone: the title and the score on one row (the
            subtitle kept for screen readers), and a thinner progress bar. */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3">
          <div className="flex justify-between items-center phone:gap-3">
            <div className="phone:min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-warm-800 phone:text-base">
                Mól-umbreytingar - Stig 2
              </h1>
              <p className="text-sm text-warm-600 phone:sr-only">Massi, mól og sameindir</p>
            </div>
            <div className="text-center phone:shrink-0 phone:flex phone:items-baseline phone:gap-1">
              <div className="text-2xl font-bold text-kvenno-orange phone:text-lg">{score}</div>
              <div className="text-xs text-warm-600">Stig</div>
            </div>
          </div>
          <div className="mt-3 phone:mt-2">
            <div className="flex justify-between text-xs text-warm-500 mb-1">
              <span>
                Dæmi {idx + 1}/{TOTAL}
              </span>
              <span>
                {score}/{TOTAL * 10}
              </span>
            </div>
            <div className="h-2 bg-warm-200 rounded-full overflow-hidden phone:h-1.5">
              <div
                className="h-full bg-kvenno-orange transition-all duration-500"
                style={{ width: `${((idx + 1) / TOTAL) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* On a phone on its side: the conversion factors on the left, the
            question and its feedback on the right. The two groups are plain
            blocks, so nothing moves anywhere else. */}
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:gap-3 phone-land:items-start">
          {/* Dimensional analysis reference — a scaffold, so it stays in view. */}
          <div className="bg-white/80 border border-warm-200 rounded-xl p-3 mb-4 phone:py-2 phone:mb-3">
            <div className="text-center text-xs text-warm-500 mb-2 phone:mb-1">
              Einingagreining — umbreytingarstuðlar
            </div>
            <div className="text-sm font-mono text-warm-700 space-y-1 text-center">
              <div>
                g → mól: margfaldaðu með{' '}
                <span className="font-bold whitespace-nowrap">(1 mól / M g)</span>
              </div>
              <div>
                mól → g: margfaldaðu með{' '}
                <span className="font-bold whitespace-nowrap">(M g / 1 mól)</span>
              </div>
              <div>
                mól → sameindir: margfaldaðu með{' '}
                <span className="font-bold whitespace-nowrap">(6,022×10²³ / 1 mól)</span>
              </div>
            </div>
            <div className="text-center text-xs text-warm-400 mt-2 phone:mt-1">
              M = mólmassi (g/mól) — einingin sem á að hverfa fer í nefnara
            </div>
          </div>

          {/* Question card */}
          <div
            ref={cardRef}
            className="bg-white rounded-xl shadow-lg p-3 min-[360px]:p-4 sm:p-6 mb-4 phone:mb-3"
            key={idx}
          >
            <p
              ref={questionRef}
              id="molmassi-l2-question"
              className="text-lg text-warm-800 font-medium mb-6 phone:mb-3"
            >
              {problem.questionText}
            </p>

            {!feedback && (
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  data-item-start
                  type="text"
                  inputMode={inputMode}
                  enterKeyHint="done"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="Svar..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoFocus
                  aria-invalid={error ? true : undefined}
                  className={`flex-1 border-2 ${error ? 'border-red-400' : 'border-warm-200 focus:border-kvenno-orange'} rounded-xl px-4 py-3 text-lg outline-none transition-colors phone:min-w-0 phone:px-3`}
                />
                <button
                  key="check"
                  onClick={submit}
                  disabled={!input.trim()}
                  className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-colors phone:shrink-0 phone:px-4"
                >
                  Svara
                </button>
              </div>
            )}
            {!feedback && error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            {!feedback && inputMode === 'text' && (
              <p className="text-xs text-warm-500 mt-2">
                Hægt að nota vísisrithátt: 2,5e20, 2,5 × 10^20, eða venjulega tölu
              </p>
            )}

            {feedback && (
              <div className="mt-2 space-y-3">
                {/* The verdict and the worked solution: the region focus moves
                    to after Svara. FeedbackPanel keeps its own role="alert". */}
                <div ref={feedbackRef} tabIndex={-1} role="group" className="space-y-3">
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
                      // The same worked solution is printed in full just below, so
                      // "Af hverju?" starts closed rather than showing it twice.
                      defaultExpanded: false,
                    }}
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Útreikningur:</p>
                    <p className="font-mono">{problem.solutionFormula}</p>
                    {/* The steps end on a line of their own saying which unit cancels. */}
                    <p className="font-mono whitespace-pre-line">{problem.solutionSteps}</p>
                  </div>
                </div>
                <button
                  key="next"
                  ref={nextRef}
                  onClick={armed(next)}
                  className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {idx + 1 < TOTAL ? 'Næsta dæmi →' : 'Sjá niðurstöður →'}
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full text-warm-500 hover:text-warm-700 font-semibold py-2 pointer-coarse:min-h-11"
        >
          ← Til baka í valmynd
        </button>
      </div>
    </div>
  );
}

export default Level2;
