// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level2 } from '../components/Level2';
import { configPuzzles, normalizeConfig } from '../data/electron-configs';

/**
 * Stig 2's input label, its placeholder and its format note all gave `1s2 2s2 2p4` as the example,
 * and the menu card said `1s² 2s² 2p⁴ fyrir súrefni`. Oxygen is one of the eight elements the level
 * asks for, so on that question the answer sat in and above the answer box (found 2026-11-02;
 * Oxun og afoxun fixed its own placeholder the same way). The example is boron now, which the
 * level never asks about. The intro's worked example of oxygen is teaching, shown before the
 * questions, and is not checked here.
 *
 * Queries are scoped to each render's container: vitest runs with `retry: 2` and no RTL
 * auto-cleanup.
 */

const ANSWERS = new Set(configPuzzles.map((p) => normalizeConfig(p.correctConfig)));

/** Every electron configuration written in `text`, normalised. */
function configsIn(text: string): string[] {
  return [...text.matchAll(/(?:\d[spdf][0-9⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*)+/g)].map((m) => normalizeConfig(m[0]));
}

let cleanup: (() => void) | null = null;
afterEach(() => {
  cleanup?.();
  cleanup = null;
});

describe('the example a student sees while answering', () => {
  it('is no element the level asks for, in the label, placeholder or format note', () => {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    cleanup = rendered.unmount;
    const ui = within(rendered.container);
    const intro = rendered.container.textContent ?? '';
    const formatNote = intro.slice(intro.indexOf('Skrifaðu svona'));
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));

    const box = ui.getByRole('textbox', { name: /Sláðu inn rafeindaskipan/ }) as HTMLInputElement;
    const label = rendered.container.querySelector(`label[for="${box.id}"]`)?.textContent ?? '';
    const shown = [label, box.placeholder, formatNote].join(' ');

    expect(configsIn(shown).length).toBeGreaterThan(0);
    for (const config of configsIn(shown)) {
      expect(ANSWERS.has(config), `${config} is an answer`).toBe(false);
    }
  });

  it('is no element the level asks for on the menu card', () => {
    const rendered = render(<App />);
    cleanup = rendered.unmount;
    const configs = configsIn(rendered.container.textContent ?? '');
    for (const config of configs) {
      expect(ANSWERS.has(config), `${config} is an answer`).toBe(false);
    }
  });
});
