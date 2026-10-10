/**
 * The Íslenskubraut teaching-card PDF must render with no network access, in the
 * font it registers.
 *
 * Until 2026-10-06 the fonts were URLs on cdn.jsdelivr.net, fetched when the first
 * card was rendered, so a server that could not reach the CDN answered every download
 * with a 500. They were also the `latin-ext` subset, which holds no A–Z and no
 * Icelandic letter, so react-pdf set every card in Helvetica instead. Each test below
 * fails against one of those two.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createSpjaldDocument, generatePdf } from '../lib/islenskubraut-pdf.js';
import { categories } from '../lib/islenskubraut-data.js';
import type { ReactElement, ReactNode } from 'react';

const LEVELS = ['A1', 'A2', 'B1'];

const realFetch = globalThis.fetch;
const networkRequests: string[] = [];

// Installed before the first render: react-pdf loads a registered font lazily, on
// first use, and caches it for the life of the process. A `data:` URL is not network
// access (react-pdf's layout engine loads its own WebAssembly that way), so it passes.
beforeAll(() => {
  vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.startsWith('data:')) return realFetch(input, init);
    networkRequests.push(url);
    throw new Error(`Network access attempted while rendering a card: ${url}`);
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

/** Pages in a rendered PDF: each page object, not the /Pages tree that holds them. */
function pageCount(pdf: Buffer): number {
  return pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
}

/** The PostScript names of the fonts a PDF embeds or references. */
function baseFonts(pdf: Buffer): Set<string> {
  const names = pdf.toString('latin1').matchAll(/\/BaseFont\s*\/(?:[A-Z]{6}\+)?([\w-]+)/g);
  return new Set([...names].map((m) => m[1]));
}

describe('Íslenskubraut teaching-card PDF', () => {
  it('downloads through the route without reaching the network', async () => {
    const { app } = await import('../index.js');
    const res = await request(app)
      .get('/api/islenskubraut/pdf?flokkur=dyr&stig=A1')
      .buffer(true)
      .parse((r, cb) => {
        const chunks: Buffer[] = [];
        r.on('data', (c: Buffer) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect((res.body as Buffer).subarray(0, 5).toString()).toBe('%PDF-');
    expect(networkRequests).toEqual([]);
  });

  // Every category at every level, because a character the font lacks sends only that
  // glyph to the fallback, and any card could be the one carrying it.
  for (const category of categories) {
    for (const level of LEVELS) {
      it(`sets ${category.id} ${level} in Noto Sans alone`, async () => {
        const fonts = baseFonts(await generatePdf(category, level));

        expect(fonts).toContain('NotoSans-Regular');
        expect(fonts).toContain('NotoSans-Bold');
        expect([...fonts].filter((f) => !f.startsWith('NotoSans-'))).toEqual([]);
      });
    }
  }
});

/** Every string a document element tree would print, in order. */
function printedText(node: ReactNode): string[] {
  if (typeof node === 'string' || typeof node === 'number') return [String(node)];
  if (Array.isArray(node)) return node.flatMap(printedText);
  if (node && typeof node === 'object' && 'props' in node) {
    return printedText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return [];
}

describe('examples and teacher notes on the printed card', () => {
  for (const category of categories) {
    for (const level of LEVELS) {
      it(`prints ${category.id} ${level}'s example from the content, and no teacher note`, () => {
        const text = printedText(createSpjaldDocument(category, level as 'A1' | 'A2' | 'B1'));
        const example = category.examples.find((e) => e.level === level)?.text;
        const note = category.teacherNotes.find((n) => n.level === level)?.text;

        expect(example).toBeTruthy();
        expect(text).toContain(example);
        // Students handle the laminated card; the note belongs on the teacher's screen.
        expect(text.join(' ')).not.toContain('Fyrir kennara');
        expect(text).not.toContain(note);
      });
    }
  }
});

// A card is three sheets: vocabulary, sentence frames, questions. Until 2026-10-10, 10 of
// the 18 ran onto a fourth page, splitting the question card's coloured boxes from their
// words. Content grows, so every card at every level is held to it.
describe('three pages, no more', () => {
  for (const category of categories) {
    for (const level of LEVELS) {
      it(`fits ${category.id} ${level} on three A4 pages`, async () => {
        expect(pageCount(await generatePdf(category, level))).toBe(3);
      });
    }
  }
});
