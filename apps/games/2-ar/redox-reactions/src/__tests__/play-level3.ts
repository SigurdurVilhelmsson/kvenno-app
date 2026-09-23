import { fireEvent, within } from '@testing-library/react';
import { expect } from 'vitest';

import { problems } from '../data/half-reactions';

type View = ReturnType<typeof within>;

/** `Cu²⁺` → `Cu`, `O₂` → `O`: the answer form the identify step has always accepted. */
export const elementSymbol = (species: string) => species.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉]/g, '');

/**
 * Plays Stig 3 through its real buttons from the intro screen to the last "Ljúka stigi", answering
 * every step correctly, naming each species by `identify`. The button labels differ between a test `t` (fallbacks) and the game's
 * own translations (`common.next` is "Næsta"), so each is matched by what it does.
 */
export function playLevel3(view: View, identify = elementSymbol) {
  fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

  const stepOn = () =>
    fireEvent.click(view.getByRole('button', { name: /^(Halda áfram|Næsta) →$/ }));

  for (const problem of problems) {
    fireEvent.change(view.getByLabelText('Hvað oxast?'), {
      target: { value: identify(problem.oxidationHalf.species) },
    });
    fireEvent.change(view.getByLabelText('Hvað afoxast?'), {
      target: { value: identify(problem.reductionHalf.species) },
    });
    fireEvent.click(view.getByRole('button', { name: /^(Athuga svar|Staðfesta)$/ }));
    expect(view.getByTestId('step-feedback').textContent).toMatch(/^✓/);
    stepOn();

    fireEvent.change(view.getByRole('spinbutton'), {
      target: { value: String(problem.oxidationHalf.electrons) },
    });
    fireEvent.click(view.getByRole('button', { name: /^(Athuga|Staðfesta)$/ }));
    expect(view.getByTestId('step-feedback').textContent).toMatch(/^✓/);
    stepOn();

    fireEvent.change(view.getByRole('spinbutton'), {
      target: { value: String(problem.reductionHalf.electrons) },
    });
    fireEvent.click(view.getByRole('button', { name: /^(Athuga|Staðfesta)$/ }));
    expect(view.getByTestId('step-feedback').textContent).toMatch(/^✓/);
    stepOn();

    const [ox, red] = view.getAllByRole('spinbutton');
    fireEvent.change(ox, { target: { value: String(problem.multiplierOx) } });
    fireEvent.change(red, { target: { value: String(problem.multiplierRed) } });
    fireEvent.click(view.getByRole('button', { name: /Athuga margfaldara/ }));
    expect(view.getByTestId('step-feedback').textContent).toMatch(/^✓/);
    stepOn();

    // The balanced equation, and the only way on from it.
    expect(view.getByRole('heading', { name: 'Stillt efnajafna!' })).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: /^(Næsta dæmi|Ljúka stigi) →$/ }));
  }
}
