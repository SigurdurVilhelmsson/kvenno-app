// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Agnasyn } from '../components/Agnasyn';
import { STEPS } from '../data/agnasyn-steps';
import { drawnCounts, particleCountsAt, pHAt } from '../utils/agnasyn';

/**
 * Agnasýn walked through as a student would, with reduced motion so every
 * scene lands at once: each scene shows its own volume's pH, the particle view
 * names the counts that volume should have, and nothing on screen writes a
 * decimal point.
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

describe('Agnasýn', () => {
  it('walks every scene with the pH and particles of its volume', async () => {
    render(<Agnasyn onBack={() => {}} />);
    await settle();
    STEPS.forEach((step, i) => {
      expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(`${i + 1}. ${step.title}`);
      expect(screen.getAllByText(`pH = ${comma(pHAt(step.volume))}`).length).toBeGreaterThan(0);
      const d = drawnCounts(particleCountsAt(step.volume));
      const label = screen
        .getByRole('img', { name: /^Agnirnar í lausninni/ })
        .getAttribute('aria-label')!;
      expect(label).toContain(`${d.HA} CH₃COOH, ${d.A} CH₃COO⁻`);
      expect(label).toContain(`${d.Na} Na⁺`);
      expect(Boolean(screen.queryByText('Ýkt:'))).toBe(Boolean(step.note));
      expectNoDecimalPoint(step.title);
      fireEvent.click(screen.getByRole('button', { name: 'Næsta skref →' }));
    });
  });

  it('lets the student drive the búretta in the last scene', async () => {
    render(<Agnasyn onBack={() => {}} />);
    await settle();
    fireEvent.click(screen.getByRole('button', { name: /8\. Kannaðu sjálf/ }));
    await settle();
    const slider = screen.getByLabelText(/Rúmmál NaOH/);
    for (const v of [0, 3.75, 12.5, 24.75, 25, 30.5, 40]) {
      fireEvent.change(slider, { target: { value: String(v) } });
      await settle();
      expect(screen.getAllByText(`pH = ${comma(pHAt(v))}`).length).toBeGreaterThan(0);
      expectNoDecimalPoint(`slider at ${v}`);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Jafngildispunktur' }));
    await settle();
    expect(screen.getByText(/pH = 8,72, yfir 7/)).toBeTruthy();
  });

  it('focuses each new scene title', async () => {
    render(<Agnasyn onBack={() => {}} />);
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref →' }));
    await settle();
    expect(document.activeElement?.textContent).toBe(`2. ${STEPS[1].title}`);
  });
});
