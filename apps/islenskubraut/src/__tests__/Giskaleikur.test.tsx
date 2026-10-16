// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SpjaldPage } from '../pages/SpjaldPage';

// One confirmed game, one draft, and no game at all for the other categories.
vi.mock('../data/giskaleikur', () => ({
  giskaleikur: { dyr: { confirmed: true }, matur: { confirmed: false } },
}));
vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const page = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/spjald/:flokkur" element={<SpjaldPage />} />
      </Routes>
    </MemoryRouter>
  );
const game = () => screen.queryByRole('link', { name: 'Hvað er þetta? (PDF)' });

describe('the guessing game on the card page', () => {
  it('is linked once a teacher has confirmed it', () => {
    page('/spjald/dyr');
    expect(game()?.getAttribute('href')).toBe('/spjold/giskaleikur-dyr-A1.pdf');
  });

  it('is not linked as a draft, except under ?drog', () => {
    const { unmount } = page('/spjald/matur');
    expect(game()).toBeNull();
    unmount();
    page('/spjald/matur?drog');
    expect(game()?.getAttribute('href')).toBe('/spjold/giskaleikur-matur-A1.pdf');
  });

  it('is not linked where there is no game, even under ?drog', () => {
    page('/spjald/stadir?drog');
    expect(game()).toBeNull();
  });
});
