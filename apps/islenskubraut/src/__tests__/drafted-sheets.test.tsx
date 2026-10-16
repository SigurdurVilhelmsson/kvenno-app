// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SpjaldPage } from '../pages/SpjaldPage';

// The guessing game, the talk-to-write sheet and the can-do sheet are drafted, and a teacher
// confirms each one per category. Here each has one confirmed category, one draft, and none for
// the rest.
vi.mock('../data/giskaleikur', () => ({
  giskaleikur: { dyr: { confirmed: true }, matur: { confirmed: false } },
}));
vi.mock('../data/texti', () => ({
  texti: { matur: { confirmed: true }, dyr: { confirmed: false } },
}));
vi.mock('../data/egget', () => ({
  egget: { klaednadur: { confirmed: true }, manneskja: { confirmed: false } },
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

const SHEETS = [
  { name: 'Hvað er þetta? (PDF)', file: 'giskaleikur', confirmed: 'dyr', draft: 'matur' },
  { name: 'Frá tali til texta (PDF)', file: 'texti', confirmed: 'matur', draft: 'dyr' },
  { name: 'Ég get… (PDF)', file: 'egget', confirmed: 'klaednadur', draft: 'manneskja' },
];

describe.each(SHEETS)('$file on the card page', ({ name, file, confirmed, draft }) => {
  const link = () => screen.queryByRole('link', { name });

  it('is linked once a teacher has confirmed it', () => {
    page(`/spjald/${confirmed}`);
    expect(link()?.getAttribute('href')).toBe(`/spjold/${file}-${confirmed}-A1.pdf`);
  });

  it('is not linked as a draft, except under ?drog', () => {
    const { unmount } = page(`/spjald/${draft}`);
    expect(link()).toBeNull();
    unmount();
    page(`/spjald/${draft}?drog`);
    expect(link()?.getAttribute('href')).toBe(`/spjold/${file}-${draft}-A1.pdf`);
  });

  it('is not linked where there is none, even under ?drog', () => {
    page('/spjald/stadir?drog');
    expect(link()).toBeNull();
  });
});
