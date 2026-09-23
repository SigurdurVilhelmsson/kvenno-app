import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * The touch defaults in `styles/game-base.css`, which every game imports.
 *
 * jsdom does no layout and ignores cascade layers, so these read the stylesheet
 * as text. What they hold is placement, because placement is the whole design:
 *
 * - Tailwind v4 puts its utilities in `@layer utilities`, and unlayered CSS beats
 *   every layered rule whatever its specificity. An unlayered
 *   `input { font-size: 16px }` would shrink a `text-2xl` answer field, and an
 *   unlayered `button { touch-action: manipulation }` would defeat `touch-none`
 *   on a drag handle. So the defaults must stay inside a layer.
 * - A raw `:hover` rule sticks on a touch screen after a tap, leaving a card
 *   lifted until the student taps elsewhere. So every `:hover` must sit inside
 *   a hover-capable media query.
 *
 * The rules were measured in a browser when written (Playwright, 360 px with
 * touch emulation, and 1280 px); this only stops them drifting out of place.
 */

const css = readFileSync(join(__dirname, '..', '..', 'styles', 'game-base.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  ''
);

/** The text of the `{ … }` block that starts at `open`, braces balanced. */
function blockAt(open: number): string {
  let depth = 0;
  for (let i = css.indexOf('{', open); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(open, i + 1);
  }
  throw new Error(`unbalanced block at ${open}`);
}

/** Every top-level block whose prelude matches `prelude`, e.g. `@layer base`. */
function topLevelBlocks(prelude: RegExp): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      if (depth === 0 && prelude.test(css.slice(start, i).trim())) out.push(blockAt(start));
      depth++;
    } else if (css[i] === '}') {
      depth--;
      if (depth === 0) start = i + 1;
    } else if (depth === 0 && css[i] === ';') {
      start = i + 1;
    }
  }
  return out;
}

describe('game-base.css touch defaults', () => {
  const base = topLevelBlocks(/^@layer base$/).join('\n');
  const utilities = topLevelBlocks(/^@layer utilities$/).join('\n');
  const hoverOnly = topLevelBlocks(/^@media \(hover: hover\) and \(pointer: fine\)$/).join('\n');

  it('keeps the phone defaults in the base layer, below every utility', () => {
    expect(base).toMatch(/body\s*{\s*overflow-wrap:\s*break-word;/);
    expect(base).toMatch(/touch-action:\s*manipulation;/);
    expect(base).toMatch(/min-width:\s*0;/);
    expect(base).toMatch(/@media \(pointer: coarse\)[\s\S]*font-size:\s*max\(16px, 1em\);/);
  });

  it('lets text fields shrink, but not checkboxes or radios', () => {
    // Beside a wrapping label a shrinkable checkbox is squeezed to ~7 px.
    const rule = base.match(/([^{};]+){\s*min-width:\s*0;/);
    expect(rule?.[1]).toMatch(/input:not\(\[type='checkbox'\], \[type='radio'\]\)/);
    expect(rule?.[1]).not.toMatch(/(^|,)\s*input\s*(,|$)/);
  });

  it('raises only the small size classes on a field, in the utilities layer', () => {
    expect(utilities).toMatch(
      /@media \(pointer: coarse\)\s*{\s*:is\(input, select, textarea\):is\(\.text-xs, \.text-sm\)\s*{\s*font-size:\s*16px;/
    );
    // Nothing else may set a field's size: a larger class has to survive.
    expect(utilities.match(/font-size/g)).toHaveLength(1);
  });

  it('declares none of those properties, and styles no form field, outside a layer', () => {
    const unlayered = css.replace(base, '').replace(utilities, '');
    expect(unlayered).not.toMatch(/touch-action|overflow-wrap|min-width|font-size:\s*max/);
    const preludes = unlayered.match(/[^{};]+(?={)/g) ?? [];
    expect(preludes.filter((p) => /\b(input|select|textarea)\b/.test(p))).toEqual([]);
  });

  it('puts every :hover inside the hover-capable media query', () => {
    const outside = css.replace(hoverOnly, '');
    expect(outside).not.toMatch(/:hover/);
    for (const cls of ['.game-btn:hover', '.game-card:hover', '.hover-orange:hover']) {
      expect(hoverOnly).toContain(cls);
    }
  });

  it('keeps the press feedback for touch', () => {
    expect(css.replace(hoverOnly, '')).toMatch(/\.game-btn:active\s*{/);
    expect(css.replace(hoverOnly, '')).toMatch(/\.game-card:active\s*{/);
  });
});
