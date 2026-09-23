// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { BufferCapacityVisualization } from '../components/BufferCapacityVisualization';
import Level1 from '../components/Level1';
import Level2 from '../components/Level2';
import Level3 from '../components/Level3';
import { revealNearest, revealTop } from '../utils/reveal';

/**
 * On a phone every screen in this game is taller than the viewport, and three
 * things went wrong because of it:
 *
 * - A level card is tapped from part-way down the menu, and the level opened at
 *   that same scroll offset — Stig 1 landed on its footer, with the task, the
 *   flask and the controls all above the screen. Stig 3's "Byrja" did the same.
 * - "Næsta verkefni" ends a long worked solution, so the next task rendered with
 *   its statement and given data already scrolled past.
 * - The buffer-capacity curve, a 320-unit drawing scaled into a phone column,
 *   drew its axis labels at 6-8 px.
 *
 * The scroll fixes must not move a screen that already fits, which is the
 * desktop case, and the compact curve must leave the desktop drawing untouched.
 *
 * Queries are scoped to the rendered container: the repo runs vitest with
 * `retry: 2`, so a failed attempt's DOM must not leak into the next one.
 */

function rectWithTop(top: number): DOMRect {
  return {
    top,
    bottom: top + 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

let top = 0;
const scrolled: Element[] = [];

beforeEach(() => {
  top = 0;
  scrolled.length = 0;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rectWithTop(top));
  // jsdom implements neither of these.
  Element.prototype.scrollIntoView = vi.fn(function (this: Element) {
    scrolled.push(this);
  });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** The newest of several same-named buttons: a step on its way out stays mounted briefly. */
function lastButton(container: HTMLElement, name: string | RegExp) {
  const all = within(container).getAllByRole('button', { name });
  return all[all.length - 1];
}

/** Fill the last `values.length` decimal fields, which belong to the step just entered. */
function fillLast(container: HTMLElement, values: string[]) {
  const fields = Array.from(container.querySelectorAll('input[inputmode="decimal"]'));
  const mine = fields.slice(fields.length - values.length);
  mine.forEach((field, i) => fireEvent.change(field, { target: { value: values[i] } }));
}

describe('revealTop', () => {
  it('scrolls only an element whose top has gone above the viewport', () => {
    const el = document.createElement('div');
    el.scrollIntoView = vi.fn();
    top = 0;
    expect(revealTop(el)).toBe(false);
    top = -300;
    expect(revealTop(el)).toBe(true);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
    expect(revealTop(null)).toBe(false);
  });
});

describe('revealNearest', () => {
  it('asks for the shortest scroll, and tolerates a missing element or method', () => {
    const el = document.createElement('div');
    el.scrollIntoView = vi.fn();
    revealNearest(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
    expect(() => revealNearest(null)).not.toThrow();
    const bare = document.createElement('div');
    Object.defineProperty(bare, 'scrollIntoView', { value: undefined });
    expect(() => revealNearest(bare)).not.toThrow();
  });
});

/** Let Presence mount a panel and the short reveal timers run. */
const settle = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The elements scrollIntoView was called on with `block: 'nearest'`. */
function nearestTargets(): Element[] {
  const mock = vi.mocked(Element.prototype.scrollIntoView);
  return mock.mock.calls
    .map((args, i) => ({ args, el: mock.mock.contexts[i] as Element }))
    .filter(({ args }) => (args[0] as ScrollIntoViewOptions | undefined)?.block === 'nearest')
    .map(({ el }) => el);
}

describe('Stig 1 feedback opens below "Athuga stuðpúða"', () => {
  it('is scrolled into view after each check', async () => {
    const { container } = render(<Level1 />);
    // Challenge 1 is at pKa: one extra acid molecule makes it wrong.
    fireEvent.click(within(container).getByRole('button', { name: 'Bæta við sýrusameind' }));
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));
    await settle(150);
    expect(nearestTargets()).toHaveLength(1);
    expect(nearestTargets()[0].textContent).toContain('Næstum rétt');

    fireEvent.click(within(container).getByRole('button', { name: 'Fjarlægja sýrusameind' }));
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));
    await settle(150);
    expect(nearestTargets()).toHaveLength(2);
    expect(nearestTargets()[1].textContent).toContain('Frábært');
  });

  it('is not revealed on the last challenge, which hands back to the menu', async () => {
    const onLevelComplete = vi.fn();
    const { container } = render(<Level1 onLevelComplete={onLevelComplete} />);
    const tap = (name: string, times = 1) => {
      for (let i = 0; i < times; i++) {
        fireEvent.click(within(container).getByRole('button', { name }));
      }
    };
    // Base molecules to add (+) or remove (−) from the 5 : 5 start of each challenge.
    const baseChange = [0, 4, -2, 0, 3, 0];
    baseChange.forEach((change, i) => {
      if (change > 0) tap('Bæta við basasameind', change);
      if (change < 0) tap('Fjarlægja basasameind', -change);
      tap('Athuga stuðpúða');
      if (i < baseChange.length - 1) tap('Næsta verkefni →');
    });
    expect(onLevelComplete).toHaveBeenCalledTimes(1);
    await settle(150);
    expect(nearestTargets()).toHaveLength(0);
  });
});

describe('opening a level starts at its top', () => {
  it('scrolls to the top when a level card is chosen, and not on first load', () => {
    const { container } = render(<App />);
    expect(window.scrollTo).not.toHaveBeenCalled();

    fireEvent.click(within(container).getByRole('button', { name: /Stig 2: Útreikningar/ }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
  });

  it('Stig 3 "Byrja" opens the first task at the top', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
  });
});

describe('"Næsta verkefni" brings the next task back into view', () => {
  it('Stig 1 reveals the challenge card, only when it is above the screen', () => {
    const { container } = render(<Level1 />);
    // Challenge 1 starts at 5 acid : 5 base, inside its 0,9–1,1 band.
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));

    // Card still on screen: nothing moves.
    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(scrolled).toHaveLength(0);
    expect(within(container).getByText('Verkefni #2')).toBeTruthy();

    // Solve challenge 2 (pH 5,00 at pKa 4,74 needs about 1,8 base per acid): 5 acid, 9 base.
    for (let i = 0; i < 4; i++) {
      fireEvent.click(within(container).getByRole('button', { name: 'Bæta við basasameind' }));
    }
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));

    top = -900;
    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(scrolled).toHaveLength(1);
    expect(scrolled[0].textContent).toContain('Verkefni #3');
  });

  it('Stig 2 reveals the level header after a finished puzzle', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['1,585']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['4,64', '8,70']);
    fireEvent.click(lastButton(container, 'Athuga svar'));

    top = -1200;
    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(scrolled).toHaveLength(1);
    expect(scrolled[0].textContent).toContain('Stuðpúðasmíði - Stig 2');
    expect(scrolled[0].textContent).toContain('2 / 5');
  });

  it('Stig 3 reveals the level header after a finished puzzle, and not when it is visible', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    fillLast(container, ['1,585']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['0,00387', '0,00613']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['7,76', '12,24']);
    fireEvent.click(lastButton(container, 'Athuga svar'));

    top = 0;
    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(scrolled).toHaveLength(0);
    expect(within(container).getByText('2 / 5')).toBeTruthy();
  });
});

describe('a finished puzzle shows "Rétt svar!"', () => {
  // Finishing hides the hint tiers above and, 250 ms later, the answered step; with the hints
  // open on a phone that carried the start of the worked solution above the screen.
  it('Stig 3 brings the step card back when its top has gone above the screen', async () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    fillLast(container, ['1,585']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['0,00387', '0,00613']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['7,76', '12,24']);
    top = -400;
    fireEvent.click(lastButton(container, 'Athuga svar'));
    expect(scrolled).toHaveLength(0);
    await settle(400);
    expect(scrolled).toHaveLength(1);
    expect(scrolled[0].textContent).toContain('Rétt svar!');
  });

  it('Stig 2 leaves a completion that is already on screen alone', async () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['1,585']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['4,64', '8,70']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    await settle(400);
    expect(scrolled).toHaveLength(0);
    expect(within(container).getByText('Rétt svar!')).toBeTruthy();
  });

  it('Stig 2 brings the step card back when its top has gone above the screen', async () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['1,585']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['4,64', '8,70']);
    top = -400;
    fireEvent.click(lastButton(container, 'Athuga svar'));
    await settle(400);
    expect(scrolled).toHaveLength(1);
    expect(scrolled[0].textContent).toContain('Rétt svar!');
  });
});

describe('the buffer-capacity curve on a narrow screen', () => {
  function renderCurve(width: number) {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
    const { container } = render(
      <BufferCapacityVisualization pKa={4.74} acidConc={0.05} baseConc={0.05} totalConc={0.1} />
    );
    const svg = container.querySelector('svg[role="img"]') as SVGSVGElement;
    const tick = within(svg as unknown as HTMLElement).getByText('3,7');
    return { svg, tick };
  }

  it('draws pixel for pixel with 12 px ticks when the column is narrow', () => {
    const { svg, tick } = renderCurve(260);
    expect(svg.getAttribute('viewBox')).toBe('0 0 260 194');
    expect(tick.getAttribute('font-size')).toBe('12');
  });

  it('scrolls the buffer-versus-water comparison into view when it opens', () => {
    const { container } = render(
      <BufferCapacityVisualization pKa={4.74} acidConc={0.05} baseConc={0.05} totalConc={0.1} />
    );
    fireEvent.click(
      within(container).getByRole('button', { name: 'Bæta við 0,01 M sterkri sýru' })
    );
    fireEvent.click(within(container).getByRole('button', { name: /Sýna samanburð við vatn/ }));
    expect(nearestTargets()).toHaveLength(1);
    expect(nearestTargets()[0].textContent).toContain('Samanburður');
  });

  it('keeps the desktop drawing unchanged in a wide column', () => {
    const { svg, tick } = renderCurve(800);
    expect(svg.getAttribute('viewBox')).toBe('0 0 320 160');
    expect(tick.getAttribute('font-size')).toBe('9');
  });
});
