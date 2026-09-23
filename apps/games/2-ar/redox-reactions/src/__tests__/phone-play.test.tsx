// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ElectrochemicalCell, cellLabelSize } from '../components/ElectrochemicalCell';
import { Level1 } from '../components/Level1';
import { Level3 } from '../components/Level3';

/**
 * Phone play of the redox game. jsdom has no layout, so these hold the mechanics behind the
 * phone fixes rather than the pixels: the keyboards the answer fields ask for, the verdict
 * scrolling into view in Stig 3, and the galvanic-cell labels that must not shrink with the
 * diagram. Queries are scoped to the rendered container (vitest `retry: 2`, no RTL cleanup).
 */
const t = (key: string, fallback?: string) => fallback ?? key;

describe('answer fields ask for the right phone keyboard', () => {
  it('Stig 1 keeps a plain number field, so the keyboard still offers a minus sign', () => {
    const { container } = render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    // Six rules, then the practice screen.
    for (let i = 0; i < 5; i++) fireEvent.click(view.getByRole('button', { name: /Næsta/ }));
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    const field = view.getByRole('spinbutton', { name: 'Oxunartala' });
    expect(field.getAttribute('type')).toBe('number');
    // inputmode="numeric" is the digits-only pad on iOS, with no minus key: -1, -2 and -3
    // are answers here, so the field must not ask for it.
    expect(field.hasAttribute('inputmode')).toBe(false);
  });

  it('Stig 3 asks for digits on the counts and keeps autocorrect off the element symbols', () => {
    const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    for (const label of ['Hvað oxast?', 'Hvað afoxast?']) {
      const symbol = view.getByLabelText(label);
      expect(symbol.getAttribute('autocorrect')).toBe('off');
      expect(symbol.getAttribute('spellcheck')).toBe('false');
      expect(symbol.getAttribute('autocomplete')).toBe('off');
    }

    fireEvent.change(view.getByLabelText('Hvað oxast?'), { target: { value: 'Zn' } });
    fireEvent.change(view.getByLabelText('Hvað afoxast?'), { target: { value: 'Cu' } });
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));

    // Electrons lost and electrons gained are whole positive counts.
    const count = view.getByRole('spinbutton');
    expect(count.getAttribute('type')).toBe('number');
    expect(count.getAttribute('inputmode')).toBe('numeric');
  });
});

describe('Stig 3 verdict', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    scrollIntoView.mockClear();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  it('scrolls the verdict and its next button into view once, and not before', () => {
    const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    fireEvent.change(view.getByLabelText('Hvað oxast?'), { target: { value: 'Xx' } });
    fireEvent.change(view.getByLabelText('Hvað afoxast?'), { target: { value: 'Yy' } });
    expect(scrollIntoView).not.toHaveBeenCalled();

    // Enter on the phone keyboard submits, and the keyboard stays open over the verdict.
    fireEvent.keyDown(view.getByLabelText('Hvað afoxast?'), { key: 'Enter' });

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
    const scrolled = scrollIntoView.mock.contexts[0] as Element;
    expect(scrolled.textContent).toContain('oxast');
    expect(scrolled.contains(view.getByRole('button', { name: /Halda áfram/ }))).toBe(true);

    // The next step's verdict scrolls again.
    fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    fireEvent.change(view.getByRole('spinbutton'), { target: { value: '2' } });
    fireEvent.keyDown(view.getByRole('spinbutton'), { key: 'Enter' });
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });
});

describe('galvanic-cell labels on a narrow screen', () => {
  it('leaves desktop sizes alone at full width with a mouse', () => {
    for (const base of [9, 10, 12, 14]) expect(cellLabelSize(base, 1)).toBe(base);
  });

  it('grows labels in viewBox units so they still render at 12 px once the SVG shrinks', () => {
    // 360 px phone: the 400-unit diagram is drawn about 278 px wide.
    const scale = 278 / 400;
    for (const base of [9, 10, 12, 14]) {
      const size = cellLabelSize(base, scale);
      expect(size).toBeGreaterThanOrEqual(base);
      expect(size * scale).toBeGreaterThanOrEqual(12 - 1e-9);
    }
  });

  it('brings sub-12 labels up to 12 px on a touch screen even at full size', () => {
    expect(cellLabelSize(9, 1, true)).toBe(12);
    expect(cellLabelSize(10, 1, true)).toBe(12);
    expect(cellLabelSize(14, 1, true)).toBe(14);
  });

  it('never returns a size below the desktop one, whatever the measurement', () => {
    for (const scale of [0, -1, Number.NaN, 0.5, 2]) {
      expect(cellLabelSize(10, scale)).toBeGreaterThanOrEqual(10);
    }
  });

  it('draws the diagram to fit its container, capped at its desktop width', () => {
    const { container } = render(<ElectrochemicalCell />);
    const svg = container.querySelector('svg[role="img"]') as SVGSVGElement;
    expect(svg.getAttribute('class')).toContain('w-full');
    expect(svg.getAttribute('class')).toContain('h-auto');
    expect(svg.style.maxWidth).toBe('400px');
    expect(svg.getAttribute('viewBox')).toBe('0 0 400 250');
  });
});
