// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';

/**
 * Decision 40 (b). The warm-up's `Mundu:` card said metals are groups 1, 2 and
 * 3–12 and non-metals 15–18. Group 1 holds hydrogen, groups 13–14 were missing
 * (Al, Sn and Pb, all asked about in Levels 2–3) and 15–16 hold metals too. The
 * card now says where on the table each sits, with the groups as a guide and
 * its exceptions named. The labels are unchanged.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

function warmupCard() {
  const { container } = render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
  const view = within(container);
  for (let i = 0; i < 3; i++) fireEvent.click(view.getByRole('button', { name: /Næsta regla/ }));
  fireEvent.click(view.getByRole('button', { name: /Hefja próf/ }));
  const heading = view.getByRole('heading', { name: 'Mundu:' });
  return heading.parentElement as HTMLElement;
}

describe('the warm-up card on metals and non-metals', () => {
  it('places them on the table, naming hydrogen and the mixed groups', () => {
    const card = warmupCard();
    const [metals, nonmetals] = [...card.querySelectorAll('.grid > div')].map((d) => d.textContent);
    expect(metals).toBe('Málmar: vinstra megin og í miðju (hópar 1–12, nema vetni)');
    expect(nonmetals).toBe('Málmleysingjar: efst til hægri (hópar 14–18, að hluta)');
  });

  it('no longer gives the old group lists', () => {
    const text = warmupCard().textContent ?? '';
    expect(text).not.toMatch(/hópar 1, 2/);
    expect(text).not.toMatch(/hópar 15/);
  });
});
