// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

// Opening the hint replaces the button that opened it with the hint, so focus
// went with the button to <body> (design P3.5: focus never falls to <body>).
// Both levels now move focus to the hint, as kinetics does. jsdom has no
// matchMedia, so this is the desktop path: focus moves and the page does not.

const t = (key: string, fallback?: string) => fallback ?? key;

afterEach(cleanup);

describe('hess-law hint focus', () => {
  it('Stig 2: opening the hint focuses the hint, not <body>', async () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const button = screen.getByRole('button', { name: /Sýna vísbendingu/ });
    button.focus();
    fireEvent.click(button);
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    expect(document.activeElement?.textContent).toContain('Vísbending:');
  });

  it('Stig 3: opening the hint focuses the hint, not <body>', async () => {
    render(<Level3 t={t} onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/Byrja æfingar/));
    const button = screen.getByText('level3.showHint');
    button.focus();
    fireEvent.click(button);
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    expect(document.activeElement?.textContent).toContain('level3.hintLabel');
  });
});
