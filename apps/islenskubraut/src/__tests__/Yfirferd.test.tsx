// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
      v: 'va',
      approved: true,
      places: [{ category: 'dyr', level: 'A1', where: 'Hvernig lítur það út?' }],
      heard: 'feldur',
      score: 0,
    },
    {
      text: 'les',
      file: 'b.mp3',
      v: 'vb',
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
      v: 'vc',
      approved: false,
      rejected: true,
      places: [{ category: 'skolinn', level: 'A1', where: 'Hvað er í skólatöskunni?' }],
    },
    {
      text: 'Hún/Hann er ___.',
      file: 'd.mp3',
      v: 'vd',
      approved: false,
      places: [
        { category: 'dyr', level: 'A1', where: 'rammi' },
        { category: 'skolinn', level: 'A1', where: 'rammi' },
      ],
      say: 'Hún eða Hann er ….',
    },
  ],
}));
vi.mock('../data/hljod', () => ({
  HLJOD_VOICE: 'Rödd C',
  hljod: {
    feldur: { file: 'a.mp3', approved: true },
    les: { file: 'b.mp3', approved: false },
    bók: { file: 'c.mp3', approved: false },
    'Hún/Hann er ___.': { file: 'd.mp3', approved: false },
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
    // A count ending in 1 takes the singular: `1 af 2 samþykkt`.
    expect(item('Upptökur').textContent).toContain('1 af 2 samþykkt');
    // Links and glosses differ by level, so their rows open the card at every level.
    expect(
      within(item('Fleiri úrræði'))
        .getAllByRole('link')
        .map((a) => a.getAttribute('href'))
    ).toEqual(['/spjald/dyr?stig=A1&drog', '/spjald/dyr?stig=A2&drog', '/spjald/dyr?stig=B1&drog']);
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

  it('keeps a note box open while its note is emptied to be rewritten', () => {
    renderAt('/yfirferd');
    const box = screen.getByLabelText('Athugasemd um Spjaldið, Dýr');
    const details = box.closest('details')!;
    details.open = true;
    fireEvent.change(box, { target: { value: 'x' } });
    fireEvent.change(box, { target: { value: '' } });
    expect(details.open).toBe(true);
  });

  it('clears everything only after a second, explicit press, and can be cancelled', () => {
    vi.useFakeTimers();
    window.localStorage.setItem(
      'islenskubraut-yfirferd',
      JSON.stringify({ reviewer: 'Anna', notes: { 'dyr/spjald': 'x' }, clips: {} })
    );
    renderAt('/yfirferd');
    const stored = () => JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!);
    fireEvent.click(screen.getByRole('button', { name: 'Hreinsa allt' }));
    // Focus goes to Hætta við, so a second Enter cancels rather than erases.
    expect(document.activeElement?.textContent).toBe('Hætta við');
    fireEvent.click(screen.getByRole('button', { name: 'Hætta við' }));
    expect(stored().notes).toEqual({ 'dyr/spjald': 'x' });
    // Focus goes back to where it was asked, not to the top of the page.
    expect(document.activeElement?.textContent).toBe('Hreinsa allt');
    fireEvent.click(screen.getByRole('button', { name: 'Hreinsa allt' }));
    // A press straight after the first, as in a double click, is ignored.
    fireEvent.click(screen.getByRole('button', { name: 'Já, eyða öllu sem ég hef skrifað' }));
    expect(stored().notes).toEqual({ 'dyr/spjald': 'x' });
    vi.advanceTimersByTime(500);
    fireEvent.click(screen.getByRole('button', { name: 'Já, eyða öllu sem ég hef skrifað' }));
    expect(stored()).toEqual({ reviewer: '', notes: {}, clips: {} });
    expect(document.activeElement?.getAttribute('role')).toBe('status');
    vi.useRealTimers();
  });

  it('never writes back what it read from another tab, which may have moved on since', () => {
    renderAt('/yfirferd');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    act(() => {
      window.localStorage.setItem(
        'islenskubraut-yfirferd',
        JSON.stringify({ reviewer: 'A', notes: {}, clips: {} })
      );
      window.dispatchEvent(new StorageEvent('storage', { key: 'islenskubraut-yfirferd' }));
      window.localStorage.setItem(
        'islenskubraut-yfirferd',
        JSON.stringify({ reviewer: 'AB', notes: {}, clips: {} })
      );
      window.dispatchEvent(new StorageEvent('storage', { key: 'islenskubraut-yfirferd' }));
    });
    // Only the two writes the test made as "the other tab"; no echo from this one.
    expect(setItem).toHaveBeenCalledTimes(2);
    expect((screen.getByLabelText('Nafnið þitt') as HTMLInputElement).value).toBe('AB');
    setItem.mockRestore();
  });

  it('reads back what another tab wrote, rather than overwriting it', () => {
    renderAt('/yfirferd');
    const other = { reviewer: 'Anna', notes: { 'dyr/spjald': 'úr öðrum flipa' }, clips: {} };
    act(() => {
      window.localStorage.setItem('islenskubraut-yfirferd', JSON.stringify(other));
      window.dispatchEvent(new StorageEvent('storage', { key: 'islenskubraut-yfirferd' }));
    });
    expect((screen.getByLabelText('Nafnið þitt') as HTMLInputElement).value).toBe('Anna');
    fireEvent.change(screen.getByLabelText('Athugasemd um Ég get…, Dýr'), {
      target: { value: 'nýtt' },
    });
    expect(JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!).notes).toEqual({
      'dyr/spjald': 'úr öðrum flipa',
      'dyr/egget': 'nýtt',
    });
  });
});

describe('the listening page', () => {
  const rows = () =>
    within(screen.getByRole('list', { name: 'Upptökur' }))
      .getAllByRole('listitem')
      .map((li) => li.querySelector('span[lang="is"]')!.textContent);

  it('plays every recording, drafts too, the recogniser’s doubts first', async () => {
    const { container } = renderAt('/yfirferd/hljod');
    expect(rows()).toEqual(['les', 'feldur', 'bók', 'Hún/Hann er ___.']);
    expect(screen.getByText('(merkt röng)')).toBeDefined();
    // What the voice was told to say, where the card prints something else.
    expect(screen.getByText('„Hún eða Hann er ….“')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Hlusta: les' })).toBeDefined();
    expect(screen.getByText('Talgreinir heyrði: „e“')).toBeDefined();
    expect(screen.getByText(/Manneskja, „Athafnir“ og 1 í viðbót/)).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('filters by card, by doubt and by what I have not marked', () => {
    renderAt('/yfirferd/hljod?flokkur=skolinn');
    expect(rows()).toEqual(['bók', 'Hún/Hann er ___.']);
    // A clip on several cards is placed on the card being reviewed.
    expect(screen.getByText(/^Skólinn A1, setningarammi og 1 í viðbót$/)).toBeDefined();
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
    expect(rows()).toEqual(['les', 'bók', 'Hún/Hann er ___.']);
    // A recording marked during the pass stays, so what is wrong with it can be said.
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Mat: les' })).getByRole('button', {
        name: 'Rangt',
      })
    );
    expect(rows()).toEqual(['les', 'bók', 'Hún/Hann er ___.']);
    expect(document.activeElement).toBe(screen.getByLabelText('Hvað er rangt? „les“'));
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
    const at = expect.any(String);
    expect(stored()).toEqual({
      les: { verdict: 'wrong', v: 'vb', at, note: 'heyrist sem „e“' },
      feldur: { verdict: 'right', v: 'va', at },
    });
    expect(mat('feldur').getByRole('button', { name: 'Rétt' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    // A second press takes it back, and the file says so, so it withdraws one sent earlier.
    fireEvent.click(mat('feldur').getByRole('button', { name: 'Rétt' }));
    expect(stored().feldur).toEqual({ verdict: null, v: 'va', at });
    const review = { reviewer: '', notes: {}, clips: stored() };
    expect(reviewFile(review, '2026-10-17').clips).toContainEqual({
      text: 'feldur',
      verdict: 'withdrawn',
      v: 'va',
      at,
    });
    const text = reviewText(review, '2026-10-17');
    expect(text).toContain('Röng: „les“ — heyrist sem „e“');
    // One takes the singular.
    expect(text).toContain('Upptökur: 0 réttar, 1 röng');
    // Heard as right after all: what was wrong goes with the old verdict.
    fireEvent.click(mat('les').getByRole('button', { name: 'Rétt' }));
    expect(stored().les).toEqual({ verdict: 'right', v: 'vb', at });
  });

  it('keeps a recording cleared since the filter went on out of the hidden ones', () => {
    window.localStorage.setItem(
      'islenskubraut-yfirferd',
      JSON.stringify({
        reviewer: '',
        notes: {},
        clips: { feldur: { verdict: 'right', v: 'va', at: '2026-10-17T10:00:00.000Z' } },
      })
    );
    renderAt('/yfirferd/hljod?ometnar');
    expect(rows()).toEqual(['les', 'bók', 'Hún/Hann er ___.']);
    act(() => {
      window.localStorage.setItem(
        'islenskubraut-yfirferd',
        JSON.stringify({ reviewer: '', notes: {}, clips: {} })
      );
      window.dispatchEvent(new StorageEvent('storage', { key: 'islenskubraut-yfirferd' }));
    });
    expect(rows()).toEqual(['les', 'feldur', 'bók', 'Hún/Hann er ___.']);
  });

  it('asks again about a recording made again since it was marked', () => {
    window.localStorage.setItem(
      'islenskubraut-yfirferd',
      JSON.stringify({ reviewer: '', notes: {}, clips: { les: { verdict: 'right', v: 'gamalt' } } })
    );
    renderAt('/yfirferd/hljod');
    const mat = within(screen.getByRole('group', { name: 'Mat: les' }));
    expect(mat.getByRole('button', { name: 'Rétt' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText(/Upptakan hefur verið gerð aftur/)).toBeDefined();
    expect(screen.getByText(/Þú hefur metið 0 af 4/)).toBeDefined();
    // Not counted as a verdict, and named apart in the text sent, so it is not taken for current.
    expect(screen.getByText(/Réttar upptökur: 0/)).toBeDefined();
    const old = JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!);
    const text = reviewText(old, '2026-10-17');
    expect(text).not.toContain('Réttar: „les“');
    expect(text).toContain(
      'Metnar áður en upptakan var gerð aftur, eða ekki lengur á spjöldunum: „les“'
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
