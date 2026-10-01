// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { chargeLines } from '../components/FormalChargeExample';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * Teach before test (docs/REVIEW-QUEUE.md C6, 2026-10-01). Stig 2 and Stig 3
 * opened on a question; the only worked example, Leiðsögn, was opt-in, offered
 * on molecule 1 alone, and walked through H₂O — the molecule the student then
 * drew. Each level now opens on a worked step about a molecule it never asks for.
 */

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
clockPastNextGuard();

const source = (file: string) => readFileSync(join(__dirname, '..', 'components', file), 'utf-8');
/** The molecules a level's challenges ask about, read from its data. */
const asked = (file: string) =>
  [...source(file).matchAll(/^\s{4}molecule: '([^']+)'/gm)].map((m) => m[1]);

describe('Stig 2 opens on a worked walkthrough', () => {
  it('of PCl₃, which it never asks the student to draw', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    expect(ui.getByRole('heading', { name: 'Dæmi á undan: PCl₃' })).toBeTruthy();
    expect(asked('Level2.tsx')).not.toContain('PCl₃');
    expect(asked('Level2.tsx')).toContain('H₂O');
    // No board until the walkthrough is finished or skipped.
    expect(container.querySelector('svg[aria-label^="Teikniborð"]')).toBeNull();
    fireEvent.click(ui.getByRole('button', { name: 'Sleppa dæminu og byrja að teikna' }));
    expect(container.querySelector('svg[aria-label^="Teikniborð"]')).not.toBeNull();
  });

  it('that can be worked through to the end, where it leads to the first molecule', () => {
    // Not \`performance\`, which clockPastNextGuard steps past the Næsta guard.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    const next = () => fireEvent.click(ui.getByRole('button', { name: /Næsta skref/ }));

    fireEvent.change(ui.getByRole('spinbutton'), { target: { value: '26' } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    next();
    fireEvent.click(ui.getByRole('button', { name: /Ég skil/ }));
    next();
    fireEvent.change(ui.getByRole('spinbutton'), { target: { value: '3' } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    // The bonds are drawn, and their electrons counted, half a second later.
    act(() => {
      vi.advanceTimersByTime(600);
    });
    next();
    // Outer atoms first, to an octet each: 9 pairs on the three Cl, 1 on P.
    for (let i = 0; i < 9; i++) {
      fireEvent.click(ui.getByRole('button', { name: 'Bæta stöku pari við Cl (ytri)' }));
    }
    fireEvent.click(ui.getByRole('button', { name: 'Bæta stöku pari við P (miðatóm)' }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga dreifingu' }));
    expect(container.textContent).toContain('Rétt!');
    next();
    fireEvent.click(ui.getByRole('button', { name: /Athugað/ }));
    next();
    fireEvent.click(ui.getByRole('button', { name: 'Byrja að teikna' }));
    expect(ui.getByText('Vatn (H₂O)')).toBeTruthy();
  });
});

describe('Stig 3 opens on a worked example', () => {
  it('about CO₂ and SO₂, which it never asks about', () => {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    expect(ui.getByRole('heading', { name: 'Dæmi á undan: koldíoxíð' })).toBeTruthy();
    for (const m of ['CO₂', 'SO₂']) expect(asked('Level3.tsx')).not.toContain(m);
    expect(asked('Level3.tsx')).toContain('CO');
    // The first question waits for it.
    expect(ui.queryByRole('button', { name: 'Athuga svar' })).toBeNull();
    fireEvent.click(ui.getByRole('button', { name: 'Áfram í spurningarnar' }));
    expect(ui.getByRole('button', { name: 'Athuga svar' })).toBeTruthy();
  });

  it('draws the charges it computes, and they are the book’s', () => {
    const doubled = {
      central: { symbol: 'C', lonePairs: 0 },
      outer: [
        { symbol: 'O', lonePairs: 2, bond: 'double' as const },
        { symbol: 'O', lonePairs: 2, bond: 'double' as const },
      ],
    };
    const tripled = {
      central: { symbol: 'C', lonePairs: 0 },
      outer: [
        { symbol: 'O', lonePairs: 1, bond: 'triple' as const },
        { symbol: 'O', lonePairs: 3, bond: 'single' as const },
      ],
    };
    expect(chargeLines(doubled).map((l) => l.charge)).toEqual([0, 0, 0]);
    expect(chargeLines(tripled).map((l) => l.charge)).toEqual([0, 1, -1]);

    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const triple = within(container).getByRole('img', { name: /^O≡C–O/ });
    expect(
      [...triple.querySelectorAll('[data-formal-charge]')].map((g) =>
        g.getAttribute('data-formal-charge')
      )
    ).toEqual(['1', '-1']);
    const double = within(container).getByRole('img', { name: /^O=C=O/ });
    expect(double.querySelector('[data-formal-charge]')).toBeNull();
  });
});
