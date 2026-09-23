import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { equilibria } from '../data/equilibria';
import { calculateShift } from '../utils/le-chatelier';

/**
 * What Lærdómshamur shows once a student has answered.
 *
 * - **No points and no streak.** The platform rule is no scoring during
 *   learning, and the menu card itself promises Lærdómshamur none; points,
 *   streaks and a speed bonus are what Keppnishamur's card lists.
 * - **Icelandic reasoning.** The «Rökstuðningur» list and the
 *   «Sameindasjónarhorn» line were English strings inside the Icelandic
 *   screen.
 * - **ΔH as the rest of the game prints it**: decimal comma, `kJ/mól`, and no
 *   útvermið/innvermið label on a ΔH of exactly zero.
 */

/** Words that only an English sentence would contain. */
const ENGLISH =
  /\b(the|system|shifts?|stress|reactants?|products?|molecules?|favou?red|pressure|increased?|decreased?|catalyst|equilibrium|reaction|moles|heat|energy|temperature|faster|same|side)\b/i;

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

/** Math.random() is pinned so the game opens on a known equilibrium. */
function openLearningOn(index: number) {
  vi.spyOn(Math, 'random').mockReturnValue((index + 0.5) / equilibria.length);
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));
  advance(300);
}

function answerFirstStressCorrectly(index: number) {
  const eq = equilibria[index];
  fireEvent.click(document.querySelector('.stress-btn')!);
  const direction = calculateShift(eq, eq.possibleStresses[0]).direction;
  fireEvent.click(
    screen.getByRole('button', {
      name:
        direction === 'left'
          ? /Til vinstri/
          : direction === 'right'
            ? /Til hægri/
            : /Engin hliðrun/,
    })
  );
}

describe('Lærdómshamur feedback', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('shows no points and no streak, before or after a correct answer', () => {
    openLearningOn(0);
    expect(screen.queryByText(/^Stig:/)).toBeNull();

    answerFirstStressCorrectly(0);
    expect(screen.getByText('✅ Rétt!')).toBeTruthy();
    expect(screen.queryByText(/stig!/)).toBeNull();
    expect(screen.queryByText(/^Stig:/)).toBeNull();
    expect(screen.queryByText(/röð/)).toBeNull();
  });

  it('gives its reasoning and the molecular view in Icelandic', () => {
    openLearningOn(0);
    answerFirstStressCorrectly(0);

    const heading = screen.getByText('Rökstuðningur:');
    const items = [...heading.parentElement!.querySelectorAll('li')].map((li) => li.textContent);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) expect(item).not.toMatch(ENGLISH);

    const view = screen.getByText('Sameindasjónarhorn:').nextElementSibling?.textContent ?? '';
    expect(view.length).toBeGreaterThan(0);
    expect(view).not.toMatch(ENGLISH);
  });

  it('the strategy hint for cooling does not speak of added heat', () => {
    openLearningOn(0);
    fireEvent.click(screen.getByRole('button', { name: 'Lækka hitastig' }));
    // Tier 1 is the topic, tier 2 the strategy.
    fireEvent.click(screen.getByRole('button', { name: /Vísbending/ }));
    fireEvent.click(screen.getByRole('button', { name: /Vísbending/ }));
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/„myndar" varma í stað þess sem var tekinn burt/);
    expect(text).not.toMatch(/viðbætt/);
  });

  it('prints ΔH with a decimal comma and kJ/mól', () => {
    const haber = equilibria.findIndex((e) => e.thermodynamics.deltaH === -91.8);
    openLearningOn(haber);
    expect(screen.getByText(/ΔH = -91,8 kJ\/mól \(Útvermið\)$/)).toBeTruthy();
  });

  it('does not call a ΔH of zero útvermið', () => {
    const zero = equilibria.findIndex((e) => e.thermodynamics.deltaH === 0);
    expect(zero).toBeGreaterThanOrEqual(0);
    openLearningOn(zero);
    const pill = screen.getByText(/^ΔH = 0 kJ\/mól/);
    expect(pill.textContent).toBe('ΔH = 0 kJ/mól');
    expect(document.body.textContent).not.toMatch(/Útvermið|Innvermið|Varmalosandi|Varmabindandi/);
  });
});
