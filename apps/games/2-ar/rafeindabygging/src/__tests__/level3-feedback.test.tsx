// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level3 } from '../components/Level3';
import { periodicPuzzles } from '../data/periodic-configs';

/**
 * Stig 3's teaching and feedback against the school's textbook (Efnafræði,
 * kafli 6.4).
 *
 * - The intro said to start from the *nearest* noble gas. For copper (Z = 29),
 *   selenium (34) and bromine (35) the nearest is krypton, and `[Kr] …` is a
 *   distractor on all three — so the rule as written led to a wrong answer on
 *   three of the eight questions. The core is the noble gas *before* the element.
 * - The feedback called bromine's `4s² 3d¹⁰ 4p⁵` its valence electrons. The
 *   textbook: "Gildisrafeindir fyrir aðalflokkafrumefni eru þær með hæsta
 *   n-gildið … Alveg fyllt d-svigrúm teljast sem kjarna-, ekki gildisrafeindir."
 *   Bromine has seven, `4s² 4p⁵`.
 *
 * Queries are scoped to this render's container: vitest runs with `retry: 2`
 * and no RTL auto-cleanup, so a failed attempt leaves its DOM behind.
 */

clockPastNextGuard();

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function renderLevel() {
  const rendered = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
  return { ui: within(rendered.container), container: rendered.container };
}

function options(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button.mc-option'));
}

/** Answer each element in turn; return the feedback text shown for each. */
function feedbackByElement(): Record<string, string> {
  const { ui, container } = renderLevel();
  fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
  const out: Record<string, string> = {};
  for (const puzzle of periodicPuzzles) {
    fireEvent.click(options(container).find((b) => b.textContent === puzzle.fullShorthand)!);
    fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
    out[puzzle.element] = container.textContent!;
    fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni|Ljúka stigi/ }));
  }
  return out;
}

describe('the teaching intro', () => {
  it('builds the shorthand on the noble gas before the element, not the nearest one', () => {
    const { container } = renderLevel();
    const text = container.textContent!;
    expect(text).not.toMatch(/nánast/i);
    expect(text).toMatch(/eðalgasinu á undan frumefninu/);
  });
});

describe('the valence electrons named after an answer', () => {
  it('leaves a full 3d¹⁰ out of a main-group element’s valence electrons', () => {
    const shown = feedbackByElement();
    expect(shown.Br).toContain('Gildisrafeindir: 4s² 4p⁵');
    expect(shown.Se).toContain('Gildisrafeindir: 4s² 4p⁴');
    expect(shown.Br).toContain('3d¹⁰ er alveg fyllt og telst til kjarnarafeinda');
  });

  it('keeps ns and (n − 1)d for a transition metal', () => {
    const shown = feedbackByElement();
    expect(shown.Fe).toContain('Gildisrafeindir: 4s² 3d⁶');
    expect(shown.Cu).toContain('Gildisrafeindir: 4s¹ 3d¹⁰');
    expect(shown.Ca).toContain('Gildisrafeindir: 4s²');
    expect(shown.Fe).not.toContain('kjarnarafeinda');
  });
});

describe('the option buttons', () => {
  it('tell assistive technology which one is chosen', () => {
    const { ui, container } = renderLevel();
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
    const [first, second] = options(container);
    fireEvent.click(first);
    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(second.getAttribute('aria-pressed')).toBe('false');
  });
});
