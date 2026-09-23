// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * On a phone every screen of this game is one long column, and the button that
 * replaces it sits a screen or more down. The new screen used to open at the
 * old scroll position: entering Stig 3 from the menu landed on its reference
 * tables, and each new question started with the question above the fold.
 * Each replacement now starts at the top below md, and never on mount.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup), and each render is unmounted afterwards
 * so the animations' timers do not leak into the next test.
 */

const scrollTo = vi.fn();
let unmount: (() => void) | null = null;

function mount(ui: React.ReactElement) {
  const rendered = render(ui);
  unmount = rendered.unmount;
  return { ui: within(rendered.container), container: rendered.container };
}

function setDesktop(isDesktop: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: isDesktop && query.includes('min-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

/** Answer the current multiple-choice question and move on. */
function answerAndAdvance(ui: ReturnType<typeof within>, container: HTMLElement) {
  fireEvent.click(container.querySelector('button:has(span.uppercase)') as HTMLElement);
  fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  fireEvent.click(ui.getByRole('button', { name: /Næsta spurning/ }));
}

beforeEach(() => {
  scrollTo.mockClear();
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  // The student has scrolled down to the button that replaces the screen.
  Object.defineProperty(window, 'scrollY', { value: 900, configurable: true });
  localStorage.clear();
  setDesktop(false);
});

afterEach(() => {
  unmount?.();
  unmount = null;
});

describe('a new screen starts at the top on a phone', () => {
  it('Stig 3: each new question, and not the first render', () => {
    const { ui, container } = mount(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollTo).not.toHaveBeenCalled();

    answerAndAdvance(ui, container);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(ui.getByText('Spurning 2 af 12')).toBeTruthy();

    answerAndAdvance(ui, container);
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it('Stig 1: starting the questions and each new question', () => {
    const { ui, container } = mount(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(ui.getByRole('button', { name: /Hefja spurningar/ }));
    expect(scrollTo).toHaveBeenCalledTimes(1);

    answerAndAdvance(ui, container);
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it('Stig 2: a new molecule, but not the steps within one', () => {
    const { ui, container } = mount(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const next = () =>
      fireEvent.click(ui.getByRole('button', { name: /Næsta skref|Næsta sameind/ }));
    const check = () => fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    const [bonding, lone] = Array.from(container.querySelectorAll('input[type=number]'));
    fireEvent.change(bonding, { target: { value: '2' } });
    fireEvent.change(lone, { target: { value: '2' } });
    check();
    next();
    fireEvent.click(ui.getByRole('button', { name: /Beygð/ }));
    check();
    next();
    fireEvent.change(container.querySelector('input[type=text]') as HTMLElement, {
      target: { value: '104.5' },
    });
    check();
    next();
    fireEvent.change(container.querySelector('textarea') as HTMLElement, {
      target: { value: 'Tvö einstæð pör ýta tengjunum saman.' },
    });
    check();
    expect(scrollTo).not.toHaveBeenCalled();

    next();
    expect(ui.getByText('Sameind 2 af 10')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('the menu: entering a level', () => {
    const { ui } = mount(<App />);
    expect(scrollTo).not.toHaveBeenCalled();

    fireEvent.click(ui.getByRole('button', { name: /Stig 3: Blendni og skautun/ }));
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('leaves the page alone from md up', () => {
    setDesktop(true);
    const { ui, container } = mount(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);

    answerAndAdvance(ui, container);
    expect(ui.getByText('Spurning 2 af 12')).toBeTruthy();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
