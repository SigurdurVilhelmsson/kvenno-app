import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReactionTypesScreen } from '../components/ReactionTypesScreen';
import { REACTION_ITEMS, TYPE_LABEL, TYPE_ORDER } from '../data/reaction-types';

describe('reaction types (book ch04/m68710)', () => {
  it('every kind appears at least twice, and the items are not grouped by kind', () => {
    for (const t of TYPE_ORDER) {
      expect(REACTION_ITEMS.filter((i) => i.type === t).length).toBeGreaterThanOrEqual(2);
    }
    for (let i = 1; i < REACTION_ITEMS.length; i++) {
      expect(REACTION_ITEMS[i].type).not.toBe(REACTION_ITEMS[i - 1].type);
    }
  });

  it('every precipitation item forms a solid from two solutions', () => {
    for (const item of REACTION_ITEMS.filter((i) => i.type === 'utfelling')) {
      const [left, right] = item.equation.split('→');
      expect(left.match(/\(aq\)/g)?.length).toBe(2);
      expect(right).toMatch(/\(s\)/);
    }
  });

  it('every item that forms a solid without being precipitation says why', () => {
    for (const item of REACTION_ITEMS) {
      const right = item.equation.split('→')[1];
      if (item.type !== 'utfelling' && /\(s\)/.test(right)) expect(item.note).toBeTruthy();
    }
  });
});

describe('the practice', () => {
  it('plays every item and reports N af M rétt', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<ReactionTypesScreen onComplete={onComplete} onBack={() => {}} />);
    REACTION_ITEMS.forEach((item, i) => {
      if (i === 0) {
        const wrong = item.type === 'bruni' ? 'redox' : 'bruni';
        for (let k = 0; k < 2; k++) {
          fireEvent.click(screen.getByRole('button', { name: TYPE_LABEL[wrong] }));
          fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
          vi.advanceTimersByTime(500);
          fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
          expect(document.activeElement?.getAttribute('aria-label')).toBe('Hvers konar hvarf?');
        }
      }
      fireEvent.click(screen.getByRole('button', { name: TYPE_LABEL[item.type] }));
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      vi.advanceTimersByTime(500);
      fireEvent.click(screen.getByRole('button', { name: /Næsta|Sjá niðurstöður/ }));
    });
    const n = REACTION_ITEMS.length;
    expect(onComplete).toHaveBeenCalledWith(n - 1, n);
    expect(screen.getByText(`Æfingu lokið: ${n - 1} af ${n} rétt.`)).toBeTruthy();
    vi.useRealTimers();
  });
});
