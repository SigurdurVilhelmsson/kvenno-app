/**
 * How much of the acid has actually come apart, with the 5 % line drawn on it.
 *
 * **Deliberately not to scale as a fraction of the beaker.** At 1,3 %
 * dissociation a true-scale bar is a hairline, and "invisible" is the wrong
 * lesson — the point is not that the number is small but that it is *below the
 * line*. So the scale runs 0–10 % linearly, which puts the 5 % rule at the
 * halfway mark and makes "inside the rule" a place you can see. Anything above
 * 10 % pins to full width and is labelled with its real value.
 */

interface KlofnunBarProps {
  /** Klofnunarhlutfall, in percent. */
  percent: number;
  /** Whether the 5 % rule licenses the approximation here. */
  valid: boolean;
}

const SCALE_MAX = 10;

export function KlofnunBar({ percent, valid }: KlofnunBarProps) {
  const width = Math.min(percent / SCALE_MAX, 1) * 100;
  const label = percent < 0.01 ? percent.toPrecision(2) : percent.toFixed(2);

  return (
    <div>
      <div
        className="klofnun-bar"
        role="img"
        aria-label={`Klofnunarhlutfall ${label.replace('.', ',')} prósent, ${
          valid ? 'undir 5 prósenta mörkunum' : 'yfir 5 prósenta mörkunum'
        }`}
      >
        <div
          className="klofnun-bar__fill"
          style={{ width: `${width}%`, backgroundColor: valid ? '#16a34a' : '#dc2626' }}
        />
        <div className="klofnun-bar__threshold" style={{ left: `${(5 / SCALE_MAX) * 100}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-warm-600">
        <span>0 %</span>
        <span className={valid ? 'text-green-700' : 'font-semibold text-red-700'}>
          {label.replace('.', ',')} % klofnar
          {valid ? '' : ' — yfir mörkunum'}
        </span>
        <span>{SCALE_MAX} %</span>
      </div>
      <p className="mt-1 text-center text-xs text-warm-500">
        Strikið er við 5 %. Kvarðinn er 0–10 %, ekki hlutfall af glasinu — annars sæist súlan ekki.
      </p>
    </div>
  );
}
