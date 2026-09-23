import { formatScientific } from '@shared/utils';

import type { EquilibriumConstant } from '../data/constants';
import type { StressOutcome } from '../engine/stress';
import { TEMPERATURE_STEP_C } from '../engine/stress';

/**
 * The numbers behind the shift.
 *
 * This is what `QKComparison` could not be. That panel drew two bars whose
 * widths came from the answer — Q short and K long when the system shifted
 * right — so it illustrated the conclusion rather than showing the evidence.
 * Here Q is computed from the disturbed mixture and K is read from a sourced
 * table, and the bars are scaled to what those numbers actually are.
 *
 * **The layout is built around one contrast**: K on the left, Q on the right,
 * and a line between them that says which moved. For every stress but
 * temperature only Q moves; for temperature only K does. A student who sees
 * that twice has the idea.
 */

interface Props {
  outcome: StressOutcome;
  constant: EquilibriumConstant;
  /** Order to print species in, so the mixture reads like the equation. */
  order: string[];
}

/** Decimal comma, and scientific notation once a number stops being readable. */
function show(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  if (magnitude >= 1e-3 && magnitude < 1e4) {
    return Number(value.toPrecision(3)).toString().replace('.', ',');
  }
  return formatScientific(value, 3);
}

/**
 * Bar widths on a log scale.
 *
 * Q and K in this game run from 10⁻¹⁴ to 10², so a linear bar would render
 * every acid equilibrium as no bar at all. The log scale is centred on
 * whichever of the two is larger, so the comparison stays legible while the
 * ratio — the only thing that matters — is still what the eye reads.
 */
function widths(q: number, k: number): { qWidth: number; kWidth: number } {
  if (!Number.isFinite(q)) return { qWidth: 100, kWidth: 45 };
  if (q <= 0) return { qWidth: 2, kWidth: 100 };
  const ratio = Math.log10(q / k);
  // Three orders of magnitude fills the bar; beyond that it pins.
  const tilt = Math.max(-1, Math.min(1, ratio / 3));
  return {
    qWidth: 55 + tilt * 45,
    kWidth: 55 - tilt * 45,
  };
}

/**
 * The value printed inside a bar.
 *
 * On a phone the track is narrow enough that a bar can be shorter than its own
 * number, so the bar is never allowed below the width of its label
 * (`min-w-fit` on the bar). Both bars carry both labels — their own visible,
 * the other one invisible in the same grid cell — so that floor is the wider
 * of the two for both of them: a pinned bar can come out level with the
 * other, never longer than a bar whose value is larger.
 */
function BarValue({ own, other }: { own: string; other: string }) {
  return (
    <span className="grid font-mono text-xs font-semibold text-white">
      <span className="col-start-1 row-start-1 justify-self-end">{own}</span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {other}
      </span>
    </span>
  );
}

export function NumbersPanel({ outcome, constant, order }: Props) {
  const { q, kBefore, kAfter, before, afterStress, afterEquilibrium, inert, kUnknown } = outcome;
  const temperatureMoved = kAfter !== kBefore;
  const { qWidth, kWidth } = widths(q, kAfter);

  const species = order.filter((f) => before[f] !== undefined);

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-2 sm:p-4">
      <div className="mb-3 flex items-center gap-2 font-bold text-indigo-800">
        <span className="text-lg">🔢</span> Tölurnar á bak við hliðrunina
      </div>

      {/* K, with where it came from. */}
      <div className="mb-4 rounded-lg bg-white p-3 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono font-semibold text-purple-800">
            {constant.kind} = {show(kBefore)}
          </span>
          <span className="text-xs text-warm-500">
            {constant.source}
            {constant.temperatureC !== undefined && ` · ${constant.temperatureC} °C`}
          </span>
        </div>
        {constant.reversedFrom && (
          <p className="mt-1 text-xs text-warm-500">
            Þetta er bakhvarfið við {constant.reversedFrom}, svo K er umhverfan.
          </p>
        )}
      </div>

      {/* The comparison itself. */}
      <div className="mb-4 rounded-lg bg-white p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 shrink-0 text-right font-mono font-bold text-purple-700 sm:w-10">
              K
            </div>
            <div className="h-6 flex-1 overflow-hidden rounded-full bg-warm-200">
              <div
                className="flex h-full min-w-fit items-center justify-end rounded-full bg-purple-700 pr-2 pl-2 transition-all duration-700"
                style={{ width: `${kWidth}%` }}
              >
                <BarValue own={show(kAfter)} other={show(q)} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 shrink-0 text-right font-mono font-bold text-blue-700 sm:w-10">
              Q
            </div>
            <div className="h-6 flex-1 overflow-hidden rounded-full bg-warm-200">
              <div
                className="flex h-full min-w-fit items-center justify-end rounded-full bg-blue-700 pr-2 pl-2 transition-all duration-700"
                style={{ width: `${qWidth}%` }}
              >
                <BarValue own={show(q)} other={show(kAfter)} />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center font-mono text-xl font-bold text-warm-800">
          {inert || kUnknown ? 'Q = K' : q < kAfter ? 'Q < K' : q > kAfter ? 'Q > K' : 'Q = K'}
        </p>
        <p className="mt-1 text-center text-xs text-warm-500">Kvarðinn er lograkvarði</p>
      </div>

      {/* Which of the two actually moved. */}
      <div className="mb-4 rounded-lg border border-warm-200 bg-warm-50 p-3 text-sm text-warm-800">
        {temperatureMoved ? (
          <>
            <strong>Hitabreytingin færði K sjálfan.</strong> Blandan er óbreytt — það er ekkert
            komið í hana og ekkert farið úr henni — en markið sem hún stefnir á hefur flust úr{' '}
            <span className="font-mono">{show(kBefore)}</span> í{' '}
            <span className="font-mono">{show(kAfter)}</span> við {outcome.temperatureAfterC} °C.
            Þetta er eina álagið sem gerir það.
            {outcome.deltaH !== null && (
              <>
                {' '}
                ΔH° = <span className="font-mono">{show(outcome.deltaH)}</span> kJ/mól, leitt út úr
                myndunarvörmum bókarinnar.
              </>
            )}
          </>
        ) : kUnknown ? (
          <>
            <strong>Hitabreyting færir K, ekki Q.</strong> Áttin er þekkt — {constant.kind} hækkar
            við hærri hita fyrir varmabindandi hvarf og lækkar fyrir varmalosandi — en hér vantar
            annaðhvort viðmiðunarhita fyrir fastann eða myndunarvarma fyrir öll efnin, svo talan
            sjálf fæst ekki. Hún er ekki núll; hún er ómæld.
          </>
        ) : inert ? (
          <>
            <strong>Hvorugt hreyfðist.</strong> Q er enn nákvæmlega jafnt K, svo kerfið er þegar í
            jafnvægi og ekkert gerist.
          </>
        ) : (
          <>
            <strong>Álagið færði Q, ekki K.</strong> Jafnvægisfastinn er sá sami —{' '}
            <span className="font-mono">{show(kBefore)}</span> — en blandan er ekki lengur á honum,
            og þess vegna hreyfist hún.
          </>
        )}
      </div>

      {/* The mixture, before, disturbed, and settled again. On a phone the
          numbers keep whole (a value never splits across lines) and the
          columns get a gutter; if the table is still wider than the card it
          scrolls inside its own box, with the species column pinned and a
          shadow at the right edge while more of it is out of view. The note
          under it sits outside that box, so scrolling the table does not
          carry the note out of view with it. */}
      {species.length > 0 && (
        <div className="rounded-lg bg-white px-1.5 py-2 sm:p-3">
          <div className="table-scroll-cue overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200 text-left text-xs text-warm-600">
                  <th className="table-pin py-1">Efni</th>
                  <th className="py-1 text-right">Í jafnvægi</th>
                  <th className="py-1 pl-2 text-right sm:pl-0">Eftir álag</th>
                  <th className="py-1 pl-2 text-right sm:pl-0">Nýtt jafnvægi</th>
                </tr>
              </thead>
              <tbody className="font-mono text-warm-800">
                {species.map((formula) => (
                  <tr key={formula} className="border-b border-warm-100 last:border-0">
                    <td className="table-pin py-1 whitespace-nowrap">{formula}</td>
                    <td className="py-1 text-right whitespace-nowrap">{show(before[formula])}</td>
                    <td className="py-1 pl-2 text-right sm:pl-0 whitespace-nowrap">
                      {afterStress[formula] === before[formula] ? (
                        <span className="text-warm-400">óbreytt</span>
                      ) : (
                        show(afterStress[formula])
                      )}
                    </td>
                    <td className="py-1 pl-2 text-right sm:pl-0 font-semibold whitespace-nowrap">
                      {afterEquilibrium ? show(afterEquilibrium[formula]) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-warm-500">
            Styrkur í mól/L. Álagið breytir einu efni um {50} %, og hitabreyting er{' '}
            {TEMPERATURE_STEP_C} °C.
          </p>
        </div>
      )}
    </div>
  );
}
