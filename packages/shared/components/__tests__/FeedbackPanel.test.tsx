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

  describe('phone density (design P5)', () => {
    // jsdom computes no Tailwind, so the phone layout is asserted through its classes: every
    // change is a `phone:` class (or an element that is display:none until `phone:`), which
    // is what leaves desktop untouched. The phone-variant test holds `phone:` itself to the
    // right media queries.
    const CONCEPTS = ['Mólmassi', 'Atómmassi', 'Mól'];
    const MISCONCEPTION = 'Undirvísitalan gildir aðeins um eitt frumefni.';

    function classesOf(el: Element | null | undefined): string[] {
      return (el?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
    }

    it('runs labels nobody can tap on as one line of words separated by middle dots', () => {
      const { container } = render(
        <FeedbackPanel
          feedback={{ isCorrect: false, explanation: EXPLANATION, relatedConcepts: CONCEPTS }}
        />
      );

      const row = screen.getByText('Mólmassi').parentElement!;
      // The desktop flex row is all still there; on a phone it becomes inline text that
      // follows "Tengd efni:" on the same line.
      expect(classesOf(row)).toEqual(
        expect.arrayContaining(['flex', 'flex-wrap', 'gap-2', 'mt-1', 'phone:inline'])
      );
      for (const concept of CONCEPTS) {
        // Every word stays visible: the pill is only unstyled, never hidden or clipped.
        const word = classesOf(screen.getByText(concept));
        expect(word).toEqual(
          expect.arrayContaining(['px-2', 'py-1', 'rounded-full', 'bg-white/70', 'phone:p-0'])
        );
        expect(word).not.toContain('hidden');
      }

      // One dot after each word but the last, all aria-hidden and display:none until the
      // phone variant turns them on. Each dot is glued to the word before it, so a wrapped
      // line never starts with one.
      const dots = Array.from(row.querySelectorAll('[aria-hidden="true"]'));
      expect(dots).toHaveLength(CONCEPTS.length - 1);
      for (const dot of dots) {
        expect(dot.textContent).toBe('·');
        expect(dot.previousSibling?.textContent).toMatch(/^[^\s]+.*[^\s]$/);
        // The break is a plain space after the dot, outside aria-hidden, so the words
        // are read apart and not run together.
        expect(dot.nextSibling?.nodeType).toBe(Node.TEXT_NODE);
        expect(dot.nextSibling?.textContent).toBe(' ');
        expect(classesOf(dot)).toEqual(expect.arrayContaining(['hidden', 'phone:inline']));
      }
      expect(row.firstElementChild?.textContent).toBe('Mólmassi');

      // A screen reader still hears the words and not the dots; the verdict text is unchanged.
      expect(container.querySelector('.feedback-panel')?.textContent).toMatch(/^✗Rangt/);
      const spoken = Array.from(row.childNodes)
        .filter((n) => !(n instanceof Element && n.getAttribute('aria-hidden') === 'true'))
        .map((n) => n.textContent)
        .join('');
      expect(spoken).toBe(CONCEPTS.join(' '));
    });

    it('leaves tappable chips as 44 px pills, with no dots', () => {
      render(
        <FeedbackPanel
          feedback={{ isCorrect: false, explanation: EXPLANATION, relatedConcepts: CONCEPTS }}
          onConceptClick={vi.fn()}
        />
      );

      const chip = screen.getByRole('button', { name: 'Mólmassi' });
      const row = chip.parentElement!;
      expect(classesOf(row).some((c) => c.startsWith('phone:'))).toBe(false);
      expect(row.querySelector('[aria-hidden="true"]')).toBeNull();
      for (const concept of CONCEPTS) {
        const classes = classesOf(screen.getByRole('button', { name: concept }));
        expect(classes).toContain('pointer-coarse:min-h-11');
        expect(classes.some((c) => c.startsWith('phone:'))).toBe(false);
      }
    });

    it('keeps "Af hverju?" open and the misconception outside the collapse', () => {
      render(
        <FeedbackPanel
          feedback={{
            isCorrect: false,
            explanation: EXPLANATION,
            misconception: MISCONCEPTION,
            relatedConcepts: CONCEPTS,
          }}
        />
      );

      expect(screen.getByRole('button', { name: /Af hverju/ }).getAttribute('aria-expanded')).toBe(
        'true'
      );
      expect(screen.getByText(EXPLANATION)).toBeDefined();
      expect(screen.getByText(MISCONCEPTION)).toBeDefined();
      // Nothing density added hides either of them on a phone.
      for (const text of [EXPLANATION, MISCONCEPTION]) {
        const classes = classesOf(screen.getByText(text));
        expect(classes.filter((c) => c.startsWith('phone:'))).toEqual([]);
      }
    });

    it("draws the icon on the verdict's own line on a phone", () => {
      const { container } = render(
        <FeedbackPanel feedback={{ isCorrect: true, explanation: EXPLANATION }} />
      );
      const icon = container.querySelector('.feedback-panel [aria-hidden="true"]');

      // Desktop keeps text-2xl; a phone draws it at the verdict's 24 px line height.
      expect(classesOf(icon)).toEqual(
        expect.arrayContaining(['text-2xl', 'phone:text-xl', 'phone:leading-6'])
      );
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
