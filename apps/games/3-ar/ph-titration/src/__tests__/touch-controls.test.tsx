// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { revealTop } from '../utils/reveal';

// The mobile pass changed how Level 2 is driven by touch: the hold-to-pour
// button moved from mouse + touch handlers (with no touchcancel, so a hold the
// browser cancelled poured on to 60 mL) to pointer events, and the marking
// step gained ±0,1 mL nudges because a finger cannot place a range thumb to
// 0.1 mL. These drive the real component.

// InteractiveGraph draws to a canvas and both graphs watch their size; jsdom
// implements neither.
beforeAll(() => {
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

function renderLevel2() {
  const view = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
  const volume = () =>
    Number(view.container.querySelector('[role=meter]')!.getAttribute('aria-valuenow'));
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
});

describe('ph-titration level 2 marking nudges', () => {
  function startMarking() {
    renderLevel2();
    const add5 = screen.getByRole('button', { name: 'Bæta við 5 mL títrants' });
    fireEvent.click(add5);
    fireEvent.click(add5);
    // 10 mL poured; the marker starts at half the poured volume.
    fireEvent.click(screen.getByRole('button', { name: /merkja jafngildispunkt/ }));
    return {
      up: screen.getByRole('button', { name: 'Auka um 0,1 mL' }),
      down: screen.getByRole('button', { name: 'Minnka um 0,1 mL' }),
      slider: () => (screen.getByRole('slider') as HTMLInputElement).value,
    };
  }

  it('moves the marked volume by 0.1 mL each tap', () => {
    const { up, down, slider } = startMarking();
    expect(slider()).toBe('5');

    fireEvent.click(up);
    fireEvent.click(up);
    expect(slider()).toBe('5.2');
    expect(screen.getByRole('button', { name: /Staðfesta: 5,2 mL/ })).toBeTruthy();

    fireEvent.click(down);
    fireEvent.click(down);
    fireEvent.click(down);
    expect(slider()).toBe('4.9');
  });

  it('stays within zero and the volume actually poured', () => {
    const { up, down, slider } = startMarking();
    for (let i = 0; i < 80; i++) fireEvent.click(up);
    expect(slider()).toBe('10');
    for (let i = 0; i < 150; i++) fireEvent.click(down);
    expect(slider()).toBe('0');
  });
});

describe('ph-titration level 2 indicator step on a phone', () => {
  // Below lg the indicator list is stacked under the apparatus. The marking
  // panel above it takes 250 ms to leave, and scrolling before it had gone
  // left the top of the list 200-300 px above the screen.
  const realRect = HTMLElement.prototype.getBoundingClientRect;
  let scrolled: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.matchMedia = ((media: string) => ({
      matches: false,
      media,
      addEventListener() {},
      removeEventListener() {},
    })) as never;
    scrolled = vi.fn();
    Element.prototype.scrollIntoView = scrolled as never;
  });

  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    HTMLElement.prototype.getBoundingClientRect = realRect;
  });

  function confirmMarkedVolume() {
    renderLevel2();
    const add5 = screen.getByRole('button', { name: 'Bæta við 5 mL títrants' });
    fireEvent.click(add5);
    fireEvent.click(add5);
    fireEvent.click(screen.getByRole('button', { name: /merkja jafngildispunkt/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Staðfesta: / }));
  }

  it('scrolls the list to its top only once the marking panel has gone', () => {
    vi.useFakeTimers();
    confirmMarkedVolume();

    act(() => vi.advanceTimersByTime(250));
    expect(scrolled).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(100));
    expect(scrolled).toHaveBeenCalledTimes(1);
    expect(scrolled).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
    expect((scrolled.mock.contexts[0] as HTMLElement).textContent).toContain('Veldu vísi');
  });

  it('brings the confirm button up when it appears below the screen', () => {
    vi.useFakeTimers();
    confirmMarkedVolume();
    act(() => vi.advanceTimersByTime(400));
    scrolled.mockClear();

    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1950, bottom: 2000 }) as DOMRect;
    fireEvent.click(screen.getByRole('button', { name: /Fenólftaleín/ }));
    act(() => vi.advanceTimersByTime(50));

    expect(scrolled).toHaveBeenCalledTimes(1);
    expect(scrolled).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
    expect((scrolled.mock.contexts[0] as HTMLElement).textContent).toContain('Staðfesta val');
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

describe('revealTop', () => {
  function elementAt(top: number) {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ top }) as DOMRect;
    el.scrollIntoView = vi.fn();
    return el;
  }

  it('scrolls an element whose top has gone above the viewport back into view', () => {
    const el = elementAt(-400);
    revealTop(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
  });

  it('leaves the page alone when the top is already on screen', () => {
    const el = elementAt(12);
    revealTop(el);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });
});
