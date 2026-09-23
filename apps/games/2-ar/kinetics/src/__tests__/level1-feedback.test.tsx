// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import './playthrough';
import { Level1 } from '../components/Level1';
import { challenges } from '../data/level1-questions';

/**
 * Level 1 built its FeedbackPanel explanation as `${explanation}\n\n**Hugtak:** ${concept}`.
 * The panel renders plain text, so every answer showed literal asterisks and the paragraph
 * break collapsed: "Þú margfaldaðir í stað þess að deila **Hugtak:** Hvarfhraði mælist…".
 */
describe('Level 1 feedback', () => {
  it('shows the concept under its own "Hugtak:" heading, with no markdown', () => {
    const { container, unmount } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    const wrong = challenges[0].options!.find((o) => !o.correct)!;
    const button = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(wrong.text)
    )!;
    fireEvent.click(button);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    const text = container.textContent ?? '';
    expect(text).not.toContain('**');
    const heading = ui.getByText('Hugtak:');
    expect(heading.parentElement!.textContent).toContain(challenges[0].conceptExplanation);
    unmount();
  });
});
