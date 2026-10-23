import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import App from '../App';
import { AefaScreen } from '../components/AefaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';
import { PROBLEMS } from '../data/problems';
import { deriveEmpirical } from '../engine/empirical';

/**
 * The subscript is a `lágstafur` (decisions item 13, option a), the word the textbook's
 * empirical-formula module uses (ch03/m68702). The game called its fourth column
 * `Vísitala` in Skilja, Æfa, the menu and the aria-labels; `vísitala` is feminine and
 * `lágstafur` masculine, so the hint and the verdict's compound were rewritten, not swapped.
 *
 * And the menu's "Lykilskref" box used `n` for the moles and, two lines down, for the
 * molecular multiplier (decisions item 47, option a): the moles line is now in words.
 *
 * Queries are scoped to the rendered container (vitest `retry: 2`, no RTL auto-cleanup).
 */

clockPastNextGuard();
beforeEach(() => {
  localStorage.clear();
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe('the subscript is a lágstafur', () => {
  it.each(sourceFiles(SRC).map((f) => [f.slice(SRC.length + 1), f]))(
    '%s does not call it vísitala',
    (_name, file) => {
      expect(readFileSync(file, 'utf8')).not.toMatch(/vísit[aö]l/i);
    }
  );

  it('Skilja heads the fourth column Lágstafur', () => {
    const { container } = render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    for (let i = 0; i < 3; i++) fireEvent.click(ui.getByRole('button', { name: 'Næsta súla' }));
    expect(ui.getByRole('columnheader', { name: 'Lágstafur' })).toBeTruthy();
  });

  it('Æfa labels the fields Lágstafur and names the column Lágstafasúlan', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    const derived = deriveEmpirical(
      Object.fromEntries(PROBLEMS[0].percentages.map((p) => [p.element, p.percent]))
    );
    for (const key of ['moles', 'ratio'] as const) {
      for (const r of derived.rows) {
        fireEvent.change(
          ui.getByLabelText(`${key === 'moles' ? 'Mól' : 'Hlutfall'} fyrir ${r.element}`),
          {
            target: { value: String(r[key]).replace('.', ',') },
          }
        );
      }
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      fireEvent.click(ui.getByRole('button', { name: 'Næsta súla' }));
    }

    for (const r of derived.rows) {
      fireEvent.change(ui.getByLabelText(`Lágstafur fyrir ${r.element}`), {
        target: { value: '0' },
      });
    }
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(ui.getByText(/^Ekki alveg — /).textContent).toBe('Ekki alveg — Lágstafasúlan');
    expect(container.textContent).toMatch(/Lágstafirnir eru hlutföllin sjálf/);
    expect(container.textContent).not.toMatch(/vísit[aö]l/i);
  });

  it('the menu says lágstafur, and n means one thing in Lykilskref', () => {
    const { container } = render(<App />);
    expect(container.textContent).not.toMatch(/vísit[aö]l/i);
    expect(container.textContent).toContain('prósenta → mól → hlutfall → lágstafur');

    const box = within(container).getByRole('heading', { name: 'Lykilskref' }).parentElement!;
    expect(box.textContent).toContain('mól = massi / mólmassi');
    expect(box.textContent).toContain('Lágstafur:');
    expect(box.textContent!.match(/\bn =/g)).toHaveLength(1);
  });
});
