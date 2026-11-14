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
import {
  answer,
  chooseIndicator,
  concentrationFrom,
  next,
  playPuzzle,
  pour,
  recordEndpoint,
  stockMolarity,
} from './level2-driver';

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

      fireEvent.click(container.querySelector('[data-options] > button')!);
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
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);

    for (let n = 1; n <= LEVEL2_PUZZLES.length; n++) {
      const puzzle = LEVEL2_PUZZLES[n - 1];
      expectNoDecimalPoint(`puzzle ${n} choosing`);
      expectCounterWithin(LEVEL2_PUZZLES.length, `puzzle ${n}`);
      chooseIndicator(puzzle.acceptableIndicators[0]);
      const t = getTitrationById(puzzle.titrationId) as MonoproticTitration;
      pour(Math.round(t.equivalenceVolume * 20) / 20);
      settle();
      expectNoDecimalPoint(`puzzle ${n} titrating`);
      recordEndpoint();
      expectNoDecimalPoint(`puzzle ${n} calculating`);
      answer(concentrationFrom(t, Math.round(t.equivalenceVolume * 20) / 20));
      expectNoDecimalPoint(`puzzle ${n} result`);
      expect(screen.getByText('✓ Rétt!')).toBeTruthy();

      next();
      expectCounterWithin(LEVEL2_PUZZLES.length, `after puzzle ${n}`);
    }
  });
});

describe("Level 2 grades the concentration on the student's own endpoint", () => {
  // A student who stops 0,15 mL past equivalence (inside the tolerance) and
  // works the concentration out correctly from that reading is right: the
  // calculation is graded on what they read, not on the hidden answer.
  it('accepts the concentration from an endpoint inside the tolerance', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);
    playPuzzle(1, 'phenolphthalein', 0.15);
    expect(screen.getByText('✓ Rétt!')).toBeTruthy();
  });

  it("rejects the true concentration when the student's endpoint gives another", () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);
    const t = getTitrationById(1) as MonoproticTitration;
    chooseIndicator('phenolphthalein');
    pour(t.equivalenceVolume + 0.15);
    recordEndpoint();
    // 25,15 mL gives 0,1006 M; 0,0980 M is more than 2 % from it.
    answer('0,0980');
    expect(screen.getByText('✗ Ekki rétt')).toBeTruthy();
  });

  it('draws the sample once and does not print its concentration', () => {
    const drawn: number[] = [];
    render(
      <Level2
        onComplete={() => {}}
        onBack={() => {}}
        drawMolarity={(b) => {
          const m = b.analyte.molarity * 1.1;
          drawn.push(m);
          return m;
        }}
      />
    );
    expect(drawn.length).toBe(1);
    expect(document.body.textContent).toContain('styrkur óþekktur');
    expect(document.body.textContent).not.toContain('0,110');
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

describe('Level 2 states its tolerance before the student titrates', () => {
  it('shows the endpoint tolerance with the pour controls', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);
    chooseIndicator('phenolphthalein');
    expect(document.body.textContent).toContain('Leyfilegt svigrúm: ±0,2 mL');
  });
});
