import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';

clockPastNextGuard();

/**
 * Stig 1 and 2 count the particles of a reaction, and they are not all
 * molecules: Mg, Na, K, Ca, Zn and Cu are atoms, and they react to ionic
 * formula units. The game called every one of them a `sameind` — the
 * misconception CURRICULUM_REVIEW.md B7 names, which Mólmassi corrects later.
 *
 * Siggi's ruling, 2026-10-23 (mobile-pass decision 57 (a)): the neutral
 * `eindir` throughout Stig 1 and 2, for H₂ and O₂ as well, so one word covers
 * every particle the student counts. Stig 3 weighs in grams and is untouched.
 *
 * These play the real levels through their buttons and read what a student
 * reads and what a screen reader says: the text and every aria-label.
 */

afterEach(() => {
  cleanup();
  localStorage.clear();
});

/** Everything on screen, plus every accessible name set by aria-label. */
function readable(root: HTMLElement): string {
  const labels = Array.from(root.querySelectorAll('[aria-label]')).map((e) =>
    e.getAttribute('aria-label')
  );
  return [root.textContent ?? '', ...labels].join('\n');
}

function expectNoMolecules(root: HTMLElement, where: string) {
  expect(readable(root), where).not.toMatch(/sameind/i);
}

describe('Stig 1', () => {
  it('calls what it counts eindir, on the intro, every question and its feedback', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    expectNoMolecules(container, 'the intro');
    expect(container.textContent).toMatch(/Deildu fjölda einda með stuðlinum/);

    fireEvent.click(within(container).getByText(/Byrja æfingar/));
    for (let q = 0; q < 8; q++) {
      expectNoMolecules(container, `question ${q + 1}`);
      const cards = within(container)
        .getAllByRole('button')
        .filter((b) => /\d+ eindir/.test(b.textContent ?? ''));
      expect(cards, `question ${q + 1}: two reactant cards counting eindir`).toHaveLength(2);
      // Each ball is named "<formula> eind" to a screen reader.
      const balls = Array.from(container.querySelectorAll('[role="img"]'));
      expect(balls.length).toBeGreaterThan(0);
      for (const ball of balls) expect(ball.getAttribute('aria-label')).toMatch(/^\S+ eind$/);

      fireEvent.click(cards[0]);
      expectNoMolecules(container, `question ${q + 1}, feedback`);
      fireEvent.click(within(container).getByText(/Næsta spurning|Sjá niðurstöður/));
    }
    expectNoMolecules(container, 'the results');
  });
});

describe('Stig 2', () => {
  it('calls what it counts eindir, on every question and its feedback', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    for (let q = 0; q < 8; q++) {
      expectNoMolecules(container, `question ${q + 1}`);
      expect(within(container).getAllByText(/^\d+ eindir \(stuðull: \d+\)$/)).toHaveLength(2);

      // A wrong answer, so the misconception line shows too.
      fireEvent.change(container.querySelector('input')!, { target: { value: '9999' } });
      fireEvent.click(within(container).getByText('Athuga'));
      expectNoMolecules(container, `question ${q + 1}, feedback`);
      // The 1st, 3rd, 5th and 7th ask how often the reaction runs, and their
      // wrong-answer line is the one that named the particles.
      if (q % 2 === 0) expect(container.textContent).toMatch(/Deildu fjölda einda hvarfefnis/);
      fireEvent.click(within(container).getByText(/Næsta spurning|Sjá niðurstöður/));
    }
    expectNoMolecules(container, 'the results');
  });
});

describe('the source of Stig 1 and 2', () => {
  // A string only some draws reach would slip past the plays above.
  it.each(['Level1.tsx', 'Level2.tsx', 'Molecule.tsx'])('%s says sameind nowhere', (file) => {
    const source = readFileSync(join(__dirname, '..', 'components', file), 'utf8');
    const hits = source
      .split('\n')
      .map((line, i) => `${i + 1}: ${line.trim()}`)
      .filter((line) => /sameind/i.test(line));
    expect(hits).toEqual([]);
  });
});
