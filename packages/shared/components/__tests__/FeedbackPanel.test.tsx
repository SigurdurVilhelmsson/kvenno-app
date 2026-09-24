import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { FeedbackPanel } from '../FeedbackPanel';

const EXPLANATION = 'Mólmassi H₂O er 18,02 g/mól — tvö vetni og eitt súrefni.';

describe('FeedbackPanel', () => {
  it('shows the authored explanation without a click', () => {
    render(<FeedbackPanel feedback={{ isCorrect: false, explanation: EXPLANATION }} />);

    expect(screen.getByText(EXPLANATION)).toBeDefined();
    expect(screen.getByRole('button', { name: /Af hverju/ }).getAttribute('aria-expanded')).toBe(
      'true'
    );
  });

  it('lets the student collapse it again', () => {
    render(<FeedbackPanel feedback={{ isCorrect: false, explanation: EXPLANATION }} />);

    fireEvent.click(screen.getByRole('button', { name: /Af hverju/ }));

    expect(screen.queryByText(EXPLANATION)).toBeNull();
  });

  it('starts collapsed only when a call site asks for it', () => {
    render(
      <FeedbackPanel
        feedback={{ isCorrect: false, explanation: EXPLANATION }}
        config={{ defaultExpanded: false }}
      />
    );

    expect(screen.queryByText(EXPLANATION)).toBeNull();
  });

  it('leaves the explanation open when a call site passes an unrelated config', () => {
    // Every call site that passes `config` today sets flags other than
    // `defaultExpanded`; spreading over DEFAULT_CONFIG must not re-hide the text.
    render(
      <FeedbackPanel
        feedback={{ isCorrect: false, explanation: EXPLANATION }}
        config={{ showExplanation: true, showMisconceptions: false }}
      />
    );

    expect(screen.getByText(EXPLANATION)).toBeDefined();
  });

  it('renders the misconception outside the collapsible region', () => {
    render(
      <FeedbackPanel
        feedback={{
          isCorrect: false,
          explanation: EXPLANATION,
          misconception: 'Undirvísitalan gildir aðeins um eitt frumefni.',
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Af hverju/ }));

    expect(screen.queryByText(EXPLANATION)).toBeNull();
    expect(screen.getByText(/Undirvísitalan gildir aðeins/)).toBeDefined();
  });

  it('shows related concepts as plain labels when tapping them does nothing', () => {
    // No game passes onConceptClick, and a button that does nothing is a dead
    // tap target on a phone and a false promise to a screen reader.
    render(
      <FeedbackPanel
        feedback={{ isCorrect: true, explanation: EXPLANATION, relatedConcepts: ['Mólmassi'] }}
      />
    );

    expect(screen.getByText('Mólmassi').tagName).toBe('SPAN');
    expect(screen.queryByRole('button', { name: 'Mólmassi' })).toBeNull();
  });

  it('makes related concepts buttons when a call site handles them', () => {
    const onConceptClick = vi.fn();
    render(
      <FeedbackPanel
        feedback={{ isCorrect: true, explanation: EXPLANATION, relatedConcepts: ['Mólmassi'] }}
        onConceptClick={onConceptClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mólmassi' }));

    expect(onConceptClick).toHaveBeenCalledWith('mólmassi');
  });

  it('keeps the line breaks a call site writes into the explanation', () => {
    // molmassi Stig 2 passes `${formula}\n${steps}` and ph-titration Stig 1 a
    // blank line under its verdict. Without pre-line the browser folds both into
    // one run-on paragraph. jsdom computes no Tailwind, so the class is the check.
    const worked = 'n = m / M\n5,00 g × (1 mól / 18,02 g) = 0,277 mól';
    const { container } = render(
      <FeedbackPanel feedback={{ isCorrect: false, explanation: worked }} />
    );

    const box = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === worked
    );
    expect(box, 'the explanation box, with its newline intact').toBeDefined();
    expect(box!.className.split(/\s+/)).toContain('whitespace-pre-line');
  });

  describe('at phone width', () => {
    // At 320 px the desktop nesting (p-4 outside, a 24 px icon column and a
    // 12 px gap, then p-3 inside) left the explanation about 170 px of text.
    // Below `sm` both paddings shrink and everything under the verdict runs
    // under the icon; every `sm:` class puts the desktop value back, so desktop
    // is unchanged (checked pixel for pixel in Chromium at 640-1440 px).
    const MISCONCEPTION = 'Undirvísitalan gildir aðeins um eitt frumefni.';
    const NEXT = 'Skoðaðu útreikninginn.';

    function classesOf(el: Element | null | undefined): string[] {
      return (el?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
    }

    function renderWrong() {
      return render(
        <FeedbackPanel
          feedback={{
            isCorrect: false,
            explanation: EXPLANATION,
            misconception: MISCONCEPTION,
            relatedConcepts: ['Mólmassi'],
            nextSteps: NEXT,
          }}
        />
      );
    }

    it('pads the panel less on a phone and exactly as before from sm up', () => {
      const { container } = renderWrong();
      const panel = classesOf(container.querySelector('.feedback-panel'));

      expect(panel).toEqual(expect.arrayContaining(['p-3', 'sm:p-4']));
      expect(panel).not.toContain('p-4');
    });

    it('pads the explanation and misconception boxes less on a phone', () => {
      renderWrong();
      // getByText matches on an element's own text nodes, so the misconception
      // query returns the box itself, not the "Algeng villa:" span inside it.
      for (const box of [screen.getByText(EXPLANATION), screen.getByText(MISCONCEPTION)]) {
        const classes = classesOf(box);
        expect(classes).toEqual(expect.arrayContaining(['p-2.5', 'sm:p-3']));
        expect(classes).not.toContain('p-3');
      }
    });

    it('runs everything below the verdict under the icon on a phone', () => {
      const { container } = renderWrong();
      const icon = container.querySelector('.feedback-panel [aria-hidden="true"]');
      const header = icon?.parentElement;

      // The icon column is pinned to 24 px and the gap to 8 px on a phone, and
      // both go back to their desktop values from sm up...
      expect(classesOf(icon)).toEqual(expect.arrayContaining(['w-6', 'sm:w-auto']));
      expect(classesOf(header)).toEqual(expect.arrayContaining(['gap-2', 'sm:gap-3']));

      // ...so -ml-8 (32 px) takes back exactly that column, for every block
      // below the verdict, and sm:ml-0 returns each to where it was.
      const blocks = [
        screen.getByRole('button', { name: /Af hverju/ }).parentElement,
        screen.getByText(MISCONCEPTION),
        screen.getByText('Tengd efni:').parentElement,
        screen.getByText(NEXT).parentElement,
      ];
      for (const block of blocks) {
        expect(classesOf(block)).toEqual(expect.arrayContaining(['-ml-8', 'sm:ml-0']));
      }

      // The verdict itself stays beside the icon.
      expect(classesOf(screen.getByText('Rangt'))).not.toContain('-ml-8');
    });

    it('draws the icon once, so the panel reads the same as before', () => {
      // A second, phone-only copy of the icon would put "✗✗Rangt" into the
      // panel's text. lewis-structures reads that text to find the verdict.
      const { container } = renderWrong();
      const panel = container.querySelector('.feedback-panel');

      expect(panel?.textContent).toMatch(/^✗Rangt/);
    });
  });

  it('grows the "Af hverju?" toggle to a 44 px target on touch without moving the panel', () => {
    render(<FeedbackPanel feedback={{ isCorrect: false, explanation: EXPLANATION }} />);

    const toggle = screen.getByRole('button', { name: /Af hverju/ });
    // 20 px of text + 2 × 12 px padding = 44 px; the equal negative margin
    // hands the added space back, so the layout is the same as on desktop.
    expect(toggle.className).toContain('pointer-coarse:py-3');
    expect(toggle.className).toContain('pointer-coarse:-my-3');
  });
});
