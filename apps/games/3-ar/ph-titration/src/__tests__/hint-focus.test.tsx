// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

// Stig 2 and 3 open the hint in place of the button that opened it, so focus
// went with the button to <body> (design P3.5: focus never falls to <body>).
// Both now move focus to the hint. (Stig 1's tiers are the shared HintSystem,
// which carries its own test.) jsdom has no matchMedia, so this is the desktop
// path: focus moves, the page does not.

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
  // The titration curve sizes itself with a ResizeObserver, which jsdom lacks.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(cleanup);

async function openHintAndExpectFocus() {
  const button = screen.getByRole('button', { name: /Sýna vísbendingu/ });
  button.focus();
  fireEvent.click(button);
  await waitFor(() => expect(document.activeElement).not.toBe(document.body));
  expect(document.activeElement?.textContent).toContain('Vísbending:');
}

describe('ph-titration hint focus', () => {
  it('Stig 2: opening the hint focuses the hint, not <body>', async () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    await openHintAndExpectFocus();
  });

  it('Stig 3: opening the hint focuses the hint, not <body>', async () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    await openHintAndExpectFocus();
  });
});
