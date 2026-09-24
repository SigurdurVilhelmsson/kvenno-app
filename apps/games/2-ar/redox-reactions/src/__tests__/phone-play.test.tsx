// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import { clockPastNextGuard } from './next-guard-clock';
import { ElectrochemicalCell, cellLabelSize } from '../components/ElectrochemicalCell';
import { Level1 } from '../components/Level1';
import { Level3 } from '../components/Level3';

/**
 * Phone play of the redox game. jsdom has no layout, so these hold the mechanics behind the
 * phone fixes rather than the pixels: the keyboards the answer fields ask for, the verdict
 * scrolling into view in Stig 3, and the galvanic-cell labels that must not shrink with the
 * diagram. Queries are scoped to the rendered container (vitest `retry: 2`, no RTL cleanup).
 */
const t = (key: string, fallback?: string) => fallback ?? key;

clockPastNextGuard();

describe('answer fields ask for the right phone keyboard', () => {
  it('Stig 1 keeps a plain number field, so the keyboard still offers a minus sign', () => {
    const { container } = render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    // Six rules, then the practice screen.
    for (let i = 0; i < 5; i++) fireEvent.click(view.getByRole('button', { name: /Næsta/ }));
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    const field = view.getByRole('spinbutton', { name: 'Oxunartala' });
    expect(field.getAttribute('type')).toBe('number');
    // inputmode="numeric" is the digits-only pad on iOS, with no minus key: -1, -2 and -3
    // are answers here, so the field must not ask for it.
    expect(field.hasAttribute('inputmode')).toBe(false);
  });

  it('Stig 3 asks for digits on the counts and keeps autocorrect off the element symbols', () => {
    const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    for (const label of ['Hvað oxast?', 'Hvað afoxast?']) {
      const symbol = view.getByLabelText(label);
      expect(symbol.getAttribute('autocorrect')).toBe('off');
      expect(symbol.getAttribute('spellcheck')).toBe('false');
      expect(symbol.getAttribute('autocomplete')).toBe('off');
    }

    fireEvent.change(view.getByLabelText('Hvað oxast?'), { target: { value: 'Zn' } });
    fireEvent.change(view.getByLabelText('Hvað afoxast?'), { target: { value: 'Cu' } });
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));

    // Electrons lost and electrons gained are whole positive counts.
    const count = view.getByRole('spinbutton');
    expect(count.getAttribute('type')).toBe('number');
    expect(count.getAttribute('inputmode')).toBe('numeric');
  });
});

describe('Stig 3 verdict', () => {
  /**
   * The verdict and its "Næsta" button land below the answer fields. After Enter on a phone
   * keyboard (which stays open) they sit under it, so they are brought into view through the
   * shared helper in `@shared/utils`: on a phone together with the step they answer when that
   * fits, and focus moves to the verdict, not to Næsta, so a second Enter lands on nothing.
   * This used `scrollIntoView({ block: 'nearest' })` at every width before the shared helper
   * existed, so a desktop window still gets the least move that shows the verdict and Næsta,
   * flush with the edge (`anyWidth`, `gap: 0`).
   *
   * jsdom has no layout, so every box is stubbed: the viewport is 640 px tall, and every
   * element reports the same box, 400 px down and 500 px tall.
   */
  let top = 400;
  let phone = true;
  const scrollBy = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    top = 400;
    phone = true;
    scrollBy.mockClear();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === PHONE_QUERY && phone,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    Object.defineProperty(window, 'innerHeight', { value: 640, configurable: true });
    Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          top,
          bottom: top + 500,
          left: 0,
          right: 300,
          width: 300,
          height: 500,
          x: 0,
          y: top,
          toJSON: () => ({}),
        }) as DOMRect
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (window as Partial<Window>).matchMedia;
  });

  /** Opens Stig 3 and commits the identify step with Enter, as a phone keyboard does. */
  function commitIdentify() {
    const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    fireEvent.change(view.getByLabelText('Hvað oxast?'), { target: { value: 'Xx' } });
    fireEvent.change(view.getByLabelText('Hvað afoxast?'), { target: { value: 'Yy' } });
    expect(scrollBy).not.toHaveBeenCalled();
    fireEvent.keyDown(view.getByLabelText('Hvað afoxast?'), { key: 'Enter' });
    // The frame the reveal waits for, so the verdict has painted.
    act(() => {
      vi.advanceTimersByTime(50);
    });
    return view;
  }

  it('on a phone brings the verdict and Næsta into view once, and not before', () => {
    const view = commitIdentify();
    // The step through Næsta ends at 900 in a 640 px viewport: its bottom goes to 8 px
    // above the edge.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 268, behavior: 'smooth' });

    // The next step's verdict scrolls again. Næsta ignores a press within 400 ms of appearing,
    // and this describe's fake clock stands still until it is moved.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));
    fireEvent.change(view.getByRole('spinbutton'), { target: { value: '2' } });
    fireEvent.keyDown(view.getByRole('spinbutton'), { key: 'Enter' });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(scrollBy).toHaveBeenCalledTimes(2);
  });

  it('still does so on desktop, as it did before the shared helper, flush with the edge', () => {
    phone = false;
    commitIdentify();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 260, behavior: 'smooth' });
  });

  it('does not move a verdict that is already on screen, on a phone or on desktop', () => {
    top = 60;
    commitIdentify();
    cleanup();
    phone = false;
    commitIdentify();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('moves focus to the verdict, not to Næsta or <body>', () => {
    const view = commitIdentify();
    const verdict = view.getByRole('group', { name: /oxast/ });
    expect(document.activeElement).toBe(verdict);
    expect(verdict.contains(view.getByRole('button', { name: /Halda áfram/ }))).toBe(false);
  });
});

describe('galvanic-cell labels on a narrow screen', () => {
  it('leaves desktop sizes alone at full width with a mouse', () => {
    for (const base of [9, 10, 12, 14]) expect(cellLabelSize(base, 1)).toBe(base);
  });

  it('grows labels in viewBox units so they still render at 12 px once the SVG shrinks', () => {
    // 360 px phone: the 400-unit diagram is drawn about 278 px wide.
    const scale = 278 / 400;
    for (const base of [9, 10, 12, 14]) {
      const size = cellLabelSize(base, scale);
      expect(size).toBeGreaterThanOrEqual(base);
      expect(size * scale).toBeGreaterThanOrEqual(12 - 1e-9);
    }
  });

  it('brings sub-12 labels up to 12 px on a touch screen even at full size', () => {
    expect(cellLabelSize(9, 1, true)).toBe(12);
    expect(cellLabelSize(10, 1, true)).toBe(12);
    expect(cellLabelSize(14, 1, true)).toBe(14);
  });

  it('never returns a size below the desktop one, whatever the measurement', () => {
    for (const scale of [0, -1, Number.NaN, 0.5, 2]) {
      expect(cellLabelSize(10, scale)).toBeGreaterThanOrEqual(10);
    }
  });

  it('draws the diagram to fit its container, capped at its desktop width', () => {
    const { container } = render(<ElectrochemicalCell />);
    const svg = container.querySelector('svg[role="img"]') as SVGSVGElement;
    expect(svg.getAttribute('class')).toContain('w-full');
    expect(svg.getAttribute('class')).toContain('h-auto');
    expect(svg.style.maxWidth).toBe('400px');
    expect(svg.getAttribute('viewBox')).toBe('0 0 400 250');
  });
});
