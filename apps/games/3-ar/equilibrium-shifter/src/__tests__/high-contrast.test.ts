import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * "Há birtuskil" must raise contrast, not lower it.
 *
 * This game is the only one with a high-contrast switch. The shared theme's
 * `.high-contrast` block turned warm text light (#e0e0e0) and darkened only
 * `bg-white` and `bg-warm-50/100`, so every other surface stayed light: the
 * stress box (`bg-yellow-50`), the Hvarfefni/Myndefni containers, the page
 * gradient under the footer. Warm text on those read about 1.3 : 1. The game's
 * own stylesheet now keeps surfaces light and darkens the text instead.
 *
 * jsdom does not run the stylesheet cascade, so this reads it: for each
 * selector the LAST declaration wins, theme first and the game's sheet after,
 * exactly the order `styles.css` imports them in. It then checks warm text
 * against every surface it can sit on in high contrast.
 */

const gameRoot = join(__dirname, '..', '..');
const theme = readFileSync(join(gameRoot, '../../../../packages/shared/styles/theme.css'), 'utf8');
const game = readFileSync(join(gameRoot, 'src/styles.css'), 'utf8');

/** Custom properties the rules below resolve through, from the theme's @theme block. */
function tokens(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of css.matchAll(/(--color-[\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)) map.set(m[1], m[2]);
  return map;
}
const TOKENS = tokens(theme);

/** The last value of `property` declared for `selector`, reading the sheets in cascade order. */
function lastDeclared(selector: string, property: string): string | undefined {
  let value: string | undefined;
  for (const css of [theme, game]) {
    // Flat rule blocks only, which is all either sheet uses for these selectors.
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = m[1].split(',').map((s) => s.replace(/\/\*[\s\S]*?\*\//g, '').trim());
      if (!selectors.includes(selector)) continue;
      const decl = m[2].match(new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;]+)`));
      if (decl) value = decl[1].replace('!important', '').trim();
    }
  }
  return value;
}

function resolve(value: string): string {
  const v = value.match(/^var\((--[\w-]+)\)$/);
  return v ? (TOKENS.get(v[1]) ?? value) : value;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Surfaces warm text sits on in this game that the theme never recolours:
 * Tailwind's 50-tints and the lightest stops of the game's own gradients.
 */
const UNTOUCHED_LIGHT_SURFACES: Record<string, string> = {
  'bg-yellow-50 (Álag sem beitt er)': '#fefce8',
  'bg-indigo-50 (intro panel)': '#eef2ff',
  'bg-amber-50': '#fffbeb',
  'from-purple-50 (the page, under the footer)': '#faf5ff',
  '.reactants-side (Hvarfefni)': '#dbeafe',
  '.products-side (Myndefni)': '#fce7f3',
  '.explanation-box': '#e0e7ff',
};

const WARM_TEXT = ['500', '600', '700', '800'].map((n) => `.high-contrast .text-warm-${n}`);
const RECOLOURED = [
  '.high-contrast .bg-white',
  '.high-contrast .bg-warm-50',
  '.high-contrast .bg-warm-100',
];

describe('high contrast in equilibrium-shifter', () => {
  it('reads the rules it checks', () => {
    for (const s of [...WARM_TEXT, ...RECOLOURED]) {
      expect(lastDeclared(s, s.includes('text-') ? 'color' : 'background-color'), s).toBeDefined();
    }
  });

  it.each(WARM_TEXT)('%s reads at 7 : 1 or better on every light panel', (selector) => {
    const text = resolve(lastDeclared(selector, 'color')!);
    for (const [surface, bg] of Object.entries(UNTOUCHED_LIGHT_SURFACES)) {
      expect(contrast(text, bg), `${selector} (${text}) on ${surface}`).toBeGreaterThanOrEqual(7);
    }
  });

  it.each(WARM_TEXT)('%s reads at 7 : 1 or better on the cards the theme recolours', (selector) => {
    const text = resolve(lastDeclared(selector, 'color')!);
    for (const surface of RECOLOURED) {
      const bg = resolve(lastDeclared(surface, 'background-color')!);
      expect(
        contrast(text, bg),
        `${selector} (${text}) on ${surface} (${bg})`
      ).toBeGreaterThanOrEqual(7);
    }
  });

  it('a white card inside a tinted panel stays light, so its coloured text stays readable', () => {
    // The intro's Q-vs-K card is bg-white inside bg-indigo-50 and writes in
    // text-indigo-700 (#4338ca). The theme turned the card #1a1a1a under it.
    const card = resolve(lastDeclared('.high-contrast .bg-white', 'background-color')!);
    expect(contrast('#4338ca', card)).toBeGreaterThanOrEqual(4.5);
  });
});
