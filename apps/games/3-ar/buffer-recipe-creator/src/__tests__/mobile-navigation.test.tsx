// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import { clockPastNextGuard } from './next-guard-clock';
import App from '../App';
import { BufferCapacityVisualization } from '../components/BufferCapacityVisualization';
import Level1 from '../components/Level1';
import Level2 from '../components/Level2';
import Level3 from '../components/Level3';

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
 * The page now moves through the shared helpers in `@shared/utils`. The reveals
 * the game already made at every width still happen at every width, and still
 * leave a screen that fits alone (the desktop case); focus moves to the new
 * heading or to the feedback at every width, since the button pressed has gone
 * (vertical-scroll design, P2/P3). On a phone the hints move under the step card
 * and keep the tiers the student opened.
 *
 * Queries are scoped to the rendered container: the repo runs vitest with
 * `retry: 2`, so a failed attempt's DOM must not leak into the next one.
 */

clockPastNextGuard();

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
let phone = false;
const phoneListeners = new Set<() => void>();

/** A matchMedia whose phone query follows `phone`; everything else is false. */
function installMatchMedia() {
  window.matchMedia = ((query: string) => ({
    matches: query === PHONE_QUERY ? phone : false,
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: () => void) => {
      if (query === PHONE_QUERY) phoneListeners.add(fn);
    },
    removeEventListener: (_: string, fn: () => void) => phoneListeners.delete(fn),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function setPhone(on: boolean) {
  phone = on;
  act(() => phoneListeners.forEach((fn) => fn()));
}

beforeEach(() => {
  top = 0;
  phone = false;
  phoneListeners.clear();
  installMatchMedia();
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rectWithTop(top));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
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

/** Let Presence mount a panel and the short reveal timers run. */
const settle = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

const scrolls = () => vi.mocked(window.scrollBy).mock.calls.length;
const focused = () => document.activeElement as HTMLElement | null;

describe('Stig 1 feedback opens below "Athuga stuðpúða"', () => {
  it('is scrolled into view after a check when it is below the screen, with focus on it', async () => {
    const { container } = render(<Level1 />);
    // Challenge 1 is at pKa: one extra acid molecule makes it wrong.
    fireEvent.click(within(container).getByRole('button', { name: 'Bæta við sýrusameind' }));
    top = 900; // below jsdom's 768 px window
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));
    await settle(150);
    expect(scrolls()).toBe(1);
    expect(focused()?.textContent).toContain('Næstum rétt');
  });

  it('leaves feedback that is already on screen where it is', async () => {
    const { container } = render(<Level1 />);
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));
    await settle(150);
    expect(scrolls()).toBe(0);
    expect(focused()?.textContent).toContain('Frábært');
  });

  it('is revealed on the last challenge too, which waits for "Ljúka stigi"', async () => {
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
    expect(onLevelComplete).not.toHaveBeenCalled();
    await settle(150);
    expect(focused()?.textContent).toContain('Frábært');
    tap('Ljúka stigi →');
    expect(onLevelComplete).toHaveBeenCalledTimes(1);
  });
});

describe('opening a level starts at its top', () => {
  it('jumps to the top when a level card is chosen, and not on first load', async () => {
    top = -500;
    const { container } = render(<App />);
    expect(window.scrollBy).not.toHaveBeenCalled();

    fireEvent.click(within(container).getByRole('button', { name: /Stig 2: Útreikningar/ }));
    expect(window.scrollBy).toHaveBeenCalledWith({ top: -500, behavior: 'auto' });
    await settle(50);
    expect(focused()?.textContent).toBe('Stuðpúðasmíði - Stig 2');
  });

  it('focuses the next unfinished level card on the way back to the menu', async () => {
    const { container } = render(<App />);
    fireEvent.click(within(container).getByRole('button', { name: /Stig 3: Hönnun/ }));
    await settle(300);
    fireEvent.click(within(container).getAllByRole('button', { name: /Til baka/ })[0]);
    await settle(300);
    expect(focused()?.getAttribute('data-level-card')).toBe('level1');
  });

  it('Stig 3 "Byrja" opens the first task at the top, with its heading focused', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    expect(focused()?.textContent).toBe('Stig 3 — frá massa til rúmmála');
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Stuðpúðasmíði - Stig 3');
  });
});

describe('"Næsta verkefni" brings the next task back into view', () => {
  it('Stig 1 reveals the challenge card, only when it is above the screen', () => {
    const { container } = render(<Level1 />);
    // Challenge 1 starts at 5 acid : 5 base, inside its 0,9–1,1 band.
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));

    // Card still on screen: nothing moves, and the new challenge's name is focused.
    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(scrolls()).toBe(0);
    expect(within(container).getByText('Verkefni #2')).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);

    // Solve challenge 2 (pH 5,00 at pKa 4,74 needs about 1,8 base per acid): 5 acid, 9 base.
    for (let i = 0; i < 4; i++) {
      fireEvent.click(within(container).getByRole('button', { name: 'Bæta við basasameind' }));
    }
    fireEvent.click(within(container).getByRole('button', { name: 'Athuga stuðpúða' }));

    top = -900;
    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(scrolls()).toBe(1);
    expect(within(container).getByText('Verkefni #3')).toBeTruthy();
  });

  it('Stig 2 reveals the level after a finished puzzle', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['1,585']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['4,64', '8,70']);
    fireEvent.click(lastButton(container, 'Athuga svar'));

    top = -1200;
    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(window.scrollBy).toHaveBeenCalledWith({ top: -1200, behavior: 'smooth' });
    expect(within(container).getByText('2 / 5')).toBeTruthy();
  });

  it('Stig 3 leaves a level that is on screen alone', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    fillLast(container, ['1,585']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['0,00387', '0,00613']);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    fillLast(container, ['7,76', '12,24']);
    fireEvent.click(lastButton(container, 'Athuga svar'));

    fireEvent.click(within(container).getByRole('button', { name: /Næsta verkefni/ }));
    expect(scrolls()).toBe(0);
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
    expect(scrolls()).toBe(0);
    await settle(400);
    expect(scrolls()).toBe(1);
    // Focus goes to the verdict, not to "Næsta verkefni" (a second Enter lands on nothing).
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toContain('Rétt svar!');
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
    expect(scrolls()).toBe(0);
    expect(focused()?.textContent).toContain('Rétt svar!');
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
    expect(scrolls()).toBe(1);
  });
});

describe('Stig 2 steps', () => {
  it('focuses a wrong answer’s feedback, and each new step heading', async () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Lægra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    await settle(100);
    expect(focused()?.textContent).toContain('Ekki rétt');

    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    await settle(300);
    expect(focused()?.textContent).toContain('Skref 2');
  });

  it('checks the ratio with Enter, and moves from the first mass to the second', async () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    await settle(300);
    const ratio = container.querySelector<HTMLInputElement>('#buffer-l2-ratio')!;
    fireEvent.change(ratio, { target: { value: '1,585' } });
    fireEvent.keyDown(ratio, { key: 'Enter' });
    await settle(300);
    const acid = container.querySelector<HTMLInputElement>('#buffer-l2-acid-mass')!;
    fireEvent.change(acid, { target: { value: '4,64' } });
    fireEvent.keyDown(acid, { key: 'Enter' });
    expect(focused()?.id).toBe('buffer-l2-base-mass');
    fireEvent.change(focused()!, { target: { value: '8,70' } });
    fireEvent.keyDown(focused()!, { key: 'Enter' });
    expect(within(container).getByText('Rétt svar!')).toBeTruthy();
  });
});

describe('on a phone', () => {
  it('puts "Næsta verkefni" before the buffer-capacity explorer, and after it on desktop', () => {
    const nextComesFirst = () => {
      const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
      fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
      fireEvent.click(lastButton(container, 'Athuga svar'));
      fillLast(container, ['1,585']);
      fireEvent.click(lastButton(container, 'Athuga svar'));
      fillLast(container, ['4,64', '8,70']);
      fireEvent.click(lastButton(container, 'Athuga svar'));
      const next = within(container).getByRole('button', { name: /Næsta verkefni/ });
      const viz = within(container).getByText('Stuðpúðageta');
      const first = !!(next.compareDocumentPosition(viz) & Node.DOCUMENT_POSITION_FOLLOWING);
      cleanup();
      return first;
    };
    expect(nextComesFirst()).toBe(false);
    phone = true;
    expect(nextComesFirst()).toBe(true);
  });

  it('moves the hints under the step card without the "Stig" line, keeping open tiers', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Vísbending 1\/4/ }));
    expect(within(container).getByText(/Stig: 80 \/ 100/)).toBeTruthy();

    setPhone(true);
    // The tier the student opened is still open, and the next one is offered.
    const hint = within(container).getByRole('button', { name: /Vísbending 2\/4/ });
    expect(within(container).queryByText(/Stig: 80 \/ 100/)).toBeNull();
    const step = within(container).getByText(/Skref 1:/);
    expect(step.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    setPhone(false);
    expect(within(container).getByText(/Stig: 80 \/ 100/)).toBeTruthy();
  });

  it('Stig 1 shows the ratio and its target above the buttons, and the molecules after', () => {
    phone = true;
    const { container } = render(<Level1 />);
    const target = within(container).getByText(/Markmið: 0,9/);
    const add = within(container).getByRole('button', { name: 'Bæta við basasameind' });
    const molecules = within(container).getAllByText('HA')[0];
    expect(target.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(add.compareDocumentPosition(molecules) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

  it('scrolls the buffer-versus-water comparison into view when it opens below the screen', () => {
    const { container } = render(
      <BufferCapacityVisualization pKa={4.74} acidConc={0.05} baseConc={0.05} totalConc={0.1} />
    );
    fireEvent.click(
      within(container).getByRole('button', { name: 'Bæta við 0,01 M sterkri sýru' })
    );
    top = 900;
    fireEvent.click(within(container).getByRole('button', { name: /Sýna samanburð við vatn/ }));
    expect(scrolls()).toBe(1);
  });

  it('keeps the desktop drawing unchanged in a wide column', () => {
    const { svg, tick } = renderCurve(800);
    expect(svg.getAttribute('viewBox')).toBe('0 0 320 160');
    expect(tick.getAttribute('font-size')).toBe('9');
  });
});
