// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Level3 } from '../components/Level3';
import { COMPOUNDS } from '../data/compounds';
import { segmentName } from '../data/naming';

/**
 * Play Level 3 the way a student does, and require every question to be
 * answerable.
 *
 * This is the direct guard on the defect. The level asks the student to build a
 * compound's name out of clickable parts, and for two thirds of its pool the
 * parts on offer could not spell the name — so no sequence of clicks was ever
 * marked correct. Unit tests over the data would not have caught it, because
 * the data was fine; the tray was not.
 *
 * So this drives the real component: read the formula it is showing, look up how
 * that name decomposes, click those parts in order, and require "Rétt". Ten
 * questions per run, and the run is repeated, because the compounds and the
 * distractors are both shuffled.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

const nameFor = (formula: string) => COMPOUNDS.find((c) => c.formula === formula)!.name;

/** The formula currently on screen — rendered in the big monospace heading. */
function currentFormula(): string {
  const label = screen.getByText('Efnaformúla:');
  const shown = label.parentElement!.querySelector('.font-mono');
  return shown!.textContent!.trim();
}

/** The tray of clickable parts, which is the region under "Tiltækir partar:". */
function tray(): HTMLElement {
  return screen.getByText('Tiltækir partar:').parentElement as HTMLElement;
}

describe('every question Level 3 asks can be answered', () => {
  const playOneRun = () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <Level3 t={t} onComplete={onComplete} onBack={vi.fn()} onCorrectAnswer={vi.fn()} />
    );

    for (let question = 0; question < 10; question++) {
      const formula = currentFormula();
      const expected = nameFor(formula);
      const segments = segmentName(expected);
      expect(segments, `${formula} did not decompose`).not.toBeNull();

      for (const segment of segments!) {
        const button = within(tray())
          .getAllByRole('button')
          .find((b) => b.textContent === segment.text);
        expect(
          button,
          `no "${segment.text}" part offered for ${formula} (${expected}); tray held [${within(
            tray()
          )
            .getAllByRole('button')
            .map((b) => b.textContent)
            .join(', ')}]`
        ).toBeDefined();
        fireEvent.click(button!);
      }

      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));

      // The level renders the built name; a correct answer must be graded so.
      expect(
        screen.queryByText(`Rétt nafn: ${expected}.`, { exact: false }),
        `${formula} was marked wrong for its own name, ${expected}`
      ).toBeNull();

      const next = screen.queryByRole('button', { name: /Næsta efni/ });
      fireEvent.click(next ?? screen.getByRole('button', { name: 'Sjá niðurstöður' }));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    // Full marks: ten questions, ten points each, no wrong attempts.
    const [score, maxScore] = onComplete.mock.calls[0];
    expect(maxScore).toBe(100);
    expect(score).toBe(100);

    unmount();
  };

  it.each([0, 1, 2, 3, 4])('run %i', () => {
    playOneRun();
  });
});
