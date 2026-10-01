// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { COMPACT_BOARD_QUERY, LewisDrawingCanvas } from '../components/LewisDrawingCanvas';

/**
 * The game on a phone, and where the page and focus go as the student plays.
 *
 * Level 2's drawing board: at 360 px the full 350-unit board drew each bond as
 * a 19 × 21 px target and the outer atoms' letters at 10 px, so on phones
 * (narrower than `sm`, or a landscape phone) the board crops to the molecule
 * and widens each bond's invisible hit strip. Desktop keeps the original board.
 *
 * Every screen swaps its content in place and the browser keeps the offset, so
 * the game uses the shared helpers in `@shared/utils` (`reveal.ts`, `armed.ts`),
 * which replaced its own `useRevealOnChange`:
 *
 * - A level opens at the top of the page — at any width, as it always did —
 *   with its heading focused; back on the menu the first level not yet done is
 *   focused.
 * - "Næsta …" brings the new item's top back when it has scrolled off — at any
 *   width, as the old helper did — and focuses its title.
 * - After a check, focus moves to the feedback, never to Næsta, and Næsta
 *   ignores a press within 400 ms of appearing, so neither a second Enter nor a
 *   second tap skips the feedback. On desktop the page moves only where the old
 *   helper moved it: a verdict that opened above the window.
 *
 * jsdom has no layout, so every box is stubbed. Queries are scoped to each
 * rendered container, since the suite runs with retries.
 */

/** Animation frames wait until `frame()` runs the ones already asked for. */
let frames = new Map<number, FrameRequestCallback>();
let lastFrame = 0;
function frame() {
  const due = [...frames.values()];
  frames = new Map();
  act(() => due.forEach((cb) => cb(0)));
}

/** A click, then the frame in which the game reveals and focuses what it opened. */
function press(el: Element) {
  fireEvent.click(el);
  frame();
}

/** Which media queries match, where every element's top is, and the guard's clock. */
let matching: (query: string) => boolean = () => false;
let top = 16;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  localStorage.clear();
  matching = () => false;
  top = 16;
  clock = 1000;
  scrollBy.mockClear();
  scrollTo.mockClear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn((query: string) => ({
    matches: matching(query),
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
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  frames = new Map();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.set(++lastFrame, cb);
    return lastFrame;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top,
        bottom: top + 100,
        left: 0,
        right: 328,
        width: 328,
        height: 100,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const phone = () => {
  matching = (q) => q === PHONE_QUERY || q === COMPACT_BOARD_QUERY;
};
const focused = () => document.activeElement as HTMLElement | null;

const WATER = {
  centralAtom: 'O',
  surroundingAtoms: [
    { symbol: 'H', bondType: 'single' as const, lonePairs: 0 },
    { symbol: 'H', bondType: 'single' as const, lonePairs: 0 },
  ],
  centralLonePairs: 2,
};

function renderBoard() {
  const rendered = render(
    <LewisDrawingCanvas
      molecule="H₂O"
      totalElectrons={8}
      correctStructure={WATER}
      onComplete={vi.fn()}
    />
  );
  const svg = rendered.container.querySelector('svg[aria-label^="Teikniborð"]') as SVGSVGElement;
  // width of each bond's invisible hit strip: distance between its two long edges
  const hitWidths = [...svg.querySelectorAll('polygon[fill="transparent"]')].map((poly) => {
    const [a, , , d] = (poly.getAttribute('points') ?? '')
      .split(' ')
      .map((pt) => pt.split(',').map(Number));
    return Math.round(Math.hypot(a[0] - d[0], a[1] - d[1]));
  });
  return { ui: within(rendered.container), svg, hitWidths };
}

describe('drawing board on a phone', () => {
  it('crops to the molecule and widens the bond hit strip on phones', () => {
    matching = (q) => q === COMPACT_BOARD_QUERY;
    const { ui, svg, hitWidths } = renderBoard();
    // Cropped to the room this molecule can take: every symbol inside it, and
    // H–O–H, drawn across as the book draws it, framed wide rather than square.
    const [x, y, w, h] = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number);
    for (const t of svg.querySelectorAll('text')) {
      const tx = Number(t.getAttribute('x'));
      const ty = Number(t.getAttribute('y'));
      expect(tx).toBeGreaterThan(x);
      expect(tx).toBeLessThan(x + w);
      expect(ty).toBeGreaterThan(y);
      expect(ty).toBeLessThan(y + h);
    }
    expect(w).toBeGreaterThan(h);
    expect(hitWidths).toEqual([36, 36]);
    // the instruction is HTML under the board, not 11-unit SVG text
    expect(
      within(svg as unknown as HTMLElement).queryByText(
        'Smelltu eða notaðu Tab + Enter til að breyta tengjum'
      )
    ).toBeNull();
    expect(ui.getByText('Smelltu á strikin til að breyta tengjum')).toBeTruthy();
  });

  it('keeps the original board where there is room', () => {
    const { ui, svg, hitWidths } = renderBoard();
    expect(svg.getAttribute('viewBox')).toBe('0 0 350 280');
    expect(hitWidths).toEqual([24, 24]);
    expect(ui.queryByText('Smelltu á strikin til að breyta tengjum')).toBeNull();
    expect(
      within(svg as unknown as HTMLElement).getByText(
        'Smelltu eða notaðu Tab + Enter til að breyta tengjum'
      )
    ).toBeTruthy();
  });

  it('still cycles a bond on each tap in the compact board', () => {
    matching = (q) => q === COMPACT_BOARD_QUERY;
    const { ui } = renderBoard();
    const bond = () => ui.getAllByRole('button', { name: /^Tengi 1 af 2/ })[0];
    const seen = [];
    for (let t = 0; t < 4; t++) {
      fireEvent.click(bond());
      seen.push(
        bond()
          .getAttribute('aria-label')
          ?.match(/núna (\S+)\./)?.[1]
      );
    }
    expect(seen).toEqual(['Einfalt', 'Tvöfalt', 'Þrefalt', 'Ekkert']);
  });

  it('shows the electron count once, beside the lone-pair heading, on a phone', () => {
    matching = (q) => q === COMPACT_BOARD_QUERY;
    const { ui } = renderBoard();
    for (const label of ['Alls', 'Notaðar', 'Eftir']) {
      expect(ui.getAllByText(label)).toHaveLength(1);
    }
    const heading = ui.getByText('Stök rafeindapör:');
    expect(heading.parentElement?.textContent).toContain('Eftir');
  });

  it('keeps the counter its own card where there is room', () => {
    const { ui } = renderBoard();
    for (const label of ['Alls', 'Notaðar', 'Eftir']) {
      expect(ui.getAllByText(label)).toHaveLength(1);
    }
    expect(ui.getByText('Stök rafeindapör:').parentElement?.textContent).not.toContain('Eftir');
  });

  it('focuses what to fix after a wrong drawing, and keeps Athuga', () => {
    phone();
    const { ui } = renderBoard();
    fireEvent.click(ui.getAllByRole('button', { name: /^Tengi 1 af 2/ })[0]);
    press(ui.getByRole('button', { name: 'Athuga' }));
    expect(focused()?.getAttribute('role')).toBe('status');
    expect(focused()?.textContent).toContain('Ekki alveg rétt');
    expect(ui.getByRole('button', { name: 'Athuga' })).toBeTruthy();
  });
});

/** Draw water correctly on Level 2's first board and check it. */
function drawWater(ui: ReturnType<typeof within>) {
  for (const bond of ui.getAllByRole('button', { name: /^Tengi \d af 2/ })) {
    fireEvent.click(bond);
  }
  const plus = ui.getByRole('button', { name: 'Bæta stöku pari við O (miðatóm)' });
  fireEvent.click(plus);
  fireEvent.click(plus);
  press(ui.getByRole('button', { name: 'Athuga' }));
}

describe('Stig 2: a right drawing, then the next molecule', () => {
  it('focuses the verdict, drops a Næsta press within 400 ms, then focuses the next title', () => {
    phone();
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    drawWater(ui);
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toContain('Rétt!');

    const next = ui.getByRole('button', { name: /Næsta sameind/ });
    clock += 150;
    fireEvent.click(next);
    expect(ui.getByText('Vatn (H₂O)')).toBeTruthy();

    clock += 400;
    top = -372;
    scrollBy.mockClear();
    fireEvent.click(ui.getByRole('button', { name: /Næsta sameind/ }));
    expect(ui.getByText('Ammóníak (NH₃)')).toBeTruthy();
    // The card's top was above the screen: it comes back to the top of it.
    expect(scrollBy).toHaveBeenCalledWith({ top: -372, behavior: 'smooth' });
    expect(focused()?.textContent).toBe('Ammóníak (NH₃)');
  });

  it('on desktop brings back only what opened above the window, as before', () => {
    top = -372;
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    drawWater(ui);
    // the shorter result replaced the board, and its verdict opened above the window
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: -372, behavior: 'smooth' });
    expect(focused()?.textContent).toContain('Rétt!');
  });

  it('on desktop leaves the page alone when everything is on screen', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    drawWater(ui);
    clock += 500;
    fireEvent.click(ui.getByRole('button', { name: /Næsta sameind/ }));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.textContent).toBe('Ammóníak (NH₃)');
  });
});

describe('Stig 1 feedback', () => {
  function answerFirst() {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.change(ui.getByPlaceholderText('?'), { target: { value: '4' } });
    const check = ui.getByRole('button', { name: 'Athuga svar' });
    press(check);
    return { ui, check };
  }

  it('focuses the feedback, not Næsta, which is a different element', () => {
    const { ui, check } = answerFirst();
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toMatch(/Rétt!/);
    expect(check.isConnected).toBe(false);
    expect(ui.getByRole('button', { name: 'Næsta þraut' })).not.toBe(focused());
  });

  it('on desktop brings the verdict back when it opened above the window', () => {
    top = -253;
    answerFirst();
    expect(scrollBy).toHaveBeenCalledWith({ top: -253, behavior: 'smooth' });
  });

  it('on desktop leaves the page alone when the verdict is on screen', () => {
    top = 300;
    answerFirst();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('Enter in the count field checks the answer', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    const input = ui.getByPlaceholderText('?');
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(ui.getByRole('button', { name: 'Næsta þraut' })).toBeTruthy();
  });
});

describe('Stig 3', () => {
  /** Answer the first challenge and move on to the formal charge of O in H₂O. */
  function toChargeQuestion() {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: 'FC = Gildisraf. - (óbundnar + ½ bundnar)' }));
    press(ui.getByRole('button', { name: 'Athuga svar' }));
    clock += 500;
    fireEvent.click(ui.getByRole('button', { name: 'Næsta þraut' }));
    return { container, ui };
  }

  it('sets short charge options side by side on a phone, and one per row after the check', () => {
    phone();
    const { ui } = toChargeQuestion();
    const options = () => ui.getByRole('button', { name: '+1' }).parentElement as HTMLElement;
    expect(options().className).toContain('grid-cols-3');
    fireEvent.click(ui.getByRole('button', { name: '0' }));
    press(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(options().className).not.toContain('grid-cols-3');
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toMatch(/^Rétt!/);
  });

  it('keeps one option per row where there is room', () => {
    const { ui } = toChargeQuestion();
    const options = ui.getByRole('button', { name: '+1' }).parentElement as HTMLElement;
    expect(options.className).not.toContain('grid-cols-3');
  });

  it('opening the hint focuses the hint, not <body>', () => {
    phone();
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    press(within(container).getByRole('button', { name: 'Sýna vísbendingu' }));
    expect(focused()).not.toBe(document.body);
    expect(focused()?.textContent?.startsWith('Vísbending:')).toBe(true);
  });
});

describe('opening a level and coming back', () => {
  it('starts the level at the top of the page, with its title focused', () => {
    const { container } = render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(within(container).getByRole('button', { name: /Stig 3/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Formleg hleðsla — formúlan');
  });

  it('back on the menu, focuses the first level not yet done', () => {
    const { container } = render(<App />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Stig 2/ }));
    fireEvent.click(ui.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('1');
  });
});
