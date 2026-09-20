import { useMemo, useState } from 'react';

import {
  activeProducts,
  activeReactants,
  equationOf,
  kcExpression,
  omittedFromK,
  type Direction,
} from '@shared/engine/equilibrium';
import { DECIMAL_INPUT_PROPS, formatScientific, gradeScientific } from '@shared/utils';

import { DIRECTION_PROBLEMS, EXPRESSION_PROBLEMS, KP_PROBLEMS } from '../data/problems';

/**
 * Æfa — three skills, in the order the book teaches them.
 *
 * 1. Write the expression. Graded by having the student pick which species are
 *    in it, not by typing it: the exponents come from the equation and the only
 *    decision a student actually makes is which terms belong at all.
 * 2. Predict the direction from Q against K.
 * 3. Convert Kc to Kp.
 *
 * The third uses two fields for mantissa and power of ten, for the reason
 * `@shared/utils` explains: Kp here runs from 10⁻⁵ to 10², a single box cannot
 * take that range, and splitting them separates "right digits, wrong power"
 * from "wrong digits". The exponent field is text rather than numeric because
 * it is signed — a numeric keypad on a phone offers no minus sign. Naming that
 * input type in this comment would fail `decimal-input.test.ts`, which scans
 * source without telling a use from a mention.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Task = 'expression' | 'direction' | 'kp';

const TASKS: { id: Task; label: string; count: number }[] = [
  { id: 'expression', label: 'Skrifa stæðuna', count: EXPRESSION_PROBLEMS.length },
  { id: 'direction', label: 'Spá fyrir um stefnu', count: DIRECTION_PROBLEMS.length },
  { id: 'kp', label: 'Kc yfir í Kp', count: KP_PROBLEMS.length },
];

export function AefaScreen({ onComplete, onBack }: Props) {
  const [task, setTask] = useState<Task>('expression');
  const [done, setDone] = useState<Task[]>([]);

  const finish = (which: Task) => {
    const next = done.includes(which) ? done : [...done, which];
    setDone(next);
    const remaining = TASKS.find((t) => !next.includes(t.id));
    if (remaining) setTask(remaining.id);
    else onComplete();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Æfa</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TASKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTask(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                task === t.id
                  ? 'bg-kvenno-orange font-semibold text-white'
                  : done.includes(t.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              }`}
            >
              {t.label}
              {done.includes(t.id) && <span className="ml-1.5">✓</span>}
            </button>
          ))}
        </div>

        {task === 'expression' && <ExpressionTask onDone={() => finish('expression')} />}
        {task === 'direction' && <DirectionTask onDone={() => finish('direction')} />}
        {task === 'kp' && <KpTask onDone={() => finish('kp')} />}
      </div>
    </div>
  );
}

/** Pick the species that belong in K. The exponents follow from the equation. */
function ExpressionTask({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

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
    <div>
      <p className="mb-4 text-sm text-warm-600">
        Dæmi {index + 1} af {EXPRESSION_PROBLEMS.length}
      </p>
      <div className="mb-4 rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
        <p className="mb-2 font-mono text-lg text-warm-800">{equationOf(problem.reaction)}</p>
        <p className="text-sm text-warm-600">Hvaða efni eiga heima í jafnvægisstæðunni?</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {species.map((s) => {
          const k = key(s);
          const on = picked.includes(k);
          const right = correct.includes(k);
          return (
            <button
              key={k}
              type="button"
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
          type="button"
          onClick={() => setChecked(true)}
          className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
        >
          Athuga
        </button>
      ) : (
        <div
          className={`rounded-lg border-2 p-4 ${
            isRight ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
          }`}
        >
          <p className="mb-2 font-semibold text-warm-900">{isRight ? 'Rétt.' : 'Ekki alveg.'}</p>
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
          <button
            type="button"
            onClick={next}
            className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            {index + 1 >= EXPRESSION_PROBLEMS.length ? 'Ljúka' : 'Næsta dæmi'}
          </button>
        </div>
      )}
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
    <div>
      <p className="mb-4 text-sm text-warm-600">
        Dæmi {index + 1} af {DIRECTION_PROBLEMS.length}
      </p>
      <div className="mb-4 rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
        <p className="mb-2 font-mono text-warm-800">{equationOf(problem.reaction)}</p>
        <p className="mb-3 font-mono text-sm text-warm-700">K = {formatScientific(problem.k, 2)}</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm text-warm-700">
          {Object.entries(problem.amounts).map(([formula, value]) => (
            <div key={formula} className="flex justify-between">
              <dt>[{formula}]</dt>
              <dd>{value.toString().replace('.', ',')} M</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mb-4 grid gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={answer !== null}
            onClick={() => setAnswer(option)}
            className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
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
        <div className="rounded-lg border-2 border-warm-300 bg-warm-50 p-4">
          <p className="mb-2 font-semibold text-warm-900">
            {answer === problem.direction ? 'Rétt.' : 'Rangt.'}
          </p>
          <p className="mb-2 font-mono text-sm text-warm-800">
            Q = {Number.isFinite(problem.q) ? formatScientific(problem.q, 3) : '∞'} · K ={' '}
            {formatScientific(problem.k, 2)} · Q{' '}
            {problem.direction === 'afram' ? '<' : problem.direction === 'afturabak' ? '>' : '='} K
          </p>
          <p className="text-sm text-warm-700">{problem.context}</p>
          <button
            type="button"
            onClick={next}
            className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            {index + 1 >= DIRECTION_PROBLEMS.length ? 'Ljúka' : 'Næsta dæmi'}
          </button>
        </div>
      )}
    </div>
  );
}

function KpTask({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [outcome, setOutcome] = useState<string | null>(null);

  const problem = KP_PROBLEMS[index];

  const MESSAGE: Record<string, string> = {
    rett: 'Rétt.',
    veldisvisir:
      'Tölustafirnir stemma en veldisvísirinn ekki. Athugaðu formerkið á Δn — myndefni mínus hvarfefni — og að hitastigið fari í kelvin.',
    tolustafir: 'Rétt stærðarþrep en tölurnar stemma ekki. Reiknaðu (R·T) aftur.',
    baedi: 'Hvorugt stemmir. Byrjaðu á Δn og skrifaðu svo (R·T) í rétt veldi.',
    ogilt: 'Fylltu í báða reitina — tölu og veldisvísi, t.d. 6,5 og 0.',
  };

  const check = () => {
    setOutcome(gradeScientific({ mantissa, exponent }, problem.kp).outcome);
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
    <div>
      <p className="mb-4 text-sm text-warm-600">
        Dæmi {index + 1} af {KP_PROBLEMS.length}
      </p>
      <div className="mb-4 rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
        <p className="mb-2 font-mono text-warm-800">{equationOf(problem.reaction)}</p>
        <p className="font-mono text-sm text-warm-700">
          Kc = {formatScientific(problem.kc, 3)} við {problem.temperatureC} °C
        </p>
        <p className="mt-3 text-sm text-warm-600">
          Hvert er Kp? Notaðu Kp = Kc · (R·T)<sup>Δn</sup> með R = {0.0821} og hitastigið í kelvin.
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-warm-700">Kp</label>
        <div className="flex items-center gap-2">
          <input
            {...DECIMAL_INPUT_PROPS}
            value={mantissa}
            onChange={(e) => setMantissa(e.target.value)}
            disabled={outcome !== null}
            placeholder="6,5"
            aria-label="Tala"
            className="w-28 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg disabled:bg-warm-100"
          />
          <span className="font-mono text-lg text-warm-700">× 10</span>
          <input
            {...DECIMAL_INPUT_PROPS}
            value={exponent}
            onChange={(e) => setExponent(e.target.value)}
            disabled={outcome !== null}
            placeholder="0"
            aria-label="Veldisvísir"
            className="w-20 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg disabled:bg-warm-100"
          />
        </div>
        <p className="mt-2 text-xs text-warm-500">
          Tvær tölur: fyrst talan, svo veldisvísirinn. Bæði komma og punktur virka.
        </p>
      </div>

      {outcome === null ? (
        <button
          type="button"
          onClick={check}
          className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
        >
          Athuga
        </button>
      ) : (
        <div
          className={`rounded-lg border-2 p-4 ${
            outcome === 'rett' ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
          }`}
        >
          <p className="mb-2 font-semibold text-warm-900">{MESSAGE[outcome]}</p>
          <p className="font-mono text-sm text-warm-800">
            Δn = {problem.deltaN} · T = {problem.temperatureC} + 273,15 K · Kp ={' '}
            {formatScientific(problem.kp, 3)}
          </p>
          {problem.deltaN === 0 && (
            <p className="mt-2 text-sm text-warm-700">
              Δn er núll, svo (R·T)<sup>0</sup> = 1 og Kp er nákvæmlega sama talan og Kc.
            </p>
          )}
          <button
            type="button"
            onClick={next}
            className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            {index + 1 >= KP_PROBLEMS.length ? 'Ljúka' : 'Næsta dæmi'}
          </button>
        </div>
      )}
    </div>
  );
}
