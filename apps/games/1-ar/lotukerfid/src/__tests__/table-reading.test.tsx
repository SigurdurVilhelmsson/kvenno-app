import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Level3 } from '../components/Level3';
import { PeriodicTable } from '../components/PeriodicTable';

/**
 * The text that teaches a student to read a table cell describes the cell the
 * game draws.
 *
 * Until 2026-09-23 Stig 3's intro said the atomic number is at the bottom of a
 * cell and the mass at the top. Every cell this game draws — and every
 * periodic table in the textbook — has them the other way round, and the
 * game's own misconception text (`utils/misconceptions.ts`) already said so.
 */

describe('reading a cell', () => {
  it('the table puts the sætistala above the symbol and the mass below it', () => {
    render(<PeriodicTable interactive={false} />);
    const text = screen.getByRole('button', { name: /\(C\), sætistala 6,/ }).textContent ?? '';
    // The cell is a flex column, so source order is top-to-bottom order.
    expect(text.indexOf('6')).toBeLessThan(text.indexOf('C'));
    expect(text.indexOf('C')).toBeLessThan(text.indexOf('12,0'));
  });

  it('Stig 3 teaches the same layout', () => {
    render(<Level3 onBack={() => {}} onComplete={() => {}} />);
    const heading = screen.getByRole('heading', { name: /Hvar finn ég upplýsingarnar/ });
    const text = heading.nextElementSibling?.textContent ?? '';
    expect(text).toMatch(/sætistalan er efst/);
    expect(text).toMatch(/meðalatómmassinn er neðst/);
  });
});

/**
 * A border is given a colour.
 *
 * Tailwind v4 draws a bare `border` in `currentColor`, so the four boxes of
 * Stig 3's particle breakdown came out with near-black outlines among the
 * game's warm greys. Static class lists only; one built from a colour variable
 * is left to whoever wrote the variable.
 */
describe('borders', () => {
  const root = join(__dirname, '..');
  const files = (function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = join(dir, e.name);
      if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(full);
      return e.name.endsWith('.tsx') ? [full] : [];
    });
  })(root);

  const WIDTH = /^border(-[xytrbl])?(-\d+)?$/;
  const NOT_A_COLOUR = /^border-(\d+|[xytrbl](-\d+)?|solid|dashed|dotted|double|none)$/;

  it('scans the components', () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it('every static class list with a border width also names a border colour', () => {
    const offences: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const m of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
        const list = m[1] ?? m[2];
        if (list.includes('${')) continue;
        const bases = list.split(/\s+/).map((t) => t.split(':').pop()!);
        const hasWidth = bases.some((b) => WIDTH.test(b));
        const hasColour = bases.some((b) => b.startsWith('border-') && !NOT_A_COLOUR.test(b));
        if (hasWidth && !hasColour) {
          const line = source.slice(0, m.index).split('\n').length;
          offences.push(`${relative(root, file)}:${line} — ${list}`);
        }
      }
    }
    expect(offences).toEqual([]);
  });
});
