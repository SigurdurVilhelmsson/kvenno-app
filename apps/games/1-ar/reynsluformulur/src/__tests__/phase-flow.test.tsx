import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * Kanna ends on "Áfram í Skilja" and Skilja on "Áfram í Æfa", and both used to
 * drop the student back on the menu instead — the button named a place it did
 * not go. `1-ar/utfellingarhvorf` had the same defect and the same fix. Each
 * now records the phase as done and opens the one it names.
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
    fireEvent.click(ui.getByRole('button', { name: 'Áfram í Skilja' }));

    expect(ui.getByRole('heading', { name: 'Skilja — fjórar súlur' })).toBeTruthy();

    for (let i = 0; i < 3; i++) fireEvent.click(ui.getByRole('button', { name: 'Næsta súla' }));
    fireEvent.click(ui.getByRole('button', { name: 'Áfram í Æfa' }));

    expect(ui.getByRole('heading', { name: 'Æfa' })).toBeTruthy();

    fireEvent.click(ui.getByRole('button', { name: 'Til baka' }));
    expect(ui.getAllByText('Lokið')).toHaveLength(2);
    unmount();
  });
});
