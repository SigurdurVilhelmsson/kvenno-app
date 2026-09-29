// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level2 } from '../components/Level2';

// The buttons that follow an answer ignore a press within 400 ms of appearing.
clockPastNextGuard();

/**
 * Stig 2's Byggja mode: the student reads a name and builds the chain.
 *
 * - **A chain built from the other end is the same molecule.** C–C–C=C, with the double bond
 *   between C3 and C4, is 1-búten: the game's own rule is to number from the end that gives the
 *   double bond the lowest number, and Stig 1's Sameindasmiður names that very chain 1-búten.
 *   The grader compared bond positions as drawn and marked it wrong.
 * - **The progress bar counted only correct answers**, so after a wrong one it fell behind the
 *   "Áskorun n af 10" counter above it.
 * - **Every bond button had the same accessible name** — its title, "Smelltu til að breyta
 *   tengingu" — so a screen reader could not tell the bonds apart or hear what each one was.
 *
 * Names are matched with or without their accents, so the grading tests fail for the grading
 * defect alone. Queries are scoped to the rendered container: the repo runs vitest with
 * retries and no RTL auto-cleanup.
 */

function openBuild() {
  const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Byggja sameindir/ }));
  // Bond buttons, found by position alone so the grading tests do not depend on their names
  const bond = (from: number) =>
    rendered.container.querySelectorAll('.bg-warm-900 button')[from - 1] as HTMLElement;
  const skipTo = (challenge: number) => {
    for (let i = 1; i < challenge; i++) {
      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    }
    expect(ui.getByText(new RegExp(`Áskorun ${challenge} af`))).toBeTruthy();
  };
  const progress = () =>
    (rendered.container.querySelector('.bg-emerald-500.h-2') as HTMLElement).style.width;
  return { ui, bond, skipTo, progress, container: rendered.container };
}

describe('Byggja: a chain numbered from the other end is the same molecule', () => {
  it('accepts 1-búten built between C3 and C4, and says where it was counted from', () => {
    const { ui, bond, skipTo, container } = openBuild();
    skipTo(5);
    expect(ui.getByText(/^1-b[uú]ten$/)).toBeTruthy();

    fireEvent.click(bond(3)); // double bond C3=C4 on the default four carbons
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(container.textContent).toMatch(
      /Rétt! 1-b[uú]ten hefur 4 kolefni og tvítengi á stað 1\./
    );
    expect(container.textContent).toMatch(/Þú settir tengið milli C3 og C4/);
  });

  it('accepts 2-pentýn built between C3 and C4 of five', () => {
    const { ui, bond, skipTo, container } = openBuild();
    skipTo(9);
    expect(ui.getByText(/^2-pent[yý]n$/)).toBeTruthy();

    fireEvent.click(ui.getByRole('button', { name: /^(\+|Bæta við kolefni)$/ }));
    fireEvent.click(bond(3));
    fireEvent.click(bond(3)); // double → triple
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(container.textContent).toMatch(/Rétt! 2-pent[yý]n/);
  });

  it('still rejects a double bond in the wrong place', () => {
    const { ui, bond, skipTo, container } = openBuild();
    skipTo(6);
    expect(ui.getByText(/^2-b[uú]ten$/)).toBeTruthy();

    fireEvent.click(bond(1)); // C1=C2 is 1-búten from either end, not 2-búten
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(container.textContent).toMatch(/Rétt svar: 4 kolefni, tvítengi á stað 2\./);
  });
});

describe('Byggja: progress', () => {
  it('advances the bar for an answered challenge, right or wrong', () => {
    const { ui, progress } = openBuild();
    expect(progress()).toBe('0%');
    // Challenge 1 is própan; the default four carbons are wrong
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(ui.getByText(/Rétt svar: 3 kolefni/)).toBeTruthy();
    expect(progress()).toBe('10%');
  });
});

describe('Byggja: each bond button says which bond it is and what it is', () => {
  it('names the bond by its carbons and its current type', () => {
    const { ui } = openBuild();
    const bond34 = ui.getByRole('button', { name: /^Tenging 3–4: einföld/ });
    fireEvent.click(bond34);
    expect(ui.getByRole('button', { name: /^Tenging 3–4: tvöföld/ })).toBeTruthy();
    expect(ui.getByRole('button', { name: /^Tenging 1–2: einföld/ })).toBeTruthy();
  });
});
