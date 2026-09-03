/**
 * Beita — independent problems, including the ones where the rule fails.
 *
 * No scaffolding: one question, one field. The mix is one of each kind (pH from
 * Ka, Ka from a measured pH, Kb of the conjugate base, klofnunarhlutfall) and
 * then every pair in the pool where the 5 % rule breaks.
 *
 * The rule-breakers are the point of the phase. A student who substitutes
 * √(Ka·C) without checking lands on a specific wrong number, and because it is
 * predictable the feedback names it — that is what the `misconception` slot is
 * for, and why it renders outside the collapse.
 *
 * Grading goes through `gradeApply`, so the comparison is the one the problem
 * declares. Each screen inventing its own is how a game comes to disagree with
 * itself about the same answer.
 */

import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { DECIMAL_INPUT_PROPS, parseStudentNumber } from '@shared/utils';

import { KlofnunBar } from './KlofnunBar';
import { APPLY_PROBLEMS, gradeApply } from '../data/problems';
import { percentDissociation } from '../engine/grade';

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

interface ApplyScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export function ApplyScreen({ onComplete, onBack }: ApplyScreenProps) {
  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);

  const problem = APPLY_PROBLEMS[index];
  const last = index + 1 === APPLY_PROBLEMS.length;

  const submit = () => setVerdict(gradeApply(problem, parseStudentNumber(entry)));

  const next = () => {
    if (last) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setEntry('');
    setVerdict(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={onBack} className="mb-4 text-warm-600 hover:text-warm-800">
        ← Til baka
      </button>

      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Beita</h2>
          <span className="text-sm text-warm-500">
            Dæmi {index + 1} af {APPLY_PROBLEMS.length}
          </span>
        </div>

        {!problem.approximationValid && (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Ekki ganga út frá því að nálgunin megi standa. Athugaðu klofnunarhlutfallið fyrst.
          </p>
        )}

        <p className="mb-5 text-lg text-warm-800">{problem.question}</p>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="apply-answer" className="sr-only">
            Svar
          </label>
          <input
            id="apply-answer"
            {...DECIMAL_INPUT_PROPS}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && verdict === null) submit();
            }}
            disabled={verdict !== null}
            className="w-48 rounded-lg border border-warm-300 p-3 font-mono text-warm-800 disabled:bg-warm-50"
          />
          <span className="text-sm text-warm-600">{problem.answerHint}</span>
          {verdict === null && (
            <button
              type="button"
              onClick={submit}
              className="game-btn rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
            >
              Svara
            </button>
          )}
        </div>

        {verdict !== null && (
          <div className="fade-in mt-5">
            {/* The bar shows the solution the question is about, so the 5 %
                verdict is visible next to the answer. Kb is a property of the
                conjugate base rather than of a solution, so it gets no bar. */}
            {problem.kind !== 'kb' && (
              <div className="mb-4">
                <KlofnunBar
                  percent={percentDissociation(problem.acid.ka, problem.concentration)}
                  valid={problem.approximationValid}
                />
              </div>
            )}

            <FeedbackPanel
              feedback={{
                isCorrect: verdict,
                explanation: problem.explanation,
                misconception: verdict ? undefined : problem.misconception,
              }}
            />

            <button
              type="button"
              onClick={next}
              className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
            >
              {last ? 'Ljúka Beita' : 'Næsta dæmi'}
            </button>
            {!verdict && (
              <button
                type="button"
                onClick={() => {
                  setEntry('');
                  setVerdict(null);
                }}
                className="ml-3 rounded-lg px-4 py-2.5 text-warm-600 hover:text-warm-800"
              >
                Reyna aftur
              </button>
            )}
          </div>
        )}

        <p className="mt-6 border-t border-warm-200 pt-4 text-xs text-warm-500">
          Svar upp á{' '}
          {fmt(
            problem.grading.tolerance * (problem.grading.mode === 'relative' ? 100 : 1),
            problem.grading.mode === 'relative' ? 0 : 2
          )}
          {problem.grading.mode === 'relative' ? ' % ' : ' '}
          frá réttu gildi telst rétt.
        </p>
      </div>
    </div>
  );
}
