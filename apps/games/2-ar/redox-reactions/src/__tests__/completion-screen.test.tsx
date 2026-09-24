// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { playLevel3 } from './play-level3';
import App from '../App';

/**
 * The closing screen says "Þú hefur lokið öllum stigum!". Levels are not gated (ruling
 * 2026-08-29), so a student can play Stig 3 first — and finishing it sent them there whatever
 * else they had done. Queries are scoped to the rendered container and every render is
 * unmounted (vitest `retry: 2`, no RTL auto-cleanup).
 */
const KEY = 'redox-reactions-progress';

beforeEach(() => localStorage.clear());
clockPastNextGuard();
afterEach(() => {
  cleanup();
  localStorage.clear();
});

function progress(level1Completed: boolean, level2Completed: boolean) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      level1Completed,
      level1Score: level1Completed ? 90 : 0,
      level2Completed,
      level2Score: level2Completed ? 320 : 0,
      level3Completed: false,
      level3Score: 0,
      totalGamesPlayed: Number(level1Completed) + Number(level2Completed),
    })
  );
}

function finishLevel3() {
  const { container } = render(<App />);
  const view = within(container);
  fireEvent.click(view.getByRole('button', { name: /Stig 3/ }));
  playLevel3(view);
  return view;
}

describe('finishing Stig 3', () => {
  it('returns to the menu when Stig 1 and 2 have not been played', () => {
    progress(false, false);
    const view = finishLevel3();
    expect(view.queryByText('Þú hefur lokið öllum stigum!')).toBeNull();
    expect(view.getByRole('button', { name: /Stig 1/ })).toBeTruthy();
  });

  it('shows the closing screen once all three are done, each line said once', () => {
    progress(true, true);
    const view = finishLevel3();
    expect(view.getByText('Þú hefur lokið öllum stigum!')).toBeTruthy();

    const learned = view.getByText('Hvað lærðir þú?').parentElement!.querySelectorAll('li');
    const lines = Array.from(learned, (li) => li.textContent ?? '');
    expect(lines).toEqual([
      '✓ Oxunartala: Ímynduð hleðsla ef öll tengi væru jónatengi',
      '✓ Oxun: Tapa rafeindum = oxunartala hækkar',
      '✓ Afoxun: Öðlast rafeindir = oxunartala lækkar',
      '✓ Stilling: Rafeindir sem ein tegund tapar = rafeindir sem önnur öðlast',
    ]);
  });
});
