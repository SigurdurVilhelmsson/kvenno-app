// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SmidurPage } from '../pages/SmidurPage';

vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Matur's builder with its first frame, `Þetta er ___.`, left out for its first subject. The build
// allows it, since the subject still fits other frames, and the page used to open on it and crash.
vi.mock('../data/smidur', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/smidur')>();
  return {
    ...actual,
    getSmidur: (categoryId: string, level: 'A1' | 'A2' | 'B1') => {
      const data = actual.getSmidur(categoryId, level);
      if (!data || categoryId !== 'matur') return data;
      const first = data.subjects[0].text;
      const frames = data.frames.map((f, i) =>
        i === 0
          ? {
              ...f,
              except: [first],
              sentences: f.sentences.map((s, j) => (j === 0 ? [] : s)),
            }
          : f
      );
      return { ...data, frames };
    },
  };
});

const pressed = () =>
  within(screen.getByRole('group', { name: 'Veldu setningaramma' }))
    .getAllByRole('button')
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent);

describe('a builder whose first frame leaves out the first subject', () => {
  it('opens on the first frame that subject fits, and moves back when another is chosen', () => {
    render(
      <MemoryRouter initialEntries={['/smidur/matur']}>
        <Routes>
          <Route path="/smidur/:flokkur" element={<SmidurPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(pressed()).toEqual(['Það er ___.']);
    expect(
      within(screen.getByRole('group', { name: 'Veldu setningaramma' })).queryByRole('button', {
        name: 'Þetta er ___.',
      })
    ).toBeNull();
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Hvers konar matur er þetta?' })).getByRole(
        'button',
        { name: 'kjöt' }
      )
    );
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Veldu setningaramma' })).getByRole('button', {
        name: 'Þetta er ___.',
      })
    );
    expect(screen.getByTestId('smidur-setning').textContent).toBe('Þetta er kjöt.');
  });
});
