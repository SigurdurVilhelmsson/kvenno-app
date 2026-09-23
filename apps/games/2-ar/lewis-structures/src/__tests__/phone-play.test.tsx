// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { COMPACT_BOARD_QUERY, LewisDrawingCanvas } from '../components/LewisDrawingCanvas';

/**
 * Level 2's drawing board on a phone.
 *
 * At 360 px the full 350-unit board drew each bond as a 19 × 21 px target and
 * the outer atoms' letters at 10 px, so on phones (narrower than `sm`, or a
 * landscape phone) the board crops to the molecule and widens each bond's
 * invisible hit strip. Desktop keeps the original board unchanged.
 *
 * "Næsta sameind" swaps the molecule in place; on a phone that left the new
 * board scrolled off the top, so the card is brought back into view. Checking
 * an answer can do the same to its result, which is brought back the same way.
 * And a level tapped from a scrolled-down menu opens at the top.
 *
 * Queries are scoped to each rendered container and everything is unmounted
 * after each test, since the suite runs with retries.
 */

function mockMatchMedia(matches: (query: string) => boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: matches(query),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('drawing board on a phone', () => {
  it('crops to the molecule and widens the bond hit strip on phones', () => {
    mockMatchMedia((q) => q === COMPACT_BOARD_QUERY);
    const { ui, svg, hitWidths } = renderBoard();
    // every atom and lone pair lies within 120 units of the centre (175, 140)
    expect(svg.getAttribute('viewBox')).toBe('55 20 240 240');
    expect(hitWidths).toEqual([36, 36]);
    // the instruction is HTML under the board, not 11-unit SVG text
    expect(svg.querySelector('text:not([fill="white"])')).toBeNull();
    expect(ui.getByText('Smelltu á strikin til að breyta tengjum')).toBeTruthy();
  });

  it('keeps the original board where there is room', () => {
    mockMatchMedia(() => false);
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
    mockMatchMedia((q) => q === COMPACT_BOARD_QUERY);
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
});

/**
 * Pins every element's top edge at `top` and records which elements the page
 * scrolls into view (by the text they start with).
 */
function watchReveals(top: number) {
  mockMatchMedia((q) => q === COMPACT_BOARD_QUERY);
  const revealed: string[] = [];
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(function (this: HTMLElement, options: ScrollIntoViewOptions) {
      expect(options).toEqual({ block: 'start', behavior: 'smooth' });
      revealed.push((this.textContent ?? '').trim());
    }),
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: top + 900,
    left: 0,
    right: 328,
    width: 328,
    height: 900,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
  return revealed;
}

describe('moving on shows the next molecule', () => {
  function drawWaterAndGoOn(cardTop: number) {
    const revealed = watchReveals(cardTop);
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    for (const bond of ui.getAllByRole('button', { name: /^Tengi \d af 2/ })) {
      fireEvent.click(bond);
    }
    const plus = ui.getAllByRole('button', { name: '+' })[0];
    fireEvent.click(plus);
    fireEvent.click(plus);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(ui.getByText('Rétt!')).toBeTruthy();
    const afterCheck = [...revealed];

    fireEvent.click(ui.getByRole('button', { name: /Næsta sameind/ }));
    expect(ui.getByText('Ammóníak (NH₃)')).toBeTruthy();
    return { afterCheck, afterNext: revealed.slice(afterCheck.length) };
  }

  it('brings the result, then the next board, back when they opened above the screen', () => {
    const { afterCheck, afterNext } = drawWaterAndGoOn(-372);
    // the shorter result replaced the board: its "Rétt!" is what comes back
    expect(afterCheck).toEqual([expect.stringMatching(/^Rétt!/)]);
    // then the card of the next molecule, title first
    expect(afterNext).toEqual([expect.stringMatching(/^Ammóníak \(NH₃\)/)]);
  });

  it('leaves the page alone when they are already on screen', () => {
    const { afterCheck, afterNext } = drawWaterAndGoOn(16);
    expect(afterCheck).toEqual([]);
    expect(afterNext).toEqual([]);
  });
});

describe('Stig 1 feedback', () => {
  // The hints vanish once the answer is checked, so with several open the
  // feedback's verdict opened above the top of a phone screen.
  function answerFirst(top: number) {
    const revealed = watchReveals(top);
    const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.change(ui.getByPlaceholderText('?'), { target: { value: '4' } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(ui.getByRole('button', { name: 'Næsta þraut' })).toBeTruthy();
    return revealed;
  }

  it('brings the verdict back when it opened above the screen', () => {
    expect(answerFirst(-253)).toEqual([expect.stringMatching(/^✓\s*Rétt!/)]);
  });

  it('leaves the page alone when it is on screen', () => {
    expect(answerFirst(300)).toEqual([]);
  });
});

describe('opening a level', () => {
  it('starts the level at the top of the page', () => {
    mockMatchMedia(() => false);
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    const rendered = render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(within(rendered.container).getByRole('button', { name: /Stig 3/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
  });
});
