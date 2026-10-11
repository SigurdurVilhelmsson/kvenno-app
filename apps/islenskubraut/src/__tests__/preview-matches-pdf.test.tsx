// @vitest-environment node
/**
 * The web preview shows what the printed card prints, page by page and in order.
 *
 * Until Oct 2026 the two drifted: the preview opened on the question card, which is the PDF's
 * last page, showed questions' labels under them rather than beside them and context answers
 * one per line, and scrolled its fixed A4 boxes inside themselves, so a teacher could not see
 * what the page held. The preview is now three sheets in the PDF's order; this holds each to
 * the PDF page it stands for.
 *
 * Each PDF page's strings must appear on its web sheet in the same order. The web may show
 * more (the page caption, the icon), never less and never rearranged. Case is ignored, since
 * the PDF prints the category name in capitals where the web uppercases it with CSS.
 */
import type { ReactElement, ReactNode } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { createSpjaldDocument } from '../../../../server/src/lib/islenskubraut-pdf';
import { PAGES } from '../components/Sheet';
import { SpjaldPreview } from '../components/SpjaldPreview';
import { SpurningaSpjald } from '../components/SpurningaSpjald';
import { categories } from '../data';
import type { Level } from '../data/types';

const LEVELS: Level[] = ['A1', 'A2', 'B1'];

/** Every string a react-pdf element tree prints, in order, calling the renderer's components. */
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

/** The PDF's pages, each as the strings it prints. */
function pdfPages(category: (typeof categories)[number], level: Level): string[][] {
  const doc = createSpjaldDocument(category, level) as ReactElement<{ children: ReactNode }>;
  const pages = ([] as ReactNode[]).concat(doc.props.children).filter(Boolean);
  return pages.map((page) =>
    printedText(page)
      // A context answer prints with its separator attached ("heima ·").
      .map((s) => s.replace(/ ·$/, '').trim())
      .filter(Boolean)
  );
}

/** A web sheet as plain text, the way it reads. */
function webText(element: ReactElement): string {
  return renderToStaticMarkup(element)
    .replace(/<!-- -->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
}

function expectInOrder(web: string, printed: string[], where: string) {
  const haystack = web.toLocaleLowerCase('is');
  let from = 0;
  for (const s of printed) {
    const at = haystack.indexOf(s.toLocaleLowerCase('is'), from);
    expect(at, `${where}: "${s}" missing or out of order`).toBeGreaterThanOrEqual(0);
    from = at + s.length;
  }
}

describe('the web preview matches the printed card', () => {
  it('has the same three pages, in the same order', () => {
    expect(pdfPages(categories[0], 'A1')).toHaveLength(PAGES.length);
    expect(PAGES).toEqual(['Orðaforði', 'Setningarammar', 'Spurningaspjald']);
  });

  for (const category of categories) {
    for (const level of LEVELS) {
      it(`${category.id} ${level}: each sheet prints what its PDF page prints`, () => {
        const [vocab, frames, questions] = pdfPages(category, level);
        const sheets = [
          webText(<SpjaldPreview category={category} level={level} view="ordafordi" />),
          webText(<SpjaldPreview category={category} level={level} view="setningarammar" />),
          webText(<SpurningaSpjald category={category} level={level} />),
        ];
        expectInOrder(sheets[0], vocab, `${category.id} ${level} ${PAGES[0]}`);
        expectInOrder(sheets[1], frames, `${category.id} ${level} ${PAGES[1]}`);
        expectInOrder(sheets[2], questions, `${category.id} ${level} ${PAGES[2]}`);
        sheets.forEach((sheet, i) => expect(sheet).toContain(`Bls. ${i + 1} af 3 · ${PAGES[i]}`));
      });
    }
  }
});
