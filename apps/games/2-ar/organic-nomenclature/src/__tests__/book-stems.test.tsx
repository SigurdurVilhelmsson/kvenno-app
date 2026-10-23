// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { CHAIN_STEMS } from '../utils/naming';

/**
 * Stig 1 taught the English roots (`meth-`, `eth-`, `prop-`, `but-`, `oct-`, `non-`, `dec-`)
 * and then spelled every name with the textbook's Icelandic stems, so `eth + an = etan` did not
 * add up; Stig 2's chips, hints and `Útskýring` and the menu's prefix table did the same.
 * Decision 89, option (a), 2026-10-23: the book's stems everywhere (efnafræði 2e, ch. 20,
 * m68846: etan, própan, bútan, … dekan, and `et-` for two carbons), which are the stems
 * `utils/naming.ts` already built the names from. The game's icelandic-text test bans the
 * English roots in source. Queries are scoped to the rendered container (vitest `retry: 2`).
 */

afterEach(cleanup);

const BOOK = ['met-', 'et-', 'próp-', 'bút-', 'pent-', 'hex-', 'hept-', 'okt-', 'nón-', 'dek-'];

describe('the prefixes are the textbook stems', () => {
  it('Stig 1 teaches them, and each card’s prefix plus -an is its example', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    const shown: string[] = [];
    for (let card = 0; card < BOOK.length; card++) {
      const prefix = container.querySelector('.text-4xl.text-blue-600')!.textContent!;
      const example = container.querySelector('.text-2xl.font-bold.text-warm-800')!.textContent!;
      expect(`${prefix.replace(/-$/, '')}an`, `card ${card + 1}`).toBe(example);
      shown.push(prefix);
      fireEvent.click(ui.getByRole('button', { name: /Næsta →|Viðskeyti →/ }));
    }
    expect(shown).toEqual(BOOK);
    expect(shown).toEqual(BOOK.map((_, i) => `${CHAIN_STEMS[i + 1]}-`));
  });

  it('Stig 2’s name builder offers them as its chips', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(within(container).getByRole('button', { name: /Nefna sameindir/ }));
    const pool = container.querySelector('[data-drop-pool]') as HTMLElement;
    const chips = within(pool)
      .getAllByRole('button')
      .map((b) => b.textContent!.trim())
      .filter((label) => /^[^\d-].*-$/.test(label));
    expect(chips).toEqual(BOOK.slice(0, 6));
  });

  it('the menu’s prefix table shows them', () => {
    const { container } = render(<App />);
    const table = [...container.querySelectorAll('h3')].find((h) =>
      h.textContent!.includes('Forskeyti (kolefnisfjöldi)')
    )!.nextElementSibling as HTMLElement;
    expect([...table.children].map((c) => c.textContent!.replace(/\s+/g, ' ').trim())).toEqual(
      BOOK.slice(0, 5).map((p, i) => `${i + 1} ${p}`)
    );
  });
});
