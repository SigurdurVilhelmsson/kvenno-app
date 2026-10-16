// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCategoryById } from '../data';
import { SmidurPage } from '../pages/SmidurPage';
import { SpjaldPage } from '../pages/SpjaldPage';

expect.extend(toHaveNoViolations);

vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/smidur/:flokkur" element={<SmidurPage />} />
        <Route path="/spjald/:flokkur" element={<SpjaldPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const choose = (group: string, name: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: group })).getByRole('button', { name }));
const sentence = () => screen.getByTestId('smidur-setning');
const marked = () => [...sentence().querySelectorAll('mark')].map((m) => m.textContent);

describe('the sentence builder page', () => {
  it('agrees the pronoun, the verb and the adjective with a plural subject', () => {
    renderAt('/smidur/klaednadur');
    choose('Hvers konar klæðnaður er þetta?', 'buxur');
    choose('Veldu setningaramma', 'Það er ___.');
    choose('Hvernig lítur það út?', 'rautt');
    expect(sentence().textContent).toBe('Þær eru rauðar.');
    expect(marked()).toEqual(['Þær', 'eru', 'rauðar.']);
    expect(screen.getByText(/buxur/, { selector: 'span' }).parentElement?.textContent).toMatch(
      /kvenkyn, fleirtala/
    );
  });

  it('names the subject in the verb’s number, and changes nothing that the card already says', () => {
    renderAt('/smidur/klaednadur');
    choose('Hvers konar klæðnaður er þetta?', 'skór');
    expect(sentence().textContent).toBe('Þetta eru skór.');
    expect(marked()).toEqual(['eru']);
    choose('Hvers konar klæðnaður er þetta?', 'bolur');
    expect(sentence().textContent).toBe('Þetta er bolur.');
    expect(marked()).toEqual([]);
  });

  it('puts a noun after hefur in the accusative, with a fixed subject and no subject step', () => {
    renderAt('/smidur/dyr');
    expect(screen.queryByRole('group', { name: /Um hvern/ })).toBeNull();
    choose('Veldu setningaramma', 'Það hefur ___.');
    choose('Hvernig lítur það út?', 'feldur');
    expect(sentence().textContent).toBe('Það hefur feld.');
    expect(marked()).toEqual(['feld.']);
  });

  // REVIEW-QUEUE C9: one does not `borða` a drink, so that frame is not offered for one.
  it('offers only the frames that fit the subject, and moves off one that does not', () => {
    renderAt('/smidur/matur');
    const frames = () =>
      within(screen.getByRole('group', { name: 'Veldu setningaramma' }))
        .getAllByRole('button')
        .map((b) => b.textContent);
    choose('Hvers konar matur er þetta?', 'ávöxtur');
    expect(frames()).toContain('Maður borðar það ___.');
    choose('Veldu setningaramma', 'Maður borðar það ___.');
    choose('Hvers konar matur er þetta?', 'drykkur');
    expect(frames()).not.toContain('Maður borðar það ___.');
    expect(
      within(screen.getByRole('group', { name: 'Veldu setningaramma' }))
        .getByRole('button', { name: 'Þetta er ___.' })
        .getAttribute('aria-pressed')
    ).toBe('true');
    expect(sentence().textContent).toBe('Þetta er drykkur.');
  });

  it('agrees þögult with the vehicle while hátt stays as written', () => {
    renderAt('/smidur/farartaeki');
    choose('Hvers konar farartæki er þetta?', 'rúta');
    choose('Veldu setningaramma', 'Það hljómar ___.');
    choose('Hvaða hljóð gefur það frá sér?', 'þögult');
    expect(sentence().textContent).toBe('Hún hljómar þögul.');
    choose('Hvaða hljóð gefur það frá sér?', 'hátt');
    expect(sentence().textContent).toBe('Hún hljómar hátt.');
  });

  it('lets the student choose hún or hann for a person', () => {
    renderAt('/smidur/manneskja');
    choose('Um hvern er setningin?', 'hann');
    choose('Veldu setningaramma', 'Hún/Hann er ___.');
    choose('Hvernig lítur hún/hann út?', 'ung/ungur');
    expect(sentence().textContent).toBe('Hann er ungur.');
    choose('Um hvern er setningin?', 'hún');
    expect(sentence().textContent).toBe('Hún er ung.');
  });

  it('shows the frame with its blank until a word is picked, and clears the word on a new frame', () => {
    renderAt('/smidur/matur');
    choose('Veldu setningaramma', 'Það er ___.');
    expect(screen.queryByTestId('smidur-setning')).toBeNull();
    choose('Hvernig bragðast það?', 'sætt');
    expect(sentence().textContent).toBe('Hann er sætur.');
    choose('Veldu setningaramma', 'Maður borðar það ___.');
    expect(screen.queryByTestId('smidur-setning')).toBeNull();
  });

  it('says the sentences are a draft until a teacher confirms them, and names BÍN', () => {
    renderAt('/smidur/dyr');
    expect(screen.getByRole('note').textContent).toMatch(/Drög/);
    expect(screen.getByText(/Beygingarlýsingu íslensks nútímamáls \(BÍN\)/)).toBeDefined();
  });

  it('says so for a category with no builder', () => {
    renderAt('/smidur/ekki-til');
    expect(screen.getByRole('heading', { name: 'Setningasmiður fannst ekki' })).toBeDefined();
  });

  it('has no axe violations', async () => {
    const { container } = renderAt('/smidur/klaednadur');
    choose('Hvers konar klæðnaður er þetta?', 'buxur');
    choose('Veldu setningaramma', 'Það er ___.');
    choose('Hvernig lítur það út?', 'rautt');
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('the card page links the builder only once a teacher has confirmed it', () => {
  const dyr = getCategoryById('dyr')!;
  afterEach(() => {
    dyr.builder![0].confirmed = false;
  });

  it('shows no link while the A1 tags are unconfirmed', () => {
    renderAt('/spjald/dyr?stig=A1');
    expect(screen.queryByRole('link', { name: 'Setningasmiður' })).toBeNull();
  });

  it('links from A1 once confirmed, and not from a level with no builder', () => {
    dyr.builder![0].confirmed = true;
    renderAt('/spjald/dyr?stig=A1');
    expect(screen.getByRole('link', { name: 'Setningasmiður' }).getAttribute('href')).toBe(
      '/smidur/dyr'
    );
    renderAt('/spjald/dyr?stig=B1');
    expect(screen.getAllByRole('link', { name: 'Setningasmiður' })).toHaveLength(1);
  });
});
