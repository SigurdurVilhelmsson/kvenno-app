import { Indicator } from '../types';

/**
 * Common acid-base indicators used in titrations.
 *
 * `description` is shown in Level 2's result, after the choice, never on the
 * card while choosing (mobile-pass decision 114 (c)). It must agree with the
 * grader, which accepts an indicator whose colour change falls within 0,1 mL
 * of equivalence on the curve (`acceptableIndicatorsFor`, 2026-11-14):
 * `indicator-choice.test.tsx` holds every description to it.
 */
export const indicators: Indicator[] = [
  {
    id: 'methyl-orange',
    name: 'Metýlappelsínugult',
    pHRange: [3.1, 4.4],
    colorAcidic: '#ef4444', // Red
    colorBasic: '#facc15', // Yellow: red below 3,1, orange through its range, yellow above 4,4
    colorAcidicName: 'rauð',
    colorBasicName: 'gul',
    description:
      'Hentar við títrun veiks basa með sterkri sýru ef pH við jafngildispunkt er 4,4 eða lægra',
  },
  {
    id: 'methyl-red',
    name: 'Metýlrautt',
    pHRange: [4.4, 6.2],
    colorAcidic: '#dc2626', // Red
    colorBasic: '#fbbf24', // Yellow
    colorAcidicName: 'rauð',
    colorBasicName: 'gul',
    description:
      'Hentar við títrun veiks basa með sterkri sýru, og líka sterkrar sýru með sterkum basa',
  },
  {
    id: 'bromothymol-blue',
    name: 'Brómþýmólblátt',
    pHRange: [6.0, 7.6],
    colorAcidic: '#fbbf24', // Yellow
    colorBasic: '#3b82f6', // Blue
    colorAcidicName: 'gul',
    colorBasicName: 'blá',
    description: 'Hentar best við títrun sterkrar sýru með sterkum basa',
  },
  {
    id: 'phenolphthalein',
    name: 'Fenólftalín',
    pHRange: [8.3, 10.0],
    colorAcidic: 'transparent',
    colorBasic: '#ec4899', // Pink
    colorAcidicName: 'litlaus',
    colorBasicName: 'bleik',
    description:
      'Hentar við títrun veikrar sýru með sterkum basa, og líka sterkrar sýru með sterkum basa',
  },
  {
    id: 'thymol-blue',
    name: 'Þýmólblátt',
    pHRange: [8.0, 9.6],
    colorAcidic: '#fbbf24', // Yellow
    colorBasic: '#3b82f6', // Blue
    colorAcidicName: 'gul',
    colorBasicName: 'blá',
    description: 'Annar kostur við títrun veikrar sýru með sterkum basa',
  },
];

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** A colour `t` of the way from `a` to `b`, as #rrggbb. */
function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return (
    '#' +
    ca
      .map((v, i) => Math.round(v + (cb[i] - v) * t))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * The indicator's colour at this pH. Inside its range the colour passes from
 * the acidic to the basic one, so methyl orange is orange half way and
 * phenolphthalein turns faintly pink at 8,3. It used to jump straight to the
 * basic colour at the bottom of the range.
 */
export function getIndicatorColor(indicatorId: string, pH: number): string {
  const indicator = indicators.find((ind) => ind.id === indicatorId);
  if (!indicator) return 'transparent';

  const [lowPH, highPH] = indicator.pHRange;

  if (pH < lowPH) return indicator.colorAcidic;
  if (pH > highPH) return indicator.colorBasic;

  const from = indicator.colorAcidic === 'transparent' ? '#ffffff' : indicator.colorAcidic;
  return mix(from, indicator.colorBasic, (pH - lowPH) / (highPH - lowPH));
}
