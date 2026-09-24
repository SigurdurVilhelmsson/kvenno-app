// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { CatalystEffectDemo } from '../components/CatalystEffectDemo';
import { ConcentrationTimeGraph } from '../components/ConcentrationTimeGraph';

/**
 * The energy diagram drew energy from 0 to 80 kJ/mol above a reactant level of 50, while its
 * own "Ea (án hvata)" slider runs to 100. Any Ea above 30 put the uncatalysed peak off the top
 * of the drawing — including Level 1's default of 40, where the peak sits at 90.
 */
function peaks(container: HTMLElement): number[] {
  // The transition-state markers: the only circles in the drawing.
  return Array.from(container.querySelectorAll('svg circle')).map((c) =>
    Number(c.getAttribute('cy'))
  );
}

function plotTop(container: HTMLElement): number {
  // The y axis is the first vertical line from the top of the plot to the x axis.
  const axis = Array.from(container.querySelectorAll('svg line')).find(
    (l) => l.getAttribute('x1') === l.getAttribute('x2') && l.getAttribute('stroke') === '#6b7280'
  )!;
  return Math.min(Number(axis.getAttribute('y1')), Number(axis.getAttribute('y2')));
}

describe('CatalystEffectDemo', () => {
  it.each([30, 40, 60, 80, 100])('keeps both peaks inside the plot at Ea = %i kJ/mol', (ea) => {
    const { container, unmount } = render(
      <CatalystEffectDemo
        baseActivationEnergy={ea}
        catalyzedActivationEnergy={Math.max(10, ea - 25)}
      />
    );
    const top = plotTop(container);
    for (const cy of peaks(container)) expect(cy).toBeGreaterThanOrEqual(top);
    unmount();
  });

  it('labels the animation toggle with what pressing it will do', () => {
    // It read "Kyrrt" while still and "Sýna hreyfingu" while already moving — backwards.
    const { container, unmount } = render(<CatalystEffectDemo />);
    const ui = within(container);
    const toggle = ui.getByRole('button', { name: 'Sýna hreyfingu' });
    expect(container.querySelector('path.animate-pulse')).toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector('path.animate-pulse')).not.toBeNull();
    expect(ui.getByRole('button', { name: 'Stöðva hreyfingu' })).toBe(toggle);
    fireEvent.click(toggle);
    expect(container.querySelector('path.animate-pulse')).toBeNull();
    unmount();
  });

  it('gives each slider an accessible name', () => {
    const { container, unmount } = render(<CatalystEffectDemo />);
    const ui = within(container);
    for (const name of [/Hitastig/, /Ea \(án hvata\)/, /Ea \(með hvata\)/]) {
      expect(ui.getByRole('slider', { name })).toBeTruthy();
    }
    unmount();
  });

  it('keeps the catalysed Ea below the uncatalysed one when "Ea (án hvata)" is lowered', () => {
    // The "með hvata" slider's thumb is capped at Ea − 5, but everything else read the value it
    // held before the cap moved. Set it to 55, then drag "án hvata" down to 30, and the demo
    // said Ea' = 55 above Ea = 30, "Hvati lækkar Ea um -25 kJ/mol", and a speed-up below one —
    // a catalyst that slows the reaction, beside a slider thumb sitting at 25.
    // Sliders by position (temperature, án hvata, með hvata), so this also runs against a
    // version whose sliders had no accessible name.
    const { container, unmount } = render(
      <CatalystEffectDemo baseActivationEnergy={60} catalyzedActivationEnergy={35} />
    );
    const [, base, cat] = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type=range]')
    );
    fireEvent.change(cat, { target: { value: '55' } });
    fireEvent.change(base, { target: { value: '30' } });

    const text = container.textContent ?? '';
    const shown = Number(/Ea' = (\d+) kJ\/mól/.exec(text)?.[1]);
    expect(shown).toBe(Number(cat.value));
    expect(shown).toBeLessThan(30);
    expect(text).toMatch(/Hvati lækkar Ea um 5 kJ\/mól/);
    expect(text).not.toMatch(/lækkar Ea um -/);
    unmount();
  });
});

describe('ConcentrationTimeGraph', () => {
  it('gives each slider an accessible name', () => {
    const { container, unmount } = render(<ConcentrationTimeGraph />);
    const ui = within(container);
    for (const name of [/\[A\]₀/, /k \(hraðafasti\)/]) {
      expect(ui.getByRole('slider', { name })).toBeTruthy();
    }
    unmount();
  });
});
