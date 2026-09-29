// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * Focus and the double-tap guard (vertical-scroll design, P3). After an answer, focus moves to
 * the feedback, not to a button, so a second Enter lands on nothing; every button that appears
 * with the feedback ignores a press within 400 ms of appearing, so a second tap cannot skip the
 * feedback unread; and a Næsta or Reyna aftur moves focus to the new question, since the
 * button that was pressed has gone and focus would otherwise fall to <body>.
 *
 * The guard reads `performance.now()`, driven by hand here; fake timers run the frame the
 * focus waits for. Queries are scoped to the rendered container (vitest `retry: 2`).
 */
const t = (key: string, fallback?: string) => fallback ?? key;

let clock = 1000;
beforeEach(() => {
  vi.useFakeTimers();
  clock = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

/** The frame the focus move waits for. */
const frame = () =>
  act(() => {
    vi.advanceTimersByTime(50);
  });

function startLevel1() {
  const { container } = render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
  const view = within(container);
  for (let i = 0; i < 5; i++) fireEvent.click(view.getByRole('button', { name: /Næsta/ }));
  fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
  return view;
}

describe('Stig 1', () => {
  it('checks the answer on Enter in the field', () => {
    const view = startLevel1();
    const field = view.getByRole('spinbutton', { name: 'Oxunartala' });
    fireEvent.change(field, { target: { value: '-1' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(view.getByText(/Oxunartala Cl í NaCl er -1/)).toBeTruthy();
  });

  it('focuses the feedback, drops an early Reyna aftur, then focuses the question again', () => {
    const view = startLevel1();
    fireEvent.change(view.getByRole('spinbutton', { name: 'Oxunartala' }), {
      target: { value: '99' },
    });
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    frame();
    const feedback = document.activeElement as HTMLElement;
    expect(feedback.getAttribute('role')).toBe('group');
    expect(feedback.textContent).toMatch(/Þú svaraðir 99/);

    // A second tap 150 ms after the first lands on nothing.
    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Reyna aftur' }));
    expect(view.getByText(/Þú svaraðir 99/)).toBeTruthy();

    clock += 400;
    fireEvent.click(view.getByRole('button', { name: 'Reyna aftur' }));
    expect(view.queryByText(/Þú svaraðir 99/)).toBeNull();
    expect(document.activeElement?.textContent).toMatch(/Hvað er oxunartala\s*NaCl/);
  });

  it('focuses the hint when it is opened, not <body>', () => {
    const view = startLevel1();
    fireEvent.click(view.getByRole('button', { name: 'Vísbending' }));
    frame();
    expect(document.activeElement?.textContent).toMatch(/Natríum er \+1, summan er 0/);
  });
});

describe('Stig 2', () => {
  function start() {
    const { container } = render(<Level2 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    return view;
  }

  it('focuses the verdict, drops an early Næsta, then focuses the next question', () => {
    const view = start();
    fireEvent.click(view.getByRole('button', { name: 'Na' }));
    frame();
    expect(document.activeElement).toBe(view.getByRole('group', { name: 'Rétt!' }));

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(view.getByText('Hvað oxast?')).toBeTruthy();

    clock += 400;
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(view.getByText('Hvað afoxast?')).toBeTruthy();
    expect(document.activeElement?.textContent).toMatch(/Hvað afoxast\?/);
  });

  it('moves focus to the new reaction, not only its question, when one opens', () => {
    const view = start();
    for (let q = 0; q < 4; q++) {
      fireEvent.click(
        view
          .getAllByRole('button')
          .find((b) => /^(Na|Cl|Cl₂)$/.test(b.textContent ?? '')) as HTMLElement
      );
      clock += 500;
      fireEvent.click(view.getByRole('button', { name: /Næsta spurning|Næsta hvarf/ }));
    }
    expect(document.activeElement?.textContent).toMatch(/Fe \+ CuSO₄ → FeSO₄ \+ Cu/);
  });
});

describe('Stig 3', () => {
  it('focuses the verdict, drops an early Næsta, then focuses the next step', () => {
    const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    expect(document.activeElement?.textContent).toBe('Stilla redox-jöfnur');

    fireEvent.change(view.getByLabelText('Hvað oxast?'), { target: { value: 'Xx' } });
    fireEvent.change(view.getByLabelText('Hvað afoxast?'), { target: { value: 'Yy' } });
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    frame();
    expect(document.activeElement).toBe(view.getByRole('group', { name: /oxast/ }));

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));
    expect(view.queryByText('Skref 2: Oxunarhálfhvarf')).toBeNull();

    clock += 400;
    fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));
    expect(document.activeElement?.textContent).toBe('Skref 2: Oxunarhálfhvarf');
  });
});

describe('screen swaps', () => {
  it('focus the new screen heading, and back on the menu the first level not yet done', () => {
    localStorage.setItem(
      'redox-reactions-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 90,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    const { container } = render(<App />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Stig 3: Stilla hvörf/ }));
    expect(document.activeElement?.textContent).toBe('Hálfhvarfsaðferðin — Kennsla');

    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    const card = view.getByRole('button', { name: /Stig 2: Greina hvörf/ });
    expect(card.getAttribute('data-level-card')).toBe('2');
    expect(document.activeElement).toBe(card);
  });
});
