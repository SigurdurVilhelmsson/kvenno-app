/**
 * Guards the generated server data against drift.
 *
 * The Express server renders teaching-card PDFs and cannot import this SPA, so
 * `server/src/lib/islenskubraut-data.ts` holds a second copy of the category data.
 * That file and the SPA's `./categories/*.ts` are both generated from
 * `content/islenskubraut/` (see `scripts/islenskubraut/build.mjs`), so this test guards
 * against the two consumers drifting apart — a generated file that was hand-edited, or
 * one not regenerated after the YAML changed.
 *
 * `../index` is NOT generated. It is a hand-maintained barrel re-exporting the generated
 * category modules, which is why adding a category still means editing it by hand.
 *
 * The data drifted for months while both copies were hand-mirrored, and shipped corrupted
 * Icelandic onto the PDFs students are handed — "Orðaforði" became "Orda<U+00AD>fordi",
 * "Þessi" became "Þssi", and "rannsaka" became "rannsóka".
 *
 * If this fails, do NOT edit either generated file: run `pnpm islenskubraut:build`.
 */
import { describe, expect, it } from 'vitest';

import { categories as serverCategories } from '../../../../../server/src/lib/islenskubraut-data';
import { categories as clientCategories } from '../index';

describe('server copy of the íslenskubraut data', () => {
  it('is byte-identical in content to the SPA data', () => {
    // Deep equality over the whole tree: catches a dropped character anywhere, not just
    // in the fields someone thought to spot-check.
    expect(serverCategories).toEqual(clientCategories);
  });

  it('exposes the same category ids, so the PDF route cannot 400 on a valid category', () => {
    expect(serverCategories.map((c) => c.id)).toEqual(clientCategories.map((c) => c.id));
  });
});

describe('íslenskubraut Icelandic text', () => {
  const strings: { path: string; value: string }[] = [];
  const collect = (value: unknown, path: string) => {
    if (typeof value === 'string') strings.push({ path, value });
    else if (Array.isArray(value)) value.forEach((v, i) => collect(v, `${path}[${i}]`));
    else if (value && typeof value === 'object')
      for (const [k, v] of Object.entries(value)) collect(v, `${path}.${k}`);
  };
  collect(clientCategories, 'categories');

  it('contains no soft hyphens or other invisible separators', () => {
    // U+00AD wedged inside "Orðaforði" is what made the corruption survive review:
    // it is invisible in an editor and in the rendered PDF.
    // Written as escapes on purpose: these characters are invisible in source too, so a
    // literal character class here would be unreviewable — and is what hid the bug.
    const INVISIBLE = /\u00AD|\u200B|\u200C|\u200D|\u2060|\uFEFF/;
    const bad = strings.filter((s) => INVISIBLE.test(s.value));
    expect(bad).toEqual([]);
  });

  it('has no string that lost every Icelandic character', () => {
    // A flattened string ("husdyr") is valid ASCII and renders without complaint, so
    // nothing else catches it. These stems only occur in words that must carry an accent.
    const flattened =
      /\b(husdyr|gaeludyr|Ordafordi|dyrid|liffraedilegur|bufenadur|hlyja|rannsoka)\b/i;
    const bad = strings.filter((s) => flattened.test(s.value));
    expect(bad).toEqual([]);
  });
});
