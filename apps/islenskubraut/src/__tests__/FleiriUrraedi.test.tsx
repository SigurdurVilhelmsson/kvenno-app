// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { FleiriUrraedi } from '../components/FleiriUrraedi';
import { SpjaldPage } from '../pages/SpjaldPage';

expect.extend(toHaveNoViolations);

// Two approved links and one draft, one of them with a per-category address.
vi.mock('../data/tenglar', () => ({
  tenglar: [
    {
      id: 'myndir',
      name: 'Myndaorðabók',
      description: 'Orð með myndum og hljóði.',
      audience: 'nemendur',
      levels: ['A1', 'A2'],
      urls: { dyr: 'https://example.is/#/dyr', matur: 'https://example.is/#/matur' },
      approved: true,
    },
    {
      id: 'namsefni',
      name: 'Námsefni',
      description: 'Yfirlit yfir námsefni.',
      audience: 'kennarar',
      levels: ['A1', 'A2', 'B1'],
      urls: { dyr: 'https://namsefni.is/', matur: 'https://namsefni.is/' },
      approved: true,
    },
    {
      id: 'ordabok',
      name: 'Orðabók',
      description: 'Ekki samþykkt enn.',
      audience: 'nemendur',
      levels: ['A1'],
      urls: { dyr: 'https://ordabok.is/' },
      approved: false,
    },
  ],
}));
vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const panel = () => screen.getByRole('region', { name: 'Fleiri úrræði' });
const names = () =>
  within(panel())
    .getAllByRole('link')
    .map((a) => a.textContent);

describe('Fleiri úrræði', () => {
  it('shows the approved links for the card and level, students first, then teachers', async () => {
    const { container } = render(<FleiriUrraedi categoryId="matur" level="A1" />);
    expect(names()).toEqual(['Myndaorðabók', 'Námsefni']);
    expect(within(panel()).getByRole('link', { name: 'Myndaorðabók' }).getAttribute('href')).toBe(
      'https://example.is/#/matur'
    );
    expect(
      within(panel())
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent)
    ).toEqual(['Fyrir nemendur', 'Fyrir kennara']);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('leaves out a link for another level, and shows nothing when no link is left', () => {
    render(<FleiriUrraedi categoryId="dyr" level="B1" />);
    expect(names()).toEqual(['Námsefni']);
    const { container } = render(<FleiriUrraedi categoryId="stadir" level="A1" />);
    expect(container.innerHTML).toBe('');
  });

  it('hides drafts unless asked', () => {
    render(<FleiriUrraedi categoryId="dyr" level="A1" />);
    expect(names()).not.toContain('Orðabók');
  });

  it('shows drafts on the card page under ?drog, and keeps them when the level changes', () => {
    render(
      <MemoryRouter initialEntries={['/spjald/dyr?drog']}>
        <Routes>
          <Route path="/spjald/:flokkur" element={<SpjaldPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(names()).toEqual(['Myndaorðabók', 'Orðabók', 'Námsefni']);
    expect(within(panel()).getByText('(drög)')).toBeDefined();
    expect(within(panel()).getByRole('note')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /A2/ }));
    expect(names()).toEqual(['Myndaorðabók', 'Námsefni']);
    expect(within(panel()).getByRole('note')).toBeDefined();
  });
});
