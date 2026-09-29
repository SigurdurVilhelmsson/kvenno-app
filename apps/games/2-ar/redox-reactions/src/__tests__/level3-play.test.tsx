// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { elementSymbol, playLevel3 } from './play-level3';
import { Level3 } from '../components/Level3';
import { problems } from '../data/half-reactions';

/**
 * Stig 3 played through its real buttons. Queries are scoped to the rendered container (vitest
 * `retry: 2`, no RTL auto-cleanup), and every render is unmounted: the answer fields are found by
 * `<label htmlFor>`, and a leftover copy of the level would answer to the same id.
 */
const t = (key: string, fallback?: string) => fallback ?? key;

afterEach(cleanup);
clockPastNextGuard();

function start() {
  const onComplete = vi.fn();
  const { container, unmount } = render(<Level3 t={t} onComplete={onComplete} onBack={vi.fn()} />);
  return { view: within(container), onComplete, unmount };
}

/** Answers the identify step of the current problem and returns the verdict text. */
function identify(view: ReturnType<typeof within>, oxidized: string, reduced: string) {
  fireEvent.change(view.getByLabelText('Hvað oxast?'), { target: { value: oxidized } });
  fireEvent.change(view.getByLabelText('Hvað afoxast?'), { target: { value: reduced } });
  fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
  return view.getByTestId('step-feedback').textContent ?? '';
}

describe('Stig 3 can be finished', () => {
  it('goes on from each balanced equation, through all six problems, to onComplete', () => {
    // The balanced-equation step had no button: the only one sat inside the verdict, which is
    // cleared on the way to that step, so the level stopped at the first problem.
    const { view, onComplete } = start();
    playLevel3(view);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toBeGreaterThan(0);
  });
});

describe('Stig 3 reads a species the way a phone keyboard types it', () => {
  it('accepts every problem answered in plain ASCII, as a phone keyboard writes it', () => {
    // Cu²⁺ → Cu2+, O₂ → O2, Br⁻ → Br-, with the trailing space a word suggestion leaves.
    const ascii = (s: string) =>
      s
        .replace(/[²]/g, '2')
        .replace(/[³]/g, '3')
        .replace(/[⁺]/g, '+')
        .replace(/[⁻]/g, '-')
        .replace(/[₂]/g, '2') + ' ';
    const { view, onComplete } = start();
    playLevel3(view, ascii);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('accepts the species exactly as the question prints it', () => {
    const { view, onComplete } = start();
    playLevel3(view, (s) => s);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('still accepts the bare element symbol, as it always has', () => {
    const { view, onComplete } = start();
    playLevel3(view, elementSymbol);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('rejects the product in place of the species, a wrong charge, and a swapped pair', () => {
    for (const [ox, red] of [
      ['Zn2+', 'Cu2+'], // Zn²⁺ is what Zn becomes, not what is oxidised
      ['Zn', 'Cu+'], // the wrong charge on copper
      ['Cu', 'Zn'], // the two swapped
      ['Zn', ' '], // nothing typed but a space
    ]) {
      const { view, unmount } = start();
      fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
      expect(identify(view, ox, red)).not.toMatch(/^✓/);
      unmount();
    }
  });
});

describe('Stig 3 counts are whole numbers', () => {
  it('marks 2,5 electrons wrong where the answer is 2', () => {
    for (const value of ['2.5', '2.9', '0', '4', '1']) {
      const { view, unmount } = start();
      fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
      expect(identify(view, 'Zn', 'Cu')).toMatch(/^✓/);
      fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));
      fireEvent.change(view.getByRole('spinbutton'), { target: { value } });
      fireEvent.click(view.getByRole('button', { name: 'Athuga' }));
      expect(view.getByTestId('step-feedback').textContent).not.toMatch(/^✓/);
      unmount();
    }
  });
});

describe('Stig 3 example placeholder', () => {
  it('is not the answer to any problem', () => {
    // "t.d. Zn" sat in the "Hvað oxast?" field of the first problem, whose answer is Zn.
    const { view } = start();
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    const placeholder = view.getByLabelText('Hvað oxast?').getAttribute('placeholder') ?? '';
    const example = placeholder.replace(/^t\.d\.\s*/, '');
    expect(example).not.toBe('');
    for (const p of problems) {
      for (const species of [p.oxidationHalf.species, p.reductionHalf.species]) {
        expect(elementSymbol(species)).not.toBe(example);
      }
    }
  });
});
