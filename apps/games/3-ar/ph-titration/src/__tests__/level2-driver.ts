import { act, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { indicators } from '../data/indicators';
import { formatMolarity } from '../data/level2-puzzles';
import { getTitrationById } from '../data/titrations';
import type { IndicatorType, MonoproticTitration } from '../types';

/**
 * Drives one Stig 2 puzzle through the real buttons, as a student does:
 * choose the litvísir, confirm, pour to a volume, record the endpoint, type a
 * concentration and confirm it. Tests render `Level2` with
 * `drawMolarity={stockMolarity}`, so the sample is the stored titration.
 */

export const stockMolarity = (base: MonoproticTitration) => base.analyte.molarity;

/** Run the component's timers past its panel exits and the 400 ms double-tap guard. */
export const settle = () => act(() => vi.advanceTimersByTime(450));

export function chooseIndicator(id: IndicatorType) {
  const name = indicators.find((i) => i.id === id)!.name;
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }));
  fireEvent.click(screen.getByRole('button', { name: /Staðfesta val/ }));
  settle();
}

/** Pours `ml` (a multiple of 0,05) with the +5, +1 and +0,05 buttons. */
export function pour(ml: number) {
  let rest = Math.round(ml * 100);
  const press = (name: RegExp, n: number) => {
    const button = screen.getByRole('button', { name });
    for (let i = 0; i < n; i++) fireEvent.click(button);
  };
  press(/^Bæta við 5 mL/, Math.floor(rest / 500));
  rest %= 500;
  press(/^Bæta við 1 mL/, Math.floor(rest / 100));
  rest %= 100;
  press(/^Bæta við 0,05 mL/, Math.round(rest / 5));
}

export function recordEndpoint() {
  fireEvent.click(screen.getByRole('button', { name: /skrá endapunkt/ }));
  settle();
}

export function answer(text: string) {
  fireEvent.change(screen.getByLabelText(/^Styrkur/), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
  settle();
}

/** The concentration a student would write from an endpoint, to three figures. */
export function concentrationFrom(t: MonoproticTitration, endpointMl: number): string {
  return formatMolarity((t.titrant.molarity * endpointMl) / t.analyte.volume);
}

/**
 * Plays a puzzle right: its stored titration, the indicator given, the
 * endpoint at the equivalence volume plus `offset`, the concentration from it.
 */
export function playPuzzle(titrationId: number, indicator: IndicatorType, offset = 0) {
  const t = getTitrationById(titrationId) as MonoproticTitration;
  chooseIndicator(indicator);
  const endpoint = Math.round((t.equivalenceVolume + offset) * 20) / 20;
  pour(endpoint);
  recordEndpoint();
  answer(concentrationFrom(t, endpoint));
}

export const next = () => {
  fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka →/ }));
  settle();
};
