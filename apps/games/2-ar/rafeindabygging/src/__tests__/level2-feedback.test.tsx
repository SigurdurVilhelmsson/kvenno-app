// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level2 } from '../components/Level2';
import { configPuzzles } from '../data/electron-configs';

/**
 * What Stig 2 tells a student after they submit, beyond right or wrong.
 *
 * - The electron-count hint read the grader's normalised copy of the answer,
 *   which has its spaces stripped, so `1s2 2s2` for hydrogen arrived as `1s22s2`
 *   and was counted as 22 electrons: "Þú ert með 21 rafeindir of mörg (heild:
 *   22, ætti að vera 1)". It now reads what the student typed.
 * - The hint's Icelandic: `vanta` takes the accusative (`Þig vantar`), the
 *   noun agrees with the number (`1 rafeind`), and `of mörg` agreed with nothing.
 * - The orbital diagram paired electrons before Hund's rule allows, so it drew
 *   carbon's 2p² as one full box and two empty ones directly above an
 *   explanation saying the opposite.
 *
 * Queries are scoped to this render's container: vitest runs with `retry: 2`
 * and no RTL auto-cleanup, so a failed attempt leaves its DOM behind.
 */

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function startLevel() {
  const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
  return { ui, container: rendered.container };
}

function input(ui: ReturnType<typeof within>): HTMLInputElement {
  return ui.getByRole('textbox') as HTMLInputElement;
}

function submit(ui: ReturnType<typeof within>, answer: string) {
  fireEvent.change(input(ui), { target: { value: answer } });
  fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
}

/** The element symbol on screen now. */
function currentElement(container: HTMLElement): string {
  return container.querySelector('.text-4xl')!.textContent!;
}

/** Answer correctly until the named element is on screen. */
function advanceTo(ui: ReturnType<typeof within>, container: HTMLElement, element: string) {
  for (let guard = 0; currentElement(container) !== element; guard++) {
    if (guard >= configPuzzles.length) throw new Error(`no puzzle for ${element}`);
    const here = configPuzzles.find((p) => p.element === currentElement(container))!;
    submit(ui, here.correctConfig);
    fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni/ }));
  }
}

function hint(container: HTMLElement): string | null {
  const label = Array.from(container.querySelectorAll('span')).find(
    (s) => s.textContent === 'Athugaðu: '
  );
  return label?.parentElement?.textContent?.replace('Athugaðu: ', '') ?? null;
}

describe('the electron-count hint', () => {
  it('counts a spaced answer subshell by subshell, not as one merged number', () => {
    const { ui, container } = startLevel();
    submit(ui, '1s2 2s2');
    expect(hint(container)).toBe('Þú ert með 3 rafeindir aukalega (heild: 4, ætti að vera 1).');
  });

  it('counts two-digit exponents and superscripts', () => {
    const { ui, container } = startLevel();
    advanceTo(ui, container, 'Fe');
    submit(ui, '1s2 2s2 2p6 3s2 3p6 4s2 3d8');
    expect(hint(container)).toBe('Þú ert með 2 rafeindir aukalega (heild: 28, ætti að vera 26).');
  });

  it('says what is missing in the accusative, with the noun agreeing with the number', () => {
    const { ui, container } = startLevel();
    advanceTo(ui, container, 'C');
    submit(ui, '1s² 2s² 2p¹');
    expect(hint(container)).toBe('Þig vantar 1 rafeind (heild: 5, ætti að vera 6).');
  });

  it('reads unspaced ASCII the only way it can be read', () => {
    const { ui, container } = startLevel();
    advanceTo(ui, container, 'Na');
    submit(ui, '1s22s22p63s2');
    expect(hint(container)).toBe('Þú ert með 1 rafeind aukalega (heild: 12, ætti að vera 11).');
  });

  it('stays silent rather than guess at something that is not a list of subshells', () => {
    const { ui, container } = startLevel();
    advanceTo(ui, container, 'Na');
    submit(ui, '[Ne] 3s2');
    expect(hint(container)).toBeNull();
  });
});

describe('the element card', () => {
  it('says 1 rafeind for hydrogen, not 1 rafeindir', () => {
    const { container } = startLevel();
    const count = Array.from(container.querySelectorAll('div')).find(
      (d) => d.children.length === 0 && /^\s*\d+ rafeind/.test(d.textContent ?? '')
    );
    expect(count?.textContent?.trim()).toBe('1 rafeind');
  });

  it('labels the answer box so a screen reader can name it', () => {
    const { ui } = startLevel();
    expect(ui.getByRole('textbox', { name: /Sláðu inn rafeindaskipan/ })).toBeTruthy();
  });
});

describe('the orbital diagram', () => {
  /** Electrons drawn in each box, grouped by subshell label. */
  function diagram(container: HTMLElement): Record<string, number[]> {
    const out: Record<string, number[]> = {};
    for (const box of Array.from(container.querySelectorAll('.orbital-box'))) {
      const group = box.parentElement!.parentElement!;
      const label = group.querySelector('.font-mono')!.textContent!;
      const arrows = (box.textContent!.match(/[↑↓]/g) ?? []).length;
      (out[label] ??= []).push(arrows);
    }
    return out;
  }

  it('fills every orbital singly before pairing, for every element in the level', () => {
    const { ui, container } = startLevel();
    const violations: string[] = [];

    configPuzzles.forEach((puzzle, i) => {
      submit(ui, puzzle.correctConfig);
      const drawn = diagram(container);
      puzzle.orbitalOrder.forEach((subshell, j) => {
        const boxes = drawn[subshell];
        const total = boxes.reduce((a, b) => a + b, 0);
        if (total !== puzzle.electronCounts[j]) {
          violations.push(`${puzzle.element} ${subshell}: drew ${total} electrons`);
        }
        if (boxes.includes(2) && boxes.includes(0)) {
          violations.push(`${puzzle.element} ${subshell}: drew [${boxes.join(', ')}]`);
        }
      });
      if (i < configPuzzles.length - 1) {
        fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni/ }));
      }
    });

    expect(violations).toEqual([]);
  });

  it('draws the three cases its own explanations describe', () => {
    const { ui, container } = startLevel();
    const drawnFor = (element: string) => {
      advanceTo(ui, container, element);
      const puzzle = configPuzzles.find((p) => p.element === element)!;
      submit(ui, puzzle.correctConfig);
      const drawn = diagram(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni/ }));
      return drawn;
    };
    // "2p rafeindir dreifast í aðskilin svigrúm"
    expect(drawnFor('C')['2p']).toEqual([1, 1, 0]);
    // "eina í hverju svigrúmi (Hund)"
    expect(drawnFor('N')['2p']).toEqual([1, 1, 1]);
    // "eitt 2p svigrúm hefur rafeindapar, hin tvö hafa einstaka rafeind"
    expect(drawnFor('O')['2p']).toEqual([2, 1, 1]);
  });
});
