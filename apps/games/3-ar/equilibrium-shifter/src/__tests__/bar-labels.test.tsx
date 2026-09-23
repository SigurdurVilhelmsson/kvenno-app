import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { NumbersPanel } from '../components/NumbersPanel';
import { CONSTANTS, STARTING_MIXTURES } from '../data/constants';
import { equilibria } from '../data/equilibria';
import { applyStress } from '../engine/stress';

/**
 * On a phone the K and Q bars can be shorter than the number printed in them,
 * so each bar is held at least as wide as its label. Each bar also carries the
 * other bar's number, invisible, so both are held to the wider label: a bar
 * that is pinned can come out level with the other, never longer than a bar
 * whose value is larger. The twin must stay invisible and out of the
 * accessibility tree, or a screen reader reads every value twice.
 */

afterEach(cleanup);

describe('the K and Q bar labels', () => {
  it('shows each value once and keeps the other bar’s value as a hidden twin', () => {
    const e = equilibria.find((x) => x.id === 1)!;
    const outcome = applyStress(e, CONSTANTS[1], STARTING_MIXTURES[1], {
      type: 'add-reactant',
      target: 'N₂O₄',
    })!;
    const { container } = render(
      <NumbersPanel
        outcome={outcome}
        constant={CONSTANTS[1]}
        order={[...e.reactants.map((m) => m.formula), ...e.products.map((m) => m.formula)]}
      />
    );

    const bars = [...container.querySelectorAll('.min-w-fit')];
    expect(bars).toHaveLength(2);
    const [kBar, qBar] = bars;
    const visible = (bar: Element) =>
      [...bar.querySelectorAll('span > span')].filter((s) => !s.hasAttribute('aria-hidden'));
    const twins = (bar: Element) => [...bar.querySelectorAll('[aria-hidden="true"]')];

    // One visible label per bar, and it is that bar's own value.
    expect(visible(kBar)).toHaveLength(1);
    expect(visible(qBar)).toHaveLength(1);
    // A concentration stress leaves K alone, so the K bar prints the constant
    // named at the top of the panel.
    const named = [...container.querySelectorAll('span')].find((x) =>
      x.textContent?.startsWith(`${CONSTANTS[1].kind} = `)
    )!;
    expect(`${CONSTANTS[1].kind} = ${visible(kBar)[0].textContent}`).toBe(named.textContent);
    // The twin is the other bar's value, hidden from sight and from screen readers.
    expect(twins(kBar)).toHaveLength(1);
    expect(twins(kBar)[0].textContent).toBe(visible(qBar)[0].textContent);
    expect(twins(qBar)[0].textContent).toBe(visible(kBar)[0].textContent);
    for (const t of [...twins(kBar), ...twins(qBar)]) {
      expect(t.classList.contains('invisible')).toBe(true);
    }
  });
});
