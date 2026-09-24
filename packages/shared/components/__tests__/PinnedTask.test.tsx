import { Component, type ReactNode } from 'react';

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PIN_QUERY } from '../../utils/reveal';
import { PinnedActions, TaskStrip, PIN_BUDGET } from '../PinnedTask';
import { stubPhoneMedia } from './phoneMedia';

/**
 * TaskStrip and PinnedActions (design P7/P8, test list §6.4).
 *
 * jsdom lays nothing out, so heights come from `data-h` on the game's own
 * elements, and a pinned wrapper measures as its children plus `pinExtra` —
 * the padding and status line pinning adds.
 */

const STATUS = 'Heildar-ΔH: −50 kJ';

let pinExtra = 0;

function rect(height: number): DOMRect {
  return {
    top: 0,
    bottom: height,
    left: 0,
    right: 320,
    width: 320,
    height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

function ownHeight(el: Element): number {
  return Number((el as HTMLElement).dataset?.h ?? 0);
}

class Catch extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? <p>Villa: {this.state.error.message}</p> : this.props.children;
  }
}

/** A hess-L2-shaped card: target strip, an in-flow running total, the action row. */
function Card({
  strip = 40,
  bar = 50,
  extra,
}: {
  strip?: number;
  bar?: number;
  extra?: ReactNode;
}) {
  return (
    <section>
      <TaskStrip>
        <p data-h={strip}>Markmið: C + O₂ → CO₂</p>
      </TaskStrip>
      <p>{STATUS}</p>
      {extra}
      <PinnedActions status={STATUS}>
        <div data-h={bar} className="flex gap-2">
          <button type="button">Hreinsa</button>
          <button type="button">Athuga</button>
        </div>
      </PinnedActions>
    </section>
  );
}

const strip = (c: HTMLElement) => c.querySelector('section > div:first-child') as HTMLElement;
const bar = (c: HTMLElement) => c.querySelector('section > div:last-child') as HTMLElement;

let media: ReturnType<typeof stubPhoneMedia> | null = null;
let viewport: (EventTarget & { height: number; width: number; offsetTop: number }) | null = null;

function setViewportHeight(height: number) {
  viewport = Object.assign(viewport ?? new EventTarget(), { height, width: 360, offsetTop: 0 });
  Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
}

function resizeViewport(height: number) {
  act(() => {
    viewport!.height = height;
    viewport!.dispatchEvent(new Event('resize'));
  });
}

beforeEach(() => {
  pinExtra = 0;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.hasAttribute('data-pinned-top') || this.hasAttribute('data-pinned-bottom')) {
      const kids = Array.from(this.children).reduce((sum, c) => sum + ownHeight(c), 0);
      return rect(kids + pinExtra);
    }
    return rect(ownHeight(this));
  });
});

afterEach(() => {
  media?.restore();
  media = null;
  viewport = null;
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function expectInFlow(container: HTMLElement) {
  expect(strip(container).className).toBe('contents');
  expect(bar(container).className).toBe('contents');
  expect(container.querySelector('[data-pinned-top], [data-pinned-bottom]')).toBeNull();
}

function expectNoTwins() {
  for (const name of ['Hreinsa', 'Athuga']) {
    expect(screen.getAllByRole('button', { name })).toHaveLength(1);
  }
  // The readout a screen reader hears exists once, outside any aria-hidden copy.
  const heard = screen.getAllByText(STATUS).filter((el) => !el.closest('[aria-hidden="true"]'));
  expect(heard).toHaveLength(1);
}

describe('off a portrait phone', () => {
  it('renders nothing pin-only where matchMedia is missing (jsdom)', () => {
    const { container } = render(<Card />);
    expectInFlow(container);
    // No status copy at all, so getByText finds the in-flow readout alone.
    expect(screen.getAllByText(STATUS)).toHaveLength(1);
    expectNoTwins();
    expect(document.documentElement.style.getPropertyValue('--pin-bar-h')).toBe('');
  });

  it('stays in the flow on a desktop window', () => {
    media = stubPhoneMedia(false, PIN_QUERY);
    setViewportHeight(800);
    const { container } = render(<Card />);
    expectInFlow(container);
    expect(screen.getAllByText(STATUS)).toHaveLength(1);
  });
});

describe('on a portrait phone', () => {
  beforeEach(() => {
    media = stubPhoneMedia(true, PIN_QUERY);
    setViewportHeight(640);
  });

  it('pins the strip and the bar, and shows the status as an aria-hidden copy', () => {
    pinExtra = 10;
    const { container } = render(<Card />);

    expect(strip(container).hasAttribute('data-pinned-top')).toBe(true);
    expect(bar(container).hasAttribute('data-pinned-bottom')).toBe(true);
    expect(strip(container).className).toContain('pin:sticky');
    expect(bar(container).className).toContain('pin:bottom-0');

    const copies = screen.getAllByText(STATUS);
    expect(copies).toHaveLength(2);
    expect(copies[1].closest('[aria-hidden="true"]')).not.toBeNull();
    expectNoTwins();
  });

  it('publishes the pinned heights for scroll-padding, and removes them on unmount', () => {
    pinExtra = 10;
    const { unmount } = render(<Card />);
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--pin-strip-h')).toBe('50px');
    expect(root.getPropertyValue('--pin-bar-h')).toBe('60px');
    expect(root.getPropertyValue('--pin-header-h')).toBe('0px');

    unmount();
    expect(root.getPropertyValue('--pin-strip-h')).toBe('');
    expect(root.getPropertyValue('--pin-bar-h')).toBe('');
    expect(root.getPropertyValue('--pin-header-h')).toBe('');
  });

  it('unpins when the phone is turned', () => {
    const { container } = render(<Card />);
    expect(bar(container).hasAttribute('data-pinned-bottom')).toBe(true);

    media!.set(false);
    expectInFlow(container);
    expect(screen.getAllByText(STATUS)).toHaveLength(1);
    expect(document.documentElement.style.getPropertyValue('--pin-bar-h')).toBe('');
  });
});

describe(`the ${Math.round(PIN_BUDGET * 100)} % budget`, () => {
  beforeEach(() => {
    media = stubPhoneMedia(true, PIN_QUERY);
  });

  it('unpins both when together they cover more than 28 % of the visual viewport', () => {
    setViewportHeight(640); // budget 179.2 px
    const { container } = render(<Card strip={90} bar={90} />);
    expectInFlow(container);
  });

  it('measures the visual viewport, not innerHeight, and follows its resize', () => {
    // innerHeight stays at jsdom's 768; only the visual viewport shrinks, as it
    // does for the soft keyboard or pinch-zoom.
    setViewportHeight(800);
    const { container } = render(<Card strip={90} bar={90} />);
    expect(bar(container).hasAttribute('data-pinned-bottom')).toBe(true);

    resizeViewport(500);
    expectInFlow(container);

    resizeViewport(800);
    expect(strip(container).hasAttribute('data-pinned-top')).toBe(true);
    expect(bar(container).hasAttribute('data-pinned-bottom')).toBe(true);
  });

  it('does not flip back and forth when only the pinned form overflows', () => {
    // 80 + 90 = 170 px fits 179.2 in the flow; pinned, the padding and status
    // add 10 each and it would be 190. It must settle unpinned, not loop.
    setViewportHeight(640);
    pinExtra = 10;
    const { container } = render(<Card strip={80} bar={90} />);
    expectInFlow(container);

    // A taller viewport that fits the pinned form re-pins it.
    resizeViewport(700); // budget 196
    expect(bar(container).hasAttribute('data-pinned-bottom')).toBe(true);
  });
});

describe('the budget after the content changes size', () => {
  it('re-pins at normal size after text was enlarged and shrunk again', () => {
    media = stubPhoneMedia(true, PIN_QUERY);
    setViewportHeight(640); // budget 179.2
    pinExtra = 10;
    const { container, rerender } = render(<Card strip={40} bar={50} />);
    expect(bar(container).hasAttribute('data-pinned-bottom')).toBe(true);

    // Enlarged text: 90 + 90 in the flow, 200 pinned. Out of budget.
    rerender(<Card strip={90} bar={90} />);
    expectInFlow(container);

    // Back to normal. What pinning adds was learned at the moment it pinned,
    // not from the enlarged measurement, so it fits again.
    rerender(<Card strip={40} bar={50} />);
    expect(strip(container).hasAttribute('data-pinned-top')).toBe(true);
    expect(bar(container).hasAttribute('data-pinned-bottom')).toBe(true);
  });
});

describe('no pins on a screen with a text input', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it.each([
    ['a text field', <input key="i" type="text" aria-label="Svar" />],
    ['a number field', <input key="i" type="number" aria-label="Svar" />],
    ['a field with no type', <input key="i" aria-label="Svar" />],
    ['a textarea', <textarea key="i" aria-label="Svar" />],
    ['an editable region', <div key="i" contentEditable suppressContentEditableWarning />],
  ])('throws in development and tests for %s, even off a phone', (_, field) => {
    render(
      <Catch>
        <Card extra={field} />
      </Catch>
    );
    expect(screen.getByText(/this screen has a text input/)).toBeDefined();
  });

  it('throws for a TaskStrip alone too', () => {
    render(
      <Catch>
        <TaskStrip>
          <p>Markmið</p>
        </TaskStrip>
        <input type="text" aria-label="Svar" />
      </Catch>
    );
    expect(screen.getByText(/^Villa: TaskStrip:/)).toBeDefined();
  });

  it('looks at the whole screen, not only the card', () => {
    render(
      <Catch>
        <Card />
        <form>
          <input type="text" aria-label="Svar" />
        </form>
      </Catch>
    );
    expect(screen.getByText(/^Villa: PinnedActions:|^Villa: TaskStrip:/)).toBeDefined();
  });

  it.each([
    ['a slider', <input key="i" type="range" aria-label="pH" />],
    ['a checkbox', <input key="i" type="checkbox" aria-label="Lokið" />],
    ['a radio button', <input key="i" type="radio" aria-label="Val" />],
    ['a button input', <input key="i" type="button" value="Áfram" />],
  ])('allows %s', (_, field) => {
    media = stubPhoneMedia(true, PIN_QUERY);
    setViewportHeight(640);
    const { container } = render(<Card extra={field} />);
    expect(container.querySelector('[data-pinned-bottom]')).not.toBeNull();
  });

  it('renders unpinned in production instead of throwing', () => {
    vi.stubEnv('PROD', true);
    media = stubPhoneMedia(true, PIN_QUERY);
    setViewportHeight(640);
    const { container } = render(<Card extra={<input type="text" aria-label="Svar" />} />);
    expectInFlow(container);
    expect(screen.getAllByText(STATUS)).toHaveLength(1);
  });
});
