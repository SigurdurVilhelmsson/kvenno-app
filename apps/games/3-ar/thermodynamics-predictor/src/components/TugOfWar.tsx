/**
 * ΔH° against −TΔS°: the two terms of ΔG° as bars on one axis, with ΔG° their
 * sum below. A bar left of zero favours a spontaneous reaction, a bar right of
 * it opposes one. ΔH° stays put while the temperature moves; −TΔS° grows with T,
 * which is the whole story of the crossover temperature.
 *
 * The scale is fixed per reaction over the slider's range, so a bar's length
 * changes only because its value does.
 */

import { formatRounded } from '../utils/format';

interface TugOfWarProps {
  /** kJ/mól */
  deltaH: number;
  /** J/(mól·K) */
  deltaS: number;
  /** K */
  temperature: number;
  tMin?: number;
  tMax?: number;
}

const FAVOUR = '#16a34a';
const OPPOSE = '#dc2626';

export function tugTerms(deltaH: number, deltaS: number, temperature: number) {
  const minusTS = -(temperature * deltaS) / 1000;
  return { deltaH, minusTS, deltaG: deltaH + minusTS };
}

export function TugOfWar({ deltaH, deltaS, temperature, tMin = 200, tMax = 1200 }: TugOfWarProps) {
  const { minusTS, deltaG } = tugTerms(deltaH, deltaS, temperature);
  const ends = [tMin, tMax].flatMap((t) => {
    const e = tugTerms(deltaH, deltaS, t);
    return [Math.abs(e.minusTS), Math.abs(e.deltaG)];
  });
  const scale = Math.max(Math.abs(deltaH), ...ends, 1);

  const rows = [
    { key: 'h', label: 'ΔH°', value: deltaH },
    { key: 'ts', label: '−TΔS°', value: minusTS },
    { key: 'g', label: 'ΔG°', value: deltaG },
  ];

  const description = `Við ${temperature} K: ΔH° = ${formatRounded(deltaH, 1)} kJ/mól, −TΔS° = ${formatRounded(
    minusTS,
    1
  )} kJ/mól, samtals ΔG° = ${formatRounded(deltaG, 1)} kJ/mól.`;

  return (
    <div className="rounded-lg border border-warm-200 bg-white p-3 phone:p-2">
      <div className="mb-1 text-sm font-semibold text-warm-700">Reipdráttur: ΔH° á móti −TΔS°</div>
      <div role="img" aria-label={description} className="space-y-1.5">
        <div className="flex justify-between text-xs text-warm-500" aria-hidden="true">
          <span>← styður sjálfgengi</span>
          <span>andmælir →</span>
        </div>
        {rows.map((r) => {
          const pct = (Math.abs(r.value) / scale) * 50;
          const color = r.value < 0 ? FAVOUR : OPPOSE;
          return (
            <div
              key={r.key}
              className={`grid grid-cols-[3.5rem_1fr] items-center gap-2 ${r.key === 'g' ? 'border-t border-warm-200 pt-1.5' : ''}`}
              aria-hidden="true"
            >
              <span
                className={`text-sm ${r.key === 'g' ? 'font-bold' : 'font-semibold'} text-warm-800`}
              >
                {r.label}
              </span>
              <div className="relative h-6 rounded bg-warm-100">
                <div className="absolute inset-y-0 left-1/2 w-px bg-warm-500" />
                <div
                  data-bar={r.key}
                  className="absolute inset-y-0.5 rounded transition-all duration-200 motion-reduce:transition-none"
                  style={{
                    background: color,
                    width: `${pct}%`,
                    left: r.value < 0 ? `${50 - pct}%` : '50%',
                  }}
                />
                <span
                  className={`absolute inset-y-0 flex items-center text-xs font-semibold tabular-nums text-warm-900 ${
                    r.value < 0 ? 'right-[51%] pr-1' : 'left-[51%] pl-1'
                  } ${pct > 12 ? 'text-white' : ''}`}
                >
                  {formatRounded(r.value, 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-warm-500">
        kJ/mól. ΔH° og ΔS° eru tekin óháð hitastigi; aðeins −TΔS° breytist þegar sleðinn hreyfist.
      </p>
    </div>
  );
}
