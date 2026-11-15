// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { NaermyndScreen } from '../components/NaermyndScreen';
import { STEPS } from '../data/naermynd-steps';
import { SCENE_ACID, strongPH, weakCounts, weakPH } from '../engine/naermynd';

/**
 * Nærmynd walked through with reduced motion: each scene shows the pH and the
 * ions of its glasses, and nothing on screen writes a decimal point.
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

afterEach(cleanup);

const comma = (n: number) => n.toFixed(2).replace('.', ',');

function expectNoDecimalPoint(where: string) {
  expect(document.body.textContent, `${where}: text`).not.toMatch(/\d\.\d/);
  for (const el of document.querySelectorAll('[aria-label]')) {
    expect(el.getAttribute('aria-label'), `${where}: aria-label`).not.toMatch(/\d\.\d/);
  }
}

describe('Nærmynd: hversu mikið klofnar?', () => {
  it('walks every scene with the pH and ions of its glasses', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    STEPS.forEach((step, i) => {
      expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(`${i + 1}. ${step.title}`);
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(step.glasses.length);
      step.glasses.forEach((g, k) => {
        const pH = g.strong ? strongPH(g.c) : weakPH(SCENE_ACID, g.c);
        expect(images[k].getAttribute('aria-label')).toContain(`pH ${comma(pH)}`);
        if (!g.strong) {
          expect(images[k].getAttribute('aria-label')).toContain(
            `${weakCounts(SCENE_ACID, g.c).A} F⁻`
          );
        }
      });
      expectNoDecimalPoint(step.title);
      fireEvent.click(screen.getByRole('button', { name: 'Næsta skref →' }));
    });
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(
      `${STEPS.length + 1}. Kannaðu sjálf/ur`
    );
  });

  it('lets the student choose an acid and a concentration', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: `${STEPS.length + 1}. Kannaðu sjálf/ur` }));
    fireEvent.change(screen.getByLabelText('Veik sýra'), { target: { value: 'ediksyra' } });
    fireEvent.click(screen.getByRole('button', { name: '0,010 M' }));
    expect(screen.getByText(/lausn af ediksýru/)).toBeTruthy();
    expectNoDecimalPoint('explore');
  });
});
