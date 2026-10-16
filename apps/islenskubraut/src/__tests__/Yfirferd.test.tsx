// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { categories } from '../data';
import { Yfirferd } from '../pages/Yfirferd';
import { YfirferdHljod } from '../pages/YfirferdHljod';
import { reviewFile, reviewText } from '../yfirferd/store';

expect.extend(toHaveNoViolations);

vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
// Three recordings: an approved one, one the recogniser doubts, and one on Skólinn only.
vi.mock('../data/hlustun', () => ({
  hlustun: [
    {
      text: 'feldur',
      file: 'a.mp3',
      approved: true,
      places: [{ category: 'dyr', level: 'A1', where: 'Hvernig lítur það út?' }],
      heard: 'feldur',
      score: 0,
    },
    {
      text: 'les',
      file: 'b.mp3',
      approved: false,
      places: [
        { category: 'manneskja', level: null, where: 'Athafnir' },
        { category: 'manneskja', level: 'A1', where: 'rammi' },
      ],
      heard: 'e',
      score: 0.67,
    },
    {
      text: 'bók',
      file: 'c.mp3',
      approved: false,
      places: [{ category: 'skolinn', level: 'A1', where: 'Hvað er í skólatöskunni?' }],
    },
  ],
}));
vi.mock('../data/hljod', () => ({
  HLJOD_VOICE: 'Rödd C',
  hljod: {
    feldur: { file: 'a.mp3', approved: true },
    les: { file: 'b.mp3', approved: false },
    bók: { file: 'c.mp3', approved: false },
  },
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/yfirferd" element={<Yfirferd />} />
        <Route path="/yfirferd/hljod" element={<YfirferdHljod />} />
      </Routes>
    </MemoryRouter>
  );

afterEach(() => window.localStorage.clear());

describe('the review page', () => {
  it('lists every card, drafts included, with each item’s state and where to open it', async () => {
    const { container } = renderAt('/yfirferd');
    for (const c of categories) {
      expect(screen.getByRole('heading', { level: 2, name: new RegExp(c.name) })).toBeDefined();
    }
    const dyr = screen.getByRole('heading', { level: 2, name: /Dýr/ }).closest('section')!;
    const item = (name: string) =>
      within(dyr).getByRole('heading', { level: 3, name }).closest('li')!;
    expect(within(item('Hvað er þetta?')).getByText('drög')).toBeDefined();
    expect(
      within(item('Hvað er þetta?'))
        .getByRole('link', { name: 'A2 (PDF), Dýr, Hvað er þetta?' })
        .getAttribute('href')
    ).toBe('/spjold/giskaleikur-dyr-A2.pdf');
    expect(
      within(item('Spjaldið')).getByRole('link', { name: 'B1, Dýr, Spjaldið' }).getAttribute('href')
    ).toBe('/spjald/dyr?stig=B1&drog');
    expect(within(item('Spjaldið')).getByText('birt nemendum')).toBeDefined();
    expect(item('Upptökur').textContent).toContain('1 af 1 samþykktar');
    // Skólinn is a draft card with no sentence builder.
    const skolinn = screen.getByRole('heading', { level: 2, name: /Skólinn/ }).closest('section')!;
    expect(skolinn.textContent).toContain('drög, ekki á forsíðu');
    expect(within(skolinn).queryByRole('heading', { level: 3, name: 'Setningasmiður' })).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('keeps a note in this browser and puts it in the file and the text sent back', () => {
    renderAt('/yfirferd');
    fireEvent.change(screen.getByLabelText('Athugasemd um Hvað er þetta?, Dýr'), {
      target: { value: 'A2: lundi er ekki á bæ.' },
    });
    fireEvent.change(screen.getByLabelText('Nafnið þitt'), { target: { value: 'Anna' } });
    const stored = JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!);
    expect(stored.notes['dyr/giskaleikur']).toBe('A2: lundi er ekki á bæ.');
    const file = reviewFile(stored, '2026-10-17');
    expect(file).toMatchObject({
      reviewer: 'Anna',
      notes: [
        { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
      ],
    });
    expect(reviewText(stored, '2026-10-17')).toBe(
      'Yfirferð á Íslenskubraut, 2026-10-17, Anna\n\nDýr — Hvað er þetta?\nA2: lundi er ekki á bæ.\n'
    );
  });

  it('clears everything only after a second, explicit press', () => {
    window.localStorage.setItem(
      'islenskubraut-yfirferd',
      JSON.stringify({ reviewer: '', notes: { 'dyr/spjald': 'x' }, clips: {} })
    );
    renderAt('/yfirferd');
    fireEvent.click(screen.getByRole('button', { name: 'Hreinsa allt' }));
    expect(JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!).notes).toEqual({
      'dyr/spjald': 'x',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Já, eyða öllu sem ég hef skrifað' }));
    expect(JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!).notes).toEqual({});
  });
});

describe('the listening page', () => {
  const rows = () =>
    within(screen.getByRole('list', { name: 'Upptökur' }))
      .getAllByRole('listitem')
      .map((li) => li.querySelector('span[lang="is"]')!.textContent);

  it('plays every recording, drafts too, the recogniser’s doubts first', async () => {
    const { container } = renderAt('/yfirferd/hljod');
    expect(rows()).toEqual(['les', 'feldur', 'bók']);
    expect(screen.getByRole('button', { name: 'Hlusta: les' })).toBeDefined();
    expect(screen.getByText('Talgreinir heyrði: „e“')).toBeDefined();
    expect(screen.getByText(/Manneskja, „Athafnir“ og 1 í viðbót/)).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('filters by card, by doubt and by what I have not marked', () => {
    renderAt('/yfirferd/hljod?flokkur=skolinn');
    expect(rows()).toEqual(['bók']);
    fireEvent.change(screen.getByLabelText('Spjald'), { target: { value: '' } });
    fireEvent.click(screen.getByLabelText('Aðeins þær sem talgreinir efast um'));
    expect(rows()).toEqual(['les']);
    fireEvent.click(screen.getByLabelText('Aðeins þær sem talgreinir efast um'));
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Mat: feldur' })).getByRole('button', {
        name: 'Rétt',
      })
    );
    fireEvent.click(screen.getByLabelText('Aðeins þær sem ég hef ekki metið'));
    expect(rows()).toEqual(['les', 'bók']);
  });

  it('marks a recording right or wrong, with what is wrong, and a second press unmarks it', () => {
    renderAt('/yfirferd/hljod');
    const mat = (text: string) => within(screen.getByRole('group', { name: `Mat: ${text}` }));
    fireEvent.click(mat('les').getByRole('button', { name: 'Rangt' }));
    fireEvent.change(screen.getByLabelText('Hvað er rangt? „les“'), {
      target: { value: 'heyrist sem „e“' },
    });
    fireEvent.click(mat('feldur').getByRole('button', { name: 'Rétt' }));
    const stored = () => JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!).clips;
    expect(stored()).toEqual({
      les: { verdict: 'wrong', note: 'heyrist sem „e“' },
      feldur: { verdict: 'right' },
    });
    expect(mat('feldur').getByRole('button', { name: 'Rétt' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.click(mat('feldur').getByRole('button', { name: 'Rétt' }));
    expect(stored()).toEqual({ les: { verdict: 'wrong', note: 'heyrist sem „e“' } });
    expect(reviewText({ reviewer: '', notes: {}, clips: stored() }, '2026-10-17')).toContain(
      'Röng: „les“ — heyrist sem „e“'
    );
  });
});

// The review pages show drafts a teacher has not checked, so no page a student can reach may
// link to them. Only the routes, and the two pages themselves, name the paths.
describe('the review pages', () => {
  it('are linked from nowhere', () => {
    const src = resolve(__dirname, '..');
    const files = (readdirSync(src, { recursive: true }) as string[]).filter(
      (f) => /\.tsx?$/.test(f) && !f.includes('__tests__')
    );
    const linking = files.filter((f) => /["'`]\/yfirferd/.test(readFileSync(join(src, f), 'utf8')));
    expect(linking.sort()).toEqual(['App.tsx', 'pages/Yfirferd.tsx', 'pages/YfirferdHljod.tsx']);
  });
});
