import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { gradeScientific } from '@shared/utils';

import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { COUPLED_PROBLEMS } from '../data/coupled';
import { BEITA_PROBLEMS, KP_PROBLEMS } from '../data/problems';

/**
 * The example in an answer field must not be an answer.
 *
 * **Why this exists.** All three scientific-notation rows shipped a
 * placeholder that the grader marked right on a problem in the same task:
 * Beita's `1,35 × 10⁻¹` is the PCl₅ extent, its first problem; Kc→Kp's
 * `6,5 × 10⁰` is within 2 % of its first answer, 6,54 — and the "fill in both
 * fields" message repeated it as `t.d. 6,5 og 0`; and the coupled task's
 * `2,5 × 10⁵` is the book's worked example exactly, with the same digits as the
 * problem before it. A student who typed the grey text was marked right.
 *
 * So each example is graded against every answer its task serves, and must
 * not come back right — nor with the digits right and only the power wrong,
 * which is the same leak one field over. The check is 5 %, wider than any
 * tolerance the game grades at, so a nearby answer added later is caught too.
 */

afterEach(cleanup);

const MARGIN = 0.05;

function expectNotAnAnswer(
  where: string,
  example: { mantissa: string; exponent: string },
  answers: number[]
) {
  for (const answer of answers) {
    const { outcome } = gradeScientific(example, answer, MARGIN);
    expect(
      outcome,
      `${where}: the example ${example.mantissa} × 10^${example.exponent} matches the answer ${answer}`
    ).not.toBe('rett');
    expect(
      outcome,
      `${where}: the example ${example.mantissa} has the digits of the answer ${answer}`
    ).not.toBe('veldisvisir');
  }
}

function placeholders() {
  return {
    mantissa: (screen.getByLabelText('Tala') as HTMLInputElement).placeholder,
    exponent: (screen.getByLabelText('Veldisvísir') as HTMLInputElement).placeholder,
  };
}

describe('no answer field shows an answer as its example', () => {
  it('Kc → Kp', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    const answers = KP_PROBLEMS.map((p) => p.kp);
    expectNotAnAnswer('Kc→Kp placeholder', placeholders(), answers);

    // The message for an empty check gives an example too.
    fireEvent.click(screen.getByText('Athuga'));
    const message = screen.getByText(/Fylltu í báða reitina/).textContent ?? '';
    const example = message.match(/t\.d\. ([\d,]+) og (-?\d+)/);
    expect(example, 'the empty-check message no longer gives an example').not.toBeNull();
    expectNotAnAnswer(
      'Kc→Kp empty-check message',
      { mantissa: example![1], exponent: example![2] },
      answers
    );
  });

  it('Tengd jafnvægi', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Tengd jafnvægi'));
    // Reach the constant field by doing the first problem's operations.
    const cards = screen
      .getAllByText('Snúa við')
      .map((button) => button.closest('div.rounded-xl') as HTMLElement);
    COUPLED_PROBLEMS[0].route.forEach((step, i) => {
      if (step.reversed) fireEvent.click(within(cards[i]).getByText('Snúa við'));
      if (step.factor !== 1) fireEvent.click(within(cards[i]).getByText(String(step.factor)));
    });
    fireEvent.click(screen.getByText('Athuga jöfnuna'));
    expectNotAnAnswer(
      'coupled placeholder',
      placeholders(),
      COUPLED_PROBLEMS.map((p) => p.result.constant!.value)
    );
  });

  it('Beita', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    expectNotAnAnswer(
      'Beita placeholder',
      placeholders(),
      BEITA_PROBLEMS.map((p) => p.result.extent)
    );
  });
});

describe('an empty check is not an answer', () => {
  // Kc→Kp grades once and then shows the answer. An empty "Athuga" used to be
  // that one attempt: the fields locked, Kp was printed, and the message above
  // it said "Fylltu í báða reitina" about two fields that could no longer be
  // filled. The coupled task and Beita already let an empty check be retried.
  it('Kc → Kp keeps the fields open and the answer hidden', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    fireEvent.click(screen.getByText('Athuga'));

    expect(screen.getByText(/Fylltu í báða reitina/)).toBeTruthy();
    const mantissa = screen.getByLabelText('Tala') as HTMLInputElement;
    const exponent = screen.getByLabelText('Veldisvísir') as HTMLInputElement;
    expect(mantissa.disabled, 'the fields it asks to be filled are locked').toBe(false);
    expect(exponent.disabled).toBe(false);
    expect(screen.queryByText('Næsta dæmi'), 'an empty check moved on').toBeNull();
    expect(
      document.body.textContent,
      'an empty check printed the answer it was meant to be asked for'
    ).not.toMatch(/Kp = \d/);

    // And the student can still answer it.
    const kp = KP_PROBLEMS[0].kp;
    const power = Math.floor(Math.log10(kp));
    fireEvent.change(mantissa, {
      target: { value: (kp / 10 ** power).toFixed(2).replace('.', ',') },
    });
    fireEvent.change(exponent, { target: { value: String(power) } });
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByText('Rétt.')).toBeTruthy();
    expect(screen.getByText('Næsta dæmi')).toBeTruthy();
  });
});

describe('every answer row says what it is an answer for', () => {
  // The fields themselves are "Tala" and "Veldisvísir" in all three tasks, so
  // without a name on the row a screen reader never says which quantity is
  // being asked for. Kc→Kp's heading was a `<label>` tied to no control.
  it('Kc → Kp names its row Kp', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    const row = screen.getByRole('group', { name: 'Kp' });
    expect(within(row).getByLabelText('Tala')).toBeTruthy();
    expect(within(row).getByLabelText('Veldisvísir')).toBeTruthy();
  });

  it('Beita names its row by the unknown', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    const row = screen.getByRole('group', { name: 'x =' });
    expect(within(row).getByLabelText('Tala')).toBeTruthy();
  });
});

describe('every choice says whether it is chosen', () => {
  // The species picked for an expression, the reversed equation, the factor
  // and the mixture on show were marked by colour alone, so a screen reader
  // read each one as a plain button whether it was on or off.
  const pressed = (el: HTMLElement) => el.getAttribute('aria-pressed');

  it('Kanna marks the mixture on show', () => {
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    const first = screen.getByRole('button', { name: /Bara hvarfefni/ });
    const second = screen.getByRole('button', { name: /Bara myndefni/ });
    expect(pressed(first)).toBe('true');
    expect(pressed(second)).toBe('false');
    fireEvent.click(second);
    expect(pressed(first)).toBe('false');
    expect(pressed(second)).toBe('true');
  });

  it('Skrifa stæðuna marks the species picked', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const chip = screen.getAllByRole('button').find((b) => b.textContent?.includes('(g)'))!;
    expect(pressed(chip)).toBe('false');
    fireEvent.click(chip);
    expect(pressed(chip)).toBe('true');
  });

  it('Tengd jafnvægi marks the reversal and the factor', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Tengd jafnvægi'));
    const reverse = screen.getAllByRole('button', { name: 'Snúa við' })[0];
    expect(pressed(reverse)).toBe('false');
    fireEvent.click(reverse);
    expect(pressed(reverse)).toBe('true');

    const factors = screen.getAllByRole('group', { name: 'Margfalda með' })[0];
    expect(pressed(within(factors).getByRole('button', { name: '1' }))).toBe('true');
    fireEvent.click(within(factors).getByRole('button', { name: '2' }));
    expect(pressed(within(factors).getByRole('button', { name: '1' }))).toBe('false');
    expect(pressed(within(factors).getByRole('button', { name: '2' }))).toBe('true');
  });
});
