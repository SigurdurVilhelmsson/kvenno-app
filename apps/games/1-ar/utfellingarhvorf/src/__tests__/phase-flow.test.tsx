import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * Kanna ends on "Áfram í Skilja" and Skilja on "Áfram í Æfa", and both used to
 * drop the student back on the menu instead — the button named a place it did
 * not go. `1-ar/lausnir` had the same defect on "Áfram í Stig 2 →". Each now
 * records the phase as done and opens the one it names.
 */

beforeEach(() => {
  localStorage.clear();
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the "Áfram í …" buttons go where they say', () => {
  it('Kanna → Skilja → Æfa, each marked done on the menu', () => {
    const { container, unmount } = render(<App />);
    const ui = within(container);

    fireEvent.click(ui.getByRole('button', { name: /Kanna/ }));
    // The first pair precipitates; NaCl + KNO₃ does not. Seeing both unlocks
    // the button.
    fireEvent.click(ui.getByRole('button', { name: 'Helltu saman' }));
    fireEvent.click(ui.getByRole('button', { name: 'NaCl + KNO₃' }));
    fireEvent.click(ui.getByRole('button', { name: 'Helltu saman' }));
    fireEvent.click(ui.getByRole('button', { name: 'Áfram í Skilja' }));

    expect(ui.getByRole('heading', { name: 'Skilja — þrjár jöfnur, ein saga' })).toBeTruthy();

    fireEvent.click(ui.getByRole('button', { name: 'Næsta skref' }));
    fireEvent.click(ui.getByRole('button', { name: 'Næsta skref' }));
    fireEvent.click(ui.getByRole('button', { name: 'Áfram í Æfa' }));

    expect(ui.getByRole('heading', { name: 'Æfa — leysanlegt eða ekki?' })).toBeTruthy();

    fireEvent.click(ui.getByRole('button', { name: 'Til baka' }));
    expect(ui.getAllByText('Lokið')).toHaveLength(2);
    unmount();
  }, 30_000);
});

describe('the menu text', () => {
  it('agrees the verb with the plural in "tvær þeirra"', () => {
    // In an Icelandic cleft the verb agrees with the focus: "það eru tvær",
    // never "það er tvær".
    const { container, unmount } = render(<App />);
    const text = container.textContent ?? '';
    expect(text).toContain('oft eru það aðeins tvær þeirra');
    expect(text).not.toContain('er það aðeins tvær');
    unmount();
  });
});
