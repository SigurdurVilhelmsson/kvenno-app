import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MenuCard, MenuProgress } from '../GameMenu';

describe('MenuCard', () => {
  it('is one button named by its title, with the result chip only once done', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <MenuCard
        tone={1}
        icon="📈"
        title="Stig 1: Skilningur"
        subtitle="Títrunarferlar"
        onClick={onClick}
      />
    );
    const card = screen.getByRole('button', { name: /Stig 1: Skilningur/ });
    expect(card.textContent).not.toContain('✓');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <MenuCard
        tone={1}
        icon="📈"
        title="Stig 1: Skilningur"
        result="6 af 8 rétt"
        onClick={onClick}
      />
    );
    expect(screen.getByText('✓ 6 af 8 rétt')).toBeTruthy();
  });

  it('keeps one colour per position, whatever the game calls the section', () => {
    render(
      <>
        <MenuCard tone="naermynd" icon="🔬" title="Nærmynd" />
        <MenuCard tone={1} icon="🔍" title="1. Kanna" />
        <MenuCard tone={1} icon="📈" title="Stig 1: Skilningur" />
      </>
    );
    const [naermynd, kanna, stig1] = screen.getAllByRole('button');
    expect(naermynd.className).toContain('border-amber-400');
    expect(kanna.className).toContain('border-blue-400');
    expect(stig1.className).toBe(kanna.className);
  });
});

describe('MenuProgress', () => {
  it('asks before it resets, and puts focus on the safe choice', () => {
    const onReset = vi.fn();
    render(<MenuProgress onReset={onReset}>1 af 3 stigum lokið</MenuProgress>);
    expect(screen.getByText(/1 af 3 stigum lokið/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Endurstilla' }));
    expect(onReset).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Hætta við' }));

    fireEvent.click(screen.getByRole('button', { name: 'Hætta við' }));
    expect(onReset).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Endurstilla' }));
    fireEvent.click(screen.getByRole('button', { name: 'Já, endurstilla' }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Endurstilla' })).toBeTruthy();
  });
});
