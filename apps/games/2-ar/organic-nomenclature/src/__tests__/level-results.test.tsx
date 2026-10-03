// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level2, molecules } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * No running score (mobile-pass decision 1, ruled (b)). Every level and the
 * Byggja mode showed a `Stig: N` pill beside the question counter, Stig 2 paid
 * 10, 5 or 2 by attempt, and the menu and the end screen added the levels up
 * into `Heildarstig`. Now each level counts its right answers and reports
 * `N af M rétt` to the menu and the end screen; a hint never changes the count
 * (decision 2 (b)).
 *
 * The counting rule: a right answer counts, but not one given after the level
 * has shown it. Stig 2's wrong-answer feedback prints the right name and then
 * offers Reyna aftur, so only a molecule named right at the first try counts.
 *
 * Queries are scoped to each rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup).
 */

const RUNNING_SCORE = [/\bStig:\s*\d/, /\d+\s*stig\b/];
const STORAGE_KEY = 'organic-nomenclature-progress';

clockPastNextGuard();
beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

function expectNoScore(container: HTMLElement) {
  for (const pattern of RUNNING_SCORE) expect(container.textContent).not.toMatch(pattern);
}

const optionsBy = (container: HTMLElement, border: string) =>
  Array.from(container.querySelectorAll('button')).filter((b) => b.className.includes(border));

describe('Stig 1', () => {
  it('shows no score on the way and reports right answers of 10', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    for (let i = 0; i < 12; i++) {
      fireEvent.click(ui.getAllByRole('button', { name: /Næsta →|Viðskeyti →/ })[0]);
    }
    fireEvent.click(ui.getByRole('button', { name: /Sameindasmiður →/ }));
    fireEvent.click(ui.getByRole('button', { name: /Byrja próf/ }));
    let right = 0;
    for (let q = 0; q < 10; q++) {
      expectNoScore(container);
      const options = optionsBy(container, 'border-emerald-300');
      fireEvent.click(options[q % options.length]);
      if (!container.textContent!.includes('Rétt svar:')) right++;
      expectNoScore(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi/ }));
    }
    expect(onComplete).toHaveBeenCalledWith(right, 10);
  });
});

describe('Stig 2, Nefna sameindir', () => {
  function startNaming() {
    const onComplete = vi.fn();
    const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));
    fireEvent.click(ui.getByRole('button', { name: /Skipta í skrifa-ham/ }));
    return { ui, container, onComplete };
  }

  function name(ui: ReturnType<typeof within>, answer: string) {
    fireEvent.change(ui.getByPlaceholderText('Sláðu inn nafnið...'), {
      target: { value: answer },
    });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  }

  const next = (ui: ReturnType<typeof within>) =>
    fireEvent.click(ui.getByRole('button', { name: /Næsta sameind|Ljúka stigi/ }));

  for (const openHint of [false, true]) {
    it(`reports every molecule named right, ${openHint ? 'with' : 'without'} the hint`, () => {
      const { ui, container, onComplete } = startNaming();
      for (const m of molecules) {
        expectNoScore(container);
        if (openHint) fireEvent.click(ui.getByRole('button', { name: /Vísbending/ }));
        name(ui, m.correctName);
        expectNoScore(container);
        next(ui);
      }
      expect(onComplete).toHaveBeenCalledWith(molecules.length, molecules.length);
    });
  }

  it('does not count a name given after the feedback printed it', () => {
    const { ui, container, onComplete } = startNaming();
    const [first, ...rest] = molecules;
    name(ui, 'xyz');
    expect(container.textContent).toContain(`Rétt svar er: ${first.correctName}`);
    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
    name(ui, first.correctName);
    expect(ui.getByText('Rétt!')).toBeTruthy();
    next(ui);
    for (const m of rest) {
      name(ui, m.correctName);
      next(ui);
    }
    expect(onComplete).toHaveBeenCalledWith(molecules.length - 1, molecules.length);
  });
});

describe('Stig 2, Byggja sameindir', () => {
  for (const openHint of [false, true]) {
    it(`reports the names built right, ${openHint ? 'with' : 'without'} the hint`, () => {
      const onComplete = vi.fn();
      const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
      const ui = within(container);
      fireEvent.click(ui.getByRole('button', { name: /Byggja sameindir/ }));
      // Check the default four-carbon chain every time: right exactly where the name is bútan.
      let right = 0;
      for (let i = 0; i < 10; i++) {
        expectNoScore(container);
        if (openHint) fireEvent.click(ui.getByRole('button', { name: /Sýna vísbendingu/ }));
        fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
        if (/Rétt!/.test(container.textContent!)) right++;
        expectNoScore(container);
        fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun|Ljúka/ }));
      }
      expect(onComplete).toHaveBeenCalledWith(right, 10);
    });
  }
});

describe('Stig 3', () => {
  it('shows no score on the way and reports right answers of 10', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    for (let guard = 0; guard < 20; guard++) {
      const start = ui.queryByRole('button', { name: /Byrja áskoranir/ });
      if (start) {
        fireEvent.click(start);
        break;
      }
      fireEvent.click(ui.getByRole('button', { name: /^Næsta/ }));
    }
    let right = 0;
    for (let q = 0; q < 10; q++) {
      expectNoScore(container);
      const options = optionsBy(container, 'border-purple-300');
      fireEvent.click(options[q % options.length]);
      if (ui.queryByText('Rétt!')) right++;
      expectNoScore(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun|Ljúka stigi/ }));
    }
    expect(onComplete).toHaveBeenCalledWith(right, 10);
  });
});

describe('the menu and the end screen', () => {
  it('show "N af M rétt" per level and no total', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ level2Completed: true, level2Correct: 12, level2Total: 15 })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ 12 af 15 rétt');
    expect(container.textContent).not.toMatch(/Heildar ?stig|Leikir spilaðir/);
    expect(container.textContent).not.toMatch(/\d+\s*stig\b/);
  });

  it('show a level saved in points as done, with no count', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level1Completed: true,
        level1Score: 80,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ Lokið');
    expect(container.textContent).not.toContain('80');
  });

  it('keep a level’s best run as one pair, across Stig 2’s two lengths', () => {
    // 12 of 15 in Nefna is kept over 6 of 10 in Byggja, and not shown as "12 af 10".
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ level2Completed: true, level2Correct: 12, level2Total: 15 })
    );
    const { container } = render(<App />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Stig 2: Nefna sameindir/ }));
    fireEvent.click(ui.getByRole('button', { name: /Byggja sameindir/ }));
    for (let i = 0; i < 10; i++) {
      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun|Ljúka/ }));
    }
    expect(container.textContent).toContain('✓ 12 af 15 rétt');
  });

  it('end with each level as a count after Stig 3', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 9,
        level1Total: 10,
        level2Completed: true,
        level2Score: 120,
      })
    );
    const { container } = render(<App />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Stig 3: Hagnýtar sameindir/ }));
    for (let guard = 0; guard < 20; guard++) {
      const start = ui.queryByRole('button', { name: /Byrja áskoranir/ });
      if (start) {
        fireEvent.click(start);
        break;
      }
      fireEvent.click(ui.getByRole('button', { name: /^Næsta/ }));
    }
    let right = 0;
    for (let q = 0; q < 10; q++) {
      fireEvent.click(optionsBy(container, 'border-purple-300')[0]);
      if (ui.queryByText('Rétt!')) right++;
      fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun|Ljúka stigi/ }));
    }
    expect(container.textContent).toContain('Þú hefur lokið öllum stigum!');
    expect(container.textContent).toContain('9 af 10 rétt');
    expect(container.textContent).toContain('Lokið');
    expect(container.textContent).toContain(`${right} af 10 rétt`);
    expect(container.textContent).not.toMatch(/Heildar ?stig/);
    expect(container.textContent).not.toContain('120');
  });
});
