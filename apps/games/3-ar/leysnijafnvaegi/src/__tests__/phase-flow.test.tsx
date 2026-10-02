// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * Kanna ends on "Áfram í Skilja" and Skilja on "Áfram í Æfa", and both used to
 * drop the student back on the menu instead — the button named a place it did
 * not go. `1-ar/reynsluformulur` and `1-ar/utfellingarhvorf` had the same defect
 * and the same fix. The phase screens are stood in for here, so the test is
 * about where each finish leads, not about playing the phases through.
 */

// Hoisted, because vi.mock factories run before the module body.
const { stub } = vi.hoisted(() => {
  type Props = { onComplete: () => void; onBack: () => void };
  const stub = (heading: string, finish: string) =>
    function Stub({ onComplete, onBack }: Props) {
      return (
        <main>
          <h2>{heading}</h2>
          <button onClick={onComplete}>{finish}</button>
          <button onClick={onBack}>Til baka</button>
        </main>
      );
    };
  return { stub };
});

vi.mock('../components/KannaScreen', () => ({
  KannaScreen: stub('Kanna-skjár', 'Áfram í Skilja'),
}));
vi.mock('../components/SkiljaScreen', () => ({
  SkiljaScreen: stub('Skilja-skjár', 'Áfram í Æfa'),
}));
vi.mock('../components/AefaScreen', () => ({ AefaScreen: stub('Æfa-skjár', 'Ljúka Æfa') }));
vi.mock('../components/BeitaScreen', () => ({ BeitaScreen: stub('Beita-skjár', 'Ljúka Beita') }));

beforeEach(() => {
  localStorage.clear();
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe('the "Áfram í …" buttons go where they say', () => {
  it('Kanna → Skilja → Æfa, each marked done on the menu', () => {
    const { container, unmount } = render(<App />);
    const ui = within(container);

    fireEvent.click(ui.getByRole('button', { name: /Kanna/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Áfram í Skilja' }));
    expect(ui.getByRole('heading', { name: 'Skilja-skjár' })).toBeTruthy();

    fireEvent.click(ui.getByRole('button', { name: 'Áfram í Æfa' }));
    expect(ui.getByRole('heading', { name: 'Æfa-skjár' })).toBeTruthy();

    fireEvent.click(ui.getByRole('button', { name: 'Til baka' }));
    expect(ui.getAllByText('Lokið')).toHaveLength(2);
    unmount();
  });

  it('Æfa and Beita still finish on the menu', () => {
    const { container, unmount } = render(<App />);
    const ui = within(container);

    fireEvent.click(ui.getByRole('button', { name: /Æfa/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka Æfa' }));
    fireEvent.click(ui.getByRole('button', { name: /Beita/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka Beita' }));
    expect(ui.getAllByText('Lokið')).toHaveLength(2);
    unmount();
  });
});
