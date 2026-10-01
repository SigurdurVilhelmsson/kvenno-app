// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { pastExample } from './past-example';
import { Level2 } from '../components/Level2';

// Stig 2's hints open one at a time under the board. Opening the last one
// unmounted the button just pressed, so focus fell to <body> (design P3.5).
// Each hint now takes focus as it opens, as the shared HintSystem's tiers do.

afterEach(cleanup);

describe('lewis-structures Stig 2 hint focus', () => {
  it('focuses each hint as it opens, and never <body>', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    pastExample(container);
    const ui = within(container);
    let opened = 0;
    for (;;) {
      const button = ui.queryByRole('button', { name: /Sýna (vísbendingu|fleiri vísbendingar)/ });
      if (!button) break;
      button.focus();
      fireEvent.click(button);
      opened++;
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement?.textContent).toContain(`Vísbending ${opened}:`);
    }
    expect(opened).toBeGreaterThan(1);
  });
});
