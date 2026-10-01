import { fireEvent, within } from '@testing-library/react';

/**
 * Stig 2 and Stig 3 open on a worked example before their first item (teach
 * before test, docs/REVIEW-QUEUE.md C6). Tests about the items start past it,
 * as a student does who presses its button.
 */
export function pastExample(container: HTMLElement): void {
  const ui = within(container);
  const button =
    ui.queryByRole('button', { name: 'Sleppa dæminu og byrja að teikna' }) ??
    ui.queryByRole('button', { name: 'Áfram í spurningarnar' });
  if (!button) throw new Error('This level opened on no worked example to move past.');
  fireEvent.click(button);
}
