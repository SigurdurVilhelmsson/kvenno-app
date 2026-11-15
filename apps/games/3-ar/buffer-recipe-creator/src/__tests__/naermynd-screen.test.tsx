// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Naermynd } from '../components/Naermynd';
import { STEPS } from '../data/naermynd-steps';
import { countsAfter, pHAfter } from '../engine/naermynd';

/**
 * Nærmynd walked through as a student would, with reduced motion so every
 * scene lands at once: both glasses show the pH and particles of the scene's
 * volume, and nothing on screen writes a decimal point.
 */

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  })) as never;
});

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const settle = () => act(() => vi.advanceTimersByTime(400));
const comma = (n: number) => n.toFixed(2).replace('.', ',');

function expectNoDecimalPoint(where: string) {
  expect(document.body.textContent, `${where}: text`).not.toMatch(/\d\.\d/);
  for (const el of document.querySelectorAll('[aria-label]')) {
    expect(el.getAttribute('aria-label'), `${where}: aria-label`).not.toMatch(/\d\.\d/);
  }
}

describe('Nærmynd: stuðpúði og vatn', () => {
  it('walks every scene with both glasses at its volume', async () => {
    render(<Naermynd onBack={() => {}} />);
    await settle();
    STEPS.forEach((step, i) => {
      expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(`${i + 1}. ${step.title}`);
      for (const glass of ['buffer', 'water'] as const) {
        const pH = comma(pHAfter(glass, step.reagent, step.volume));
        expect(screen.getAllByText(new RegExp(`pH = ${pH}`)).length).toBeGreaterThan(0);
      }
      const buffer = countsAfter('buffer', step.reagent, step.volume);
      const label = screen
        .getByRole('img', { name: /^Stuðpúði eftir/ })
        .getAttribute('aria-label')!;
      expect(label).toContain(`${buffer.HA} CH₃COOH`);
      if (buffer.A > 0) expect(label).toContain(`${buffer.A} CH₃COO⁻`);
      expectNoDecimalPoint(step.title);
      fireEvent.click(screen.getByRole('button', { name: 'Næsta skref →' }));
    });
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(
      `${STEPS.length + 1}. Kannaðu sjálf/ur`
    );
  });

  it('lets the student choose the reagent and drag the slider', async () => {
    render(<Naermynd onBack={() => {}} />);
    await settle();
    fireEvent.click(screen.getByRole('button', { name: `${STEPS.length + 1}. Kannaðu sjálf/ur` }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Natríumhýdroxíð, NaOH' }));
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } });
    await settle();
    expect(
      screen.getByText(`pH = ${comma(pHAfter('water', 'NaOH', 3))}`, { exact: false })
    ).toBeTruthy();
    expect(screen.getByText(/Stuðpúðinn er búinn/)).toBeTruthy();
    expectNoDecimalPoint('explore');
  });
});
