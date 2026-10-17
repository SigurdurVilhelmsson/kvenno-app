// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { versionOf } from '../components/Hlusta';
import { categories } from '../data';
import { Yfirferd } from '../pages/Yfirferd';
import { YfirferdHljod } from '../pages/YfirferdHljod';
import { fileName, reviewFile, reviewText } from '../yfirferd/store';

expect.extend(toHaveNoViolations);

/** The audio this page knows for `les` (the mocks below), and bytes that hash to it. */
const V_LES = '787c798e39a5';
const LES_BYTES = new Uint8Array([4, 5, 6]);

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
      // The version of the bytes [4, 5, 6], so a test can serve the audio this page knows.
      v: '787c798e39a5',
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
    feldur: { file: 'a.mp3', approved: true, v: 'va' },
    les: { file: 'b.mp3', approved: false, v: '787c798e39a5' },
    bók: { file: 'c.mp3', approved: false, v: 'vc' },
    'Hún/Hann er ___.': { file: 'd.mp3', approved: false, v: 'vd' },
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
    // The text a person reads, then the same review for the script, with the name to save it as.
    const text = reviewText(stored, '2026-10-17');
    expect(text).toMatch(
      /^Yfirferð á Íslenskubraut, 2026-10-17, Anna\n\nDýr — Hvað er þetta\?\nA2: lundi er ekki á bæ\.\n\nHér fyrir neðan er sama yfirferð[^\n]*\nVistist sem yfirferd-islenskubraut-2026-10-17-[^\n]*\.txt\n-----YFIRFERÐ, EKKI BREYTA-----\n/
    );
    // No line of the data an email might wrap.
    const data = text.slice(
      text.indexOf('BREYTA-----\n') + 12,
      text.indexOf('-----YFIRFERÐ LÝKUR')
    );
    expect(
      Math.max(
        ...data
          .trim()
          .split('\n')
          .map((l) => l.length)
      )
    ).toBeLessThanOrEqual(64);
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
      JSON.stringify({
        reviewer: 'Anna',
        id: 'onnu-vafri',
        notes: { 'dyr/spjald': 'x' },
        clips: {},
      })
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
    // The next person to use this browser is someone else, so they get an id of their own.
    expect(stored()).toEqual({ reviewer: '', id: expect.any(String), notes: {}, clips: {} });
    expect(stored().id).not.toBe('onnu-vafri');
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
      les: { verdict: 'wrong', v: V_LES, at, note: 'heyrist sem „e“' },
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
    expect(stored().les).toEqual({ verdict: 'right', v: V_LES, at });
  });

  it('gives a note its own time, so a file with it outweighs one sent before it was written', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-17T10:00:00Z'));
    renderAt('/yfirferd/hljod');
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Mat: les' })).getByRole('button', {
        name: 'Rangt',
      })
    );
    vi.setSystemTime(new Date('2026-10-17T10:05:00Z'));
    fireEvent.change(screen.getByLabelText('Hvað er rangt? „les“'), { target: { value: 'e' } });
    const les = JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!).clips.les;
    expect(les).toEqual({ verdict: 'wrong', v: V_LES, at: '2026-10-17T10:05:00.000Z', note: 'e' });
    vi.useRealTimers();
  });

  it('takes no verdict on a recording made again since the page was opened', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    // The server's file is not the one this page was built with (V_LES).
    const fetched = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
    renderAt('/yfirferd/hljod');
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: les' }));
    expect(await screen.findByText(/gerð aftur síðan þú opnaðir síðuna/)).toBeDefined();
    const rangt = within(screen.getByRole('group', { name: 'Mat: les' })).getByRole('button', {
      name: 'Rangt',
    });
    expect(rangt).toHaveProperty('disabled', true);
    fireEvent.click(rangt);
    expect(window.localStorage.getItem('islenskubraut-yfirferd')).toBeNull();
    // Rows whose audio is what the page knows are untouched.
    expect(
      within(screen.getByRole('group', { name: 'Mat: feldur' })).getByRole('button', {
        name: 'Rétt',
      })
    ).toHaveProperty('disabled', false);
    play.mockRestore();
    fetched.mockRestore();
  });

  it('asks for a recording by the version the page knows, and hashes what that address holds', async () => {
    const played: string[] = [];
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement
    ) {
      played.push(this.src);
      return Promise.resolve();
    });
    const fetched = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
    renderAt('/yfirferd/hljod');
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: les' }));
    await screen.findByText(/gerð aftur síðan þú opnaðir síðuna/);
    expect(played).toEqual([expect.stringMatching(/\/hljod\/b\.mp3\?v=787c798e39a5$/)]);
    expect(String(fetched.mock.calls[0][0])).toMatch(/\/hljod\/b\.mp3\?v=787c798e39a5$/);
    play.mockRestore();
    fetched.mockRestore();
  });

  it('takes no note either on a recording made again since the page was opened', async () => {
    const at = '2026-10-17T10:00:00.000Z';
    const before = JSON.stringify({
      reviewer: '',
      notes: {},
      clips: { les: { verdict: 'wrong', v: V_LES, at } },
    });
    window.localStorage.setItem('islenskubraut-yfirferd', before);
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const fetched = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
    renderAt('/yfirferd/hljod');
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: les' }));
    await screen.findByText(/gerð aftur síðan þú opnaðir síðuna/);
    const box = screen.getByLabelText('Hvað er rangt? „les“');
    expect(box).toHaveProperty('disabled', true);
    fireEvent.change(box, { target: { value: 'nýja upptakan' } });
    expect(window.localStorage.getItem('islenskubraut-yfirferd')).toBe(before);
    play.mockRestore();
    fetched.mockRestore();
  });

  it('keeps a verdict another tab gave newer audio from being overwritten here unheard', async () => {
    renderAt('/yfirferd/hljod');
    const newer = JSON.stringify({
      reviewer: '',
      id: 'x',
      notes: {},
      clips: { les: { verdict: 'wrong', v: 'vNYTT', at: '2026-10-17T10:00:00.000Z', note: 'e' } },
    });
    act(() => {
      window.localStorage.setItem('islenskubraut-yfirferd', newer);
      window.dispatchEvent(new StorageEvent('storage', { key: 'islenskubraut-yfirferd' }));
    });
    const rangt = within(screen.getByRole('group', { name: 'Mat: les' })).getByRole('button', {
      name: 'Rangt',
    });
    // Not played here yet, so this page cannot tell whose audio is the server's.
    expect(rangt).toHaveProperty('disabled', true);
    fireEvent.click(rangt);
    expect(window.localStorage.getItem('islenskubraut-yfirferd')).toBe(newer);
    // Played, and the server holds what this page knows: then it may be judged again here.
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const fetched = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(LES_BYTES));
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: les' }));
    await vi.waitFor(() => expect(rangt).toHaveProperty('disabled', false));
    expect(screen.queryByText(/gerð aftur síðan þú opnaðir síðuna/)).toBeNull();
    fireEvent.click(rangt);
    expect(
      JSON.parse(window.localStorage.getItem('islenskubraut-yfirferd')!).clips.les
    ).toMatchObject({ verdict: 'wrong', v: V_LES });
    play.mockRestore();
    fetched.mockRestore();
  });

  it('locks a row again when another tab judges other audio after it played here', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const fetched = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(LES_BYTES));
    renderAt('/yfirferd/hljod');
    const rett = within(screen.getByRole('group', { name: 'Mat: les' })).getByRole('button', {
      name: 'Rétt',
    });
    // Played here while the server still held what this page knows.
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: les' }));
    await vi.waitFor(() => expect(fetched).toHaveBeenCalled());
    await vi.waitFor(() => expect(rett).toHaveProperty('disabled', false));
    // Then the recording is made again, and a newer tab judges the new audio.
    const later = new Date(Date.now() + 60_000).toISOString();
    const newer = JSON.stringify({
      reviewer: '',
      id: 'x',
      notes: {},
      clips: { les: { verdict: 'wrong', v: 'vNYTT', at: later, note: 'segir „e“' } },
    });
    act(() => {
      window.localStorage.setItem('islenskubraut-yfirferd', newer);
      window.dispatchEvent(new StorageEvent('storage', { key: 'islenskubraut-yfirferd' }));
    });
    expect(rett).toHaveProperty('disabled', true);
    fireEvent.click(rett);
    expect(window.localStorage.getItem('islenskubraut-yfirferd')).toBe(newer);
    play.mockRestore();
    fetched.mockRestore();
  });

  it('takes no verdict while it is still checking what a play brought', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    let serve: (r: Response) => void = () => {};
    const fetched = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => new Promise<Response>((done) => (serve = done)));
    renderAt('/yfirferd/hljod');
    const rett = within(screen.getByRole('group', { name: 'Mat: les' })).getByRole('button', {
      name: 'Rétt',
    });
    expect(rett).toHaveProperty('disabled', false);
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: les' }));
    // The server may have sent other audio; until its hash is in, nothing is judged here.
    expect(rett).toHaveProperty('disabled', true);
    fireEvent.click(rett);
    expect(window.localStorage.getItem('islenskubraut-yfirferd')).toBeNull();
    await act(async () => serve(new Response(new Uint8Array([1, 2, 3]))));
    expect(await screen.findByText(/gerð aftur síðan þú opnaðir síðuna/)).toBeDefined();
    expect(rett).toHaveProperty('disabled', true);
    play.mockRestore();
    fetched.mockRestore();
  });

  it('hashes what it plays as the scripts hash a recording', async () => {
    const fetched = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
    // The same value scripts/islenskubraut/__tests__/hljod.test.ts holds clipVersion to.
    expect(await versionOf('/hljod/x.mp3')).toBe('039058c6f2c0');
    fetched.mockImplementation(async () => new Response('', { status: 404 }));
    expect(await versionOf('/hljod/x.mp3')).toBeUndefined();
    fetched.mockRestore();
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

describe('sending and keeping a review', () => {
  const KEY = 'islenskubraut-yfirferd';
  const at = '2026-10-17T10:00:00.000Z';

  it('writes nothing when a page opens: only a change made in this tab is written', () => {
    window.localStorage.setItem(KEY, JSON.stringify({ reviewer: 'Anna', notes: {}, clips: {} }));
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    renderAt('/yfirferd/hljod');
    expect(setItem.mock.calls.filter(([k]) => k === KEY)).toEqual([]);
    setItem.mockRestore();
  });

  it('gives this browser’s reviewer an id, kept with the review and put in every file', () => {
    renderAt('/yfirferd');
    fireEvent.change(screen.getByLabelText('Nafnið þitt'), { target: { value: 'Anna' } });
    const first = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(first.id).toMatch(/\S/);
    fireEvent.change(screen.getByLabelText('Athugasemd um Spjaldið, Dýr'), {
      target: { value: 'x' },
    });
    const second = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(second.id).toBe(first.id);
    expect(reviewFile(second, '2026-10-17').id).toBe(first.id);
  });

  it('keeps the id of the tab that wrote first, so two tabs are one reviewer', () => {
    renderAt('/yfirferd');
    act(() => {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ reviewer: 'Anna', id: 'hinn-flipinn', notes: {}, clips: {} })
      );
      window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
    });
    fireEvent.change(screen.getByLabelText('Athugasemd um Spjaldið, Dýr'), {
      target: { value: 'x' },
    });
    expect(JSON.parse(window.localStorage.getItem(KEY)!).id).toBe('hinn-flipinn');
  });

  it('names the file by the date and time, the name and the browser, so none share one', () => {
    const stamp = '2026-10-17T10:00:00.000Z';
    expect(fileName({ reviewer: 'Þóra Ösp', id: 'Ab-12cd-ef', notes: {}, clips: {} }, stamp)).toBe(
      'yfirferd-islenskubraut-2026-10-17-100000-thora-osp-ab12cd.json'
    );
    // Two downloads from one browser on one day: a later one need not hold all an earlier did.
    const anna = { reviewer: 'Anna', id: 'aaaaaa-1', notes: {}, clips: {} };
    expect(fileName(anna, stamp)).not.toBe(fileName(anna, '2026-10-17T14:30:00.000Z'));
    const a = fileName({ reviewer: 'Anna', id: 'aaaaaa-1', notes: {}, clips: {} }, stamp);
    const b = fileName({ reviewer: 'Anna', id: 'bbbbbb-2', notes: {}, clips: {} }, stamp);
    expect(a).not.toBe(b);
  });

  it('asks for a name before sending, since it says who sent each file and a ruling is given by it', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ reviewer: '', notes: { 'dyr/spjald': 'x' }, clips: {} })
    );
    renderAt('/yfirferd');
    const download = screen.getByRole('button', { name: 'Sækja skrá' });
    expect(download).toHaveProperty('disabled', true);
    const hint = screen.getByText(/Skrifaðu nafnið þitt áður en þú sendir/);
    // Read with the box it asks to be filled, not only with the buttons it disables.
    expect(screen.getByLabelText('Nafnið þitt').getAttribute('aria-describedby')).toBe(hint.id);
    fireEvent.change(screen.getByLabelText('Nafnið þitt'), { target: { value: 'Anna' } });
    expect(download).toHaveProperty('disabled', false);
  });

  it('can send a review that only takes a verdict back, and says so in the text', () => {
    const review = { reviewer: 'Anna', notes: {}, clips: { les: { verdict: null, v: V_LES, at } } };
    window.localStorage.setItem(KEY, JSON.stringify(review));
    renderAt('/yfirferd');
    expect(screen.getByRole('button', { name: 'Sækja skrá' })).toHaveProperty('disabled', false);
    expect(reviewText(review, '2026-10-17')).toContain('Dregið til baka: „les“');
  });

  it('keeps a recording marked again during the pass in view, with its note box', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        reviewer: '',
        notes: {},
        clips: { feldur: { verdict: 'right', v: 'va', at } },
      })
    );
    renderAt('/yfirferd/hljod?ometnar');
    act(() => {
      window.localStorage.setItem(KEY, JSON.stringify({ reviewer: '', notes: {}, clips: {} }));
      window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
    });
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Mat: feldur' })).getByRole('button', {
        name: 'Rangt',
      })
    );
    expect(screen.getByLabelText('Hvað er rangt? „feldur“')).toBeDefined();
  });

  it('keeps what was written about a recording through a verdict taken back by mistake', () => {
    renderAt('/yfirferd/hljod');
    const rangt = () =>
      within(screen.getByRole('group', { name: 'Mat: les' })).getByRole('button', {
        name: 'Rangt',
      });
    fireEvent.click(rangt());
    fireEvent.change(screen.getByLabelText('Hvað er rangt? „les“'), {
      target: { value: 'óskýrt' },
    });
    fireEvent.click(rangt());
    fireEvent.click(rangt());
    expect(screen.getByLabelText('Hvað er rangt? „les“')).toHaveProperty('value', 'óskýrt');
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
