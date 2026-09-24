import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { ApplyScreen } from '../components/ApplyScreen';
import { PracticeScreen } from '../components/PracticeScreen';
import { insertAtCaret } from '../components/ScientificKeys';
import { APPLY_PROBLEMS, PRACTICE_PROBLEMS, gradeApply } from '../data/problems';
import { isRelativelyClose } from '../engine/grade';
import { solveWeakAcid } from '../engine/ka';
import { revealIfBelowFold, revealTopIfAbove } from '../utils/reveal';

/**
 * Playing on a phone, beyond layout.
 *
 * **The `e` and `−` keys matter most.** Every answer field raises the decimal
 * keypad, and that keypad has no `e` anywhere and, on an iPhone, no minus. Æfa's
 * first step and Beita's Ka and Kb are answered in scientific notation — the
 * placeholder and the hints say `1,3e-3` and `1,8e-5` — so without the two keys
 * a student on a phone could only reach a Kb of 5,6 × 10⁻¹⁰ by typing nine
 * zeros. These tests play answers through the keys.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const E_KEY = 'Bæta e við svarið';
const MINUS_KEY = 'Bæta mínus við svarið';

/** Characters the decimal keypad offers on every phone: digits and the separator. */
const KEYPAD = /^[0-9,]*$/;

/** A value as a student builds it: keypad mantissa, the e key, the minus key, keypad power. */
function keyedParts(value: number): { mantissa: string; power: string } {
  const [m, e] = value.toExponential(2).split('e');
  expect(Number(e), `${value} has a negative power of ten`).toBeLessThan(0);
  return { mantissa: m.replace('.', ','), power: String(Math.abs(Number(e))) };
}

/** Type a scientific-notation answer into `input` the way the keypad and keys allow. */
function keyIn(input: HTMLInputElement, value: number) {
  const { mantissa, power } = keyedParts(value);
  expect(mantissa).toMatch(KEYPAD);
  expect(power).toMatch(KEYPAD);
  fireEvent.change(input, { target: { value: mantissa } });
  fireEvent.click(screen.getByRole('button', { name: E_KEY }));
  fireEvent.click(screen.getByRole('button', { name: MINUS_KEY }));
  expect(input.value).toBe(`${mantissa}e-`);
  fireEvent.change(input, { target: { value: `${input.value}${power}` } });
}

describe('insertAtCaret', () => {
  it('inserts at the caret, not at the end', () => {
    expect(insertAtCaret('1,8-5', 3, 3, 'e')).toEqual({ value: '1,8e-5', caret: 4 });
  });

  it('replaces a selection', () => {
    expect(insertAtCaret('1,8x5', 3, 4, 'e')).toEqual({ value: '1,8e5', caret: 4 });
  });

  it('appends when the field reports no caret', () => {
    expect(insertAtCaret('1,8', null, null, 'e')).toEqual({ value: '1,8e', caret: 4 });
  });
});

describe('every scientific answer can be keyed on a phone and graded right', () => {
  it('in Æfa, x for every problem', () => {
    for (const p of PRACTICE_PROBLEMS) {
      const x = solveWeakAcid(p.acid.ka, p.concentration).hApprox;
      const { mantissa, power } = keyedParts(x);
      const typed = `${mantissa}e-${power}`;
      expect(isRelativelyClose(parseStudentNumber(typed), x, 0.02), p.id).toBe(true);
    }
  });

  it('in Beita, Ka and Kb', () => {
    const scientific = APPLY_PROBLEMS.filter((p) => p.kind === 'ka' || p.kind === 'kb');
    expect(scientific.length).toBe(2);
    for (const p of scientific) {
      const { mantissa, power } = keyedParts(p.answer);
      expect(gradeApply(p, parseStudentNumber(`${mantissa}e-${power}`)), p.id).toBe(true);
    }
  });
});

describe('Æfa on a phone', () => {
  it('offers the keys for x and grades an answer keyed through them', () => {
    render(<PracticeScreen onComplete={() => {}} onBack={() => {}} />);
    const input = screen.getByLabelText('Svar') as HTMLInputElement;
    const x = solveWeakAcid(PRACTICE_PROBLEMS[0].acid.ka, PRACTICE_PROBLEMS[0].concentration);

    keyIn(input, x.hApprox);
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByText('Rétt!')).toBeTruthy();
    // Answered: the keys go with the Athuga button.
    expect(screen.queryByRole('button', { name: E_KEY })).toBeNull();
  });

  it('does not offer them for pH, which has no power of ten', () => {
    render(<PracticeScreen onComplete={() => {}} onBack={() => {}} />);
    const x = solveWeakAcid(PRACTICE_PROBLEMS[0].acid.ka, PRACTICE_PROBLEMS[0].concentration);
    keyIn(screen.getByLabelText('Svar') as HTMLInputElement, x.hApprox);
    fireEvent.click(screen.getByText('Athuga'));
    fireEvent.click(screen.getByText('Áfram')); // to the 5 % check
    fireEvent.click(screen.getByText('Áfram')); // to pH
    expect(screen.getByText(/Skref 3 af 3/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: E_KEY })).toBeNull();
  });
});

describe('Beita on a phone', () => {
  it('offers the keys only for Ka and Kb, and grades both keyed through them', () => {
    render(<ApplyScreen onComplete={() => {}} onBack={() => {}} />);
    const input = () => screen.getByLabelText('Svar') as HTMLInputElement;

    expect(APPLY_PROBLEMS[0].kind).toBe('pH');
    expect(screen.queryByRole('button', { name: E_KEY })).toBeNull();
    fireEvent.change(input(), {
      target: { value: APPLY_PROBLEMS[0].answer.toFixed(2).replace('.', ',') },
    });
    fireEvent.click(screen.getByText('Svara'));
    fireEvent.click(screen.getByText('Næsta dæmi'));

    for (const index of [1, 2]) {
      const problem = APPLY_PROBLEMS[index];
      expect(['ka', 'kb']).toContain(problem.kind);
      keyIn(input(), problem.answer);
      fireEvent.click(screen.getByText('Svara'));
      expect(screen.getByText('Rétt!'), problem.id).toBeTruthy();
      fireEvent.click(screen.getByText('Næsta dæmi'));
    }

    expect(APPLY_PROBLEMS[3].kind).toBe('klofnun');
    expect(screen.queryByRole('button', { name: E_KEY })).toBeNull();
  });
});

describe('revealIfBelowFold', () => {
  const rect = (top: number, height: number) =>
    ({ top, bottom: top + height, height, left: 0, right: 360, width: 360 }) as DOMRect;

  function setup(verdictTop: number, blockTop: number, blockHeight: number, viewport: number) {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(viewport);
    const scrollBy = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    const verdict = document.createElement('div');
    const block = document.createElement('div');
    verdict.getBoundingClientRect = () => rect(verdictTop, 24);
    block.getBoundingClientRect = () => rect(blockTop, blockHeight);
    return { verdict, block, scrollBy };
  }

  it('leaves the page alone when the verdict is already readable', () => {
    const { verdict, block, scrollBy } = setup(450, 380, 300, 740);
    revealIfBelowFold(verdict, block);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('brings a block that fits on screen in whole, bottom first', () => {
    // Landscape phone: 360 tall, no sticky header.
    const { verdict, block, scrollBy } = setup(370, 300, 250, 360);
    revealIfBelowFold(verdict, block);
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBe(300 + 250 + 16 - 360);
  });

  it('brings a taller block in from its top, below a sticky header', () => {
    const header = document.createElement('header');
    header.style.position = 'sticky';
    header.getBoundingClientRect = () => rect(0, 56);
    document.body.appendChild(header);

    const { verdict, block, scrollBy } = setup(600, 540, 700, 568);
    revealIfBelowFold(verdict, block);
    expect(scrollBy.mock.calls[0][0].top).toBe(540 - 56 - 8);
  });
});

describe('revealTopIfAbove', () => {
  const rect = (top: number, height: number) =>
    ({ top, bottom: top + height, height, left: 0, right: 360, width: 360 }) as DOMRect;

  function setup(blockTop: number) {
    const header = document.createElement('header');
    header.style.position = 'sticky';
    header.getBoundingClientRect = () => rect(0, 56);
    document.body.appendChild(header);
    const scrollBy = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    const block = document.createElement('div');
    block.getBoundingClientRect = () => rect(blockTop, 400);
    return { block, scrollBy };
  }

  it('leaves the page alone when the top of the step is visible below the header', () => {
    const { block, scrollBy } = setup(120);
    revealTopIfAbove(block);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('scrolls a step whose heading is under the header back into view', () => {
    const { block, scrollBy } = setup(-150);
    revealTopIfAbove(block);
    expect(scrollBy.mock.calls[0][0].top).toBe(-150 - 56 - 8);
  });
});
