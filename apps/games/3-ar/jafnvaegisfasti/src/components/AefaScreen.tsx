import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import { TaskStrip } from '@shared/components';
import {
  activeProducts,
  activeReactants,
  applyCoupledSteps,
  equationOf,
  kcExpression,
  omittedFromK,
  R_GAS,
  sameEquation,
  type CoupledStep,
  type Direction,
} from '@shared/engine/equilibrium';
import {
  focusTarget,
  formatDecimal,
  formatScientific,
  gradeScientific,
  isPhone,
  revealTop,
  useArmedAfter,
  useCommitReveal,
  useIsPhone,
  useItemStart,
  useRevealTopOnDesktop,
} from '@shared/utils';

import { ScientificInput } from './ScientificInput';
import { COUPLED_PROBLEMS } from '../data/coupled';
import { DIRECTION_PROBLEMS, EXPRESSION_PROBLEMS, KP_PROBLEMS } from '../data/problems';

/**
 * Æfa — three skills, in the order the book teaches them.
 *
 * 1. Write the expression. Graded by having the student pick which species are
 *    in it, not by typing it: the exponents come from the equation and the only
 *    decision a student actually makes is which terms belong at all.
 * 2. Predict the direction from Q against K.
 * 3. Convert Kc to Kp.
 * 4. Build an equation out of coupled ones, and carry K through with it.
 *
 * The fourth is graded in two stages, and the first stage is graded
 * **structurally**: the operations the student picks are applied for real and
 * the result compared with the target equation, rather than checked against a
 * stored list of correct choices. So a route nobody anticipated is still
 * marked right if it lands on the target, and the number in stage two is the
 * one their own operations produced.
 *
 * The third uses two fields for mantissa and power of ten, for the reason
 * `@shared/utils` explains: Kp here runs from 10⁻⁵ to 10², a single box cannot
 * take that range, and splitting them separates "right digits, wrong power"
 * from "wrong digits". The exponent is signed, and the decimal keypad a phone
 * raises for it has no minus key on an iPhone, so `ScientificInput` carries a
 * sign button on touch screens. Naming the numeric input type in this comment
 * would fail `decimal-input.test.ts`, which scans source without telling a use
 * from a mention.
 *
 * **On a phone** (the vertical-scroll pass, design §4): after every check the
 * problem, the answer, the verdict and "Næsta dæmi" are brought in together
 * where they fit, and focus moves to the feedback — a group named by its
 * verdict — never to the button, so a second Enter or tap cannot skip it.
 * "Næsta dæmi" also ignores a press within 400 ms of appearing. A new problem
 * opens at its start with focus on it. A desktop window keeps the scrolling
 * the game's own helper did (`utils/desktopReveal.ts`).
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Task = 'expression' | 'direction' | 'kp' | 'coupled';

const TASKS: { id: Task; label: string; count: number }[] = [
  { id: 'expression', label: 'Skrifa stæðuna', count: EXPRESSION_PROBLEMS.length },
  { id: 'direction', label: 'Spá fyrir um stefnu', count: DIRECTION_PROBLEMS.length },
  { id: 'kp', label: 'Kc yfir í Kp', count: KP_PROBLEMS.length },
  { id: 'coupled', label: 'Tengd jafnvægi', count: COUPLED_PROBLEMS.length },
];

/**
 * Around a problem and its answer: on a phone held sideways, the problem beside
 * the answer. A plain block anywhere else, so a desktop window lays out as
 * before.
 */
const SIDE_BY_SIDE =
  'phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4';

export function AefaScreen({ onComplete, onBack }: Props) {
  const [task, setTask] = useState<Task>('expression');
  const [done, setDone] = useState<Task[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);
  const shownTask = useRef(task);
  // The number strip exists only on a phone: a desktop window keeps the tabs'
  // markup exactly as it was.
  const phone = useIsPhone();

  // Finishing a task switches to the next one from the foot of the card; on a
  // phone the tabs that say which task is now open are a screen above. The
  // button pressed to finish is gone, so focus goes to the new task's first
  // problem; a tab the student chose keeps its focus.
  useLayoutEffect(() => {
    if (shownTask.current === task) return;
    shownTask.current = task;
    revealTop(tabsRef.current);
    const active = document.activeElement;
    if (!active || active === document.body || !active.isConnected) {
      focusTarget(document.querySelector<HTMLElement>('main [data-item-start]'));
    }
  }, [task]);
  // A desktop window keeps what the game's own helper did there.
  useRevealTopOnDesktop(tabsRef, task);

  const finish = (which: Task) => {
    const next = done.includes(which) ? done : [...done, which];
    setDone(next);
    const remaining = TASKS.find((t) => !next.includes(t.id));
    if (remaining) setTask(remaining.id);
    else onComplete();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-4 flex items-baseline justify-between gap-3 sm:mb-6 phone:mb-2">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl phone:text-base">
            Æfa
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:-mr-3 pointer-coarse:px-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        {/* On a phone the tabs are a number strip, as Skilja's steps are: the
            open task keeps its label and the others show their number, their
            label kept for a screen reader (the number is hidden from it, so
            each tab's name is its label, as before). Four labels wrap to three rows on a
            phone and push every problem a sixth of the screen down. */}
        <div ref={tabsRef} className="mb-6 flex flex-wrap gap-2 phone:mb-2 phone:gap-1.5">
          {TASKS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTask(t.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors pointer-coarse:min-h-11 pointer-coarse:min-w-11 sm:px-4 phone:px-2.5 ${
                task === t.id
                  ? 'bg-kvenno-orange font-semibold text-white'
                  : done.includes(t.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              }`}
            >
              {phone ? (
                <>
                  <span aria-hidden="true">
                    {i + 1}
                    {task === t.id && '. '}
                  </span>
                  <span className={task === t.id ? undefined : 'sr-only'}>{t.label}</span>
                </>
              ) : (
                t.label
              )}
              {done.includes(t.id) && <span className="ml-1.5 phone:ml-1">✓</span>}
            </button>
          ))}
        </div>

        {task === 'expression' && <ExpressionTask onDone={() => finish('expression')} />}
        {task === 'direction' && <DirectionTask onDone={() => finish('direction')} />}
        {task === 'kp' && <KpTask onDone={() => finish('kp')} />}
        {task === 'coupled' && <CoupledTask onDone={() => finish('coupled')} />}
      </div>
    </div>
  );
}

/** "Dæmi n af N", the line every task opens with. */
function Counter({ index, count }: { index: number; count: number }) {
  return (
    <p className="mb-4 text-sm text-warm-600 phone:mb-2">
      Dæmi {index + 1} af {count}
    </p>
  );
}

/** "Næsta dæmi", or "Ljúka" on the last problem, at the foot of the feedback. */
function NextButton({
  buttonRef,
  onClick,
  last,
  spacing = 'mt-4 phone:mt-3',
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  last: boolean;
  spacing?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className={[
        'game-btn',
        spacing,
        'rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:py-2.5',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {last ? 'Ljúka' : 'Næsta dæmi'}
    </button>
  );
}

/** Pick the species that belong in K. The exponents follow from the equation. */
function ExpressionTask({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const verdictId = useId();
  const problemRef = useRef<HTMLDivElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const rootRef = useItemStart<HTMLDivElement>(index);
  useCommitReveal(checked, () => ({
    bottom: nextRef.current,
    tops: [problemRef.current, choiceRef.current, feedbackRef.current],
    focus: feedbackRef.current,
    desktop: feedbackRef.current,
  }));
  // A double tap on Athuga must not press "Næsta dæmi".
  const armed = useArmedAfter(400, `${index}:${checked}`);

  const problem = EXPRESSION_PROBLEMS[index];
  const species = useMemo(
    () => [...problem.reaction.reactants, ...problem.reaction.products],
    [problem]
  );
  const correct = useMemo(
    () =>
      [...activeReactants(problem.reaction), ...activeProducts(problem.reaction)].map(
        (s) => `${s.formula}-${s.phase}`
      ),
    [problem]
  );

  const key = (s: (typeof species)[number]) => `${s.formula}-${s.phase}`;
  const isRight = picked.length === correct.length && correct.every((c) => picked.includes(c));

  const next = () => {
    if (index + 1 >= EXPRESSION_PROBLEMS.length) {
      onDone();
      return;
    }
    setIndex(index + 1);
    setPicked([]);
    setChecked(false);
  };

  return (
    <div ref={rootRef}>
      <Counter index={index} count={EXPRESSION_PROBLEMS.length} />
      <div className={SIDE_BY_SIDE}>
        <div
          ref={problemRef}
          data-item-start
          className="mb-4 rounded-xl border-2 border-warm-200 bg-warm-50 p-5 phone:mb-3 phone:p-3"
        >
          <p className="mb-2 font-mono text-lg text-warm-800 phone:mb-1">
            {equationOf(problem.reaction)}
          </p>
          <p className="text-sm text-warm-600">Hvaða efni eiga heima í jafnvægisstæðunni?</p>
        </div>

        <div>
          <div ref={choiceRef} className="mb-4 flex flex-wrap gap-2 phone:mb-3">
            {species.map((s) => {
              const k = key(s);
              const on = picked.includes(k);
              const right = correct.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  disabled={checked}
                  onClick={() => setPicked(on ? picked.filter((p) => p !== k) : [...picked, k])}
                  className={`rounded-lg border-2 px-4 py-2 font-mono transition-colors ${
                    checked
                      ? right
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : on
                          ? 'border-red-400 bg-red-50 text-red-900 line-through'
                          : 'border-warm-200 bg-white text-warm-400'
                      : on
                        ? 'border-kvenno-orange bg-orange-50 text-kvenno-orange-dark'
                        : 'border-warm-300 bg-white text-warm-700 hover:border-warm-400'
                  }`}
                >
                  {s.formula}
                  <span className="ml-1 text-xs">({s.phase})</span>
                </button>
              );
            })}
          </div>

          {!checked ? (
            <button
              key="check"
              type="button"
              onClick={() => setChecked(true)}
              className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
            >
              Athuga
            </button>
          ) : (
            // The group focus moves to after Athuga, named by the verdict.
            <div
              key="feedback"
              ref={feedbackRef}
              role="group"
              aria-labelledby={verdictId}
              tabIndex={-1}
              className={`rounded-lg border-2 p-4 phone:p-3 ${
                isRight ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
              }`}
            >
              <p id={verdictId} className="mb-2 font-semibold text-warm-900">
                {isRight ? 'Rétt.' : 'Ekki alveg.'}
              </p>
              <p className="mb-2 font-mono text-warm-800">{kcExpression(problem.reaction)}</p>
              {omittedFromK(problem.reaction).length > 0 && (
                <p className="mb-2 text-sm text-warm-700">
                  Utan stæðu:{' '}
                  {omittedFromK(problem.reaction)
                    .map((s) => `${s.formula} (${s.phase === 's' ? 'fast' : 'hreinn vökvi'})`)
                    .join(', ')}
                  .
                </p>
              )}
              <p className="text-sm text-warm-700">{problem.point}</p>
              <NextButton
                buttonRef={nextRef}
                onClick={armed(next)}
                last={index + 1 >= EXPRESSION_PROBLEMS.length}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DIRECTION_LABEL: Record<Direction, string> = {
  afram: 'Áfram (til hægri)',
  afturabak: 'Afturábak (til vinstri)',
  jafnvaegi: 'Þegar í jafnvægi',
};

function DirectionTask({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Direction | null>(null);
  const verdictId = useId();
  const problemRef = useRef<HTMLDivElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const rootRef = useItemStart<HTMLDivElement>(index);
  useCommitReveal(answer !== null, () => ({
    bottom: nextRef.current,
    tops: [problemRef.current, choiceRef.current, feedbackRef.current],
    focus: feedbackRef.current,
    desktop: feedbackRef.current,
  }));
  const armed = useArmedAfter(400, `${index}:${answer !== null}`);

  const problem = DIRECTION_PROBLEMS[index];
  const options: Direction[] = ['afram', 'afturabak', 'jafnvaegi'];

  const next = () => {
    if (index + 1 >= DIRECTION_PROBLEMS.length) {
      onDone();
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
  };

  return (
    <div ref={rootRef}>
      <Counter index={index} count={DIRECTION_PROBLEMS.length} />
      <div className={SIDE_BY_SIDE}>
        <div
          ref={problemRef}
          data-item-start
          className="mb-4 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5 phone:mb-3 phone:p-3"
        >
          <p className="mb-2 font-mono text-warm-800 phone:mb-1">{equationOf(problem.reaction)}</p>
          <p className="mb-3 font-mono text-sm text-warm-700 phone:mb-2">
            K = <span className="whitespace-nowrap">{formatScientific(problem.k, 2)}</span>
          </p>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-1 font-mono text-sm text-warm-700 min-[360px]:grid-cols-2 sm:gap-x-6">
            {Object.entries(problem.amounts).map(([formula, value]) => (
              <div key={formula} className="flex justify-between gap-2">
                <dt>[{formula}]</dt>
                <dd className="whitespace-nowrap">{value.toString().replace('.', ',')} M</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <div ref={choiceRef} className="mb-4 grid gap-2 phone:mb-3">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={answer !== null}
                onClick={() => setAnswer(option)}
                className={`rounded-lg border-2 px-4 py-3 text-left transition-colors pointer-coarse:min-h-11 phone:py-2 ${
                  answer === null
                    ? 'border-warm-300 bg-white text-warm-700 hover:border-kvenno-orange'
                    : option === problem.direction
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : option === answer
                        ? 'border-red-400 bg-red-50 text-red-900'
                        : 'border-warm-200 bg-white text-warm-400'
                }`}
              >
                {DIRECTION_LABEL[option]}
              </button>
            ))}
          </div>

          {answer !== null && (
            // The group focus moves to after an answer, named by the verdict.
            <div
              ref={feedbackRef}
              role="group"
              aria-labelledby={verdictId}
              tabIndex={-1}
              className="rounded-lg border-2 border-warm-300 bg-warm-50 p-4 phone:p-3"
            >
              <p id={verdictId} className="mb-2 font-semibold text-warm-900">
                {answer === problem.direction ? 'Rétt.' : 'Rangt.'}
              </p>
              <p className="mb-2 font-mono text-sm text-warm-800">
                <span className="whitespace-nowrap">
                  Q = {Number.isFinite(problem.q) ? formatScientific(problem.q, 3) : '∞'}
                </span>{' '}
                · <span className="whitespace-nowrap">K = {formatScientific(problem.k, 2)}</span> ·{' '}
                <span className="whitespace-nowrap">
                  Q{' '}
                  {problem.direction === 'afram'
                    ? '<'
                    : problem.direction === 'afturabak'
                      ? '>'
                      : '='}{' '}
                  K
                </span>
              </p>
              <p className="text-sm text-warm-700">{problem.context}</p>
              <NextButton
                buttonRef={nextRef}
                onClick={armed(next)}
                last={index + 1 >= DIRECTION_PROBLEMS.length}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpTask({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [outcome, setOutcome] = useState<string | null>(null);
  // Counts every check, so a repeated empty check still brings its message
  // into view.
  const [checks, setChecks] = useState(0);
  const verdictId = useId();
  const problemRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const problem = KP_PROBLEMS[index];
  // One attempt, then the answer — but an empty or unreadable check is not an
  // attempt. It used to be: the fields locked and Kp was printed under a
  // message asking the student to fill in the fields it had just locked.
  const graded = outcome !== null && outcome !== 'ogilt';

  const rootRef = useItemStart<HTMLDivElement>(index);
  // An empty check brings its message in under the fields and leaves focus in
  // them, so the student can do what it asks; a graded one moves focus to the
  // feedback.
  useCommitReveal(checks, () =>
    graded
      ? {
          bottom: nextRef.current,
          tops: [problemRef.current, answerRef.current, feedbackRef.current],
          focus: feedbackRef.current,
          desktop: feedbackRef.current,
        }
      : {
          bottom: feedbackRef.current,
          tops: [answerRef.current, feedbackRef.current],
          focus: null,
          desktop: feedbackRef.current,
        }
  );
  const armed = useArmedAfter(400, `${index}:${graded}`);

  const MESSAGE: Record<string, string> = {
    rett: 'Rétt.',
    veldisvisir:
      'Tölustafirnir stemma en veldisvísirinn ekki. Athugaðu formerkið á Δn — myndefni mínus hvarfefni — og að hitastigið fari í kelvin.',
    tolustafir: 'Rétt stærðarþrep en tölurnar stemma ekki. Reiknaðu (R·T) aftur.',
    baedi: 'Hvorugt stemmir. Byrjaðu á Δn og skrifaðu svo (R·T) í rétt veldi.',
    ogilt: 'Fylltu í báða reitina — tölu og veldisvísi, t.d. 2,8 og -3.',
  };

  const check = () => {
    if (graded) return;
    setOutcome(gradeScientific({ mantissa, exponent }, problem.kp).outcome);
    setChecks((n) => n + 1);
  };

  const next = () => {
    if (index + 1 >= KP_PROBLEMS.length) {
      onDone();
      return;
    }
    setIndex(index + 1);
    setMantissa('');
    setExponent('');
    setOutcome(null);
  };

  return (
    <div ref={rootRef}>
      <Counter index={index} count={KP_PROBLEMS.length} />
      <div className={SIDE_BY_SIDE}>
        <div
          ref={problemRef}
          data-item-start
          className="mb-4 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5 phone:mb-3 phone:p-3"
        >
          <p className="mb-2 font-mono text-warm-800 phone:mb-1">{equationOf(problem.reaction)}</p>
          <p className="font-mono text-sm text-warm-700">
            Kc = <span className="whitespace-nowrap">{formatScientific(problem.kc, 3)}</span> við{' '}
            {problem.temperatureC} °C
          </p>
          <p className="mt-3 text-sm text-warm-600 phone:mt-2">
            Hvert er Kp? Notaðu Kp = Kc · (R·T)
            <sup className="pointer-coarse:text-[12px]">Δn</sup> með R = {formatDecimal(R_GAS)} og
            hitastigið í kelvin.
          </p>
        </div>

        <div>
          <div ref={answerRef} className="mb-4 phone:mb-3">
            <p
              aria-hidden="true"
              className="mb-2 block text-sm font-semibold text-warm-700 phone:mb-1"
            >
              Kp
            </p>
            <ScientificInput
              label="Kp"
              mantissa={mantissa}
              exponent={exponent}
              onMantissaChange={setMantissa}
              onExponentChange={setExponent}
              mantissaPlaceholder="2,8"
              exponentPlaceholder="-3"
              disabled={graded}
              onSubmit={check}
            />
            <p className="mt-2 text-xs text-warm-500 phone:mt-1">
              Tvær tölur: fyrst talan, svo veldisvísirinn. Bæði komma og punktur virka.
            </p>
          </div>

          {!graded ? (
            <div key="check">
              <button
                type="button"
                onClick={check}
                className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
              >
                Athuga
              </button>
              {outcome === 'ogilt' && (
                <div
                  ref={feedbackRef}
                  role="alert"
                  className="mt-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 phone:mt-3 phone:p-3"
                >
                  {MESSAGE.ogilt}
                </div>
              )}
            </div>
          ) : (
            // The group focus moves to after Athuga, named by the verdict.
            <div
              key="feedback"
              ref={feedbackRef}
              role="group"
              aria-labelledby={verdictId}
              tabIndex={-1}
              className={`rounded-lg border-2 p-4 phone:p-3 ${
                outcome === 'rett' ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
              }`}
            >
              <p id={verdictId} className="mb-2 font-semibold text-warm-900">
                {MESSAGE[outcome]}
              </p>
              <p className="font-mono text-sm text-warm-800">
                <span className="whitespace-nowrap">Δn = {problem.deltaN}</span> ·{' '}
                <span className="whitespace-nowrap">T = {problem.temperatureC} + 273,15 K</span> ·{' '}
                <span className="whitespace-nowrap">Kp = {formatScientific(problem.kp, 3)}</span>
              </p>
              {problem.deltaN === 0 && (
                <p className="mt-2 text-sm text-warm-700">
                  Δn er núll, svo (R·T)<sup className="pointer-coarse:text-[12px]">0</sup> = 1 og Kp
                  er nákvæmlega sama talan og Kc.
                </p>
              )}
              <NextButton
                buttonRef={nextRef}
                onClick={armed(next)}
                last={index + 1 >= KP_PROBLEMS.length}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type Stage = 'operations' | 'constant' | 'done';

/**
 * The operations chosen for one given, as one line, for a phone once they are
 * locked (design P10): the button row it replaces takes two rows there. The
 * words are the buttons' own.
 */
function chosenOperations(choice: { reversed: boolean; factor: number }): string | null {
  const parts = [
    choice.reversed ? 'Snúa við' : null,
    choice.factor > 1 ? `Margfalda með ${choice.factor}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

/**
 * Build the target equation out of the given ones, then carry K through.
 *
 * **Stage one is graded by doing it, not by comparison with a stored answer.**
 * The chosen operations are applied through the same engine the data uses, and
 * the equation that comes out is compared with the target. That is what lets
 * the feedback say which side is wrong rather than only that something is.
 *
 * **On a portrait phone the target and the equation being built stay pinned
 * together** under the header while the student works on the givens below
 * (`TaskStrip`, design P7): the comparison is the task, and unpinned the two
 * are never on screen at once. On any phone the built equation sits directly
 * under the target; on a desktop window it keeps its place under the givens.
 * Once the equation is right the strip unpins — the constant is typed, and
 * nothing is pinned over a keyboard — and on a phone each given's buttons fold
 * into one line naming what was chosen.
 */
function CoupledTask({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<{ reversed: boolean; factor: number }[]>([]);
  const [stage, setStage] = useState<Stage>('operations');
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [outcome, setOutcome] = useState<string | null>(null);
  const [wrongShape, setWrongShape] = useState(false);
  // Counts every check, so feedback is brought into view on a repeat check
  // with the same outcome as well as on a new one.
  const [checks, setChecks] = useState(0);
  const phone = useIsPhone();
  const matchId = useId();
  const answerId = useId();
  const targetRef = useRef<HTMLDivElement>(null);
  const givensRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const matchRef = useRef<HTMLDivElement>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  const constantWrongRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const rootRef = useItemStart<HTMLDivElement>(index);
  useCommitReveal(checks, () => {
    const desktop = feedbackRef.current;
    if (stage === 'operations') {
      // The equation is not the target yet: its message, under the button.
      return {
        bottom: shapeRef.current,
        tops: [givensRef.current, shapeRef.current],
        focus: shapeRef.current,
        desktop,
      };
    }
    if (stage === 'done') {
      return {
        bottom: nextRef.current,
        tops: [matchRef.current, answerRef.current],
        focus: answerRef.current,
        desktop,
      };
    }
    if (outcome !== null) {
      return {
        bottom: constantWrongRef.current,
        tops: [inputRowRef.current, constantWrongRef.current],
        focus: constantWrongRef.current,
        desktop,
      };
    }
    // The equation matched and the constant is next. A phone goes straight to
    // the number field, with the givens' constants above it (design P10); a
    // desktop window to the verdict, so no field lights up with a focus ring.
    const field = inputRowRef.current?.querySelector('input') ?? null;
    return {
      bottom: checkRef.current,
      tops: [targetRef.current, givensRef.current, matchRef.current],
      focus: isPhone() && field ? field : matchRef.current,
      desktop,
    };
  });
  // Keyed on every check too: a double tap on Athuga must not press the
  // "Sýna svarið" a wrong constant brings in under the finger.
  const armed = useArmedAfter(400, `${index}:${stage}:${checks}`);

  const problem = COUPLED_PROBLEMS[index];
  const answer = problem.result.constant!.value;

  const current = useMemo(
    () => problem.givens.map((_, i) => choices[i] ?? { reversed: false, factor: 1 }),
    [problem, choices]
  );

  const composed = useMemo(() => {
    const steps: CoupledStep[] = problem.givens.map((reaction, i) => ({
      reaction,
      reversed: current[i].reversed,
      factor: current[i].factor,
    }));
    return applyCoupledSteps(steps, 'tilraun', 'tilraun');
  }, [problem, current]);

  const set = (i: number, patch: Partial<{ reversed: boolean; factor: number }>) => {
    const next = problem.givens.map((_, j) => ({ ...current[j] }));
    next[i] = { ...next[i], ...patch };
    setChoices(next);
    setWrongShape(false);
  };

  const checkOperations = () => {
    if (sameEquation(composed, problem.target)) setStage('constant');
    else setWrongShape(true);
    setChecks((n) => n + 1);
  };

  const checkConstant = () => {
    if (stage !== 'constant') return;
    const graded = gradeScientific({ mantissa, exponent }, answer, 0.03);
    setOutcome(graded.outcome);
    if (graded.outcome === 'rett') setStage('done');
    setChecks((n) => n + 1);
  };

  const showAnswer = () => {
    setStage('done');
    setChecks((n) => n + 1);
  };

  const next = () => {
    if (index + 1 >= COUPLED_PROBLEMS.length) {
      onDone();
      return;
    }
    setIndex(index + 1);
    setChoices([]);
    setStage('operations');
    setMantissa('');
    setExponent('');
    setOutcome(null);
    setWrongShape(false);
  };

  const folded = phone && stage !== 'operations';

  // The equation being built. On a phone it sits under the target, pinned with
  // it; on a desktop window it keeps its place under the givens, in the DOM as
  // well as on screen, so the reading order there is what it was. It holds
  // nothing focusable, so neither place changes the tab order.
  const composedBox: ReactNode = (
    <div className="mb-4 rounded-xl border-2 border-dashed border-warm-300 p-4 phone:mb-2 phone:px-3 phone:py-1.5">
      <p className="mb-1 text-xs uppercase tracking-wide text-warm-500 phone:mb-0">
        {problem.givens.length > 1 ? 'Summa jafnanna' : 'Jafnan eins og þú stilltir hana'}
      </p>
      <p className="font-mono text-warm-800">{equationOf(composed)}</p>
    </div>
  );

  const strip: ReactNode = (
    <>
      {/* On a phone the heading and the temperature share a line above the
          equation (the equation takes `order` last; nothing here is
          focusable), so the pinned strip stays inside its height budget. */}
      <div
        ref={targetRef}
        data-item-start
        className="mb-4 rounded-xl border-2 border-kvenno-orange bg-orange-50 p-5 phone:mb-1.5 phone:flex phone:flex-wrap phone:items-baseline phone:gap-x-2 phone:px-3 phone:py-1.5"
      >
        <p className="mb-1 text-sm font-semibold text-warm-800 phone:mb-0 phone:text-xs">
          Markjafnan — finndu K fyrir hana
        </p>
        <p className="font-mono text-lg text-warm-900 phone:order-last phone:w-full phone:text-base">
          {equationOf(problem.target)}
        </p>
        <p className="mt-1 text-sm text-warm-600 phone:mt-0 phone:text-xs">
          við {problem.result.constant!.temperatureC} °C
        </p>
      </div>
      {phone && composedBox}
    </>
  );

  return (
    <div ref={rootRef}>
      <Counter index={index} count={COUPLED_PROBLEMS.length} />

      {/* A column, so the pinned strip stays stuck until the student reaches
          the check below the givens. Its children carry only bottom margins,
          so it lays them out exactly as the page flow did. */}
      <div className="flex flex-col">
        {stage === 'operations' ? <TaskStrip>{strip}</TaskStrip> : strip}

        <div ref={givensRef}>
          {problem.givens.map((given, i) => {
            const summary = chosenOperations(current[i]);
            return (
              <div
                key={given.id}
                className="mb-3 rounded-xl border-2 border-warm-200 bg-warm-50 p-3 sm:p-4 phone:mb-2 phone:py-2"
              >
                <p className="font-mono text-sm text-warm-800">{equationOf(given)}</p>
                <p className={`font-mono text-sm text-warm-700 ${folded ? '' : 'mb-3 phone:mb-2'}`}>
                  Kc ={' '}
                  <span className="whitespace-nowrap">
                    {formatScientific(given.constant!.value, 2)}
                  </span>{' '}
                  við {given.constant!.temperatureC} °C
                </p>
                {folded ? (
                  summary && <p className="text-sm font-semibold text-warm-800">{summary}</p>
                ) : (
                  // Grouped so that on a phone "Margfalda með" wraps together
                  // with its own buttons, and the three buttons wrap as one
                  // row, instead of the label being stranded at the end of a
                  // line.
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={current[i].reversed}
                      disabled={stage !== 'operations'}
                      onClick={() => set(i, { reversed: !current[i].reversed })}
                      className={`rounded-lg border-2 px-3 py-1.5 text-sm transition-colors disabled:opacity-60 pointer-coarse:min-h-11 ${
                        current[i].reversed
                          ? 'border-kvenno-orange bg-kvenno-orange font-semibold text-white'
                          : 'border-warm-300 bg-white text-warm-700'
                      }`}
                    >
                      Snúa við
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-warm-600">Margfalda með</span>
                      <div role="group" aria-label="Margfalda með" className="flex gap-2">
                        {[1, 2, 3].map((f) => (
                          <button
                            key={f}
                            type="button"
                            aria-pressed={current[i].factor === f}
                            disabled={stage !== 'operations'}
                            onClick={() => set(i, { factor: f })}
                            className={`h-9 w-9 rounded-lg border-2 text-sm transition-colors disabled:opacity-60 pointer-coarse:h-11 pointer-coarse:w-11 ${
                              current[i].factor === f
                                ? 'border-kvenno-orange bg-kvenno-orange font-semibold text-white'
                                : 'border-warm-300 bg-white text-warm-700'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!phone && composedBox}

        {stage === 'operations' && (
          <div ref={feedbackRef}>
            <button
              key="check-equation"
              type="button"
              onClick={checkOperations}
              className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark phone:py-2.5"
            >
              Athuga jöfnuna
            </button>
            {wrongShape && (
              // Focus moves here after a check that does not match.
              <div
                ref={shapeRef}
                role="group"
                tabIndex={-1}
                className="mt-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 phone:mt-3 phone:p-3"
              >
                Þessi jafna er ekki markjafnan enn. Berðu saman hlið fyrir hlið: hvaða efni eiga að
                standa vinstra megin og hvaða stuðlar? Það efni sem á að styttast út þarf að standa
                sitt hvorum megin með sama stuðli.
              </div>
            )}
          </div>
        )}

        {(stage === 'constant' || stage === 'done') && (
          // Named by the verdict on the equation; focus moves into it once the
          // equation matches.
          <div ref={feedbackRef} role="group" aria-labelledby={matchId}>
            <div
              ref={matchRef}
              id={matchId}
              className="mb-4 rounded-lg border-2 border-green-300 bg-green-50 p-4 text-sm text-green-900 phone:mb-3 phone:p-3"
            >
              Jafnan stemmir. Nú fastinn: {current.some((c) => c.reversed) && 'snúið → umhverfa, '}
              {current.some((c) => c.factor > 1) && 'margfaldað → veldi, '}
              {problem.givens.length > 1 && 'lagt saman → margfeldi'}
              {problem.givens.length === 1 && 'einn fasti eftir'}.
            </div>

            {stage === 'constant' ? (
              <div>
                <div ref={inputRowRef}>
                  <ScientificInput
                    prefix="K ="
                    mantissa={mantissa}
                    exponent={exponent}
                    onMantissaChange={setMantissa}
                    onExponentChange={setExponent}
                    mantissaPlaceholder="3,7"
                    exponentPlaceholder="4"
                    className="mb-4 phone:mb-3"
                    onSubmit={checkConstant}
                  />
                </div>
                <button
                  key="check-constant"
                  ref={checkRef}
                  type="button"
                  onClick={checkConstant}
                  className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
                >
                  Athuga
                </button>
                {outcome !== null && outcome !== 'rett' && (
                  // Focus moves here after a wrong constant.
                  <div
                    ref={constantWrongRef}
                    role="group"
                    tabIndex={-1}
                    className="mt-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 phone:mt-3 phone:p-3"
                  >
                    {outcome === 'veldisvisir' &&
                      'Tölustafirnir stemma en veldisvísirinn ekki. Fór margföldunarstuðullinn í veldi á öllum fastanum?'}
                    {outcome === 'tolustafir' &&
                      'Rétt stærðarþrep en tölurnar stemma ekki. Athugaðu hvort þú hafir snúið réttum fasta við.'}
                    {outcome === 'baedi' &&
                      'Hvorugt stemmir enn. Farðu í gegnum aðgerðirnar eina í einu: umhverfa, svo veldi, svo margfeldi.'}
                    {outcome === 'ogilt' && 'Fylltu í báða reitina — tölu og veldisvísi.'}
                    <button
                      type="button"
                      onClick={armed(showAnswer)}
                      className="mt-3 block text-xs underline pointer-coarse:-mt-0.5 pointer-coarse:-mb-3.5 pointer-coarse:py-3.5 pointer-coarse:pr-4"
                    >
                      Sýna svarið og halda áfram
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Focus moves here once the constant is right or shown.
              <div
                key="answer"
                ref={answerRef}
                role="group"
                aria-labelledby={answerId}
                tabIndex={-1}
                className="rounded-lg border-2 border-green-300 bg-green-50 p-4 phone:p-3"
              >
                <p id={answerId} className="mb-2 font-mono text-green-900">
                  K = <span className="whitespace-nowrap">{formatScientific(answer, 2)}</span>
                </p>
                <p className="mb-3 text-sm text-warm-700">{problem.context}</p>
                <NextButton
                  buttonRef={nextRef}
                  onClick={armed(next)}
                  last={index + 1 >= COUPLED_PROBLEMS.length}
                  spacing=""
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
