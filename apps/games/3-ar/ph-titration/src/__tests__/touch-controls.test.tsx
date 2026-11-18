// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { stockMolarity } from './level2-driver';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

// The mobile pass changed how Level 2 is driven by touch: the hold-to-pour
// button moved from mouse + touch handlers (with no touchcancel, so a hold the
// browser cancelled poured on to 60 mL) to pointer events. These drive the
// real component.

// InteractiveGraph draws to a canvas and both graphs watch their size; jsdom
// implements neither.
beforeAll(() => {
  // Wider than a phone the level scrolls too (the bench, the result), and jsdom has no
  // scrollBy.
  window.scrollBy = (() => {}) as never;
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** Renders Stig 2 with the litvísir chosen, so the pour controls are out. */
function renderLevel2() {
  const view = render(
    <Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />
  );
  fireEvent.click(screen.getByRole('button', { name: /^Fenólftalín/ }));
  fireEvent.click(screen.getByRole('button', { name: /Staðfesta val/ }));
  const volume = () =>
    Number(view.container.querySelector('[data-burette-ml]')!.getAttribute('data-burette-ml'));
  return { volume };
}

describe('ph-titration level 2 hold-to-pour', () => {
  it('pours while the pointer is down and stops when it is released', () => {
    vi.useFakeTimers();
    const { volume } = renderLevel2();
    const hold = screen.getByRole('button', { name: /Halda inni/ });

    fireEvent.pointerDown(hold);
    act(() => vi.advanceTimersByTime(1000));
    const poured = volume();
    expect(poured).toBeGreaterThan(1);

    fireEvent.pointerUp(hold);
    act(() => vi.advanceTimersByTime(1000));
    expect(volume()).toBe(poured);
  });

  it('stops pouring when the browser cancels the touch', () => {
    vi.useFakeTimers();
    const { volume } = renderLevel2();
    const hold = screen.getByRole('button', { name: /Halda inni/ });

    fireEvent.pointerDown(hold);
    act(() => vi.advanceTimersByTime(500));
    // A scroll or a long-press menu cancels a touch without ever ending it.
    fireEvent.pointerCancel(hold);
    const poured = volume();
    act(() => vi.advanceTimersByTime(2000));
    expect(volume()).toBe(poured);
    expect(poured).toBeLessThan(60);
  });

  it('pours nothing before the litvísir is in', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);
    expect(screen.queryByRole('button', { name: /Halda inni/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Bæta við/ })).toBeNull();
    expect(
      (screen.getByRole('button', { name: /Staðfesta val/ }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
});

describe('ph-titration level 2 indicator step on a phone', () => {
  // At 320 px and in landscape the list of litvísar is taller than the
  // screen, so "Staðfesta val" under it is brought up once one is picked. The
  // scroll goes through the shared helper (`@shared/utils`), which moves the
  // page with window.scrollBy.
  const realRect = HTMLElement.prototype.getBoundingClientRect;
  const realScrollBy = window.scrollBy;
  let scrolled: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // A phone: every query matches except reduced motion.
    window.matchMedia = ((media: string) => ({
      matches: !media.includes('reduce'),
      media,
      addEventListener() {},
      removeEventListener() {},
    })) as never;
    scrolled = vi.fn();
    window.scrollBy = scrolled as never;
  });

  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
    HTMLElement.prototype.getBoundingClientRect = realRect;
    window.scrollBy = realScrollBy;
  });

  it('brings the confirm button up when it is below the screen', () => {
    vi.useFakeTimers();
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);
    act(() => vi.advanceTimersByTime(400));
    scrolled.mockClear();

    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1950, bottom: 2000 }) as DOMRect;
    fireEvent.click(screen.getByRole('button', { name: /^Fenólftalín/ }));
    act(() => vi.advanceTimersByTime(100));

    expect(scrolled).toHaveBeenCalled();
  });
});

describe('ph-titration level 3 answer field', () => {
  it('opens the decimal keypad and reads the Icelandic decimal comma', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const field = screen.getByLabelText(/Svar/) as HTMLInputElement;
    expect(field.type).toBe('text');
    expect(field.inputMode).toBe('decimal');

    // Challenge 1's answer is 0.13 M.
    fireEvent.change(field, { target: { value: '0,13' } });
    fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
    expect(screen.getByText(/✓ Rétt!/)).toBeTruthy();
  });
});
