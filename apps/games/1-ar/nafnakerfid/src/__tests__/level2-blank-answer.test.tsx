import { act, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * A blank answer is not an answer. The "Athuga svar" button is disabled while
 * the field holds only whitespace, but Enter checked `userAnswer` untrimmed, so
 * a student who typed a space and pressed Enter was marked wrong on an answer
 * they never gave — "Þú skrifaðir:" followed by nothing.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

afterEach(() => {
  vi.useRealTimers();
});

function reachAnswerStep() {
  vi.useFakeTimers();
  const onIncorrectAnswer = vi.fn();
  const view = render(
    <Level2 t={t} onComplete={vi.fn()} onBack={vi.fn()} onIncorrectAnswer={onIncorrectAnswer} />
  );
  const typeButton = within(view.container)
    .getAllByRole('button')
    .find((b) => b.textContent?.startsWith('Einfalt jónefni'));
  fireEvent.click(typeButton!);
  act(() => {
    vi.advanceTimersByTime(1600);
  });
  fireEvent.click(within(view.container).getByRole('button', { name: /skrifa nafnið/ }));
  return { ...view, onIncorrectAnswer };
}

describe('Level 2 with a blank answer', () => {
  it('Enter on whitespace does not submit', () => {
    const { container, onIncorrectAnswer } = reachAnswerStep();
    const input = within(container).getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(onIncorrectAnswer).not.toHaveBeenCalled();
    expect(within(container).queryByText(/Ekki alveg/)).toBeNull();
    expect(within(container).getByRole('textbox')).toBeDefined();
  });

  it('Enter on a real answer still submits', () => {
    const { container } = reachAnswerStep();
    const input = within(container).getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Kalíumbrómíð' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(within(container).queryByRole('textbox')).toBeNull();
    expect(within(container).getAllByText('Kalíumbrómíð').length).toBeGreaterThan(0);
  });
});
