// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { LEVEL3_CHALLENGES } from '../data/level3-challenges';
import { getTitrationById } from '../data/titrations';
import type { MonoproticTitration } from '../types';

/**
 * Plays every question of every level through the real components and checks
 * what a student reads on each screen:
 *
 * - **No decimal point**, in the text or in an accessible name. Until
 *   2026-09-23 the game printed `0.100 M`, `+0.05 mL`, `Rétt svar: 0.13`, the
 *   pKa table and every burette and flask readout with a full stop.
 * - **The question counter never passes the total.** It counted questions
 *   *finished* plus one, so the last "Ljúka" click showed `7 / 6` (and
 *   `9 / 8` on Level 3) while the level faded out.
 */

beforeAll(() => {
  // InteractiveGraph draws to a canvas and the curve watches its size; jsdom
  // implements neither.
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
});

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const settle = () => act(() => vi.advanceTimersByTime(400));

function expectNoDecimalPoint(where: string) {
  expect(document.body.textContent, `${where}: text`).not.toMatch(/\d\.\d/);
  for (const el of document.querySelectorAll('[aria-label]')) {
    expect(el.getAttribute('aria-label'), `${where}: aria-label`).not.toMatch(/\d\.\d/);
  }
}

function expectCounterWithin(total: number, where: string) {
  const counter = screen.getByText(new RegExp(`^\\d+ / ${total}$`)).textContent!;
  const shown = Number(counter.split(' / ')[0]);
  expect(shown, `${where}: "${counter}"`).toBeGreaterThanOrEqual(1);
  expect(shown, `${where}: "${counter}"`).toBeLessThanOrEqual(total);
}

describe('Level 1 played through', () => {
  it('keeps a space before the gloss on the intro term', () => {
    render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    // JSX dropped the line break after </strong>, so the intro read
    // "títrunarferil(pH sem fall af …)".
    expect(document.body.textContent).toContain('títrunarferil (pH sem fall af');
  });

  it('lets the shuffle letter the options, so no label carries a letter of its own', () => {
    // Challenge 1's labels began "Ferill A:", "Ferill B:", "Ferill C:" — curves
    // never drawn, since the preview shows one. Behind the shuffled a/b/c an
    // option read "b. Ferill A: …", and the right answer was always "A".
    for (const c of LEVEL1_CHALLENGES) {
      for (const o of c.options ?? []) {
        expect(o.labelIs, `challenge ${c.id}`).not.toMatch(/^\S+ [A-Z]:/);
      }
      expect(Object.values(c.hints).join(' '), `challenge ${c.id}`).not.toMatch(/Ferill [A-Z]\b/);
    }
  });

  it('shows no decimal point and never counts past the last question', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    expectNoDecimalPoint('intro');
    fireEvent.click(screen.getByText(/Byrja æfingu/));
    settle();

    for (let n = 1; n <= LEVEL1_CHALLENGES.length; n++) {
      for (let tier = 0; tier < 4; tier++) {
        const hint = screen.queryByText(/^Vísbending \d\/4:/);
        if (hint) fireEvent.click(hint);
      }
      expectNoDecimalPoint(`question ${n}`);
      expectCounterWithin(LEVEL1_CHALLENGES.length, `question ${n}`);

      fireEvent.click(container.querySelector('div.space-y-3 > button')!);
      fireEvent.click(screen.getByRole('button', { name: 'Staðfesta' }));
      settle();
      expectNoDecimalPoint(`question ${n} feedback`);

      fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka stigi →/ }));
      settle();
      expectCounterWithin(LEVEL1_CHALLENGES.length, `after question ${n}`);
    }
  });
});

describe('Level 2 played through', () => {
  it('shows no decimal point and never counts past the last puzzle', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);

    for (let n = 1; n <= LEVEL2_PUZZLES.length; n++) {
      const add5 = screen.getByRole('button', { name: /^Bæta við 5 mL/ });
      fireEvent.click(add5);
      fireEvent.click(add5);
      fireEvent.click(screen.getByRole('button', { name: /Bæta við 0,05 mL/ }));
      settle();
      expectNoDecimalPoint(`puzzle ${n} titrating`);
      expectCounterWithin(LEVEL2_PUZZLES.length, `puzzle ${n}`);

      fireEvent.click(screen.getByRole('button', { name: /merkja jafngildispunkt/ }));
      settle();
      expectNoDecimalPoint(`puzzle ${n} marking`);

      fireEvent.click(screen.getByRole('button', { name: /^Staðfesta: / }));
      settle();
      fireEvent.click(screen.getByRole('button', { name: /Fenólftaleín/ }));
      fireEvent.click(screen.getByRole('button', { name: /Staðfesta val/ }));
      settle();
      expectNoDecimalPoint(`puzzle ${n} result`);

      fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka →/ }));
      settle();
      expectCounterWithin(LEVEL2_PUZZLES.length, `after puzzle ${n}`);
    }
  });
});

describe('Level 2 result agrees with the marking readout', () => {
  // The marking step prints the pH at the marked volume from the same model as
  // the flask; the result then named the equivalence point from a stored
  // number. For HF they disagreed on the same screen: marked at 45,0 mL the
  // readout said pH 8,0 (and the flask 7,97) while the result said pH 8,1.
  it('names the pH the student saw when marking the equivalence volume', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);

    for (const puzzle of LEVEL2_PUZZLES) {
      const t = getTitrationById(puzzle.titrationId) as MonoproticTitration;
      const add5 = screen.getByRole('button', { name: /^Bæta við 5 mL/ });
      for (let i = 0; i <= Math.ceil(t.equivalenceVolume / 5); i++) fireEvent.click(add5);
      fireEvent.click(screen.getByRole('button', { name: /merkja jafngildispunkt/ }));
      settle();
      fireEvent.change(screen.getByRole('slider', { name: 'Jafngildisrúmmál' }), {
        target: { value: String(t.equivalenceVolume) },
      });
      const marked = document.body.textContent!.match(/\(pH ≈ ([\d,]+)\)/)![1];

      fireEvent.click(screen.getByRole('button', { name: /^Staðfesta: / }));
      settle();
      fireEvent.click(screen.getByRole('button', { name: /Fenólftaleín/ }));
      fireEvent.click(screen.getByRole('button', { name: /Staðfesta val/ }));
      settle();
      const stated = document.body.textContent!.match(
        /Jafngildispunktur:\s*[\d,]+ mL \(pH ([\d,]+)\)/
      )![1];
      expect(stated, `puzzle ${puzzle.id} (${t.name})`).toBe(marked);

      fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka →/ }));
      settle();
    }
  });
});

describe('Level 3 played through', () => {
  it('shows no decimal point and never counts past the last problem', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);

    for (let n = 1; n <= LEVEL3_CHALLENGES.length; n++) {
      fireEvent.click(screen.getByRole('button', { name: /Sýna vísbendingu/ }));
      expectNoDecimalPoint(`problem ${n}`);
      expectCounterWithin(LEVEL3_CHALLENGES.length, `problem ${n}`);

      fireEvent.change(screen.getByLabelText(/Svar/), { target: { value: '999' } });
      fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
      settle();
      fireEvent.click(screen.getByRole('button', { name: /Sýna útreikningsgang/ }));
      expectNoDecimalPoint(`problem ${n} solution`);

      fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka stigi →/ }));
      settle();
      expectCounterWithin(LEVEL3_CHALLENGES.length, `after problem ${n}`);
    }
  });
});
