import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level3 } from '../components/Level3';
import { ELEMENTS } from '../data/elements';

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

/**
 * A wrong answer is marked where the student gave it.
 *
 * Stig 1 has always ringed a wrong table tap in red, and Stig 2 turns a wrong
 * option red. Until 2026-09-23 the other two ways of answering did not: Stig 1's
 * name-by-symbol greyed the student's pick exactly like every option they had
 * not touched, and Stig 3's identify-by-particles passed the table an
 * expression that was `undefined` on both branches, so the tapped cell showed
 * nothing at all.
 */

afterEach(cleanup);

function questionText(): string {
  return document.querySelector('p.text-lg.font-bold')?.textContent ?? '';
}

function next() {
  fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
}

describe('Stig 1 name-by-symbol', () => {
  it('marks the wrong option the student picked, and only that one, red', () => {
    let checked = 0;
    // A run carries three name-by-symbol questions; two runs is plenty.
    for (let run = 0; run < 2; run++) {
      render(<Level1 onBack={() => {}} onComplete={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));

      for (let i = 0; i < 10; i++) {
        const symbol = questionText().match(/táknið (\S+)\?/)?.[1];
        if (symbol) {
          const answer = ELEMENTS.find((e) => e.symbol === symbol)!.name;
          const options = [
            ...document.querySelectorAll<HTMLButtonElement>('div.grid.grid-cols-2 > button'),
          ];
          const wrong = options.find((b) => b.textContent !== answer)!;
          fireEvent.click(wrong);

          expect(wrong.className).toMatch(/bg-red-100/);
          const right = options.find((b) => b.textContent === answer)!;
          expect(right.className).toMatch(/bg-green-100/);
          for (const other of options.filter((b) => b !== wrong && b !== right)) {
            expect(other.className).not.toMatch(/bg-red-100|bg-green-100/);
          }
          checked++;
        } else {
          fireEvent.click(screen.getByRole('button', { name: /\(H\), sætistala 1,/ }));
        }
        next();
      }
      cleanup();
    }
    expect(checked).toBe(6);
  });
});

describe('Stig 3 identify-by-particles', () => {
  it('rings the wrong cell the student tapped in red', () => {
    let checked = 0;
    for (let run = 0; run < 2; run++) {
      render(<Level3 onBack={() => {}} onComplete={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));

      for (let i = 0; i < 8; i++) {
        const z = questionText().match(/hefur (\d+) róteind(?:ir)? og/)?.[1];
        if (z) {
          const wrongZ = Number(z) === 1 ? 2 : 1;
          const tapped = screen.getByRole('button', {
            name: new RegExp(`, sætistala ${wrongZ},`),
          });
          fireEvent.click(tapped);

          expect(screen.getByRole('alert').textContent).toMatch(/Rangt/);
          expect(tapped.className).toMatch(/ring-red-500/);
          checked++;
        } else {
          fireEvent.change(screen.getByPlaceholderText('t.d. 12'), { target: { value: '1' } });
          fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
        }
        next();
      }
      cleanup();
    }
    expect(checked).toBe(4);
  });

  it('does not ring a cell red when the tap was right', () => {
    render(<Level3 onBack={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    for (let i = 0; i < 8; i++) {
      const z = questionText().match(/hefur (\d+) róteind(?:ir)? og/)?.[1];
      if (z) {
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`, sætistala ${z},`) }));
        expect(screen.getByRole('alert').textContent).toMatch(/Rétt/);
        expect(document.querySelector('.ring-red-500')).toBeNull();
        return;
      }
      fireEvent.change(screen.getByPlaceholderText('t.d. 12'), { target: { value: '1' } });
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      next();
    }
    throw new Error('no identify-by-particles question in the run');
  });
});
