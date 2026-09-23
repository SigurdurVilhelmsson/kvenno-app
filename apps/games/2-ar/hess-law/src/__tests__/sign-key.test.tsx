// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { Level3 } from '../components/Level3';
import { toggleSign } from '../utils/sign';

// Level 3's answer field raises the decimal keypad (`inputMode="decimal"`), which on an
// iPhone has no minus key — and five of its six answers are negative, so without the `±`
// key beside the field a phone student could not enter them at all. The key is shown on
// touch screens only (CSS), so jsdom sees it regardless and can drive it.

const t = (key: string, fallback?: string) => fallback ?? key;

function startLevel() {
  render(<Level3 t={t} onComplete={() => {}} onBack={() => {}} />);
  fireEvent.click(screen.getByText(/Byrja æfingar/));
}

describe('toggleSign', () => {
  it('flips the sign of a typed number and keeps the decimal comma', () => {
    expect(toggleSign('890,3')).toBe('-890,3');
    expect(toggleSign('-890,3')).toBe('890,3');
    expect(toggleSign('−890,3')).toBe('890,3');
    expect(toggleSign('')).toBe('-');
    expect(toggleSign('-')).toBe('');
  });
});

describe('hess-law level 3 sign key', () => {
  afterEach(cleanup);

  it('lets a negative answer be entered without a minus key, and grades it', () => {
    startLevel();
    const field = screen.getByPlaceholderText('level3.placeholder') as HTMLInputElement;
    // Challenge 1's answer is −890,3 kJ/mol; type the digits the keypad has.
    fireEvent.change(field, { target: { value: '890,3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Skipta um formerki' }));
    expect(field.value).toBe('-890,3');

    fireEvent.click(screen.getByText('level3.check'));
    expect(screen.getByText(/progress\.points/).textContent?.trim()).toBe('20 progress.points');
  });

  it('is disabled with the field once the answer is checked', () => {
    startLevel();
    fireEvent.change(screen.getByPlaceholderText('level3.placeholder'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByText('level3.check'));
    expect(
      (screen.getByRole('button', { name: 'Skipta um formerki' }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
});
