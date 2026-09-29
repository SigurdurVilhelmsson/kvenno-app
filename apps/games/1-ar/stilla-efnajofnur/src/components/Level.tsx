import { type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { FeedbackPanel, PinnedActions } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import {
  isPhone,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { AtomCounter } from './AtomCounter';
import { EquationEditor } from './EquationEditor';
import { REACTIONS, type Reaction } from '../data/reactions';
import {
  checkBalance,
  buildUnbalancedDiagnostic,
  diagnoseMisconception,
} from '../utils/balanceChecker';

type Difficulty = Reaction['difficulty'];
type HintSource = 'reaction-hint' | 'dynamic-unbalanced';

export interface LevelConfig {
  difficulty: Difficulty;
  /** Page title shown in the header (e.g. "Einfaldar jöfnur – Stig 1") */
  title: string;
  /** Tailwind background class for the page gradient, e.g. "from-green-50" */
  bgFrom: string;
  /** Optional teaching intro shown before the first problem (Level 1 only) */
  intro?: ReactNode;
  /** Optional inline instructions banner shown above the editor */
  instructions?: string;
  /** Whether hint mode highlights unbalanced elements in the AtomCounter */
  highlightUnbalancedOnHint?: boolean;
  /** How hints are generated — from reaction data or dynamically from balance state */
  hintSource: HintSource;
}

interface LevelProps {
  config: LevelConfig;
  onBack: () => void;
  onComplete: () => void;
}

function selectProblems(difficulty: Difficulty): Reaction[] {
  return shuffleArray(REACTIONS.filter((r) => r.difficulty === difficulty));
}

/**
 * A short portrait phone (the iPhone SE, 375×548): the one layout where the
 * action row is pinned to the bottom of the screen (design §4, P8). Taller
 * portrait phones fit the whole loop without it, and `PinnedActions` never pins
 * in landscape or on desktop.
 */
const SHORT_PORTRAIT_QUERY =
  '(max-width: 639.98px) and (min-height: 501px) and (max-height: 600px)';

function matchesShortPortrait(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(SHORT_PORTRAIT_QUERY).matches
  );
}

function subscribeShortPortrait(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const list = window.matchMedia(SHORT_PORTRAIT_QUERY);
  if (typeof list.addEventListener !== 'function') return () => {};
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
}

function useShortPortraitPhone(): boolean {
  return useSyncExternalStore(subscribeShortPortrait, matchesShortPortrait, () => false);
}

export function Level({ config, onBack, onComplete }: LevelProps) {
  const [showIntro, setShowIntro] = useState(Boolean(config.intro));
  useEscapeKey(onBack, showIntro);
  const [problems, setProblems] = useState<Reaction[]>(() => selectProblems(config.difficulty));
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);

  const reaction = problems[index];
  const total = problems.length;

  // Each new equation starts at the top of the page, as it always has at every
  // width (`anyWidth`), and with the same jump (`instant`): a student who taps
  // "Næsta efnajafna" at the foot of the page would otherwise land below the
  // next equation's coefficient buttons. Focus moves to the new equation
  // (`data-item-start`), because the Næsta button that was pressed has unmounted.
  const topRef = useItemTop<HTMLDivElement>(index, { anyWidth: true, gap: 0, instant: true });
  // A screen swap — teaching intro → exercises → summary, and a new run —
  // starts at the top too, with the screen's heading focused. Declared after
  // the item hook so that on a new run, where both fire, the heading wins.
  useScreenTop(showIntro ? 'intro' : done ? 'done' : 'play', { anyWidth: true });

  const editorRef = useRef<HTMLDivElement>(null);
  const atomsRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const feedbackBlockRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // After Athuga, focus moves to the verdict, not to Næsta (a second Enter then
  // does nothing), and on a phone the page shows Næsta together with as much
  // as fits above it: the equation, else the atom table, else the verdict.
  useRevealAfterCommit(answered, () => ({
    bottom: nextRef.current,
    tops: [editorRef.current, atomsRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // A desktop window keeps what the old helper did there: the verdict and
  // Næsta brought into view the way `scrollIntoView({ block: 'nearest' })` does.
  useEffect(() => {
    if (answered && !isPhone()) {
      revealSpan(feedbackBlockRef.current, [], { anyWidth: true, gap: 0 });
    }
  }, [answered]);

  // Opening the hint removes the Vísbending button, so focus moves to the hint
  // itself; on a phone the hint opens above the action row, and Athuga is kept
  // on screen with it.
  useRevealAfterCommit(showHint && !answered, () => ({
    bottom: checkRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));

  // A press within 400 ms of Næsta (or the results buttons) appearing is
  // dropped, so the second tap of a double tap on Athuga cannot skip the
  // feedback.
  const armed = useArmedAfter(400, `${index}:${answered}`);
  const armedResults = useArmedAfter(400, done);

  const phoneLayout = useIsPhone();
  const pinActions = useShortPortraitPhone();

  const [reactantCoeffs, setReactantCoeffs] = useState<number[]>(() =>
    reaction.reactants.map(() => 1)
  );
  const [productCoeffs, setProductCoeffs] = useState<number[]>(() =>
    reaction.products.map(() => 1)
  );

  const balanceResult = useMemo(
    () => checkBalance(reaction.reactants, reaction.products, reactantCoeffs, productCoeffs),
    [reaction, reactantCoeffs, productCoeffs]
  );

  const handleCheck = () => {
    // Balanced is not enough: the convention is the smallest whole numbers, so a
    // doubled set is not yet an answer (B12).
    const correct = balanceResult.isBalanced && balanceResult.isReduced;
    setIsCorrect(correct);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    const nextReaction = problems[index + 1];
    setIndex((prev) => prev + 1);
    setReactantCoeffs(nextReaction.reactants.map(() => 1));
    setProductCoeffs(nextReaction.products.map(() => 1));
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleRetry = () => {
    const newProblems = selectProblems(config.difficulty);
    setProblems(newProblems);
    setIndex(0);
    setCorrectCount(0);
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setDone(false);
    setReactantCoeffs(newProblems[0].reactants.map(() => 1));
    setProductCoeffs(newProblems[0].products.map(() => 1));
  };

  const hintAvailable = config.hintSource === 'dynamic-unbalanced' || Boolean(reaction.hint);

  const hintText = (): string => {
    if (config.hintSource === 'reaction-hint') return reaction.hint ?? '';
    const unbalanced = balanceResult.elements.filter((e) => !e.balanced);
    // Balanced is not yet correct: handleCheck also requires the lowest whole
    // numbers, so a doubled set must not be waved through to a one-shot Athuga.
    if (unbalanced.length === 0 && !balanceResult.isReduced) {
      return 'Atómin standast á, en stuðlarnir eru ekki í lægstu heilu tölum — þú getur deilt þeim öllum með sömu tölu.';
    }
    if (unbalanced.length === 0) {
      return 'Efnajafnan lítur út fyrir að vera stillt — smelltu á Athuga!';
    }
    const el = unbalanced[0];
    const direction =
      el.left < el.right ? 'Auktu stuðla á vinstri hlið.' : 'Auktu stuðla á hægri hlið.';
    return `${el.element} er óstillt: ${el.left} á vinstri, ${el.right} á hægri. ${direction}`;
  };

  // --- Teaching intro ---
  if (showIntro && config.intro) {
    return (
      <div ref={topRef} className={`min-h-screen bg-gradient-to-b ${config.bgFrom} to-white p-4`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 font-semibold text-sm mb-4 pointer-coarse:py-3 pointer-coarse:-mt-3 pointer-coarse:mb-1"
          >
            ← Til baka
          </button>
          {config.intro}
          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Byrja æfingar →
          </button>
        </div>
      </div>
    );
  }

  // --- Summary screen ---
  if (done) {
    return (
      <div
        ref={topRef}
        className={`min-h-screen bg-gradient-to-b ${config.bgFrom} to-white p-4 flex items-center justify-center`}
      >
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center space-y-6">
          <div className="text-5xl">
            {correctCount >= 5 ? '🎉' : correctCount >= 3 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú stilltir <span className="font-bold text-kvenno-orange">{correctCount}</span> af{' '}
            <span className="font-bold">{total}</span> jöfnum rétt
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(correctCount / total) * 100}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={armedResults(handleRetry)}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold px-2 py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={armedResults(onComplete)}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold px-2 py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button
            onClick={armedResults(onBack)}
            className="text-warm-500 hover:text-warm-700 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // Athuga and Vísbending. A plain block on a desktop, where the wrapper
  // changes nothing (each button's bottom margin collapses through it); one
  // row on a phone.
  const actionRow = (
    <div className="phone:flex phone:gap-2 phone:mb-2">
      <button
        ref={checkRef}
        onClick={handleCheck}
        className="w-full mb-3 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors phone:mb-0 phone:flex-1 phone:min-w-0"
      >
        Athuga
      </button>
      {!showHint && hintAvailable && (
        <button
          onClick={() => setShowHint(true)}
          className="w-full mb-4 px-4 py-2.5 pointer-coarse:py-3 rounded-xl text-sm font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors phone:mb-0 phone:flex-1 phone:min-w-0 phone:px-2"
        >
          Vísbending
        </button>
      )}
    </div>
  );

  const hint = showHint && !answered && hintAvailable && (
    <div
      ref={hintRef}
      className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800 animate-fade-in-up phone:p-3 phone:mb-2"
    >
      <span className="font-bold">Vísbending:</span> {hintText()}
    </div>
  );

  // --- Main gameplay ---
  return (
    <div
      ref={topRef}
      className={`min-h-screen bg-gradient-to-b ${config.bgFrom} to-white px-3 py-4 sm:p-4 phone:pt-2`}
    >
      {/* A landscape phone is too short for the equation to wrap onto a second
          row of steppers, so give it the width to stay on one. */}
      <div className="max-w-lg mx-auto [@media(max-height:500px)]:max-w-2xl">
        {/* Header */}
        {/* Header: already one row; on a phone it is tighter (design P4). */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:px-3 phone:py-2 phone:mb-2">
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={onBack}
              className="shrink-0 whitespace-nowrap text-warm-500 hover:text-warm-700 font-semibold text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
            >
              ← Til baka
            </button>
            <h1 className="min-w-0 text-center text-pretty text-base leading-tight sm:text-lg sm:leading-7 font-bold text-warm-800">
              {config.title}
            </h1>
            <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-warm-600">
              {index + 1}/{total}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden phone:mt-2 phone:h-1.5">
            <div
              className="h-full bg-kvenno-orange transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {config.instructions && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800 phone:px-3 phone:py-2 phone:mb-2">
            {config.instructions}
          </div>
        )}

        <div ref={editorRef} data-item-start className="mb-4 phone:mb-2">
          <EquationEditor
            reactants={reaction.reactants}
            products={reaction.products}
            reactantCoeffs={reactantCoeffs}
            productCoeffs={productCoeffs}
            onReactantCoeffChange={(i, v) => {
              if (!answered) {
                const next = [...reactantCoeffs];
                next[i] = v;
                setReactantCoeffs(next);
              }
            }}
            onProductCoeffChange={(i, v) => {
              if (!answered) {
                const next = [...productCoeffs];
                next[i] = v;
                setProductCoeffs(next);
              }
            }}
            disabled={answered}
          />
        </div>

        <div ref={atomsRef} className="mb-4 phone:mb-2">
          <AtomCounter
            elements={balanceResult.elements}
            highlightUnbalanced={config.highlightUnbalancedOnHint && showHint}
          />
        </div>

        {/* On a phone the hint opens above the action row, which is one row:
            Athuga | Vísbending, in DOM order. On a desktop both stay where they
            always were: Athuga, then Vísbending or the opened hint below it. */}
        {phoneLayout && hint}

        {!answered &&
          (pinActions ? (
            // The SE only: after compaction the loop is still a little taller
            // than the screen there, so the row is pinned to its bottom. It
            // holds Athuga | Vísbending only and leaves with them on commit,
            // so it never sits over the feedback.
            <PinnedActions>{actionRow}</PinnedActions>
          ) : (
            actionRow
          ))}

        {!phoneLayout && hint}

        {answered && (
          <div ref={feedbackBlockRef} className="space-y-4 phone:space-y-2">
            {/* The region focus moves to after Athuga. FeedbackPanel keeps its
                own role="alert" and exposes no id to label the group with. */}
            <div ref={feedbackRef} role="group" tabIndex={-1}>
              <FeedbackPanel
                feedback={{
                  isCorrect,
                  explanation: isCorrect
                    ? 'Rétt! Efnajafnan er stillt.'
                    : balanceResult.isBalanced
                      ? // Atoms balance but the coefficients share a common factor. Say
                        // that plainly — the student has done the hard part and is being
                        // held to a convention nothing had told them about.
                        `Atómin standast á, en stuðlarnir eru ekki í lægstu heilu tölum — þú getur deilt þeim öllum með sömu tölu. Réttir stuðlar eru: ${[
                          ...reaction.reactants.map((m) => m.coefficient),
                          ...reaction.products.map((m) => m.coefficient),
                        ].join(', ')}.`
                      : `Rangt. ${buildUnbalancedDiagnostic(balanceResult.elements)} Réttir stuðlar eru: ${[
                          ...reaction.reactants.map((m) => m.coefficient),
                          ...reaction.products.map((m) => m.coefficient),
                        ].join(', ')}.`,
                  // Renders outside the collapsible explanation, so it is the one
                  // thing a student who reads nothing else still sees.
                  misconception: diagnoseMisconception(
                    reaction.reactants,
                    reaction.products,
                    reactantCoeffs,
                    productCoeffs,
                    balanceResult
                  ),
                }}
                config={{ showExplanation: true }}
              />
            </div>

            <button
              ref={nextRef}
              onClick={armed(handleNext)}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < total ? 'Næsta efnajafna →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level;
