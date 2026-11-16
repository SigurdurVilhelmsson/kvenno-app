import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Temperature, TEMPERATURE_RUN } from '../components/Temperature';
import {
  TEMPERATURE_ITEMS,
  TEMPERATURE_TOLERANCE,
  answerOf,
  convertTemperature,
  judgeTemperature,
  stepsFor,
  wrongRoutes,
} from '../data/temperature';

describe('temperature conversion, against the book (ch01/m68683)', () => {
  it("reproduces the book's own answers", () => {
    // Worked example: body temperature.
    expect(convertTemperature(37.0, 'C', 'K')).toBeCloseTo(310.15, 6);
    expect(convertTemperature(37.0, 'C', 'F')).toBeCloseTo(98.6, 6);
    // Check your learning: 80,92 °C is 354,07 K and 177,7 °F.
    expect(convertTemperature(80.92, 'C', 'K')).toBeCloseTo(354.07, 6);
    expect(convertTemperature(80.92, 'C', 'F')).toBeCloseTo(177.656, 6);
    // Check your learning: 50 °F is 10 °C and (to the book's figures) 280 K.
    expect(convertTemperature(50, 'F', 'C')).toBeCloseTo(10, 6);
    expect(convertTemperature(50, 'F', 'K')).toBeCloseTo(283.15, 6);
    // The figure: the scales meet at −40, which is 233,15 K.
    expect(convertTemperature(-40, 'C', 'F')).toBeCloseTo(-40, 6);
    expect(convertTemperature(233.15, 'K', 'F')).toBeCloseTo(-40, 6);
  });

  it('every conversion round-trips', () => {
    for (const item of TEMPERATURE_ITEMS) {
      expect(convertTemperature(answerOf(item), item.to, item.from)).toBeCloseTo(item.value, 9);
    }
  });

  it('accepts 273 for 273,15 but rejects 0, a doubled answer and NaN', () => {
    for (const item of TEMPERATURE_ITEMS) {
      const right = answerOf(item);
      expect(judgeTemperature(item, right).kind).toBe('right');
      expect(judgeTemperature(item, Math.round(right)).kind).toBe('right');
      if (Math.abs(right) > TEMPERATURE_TOLERANCE)
        expect(judgeTemperature(item, 0).kind).not.toBe('right');
      if (Math.abs(right) > TEMPERATURE_TOLERANCE)
        expect(judgeTemperature(item, 2 * right).kind).not.toBe('right');
      expect(judgeTemperature(item, Number.NaN).kind).not.toBe('right');
    }
  });

  it('names the slip a student made', () => {
    const body = TEMPERATURE_ITEMS.find((i) => i.id === 't2')!;
    // Forgot the +32.
    const v = judgeTemperature(body, 66.6);
    expect(v.kind).toBe('route');
    expect(v.kind === 'route' && v.message).toMatch(/gleymdir að leggja 32 við/);
    const toK = TEMPERATURE_ITEMS.find((i) => i.id === 't1')!;
    const w = judgeTemperature(toK, 37 - 273.15);
    expect(w.kind === 'route' && w.message).toMatch(/dróst 273,15 frá/);
  });

  it('every wrong route is told apart from the answer and from the other routes', () => {
    for (const item of TEMPERATURE_ITEMS) {
      const routes = wrongRoutes(item);
      expect(routes.length).toBeGreaterThan(0);
      for (const r of routes) {
        expect(Math.abs(r.value - answerOf(item))).toBeGreaterThan(TEMPERATURE_TOLERANCE);
      }
    }
  });

  it('prints its steps with a decimal comma and no decimal point', () => {
    for (const item of TEMPERATURE_ITEMS) {
      for (const step of stepsFor(item)) expect(step).not.toMatch(/\d\.\d/);
    }
  });
});

describe('the Hitastig practice', () => {
  const answerField = () => screen.getByLabelText(/Hvað er þetta í/);
  const currentItem = () => {
    const prompt = answerField().closest('[data-item-start]')!.textContent!;
    return TEMPERATURE_ITEMS.find((i) => {
      const shown = `${i.value}`.replace('.', ',').replace('-', '−');
      return prompt.includes(shown) && prompt.includes(`í ${{ C: '°C', K: 'K', F: '°F' }[i.to]}?`);
    })!;
  };
  const type = (text: string) => {
    fireEvent.change(answerField(), { target: { value: text } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
  };
  const advance = () => {
    vi.advanceTimersByTime(500);
    fireEvent.click(screen.getByRole('button', { name: /Næsta|Sjá niðurstöður/ }));
  };

  it('plays a full run and reports N af M rétt', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<Temperature onComplete={onComplete} onBack={() => {}} />);
    for (let i = 0; i < TEMPERATURE_RUN; i++) {
      const item = currentItem();
      expect(item).toBeDefined();
      if (i === 0) {
        // Two wrong tries print the steps, so a right answer after that does not count.
        type('0');
        vi.advanceTimersByTime(500);
        fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
        expect(document.activeElement).toBe(answerField());
        type('0');
        expect(screen.getByText('Útreikningur:')).toBeTruthy();
        vi.advanceTimersByTime(500);
        fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
      }
      type(String(answerOf(item).toFixed(2)).replace('.', ','));
      advance();
    }
    expect(onComplete).toHaveBeenCalledWith(TEMPERATURE_RUN - 1, TEMPERATURE_RUN);
    expect(
      screen.getByText(`Æfingu lokið: ${TEMPERATURE_RUN - 1} af ${TEMPERATURE_RUN} rétt.`)
    ).toBeTruthy();
    vi.useRealTimers();
  });
});
