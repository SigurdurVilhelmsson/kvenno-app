// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * Every level swaps the feedback back for the answer controls in place when the student moves
 * on or tries again. On a phone the page is by then scrolled below the prompt, so the next
 * question, molecule to name or name to build used to load off screen above them, leaving only
 * the answer buttons in view. Each level scrolls its prompt back when it is off the top of the
 * screen, and must leave the page alone when it is on screen, which is every desktop layout.
 *
 * jsdom has no layout, so the prompt's position is faked through getBoundingClientRect.
 */

const realRect = Element.prototype.getBoundingClientRect;
const realScroll = Element.prototype.scrollIntoView;

afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect;
  Element.prototype.scrollIntoView = realScroll;
});

function answerWrongInTextMode() {
  const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));
  fireEvent.click(ui.getByRole('button', { name: /Skipta í skrifa-ham/ }));
  fireEvent.change(rendered.container.querySelector('input[type=text]')!, {
    target: { value: 'x' },
  });
  fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  return ui;
}

/** Pretend every element sits at `top`, and record what gets scrolled into view. */
function fakeLayout(top: number) {
  const scrolled: Element[] = [];
  Element.prototype.getBoundingClientRect = () => ({ top, height: 400 }) as DOMRect;
  Element.prototype.scrollIntoView = function (this: Element) {
    scrolled.push(this);
  };
  return scrolled;
}

const isMoleculeBox = (el: Element) => /Alkan \(eintengi\)/.test(el.textContent ?? '');

describe('Stig 2: the next molecule is brought back on screen', () => {
  it('scrolls the new molecule into view when the page is left below it', () => {
    const ui = answerWrongInTextMode();
    const scrolled = fakeLayout(-900);

    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));

    expect(ui.getByText(/Sameind 2 af/)).toBeTruthy();
    expect(scrolled.some(isMoleculeBox)).toBe(true);
  });

  it('scrolls it back after "Reyna aftur" too', () => {
    const ui = answerWrongInTextMode();
    const scrolled = fakeLayout(-900);

    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));

    expect(scrolled.some(isMoleculeBox)).toBe(true);
  });

  it('leaves the page alone when the molecule is still on screen', () => {
    const ui = answerWrongInTextMode();
    const scrolled = fakeLayout(-100);

    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));

    expect(scrolled.some(isMoleculeBox)).toBe(false);
  });
});

describe('Stig 2 Byggja: the next name to build is brought back on screen', () => {
  function answerFirstChallenge() {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: /Byggja sameindir/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    return ui;
  }
  const isChallengeCard = (el: Element) => /Byggðu þessa sameind:/.test(el.textContent ?? '');

  it('scrolls the next challenge into view when the page is left below it', () => {
    const ui = answerFirstChallenge();
    const scrolled = fakeLayout(-900);

    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));

    expect(ui.getByText(/Áskorun 2 af/)).toBeTruthy();
    expect(scrolled.some(isChallengeCard)).toBe(true);
  });

  it('leaves the page alone when the challenge is still on screen', () => {
    const ui = answerFirstChallenge();
    const scrolled = fakeLayout(40);

    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));

    expect(scrolled.some(isChallengeCard)).toBe(false);
  });
});

describe('Stig 1 and 3 quizzes: the next question is brought back on screen', () => {
  const isQuestionCard = (text: RegExp) => (el: Element) =>
    el.classList.contains('border-2') && text.test(el.textContent ?? '');

  it('Stig 1: scrolls the next question into view, and leaves a visible one alone', () => {
    const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    const next = () =>
      fireEvent.click(ui.getAllByRole('button', { name: /Næsta →|Viðskeyti →/ })[0]);
    for (let i = 0; i < 12; i++) next();
    fireEvent.click(ui.getByRole('button', { name: /Sameindasmiður →/ }));

    // Entering the quiz from the bottom of the builder
    let scrolled = fakeLayout(-300);
    fireEvent.click(ui.getByRole('button', { name: /Byrja próf/ }));
    expect(scrolled.some(isQuestionCard(/Hvað táknar/))).toBe(true);

    fireEvent.click(rendered.container.querySelector('.grid button')!);
    scrolled = fakeLayout(-300);
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning/ }));
    expect(ui.getByText(/Spurning 2 af/)).toBeTruthy();
    expect(scrolled.some(isQuestionCard(/Hvað táknar/))).toBe(true);

    fireEvent.click(rendered.container.querySelector('.grid button')!);
    scrolled = fakeLayout(40);
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning/ }));
    expect(scrolled).toHaveLength(0);
  });

  it('Stig 3: scrolls the next challenge into view, and leaves a visible one alone', () => {
    const rendered = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    for (let i = 0; i < 3; i++) fireEvent.click(ui.getByRole('button', { name: /Næsta →/ }));

    let scrolled = fakeLayout(-300);
    fireEvent.click(ui.getByRole('button', { name: /Byrja áskoranir/ }));
    expect(scrolled.some(isQuestionCard(/\?/))).toBe(true);

    fireEvent.click(rendered.container.querySelector('.grid button')!);
    scrolled = fakeLayout(-300);
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    expect(ui.getByText(/Áskorun 2 af/)).toBeTruthy();
    expect(scrolled.some(isQuestionCard(/\?/))).toBe(true);

    fireEvent.click(rendered.container.querySelector('.grid button')!);
    scrolled = fakeLayout(40);
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    expect(scrolled).toHaveLength(0);
  });
});
