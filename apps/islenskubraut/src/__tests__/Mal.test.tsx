// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { lookupWord } from '../components/Mal';
import { SpjaldPage } from '../pages/SpjaldPage';

// The site shows drafts to everyone while `DROG_BIRT` is on (src/birting.ts); these tests hold
// what it does once the switch is off again. `drog-live.test.tsx` holds the live behaviour.
vi.mock('../birting', () => ({ DROG_BIRT: false }));

// One approved language with a gloss for every Dýr A1 chip it needs here, and one draft.
vi.mock('../data/glossur', () => ({
  glossur: [
    {
      code: 'pl',
      name: 'Polski',
      dir: 'ltr',
      approved: true,
      approvedBy: 'Anna',
      dictionary: 'https://polska.arnastofnun.is/pl/leit/{word}',
      words: { dyr: { feldur: 'futro' }, farartaeki: { hátt: 'głośno' } },
      questions: { farartaeki: { Útlit: { hátt: 'wysokie' } } },
    },
    {
      code: 'ar',
      name: 'العربية',
      dir: 'rtl',
      approved: false,
      approvedBy: null,
      dictionary: null,
      words: { dyr: { feldur: 'فرو' } },
    },
  ],
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
const questions = () => fireEvent.click(screen.getByRole('tab', { name: /Spurningaspjald/ }));
const picker = () => screen.getByRole('combobox', { name: 'Á þínu máli' });

afterEach(() => window.localStorage.clear());

describe('Á þínu máli', () => {
  it('offers only approved languages, and shows each chip’s gloss and dictionary link', () => {
    page('/spjald/dyr');
    expect(
      within(picker())
        .getAllByRole('option')
        .map((o) => o.textContent)
    ).toEqual(['Bara íslenska', 'Polski']);
    questions();
    expect(screen.queryByText('futro')).toBeNull();
    fireEvent.change(picker(), { target: { value: 'pl' } });
    const gloss = screen.getByText('futro');
    expect(gloss.getAttribute('lang')).toBe('pl');
    expect(screen.getByRole('link', { name: 'Orðabók: feldur' }).getAttribute('href')).toBe(
      'https://polska.arnastofnun.is/pl/leit/feldur'
    );
  });

  it('remembers the choice in this browser', () => {
    window.localStorage.setItem('islenskubraut-mal', 'pl');
    page('/spjald/dyr');
    expect((picker() as HTMLSelectElement).value).toBe('pl');
  });

  it('offers a draft under ?drog, right to left where the language is', () => {
    page('/spjald/dyr?drog');
    fireEvent.change(picker(), { target: { value: 'ar' } });
    questions();
    expect(screen.getByText('فرو').getAttribute('dir')).toBe('rtl');
    expect(within(picker()).getByRole('option', { name: 'العربية (drög)' })).toBeDefined();
  });

  it('ignores a remembered draft outside ?drog', () => {
    window.localStorage.setItem('islenskubraut-mal', 'ar');
    page('/spjald/dyr');
    expect((picker() as HTMLSelectElement).value).toBe('');
  });

  it('shows a question’s own gloss under that question, and the card’s under the others', () => {
    // On Farartæki at B1, hátt answers both "Hvernig lítur það út?" (tall) and
    // "Hvaða hljóð gefur það frá sér?" (loud).
    window.localStorage.setItem('islenskubraut-mal', 'pl');
    page('/spjald/farartaeki');
    questions();
    fireEvent.click(screen.getByRole('button', { name: /^B1/ }));
    const looks = screen.getByText('Hvernig lítur það út?').closest('.rounded-xl') as HTMLElement;
    const sound = screen
      .getByText('Hvaða hljóð gefur það frá sér?')
      .closest('.rounded-xl') as HTMLElement;
    expect(within(looks).getByText('wysokie')).toBeDefined();
    expect(within(looks).queryByText('głośno')).toBeNull();
    expect(within(sound).getByText('głośno')).toBeDefined();
    expect(within(sound).queryByText('wysokie')).toBeNull();
  });

  it('looks a chip up by its last word', () => {
    expect(lookupWord('til að borða')).toBe('borða');
    expect(lookupWord('há/hár')).toBe('há');
    expect(lookupWord('feldur')).toBe('feldur');
  });
});
