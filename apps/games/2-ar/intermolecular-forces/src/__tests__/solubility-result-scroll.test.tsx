// @vitest-environment jsdom
import { act, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SolubilityPrediction } from '../components/SolubilityPrediction';

/**
 * The solubility tool reveals its verdict 1,5 s after the prediction, below the Já/Nei
 * buttons. On a 360×740 phone those buttons sit at the bottom of the screen when tapped, so
 * the verdict appeared entirely below the fold — the student saw only the rim of a beaker.
 * The result now scrolls itself into view ('nearest', so nothing moves when it is already
 * visible, as on desktop).
 *
 * jsdom has no scrollIntoView and no layout, so the call itself is what is asserted.
 * Queries are scoped to the rendered container (vitest `retry: 2`, no RTL auto-cleanup).
 */
describe('SolubilityPrediction result', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    scrollIntoView.mockClear();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  it('scrolls the verdict into view once it appears, and not before', () => {
    const { container } = render(<SolubilityPrediction />);
    const view = within(container);

    fireEvent.click(view.getByRole('button', { name: /NaCl/ }));
    fireEvent.click(view.getByRole('button', { name: /Vatn/ }));
    fireEvent.click(view.getByRole('button', { name: /Nei, leysist ekki/ }));
    expect(scrollIntoView).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const verdict = view.getByText('✗ Ekki rétt');
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
    // It is the result block that scrolls, and the verdict is inside it.
    const scrolled = scrollIntoView.mock.contexts[0] as Element;
    expect(scrolled.contains(verdict)).toBe(true);
  });
});
