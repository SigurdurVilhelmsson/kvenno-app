import { Indicator } from '../types';

/**
 * Common acid-base indicators used in titrations
 */
export const indicators: Indicator[] = [
  {
    id: 'methyl-orange',
    name: 'Metýlappelsínugult',
    pHRange: [3.1, 4.4],
    colorAcidic: '#ef4444', // Red
    colorBasic: '#f97316', // Orange-yellow
    description: 'Hentar best við títrun sterkrar sýru',
  },
  {
    id: 'methyl-red',
    name: 'Metýlrautt',
    pHRange: [4.4, 6.2],
    colorAcidic: '#dc2626', // Red
    colorBasic: '#fbbf24', // Yellow
    description: 'Hentar vel við títrun veiks basa með sterkri sýru',
  },
  {
    id: 'bromothymol-blue',
    name: 'Brómþýmólblátt',
    pHRange: [6.0, 7.6],
    colorAcidic: '#fbbf24', // Yellow
    colorBasic: '#3b82f6', // Blue
    description: 'Hentar best við títrun sterkrar sýru með sterkum basa',
  },
  {
    id: 'phenolphthalein',
    name: 'Fenólftaleín',
    pHRange: [8.3, 10.0],
    colorAcidic: 'transparent',
    colorBasic: '#ec4899', // Pink
    description: 'Hentar best við títrun veikrar sýru með sterkum basa',
  },
  {
    id: 'thymol-blue',
    name: 'Þýmólblátt',
    pHRange: [8.0, 9.6],
    colorAcidic: '#fbbf24', // Yellow
    colorBasic: '#3b82f6', // Blue
    description: 'Annar kostur við títrun veikrar sýru með sterkum basa',
  },
];

/**
 * Get indicator color based on current pH
 */
export function getIndicatorColor(indicatorId: string, pH: number): string {
  const indicator = indicators.find((ind) => ind.id === indicatorId);
  if (!indicator) return 'transparent';

  const [lowPH, highPH] = indicator.pHRange;

  if (pH < lowPH) return indicator.colorAcidic;
  if (pH > highPH) return indicator.colorBasic;

  // Transition zone - mix colors (simplified - use basic color in transition)
  return indicator.colorBasic;
}

/**
 * Check if an indicator is appropriate for a titration
 */
export function isIndicatorAppropriate(indicatorId: string, equivalencePH: number): boolean {
  const indicator = indicators.find((ind) => ind.id === indicatorId);
  if (!indicator) return false;

  const [lowPH, highPH] = indicator.pHRange;
  return equivalencePH >= lowPH && equivalencePH <= highPH;
}
