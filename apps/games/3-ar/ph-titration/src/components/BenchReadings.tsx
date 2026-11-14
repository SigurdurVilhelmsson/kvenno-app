import React from 'react';

import { formatDecimal } from '@shared/utils';

interface BenchReadingsProps {
  /** The burette reading: titrant delivered, mL. */
  volumeAdded: number;
  /** Solution in the flask, mL. */
  totalVolume: number;
  pH: number;
}

/**
 * Whether a solution is acidic, basic or neutral, judged on the pH as shown
 * (two decimals) so the word never disagrees with the number beside it. It
 * used to call 6,5 to 7,5 neutral while the flask's label used 7.
 */
export function phCharacter(pH: number): 'Súr' | 'Basísk' | 'Hlutlaus' {
  const shown = Math.round(pH * 100) / 100;
  if (shown < 7) return 'Súr';
  if (shown > 7) return 'Basísk';
  return 'Hlutlaus';
}

/** The bench's readings: the burette, the flask's volume, pH and character. */
export const BenchReadings: React.FC<BenchReadingsProps> = ({ volumeAdded, totalVolume, pH }) => {
  const rows: [string, React.ReactNode][] = [
    ['Búretta', `${formatDecimal(volumeAdded, 2)} mL`],
    ['Í flöskunni', `${formatDecimal(totalVolume, 1)} mL`],
    ['pH', formatDecimal(pH, 2)],
    ['Eðli', phCharacter(pH)],
  ];
  return (
    <dl className="grid grid-cols-[auto_auto] justify-start gap-x-3 gap-y-1.5 rounded-xl border border-warm-200 bg-warm-50 px-3 py-2.5 text-sm md:gap-y-2 md:px-4 md:py-3 phone:gap-y-1 phone:px-2.5 phone:py-2">
      {rows.map(([term, value]) => (
        <React.Fragment key={term}>
          <dt className="text-warm-600">{term}</dt>
          <dd className="font-bold tabular-nums text-warm-900 whitespace-nowrap">{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
};
