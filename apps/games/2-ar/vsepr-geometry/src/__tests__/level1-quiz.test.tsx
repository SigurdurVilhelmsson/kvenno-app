// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';

/**
 * Stig 1's questions, and what they give away or garble:
 *
 *  - the picture's accessible name was the shape's name ("Línuleg lögun",
 *    "Beygð (2 lp) lögun"), which is the answer to several questions for a
 *    student using a screen reader;
 *  - the correct option alone carried an English gloss on some questions
 *    ("Áttflötungur (Octahedral)" among three bare names);
 *  - the feedback panel prefixed "Rétt!" to explanations that already began
 *    with it, and after a WRONG answer showed that "Rétt!" under "Rangt";
 *  - every wrong answer got the same misconception note, whatever the
 *    question tested.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup), and the level is unmounted afterwards.
 */

const SHAPE_NAMES = [
  'Línuleg',
  'Þríhyrnd',
  'Beygð',
  'Ferflötung',
  'pýramída',
  'Áttflötung',
  'tvípýramída',
];

let unmount: (() => void) | null = null;

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  unmount?.();
  unmount = null;
});

function startQuiz() {
  const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
  unmount = rendered.unmount;
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Hefja spurningar/ }));
  return { ui, container: rendered.container };
}

const optionButtons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('button')).filter((b) =>
    /^[a-d]\./.test(b.textContent?.trim() ?? '')
  );

function nextQuestion(ui: ReturnType<typeof within>, container: HTMLElement) {
  fireEvent.click(optionButtons(container)[0]);
  fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi 1/ }));
}

describe('Stig 1 questions do not give the answer away', () => {
  it("the picture's accessible name does not name the shape", () => {
    const { ui, container } = startQuiz();
    for (let q = 0; q < 8; q++) {
      const picture = container.querySelector('svg.animated-molecule');
      if (picture) {
        const label = picture.getAttribute('aria-label') ?? '';
        for (const name of SHAPE_NAMES) {
          expect(label, `question ${q + 1}`).not.toContain(name);
        }
        expect(label, `question ${q + 1}`).not.toMatch(/\b[lb]p\b/);
      }
      nextQuestion(ui, container);
    }
  });

  it('no option carries an English gloss', () => {
    const { ui, container } = startQuiz();
    for (let q = 0; q < 8; q++) {
      for (const b of optionButtons(container)) {
        expect(b.textContent, `question ${q + 1}`).not.toMatch(/\([A-Z][a-z]+\)/);
      }
      nextQuestion(ui, container);
    }
  });
});

describe('the feedback panel', () => {
  /** Move to question 2 (water), whose correct explanation opens "Rétt!". */
  function toWaterQuestion() {
    const level = startQuiz();
    nextQuestion(level.ui, level.container);
    expect(level.ui.getByText(/hefur vatn \(H₂O\)/)).toBeTruthy();
    return level;
  }

  const pickOption = (container: HTMLElement, text: RegExp) =>
    fireEvent.click(optionButtons(container).find((b) => text.test(b.textContent ?? ''))!);

  it('does not say "Rétt!" after a wrong answer', () => {
    const { ui, container } = toWaterQuestion();
    pickOption(container, /2 rafeind?asvið/);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(container.textContent).toContain('Rangt');
    expect(container.textContent).toMatch(/2 bindandi pör \+ 2 stök pör = 4 rafeind?asvið/);
    expect(container.textContent).not.toContain('Rétt!');
  });

  it('names the misconception the question tests, not the same one every time', () => {
    // Every wrong answer got the electron-versus-molecular-geometry note. A
    // wrong domain count now gets the domain-count note written for it.
    const { ui, container } = toWaterQuestion();
    pickOption(container, /6 rafeind?asvið/);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(container.textContent).toContain('Tvítengi og þrítengi telja sem EITT svið');
    expect(container.textContent).not.toContain('sameindaröðun (molecular geometry)');
  });

  it('says "Rétt!" once in the panel after a right answer', () => {
    const { ui, container } = toWaterQuestion();
    pickOption(container, /4 rafeind?asvið/);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    // Once as the panel's heading, once in the chosen option's own note.
    expect(container.textContent!.match(/Rétt!/g)).toHaveLength(2);
    expect(container.textContent).not.toContain('Rétt! Rétt!');
  });
});
