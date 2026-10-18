// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { lookupWord } from '../components/Mal';
import { SpjaldPage } from '../pages/SpjaldPage';

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
      words: { dyr: { feldur: 'futro' }, matur: { sterkt: 'mocne' } },
      questions: { matur: { Lykt: { sterkt: 'mocno' } } },
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
    // On Matur at A2, sterkt answers both "Hvernig bragðast það?" and "Hvernig lyktar af því?".
    window.localStorage.setItem('islenskubraut-mal', 'pl');
    page('/spjald/matur');
    questions();
    fireEvent.click(screen.getByRole('button', { name: /^A2/ }));
    const taste = screen.getByText('Hvernig bragðast það?').closest('.rounded-xl') as HTMLElement;
    const smell = screen.getByText('Hvernig lyktar af því?').closest('.rounded-xl') as HTMLElement;
    expect(within(taste).getByText('mocne')).toBeDefined();
    expect(within(taste).queryByText('mocno')).toBeNull();
    expect(within(smell).getByText('mocno')).toBeDefined();
    expect(within(smell).queryByText('mocne')).toBeNull();
  });

  it('looks a chip up by its last word', () => {
    expect(lookupWord('til að borða')).toBe('borða');
    expect(lookupWord('há/hár')).toBe('há');
    expect(lookupWord('feldur')).toBe('feldur');
  });
});
