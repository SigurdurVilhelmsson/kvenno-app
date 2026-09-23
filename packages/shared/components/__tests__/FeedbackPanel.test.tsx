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

  it('grows the "Af hverju?" toggle to a 44 px target on touch without moving the panel', () => {
    render(<FeedbackPanel feedback={{ isCorrect: false, explanation: EXPLANATION }} />);

    const toggle = screen.getByRole('button', { name: /Af hverju/ });
    // 20 px of text + 2 × 12 px padding = 44 px; the equal negative margin
    // hands the added space back, so the layout is the same as on desktop.
    expect(toggle.className).toContain('pointer-coarse:py-3');
    expect(toggle.className).toContain('pointer-coarse:-my-3');
  });
});
