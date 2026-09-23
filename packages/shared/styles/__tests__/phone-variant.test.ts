// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { compile } from 'tailwindcss';
import { beforeAll, describe, expect, it } from 'vitest';

import { PHONE_LAND_QUERY, PHONE_QUERIES, PHONE_QUERY, PIN_QUERY } from '../../utils/reveal';

/**
 * The `phone:` and `phone-land:` variants in `theme.css`, compiled with the
 * repo's own Tailwind.
 *
 * **Why this exists.** A custom variant written in the comma shorthand,
 * `@custom-variant phone (@media (max-width: 639.98px), (max-height: 500px));`,
 * compiles without a warning and silently drops the second query — so every
 * `phone:` class would stop applying on a phone held sideways. The block form
 * emits two separate `@media` rules per utility; this asserts it still does.
 *
 * It also holds `PHONE_QUERY` in `@shared/utils` to the same queries, so the
 * scroll helpers and the CSS agree on what a phone is, and checks the variants
 * are emitted after the built-in breakpoints, which is what lets `phone:` win
 * over `sm:` on a 740x340 landscape phone, and lets a landscape `block` undo a
 * `max-md:`/`max-lg:` `contents` flattening.
 *
 * Every class name below is assembled at run time. Tailwind scans
 * `packages/shared` for class names (each app's `@source`), so a literal like
 * the phone variant of `hidden` written in this file would be compiled into
 * every game's stylesheet.
 */

/** A variant class, built so Tailwind's source scan does not see a literal. */
const cls = (variant: string, utility: string) => [variant, utility].join(':');
/** Its CSS selector, as Tailwind escapes it. */
const sel = (name: string) => '.' + name.replace(':', '\\:');

const PHONE_HIDDEN = cls('phone', 'hidden');
const LAND_BLOCK = cls('phone-land', 'block');
const PIN_STICKY = cls('pin', 'sticky');
const BUILT_IN = [
  cls('sm', 'flex'),
  cls('md', 'grid'),
  cls('lg', 'grid'),
  cls('max-md', 'contents'),
  cls('max-lg', 'contents'),
];

const stylesDir = join(__dirname, '..');
const require = createRequire(import.meta.url);
const tailwindDir = dirname(require.resolve('tailwindcss/package.json'));

let css = '';

beforeAll(async () => {
  const theme = readFileSync(join(stylesDir, 'theme.css'), 'utf8');
  const input = [
    '@import "tailwindcss/theme.css" layer(theme);',
    '@import "tailwindcss/utilities.css" layer(utilities);',
    theme,
  ].join('\n');
  const compiler = await compile(input, {
    base: stylesDir,
    loadStylesheet: async (id: string) => {
      const path = join(tailwindDir, id.replace(/^tailwindcss\//, ''));
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    },
  });
  css = compiler.build([...BUILT_IN, PHONE_HIDDEN, LAND_BLOCK, PIN_STICKY]);
});

/** The media query of every `@media` block that contains `selector`, in output order. */
function mediaFor(selector: string): string[] {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`@media ([^{]+)\\{\\s*${escaped}\\s*\\{`, 'g');
  return Array.from(css.matchAll(re), (m) => m[1].trim());
}

describe('phone: variant', () => {
  it('emits two separate @media blocks, one per query', () => {
    expect(mediaFor(sel(PHONE_HIDDEN))).toEqual([...PHONE_QUERIES]);
  });

  it('never joins the queries with a comma (the shorthand that drops one)', () => {
    for (const q of mediaFor(sel(PHONE_HIDDEN))) expect(q).not.toContain(',');
  });

  it('agrees with PHONE_QUERY in @shared/utils', () => {
    expect(mediaFor(sel(PHONE_HIDDEN)).join(', ')).toBe(PHONE_QUERY);
  });

  it('is emitted after the built-in breakpoints, so it wins over sm:/md:/lg:', () => {
    const phone = css.indexOf(sel(PHONE_HIDDEN));
    for (const name of BUILT_IN) {
      const at = css.indexOf(sel(name));
      expect(at, name).toBeGreaterThan(-1);
      expect(at, name).toBeLessThan(phone);
    }
  });
});

describe('phone-land: variant', () => {
  it('is one landscape, short-screen query that agrees with PHONE_LAND_QUERY', () => {
    expect(mediaFor(sel(LAND_BLOCK))).toEqual([PHONE_LAND_QUERY]);
  });

  it('comes after the max-width breakpoints, so it undoes a contents flattening', () => {
    const land = css.indexOf(sel(LAND_BLOCK));
    for (const name of BUILT_IN.filter((n) => n.startsWith('max-'))) {
      expect(css.indexOf(sel(name)), name).toBeLessThan(land);
    }
  });
});

describe('pin: variant', () => {
  it('is one portrait-phone query that agrees with PIN_QUERY', () => {
    expect(mediaFor(sel(PIN_STICKY))).toEqual([PIN_QUERY]);
  });

  it('is emitted after phone-land:, so a pinned class wins over both', () => {
    expect(css.indexOf(sel(PIN_STICKY))).toBeGreaterThan(css.indexOf(sel(LAND_BLOCK)));
    expect(css.indexOf(sel(PIN_STICKY))).toBeGreaterThan(css.indexOf(sel(PHONE_HIDDEN)));
  });

  it('carries the pinned heights into scroll-padding on <html>, under pin: only', () => {
    // Tailwind nests the @variant block as `html { @media … { … } }` or hoists
    // it; either way the declarations must sit inside the pin: query.
    const at = css.indexOf('scroll-padding-bottom: var(--pin-bar-h)');
    expect(at).toBeGreaterThan(-1);
    const before = css.slice(0, at);
    const media = before.lastIndexOf('@media');
    expect(before.slice(media)).toContain(PIN_QUERY);
    expect(before.slice(media)).toMatch(/html/);
    expect(css).toContain('scroll-padding-top: calc(var(--pin-header-h) + var(--pin-strip-h))');
    // Nowhere outside it.
    expect(css.match(/scroll-padding/g)).toHaveLength(2);
  });
});

describe('programmatic focus targets', () => {
  it('paint no outline, and the rule is unlayered so it beats *:focus-visible', () => {
    // A layered outline-removing utility on the focus variant would lose to
    // theme.css's unlayered `*:focus-visible` ring; this rule must stay outside
    // any layer.
    const rule = /(^|\n)\[data-focus-target\]:focus\s*\{\s*outline:\s*none;?\s*\}/;
    expect(css).toMatch(rule);
    const ring = css.indexOf('*:focus-visible');
    expect(ring).toBeGreaterThan(-1);
    expect(css.indexOf('[data-focus-target]:focus')).toBeGreaterThan(ring);
  });
});
