import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

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
});
