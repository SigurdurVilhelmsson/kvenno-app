// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { answer, chooseIndicator, pour, recordEndpoint, stockMolarity } from './level2-driver';
import { Level2 } from '../components/Level2';
import { indicators } from '../data/indicators';
import { LEVEL2_PUZZLES, printedEquivalencePH } from '../data/level2-puzzles';
import { getTitrationById } from '../data/titrations';

/**
 * Each indicator card used to say which titration it suits ("Hentar best við
 * títrun veikrar sýru með sterkum basa"), in the very list a student chooses
 * from — half of Stig 2's question answered on the card. Mobile-pass decision
 * 114 (c), 2026-10-23: the description is shown after the result, beside the
 * verdict on the chosen indicator, and not while choosing.
 *
 * Shown beside a verdict, it must not contradict it. Two did: methyl orange
 * claimed to suit a strong acid, which no puzzle accepts it for, and
 * phenolphthalein every weak acid, which HF's puzzle (pH 8,0) does not accept
 * it for. Both now state the bound their range sets.
 */

beforeAll(() => {
  // Wider than a phone the level scrolls too (the bench, the result), and jsdom has no
  // scrollBy.
  window.scrollBy = (() => {}) as never;
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

const shown = (text: string) => (document.body.textContent ?? '').includes(text);

describe('Stig 2 indicator cards', () => {
  it('say which is chosen, and name their colours, to a screen reader', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);
    const card = screen.getByRole('button', { name: /^Fenólftalín/ });
    expect(card.getAttribute('aria-pressed')).toBe('false');
    expect(card.textContent).toContain('Súr: litlaus');
    expect(card.textContent).toContain('Basísk: bleik');
    fireEvent.click(card);
    expect(screen.getByRole('button', { name: /^Fenólftalín/ }).getAttribute('aria-pressed')).toBe(
      'true'
    );
  });
});

describe('Stig 2 indicator descriptions', () => {
  it('are hidden while choosing and shown for the chosen one after the result', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} drawMolarity={stockMolarity} />);

    // The list is on screen to choose from, with no description on any card.
    expect(screen.getByRole('button', { name: /^Metýlrautt/ })).toBeTruthy();
    for (const { id, description } of indicators) expect(shown(description), id).toBe(false);

    chooseIndicator('methyl-red');
    for (const { id, description } of indicators) expect(shown(description), id).toBe(false);
    pour(25);
    recordEndpoint();
    answer('0,100');

    for (const { id, description } of indicators) {
      expect(shown(description), id).toBe(id === 'methyl-red');
    }
  });
});

/** How each description names a kind of titration. */
const KIND: Record<string, string> = {
  'strong-strong': 'sterkrar sýru með sterkum basa',
  'weak-strong': 'veikrar sýru með sterkum basa',
  'strong-weak': 'veiks basa með sterkri sýru',
};

describe('the descriptions agree with the grader', () => {
  it('names a kind of titration in every description', () => {
    for (const { id, description } of indicators) {
      expect(
        Object.values(KIND).some((kind) => description.includes(kind)),
        id
      ).toBe(true);
    }
  });

  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: an indicator that claims its kind is accepted, within any bound it states',
    (_id, puzzle) => {
      const kind = KIND[getTitrationById(puzzle.titrationId)!.type];
      const pH = printedEquivalencePH(puzzle.titrationId);
      for (const { id, description } of indicators) {
        if (!description.includes(kind)) continue;
        const bound = description.match(/ef pH við jafngildispunkt er (\d+,\d+) eða (hærra|lægra)/);
        const within = !bound
          ? true
          : bound[2] === 'hærra'
            ? pH >= parseStudentNumber(bound[1])
            : pH <= parseStudentNumber(bound[1]);
        expect(
          puzzle.acceptableIndicators.includes(id),
          `${id} at pH ${pH}: "${description}"`
        ).toBe(within);
      }
    }
  );
});
