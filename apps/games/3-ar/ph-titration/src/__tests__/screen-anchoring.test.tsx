// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

// Focus after each commit and each screen swap (vertical-scroll pass, design
// P3): the button that was pressed unmounts or changes meaning, so focus must
// go somewhere on purpose — the feedback after a check, the heading after a
// swap — never to "Næsta", and never to <body>. "Næsta" also drops a press
// within 400 ms of appearing, so a double tap cannot skip the feedback.

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
});

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('Level 1', () => {
  function answerFirst(container: HTMLElement) {
    fireEvent.click(screen.getByText(/Byrja æfingu/));
    wait(50);
    fireEvent.click(container.querySelector('div.space-y-3 > button')!);
    const check = screen.getByRole('button', { name: 'Staðfesta' });
    fireEvent.click(check);
    return check;
  }

  it('focuses its intro heading on arrival, then the question heading on Byrja', () => {
    render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    expect(document.activeElement?.textContent).toBe('Títrun — um hvað snýst þetta?');
    fireEvent.click(screen.getByText(/Byrja æfingu/));
    expect(document.activeElement?.hasAttribute('data-item-start')).toBe(true);
  });

  it('moves focus to the feedback, and Næsta is a different element', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    const check = answerFirst(container);
    wait(300);
    const next = screen.getByRole('button', { name: /Næsta →/ });
    expect(next).not.toBe(check);
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute('role')).toBe('group');
    expect(focused.querySelector('.feedback-panel')).toBeTruthy();
  });

  it('drops a Næsta press within 400 ms of the check', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    answerFirst(container);
    wait(300);
    fireEvent.click(screen.getByRole('button', { name: /Næsta →/ }));
    expect(screen.getByText(/^1 \/ \d+$/)).toBeTruthy();
    wait(200);
    fireEvent.click(screen.getByRole('button', { name: /Næsta →/ }));
    expect(screen.getByText(/^2 \/ \d+$/)).toBeTruthy();
    expect(document.activeElement?.hasAttribute('data-item-start')).toBe(true);
  });
});

describe('Level 2', () => {
  it('focuses the result, named by its verdict, after Staðfesta val', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const add5 = screen.getByRole('button', { name: 'Bæta við 5 mL títrants' });
    for (let i = 0; i < 5; i++) fireEvent.click(add5);
    fireEvent.click(screen.getByRole('button', { name: /merkja jafngildispunkt/ }));
    wait(50);
    expect(document.activeElement?.textContent).toMatch(/Merktu jafngildispunktinn/);
    fireEvent.click(screen.getByRole('button', { name: /^Staðfesta: / }));
    wait(400);
    expect(document.activeElement?.textContent).toBe('Veldu vísi');
    fireEvent.click(screen.getByRole('button', { name: /Brómþýmólblátt/ }));
    wait(50);
    fireEvent.click(screen.getByRole('button', { name: /Staðfesta val/ }));
    wait(300);
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute('role')).toBe('group');
    const label = document.getElementById(focused.getAttribute('aria-labelledby')!);
    expect(label?.textContent).toMatch(/Rétt!|Ekki rétt/);
  });
});

describe('Level 3', () => {
  it('focuses the result after the check and the next title after Næsta', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    expect(document.activeElement?.tagName).toBe('H1');
    fireEvent.change(screen.getByLabelText(/Svar/), { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
    wait(300);
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute('role')).toBe('group');
    expect(document.getElementById(focused.getAttribute('aria-labelledby')!)?.textContent).toMatch(
      /Rangt/
    );
    wait(200);
    fireEvent.click(screen.getByRole('button', { name: /Næsta →/ }));
    expect(document.activeElement?.hasAttribute('data-item-start')).toBe(true);
    expect(document.activeElement?.tagName).toBe('H2');
  });
});

describe('Returning to the menu', () => {
  it('focuses the next level not yet done', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stig 2: Framkvæmd/ }));
    wait(300);
    fireEvent.click(screen.getByRole('button', { name: /Til baka/ }));
    wait(300);
    expect(document.activeElement?.getAttribute('data-level-card')).toBe('level1');
  });
});
