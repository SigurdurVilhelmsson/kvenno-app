// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FadePresence, Presence } from '../Transition';
import { usePresenceExiting } from '../Transition/Transition';

// Presence and FadePresence keep their children mounted for `exitDuration` ms
// after `show` goes false, so the fade-out has something to animate. The
// children used to stay fully interactive for all of that time.
// buffer-recipe-creator found it: a quick second tap on a submit button that was
// already fading out re-awarded the puzzle. Games hide a submit button with
// Presence all over Year 3, so the fix belongs here, not in each game.
//
// jsdom implements neither `inert` nor hit-testing, so these assert the
// attribute and class a browser acts on. A real browser then refuses the tap.

const variants = [
  ['Presence', Presence],
  ['FadePresence', FadePresence],
] as const;

function wrapperOf(el: HTMLElement): HTMLElement {
  // The transition wrapper is the button's direct parent in these renders.
  return el.parentElement as HTMLElement;
}

describe.each(variants)('%s', (_name, Component) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  function ui(show: boolean) {
    return (
      <Component show={show} exitDuration={250}>
        <button type="button">Athuga</button>
      </Component>
    );
  }

  it('leaves shown content interactive', () => {
    render(ui(true));
    act(() => {
      vi.runAllTimers();
    });

    const wrapper = wrapperOf(screen.getByRole('button', { name: 'Athuga' }));
    expect(wrapper.hasAttribute('inert')).toBe(false);
    expect(wrapper.className).not.toContain('pointer-events-none');
  });

  it('makes exiting content inert for the whole exit, then unmounts it', () => {
    const { rerender } = render(ui(true));
    act(() => {
      vi.runAllTimers();
    });

    rerender(ui(false));

    // Still in the DOM so the fade can run, but no longer tappable or focusable.
    const button = screen.getByRole('button', { name: 'Athuga' });
    expect(wrapperOf(button).hasAttribute('inert')).toBe(true);
    expect(wrapperOf(button).className).toContain('pointer-events-none');

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(wrapperOf(screen.getByRole('button', { name: 'Athuga' })).hasAttribute('inert')).toBe(
      true
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole('button', { name: 'Athuga' })).toBeNull();
  });

  it('is interactive again at once when shown again mid-exit', () => {
    const { rerender } = render(ui(true));
    act(() => {
      vi.runAllTimers();
    });
    rerender(ui(false));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender(ui(true));

    // Keyed on `show`, not on the fade: no frame of dead content while it fades back in.
    const wrapper = wrapperOf(screen.getByRole('button', { name: 'Athuga' }));
    expect(wrapper.hasAttribute('inert')).toBe(false);
    expect(wrapper.className).not.toContain('pointer-events-none');
  });

  it('tells the content inside whether it is being faded out', () => {
    // HintSystem reads this to drop its revealed tiers at once when its own
    // Presence swaps it out, rather than stacking them above what replaces it.
    function Probe() {
      return <span data-testid="probe">{usePresenceExiting() ? 'fer' : 'er'}</span>;
    }
    const probeUi = (show: boolean) => (
      <Component show={show} exitDuration={250}>
        <Probe />
      </Component>
    );
    const { rerender } = render(probeUi(true));
    expect(screen.getByTestId('probe').textContent).toBe('er');

    rerender(probeUi(false));
    expect(screen.getByTestId('probe').textContent).toBe('fer');

    rerender(probeUi(true));
    expect(screen.getByTestId('probe').textContent).toBe('er');
  });

  it('makes entering content interactive before its fade-in finishes', () => {
    render(ui(true));

    // No animation frames have run, so the content is still at opacity 0.
    const wrapper = wrapperOf(screen.getByRole('button', { name: 'Athuga' }));
    expect(wrapper.className).toContain('opacity-0');
    expect(wrapper.hasAttribute('inert')).toBe(false);
  });
});
