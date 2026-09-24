import { createElement } from 'react';

import { fireEvent, render, within } from '@testing-library/react';
import { vi } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * Plays Stig 2 by its buttons, for the tests that need to reach a molecule
 * part-way down the pool. Kept beside the tests rather than imported from the
 * level, so a test can say what a student would type without trusting the
 * data it is checking.
 */

export interface PoolEntry {
  formula: string;
  bondingPairs: number;
  lonePairs: number;
  /** The geometry button's label. */
  shape: string;
  /** What a student types at the angle step. */
  angle: string;
}

/** The ten molecules, in the order the level serves them. */
export const POOL: PoolEntry[] = [
  { formula: 'H₂O', bondingPairs: 2, lonePairs: 2, shape: 'Beygð', angle: '104,5' },
  { formula: 'NH₃', bondingPairs: 3, lonePairs: 1, shape: 'Þríhyrnd pýramída', angle: '107' },
  { formula: 'CH₄', bondingPairs: 4, lonePairs: 0, shape: 'Ferflötungur', angle: '109,5' },
  { formula: 'CO₂', bondingPairs: 2, lonePairs: 0, shape: 'Línuleg', angle: '180' },
  { formula: 'BF₃', bondingPairs: 3, lonePairs: 0, shape: 'Þríhyrnd slétt', angle: '120' },
  {
    formula: 'PCl₅',
    bondingPairs: 5,
    lonePairs: 0,
    shape: 'Þríhyrnd tvípýramída',
    angle: '90 og 120',
  },
  { formula: 'SF₄', bondingPairs: 4, lonePairs: 1, shape: 'Sjáldruslögun', angle: '90 og 120' },
  { formula: 'SF₆', bondingPairs: 6, lonePairs: 0, shape: 'Áttflötungur', angle: '90' },
  { formula: 'XeF₄', bondingPairs: 4, lonePairs: 2, shape: 'Ferningsslétt', angle: '90' },
  { formula: 'ClF₃', bondingPairs: 3, lonePairs: 2, shape: 'T-lögun', angle: '90' },
];

export type Ui = ReturnType<typeof within>;

export function startLevel2() {
  const onComplete = vi.fn();
  const rendered = render(createElement(Level2, { onComplete, onBack: vi.fn() }));
  return {
    ui: within(rendered.container),
    container: rendered.container,
    unmount: rendered.unmount,
    onComplete,
  };
}

export const check = (ui: Ui) => fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

export const next = (ui: Ui) =>
  fireEvent.click(ui.getByRole('button', { name: /Næsta skref|Næsta sameind|Ljúka stigi 2/ }));

export function answerCount(ui: Ui, container: HTMLElement, bonding: number, lone: number) {
  const [bondingInput, loneInput] = Array.from(container.querySelectorAll('input[type=number]'));
  fireEvent.change(bondingInput, { target: { value: String(bonding) } });
  fireEvent.change(loneInput, { target: { value: String(lone) } });
  check(ui);
}

export function answerAngle(ui: Ui, container: HTMLElement, angle: string) {
  const field = container.querySelector('input[type=text]') as HTMLInputElement;
  fireEvent.change(field, { target: { value: angle } });
  check(ui);
}

/** Answer all four steps of the molecule on screen correctly and move on. */
export function playMolecule(ui: Ui, container: HTMLElement, m: PoolEntry) {
  answerCount(ui, container, m.bondingPairs, m.lonePairs);
  next(ui);
  fireEvent.click(ui.getByRole('button', { name: m.shape }));
  check(ui);
  next(ui);
  answerAngle(ui, container, m.angle);
  next(ui);
  fireEvent.change(container.querySelector('textarea') as HTMLElement, {
    target: { value: 'Rafeindasviðin hrinda hvert öðru eins langt frá og hægt er.' },
  });
  check(ui);
  next(ui);
}

/** Play the molecules before `index`, leaving it on its count step. */
export function advanceTo(ui: Ui, container: HTMLElement, index: number) {
  for (let i = 0; i < index; i++) playMolecule(ui, container, POOL[i]);
  if (!ui.queryByText(`Sameind ${index + 1} af 10`)) {
    throw new Error(`expected to be on molecule ${index + 1}`);
  }
}
