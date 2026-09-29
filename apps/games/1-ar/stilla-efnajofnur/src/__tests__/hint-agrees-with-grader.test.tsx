import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level } from '../components/Level';
import { LEVEL3_CONFIG } from '../components/levelConfigs';
import { REACTIONS, type Reaction } from '../data/reactions';

/**
 * Stig 3's hint is computed live from the atom counts, and it used to look only
 * at whether the atoms balance. The grader also requires the lowest whole
 * numbers (B12), so on a doubled set — `4Al + 2Fe₂O₃ → 2Al₂O₃ + 4Fe` — the hint
 * said the equation looked balanced and told the student to press Athuga, and
 * Athuga then marked it wrong. Each equation is answered once, so the hint
 * spent the student's only attempt for them.
 *
 * This plays every Stig 3 equation through the real buttons: the lowest set
 * first, where the hint must say go ahead, then the doubled set wherever the
 * steppers can reach it, where the hint must say what is still wrong — and the
 * grader must agree with whichever the hint said.
 */

clockPastNextGuard();

beforeEach(() => {
  // jsdom does not implement page scrolling; the level scrolls through the
  // shared reveal helpers.
  window.scrollTo = () => {};
  window.scrollBy = () => {};
});

afterEach(() => {
  cleanup();
});

const MAX_COEFFICIENT = 9; // EquationEditor's stepper ceiling

/** The reaction on screen, identified by the formulas its steppers name. */
function currentReaction(): Reaction {
  const formulas = screen
    .getAllByRole('spinbutton')
    .map((el) => el.getAttribute('aria-label')!.replace(/^Stuðull /, ''));
  const match = REACTIONS.filter((r) => r.difficulty === 'hard').find(
    (r) => [...r.reactants, ...r.products].map((m) => m.formula).join('|') === formulas.join('|')
  );
  if (!match) throw new Error(`no hard reaction matches ${formulas.join(', ')}`);
  return match;
}

/** Step every coefficient up to `targets`, through the + buttons. */
function stepTo(targets: number[]) {
  const spinners = screen.getAllByRole('spinbutton');
  const plus = screen.getAllByRole('button', { name: /^Hækka stuðul/ });
  targets.forEach((target, i) => {
    while (Number(spinners[i].getAttribute('aria-valuenow')) < target) fireEvent.click(plus[i]);
  });
}

const hintText = () => screen.getByText('Vísbending:').parentElement!.textContent ?? '';

describe('Stig 3 hint', () => {
  it('never sends a doubled set to Athuga, and the grader agrees with it', () => {
    render(<Level config={LEVEL3_CONFIG} onBack={() => {}} onComplete={() => {}} />);
    const total = REACTIONS.filter((r) => r.difficulty === 'hard').length;
    let doubledSeen = 0;

    for (let n = 0; n < total; n++) {
      const reaction = currentReaction();
      const answer = [...reaction.reactants, ...reaction.products].map((m) => m.coefficient);
      const doubled = answer.map((c) => c * 2);
      const reachable = doubled.every((c) => c <= MAX_COEFFICIENT);

      fireEvent.click(screen.getByRole('button', { name: 'Vísbending' }));
      stepTo(answer);
      expect(hintText(), `reaction ${reaction.id}, lowest set`).toMatch(/smelltu á Athuga/);

      if (reachable) {
        doubledSeen++;
        stepTo(doubled);
        const hint = hintText();
        expect(hint, `reaction ${reaction.id}, doubled`).not.toMatch(/smelltu á Athuga/);
        expect(hint, `reaction ${reaction.id}, doubled`).toMatch(/lægstu heilu tölum/);

        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
        expect(document.body.textContent).toMatch(/ekki í lægstu heilu tölum/);
      } else {
        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
        expect(document.body.textContent).toMatch(/Rétt! Efnajafnan er stillt/);
      }

      fireEvent.click(screen.getByRole('button', { name: /Næsta efnajafna|Sjá niðurstöður/ }));
    }

    // Fe + H₂O and Al + Fe₂O₃ both double within the steppers' range; without
    // them the doubled branch would pass vacuously.
    expect(doubledSeen).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Niðurstöður')).toBeTruthy();
  });
});
