// @vitest-environment jsdom
/**
 * Stig 0's rounding step, played through the real screen to its last item.
 *
 * r5 asks for 60,221 to two significant figures, whose printed answer is
 * `6,0 × 10¹`. The shipped grader read that printed answer back with
 * `parseStudentNumber`, which stops at the `×` and returns 6 — so `6,0`, a
 * tenth of the answer, was marked Rétt, while `60,` (two figures by rule 4) and
 * `6,0e1` were marked wrong. A phone's decimal keypad cannot type `×` or `e`,
 * so on a phone the only answer the step accepted was the wrong one.
 *
 * Queries are scoped to the rendered container: the repo runs vitest with
 * `retry: 2`, and a failed attempt's DOM would otherwise make every document-wide
 * query ambiguous (see `docs/README.md`).
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level0SigFigs } from '../components/Level0SigFigs';
import { COUNT_ITEMS, ROUND_ITEMS } from '../data/sigfig-items';

clockPastNextGuard();

afterEach(cleanup);

/** Click through the rules and the counting step to the first rounding item. */
function playToRounding() {
  const view = within(render(<Level0SigFigs onComplete={vi.fn()} onBack={vi.fn()} />).container);
  fireEvent.click(view.getByRole('button', { name: 'Áfram í æfingu' }));
  for (let i = 0; i < COUNT_ITEMS.length; i++) {
    fireEvent.click(view.getByRole('button', { name: '1' }));
    fireEvent.click(view.getByRole('button', { name: /^(Næsta|Áfram)$/ }));
  }
  return view;
}

type View = ReturnType<typeof playToRounding>;

function answer(view: View, digits: string, power?: string) {
  fireEvent.change(view.getByLabelText('Svarið þitt'), { target: { value: digits } });
  if (power !== undefined) {
    fireEvent.change(view.getByLabelText('Veldisvísir'), { target: { value: power } });
  }
  fireEvent.click(view.getByRole('button', { name: 'Svara' }));
}

/** Answer r1–r4 correctly, as written, and stop on r5. */
function playToR5() {
  const view = playToRounding();
  for (const item of ROUND_ITEMS.slice(0, -1)) {
    answer(view, item.answer);
    expect(view.getByText('Rétt'), `${item.id} ${item.answer}`).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: /^(Næsta|Áfram)$/ }));
  }
  expect(view.getByText(/60,221/)).toBeTruthy();
  return view;
}

describe('Stig 0, r5 — sixty to two significant figures', () => {
  it('does not accept the digits without their power of ten', () => {
    const view = playToR5();
    answer(view, '6,0');
    expect(view.queryByText('Rétt')).toBeNull();
    expect(view.getByText('Ekki alveg')).toBeTruthy();
    expect(view.getByText(/Athugaðu veldisvísinn/)).toBeTruthy();
  });

  it.each([
    ['6,0', '1'],
    ['0,60', '2'],
    ['60,', ''],
  ])('accepts %s × 10^%s, typable on a phone keypad', (digits, power) => {
    const view = playToR5();
    answer(view, digits, power);
    expect(view.getByText('Rétt')).toBeTruthy();
  });

  it('names the precision, not the rounding, when sixty is written to one figure', () => {
    const view = playToR5();
    answer(view, '60', '');
    expect(view.getByText(/ekki skrifuð með 2 markverðum stöfum/)).toBeTruthy();
    expect(view.queryByText(/Námundunin sjálf stemmir ekki/)).toBeNull();
  });

  it('says why the printed answer uses a power of ten, without claiming 60, is impossible', () => {
    // The old note said the number could not be written to two figures
    // without scientific notation — false once `60,` is graded correct.
    const view = playToR5();
    answer(view, '6,0', '1');
    const note = view.getByText(/regla 4/);
    expect(note.textContent).toContain('6,0 × 10¹');
    expect(note.textContent).not.toMatch(/ekki hægt/);
    // Nor does it name the notation: the old note's word had no corpus hits,
    // and which word the course uses is an open ruling, not this file's call.
    expect(note.textContent).not.toMatch(/veldisrithátt|vísindarithátt/i);
  });

  it('both fields raise the decimal keypad', () => {
    const view = playToR5();
    for (const label of ['Svarið þitt', 'Veldisvísir']) {
      const field = view.getByLabelText(label);
      expect(field.getAttribute('type')).toBe('text');
      expect(field.getAttribute('inputmode')).toBe('decimal');
    }
  });
});

describe('Stig 0 rounding step — entering a power of ten', () => {
  it('reaches a negative power with the sign button, which an iPhone keypad needs', () => {
    const view = playToRounding();
    answer(view, ROUND_ITEMS[0].answer); // r1
    fireEvent.click(view.getByRole('button', { name: 'Næsta' }));
    // r2 is 0,00457 — as 4,57 × 10⁻³, the minus from the button.
    fireEvent.change(view.getByLabelText('Svarið þitt'), { target: { value: '4,57' } });
    fireEvent.click(view.getByRole('button', { name: 'Skipta um formerki á veldisvísi' }));
    fireEvent.change(view.getByLabelText('Veldisvísir'), {
      target: { value: `${(view.getByLabelText('Veldisvísir') as HTMLInputElement).value}3` },
    });
    expect((view.getByLabelText('Veldisvísir') as HTMLInputElement).value).toBe('-3');
    fireEvent.click(view.getByRole('button', { name: 'Svara' }));
    expect(view.getByText('Rétt')).toBeTruthy();
  });

  it('sends an unreadable entry back for editing instead of using up the question', () => {
    const view = playToRounding();
    answer(view, '1,2 × 10³'); // the printed form, typed into one field
    expect(view.queryByText('Ekki alveg')).toBeNull();
    expect(view.getByText(/ekki hægt að lesa sem tölu/)).toBeTruthy();
    // Still answerable: fix it and the verdict is Rétt.
    answer(view, '1,2', '3');
    expect(view.queryByText(/ekki hægt að lesa sem tölu/)).toBeNull();
    expect(view.getByText('Rétt')).toBeTruthy();
  });
});

describe('Stig 0 rounding step — the empty field gives nothing away', () => {
  it('shows no item answer as a placeholder, on any item', () => {
    // r3 asks for 2,5 to three figures; the shipped placeholder `t.d. 2,50` was
    // its answer, shown on the empty field before the student typed anything.
    const view = playToRounding();
    for (const current of ROUND_ITEMS) {
      for (const label of ['Svarið þitt', 'Veldisvísir']) {
        const hint = view.getByLabelText(label).getAttribute('placeholder') ?? '';
        expect(hint, `${current.id}: ${label} models a number`).not.toMatch(/\d/);
        for (const item of ROUND_ITEMS) {
          expect(hint.replace(/\s/g, ''), `${label} shows ${item.id}'s answer`).not.toContain(
            item.answer.replace(/\s/g, '')
          );
        }
      }
      answer(view, 'x'); // unreadable, so the item stays open…
      answer(view, current.answer.split('×')[0].trim(), current.answer.includes('×') ? '1' : '');
      fireEvent.click(view.getByRole('button', { name: /^(Næsta|Áfram)$/ }));
    }
  });
});
