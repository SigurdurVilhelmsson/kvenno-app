import { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it } from 'vitest';

import { PhoneDisclosure } from '../PhoneDisclosure';
import { stubPhoneMedia } from './phoneMedia';

expect.extend(toHaveNoViolations);

const SUMMARY = 'Uppflettitöflur';

/** A child with state of its own, to show the content is never unmounted. */
function Counter() {
  const [n, setN] = useState(0);
  return (
    <button type="button" onClick={() => setN(n + 1)}>
      Talning {n}
    </button>
  );
}

function renderDisclosure() {
  return render(
    <PhoneDisclosure summary={SUMMARY} className="mt-4" contentClassName="grid gap-2">
      <table>
        <tbody>
          <tr>
            <td>Maurasýra</td>
          </tr>
        </tbody>
      </table>
      <Counter />
    </PhoneDisclosure>
  );
}

let media: ReturnType<typeof stubPhoneMedia> | null = null;
afterEach(() => {
  media?.restore();
  media = null;
});

describe('PhoneDisclosure off a phone', () => {
  it('renders no button at all and always shows the content (jsdom: no matchMedia)', () => {
    const { container } = renderDisclosure();

    expect(screen.queryByRole('button', { name: SUMMARY })).toBeNull();
    expect(screen.getByText('Maurasýra')).toBeDefined();
    const content = container.querySelector('.grid');
    expect(content?.hasAttribute('hidden')).toBe(false);
    // The caller's wrapper classes land where the old wrapper's did.
    expect(container.firstElementChild?.className).toBe('mt-4');
  });

  it('renders no button on a desktop-sized window either', () => {
    media = stubPhoneMedia(false);
    renderDisclosure();
    expect(screen.queryByRole('button', { name: SUMMARY })).toBeNull();
  });
});

describe('PhoneDisclosure on a phone', () => {
  it('starts closed: a button named by the existing heading, controlling hidden content', () => {
    media = stubPhoneMedia(true);
    renderDisclosure();

    const button = screen.getByRole('button', { name: SUMMARY });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    const content = document.getElementById(button.getAttribute('aria-controls')!);
    expect(content).not.toBeNull();
    expect(content!.hasAttribute('hidden')).toBe(true);
    // 44 px target.
    expect(button.className.split(/\s+/)).toContain('min-h-11');
  });

  it('opens and closes without unmounting what is inside', () => {
    media = stubPhoneMedia(true);
    renderDisclosure();
    const button = screen.getByRole('button', { name: SUMMARY });

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Talning 0' }));
    expect(screen.getByRole('button', { name: 'Talning 1' })).toBeDefined();

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    // Still 1: the counter kept its state through the close.
    expect(screen.getByRole('button', { name: 'Talning 1' })).toBeDefined();
  });

  it('shows everything and drops the button when the screen stops being a phone', () => {
    media = stubPhoneMedia(true);
    const { container } = renderDisclosure();
    expect(screen.getByRole('button', { name: SUMMARY })).toBeDefined();

    media.set(false);

    expect(screen.queryByRole('button', { name: SUMMARY })).toBeNull();
    expect(container.querySelector('.grid')?.hasAttribute('hidden')).toBe(false);
  });

  it('has no axe violations, closed or open', async () => {
    media = stubPhoneMedia(true);
    const { container } = renderDisclosure();
    expect(await axe(container)).toHaveNoViolations();
    fireEvent.click(screen.getByRole('button', { name: SUMMARY }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
