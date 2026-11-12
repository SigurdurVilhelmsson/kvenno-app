// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DROG_BIRT } from '../birting';
import { Hlusta } from '../components/Hlusta';
import { categories } from '../data';
import { Home } from '../pages/Home';
import { SmidurPage } from '../pages/SmidurPage';
import { SpjaldPage } from '../pages/SpjaldPage';

// While the site is not in use, the drafts are live (Siggi, 2026-11-12): shown to everyone, with
// nothing on the page saying they are drafts unless `?drog` asks. What is approved is still in
// the YAML and on the review page. The other tests turn the switch off to hold the gated site.
vi.mock('../data/giskaleikur', () => ({ giskaleikur: { matur: { confirmed: false } } }));
vi.mock('../data/texti', () => ({ texti: { matur: { confirmed: false } } }));
vi.mock('../data/egget', () => ({ egget: { matur: { confirmed: false } } }));
vi.mock('../data/hljod', () => ({
  HLJOD_VOICE: 'Rödd C, CC BY 4.0',
  hljod: {
    hali: { file: 'b.mp3', approved: false },
    feldur: { file: 'c.mp3', approved: false, rejected: true },
  },
}));
vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const played: string[] = [];
class FakeAudio {
  constructor(public src: string) {}
  play() {
    played.push(this.src);
    return Promise.resolve();
  }
  pause() {}
}
vi.stubGlobal('Audio', FakeAudio);
afterEach(() => {
  played.length = 0;
});

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spjald/:flokkur" element={<SpjaldPage />} />
        <Route path="/smidur/:flokkur" element={<SmidurPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('drafts live', () => {
  it('is on', () => {
    expect(DROG_BIRT).toBe(true);
  });

  it('puts a draft category on the home grid', () => {
    const drafts = categories.filter((c) => c.draft);
    expect(drafts.length).toBeGreaterThan(0);
    at('/');
    for (const c of drafts) expect(screen.getByText(c.name)).toBeTruthy();
  });

  it('links the drafted sheets and the builder from the card, and calls none of them a draft', () => {
    at('/spjald/matur');
    for (const name of ['Hvað er þetta? (PDF)', 'Frá tali til texta (PDF)', 'Ég get… (PDF)']) {
      expect(screen.getByRole('link', { name })).toBeTruthy();
    }
    expect(screen.getByRole('link', { name: 'Setningasmiður' })).toBeTruthy();
    expect(screen.queryByText(/Drög/)).toBeNull();
    expect(screen.queryByText(/\(drög\)/)).toBeNull();
  });

  it('marks drafts under ?drog, for a reviewer', () => {
    const skolinn = categories.find((c) => c.draft)!;
    at(`/spjald/${skolinn.id}?drog`);
    expect(screen.getByText(/Drög: kennari hefur ekki enn farið yfir þetta spjald/)).toBeTruthy();
  });

  it('says nothing of drafts on the builder, except under ?drog', () => {
    const { unmount } = at('/smidur/dyr');
    expect(screen.queryByText(/Drög:/)).toBeNull();
    unmount();
    at('/smidur/dyr?drog');
    expect(
      screen.getByText(/Drög: kennari hefur ekki enn farið yfir þessar setningar/)
    ).toBeTruthy();
  });

  it('plays a recording not yet approved, and never one heard as wrong', () => {
    const { container } = render(
      <>
        <Hlusta text="hali" color="#000" />
        <Hlusta text="feldur" color="#000" />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: hali' }));
    expect(played).toEqual(['/hljod/b.mp3']);
    expect(container.querySelectorAll('button')).toHaveLength(1);
  });
});
