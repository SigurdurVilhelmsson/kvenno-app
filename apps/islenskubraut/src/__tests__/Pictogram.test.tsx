// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SpurningaSpjald } from '../components/SpurningaSpjald';
import { getCategoryById } from '../data';
import { SmidurPage } from '../pages/SmidurPage';

// As if a teacher had approved two pictures for Föt og klæðnaður and none elsewhere.
vi.mock('../data/myndir', () => ({
  myndir: { klaednadur: { buxur: 101, rautt: 102 } },
  ARASAAC_CREDIT: 'Myndtáknin eru eign ríkisstjórnar Aragóníu … ARASAAC …',
}));
vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const klaednadur = getCategoryById('klaednadur')!;
const pictures = (root: HTMLElement) =>
  [...root.querySelectorAll('img')].map((img) => img.getAttribute('src'));

describe('pictograms on the A1 chips', () => {
  it('puts an approved picture on its chip, with the word still printed beside it', () => {
    const { container } = render(<SpurningaSpjald category={klaednadur} level="A1" />);
    expect(pictures(container)).toEqual(['/myndir/101.png', '/myndir/102.png']);
    const rautt = container.querySelector('img[src="/myndir/102.png"]')!;
    expect(rautt.getAttribute('alt')).toBe('');
    expect(rautt.parentElement?.textContent).toBe('rautt');
  });

  it('shows none on another level, or on a card with no approved pictures', () => {
    const a2 = render(<SpurningaSpjald category={klaednadur} level="A2" />);
    expect(pictures(a2.container)).toEqual([]);
    const dyr = render(<SpurningaSpjald category={getCategoryById('dyr')!} level="A1" />);
    expect(pictures(dyr.container)).toEqual([]);
  });

  it('puts them on the sentence builder’s chips too, and credits ARASAAC there', () => {
    render(
      <MemoryRouter initialEntries={['/smidur/klaednadur']}>
        <Routes>
          <Route path="/smidur/:flokkur" element={<SmidurPage />} />
        </Routes>
      </MemoryRouter>
    );
    const subject = screen.getByRole('group', { name: 'Hvers konar klæðnaður er þetta?' });
    expect(pictures(within(subject).getByRole('button', { name: 'buxur' }))).toEqual([
      '/myndir/101.png',
    ]);
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Veldu setningaramma' })).getByRole('button', {
        name: 'Það er ___.',
      })
    );
    const words = screen.getByRole('group', { name: 'Hvernig lítur það út?' });
    expect(pictures(within(words).getByRole('button', { name: 'rautt' }))).toEqual([
      '/myndir/102.png',
    ]);
    expect(screen.getByText(/ARASAAC/)).toBeDefined();
  });
});
