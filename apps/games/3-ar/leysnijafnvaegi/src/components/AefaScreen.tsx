import { useEffect, useMemo, useRef, useState } from 'react';

import { BackButton } from './BackButton';
import { Sci } from './Sci';
import { ScientificInput } from './ScientificInput';
import { SOLUBILITY_PROBLEMS } from '../data/problems';
import { saltBy } from '../data/salts';
import {
  dissolutionEquation,
  gradeScientific,
  kspExpression,
  molarSolubility,
  type GradeOutcome,
} from '../engine/ksp';
import { revealBottom, useRevealTopOnChange } from '../utils/reveal';

/**
 * Æfa — compute the molar solubility from Ksp, and the reverse.
 *
 * **The answer is entered as a mantissa and a power of ten, in two fields.**
 * Every answer here is between 10⁻⁵ and 10⁻¹⁷, so a single decimal box is not
 * usable by anyone, and a single free-text box is what broke the old game:
 * `Level2.tsx:48` did `.replace(/10/g, 'e')`, which made the format the game
 * itself advertised grade as its mantissa, the plain-decimal form grade as 0,
 * and an Icelandic comma grade as 1.
 *
 * Two fields also buy the diagnosis. "Right digits, wrong power of ten" is the
 * commonest real mistake in this topic — it is what forgetting the 4 in 4s³
 * looks like — and a merged box could only say "wrong".
 *
 * Both fields use `DECIMAL_INPUT_PROPS` (in `ScientificInput`, which also
 * carries the `±` key an iPhone's decimal keypad lacks). The exponent is an
 * integer, but it is a signed one rather than a count of things, so the numeric
 * input type would put a spinner and a mobile keypad with no minus sign in
 * front of the student.
 *
 * That last sentence is phrased to avoid writing the numeric type literally.
 * `decimal-input.test.ts` greps source text and cannot tell a use from a
 * mention, so naming it here fails the very test the sentence is explaining —
 * the third guard today to catch its own documentation, after the electrolyte
 * terminology note and the seashell one in this game's own data.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const ORDER = { ledd: 0, mid: 1, thung: 2 } as const;
const RUN = [...SOLUBILITY_PROBLEMS].sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);

const MESSAGE: Record<GradeOutcome, string> = {
  rett: 'Rétt.',
  veldisvisir:
    'Tölustafirnir eru réttir en veldisvísirinn ekki. Skoðaðu hvort þú hafir gleymt stuðlinum — 4s³ er ekki s³ — eða tekið ranga rót.',
  tolustafir: 'Rétt stærðarþrep, en tölurnar stemma ekki. Reiknaðu aftur.',
  baedi: 'Hvorki tölustafirnir né veldisvísirinn stemma.',
  ogilt: 'Fylltu í báða reitina — tölu og veldisvísi, t.d. 1,34 og −5.',
};

export function AefaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [outcome, setOutcome] = useState<GradeOutcome | null>(null);
  const [solved, setSolved] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // The next problem starts at the top of the card, not where "Næsta dæmi" was.
  useRevealTopOnChange(cardRef, index);
  // On a phone a 2:1 salt's feedback runs past the bottom edge, taking
  // "Næsta dæmi" with it.
  useEffect(() => {
    if (outcome !== null) revealBottom(feedbackRef.current);
  }, [outcome]);

  const problem = RUN[index];
  const salt = useMemo(() => saltBy(problem.formula), [problem.formula]);
  const pure = molarSolubility(salt);

  const check = () => {
    const result = gradeScientific({ mantissa, exponent }, problem.answer);
    setOutcome(result.outcome);
    if (result.outcome === 'rett') setSolved(solved + 1);
  };

  const next = () => {
    if (index + 1 >= RUN.length) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setMantissa('');
    setExponent('');
    setOutcome(null);
  };

  const asksForSolubility = problem.direction === 'kspToS';

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl">
            Æfa — reiknaðu mólarleysnina
          </h2>
          <BackButton onClick={onBack} />
        </div>

        <p className="mb-4 text-sm text-warm-600">
          Dæmi {index + 1} af {RUN.length} · {solved} rétt
        </p>

        <div className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
          <p className="mb-3 text-warm-800">
            {asksForSolubility ? (
              <>
                Hver er mólarleysni <span className="font-mono font-semibold">{salt.formula}</span>{' '}
                ({salt.name}) í hreinu vatni við <span className="whitespace-nowrap">25 °C</span>?
              </>
            ) : (
              <>
                Mólarleysni <span className="font-mono font-semibold">{salt.formula}</span> (
                {salt.name}) mælist <Sci value={pure} figures={3} unit="M" /> við{' '}
                <span className="whitespace-nowrap">25 °C</span>. Hvert er Ksp?
              </>
            )}
          </p>
          <dl className="space-y-1 font-mono text-sm text-warm-700">
            <div>{dissolutionEquation(salt)}</div>
            <div>{kspExpression(salt)}</div>
            {asksForSolubility && (
              <div>
                Ksp = <Sci value={salt.ksp} />
              </div>
            )}
          </dl>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-warm-700">
            Svar {asksForSolubility ? '(M)' : ''}
          </label>
          <ScientificInput
            mantissa={mantissa}
            exponent={exponent}
            onMantissaChange={setMantissa}
            onExponentChange={setExponent}
            mantissaPlaceholder="1,34"
            exponentPlaceholder="-5"
            disabled={outcome !== null}
          />
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
            ref={feedbackRef}
            className={`rounded-lg border-2 p-4 ${
              outcome === 'rett' ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
            }`}
          >
            <p className="mb-2 font-semibold text-warm-900">{MESSAGE[outcome]}</p>
            <p className="text-sm text-warm-800">
              Svarið er{' '}
              <span className="whitespace-nowrap">
                <span className="font-mono">
                  <Sci value={problem.answer} figures={3} />
                </span>
                {asksForSolubility ? ' M' : ''}
              </span>
              .
            </p>
            {asksForSolubility && salt.x * salt.y > 1 && (
              <p className="mt-2 rounded border border-amber-300 bg-white p-2 text-sm text-amber-900">
                Hlutfallið er {salt.x}:{salt.y}, svo Ksp = {salt.x > 1 ? `(${salt.x}s)` : 's'}
                {salt.x > 1 ? <sup className="pointer-coarse:text-[12px]">{salt.x}</sup> : ''}
                {salt.y > 1 ? `(${salt.y}s)` : '(s)'}
                {salt.y > 1 ? (
                  <sup className="pointer-coarse:text-[12px]">{salt.y}</sup>
                ) : (
                  ''
                )} = {Math.pow(salt.x, salt.x) * Math.pow(salt.y, salt.y)}s
                <sup className="pointer-coarse:text-[12px]">{salt.x + salt.y}</sup>. Kvaðratrótin á
                ekki við hér.
              </p>
            )}
            <button
              type="button"
              onClick={next}
              className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11"
            >
              {index + 1 >= RUN.length ? 'Ljúka' : 'Næsta dæmi'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
