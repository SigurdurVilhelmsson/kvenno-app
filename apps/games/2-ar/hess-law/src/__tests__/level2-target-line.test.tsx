// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * Stig 2's card says `ΔH = ? kJ (finndu þetta!)`, and the energy drawing beside it used to
 * draw the target as a `Markmið` line as soon as one equation was chosen, so a student could
 * steer the staircase onto the line instead of working out the value (decisions item 76).
 * The line now appears only once the answer is checked, and goes again when the cards change.
 *
 * Queries are scoped to the render's container because the repo runs vitest with `retry: 2`.
 */

afterEach(cleanup);

function svgTexts(container: HTMLElement): string[] {
  const svg = container.querySelector('svg[role="img"]');
  return svg ? [...svg.querySelectorAll('text')].map((t) => t.textContent ?? '') : [];
}

/** The line's label on the drawing, or its key in the legend under it. */
function hasTarget(container: HTMLElement): boolean {
  return [...container.querySelectorAll('text, span')].some((el) => el.textContent === 'Markmið');
}

describe('hess-law level 2 target line', () => {
  it('is not drawn before the answer is checked', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const page = within(container);
    fireEvent.click(page.getByRole('button', { name: '5' }));
    const [so2, so3] = Array.from(container.querySelectorAll<HTMLElement>('[data-equation-card]'));
    fireEvent.click(so2);
    fireEvent.click(so3);

    expect(container.querySelector('svg[role="img"]')).not.toBeNull();
    expect(svgTexts(container)).not.toContain('Markmið');
    expect(hasTarget(container)).toBe(false);

    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    expect(svgTexts(container)).toContain('Markmið');

    // Changing the combination withdraws the verdict, and the line with it.
    fireEvent.click(within(so2).getByRole('button', { name: 'Snúa við jöfnu' }));
    expect(hasTarget(container)).toBe(false);
  });
});
