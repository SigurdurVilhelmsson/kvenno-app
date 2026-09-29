import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import App from '../App';

/**
 * On a phone "Athuga Svar" and "Næsta spurning" sit far down a long page. The next
 * screen used to open at the same scroll offset, so a student who submitted landed in
 * the middle of the worked solution with the ✅/❌ verdict above the screen. Each screen
 * now opens at its top, at every width as before — and a page that was never scrolled
 * is left alone. Focus follows the swap (design P3): the button that caused it has gone
 * with the old screen, and focus would otherwise fall to <body>.
 */
describe('each screen opens at its top', () => {
  let scrollY = 0;
  let scrollBy: MockInstance;
  let now: MockInstance<() => number>;

  beforeEach(() => {
    localStorage.clear();
    scrollY = 0;
    // The page's top edge sits scrollY above the viewport.
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockImplementation(
      () => ({ top: -scrollY, bottom: 0, left: 0, right: 0, width: 0, height: 0 }) as DOMRect
    );
    scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    // jsdom has no canvas; the particle simulation copes with a missing context.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    // Næsta drops a press within 400 ms of appearing (the double-tap guard); every
    // read of the clock here is half a second after the last.
    let t = 0;
    now = vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to the top when a question opens, when feedback opens, and on the next question', () => {
    render(<App />);

    scrollY = 900;
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -900, behavior: 'auto' });

    scrollBy.mockClear();
    scrollY = 1100;
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: '999999' } });
    fireEvent.click(screen.getByRole('button', { name: /Athuga Svar/ }));
    expect(screen.getByText('Skref fyrir skref lausn:')).toBeTruthy();
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -1100, behavior: 'auto' });

    scrollBy.mockClear();
    scrollY = 1300;
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -1300, behavior: 'auto' });
  });

  it('does not scroll a page that is already at the top', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    act(() => {});
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('moves focus to the question, the verdict, the next question and back to the level', () => {
    render(<App />);
    expect(document.activeElement).toBe(document.body);

    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    const question = document.querySelector('[data-item-start]');
    expect(question).not.toBeNull();
    expect(document.activeElement).toBe(question);

    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: '999999' } });
    fireEvent.click(screen.getByRole('button', { name: /Athuga Svar/ }));
    expect(document.activeElement).toBe(screen.getByRole('group', { name: /Ekki rétt/ }));

    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(document.activeElement).toBe(document.querySelector('[data-item-start]'));

    fireEvent.click(screen.getByRole('button', { name: /Valmynd/ }));
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /Stig 1 — Kjörgaslögmálið/, pressed: true })
    );
  });

  it('in the law step, moves focus to the law verdict, then to the answer card', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stig 2 — Sérstök tilvik/ }));
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    const question = document.querySelector('[data-item-start]');
    expect(question?.tagName).toBe('H4');
    expect(document.activeElement).toBe(question);

    // Stig 2 has no ideal-gas question, so this choice is always wrong.
    fireEvent.click(screen.getByRole('button', { name: /^Kjörgaslögmálið/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga lögmál' }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('group', { name: /^Ekki rétt/ }))
    );

    // "Sleppa" leaves the law step; focus goes to the answer card's heading, not the field.
    fireEvent.click(screen.getByRole('button', { name: /Sleppa/ }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: /^Finndu/ }))
    );
  });

  it('drops a press on Næsta within 400 ms of the feedback appearing', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: '999999' } });
    fireEvent.click(screen.getByRole('button', { name: /Athuga Svar/ }));

    // The clock stands still: the press arrives at the instant Næsta appeared.
    now.mockImplementation(() => 0);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(screen.getByText('Skref fyrir skref lausn:')).toBeTruthy();
  });
});
