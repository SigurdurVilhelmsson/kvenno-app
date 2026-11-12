// @vitest-environment node
/**
 * The Orðaforði page changes with the level, on the web and on the printed card.
 *
 * Until Nov 2026 the word groups on that page carried no level, so A1, A2 and B1 printed the
 * same list on every card while the other two pages changed. Each word now has a starting level
 * (`startsAt` in the YAML, A1 when unlisted) and the page shows the words up to the level chosen.
 */
import type { ReactElement, ReactNode } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { createSpjaldDocument } from '../../../../server/src/lib/islenskubraut-pdf';
import { SpjaldPreview } from '../components/SpjaldPreview';
import { categories } from '../data';
import { wordsAt, type Level } from '../data/types';

const LEVELS: Level[] = ['A1', 'A2', 'B1'];

const vocabulary = (category: (typeof categories)[number], level: Level) =>
  category.subCategories.flatMap((sub) => wordsAt(sub, level));

/** Every string a react-pdf element tree prints, calling the renderer's components. */
function printedText(node: ReactNode): string[] {
  if (typeof node === 'string' || typeof node === 'number') return [String(node)];
  if (Array.isArray(node)) return node.flatMap(printedText);
  if (node && typeof node === 'object' && 'props' in node) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    if (typeof element.type === 'function') {
      return printedText((element.type as (props: unknown) => ReactNode)(element.props));
    }
    return printedText(element.props.children);
  }
  return [];
}

/** The strings on the printed card's first page, Orðaforði. */
function printedVocabulary(category: (typeof categories)[number], level: Level): string[] {
  const doc = createSpjaldDocument(category, level) as ReactElement<{ children: ReactNode }>;
  const [first] = ([] as ReactNode[]).concat(doc.props.children).filter(Boolean);
  return printedText(first).map((s) => s.trim());
}

/** The words shown as chips on the web sheet. */
function webChips(category: (typeof categories)[number], level: Level): string[] {
  const html = renderToStaticMarkup(
    <SpjaldPreview category={category} level={level} view="ordafordi" />
  );
  return [...html.matchAll(/<span class="inline-block[^"]*"[^>]*>([^<]+)/g)].map((m) =>
    m[1].replace(/&amp;/g, '&').trim()
  );
}

describe('wordsAt', () => {
  const sub = {
    name: 'Útlit',
    options: ['feld', 'gogg', 'horn'],
    startsAt: { gogg: 'A2', horn: 'B1' } as Record<string, Level>,
  };

  it('shows a word from its starting level on, and an unlisted word at every level', () => {
    expect(wordsAt(sub, 'A1')).toEqual(['feld']);
    expect(wordsAt(sub, 'A2')).toEqual(['feld', 'gogg']);
    expect(wordsAt(sub, 'B1')).toEqual(['feld', 'gogg', 'horn']);
    expect(wordsAt({ name: 'X', options: ['a', 'b'] }, 'A1')).toEqual(['a', 'b']);
  });
});

describe.each(categories.map((c) => [c.id, c] as const))('Orðaforði on %s', (_, category) => {
  it('grows from level to level, and A1 differs from B1', () => {
    const [a1, a2, b1] = LEVELS.map((level) => vocabulary(category, level));
    expect(a2).toEqual(expect.arrayContaining(a1));
    expect(b1).toEqual(expect.arrayContaining(a2));
    expect(b1.length).toBeGreaterThan(a1.length);
    expect(b1).toHaveLength(category.subCategories.flatMap((s) => s.options).length);
  });

  it.each(LEVELS)('the web sheet and the printed page show exactly the %s words', (level) => {
    const expected = vocabulary(category, level);
    expect(webChips(category, level)).toEqual(expected);
    const printed = printedVocabulary(category, level);
    for (const later of vocabulary(category, 'B1').filter((w) => !expected.includes(w))) {
      expect(printed, `${level} prints "${later}"`).not.toContain(later);
    }
    for (const word of expected) expect(printed).toContain(word);
  });
});
