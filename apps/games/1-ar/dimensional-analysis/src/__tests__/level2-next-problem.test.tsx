// @vitest-environment jsdom
/**
 * Level 2: "Næsta verkefni" starts the next problem clean, in one render.
 *
 * The per-problem state (the chain, the typed answer, the feedback) was reset
 * by an effect, which runs only after a render that already shows the next
 * problem. That render paired the NEW problem with the OLD chain — and the
 * chain is stored as option ids, which mean nothing against the next problem's
 * options — so the unit visualiser was briefly handed the new start unit with
 * the previous problem's factor units, and its cancellation animation was
 * started on a problem the student had not touched.
 */

import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { it, expect, vi, afterEach } from 'vitest';

interface Seen {
  num: string[];
  den: string[];
}
const seen: Seen[] = [];
vi.mock('../components/UnitCancellationVisualizer', async (importOriginal) => {
  const real = await importOriginal<typeof import('../components/UnitCancellationVisualizer')>();
  return {
    ...real,
    UnitCancellationVisualizer: (p: { numeratorUnits: string[]; denominatorUnits: string[] }) => {
      seen.push({ num: p.numeratorUnits, den: p.denominatorUnits });
      return null;
    },
  };
});

import { Level2 } from '../components/Level2';
import { level2Problems } from '../data/problems';

const label = (factor: string) => factor.split(' / ').join('');

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('never shows the next problem with the previous chain', () => {
  vi.useFakeTimers();
  // L2-8 (km/klst → m/s, two factors), then L2-9 (klst → s).
  const index = level2Problems.findIndex((p) => p.id === 'L2-8');
  const next = level2Problems[index + 1];
  render(
    <Level2
      onComplete={vi.fn()}
      onBack={vi.fn()}
      initialProgress={{ problemsCompleted: index, finalAnswersCorrect: 0, mastered: false }}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Skipta í smella-ham/ }));
  for (const factor of level2Problems[index].correctPath) {
    fireEvent.click(screen.getAllByRole('button').find((b) => b.textContent === label(factor))!);
  }
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: '25' } });
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
  act(() => {
    vi.advanceTimersByTime(2000);
  });

  const from = seen.length;
  fireEvent.click(screen.getByRole('button', { name: /Næsta verkefni/ }));
  const after = seen.slice(from);

  expect(screen.getByText(new RegExp(`Verkefni ${index + 2} /`))).toBeTruthy();
  // Every render since the click shows the next problem's start unit alone.
  expect(after.length).toBeGreaterThan(0);
  for (const r of after) {
    expect(r).toEqual({ num: [next.startUnit], den: [] });
  }
  // And nothing is left to animate or submit.
  expect(screen.queryByText('Stuðlar notaðir:')).toBeNull();
  expect(screen.getByRole('button', { name: /Athuga svar/ })).toHaveProperty('disabled', true);
});
