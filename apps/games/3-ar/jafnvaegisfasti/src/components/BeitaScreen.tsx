import { useEffect, useRef, useState } from 'react';

import { APPROXIMATION_THRESHOLD, equationOf } from '@shared/engine/equilibrium';
import { formatScientific, gradeScientific } from '@shared/utils';

import { ScientificInput } from './ScientificInput';
import { BEITA_PROBLEMS } from '../data/problems';
import { revealBottom, useRevealTopOnChange } from '../utils/reveal';

/**
 * Beita — the ICE table, filled in one column at a time.
 *
 * **The table is built before the answer is asked for, and nothing is shown
 * before it is earned.** The shape is `1-ar/reynsluformulur`'s Æfa phase: the
 * step table the old game printed as a scaffold, inverted into a live one the
 * student fills. Printing a worked ICE table above an input is the answer leak
 * that phase was written to remove.
 *
 * The five per cent check is the last step and it is graded as a judgement,
 * not as arithmetic. Half the shipped problems fail it, which is the point:
 * a student who has only met problems where the shortcut works has learnt
 * that the shortcut always works.
 *
 * **The concentration and the pressure problems run through this one screen,
 * and that is deliberate.** Nothing about the method changes when the units
 * do; a separate screen for ICE in atm would teach it as a second technique.
 * So the screen reads its unit and its constant's symbol off the problem and
 * says `M` or `atm` accordingly — and where the problem has a manometer, adds
 * the one thing pressures really do bring with them: a total that moves with
 * the extent, or, where Δn = 0, conspicuously does not.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Stage = 'direction' | 'extent' | 'approximation' | 'done';

export function BeitaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('direction');
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [extentOutcome, setExtentOutcome] = useState<string | null>(null);
  const [ruleAnswer, setRuleAnswer] = useState<boolean | null>(null);
  // Counts every check, so a repeat check that fails the same way still
  // brings its feedback into view.
  const [checks, setChecks] = useState(0);
  const problemRef = useRef<HTMLParagraphElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useRevealTopOnChange(problemRef, index);
  useEffect(() => {
    if (checks > 0) revealBottom(feedbackRef.current);
  }, [checks]);

  const problem = BEITA_PROBLEMS[index];
  const { result, unit, constantSymbol, totals } = problem;
  const k = problem.reaction.constant!.value;

  /** Dative singular definite, for "less than 5 % of the starting ___". */
  const startingAmount = unit === 'M' ? 'upphafsstyrknum' : 'upphafsþrýstingnum';

  const reset = () => {
    setStage('direction');
    setMantissa('');
    setExponent('');
    setExtentOutcome(null);
    setRuleAnswer(null);
  };

  const next = () => {
    if (index + 1 >= BEITA_PROBLEMS.length) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    reset();
  };

  const checkExtent = () => {
    const graded = gradeScientific({ mantissa, exponent }, result.extent, 0.03);
    setExtentOutcome(graded.outcome);
    if (graded.outcome === 'rett') setStage('approximation');
    setChecks((n) => n + 1);
  };

  const decimals = (value: number) =>
    Math.abs(value) < 1e-3 ? formatScientific(value, 3) : value.toFixed(4).replace('.', ',');

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8">
        <div className="mb-4 flex items-baseline justify-between gap-3 sm:mb-6">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl">
            Beita — ICE-taflan
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:-mr-3 pointer-coarse:px-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p ref={problemRef} className="mb-4 text-sm text-warm-600">
          Dæmi {index + 1} af {BEITA_PROBLEMS.length}
        </p>

        <div className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
          <p className="mb-2 font-mono text-lg text-warm-800">{equationOf(problem.reaction)}</p>
          <p className="mb-1 font-mono text-sm text-warm-700">{problem.expression}</p>
          <p className="font-mono text-sm text-warm-700">
            {constantSymbol} = <span className="whitespace-nowrap">{formatScientific(k, 3)}</span>
          </p>
          {totals !== null && (
            <p className="mt-2 text-sm text-warm-600">
              Heildarþrýstingur í upphafi:{' '}
              <span className="font-mono">{decimals(totals.initial)} atm</span>
            </p>
          )}
        </div>

        {/* The table. The change and equilibrium columns stay blank until the
            student has committed to a direction, then to a value for x.
            On a phone the cells get space between them and do not wrap, so
            `0,5 − 2x` never splits across two lines; the scroll wrapper is a
            safety net that only shows if a row is ever wider than the screen. */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-[13px] min-[360px]:text-sm">
            <thead>
              <tr className="border-b-2 border-warm-300 text-left text-warm-700">
                <th className="py-2">Efni</th>
                <th className="py-2 pl-2 text-right sm:pl-0">Upphaf ({unit})</th>
                <th className="py-2 pl-2 text-right sm:pl-0">Breyting</th>
                <th className="py-2 pl-2 text-right sm:pl-0">Jafnvægi ({unit})</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {result.rows.map((row) => (
                <tr key={`${row.formula}-${row.side}`} className="border-b border-warm-200">
                  <td className="whitespace-nowrap py-2 text-warm-800">{row.formula}</td>
                  <td className="whitespace-nowrap py-2 pl-2 text-right text-warm-800 sm:pl-0">
                    {row.initial.toString().replace('.', ',')}
                  </td>
                  <td className="whitespace-nowrap py-2 pl-2 text-right text-warm-600 sm:pl-0">
                    {stage === 'direction'
                      ? '—'
                      : `${row.side === 'hvarfefni' ? '−' : '+'}${
                          row.coefficient === 1 ? '' : row.coefficient
                        }x`}
                  </td>
                  <td className="whitespace-nowrap py-2 pl-2 text-right text-warm-800 sm:pl-0">
                    {stage === 'direction'
                      ? '—'
                      : stage === 'extent'
                        ? `${row.initial.toString().replace('.', ',')} ${
                            row.side === 'hvarfefni' ? '−' : '+'
                          } ${row.coefficient === 1 ? '' : row.coefficient}x`
                        : decimals(row.equilibrium)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stage === 'direction' && (
          <div>
            <p className="mb-3 text-warm-700">
              Fyrsta skrefið er alltaf það sama: hvora áttina gengur hvarfið? Reiknaðu Q úr{' '}
              {unit === 'M' ? 'upphafsstyrkjunum' : 'upphafsþrýstingunum'} og berðu við{' '}
              {constantSymbol}.
            </p>
            <div className="grid gap-2">
              {(['afram', 'afturabak'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStage('extent')}
                  className="rounded-lg border-2 border-warm-300 bg-white px-4 py-3 text-left text-warm-700 transition-colors hover:border-kvenno-orange"
                >
                  {option === 'afram'
                    ? 'Áfram — myndefnin aukast'
                    : 'Afturábak — hvarfefnin aukast'}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'extent' && (
          <div>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              Q ={' '}
              <span className="whitespace-nowrap">
                {Number.isFinite(result.initialQuotient)
                  ? formatScientific(result.initialQuotient, 3)
                  : '∞'}
              </span>{' '}
              og {constantSymbol} ={' '}
              <span className="whitespace-nowrap">{formatScientific(k, 3)}</span>, svo hvarfið
              gengur <strong>{result.direction === 'afram' ? 'áfram' : 'afturábak'}</strong>.
              Breytingarnar í töflunni fylgja stuðlunum.
            </div>
            <p className="mb-3 text-warm-700">
              Settu {unit === 'M' ? 'jafnvægisstyrkina' : 'jafnvægisþrýstingana'} inn í stæðuna,
              leystu fyrir x og sláðu svarið inn.
            </p>
            <ScientificInput
              prefix="x ="
              mantissa={mantissa}
              exponent={exponent}
              onMantissaChange={setMantissa}
              onExponentChange={setExponent}
              mantissaPlaceholder="2,6"
              exponentPlaceholder="-2"
              className="mb-4"
            />
            <button
              type="button"
              onClick={checkExtent}
              className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
            >
              Athuga
            </button>
            {extentOutcome !== null && extentOutcome !== 'rett' && (
              <div
                ref={feedbackRef}
                className="mt-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
              >
                {extentOutcome === 'veldisvisir' &&
                  'Tölustafirnir stemma en veldisvísirinn ekki. Athugaðu hvort stuðull hafi fallið úr veldisvísi í stæðunni.'}
                {extentOutcome === 'tolustafir' &&
                  'Rétt stærðarþrep en tölurnar stemma ekki. Farðu aftur yfir stæðuna — fóru allir stuðlar í veldisvísi?'}
                {extentOutcome === 'baedi' && 'Hvorugt stemmir enn. Skoðaðu stæðuna aftur.'}
                {extentOutcome === 'ogilt' && 'Fylltu í báða reitina — tölu og veldisvísi.'}
                <button
                  type="button"
                  onClick={() => setStage('approximation')}
                  className="mt-3 block text-xs underline pointer-coarse:-mt-0.5 pointer-coarse:-mb-3.5 pointer-coarse:py-3.5 pointer-coarse:pr-4"
                >
                  Sýna svarið og halda áfram
                </button>
              </div>
            )}
          </div>
        )}

        {(stage === 'approximation' || stage === 'done') && (
          <div>
            <div className="mb-4 rounded-lg border-2 border-green-300 bg-green-50 p-4">
              <p className="font-mono text-green-900">
                x = <span className="whitespace-nowrap">{formatScientific(result.extent, 3)}</span>
              </p>
            </div>

            {/* The manometer. Δn ≠ 0 and the reading moves with the extent;
                Δn = 0 and it sits still however far the reaction runs, which
                is a result and not a broken instrument. */}
            {totals !== null && (
              <div className="mb-4 rounded-lg border border-warm-300 bg-warm-50 p-4 text-sm text-warm-800">
                {totals.equilibrium === null ? (
                  <p>
                    Jafnmargar gaseindir hvoru megin, svo heildarþrýstingurinn stendur í{' '}
                    <span className="font-mono">{decimals(totals.initial)} atm</span> allan tímann.
                    Mælirinn hreyfist ekki — hann er ekki bilaður, það er bara ekkert að mæla, og
                    hér verður að nota stæðuna.
                  </p>
                ) : (
                  <p>
                    Heildarþrýstingurinn fer úr{' '}
                    <span className="font-mono">{decimals(totals.initial)} atm</span> í{' '}
                    <span className="font-mono">{decimals(totals.equilibrium)} atm</span>. Hann
                    breytist um Δn · x, svo mælirinn einn og sér gefur x — án þess að nokkur
                    hlutþrýstingur sé mældur.
                  </p>
                )}
              </div>
            )}

            {stage === 'approximation' ? (
              <div>
                <p className="mb-3 text-warm-700">
                  Síðasta skrefið: mátti sleppa x í nefnaranum? Reglan er að breytingin verði að
                  vera minni en{' '}
                  <span className="whitespace-nowrap">
                    {Math.round(APPROXIMATION_THRESHOLD * 100)} %
                  </span>{' '}
                  af {startingAmount}.
                </p>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRuleAnswer(true);
                      setStage('done');
                      setChecks((n) => n + 1);
                    }}
                    className="rounded-lg border-2 border-warm-300 bg-white px-4 py-3 text-left text-warm-700 hover:border-kvenno-orange"
                  >
                    Já — nálgunin hefði dugað
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRuleAnswer(false);
                      setStage('done');
                      setChecks((n) => n + 1);
                    }}
                    className="rounded-lg border-2 border-warm-300 bg-white px-4 py-3 text-left text-warm-700 hover:border-kvenno-orange"
                  >
                    Nei — það verður að leysa nákvæmlega
                  </button>
                </div>
              </div>
            ) : (
              <div
                ref={feedbackRef}
                className={`rounded-lg border-2 p-4 ${
                  ruleAnswer === result.approximationSafe
                    ? 'border-green-300 bg-green-50'
                    : 'border-amber-300 bg-amber-50'
                }`}
              >
                <p className="mb-2 font-semibold text-warm-900">
                  {ruleAnswer === result.approximationSafe ? 'Rétt.' : 'Ekki rétt.'}
                </p>
                <p className="mb-2 text-sm text-warm-800">
                  Stærsta breytingin er{' '}
                  <span className="whitespace-nowrap font-mono">
                    {(result.relativeChange * 100).toFixed(2).replace('.', ',')} %
                  </span>{' '}
                  af {startingAmount}, sem er {result.approximationSafe ? 'undir' : 'yfir'}{' '}
                  <span className="whitespace-nowrap">
                    {Math.round(APPROXIMATION_THRESHOLD * 100)} %.
                  </span>{' '}
                  {result.approximationSafe
                    ? 'Nálgunin hefði gefið sama svar.'
                    : 'Nálgunin hefði gefið rangt svar hér.'}
                </p>
                {result.approximateExtent !== null && (
                  <p className="mb-2 font-mono text-sm text-warm-700">
                    <span className="whitespace-nowrap">
                      Nálgun: x ≈ {formatScientific(result.approximateExtent, 3)}
                    </span>{' '}
                    ·{' '}
                    <span className="whitespace-nowrap">
                      Nákvæmt: x = {formatScientific(result.extent, 3)}
                    </span>
                  </p>
                )}
                <p className="text-sm text-warm-700">{problem.context}</p>
                <button
                  type="button"
                  onClick={next}
                  className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:py-2.5"
                >
                  {index + 1 >= BEITA_PROBLEMS.length ? 'Ljúka' : 'Næsta dæmi'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
