// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ElectrochemicalCell,
  electronsPerIon,
  formatVolts,
} from '../components/ElectrochemicalCell';

/**
 * What the galvanic-cell panel prints. Queries are scoped to the rendered container and every
 * render is unmounted (vitest `retry: 2`, no RTL auto-cleanup).
 */
afterEach(cleanup);

function show(pair: string) {
  const { container } = render(<ElectrochemicalCell />);
  fireEvent.click(within(container).getByRole('button', { name: pair }));
  return container;
}

describe('galvanic-cell half-equations', () => {
  it('gives silver one electron, not the two the panel hardcoded', () => {
    const text = show('Zn-Ag').textContent ?? '';
    expect(text).toContain('Ag⁺ + e⁻ → Ag');
    expect(text).not.toContain('Ag⁺ + 2e⁻');
    expect(text).toContain('Zn → Zn²⁺ + 2e⁻');
  });

  it('gives every 2+ ion two electrons, including in the diagram labels', () => {
    for (const pair of ['Zn-Cu', 'Mg-Cu', 'Fe-Cu']) {
      const text = show(pair).textContent ?? '';
      expect(text, pair).not.toMatch(/²⁺ \+ e⁻/);
      expect(text, pair).not.toMatch(/→ \w+²⁺ \+ e⁻/);
      expect(text, pair).toContain('Cu²⁺ + 2e⁻ → Cu');
      cleanup();
    }
  });

  it('reads the electron count from the charge', () => {
    expect(electronsPerIon({ ionCharge: '2+' })).toBe(2);
    expect(electronsPerIon({ ionCharge: '+' })).toBe(1);
    expect(electronsPerIon({ ionCharge: '3+' })).toBe(3);
  });
});

describe('galvanic-cell numbers', () => {
  it('prints every potential with a decimal comma', () => {
    for (const [pair, cell] of [
      ['Zn-Cu', '1,10'],
      ['Mg-Cu', '2,71'],
      ['Fe-Cu', '0,78'],
      ['Zn-Ag', '1,56'],
    ]) {
      const text = show(pair).textContent ?? '';
      expect(text, pair).not.toMatch(/\d\.\d/);
      expect(text, pair).toContain(`${cell} V`);
      cleanup();
    }
    expect(formatVolts(-0.76)).toBe('-0,76');
    expect(formatVolts(0.8)).toBe('0,80');
  });
});

describe('galvanic-cell text is Icelandic', () => {
  it('names each pair with the platform term and writes E° with the textbook subscript', () => {
    for (const pair of ['Zn-Cu', 'Mg-Cu', 'Fe-Cu', 'Zn-Ag']) {
      const text = show(pair).textContent ?? '';
      expect(text, pair).not.toMatch(/\bCell\b|°cell/);
      expect(text, pair).toContain('galvaníhlað');
      // Kerspenna, E°ker, as the textbook writes it (ch. 17).
      expect(text, pair).toContain('E°ker');
      cleanup();
    }
  });
});
