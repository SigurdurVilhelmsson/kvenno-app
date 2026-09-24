import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * On a phone "Athuga Svar" and "Næsta spurning" sit far down a long page. The next
 * screen used to open at the same scroll offset, so a student who submitted landed in
 * the middle of the worked solution with the ✅/❌ verdict above the screen. Each screen
 * now opens at its top — and a page that was never scrolled is left alone.
 */
describe('each screen opens at its top', () => {
  const scrollTo = vi.fn();
  let scrollY = 0;

  beforeEach(() => {
    localStorage.clear();
    scrollTo.mockClear();
    scrollY = 0;
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);
    vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo as unknown as typeof window.scrollTo);
    // jsdom has no canvas; the particle simulation copes with a missing context.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to the top when a question opens, when feedback opens, and on the next question', () => {
    render(<App />);

    scrollY = 900;
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0 });

    scrollTo.mockClear();
    scrollY = 1100;
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: '999999' } });
    fireEvent.click(screen.getByRole('button', { name: /Athuga Svar/ }));
    expect(screen.getByText('Skref fyrir skref lausn:')).toBeTruthy();
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0 });

    scrollTo.mockClear();
    scrollY = 1300;
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0 });
  });

  it('does not scroll a page that is already at the top', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    act(() => {});
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
