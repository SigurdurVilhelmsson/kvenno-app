// @vitest-environment jsdom
import { act, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1, quizQuestions } from '../components/Level1';
import { Level2, challenges } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { COMPOUNDS } from '../data/compounds';
import { segmentName } from '../data/naming';

clockPastNextGuard();

/**
 * No running score while a student practises — mobile-pass decision 1 (b),
 * applied to this game. Every level showed `Stig: N` as it went (and the
 * warm-up a `Rétt: x / y` tally); the menu then showed points over three
 * different denominators. Each level now reports how many were right, and the
 * menu shows `N af M rétt`.
 *
 * The counting rule: a right answer counts, except one given after the game
 * had already shown it. Level 3 prints "Rétt nafn: …" on a wrong check and
 * then offers "Reyna aftur", so a name built after that is not counted.
 *
 * These play the real components through their buttons. Queries are scoped to
 * each rendered container (the repo runs vitest with `retry: 2`).
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

afterEach(() => {
  vi.useRealTimers();
});

function clickButton(container: HTMLElement, name: RegExp) {
  fireEvent.click(within(container).getByRole('button', { name }));
}

/** A running score: "Stig: 30", "30 stig", or a "Rétt: x / y" tally. */
function expectNoRunningScore(container: HTMLElement) {
  const text = container.textContent ?? '';
  expect(text).not.toMatch(/\bStig:\s*\d/);
  expect(text).not.toMatch(/\d+\s*stig\b/);
  expect(text).not.toMatch(/Rétt:\s*\d/);
  const tiles = [...container.querySelectorAll('div')].filter(
    (d) => d.children.length === 0 && d.textContent === 'Stig'
  );
  expect(tiles).toEqual([]);
}

describe('Level 1', () => {
  function play(rightAt: (q: number) => boolean) {
    const onComplete = vi.fn();
    const { container } = render(<Level1 t={t} onComplete={onComplete} onBack={vi.fn()} />);

    // Four rules, then the warm-up, which is not counted for the level.
    for (let i = 0; i < 3; i++) clickButton(container, /Næsta regla/);
    clickButton(container, /Hefja próf/);
    for (let i = 0; i < 8; i++) {
      clickButton(container, /^Málmur/);
      expectNoRunningScore(container);
      clickButton(container, i < 7 ? /Næsta frumefni/ : /Hefja próf/);
    }

    // The options are shuffled at render, so find them by their text.
    for (let q = 0; q < quizQuestions.length; q++) {
      expectNoRunningScore(container);
      const { options, correctIndex } = quizQuestions[q];
      const pick = rightAt(q) ? correctIndex : (correctIndex + 1) % options.length;
      const button = within(container)
        .getAllByRole('button')
        .find((b) => b.textContent?.replace(/^[A-D]\./, '') === options[pick]);
      expect(button, `question ${q + 1}`).toBeDefined();
      fireEvent.click(button!);
      expectNoRunningScore(container);
      clickButton(container, q < quizQuestions.length - 1 ? /Næsta spurning/ : /Ljúka stigi/);
    }
    return onComplete;
  }

  it('reports every question right on a perfect run', () => {
    const onComplete = play(() => true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(quizQuestions.length, quizQuestions.length);
    expect(quizQuestions.length).toBe(10);
  });

  it('does not count a wrong answer', () => {
    const onComplete = play((q) => q % 2 === 0);
    expect(onComplete).toHaveBeenCalledWith(5, 10);
  });
});

describe('Level 2', () => {
  const TYPE_LABELS = {
    'ionic-simple': 'Einfalt jónefni',
    'ionic-variable': 'Jónefni (breytileg hleðsla)',
    'ionic-polyatomic': 'Jónefni (fjölatóma jón)',
    molecular: 'Sameind',
  } as const;

  function play(nameRightAt: (i: number) => boolean) {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = render(<Level2 t={t} onComplete={onComplete} onBack={vi.fn()} />);

    challenges.forEach((challenge, i) => {
      expectNoRunningScore(container);
      // Every third item picks the wrong type: the type is a step towards the
      // name, and is not counted on its own.
      const type =
        i % 3 === 2
          ? (Object.keys(TYPE_LABELS) as (keyof typeof TYPE_LABELS)[]).find(
              (k) => k !== challenge.type
            )!
          : challenge.type;
      const typeButton = within(container)
        .getAllByRole('button')
        .find((b) => b.textContent?.startsWith(TYPE_LABELS[type]));
      fireEvent.click(typeButton!);
      // Step 1 moves on by itself after 1.5 s.
      act(() => {
        vi.advanceTimersByTime(1600);
      });
      clickButton(container, /skrifa nafnið/);
      fireEvent.change(within(container).getByRole('textbox'), {
        target: { value: nameRightAt(i) ? challenge.correctName : 'Vatn' },
      });
      clickButton(container, /^Athuga svar$/);
      expectNoRunningScore(container);
      // Fake timers own the clock here: step past the Næsta guard.
      act(() => {
        vi.advanceTimersByTime(500);
      });
      clickButton(container, i < challenges.length - 1 ? /Næsta efnasamband/ : /Ljúka stigi/);
    });
    return onComplete;
  }

  it('reports every compound right on a perfect run', () => {
    const onComplete = play(() => true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(challenges.length, challenges.length);
    expect(challenges.length).toBe(12);
  });

  it('counts the names, and not a wrong one', () => {
    const onComplete = play((i) => i < 9);
    expect(onComplete).toHaveBeenCalledWith(9, 12);
  });
});

describe('Level 3', () => {
  const nameFor = (formula: string) => COMPOUNDS.find((c) => c.formula === formula)!.name;

  it('does not count a name built after "Rétt nafn" has shown it', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level3 t={t} onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    const tray = () => ui.getByText('Tiltækir partar:').parentElement as HTMLElement;

    const build = (formula: string) => {
      for (const segment of segmentName(nameFor(formula))!) {
        const part = within(tray())
          .getAllByRole('button')
          .find((b) => b.textContent === segment.text);
        fireEvent.click(part!);
      }
    };

    for (let question = 0; question < 10; question++) {
      expectNoRunningScore(container);
      const formula = ui
        .getByText('Efnaformúla:')
        .parentElement!.querySelector('.font-mono')!
        .textContent!.trim();
      if (question < 3) {
        // Wrong first: one part that is not the name, checked.
        const wrong = within(tray())
          .getAllByRole('button')
          .find((b) => !nameFor(formula).toLowerCase().startsWith(b.textContent!.toLowerCase()));
        fireEvent.click(wrong!);
        fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
        expect(container.textContent).toContain(`Rétt nafn: ${nameFor(formula)}`);
        expectNoRunningScore(container);
        // Then right, after the answer was shown.
        fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
      }
      build(formula);
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      expectNoRunningScore(container);
      const next = ui.queryByRole('button', { name: /Næsta efni/ });
      fireEvent.click(next ?? ui.getByRole('button', { name: 'Sjá niðurstöður' }));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(7, 10);
  });
});
