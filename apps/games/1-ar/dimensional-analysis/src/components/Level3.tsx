import { useState, useEffect, useId, useMemo, useRef } from 'react';

import { useEscapeKey } from '@shared/hooks';
import {
  DECIMAL_INPUT_PROPS,
  formatDecimal,
  isPhone,
  revealTop,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  type ScientificEntry,
} from '@shared/utils';

import { WRITTEN_NUMBER_HELP, WRITTEN_NUMBER_UNREADABLE, WrittenNumberRow } from './Level0SigFigs';
import { level3Challenges } from '../data/challenges';
import { isAnswerCorrect, parseStudentNumber } from '../utils/grading';
import { buildLevel3Run } from '../utils/level3Run';
import { scoreExplanation, calculateCompositeScore } from '../utils/scoring';
import { countSigFigs, readWritten } from '../utils/sigfigs';

interface ScoreResult {
  answer: number;
  method: number;
  explanation: number;
  efficiency: number;
  composite: number;
  sigFig: number | null;
  userSigFigs: number | null;
}

interface Level3Progress {
  problemsCompleted: number;
  compositeScores: number[];
  totalSteps?: number;
  achievements: string[];
  mastered: boolean;
  hintsUsed: number;
}

/**
 * Significant figures as the answer is written, by the game's own rules.
 *
 * `utils/sigfigs.ts`, the engine Stig 0 teaches from. Level 3 used to count with
 * a second counter that knew only the full stop, so the comma a student is
 * taught to type counted as a digit: `0,125` was four figures, and a correct
 * answer to a three-figure item was marked down for its precision. `null` when
 * the answer is not a written number at all — nothing to count, and nothing to
 * say about it.
 */
function writtenFigures(answer: string): number | null {
  try {
    return countSigFigs(answer);
  } catch {
    return null;
  }
}

/**
 * A given value as the prompt writes it.
 *
 * The data stores numbers, and a number cannot hold a trailing zero or a
 * comma: L3-4 gives `50,0 mL` and `2,50 g/mL`, and the card beside it printed
 * `50` and `2.5` — a full stop where the course writes a comma, and fewer
 * significant figures than the item then asks the student to give. Where the
 * prompt states the value, print it the way the prompt does.
 */
function asGiven(value: number, prompt: string): string {
  for (const [written] of prompt.matchAll(/\d+(?:,\d+)?/g)) {
    if (parseStudentNumber(written) === value) return written;
  }
  return formatDecimal(value);
}

/**
 * A conversion factor as a student reads it. Factor strings stay in the
 * `1 míla / 1.609 km` form the tests multiply out, so the comma goes in here.
 */
const withDecimalComma = (factor: string) => factor.replace(/(\d)\.(\d)/g, '$1,$2');

interface Level3Props {
  onComplete: (progress: Level3Progress, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  initialProgress?: Level3Progress;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level3({
  onComplete,
  onBack,
  initialProgress,
  onCorrectAnswer,
  onIncorrectAnswer,
}: Level3Props) {
  const [showIntro, setShowIntro] = useState(!initialProgress);
  useEscapeKey(onBack, showIntro);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(
    initialProgress?.problemsCompleted || 0
  );
  const [progress, setProgress] = useState<Level3Progress>(
    initialProgress
      ? {
          ...initialProgress,
          totalSteps: initialProgress.totalSteps || 0,
          hintsUsed: initialProgress.hintsUsed || 0,
        }
      : {
          problemsCompleted: 0,
          compositeScores: [],
          totalSteps: 0,
          achievements: [],
          mastered: false,
          hintsUsed: 0,
        }
  );
  const [totalHintsUsed, setTotalHintsUsed] = useState(initialProgress?.hintsUsed || 0);

  const [userAnswer, setUserAnswer] = useState('');
  // The scientific-notation item's two fields, and whether what they hold could
  // not be read — which sends the answer back for editing rather than grading it.
  const [sciEntry, setSciEntry] = useState<ScientificEntry>({ mantissa: '', exponent: '' });
  const [unreadable, setUnreadable] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // After submitting, the answer form collapses and the page gets shorter. On a
  // phone the verdict comes to the top of the screen — the feedback is long and
  // read in full — and focus moves to it, not to "Næsta" (design P3). A desktop
  // window keeps what the old helper did there: a verdict left above the screen
  // is brought back.
  const feedbackRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(showFeedback, () => ({
    bottom: nextRef.current,
    tops: [verdictRef.current],
    focus: verdictRef.current,
  }));
  useEffect(() => {
    const el = feedbackRef.current;
    if (showFeedback && el && !isPhone() && el.getBoundingClientRect().top < 0) {
      revealTop(el, { anyWidth: true });
    }
  }, [showFeedback]);
  // A double tap on "Senda inn" must not press "Næsta".
  const armed = useArmedAfter(400, `${currentProblemIndex}:${showFeedback}`);

  // The button that moves on sits at the foot of a screen taller than a phone,
  // so the intro's "Byrja" and each "Næsta" used to open the next problem with
  // its context already scrolled past. Open it at its top, with focus on the
  // problem. This scrolled at any width before it moved to the shared helper,
  // so it still does (`anyWidth`).
  const topRef = useItemTop<HTMLDivElement>(showIntro ? 'intro' : currentProblemIndex, {
    anyWidth: true,
  });
  const explanationRef = useRef<HTMLTextAreaElement>(null);
  // Enter in the answer moves on to the explanation, which is also required.
  const toExplanation = () => explanationRef.current?.focus();

  // A run drawn from the pool, not the whole pool: see `buildLevel3Run`.
  // Drawn once per mount. Leaving the level unmounts it, so coming back draws
  // a new run.
  const run = useMemo(() => buildLevel3Run(level3Challenges), []);

  const problem = run[currentProblemIndex];

  // The choices in the order they are shown. The data lists a correct route
  // first on both reverse items and the efficient path first on four of five
  // efficiency items, so "pick the top one" beat reading them. Shuffled once
  // per problem; everything that reads a selection reads it from these arrays,
  // never from the data's order (the kinetics lesson in `docs/README.md`).
  const options = useMemo(
    () => (problem?.type === 'reverse' ? shuffleArray(problem.options) : []),
    [problem]
  );
  const paths = useMemo(
    () => (problem?.type === 'efficiency' ? shuffleArray(problem.possiblePaths) : []),
    [problem]
  );

  // Only an item that asks for scientific notation takes it in two fields.
  const wantsScientific = problem?.type === 'derivation' && problem.scientificNotation;

  const answerId = useId();
  const explanationId = useId();

  useEffect(() => {
    if (problem) {
      setUserAnswer('');
      setSciEntry({ mantissa: '', exponent: '' });
      setUnreadable(false);
      setSelectedOption(null);
      setSelectedPath(null);
      setExplanation('');
      setShowFeedback(false);
      setScores(null);
      setHintUsed(false);
      setShowHint(false);
    }
  }, [currentProblemIndex, problem]);

  const getHint = () => {
    const hints: Record<string, string> = {
      reverse:
        'Byrjaðu með upphafsgildinu og spyrðu þig: Hvaða stuðlar myndu breyta því í lokagildið?',
      error_analysis:
        'Athugaðu hvort stuðullinn sé snúinn rétt - einingin sem á að hverfa þarf að vera í nefnara.',
      efficiency: 'Leitaðu að beinum stuðlum í stað þess að fara í gegnum margar millistig.',
      synthesis:
        'Byrjaðu á að margfalda rúmmál með eðlismassa til að fá massa, síðan umbreyttu einingum.',
      real_world: 'Umbreyttu öllum gildum í sömu einingar áður en þú reiknar fjölda skammta.',
      derivation:
        'Skrifaðu mjög stórar eða litlar tölur eins og 3,00 × 10⁸: tölustafina í fyrri reitinn og veldisvísinn í þann seinni.',
    };
    // An item may override the type hint: the derivation hint talks about
    // scientific notation, which is no help on a derivation about minutes.
    return (
      problem.hint || hints[problem.type] || 'Hugsaðu vel um hvaða stuðla þú þarft og í hvaða röð.'
    );
  };

  const handleSubmit = () => {
    if (showFeedback) return;
    // What the student typed, as a number. The scientific-notation item reads
    // its two fields strictly: `parseStudentNumber` would read `1,08 × 10⁹` as
    // 1,08 and mark a correct answer wrong. An unreadable entry is sent back
    // rather than graded.
    const typed = wantsScientific
      ? (readWritten(sciEntry)?.value ?? null)
      : parseStudentNumber(userAnswer);
    if (typed === null) {
      setUnreadable(true);
      return;
    }

    let answerScore = 0;
    let methodScore = 0;
    const explanationScore = scoreExplanation(explanation, problem.type);
    let efficiencyScore = 0;
    let sigFigScore: number | null = null;
    let userSigFigs: number | null = null;

    // Score based on problem type
    if (problem.type === 'reverse' && selectedOption !== null) {
      const selected = options[selectedOption];
      if (selected && selected.correct) {
        answerScore = 1;
        methodScore = 1;
        // Efficiency bonus for fewer steps
        if (selected.steps === 1) efficiencyScore = 1;
        else if (selected.steps === 2) efficiencyScore = 0.8;
      }
    } else if (problem.type === 'error_analysis') {
      if (isAnswerCorrect(typed, problem.correctAnswer || 0)) {
        answerScore = 1;
      }
      // Credit method for any substantive explanation attempt
      if (explanation.trim().length > 20) {
        methodScore = 1;
      }
    } else if (problem.type === 'efficiency') {
      if (isAnswerCorrect(typed, problem.targetAnswer || 0)) {
        answerScore = 1;
      }
      if (selectedPath !== null) {
        const path = paths[selectedPath];
        if (path.efficient) {
          efficiencyScore = 1;
          methodScore = 1;
        } else {
          methodScore = 0.5;
        }
      }
    } else if (problem.type === 'synthesis' || problem.type === 'derivation') {
      if (isAnswerCorrect(typed, problem.expectedAnswer || 0)) {
        answerScore = 1;
      }

      // Check significant figures if required (only for synthesis type)
      // Note: sig figs are tracked and displayed as feedback only — not penalized in answerScore
      if (problem.type === 'synthesis' && problem.significantFigures) {
        userSigFigs = writtenFigures(userAnswer);
        sigFigScore =
          userSigFigs === null ? null : userSigFigs === problem.significantFigures ? 1 : 0;
      }

      if (explanation.length > 20) {
        methodScore = 1;
      }
    } else if (problem.type === 'real_world') {
      // `parseInt` truncated a decimal answer and could not read an Icelandic
      // decimal comma, so an item whose answer is 24,5 was ungradeable and
      // `requireInteger` decided nothing. Read the number the way the rest of
      // the game does, then let the flag decide what counts.
      const correct = problem.requireInteger
        ? Number.isInteger(typed) && typed === problem.expectedAnswer
        : isAnswerCorrect(typed, problem.expectedAnswer);
      if (correct) {
        answerScore = 1;
        methodScore = 1;
      }
    }

    const composite = calculateCompositeScore(
      answerScore,
      methodScore,
      explanationScore,
      efficiencyScore
    );

    // Hints are free for learning — nothing here reads hint use.
    setScores({
      answer: answerScore,
      method: methodScore,
      explanation: explanationScore,
      efficiency: efficiencyScore,
      composite: composite,
      sigFig: sigFigScore,
      userSigFigs: userSigFigs,
    });

    setShowFeedback(true);

    // Track achievements
    if (composite >= 0.75) {
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }

    // Update progress
    const newProgress = {
      ...progress,
      compositeScores: [...progress.compositeScores, composite],
      totalSteps:
        (progress.totalSteps || 0) +
        (selectedPath !== null && problem.type === 'efficiency'
          ? paths[selectedPath].stepCount
          : 2),
    };
    setProgress(newProgress);
  };

  const handleContinue = () => {
    const newProgress = {
      ...progress,
      problemsCompleted: progress.problemsCompleted + 1,
      hintsUsed: totalHintsUsed,
    };

    // Mastery is judged once the whole run is in, over every problem in it.
    // This said `>= 10` from when the level had ten items; a run is now
    // `run.length` long, and a shorter one could never be mastered at all.
    if (newProgress.problemsCompleted >= run.length) {
      const avgScore =
        newProgress.compositeScores.reduce((a, b) => a + b, 0) / newProgress.compositeScores.length;
      newProgress.mastered = avgScore >= 0.75;
    }

    setProgress(newProgress);

    if (currentProblemIndex < run.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Max score is 100 per problem in the run.
      onComplete(newProgress, run.length * 100, totalHintsUsed);
    }
  };

  if (!problem && !showIntro) return null;

  if (showIntro) {
    return (
      <div
        ref={topRef}
        className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-4 sm:p-4 scroll-mt-14 phone:scroll-mt-0"
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 flex items-center gap-2 text-lg"
            >
              ← Til baka
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-warm-800 text-center">
              Einingagreining í raunveruleikanum
            </h2>

            <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-800 mb-3">Af hverju þetta stig?</h3>
              <p className="text-warm-700">
                Þú hefur lært <strong>hvernig</strong> einingar styttast út og hvernig
                umbreytingakeðjur virka. Nú skaltu nota þessa þekkingu til að leysa raunveruleg
                vandamál — þar sem villur geta skipt máli.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="bg-warm-50 rounded-lg p-4 flex items-start gap-3">
                <span className="text-xl mt-0.5">🔍</span>
                <div>
                  <p className="font-semibold text-warm-800">Villugreining</p>
                  <p className="text-sm text-warm-600">
                    Finndu villur í útreikningum annarra — öfugir stuðlar, gleymdir skref.
                  </p>
                </div>
              </div>
              <div className="bg-warm-50 rounded-lg p-4 flex items-start gap-3">
                <span className="text-xl mt-0.5">⚡</span>
                <div>
                  <p className="font-semibold text-warm-800">Skilvirkni</p>
                  <p className="text-sm text-warm-600">
                    Veldu fæstu skrefin — styttri leiðir gefa nákvæmari niðurstöður.
                  </p>
                </div>
              </div>
              <div className="bg-warm-50 rounded-lg p-4 flex items-start gap-3">
                <span className="text-xl mt-0.5">🧪</span>
                <div>
                  <p className="font-semibold text-warm-800">Samsetning og raunveruleiki</p>
                  <p className="text-sm text-warm-600">
                    Notaðu eðlismassa, rúmmál og styrk saman — eins og í rannsóknarstofu.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 sm:p-6 border-l-4 border-amber-500">
              <h3 className="font-bold text-amber-800 mb-2">Vísbendingar alltaf í boði</h3>
              <p className="text-warm-700 text-sm">
                Þú getur alltaf beðið um vísbendingu án þess að það hafi áhrif á einkunn. Skrifaðu
                stuttar útskýringar til að æfa hugsunina — lengd skiptir ekki máli, aðeins hugsunin.
              </p>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-4 rounded-xl font-bold text-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Byrja áskoranir →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avgScore =
    progress.compositeScores.length > 0
      ? Math.round(
          (progress.compositeScores.reduce((a, b) => a + b, 0) / progress.compositeScores.length) *
            100
        )
      : 0;

  // What each type grades, and so what it needs before it can be sent. A reverse
  // item is graded on the route chosen, an efficiency item on the path and the
  // number; neither could be sent without its choice before, and a reverse item
  // demanded a typed number it never read.
  const answerGiven =
    problem.type === 'reverse'
      ? selectedOption !== null
      : problem.type === 'efficiency'
        ? selectedPath !== null && userAnswer.trim() !== ''
        : wantsScientific
          ? sciEntry.mantissa.trim() !== ''
          : userAnswer.trim() !== '';
  const canSubmit = answerGiven && explanation.trim() !== '';

  const problemTypeLabels: Record<string, string> = {
    reverse: 'Öfug greining',
    error_analysis: 'Villugreining',
    efficiency: 'Skilvirkni',
    synthesis: 'Samsetning',
    real_world: 'Raunveruleiki',
    derivation: 'Afleiðing',
  };

  return (
    <div
      ref={topRef}
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-4 sm:p-4 phone:py-2 scroll-mt-14 phone:scroll-mt-0"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header: one row on a phone */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2 phone:mb-2 phone:flex-nowrap">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2 text-lg phone:text-base phone:shrink-0"
          >
            ← Til baka
          </button>
          <div className="text-sm text-warm-600 flex items-center gap-2 sm:gap-4 flex-wrap phone:min-w-0 phone:justify-end phone:gap-x-2 phone:gap-y-0.5 phone:whitespace-nowrap">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold phone:px-2 phone:py-0.5">
              Stig 3: Útreikningar
            </span>
            <span>
              Áskorun {progress.problemsCompleted + 1} / {run.length}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                avgScore >= 75 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              Meðal: {avgScore}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6 overflow-hidden phone:mb-2 phone:h-1.5">
          <div
            className="bg-purple-500 h-2 phone:h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(progress.problemsCompleted / run.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 phone:p-3">
          {/* Problem type badge */}
          <div className="mb-4 flex items-center gap-3 phone:mb-2 phone:gap-2">
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl text-sm font-bold phone:px-2 phone:py-0.5 phone:text-xs phone:rounded-lg">
              {problemTypeLabels[problem.type] || problem.type}
            </span>
            <span className="text-2xl phone:text-base">
              {problem.type === 'reverse' && '🔄'}
              {problem.type === 'error_analysis' && '🔍'}
              {problem.type === 'efficiency' && '⚡'}
              {problem.type === 'synthesis' && '🧪'}
              {problem.type === 'real_world' && '🌍'}
              {problem.type === 'derivation' && '📐'}
            </span>
          </div>

          <h2
            data-item-start
            className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-warm-800 phone:text-lg phone:mb-3"
          >
            {problem.prompt}
          </h2>

          {/* Display problem-specific context */}
          {problem.type === 'synthesis' && problem.density && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 phone:mb-3 phone:p-3">
              <p className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2 phone:mb-2">
                <span className="text-lg">📊</span> Gefnar upplýsingar:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 phone:grid-cols-2">
                {problem.startValue && problem.startUnit && (
                  <div className="bg-white p-3 rounded-lg flex flex-wrap items-baseline justify-between gap-x-3 sm:block phone:block phone:px-2 phone:py-1.5">
                    <p className="text-xs text-warm-500">{problem.startLabel ?? 'Rúmmál'}</p>
                    <p className="font-bold text-purple-700">
                      {asGiven(problem.startValue, problem.prompt)} {problem.startUnit}
                    </p>
                  </div>
                )}
                {problem.density && problem.densityUnit && (
                  <div className="bg-white p-3 rounded-lg flex flex-wrap items-baseline justify-between gap-x-3 sm:block phone:block phone:px-2 phone:py-1.5">
                    <p className="text-xs text-warm-500">{problem.factorLabel ?? 'Eðlismassi'}</p>
                    <p className="font-bold text-purple-700">
                      {asGiven(problem.density, problem.prompt)} {problem.densityUnit}
                    </p>
                  </div>
                )}
                {problem.targetUnit && (
                  <div className="bg-white p-3 rounded-lg flex flex-wrap items-baseline justify-between gap-x-3 sm:block phone:block phone:px-2 phone:py-1.5">
                    <p className="text-xs text-warm-500">Markeining</p>
                    <p className="font-bold text-green-700">{problem.targetUnit}</p>
                  </div>
                )}
                {problem.significantFigures && (
                  <div className="bg-white p-3 rounded-lg flex flex-wrap items-baseline justify-between gap-x-3 sm:block phone:block phone:px-2 phone:py-1.5">
                    <p className="text-xs text-warm-500">Markverðir stafir</p>
                    <p className="font-bold text-blue-700">{problem.significantFigures}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {problem.type === 'real_world' && (problem.startValue || problem.portionSize) && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 phone:mb-3 phone:p-3">
              <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2 phone:mb-2">
                <span className="text-lg">📊</span> Gefnar upplýsingar:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 phone:grid-cols-2">
                {problem.startValue && problem.startUnit && (
                  <div className="bg-white p-3 rounded-lg flex flex-wrap items-baseline justify-between gap-x-3 sm:block phone:block phone:px-2 phone:py-1.5">
                    <p className="text-xs text-warm-500">{problem.startLabel ?? 'Heildarmagn'}</p>
                    <p className="font-bold text-green-700">
                      {asGiven(problem.startValue, problem.prompt)} {problem.startUnit}
                    </p>
                  </div>
                )}
                {problem.portionSize && problem.portionUnit && (
                  <div className="bg-white p-3 rounded-lg flex flex-wrap items-baseline justify-between gap-x-3 sm:block phone:block phone:px-2 phone:py-1.5">
                    <p className="text-xs text-warm-500">
                      {problem.portionLabel ?? 'Skammtastærð'}
                    </p>
                    <p className="font-bold text-green-700">
                      {asGiven(problem.portionSize, problem.prompt)} {problem.portionUnit}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {problem.type === 'error_analysis' && problem.incorrectWork && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 phone:mb-3 phone:p-3">
              <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span> Röng vinna:
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-red-200">
                <p className="font-mono text-red-700 text-base sm:text-lg">
                  {problem.incorrectWork}
                </p>
              </div>
            </div>
          )}

          {!showFeedback && (
            <div className="space-y-6 phone:space-y-3">
              {/* Reverse problem options */}
              {problem.type === 'reverse' && (
                <div className="space-y-3">
                  <p className="font-bold text-warm-800">Veldu rétta leið:</p>
                  {options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${
                        selectedOption === idx
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-warm-200 hover:border-purple-300 hover:bg-warm-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium min-w-0">{option.text}</span>
                        <span
                          className={`shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-sm font-semibold ${
                            selectedOption === idx
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-warm-100 text-warm-600'
                          }`}
                        >
                          {option.steps} skref
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Efficiency problem paths.
                  B17: these buttons used to print the answer on themselves —
                  a green step-count badge and a literal efficiency label on
                  every shortest path, while the prompt asks the student to
                  find exactly that. The step count went with them: the
                  task is "fæst skref", so counting them is the work. The steps
                  are all still there to be read and counted; which path was
                  efficient is settled in the feedback below. */}
              {problem.type === 'efficiency' && (
                <div className="space-y-3">
                  <p className="font-bold text-warm-800">Veldu leið:</p>
                  {paths.map((path, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPath(idx)}
                      className={`w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${
                        selectedPath === idx
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-warm-200 hover:border-purple-300 hover:bg-warm-50'
                      }`}
                    >
                      <div className="text-sm font-semibold text-warm-600 mb-2">Leið {idx + 1}</div>
                      <div className="space-y-2">
                        {path.steps.map((step, sidx) => (
                          <div
                            key={sidx}
                            className="font-mono text-sm bg-white px-3 py-2 rounded-lg border border-warm-100"
                          >
                            {withDecimalComma(step)}
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Answer input */}
              {/* A reverse item is answered by the route it chooses above, so it
                  has no number to type. */}
              {problem.type !== 'reverse' && (
                <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                  <label
                    htmlFor={wantsScientific ? undefined : answerId}
                    className="block font-bold mb-3 text-warm-800"
                  >
                    {problem.type === 'error_analysis' ? 'Hvað er rétta svarið?' : 'Þitt svar:'}
                  </label>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
                    {wantsScientific ? (
                      // Stig 0's row: the digits, × 10 and a power of ten, each
                      // on the decimal keypad, with a sign button for a phone.
                      <WrittenNumberRow
                        onEnter={toExplanation}
                        enterKeyHint="next"
                        entry={sciEntry}
                        onChange={(patch) => {
                          setSciEntry((current) => ({ ...current, ...patch }));
                          setUnreadable(false);
                        }}
                        digitsLabel="Þitt svar"
                        fieldClassName="rounded-xl border-2 border-warm-300 py-3 font-mono text-lg sm:text-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-hidden"
                      />
                    ) : (
                      <input
                        {...DECIMAL_INPUT_PROPS}
                        id={answerId}
                        autoComplete="off"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return;
                          e.preventDefault();
                          toExplanation();
                        }}
                        enterKeyHint="next"
                        placeholder="Sláðu inn svar"
                        className="min-w-0 flex-1 p-3 sm:p-4 border-2 border-warm-300 rounded-xl font-mono text-lg sm:text-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-hidden transition-all"
                      />
                    )}
                    {problem.type !== 'error_analysis' &&
                      'targetUnit' in problem &&
                      problem.targetUnit && (
                        <div className="shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 sm:py-3 bg-green-100 text-green-800 rounded-xl font-bold text-base sm:text-lg">
                          {problem.targetUnit}
                        </div>
                      )}
                  </div>
                  {wantsScientific && (
                    <p className="mt-2 text-xs text-warm-500">{WRITTEN_NUMBER_HELP}</p>
                  )}
                  {unreadable && (
                    <p className="mt-2 text-sm text-amber-800">{WRITTEN_NUMBER_UNREADABLE}</p>
                  )}
                </div>
              )}

              {/* Explanation */}
              <div className="p-4 bg-warm-50 rounded-xl border border-warm-200">
                <label htmlFor={explanationId} className="block font-bold mb-2 text-warm-800">
                  Útskýring (hvernig leystir þú þetta?):
                </label>
                <textarea
                  ref={explanationRef}
                  id={explanationId}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="T.d. 'Fyrst breytti ég X í Y með stuðlinum Z...'"
                  className="w-full p-4 border-2 border-warm-300 rounded-xl h-28 phone:h-20 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-hidden transition-all resize-none"
                />
                <p className="text-xs text-warm-500 mt-2 flex items-center gap-1">
                  {/* This said "… fyrir betri einkunn", and nothing reads the words:
                      `scoreExplanation` deliberately does no keyword matching. A
                      grade the level does not give is a phantom, like the hint
                      penalty it used to advertise. */}
                  <span className="text-base">💡</span> Notaðu orð eins og "umbreyti", "stuðull" og
                  "eining" til að lýsa aðferðinni.
                </p>
              </div>

              {/* Hint */}
              {showHint && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">💡</span> Vísbending:
                  </p>
                  <p className="text-blue-700">{getHint()}</p>
                </div>
              )}

              {/* Action buttons: side by side on a phone, the hint a size smaller.
                  Where both labels do not fit on one line (320 px), "Senda inn"
                  wraps under the hint rather than squeezing onto two lines. */}
              <div className="space-y-3 phone:flex phone:flex-wrap phone:gap-2 phone:space-y-0">
                {!showHint && (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setHintUsed(true);
                      setTotalHintsUsed((prev) => prev + 1);
                      setProgress((prev) => ({
                        ...prev,
                        hintsUsed: prev.hintsUsed + 1,
                      }));
                    }}
                    className="w-full border-2 border-blue-400 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors phone:w-auto phone:grow phone:px-2 phone:text-sm"
                  >
                    💡 Sýna vísbendingu
                  </button>
                )}
                <button
                  key="check"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:bg-warm-300 disabled:cursor-not-allowed disabled:text-warm-500 bg-purple-600 hover:bg-purple-700 text-white phone:w-auto phone:grow phone:px-3 phone:py-3 phone:text-base"
                >
                  Senda inn →
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && scores && (
            <div
              ref={feedbackRef}
              className={`p-4 sm:p-6 rounded-xl border-2 phone:p-3 ${
                scores.composite >= 0.75
                  ? 'bg-green-100 border-green-300'
                  : 'bg-yellow-100 border-yellow-300'
              }`}
            >
              {/* The feedback region focus moves to after "Senda inn" (P3):
                  everything the student reads, then "Næsta" outside it. */}
              <div
                ref={verdictRef}
                tabIndex={-1}
                role="group"
                aria-labelledby="da-l3-verdict"
                className="focus:outline-none"
              >
                {/* Header with emoji */}
                <div className="text-center mb-6 phone:mb-3">
                  <div className="text-5xl mb-2 phone:text-3xl phone:mb-1">
                    {scores.composite >= 0.9
                      ? '🏆'
                      : scores.composite >= 0.75
                        ? '🎉'
                        : scores.composite >= 0.5
                          ? '💪'
                          : '📚'}
                  </div>
                  <h3 id="da-l3-verdict" className="text-2xl font-bold phone:text-xl">
                    {scores.composite >= 0.9
                      ? 'Frábært!'
                      : scores.composite >= 0.75
                        ? 'Vel gert!'
                        : scores.composite >= 0.5
                          ? 'Gott!'
                          : 'Þú getur gert betur'}
                  </h3>
                </div>

                {/* Simple feedback — no weighted scoring grid */}
                <div className="bg-white p-4 sm:p-5 rounded-xl text-center mb-6">
                  <p className="text-sm text-warm-600 mb-1">
                    {scores.answer >= 0.75 ? 'Svarið er rétt!' : 'Svarið er ekki alveg rétt'}
                  </p>
                  {scores.method >= 0.75 && (
                    <p className="text-sm text-green-600">✓ Rétt aðferð valin</p>
                  )}
                  {scores.method < 0.75 && (
                    <p className="text-sm text-amber-600">
                      Athugaðu aðferðina — sjáðu lausnina hér að neðan
                    </p>
                  )}
                </div>

                {/* Which path was the efficient one, and why. The buttons no
                  longer say, so this has to. */}
                {problem.type === 'efficiency' && (
                  <div className="mb-6 p-4 bg-white rounded-xl border border-warm-200">
                    <p className="text-sm font-bold text-warm-800 mb-3 flex items-center gap-2">
                      <span>⚡</span> Leiðirnar bornar saman:
                    </p>
                    <div className="space-y-2">
                      {paths.map((path, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border ${
                            path.efficient
                              ? 'bg-green-50 border-green-300'
                              : 'bg-warm-50 border-warm-200'
                          }`}
                        >
                          <span className="text-sm font-semibold text-warm-700">
                            Leið {idx + 1}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              path.efficient
                                ? 'bg-green-100 text-green-700'
                                : 'bg-warm-100 text-warm-600'
                            }`}
                          >
                            {path.stepCount} skref
                          </span>
                          {path.efficient && (
                            <span className="text-green-600 text-sm">⚡ Skilvirkt</span>
                          )}
                          {selectedPath === idx && (
                            <span className="ml-auto text-sm text-purple-700 font-semibold">
                              þitt val
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-warm-600 mt-3">
                      Skilvirkasta leiðin notar fæst skref. Allar leiðirnar hér gefa sama svarið —
                      munurinn er hversu mörg umreikningshlutföll þarf til.
                    </p>
                  </div>
                )}

                {/* Error explanation */}
                {problem.type === 'error_analysis' && problem.errorExplanation && (
                  <div className="mb-6 p-4 bg-white rounded-xl border border-warm-200">
                    <p className="text-sm font-bold text-warm-800 mb-2 flex items-center gap-2">
                      <span>🔍</span> Útskýring á villunni:
                    </p>
                    <p className="text-warm-700">{problem.errorExplanation}</p>
                  </div>
                )}

                {/* The worked solution for a real-world item. Authored on every one
                  of them since the level shipped, and rendered nowhere until now —
                  so a student who got one wrong was shown no way to get it right. */}
                {problem.type === 'real_world' && problem.explanation && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                      <span>📋</span> Svona er þetta reiknað:
                    </p>
                    <p className="text-warm-700">{problem.explanation}</p>
                  </div>
                )}

                {/* Step-by-step solution display */}
                {'correctMethod' in problem && problem.correctMethod && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <span>📝</span> Rétt aðferð (stuðlaleiðin):
                    </p>
                    <div className="space-y-2">
                      {problem.correctMethod.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-mono bg-white px-3 py-2 rounded-lg border border-blue-200 flex-1">
                            × {withDecimalComma(step)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                      <p className="text-xs text-warm-600">
                        <span className="font-bold text-blue-700">Mundu:</span> Einingin sem á að
                        hverfa fer í nefnara, einingin sem á að koma út fer í teljara. Margfaldaðu
                        gildið með öllum stuðlum.
                      </p>
                    </div>
                  </div>
                )}

                {'requiredSteps' in problem &&
                  problem.requiredSteps &&
                  !('correctMethod' in problem) && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                        <span>📋</span> Nauðsynleg skref:
                      </p>
                      <div className="space-y-2">
                        {problem.requiredSteps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="bg-white px-3 py-2 rounded-lg border border-green-200 flex-1 text-sm">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Significant figures feedback */}
                {problem.type === 'synthesis' &&
                  problem.significantFigures &&
                  scores.sigFig !== null && (
                    <div
                      className={`mb-6 p-4 rounded-xl ${scores.sigFig === 1 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                    >
                      <p className="font-bold mb-1 flex items-center gap-2">
                        {scores.sigFig === 1 ? (
                          <>
                            <span>✓</span> Markverðir stafir réttir
                          </>
                        ) : (
                          <>
                            <span>✗</span> Markverðir stafir rangir
                          </>
                        )}
                      </p>
                      <p className="text-sm">
                        Þitt svar: {scores.userSigFigs} stafir · Ætti: {problem.significantFigures}{' '}
                        stafir
                      </p>
                    </div>
                  )}
              </div>

              {/* A separate element from "Senda inn", and it ignores a press
                  within 400 ms of appearing. */}
              <button
                key="next"
                ref={nextRef}
                onClick={armed(handleContinue)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  scores.composite >= 0.75
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {currentProblemIndex < run.length - 1 ? 'Næsta áskorun →' : 'Ljúka stigi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
