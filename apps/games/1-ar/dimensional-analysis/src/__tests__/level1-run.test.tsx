// @vitest-environment jsdom
/**
 * Stig 1 (Hugtök), played end to end through the real challenge components.
 *
 * Three defects made this level impossible to finish, its count wrong, or a
 * challenge skippable, and all three lived in how the level hands work to its
 * challenge components rather than in any one challenge:
 *
 * - C5 and C6 both render `<CancellationChallenge>`, which renders
 *   `ChainCancellation` for both, at the same place in the tree. React kept
 *   C5's finished state, so C6 opened already reading "Keðjan virkaði!" with no
 *   factor to choose, no success card and no way to finish the level.
 * - C1 and C2 reported success from a `useEffect` that listed `onComplete` in
 *   its dependencies, while the level passed a fresh `handleSuccess` on every
 *   render and `handleSuccess` itself set state. Each success re-rendered the
 *   level, which re-ran the effect, which reported success again: a render loop
 *   that pinned a CPU core and counted C1 thousands of times.
 * - C4 and the chains report success from timers. A second correct tap left a
 *   second timer pending, and if the student moved on before it fired it
 *   marked the NEXT challenge solved before it was played.
 *
 * The level counts one success per challenge (100 each towards `maxScore`;
 * `initialProgress.questionsAnswered` doubles as the index to resume at). The
 * run below also taps the correct factor twice on C4 and C5, and again on C4
 * after it is solved, because a count that trusts every call would drift.
 */

import { useState, type ComponentType } from 'react';

import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

import { EquivalenceChallenge } from '../components/challenges/EquivalenceChallenge';
import { FactorBuildingChallenge } from '../components/challenges/FactorBuildingChallenge';
import { OrientationChallenge } from '../components/challenges/OrientationChallenge';
import { Level1Conceptual } from '../components/Level1Conceptual';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** A conversion-factor button, found by its numerator and denominator text. */
function factor(numerator: string, denominator: string): HTMLElement | undefined {
  return screen.getAllByRole('button').find((b) => b.textContent === numerator + denominator);
}
function click(el: HTMLElement | undefined, what: string) {
  if (!el) throw new Error(`no button for ${what} on this screen`);
  fireEvent.click(el);
}
function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}
function next() {
  fireEvent.click(screen.getByRole('button', { name: /Næsta áskorun/ }));
}

function setup() {
  const onComplete = vi.fn();
  // Counts `handleSuccess` calls. Past a bound it throws, so a render loop
  // fails this test instead of hanging it inside `act`.
  const onCorrectAnswer = vi.fn(() => {
    if (onCorrectAnswer.mock.calls.length > 50) {
      throw new Error('Stig 1 reported success more than 50 times: a render loop');
    }
  });
  render(
    <Level1Conceptual onComplete={onComplete} onBack={vi.fn()} onCorrectAnswer={onCorrectAnswer} />
  );
  fireEvent.click(screen.getByRole('button', { name: /Byrja/ }));
  return { onComplete, onCorrectAnswer };
}

function solveC1() {
  fireEvent.click(screen.getByRole('button', { name: 'Bæta við 1 lítra' }));
}
function solveC2() {
  fireEvent.click(screen.getByRole('button', { name: '1000 mL' }));
  fireEvent.click(screen.getByRole('button', { name: '1 L' }));
}
function solveC3() {
  click(factor('1 L', '1000 mL'), 'C3 1 L / 1000 mL');
  wait(1600);
}
function solveC4TwiceAndAgain() {
  click(factor('1000 m', '1 km'), 'C4 1000 m / 1 km');
  click(factor('1000 m', '1 km'), 'C4 1000 m / 1 km (double tap)');
  wait(1300);
  click(factor('1000 m', '1 km'), 'C4 1000 m / 1 km (after it was solved)');
  wait(1300);
}
function solveC5DoubleTappingTheLastStep() {
  click(factor('1 g', '1000 mg'), 'C5 step 1');
  wait(900);
  click(factor('1 kg', '1000 g'), 'C5 step 2');
  click(factor('1 kg', '1000 g'), 'C5 step 2 (double tap)');
  wait(900);
}

describe('Stig 1 challenge components', () => {
  it('reports C1 once, not in a render loop', () => {
    const { onCorrectAnswer } = setup();
    solveC1();
    wait(2000);
    expect(onCorrectAnswer).toHaveBeenCalledTimes(1);
  });

  it('reports C2 once, not in a render loop', () => {
    const { onCorrectAnswer } = setup();
    solveC1();
    next();
    solveC2();
    wait(2000);
    expect(onCorrectAnswer).toHaveBeenCalledTimes(2);
  });

  it('opens C6 on its own chain, not on C5 already finished', () => {
    setup();
    solveC1();
    next();
    solveC2();
    next();
    solveC3();
    next();
    solveC4TwiceAndAgain();
    next();
    solveC5DoubleTappingTheLastStep();
    expect(screen.getByText('Keðjan virkaði!')).toBeTruthy();
    next();

    expect(screen.getByText(/Áskorun 6 \/ 6/)).toBeTruthy();
    expect(screen.queryByText('Keðjan virkaði!')).toBeNull();
    expect(factor('60 mín', '1 klst'), 'C6 step 1 offers its factor').toBeTruthy();
  });
});

describe('a full Stig 1 run', () => {
  it('can be finished, and counts each of the six challenges once', () => {
    const { onComplete, onCorrectAnswer } = setup();
    solveC1();
    next();
    solveC2();
    next();
    solveC3();
    next();
    solveC4TwiceAndAgain();
    next();
    solveC5DoubleTappingTheLastStep();
    next();
    click(factor('60 mín', '1 klst'), 'C6 step 1');
    wait(900);
    click(factor('60 s', '1 mín'), 'C6 step 2');
    wait(900);

    fireEvent.click(screen.getByRole('button', { name: 'Ljúka stigi' }));
    expect(screen.getByText(/Þú svaraðir \d+ af 6 rétt/).textContent).toBe(
      'Þú svaraðir 6 af 6 rétt'
    );
    expect(onCorrectAnswer).toHaveBeenCalledTimes(6);
    // Levels are not gated (2026-08-29): the summary points on, it opens nothing.
    expect(screen.getByText('Næsta skref: Stig 2')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Halda áfram/ }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({
      questionsAnswered: 6,
      questionsCorrect: 6,
      mastered: true,
    });
    expect(onComplete.mock.calls[0][1], 'maxScore, 100 per challenge').toBe(600);
  });
});

describe('a success timer from a finished challenge', () => {
  // The student taps the correct factor twice, the first timer solves the
  // challenge, and they move on before the second one fires. Without the
  // level's once-per-challenge guard that stale timer showed "Rétt!" and the
  // next button on a challenge nobody had played.
  it.each([
    ['C4 → C5', 3],
    ['C5 → C6', 4],
  ])('%s: does not mark the next challenge solved', (_label, stopAt) => {
    const { onCorrectAnswer } = setup();
    solveC1();
    next();
    solveC2();
    next();
    solveC3();
    next();
    if (stopAt === 3) {
      click(factor('1000 m', '1 km'), 'C4');
      wait(400);
      click(factor('1000 m', '1 km'), 'C4 again, its timer still pending');
      wait(800); // the first timer fires: C4 solved
      next(); // the student moves on before the second timer fires
    } else {
      click(factor('1000 m', '1 km'), 'C4');
      wait(1300);
      next();
      click(factor('1 g', '1000 mg'), 'C5 step 1');
      wait(900);
      click(factor('1 kg', '1000 g'), 'C5 step 2');
      wait(400);
      click(factor('1 kg', '1000 g'), 'C5 step 2 again, its timer still pending');
      wait(400); // the first timer fires: C5 solved
      next();
    }
    wait(2000); // the stale timer fires on the next challenge

    expect(screen.queryByText('Rétt!')).toBeNull();
    expect(screen.queryByRole('button', { name: /Næsta áskorun|Ljúka stigi/ })).toBeNull();
    expect(onCorrectAnswer).toHaveBeenCalledTimes(stopAt + 1);
  });
});

type ChallengeProps = { onComplete: () => void; onAttempt: (isIncorrect?: boolean) => void };

/**
 * A parent that re-renders whenever it is told of a success, handing down a new
 * `onComplete` each time — what Level1Conceptual does. A challenge that reports
 * from an effect keyed on `onComplete` loops under it; one that reports from the
 * click does not. This holds the components to that on their own, since the
 * level's once-per-challenge guard would otherwise hide a regression here.
 */
function rerenderingParent(Challenge: ComponentType<ChallengeProps>) {
  const reports = vi.fn(() => {
    if (reports.mock.calls.length > 50) throw new Error('reported success in a loop');
  });
  function Parent() {
    const [, setRenders] = useState(0);
    return (
      <Challenge
        onAttempt={() => {}}
        onComplete={() => {
          reports();
          setRenders((n) => n + 1);
        }}
      />
    );
  }
  render(<Parent />);
  return reports;
}

describe('a challenge component reports its success once', () => {
  it('C1, EquivalenceChallenge', () => {
    const reports = rerenderingParent(EquivalenceChallenge);
    fireEvent.click(screen.getByRole('button', { name: 'Bæta við 1 lítra' }));
    wait(1000);
    expect(reports).toHaveBeenCalledTimes(1);
  });

  it('C2, FactorBuildingChallenge', () => {
    const reports = rerenderingParent(FactorBuildingChallenge);
    fireEvent.click(screen.getByRole('button', { name: '1 L' }));
    fireEvent.click(screen.getByRole('button', { name: '1000 mL' }));
    wait(1000);
    expect(reports).toHaveBeenCalledTimes(1);
  });

  it('C2 reports nothing for a fraction that is not 1', () => {
    const reports = rerenderingParent(FactorBuildingChallenge);
    fireEvent.click(screen.getByRole('button', { name: '1 L' }));
    fireEvent.click(screen.getByRole('button', { name: '500 mL' }));
    expect(screen.getByText('Ekki sama rúmmálið!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '1 L' }));
    fireEvent.click(screen.getByRole('button', { name: '1 L' }));
    expect(screen.getByText('Sömu einingarnar!')).toBeTruthy();
    expect(reports).not.toHaveBeenCalled();
  });

  it('C4, OrientationChallenge: a second correct tap schedules no second report', () => {
    // Both factors stay clickable, since the instruction is to try both.
    const reports = rerenderingParent(OrientationChallenge);
    click(factor('1000 m', '1 km'), 'C4 correct factor');
    wait(400);
    click(factor('1000 m', '1 km'), 'C4 correct factor again');
    click(factor('1 km', '1000 m'), 'C4 wrong factor after the right one');
    wait(2000);
    expect(reports).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Virkar ekki!')).toBeTruthy();
  });
});
