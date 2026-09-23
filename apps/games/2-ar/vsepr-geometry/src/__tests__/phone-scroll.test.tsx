// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';

/**
 * Two places where, on a phone, a tap changes content the student cannot see.
 *
 * Level 1's explore grid opens a details panel BELOW the grid; at 360 px its
 * top lands under the fold, so a tap on a shape only changes the card border.
 *
 * On a phone Level 2's two panels stack. A correct geometry prediction reveals
 * the molecule and the repulsion animation in the TOP panel, which pushes the
 * step panel's feedback and the "Næsta skref" button below the fold: the
 * student taps "Athuga svar" and the screen shows a molecule instead of the
 * result.
 *
 * Both scroll the new content into view, and only below md: from md up the
 * layout keeps it where the student is already looking.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup), and the level is unmounted after each
 * test so the repulsion animation's timers do not leak into the next one.
 */

const scrollIntoView = vi.fn();
let unmount: (() => void) | null = null;

function startLevel1() {
  const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
  unmount = rendered.unmount;
  return within(rendered.container);
}

function startLevel() {
  const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  unmount = rendered.unmount;
  return { ui: within(rendered.container), container: rendered.container };
}

/** Molecule 1 is H₂O: 2 bonding pairs, 2 lone pairs, bent. */
function answerCountStep(ui: ReturnType<typeof within>, container: HTMLElement) {
  const [bonding, lone] = Array.from(container.querySelectorAll('input[type=number]'));
  fireEvent.change(bonding, { target: { value: '2' } });
  fireEvent.change(lone, { target: { value: '2' } });
  fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  fireEvent.click(ui.getByRole('button', { name: 'Næsta skref' }));
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

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  setDesktop(false);
});

afterEach(() => {
  unmount?.();
  unmount = null;
});

describe('Level 2 keeps the geometry feedback in view on a phone', () => {
  it('scrolls the next button into view after a correct geometry prediction', () => {
    const { ui, container } = startLevel();
    answerCountStep(ui, container);
    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(ui.getByRole('button', { name: /Beygð/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(ui.getByRole('button', { name: 'Næsta skref' }));
    expect(scrollIntoView.mock.calls[0][0]).toMatchObject({ block: 'nearest' });
  });

  it('does not scroll after a wrong prediction, which reveals nothing above', () => {
    const { ui, container } = startLevel();
    answerCountStep(ui, container);

    fireEvent.click(ui.getByRole('button', { name: /Fjórflötungur/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(ui.getByText(/Rangt/)).toBeTruthy();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when the panels sit side by side (md and up)', () => {
    setDesktop(true);
    const { ui, container } = startLevel();
    answerCountStep(ui, container);

    fireEvent.click(ui.getByRole('button', { name: /Beygð/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(ui.getByRole('button', { name: 'Næsta skref' })).toBeTruthy();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll again on the later steps of the same molecule', () => {
    const { ui, container } = startLevel();
    answerCountStep(ui, container);
    fireEvent.click(ui.getByRole('button', { name: /Beygð/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    fireEvent.click(ui.getByRole('button', { name: 'Næsta skref' }));

    const angle = container.querySelector('input[type=text]') as HTMLInputElement;
    fireEvent.change(angle, { target: { value: '104.5' } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });
});

describe('Level 1 brings the shape details into view on a phone', () => {
  it('scrolls the details panel into view when a shape is tapped', () => {
    const ui = startLevel1();
    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(ui.getByRole('button', { name: /Línuleg Linear/ }));

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    const panel = scrollIntoView.mock.contexts[0] as HTMLElement;
    expect(panel.textContent).toContain('Rafeindalögun');
    expect(scrollIntoView.mock.calls[0][0]).toMatchObject({ block: 'nearest' });

    fireEvent.click(ui.getByRole('button', { name: /Áttflötungur Octahedral/ }));
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it('does not scroll from md up, where the panel opens in view', () => {
    setDesktop(true);
    const ui = startLevel1();

    fireEvent.click(ui.getByRole('button', { name: /Línuleg Linear/ }));

    expect(ui.getByText('Rafeindalögun')).toBeTruthy();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
