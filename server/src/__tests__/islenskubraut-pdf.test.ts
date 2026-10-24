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
import { inflateSync } from 'node:zlib';
import { Document, Page, Text } from '@react-pdf/renderer';
import { createElement } from 'react';
import {
  LEVELS,
  REVIEW_DAYS,
  CHECKLIST_ROWS,
  RATINGS,
  createEggetDocument,
  createGiskaleikurDocument,
  createOrdalistiDocument,
  createSpjaldDocument,
  eggetFileName,
  generateEggetPdf,
  generateGiskaleikurPdf,
  generateOrdalistiPdf,
  generateTextiPdf,
  giskaleikurFileName,
  createTextiDocument,
  textiFileName,
  WRITE_LINES,
  generatePdf,
  newWordsAt,
  ordalistiFileName,
  pdfPageCount as pageCount,
  renderPdf,
} from '../lib/islenskubraut-pdf.js';
import { categories } from '../lib/islenskubraut-data.js';
import { egget } from '../lib/islenskubraut-egget.js';
import { giskaleikur } from '../lib/islenskubraut-giskaleikur.js';
import { texti } from '../lib/islenskubraut-texti.js';
import type { ReactElement, ReactNode } from 'react';

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

/** The PostScript names of the fonts a PDF embeds or references. */
function baseFonts(pdf: Buffer): Set<string> {
  const names = pdf.toString('latin1').matchAll(/\/BaseFont\s*\/(?:[A-Z]{6}\+)?([\w-]+)/g);
  return new Set([...names].map((m) => m[1]));
}

describe('Íslenskubraut teaching-card PDF', () => {
  it('renders without reaching the network', async () => {
    const pdf = await generatePdf(categories.find((c) => c.id === 'dyr')!, 'A1');

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
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

/**
 * Every string a document element tree would print, in order. The renderer's own components
 * (QuestionBlock, ContextCard, …) are called, as React would; react-pdf's primitives are
 * strings and are walked into.
 */
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

describe('questions on the printed card', () => {
  for (const category of categories) {
    for (const level of LEVELS) {
      it(`prints every ${category.id} ${level} question, with its label if it has one`, () => {
        const text = printedText(createSpjaldDocument(category, level));
        for (const q of category.guidingQuestions) {
          if (!q.answers.some((a) => a.level === level)) continue;
          expect(text).toContain(q.question);
          if (q.label) expect(text).toContain(q.label);
        }
        // The context boxes sit under their own heading, after every main question.
        const heading = text.indexOf('Notagildi og samhengi');
        const contextQuestions = category.guidingQuestions.filter((q) => q.context);
        for (const q of contextQuestions) expect(text.indexOf(q.question)).toBeGreaterThan(heading);
        for (const q of category.guidingQuestions.filter((x) => !x.context))
          expect(text.indexOf(q.question)).toBeLessThan(heading);
      });
    }
  }
});

describe('examples and teacher notes on the printed card', () => {
  for (const category of categories) {
    for (const level of LEVELS) {
      it(`prints ${category.id} ${level}'s example from the content, and no teacher note`, () => {
        const text = printedText(createSpjaldDocument(category, level));
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

// The word list beside each card: the words new at its level, a line for the student's own
// language, and four review boxes. One page, so it prints on one sheet.
describe('word lists', () => {
  const dyr = categories.find((c) => c.id === 'dyr')!;
  const answersAt = (level: (typeof LEVELS)[number]) =>
    dyr.guidingQuestions.flatMap((q) => q.answers.find((a) => a.level === level)?.options ?? []);

  it('lists every answer at A1, and at A2 and B1 only what the level below does not print', () => {
    const words = (level: (typeof LEVELS)[number]) =>
      newWordsAt(dyr, level).flatMap((g) => g.words);
    expect(new Set(words('A1'))).toEqual(new Set(answersAt('A1')));
    expect(words('A2').filter((w) => answersAt('A1').includes(w))).toEqual([]);
    expect(words('B1').filter((w) => answersAt('A2').includes(w))).toEqual([]);
    expect(words('B1')).toContain('syndir');
    for (const level of LEVELS) expect(new Set(words(level)).size).toBe(words(level).length);
  });

  it('counts one word written in two orders once', () => {
    const manneskja = categories.find((c) => c.id === 'manneskja')!;
    const words = newWordsAt(manneskja, 'A1').flatMap((g) => g.words);
    expect(words.filter((w) => w === 'gamall/gömul' || w === 'gömul/gamall')).toHaveLength(1);
  });

  it('keeps each word under the first question that offers it', () => {
    const groups = newWordsAt(dyr, 'A1');
    expect(groups.map((g) => g.question)).toEqual(
      dyr.guidingQuestions
        .filter((q) => groups.some((g) => g.question === q.question))
        .map((q) => q.question)
    );
  });

  it('prints the title, every word and a review column per day', () => {
    const text = printedText(createOrdalistiDocument(dyr, 'B1'));
    expect(text).toContain('Orðalisti');
    expect(text).toContain('Á mínu tungumáli');
    for (const w of newWordsAt(dyr, 'B1').flatMap((g) => g.words)) expect(text).toContain(w);
    for (const d of REVIEW_DAYS) expect(text).toContain(`${d}.`);
  });

  it('is saved beside the cards under its own name', () => {
    expect(ordalistiFileName('dyr', 'A2')).toBe('ordalisti-dyr-A2.pdf');
  });

  for (const category of categories) {
    for (const level of LEVELS) {
      it(`fits ${category.id} ${level}'s word list on one page, in Noto Sans`, async () => {
        const pdf = await generateOrdalistiPdf(category, level);
        expect(pageCount(pdf)).toBe(1);
        expect([...baseFonts(pdf)].filter((f) => !f.startsWith('NotoSans-'))).toEqual([]);
      });
    }
  }
});

// "Hvað er þetta?": cut-out cards describing things in the card's own words, and a question sheet
// for the student who guesses. Two pages, so it prints on one sheet, both sides.
describe('guessing games', () => {
  const dyr = categories.find((c) => c.id === 'dyr')!;

  it('has a game for every category', () => {
    expect(Object.keys(giskaleikur)).toEqual(categories.map((c) => c.id));
  });

  it('prints every thing, every question and every chip on the cards, and the frames', () => {
    const items = giskaleikur.dyr.levels.A2;
    const text = printedText(createGiskaleikurDocument(dyr, 'A2', items)).join('\n');
    expect(text).toContain('Hvað er þetta?');
    for (const item of items) {
      expect(text).toContain(item.name);
      for (const a of item.answers) {
        expect(text).toContain(a.question);
        for (const chip of a.chips) expect(text).toContain(chip);
      }
    }
    const frames = dyr.sentenceFrames.find((f) => f.level === 'A2')!.frames;
    for (const frame of frames) expect(text).toContain(frame);
  });

  it('is saved beside the cards under its own name', () => {
    expect(giskaleikurFileName('dyr', 'B1')).toBe('giskaleikur-dyr-B1.pdf');
  });

  for (const category of categories) {
    for (const level of LEVELS) {
      it(`fits ${category.id} ${level}'s game on two pages, in Noto Sans`, async () => {
        const pdf = await generateGiskaleikurPdf(
          category,
          level,
          giskaleikur[category.id].levels[level]
        );
        expect(pageCount(pdf)).toBe(2);
        expect([...baseFonts(pdf)].filter((f) => !f.startsWith('NotoSans-'))).toEqual([]);
      });
    }
  }
});

// "Frá tali til texta": say it with the frames, read the model text, fill its gaps, write your own.
// One page.
describe('talk-to-write sheets', () => {
  const klaednadur = categories.find((c) => c.id === 'klaednadur')!;

  it('has a sheet for every category', () => {
    expect(Object.keys(texti)).toEqual(categories.map((c) => c.id));
  });

  it('prints the frames, the text twice, the stages, every word in the box, and the gaps', () => {
    const sheet = texti.klaednadur.levels.B1;
    const printed = printedText(createTextiDocument(klaednadur, 'B1', sheet));
    const text = printed.join('\n');
    for (const f of klaednadur.sentenceFrames.find((x) => x.level === 'B1')!.frames) {
      expect(text).toContain(f);
    }
    const whole = sheet.stages.map((s) =>
      s.parts.map((p) => ('gap' in p ? p.gap : p.text)).join('')
    );
    // A stage prints as several runs, so it is whole only with them run together.
    for (const s of whole) expect(printed.join('')).toContain(s);
    for (const s of sheet.stages) expect(text).toContain(s.name);
    for (const w of sheet.bank) expect(text).toContain(w.replace(/ /g, '\u00a0'));
    // Each gap once, numbered in order, and nothing of the gapped word left in its place.
    expect(text.match(/\(\d+\) _+/g)).toHaveLength(sheet.bank.length);
    expect(text).toContain(`(${sheet.bank.length}) ____`);
  });

  it('leaves the student room to write', () => {
    expect(WRITE_LINES).toBeGreaterThanOrEqual(5);
  });

  it('is saved beside the cards under its own name', () => {
    expect(textiFileName('dyr', 'B1')).toBe('texti-dyr-B1.pdf');
  });

  for (const category of categories) {
    for (const level of LEVELS) {
      it(`fits ${category.id} ${level}'s sheet on one page, in Noto Sans`, async () => {
        const pdf = await generateTextiPdf(category, level, texti[category.id].levels[level]);
        expect(pageCount(pdf)).toBe(1);
        expect([...baseFonts(pdf)].filter((f) => !f.startsWith('NotoSans-'))).toEqual([]);
      });
    }
  }
});

// "Ég get…": four strips for students to rate themselves, then the teacher's class checklist.
describe('can-do sheets', () => {
  const dyr = categories.find((c) => c.id === 'dyr')!;

  it('has statements for every category', () => {
    expect(Object.keys(egget)).toEqual(categories.map((c) => c.id));
  });

  it('prints each statement on every strip and on the checklist, with the ratings', () => {
    const statements = egget.dyr.levels.A2;
    const text = printedText(createEggetDocument(dyr, 'A2', statements));
    for (const st of statements) {
      // Four strips and the checklist's numbered list.
      expect(text.filter((t) => t === st)).toHaveLength(4);
      expect(text).toContain(`${statements.indexOf(st) + 1}. ${st}`);
    }
    for (const r of RATINGS) expect(text.filter((t) => t === r)).toHaveLength(4);
    expect(text.join(' ')).toContain('ekki til einkunnar');
    expect(CHECKLIST_ROWS).toBeGreaterThanOrEqual(20);
  });

  it('is saved beside the cards under its own name', () => {
    expect(eggetFileName('dyr', 'A1')).toBe('egget-dyr-A1.pdf');
  });

  for (const category of categories) {
    for (const level of LEVELS) {
      it(`fits ${category.id} ${level}'s sheet on two pages, in Noto Sans`, async () => {
        const pdf = await generateEggetPdf(category, level, egget[category.id].levels[level]);
        expect(pageCount(pdf)).toBe(2);
        expect([...baseFonts(pdf)].filter((f) => !f.startsWith('NotoSans-'))).toEqual([]);
      });
    }
  }
});

// react-pdf kept one font object per file for the life of the process, and a document set after
// another could lose a glyph: `Ullin` printed as `llin`, and the cards' `Efniviður` as `fniviður`.
// `renderPdf` reloads the fonts for each document. Words on a line each, so none wraps and every
// letter is one glyph drawn; without the reload, a card rendered first costs one or two of them.
describe('a document rendered after another', () => {
  /** Glyphs the page content draws: every code in its `Tj` strings and `TJ` arrays. */
  function drawnGlyphs(pdf: Buffer): number {
    let n = 0;
    for (const m of pdf.toString('latin1').matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
      let data: string;
      try {
        data = inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1');
      } catch {
        continue;
      }
      if (data.includes('begincmap')) continue;
      for (const t of data.matchAll(/\[([^\]]*)\]\s*TJ|<([0-9a-f]*)>\s*Tj/gi)) {
        for (const x of (t[1] ?? `<${t[2]}>`).matchAll(/<([0-9a-f]*)>/gi)) n += x[1].length / 4;
      }
    }
    return n;
  }

  for (const id of ['dyr', 'farartaeki', 'stadir', 'klaednadur']) {
    it(`draws every letter after the ${id} B1 card`, async () => {
      const words = ['Ullin', 'Um', 'Efniviður', 'Uxi'];
      const doc = createElement(
        Document,
        null,
        createElement(
          Page,
          { size: 'A4', style: { fontFamily: 'NotoSans' } },
          ...words.map((w) => createElement(Text, { key: w }, w))
        )
      );
      await generatePdf(
        categories.find((c) => c.id === id)!,
        'B1'
      );
      expect(drawnGlyphs(await renderPdf(doc))).toBe(words.join('').length);
    });
  }
});
