// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level2 } from '../components/Level2';
import { OxidationStateDisplay } from '../components/OxidationStateDisplay';

/**
 * Stig 2 asks "Hvað oxast?" under a diagram of the reaction. That diagram labelled the answer —
 * "↑ OXAST" on one species, "↓ AFOXAST" on the other, and "Na oxast: 0 → +1" beneath — before
 * the student had answered. Once that was fixed the labels came in with the first answer, so
 * they printed "Cl afoxast" above the second question, "Hvað afoxast?" — an answer shown before
 * it is given, which a count of right answers cannot count (mobile-pass decision 1 (b)). They now
 * come in with the second answer. Queries are scoped to the rendered container and every render
 * is unmounted (vitest `retry: 2`, no RTL auto-cleanup).
 */
const t = (key: string, fallback?: string) => fallback ?? key;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

clockPastNextGuard();

function start() {
  const onComplete = vi.fn();
  const utils = render(<Level2 t={t} onComplete={onComplete} onBack={vi.fn()} />);
  const view = within(utils.container);
  fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
  return { ...utils, view, onComplete };
}

/** The oxidation-number diagram: the dark panel whose legend explains the badge colours. */
function diagram(view: ReturnType<typeof within>): HTMLElement {
  const legend = view.getByText('Neikvæð oxunartala');
  return legend.closest('.shadow-lg') as HTMLElement;
}

/** The two answer buttons, in the order they are drawn. */
function answerButtons(view: ReturnType<typeof within>): HTMLButtonElement[] {
  const question = view.getByText('Hvað oxast?', { selector: 'span' }).closest('div.bg-green-50');
  const grid = question?.nextElementSibling?.querySelector('.grid');
  return Array.from(grid?.querySelectorAll('button') ?? []);
}

const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

const LABELS = /OXAST|AFOXAST|oxast:|afoxast:|Tapar|Öðlast/;

/** Answer whichever option is offered first; the labels follow the answer, right or wrong. */
function answerAny(view: ReturnType<typeof within>) {
  fireEvent.click(
    view
      .getAllByRole('button')
      .find((b: HTMLElement) => /^(Na|Cl|Cl₂)$/.test(b.textContent ?? '')) as HTMLElement
  );
}

/** Answer the first two questions of the first reaction, which is when the labels arrive. */
function pastSecondAnswer(view: ReturnType<typeof within>) {
  fireEvent.click(view.getByRole('button', { name: 'Na' }));
  fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
  answerAny(view);
}

describe('Stig 2 does not print the answer above its question', () => {
  it('shows the oxidation numbers but not which species is oxidised or reduced, until the second answer', () => {
    const { view } = start();
    wait(3000);
    const panel = diagram(view);
    // The route to the answer stays: both oxidation numbers, before and after.
    expect(panel.querySelector('[aria-label="Oxunartala Na: +1"]')).not.toBeNull();
    expect(panel.querySelector('[aria-label="Oxunartala Cl: -1"]')).not.toBeNull();
    // The answer does not.
    expect(panel.textContent).not.toMatch(LABELS);

    // Not after the first answer either, nor while "Hvað afoxast?" is asked.
    fireEvent.click(view.getByRole('button', { name: 'Na' }));
    wait(3000);
    expect(diagram(view).textContent).not.toMatch(LABELS);
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    wait(3000);
    expect(view.getByText('Hvað afoxast?')).toBeTruthy();
    expect(diagram(view).textContent).not.toMatch(LABELS);

    answerAny(view);
    wait(3000);
    expect(diagram(view).textContent).toMatch(/↑ OXAST/);
    expect(diagram(view).textContent).toMatch(/Na oxast: 0 → \+1/);
  });

  it('keeps the labels for the questions that reason from them, and hides them for the next reaction', () => {
    const { view } = start();
    pastSecondAnswer(view);
    for (let question = 3; question <= 4; question++) {
      fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
      wait(3000);
      expect(diagram(view).textContent, `question ${question}`).toMatch(/↑ OXAST/);
      answerAny(view);
    }
    fireEvent.click(view.getByRole('button', { name: /Næsta hvarf/ }));
    wait(3000);
    expect(view.getByText('Fe + CuSO₄ → FeSO₄ + Cu')).toBeTruthy();
    expect(diagram(view).textContent).not.toMatch(/OXAST|AFOXAST|oxast:|afoxast:/);
  });

  it('does not replay the animation, and hide the explanation, when a hint is opened', () => {
    const { view } = start();
    pastSecondAnswer(view);
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    wait(3000);
    expect(diagram(view).textContent).toMatch(/Na oxast:/);

    // The level's own hint button (the half-reaction tool below has one of its own).
    fireEvent.click(view.getByRole('button', { name: /💡 Sýna vísbendingu/ }));
    wait(600); // past the 500 ms at which a restarted animation hides the explanation
    expect(diagram(view).textContent).toMatch(/Na oxast:/);
  });
});

describe('Stig 2 answer order', () => {
  it('does not always put the species that is oxidised on the left', () => {
    // Six of the eight reactions list the oxidised species first, so "Hvað oxast?" was
    // answered by the left button three times in four.
    const orders = new Set<string>();
    for (let i = 0; i < 30 && orders.size < 2; i++) {
      const { view, unmount } = start();
      orders.add(
        answerButtons(view)
          .map((b) => b.textContent)
          .join(',')
      );
      unmount();
    }
    expect(orders).toEqual(new Set(['Na,Cl', 'Cl,Na']));
  });

  it('grades by the text of the option, wherever the shuffle put it', () => {
    for (let i = 0; i < 6; i++) {
      const { view, unmount } = start();
      fireEvent.click(view.getByRole('button', { name: 'Na' }));
      expect(view.getByText('Rétt!')).toBeTruthy();
      unmount();
    }
  });
});

describe('electron animation direction', () => {
  it('sends the electrons from the oxidised species toward the reduced one', () => {
    // 2Fe₂O₃ + 3C → 4Fe + 3CO₂ draws Fe first, but C is what gives electrons away.
    const { container } = render(
      <OxidationStateDisplay
        changes={[
          { element: 'Fe', before: 3, after: 0 },
          { element: 'C', before: 0, after: 4 },
        ]}
      />
    );
    wait(600);
    expect(container.querySelectorAll('.animate-electron-transfer-left')).toHaveLength(4);
    expect(container.querySelectorAll('.animate-electron-transfer')).toHaveLength(0);
  });

  it('keeps the left-to-right flight where the oxidised species is drawn first', () => {
    const { container } = render(
      <OxidationStateDisplay
        changes={[
          { element: 'Na', before: 0, after: 1 },
          { element: 'Cl', before: 0, after: -1 },
        ]}
      />
    );
    wait(600);
    expect(container.querySelectorAll('.animate-electron-transfer')).toHaveLength(1);
    expect(container.querySelectorAll('.animate-electron-transfer-left')).toHaveLength(0);
  });

  it('draws no electrons while the verdict is hidden', () => {
    const { container } = render(
      <OxidationStateDisplay
        revealVerdict={false}
        changes={[
          { element: 'Na', before: 0, after: 1 },
          { element: 'Cl', before: 0, after: -1 },
        ]}
      />
    );
    wait(600);
    expect(container.querySelectorAll('[class*="animate-electron-transfer"]')).toHaveLength(0);
    expect(container.textContent).not.toMatch(/OXAST|AFOXAST/);
  });
});
