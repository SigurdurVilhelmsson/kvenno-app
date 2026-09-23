import { fireEvent, render, within } from '@testing-library/react';
import { vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { challenges as level1Challenges } from '../data/level1-questions';
import { challenges as level2Challenges } from '../data/level2-questions';
import { challenges as level3Challenges } from '../data/level3-questions';

/**
 * jsdom has no ResizeObserver, and Level 1's collision demo sizes itself with one. A no-op is
 * enough: the drawings then keep their default size, which is all these tests read.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

/**
 * Plays a level from its first screen to `onComplete`, the way a student does — through the
 * real buttons — and records everything the student could read on the way: the visible text
 * of every screen (SVG labels included) and every accessible name.
 *
 * Every query is scoped to the container this helper rendered. The repo runs vitest with
 * retries and no RTL auto-cleanup, so a document-wide query could see an earlier attempt's DOM.
 */

export type Pick = 'correct' | 'wrong';

export interface Playthrough {
  /** Everything read on every screen, joined. */
  text: string;
  /** The score the level reported to `onComplete`. */
  score: number;
}

/** Visible text plus accessible names, so an English aria-label is caught as well. */
export function readable(container: HTMLElement): string {
  const labels = Array.from(container.querySelectorAll('[aria-label]')).map(
    (el) => el.getAttribute('aria-label') ?? ''
  );
  return [container.textContent ?? '', ...labels].join('\n');
}

/** The option buttons of a multiple-choice level, in the order the student sees them. */
function optionButtons(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('button')).filter((b) =>
    /^[a-d]\./.test(b.textContent?.trim() ?? '')
  );
}

function optionTextOf(button: HTMLElement): string {
  return button
    .textContent!.trim()
    .replace(/^[a-d]\.\s*/, '')
    .replace(/[✓✗]/g, '')
    .trim();
}

function clickOption(container: HTMLElement, text: string) {
  const button = optionButtons(container).find((b) => optionTextOf(b) === text);
  if (!button) throw new Error(`option not on screen: ${text}`);
  fireEvent.click(button);
}

function advance(ui: ReturnType<typeof within>, finishLabel: string) {
  const next = ui.queryByRole('button', { name: 'Næsta þraut' });
  fireEvent.click(next ?? ui.getByRole('button', { name: finishLabel }));
}

export function playLevel1(pick: Pick, { useHints = false } = {}): Playthrough {
  const onComplete = vi.fn();
  const { container, unmount } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  const seen: string[] = [];

  for (const challenge of level1Challenges) {
    if (useHints) fireEvent.click(ui.getByRole('button', { name: 'Sýna vísbendingu' }));
    seen.push(readable(container));
    const target = challenge.options!.find((o) => (pick === 'correct' ? o.correct : !o.correct))!;
    clickOption(container, target.text);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    seen.push(readable(container));
    advance(ui, 'Ljúka stigi 1');
  }

  const score = onComplete.mock.calls[0]?.[0];
  unmount();
  return { text: seen.join('\n'), score };
}

/** The order buttons (0, 1, 2) in the row labelled `Röð í [X]:`. */
function orderButton(container: HTMLElement, species: 'A' | 'B', order: number): HTMLElement {
  const label = Array.from(container.querySelectorAll('span')).find(
    (s) => s.textContent?.trim() === `Röð í [${species}]:`
  );
  if (!label) throw new Error(`no order row for [${species}]`);
  const button = Array.from(label.parentElement!.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === String(order)
  );
  if (!button) throw new Error(`no order button ${order} for [${species}]`);
  return button;
}

export function playLevel2(pick: Pick, onEachResult?: (index: number, c: HTMLElement) => void) {
  const onComplete = vi.fn();
  const { container, unmount } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  const seen: string[] = [readable(container)];
  fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));

  level2Challenges.forEach((challenge, index) => {
    fireEvent.click(ui.getByRole('button', { name: 'Sýna vísbendingu' }));
    const hasB = challenge.data.some((d) => d.concentrationB > 0);
    const wrong = (n: number) => (n + 1) % 3;
    fireEvent.click(
      orderButton(
        container,
        'A',
        pick === 'correct' ? challenge.correctOrderA : wrong(challenge.correctOrderA)
      )
    );
    if (hasB) {
      fireEvent.click(
        orderButton(
          container,
          'B',
          pick === 'correct' ? challenge.correctOrderB : wrong(challenge.correctOrderB)
        )
      );
    }
    seen.push(readable(container));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    seen.push(readable(container));
    onEachResult?.(index, container);
    advance(ui, 'Ljúka stigi 2');
  });

  const score = onComplete.mock.calls[0]?.[0];
  unmount();
  return { text: seen.join('\n'), score };
}

export function playLevel3(pick: Pick): Playthrough {
  const onComplete = vi.fn();
  const { container, unmount } = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  const seen: string[] = [readable(container)];
  fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));

  for (const challenge of level3Challenges) {
    fireEvent.click(ui.getByRole('button', { name: 'Sýna vísbendingu' }));
    seen.push(readable(container));
    const target = challenge.options.find((o) => (pick === 'correct' ? o.correct : !o.correct))!;
    clickOption(container, target.text);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    seen.push(readable(container));
    advance(ui, 'Ljúka stigi 3');
  }

  const score = onComplete.mock.calls[0]?.[0];
  unmount();
  return { text: seen.join('\n'), score };
}

/** Every string anywhere in a data structure, including hint tiers no screen shows yet. */
export function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}
