import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChainBuilder } from '../components/ChainBuilder';
import { UnitText, unitRuns } from '../components/UnitText';
import { problems, problemsForPhase } from '../data/problems';
import { allRatios, ratioById } from '../data/ratios';
import { correctionPrompt, predictionOptions, solveChain, type ChainSlot } from '../engine/chain';
import type { Orientation } from '../engine/units';

/**
 * The correction prompt and the prediction options are sentences built around
 * units such as `g Mg·g Mg / mol Mg`. On a phone the space inside `g Mg` was a
 * place to wrap, so a line could end on `g` and the next start on `Mg·g Mg`.
 * `UnitText` holds each unit and its substance together and must not change a
 * single character of the sentence.
 */

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const heldIn = (el: Element): string[] =>
  Array.from(el.querySelectorAll('span.whitespace-nowrap')).map((s) => s.textContent ?? '');

describe('unitRuns', () => {
  it('holds every unit with its substance, and leaves the prose free', () => {
    const runs = unitRuns('Útkoman verður g Mg·g Mg / mól Mg, sem er ekki eining sem þýðir neitt.');
    expect(runs.filter((r) => r.unit).map((r) => r.text)).toEqual(['g Mg', 'g Mg', 'mól Mg']);
    expect(runs.map((r) => r.text).join('')).toBe(
      'Útkoman verður g Mg·g Mg / mól Mg, sem er ekki eining sem þýðir neitt.'
    );
  });

  it('takes the longest substance, so g MgO is not read as g Mg', () => {
    expect(unitRuns('í g MgO').filter((r) => r.unit)).toEqual([{ text: 'g MgO', unit: true }]);
  });

  it('holds a unit a metric card took from the quantity it met', () => {
    // No card states `L NaOH(aq)`; the metric card's species is inferred.
    expect(unitRuns('kominn í L NaOH(aq) og').filter((r) => r.unit)).toEqual([
      { text: 'L NaOH(aq)', unit: true },
    ]);
  });

  it('leaves text with no unit in it as it is', () => {
    expect(unitRuns('Hvað þarf að laga?')).toEqual([{ text: 'Hvað þarf að laga?', unit: false }]);
  });
});

describe('UnitText changes no character of any sentence the game builds', () => {
  const ORIENTATIONS: Orientation[] = ['forward', 'flipped'];

  // Every one- and two-card chain from each problem's own pool: that reaches all
  // three correction branches and every prediction option on every problem.
  const chains = (poolIds: string[]): ChainSlot[][] => {
    const singles = poolIds.flatMap((id) =>
      ORIENTATIONS.map((orientation) => ({ equivalenceId: id, orientation }))
    );
    return [...singles.map((s) => [s]), ...singles.flatMap((a) => singles.map((b) => [a, b]))];
  };

  it.each(problems.map((p) => [p.id, p] as const))('%s', (_id, problem) => {
    const pool = problem.poolIds.map(ratioById);
    const texts = new Set<string>();
    for (const chain of chains(problem.poolIds)) {
      const result = solveChain(problem.start, chain, pool, problem.target);
      const prompt = correctionPrompt(result, problem.target, pool);
      if (prompt) {
        texts.add(prompt.problem);
        for (const option of prompt.options) texts.add(option.explanation);
      }
      for (const option of predictionOptions(problem.start, chain, pool, problem.target)) {
        texts.add(option.label);
      }
    }
    expect(texts.size).toBeGreaterThan(5);

    for (const text of texts) {
      const view = render(
        <p>
          <UnitText text={text} />
        </p>
      );
      const p = view.container.querySelector('p')!;
      expect(p.textContent).toBe(text);
      // Nothing held on one line is longer than a unit with its substance.
      for (const held of heldIn(p)) {
        expect(held.split(' ')).toHaveLength(2);
      }
      cleanup();
    }
  });

  it('knows every substance in the pool', () => {
    // A substance added to ratios.ts is picked up with no second list to update.
    for (const ratio of allRatios) {
      for (const side of [ratio.left, ratio.right]) {
        if (!side.species) continue;
        const token = `${side.unit} ${side.species}`;
        expect(
          unitRuns(`í ${token}.`)
            .filter((r) => r.unit)
            .map((r) => r.text)
        ).toEqual([token]);
      }
    }
  });
});

describe('the screen holds units whole where it builds sentences around them', () => {
  const tapCard = (view: ReturnType<typeof render>, labelPart: string) =>
    fireEvent.click(
      view.getAllByRole('button').find((b) => b.getAttribute('aria-label')?.includes(labelPart))!
    );

  it('in the correction prompt', () => {
    vi.useFakeTimers();
    const view = render(
      <ChainBuilder
        problems={problemsForPhase('beita')}
        predictBeforeSolving={false}
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    tapCard(view, ': 24,31 g Mg');
    fireEvent.click(view.getByRole('button', { name: 'Leysa' }));
    fireEvent.click(view.getByRole('button', { name: 'Sýna öll skrefin strax' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });

    const prompt = view.getByText(/Útkoman verður/);
    expect(prompt.textContent).toContain('Útkoman verður g Mg·g Mg / mól Mg');
    expect(heldIn(prompt)).toEqual(['g Mg', 'mól Mg', 'g Mg', 'g Mg', 'mól Mg']);
  });

  it('in the prediction options and the target chip', () => {
    const view = render(
      <ChainBuilder
        problems={problemsForPhase('aefa')}
        predictBeforeSolving
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    tapCard(view, ': 24,31 g Mg');
    fireEvent.click(view.getByRole('button', { name: 'Leysa' }));

    const option = view.getByRole('button', { name: 'g Mg·g Mg / mól Mg' });
    expect(heldIn(option)).toEqual(['g Mg', 'g Mg', 'mól Mg']);
    // A break is still allowed between two units, after the dot.
    expect(option.querySelector('wbr')).not.toBeNull();

    const chip = view.getByText(/^Markið:/);
    expect(heldIn(chip)).toEqual(['atóm Mg']);
  });
});
