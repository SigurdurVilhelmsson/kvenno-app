// @vitest-environment jsdom
/**
 * Where the correct conversion factor sits in Stig 1's two chain challenges.
 *
 * C5 (mg → g → kg) and C6 (klst → mín → s) each offer two factors per step, and
 * the data lists the correct one first in all four steps. The chain rendered
 * them in data order, so "tap the top one" (the left one on a desktop) solved
 * both challenges without reading a unit. C3 already shuffled its two factors;
 * the chains now shuffle each step once, when the challenge mounts.
 *
 * The step-1 feedback line named `factors[0]`'s denominator as the unit that
 * cancels, which was right only while the correct factor was first. It now
 * names the correct factor's, wherever the shuffle put it.
 *
 * `Math.random` is pinned to each end of its range: at 0 the two-element
 * Fisher–Yates in `shuffleArray` swaps, at 0.99 it keeps the data order. Every
 * query is scoped to this test's own container (the repo runs vitest with
 * `retry: 2`).
 */

import { cleanup, fireEvent, render, act, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CancellationChallenge } from '../components/challenges/CancellationChallenge';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

type Variant = 'mg-to-kg' | 'time-chain';

/** Each step: the correct factor and the wrong one, as numerator + denominator text. */
const CHAINS: Record<Variant, { correct: string; wrong: string; cancels: string; left: string }[]> =
  {
    'mg-to-kg': [
      { correct: '1 g1000 mg', wrong: '1000 mg1 g', cancels: 'mg', left: '5 g' },
      { correct: '1 kg1000 g', wrong: '1000 g1 kg', cancels: 'g', left: '0,005 kg' },
    ],
    'time-chain': [
      { correct: '60 mín1 klst', wrong: '1 klst60 mín', cancels: 'klst', left: '60 mín' },
      { correct: '60 s1 mín', wrong: '1 mín60 s', cancels: 'mín', left: '3600 s' },
    ],
  };

function mount(variant: Variant, random: number) {
  vi.spyOn(Math, 'random').mockReturnValue(random);
  const onComplete = vi.fn();
  const { container } = render(
    <CancellationChallenge variant={variant} onComplete={onComplete} onAttempt={vi.fn()} />
  );
  const ui = within(container);
  /** The factor buttons of the active step, in the order the student sees them. */
  const factors = () => ui.getAllByRole('button').map((b) => b.textContent ?? '');
  const tap = (text: string) => {
    const button = ui.getAllByRole('button').find((b) => b.textContent === text);
    if (!button) throw new Error(`no factor ${text}; on screen: ${factors().join(', ')}`);
    fireEvent.click(button);
  };
  return { ui, onComplete, factors, tap };
}

describe.each(Object.keys(CHAINS) as Variant[])('the %s chain', (variant) => {
  it('does not always put the correct factor first', () => {
    const firsts = new Set<string>();
    for (const random of [0, 0.99]) {
      const { factors, tap } = mount(variant, random);
      for (const step of CHAINS[variant]) {
        firsts.add(factors()[0] === step.correct ? 'correct' : 'wrong');
        tap(step.correct);
        act(() => {
          vi.advanceTimersByTime(900);
        });
      }
      cleanup();
      vi.restoreAllMocks();
    }
    expect([...firsts].sort()).toEqual(['correct', 'wrong']);
  });

  it.each([0, 0.99])('grades the factor, not its position (Math.random → %s)', (random) => {
    const { ui, onComplete, factors, tap } = mount(variant, random);
    const [first, second] = CHAINS[variant];
    expect(factors().sort()).toEqual([first.correct, first.wrong].sort());

    tap(first.wrong);
    expect(
      ui.getByText(`${first.cancels} þarf að vera í nefnara til að strikast út!`)
    ).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(factors().sort(), 'a wrong factor does not advance the chain').toEqual(
      [first.correct, first.wrong].sort()
    );

    tap(first.correct);
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(
      ui.getByText(`✓ ${first.cancels} strikast út! Nú eru eftir ${first.left}.`, {
        normalizer: (s) => s.replace(/\s+/g, ' ').trim(),
      })
    ).toBeTruthy();

    tap(second.correct);
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(ui.getByText('Keðjan virkaði!')).toBeTruthy();
  });
});
