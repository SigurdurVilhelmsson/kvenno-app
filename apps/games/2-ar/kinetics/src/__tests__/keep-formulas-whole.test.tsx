// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { challenges } from '../data/level3-questions';
import { keepFormulasWhole } from '../utils/keep-formulas-whole';

/**
 * Unicode allows a line break between `]` and `[`, so on a phone Level 3 split rate laws such
 * as `k[NO][Br₂]` across two lines. `keepFormulasWhole` holds every bracketed token in a
 * no-wrap span. It must not change a single character the student reads — Level 3's own
 * option-order test finds options by their exact text — and must leave plain words wrapping.
 *
 * Queries are scoped to the rendered container: the repo runs vitest with retries and no RTL
 * auto-cleanup, so a document-wide query could see a previous attempt's DOM.
 */
function renderText(text: string) {
  return render(<p>{keepFormulasWhole(text)}</p>).container.querySelector('p')!;
}

describe('keepFormulasWhole', () => {
  it('holds each bracketed token together and leaves the rest free to wrap', () => {
    const p = renderText('Rate = k[NO]²[Br₂] og k[CHCl₃][Cl₂]^½ er hraðalögmál');
    const held = Array.from(p.querySelectorAll('span.whitespace-nowrap')).map((s) => s.textContent);
    expect(held).toEqual(['k[NO]²[Br₂]', 'k[CHCl₃][Cl₂]^½']);
  });

  it('leaves text without brackets as plain text', () => {
    const p = renderText('Skref 2 er hægt');
    expect(p.querySelectorAll('span')).toHaveLength(0);
    expect(p.textContent).toBe('Skref 2 er hægt');
  });

  it('does not change the text of any Level 3 option or explanation', () => {
    for (const challenge of challenges) {
      for (const option of challenge.options) {
        for (const text of [option.text, option.explanation]) {
          expect(renderText(text).textContent).toBe(text);
        }
      }
    }
  });
});
